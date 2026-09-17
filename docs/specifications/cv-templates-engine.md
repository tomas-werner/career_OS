# Cahier des charges — Système de templates CV de Career_OS

## 1. Objet

Le module **CV Template Engine** de **Career_OS** a pour objectif de gérer plusieurs modèles de CV professionnels et de permettre au système de sélectionner automatiquement le modèle le plus approprié selon :

- le **poste recherché** ;
- le **secteur d'activité** ;
- le **type d'entreprise** ;
- le **canal de candidature** ;
- le niveau d'importance de l'**ATS (Applicant Tracking System)** ;
- le **profil du candidat** ;
- la **langue demandée** ;
- la quantité d'informations à présenter.

Le système doit distinguer :

> **Template = structure + design + règles de présentation**

et

> **Candidate Data = informations personnelles + expériences + formations + compétences + certifications + projets.**

Le contenu ne doit jamais être définitivement associé à un template.

---

## 2. Règle linguistique obligatoire

### Langue par défaut

**Tous les CV doivent être générés en français à 100 % par défaut.**

Career_OS ne doit pas produire spontanément un CV bilingue ou anglais.

### Version anglaise

Une version **100 % en anglais** peut être générée uniquement lorsque l'utilisateur la demande explicitement.

Exemples de demandes explicites :

- « Génère le CV en anglais. »
- « Je veux la version anglaise. »
- « Make my CV in English. »
- « Generate an English CV. »

### Interdiction du mélange linguistique

Lorsque la langue sélectionnée est le français :

- titres en français ;
- résumé en français ;
- expériences en français ;
- compétences en français lorsque leur traduction est pertinente ;
- formations en français ;
- certifications en français lorsque possible ;
- libellés des dates et sections en français.

Lorsque la langue sélectionnée est l'anglais :

- l'ensemble du CV doit être en anglais ;
- aucun titre français ne doit subsister ;
- aucune section ne doit être partiellement traduite.

**Principe : une génération = une seule langue.**

---

# 3. Architecture générale

```text
CAREER_OS
│
├── Candidate Profile
│   ├── Personal Information
│   ├── Professional Summary
│   ├── Experiences
│   ├── Education
│   ├── Skills
│   ├── Certifications
│   ├── Languages
│   ├── Projects
│   └── Achievements
│
├── Job Offer Analysis
│   ├── Job Title
│   ├── Company
│   ├── Industry
│   ├── Required Skills
│   ├── Keywords
│   ├── Seniority
│   ├── ATS Requirement
│   └── Application Channel
│
├── CV Template Engine
│   ├── CV_ATS_PROFESSIONAL
│   ├── CV_FINANCE_BANKING
│   └── CV_EXECUTIVE_CLASSIC
│
└── CV Generator
    ├── Content Optimization
    ├── Template Selection
    ├── Language Selection
    ├── Formatting
    ├── ATS Validation
    └── PDF Export
```

---

# 4. Les trois templates

Career_OS doit intégrer trois templates principaux :

| ID | Nom | Fonction principale |
|---|---|---|
| `CV_ATS_PROFESSIONAL` | ATS Professional | Candidatures automatisées et ATS |
| `CV_FINANCE_BANKING` | Finance & Banking | Finance, banque, crédit, risque, audit |
| `CV_EXECUTIVE_CLASSIC` | Executive Classic | Candidatures directes et présentation premium |

---

# 5. Template 01 — CV ATS Professional

## 5.1 Identifiant

```text
CV_ATS_PROFESSIONAL
```

## 5.2 Objectif

Ce template constitue le **modèle par défaut** de Career_OS.

Il est conçu pour maximiser la **lisibilité humaine** et la **compatibilité ATS**.

## 5.3 Utilisation

À privilégier pour :

- candidatures via sites carrières ;
- LinkedIn ;
- Indeed ;
- plateformes de recrutement ;
- grandes entreprises ;
- banques ;
- multinationales ;
- cabinets d'audit ;
- candidatures avec processus RH automatisé.

## 5.4 Design

Le template doit respecter :

- **une seule colonne** ;
- fond clair et sobre ;
- typographie professionnelle ;
- hiérarchie visuelle claire ;
- absence de graphiques complexes ;
- absence de jauges de compétences ;
- absence de diagrammes ;
- absence de tableaux complexes ;
- aucune information essentielle dans une image ;
- aucune information essentielle dans un élément graphique difficilement interprétable par un ATS.

### Typographies possibles

- Arial ;
- Calibri ;
- Aptos ;
- Helvetica ;
- autre police sans-serif professionnelle et largement compatible.

### Tailles indicatives

```text
Nom :              18–24 pt
Titre professionnel : 11–14 pt
Titres sections :  10–12 pt
Corps du texte :    9–11 pt
```

---

# 6. Structure du CV ATS Professional

Ordre recommandé :

```text
1. Identité
2. Titre professionnel
3. Coordonnées
4. Profil professionnel
5. Expérience professionnelle
6. Formation
7. Compétences
8. Certifications
9. Projets
10. Langues
```

L'ordre peut être adapté au profil.

### Jeune diplômé

```text
Profil
Formation
Expérience
Projets
Compétences
Certifications
Langues
```

### Profil expérimenté

```text
Profil
Expérience
Formation
Compétences
Certifications
```

---

# 7. Règles ATS

Career_OS doit réaliser une validation avant l'export.

## 7.1 Lisibilité

Vérifier :

- texte sélectionnable ;
- pas de texte intégré dans une image ;
- contraste suffisant ;
- taille de police acceptable ;
- structure lisible.

## 7.2 Structure

Vérifier :

- titres de sections standards ;
- dates cohérentes ;
- ordre chronologique inversé ;
- informations de contact détectables ;
- expériences détectables ;
- formation détectable ;
- compétences détectables.

## 7.3 Mots-clés

Le système doit comparer le CV à l'offre :

```text
Job Description
      ↓
Extraction des mots-clés
      ↓
Comparaison avec le profil
      ↓
Mots-clés présents
      ↓
Mots-clés partiels
      ↓
Mots-clés manquants
      ↓
Optimisation
```

Le système doit uniquement utiliser des compétences et expériences **réellement détenues par le candidat**.

Il est interdit d'inventer une compétence uniquement pour améliorer l'ATS.

---

# 8. Template 02 — CV Finance & Banking

## 8.1 Identifiant

```text
CV_FINANCE_BANKING
```

## 8.2 Objectif

Ce template est spécialisé dans les fonctions :

- **Finance d'entreprise** ;
- **Banque** ;
- **Analyse financière** ;
- **Analyse crédit** ;
- **Gestion des risques** ;
- **Trésorerie** ;
- **Audit** ;
- **Contrôle de gestion** ;
- **Assurance**.

## 8.3 Positionnement

Le design doit être :

**Classique + institutionnel + professionnel + orienté finance**

Il ne doit pas être excessivement créatif.

Une colonne secondaire légère peut être utilisée, mais les informations importantes doivent rester facilement lisibles.

---

# 9. Structure du CV Finance & Banking

```text
NOM PRÉNOM

Titre professionnel

Coordonnées
Téléphone | Email | LinkedIn | Localisation

PROFIL PROFESSIONNEL

EXPÉRIENCE PROFESSIONNELLE

FORMATION

COMPÉTENCES FINANCIÈRES

OUTILS & LOGICIELS

CERTIFICATIONS

PROJETS ACADÉMIQUES

LANGUES
```

---

# 10. Catégorisation des compétences financières

Les compétences doivent être regroupées par catégories pertinentes.

### Finance

- Analyse financière
- Finance d'entreprise
- Modélisation financière
- Évaluation d'entreprise

### Banque

- Analyse crédit
- Risque de crédit
- Financement des entreprises
- Opérations bancaires

### Risque

- Évaluation des risques
- Gestion des risques
- Risque financier

### Comptabilité

- Comptabilité financière
- IFRS
- Comptabilité de gestion

### Outils

- Microsoft Excel
- Power BI
- ERP
- SAP
- autres outils réellement maîtrisés

Career_OS ne doit afficher que les catégories pertinentes pour l'offre.

---

# 11. Adaptation sectorielle

Le système doit adapter la visibilité des compétences selon le poste.

## Exemple : Analyste Crédit

Prioriser :

```text
Analyse crédit
Analyse financière
Évaluation des risques
Ratios financiers
Risque de crédit
Financement des PME
Banque
```

## Exemple : Contrôleur de gestion

Prioriser :

```text
Contrôle de gestion
Budgétisation
Reporting
Analyse des écarts
KPI
Excel
Power BI
```

## Exemple : Analyste financier

Prioriser :

```text
Analyse financière
Modélisation financière
Évaluation
Prévisions financières
Excel
Reporting
```

---

# 12. Template 03 — CV Executive Classic

## 12.1 Identifiant

```text
CV_EXECUTIVE_CLASSIC
```

## 12.2 Objectif

Ce template est destiné aux candidatures où le CV est principalement examiné directement par :

- un recruteur ;
- un manager ;
- un cabinet de recrutement ;
- un contact professionnel.

Il doit avoir une présentation **élégante, classique et premium**, sans sacrifier la lisibilité.

## 12.3 Design

Le template peut utiliser :

- une mise en page à deux colonnes modérée ;
- une hiérarchie typographique plus travaillée ;
- des séparateurs sobres ;
- des espaces blancs ;
- une présentation plus personnalisée.

Éviter :

- jauges ;
- étoiles ;
- graphiques ;
- illustrations ;
- logos excessifs ;
- timelines complexes ;
- éléments décoratifs inutiles.

---

# 13. Structure Executive Classic

```text
NOM PRÉNOM
Titre professionnel

CONTACT

PROFIL

EXPÉRIENCE PROFESSIONNELLE

FORMATION

EXPERTISE

OUTILS

CERTIFICATIONS

LANGUES

PROJETS / RÉALISATIONS
```

Exemple de structure :

```text
┌─────────────────────────────────────────────┐
│ NOM PRÉNOM                                  │
│ Titre professionnel                         │
├────────────────┬────────────────────────────┤
│ CONTACT        │ PROFIL                     │
│ LANGUES        │ EXPÉRIENCE                 │
│ OUTILS         │ FORMATION                  │
│ COMPÉTENCES    │ PROJETS                   │
└────────────────┴────────────────────────────┘
```

---

# 14. Moteur de sélection automatique

Career_OS doit sélectionner automatiquement le template selon l'offre.

## Variables d'entrée

```text
job_title
industry
company_type
application_channel
seniority
ats_required
language
candidate_experience
job_keywords
```

---

# 15. Règles de sélection

### Cas 1 — ATS élevé

```text
Canal = Site carrière
ATS = Élevé
```

→ `CV_ATS_PROFESSIONAL`

### Cas 2 — Banque / finance

```text
Secteur = Banque
Poste = Analyste Crédit
```

→ `CV_FINANCE_BANKING`

### Cas 3 — Candidature directe

```text
Canal = Recruteur
ATS = Faible
```

→ `CV_EXECUTIVE_CLASSIC`

### Cas 4 — Situation ambiguë

Si Career_OS ne peut pas déterminer le template :

→ `CV_ATS_PROFESSIONAL`

---

# 16. Règle de priorité

| Situation détectée | Template |
|---|---|
| ATS élevé | ATS Professional |
| Banque + Finance | Finance & Banking |
| Crédit | Finance & Banking |
| Risque bancaire | Finance & Banking |
| Audit | ATS Professional ou Finance & Banking |
| Finance d'entreprise | Finance & Banking |
| Candidature directe | Executive Classic |
| Recruteur / Networking | Executive Classic |
| Grande entreprise | ATS Professional |
| Offre ambiguë | ATS Professional |

---

# 17. Système de données candidat

Les informations du candidat doivent être centralisées.

```text
Candidate
│
├── Personal
│   ├── First Name
│   ├── Last Name
│   ├── Email
│   ├── Phone
│   ├── Location
│   └── LinkedIn
│
├── Professional
│   ├── Title
│   └── Summary
│
├── Experience
│   ├── Company
│   ├── Position
│   ├── Start Date
│   ├── End Date
│   ├── Responsibilities
│   └── Achievements
│
├── Education
│
├── Skills
│
├── Certifications
│
├── Languages
│
└── Projects
```

---

# 18. Système de variables

Les templates doivent utiliser des variables dynamiques.

```text
{{candidate.first_name}}
{{candidate.last_name}}
{{candidate.professional_title}}

{{candidate.email}}
{{candidate.phone}}
{{candidate.linkedin}}

{{candidate.summary}}

{{experience.company}}
{{experience.position}}
{{experience.start_date}}
{{experience.end_date}}
{{experience.description}}

{{education.degree}}
{{education.school}}

{{skills.finance}}
{{skills.banking}}
{{skills.risk}}
{{skills.tools}}
```

Ainsi, le même profil candidat peut être utilisé sur les trois templates.

---

# 19. Analyse de l'offre d'emploi

Career_OS doit suivre le processus :

```text
OFFRE D'EMPLOI
       ↓
Analyse NLP
       ↓
Extraction des exigences
       ↓
Extraction des mots-clés
       ↓
Identification du poste
       ↓
Identification du secteur
       ↓
Détection ATS
       ↓
Sélection du template
       ↓
Adaptation du contenu
       ↓
Validation
       ↓
Génération du CV
```

---

# 20. Optimisation du contenu

Career_OS peut reformuler les informations existantes afin de mieux correspondre à l'offre.

Il doit privilégier :

**Action + contexte + méthode + résultat**

### Exemple

Faible :

> Analyse des dossiers clients.

Plus précis :

> Analyse des dossiers de financement des entreprises à partir des données financières, des ratios de solvabilité et des principaux indicateurs de risque.

Si une donnée quantitative existe réellement :

> Analyse de **XX dossiers** de financement et contribution à l'évaluation de leur profil de risque.

Le système ne doit jamais inventer de chiffres ou de réalisations.

---

# 21. Gestion des mots-clés

Career_OS doit créer trois catégories :

### Mots-clés présents

```text
Analyse financière
Excel
Gestion des risques
Banque
```

### Mots-clés partiellement représentés

```text
Analyse crédit
Modélisation financière
```

### Mots-clés absents

```text
Bloomberg
SQL
Python
```

Un mot-clé absent ne doit être ajouté au CV que si le candidat possède réellement cette compétence.

---

# 22. Règle fondamentale d'intégrité

Career_OS ne doit jamais :

- inventer une expérience ;
- inventer un diplôme ;
- inventer une certification ;
- inventer une compétence ;
- inventer une langue ;
- inventer un niveau de maîtrise ;
- inventer un chiffre ;
- modifier les dates ;
- transformer artificiellement un poste en un autre poste.

Le système peut **reformuler**, **réorganiser**, **prioriser** et **adapter**, mais il ne doit pas **falsifier**.

---

# 23. Gestion de la langue

## 23.1 Français par défaut

```text
DEFAULT_LANGUAGE = "fr"
```

Si l'utilisateur ne précise aucune langue :

```text
→ Générer le CV en français
```

## 23.2 Anglais sur demande explicite

```text
IF user_explicitly_requests_english == true
THEN
    language = "en"
ELSE
    language = "fr"
```

## 23.3 Pas de bilinguisme automatique

Ne jamais produire :

```text
Profil / Profile
Expérience / Experience
Formation / Education
```

sauf demande explicite d'un CV bilingue.

Le comportement normal est :

```text
Profil
Expérience professionnelle
Formation
Compétences
Certifications
Langues
```

---

# 24. Gestion du nombre de pages

## Jeune diplômé

**1 page privilégiée**

## Profil avec plusieurs expériences

**1 à 2 pages**

## Profil expérimenté

**2 pages maximum**, sauf nécessité particulière.

Le système ne doit pas réduire excessivement la taille de police uniquement pour faire tenir le contenu sur une page.

---

# 25. Validation finale

Avant export, Career_OS doit effectuer :

```text
CV QUALITY CHECK
────────────────────────

✓ Langue unique respectée
✓ Coordonnées présentes
✓ Profil présent
✓ Expérience vérifiée
✓ Formation vérifiée
✓ Compétences vérifiées
✓ Dates cohérentes
✓ Chronologie cohérente
✓ Mots-clés vérifiés
✓ Aucune information inventée
✓ Structure ATS vérifiée
✓ Nombre de pages vérifié
✓ PDF lisible
```

---

# 26. Interface utilisateur

Le module CV Builder peut être structuré ainsi :

```text
┌────────────────────────────────────────────┐
│                CV BUILDER                  │
├────────────────────────────────────────────┤
│ Offre d'emploi                             │
│ [ Coller l'offre d'emploi ]                │
│                                            │
│ Poste ciblé                                │
│ [ Analyste Crédit ]                        │
│                                            │
│ Langue                                     │
│ [ Français ▼ ]                             │
│                                            │
│ Template                                   │
│ ● Sélection automatique                    │
│ ○ ATS Professional                         │
│ ○ Finance & Banking                        │
│ ○ Executive Classic                        │
│                                            │
│ [ Analyser et générer le CV ]              │
└────────────────────────────────────────────┘
```

**Français** doit être la valeur par défaut.

---

# 27. Résultat après génération

Career_OS doit afficher un résumé :

```text
CV GÉNÉRÉ

Poste ciblé :
Analyste Crédit

Secteur :
Banque

Langue :
Français

Template sélectionné :
Finance & Banking

Compatibilité ATS :
Élevée

Mots-clés détectés :
18 / 22

Sections optimisées :
✓ Profil professionnel
✓ Expérience
✓ Compétences
✓ Projets

Points à vérifier :
• "Modélisation financière" non identifiée dans le profil
• "Bloomberg" non identifié dans le profil

[Prévisualiser le CV]
[Télécharger PDF]
[Modifier]
```

---

# 28. Nommage des fichiers

Convention :

```text
Prenom_Nom_Poste_Template_Langue.pdf
```

Exemples :

```text
Yassine_Basir_Analyste_Credit_FinanceBanking_FR.pdf

Yassine_Basir_Analyste_Financier_ATS_FR.pdf
```

Pour une version anglaise explicitement demandée :

```text
Yassine_Basir_Credit_Analyst_FinanceBanking_EN.pdf
```

---

# 29. Métadonnées du template ATS

```json
{
  "template_id": "CV_ATS_PROFESSIONAL",
  "name": "ATS Professional",
  "version": "1.0",
  "category": "ATS",
  "target_sectors": [
    "Banking",
    "Finance",
    "Audit",
    "Corporate"
  ],
  "ats_compatibility": "high",
  "layout": "single_column",
  "recommended_pages": 1,
  "default_language": "fr",
  "supported_languages": ["fr", "en"],
  "photo": false,
  "graphics": false,
  "default": true
}
```

---

# 30. Métadonnées du template Finance & Banking

```json
{
  "template_id": "CV_FINANCE_BANKING",
  "name": "Finance & Banking",
  "version": "1.0",
  "category": "Finance",
  "target_sectors": [
    "Banking",
    "Corporate Finance",
    "Risk",
    "Credit",
    "Audit",
    "Insurance"
  ],
  "ats_compatibility": "high",
  "layout": "professional_finance",
  "recommended_pages": 1,
  "default_language": "fr",
  "supported_languages": ["fr", "en"],
  "photo": false
}
```

---

# 31. Métadonnées du template Executive Classic

```json
{
  "template_id": "CV_EXECUTIVE_CLASSIC",
  "name": "Executive Classic",
  "version": "1.0",
  "category": "Corporate",
  "target_sectors": [
    "Finance",
    "Corporate",
    "Consulting",
    "Management"
  ],
  "ats_compatibility": "medium_high",
  "layout": "two_column_classic",
  "recommended_pages": 1,
  "default_language": "fr",
  "supported_languages": ["fr", "en"],
  "photo": false
}
```

---

# 32. Architecture technique recommandée

```text
career_os/
│
├── candidate/
│   ├── profile
│   ├── experience
│   ├── education
│   ├── skills
│   └── certifications
│
├── job_analysis/
│   ├── parser
│   ├── keyword_extractor
│   ├── skill_matcher
│   ├── industry_detector
│   └── ats_detector
│
├── templates/
│   │
│   ├── ats_professional/
│   │   ├── template
│   │   ├── config
│   │   └── rules
│   │
│   ├── finance_banking/
│   │   ├── template
│   │   ├── config
│   │   └── rules
│   │
│   └── executive_classic/
│       ├── template
│       ├── config
│       └── rules
│
├── cv_engine/
│   ├── template_selector
│   ├── language_manager
│   ├── content_optimizer
│   ├── renderer
│   ├── pdf_generator
│   └── validator
│
└── output/
    ├── previews/
    └── generated_cvs/
```

---

# 33. Versioning

Chaque template doit être versionné :

```text
CV_ATS_PROFESSIONAL_v1.0
CV_FINANCE_BANKING_v1.0
CV_EXECUTIVE_CLASSIC_v1.0
```

Exemple :

```text
v1.0 → création initiale
v1.1 → correction typographique
v1.2 → amélioration de l'espacement
v2.0 → modification majeure de la structure
```

Les CV déjà générés doivent conserver les métadonnées du template utilisé.

---

# 34. Critères d'acceptation

## Templates

- [ ] Les 3 templates sont disponibles.
- [ ] Chaque template possède un identifiant unique.
- [ ] Chaque template possède sa configuration.
- [ ] Chaque template supporte le français.
- [ ] Chaque template peut supporter l'anglais sur demande.

## Langue

- [ ] Le français est la langue par défaut.
- [ ] Aucun CV anglais n'est généré automatiquement.
- [ ] Une version anglaise nécessite une demande explicite.
- [ ] Un CV français ne doit pas contenir de sections anglaises.
- [ ] Un CV anglais ne doit pas contenir de sections françaises.

## Données

- [ ] Les données candidat sont centralisées.
- [ ] Les templates utilisent des variables.
- [ ] Le contenu n'est pas dupliqué entre les templates.

## Analyse d'offre

- [ ] L'offre est analysée.
- [ ] Les mots-clés sont extraits.
- [ ] Le secteur est identifié.
- [ ] Le poste est identifié.
- [ ] Le niveau ATS est estimé.
- [ ] Le template peut être sélectionné automatiquement.

## Génération

- [ ] Le contenu est adapté à l'offre.
- [ ] Les expériences sont reformulées sans invention.
- [ ] Les compétences réelles sont privilégiées.
- [ ] Le CV est généré en PDF.
- [ ] Le nom du fichier respecte la convention.

## Validation

- [ ] Vérification ATS.
- [ ] Vérification linguistique.
- [ ] Vérification des dates.
- [ ] Vérification des coordonnées.
- [ ] Vérification des sections.
- [ ] Vérification des mots-clés.
- [ ] Vérification du nombre de pages.
- [ ] Vérification finale de lisibilité.

---

# 35. Ordre de développement recommandé

## Phase 1 — Core

```text
Candidate Profile
        ↓
Job Offer Parser
        ↓
Language Manager
        ↓
Template Selection
        ↓
CV Generation
```

## Phase 2 — Templates

Implémenter :

```text
CV_ATS_PROFESSIONAL
CV_FINANCE_BANKING
CV_EXECUTIVE_CLASSIC
```

## Phase 3 — Intelligence

Ajouter :

```text
Keyword Extraction
Skill Matching
Experience Optimization
Template Selection
ATS Validation
```

## Phase 4 — Quality Control

Ajouter :

```text
Language Validation
Consistency Check
Formatting Check
Page Count
PDF Validation
Missing Information Detection
```

---

# 36. Principe fonctionnel final

Career_OS doit fonctionner selon le principe :

```text
                 ┌───────────────────┐
                 │    OFFRE D'EMPLOI  │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Analyse de l'offre│
                 └─────────┬─────────┘
                           ↓
              ┌────────────────────────┐
              │ Poste / secteur / ATS  │
              └───────────┬────────────┘
                          ↓
                 ┌───────────────────┐
                 │ Sélection template│
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Langue par défaut │
                 │    = FRANÇAIS     │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Adaptation contenu │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Validation finale │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │    CV FINAL PDF   │
                 └───────────────────┘
```

## Règle centrale à intégrer dans Career_OS

```text
DEFAULT_LANGUAGE = FR

IF user_explicitly_requests_english:
    LANGUAGE = EN
ELSE:
    LANGUAGE = FR

IF user_does_not_request_a_specific_template:
    TEMPLATE = AUTOMATIC_SELECTION

IF template_selection_is_uncertain:
    TEMPLATE = CV_ATS_PROFESSIONAL

NEVER_INVENT_CANDIDATE_INFORMATION = TRUE
```

Ce cahier des charges constitue ainsi la **spécification de référence du module CV de Career_OS** : **3 templates**, **français par défaut**, **anglais uniquement sur demande explicite**, **sélection automatique**, **personnalisation selon l'offre**, **compatibilité ATS** et surtout **préservation stricte de la véracité du parcours du candidat**.