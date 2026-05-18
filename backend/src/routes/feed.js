const express = require("express");
const Feed = require("../models/Feed");
const {
  getCachedFeeds,
  setCachedFeeds,
  invalidateFeedCache,
} = require("../services/cache");

function createFeedRouter(io, cacheTtl) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const cached = await getCachedFeeds();
      if (cached) {
        return res.json({ feeds: cached, source: "cache" });
      }

      const feeds = await Feed.find().sort({ createdAt: -1 }).limit(50).lean();
      const serialized = feeds.map((f) => ({
        id: f._id.toString(),
        coachName: f.coachName,
        message: f.message,
        category: f.category,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      }));

      await setCachedFeeds(serialized, cacheTtl);
      res.json({ feeds: serialized, source: "database" });
    } catch (err) {
      console.error("GET /feed error:", err);
      res.status(500).json({ error: "Failed to fetch feeds" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { coachName, message, category } = req.body;

      if (!coachName?.trim() || !message?.trim()) {
        return res
          .status(400)
          .json({ error: "coachName and message are required" });
      }

      const feed = await Feed.create({
        coachName: coachName.trim(),
        message: message.trim(),
        category: category || "motivation",
      });

      await invalidateFeedCache();

      const payload = feed.toJSON();
      io.emit("feed:new", payload);

      res.status(201).json({ feed: payload });
    } catch (err) {
      console.error("POST /feed error:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Failed to create feed" });
    }
  });

  return router;
}

module.exports = createFeedRouter;
