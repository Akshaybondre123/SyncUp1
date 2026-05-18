import type { Feed } from "@/types/feed";

const categoryColors: Record<string, string> = {
  motivation: "#f59e0b",
  technique: "#3b82f6",
  mindset: "#8b5cf6",
  recovery: "#10b981",
};

export function FeedCard({ feed }: { feed: Feed }) {
  const color = categoryColors[feed.category] || "#6b7280";
  const time = new Date(feed.createdAt).toLocaleString();

  return (
    <article className="feed-card">
      <header className="feed-card-header">
        <span className="coach-name">{feed.coachName}</span>
        <span className="category-badge" style={{ background: color }}>
          {feed.category}
        </span>
      </header>
      <p className="feed-message">{feed.message}</p>
      <time className="feed-time" dateTime={feed.createdAt}>
        {time}
      </time>
    </article>
  );
}
