const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const tasksService = require('./service');
const authRoutes = require('../aitag-auth/routes');
const auth = authRoutes.authMiddleware;
const { cacheGuard, cacheService } = require('../aitag-cache/routes');

// Configure static upload storage for task attachments & materials
const uploadsDir = path.join(__dirname, '../../public/uploads/tasks');
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

const { secureMulterFilter } = require('../aitag-security-guard/guards/upload-guard');

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max per attachment
  fileFilter: secureMulterFilter
});

// GET /api/tasks  — all tasks (public, cached 60s, Tag: tasks)
router.get('/', cacheGuard({ ttlMs: 60000, tags: ['tasks'] }), async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const tasks = await tasksService.getAllTasks({ category, search, limit });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/featured  — top 8 by budget (public, cached 60s, Tag: tasks)
router.get('/featured', cacheGuard({ ttlMs: 60000, tags: ['tasks'] }), async (req, res) => {
  try {
    const tasks = await tasksService.getFeaturedTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/my  — user's own tasks (protected, user-scoped cache)
router.get('/my', auth, cacheGuard({ ttlMs: 30000, scope: 'user', tags: (req) => ['tasks', `user:${(req.user?.email || '').toLowerCase().trim()}`] }), async (req, res) => {
  try {
    const tasks = await tasksService.getMyTasks(req.user.email);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id  — single task (public, cached 60s, Tag: tasks)
router.get('/:id', cacheGuard({ ttlMs: 60000, tags: ['tasks'] }), async (req, res) => {
  try {
    const task = await tasksService.getTaskById(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/tasks/upload — upload files before task creation (protected)
router.post('/upload', auth, upload.array('files', 10), (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0 && req.file) files.push(req.file);
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const attachments = files.map(f => ({
      id: crypto.randomUUID(),
      name: f.originalname,
      url: `/uploads/tasks/${f.filename}`,
      size: f.size,
      type: f.mimetype,
      uploaded_at: new Date().toISOString()
    }));

    res.status(201).json({ success: true, attachments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/tasks  — create task (protected, invalidates tasks cache)
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, description, deadline, budget, image, attachments } = req.body;
    if (!title || !category || !description || !deadline || !budget) {
      return res.status(400).json({ error: 'title, category, description, deadline and budget are required' });
    }
    const task = await tasksService.createTask({
      title, category, description, deadline, budget, image, attachments,
      userEmail: req.user.email,
      userName: req.user.name
    });
    cacheService.invalidateByTag('tasks');
    cacheService.invalidateByTag(`user:${(req.user.email || '').toLowerCase().trim()}`);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/:id/attachments — append files to existing task (protected, owner only)
router.post('/:id/attachments', auth, upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0 && req.file) files.push(req.file);
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const newAttachments = files.map(f => ({
      id: crypto.randomUUID(),
      name: f.originalname,
      url: `/uploads/tasks/${f.filename}`,
      size: f.size,
      type: f.mimetype,
      uploaded_at: new Date().toISOString()
    }));

    const updated = await tasksService.addAttachments(req.params.id, req.user.email, newAttachments, req.user.role);
    cacheService.invalidateByTag('tasks');
    cacheService.invalidateByTag(`user:${(req.user.email || '').toLowerCase().trim()}`);
    res.status(201).json({ success: true, task: updated, attachments: newAttachments });
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ success: false, error: err.message });
  }
});

// DELETE /api/tasks/:id/attachments/:assetId — remove an attachment (protected, owner only)
router.delete('/:id/attachments/:assetId', auth, async (req, res) => {
  try {
    const updated = await tasksService.removeAttachment(req.params.id, req.user.email, req.params.assetId, req.user.role);
    cacheService.invalidateByTag('tasks');
    cacheService.invalidateByTag(`user:${(req.user.email || '').toLowerCase().trim()}`);
    res.json({ success: true, task: updated });
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ success: false, error: err.message });
  }
});

// PUT /api/tasks/:id  — update task (protected, owner only, invalidates tasks cache)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, category, description, deadline, budget, image, attachments, status } = req.body;
    const task = await tasksService.updateTask(req.params.id, req.user.email, {
      ...(title && { title }),
      ...(category && { category }),
      ...(description && { description }),
      ...(deadline && { deadline }),
      ...(budget && { budget: Number(budget) }),
      ...(image && { image }),
      ...(attachments && { attachments }),
      ...(status && { status })
    }, req.user.role);
    cacheService.invalidateByTag('tasks');
    cacheService.invalidateByTag(`user:${(req.user.email || '').toLowerCase().trim()}`);
    res.json(task);
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id  — delete task (protected, owner only, invalidates tasks cache)
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await tasksService.deleteTask(req.params.id, req.user.email);
    cacheService.invalidateByTag('tasks');
    cacheService.invalidateByTag(`user:${(req.user.email || '').toLowerCase().trim()}`);
    res.json(result);
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
});

// POST /api/tasks/:id/assign — assign vetted specialist to task (protected, admin only)
router.post('/:id/assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can match vetted specialists to tasks' });
    }
    const { expertEmail, expertName } = req.body;
    if (!expertEmail) {
      return res.status(400).json({ error: 'expertEmail is required' });
    }
    const task = await tasksService.assignTask(req.params.id, { expertEmail, expertName });
    cacheService.invalidateByTag('tasks');
    cacheService.invalidateByTag(`user:${(task.user_email || '').toLowerCase().trim()}`);
    cacheService.invalidateByTag(`user:${(expertEmail || '').toLowerCase().trim()}`);
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/:id/reset — reset task assignment back to open bidding pool (protected, admin only)
router.post('/:id/reset', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can reset task assignments' });
    }
    const task = await tasksService.resetTaskAssignment(req.params.id);
    cacheService.invalidateByTag('tasks');
    cacheService.invalidateByTag(`user:${(task.user_email || '').toLowerCase().trim()}`);
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
