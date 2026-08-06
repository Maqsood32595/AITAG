/**
 * Escrow Payment Routes
 */

const express = require('express');
const router = express.Router();
const escrowService = require('./service');

// GET /api/escrow/calculate?amount=50000
router.get('/calculate', (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 50000;
    const rate = parseFloat(req.query.rate) || 0.10;
    res.json(escrowService.calculateSplits(amount, rate));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
