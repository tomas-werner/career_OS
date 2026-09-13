# Career OS — Cahier des Charges UX/UI & Design Produit

> **Document de référence pour concevoir une interface moderne, dynamique, évolutive et commercialisable de Career OS.**

---

## 1. Vision du produit

### 1.1 Positionnement

**Career OS** est conçu comme un **Personal Career Operating System** : une plateforme qui centralise le profil professionnel, les preuves, les compétences, les offres d'emploi, le scoring, les candidatures, les documents, l'automatisation et la traçabilité.

Le produit repose sur un principe fondamental :

> **AI proposes. Deterministic code validates and decides. Humans authorize external actions.**

L'interface doit donc traduire visuellement trois notions :

1. **Intelligence** — l'IA analyse et propose.
2. **Confiance** — les décisions importantes sont appuyées par des preuves.
3. **Contrôle** — l'utilisateur conserve la validation finale.

### 1.2 Objectif UX

L'objectif n'est pas de créer une collection de pages indépendantes, mais un **système cohérent** permettant à l'utilisateur de passer naturellement de :

**Profil → Preuves → Claims → Opportunité → Match → Décision → Documents → Candidature → Suivi → Analyse**

### 1.3 Objectif commercial

Le design doit être suffisamment robuste pour évoluer d'un outil personnel vers un **produit SaaS commercialisable**.

Le système doit donc prévoir :

- une identité visuelle forte ;
- une architecture UX scalable ;
- une interface premium ;
- une expérience d'onboarding ;
- des composants réutilisables ;
- une excellente lisibilité des données ;
- des interactions modernes ;
- une forte perception de fiabilité ;
- une différenciation claire par rapport aux job boards classiques.

---

# 2. Principes directeurs du design

## 2.1 Evidence-first

Chaque information professionnelle importante doit pouvoir être reliée à une **preuve**.

Exemples :

- compétence → preuve ;
- claim → evidence ;
- CV → claims utilisés ;
- lettre → claims utilisés ;
- analyse IA → profil + offre ;
- décision → score + justification.

L'interface doit donc privilégier :

**Claim → Evidence → Source → Validation**

---

## 2.2 Trust by design

Le design doit rendre visible la fiabilité du système.

États principaux :

- `VERIFIED`
- `UNVERIFIED`
- `REJECTED`
- `MISSING EVIDENCE`
- `WARNING`
- `PENDING`
- `APPROVED`

Ne jamais cacher l'incertitude derrière une interface trop "magique".

---

## 2.3 AI transparency

Lorsqu'une fonctionnalité utilise l'IA, l'utilisateur doit pouvoir comprendre :

- quel modèle a été utilisé ;
- quelle version du prompt a été utilisée ;
- quelles données ont été utilisées ;
- quelles claims ont été utilisées ;
- quels avertissements existent ;
- ce qui a été validé par le système déterministe.

---

## 2.4 Human-in-the-loop

Les actions externes sensibles doivent rester sous contrôle humain.

Le design doit clairement distinguer :

- **AI suggestion**
- **System validation**
- **Human approval**
- **External action**

Exemple :

```text
AI generated
      ↓
Validated
      ↓
Ready for review
      ↓
User approval
      ↓
External action
```

---

## 2.5 Progressive disclosure

Ne pas afficher toutes les informations techniques simultanément.

Niveau 1 :

**Résumé décisionnel**

Niveau 2 :

**Explication**

Niveau 3 :

**Preuves / provenance**

Niveau 4 :

**Données techniques / audit**

---

# 3. Direction artistique

## 3.1 Concept visuel

Direction recommandée :

> **Premium SaaS + AI Command Center + FinTech**

Le produit doit transmettre :

- sérieux ;
- précision ;
- intelligence ;
- contrôle ;
- modernité ;
- efficacité.

Éviter :

- l'esthétique "AI chatbot" générique ;
- les interfaces trop colorées ;
- les gradients omniprésents ;
- les dashboards surchargés ;
- les animations inutiles ;
- l'apparence d'un simple job board.

---

# 4. Identité visuelle

## 4.1 Palette principale

| Token | Couleur | Usage |
|---|---|---|
| Background | `#F8FAFC` | arrière-plan principal |
| Surface | `#FFFFFF` | cartes et panneaux |
| Primary | `#111827` | texte principal |
| Accent | `#4F46E5` | actions principales |
| Accent 2 | `#7C3AED` | intelligence / IA |
| Success | `#16A34A` | verified / succès |
| Warning | `#D97706` | attention |
| Danger | `#DC2626` | rejet / erreur |
| Border | `#E5E7EB` | séparateurs |
| Muted | `#64748B` | texte secondaire |

### Règle

L'accent violet/indigo doit être utilisé avec parcimonie.

Le produit doit rester majoritairement **sobre et professionnel**.

---

# 5. Typographie

## 5.1 Police

Recommandation :

- **Inter** pour l'interface ;
- alternative : Geist / system sans-serif.

## 5.2 Hiérarchie

```text
Display       36–48 px
H1            28–32 px
H2            22–24 px
H3            18–20 px
Body          14–16 px
Small         12–13 px
Caption       11–12 px
```

---

# 6. Spacing system

Utiliser une échelle cohérente :

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Éviter les valeurs arbitraires.

---

# 7. Radius

Recommandation :

```text
sm      6px
md      8px
lg      12px
xl      16px
2xl     20px
pill    999px
```

Les cartes principales doivent généralement rester autour de **12–16px**.

---

# 8. Ombres

L'interface doit utiliser des ombres très légères.

Préférer :

```text
border + subtle shadow
```

plutôt que :

```text
large floating shadows
```

---

# 9. Architecture UX globale

## 9.1 Navigation principale

Sidebar recommandée :

```text
CAREER OS

Overview

CAREER
  Profile
  Evidence
  Claims

OPPORTUNITIES
  Jobs
  Saved Jobs

APPLICATIONS
  Pipeline
  Contacts

DOCUMENTS
  CV Studio
  Cover Letters

INTELLIGENCE
  Analytics
  AI Activity

AUTOMATION

GOVERNANCE
  Audit

SETTINGS
```

---

## 9.2 Header

Le header doit contenir :

- breadcrumb ;
- titre de page ;
- recherche ;
- command palette ;
- notifications ;
- état système ;
- profil utilisateur.

---

# 10. Command Palette

Raccourci :

```text
⌘K / Ctrl+K
```

Actions possibles :

```text
Search jobs
Open profile
Create claim
Add evidence
Create application
Generate CV
Generate cover letter
Open analytics
Open audit
Run job analysis
```

Objectif :

**faire de Career OS un outil power-user.**

---

# 11. Dashboard — Career Command Center

## 11.1 Objectif

Le dashboard doit répondre immédiatement à :

> **"Que dois-je faire maintenant ?"**

---

## 11.2 Structure

### Header

```text
Good morning
Your career command center

[ Search ]       [ + Quick action ]
```

### KPI cards

```text
Career Health
82%

Active Opportunities
24

Applications
18

Interview Rate
22%
```

---

## 11.3 Career Health

Créer un score global visuel.

Exemple :

```text
       82
    CAREER
     HEALTH

Profile       92%
Evidence      86%
Documents     78%
Applications  71%
```

Ce score doit être explicable.

---

# 12. Dashboard — Opportunity Radar

Afficher les meilleures opportunités.

Chaque carte :

```text
Company
Job title
Location

MATCH
87%

Education       ✓
Experience      ✓
Skills          90%
Tools           80%
Keywords        70%

[View opportunity]
```

---

# 13. Dashboard — Skill Gap Radar

Visualiser les principales lacunes.

Exemple :

```text
SKILL GAPS

Critical
● Advanced Power BI

Major
● SAP

Minor
● IFRS reporting
```

Chaque élément doit proposer :

**Pourquoi cette compétence est-elle considérée comme un gap ?**

---

# 14. Dashboard — Recent Activity

Timeline :

```text
09:42  Job analyzed
09:35  Claim verified
09:20  CV generated
08:50  Application updated
08:30  Evidence added
```

---

# 15. Dashboard — Recommended Actions

Créer un bloc :

> **Next best actions**

Exemples :

```text
Complete 2 missing evidence items
Review 3 high-match jobs
Approve CV version 4
Follow up with 2 applications
```

---

# 16. Jobs — Opportunity Explorer

## 16.1 Objectif

Transformer les offres en **opportunités décisionnelles**, pas seulement en listes.

---

## 16.2 Layout

```text
Filters
────────────────────────────
Search
Score
Location
Role
Source
Status
Skills
Risk

Jobs
────────────────────────────
Job card
Job card
Job card
```

---

# 17. Job Card

Chaque carte doit afficher :

```text
Company
Role
Location
Source

87% MATCH

Experience     ✓
Education      ✓
Skills         ✓
Tools          △
Keywords       ✓

3 gaps
1 risk flag

[Analyze]
[View]
```

---

# 18. Match Score

Le score doit être visuellement central.

Exemple :

```text
87%
STRONG MATCH
```

Catégories :

```text
90–100  Excellent
80–89   Strong
70–79   Good
60–69   Moderate
<60     Weak
```

Les seuils doivent rester configurables dans le moteur métier.

---

# 19. Job Detail — Intelligence View

## 19.1 Layout recommandé

Trois zones :

```text
┌──────────────────────────────────────────────┐
│ Job Header                                   │
├───────────────────────┬──────────────────────┤
│ Job information       │ Match intelligence   │
│                       │                      │
│ Description           │ Score                │
│ Requirements          │ Strengths            │
│ Skills                │ Gaps                 │
│                       │ Risks                 │
├───────────────────────┴──────────────────────┤
│ Evidence / Explainability / Actions          │
└──────────────────────────────────────────────┘
```

---

# 20. Job Detail — Why this job?

Section essentielle.

Afficher :

```text
Why this opportunity?

+ Strong financial analysis experience
+ Verified SQL skill
+ Relevant education

Potential concerns

- Missing Power BI evidence
- Experience gap: 1 year
```

---

# 21. Job Detail — Score Breakdown

Le score doit pouvoir être décomposé.

Poids prévus :

```text
Education       20%
Experience      30%
Skills          30%
Tools           10%
Keywords        10%
```

Afficher :

```text
Education     18/20
Experience    25/30
Skills        28/30
Tools          7/10
Keywords       8/10

TOTAL         86/100
```

---

# 22. Gap Intelligence

Les gaps doivent être classés :

```text
CRITICAL
MAJOR
MINOR
```

Chaque gap doit expliquer :

- exigence détectée ;
- importance ;
- présence ou absence dans le profil ;
- evidence disponible ;
- impact sur le score.

---

# 23. Profile — Career Identity

## 23.1 Objectif

Le profil n'est pas simplement un formulaire.

Il doit représenter une **identité professionnelle structurée**.

---

## 23.2 Sections

```text
Identity
Experience
Education
Skills
Certifications
Projects
Achievements
Evidence
```

Ces sections correspondent aux exigences fonctionnelles du produit.

---

# 24. Profile Header

```text
Yassine Basir
Finance / Corporate Finance

Profile completeness
92%

Verified facts
37

Claims
42

Evidence items
31
```

---

# 25. Verification states

Chaque élément important doit afficher :

```text
✓ VERIFIED
○ UNVERIFIED
! MISSING EVIDENCE
× REJECTED
```

Ne pas utiliser uniquement la couleur.

Toujours combiner :

**icône + texte + couleur.**

---

# 26. Evidence Center

## 26.1 Concept

L'Evidence Center est l'un des éléments différenciateurs majeurs de Career OS.

Il doit permettre de voir :

```text
Source
  ↓
Evidence
  ↓
Claim
  ↓
Profile
  ↓
Document
  ↓
Application
```

---

# 27. Evidence Card

```text
CV 2025
PDF

12 claims supported
8 verified
2 unverified
2 rejected

Uploaded
13 Sep 2026

[View evidence]
```

---

# 28. Evidence Detail

Afficher :

```text
Source
File
Hash
Created
Imported
Used by claims

Supported claims
────────────────
SQL
React
Financial analysis
```

---

# 29. Claims Center

## 29.1 Table

Colonnes :

```text
Claim
Status
Confidence
Evidence
Source
Created
Last verified
```

---

# 30. Claim Detail

Exemple :

```text
CLAIM

Candidate knows SQL

VERIFIED
Confidence: 0.50

Evidence
✓ CV 2025
✓ Portfolio

Source
CV.pdf

Last verified
13 Sep 2026
```

---

# 31. Claim Graph

Fonctionnalité premium recommandée.

Visualiser les relations :

```text
Evidence
   │
   ▼
Claim
   │
   ├── Profile
   ├── Job Match
   ├── CV
   └── Cover Letter
```

Cela matérialise la **provenance**.

---

# 32. Applications — Pipeline

## 32.1 Kanban

Le pipeline doit refléter la state machine métier.

Étapes :

```text
A_ANALYSER
A_PREPARER
A_VALIDER
PRETE
ENVOYEE
REPONSE_RECUE
ENTRETIEN
OFFRE
ACCEPTEE
REFUSEE
```

---

# 33. Kanban Card

```text
Company
Role

87% match

Current stage:
A_VALIDER

CV v4
Cover letter v2

Last activity
2h ago
```

---

# 34. Application Detail

La page doit être organisée autour d'une **timeline**.

```text
Application created
      ↓
Job analyzed
      ↓
CV generated
      ↓
CV approved
      ↓
Cover letter generated
      ↓
Application ready
      ↓
Email approved
      ↓
Sent
      ↓
Response received
```

---

# 35. Application Timeline

Chaque événement doit afficher :

```text
Timestamp
Actor
Action
Correlation ID
Notes
```

Acteurs possibles :

```text
USER
SYSTEM
AI
N8N
WORKER
EXTERNAL_API
```

---

# 36. Contacts

Page dédiée aux contacts professionnels.

Informations possibles :

```text
Name
Role
Company
Email
Phone
LinkedIn
Source
Applications
Interactions
```

Prévoir un historique des interactions.

---

# 37. Documents — Document Studio

## 37.1 Concept

Le générateur de documents doit ressembler davantage à un **studio de production** qu'à un formulaire.

---

## 37.2 Interface

```text
Templates
──────────────
Financial Analysis
Management Control
Junior Audit
General Tech

        ↓

Configuration

        ↓

Verified claims

        ↓

Preview

        ↓

Fact-check

        ↓

Approval
```

---

# 38. Document Builder

Afficher :

```text
Document
CV — Junior Financial Analyst

Template
financial-analysis v3

Claims used
✓ SQL
✓ Financial analysis
✓ Corporate finance

Warnings
None

Fact-check
100% passed
```

---

# 39. Document Provenance

Chaque document doit permettre de remonter vers les claims utilisés.

Table :

| Statement | Claim | Status | Evidence |
|---|---|---|---|
| SQL | knows SQL | VERIFIED | CV 2025 |
| Financial analysis | experience | VERIFIED | Project |
| Power BI | knows Power BI | UNVERIFIED | None |

---

# 40. AI Activity Center

## 40.1 Objectif

Créer une page dédiée à la transparence de l'IA.

Afficher :

```text
AI Activity

Model
Prompt version
Input
Output
Validation
Warnings
Claims used
Timestamp
Correlation ID
```

---

# 41. AI Explainability Panel

Exemple :

```text
Generated by
NVIDIA-hosted model

Prompt
job-analysis-v4

Inputs
Job #JOB-2026-000123
Profile snapshot #PS-021

Claims used
12 verified claims

Validation
✓ JSON schema
✓ Claim validation
✓ Deterministic scoring

Warnings
Prompt injection pattern detected
```

---

# 42. Automation Center

## 42.1 Visualisation

Créer une interface de type workflow.

Exemple :

```text
Schedule
   ↓
Source
   ↓
Extract
   ↓
Normalize
   ↓
Deduplicate
   ↓
Analyze
   ↓
Score
   ↓
Dashboard
```

---

# 43. Workflow Card

```text
WF-001
Job Ingestion

Status
RUNNING

Last run
09:42

Next run
10:42

Success rate
98.4%

[View workflow]
```

---

# 44. Automation Workflows

Prévoir les workflows suivants :

### WF-001 — Job Ingestion

```text
Schedule
→ Get source
→ Extract
→ Normalize
→ Deduplicate
→ POST /jobs
→ Audit
```

### WF-002 — Job Analysis

```text
New JobOffer
→ Career OS API
→ AI extraction
→ Validate JSON
→ Persist analysis
→ Audit
```

### WF-003 — Daily Re-scoring

```text
Schedule
→ Active jobs
→ Current profile
→ Deterministic scorer
→ Persist score
→ Update dashboard
```

### WF-004 — Gmail Sync

```text
Gmail event
→ Normalize
→ Link application
→ Classify
→ Persist
→ Audit
```

### WF-005 — Reminder

```text
Schedule
→ Applications waiting
→ Evaluate waiting period
→ Reminder
```

### WF-006 — Analytics

```text
Schedule
→ Aggregate applications
→ Calculate KPIs
→ Store snapshots
```

---

# 45. Analytics — Career Intelligence

## 45.1 KPIs

Le produit doit prévoir :

```text
Jobs discovered
Jobs analyzed
Average score
Jobs shortlisted
Applications sent
Response rate
Interview rate
Offer rate
Rejection rate
```

---

# 46. Analytics dimensions

Filtres :

```text
Source
Company
Role
Score range
CV version
Keyword
Application month
```

---

# 47. Analytics Funnel

Visualisation :

```text
Jobs discovered
      ↓
Jobs analyzed
      ↓
Shortlisted
      ↓
Applications
      ↓
Responses
      ↓
Interviews
      ↓
Offers
      ↓
Accepted
```

---

# 48. Career Performance Insights

Ajouter une section :

> **What is working?**

Exemples :

```text
Your applications with score > 80%
receive 2.4× more responses.

CV version 4 performs better
for financial analyst roles.

Your strongest keyword cluster:
Financial Analysis
```

Ces insights doivent être basés sur des données réellement disponibles.

---

# 49. Audit Center

## 49.1 Objectif

L'audit ne doit pas être caché dans les settings.

Il constitue une fonctionnalité de confiance.

---

## 49.2 Audit table

Filtres :

```text
Actor
Action
Entity
Date
Correlation ID
Result
```

Colonnes :

```text
Timestamp
Actor
Action
Entity
Source
Result
Correlation ID
```

---

# 50. Audit Event Detail

```text
JOB_SCORED

Actor
SYSTEM

Entity
Job #123

Before
—

After
Score: 87

Correlation ID
JOB-2026-000123

Timestamp
2026-09-13 09:42
```

Les événements d'audit doivent être considérés comme **append-only** dans l'interface normale.

---

# 51. Global status system

Le produit doit avoir un système de statut cohérent.

```text
SUCCESS
WARNING
ERROR
INFO
PENDING
RUNNING
VERIFIED
UNVERIFIED
REJECTED
APPROVED
```

---

# 52. Loading states

Ne jamais afficher un écran vide pendant une opération.

Prévoir :

- skeleton cards ;
- skeleton tables ;
- progress indicators ;
- shimmer très discret ;
- loading button ;
- optimistic UI uniquement lorsque sûr.

---

# 53. Empty states

Chaque page doit avoir un empty state utile.

Exemple Jobs :

```text
No opportunities yet

Career OS hasn't found any opportunities
matching your current setup.

[Import a job]
```

Éviter :

```text
No data
```

sans explication.

---

# 54. Error states

Une erreur doit expliquer :

1. ce qui s'est passé ;
2. pourquoi ;
3. ce que l'utilisateur peut faire.

Exemple :

```text
Analysis couldn't be completed

The AI response didn't match the expected schema.

No data was saved.

[Retry analysis]
[View technical details]
```

---

# 55. Toast system

Les notifications doivent être courtes.

Exemples :

```text
Claim verified
CV generated
Job analyzed
Application moved to PRETE
Evidence uploaded
```

Éviter les toasts contenant plusieurs paragraphes.

---

# 56. Motion Design

## 56.1 Principes

Les animations doivent renforcer la compréhension.

Durées recommandées :

```text
Fast       120–180ms
Normal     200–280ms
Slow       300–450ms
```

---

## 56.2 Animations recommandées

### Score

Le score peut s'animer légèrement à son apparition.

### Kanban

Transition douce lorsqu'une candidature change d'étape.

### AI processing

Afficher une progression :

```text
Reading job
Analyzing requirements
Matching claims
Calculating score
Preparing explanation
```

### Evidence graph

Animation subtile lors de l'ouverture des relations.

---

# 57. Micro-interactions

Exemples :

- hover sur claim ;
- preview d'evidence ;
- copy correlation ID ;
- reveal provenance ;
- expand score breakdown ;
- approve document ;
- confirm state transition.

---

# 58. Design des boutons

Hiérarchie :

### Primary

Action principale :

```text
Analyze Job
Generate CV
Approve
Create Application
```

### Secondary

```text
View
Edit
Open
```

### Tertiary

```text
Cancel
Back
More
```

### Destructive

```text
Reject
Delete
```

---

# 59. Tables

Les tables doivent être utilisées pour les données comparables.

Exemples :

- claims ;
- evidence ;
- audit ;
- analytics ;
- applications.

Fonctions :

- tri ;
- filtres ;
- pagination ;
- recherche ;
- sélection ;
- actions contextuelles.

---

# 60. Responsive Design

## Desktop

Sidebar persistante.

## Tablet

Sidebar compacte.

## Mobile

Navigation :

```text
Bottom navigation
+
Drawer
```

Le mobile doit prioriser :

```text
Dashboard
Jobs
Applications
Profile
```

---

# 61. Accessibilité

Objectifs :

- navigation clavier ;
- focus visible ;
- contraste suffisant ;
- labels explicites ;
- aria-labels ;
- ne pas dépendre uniquement des couleurs ;
- états lisibles par screen reader ;
- boutons accessibles ;
- modales avec focus management.

---

# 62. Design tokens

Prévoir une couche centralisée :

```text
colors
typography
spacing
radius
shadows
motion
breakpoints
z-index
```

Ne jamais disperser les valeurs directement dans chaque composant.

---

# 63. Component Library

Créer au minimum :

```text
Button
IconButton
Badge
StatusBadge
Card
MetricCard
DataTable
Tabs
Modal
Drawer
Dialog
Tooltip
Dropdown
Select
Input
Textarea
Search
CommandPalette
Progress
ScoreRing
ScoreBreakdown
Timeline
KanbanBoard
KanbanCard
EvidenceCard
ClaimCard
JobCard
ApplicationCard
DocumentPreview
AuditEvent
EmptyState
ErrorState
Skeleton
Toast
```

---

# 64. Feature components

Créer ensuite :

```text
CareerHealth
OpportunityRadar
SkillGapRadar
MatchScore
MatchBreakdown
ClaimEvidenceGraph
ApplicationPipeline
ApplicationTimeline
DocumentProvenance
AIExplainability
WorkflowGraph
AuditExplorer
```

---

# 65. Architecture UI recommandée

Organisation possible :

```text
apps/web/

components/
├── ui/
├── layout/
├── navigation/
├── dashboard/
├── profile/
├── evidence/
├── claims/
├── jobs/
├── applications/
├── documents/
├── contacts/
├── analytics/
├── automation/
├── audit/
└── ai/
```

---

# 66. Architecture UX des données

Le design doit respecter le modèle métier.

```text
Master Profile
      ↓
Claims
      ↑
Evidence
      ↓
Job Matching
      ↓
Score
      ↓
Documents
      ↓
Application
      ↓
Communication
      ↓
Analytics
```

---

# 67. Relation entre IA et UI

L'IA ne doit jamais être représentée comme une autorité absolue.

Préférer :

```text
AI suggestion
```

à :

```text
AI decision
```

Préférer :

```text
System validated
```

à :

```text
AI verified
```

La **validation déterministe** doit être visuellement distinguée de la génération IA.

---

# 68. Sécurité visible

Sans révéler des détails techniques inutiles, l'interface peut afficher :

```text
Secure
Evidence verified
Human approval required
Audit recorded
```

Pour les actions sensibles :

```text
This action requires approval.

[Review]
[Approve]
```

---

# 69. Approval UX

Les actions sensibles doivent suivre :

```text
Preview
 ↓
Validation
 ↓
Human approval
 ↓
Audit record
 ↓
External action
```

Actions concernées notamment :

```text
SEND_EMAIL
MARK_APPLICATION_SENT
EXPORT_DOCUMENT
```

---

# 70. Onboarding

Créer un onboarding en étapes.

```text
1. Profile
2. Evidence
3. Claims
4. Preferences
5. First Job
6. First Match
7. First Application
```

Afficher une progression :

```text
Career OS setup
████████░░ 80%
```

---

# 71. Onboarding — First value

L'utilisateur doit atteindre rapidement un premier résultat.

Flow recommandé :

```text
Create profile
      ↓
Import CV
      ↓
Extract evidence
      ↓
Verify claims
      ↓
Import job
      ↓
Calculate match
      ↓
Show recommendation
```

---

# 72. Commercialisation

Le design doit permettre à terme plusieurs niveaux :

```text
Free
Pro
Advanced
Enterprise
```

Mais la logique tarifaire ne doit pas être injectée trop tôt dans l'interface personnelle.

---

# 73. Future SaaS architecture

Prévoir conceptuellement :

```text
Workspace
 ├── User
 ├── Profile
 ├── Evidence
 ├── Claims
 ├── Jobs
 ├── Applications
 ├── Documents
 ├── Automations
 └── Audit
```

---

# 74. Personnalisation future

Prévoir la possibilité de :

- thèmes ;
- préférences d'affichage ;
- colonnes personnalisées ;
- filtres sauvegardés ;
- vues sauvegardées ;
- templates ;
- règles de scoring ;
- notifications.

---

# 75. Dark Mode

Le dark mode peut être prévu dès le design system.

Il ne doit pas être ajouté après coup.

Créer les tokens :

```text
light.background
light.surface
light.text

dark.background
dark.surface
dark.text
```

---

# 76. Architecture des pages

Pages prévues :

```text
/dashboard
/profile
/evidence
/claims
/jobs
/jobs/[id]
/applications
/applications/[id]
/documents
/documents/[id]
/contacts
/analytics
/audit
/automation
/settings
```

Ces routes correspondent au périmètre fonctionnel prévu dans le plan produit.

---

# 77. Priorité de design

## P0 — Core experience

1. Dashboard
2. Jobs
3. Job Detail
4. Applications
5. Application Detail
6. Profile
7. Evidence
8. Claims

## P1 — Production

9. Documents
10. AI Activity
11. Contacts
12. Analytics

## P2 — Advanced

13. Automation
14. Audit
15. Settings

---

# 78. Signature UX

La signature du produit doit être :

# MATCH → EVIDENCE → DECISION → ACTION

Chaque grande page doit contribuer à cette boucle.

---

# 79. Exemple de parcours complet

```text
USER
 ↓
Profile
 ↓
Evidence
 ↓
Verified Claims
 ↓
Job discovered
 ↓
AI analysis
 ↓
Deterministic score
 ↓
Gap analysis
 ↓
User decision
 ↓
CV generation
 ↓
Fact-check
 ↓
User approval
 ↓
Application
 ↓
State machine
 ↓
Communication
 ↓
Response
 ↓
Analytics
```

---

# 80. Règles UX critiques

## Rule 1

**No unsupported professional claim should look verified.**

## Rule 2

**No AI output should look like a final decision unless the deterministic system has validated it.**

## Rule 3

**No external action should appear automatic when human approval is required.**

## Rule 4

**Every important generated document should expose provenance.**

## Rule 5

**Every important system action should be traceable.**

## Rule 6

**The interface should explain why, not only what.**

---

# 81. États obligatoires des composants

Chaque composant important doit prévoir :

```text
Default
Hover
Active
Focus
Disabled
Loading
Success
Warning
Error
Empty
Skeleton
```

---

# 82. UX Writing

Le langage doit être :

- court ;
- professionnel ;
- direct ;
- orienté action ;
- explicatif.

Préférer :

> **3 verified claims support this statement**

à :

> This statement seems reliable.

Préférer :

> **Missing evidence**

à :

> Something might be wrong.

---

# 83. Principes de différenciation

Career OS ne doit pas se positionner comme :

```text
another CV builder
another job board
another AI job assistant
```

Il doit se positionner comme :

> **A verified career intelligence system.**

Différenciateurs :

1. Evidence-backed profile
2. Deterministic scoring
3. Explainable matching
4. Controlled AI generation
5. Provenance
6. Application state machine
7. Audit trail
8. Automation
9. Human approval

---

# 84. Architecture de confiance

Le produit peut présenter visuellement un "Trust Layer".

```text
┌─────────────────────────────┐
│        USER ACTION          │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       AI PROPOSAL           │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ DETERMINISTIC VALIDATION    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│      HUMAN APPROVAL         │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│      EXTERNAL ACTION        │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       AUDIT RECORD          │
└─────────────────────────────┘
```

---

# 85. Roadmap design

## Phase 1 — UX Foundation

Livrables :

- sitemap ;
- navigation ;
- user flows ;
- wireframes ;
- information architecture.

## Phase 2 — Design System

Livrables :

- couleurs ;
- typographie ;
- spacing ;
- composants ;
- tokens ;
- responsive rules ;
- accessibility.

## Phase 3 — Core UI

Construire :

- Dashboard ;
- Profile ;
- Evidence ;
- Claims ;
- Jobs ;
- Job Detail ;
- Applications ;
- Application Detail.

## Phase 4 — Intelligence

Construire :

- AI Activity ;
- explainability ;
- scoring ;
- gap analysis ;
- provenance.

## Phase 5 — Documents

Construire :

- CV Studio ;
- Cover Letter Studio ;
- preview ;
- fact-check ;
- approval.

## Phase 6 — Operations

Construire :

- Contacts ;
- Analytics ;
- Automation ;
- Audit ;
- Settings.

## Phase 7 — Commercial polish

Ajouter :

- onboarding ;
- empty states ;
- tooltips ;
- command palette ;
- micro-interactions ;
- responsive polish ;
- accessibility ;
- performance ;
- branding ;
- pricing-ready architecture.

---

# 86. Critères d'acceptation UX

## Navigation

- [ ] Toutes les pages principales sont accessibles depuis la navigation.
- [ ] Les sections sont regroupées logiquement.
- [ ] Le breadcrumb est cohérent.
- [ ] La command palette permet d'accéder aux actions principales.

## Profile

- [ ] Les sections Identity, Experience, Education, Skills, Certifications, Projects, Achievements et Evidence sont présentes.
- [ ] Les statuts Verified / Unverified / Missing Evidence sont visibles.
- [ ] Les claims sont accessibles depuis les compétences.

## Jobs

- [ ] Le score est visible.
- [ ] Les dimensions du score sont expliquées.
- [ ] Les skills matched sont visibles.
- [ ] Les missing skills sont visibles.
- [ ] Les risk flags sont visibles.
- [ ] Une recommandation est affichée.

## Applications

- [ ] Le pipeline correspond à la state machine.
- [ ] Les transitions disponibles sont claires.
- [ ] La timeline est consultable.
- [ ] Les événements affichent leur provenance.

## Documents

- [ ] Les claims utilisés sont visibles.
- [ ] Les documents peuvent être prévisualisés.
- [ ] La provenance est consultable.
- [ ] Le statut d'approbation est clair.

## AI

- [ ] Le modèle est identifiable.
- [ ] La version du prompt est identifiable.
- [ ] Les inputs sont identifiables.
- [ ] Les warnings sont visibles.
- [ ] Les claims utilisés sont identifiables.

## Audit

- [ ] Les événements sont filtrables.
- [ ] Le correlation ID est visible.
- [ ] L'acteur est visible.
- [ ] L'action est visible.
- [ ] Les changements avant/après sont consultables.

---

# 87. Definition of Done — Design

Une fonctionnalité UI n'est pas considérée comme terminée uniquement parce que l'écran fonctionne.

Elle doit satisfaire :

```text
UX
+
UI
+
Responsive
+
Accessibility
+
Loading
+
Empty
+
Error
+
Success
+
Security UX
+
AI transparency
+
Audit visibility
+
Documentation
```

Le design doit rester aligné avec les exigences fonctionnelles et les contraintes métier du produit.

---

# 88. Recommandation finale

Le design de Career OS doit éviter le piège d'un dashboard classique composé de dizaines de cartes.

Le produit doit donner la sensation d'un **système opérationnel vivant**.

L'utilisateur doit toujours comprendre :

```text
WHERE AM I?
     ↓
WHAT DO I KNOW?
     ↓
WHAT IS VERIFIED?
     ↓
WHAT OPPORTUNITY EXISTS?
     ↓
WHY IS IT A MATCH?
     ↓
WHAT IS MISSING?
     ↓
WHAT SHOULD I DO?
     ↓
WHAT WAS GENERATED?
     ↓
WHAT DID I APPROVE?
     ↓
WHAT HAPPENED?
```

La meilleure expression visuelle du produit est donc :

# CAREER OS

### **From professional evidence to career action.**

Et sa boucle fonctionnelle :

# **MATCH → EVIDENCE → DECISION → ACTION → FEEDBACK**

---

## 89. Source d'alignement fonctionnel

Le présent cahier des charges UX/UI est aligné sur le périmètre fonctionnel fourni dans `README.md` et `plan.md`.

Le produit est défini comme un Career OS local-first avec :

- profil professionnel fondé sur des preuves ;
- claims et validation déterministe ;
- ingestion et analyse d'offres ;
- scoring déterministe ;
- génération contrôlée de CV et lettres ;
- state machine des candidatures ;
- automatisation n8n ;
- audit trail immuable ;
- provenance des contenus générés.

Le plan définit également les pages principales `/dashboard`, `/profile`, `/evidence`, `/claims`, `/jobs`, `/jobs/[id]`, `/applications`, `/applications/[id]`, `/documents`, `/documents/[id]`, `/contacts`, `/analytics`, `/audit`, `/automation` et `/settings`.

Le principe central reste :

> **AI proposes. Deterministic code validates and decides. Humans authorize external actions.**
