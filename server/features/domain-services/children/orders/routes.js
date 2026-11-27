/**
 * AITAG Service Orders — HTTP Routes
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const service = require('./service');

// Configure multer storage for customer asset uploads
const uploadDir = path.join(__dirname, '../../../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const banned = ['.exe', '.bat', '.sh', '.php', '.js', '.vbs', '.py'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (banned.includes(ext)) {
      return cb(new Error('Executable file types are not permitted.'));
    }
    cb(null, true);
  }
});

// Optional/flexible auth extractor for unauthenticated brief submission only
const extractUser = (req, res, next) => {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    try {
      const authService = require('../../../aitag-auth/service');
      req.user = authService.verifyToken(header.split(' ')[1]);
    } catch {
      // ignore invalid token on optional routes
    }
  }
  next();
};

const { requireAuth, requireRole, verifyResourceAccess } = require('../../../domain-security/grandchildren/bola-guard');

// POST /api/service-orders/upload-assets — Upload customer images/documents
router.post('/upload-assets', (req, res) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    const uploaded = (req.files || []).map((f) => ({
      originalName: f.originalname,
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype,
      url: `/uploads/${f.filename}`
    }));
    return res.status(200).json({ success: true, count: uploaded.length, files: uploaded });
  });
});

// POST /api/service-orders — Submit customer brief & create order
router.post('/', extractUser, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user && req.user.role === 'client' && req.user.email) {
      payload.customer_email = req.user.email;
    }
    const order = await service.createOrder(payload);
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/service-orders — Authenticated listing with strict role-based scoping
router.get('/', requireAuth, async (req, res) => {
  try {
    let { role, email, status } = req.query;

    if (req.user.role === 'client') {
      role = 'client';
      email = req.user.email;
    } else if (req.user.role === 'freelancer') {
      role = 'freelancer';
      email = req.user.email;
    }

    const orders = await service.listOrders({ role, email, status });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/service-orders/:id — Authenticated single-order lookup with BOLA guard
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await service.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (!verifyResourceAccess(req.user, order)) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have access to this order' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/assign — Admin assigns expert (optional discount/payment waiver)
router.post('/:id/assign', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { expertEmail, expertName, discountAmount, skipPayment, reason } = req.body;
    if (!expertEmail) {
      return res.status(400).json({ success: false, error: 'expertEmail is required' });
    }
    const order = await service.assignExpert(req.params.id, expertEmail, expertName || 'Verified AI Expert', {
      discountAmount,
      skipPayment,
      reason,
      adminEmail: req.user.email,
    });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/skip-payment — Admin waives payment requirement
router.post('/:id/skip-payment', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const order = await service.applyPricingOverride(req.params.id, {
      skipPayment: true,
      reason: req.body?.reason,
      adminEmail: req.user.email,
    });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/pricing — Admin applies discount and/or waives payment
router.post('/:id/pricing', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { discountAmount = 0, skipPayment = false, reason = '' } = req.body || {};
    const order = await service.applyPricingOverride(req.params.id, {
      discountAmount,
      skipPayment: Boolean(skipPayment),
      reason,
      adminEmail: req.user.email,
    });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/reset — Admin resets expert assignment back to REQUESTED
router.post('/:id/reset', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const order = await service.resetAssignment(req.params.id);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/activate — Admin marks payment received & activates project
router.post('/:id/activate', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const order = await service.activateProject(req.params.id);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/draft — Assigned Expert (or Admin) submits draft files
router.post('/:id/draft', requireAuth, async (req, res) => {
  try {
    const existing = await service.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isAssignedExpert = req.user.role === 'freelancer' && verifyResourceAccess(req.user, existing);
    if (!isAdmin && !isAssignedExpert) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the assigned specialist or admin may submit drafts' });
    }
    const { draftFiles } = req.body;
    if (!draftFiles || (Array.isArray(draftFiles) && draftFiles.length === 0)) {
      return res.status(400).json({ success: false, error: 'draftFiles required' });
    }
    const order = await service.submitDraft(req.params.id, draftFiles);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/revision — Customer (or Admin) requests revision
router.post('/:id/revision', requireAuth, async (req, res) => {
  try {
    const existing = await service.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isCustomer = (existing.customer_email || '').toLowerCase().trim() === (req.user.email || '').toLowerCase().trim();
    if (!isAdmin && !isCustomer) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the order customer or admin may request revisions' });
    }
    const { revisionNotes } = req.body;
    if (!revisionNotes) {
      return res.status(400).json({ success: false, error: 'revisionNotes required' });
    }
    const order = await service.requestRevision(req.params.id, revisionNotes);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/approve — Customer (or Admin) approves final work & rates
router.post('/:id/approve', requireAuth, async (req, res) => {
  try {
    const existing = await service.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isCustomer = (existing.customer_email || '').toLowerCase().trim() === (req.user.email || '').toLowerCase().trim();
    if (!isAdmin && !isCustomer) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the order customer or admin may approve completion' });
    }
    const { rating, testimonial, finalFiles } = req.body;
    const order = await service.approveAndComplete(req.params.id, { rating, testimonial, finalFiles });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/service-orders/:id/status — Admin-only generic state transition
router.patch('/:id/status', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, ...patch } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status required' });
    }
    const order = await service.updateOrderStatus(req.params.id, status, patch);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
