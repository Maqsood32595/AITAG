/**
 * AITAG Profile & Delivered Workflows Routes
 * Fractal Kernel Slice: aitag-profile
 * basePath: /api/profile
 */

const express = require('express');
const router = express.Router();
const profileService = require('./service');
const authRoutes = require('../aitag-auth/routes');
const authMiddleware = authRoutes.authMiddleware;

// GET /api/profile/me — Get authenticated user's profile and delivered workflows
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await profileService.getProfileByUserId(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// PUT /api/profile/me — Update authenticated user's profile and delivered workflows
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const updated = await profileService.updateProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/profile/:userId — Get public showcase profile for any specialist
router.get('/:userId', async (req, res) => {
  try {
    const profile = await profileService.getProfileByUserId(req.params.userId);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
