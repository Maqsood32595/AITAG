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
const { cacheGuard } = require('../aitag-cache/routes');

// GET /api/analytics/me — Authenticated user's role-aware analytics + complete dossier (user-scoped cache)
router.get('/me', auth, cacheGuard({ ttlMs: 30000, scope: 'user', tags: (req) => ['analytics', `user:${req.user?.email}`] }), async (req, res) => {
  try {
    const data = await service.getUserAnalyticsAndDossier(req.user);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/summary — Quick metrics cards (user-scoped cache)
router.get('/summary', auth, cacheGuard({ ttlMs: 30000, scope: 'user', tags: (req) => ['analytics', `user:${req.user?.email}`] }), async (req, res) => {
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
