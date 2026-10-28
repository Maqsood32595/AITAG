/**
 * Grandchild Security Layer 2: Sliding-Window Rate Limiter & Anti-Abuse Guard
 * Location: server/features/aitag-security-guard/guards/rate-limiter.js
 */

function createRateLimiter({ windowMs = 60000, max = 100, message = 'Too many requests, please try again later.' }) {
  const hits = new Map();

  // Periodic cleanup of expired windows
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now - record.startTime > windowMs) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 30000)).unref();

  return function rateLimiter(req, res, next) {
    // Test bypass is strictly restricted to test environments
    if (process.env.NODE_ENV === 'test' && req.headers['x-piet-test-bypass'] === 'true') {
      return next();
    }

    const ip = req.ip || (req.app.get('trust proxy') ? req.headers['x-forwarded-for'] : null) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    let record = hits.get(key);
    if (!record || (now - record.startTime > windowMs)) {
      record = { count: 1, startTime: now };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetTime = Math.ceil((record.startTime + windowMs - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (record.count > max) {
      res.setHeader('Retry-After', resetTime);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: resetTime
      });
    }

    next();
  };
}

// Strict limiter for Authentication endpoints (brute-force defense)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login/register attempts per IP per 15 min
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

// General limiter for public API endpoints (DoS defense)
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  message: 'API rate limit exceeded. Please throttle your requests.'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter
};
