/**
 * Leakage Shield Routes
 * Child of Domain: `domain-security`
 */

const express = require('express');
const router = express.Router();
const shieldService = require('./service');

// POST /api/shield/filter
router.post('/filter', (req, res) => {
  try {
    const { message } = req.body;
    res.json(shieldService.filterMessage(message || ""));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
