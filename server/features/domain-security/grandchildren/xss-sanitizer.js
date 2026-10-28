/**
 * Grandchild Security Layer 4: Recursive Input Sanitizer & Multi-Vector XSS Guard
 * Location: server/features/aitag-security-guard/guards/xss-sanitizer.js
 */

function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  let cleaned = str;

  // 1. Iteratively strip script tags until zero remain (defeats nested tag bypasses: <scr<script>ipt>)
  let previous;
  do {
    previous = cleaned;
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  } while (cleaned !== previous);

  // 2. Strip dangerous pseudo-protocols
  cleaned = cleaned
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');

  // 3. Strip all HTML5 event handlers (onload, onerror, onclick, onfocus, onmouseover, ontoggle, etc.)
  cleaned = cleaned.replace(/\bon\w+\s*=/gi, '');

  return cleaned;
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' ? sanitizeObject(item) : sanitizeString(item)));
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      clean[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function xssSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

module.exports = {
  xssSanitizer,
  sanitizeString,
  sanitizeObject
};
