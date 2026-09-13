/**
 * Deterministic, versioned job scoring (plan.md sections 11-12).
 *
 * Given the same profile snapshot + job analysis + score rule version, the
 * result MUST be identical — no AI, no randomness, no Date.now().
 *
 * total = education*wEdu + experience*wExp + skills*wSkills + tools*wTools
 *       + keywords*wKeywords
 */
import { normalizeText } from './normalize';

export interface ScoreRule {
  name: string;
  educationWeight: number;
  experienceWeight: number;
  skillsWeight: number;
  toolsWeight: number;
  keywordWeight: number;
  version: number;
}

/** The baseline rule seeded in the database (ScoreRuleVersion v1). */
export const BASELINE_SCORE_RULE: ScoreRule = {
  name: 'baseline-v1',
  educationWeight: 0.2,
  experienceWeight: 0.3,
  skillsWeight: 0.3,
  toolsWeight: 0.1,
  keywordWeight: 0.1,
  version: 1,
};

/** What the candidate has — a snapshot, never mutated during scoring. */
export interface ProfileSnapshot {
  /** Normalized (normalizeText) skill names. */
  skills: string[];
  /** Normalized tool names. */
  tools: string[];
  /** Normalized technologies. */
  technologies: string[];
  /** Years of professional experience. */
  experienceYears: number;
  /** True when the candidate holds a degree matching the analysis requirement. */
  educationMatch: boolean;
  /** Normalized keyword bag (summary + headline + projects). */
  keywords: string[];
}

/** Structured analysis of a job offer (AI-extracted, then normalized §13). */
export interface JobAnalysisInput {
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  technologies: string[];
  keywords: string[];
  educationRequirements: string[];
  experienceRequirements: string[];
  /** Required years of experience extracted from the requirements, if any. */
  requiredExperienceYears?: number;
}

export interface ScoreGap {
  requirement: string;
  category: 'SKILL' | 'TOOL' | 'TECHNOLOGY' | 'KEYWORD' | 'EDUCATION' | 'EXPERIENCE';
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  reason: string;
}

export interface JobScoreResult {
  total: number;
  educationScore: number;
  experienceScore: number;
  skillsScore: number;
  toolsScore: number;
  keywordScore: number;
  gaps: ScoreGap[];
  ruleVersion: number;
}

function setOf(items: string[]): Set<string> {
  return new Set(items.map((item) => normalizeText(item)).filter(Boolean));
}

/** Ratio of `required` items present in `owned` (both raw lists). 0..1 */
function matchRatio(required: string[], owned: Set<string>): { ratio: number; missing: string[] } {
  if (required.length === 0) return { ratio: 1, missing: [] };
  const normalizedRequired = required.map((item) => ({ raw: item, norm: normalizeText(item) }));
  let matched = 0;
  const missing: string[] = [];
  for (const item of normalizedRequired) {
    if (item.norm && owned.has(item.norm)) matched += 1;
    else missing.push(item.raw);
  }
  return { ratio: matched / required.length, missing };
}

/**
 * Deterministic score computation (plan.md section 12).
 * Pure function: same inputs -> same output, always.
 */
export function calculateScore(
  profile: ProfileSnapshot,
  analysis: JobAnalysisInput,
  rule: ScoreRule = BASELINE_SCORE_RULE,
): JobScoreResult {
  const ownedSkills = setOf([...profile.skills, ...profile.technologies]);
  const skillsMatch = matchRatio(analysis.requiredSkills, ownedSkills);
  const preferredMatch = matchRatio(analysis.preferredSkills, ownedSkills);
  const toolsMatch = matchRatio(analysis.tools, setOf(profile.tools));
  const keywordMatch = matchRatio(analysis.keywords, setOf(profile.keywords));

  // Skills score: required skills weighted 100%, preferred count as a small bonus.
  const skillsScore = Math.min(
    1,
    skillsMatch.ratio + (analysis.preferredSkills.length > 0 ? preferredMatch.ratio * 0.25 : 0),
  );

  // Education: binary — degree requirement satisfied or not.
  const educationScore = analysis.educationRequirements.length === 0 || profile.educationMatch ? 1 : 0;

  // Experience: linear against the required years, capped at 1.
  const requiredYears = analysis.requiredExperienceYears ?? 0;
  const experienceScore =
    requiredYears <= 0 ? 1 : Math.min(1, profile.experienceYears / requiredYears);

  const total =
    educationScore * rule.educationWeight +
    experienceScore * rule.experienceWeight +
    skillsScore * rule.skillsWeight +
    toolsMatch.ratio * rule.toolsWeight +
    keywordMatch.ratio * rule.keywordWeight;

  // Deterministic gap detection (plan.md section 11 — ScoreGap).
  const gaps: ScoreGap[] = [];
  for (const missing of skillsMatch.missing) {
    gaps.push({
      requirement: missing,
      category: 'SKILL',
      severity: 'CRITICAL',
      reason: 'Required skill not found in verified profile skills',
    });
  }
  for (const missing of preferredMatch.missing) {
    gaps.push({
      requirement: missing,
      category: 'SKILL',
      severity: 'MINOR',
      reason: 'Preferred skill not found in profile',
    });
  }
  for (const missing of toolsMatch.missing) {
    gaps.push({
      requirement: missing,
      category: 'TOOL',
      severity: 'MAJOR',
      reason: 'Tool not found in profile tools',
    });
  }
  for (const missing of keywordMatch.missing) {
    gaps.push({
      requirement: missing,
      category: 'KEYWORD',
      severity: 'MINOR',
      reason: 'Keyword not present in profile keywords',
    });
  }
  if (educationScore === 0) {
    for (const requirement of analysis.educationRequirements) {
      gaps.push({
        requirement,
        category: 'EDUCATION',
        severity: 'MAJOR',
        reason: 'Education requirement not satisfied',
      });
    }
  }
  if (experienceScore < 1) {
    gaps.push({
      requirement: `${requiredYears} years`,
      category: 'EXPERIENCE',
      severity: requiredYears - profile.experienceYears > 2 ? 'CRITICAL' : 'MAJOR',
      reason: `Profile has ${profile.experienceYears} years, job requires ${requiredYears}`,
    });
  }

  return {
    total: Number(total.toFixed(4)),
    educationScore: Number(educationScore.toFixed(4)),
    experienceScore: Number(experienceScore.toFixed(4)),
    skillsScore: Number(skillsScore.toFixed(4)),
    toolsScore: Number(toolsMatch.ratio.toFixed(4)),
    keywordScore: Number(keywordMatch.ratio.toFixed(4)),
    gaps,
    ruleVersion: rule.version,
  };
}
