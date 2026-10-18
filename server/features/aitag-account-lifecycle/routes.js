/**
 * AITAG Account Lifecycle Routes
 * Fractal Kernel Slice: aitag-account-lifecycle
 * basePath: /api/account
 */

const express = require('express');
const router = express.Router();
const accountLifecycleService = require('./service');
const { authMiddleware } = require('../aitag-auth/routes');

/**
 * DELETE /api/account
 * Permanently delete authenticated user's account and all associated data.
 * Requires explicit confirmation payload: { confirmation: "DELETE" }
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { confirmation } = req.body || {};

    if (!confirmation || confirmation.trim() !== 'DELETE') {
      return res.status(400).json({
        error: 'Confirmation failed: You must enter DELETE in all capital letters to delete your account.'
      });
    }

    const report = await accountLifecycleService.purgeAccount(req.user);

    return res.json({
      success: true,
      message: 'Your account and all associated platform data have been permanently deleted.',
      report
    });
  } catch (err) {
    console.error('❌ [AccountLifecycle] Deletion failed:', err);
    return res.status(500).json({
      error: err.message || 'An error occurred while deleting your account. Please try again.'
    });
  }
});

module.exports = router;
