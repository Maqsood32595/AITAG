/**
 * AITAG Blog Routes
 * Fractal Kernel Slice: aitag-blog
 * basePath: /api/blog
 */

const express = require('express');
const router = express.Router();
const blogService = require('./service');

// GET /api/blog — list all published articles
router.get('/', async (req, res) => {
  try {
    const articles = await blogService.getAllArticles();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blog/:slug — get full single article
router.get('/:slug', async (req, res) => {
  try {
    const article = await blogService.getArticleBySlug(req.params.slug);
    res.json(article);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
