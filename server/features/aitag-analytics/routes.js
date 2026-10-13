/**
 * AITAG Analytics & User Dossier HTTP Routes
 * Fractal Kernel Slice: aitag-analytics
 * basePath: /api/analytics
 */

const express = require('express');
const router = express.Router();
const service = require('./service');
const authRoutes = require('../aitag-auth/routes');
const auth = authRoutes.authMiddleware;

// GET /api/analytics/me — Authenticated user's role-aware analytics + complete dossier
router.get('/me', auth, async (req, res) => {
  try {
    const data = await service.getUserAnalyticsAndDossier(req.user);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/summary — Quick metrics cards
router.get('/summary', auth, async (req, res) => {
  try {
    const data = await service.getUserAnalyticsAndDossier(req.user);
    res.json({
      success: true,
      role: data.analytics.role,
      summaryCards: data.analytics.summaryCards || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
