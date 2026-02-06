# GWI Platform Replica

A faithful replica of the GWI (GlobalWebIndex) platform UI, built with React and TypeScript. Ships with a complete mock data layer so the entire application runs without any backend or API credentials.

## Prerequisites

- Node.js 18+
- npm

## Quick Start

```bash
git clone <repo-url>
cd gwi-platform-replica
npm install
npm run dev
```

The app opens at **http://localhost:3008**. No `.env` file is needed — mock mode is enabled by default.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_USE_MOCK` | `true` | Enable mock data layer. Set to `"false"` to hit the real API. |
| `VITE_GWI_API_BASE_URL` | — | Base URL for the GWI API (only when mock is off) |
| `VITE_GWI_API_TOKEN` | — | API bearer token (only when mock is off) |
| `VITE_GWI_API_KEY` | — | API key (only when mock is off) |

Copy `.env.example` to `.env` and fill in values when switching to the real API.

## Mock vs Real API

The app defaults to **mock mode** (`VITE_USE_MOCK=true`). Every API hook returns realistic fixture data so all pages render immediately with no external dependencies.

To switch to the real GWI API:

1. Copy `.env.example` to `.env`
2. Set `VITE_USE_MOCK=false`
3. Fill in `VITE_GWI_API_BASE_URL`, `VITE_GWI_API_TOKEN`, and `VITE_GWI_API_KEY`
4. Restart the dev server

## Project Structure

```
src/
├── api/
│   ├── client.ts          # Ky-based HTTP client
│   ├── endpoints/         # Real API endpoint definitions
│   ├── mock/
│   │   ├── data/          # Mock fixture data per domain
│   │   └── endpoints/     # Mock endpoint implementations
│   └── types/             # Shared TypeScript types
├── components/
│   ├── auth/              # ProtectedRoute wrapper
│   ├── layout/            # AppLayout, Sidebar
│   ├── shared/            # Button, DataTable, Modal, Tabs, etc.
│   └── ...                # Feature-specific components (chart/, dashboard/, etc.)
├── hooks/                 # TanStack Query hooks (useAudiences, useCharts, …)
├── pages/
│   ├── app/               # Lazy-loaded authenticated pages
│   └── auth/              # Sign-in, sign-up, password recovery
├── stores/                # Zustand stores (auth, ui, workspace)
└── utils/                 # Formatting, chart colors, audience expressions
```

## Pages

### Auth (public)

| Route | Page |
|---|---|
| `/` | Sign in |
| `/sign-up` | Sign up |
| `/cant-login` | Login help |
| `/password-recovery` | Forgot password |
| `/resend-confirmation` | Resend confirmation email |

### App (authenticated, lazy-loaded)

| Route | Page |
|---|---|
| `/app` | Home dashboard |
| `/app/agent-spark` | Agent Spark AI chat |
| `/app/audiences` | Saved audiences list |
| `/app/audiences/new` | Create audience |
| `/app/audiences/:id` | Audience detail |
| `/app/chart-builder` | Charts list |
| `/app/chart-builder/questions` | Question browser |
| `/app/chart-builder/chart/:id` | Chart detail |
| `/app/crosstabs` | Crosstabs list |
| `/app/crosstabs/new` | Create crosstab |
| `/app/crosstabs/:id` | Crosstab detail |
| `/app/dashboards` | Dashboards list |
| `/app/dashboards/:id` | Dashboard detail |
| `/app/canvas` | Canvas workspace |
| `/app/reports` | Reports list |
| `/app/tv-study` | TV study analysis |
| `/app/printrf` | Print reach & frequency |
| `/app/account-settings` | Account settings |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3008 |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Deployment

The repo includes a `render.yaml` that deploys the app as a static site on Render. Push to the configured branch and Render will build and publish automatically.

## Tech Stack

React 19 · Vite · TypeScript · TanStack Query · Zustand · Recharts · React Router 7 · Ky · Lucide Icons · Zod · React Hook Form
