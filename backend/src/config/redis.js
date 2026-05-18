const { createClient } = require("redis");

let client = null;
let redisEnabled = false;

const CONNECT_TIMEOUT_MS = 3000;

async function connectRedis(url) {
  const candidate = createClient({
    url,
    socket: {
      connectTimeout: CONNECT_TIMEOUT_MS,
      reconnectStrategy: false,
    },
  });

  try {
    await Promise.race([
      candidate.connect(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Redis connection timed out")),
          CONNECT_TIMEOUT_MS
        )
      ),
    ]);
    client = candidate;
    redisEnabled = true;
    console.log("Redis connected");
    return client;
  } catch (err) {
    redisEnabled = false;
    try {
      if (candidate.isOpen) await candidate.disconnect();
    } catch {
      /* ignore */
    }
    console.warn(
      `Redis unavailable (${err.message}). Caching disabled — API will still run.`
    );
    console.warn("For Redis cache: docker compose up -d");
    return null;
  }
}

function isRedisEnabled() {
  return redisEnabled && client?.isOpen;
}

function getRedis() {
  if (!isRedisEnabled()) return null;
  return client;
}

module.exports = { connectRedis, getRedis, isRedisEnabled };
