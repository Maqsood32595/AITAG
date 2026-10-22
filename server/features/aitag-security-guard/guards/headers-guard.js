/**
 * Grandchild Security Layer 1: HTTP Security Headers & CSP Guard
 * Location: server/features/aitag-security-guard/guards/headers-guard.js
 */

function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Enable Browser XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable Flash/PDF cross-domain embedding
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Restrict download actions in older browsers
  res.setHeader('X-Download-Options', 'noopen');

  // Remove Express fingerprinting
  res.removeHeader('X-Powered-By');

  // Strict Transport Security (HSTS) when on HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Baseline Content Security Policy allowing SPA media, fonts, and styling
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';"
  );

  next();
}

module.exports = securityHeaders;
