/**
 * AITAG Marketplace Routes
 */

const express = require('express');
const router = express.Router();
const marketplaceService = require('./service');

// GET /api/marketplace/jobs
router.get('/jobs', (req, res) => {
  res.json(marketplaceService.getJobs());
});

// GET /api/marketplace/users
router.get('/users', (req, res) => {
  res.json(marketplaceService.getUsers());
});

// POST /api/marketplace/jobs
router.post('/jobs', (req, res) => {
  try {
    const { title, category, budget, clientName, description } = req.body;
    if (!title || !budget) {
      return res.status(400).json({ error: "Title and budget are required" });
    }
    const job = marketplaceService.createJob({ title, category, budget, clientName, description });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/marketplace/proposals
router.post('/proposals', (req, res) => {
  try {
    const { jobId, freelancerName, bidAmount, coverLetter } = req.body;
    const prop = marketplaceService.submitProposal({ jobId, freelancerName, bidAmount, coverLetter });
    res.status(201).json(prop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
