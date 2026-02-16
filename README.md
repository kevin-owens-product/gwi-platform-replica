# GWI Platform Replica

A React + TypeScript replica of the GWI platform, intended for internal "vibe coding" experiments with both technical and non-technical users.

The app runs fully in mock mode by default, so no backend setup is required.

## What This Repo Is For

- Run a realistic product UI locally for demos and AI-assisted prototyping.
- Let users test changes safely without production dependencies.
- Practice prompt-driven feature work against an existing codebase.

## 5-Minute Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/kevin-owens-product/gwi-platform-replica.git
   cd gwi-platform-replica
   ```
2. Install Node.js 18+.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3003](http://localhost:3003).
6. You will be redirected straight to the app in default mock mode (no login required).

## Documentation

- Setup and onboarding for all users: `docs/GETTING_STARTED.md`
- AI tool workflows (Cursor, Codex, Claude Code, Lovable): `docs/AI_TOOL_WORKFLOWS.md`
- Product enhancement reference plan: `docs/reference/PRODUCT_ENHANCEMENT_PLAN.md`
- Data Explorer product/implementation plan: `docs/reference/DATA_EXPLORER_IMPLEMENTATION_PLAN.md`

## Common Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start local development server on port `3003` |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint checks |

## Environment Variables

Copy `.env.example` to `.env` only if you need to override defaults.

| Variable | Default | Meaning |
|---|---|---|
| `VITE_USE_MOCK` | `true` | Uses local mock API/data when `true` |
| `VITE_GWI_API_BASE_URL` | `https://api.globalwebindex.com` | Real API base URL (only when mock is disabled) |
| `VITE_GWI_API_TOKEN` | `your_token_here` | Bearer token for real API mode |
| `VITE_GWI_API_KEY` | `your_api_key_here` | API key for real API mode |

## Mock vs Real API

Default behavior is mock mode.

To use the real API:

1. Create `.env` from `.env.example`.
2. Set `VITE_USE_MOCK=false`.
3. Fill in valid API credentials.
4. Restart the dev server.

## Tech Stack

React 19, Vite, TypeScript, TanStack Query, Zustand, React Router 7, Recharts.
