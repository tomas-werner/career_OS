# Cahier des charges — Intégration Gmail API dans Career_OS

## 1. Objectif

Intégrer **Gmail API** à **Career_OS** afin de permettre :

- la connexion Gmail via **OAuth 2.0** ;
- la lecture et la recherche d'emails ;
- la détection des offres d'emploi ;
- l'identification des recruteurs ;
- la détection des confirmations de candidature ;
- la détection des invitations aux entretiens ;
- la détection des réponses positives ou négatives ;
- la mise à jour de l'**Application Tracker** ;
- la génération de réponses ;
- la création de brouillons Gmail ;
- l'envoi après validation explicite de l'utilisateur.

L'intégration doit respecter les principes de **sécurité**, **confidentialité** et **moindre privilège**.

## 2. Architecture fonctionnelle

```text
Career_OS
├── CV Manager
├── Job Analyzer
├── Application Tracker
└── Gmail Integration
    ├── OAuth 2.0
    ├── Connexion Gmail
    ├── Lecture des emails
    ├── Classification
    ├── Liaison email ↔ candidature
    ├── Génération de réponses
    ├── Création de brouillons
    └── Envoi après validation
```

## 3. Flux général

```text
Compte Gmail
    ↓
OAuth 2.0
    ↓
Career_OS Backend
    ↓
Gmail API
    ↓
Récupération des emails
    ↓
Classification
    ↓
Analyse
    ↓
Association à une candidature
    ↓
Mise à jour Application Tracker
    ↓
Notification / brouillon / action validée
```

## 4. Authentification OAuth 2.0

Créer un projet dans **Google Cloud**, activer **Gmail API**, configurer l'écran de consentement OAuth et créer un client OAuth de type **Web application**.

Le frontend ne doit jamais contenir :

```text
client_secret
access_token
refresh_token
```

Ces éléments doivent rester côté backend.

## 5. Scopes Gmail

### Lecture

```text
https://www.googleapis.com/auth/gmail.readonly
```

### Création de brouillons

```text
https://www.googleapis.com/auth/gmail.compose
```

### Envoi

```text
https://www.googleapis.com/auth/gmail.send
```

Commencer par `gmail.readonly`, puis ajouter les scopes nécessaires au fur et à mesure.

Éviter `gmail.modify` tant qu'il n'est pas nécessaire.

## 6. Variables d'environnement

```env
GOOGLE_CLIENT_ID=xxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/gmail/callback
```

En production, utiliser une URI HTTPS correspondant exactement à celle configurée dans Google Cloud.

Ajouter les fichiers secrets à `.gitignore` :

```gitignore
.env
.env.local
.env.production
```

## 7. Installation Node.js / TypeScript

Si Career_OS utilise Node.js :

```bash
npm install googleapis
```

Selon le backend :

```bash
npm install express
npm install -D typescript @types/node @types/express
```

## 8. Structure du module Gmail

```text
src/
└── integrations/
    └── gmail/
        ├── gmail.oauth.ts
        ├── gmail.service.ts
        ├── gmail.classifier.ts
        └── gmail.types.ts
```

### `gmail.oauth.ts`

Responsable de :

- génération de l'URL OAuth ;
- callback ;
- échange du code contre les tokens ;
- renouvellement des tokens.

### `gmail.service.ts`

Responsable de :

- récupération des messages ;
- récupération des threads ;
- recherche ;
- création de brouillons ;
- envoi.

### `gmail.classifier.ts`

Responsable de :

- classification des emails ;
- détection des offres ;
- détection des entretiens ;
- détection des confirmations ;
- détection des refus.

## 9. Routes API

```text
GET  /api/integrations/gmail/connect
GET  /api/integrations/gmail/callback
POST /api/integrations/gmail/disconnect

GET  /api/gmail/messages
GET  /api/gmail/messages/:id
POST /api/gmail/sync

POST /api/gmail/drafts
POST /api/gmail/send
```

## 10. Connexion Gmail

Flux :

```text
Utilisateur
    ↓
"Connecter Gmail"
    ↓
URL OAuth Google
    ↓
Autorisation
    ↓
Callback Career_OS
    ↓
Échange du code
    ↓
Stockage sécurisé des tokens
```

Le backend obtient notamment :

```text
access_token
refresh_token
expiry_date
scope
```

Le `refresh_token` doit être chiffré en base de données.

## 11. Base de données

### Table `gmail_connections`

```sql
CREATE TABLE gmail_connections (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    google_account_email VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    scope TEXT,
    token_expiry TIMESTAMP,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `gmail_messages`

```sql
CREATE TABLE gmail_messages (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    gmail_message_id VARCHAR(255) NOT NULL,
    thread_id VARCHAR(255),
    sender TEXT,
    recipient TEXT,
    subject TEXT,
    received_at TIMESTAMP,
    category VARCHAR(100),
    application_id UUID,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 12. Classification des emails

Catégories recommandées :

```text
JOB_OFFER
APPLICATION_CONFIRMATION
REJECTION
INTERVIEW_INVITATION
INTERVIEW_CONFIRMATION
RECRUITER_CONTACT
FOLLOW_UP
NETWORKING
OTHER
```

## 13. Détection des offres

Analyser notamment :

- expéditeur ;
- domaine de l'entreprise ;
- objet ;
- contenu ;
- liens ;
- mots-clés ;
- intitulé du poste ;
- entreprise ;
- localisation ;
- compétences.

Exemples de signaux :

```text
offre d'emploi
recrutement
poste
job opportunity
vacancy
career opportunity
```

## 14. Détection des entretiens

Signaux possibles :

```text
entretien
interview
meeting
assessment
test technique
entretien RH
entretien téléphonique
visioconférence
```

Flux :

```text
Email reçu
    ↓
INTERVIEW_INVITATION
    ↓
Recherche de la candidature
    ↓
Application Tracker
    ↓
Statut = ENTRETIEN
```

## 15. Détection des refus

Signaux possibles :

```text
candidature non retenue
nous ne donnerons pas suite
not selected
rejected
unfortunately
```

Le système peut proposer :

```text
Statut = REFUS
```

La modification doit être journalisée.

## 16. Détection des confirmations

Signaux possibles :

```text
nous avons bien reçu votre candidature
application received
candidature reçue
merci pour votre candidature
your application has been submitted
```

Le statut peut devenir :

```text
CANDIDATURE ENVOYÉE
```

## 17. Liaison email ↔ candidature

Utiliser plusieurs critères :

1. nom de l'entreprise ;
2. nom du poste ;
3. adresse du recruteur ;
4. domaine de l'entreprise ;
5. sujet ;
6. contenu ;
7. date ;
8. référence de candidature.

Exemple :

```text
Email :
"Entretien — Analyste Crédit — ABC Bank"

        ↓

Entreprise : ABC Bank
Poste      : Analyste Crédit
Type       : Entretien

        ↓

Application Tracker
Statut : ENTRETIEN
```

## 18. Synchronisation

Endpoint :

```http
POST /api/gmail/sync
```

Processus :

```text
1. Authentifier l'utilisateur
2. Récupérer la connexion Gmail
3. Appeler Gmail API
4. Récupérer les nouveaux messages
5. Éviter les doublons
6. Extraire les informations
7. Classifier
8. Associer à une candidature
9. Mettre à jour le tracker
10. Enregistrer l'historique
```

Pour les messages Gmail, utiliser notamment les opérations correspondant à :

```text
users.messages.list
users.messages.get
```

## 19. Prévention des doublons

Enregistrer :

```text
gmail_message_id
```

Logique :

```text
Message déjà présent ?
    ├── Oui → ignorer
    └── Non → importer
```

## 20. Analyse des emails

Prendre en charge :

```text
text/plain
text/html
attachments
```

Extraire au minimum :

```text
Sujet
Expéditeur
Destinataire
Date
Corps
```

Le HTML doit être converti en texte exploitable avant classification.

## 21. Pièces jointes

Fonctionnalité prévue pour une phase ultérieure :

```text
CV
lettre de motivation
description de poste
PDF
documents RH
```

Les fichiers doivent être traités avec des contrôles de sécurité appropriés.

## 22. Génération de réponses

Flux recommandé :

```text
Email reçu
    ↓
Analyse
    ↓
Compréhension du contexte
    ↓
Génération de réponse
    ↓
Création d'un brouillon Gmail
    ↓
Vérification utilisateur
    ↓
Envoi
```

L'envoi automatique sans validation doit être évité.

## 23. Création d'un brouillon

Endpoint :

```http
POST /api/gmail/drafts
```

Exemple de données :

```json
{
  "to": "recruteur@example.com",
  "subject": "Re: Entretien Analyste Crédit",
  "body": "Bonjour,

Je vous remercie pour votre message..."
}
```

Le backend crée le brouillon dans Gmail.

## 24. Envoi

Endpoint :

```http
POST /api/gmail/send
```

Avant l'envoi, vérifier :

```text
Destinataire
Sujet
Contenu
Pièces jointes éventuelles
```

Puis demander une validation explicite :

```text
[ Annuler ]    [ Envoyer ]
```

## 25. Interface utilisateur

### Page Intégrations

```text
Intégrations

Gmail
────────────────────────
Statut : Connecté

Compte :
user@gmail.com

Permissions :
✓ Lecture des emails

[ Synchroniser ]

[ Déconnecter ]
```

### Tableau de bord

```text
Activité Gmail

12 nouveaux emails
3 candidatures mises à jour
1 invitation à un entretien
2 réponses de recruteurs
1 offre détectée
```

## 26. Application Tracker

Exemple :

```text
Entreprise : ABC Bank
Poste      : Analyste Crédit

Ancien statut :
CANDIDATURE ENVOYÉE

Email détecté :
Invitation à un entretien

Nouveau statut :
ENTRETIEN
```

## 27. Historique

Exemple :

```text
10/09/2026
Candidature envoyée

12/09/2026
Email de confirmation reçu

16/09/2026
Invitation à un entretien détectée
```

## 28. Sécurité

### Obligatoire

Ne jamais stocker les tokens en clair.

Utiliser un mécanisme de chiffrement robuste, par exemple :

```text
AES-256
```

ou un service de gestion de secrets / KMS.

### Backend uniquement

```text
GOOGLE_CLIENT_SECRET
access_token
refresh_token
```

### Production

Utiliser :

```text
HTTPS
```

et des URI OAuth exactes.

## 29. Déconnexion

Lors d'une déconnexion :

1. invalider ou supprimer les tokens stockés ;
2. supprimer la connexion ;
3. arrêter les synchronisations ;
4. appliquer la politique de conservation des données.

## 30. Architecture technique recommandée

```text
Frontend
React / Next.js
       │
       ↓
Backend API
Node.js / TypeScript
       │
       ├───────────────┐
       ↓               ↓
PostgreSQL        Gmail API
       │               │
       ↓               ↓
Application       Gmail
Tracker
       │
       ↓
Classification / IA
```

## 31. Développement par phases

### Phase 1 — Connexion

- Google Cloud ;
- Gmail API ;
- OAuth 2.0 ;
- connexion ;
- déconnexion ;
- stockage sécurisé.

### Phase 2 — Lecture

- récupération ;
- recherche ;
- affichage ;
- synchronisation ;
- prévention des doublons.

### Phase 3 — Intelligence recrutement

- classification ;
- détection des candidatures ;
- détection des recruteurs ;
- détection des entretiens ;
- détection des refus ;
- liaison avec Application Tracker.

### Phase 4 — Génération

- génération de réponses ;
- création de brouillons ;
- personnalisation.

### Phase 5 — Envoi

- validation utilisateur ;
- envoi Gmail ;
- historique ;
- journalisation.

## 32. MVP

Le premier MVP doit contenir :

```text
✓ Connexion Gmail
✓ OAuth 2.0
✓ gmail.readonly
✓ Lecture des emails
✓ Recherche
✓ Classification
✓ Détection des emails de recrutement
✓ Mise à jour du Application Tracker
```

À ne pas implémenter immédiatement :

```text
✗ Envoi automatique
✗ Suppression automatique des emails
✗ Modification inutile des emails Gmail
✗ Actions irréversibles
```

## 33. Critères d'acceptation

- [ ] Connexion Gmail fonctionnelle.
- [ ] OAuth 2.0 fonctionnel.
- [ ] Tokens stockés de manière sécurisée.
- [ ] Lecture des emails fonctionnelle.
- [ ] Doublons évités.
- [ ] Classification fonctionnelle.
- [ ] Emails de recrutement identifiés.
- [ ] Emails associés aux candidatures.
- [ ] Statuts du tracker mis à jour.
- [ ] Brouillons créables.
- [ ] Envoi soumis à validation.
- [ ] Déconnexion fonctionnelle.
- [ ] Aucun secret exposé au frontend.

## 34. Structure finale

```text
Career_OS/
├── frontend/
├── backend/
│   └── src/
│       ├── integrations/
│       │   └── gmail/
│       │       ├── gmail.oauth.ts
│       │       ├── gmail.service.ts
│       │       ├── gmail.classifier.ts
│       │       └── gmail.types.ts
│       ├── modules/
│       │   ├── cv/
│       │   ├── jobs/
│       │   ├── applications/
│       │   └── recruitment/
│       ├── routes/
│       │   └── gmail.routes.ts
│       └── database/
├── .env
├── .gitignore
└── README.md
```

## 35. Évolution future

Career_OS pourra évoluer vers un assistant de recherche d'emploi :

```text
Gmail
  ↓
Collecte
  ↓
Classification
  ↓
Compréhension du contexte
  ↓
Identification entreprise / poste
  ↓
Association à la candidature
  ↓
Analyse du processus
  ↓
Suggestion d'action
  ↓
Validation utilisateur
  ↓
Action Gmail
```

Fonctionnalités futures :

- détection automatique des nouvelles offres ;
- extraction des dates d'entretien ;
- rappels de suivi ;
- analyse des échanges recruteurs ;
- génération de réponses personnalisées ;
- suivi des délais de réponse ;
- statistiques des candidatures ;
- détection des candidatures sans réponse ;
- suggestions de relance ;
- synchronisation calendrier ;
- analyse sécurisée des pièces jointes.

## 36. Principe fondamental

Career_OS doit rester un **assistant contrôlé par l'utilisateur** :

```text
Career_OS détecte
        ↓
Career_OS analyse
        ↓
Career_OS propose
        ↓
Utilisateur vérifie
        ↓
Utilisateur valide
        ↓
Career_OS exécute
```

Les actions sensibles, notamment l'envoi d'emails, doivent rester sous le contrôle explicite de l'utilisateur.

## 37. Documentation

Pour l'implémentation, privilégier la documentation officielle de Google sur :

- Gmail API ;
- OAuth 2.0 ;
- Gmail API scopes ;
- Gmail API pour Node.js ;
- messages, threads et drafts Gmail.