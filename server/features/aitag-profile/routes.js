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
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 } // 150MB max video size
});


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

// POST /api/profile/workflows/video-signed-url — Request GCS signed URL with < 2 min check
// GET /api/profile/workflows/stream-video — Secure HTTP 206 video streamer
router.get('/workflows/stream-video', async (req, res) => {
  const storagePath = req.query.path;
  await profileService.streamWorkflowVideo(req, res, storagePath);
});

// POST /api/profile/workflows/video-upload — Multipart server-to-GCS upload (Zero CORS)
router.post('/workflows/video-upload', authMiddleware, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }
    const { workflowId, durationSeconds } = req.body;
    const result = await profileService.uploadWorkflowVideoBuffer(req.user.id, {
      workflowId,
      filename: req.file.originalname,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      durationSeconds
    });
    res.json(result);
  } catch (err) {
    console.error('[Video Upload Error]:', err);
    res.status(400).json({ error: err.message });
  }
});

router.post('/workflows/video-signed-url', authMiddleware, async (req, res) => {
  try {
    const result = await profileService.generateWorkflowVideoSignedUrl(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/profile/workflows/attach-video — Attach uploaded video demo to workflow
router.post('/workflows/attach-video', authMiddleware, async (req, res) => {
  try {
    const updatedWorkflow = await profileService.attachVideoToWorkflow(req.user.id, req.body);
    res.json({ success: true, workflow: updatedWorkflow });
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
