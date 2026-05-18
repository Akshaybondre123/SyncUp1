import type { Feed, FeedResponse } from "@/types/feed";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchFeeds(): Promise<FeedResponse> {
  const res = await fetch(`${API_URL}/feed`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch feeds (${res.status})`);
  }
  return res.json();
}

export async function createFeed(data: {
  coachName: string;
  message: string;
  category: string;
}): Promise<Feed> {
  const res = await fetch(`${API_URL}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to create feed (${res.status})`);
  }
  const json = await res.json();
  return json.feed;
}
