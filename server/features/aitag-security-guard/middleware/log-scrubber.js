/**
 * Sensitive Data Log Scrubber
 * Item 19: Sensitive data ko logs se bahar rakho
 */

const SENSITIVE_KEYS = [
  'password',
  'password_hash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'jwt',
  'secret',
  'jwt_secret',
  'key',
  'api_key',
  'credit_card',
  'card_number',
  'cvv',
  'payout_upi',
  'payoutupi'
];

function scrubObject(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 5) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => scrubObject(item, depth + 1));
  }

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
      clean[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = scrubObject(val, depth + 1);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

function logScrubberMiddleware(req, res, next) {
  // Safe sanitized clone for debug logs if needed
  req.getScrubbedBody = () => scrubObject(req.body);
  next();
}

module.exports = {
  scrubObject,
  logScrubberMiddleware
};
