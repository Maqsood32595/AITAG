/**
 * AITAG Invitations Routes
 * Fractal Kernel Slice: aitag-invitations
 * basePath: /api/invitations
 */

const express = require('express');
const router = express.Router();
const invitationsService = require('./service');
const authRoutes = require('../aitag-auth/routes');
const authMiddleware = authRoutes.authMiddleware;

// POST /api/invitations — Client invites freelancer to a task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { taskId, freelancerEmail, message } = req.body;
    const clientEmail = req.user.email;

    const result = await invitationsService.sendInvitation({
      taskId,
      clientEmail,
      freelancerEmail,
      message
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/invitations/my — Freelancer gets received invitations
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const invitations = await invitationsService.getMyInvitations(req.user.email);
    res.json(invitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/invitations/:id/accept — Freelancer accepts invitation
router.patch('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const result = await invitationsService.acceptInvitation(req.params.id, req.user.email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/invitations/:id/decline — Freelancer declines invitation
router.patch('/:id/decline', authMiddleware, async (req, res) => {
  try {
    const result = await invitationsService.declineInvitation(req.params.id, req.user.email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
