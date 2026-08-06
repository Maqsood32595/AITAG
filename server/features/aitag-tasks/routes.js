/**
 * AITAG Tasks Routes
 * Fractal Kernel Slice: aitag-tasks
 * basePath: /api/tasks
 */
const express = require('express');
const router = express.Router();
const tasksService = require('./service');
const authRoutes = require('../aitag-auth/routes');
const auth = authRoutes.authMiddleware;

// GET /api/tasks  — all tasks (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const tasks = await tasksService.getAllTasks({ category, search, limit });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/featured  — top 8 by budget (public)
router.get('/featured', async (req, res) => {
  try {
    const tasks = await tasksService.getFeaturedTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/my  — user's own tasks (protected)
router.get('/my', auth, async (req, res) => {
  try {
    const tasks = await tasksService.getMyTasks(req.user.email);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id  — single task (public)
router.get('/:id', async (req, res) => {
  try {
    const task = await tasksService.getTaskById(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/tasks  — create task (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, description, deadline, budget, image } = req.body;
    if (!title || !category || !description || !deadline || !budget) {
      return res.status(400).json({ error: 'title, category, description, deadline and budget are required' });
    }
    const task = await tasksService.createTask({
      title, category, description, deadline, budget, image,
      userEmail: req.user.email,
      userName: req.user.name
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id  — update task (protected, owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, category, description, deadline, budget, image, status } = req.body;
    const task = await tasksService.updateTask(req.params.id, req.user.email, {
      ...(title && { title }),
      ...(category && { category }),
      ...(description && { description }),
      ...(deadline && { deadline }),
      ...(budget && { budget: Number(budget) }),
      ...(image && { image }),
      ...(status && { status })
    });
    res.json(task);
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id  — delete task (protected, owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await tasksService.deleteTask(req.params.id, req.user.email);
    res.json(result);
  } catch (err) {
    const code = err.message.includes('Unauthorized') ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
});

module.exports = router;
