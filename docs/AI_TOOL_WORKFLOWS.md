# AI Tool Workflows

Use this guide when you want to run or edit the repo with AI-native coding tools.

## Shared Prerequisites

1. Clone this repository:
   ```bash
   git clone https://github.com/kevin-owens-product/gwi-platform-replica.git
   cd gwi-platform-replica
   ```
2. Install Node.js 18+ and npm.
3. From the repo root, run:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3003`.
6. In default mock mode, the app opens directly without a login step.

## Cursor

1. Open Cursor.
2. Open the folder: `/Users/kevinowens/Documents/gwi-ai/gwi-platform-replica`.
3. Open the built-in terminal and run:
   ```bash
   npm install
   npm run dev
   ```
4. Use Cursor Chat/Agent to work in the repo. Example prompt:
   ```text
   Summarize the app structure, then implement a small UI improvement in one page and run lint.
   ```

## Codex

You can use either Codex desktop app or Codex CLI.

### Codex Desktop App

1. Open Codex.
2. Open the folder: `/Users/kevinowens/Documents/gwi-ai/gwi-platform-replica`.
3. Ask Codex to run setup:
   ```text
   Install dependencies, run the dev server, and verify the app loads on localhost:3003.
   ```
4. Continue with feature requests in natural language.

### Codex CLI

1. In terminal, install and run Codex:
   ```bash
   npm i -g @openai/codex
   cd /Users/kevinowens/Documents/gwi-ai/gwi-platform-replica
   codex
   ```
2. In the Codex session, ask:
   ```text
   Run npm install, then npm run dev, and summarize how to test key user flows.
   ```

## Claude Code

1. Install Claude Code (macOS/Linux/WSL):
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```
   Alternative on macOS:
   ```bash
   brew install --cask claude-code
   ```
2. Start Claude Code in this repository:
   ```bash
   cd /Users/kevinowens/Documents/gwi-ai/gwi-platform-replica
   claude
   ```
3. Ask Claude Code to run setup and checks. Example:
   ```text
   Run npm install, start npm run dev, and give me a quick walkthrough of the important routes.
   ```

## Lovable

Lovable currently does not support importing an existing GitHub repository as a starting point.

Practical workflow for this repo:

1. Run and iterate on this repository locally using Cursor, Codex, or Claude Code.
2. If you want a Lovable version, create a new Lovable project and rebuild selected flows there.
3. Use Lovable GitHub sync for projects created in Lovable.

## Recommended Team Pattern

1. Use this repo as the source of truth for engineering and testing.
2. Use Cursor/Codex/Claude Code for direct code changes in this codebase.
3. Use Lovable for parallel rapid prototypes, then manually port approved changes back.

## Official References

- Cursor quickstart: [https://docs.cursor.com/en/get-started/quickstart](https://docs.cursor.com/en/get-started/quickstart)
- Codex quickstart: [https://developers.openai.com/codex/quickstart](https://developers.openai.com/codex/quickstart)
- Claude Code quickstart: [https://code.claude.com/docs/en/quickstart](https://code.claude.com/docs/en/quickstart)
- Lovable GitHub integration and FAQ: [https://docs.lovable.dev/integrations/github](https://docs.lovable.dev/integrations/github)
