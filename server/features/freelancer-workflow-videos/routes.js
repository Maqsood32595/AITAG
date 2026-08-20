const express = require('express');
const router = express.Router();
const workflowService = require('./service');

// Middleware to extract user from session / auth
const requireAuth = (req, res, next) => {
    const user = req.user || (req.headers['x-user-id'] ? { id: req.headers['x-user-id'] } : null);
    if (!user || !user.id) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.user = user;
    next();
};

/**
 * POST /api/freelancer/workflow-videos/signed-url
 * Generates direct GCS upload URL for logged-in freelancer
 */
router.post('/signed-url', requireAuth, async (req, res) => {
    try {
        const { filename, contentType } = req.body;
        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        const result = await workflowService.getSignedUploadUrl(req.user.id, filename, contentType);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('[Workflow Video Signed URL Error]:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/freelancer/workflow-videos/record
 * Saves video proof metadata after successful upload
 */
router.post('/record', requireAuth, async (req, res) => {
    try {
        const videoRecord = await workflowService.recordWorkflowVideo(req.user.id, req.body);
        res.json({ success: true, video: videoRecord });
    } catch (error) {
        console.error('[Workflow Video Record Error]:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/freelancer/workflow-videos
 * Lists all workflow proof videos for the logged-in freelancer
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const videos = await workflowService.getFreelancerVideos(req.user.id);
        res.json({ success: true, videos });
    } catch (error) {
        console.error('[Workflow Video List Error]:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
