/**
 * AITAG Service Orders Service — 8-Stage State Machine
 * Complies with AITAG MVP Workflow specification:
 * REQUESTED -> QUALIFIED -> MATCHED -> SCOPE_CONFIRMED -> PAID -> ACTIVE -> DRAFT_SUBMITTED -> REVISION -> COMPLETED
 */

const crypto = require('crypto');
const supabase = require('../../supabase');
const packagesService = require('../aitag-service-packages/service');
const cacheService = require('../aitag-cache/service');

// Ephemeral in-memory fallback store
const inMemoryOrders = new Map();

class ServiceOrdersService {
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
    const platform_fee = Math.round(agreed_price * 0.10); // 10% AITAG commission
    const expert_payout = agreed_price - platform_fee;

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
        return data;
      }
    } catch (e) {
      console.warn('⚠️ Supabase listOrders exception:', e.message);
    }

    // In-memory fallback filtering
    let list = Array.from(inMemoryOrders.values());
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

      if (!error && data) return data;
    } catch (e) {
      console.warn('⚠️ Supabase getOrderById exception:', e.message);
    }

    return inMemoryOrders.get(id) || null;
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

      if (!error && data) return data;
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
      return updated;
    }

    throw new Error(`Order with ID ${id} not found.`);
  }

  async assignExpert(id, expertEmail, expertName) {
    return this.updateOrderStatus(id, 'MATCHED', {
      assigned_expert_email: expertEmail,
      assigned_expert_name: expertName
    });
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
