/**
 * AITAG Profile & Delivered Workflows Routes
 * Fractal Kernel Slice: aitag-profile
 * basePath: /api/profile
 */

const path = require('path');
const express = require('express');
const router = express.Router();
const profileService = require('./service');
const authRoutes = require('../auth/routes');
const authMiddleware = authRoutes.authMiddleware;
const { sanitizeStoragePath } = require('../../../aitag-security-guard/middleware/ssrf-guard');
const multer = require('multer');

const ALLOWED_MEDIA_MIMES = [
  'video/mp4', 'video/webm', 'video/quicktime',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'
];
const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.webp', '.svg'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max media size
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_MEDIA_MIMES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Invalid media format. Supported formats: MP4, WebM, MOV, JPG, PNG, WebP, SVG under 100MB.'));
    }
    cb(null, true);
  }
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
  const pathCheck = sanitizeStoragePath(storagePath);
  if (!pathCheck.valid) {
    return res.status(400).json({ error: pathCheck.reason });
  }
  await profileService.streamWorkflowVideo(req, res, pathCheck.cleanPath);
});

// POST /api/profile/workflows/video-upload & /media-upload — Multipart server-to-GCS upload (Zero CORS)
const handleMediaUpload = async (req, res) => {
  try {
    const file = req.file || (req.files && (req.files.find((f) => f.fieldname === 'video' || f.fieldname === 'media' || f.fieldname === 'image') || req.files[0]));
    if (!file) {
      return res.status(400).json({ error: 'Media file (video or image) is required' });
    }
    const { workflowId, durationSeconds, mediaType } = req.body;
    const isImage = file.mimetype.startsWith('image/');
    const detectedType = mediaType || (isImage ? 'image' : 'video');
    const result = await profileService.uploadWorkflowVideoBuffer(req.user.id, {
      workflowId,
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
      mediaType: detectedType,
      durationSeconds: isImage ? undefined : durationSeconds
    });
    res.json(result);
  } catch (err) {
    console.error('[Media Upload Error]:', err);
    res.status(400).json({ error: err.message });
  }
};

router.post('/workflows/video-upload', authMiddleware, upload.any(), handleMediaUpload);
router.post('/workflows/media-upload', authMiddleware, upload.any(), handleMediaUpload);

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
