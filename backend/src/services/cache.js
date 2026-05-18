const { getRedis, isRedisEnabled } = require("../config/redis");

const CACHE_KEY = "feed:list";

async function getCachedFeeds() {
  if (!isRedisEnabled()) return null;
  const redis = getRedis();
  const cached = await redis.get(CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
}

async function setCachedFeeds(feeds, ttlSeconds) {
  if (!isRedisEnabled()) return;
  const redis = getRedis();
  await redis.setEx(CACHE_KEY, ttlSeconds, JSON.stringify(feeds));
}

async function invalidateFeedCache() {
  if (!isRedisEnabled()) return;
  const redis = getRedis();
  await redis.del(CACHE_KEY);
}

module.exports = { getCachedFeeds, setCachedFeeds, invalidateFeedCache };
