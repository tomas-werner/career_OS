/**
 * CV Templates for Career OS.
 * Each template defines the claim predicates that generate the appropriate
 * statements (skills, experience, education, summary) for that role type.
 * Used by the CV generation system (documents.ts buildCvModel).
 */
export type CvTemplate = 'ANALYSTE' | 'AUDITOR' | 'CONTROLLEUR';

/** The 3 CV templates mapped to role types */
export const CV_TEMPLATES = {
  ANALYSTE: {
    name: 'Analyste Financier',
    description: 'CV orienté analyse financière, scoring et gestion des risques',
    predicates: {
      skills: ['Scoring & rating', 'Risque de crédit', 'Analyse financière', 'KYC', 'Évaluation d\'entreprises'],
      experience: [
        'Analyse de bilans et états financiers',
        'Réalisation de notes de crédit',
        'Examen des garanties et éléments juridiques',
        'Présentation d\'analyses au comité de crédit',
        'Rappports journaliers de gestion'
      ],
      education: [
        'Master en Finance, Audit et Pilotage de la Performance',
        'Licence en Gestion ou équivalent',
        'Formation en risque de crédit (ex: Club des Experts)'
      ],
      summary: [
        'Expertise en évaluation de risques et scoring',
        'Expérience en analyse de 35+ dossiers immobiliers et consommation',
        'Stage PFE concluant avec 20+ renouvellements de lignes de crédit'
      ]
    }
  },
  AUDITOR: {
    name: 'Auditeur Financier',
    description: 'CV orienté audit, conformité et contrôle documentaire',
    predicates: {
      skills: ['Audit financier', 'Analyse des états financiers', 'Contrôle documentaire', 'Comptabilité générale', 'Reporting'],
      experience: [
        'Réalisation de travaux de saisie comptable',
        'Rapprochements bancaires',
        'Classement des pièces comptables',
        'Travaux préparatoires d\'audit',
        'Exploitation des éléments probants'
      ],
      education: [
        'Master Finance, Audit et Pilotage de la Performance',
        'Licence en Gestion d\'Entreprise',
        'FIDEXCOM : Stagiaire Audit & Expertise Comptable'
      ],
      summary: [
        'Expertise en audit et analyse des états financiers',
        'Expérience en cabinet, banque et entreprise',
        'Contrôle documentaire et conformité'
      ]
    }
  },
  CONTROLLEUR: {
    name: 'Controleur de gestion',
    description: 'CV orienté pilotage de la performance, reporting et suivi des coûts',
    predicates: {
      skills: ['Reporting', 'KPI & tableaux de bord', 'Analyse des écarts', 'Suivi des coûts', 'Fiabilisation des données'],
      experience: [
        'Production de reportings journalier, hebdomadaire et mensuel',
        'Suivi des effectifs, évolution des ressources et coûts associés',
        'Consolidation et contrôle de quelques tableaux de boards, avec rapprochement des données et analyse des écarts.',
        'Suivi des données de rémunération et de paie, production de tableaux de bord et contrôle des éléments de facturation.',
        'Coordination avec les équipes Finance, RH, Opérations, Production et IT pour fiabiliser les données et contribuer à l\'amélioration d\'un ERP interne.'
      ],
      education: [
        'Master Finance, Audit et Pilotage de la Performance',
        'Licence en Gestion d\'Entreprise',
        'Formation certifiante : Le Club des Experts (Transaction Services, M&A, IFRS, Fiscalité, TVA, Sage 100)'
      ],
      summary: [
        'Expertise en pilotage de la performance en environnement industriel',
        'Maîtrise d\'Excel avancé et Power BI',
        'Expérience en suivi des effectifs et analyse des écarts'
      ]
    }
  }
};