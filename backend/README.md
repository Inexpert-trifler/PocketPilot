# PocketPilot Backend

> Production-grade SaaS backend for the AI-powered GenZ finance platform.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript (strict) |
| Framework | Express.js |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 + ioredis |
| Queue | BullMQ |
| AI | OpenAI GPT-4o-mini |
| OCR | Tesseract.js |
| PDF | pdf-parse |
| Auth | bcryptjs + JWT |
| Uploads | Multer + Cloudinary |
| Validation | Zod |
| Logging | Winston |
| Security | Helmet + CORS + Rate Limiting |
| Container | Docker + Docker Compose |

---

## Architecture

```
src/
├── config/          # env validation, DB client, Redis client
├── controllers/     # Thin HTTP handlers — delegate to services
├── services/        # Business logic (auth, transactions)
├── routes/          # Express router definitions + middleware binding
├── middleware/       # auth guard, validate, upload, errorHandler
├── validators/      # Zod schemas for every request shape
├── types/           # Shared TypeScript interfaces
├── ai/              # Categorizer (rule+AI) · Insights engine
├── analytics/       # Subscription detector · Budget predictor
├── ocr/             # Tesseract image OCR · PDF text extraction
├── parsers/         # CSV/text transaction parser · Merchant normalizer
├── queues/          # BullMQ queue definitions + job enqueue helpers
├── workers/         # File processing worker · Insight generation worker
├── cache/           # Redis cache utilities (get/set/delete/pattern)
├── utils/           # Logger · Typed errors · API response helpers
├── db/              # Prisma seed script
├── app.ts           # Express app factory (pure, testable)
└── server.ts        # Entrypoint — bootstrap, graceful shutdown
```

---

## API Reference

Base URL: `http://localhost:8080/api/v1`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login, get tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ❌ | Invalidate refresh token |
| GET | `/auth/me` | ✅ | Get current user profile |

### Transactions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/transactions` | ✅ | List with pagination, filters, search |
| POST | `/transactions` | ✅ | Create manual transaction |
| GET | `/transactions/:id` | ✅ | Get single transaction |
| DELETE | `/transactions/:id` | ✅ | Delete transaction |
| GET | `/transactions/analytics` | ✅ | Spending analytics (cached) |
| GET | `/transactions/trends` | ✅ | Monthly trend data |

### Uploads
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/uploads` | ✅ | Upload PDF/CSV/image (multipart) |
| GET | `/uploads` | ✅ | List user uploads |
| GET | `/uploads/:id/status` | ✅ | Poll processing status |

### Insights (AI)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/insights` | ✅ | List active AI insights |
| POST | `/insights/refresh` | ✅ | Trigger manual insight regeneration |
| PATCH | `/insights/:id/read` | ✅ | Mark insight as read |
| PATCH | `/insights/:id/dismiss` | ✅ | Dismiss insight |

### Budgets
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/budgets` | ✅ | Get budgets for month/year |
| POST | `/budgets` | ✅ | Set category budget |
| GET | `/budgets/prediction` | ✅ | AI burn rate & risk prediction |

### Goals
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/goals` | ✅ | List goals with progress enrichment |
| POST | `/goals` | ✅ | Create savings goal |
| PATCH | `/goals/:id` | ✅ | Update goal |
| DELETE | `/goals/:id` | ✅ | Delete goal |

### Subscriptions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/subscriptions` | ✅ | List with monthly cost summary |
| POST | `/subscriptions/detect` | ✅ | Queue subscription re-scan |
| PATCH | `/subscriptions/:id/toggle` | ✅ | Toggle active/inactive |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Liveness check |

---

## Quick Start

### Option A — Docker (recommended)

```bash
cd backend
cp .env.example .env   # Fill in OPENAI_API_KEY, JWT secrets
docker-compose up -d
```

Runs Postgres + Redis + the API. Visit http://localhost:8080/health.

### Option B — Local Dev

**Prerequisites:** Node 20+, PostgreSQL 16, Redis 7

```bash
cd backend
npm install
cp .env.example .env    # Fill in values

# Setup database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations
npm run db:seed         # Seed with demo data

# Start dev server (hot reload)
npm run dev
```

Demo credentials after seed:
- **Email:** `demo@pocketpilot.app`
- **Password:** `Demo@1234`

---

## File Upload Pipeline

```
POST /api/v1/uploads
      │
      ├─ Multer validates MIME type + size
      ├─ Upload to Cloudinary
      ├─ Create Upload record (status: PENDING)
      └─ Enqueue BullMQ job
            │
            ▼ (background worker)
      ┌─────────────────────────┐
      │ 1. Download from storage│
      │ 2. OCR / PDF / CSV parse│
      │ 3. Extract transactions  │
      │ 4. Normalize merchants   │
      │ 5. AI categorize (batch) │
      │ 6. Persist to DB         │
      │ 7. Mark status: COMPLETE │
      │ 8. Trigger insights job  │
      └─────────────────────────┘

Poll status: GET /api/v1/uploads/:id/status
```

---

## Security Model

- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Refresh tokens stored in DB sessions table — can be revoked
- bcrypt password hashing (12 rounds)
- Helmet security headers on all responses
- CORS locked to `CLIENT_URL` env var
- Rate limiting: 100 req/15min global, 10 req/15min on auth routes
- Zod input validation on every endpoint
- File MIME type whitelist enforcement
- Non-root Docker user in production

---

## Environment Variables

See [`.env.example`](.env.example) for the full list.

**Required for production:**
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_ACCESS_SECRET` — min 32 chars
- `JWT_REFRESH_SECRET` — min 32 chars
- `OPENAI_API_KEY` — starts with `sk-`
- `CLIENT_URL` — your Next.js frontend URL
- `CLOUDINARY_*` — Cloudinary account credentials
