/**
 * AITAG Bids Routes
 * Fractal Kernel Slice: aitag-bids
 * basePath: /api/bids
 */
const express = require('express');
const router = express.Router();
const bidsService = require('./service');
const authRoutes = require('../aitag-auth/routes');
const auth = authRoutes.authMiddleware;

// GET /api/bids/my  — bids placed by logged-in user (protected)
router.get('/my', auth, async (req, res) => {
  try {
    const result = await bidsService.getUserBids(req.user.email);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bids/check/:taskId  — check if current user already bid (protected)
router.get('/check/:taskId', auth, async (req, res) => {
  try {
    const result = await bidsService.checkUserBid(req.params.taskId, req.user.email);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bids/task/:taskId  — all bids for a task (owner only, protected)
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const bids = await bidsService.getTaskBids(req.params.taskId, req.user.email);
    res.json(bids);
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
});

// POST /api/bids  — place a bid (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const result = await bidsService.placeBid({
      taskId,
      userEmail: req.user.email,
      userName: req.user.name
    });
    res.status(201).json(result);
  } catch (err) {
    const status = ['already placed', 'own task', 'deadline'].some(s => err.message.includes(s)) ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

// PATCH /api/bids/:bidId/accept — accept bid and secure escrow (owner only, protected)
router.patch('/:bidId/accept', auth, async (req, res) => {
  try {
    const result = await bidsService.acceptBid(req.params.bidId, req.user.email);
    res.json(result);
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
});

module.exports = router;
