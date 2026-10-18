/**
 * AITAG Case Discussions Service
 * Fractal Kernel Slice: aitag-case-discussions
 * Resilient Supabase-backed persistent communication stream with In-RAM Ephemeral Twin.
 */

const crypto = require('crypto');
const supabase = require('../../supabase');
const cacheService = require('../aitag-cache/service');

// In-RAM Ephemeral Twin: order_id -> Array<MessageRecord>
const inMemoryDiscussions = new Map();

class CaseDiscussionsService {
  /**
   * Fetch all discussion messages for a specific order.
   * @param {string} orderId - Target order UUID or identifier
   * @returns {Promise<Array>} List of message records sorted chronologically
   */
  async getMessages(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required to fetch discussion messages');
    }

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_case_messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });

        if (!error && Array.isArray(data)) {
          // If Supabase returned records, merge with in-memory if any ephemeral additions exist
          const mem = inMemoryDiscussions.get(orderId) || [];
          if (mem.length > 0) {
            const existingIds = new Set(data.map(m => m.id));
            const uniqueMem = mem.filter(m => !existingIds.has(m.id));
            const combined = [...data, ...uniqueMem];
            return combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          }
          return data;
        }
      }
    } catch (e) {
      console.warn('⚠️ [CaseDiscussions] Supabase fetch fallback invoked:', e.message);
    }

    // Fallback store
    const memList = inMemoryDiscussions.get(orderId) || [];
    return [...memList].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  /**
   * Post a new discussion message with optional asset attachments.
   * @param {Object} params
   * @param {string} params.orderId
   * @param {string} params.senderEmail
   * @param {string} [params.senderName]
   * @param {string} [params.senderRole]
   * @param {string} [params.message]
   * @param {Array} [params.attachments]
   * @returns {Promise<Object>} Created message record
   */
  async addMessage({ orderId, senderEmail, senderName, senderRole, message, attachments }) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    if (!senderEmail) {
      throw new Error('Sender email is required');
    }

    const cleanMsg = (message || '').trim();
    const cleanAttachments = Array.isArray(attachments) ? attachments : [];

    if (!cleanMsg && cleanAttachments.length === 0) {
      throw new Error('Message content or at least one asset attachment is required');
    }

    const record = {
      id: crypto.randomUUID(),
      order_id: orderId,
      sender_email: senderEmail.trim().toLowerCase(),
      sender_name: (senderName || 'AITAG Specialist').trim(),
      sender_role: senderRole || 'freelancer',
      message: cleanMsg,
      attachments: cleanAttachments,
      created_at: new Date().toISOString()
    };

    // 1. Attempt persistent Supabase write
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data: inserted, error } = await supabase
          .from('aitag_case_messages')
          .insert([record])
          .select()
          .single();

        if (!error && inserted) {
          this._invalidateCache(orderId);
          return inserted;
        }
        if (error) {
          console.warn('⚠️ [CaseDiscussions] Supabase insert notice (using memory fallback):', error.message);
        }
      }
    } catch (e) {
      console.warn('⚠️ [CaseDiscussions] Supabase insert exception:', e.message);
    }

    // 2. Fallback write to In-RAM Ephemeral Twin
    if (!inMemoryDiscussions.has(orderId)) {
      inMemoryDiscussions.set(orderId, []);
    }
    inMemoryDiscussions.get(orderId).push(record);
    this._invalidateCache(orderId);

    return record;
  }

  /**
   * Purge messages for an order (e.g. on order teardown or test cleanup).
   */
  async purgeByOrderId(orderId) {
    if (!orderId) return;
    inMemoryDiscussions.delete(orderId);

    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase
          .from('aitag_case_messages')
          .delete()
          .eq('order_id', orderId);
      }
    } catch {}

    this._invalidateCache(orderId);
  }

  /**
   * GDPR / Account Purge: remove messages sent by a user.
   */
  async purgeByUserEmail(email) {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();

    // RAM purge
    for (const [orderId, msgs] of inMemoryDiscussions.entries()) {
      const filtered = msgs.filter(m => m.sender_email !== cleanEmail);
      inMemoryDiscussions.set(orderId, filtered);
    }

    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase
          .from('aitag_case_messages')
          .delete()
          .eq('sender_email', cleanEmail);
      }
    } catch {}
  }

  clearMemory() {
    inMemoryDiscussions.clear();
  }

  _invalidateCache(orderId) {
    try {
      cacheService.invalidateByTag(`discussion:${orderId}`);
      cacheService.invalidateByTag('discussions');
      cacheService.invalidateByTag('orders');
    } catch {}
  }
}

module.exports = new CaseDiscussionsService();
