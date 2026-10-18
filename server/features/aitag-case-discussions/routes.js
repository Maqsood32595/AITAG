/**
 * AITAG Case Discussions Routes
 * Fractal Kernel Slice: aitag-case-discussions
 * basePath: /api/case-discussions
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const multer = require('multer');

const service = require('./service');
const { authMiddleware } = require('../aitag-auth/routes');

// Configure static upload storage for case attachments
const uploadsDir = path.join(__dirname, '../../public/uploads/discussions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || '').toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max per attachment
});

/**
 * GET /api/case-discussions/:orderId
 * Retrieve chronological discussion history for a case.
 */
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    const messages = await service.getMessages(orderId);
    res.json({ success: true, order_id: orderId, messages });
  } catch (err) {
    console.error('❌ [CaseDiscussions] Error fetching messages:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/case-discussions/:orderId
 * Post a discussion message with optional asset attachments.
 */
router.post('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message, attachments } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    const cleanMsg = (message || '').trim();
    const cleanAttachments = Array.isArray(attachments) ? attachments : [];

    if (!cleanMsg && cleanAttachments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content or at least one asset attachment is required'
      });
    }

    const record = await service.addMessage({
      orderId,
      senderEmail: req.user.email,
      senderName: req.user.name || 'AITAG Specialist',
      senderRole: req.user.role || 'freelancer',
      message: cleanMsg,
      attachments: cleanAttachments
    });

    res.status(201).json({ success: true, message: record });
  } catch (err) {
    console.error('❌ [CaseDiscussions] Error posting message:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/case-discussions/:orderId/attachments
 * Multipart file upload for asset attachments.
 */
router.post('/:orderId/attachments', authMiddleware, upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0 && req.file) {
      files.push(req.file);
    }

    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const attachments = files.map(f => ({
      id: crypto.randomUUID(),
      name: f.originalname,
      url: `/uploads/discussions/${f.filename}`,
      size: f.size,
      type: f.mimetype,
      uploaded_at: new Date().toISOString()
    }));

    res.status(201).json({ success: true, attachments });
  } catch (err) {
    console.error('❌ [CaseDiscussions] File upload error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
