# SplitCheck

Track shared checks and receipts with friends. SplitCheck never moves money —
it only keeps a running record of who owes what, and lets people mark a
check as paid (or decline it) themselves.

Sign in with email or Google, message your friends, attach a photo of a
receipt (auto-extracted into line items via Claude), and split it. The split
request shows up as a card right in the chat with **Decline** / **Mark as
Paid** buttons. Full transaction history is downloadable as CSV at any time.

## Monorepo layout

```
splitcheck/
  apps/
    mobile/      Expo / React Native app (iOS, Android, web preview)
    backend/     Node.js + Express + PostgreSQL API, Socket.IO realtime
    web/         React + Vite web app (reuses apps/mobile's UI via react-native-web)
  packages/
    core/        Shared types, zod schemas, API client, csv/currency/avatar utils
    ui/          Shared presentational components (used natively by mobile,
                 and via react-native-web by the web app)
```

Plain npm workspaces — no Turborepo/Nx. `packages/*` are consumed as raw
TypeScript source (no build step) by every app.

## Prerequisites

- Node.js 20+
- A local PostgreSQL instance (no Docker required) — create an empty
  `splitcheck` database before running migrations
- (Optional) An [Anthropic API key](https://console.anthropic.com/) to enable
  receipt photo → line-item extraction
- (Optional) A Google OAuth "Web application" client ID from the
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  to enable "Continue with Google" — the same client ID is shared by the
  backend, mobile app, and web app
- (Optional) [Sentry](https://sentry.io) DSNs (one per platform) for error/perf
  monitoring

None of the optional integrations are required to run the app — each one is
simply disabled (no-op) when its env var is left blank.

## Setup

```bash
npm install
```

Then copy the `.env.example` in each app and fill in the values:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/web/.env.example apps/web/.env
```

At minimum, `apps/backend/.env` needs a working `DATABASE_URL` and two random
JWT secrets (the file explains how to generate them).

Run the database migrations once your `DATABASE_URL` is set:

```bash
npm run db:migrate
```

## Running each app

```bash
# Backend API (http://localhost:4000)
npm run dev:backend

# Mobile app (Expo)
npm run dev:mobile

# Web app (http://localhost:5173)
npm run dev:web
```

The mobile app and web app both talk to the backend over `EXPO_PUBLIC_API_URL`
/ `VITE_API_URL` respectively — point both at the same backend instance to
message between a phone and a browser.

## Architecture notes

- **Money is represented in integer cents** everywhere (DB, API, shared
  types) to avoid floating-point rounding bugs.
- **Realtime**: Socket.IO pushes new messages and check status changes to
  every participant's open sessions live, across mobile and web.
- **Receipts**: uploaded photos are stored on local disk under
  `apps/backend/uploads/` and, if `ANTHROPIC_API_KEY` is set, sent to Claude
  to extract a merchant name, line items, and total — pre-filling the split
  composer.
- **No payment processing of any kind.** "Mark as Paid" is a status flag a
  participant sets on their own behalf; SplitCheck never touches real money.
