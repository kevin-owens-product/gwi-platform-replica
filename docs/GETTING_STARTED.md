# Getting Started

This guide is written for both non-technical testers and engineers.

## Step 1: Get the Code (Required)

If you do not have the project on your machine yet, run:

```bash
git clone https://github.com/kevin-owens-product/gwi-platform-replica.git
cd gwi-platform-replica
```

## Choose Your Path

- Non-technical user: follow **Path A**.
- Technical user: follow **Path B**.
- AI tool users (Cursor, Codex, Claude Code, Lovable): see `docs/AI_TOOL_WORKFLOWS.md`.

---

## Path A: Non-Technical User (Run + Explore)

### 2. One-time setup

1. Install Node.js 18 or newer from [https://nodejs.org](https://nodejs.org).
2. In Terminal, from the `gwi-platform-replica` folder, run:
   ```bash
   npm install
   ```

### 3. Start the app

Run:

```bash
npm run dev
```

Open [http://localhost:3003](http://localhost:3003).

You should land directly in the app in default mock mode (no login needed).

### 4. Try these flows

- Open `Agent Spark` and test prompt-based interactions.
- Create or edit an audience.
- Build a chart and switch chart types.
- Open dashboards and reports.

### 5. End your session

Press `Ctrl + C` in Terminal to stop the app.

---

## Path B: Technical User (Develop + Extend)

### 2. Install and run

```bash
npm install
npm run dev
```

### 3. Quality checks

```bash
npm run lint
npm run build
npm run preview
```

### 3. Core structure

- `src/pages`: route-level pages.
- `src/components`: shared and feature components.
- `src/hooks`: TanStack Query hooks.
- `src/api/endpoints`: real API calls.
- `src/api/mock`: mock API/data used by default.
- `src/stores`: Zustand state stores.

### 4. Mock and real API modes

- Default: `VITE_USE_MOCK=true` (no backend needed).
- Real API mode:
  1. Copy `.env.example` to `.env`
  2. Set `VITE_USE_MOCK=false`
  3. Fill credentials
  4. Restart server

---

## Suggested Vibe-Coding Workflow

1. Pick one user-visible change.
2. Ask the AI for a small implementation plan.
3. Implement in one feature area (`pages`, `components`, or `hooks`).
4. Run `npm run lint` and `npm run build`.
5. Manually verify the updated flow in the browser.

---

## Troubleshooting

### Port already in use

Vite uses port `3003` with `strictPort=true`. Free the port or update `server.port` in `vite.config.ts`.

### "Command not found: npm"

Install Node.js from [https://nodejs.org](https://nodejs.org), then reopen Terminal.

### Dependency issues

Delete local install artifacts and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Blank or broken screens

- Confirm you are running `npm run dev`.
- Check browser console for errors.
- Run `npm run lint` for obvious code issues.
