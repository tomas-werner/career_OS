# Career OS

Local-first personal Career OS: evidence-backed master profile, deterministic
job scoring, controlled CV/cover-letter generation, an enforced application
state machine, n8n automation and an immutable audit trail.

> **AI proposes. Deterministic code validates and decides. Humans authorize
> external actions.**

The full product plan lives in [plan.md](./plan.md).

## Stack

- pnpm monorepo, TypeScript strict
- Next.js 15 (App Router) — apps/web
- Direct PostgreSQL (pg) + Neon PostgreSQL (`POSTGRES_URL`)
- NVIDIA-hosted LLMs for extraction/tailoring (`nvidia_api_key`)
- n8n (self-hosted, Docker) + nginx reverse proxy
- Vitest

## Repository layout

```
apps/web        Next.js app (UI + Application API)
packages/db     PostgreSQL client, types, utilities
packages/shared Deterministic primitives: hashes, normalization, state machine
infra/          Dockerfile context, nginx, scripts (backup, smoke)
docs/architecture  ADRs
n8n/            Workflow catalogue and fixtures (later stages)
```

## Getting started

Prerequisites: Node >= 22, pnpm, Docker (for n8n), pg_dump on PATH for
backups.

```bash
# 1. Configure environment
cp .env.example .env   # fill POSTGRES_URL, nvidia_api_key, N8N_ENCRYPTION_KEY

# 2. Install
pnpm install

# 3. Database (Neon PostgreSQL)
# Use Neon dashboard or MCP tools to create tables based on packages/db/client/types.ts
# Run seed scripts manually or via the Neon dashboard

# 4. Dev server
pnpm dev           # http://localhost:3000

# 5. Full stack (web + n8n + nginx proxy)
docker compose up --build
```

## Health endpoints (plan.md section 50)

| Endpoint          | Purpose                              |
| ----------------- | ------------------------------------ |
| `GET /api/health` | Web + database connectivity          |
| `GET /api/health/db` | Database latency check            |
| `GET /api/health/n8n` | n8n reachability (proxy: `/health/n8n`) |

```bash
node infra/scripts/smoke.mjs http://localhost:3000
```

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `pnpm build`   | Build all packages                   |
| `pnpm typecheck` | TypeScript check across workspaces |
| `pnpm lint`    | ESLint across workspaces             |
| `pnpm test`    | Vitest unit tests                    |
| `pnpm smoke`   | Health endpoint smoke test           |

## Stage status

- [~] **Stage A — Foundation** (in progress, code complete):
  - [x] pnpm monorepo + TypeScript strict (Agent 01)
  - [x] ADRs 001–005 (Agent 00)
  - [x] Direct PostgreSQL connection with pg library for Neon
  - [x] Database types and utilities (Agent 02)
  - [x] Next.js app, dashboard, §40 placeholder pages, health endpoints
  - [x] Zod-validated API routes (jobs, applications + state machine)
  - [x] Docker Compose stack (web + n8n + proxy) — runtime verification pending
  - [ ] pnpm install script approval, database setup against Neon
  - [ ] `docker compose up` acceptance, green typecheck/lint/test/build
  - [ ] Authentication/security baseline (Agent 03) not yet started
- [ ] Stage B — Knowledge layer (Master Profile UI, Evidence, Claims)
- [ ] Stage C — Job intelligence (ingestion, AI extraction, scoring)
- [ ] Stage D — Documents (CV, cover letters, provenance)
- [ ] Stage E — Application pipeline (state machine UI)
- [ ] Stage F — Automation (n8n workflows, fixtures)
- [ ] Stage G — Communications (Gmail approval pipeline)
- [ ] Stage H — Governance (audit UI, observability, regression suite)

## Security notes

- Never commit `.env`. Real keys live only there.
- `AuditLog` is append-only; UPDATE/DELETE are blocked at the database level.
- Untrusted text (job descriptions, emails) is always treated as data, never
  as instructions.
- File uploads (later stages): MIME/extension validation, size limits,
  hashing, storage outside executable directories.

## Architecture decision records

- [ADR-001 Stack](docs/architecture/ADR-001-stack.md)
- [ADR-002 AI boundaries](docs/architecture/ADR-002-ai-boundaries.md)
- [ADR-003 Evidence model](docs/architecture/ADR-003-evidence.md)
- [ADR-004 Audit and immutability](docs/architecture/ADR-004-audit.md)
- [ADR-005 n8n automation](docs/architecture/ADR-005-n8n.md)
