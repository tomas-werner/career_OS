import { NextResponse } from 'next/server';
import { newId, calculateScore } from '@career-os/shared';
import type { ProfileSnapshot, ScoreRule } from '@career-os/shared';
import { query, transaction } from '@career-os/db';
import { writeAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface JobAnalysisRow {
  id: string;
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  technologies: string[];
  keywords: string[];
  educationRequirements: string[];
  experienceRequirements: string[];
}

interface ProfileRow {
  id: string;
  headline: string | null;
  summary: string | null;
}

interface SkillRow {
  normalizedName: string;
  category: string | null;
}

interface RuleRow extends ScoreRule {
  id: string;
}

/** Deterministically derive required years from the analysis text requirements. */
function deriveRequiredYears(requirements: string[]): number | undefined {
  for (const text of requirements) {
    const match = text.match(/(\d+)\s*\+?\s*(an|ans|année|années|year|years)/i);
    if (match) return Math.min(50, Number(match[1]));
  }
  return undefined;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const analyses = await query<JobAnalysisRow>(
      `SELECT id, "requiredSkills", "preferredSkills", tools, technologies, keywords,
              "educationRequirements", "experienceRequirements"
       FROM "JobAnalysis" WHERE "jobOfferId" = $1
       ORDER BY "createdAt" DESC LIMIT 1`,
      [id],
    );
    const analysis = analyses[0];
    if (!analysis) {
      return NextResponse.json(
        { error: 'Job has no analysis — run POST /api/jobs/[id]/analyze first' },
        { status: 404 },
      );
    }

    const profiles = await query<ProfileRow>(
      'SELECT id, headline, summary FROM "CandidateProfile" ORDER BY "createdAt" LIMIT 1',
    );
    const profile = profiles[0];
    if (!profile) {
      return NextResponse.json({ error: 'No candidate profile found' }, { status: 404 });
    }

    const [skills, experiences, educations, rules] = await Promise.all([
      query<SkillRow>('SELECT "normalizedName", category FROM "Skill" WHERE "profileId" = $1', [
        profile.id,
      ]),
      query<{ startDate: Date }>(
        'SELECT "startDate" FROM "Experience" WHERE "profileId" = $1',
        [profile.id],
      ),
      query<{ degree: string }>('SELECT degree FROM "Education" WHERE "profileId" = $1', [
        profile.id,
      ]),
      query<RuleRow>(
        `SELECT id, name, "educationWeight", "experienceWeight", "skillsWeight",
                "toolsWeight", "keywordWeight", version
         FROM "ScoreRuleVersion" WHERE active = true ORDER BY version DESC LIMIT 1`,
      ),
    ]);
    const rule = rules[0];
    if (!rule) {
      return NextResponse.json({ error: 'No active ScoreRuleVersion seeded' }, { status: 500 });
    }

    // Profile snapshot — deterministic input for scoring (section 12).
    const now = Date.now();
    const experienceYears = experiences.length
      ? Number(
          (
            experiences.reduce((acc, exp) => {
              const years = (now - new Date(exp.startDate).getTime()) / (365.25 * 24 * 3600 * 1000);
              return acc + years;
            }, 0) / experiences.length
          ).toFixed(2),
        )
      : 0;

    const hasDegree = educations.some((education) => {
      const degree = education.degree.toLowerCase();
      return (
        degree.includes('master') ||
        degree.includes('msc') ||
        degree.includes('engineer') ||
        degree.includes('ingé') ||
        degree.includes('licence') ||
        degree.includes('bachelor')
      );
    });

    const snapshot: ProfileSnapshot = {
      skills: skills.map((skill) => skill.normalizedName),
      tools: skills.filter((skill) => skill.category === 'tool').map((skill) => skill.normalizedName),
      technologies: skills
        .filter((skill) => skill.category === 'technology')
        .map((skill) => skill.normalizedName),
      experienceYears,
      educationMatch: hasDegree,
      keywords: [profile.headline, profile.summary]
        .filter((value): value is string => Boolean(value))
        .flatMap((value) => value.split(/[,.;\n]/))
        .map((part) => part.trim())
        .filter(Boolean),
    };

    // Deterministic scoring — same snapshot + analysis + rule = same result.
    const score = calculateScore(
      snapshot,
      {
        requiredSkills: analysis.requiredSkills,
        preferredSkills: analysis.preferredSkills,
        tools: analysis.tools,
        technologies: analysis.technologies,
        keywords: analysis.keywords,
        educationRequirements: analysis.educationRequirements,
        experienceRequirements: analysis.experienceRequirements,
        requiredExperienceYears: deriveRequiredYears(analysis.experienceRequirements),
      },
      rule,
    );

    const saved = await transaction(async (client) => {
      // Idempotent per (job, rule): re-scoring replaces the previous result —
      // the score must be reproducible (plan.md section 12).
      const scoreResult = await client.query(
        `INSERT INTO "JobScore"
         (id, "jobOfferId", total, "educationScore", "experienceScore", "skillsScore",
          "toolsScore", "keywordScore", "ruleVersionId")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT ("jobOfferId", "ruleVersionId")
         DO UPDATE SET total = EXCLUDED.total, "educationScore" = EXCLUDED."educationScore",
           "experienceScore" = EXCLUDED."experienceScore", "skillsScore" = EXCLUDED."skillsScore",
           "toolsScore" = EXCLUDED."toolsScore", "keywordScore" = EXCLUDED."keywordScore",
           "createdAt" = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          newId(),
          id,
          score.total,
          score.educationScore,
          score.experienceScore,
          score.skillsScore,
          score.toolsScore,
          score.keywordScore,
          rule.id,
        ],
      );
      const scoreRow = scoreResult.rows[0] as { id: string };

      // Replace stale gaps from a previous run against the same rule.
      await client.query('DELETE FROM "ScoreGap" WHERE "jobScoreId" = $1', [scoreRow.id]);

      // Deduplicate gaps by normalized requirement — the (jobScoreId,
      // requirementId) pair is unique in the database.
      const seenRequirements = new Set<string>();
      for (const gap of score.gaps) {
        const requirementKey = gap.requirement.toLowerCase().trim();
        if (seenRequirements.has(requirementKey)) continue;
        seenRequirements.add(requirementKey);

        // Attach the gap to the matching normalized requirement when one exists.
        const requirement = await client.query(
          `SELECT id FROM "JobRequirement"
           WHERE "jobAnalysisId" = $1 AND "normalizedName" = $2
           ORDER BY id LIMIT 1`,
          [analysis.id, requirementKey],
        );
        const requirementId =
          requirement.rows[0]?.id ??
          (
            await client.query(
              `INSERT INTO "JobRequirement"
               (id, "jobAnalysisId", category, "normalizedName", "originalText", importance, mandatory)
               VALUES ($1, $2, $3, $4, $5, 'OPTIONAL', false)
               RETURNING id`,
              [newId(), analysis.id, gap.category, gap.requirement.toLowerCase().trim(), gap.requirement],
            )
          ).rows[0].id as string;

        await client.query(
          `INSERT INTO "ScoreGap" (id, "jobScoreId", "requirementId", severity, reason)
           VALUES ($1, $2, $3, $4, $5)`,
          [newId(), scoreRow.id, requirementId, gap.severity, gap.reason],
        );
      }

      return scoreRow;
    });

    await writeAudit({
      actorType: 'SYSTEM',
      action: 'JOB_SCORED',
      entityType: 'JobOffer',
      entityId: id,
      after: {
        scoreId: saved.id,
        total: score.total,
        ruleVersion: rule.version,
        gapCount: score.gaps.length,
      },
      correlationId: `JOB-${id.slice(0, 8).toUpperCase()}`,
    });

    return NextResponse.json(
      { score: saved, gaps: score.gaps, rule: { name: rule.name, version: rule.version } },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/jobs/[id]/score failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
