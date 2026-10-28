/**
 * AITAG Fractal Kernel Adaptive Cache Engine — HTTP Cache Guard Middleware
 * Fractal Kernel Slice: aitag-cache
 * ==============================================================================
 * Intercepts idempotent HTTP GET requests:
 * - Generates and evaluates HTTP ETags
 * - Handles 'If-None-Match' to return 304 Not Modified (0 bytes body transferred)
 * - Emits X-Cache: HIT / MISS telemetry headers
 * - Supports public and user-isolated scopes with dynamic tag attachments
 */

const cacheService = require('../service');

function cacheGuard(options = {}) {
  const ttlMs = options.ttlMs || 60000;
  const scope = options.scope || 'public'; // 'public' | 'user'
  const staticTags = Array.isArray(options.tags) ? options.tags : (options.tags ? [options.tags] : []);

  return function (req, res, next) {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Optional condition check
    if (typeof options.condition === 'function' && !options.condition(req)) {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (typeof options.keyGenerator === 'function') {
      cacheKey = options.keyGenerator(req);
    } else if (scope === 'user') {
      const userIdent = req.user?.id || req.user?.email || 'anon';
      cacheKey = `user:${userIdent}:${req.originalUrl}`;
    } else {
      cacheKey = `pub:${req.originalUrl}`;
    }

    // 1. Check cache
    const cached = cacheService.get(cacheKey);

    if (cached) {
      // Check HTTP 304 Not Modified
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && (ifNoneMatch === cached.etag || ifNoneMatch === `W/${cached.etag}`)) {
        res.setHeader('X-Cache', 'HIT-304');
        res.setHeader('ETag', cached.etag);
        return res.status(304).end();
      }

      const remainingSecs = Math.max(1, Math.round((cached.expiresAt - Date.now()) / 1000));
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('ETag', cached.etag);
      res.setHeader('Cache-Control', `${scope === 'user' ? 'private' : 'public'}, max-age=${remainingSecs}`);

      return res.json(cached.value);
    }

    // 2. Cache Miss: Intercept response to store
    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = function (body) {
      // Only cache successful 200 responses
      if (res.statusCode === 200 && body !== undefined && body !== null) {
        // Resolve dynamic tags
        let dynamicTags = [];
        if (typeof options.tags === 'function') {
          try {
            dynamicTags = options.tags(req, body) || [];
          } catch {}
        }
        const resolvedTags = [...staticTags, ...dynamicTags];
        if (scope === 'user' && req.user?.email) {
          resolvedTags.push(`user:${req.user.email.toLowerCase()}`);
        }

        const entry = cacheService.set(cacheKey, body, {
          ttlMs,
          tags: resolvedTags
        });

        if (entry && entry.etag) {
          res.setHeader('ETag', entry.etag);
          const maxAgeSecs = Math.round(ttlMs / 1000);
          res.setHeader('Cache-Control', `${scope === 'user' ? 'private' : 'public'}, max-age=${maxAgeSecs}`);
        }
      }

      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  cacheGuard,
  cacheService
};
