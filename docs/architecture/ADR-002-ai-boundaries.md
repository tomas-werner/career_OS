# ADR-002: AI Boundaries

Status: Accepted
Date: 2026-09-10

## Context

AI (NVIDIA-hosted LLMs) is used for job-description extraction, claim
validation assistance and document tailoring. Untrusted text (job offers,
emails, uploaded CVs) must never influence master data directly, and prompt
injection must be contained.

## Decision

1. **AI proposes, deterministic code validates and decides.** All AI output
   passes through Zod validation before any database write.
2. Untrusted text is data, never instructions. Extraction prompts embed job
   text as quoted data with an explicit system boundary.
3. AI never performs writes: it returns JSON to the API layer, which decides.
4. Every AI-produced artifact records `extractedBy`/`generationModel` and
   `promptVersion` for explainability (plan.md section 44).
5. External actions (email send, export) require human `Approval` records
   regardless of AI involvement (plan.md sections 24-25).

## Consequences

- AI regression suite (plan.md section 47) can assert structural invariants:
  no invented employer, education, skill, metric or technology.
- Prompt changes require a new `promptVersion` and a regression run.
