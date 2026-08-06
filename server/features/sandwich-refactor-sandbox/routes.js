/**
 * Sandwich Refactor Sandbox Routes
 */

const express = require('express');
const router = express.Router();
const sandboxService = require('./service');

// GET /api/sandbox/benchmark?files=100
router.get('/benchmark', async (req, res) => {
  try {
    const files = parseInt(req.query.files) || 100;
    const result = await sandboxService.runParallelBenchmark(files);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/sandbox/dry-run
router.post('/dry-run', (req, res) => {
  try {
    const { code } = req.body;
    const result = sandboxService.executeSandboxDryRun(code || "");
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
