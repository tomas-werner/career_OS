# 📋 Spécification — Approval UI

**Date:** 2026-09-17
**Statut:** DRAFT
**Lien:** Audit 02 (P1.3), Audit 03 (Gap P1.3), human-control-gates.md

---

## 🎯 1. Objectif

Fournir une interface utilisateur pour **visualiser, comprendre et décider** sur les demandes d'approbation en attente (Human Control Gates).

---

## 🎯 2. User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| **US-1** | En tant qu'utilisateur, je veux voir toutes les approbations en attente | Liste paginée, filtres par type/action/date |
| **US-2** | En tant qu'utilisateur, je veux comprendre le contexte d'une approbation | Détail : entité, action, payload, hash, expiration |
| **US-3** | En tant qu'utilisateur, je veux approuver ou rejeter | Boutons Approuver/Rejeter, confirmation, feedback |
| **US-4** | En tant qu'utilisateur, je veux voir l'historique | Onglet "Historique" avec décisions passées |
| **US-5** | En tant qu'utilisateur, je veux être notifié | Toast/notification quand nouvelle demande créée |
---

## 🎯 3. Pages & Routes

| Route | Type | Description |
|-------|------|-------------|
| `/approvals` | **Server Component** | Liste paginée des approbations en attente (pending) |
| `/approvals/history` | **Server Component** | Historique des décisions (granted/denied) |
| `/approvals/[correlationId]` | **Server Component** | Détail d'une approbation + actions |
| `POST /api/approvals` | **API Route** | Enregistrer décision (existant) |
| `GET /api/approvals/pending` | **API Route** | Liste JSON pour polling/refresh |

---

## 🎯 4. Composants UI Requis

### 4.1 Page Liste (`/approvals`)

```
┌─────────────────────────────────────────────────────────────┐
│  Approbations en attente                    [Filtres ▼]    │
├─────────────────────────────────────────────────────────────┤
│  ☐ Correlation ID    │ Entité      │ Action           │ Âge │
│  ────────────────────┼─────────────┼──────────────────┼─────│
│  ☐ APP-ABC123        │ Application │ MARK_APPLICATION │ 2h  │
│  ☐ CV-DEF456-EXPORT  │ CvVersion   │ EXPORT_DOCUMENT  │ 1j  │
│  ☐ GMAIL-GHI789      │ EmailDraft  │ SEND_EMAIL       │ 30m │
├─────────────────────────────────────────────────────────────┤
│  [Sélectionner tout]  [Approuver sélection] [Rejeter]    │
└─────────────────────────────────────────────────────────────┘
```

**Fonctionnalités :**
- Table paginée (50 lignes/page)
- Filtres : Action, Entity Type, Date range, Expires soon
- Tri : Plus ancien d'abord (FIFO)
- Checkbox par ligne + "Tout sélectionner"
- Actions en lot : Approuver/Rejeter sélection
- Badge "Expire bientôt" (< 24h) / "Expiré" (rouge)

### 4.2 Page Détail (`/approvals/[correlationId]`)

```
┌─────────────────────────────────────────────────────────────┐
│  Approbation : APP-ABC123                    [Retour]      │
├─────────────────────────────────────────────────────────────┤
│  Contexte                                                    │
│  ─────────────────────────────────────────────────────────  │
│  Entité      : Application (app_xyz789)                     │
│  Action      : MARK_APPLICATION_SENT                        │
│  Transition  : PRETE → ENVOYEE                              │
│  Demandé le  : 2026-09-17 10:30                             │
│  Expire le   : 2026-09-24 10:30    ⚠️ Dans 3 jours          │
│  Content Hash: a1b2c3d4... (cliquer pour copier)            │
├─────────────────────────────────────────────────────────────┤
│  Payload à valider                                           │
│  ─────────────────────────────────────────────────────────  │
│  {                                                            │
│    "toStatus": "ENVOYEE",                                     │
│    "note": "CV joint, lettre de motivation personnalisée"    │
│  }                                                            │
├─────────────────────────────────────────────────────────────┤
│  Liens contextuels                                            │
│  ─────────────────────────────────────────────────────────  │
│  [Voir Application]  [Voir CV joint]  [Voir Audit trail]    │
├─────────────────────────────────────────────────────────────┤
│  [Approuver]  [Rejeter]                                       │
│  Raison du rejet (optionnel): [________________________]    │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Composants Partagés (Design System)

| Composant | Usage |
|-----------|-------|
| `ApprovalTable` | Tableau liste avec checkbox, tri, pagination |
| `ApprovalRow` | Ligne individuelle avec actions rapides |
| `ApprovalDetail` | Carte détail avec payload JSON formaté |
| `ApprovalActions` | Boutons Approuver/Rejeter + modal confirmation |
| `ApprovalFilters` | Barre de filtres (Action, Entity, Date, Expiration) |
| `ApprovalBadge` | Badge status : Pending (warn), Granted (ok), Denied (err), Expired (muted) |

---

## 🎯 5. Flux d'Interaction

### 5.1 Approbation Unique

1. Utilisateur clique ligne → `/approvals/APP-ABC123`
2. Lit le contexte, vérifie le payload
3. Clique **[Approuver]**
4. Modal confirmation : "Confirmer l'approbation pour MARK_APPLICATION_SENT ?"
5. POST `/api/approvals` `{ correlationId, approved: true, actor: "USER" }`
6. Toast succès → Redirection vers liste (rafraîchie)
7. L'action originale (transition application) peut maintenant réussir

### 5.2 Rejet

1. Même flux mais clique **[Rejeter]**
2. Champ "Raison" optionnel affiché
3. POST `/api/approvals` `{ correlationId, approved: false, actor: "USER", reason: "..." }`
4. Toast info → Redirection liste

### 5.3 Actions en Lot

1. Coche plusieurs lignes (ou "Tout sélectionner")
2. Clique **[Approuver sélection]** ou **[Rejeter sélection]**
3. Modal : "Approuver 3 approbations ?"
4. Boucle POST `/api/approvals` pour chaque correlationId
5. Toast résumé : "3 approuvées, 0 échouées"

---

## 🎯 6. API Endpoints Requis

### 6.1 GET /api/approvals/pending
```typescript
// Query params: page, pageSize, action, entityType, dateFrom, dateTo, expiresSoon
// Response
{
  "pending": [
    {
      "correlationId": "APP-abc123",
      "entityType": "Application",
      "entityId": "app_xyz789",
      "action": "MARK_APPLICATION_SENT",
      "createdAt": "2026-09-17T10:30:00Z",
      "expiresAt": "2026-09-24T10:30:00Z",
      "contentHash": "a1b2c3d4...",
      "payload": { "toStatus": "ENVOYEE", "note": "..." }
    }
  ],
  "pagination": { "page": 1, "pageSize": 50, "total": 12, "pages": 1 }
}
```

### 6.2 GET /api/approvals/history
```typescript
// Même structure mais approved !== null
```

### 6.3 GET /api/approvals/[correlationId]
```typescript
// Détail complet pour page détail
```

---

## 🎯 7. Notifications (Optionnel P1, Recommandé P2)

| Canal | Déclencheur | Contenu |
|-------|-------------|---------|
| **Toast (in-app)** | Nouvelle approval créée | "Nouvelle approbation requise : MARK_APPLICATION_SENT" |
| **Email** | Configuré par utilisateur | Lien direct vers `/approvals/[id]` |
| **n8n** | Webhook approval created | Pour intégrations futures (Slack, Teams) |

**Implémentation minimale P1 :** Toast in-app via client-side polling (toutes les 30s) ou Server-Sent Events.

---

## 🎯 8. Sécurité

- **CSRF Protection** : Next.js built-in (same-origin)
- **Authorization** : Seul l'utilisateur propriétaire (single-user app) ou rôle admin futur
- **Rate Limiting** : Sur POST /api/approvals (max 30/min)
- **Audit** : Toute décision déjà tracée via `writeAudit` existant

---

## 🎯 9. Tests Requis

| Test | Scénario |
|------|----------|
| **E2E List** | Liste affiche approvals pending avec pagination |
| **E2E Detail** | Détail montre payload, hash, liens contextuels |
| **E2E Approve** | Approuver → API called → Toast → Redirect → Liste mise à jour |
| **E2E Reject** | Rejeter avec raison → API called → Audit trail |
| **E2E Batch** | Sélection multiple → Approuver tout → Résumé toast |
| **E2E Filters** | Filtre par action/entity/date fonctionne |
| **E2E Expired** | Approval expirée affichée avec badge "Expiré" |
| **Unit** | Composants render sans erreur, props validées |

---

## 🎯 10. Critères de Validation

- [ ] Page `/approvals` accessible et fonctionnelle
- [ ] Liste paginée, filtres, tri opérationnels
- [ ] Page détail `/approvals/[correlationId]` complète
- [ ] Actions Approuver/Rejeter (unique + lot) fonctionnent
- [ ] Redirection post-action avec feedback utilisateur
- [ ] Liens contextuels (Application, CV, Audit) naviguent correctement
- [ ] Content hash affiché et copiable
- [ ] Badges d'expiration visuels (warn/err)
- [ ] Tests E2E passent (Vitest + Playwright ou similar)

---

## 🎯 11. Dépendances

- **human-control-gates.md** : API `/api/approvals/pending` et structure données
- **Audit 03** : Migration Prisma `ApprovalAction` étendu
- **Design System** (P2.2) : Composants Table, Button, Modal, Badge, Input
- **Existant** : `lib/approval.ts`, `writeAudit`, Prisma `Approval` model

---

## 🎯 12. Références

- ADR-002 : AI Boundaries
- ADR-004 : Audit & Immutabilité
- Plan.md Section 24 (Approvals)
- Audit 02 : Gap P1.3 Approval UI
- Audit 03 : Architecture Gap Analysis
- human-control-gates.md (spec sœur)