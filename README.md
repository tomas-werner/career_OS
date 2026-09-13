# Career OS

Local-first personal Career OS: evidence-backed master profile, deterministic
job scoring, controlled CV/cover-letter generation, an enforced application
state machine, n8n automation and an immutable audit trail.

> **AI proposes. Deterministic code validates and decides. Humans authorize
> external actions.**

The full product plan lives in [plan.md](./plan.md).
The UX/UI product-design specification lives in
[docs/ux/Career_OS_Cahier_des_Charges_UX_UI.md](./docs/ux/Career_OS_Cahier_des_Charges_UX_UI.md)
(design tokens, navigation architecture, component library, acceptance
criteria).

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
| `pnpm e2e`     | Full E2E suite (50 checks — all stages + security, needs the server running) |

## Stage status

- [x] **Stage A — Foundation** (complete, verified 2026-09-13):
  - [x] pnpm monorepo + TypeScript strict (Agent 01)
  - [x] ADRs 001–005 (Agent 00)
  - [x] Direct PostgreSQL connection with pg library for Neon
  - [x] Database types and utilities (Agent 02)
  - [x] Next.js app, dashboard, §40 placeholder pages, health endpoints
  - [x] Zod-validated API routes (jobs, applications + state machine)
  - [x] Docker Compose stack (web + n8n + proxy) — runtime verification pending
  - [x] `pnpm setup-db` applied to Neon (schema + audit rules + seeds)
  - [x] Green typecheck / lint / test / build + smoke test (web OK, DB OK)
  - [ ] `docker compose up` acceptance — Docker Desktop not installed locally
  - [ ] Authentication/security baseline (Agent 03) — deliberately deferred
- [x] **Stage B — Knowledge layer** (complete, verified 2026-09-13):
  - [x] Deterministic fact-checker: `validateClaim` / `computeConfidence` /
    `isValueSupportedByQuotes` in `packages/shared/src/claims.ts` (section 15)
  - [x] API: `GET/PUT /api/profile`, `GET/POST /api/sources`,
    `GET/POST /api/evidence`, `GET/POST /api/claims` (Zod-validated, audited)
  - [x] Sub-entity APIs: `GET/POST /api/profile/{experiences,education,skills,certifications}`
    with date-order validation; every skill auto-creates a `candidate knows <skill>`
    claim validated deterministically and linked to the chosen evidence
  - [x] UI: functional Profile (identity + experience/education/skills/certifications
    with Verified/Unverified badges), Evidence (sources) and Claims pages with
    evidence drill-down (§43)
  - [x] E2E verified against Neon: profile → source → evidence → sub-entities →
    skills (SQL+CV evidence → VERIFIED 0.5, Docker no evidence → UNVERIFIED 0)
- [x] **Stage C — Job intelligence** (complete, verified 2026-09-13):
  - [x] Deterministic versioned scoring (§11-12): `calculateScore` +
    `BASELINE_SCORE_RULE` in `packages/shared/src/scoring.ts`; education ×0.2,
    experience ×0.3, skills ×0.3, tools ×0.1, keywords ×0.1; gap severity
    CRITICAL/MAJOR/MINOR — pure, reproducible
  - [x] Three-level deduplication (§37): `deduplicateJob` — normalized
    company+title+location keys, description hash, trigram similarity
    (DUPLICATE / PROBABLE_DUPLICATE / REVIEW / UNIQUE, never silent delete)
  - [x] AI extraction pipeline (§13-14): `apps/web/lib/ai/extraction.ts` —
    NVIDIA chat completions, job text in a delimited DATA block (untrusted),
    injection scan + redaction, strict Zod schema (.strict rejects extra keys),
    markdown-fence tolerant parsing; model configurable via `nvidia_model`
    (default `openai/gpt-oss-20b` — llama-3.3-70b and gpt-oss-120b are EOL)
  - [x] API: `POST /api/jobs/[id]/analyze` (extraction → JobAnalysis +
    JobRequirements + audit, injection warnings), `POST /api/jobs/[id]/score`
    (profile snapshot + analysis + active rule → upserted JobScore + ScoreGaps,
    idempotent per (job, rule))
  - [x] UI: /jobs list with scores, /jobs/[id] detail (§42) with analysis
    chips, score breakdown per dimension and gap severity list
  - [x] E2E verified against Neon + real NVIDIA API: job → analysis →
    score 0.57 → re-score identical (reproducibility proven); gaps flagged
    Python/Airflow as CRITICAL (absent from profile), SQL matched
- [x] **Stage D — Documents** (complete, verified 2026-09-13):
  - [x] Controlled generation domain (§16-17): `buildCvModel` /
    `factCheckDocument` in `packages/shared/src/documents.ts` — statements
    built exclusively from VERIFIED claims; deterministic content + hash;
    fact-check gate refuses documents with any non-verified claim (422)
  - [x] Migration: `content` column on CvVersion + CoverLetterVersion
    (applied to Neon via `pnpm setup-db`)
  - [x] API: `GET/POST /api/documents/cv` (CvClaim provenance rows, audit
    CV_GENERATED), `POST /api/documents/cover-letter` (per-application,
    links Application.coverLetterVersionId, audit COVER_LETTER_GENERATED)
  - [x] UI: /documents (list + generation form restricted to verified
    claims), /documents/[id] with full provenance table (claim → status →
    evidence source types)
  - [x] E2E verified against Neon: CV generated from 2 verified claims only
    (unverified Docker excluded), detail page 200, cover letter linked to
    application with provenance
- [x] **Stage E — Application pipeline** (complete, verified 2026-09-13):
  - [x] API: `GET /api/applications/[id]` (detail + job + events timeline +
    phone events + valid transitions from the shared state machine),
    `POST /api/applications/[id]/phone-events` (§22, audit PHONE_EVENT_RECORDED)
  - [x] UI: /applications (list with status colors + scores, creation form),
    /applications/[id] (state-machine action buttons derived from
    `APPLICATION_TRANSITIONS`, events timeline with correlation IDs, phone
    event recorder)
  - [x] E2E verified against Neon: invalid transition rejected 422 (server
    enforcement), full valid walk A_ANALYSER → A_PREPARER → A_VALIDER → PRETE,
    4 ApplicationEvents traced with the same correlation ID, phone event
    recorded
- [ ] Stage F — Automation (n8n workflows, fixtures)
- [~] **Stage H — Governance** (partial, verified 2026-09-13):
  - [x] Audit UI (§45): /audit with filters (actor, action, entity type,
    date, correlation ID), pagination, filter options generated from
    existing data; append-only enforced at DB level (§32)
  - [x] Analytics (§39): /analytics — jobs discovered/analyzed/scored,
    applications, response/interview/offer rates (derived from the state
    machine, never inferred from silence §26), monthly breakdown, top scored
    jobs
  - [x] Contacts (§23): GET/POST /api/contacts (Zod + audit
    CONTACT_CREATED), /contacts page with company linkage and phone-event
    counts; /api/jobs/list now returns company ids
  - [ ] Observability beyond health endpoints, backup restore test,
    AI regression suite (§47), security audit, authentication
- [ ] Stage F — Automation (n8n workflows, fixtures) — blocked on Docker
- [ ] Stage G — Communications (Gmail approval pipeline)
- [~] **UX/UI implementation** (phases 1-3 of the cahier des charges
  roadmap §85, spec in docs/ux/):
  - [x] Phase 1+2 — Design system: tokens (palette §4, typography §5,
    spacing §6, radius §7, shadows §8, motion §56), dark mode §75, sidebar
    navigation §9.1 with grouped sections + responsive §60, status system
    (icon + text + color §25/§51)
  - [x] Phase 3 — Core UI: Dashboard Career Command Center (Career Health
    §11.3, Opportunity Radar §12, Skill Gap Radar §13, Recommended Actions
    §15, Recent Activity §14), Jobs explorer with score-centered job cards
    §16-18, Job Detail intelligence view §19-22 (Why this job?, ScoreRing
    with match categories, MatchBreakdown per dimension, Gap intelligence)
  - [x] Components: StatusBadge, ScoreRing, MatchBreakdown, EmptyState
    (component library §63-64 started)
  - [ ] Remaining: Command Palette ⌘K §10, Kanban pipeline §32,
    Evidence/Claim graph §31, Document Studio §37, AI Activity Center §40

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

## UX/UI specification

The UX/UI cahier des charges (docs/ux/) is the design reference for evolving
the current functional UI into the commercial product shell:

- Design tokens: `#4F46E5` accent / `#111827` text / `#F8FAFC` background,
  Inter typeface, 4/8/12/16px spacing scale, 12-16px card radius (§4-8)
- Sidebar navigation with grouped sections — CAREER / OPPORTUNITIES /
  APPLICATIONS / DOCUMENTS / INTELLIGENCE / GOVERNANCE (§9.1)
- Signature loop: **MATCH → EVIDENCE → DECISION → ACTION → FEEDBACK** (§78)
- Core UX rules: no unsupported claim looks verified, no AI output looks
  final until deterministically validated, every external action shows human
  approval, provenance exposed on documents (§80)
- Status system combines icon + text + color, never color alone (§25, §51)
- Design-system components to build: StatusBadge, ScoreRing,
  MatchBreakdown, EvidenceCard, ClaimCard, Timeline, EmptyState,
  CommandPalette (⌘K) (§63-64)
