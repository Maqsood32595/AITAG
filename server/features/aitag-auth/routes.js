/**
 * AITAG Auth Routes
 * Fractal Kernel Slice: aitag-auth
 * basePath: /api/auth
 */
const express = require('express');
const router = express.Router();
const authService = require('./service');

// Middleware to extract + verify JWT
const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    req.user = authService.verifyToken(header.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
};

// Export middleware for use in other slices
router.authMiddleware = authMiddleware;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, photoURL, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const result = await authService.register({ name, email, password, photoURL, role });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
