SyncUp
A realtime coaching feed app. Backend is Express + MongoDB + Redis + Socket.IO, frontend is Next.js.
What it does

GET /feed → pulls from Redis cache, falls back to MongoDB
POST /feed → saves to DB, clears cache, pushes live update to all open tabs
Frontend shows the feed live without refreshing

Requirements

Node.js 18+
Docker

How to run
bash# start mongo and redis
docker compose up -d

# install everything
npm run install:all

# run backend
npm run dev:backend

# run frontend (separate terminal)
npm run dev:frontend
Go to http://localhost:3000 to see the feed, http://localhost:3000/admin to post.
API

GET /health — health check
GET /feed — list posts
POST /feed — create a post

json{
  "coachName": "Coach Sarah",
  "message": "Focus on form over speed.",
  "category": "technique"
}
Categories: motivation, technique, mindset, recovery
Testing live updates
Open the home page in two tabs, open admin in a third, post something — both tabs update instantly.
