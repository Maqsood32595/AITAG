/**
 * Grandchild Security Layer 6: Sensitive Data Redaction & Log Scrubber Guard
 * Location: server/features/aitag-security-guard/guards/log-scrubber.js
 */

const SENSITIVE_KEYS = [
  'password',
  'password_hash',
  'passwordhash',
  'token',
  'refreshtoken',
  'authorization',
  'jwt',
  'secret',
  'private_key',
  'privatekey',
  'service_role',
  'payout_upi',
  'payoutupi',
  'card_number',
  'cvv',
  'credit_card'
];

function scrubObject(obj, seen = new WeakSet()) {
  if (!obj || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return '[CIRCULAR]';
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' ? scrubObject(item, seen) : item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    const isSensitive = SENSITIVE_KEYS.some(k => lowerKey.includes(k.replace(/[-_]/g, '')));

    if (isSensitive) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = scrubObject(value, seen);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function logScrubberMiddleware(req, res, next) {
  // Intercept response send to scrub logged error responses if any logger is attached
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 500 && body && typeof body === 'object') {
      scrubObject(body);
    }
    return originalJson.call(this, body);
  };
  next();
}

module.exports = {
  scrubObject,
  logScrubberMiddleware
};
