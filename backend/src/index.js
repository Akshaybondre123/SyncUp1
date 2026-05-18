require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { connectDB } = require("./config/db");
const { connectRedis } = require("./config/redis");
const createFeedRouter = require("./routes/feed");

const PORT = process.env.PORT || 4000;
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "60", 10);

async function main() {
  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  app.use(
    cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/feed", createFeedRouter(io, CACHE_TTL));

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id} (${reason})`);
    });
  });

  await connectDB(
    process.env.MONGODB_URI || "mongodb://localhost:27017/syncup"
  );
  await connectRedis(process.env.REDIS_URL || "redis://localhost:6379");

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
