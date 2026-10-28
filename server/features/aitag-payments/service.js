/**
 * AITAG Payments Service — UPI Direct Payment & UTR Verification Engine
 * =====================================================================
 * Child of Fractal Kernel: `aitag-payments`
 * Grandchildren:
 *   - gateways/upi-gateway.js (UPI Intent & Deep-link generation)
 *   - processors/escrow-splitter.js (Escrow & Section 194-O TDS calculation)
 */

const crypto = require('crypto');
const supabase = require('../../supabase');
const cacheService = require('../aitag-cache/service');
const upiGateway = require('./gateways/upi-gateway');
const escrowSplitter = require('./processors/escrow-splitter');

// Ephemeral in-memory fallback store for payments
const inMemoryPayments = new Map();

class PaymentsService {
  /**
   * Delegate to upi-gateway grandchild
   */
  generateUpiUri({ vpa, payeeName, amount, orderId, referenceId, note }) {
    const ref = referenceId || orderId;
    return upiGateway.generateUri({ vpa, payeeName, amount, referenceId: ref, note });
  }

  /**
   * Delegate to escrow-splitter grandchild
   */
  calculateEscrow(amount, commissionRate) {
    return escrowSplitter.calculate(amount, commissionRate);
  }

  /**
   * Submit a payment record for an order OR a task
   * Customer submits UTR/transaction reference after making UPI payment
   */
  async submitPayment(data) {
    const {
      order_id,
      task_id,
      customer_email,
      customer_name,
      amount,
      payment_method = 'upi',
      utr_reference = '',
      screenshot_url = ''
    } = data;

    const referenceId = order_id || task_id;

    if (!referenceId || !customer_email || !amount) {
      throw new Error('order_id (or task_id), customer_email, and amount are required.');
    }

    if (Number(amount) <= 0) {
      throw new Error('Payment amount must be a positive number.');
    }

    const splits = this.calculateEscrow(amount);

    const paymentRecord = {
      id: crypto.randomUUID(),
      order_id: order_id || null,
      task_id: task_id || null,
      customer_email,
      customer_name: customer_name || '',
      amount: Number(amount),
      payment_method,
      utr_reference,
      screenshot_url,
      status: 'SUBMITTED',
      verified: false,
      verified_by: '',
      verified_at: null,
      escrow_splits: splits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data: inserted, error } = await supabase
        .from('aitag_payments')
        .insert([paymentRecord])
        .select()
        .single();

      if (!error && inserted) {
        return inserted;
      }
      if (error) {
        console.warn('⚠️ Supabase insert payment warning, falling back to in-memory store:', error.message);
      }
    } catch (e) {
      console.warn('⚠️ Supabase insert payment exception:', e.message);
    }

    // Fallback in-memory store
    inMemoryPayments.set(paymentRecord.id, paymentRecord);

    // If payment is for a task, automatically activate task escrow
    if (task_id) {
      try {
        const tasksService = require('../aitag-tasks/service');
        if (tasksService && tasksService.updateTask) {
          await tasksService.updateTask(task_id, customer_email, {
            escrow_funded: true,
            escrow_payment_id: paymentRecord.id,
            status: 'in-progress'
          }, 'admin');
        }
      } catch (e) {
        console.warn('⚠️ Auto-activating task escrow note:', e.message);
      }
    }

    try {
      cacheService.invalidateByTag('payments');
      cacheService.invalidateByTag('tasks');
      cacheService.invalidateByTag(`user:${customer_email.toLowerCase()}`);
    } catch {}
    return paymentRecord;
  }

  /**
   * Admin verifies a payment and transitions order or task to active escrow
   */
  async verifyPayment(paymentId, adminEmail) {
    if (!paymentId) {
      throw new Error('paymentId is required.');
    }

    const updates = {
      status: 'VERIFIED',
      verified: true,
      verified_by: adminEmail || 'admin',
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let payment = null;

    try {
      const { data, error } = await supabase
        .from('aitag_payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (!error && data) {
        payment = data;
      }
    } catch (e) {
      console.warn('⚠️ Supabase verifyPayment exception:', e.message);
    }

    // In-memory fallback
    if (!payment) {
      const existing = inMemoryPayments.get(paymentId);
      if (existing) {
        payment = { ...existing, ...updates };
        inMemoryPayments.set(paymentId, payment);
      } else {
        throw new Error(`Payment with ID ${paymentId} not found.`);
      }
    }

    // Transition the linked order to PAID status if order_id exists
    if (payment.order_id) {
      try {
        const ordersService = require('../aitag-service-orders/service');
        await ordersService.updateOrderStatus(payment.order_id, 'PAID', {
          payment_id: paymentId,
          payment_verified_at: payment.verified_at
        });
      } catch (e) {
        console.warn('⚠️ Order PAID transition warning:', e.message);
      }
    }

    // If task_id exists, update task escrow status
    if (payment.task_id) {
      try {
        const tasksService = require('../aitag-tasks/service');
        if (tasksService && tasksService.update) {
          await tasksService.update(payment.task_id, {
            escrow_funded: true,
            escrow_payment_id: paymentId,
            status: 'IN_PROGRESS'
          });
        }
      } catch (e) {
        console.warn('⚠️ Task escrow update note:', e.message);
      }
    }

    try {
      cacheService.invalidateByTag('payments');
      cacheService.invalidateByTag('orders');
      if (payment.customer_email) {
        cacheService.invalidateByTag(`user:${payment.customer_email.toLowerCase()}`);
      }
    } catch {}

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    try {
      const { data, error } = await supabase
        .from('aitag_payments')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn('⚠️ Supabase getPaymentById exception:', e.message);
    }

    return inMemoryPayments.get(id) || null;
  }

  /**
   * Get payment(s) for a specific order or task
   */
  async getPaymentsByOrderId(orderId) {
    try {
      const { data, error } = await supabase
        .from('aitag_payments')
        .select('*')
        .or(`order_id.eq.${orderId},task_id.eq.${orderId}`)
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    } catch (e) {
      console.warn('⚠️ Supabase getPaymentsByOrderId exception:', e.message);
    }

    // In-memory fallback
    return Array.from(inMemoryPayments.values())
      .filter(p => p.order_id === orderId || p.task_id === orderId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * List all payments with optional status filter
   */
  async listPayments(filters = {}) {
    const { status, customer_email, task_id } = filters;

    try {
      let query = supabase.from('aitag_payments').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (customer_email) query = query.eq('customer_email', customer_email);
      if (task_id) query = query.eq('task_id', task_id);

      const { data, error } = await query;
      if (!error && data) return data;
    } catch (e) {
      console.warn('⚠️ Supabase listPayments exception:', e.message);
    }

    // In-memory fallback
    let list = Array.from(inMemoryPayments.values());
    if (status) list = list.filter(p => p.status === status);
    if (customer_email) list = list.filter(p => p.customer_email === customer_email);
    if (task_id) list = list.filter(p => p.task_id === task_id);
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Generate UPI payment config for an order or task
   */
  async getPaymentConfig(identifier, merchantConfig = {}) {
    const vpa = merchantConfig.vpa || process.env.MERCHANT_UPI_VPA || 'mohammedmaqsoodai@oksbi';
    const displayName = merchantConfig.displayName || process.env.MERCHANT_NAME || 'Mohammed Maqsood';

    // Check if identifier is a task
    let itemTitle = 'AITAG AI Service';
    let itemTier = 'Custom';
    let amount = 1499;

    let found = false;
    try {
      const ordersService = require('../aitag-service-orders/service');
      const order = await ordersService.getOrderById(identifier);
      if (order) {
        itemTitle = order.package_title || 'AITAG Service Package';
        itemTier = order.tier_name ? (order.tier_name.charAt(0).toUpperCase() + order.tier_name.slice(1)) : 'Starter';
        amount = Number(order.agreed_price) || 1499;
        found = true;
      }
    } catch {}

    if (!found) {
      try {
        const tasksService = require('../aitag-tasks/service');
        const task = await tasksService.getById(identifier);
        if (task) {
          itemTitle = task.title || 'Task Escrow';
          itemTier = task.category || 'Freelance Task';
          amount = Number(task.agreed_price || task.budget) || 1499;
        }
      } catch {}
    }

    const upiUri = this.generateUpiUri({
      vpa,
      payeeName: displayName,
      amount,
      referenceId: identifier,
      note: `${itemTitle} - ${itemTier}`
    });

    const splits = this.calculateEscrow(amount);

    return {
      reference_id: identifier,
      order_id: identifier,
      package_title: itemTitle,
      tier_name: itemTier,
      amount,
      currency: 'INR',
      merchant: {
        vpa,
        displayName
      },
      upi_uri: upiUri,
      escrow_splits: splits,
      payment_methods: ['upi_qr', 'upi_intent', 'utr_manual']
    };
  }
}

module.exports = new PaymentsService();
