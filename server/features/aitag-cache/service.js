/**
 * AITAG Fractal Kernel Adaptive Cache Engine — Service
 * Fractal Kernel Slice: aitag-cache
 * ==============================================================================
 * High-performance, zero-dependency in-RAM adaptive cache with:
 * - TTL (Time-To-Live) per entry
 * - LRU (Least-Recently-Used) capacity-bounded eviction
 * - O(1) reverse tag index for instant targeted invalidation
 * - Deterministic ETag hash generation
 * - Live telemetry statistics (hit ratio, eviction count, memory estimate)
 */

const crypto = require('crypto');

class AdaptiveCacheService {
  constructor(options = {}) {
    this.maxCapacity = options.maxCapacity || 5000;
    this.defaultTtlMs = options.defaultTtlMs || 60000; // 60 seconds
    this.entries = new Map();
    this.tagIndex = new Map(); // tag -> Set of keys
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      expirations: 0,
      purges: 0,
      startedAt: new Date().toISOString()
    };

    this.accessCounter = 0;
    this.sweepInterval = setInterval(() => {
      this.sweepExpired();
    }, 60000);
    if (this.sweepInterval.unref) {
      this.sweepInterval.unref();
    }
  }

  /**
   * Generates a deterministic SHA-256 ETag from payload
   */
  generateEtag(data) {
    try {
      const serialized = typeof data === 'string' ? data : JSON.stringify(data);
      const hash = crypto.createHash('sha256').update(serialized).digest('hex').slice(0, 16);
      return `"${hash}"`;
    } catch {
      return `"${Date.now()}"`;
    }
  }

  /**
   * Retrieves an item from cache. Returns entry object with value and etag, or null.
   */
  get(key) {
    if (!this.entries.has(key)) {
      this.stats.misses++;
      return null;
    }

    const entry = this.entries.get(key);
    const now = Date.now();

    // Lazy expiration
    if (now > entry.expiresAt) {
      this.del(key);
      this.stats.expirations++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    entry.hitCount++;
    entry.lastAccessedAt = now;
    entry.accessCounter = ++this.accessCounter;
    // Refresh Map insertion order for LRU
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry;
  }

  /**
   * Stores an item with TTL and optional tags.
   */
  set(key, value, options = {}) {
    const now = Date.now();
    const ttlMs = options.ttlMs !== undefined ? options.ttlMs : this.defaultTtlMs;
    const expiresAt = now + ttlMs;
    const rawTags = Array.isArray(options.tags) ? options.tags : (options.tags ? [options.tags] : []);
    const tags = new Set(rawTags.map(t => String(t).trim()).filter(Boolean));

    // LRU eviction if at max capacity and key is new
    if (this.entries.size >= this.maxCapacity && !this.entries.has(key)) {
      this.evictLRU();
    }

    // Clean up old tag index entries if updating existing key
    if (this.entries.has(key)) {
      const oldEntry = this.entries.get(key);
      for (const oldTag of oldEntry.tags) {
        const keySet = this.tagIndex.get(oldTag);
        if (keySet) {
          keySet.delete(key);
          if (keySet.size === 0) this.tagIndex.delete(oldTag);
        }
      }
    }

    const etag = options.etag || this.generateEtag(value);

    const entry = {
      key,
      value,
      expiresAt,
      ttlMs,
      tags,
      etag,
      createdAt: now,
      lastAccessedAt: now,
      accessCounter: ++this.accessCounter,
      hitCount: 0
    };

    this.entries.set(key, entry);

    // Update reverse tag index
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag).add(key);
    }

    this.stats.sets++;
    return entry;
  }

  /**
   * Deletes a single key and cleans up its tag index mappings.
   */
  del(key) {
    if (!this.entries.has(key)) return false;

    const entry = this.entries.get(key);
    for (const tag of entry.tags) {
      const keySet = this.tagIndex.get(tag);
      if (keySet) {
        keySet.delete(key);
        if (keySet.size === 0) this.tagIndex.delete(tag);
      }
    }

    return this.entries.delete(key);
  }

  /**
   * O(1) reverse-lookup tag invalidation.
   * Evicts all keys associated with a specific tag (e.g. 'packages', 'tasks', 'user:client1@aitag.com').
   */
  invalidateByTag(tag) {
    const keySet = this.tagIndex.get(tag);
    if (!keySet || keySet.size === 0) return 0;

    let count = 0;
    // Copy keys array because del modifies keySet
    const keysToDelete = Array.from(keySet);
    for (const key of keysToDelete) {
      if (this.del(key)) {
        count++;
      }
    }

    this.tagIndex.delete(tag);
    this.stats.purges++;
    return count;
  }

  /**
   * Pattern-based invalidation (e.g. 'tasks:*' or /orders/i).
   */
  invalidateByPattern(pattern) {
    const regex = pattern instanceof RegExp 
      ? pattern 
      : new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    
    let count = 0;
    for (const key of this.entries.keys()) {
      if (regex.test(key)) {
        if (this.del(key)) count++;
      }
    }

    this.stats.purges++;
    return count;
  }

  /**
   * Evicts least-recently-used item to preserve capacity limits.
   */
  evictLRU() {
    let oldestKey = null;
    let oldestOrder = Infinity;

    for (const [key, entry] of this.entries.entries()) {
      const order = entry.accessCounter !== undefined ? entry.accessCounter : entry.lastAccessedAt;
      if (order < oldestOrder) {
        oldestOrder = order;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.del(oldestKey);
      this.stats.evictions++;
      return oldestKey;
    }
    return null;
  }

  /**
   * Active sweep for expired entries.
   */
  sweepExpired() {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.expiresAt) {
        this.del(key);
        this.stats.expirations++;
        count++;
      }
    }
    return count;
  }

  /**
   * Clears entire cache.
   */
  clear() {
    const count = this.entries.size;
    this.entries.clear();
    this.tagIndex.clear();
    this.stats.purges++;
    return count;
  }

  /**
   * Telemetry and observability metrics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests === 0 ? 1.0 : Number((this.stats.hits / totalRequests).toFixed(4));
    
    return {
      success: true,
      service: 'aitag-cache',
      status: 'active',
      keysCount: this.entries.size,
      maxCapacity: this.maxCapacity,
      activeTagsCount: this.tagIndex.size,
      tags: Array.from(this.tagIndex.keys()),
      metrics: {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRatio,
        sets: this.stats.sets,
        evictions: this.stats.evictions,
        expirations: this.stats.expirations,
        purges: this.stats.purges,
        startedAt: this.stats.startedAt
      }
    };
  }
}

const defaultCache = new AdaptiveCacheService();
defaultCache.AdaptiveCacheService = AdaptiveCacheService;

module.exports = defaultCache;
