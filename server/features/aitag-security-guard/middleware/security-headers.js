/**
 * OWASP HTTP Security Headers Middleware
 * Item 2: Cross-site scripting block karo
 * Item 16: Config hygiene & header tightening
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

  // Remove Express fingerprinting
  res.removeHeader('X-Powered-By');

  // Baseline Content Security Policy allowing SPA media & styling
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';"
  );

  next();
}

module.exports = securityHeaders;
