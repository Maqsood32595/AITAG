/**
 * AITAG Payments — HTTP Routes
 * Direct UPI Payment & UTR Verification Endpoints
 */

const express = require('express');
const router = express.Router();
const service = require('./service');
const { requireAuth, requireRole, verifyResourceAccess } = require('../../../domain-security/grandchildren/bola-guard');

// Auth extractor middleware
const extractUser = (req, res, next) => {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    try {
      const authService = require('../../../aitag-auth/service');
      req.user = authService.verifyToken(header.split(' ')[1]);
    } catch {
      // ignore invalid token
    }
  }
  next();
};

// GET /api/payments/merchant-config — Returns configurable merchant details for the payment page
router.get('/merchant-config', (req, res) => {
  res.json({
    success: true,
    merchant: {
      vpa: process.env.MERCHANT_UPI_VPA || 'mohammedmaqsoodai@oksbi',
      name: process.env.MERCHANT_NAME || 'AITAG Escrow',
      qrImage: process.env.MERCHANT_QR_IMAGE || '/images/payment-qr.jpeg'
    }
  });
});

// GET /api/payments/config/:orderId — Get UPI payment config for an order
router.get('/config/:orderId', async (req, res) => {
  try {
    const config = await service.getPaymentConfig(req.params.orderId);
    res.json({ success: true, config });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/payments — Submit payment with UTR reference
router.post('/', async (req, res) => {
  try {
    const payment = await service.submitPayment(req.body);
    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/payments/order/:orderId — Get payments for a specific order (authenticated owner or admin)
router.get('/order/:orderId', requireAuth, async (req, res) => {
  try {
    const payments = await service.getPaymentsByOrderId(req.params.orderId);
    if (req.user.role === 'admin') {
      return res.json({ success: true, payments });
    }
    const scoped = payments.filter((p) => verifyResourceAccess(req.user, p));
    if (payments.length > 0 && scoped.length === 0) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have access to these payment records' });
    }
    res.json({ success: true, payments: scoped });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payments/:id — Get payment by ID (authenticated owner or admin)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const payment = await service.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    if (!verifyResourceAccess(req.user, payment)) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have access to this payment record' });
    }
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/:id/verify — Admin verifies payment & transitions order to PAID
router.post('/:id/verify', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const payment = await service.verifyPayment(req.params.id, req.user.email);
    res.json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/payments — List payments (admin sees all; client/freelancer scoped strictly to own email)
router.get('/', requireAuth, async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    if (req.user.role === 'admin') {
      if (req.query.customer_email) filters.customer_email = req.query.customer_email;
    } else {
      filters.customer_email = req.user.email;
    }

    const payments = await service.listPayments(filters);
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
