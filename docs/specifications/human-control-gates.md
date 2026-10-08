# 📋 Spécification — Human Control Gates

**Date:** 2026-09-17
**Statut:** DRAFT
**Lien:** Audit 02 (P1.2), Audit 03 (Gap P1.2)

---

## 🎯 1. Objectif

Implémenter le principe **"AI propose. Deterministic code validates and decides. Humans authorize external actions."** (ADR-002) en ajoutant des **gates de contrôle humain** obligatoires avant toute action externe irréversible.

---

## 🎯 2. Principe Fondamental

| Niveau | Responsabilité | Exemple |
|--------|----------------|---------|
| **AI** | Propose, extrait, suggère | Extraction job, scoring, rédaction CV |
| **Code Deterministe** | Valide, décide, exécute | State machine, fact-check, scoring, déduplication |
| **Humain** | **Autorise** les actions externes | Envoi email, export PDF, déclenchement n8n, API calls |

**Règle d'or :** Aucune action aux effets de bord externes (email, API, fichier, n8n) ne s'exécute sans approbation humaine explicite tracée.

---

## 🎯 3. Actions Couvertes (ApprovalAction Enum)

### 3.1 Actions Existantes (déjà dans Prisma)

```prisma
enum ApprovalAction {
  SEND_EMAIL              // Envoi email via Gmail API
  MARK_APPLICATION_SENT   // Transition PRETE → ENVOYEE
  EXPORT_DOCUMENT         // Export PDF/DOCX d'un CV ou cover letter
}
```

### 3.2 Nouvelles Actions (à ajouter via migration)

```prisma
enum ApprovalAction {
  // ... existantes
---

## 🎯 4. Modèle de Données

### 4.1 Table `Approval` (existante)

```prisma
model Approval {
  id          String         @id @default(cuid())
  entityType  String         // "Application", "CvVersion", "N8nWorkflow", "ExternalApiCall"
  entityId    String         // ID polymorphe (pas de FK DB)
  action      ApprovalAction // Enum ci-dessus
  approvedBy  String         // "USER" | "SYSTEM" (pour auto-approval future)
  approvedAt  DateTime       @default(now())
  contentHash String         // Hash du contenu à valider (pour détecter modification post-approval)
  expiresAt   DateTime?      // Expiration optionnelle (ex: 24h)
  
  @@unique([entityType, entityId, action])
  @@index([entityType, entityId])
}
```

### 4.2 Corrélation

---

## 🎯 5. Flux d'Approbation

### 5.1 Création d'une Demande (Draft)

```typescript
// Côté serveur : quand une action externe est demandée
async function requestApproval(input: {
  correlationId: string;      // Ex: "APP-abc123"
  entityType: string;         // "Application"
  entityId: string;           // application.id
  action: ApprovalAction;     // MARK_APPLICATION_SENT
  contentHash: string;        // Hash du payload à valider
  expiresAt?: Date;           // Optionnel
}): Promise<void> {
  // 1. Créer le draft d'approbation (approved = null)
  await db.approval.create({
    correlationId: input.correlationId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    contentHash: input.contentHash,
    expiresAt: input.expiresAt,
    // approved: null = EN ATTENTE
  });
  
  // 2. Auditer la demande
  await writeAudit({
    actorType: 'SYSTEM',
    action: 'APPROVAL_REQUESTED',
    entityType: input.entityType,
    entityId: input.entityId,
    correlationId: input.correlationId,
    metadata: { action: input.action, contentHash: input.contentHash }
  });
}
```

### 5.2 Vérification avant Exécution (Guard)

```typescript
// Dans lib/approval.ts - existe déjà mais doit être UTILISÉ
export async function guardSend(correlationId: string): Promise<void> {
  const approval = await db.approval.findFirst({
    where: { correlationId },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!approval) {
    throw new ApprovalError('NO_RECORD', 'Aucun enregistrement d\'approbation trouvé');
  }
  
  if (approval.approved !== true) {
    throw new ApprovalError('NOT_APPROVED', 'Action non approuvée par l\'humain');
  }
  
---

## 🎯 6. Points d'Intégration Obligatoires

### 6.1 Transition Application : PRETE → ENVOYEE

**Fichier :** `apps/web/app/api/applications/[id]/route.ts` (PATCH)

```typescript
// AVANT la transition
if (toStatus === 'ENVOYEE' && fromStatus === 'PRETE') {
  const correlationId = `APP-${application.id.slice(0, 8).toUpperCase()}`;
  
  // 1. Vérifier si approval existe déjà
  const existing = await checkApproval(correlationId);
  
  if (!existing) {
    // 2. Créer demande d'approbation
    await requestApproval({
      correlationId,
      entityType: 'Application',
      entityId: application.id,
      action: 'MARK_APPLICATION_SENT',
      contentHash: hashContent(JSON.stringify({ toStatus, note })),
      expiresAt: addDays(new Date(), 7)
    });
    
    // 3. Retourner 428 Precondition Required (draft créé)
    return NextResponse.json(
      { 
        error: 'Human approval required', 
        approvalRequired: true,
        correlationId,
        message: 'Cette transition nécessite une validation humaine. Consultez /approvals.'
      },
      { status: 428 }
    );
  }
  
  if (existing.approved !== true) {
    return NextResponse.json(
      { error: 'Approval denied', correlationId },
      { status: 403 }
    );
  }
  
  // 4. Approval accordée → procéder à la transition
  await guardSend(correlationId); // Double-check
}
```

### 6.2 Export Document (PDF/DOCX)

**Fichier :** `apps/web/app/api/documents/cv/route.ts` (nouvel endpoint GET /export?format=pdf)

```typescript
// Nouvel endpoint : GET /api/documents/cv/[id]/export?format=pdf
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const format = new URL(request.url).searchParams.get('format') || 'pdf';
  
  const correlationId = `CV-${id.slice(0, 8).toUpperCase()}-EXPORT`;
  
  // Vérifier approval
  const approval = await checkApproval(correlationId);
  if (!approval || approval.approved !== true) {
    // Créer draft si absent
    if (!approval) {
      await requestApproval({ ... });
    }
    return NextResponse.json(
      { error: 'Export requires human approval', approvalRequired: true, correlationId },
      { status: 428 }
    );
  }
  
  await guardSend(correlationId);
  
  // Générer PDF via document-renderer package
  const pdf = await renderCvToPdf(cvVersion);
  
  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="cv-${id}.pdf"` }
  });
}
```

### 6.3 Envoi Email (Gmail API - futur)

```typescript
// Dans package gmail ou API route
async function sendEmailViaGmail(input: { to: string; subject: string; body: string; applicationId?: string }) {
  const correlationId = `GMAIL-${input.applicationId || 'standalone'}-${Date.now()}`;
  
  const approval = await checkApproval(correlationId);
  if (!approval || approval.approved !== true) {
    if (!approval) await requestApproval({ ... action: 'SEND_EMAIL' ... });
    throw new ApprovalRequiredError(correlationId);
  }
  
  await guardSend(correlationId);
  
  // Appel effectif Gmail API
  const result = await gmailClient.send(input);
  
---

## 🎯 7. Gestion des Expirations & Nettoyage

| Politique | Valeur |
|-----------|--------|
| **Durée de vie par défaut** | 7 jours (configurable via env) |
| **Nettoyage drafts expirés** | Cron job quotidien (n8n ou pg_cron) |
| **Approbations accordées** | Conservées définitivement (audit) |
| **Approbations rejetées** | Conservées définitivement (audit) |

---

## 🎯 8. Sécurité & Anti-Tampering

1. **Content Hash** : Le hash du payload est stocké à la création du draft. À l'approbation, on revérifie que le contenu n'a pas été modifié.
2. **CorrelationId Unique** : Format `{ENTITY}-{SHORT_ID}-{ACTION}` pour traçabilité.
3. **Audit Immuable** : Toute création/décision/exécution est auditée (append-only).
4. **Pas d'Auto-Approval** : Par défaut, `approvedBy: 'USER'` requis. `SYSTEM` réservé aux cas exceptionnels (ex: retry après échec technique validé).

---

## 🎯 9. API Publique

### 9.1 POST /api/approvals
```json
// Request
{
  "correlationId": "APP-abc123",
  "approved": true,
  "actor": "USER",
  "reason": "Validé après vérification du CV"
}

// Response
{ "ok": true, "approval": { "id": "...", "approved": true, "approvedAt": "..." } }
```

### 9.2 GET /api/approvals?correlationId=APP-abc123
```json
// Response
{ "approved": true, "detail": { "approvedBy": "USER", "approvedAt": "...", "reason": "..." } }
```

### 9.3 GET /api/approvals/pending (pour UI)
```json
// Response
{ 
  "pending": [
    { "correlationId": "APP-abc123", "entityType": "Application", "entityId": "app_123", "action": "MARK_APPLICATION_SENT", "createdAt": "...", "expiresAt": "..." },
    { "correlationId": "CV-def456-EXPORT", "entityType": "CvVersion", "entityId": "cv_456", "action": "EXPORT_DOCUMENT", "createdAt": "...", "expiresAt": "..." }
  ]
}
```

---

## 🎯 10. Critères de Validation

- [ ] Migration Prisma : `ApprovalAction` étendu (N8N_TRIGGER, EXTERNAL_API_CALL)
- [ ] `guardSend` appelé dans : transition PRETE→ENVOYEE, export document, envoi email, trigger n8n
- [ ] Draft d'approbation créé automatiquement (status 428) quand absent
- [ ] Content hash vérifié à l'approbation
- [ ] Audit trail complet : REQUESTED → GRANTED/DENIED → EXECUTED
- [ ] Tests d'intégration : flow complet avec approval accordée/rejetée/expirée
- [ ] UI `/approvals` fonctionnelle (voir spec approval-ui.md)

---

## 🎯 11. Références

- ADR-002 : AI Boundaries
- ADR-004 : Audit & Immutabilité
- Plan.md Sections 19-21 (Application State Machine), 24 (Approvals), 30 (Audit)
- Audit 02 : Gap P1.2 Human Control Gates
- Audit 03 : Architecture Gap Analysis
  await writeAudit({ ... action: 'EMAIL_SENT' ... });
  return result;
}
```

### 6.4 Déclenchement n8n Workflow

```typescript
// POST /api/n8n/trigger
async function triggerN8nWorkflow(workflowId: string, payload: unknown) {
  const correlationId = `N8N-${workflowId}-${Date.now()}`;
  
  const approval = await checkApproval(correlationId);
  if (!approval || approval.approved !== true) {
    if (!approval) await requestApproval({ ... action: 'N8N_TRIGGER' ... });
    throw new ApprovalRequiredError(correlationId);
  }
  
  await guardSend(correlationId);
  
  // Appel n8n webhook
  const result = await n8nClient.trigger(workflowId, payload);
  
  await writeAudit({ ... action: 'N8N_TRIGGERED' ... });
  return result;
}
```
  // Vérifier expiration
  if (approval.expiresAt && new Date() > approval.expiresAt) {
    throw new ApprovalError('EXPIRED', 'Approbation expirée');
  }
  
  // Vérifier contentHash (anti-tampering)
  // Le caller doit fournir le hash actuel pour comparaison
}
```

### 5.3 Décision Humaine (Approve/Reject)

```typescript
// POST /api/approvals
async function recordApproval(input: {
  correlationId: string;
  approved: boolean;
  actor: 'USER' | 'SYSTEM';
  reason?: string;  // Optionnel pour rejection
}): Promise<void> {
  const approval = await db.approval.findFirst({
    where: { correlationId },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!approval) throw new Error('Approval not found');
  
  await db.approval.update({
    where: { id: approval.id },
    data: { 
      approved: input.approved,
      approvedBy: input.actor,
      approvedAt: new Date(),
      // Si rejeté, on garde le record pour audit
    }
  });
  
  await writeAudit({
    actorType: input.actor,
    action: input.approved ? 'APPROVAL_GRANTED' : 'APPROVAL_DENIED',
    entityType: approval.entityType,
    entityId: approval.entityId,
    correlationId,
    metadata: { action: approval.action, reason: input.reason }
  });
}
```
Chaque approval est lié à un **`correlationId`** (ex: `APP-<uuid>`, `CV-<uuid>`, `N8N-<uuid>`) qui permet de tracer la chaîne complète : demande → approval → exécution → audit.
  N8N_TRIGGER             // Déclencher un workflow n8n
  EXTERNAL_API_CALL       // Appel API externe générique (LinkedIn, job boards, etc.)
}
```