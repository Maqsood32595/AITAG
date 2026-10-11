/**
 * AITAG Service Orders — HTTP Routes
 */

const express = require('express');
const router = express.Router();
const service = require('./service');

// POST /api/service-orders — Submit customer brief & create order
router.post('/', async (req, res) => {
  try {
    const order = await service.createOrder(req.body);
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/service-orders — List orders with optional role/email filters
router.get('/', async (req, res) => {
  try {
    const { role, email, status } = req.query;
    const orders = await service.listOrders({ role, email, status });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/service-orders/:id — Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await service.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/assign — Admin assigns expert
router.post('/:id/assign', async (req, res) => {
  try {
    const { expertEmail, expertName } = req.body;
    if (!expertEmail) {
      return res.status(400).json({ success: false, error: 'expertEmail is required' });
    }
    const order = await service.assignExpert(req.params.id, expertEmail, expertName || 'Vetted AI Expert');
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/activate — Admin marks payment received & activates project
router.post('/:id/activate', async (req, res) => {
  try {
    const order = await service.activateProject(req.params.id);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/service-orders/:id/draft — Expert submits draft files
router.post('/:id/draft', async (req, res) => {
  try {
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

// POST /api/service-orders/:id/revision — Customer requests revision
router.post('/:id/revision', async (req, res) => {
  try {
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

// POST /api/service-orders/:id/approve — Customer approves final work & rates
router.post('/:id/approve', async (req, res) => {
  try {
    const { rating, testimonial, finalFiles } = req.body;
    const order = await service.approveAndComplete(req.params.id, { rating, testimonial, finalFiles });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/service-orders/:id/status — Generic state transition
router.patch('/:id/status', async (req, res) => {
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
