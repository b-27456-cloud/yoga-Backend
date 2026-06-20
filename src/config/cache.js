/**
 * In-Memory Cache (node-cache)
 * No Redis — Render-compatible.
 * Cache resets on Render restart (acceptable for FYP).
 */

const NodeCache = require('node-cache');

// stdTTL = default TTL in seconds (10 min)
// checkperiod = how often to check for expired keys (2 min)
const cache = new NodeCache({
  stdTTL: 600,          // 10 minutes default
  checkperiod: 120,     // cleanup every 2 minutes
  useClones: false,     // return references for better performance
});

/**
 * Cache helper: get-or-set pattern.
 * If the key exists in cache, return it.
 * Otherwise, call the fetcher function, cache the result, and return it.
 *
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function to fetch the data if not cached
 * @param {number} [ttl] - TTL in seconds (optional, uses default if omitted)
 * @returns {Promise<*>} Cached or freshly fetched data
 */
async function getOrSet(key, fetcher, ttl) {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

/**
 * Invalidate all cache entries matching a prefix.
 * Useful when an admin updates poses and you want to clear all pose caches.
 *
 * @param {string} prefix - Key prefix to match
 */
function invalidateByPrefix(prefix) {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  cache.del(keys);
}

module.exports = { cache, getOrSet, invalidateByPrefix };
