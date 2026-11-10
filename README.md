# PulseBoard SaaS Analytics Dashboard

Production-oriented full-stack dashboard built with React, Vite, Tailwind CSS, TypeScript, and an Express API.

## Stack

- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Express + Helmet + CORS + Zod
- Language: TypeScript (frontend and backend)

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
copy .env.example .env
```

3. Start frontend and backend together:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:8787`.

## API endpoints

- `GET /api/health` health check
- `GET /api/dashboard` dashboard payload
- `GET /api/accounts?q=<search>` account search

## Access flow

The app opens with a responsive sign-in/register experience backed by Supabase Auth. Form validation, password visibility controls, email-confirmation handling, persistent Supabase sessions, and dashboard sign-out are included.

Create a Supabase project, enable Email/Password auth, and copy the project URL and public anon key into `.env`. Configure the Supabase redirect URL for your local and deployed frontend origins.

The Express API accepts Supabase bearer tokens. Set `SUPABASE_URL`, `SUPABASE_SERVER_KEY`, and `REQUIRE_AUTH=true` for a protected deployment. Keep the publishable key public; never expose the server secret key in the frontend.

## Live dashboard data

The dashboard no longer reads hardcoded metrics. Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor, then load your business data into these tables:

- `dashboard_metrics`: KPI values and period deltas
- `revenue_snapshots`: monthly MRR and churn
- `acquisition_sources`: signup attribution totals
- `accounts`: customer accounts, ARR, seats, and plans
- `workspace_users`: dashboard users and roles
- `activity_events`: recent account activity
- `security_settings`: workspace security configuration
- `notifications`: workspace notifications

Empty tables produce empty states and zero rows rather than fabricated values. The API reads these tables using the server-only Supabase key.

## Build and ship

```bash
npm run build:all
```

This compiles the API to `dist-server` and builds the frontend bundle to `dist`.

Run the production artifact locally:

```bash
npm start
```

The Express server serves both the API and the built frontend at `http://localhost:8787`.

Build and run with Docker:

```bash
docker build -t pulseboard .
docker run --env ALLOWED_ORIGIN=http://localhost:8787 -p 8787:8787 pulseboard
```

The container exposes port `8787` and includes only production dependencies in its runtime image.

## Production notes

- Set `ALLOWED_ORIGIN` to your deployed frontend origin.
- Set `VITE_API_BASE_URL` in frontend environment to your deployed API URL.
- `VITE_API_BASE_URL` can remain empty when the API and frontend share the same origin.
- Use `/api/health` as the platform health/readiness probe.
- Place the service behind a reverse proxy or managed platform with TLS.
- The current data layer is in-memory demo data; replace it with a persistent database before multi-instance deployment.
