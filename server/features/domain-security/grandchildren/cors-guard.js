/**
 * Grandchild Security Layer 10: Strict CORS Origin Validator
 * Location: server/features/domain-security/grandchildren/cors-guard.js
 */

const EXACT_ALLOWED_ORIGINS = new Set([
  'https://aitag.in',
  'https://www.aitag.in',
  'https://shortshub.app',
  'https://www.shortshub.app',
]);

const SUFFIX_ALLOWED_HOSTS = [
  '.aitag.in',
  '.shortshub.app',
  '.onrender.com',
  '.pages.dev',
  '.run.app',
];

function parseExtraOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Validates whether a request Origin header is explicitly permitted.
 * Unknown cross-origin domains are strictly rejected in production.
 */
function isAllowedOrigin(origin, env = process.env) {
  if (!origin) return true; // Same-origin / server-to-server requests

  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return false;
  }

  const normalizedOrigin = `${parsed.protocol}//${parsed.host}`.toLowerCase();
  if (EXACT_ALLOWED_ORIGINS.has(normalizedOrigin)) {
    return true;
  }

  const extra = parseExtraOrigins();
  if (extra.includes(normalizedOrigin)) {
    return true;
  }

  const hostname = parsed.hostname.toLowerCase();
  const isProd = env.NODE_ENV === 'production';

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return !isProd || env.ALLOW_LOCALHOST_CORS === 'true';
  }

  if (parsed.protocol === 'https:' && SUFFIX_ALLOWED_HOSTS.some((suffix) => hostname.endsWith(suffix))) {
    return true;
  }

  return false;
}

function createCorsOptions(env = process.env) {
  return {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin, env)) {
        return callback(null, true);
      }
      const err = new Error(`Blocked CORS origin: ${origin}`);
      err.status = 403;
      return callback(err);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
}

module.exports = {
  isAllowedOrigin,
  createCorsOptions,
};
