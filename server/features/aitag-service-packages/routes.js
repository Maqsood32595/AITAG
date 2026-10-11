/**
 * AITAG Service Packages — HTTP Routes
 */

const express = require('express');
const router = express.Router();
const service = require('./service');

// GET /api/service-packages — List all active pilot packages with tiers
router.get('/', async (req, res) => {
  try {
    const packages = await service.getAllPackages();
    res.json({ success: true, count: packages.length, packages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/service-packages/:slug — Get single package by slug
router.get('/:slug', async (req, res) => {
  try {
    const pkg = await service.getPackageBySlug(req.params.slug);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
