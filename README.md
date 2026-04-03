# Beer Recommender

An Astro-based web application that recommends beers using Untappd user history. Built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Untappd Integration** — Fetch public user history via Untappd API (client_id/secret or OAuth 2.0)
- **Recommendation Engine** — Content-based beer recommender with configurable weights and human-readable explanations
- **i18n** — Full Spanish/English support with Astro routing
- **Responsive UI** — Mobile-first design with Tailwind CSS and shadcn/ui components
- **E2E Tests** — Playwright test suite covering all user flows
- **Docker Ready** — Multi-stage build with `oven/bun:1-slim`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 3 + shadcn/ui |
| State | TanStack Query |
| Validation | Zod |
| Testing | Playwright |
| Runtime | Bun |
| Container | Docker (multi-stage) |

## Architecture

```
src/
├── adapters/          # Untappd API client + data normalizers
├── components/        # React components + shadcn/ui
│   └── untappd/       # Untappd-specific UI (app, input, history)
├── domain/            # Domain models (Beer, Checkin, UserProfile, Recommendation)
├── engine/            # Recommendation engine (scoring, config, style families)
├── hooks/             # React hooks (useUntappdApi)
├── i18n/              # Translations (en.json, es.json) + helpers
├── layouts/           # Astro layouts
├── lib/               # Utilities (cn helper)
├── mocks/             # Test data + Untappd mock data
├── pages/             # Astro pages + API routes
│   ├── api/           # /api/untappd/* endpoints
│   ├── auth/          # OAuth callback
│   └── beer/          # Beer detail page
├── services/          # Business logic (userHistoryService, OAuth)
└── styles/            # Global CSS
```

## Getting Started

### Prerequisites

- **Bun** (1.x)
- **Node.js** 18+ (if not using Bun)

### Setup

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start dev server
bun run dev
```

### Environment Variables

```env
# Untappd API (required)
UNTAPPD_CLIENT_ID=your_client_id
UNTAPPD_CLIENT_SECRET=your_client_secret

# OAuth (optional, for authenticated user flows)
UNTAPPD_REDIRECT_URL=http://localhost:4321/auth/untappd/callback

# Testing (set to "true" to use mock data)
USE_UNTAPPD_MOCK=true
```

## Scripts

```bash
bun run dev          # Start dev server (localhost:4321)
bun run build        # Production build
bun run preview      # Preview production build
bun run test:e2e     # Run Playwright tests (headless)
bun run test:e2e:ui  # Run Playwright tests (interactive UI)
```

## Recommendation Engine

The engine uses a deterministic, content-based scoring system with five signals:

| Signal | Weight | Description |
|---|---|---|
| `styleSimilarity` | 0.35 | How similar the candidate's style is to the selected beer |
| `historyAffinity` | 0.30 | How well the candidate matches the user's historical preferences |
| `abvMatch` | 0.15 | How close the ABV is to the selected beer and user's preferred range |
| `brewerySimilarity` | 0.10 | Same brewery or country bonus |
| `novelty` | 0.10 | Rewards new beers while avoiding already-consumed ones |

Weights are configurable in `src/engine/config.ts`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/untappd/user/:username` | Get user profile and check-ins |
| `POST` | `/api/untappd/recommend` | Get beer recommendations |
| `GET` | `/api/untappd/authenticated-user` | Get authenticated user data (OAuth) |
| `GET` | `/auth/untappd` | Start OAuth flow |
| `GET` | `/auth/untappd/callback` | OAuth callback handler |

## Docker

```bash
# Build
docker build -t recommender .

# Run
docker run -p 4321:4321 \
  -e UNTAPPD_CLIENT_ID=xxx \
  -e UNTAPPD_CLIENT_SECRET=xxx \
  -e UNTAPPD_REDIRECT_URL=http://localhost:4321/auth/untappd/callback \
  recommender
```

## Testing

```bash
# All tests (chromium + mobile)
bun run test:e2e

# Chromium only
bun run test:e2e --project=chromium

# Interactive UI
bun run test:e2e:ui

# Single test file
bunx playwright test tests/e2e/untappd.spec.ts
```

Tests use Playwright with mock Untappd data. The dev server runs with `TEST_MODE=true` and `USE_UNTAPPD_MOCK=true` during test execution.

## i18n

The app supports English (`en`) and Spanish (`es`). Routes:

- `/` → English (default)
- `/es` → Spanish

Translation files are in `src/i18n/en.json` and `src/i18n/es.json`.

## License

MIT
