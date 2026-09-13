import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query, transaction } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import {
  extractJobAnalysis,
  scanForPromptInjection,
  sanitizeJobText,
  PROMPT_VERSION,
  MAX_JOB_TEXT_LENGTH,
} from '@/lib/ai/extraction';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface JobRow {
  id: string;
  title: string;
  description: string;
  companyId: string;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const apiKey = process.env.nvidia_api_key;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI extraction unavailable — nvidia_api_key is not configured' },
      { status: 503 },
    );
  }

  try {
    const jobs = await query<JobRow>('SELECT id, title, description FROM "JobOffer" WHERE id = $1', [
      id,
    ]);
    const job = jobs[0];
    if (!job) {
      return NextResponse.json({ error: 'Job offer not found' }, { status: 404 });
    }
    if (job.description.length > MAX_JOB_TEXT_LENGTH) {
      return NextResponse.json({ error: 'Job description too long for extraction' }, { status: 413 });
    }

    const injectionScan = scanForPromptInjection(job.description);
    const sanitized = sanitizeJobText(job.description);

    const result = await extractJobAnalysis(
      { jobTitle: job.title, jobDescription: sanitized },
      { apiKey, model: process.env.nvidia_model },
    );

    if (!result.ok) {
      await writeAudit({
        actorType: 'AI',
        action: 'AI_ERROR',
        entityType: 'JobOffer',
        entityId: id,
        source: 'nvidia',
        metadata: { reason: result.reason, detail: result.detail, stage: 'job-analysis' },
        correlationId: `JOB-${id.slice(0, 8).toUpperCase()}`,
      });
      return NextResponse.json(
        { error: 'AI extraction failed', reason: result.reason, detail: result.detail },
        { status: 502 },
      );
    }

    const analysis = result.data;
    const saved = await transaction(async (client) => {
      const analysisResult = await client.query(
        `INSERT INTO "JobAnalysis"
         (id, "jobOfferId", title, seniority, "requiredSkills", "preferredSkills", tools,
          technologies, keywords, responsibilities, "educationRequirements",
          "experienceRequirements", "extractedBy", "promptVersion")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          newId(),
          id,
          analysis.title,
          analysis.seniority,
          analysis.requiredSkills,
          analysis.preferredSkills,
          analysis.tools,
          analysis.technologies,
          analysis.keywords,
          analysis.responsibilities,
          analysis.educationRequirements,
          analysis.experienceRequirements,
          'nvidia',
          PROMPT_VERSION,
        ],
      );
      const analysisRow = analysisResult.rows[0] as { id: string };

      // Persist individual requirements (section 10) linked to the analysis.
      const requirements: { category: string; normalizedName: string; originalText: string; importance: string; mandatory: boolean }[] = [];
      const addRequirements = (
        items: string[],
        category: string,
        importance: string,
        mandatory: boolean,
      ) => {
        for (const item of items) {
          requirements.push({
            category,
            normalizedName: item.toLowerCase().trim(),
            originalText: item,
            importance,
            mandatory,
          });
        }
      };
      addRequirements(analysis.requiredSkills, 'SKILL', 'MANDATORY', true);
      addRequirements(analysis.preferredSkills, 'SKILL', 'PREFERRED', false);
      addRequirements(analysis.tools, 'TOOL', 'PREFERRED', false);
      addRequirements(analysis.technologies, 'TECHNOLOGY', 'PREFERRED', false);
      addRequirements(analysis.keywords, 'KEYWORD', 'OPTIONAL', false);
      addRequirements(analysis.educationRequirements, 'EDUCATION', 'MANDATORY', true);
      addRequirements(analysis.experienceRequirements, 'EXPERIENCE', 'MANDATORY', true);

      for (const requirement of requirements) {
        await client.query(
          `INSERT INTO "JobRequirement"
           (id, "jobAnalysisId", category, "normalizedName", "originalText", importance, mandatory)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newId(),
            analysisRow.id,
            requirement.category,
            requirement.normalizedName,
            requirement.originalText,
            requirement.importance,
            requirement.mandatory,
          ],
        );
      }

      return analysisRow;
    });

    await writeAudit({
      actorType: 'AI',
      action: 'JOB_ANALYZED',
      entityType: 'JobOffer',
      entityId: id,
      source: 'nvidia',
      after: {
        analysisId: saved.id,
        title: analysis.title,
        requiredSkillsCount: analysis.requiredSkills.length,
        promptInjectionSuspected: injectionScan.suspected,
      },
      correlationId: `JOB-${id.slice(0, 8).toUpperCase()}`,
    });

    return NextResponse.json(
      {
        analysis: saved,
        warnings: injectionScan.suspected
          ? { promptInjectionSuspected: true, patterns: injectionScan.patterns }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/jobs/[id]/analyze failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
