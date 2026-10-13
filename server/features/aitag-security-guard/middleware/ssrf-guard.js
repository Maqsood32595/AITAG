/**
 * SSRF (Server-Side Request Forgery) & Path Traversal Validator
 * Item 5: SSRF check karo
 */

const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // AWS/GCP instance metadata IP
  'metadata.google.internal',
  'instance-data'
];

function isPrivateIp(ip) {
  if (!ip) return false;
  // 10.0.0.0/8
  if (/^10\./.test(ip)) return true;
  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // 192.168.0.0/16
  if (/^192\.168\./.test(ip)) return true;
  // 127.0.0.0/8
  if (/^127\./.test(ip)) return true;
  // 169.254.0.0/16
  if (/^169\.254\./.test(ip)) return true;
  return false;
}

/**
 * Validates that an outgoing URL does not target internal services or metadata servers
 */
function validateSafeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, reason: 'Invalid URL string' };
  }

  try {
    const parsed = new URL(rawUrl.trim());

    // Only allow http: and https: protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Disallowed protocol: ${parsed.protocol}` };
    }

    const host = parsed.hostname.toLowerCase();

    // Check exact blocked hostnames
    if (BLOCKED_HOSTNAMES.includes(host)) {
      return { safe: false, reason: `Blocked private hostname or metadata target: ${host}` };
    }

    // Check IP address regex patterns
    if (isPrivateIp(host)) {
      return { safe: false, reason: `Blocked private subnet target: ${host}` };
    }

    return { safe: true, url: parsed.toString() };
  } catch (err) {
    return { safe: false, reason: `Malformed URL: ${err.message}` };
  }
}

/**
 * Validates that a file storage path does not attempt directory traversal (../)
 */
function sanitizeStoragePath(rawPath, allowedPrefix = 'freelancers/') {
  if (!rawPath || typeof rawPath !== 'string') {
    return { valid: false, reason: 'Storage path is required' };
  }

  // Reject path traversal and null bytes
  if (rawPath.includes('..') || rawPath.includes('%00') || rawPath.includes('\\')) {
    return { valid: false, reason: 'Directory traversal detected (../ or null byte)' };
  }

  // Clean path
  const normalized = rawPath.replace(/^\/+/, '');

  if (allowedPrefix && !normalized.startsWith(allowedPrefix)) {
    return { valid: false, reason: `Path must reside within ${allowedPrefix}` };
  }

  return { valid: true, cleanPath: normalized };
}

module.exports = {
  validateSafeUrl,
  sanitizeStoragePath,
  isPrivateIp
};
