/**
 * Unit tests for deterministic job scoring (plan.md sections 11-12).
 */
import { describe, expect, it } from 'vitest';
import { BASELINE_SCORE_RULE, calculateScore } from '../src/scoring';
import type { JobAnalysisInput, ProfileSnapshot } from '../src/scoring';

const profile: ProfileSnapshot = {
  skills: ['React', 'TypeScript', 'SQL'],
  tools: ['Excel'],
  technologies: ['PostgreSQL'],
  experienceYears: 3,
  educationMatch: true,
  keywords: ['data engineering', 'dashboards'],
};

const analysis: JobAnalysisInput = {
  requiredSkills: ['React', 'SQL', 'Python'],
  preferredSkills: ['TypeScript'],
  tools: ['Excel', 'Looker'],
  technologies: [],
  keywords: ['dashboards', 'etl'],
  educationRequirements: ['Master degree'],
  experienceRequirements: ['3+ years'],
  requiredExperienceYears: 3,
};

describe('calculateScore (plan.md section 12)', () => {
  it('is deterministic — same inputs give identical results', () => {
    const a = calculateScore(profile, analysis);
    const b = calculateScore(profile, analysis);
    expect(a).toEqual(b);
    expect(a.total).toBe(b.total);
  });

  it('weights sum to 1 in the baseline rule', () => {
    const sum =
      BASELINE_SCORE_RULE.educationWeight +
      BASELINE_SCORE_RULE.experienceWeight +
      BASELINE_SCORE_RULE.skillsWeight +
      BASELINE_SCORE_RULE.toolsWeight +
      BASELINE_SCORE_RULE.keywordWeight;
    expect(sum).toBe(1);
  });

  it('scores a perfect profile at 1', () => {
    const perfect: ProfileSnapshot = {
      skills: ['React', 'SQL', 'Python', 'TypeScript'],
      tools: ['Excel', 'Looker'],
      technologies: [],
      experienceYears: 5,
      educationMatch: true,
      keywords: ['dashboards', 'etl'],
    };
    const result = calculateScore(perfect, analysis);
    expect(result.total).toBe(1);
    expect(result.gaps).toEqual([]);
  });

  it('normalizes skill names (case, accents) before matching', () => {
    const accented: ProfileSnapshot = {
      ...profile,
      skills: ['réact', 'typescript'],
      tools: ['postgresql'],
    };
    const accentedAnalysis: JobAnalysisInput = {
      ...analysis,
      requiredSkills: ['React', 'TypeScript'],
      preferredSkills: [],
      tools: ['PostgreSQL'],
      keywords: [],
    };
    const result = calculateScore(accented, accentedAnalysis);
    expect(result.skillsScore).toBe(1);
    expect(result.toolsScore).toBe(1);
  });

  it('reports Python as a CRITICAL gap (golden dataset, section 48)', () => {
    const result = calculateScore(profile, analysis);
    const pythonGap = result.gaps.find((gap) => gap.requirement === 'Python');
    expect(pythonGap?.severity).toBe('CRITICAL');
    expect(pythonGap?.category).toBe('SKILL');
  });

  it('caps experience score at 1 when profile exceeds requirement', () => {
    const senior = { ...profile, experienceYears: 10 };
    const result = calculateScore(senior, analysis);
    expect(result.experienceScore).toBe(1);
  });

  it('flags experience shortfall as CRITICAL when > 2 years missing', () => {
    const junior = { ...profile, experienceYears: 0 };
    const result = calculateScore(junior, analysis);
    const expGap = result.gaps.find((gap) => gap.category === 'EXPERIENCE');
    expect(expGap?.severity).toBe('CRITICAL');
    expect(result.experienceScore).toBe(0);
  });

  it('scores empty requirements as full marks', () => {
    const empty: JobAnalysisInput = {
      requiredSkills: [],
      preferredSkills: [],
      tools: [],
      technologies: [],
      keywords: [],
      educationRequirements: [],
      experienceRequirements: [],
    };
    const result = calculateScore(profile, empty);
    expect(result.total).toBe(1);
  });
});
