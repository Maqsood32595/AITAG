/**
 * AITAG Google OAuth Routes
 * Fractal Kernel Slice: aitag-oauth
 * basePath: /api/oauth
 */

const express = require('express');
const router = express.Router();
const googleOAuthService = require('./service');

// GET /api/oauth/config — Public client configuration
router.get('/config', (req, res) => {
  res.json(googleOAuthService.getPublicConfig());
});

// GET /api/oauth/health — Slice healthcheck
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', slice: 'aitag-oauth', timestamp: new Date().toISOString() });
});

// POST /api/oauth/google — Register or Login with Google credential
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google credential token is required'
      });
    }

    const result = await googleOAuthService.authenticateGoogleUser({ credential, role });
    res.json({
      success: true,
      token: result.token,
      user: result.user,
      isNew: result.isNew,
      message: result.isNew ? 'Account created successfully with Google' : 'Signed in successfully with Google'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Google authentication failed'
    });
  }
});

module.exports = router;
