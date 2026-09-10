# ADR-005: n8n Automation Layer

Status: Accepted
Date: 2026-09-10

## Context

Background workflows (job ingestion, analysis, re-scoring, Gmail sync,
reminders, analytics — plan.md sections 27-29) must run without manual
intervention, but must stay inside the security model.

## Decision

- n8n runs self-hosted in Docker Compose with persistent volume
  (`n8n_data`); credentials are never committed.
- n8n talks to Career OS exclusively through the Application API
  (`/api/...`) with Zod validation — no direct database access.
- Every workflow execution propagates a `correlationId` that appears in
  AuditLog entries.
- Initial catalogue: WF-001 ingestion (fixtures only), WF-002 analysis,
  WF-003 daily re-scoring, WF-004 Gmail sync (mock first), WF-005 reminders,
  WF-006 analytics snapshots.
- Redis and the Playwright worker are deferred until fixture ingestion is
  proven; the worker will be restricted to local/public test fixtures.

## Consequences

- Docker Compose services: career-os (web), n8n, proxy. Postgres is Neon
  (cloud), not a local container.
- Workflow JSON lives in `n8n/workflows/` and can be imported into n8n;
  fixture jobs live in `n8n/fixtures/` and `tests/fixtures/jobs/`.
