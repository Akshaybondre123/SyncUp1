"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createFeed } from "@/lib/api";
import { markSeen } from "@/lib/socket";
import type { FeedCategory } from "@/types/feed";

const categories: FeedCategory[] = [
  "motivation",
  "technique",
  "mindset",
  "recovery",
];

export default function AdminPage() {
  const router = useRouter();
  const [coachName, setCoachName] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<FeedCategory>("motivation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const feed = await createFeed({ coachName, message, category });
      markSeen(feed.id);
      setSuccess("Feed posted! It will appear on the home page in realtime.");
      setCoachName("");
      setMessage("");
      setCategory("motivation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post feed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Add Coaching Post</h1>
        <p>Publish a new tip to the live feed</p>
      </header>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="coachName">Coach name</label>
          <input
            id="coachName"
            type="text"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
            placeholder="e.g. Coach Sarah"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share a coaching tip…"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedCategory)}
            disabled={loading}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Posting…" : "Post to Feed"}
        </button>

        <button
          type="button"
          className="submit-btn"
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            marginTop: "-0.5rem",
          }}
          onClick={() => router.push("/")}
        >
          View Feed
        </button>
      </form>
    </>
  );
}
