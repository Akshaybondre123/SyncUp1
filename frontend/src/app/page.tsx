"use client";

import { useCallback, useEffect, useState } from "react";
import { FeedCard } from "@/components/FeedCard";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { fetchFeeds } from "@/lib/api";
import {
  connectSocket,
  seedSeenIds,
  type ConnectionStatus,
} from "@/lib/socket";
import type { Feed } from "@/types/feed";

export default function HomePage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"cache" | "database" | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [newFeedIds, setNewFeedIds] = useState<Set<string>>(new Set());

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeeds();
      setFeeds(data.feeds);
      setSource(data.source);
      seedSeenIds(data.feeds.map((f) => f.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  useEffect(() => {
    const disconnect = connectSocket({
      onStatusChange: setConnectionStatus,
      onFeed: (feed) => {
        setFeeds((prev) => {
          if (prev.some((f) => f.id === feed.id)) return prev;
          return [feed, ...prev];
        });
        setNewFeedIds((prev) => new Set(prev).add(feed.id));
        setTimeout(() => {
          setNewFeedIds((prev) => {
            const next = new Set(prev);
            next.delete(feed.id);
            return next;
          });
        }, 600);
      },
    });

    return disconnect;
  }, []);

  return (
    <>
      <header className="page-header">
        <PageHeader connectionStatus={connectionStatus} source={source} />
      </header>

      {loading && <LoadingState />}

      {error && !loading && (
        <div className="state-box error">
          <p>{error}</p>
          <button type="button" onClick={loadFeeds}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && feeds.length === 0 && (
        <EmptyState />
      )}

      {!loading && !error && feeds.length > 0 && (
        <FeedList feeds={feeds} newFeedIds={newFeedIds} />
      )}
    </>
  );
}

function PageHeader({
  connectionStatus,
  source,
}: {
  connectionStatus: ConnectionStatus;
  source: "cache" | "database" | null;
}) {
  return (
    <>
      <div className="header-row">
        <div>
          <h1>Coaching Feed</h1>
          <p>Live tips and motivation from your coaches</p>
        </div>
        <ConnectionBadge status={connectionStatus} />
      </div>
      {source && (
        <p className="cache-hint">
          Loaded from {source === "cache" ? "Redis cache" : "database"}
        </p>
      )}
    </>
  );
}

function LoadingState() {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p>Loading feeds…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="state-box">
      <p>No coaching posts yet. Add one from the Admin page.</p>
    </div>
  );
}

function FeedList({
  feeds,
  newFeedIds,
}: {
  feeds: Feed[];
  newFeedIds: Set<string>;
}) {
  return (
    <div className="feed-list">
      {feeds.map((feed) => (
        <FeedListItem
          key={feed.id}
          feed={feed}
          isNew={newFeedIds.has(feed.id)}
        />
      ))}
    </div>
  );
}

function FeedListItem({ feed, isNew }: { feed: Feed; isNew: boolean }) {
  return (
    <div className={isNew ? "feed-card-new" : ""}>
      <FeedCard feed={feed} />
    </div>
  );
}
