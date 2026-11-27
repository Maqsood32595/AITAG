/**
 * AITAG Service Orders Service — 8-Stage State Machine
 * Complies with AITAG MVP Workflow specification:
 * REQUESTED -> QUALIFIED -> MATCHED -> SCOPE_CONFIRMED -> PAID -> ACTIVE -> DRAFT_SUBMITTED -> REVISION -> COMPLETED
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const supabase = require('../../../../supabase');
const packagesService = require('../packages/service');
const cacheService = require('../../../aitag-cache/service');
const { computePricingAdjustment } = require('../../grandchildren/pricing-waiver-engine');

// Ephemeral in-memory fallback store + durable local metadata overrides (discount/waiver safety)
const inMemoryOrders = new Map();
const ORDERS_META_PATH = path.join(__dirname, 'orders_meta_store.json');

function readOrdersMeta() {
  try {
    if (fs.existsSync(ORDERS_META_PATH)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_META_PATH, 'utf-8'));
      return data && typeof data === 'object' ? data : {};
    }
  } catch (e) {
    console.warn('⚠️ [ServiceOrders] Failed to read orders_meta_store.json:', e.message);
  }
  return {};
}

function writeOrdersMeta(metaObj) {
  try {
    fs.writeFileSync(ORDERS_META_PATH, JSON.stringify(metaObj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('⚠️ [ServiceOrders] Failed to write orders_meta_store.json:', e.message);
  }
}

const orderMetaMap = new Map(Object.entries(readOrdersMeta()));

class ServiceOrdersService {
  _persistOrderMeta() {
    writeOrdersMeta(Object.fromEntries(orderMetaMap));
  }

  _enrichOrder(ord) {
    if (!ord) return ord;
    const meta = orderMetaMap.get(ord.id) || {};
    const merged = { ...ord, ...meta };
    const originalPrice = merged.original_price !== undefined ? Number(merged.original_price) : Number(merged.agreed_price || 0);
    return {
      ...merged,
      original_price: originalPrice,
      discount_amount: Number(merged.discount_amount || 0),
      payment_waived: Boolean(merged.payment_waived),
      payment_status: merged.payment_waived
        ? 'WAIVED'
        : merged.payment_status || (merged.status === 'PAID' || merged.payment_verified_at ? 'PAID' : Number(merged.discount_amount || 0) > 0 ? 'DISCOUNTED' : 'STANDARD'),
    };
  }

  generateOrderNumber() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AITAG-${new Date().getFullYear()}-${randomHex}`;
  }

  async createOrder(data) {
    const {
      package_slug,
      tier_name,
      customer_name,
      customer_email,
      customer_phone = '',
      business_name = '',
      business_type = '',
      brief_notes = '',
      uploaded_assets = []
    } = data;

    if (!package_slug || !tier_name || !customer_name || !customer_email) {
      throw new Error('package_slug, tier_name, customer_name, and customer_email are required.');
    }

    // Resolve package and tier pricing
    const pkg = await packagesService.getPackageBySlug(package_slug);
    if (!pkg) {
      throw new Error(`Package not found: ${package_slug}`);
    }

    // Resolve binary tier alias (starter / pro) — supports legacy package_1/2/3
    const resolvedTierName = packagesService.resolveAlias ? packagesService.resolveAlias(tier_name) : (tier_name || 'starter');
    const tier = packagesService.resolveTier ? packagesService.resolveTier(pkg, resolvedTierName)
      : (pkg.tiers || []).find((t) => t.tier_name === resolvedTierName) || pkg.tiers?.[0];
    const agreed_price = tier ? Number(tier.price_min) : 1499;
    const platform_fee = Math.round(agreed_price * 0.20); // 20% AITAG platform fee (inclusive of statutory TDS)
    const expert_payout = agreed_price - platform_fee; // 80% specialist payout

    const orderRecord = {
      id: crypto.randomUUID(),
      order_number: this.generateOrderNumber(),
      package_slug,
      tier_name,
      package_title: pkg.title,
      customer_name,
      customer_email,
      customer_phone,
      business_name,
      business_type,
      brief_notes,
      uploaded_assets,
      status: 'REQUESTED',
      agreed_price,
      platform_fee,
      expert_payout,
      assigned_expert_email: '',
      assigned_expert_name: '',
      draft_deliverables: [],
      final_deliverables: [],
      revision_notes: '',
      rating: 0,
      testimonial: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data: inserted, error } = await supabase
        .from('aitag_orders')
        .insert([orderRecord])
        .select()
        .single();

      if (!error && inserted) {
        return inserted;
      }
      if (error) {
        console.warn('⚠️ Supabase insert order warning, falling back to in-memory store:', error.message);
      }
    } catch (e) {
      console.warn('⚠️ Supabase insert order exception:', e.message);
    }

    // Fallback store
    inMemoryOrders.set(orderRecord.id, orderRecord);
    try {
      cacheService.invalidateByTag('orders');
      cacheService.invalidateByTag('analytics');
      cacheService.invalidateByTag(`user:${customer_email.toLowerCase()}`);
    } catch {}
    return orderRecord;
  }

  async listOrders(filters = {}) {
    const { role, email, status } = filters;
    const targetEmail = (email || '').trim();

    try {
      let query = supabase.from('aitag_orders').select('*').order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (role === 'client' && targetEmail) {
        query = query.ilike('customer_email', targetEmail);
      } else if (role === 'freelancer' && targetEmail) {
        query = query.ilike('assigned_expert_email', targetEmail);
      } else if (targetEmail) {
        query = query.or(`customer_email.ilike.${targetEmail},assigned_expert_email.ilike.${targetEmail}`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((o) => this._enrichOrder(o));
      }
    } catch (e) {
      console.warn('⚠️ Supabase listOrders exception:', e.message);
    }

    // In-memory fallback filtering
    let list = Array.from(inMemoryOrders.values()).map((o) => this._enrichOrder(o));
    if (status) list = list.filter((o) => o.status === status);
    const lowerEmail = targetEmail.toLowerCase();
    if (role === 'client' && lowerEmail) {
      list = list.filter((o) => (o.customer_email || '').toLowerCase() === lowerEmail);
    } else if (role === 'freelancer' && lowerEmail) {
      list = list.filter((o) => (o.assigned_expert_email || '').toLowerCase() === lowerEmail);
    } else if (lowerEmail) {
      list = list.filter((o) => (o.customer_email || '').toLowerCase() === lowerEmail || (o.assigned_expert_email || '').toLowerCase() === lowerEmail);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getOrderById(id) {
    try {
      const { data, error } = await supabase
        .from('aitag_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return this._enrichOrder(data);
    } catch (e) {
      console.warn('⚠️ Supabase getOrderById exception:', e.message);
    }

    const mem = inMemoryOrders.get(id);
    return mem ? this._enrichOrder(mem) : null;
  }

  async updateOrderStatus(id, newStatus, patch = {}) {
    const validStatuses = [
      'REQUESTED', 'QUALIFIED', 'MATCHED', 'SCOPE_CONFIRMED',
      'PAID', 'ACTIVE', 'DRAFT_SUBMITTED', 'REVISION', 'COMPLETED', 'DISPUTED'
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const updates = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...patch
    };

    try {
      const { data, error } = await supabase
        .from('aitag_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return this._enrichOrder(data);
      }
      if (error && (error.code === 'PGRST204' || String(error.message || '').includes('column'))) {
        const coreFields = {
          status: updates.status,
          updated_at: updates.updated_at,
          ...(updates.agreed_price !== undefined ? { agreed_price: updates.agreed_price } : {}),
          ...(updates.platform_fee !== undefined ? { platform_fee: updates.platform_fee } : {}),
          ...(updates.expert_payout !== undefined ? { expert_payout: updates.expert_payout } : {}),
          ...(updates.assigned_expert_email !== undefined ? { assigned_expert_email: updates.assigned_expert_email } : {}),
          ...(updates.assigned_expert_name !== undefined ? { assigned_expert_name: updates.assigned_expert_name } : {}),
          ...(updates.draft_deliverables !== undefined ? { draft_deliverables: updates.draft_deliverables } : {}),
          ...(updates.final_deliverables !== undefined ? { final_deliverables: updates.final_deliverables } : {}),
          ...(updates.revision_notes !== undefined ? { revision_notes: updates.revision_notes } : {}),
          ...(updates.rating !== undefined ? { rating: updates.rating } : {}),
          ...(updates.testimonial !== undefined ? { testimonial: updates.testimonial } : {}),
        };
        const retryRes = await supabase
          .from('aitag_orders')
          .update(coreFields)
          .eq('id', id)
          .select()
          .single();

        if (!retryRes.error && retryRes.data) {
          return this._enrichOrder({ ...retryRes.data, ...updates });
        }
      }
    } catch (e) {
      console.warn('⚠️ Supabase updateOrderStatus exception:', e.message);
    }

    // In-memory update
    const existing = inMemoryOrders.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      inMemoryOrders.set(id, updated);
      try {
        cacheService.invalidateByTag('orders');
        cacheService.invalidateByTag('analytics');
        if (updated.customer_email) cacheService.invalidateByTag(`user:${updated.customer_email.toLowerCase()}`);
        if (updated.assigned_expert_email) cacheService.invalidateByTag(`user:${updated.assigned_expert_email.toLowerCase()}`);
      } catch {}
      return this._enrichOrder(updated);
    }

    throw new Error(`Order with ID ${id} not found.`);
  }

  async assignExpert(id, expertEmail, expertName, { discountAmount, skipPayment, reason = '', adminEmail = 'admin' } = {}) {
    const existing = await this.getOrderById(id);
    if (!existing) throw new Error(`Order with ID ${id} not found.`);

    let pricingPatch = {};
    const hasPricingOverride = Number(discountAmount) > 0 || Boolean(skipPayment);
    if (hasPricingOverride) {
      pricingPatch = computePricingAdjustment({
        currentOriginalPrice: existing.original_price,
        currentAgreedPrice: existing.agreed_price,
        discountAmount,
        skipPayment,
        adminEmail,
        reason,
      });
      const existingMeta = orderMetaMap.get(id) || {};
      orderMetaMap.set(id, { ...existingMeta, ...pricingPatch });
      this._persistOrderMeta();
    }

    const shouldStartActive =
      Boolean(pricingPatch.payment_waived) ||
      Boolean(existing.payment_waived) ||
      existing.status === 'PAID' ||
      Boolean(existing.payment_verified_at) ||
      ['ACTIVE', 'DRAFT_SUBMITTED', 'REVISION'].includes(existing.status);

    const nextStatus = shouldStartActive
      ? (['DRAFT_SUBMITTED', 'REVISION'].includes(existing.status) ? existing.status : 'ACTIVE')
      : 'MATCHED';

    return this.updateOrderStatus(id, nextStatus, {
      assigned_expert_email: expertEmail,
      assigned_expert_name: expertName,
      ...pricingPatch,
    });
  }

  async applyPricingOverride(id, { discountAmount = 0, skipPayment = false, reason = '', adminEmail = 'admin' } = {}) {
    const existing = await this.getOrderById(id);
    if (!existing) throw new Error(`Order with ID ${id} not found.`);

    const pricingPatch = computePricingAdjustment({
      currentOriginalPrice: existing.original_price,
      currentAgreedPrice: existing.agreed_price,
      discountAmount,
      skipPayment,
      adminEmail,
      reason,
    });

    const existingMeta = orderMetaMap.get(id) || {};
    orderMetaMap.set(id, { ...existingMeta, ...pricingPatch });
    this._persistOrderMeta();

    const hasExpert = Boolean((existing.assigned_expert_email || '').trim());
    const canActivate =
      pricingPatch.payment_waived &&
      hasExpert &&
      ['REQUESTED', 'QUALIFIED', 'MATCHED', 'SCOPE_CONFIRMED', 'PAID'].includes(existing.status);

    const nextStatus = canActivate ? 'ACTIVE' : existing.status;

    try {
      cacheService.invalidateByTag('orders');
      cacheService.invalidateByTag('analytics');
      if (existing.customer_email) cacheService.invalidateByTag(`user:${existing.customer_email.toLowerCase()}`);
    } catch {}

    return this.updateOrderStatus(id, nextStatus, pricingPatch);
  }

  async resetAssignment(id) {
    return this.updateOrderStatus(id, 'REQUESTED', {
      assigned_expert_email: '',
      assigned_expert_name: ''
    });
  }

  async activateProject(id) {
    return this.updateOrderStatus(id, 'ACTIVE');
  }

  async submitDraft(id, draftFiles) {
    const drafts = Array.isArray(draftFiles) ? draftFiles : [draftFiles];
    return this.updateOrderStatus(id, 'DRAFT_SUBMITTED', {
      draft_deliverables: drafts
    });
  }

  async requestRevision(id, revisionNotes) {
    return this.updateOrderStatus(id, 'REVISION', {
      revision_notes: revisionNotes
    });
  }

  async approveAndComplete(id, { rating = 5, testimonial = '', finalFiles = [] } = {}) {
    return this.updateOrderStatus(id, 'COMPLETED', {
      rating: Math.max(1, Math.min(5, Number(rating))),
      testimonial,
      final_deliverables: finalFiles
    });
  }
}

module.exports = new ServiceOrdersService();
