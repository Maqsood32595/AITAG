/**
 * AITAG Payments — HTTP Routes
 * Direct UPI Payment & UTR Verification Endpoints
 */

const express = require('express');
const router = express.Router();
const service = require('./service');

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
      name: process.env.MERCHANT_NAME || 'Mohammed Maqsood',
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

// GET /api/payments/order/:orderId — Get payments for a specific order
router.get('/order/:orderId', async (req, res) => {
  try {
    const payments = await service.getPaymentsByOrderId(req.params.orderId);
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payments/:id — Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await service.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/:id/verify — Admin verifies payment & transitions order to PAID
router.post('/:id/verify', extractUser, async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Only administrators can verify payments' });
    }
    const adminEmail = req.user ? req.user.email : 'admin@aitag.com';
    const payment = await service.verifyPayment(req.params.id, adminEmail);
    res.json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/payments — List all payments (admin) or filtered by user
router.get('/', extractUser, async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    // Scope to user's own payments if authenticated as client
    if (req.user && req.user.role === 'client') {
      filters.customer_email = req.user.email;
    } else if (req.query.customer_email) {
      filters.customer_email = req.query.customer_email;
    }

    const payments = await service.listPayments(filters);
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
