# ADR-001: Technology Stack

Status: Accepted
Date: 2026-09-10

## Context

Career OS is a local-first personal Career OS: master profile, evidence-backed
claims, deterministic job scoring, controlled CV generation, application state
machine, n8n automation and immutable audit. The educational build must avoid
anti-bot scraping and operate against fixtures and mock APIs.

## Decision

- **Monorepo**: pnpm workspaces (`apps/*`, `packages/*`).
- **Web**: Next.js 15 (App Router) + TypeScript (strict) + React 19.
- **Database**: Neon PostgreSQL (cloud) accessed only via `POSTGRES_URL`.
- **ORM**: Prisma 6, migrations in `packages/db/prisma/migrations`.
- **Validation**: Zod at every external boundary (API routes, AI output).
- **AI**: NVIDIA-hosted LLM via `nvidia_api_key` for extraction/tailoring only.
- **Automation**: self-hosted n8n in Docker Compose; Redis/worker later.
- **Tests**: Vitest for unit/integration.
- **Reverse proxy**: nginx in front of web + n8n.

## Consequences

- Prisma + Neon gives managed Postgres with pooled connections; no local DB
  container is required, simplifying the compose stack to web + n8n + proxy.
- Zod schemas live in `apps/web/app/api/schemas.ts` so unit tests can validate
  request shapes without importing Prisma-coupled route handlers.
- Deterministic code (scoring, state machine, dedup) lives in
  `@career-os/shared` and `@career-os/db` — never in AI prompt flows.
