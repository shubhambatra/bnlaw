# bnlaw

A full-stack monolithic repository built with React, Node.js, and TypeScript. Runs natively or via Docker (recommended for Windows).

## Overview

This repo contains both the frontend and backend in a single codebase, sharing types and utilities across the stack. The frontend is a React SPA; the backend is a Node.js/Express API server. TypeScript is used end-to-end.

## Project Structure

```
bnlaw/
├── client/               # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── main.tsx
│   ├── public/
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── server/               # Node.js backend (TypeScript)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── shared/               # Shared types and utilities
│   └── types/
├── docker-compose.yml    # Orchestrates all services
├── docker-compose.dev.yml
├── .env.example
├── package.json          # Root workspace config
└── tsconfig.base.json
```

## Prerequisites

### Docker (recommended — works on Windows, Mac, Linux)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) v24+

### Local (native)

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+ or [yarn](https://yarnpkg.com/) v1.22+

## Getting Started

Copy the environment file:

```bash
cp .env.example .env
```

---

### Running with Docker

**Development** (hot-reload for both client and server):

```bash
docker compose -f docker-compose.dev.yml up
```

| Service | URL |
|---|---|
| React client | http://localhost:5173 |
| Node API | http://localhost:3000 |

**Production build:**

```bash
docker compose up --build
```

**Stop all services:**

```bash
docker compose down
```

**Rebuild after dependency changes:**

```bash
docker compose up --build
```

---

### Running Locally (without Docker)

Install dependencies from the root:

```bash
npm install
```

**Development** (client + server in watch mode):

```bash
npm run dev
```

Or run them individually:

```bash
npm run dev:client   # React dev server — http://localhost:5173
npm run dev:server   # Node API server   — http://localhost:3000
```

**Build:**

```bash
npm run build          # Build both client and server
npm run build:client
npm run build:server
```

**Start (production):**

```bash
npm start
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start client and server in watch mode |
| `npm run build` | Compile TypeScript and bundle both packages |
| `npm start` | Run the production server |
| `npm test` | Run all tests |
| `npm run lint` | Lint the entire codebase with ESLint |
| `npm run typecheck` | Run `tsc --noEmit` across all packages |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Shared | TypeScript types, utility functions |
| Containerization | Docker, Docker Compose |
| Linting | ESLint, Prettier |
| Testing | Vitest (client), Jest (server) |

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the API server listens on (default: `3000`) |
| `CLIENT_URL` | Allowed CORS origin for the frontend |
| `DATABASE_URL` | Database connection string |

## Contributing

1. Branch from `master` — use the format `feat/<short-description>` or `fix/<short-description>`.
2. Run `npm run typecheck` and `npm run lint` before opening a PR.
3. Keep client and server changes in separate commits where possible.

## License

MIT
# bnlaw
