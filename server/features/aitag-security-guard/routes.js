/**
 * AITAG Security Guard — Routes & Middleware Exporter
 * Base Path: /api/security
 */

const express = require('express');
const router = express.Router();
const service = require('./service');

// Import all middlewares
const securityHeaders = require('./middleware/security-headers');
const { authLimiter, apiLimiter, createRateLimiter } = require('./middleware/rate-limiter');
const { xssSanitizer, sanitizeString, sanitizeObject } = require('./middleware/xss-sanitizer');
const { validateSafeUrl, sanitizeStoragePath, isPrivateIp } = require('./middleware/ssrf-guard');
const { requireAuth, requireRole, verifyResourceAccess } = require('./middleware/bola-guard');
const { logScrubberMiddleware, scrubObject } = require('./middleware/log-scrubber');

// Export middlewares for use across Kernel slices
router.securityHeaders = securityHeaders;
router.authLimiter = authLimiter;
router.apiLimiter = apiLimiter;
router.createRateLimiter = createRateLimiter;
router.xssSanitizer = xssSanitizer;
router.sanitizeString = sanitizeString;
router.sanitizeObject = sanitizeObject;
router.validateSafeUrl = validateSafeUrl;
router.sanitizeStoragePath = sanitizeStoragePath;
router.isPrivateIp = isPrivateIp;
router.requireAuth = requireAuth;
router.requireRole = requireRole;
router.verifyResourceAccess = verifyResourceAccess;
router.logScrubberMiddleware = logScrubberMiddleware;
router.scrubObject = scrubObject;

// GET /api/security/audit — 20-Point Security Matrix Real-Time Audit
router.get('/audit', (req, res) => {
  try {
    const report = service.getSecurityAuditReport();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/security/health — Quick Security Guard Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ACTIVE',
    engine: 'AITAG Fractal Security Guard',
    activeControls: 20,
    timestamp: new Date().toISOString()
  });
});

// POST /api/security/validate-url — SSRF Probe Verification Tool
router.post('/validate-url', (req, res) => {
  const { url } = req.body || {};
  const result = validateSafeUrl(url);
  if (!result.safe) {
    return res.status(400).json({ success: false, error: result.reason });
  }
  res.json({ success: true, url: result.url });
});

module.exports = router;
