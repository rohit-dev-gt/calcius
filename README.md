# Calcura — Setup & Deployment Guide

> **Train your mind. Master the numbers.**
> 
> A production-grade mathematics speed training platform for competitive exam aspirants (SSC CGL, IBPS PO, CAT, GMAT, RRB NTPC, NDA).

---

## Prerequisites

- Node.js ≥ 20 LTS
- npm ≥ 9
- Docker + Docker Compose (for local database)
- OR: Supabase account (for hosted PostgreSQL)

---

## Quick Start (Local Development)

### 1. Clone and install
```bash
git clone <your-repo>
cd calcura
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Start local databases
```bash
docker-compose up -d
```
This starts PostgreSQL on port 5432 and Redis on port 6379.

### 4. Run database migrations
```bash
cd apps/api
npm install
npx prisma generate --schema=../../prisma/schema.prisma
npx prisma migrate dev --schema=../../prisma/schema.prisma --name init
```

### 5. Start the backend
```bash
# From apps/api/
npm run dev
# API runs on http://localhost:3001
```

### 6. Start the frontend
```bash
# From apps/web/ (new terminal)
npm run dev
# App runs on http://localhost:5173
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | Random secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Different random secret for refresh tokens |
| `FRONTEND_URL` | Frontend URL for CORS (http://localhost:5173 for dev) |

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Import repo in Vercel
3. Set root directory: `apps/web`
4. Set environment variables:
   - `VITE_API_URL` = `https://your-api.railway.app/api/v1`
5. Deploy

### Backend → Railway

1. Create new project in Railway
2. Add PostgreSQL service
3. Add Redis service
4. Deploy `apps/api` folder
5. Set all environment variables from `.env.example`
6. Run: `npx prisma migrate deploy --schema=../../prisma/schema.prisma`

### Database → Supabase

1. Create project at supabase.com
2. Get your connection string (Settings → Database)
3. Update `DATABASE_URL` in your environment

### Redis → Upstash

1. Create database at upstash.com
2. Get Redis URL (starts with `rediss://`)
3. Update `REDIS_URL` in your environment

---

## Architecture

```
calcura/
├── apps/
│   ├── web/              ← React 18 + Vite + Tailwind CSS
│   └── api/              ← Express + TypeScript + Prisma
├── packages/
│   └── shared/           ← Shared Zod schemas, types, constants
├── prisma/
│   └── schema.prisma     ← PostgreSQL schema (7 models)
└── docker-compose.yml    ← Local dev (Postgres + Redis)
```

### Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS v3, Zustand, React Query v5, React Router v6, Recharts, Framer Motion, React Hook Form + Zod, react-hot-toast

**Backend:** Node.js 20, Express, TypeScript, Prisma ORM, bcryptjs, jsonwebtoken, ioredis, express-rate-limit

**Database:** PostgreSQL 15 (Prisma), Redis (session cache + leaderboard)

---

## Practice Modules (14 total)

| # | Module | Accent |
|---|---|---|
| 1 | Arithmetic (4 ops) | Orange |
| 2 | Squares & Square Roots | Purple |
| 3 | Cubes & Cube Roots | Teal |
| 4 | Multiplication Tables | Blue |
| 5 | Percentages | Green |
| 6 | Fractions & Decimals | Pink |
| 7 | HCF & LCM | Amber |
| 8 | Powers & Exponents | Red |
| 9 | Number Series & Patterns | Cyan |
| 10 | Simplification (BODMAS) | Lime |
| 11 | Averages & Ratios | Rose |
| 12 | Vedic Mathematics | Gold |
| 13 | Approximation & Estimation | Violet |
| 14 | Mock Speed Test | White |

---

## Rank System

| Rank | Avg Time |
|---|---|
| 🌱 Novice | > 25s |
| 📖 Apprentice | 15–25s |
| 🔧 Practitioner | 10–15s |
| 📚 Scholar | 6–10s |
| 🎯 Expert | 3–6s |
| ⚡ Master | 1.5–3s |
| 🧠 Calcura Genius | < 1.5s |

---

## API Routes

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

GET  /api/v1/user/me
GET  /api/v1/user/stats
GET  /api/v1/user/heatmap
GET  /api/v1/user/module/:module
PATCH /api/v1/user/profile
POST /api/v1/user/change-password
GET  /api/v1/user/export
DELETE /api/v1/user/account

POST /api/v1/sessions/start
POST /api/v1/sessions/:id/end
GET  /api/v1/sessions

POST /api/v1/questions/log

GET  /api/v1/leaderboard
GET  /api/v1/leaderboard/rank/me
```

---

## License

MIT — Free to use for personal and commercial projects.
