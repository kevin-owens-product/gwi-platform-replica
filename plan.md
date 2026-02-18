# Plan: Fix blank page — serve built static files

## Root Cause

The preview environment expects **pre-built static files** served from `dist/`, not a live Vite dev server. Evidence:
- `dist/` exists with a production build and a `_redirects` file (Netlify-style SPA routing)
- Vite dev mode serves unbundled ES modules via its own client runtime + HMR websocket — these don't work through the preview proxy
- The HTML loads fine via `curl` but the browser (through the proxy) can't resolve Vite's module graph

## Steps

1. **Kill all existing Vite processes** on any port (3004, 5173, etc.)

2. **Rebuild the app** — run `npx vite build` to generate a fresh `dist/` reflecting any recent code changes

3. **Serve `dist/` with a static file server** — use `npx vite preview --port 3004 --host 0.0.0.0` which serves the production bundle as plain static files that the preview proxy can handle

4. **Verify** — curl the preview port to confirm the built HTML with hashed asset references is being served

5. **For future dev workflow** — after any code changes, re-run `vite build` then restart `vite preview`
