# 🔍 Audit 03 — Architecture Career_OS

**Date:** 2026-09-17
**Objectif:** Analyser l'architecture technique actuelle vs les besoins pour implémenter les gaps P1 (CV Template Engine, Human Control Gates, Approval UI) et P2 (Gmail, UX/UI, PDF rendering).

---

## 📋 1. Inventaire Architecture Actuelle

### 1.1 Stack Technologique (ADR-001)

| Couche | Technologie | Version | Statut |
|--------|-------------|---------|--------|
| **Runtime** | Node.js | >=22 | ✅ |
| **Package Manager** | pnpm | 12.3.4 | ✅ |
| **Monorepo** | pnpm workspaces | - | ✅ |
| **Language** | TypeScript | Strict mode | ✅ |
| **Framework Web** | Next.js | 15 (App Router) | ✅ |
| **Database** | Neon PostgreSQL | Serverless | ✅ |
| **ORM** | Prisma | 6.x | ✅ |
| **Validation** | Zod | - | ✅ |
| **AI Extraction** | NVIDIA API (gpt-oss-20b) | - | ✅ |
| **Automation** | n8n | Latest Docker | ✅ (infra) |
| **Proxy** | Nginx | Alpine | ✅ (infra) |
| **Testing** | Vitest | - | ✅ |
| **Linting** | ESLint + Prettier | - | ✅ |

### 1.2 Structure Monorepo

```
career_os/
├── apps/web/                 # Next.js 15 application
│   ├── app/                  # App Router pages + API routes
│   │   ├── api/              # 20+ API routes (REST, Zod validated)
│   │   ├── profile/          # Master Profile UI
│   │   ├── jobs/             # Job Intelligence UI
│   │   ├── applications/     # Application Pipeline UI
│   │   ├── documents/        # Document Generation UI
│   │   ├── audit/            # Audit Trail UI
│   │   ├── analytics/        # KPIs UI
│   │   ├── automation/       # Placeholder (Stage F)
│   │   └── settings/         # Placeholder
│   ├── lib/                  # Shared lib (audit, approval, health, ai)
│   ├── components/ui/        # 4 primitive components
│   └── test/                 # Unit tests
├── packages/
│   ├── db/                   # Prisma schema + client + migrations
│   │   ├── prisma/schema.prisma    # 600+ lines, 25+ models
│   │   ├── client/                 # Query helpers + types
│   │   └── migrate-legacy-columns.js
│   ├── shared/               # Pure deterministic logic (NO side effects)
│   │   ├── hash.ts               # Content hashing
│   │   ├── normalize.ts          # Text normalization
│   │   ├── ids.ts                # ID generation (cuid)
│   │   ├── types.ts              # Shared enums (mirrors DB)
│   │   ├── claims.ts             # Claim logic
│   │   ├── scoring.ts            # Deterministic job scoring
│   │   ├── dedup.ts              # 3-level deduplication
│   │   ├── documents.ts          # Controlled CV generation
│   │   ├── cv-templates.ts       # 3 CV templates (ANALYSTE/AUDITOR/CONTROLLEUR)
│   │   └── index.ts              # Barrel export
│   └── eslint-config/        # Shared ESLint config
├── docs/
│   ├── architecture/         # ADRs (5)
│   ├── specifications/       # 3 specs (CV templates, Gmail, UX/UI)
│   ├── examples/cv/          # 4 example CVs
│   └── INDEX.md              # Navigation index
├── data/                     # Test results
├── infra/
│   ├── nginx/nginx.conf      # Reverse proxy config
│   └── scripts/              # Smoke + E2E scripts
├── docker-compose.yml        # Web + n8n + proxy
└── AUDIT_01/02/03.md
```
### 1.3 Modèles de Données Clés (Prisma Schema - 25 modèles)

| Domaine | Modèles Principaux | Relations |
|---------|-------------------|-----------|
| **Profile (Stage B)** | CandidateProfile, Experience, Education, Skill, Certification, Project | Profile → 1:N each |
| **Evidence (Stage B)** | Source, Evidence, Claim, ClaimEvidence | Source → Evidence → Claim |
| **Job Intelligence (Stage C)** | JobOffer, Company, JobSource, JobAnalysis, JobRequirement, JobScore, ScoreGap, ScoreRuleVersion | JobOffer → Analysis → Requirements → Score |
| **Documents (Stage D)** | CvVersion, CvClaim, CoverLetterVersion | Profile → CvVersion → CvClaim → Claim |
| **Applications (Stage E)** | Application, ApplicationEvent, PhoneEvent, ResponseObservation | Application → Events + PhoneEvents |
| **Contacts (Stage G)** | Contact, Company | - |
| **Approvals (Stage G)** | Approval (enum: SEND_EMAIL, MARK_APPLICATION_SENT, EXPORT_DOCUMENT) | Polymorphic entityId |
| **Audit (Stage H)** | AuditLog (append-only, 7 indexes) | - |
| **Automation (Stage F)** | N8nWorkflow, N8nExecution | - |

### 1.4 API Routes Implémentées (20+)

| Route | Méthode | Domaine | Validation |
|-------|---------|---------|------------|
| `/api/health` | GET | Health | - |
| `/api/health/db` | GET | Health DB | - |
| `/api/health/n8n` | GET | Health n8n | - |
| `/api/profile` | GET/POST | Profile | Zod |
| `/api/profile/experiences` | POST | Profile | Zod |
| `/api/profile/education` | POST | Profile | Zod |
| `/api/profile/skills` | POST | Profile | Zod |
| `/api/profile/certifications` | POST | Profile | Zod |
| `/api/sources` | GET/POST | Evidence | Zod |
| `/api/evidence` | GET/POST | Evidence | Zod |
| `/api/claims` | GET/POST | Evidence | Zod |
| `/api/jobs` | GET/POST | Jobs | Zod |
| `/api/jobs/[id]/analyze` | POST | Jobs (AI) | Zod + AI guard |
| `/api/jobs/[id]/score` | POST | Jobs (deterministic) | Zod |
| `/api/jobs/list` | GET | Jobs | - |
| `/api/documents/cv` | GET/POST | Documents | Zod + fact-check |
| `/api/documents/cover-letter` | POST | Documents | Zod |
| `/api/applications` | GET/POST | Applications | Zod |
| `/api/applications/[id]` | PATCH | Applications | Zod + state machine |
| `/api/applications/[id]/phone-events` | POST | Applications | Zod |
| `/api/contacts` | GET/POST | Contacts | Zod |
| `/api/approvals` | GET/POST | Approvals | Custom |
| `/api/cv/templates` | GET | CV Templates | - |

### 1.5 UI Pages Implémentées

| Page | Composants | Fonctionnalités |
|------|------------|-----------------|
| `/` (Dashboard) | Links vers toutes pages | Navigation |
| `/profile` | ProfileForm, SubEntitiesSection | CRUD Profile + sub-entities |
| `/jobs` | NewJobForm, ScoreRing, JobCard | List + Create + Score display |
| `/jobs/[id]` | Analyze/Score buttons, Gap breakdown | Detail + AI analysis + Scoring |
| `/applications` | NewApplicationForm, Table | List + Create + State machine |
| `/applications/[id]` | TransitionControls, PhoneEventForm | Detail + Transitions + Timeline |
| `/documents` | GenerateCvForm, CV list | Generate CV (deterministic) + History |
| `/audit` | Filters, Pagination, Table | Full audit trail query |
| `/analytics` | KPI cards, Tables | KPIs + Monthly + Top scored |
| `/automation` | Placeholder | Stage F - not implemented |
| `/settings` | Placeholder | Not implemented |

---

## 📋 2. Analyse des Gaps P1 vs Architecture Actuelle

### 2.1 Gap P1.1 — CV Template Engine

**État actuel :** ⚠️ **PARTIELLEMENT IMPLÉMENTÉ**

| Composant | Existant | Manquant |
|-----------|----------|----------|
| Templates définis | ✅ `cv-templates.ts` (3 templates) | - |
| API templates | ✅ `/api/cv/templates` | - |
| Génération CV | ✅ `/api/documents/cv` + `buildCvModel` | - |
| Fact-check | ✅ `factCheckDocument` | - |
| Provenance | ✅ `CvClaim` links | - |
| **Rendu PDF/DOCX** | ❌ | **CRITIQUE** |
| **Sélection template par utilisateur** | ❌ (profile.cvTemplate existe mais pas UI) | **IMPORTANT** |
| **Personnalisation templates** | ❌ (hardcoded predicates) | **NICE TO HAVE** |

**Analyse technique :**
- La logique de génération existe (`buildCvModel` dans `shared/src/documents.ts`)
- Le rendu actuel est **texte brut** (`renderCvContent` retourne `string`)
- Il faut ajouter un **moteur de rendu PDF/DOCX** (pdfkit, @react-pdf/renderer, ou Puppeteer)
- Le champ `cvTemplate` existe sur `CandidateProfile` mais pas d'UI pour le choisir

**Décision architecturale :** Ajouter un package `documents-renderer` dans `packages/` ou étendre `shared/src/documents.ts` avec un renderer PDF.
---

### 2.2 Gap P1.2 — Human Control Gates

**État actuel :** ⚠️ **FONDATION EXISTANTE MAIS INCOMPLÈTE**

| Composant | Existant | Manquant |
|-----------|----------|----------|
| Modèle Approval | ✅ Prisma `Approval` model + enum `ApprovalAction` | - |
| API Approvals | ✅ `/api/approvals` (POST/GET) | - |
| Lib approval | ✅ `lib/approval.ts` (record/check/guard) | - |
| **Gates sur actions sensibles** | ⚠️ Partiel | **CRITIQUE** |
| **UI de validation** | ❌ | **CRITIQUE** |
| **Intégration State Machine** | ❌ | **CRITIQUE** |
| **Actions couvertes** | SEND_EMAIL, MARK_APPLICATION_SENT, EXPORT_DOCUMENT | GMAIL_SEND, N8N_TRIGGER, EXTERNAL_API_CALL |

**Analyse technique :**
- Le modèle `Approval` existe avec `correlationId` polymorphique
- `guardSend(correlationId)` existe mais **n'est appelé nulle part**
- Les transitions d'application ne vérifient pas d'approbation
- L'envoi d'email (Gmail) n'existe pas encore
- L'export document (PDF) n'existe pas encore

**Actions nécessitant Human Control Gates :**
1. **Envoi email** (Gmail API) → `SEND_EMAIL`
2. **Marquer candidature envoyée** → `MARK_APPLICATION_SENT` (PRETE → ENVOYEE)
3. **Export document** (PDF/DOCX) → `EXPORT_DOCUMENT`
4. **Déclencher workflow n8n** → `N8N_TRIGGER` (nouveau)
5. **Appel API externe** → `EXTERNAL_API_CALL` (nouveau)

**Décision architecturale :**
1. Modifier `/api/applications/[id]` PATCH pour exiger approval sur transitions critiques
2. Créer page `/approvals` pour lister/valider les approbations en attente
3. Étendre `ApprovalAction` enum pour nouvelles actions
4. Intégrer `guardSend` dans chaque action externe
---

### 2.3 Gap P1.3 — Approval UI

**État actuel :** ❌ **ABSENT**

| Composant | Existant | Manquant |
|-----------|----------|----------|
| Page `/approvals` | ❌ | **CRITIQUE** |
| Liste approbations en attente | ❌ | **CRITIQUE** |
| Détail approbation (contexte) | ❌ | **CRITIQUE** |
| Action Approve/Reject | ❌ | **CRITIQUE** |
| Notifications | ❌ | NICE TO HAVE |

**Analyse technique :**
- L'API `/api/approvals` supporte déjà POST (record) et GET (check)
---

## 📋 3. Analyse des Gaps P2 vs Architecture Actuelle

### 3.1 Gap P2.1 — Gmail Integration Phase 1

**État actuel :** ❌ **ABSENT** (spec existe dans `docs/specifications/gmail-api-integration.md`)

| Composant | Requis | Notes |
|-----------|--------|-------|
| OAuth2 Google | ✅ Spec détaillée | Nécessite `googleapis` package |
| Lecture emails | ✅ Spec | Sync récent + historique |
| Classification | Phase 2 | ML/règles |
| Tracking réponses | Phase 2 | Webhook/polling |
| **Stockage tokens** | ❌ | Ajouter table `GmailAccount` |
| **Worker sync** | ❌ | Cron job ou n8n workflow |

**Décision architecturale :**
- Ajouter modèle `GmailAccount` (profileId, email, accessToken, refreshToken, scopes, expiresAt)
- Créer `/api/gmail/*` routes (auth, sync, messages)
- Utiliser n8n pour le polling périodique (Stage F)
- Intégrer avec `Application` pour tracker les réponses

### 3.2 Gap P2.2 — UX/UI Design System Phase 1

**État actuel :** ⚠️ **PRIMITIF** (4 composants dans `components/ui/`)

| Composant | Existant | Manquant |
|-----------|----------|----------|
| Design tokens | ❌ | Couleurs, spacing, typography, shadows |
| Composants de base | 4 (ScoreRing, EmptyState, MatchBreakdown, StatusBadge) | Button, Input, Select, Modal, Table, Card, Form, Toast, Tooltip, Avatar, Badge, Dropdown, Tabs, Accordion |
| Layout/Navigation | ❌ | Sidebar, Header, Breadcrumb, Command Palette (⌘K) |
| Thème | ❌ | Light/Dark mode |
| Accessibilité | Basique | ARIA, focus management, keyboard nav |

**Décision architecturale :** Créer `packages/ui` ou `apps/web/components/design-system` avec Tailwind + Radix/shadcn.

### 3.3 Gap P2.3 — Document Rendering PDF/DOCX

**État actuel :** ❌ **ABSENT** (rendu texte brut seulement)

| Format | Librairie candidate | Complexité |
|--------|---------------------|------------|
| **PDF** | `@react-pdf/renderer`, `pdfkit`, `Puppeteer` | Moyenne |
| **DOCX** | `docx`, `docxtemplater` | Moyenne |

**Recommandation :** **Option A** (`@react-pdf/renderer`) pour cohérence Next.js. Créer `packages/document-renderer`.
- Il faut créer la page UI qui liste les approbations `approved === null`, montre le contexte, permet d'approuver/rejeter

**Décision architecturale :** Page Server Component avec formulaire Client Component pour les actions.
---

## 📋 4. Risques & Dépendances Techniques

### 4.1 Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| PDF rendering performance | Moyenne | Élevé | Génération async + cache par contentHash |
| Gmail OAuth token refresh | Élevée | Moyen | Worker n8n dédié + retry logic |
| Approval UI race conditions | Faible | Élevé | Optimistic locking via correlationId |
| State machine + approval coupling | Moyenne | Élevé | Tests d'intégration exhaustifs |
| n8n webhook security | Moyenne | Élevé | Signature validation + IP allowlist |
| Bundle size (UI library) | Faible | Moyen | Tree-shaking + dynamic imports |

### 4.2 Dépendances Critiques

```
CV Template Engine (P1.1)
    ├── shared/documents.ts (✅ existe)
    ├── shared/cv-templates.ts (✅ existe)
    ├── NOUVEAU: packages/document-renderer (PDF/DOCX)
    └── UI: Profile cvTemplate selector

Human Control Gates (P1.2)
    ├── Prisma Approval model (✅ existe)
    ├── lib/approval.ts (✅ existe)
    ├── API /api/approvals (✅ existe)
    ├── MODIFIER: /api/applications/[id] PATCH (guardSend)
    ├── MODIFIER: /api/documents/cv (guardSend sur EXPORT_DOCUMENT)
---

## 📋 5. Recommandations Architecture

### 5.1 Nouveaux Packages Recommandés

| Package | Contenu | Justification |
|---------|---------|---------------|
| `packages/document-renderer` | `@react-pdf/renderer` components pour CV + Cover Letter | Séparation concerns, réutilisable, testable |
| `packages/ui` | Design tokens + composants Radix/shadcn | Cohérence UX, accessibilité, maintenance |
| `packages/gmail` | OAuth + sync + classification logic | Isolation domaine, partageable avec n8n workers |

### 5.2 Modifications Schéma Prisma (Migrations Requises)

```prisma
// 1. Extension ApprovalAction
enum ApprovalAction {
  SEND_EMAIL
  MARK_APPLICATION_SENT
  EXPORT_DOCUMENT
  N8N_TRIGGER           // NOUVEAU
  EXTERNAL_API_CALL     // NOUVEAU
}

// 2. Gmail Integration
model GmailAccount {
  id            String   @id @default(cuid())
  profileId     String
  email         String
  accessToken   String   // encrypted
  refreshToken  String   // encrypted
  scopes        String[]
  expiresAt     DateTime
  syncCursor    String?  // historyId pour sync incrémentale
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  profile       CandidateProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  @@unique([profileId, email])
  @@index([profileId])
}

// 3. Document Render Jobs (async PDF generation)
model DocumentRenderJob {
  id            String   @id @default(cuid())
  cvVersionId   String?  // ou coverLetterVersionId
  format        String   // PDF, DOCX
  status        String   // PENDING, PROCESSING, COMPLETED, FAILED
  fileUrl       String?  // signed URL ou path
  error         String?
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  @@index([cvVersionId])
  @@index([status])
}
```

### 5.3 Ordre d'Implémentation Recommandé

```
SEMAINE 1-2: Foundation
  ├── 1. Audit 03 (ce document) ✅
  ├── 2. Spec Human Control Gates
  ├── 3. Spec Approval UI
  ├── 4. Migration Prisma (ApprovalAction + GmailAccount + DocumentRenderJob)
  └── 5. Package document-renderer (PDF de base)

SEMAINE 2-3: P1 Core
  ├── 6. CV Template Engine complet (PDF + UI template selector)
  ├── 7. Human Control Gates integration (guardSend sur transitions critiques)
  └── 8. Approval UI (page + actions)

SEMAINE 3-4: P2 Enhanced
  ├── 9. Gmail Integration Phase 1 (OAuth + sync + API)
  ├── 10. Design System Phase 1 (Tokens + Button + Input + Modal + Table)
  └── 11. Migration pages existantes vers Design System

SEMAINE 4-5: Polish
  ├── 12. Tests d'intégration complets
  ├── 13. Documentation utilisateur
  ├── 14. Déploiement Docker + Smoke tests
  └── 15. MVP v1 Release
```

---

## 📋 6. Critères de Validation Architecture

L'audit architecture sera validé quand :

- [ ] Architecture documentée pour les 3 gaps P1
- [ ] Schéma Prisma extensions définies et revues
- [ ] Nouveaux packages identifiés avec boundaries clairs
- [ ] Dépendances inter-features mappées
- [ ] Risques techniques identifiés avec mitigations
- [ ] Ordre d'implémentation séquencé sans cycles
- [ ] Estimation effort par feature documentée

---

## ✅ Statut Audit 03

**STATUT: ✅ TERMINÉ**

Prochaine étape : **Créer les specs manquantes** (`human-control-gates.md`, `approval-ui.md`) puis **implémenter Phase 1**.