# 🔍 Audit 02 — Produit Career_OS

**Date:** 2026-09-17  
**Objectif:** Définir la vision produit, les fonctionnalités et le périmètre de Career_OS.

---

## 📋 Méthodologie

Cet audit analyse :
1. **Vision produit** — À quoi sert Career_OS ? Pour qui ? Quel problème résout-il ?
2. **Fonctionnalités** — Actuelles, prévues, inutiles, prioritaires
3. **Périmètre** — Ce qui est dans le projet vs hors périmètre

---

## 🎯 1. Vision Produit

### 1.1 Positionnement actuel (d'après README.md)

**Career OS** est un **Personal Career Operating System** :

> Local-first personal Career OS: evidence-backed master profile, deterministic
> job scoring, controlled CV/cover-letter generation, an enforced application
> state machine, n8n automation and an immutable audit trail.

**Principe fondamental :**

> **AI proposes. Deterministic code validates and decides. Humans authorize external actions.**

### 1.2 Problème résolu

Career_OS résout le problème de la **gestion fragmentée** de la carrière professionnelle :

- **Profil professionnel** dispersé (CV LinkedIn, CV PDF, compétences non traçables)
- **Offres d'emploi** non analysées et non comparées
- **Candidatures** sans suivi structuré
- **Documents** générés sans traçabilité des informations
- **Décisions** basées sur l'intuition plutôt que sur des données
- **Automatisation** manuelle ou inexistante

### 1.3 Cible utilisateur

**Utilisateur principal :** Professionnel en recherche d'emploi ou en développement de carrière

**Profils types :**
- Jeunes diplômés
- Professionnels en reconversion
- Candidats expérimentés
- Chercheurs d'emploi actifs

### 1.4 Proposition de valeur unique

**Evidence-based career management** avec :
- Preuves traçables pour chaque compétence
- Scoring déterministe des offres
- Génération contrôlée de documents
- Automatisation traçable
- Audit immuable

---

## 🔧 2. Fonctionnalités

### 2.1 Fonctionnalités actuelles (implémentées)

#### Stage A — Foundation ✅
- [x] Architecture monorepo pnpm + TypeScript strict
- [x] ADRs architecture (stack, AI boundaries, evidence, audit, n8n)
- [x] Base de données PostgreSQL Neon avec Prisma
- [x] Next.js 15 app avec dashboard + pages placeholder
- [x] Health endpoints (web, DB, n8n)
- [x] API routes validées Zod (jobs, applications state machine)
- [x] Docker Compose stack (web + n8n + proxy)
- [x] Scripts backup + smoke

#### Stage B — Knowledge Layer ✅
- [x] Master Profile avec sous-entités (expérience, éducation, skills, certifications)
- [x] Evidence engine (sources, evidence, claims)
- [x] Deterministic fact-checker
- [x] API routes profile/sources/evidence/claims
- [x] UI fonctionnelle Profile/Evidence/Claims

#### Stage C — Job Intelligence ✅
- [x] Deterministic versioned scoring
- [x] Three-level deduplication
- [x] AI extraction pipeline (NVIDIA)
- [x] API analyze/score jobs
- [x] UI jobs list + detail

#### Stage D — Documents ✅
- [x] Controlled generation domain
- [x] CV et cover letter generation
- [x] Document provenance
- [x] UI documents + generation

#### Stage E — Application Pipeline ✅
- [x] Application model + state machine
- [x] API applications + phone events
- [x] UI applications list + detail
- [x] Timeline avec correlation IDs

#### Stage H — Governance (partiel) ✅
- [x] Audit UI avec filtres
- [x] Analytics (KPIs)
- [x] Contacts management
- [ ] Observabilité avancée
- [ ] AI regression suite
- [ ] Security audit complet

### 2.2 Fonctionnalités prévues (spécifiées mais non implémentées)

#### CV Template Engine 📋
- [ ] 3 templates professionnels (ATS Professional, Finance & Banking, Executive Classic)
- [ ] Sélection automatique de template
- [ ] Français par défaut, anglais sur demande
- [ ] Optimisation de contenu sans falsification
- *Spécification complète dans docs/specifications/cv-templates-engine.md*

#### Gmail API Integration 📧
- [ ] OAuth 2.0 authentication
- [ ] Lecture et classification des emails
- [ ] Détection automatique (offres, entretiens, refus)
- [ ] Mise à jour Application Tracker
- [ ] Génération de réponses + brouillons
- [ ] Envoi avec validation utilisateur
- *Spécification complète dans docs/specifications/gmail-api-integration.md*

#### UX/UI Design System 🎨
- [ ] Design system complet (tokens, composants)
- [ ] Sidebar navigation groupée
- [ ] Dashboard Career Command Center
- [ ] Job Detail intelligence view
- [ ] Evidence/Claim graph
- [ ] Document Studio
- [ ] AI Activity Center
- [ ] Command Palette (⌘K)
- *Spécification complète dans docs/specifications/ux-ui-design.md*

#### Stage F — Automation 🤖
- [ ] n8n workflows fonctionnels
- [ ] Fixtures de test
- [ ] Scheduled job ingestion
- [ ] Daily re-scoring
- [ ] Gmail sync workflows

#### Stage G — Communications 📨
- [ ] Gmail OAuth implementation
- [ ] Email classification
- [ ] Application tracker updates
- [ ] Draft generation
- [ ] Send validation

### 2.3 Fonctionnalités inutiles ou hors périmètre

#### Explicitement exclues (plan.md Section 0)
- [x] ~~CAPTCHA solving~~
- [x] ~~Anti-bot bypassing~~
- [x] ~~Credential harvesting~~
- [x] ~~Session-cookie extraction~~
- [x] ~~Unauthorized scraping~~
- [x] ~~Automatic real-world job applications~~
- [x] ~~Automatic sending of real recruitment emails~~
- [x] ~~Circumventing source-site access controls~~

#### Priorités basses pour MVP
- [ ] PDF/DOCX renderers avancés
- [ ] Command Palette (⌘K)
- [ ] Full observability stack
- [ ] Advanced security audit
- [ ] Multi-user support

---

## 🎯 3. Périmètre du Produit

### 3.1 Dans le périmètre (CORE)

#### Gestion de Profil
- ✅ Master Profile centralisé
- ✅ Evidence-based claims
- ✅ Sous-entités (expérience, éducation, skills, certifications)
- ✅ Preuves traçables

#### Intelligence d'Offres
- ✅ Ingestion d'offres
- ✅ Analyse AI structurée
- ✅ Scoring déterministe
- ✅ Déduplication
- ✅ Matching profile-offre

#### Génération de Documents
- ✅ CV generation contrôlée
- ✅ Cover letter generation
- ✅ Provenance complète
- ✅ Templates multiples (prévu)

#### Gestion de Candidatures
- ✅ Application state machine
- ✅ Tracking structuré
- ✅ Timeline avec correlation IDs
- ✅ Phone events
- ✅ Contacts management

#### Automation
- ✅ n8n integration (prévu)
- ✅ Workflows schedulables (prévu)
- ✅ Gmail sync (prévu)

#### Governance
- ✅ Audit trail immuable
- ✅ Analytics
- ✅ Security baseline

### 3.2 Hors périmètre (EXPLICIT)

#### Fonctions anti-bot
- ❌ Scraping de sites protégés
- ❌ Bypass de CAPTCHA
- ❌ Credential harvesting

#### Actions automatiques non autorisées
- ❌ Envoi automatique d'emails sans validation
- ❌ Candidatures automatiques
- ❌ Actions externes sans approbation humaine

#### Fonctions SaaS multi-utilisateur
- ❌ Authentification multi-utilisateur (délibérément différé)
- ❌ RBAC complexe
- ❌ Multi-tenancy

#### Fonctions avancées hors MVP
- ❌ Video interview analysis
- ❌ Salary negotiation AI
- ❌ Career coaching AI
- ❌ Social media integration

---

## 📊 4. Analyse de Cohérence

### 4.1 Alignement Vision vs Implémentation

| Aspect | Vision | Implémentation | Alignement |
|--------|--------|----------------|------------|
| Evidence-based | Claims + Evidence | ✅ Implémenté | ✅ |
| Deterministic scoring | Version rules | ✅ Implémenté | ✅ |
| Controlled generation | Fact-check gate | ✅ Implémenté | ✅ |
| State machine | Application pipeline | ✅ Implémenté | ✅ |
| Immutable audit | AuditLog | ✅ Implémenté | ✅ |
| AI assistant | NVIDIA extraction | ✅ Implémenté | ✅ |
| Human control | Approval gates | ⚠️ Partiel | ⚠️ |
| Templates multiples | CV Template Engine | ❌ Spécifié seulement | ❌ |
| Gmail integration | Email automation | ❌ Spécifié seulement | ❌ |

### 4.2 Problèmes d'alignement identifiés

#### 1. Templates CV
- **Problème:** Spécification complète mais pas d'implémentation
- **Impact:** Fonctionnalité promise mais non disponible
- **Priorité:** Élevée (core feature)

#### 2. Gmail Integration
- **Problème:** Spécification complète mais pas d'implémentation
- **Impact:** Workflow candidature incomplet
- **Priorité:** Moyenne (automation)

#### 3. Human Control
- **Problème:** Approval gates partiels
- **Impact:** Risque d'actions automatiques non contrôlées
- **Priorité:** Critique (sécurité)

#### 4. UX/UI Design System
- **Problème:** Spécification détaillée mais UI basique
- **Impact:** Expérience utilisateur en dessous du potentiel
- **Priorité:** Moyenne (usability)

---

## 🎯 5. Recommandations

### 5.1 Fonctionnalités critiques à implémenter

#### Priorité 1 (Immédiat)
1. **CV Template Engine** — Core feature manquante
2. **Human Control Gates** — Sécurité critique
3. **Approval UI** - Validation des actions sensibles

#### Priorité 2 (Court terme)
1. **Gmail Integration Phase 1** — OAuth + lecture basique
2. **UX/UI Design System Phase 1** — Tokens + navigation
3. **Document rendering amélioré** — PDF/DOCX basiques

#### Priorité 3 (Moyen terme)
1. **Gmail Integration Phase 2-3** — Classification + tracking
2. **n8n workflows** — Automation basique
3. **Analytics avancés** — KPIs détaillés

### 5.2 Fonctionnalités à déprioriser

#### Pour MVP v1
- ❌ Command Palette (⌘K)
- ❌ Evidence/Claim graph visuel complexe
- ❌ AI Activity Center avancé
- ❌ Full observability stack
- ❌ Advanced security audit

#### Pour post-MVP
- ❌ Multi-user support
- ❌ Advanced PDF rendering
- ❌ Video interview analysis
- ❌ Salary negotiation features

---

## 📋 6. Périmètre recommandé pour MVP v1

### Core Features (Essentiels)
1. ✅ Profile + Evidence + Claims (déjà implémenté)
2. ✅ Job Intelligence (déjà implémenté)
3. ✅ CV Template Engine (à implémenter)
4. ✅ Application Pipeline (déjà implémenté)
5. ✅ Document Generation basique (déjà implémenté)
6. ✅ Audit Trail (déjà implémenté)

### Enhanced Features (Recommandés)
1. ⚠️ Human Control Gates (à renforcer)
2. ⚠️ Gmail Integration Phase 1 (à implémenter)
3. ⚠️ UX/UI Design System Phase 1 (à implémenter)

### Future Features (Post-MVP)
1. ❌ Gmail Integration Phase 2-3
2. ❌ n8n Automation
3. ❌ Advanced Analytics
4. ❌ Command Palette
5. ❌ Multi-user support

---

## 🎯 7. Redéfinition de la Vision Produit

### Vision clarifiée

**Career_OS** est un **Evidence-Based Career Management System** qui permet aux professionnels de :

1. **Construire un profil professionnel traçable** avec des preuves pour chaque compétence
2. **Analyser intelligemment les offres d'emploi** avec un scoring déterministe
3. **Générer des documents ciblés** basés sur des compétences vérifiées
4. **Gérer structuré les candidatures** avec un state machine enforced
5. **Automatiser les workflows** avec traçabilité complète

### Positionnement

**Pour :** Professionnels sérieux qui veulent une approche data-driven de leur carrière

**Contre :** Outils de job board classiques, CV makers automatisés sans traçabilité

### Différenciation

vs LinkedIn : Evidence-based vs network-based
vs JobTeaser : Deterministic scoring vs matching simpliste
vs CV makers : Provenance complète vs génération opaque

---

## ✅ Critères de validation

L'audit produit sera considéré comme terminé quand:

- [ ] Vision produit clarifiée et documentée
- [ ] Fonctionnalités actuelles inventoriées
- [ ] Fonctionnalités prévues prioritisées
- [ ] Périmètre produit défini
- [ ] Problèmes d'alignement identifiés
- [ ] Recommandations MVP formulées
- [ ] Roadmap fonctionnelle proposée

---

## 🎯 Prochaine étape

Une fois cet audit validé :

**Audit 03 — Architecture** : Analyser la structure technique actuelle vs l'architecture cible pour supporter la vision produit clarifiée.