/**
 * AITAG Expert Applications & Onboarding Routes
 * basePath: /api/expert-applications
 */

const express = require('express');
const router = express.Router();
const expertApplicationsService = require('./service');
const authRoutes = require('../../../aitag-auth/routes');
const authMiddleware = authRoutes.authMiddleware;

// Optional auth helper: attaches user if token is present, but doesn't fail if guest
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
}

// POST /api/expert-applications — Public or authenticated submission
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, domain, tools, portfolio_url, experience, bio } = req.body;
    const userId = req.user?.id || null;

    const result = await expertApplicationsService.submitApplication({
      name,
      email,
      phone,
      domain,
      tools,
      portfolio_url,
      experience,
      bio,
      userId
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/expert-applications — Admin-only list of applications
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required to view expert applications' });
    }

    const applications = await expertApplicationsService.listApplications();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/expert-applications/:id — Admin-only evaluate / approve / reject
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required to evaluate expert applications' });
    }

    const { status, notes } = req.body;
    const result = await expertApplicationsService.evaluateApplication({
      applicationId: req.params.id,
      status,
      notes,
      adminEmail: req.user.email
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

