/**
 * AITAG Security Guard — Routes & Grandchild Architecture Exporter
 * Base Path: /api/security
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const service = require('./service');

// Import all 9 Grandchild Security Modules
const headersGuard = require('../../grandchildren/headers-guard');
const { authLimiter, apiLimiter, createRateLimiter } = require('../../grandchildren/rate-limiter');
const { xssSanitizer, sanitizeString, sanitizeObject } = require('../../grandchildren/xss-sanitizer');
const { validateSafeUrl, sanitizeStoragePath, isPrivateIp } = require('../../grandchildren/ssrf-guard');
const { requireAuth, requireRole, verifyResourceAccess } = require('../../grandchildren/bola-guard');
const { logScrubberMiddleware, scrubObject } = require('../../grandchildren/log-scrubber');
const { validateUploadedFile, secureMulterFilter, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, BANNED_EXTENSIONS } = require('../../grandchildren/upload-guard');
const { verifyHmacSignature, validatePasswordStrength, verifyJwtEntropy } = require('../../grandchildren/crypto-guard');
const { authenticateWsConnection, joinRoom, leaveRoom, broadcastToRoom } = require('../../grandchildren/websocket-guard');

// Export all grandchild guards on the router for clean cross-slice importing
router.securityHeaders = headersGuard;
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
router.validateUploadedFile = validateUploadedFile;
router.secureMulterFilter = secureMulterFilter;
router.ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
router.ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS;
router.BANNED_EXTENSIONS = BANNED_EXTENSIONS;
router.verifyHmacSignature = verifyHmacSignature;
router.validatePasswordStrength = validatePasswordStrength;
router.verifyJwtEntropy = verifyJwtEntropy;
router.authenticateWsConnection = authenticateWsConnection;
router.joinRoom = joinRoom;
router.leaveRoom = leaveRoom;
router.broadcastToRoom = broadcastToRoom;

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
    architecture: 'Grandchild Security Pattern',
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

// POST /api/security/validate-upload — Upload Integrity Guard Probe Tool
router.post('/validate-upload', (req, res) => {
  const { filename, mimetype } = req.body || {};
  const result = validateUploadedFile({ originalname: filename, mimetype });
  if (!result.valid) {
    return res.status(400).json({ success: false, error: result.error });
  }
  res.json({ success: true, message: 'File format is valid and safe' });
});

// POST /api/security/sanitize-text — XSS Sanitization Tool
router.post('/sanitize-text', (req, res) => {
  const { text } = req.body || {};
  const clean = sanitizeString(text);
  res.json({ original: text, sanitized: clean });
});

// POST /api/security/verify-password — Password Complexity Tool
router.post('/verify-password', (req, res) => {
  const { password } = req.body || {};
  const check = validatePasswordStrength(password);
  res.json(check);
});

module.exports = router;
