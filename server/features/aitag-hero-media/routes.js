/**
 * AITAG Hero Floating Media Routes
 * Base Path: /api/hero-media
 */
const express = require('express');
const router = express.Router();
const service = require('./service');

// Health / Status Probe
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'aitag-hero-media',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/hero-media/config — Runtime feature & media availability check
router.get('/config', (req, res) => {
  try {
    return res.json(service.getHeroMediaConfig());
  } catch (err) {
    console.warn('⚠️ [HeroMedia] Config resolution fallback:', err.message);
    return res.json({
      success: false,
      service: 'aitag-hero-media',
      enabled: false,
      available: false,
    });
  }
});

module.exports = router;
