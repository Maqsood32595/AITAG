/**
 * AITAG Fractal Kernel Adaptive Cache Engine — Routes
 * Fractal Kernel Slice: aitag-cache
 * basePath: /api/cache
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const cacheService = require('./service');
const { cacheGuard } = require('./middleware/cache-guard');

// GET /api/cache/health — Liveness probe
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'aitag-cache', timestamp: new Date().toISOString() });
});

// GET /api/cache/stats — Observability and cache telemetry
router.get('/stats', (req, res) => {
  res.json(cacheService.getStats());
});

// POST /api/cache/purge — Programmatic or administrative cache invalidation
router.post('/purge', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Admin authentication required to purge cache in production' });
    }
    try {
      const authService = require('../aitag-auth/service');
      const user = authService.verifyToken(authHeader.split(' ')[1]);
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden: Only administrators can purge cache' });
      }
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid authentication token' });
    }
  }
  next();
}, (req, res) => {
  const { tag, pattern, clearAll } = req.body || {};

  if (clearAll) {
    const count = cacheService.clear();
    return res.json({ success: true, message: 'All cache entries cleared', count });
  }

  if (tag) {
    const count = cacheService.invalidateByTag(tag);
    return res.json({ success: true, message: `Cache invalidated for tag: ${tag}`, count });
  }

  if (pattern) {
    const count = cacheService.invalidateByPattern(pattern);
    return res.json({ success: true, message: `Cache invalidated for pattern: ${pattern}`, count });
  }

  res.status(400).json({ success: false, error: 'Specify tag, pattern, or clearAll: true' });
});

// Attach helper middleware and service instance directly to the router for convenient importing
router.cacheGuard = cacheGuard;
router.cacheService = cacheService;

module.exports = router;
