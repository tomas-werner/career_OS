# ADR-003: Evidence Model

Status: Accepted
Date: 2026-09-10

## Context

Professional facts must be provable. Generated documents must never contain
statements that cannot resolve to Claim → Evidence → Source (plan.md section 8).

## Decision

- `Source` (type: CV, CERTIFICATE, PROJECT, ...) → `SourceSnapshot`
  (contentHash, rawText/storagePath) → `Evidence` (quote, location) →
  `ClaimEvidence` → `Claim` (subject/predicate/value, status, confidence).
- Claim statuses: VERIFIED, UNVERIFIED, REJECTED, EXPIRED, CONTESTED.
- No inference chains without evidence (JavaScript → React is forbidden
  unless evidence exists).
- Generated documents (`CvVersion`, `CoverLetterVersion`) reference claims
  via junction tables (`CvClaim`, `CoverLetterClaim`) for full provenance.
- Content hashes (SHA-256 via `hashContent`/`hashJson` in `@career-os/shared`)
  guarantee reproducibility and tamper evidence.

## Consequences

- Document generation must fail (not warn) when a selected statement has no
  VERIFIED claim backing it.
- Uploading a CV creates a Source of type CV; extracted facts become Evidence
  and candidate Claims pending verification (plan.md section 58).
