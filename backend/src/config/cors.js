function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || "http://localhost:3000";
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

function isOriginAllowed(origin, allowed) {
  if (!origin) return true;
  if (allowed.includes(origin)) return true;
  if (allowed.includes("*")) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }
  return false;
}

function createCorsOptions() {
  const allowed = parseAllowedOrigins();
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowed)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  };
}

module.exports = { createCorsOptions, parseAllowedOrigins };
