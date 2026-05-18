# SyncUp — Realtime Coaching Feed

A small full-stack app: Express API + MongoDB + Redis cache + Socket.IO, with a Next.js frontend that shows live feed updates without refresh.

## Architecture

```
┌─────────────┐     GET/POST /feed     ┌──────────────┐
│  Next.js    │ ◄────────────────────► │   Express    │
│  Frontend   │     Socket.IO          │   + Socket   │
└─────────────┘                        └──────┬───────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                    MongoDB              Redis cache          feed:new event
                  (persistence)         (GET /feed)         (realtime push)
```

- **GET /feed** — Returns feeds from Redis when cached; otherwise reads MongoDB, caches result, returns `source: "cache" | "database"`.
- **POST /feed** — Validates input, saves to MongoDB, invalidates cache, emits `feed:new` to all connected clients.
- **Frontend** — Home page loads feeds via API and subscribes to Socket.IO; Admin page posts new feeds.

## Bonus features

- **Reconnect handling** — Socket.IO client with infinite reconnection attempts and connection status badge.
- **Duplicate prevention** — `seenIds` Set deduplicates socket events; list state also checks by `id`.
- **Loading / error UI** — Spinners, retry buttons, and form validation feedback.

## Prerequisites

- Node.js 18+
- Docker (for MongoDB + Redis)

## Quick start

```bash
# 1. Start databases
docker compose up -d

# 2. Install dependencies
npm run install:all

# 3. Copy env files (already provided as .env / .env.local)
# backend/.env
# frontend/.env.local

# 4. Run backend (terminal 1)
npm run dev:backend

# 5. Run frontend (terminal 2)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) for the feed and [http://localhost:3000/admin](http://localhost:3000/admin) to add posts.

## API

| Method | Path    | Description                          |
|--------|---------|--------------------------------------|
| GET    | /health | Health check                         |
| GET    | /feed   | List feeds (Redis-cached)            |
| POST   | /feed   | Create feed `{ coachName, message, category? }` |

### POST /feed body

```json
{
  "coachName": "Coach Sarah",
  "message": "Focus on form over speed.",
  "category": "technique"
}
```

Categories: `motivation`, `technique`, `mindset`, `recovery`.

## Project structure

```
syncup/
├── backend/          # Express + MongoDB + Redis + Socket.IO
├── frontend/         # Next.js App Router
├── docker-compose.yml
└── README.md
```

## Testing realtime

1. Open the home page in two browser tabs.
2. Open the admin page in a third tab (or another window).
3. Submit a new post — both home tabs should update instantly without refresh.

## Scalability notes

- Redis cache reduces DB load on read-heavy traffic; TTL is configurable via `CACHE_TTL_SECONDS`.
- Socket.IO can be scaled horizontally with a Redis adapter (not included here, but straightforward to add).
- Feed list is capped at 50 items on GET; pagination can be added for production.
