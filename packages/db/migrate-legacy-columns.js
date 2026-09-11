/**
 * Renames lowercase columns created by an older schema.sql (unquoted identifiers)
 * to quoted camelCase names expected by the application SQL.
 */
const CAMEL_COLUMNS = [
  'firstName',
  'lastName',
  'createdAt',
  'updatedAt',
  'profileId',
  'startDate',
  'endDate',
  'experienceId',
  'projectId',
  'measurableValue',
  'normalizedName',
  'issueDate',
  'expirationDate',
  'credentialUrl',
  'sourceId',
  'contentHash',
  'rawText',
  'storagePath',
  'capturedAt',
  'snapshotId',
  'claimId',
  'evidenceId',
  'baseUrl',
  'companyId',
  'externalId',
  'normalizedTitle',
  'remoteType',
  'descriptionHash',
  'publishedAt',
  'discoveredAt',
  'canonicalUrl',
  'jobOfferId',
  'requiredSkills',
  'preferredSkills',
  'educationRequirements',
  'experienceRequirements',
  'extractedBy',
  'promptVersion',
  'jobAnalysisId',
  'originalText',
  'educationWeight',
  'experienceWeight',
  'skillsWeight',
  'toolsWeight',
  'keywordWeight',
  'educationScore',
  'experienceScore',
  'skillsScore',
  'toolsScore',
  'keywordScore',
  'ruleVersionId',
  'jobScoreId',
  'requirementId',
  'applicationId',
  'templateVersion',
  'generationModel',
  'cvVersionId',
  'coverLetterVersionId',
  'fromStatus',
  'toStatus',
  'actorType',
  'actorId',
  'correlationId',
  'contactId',
  'observedAt',
  'daysSinceLastContact',
  'linkedinUrl',
  'entityType',
  'entityId',
  'approvedBy',
  'approvedAt',
  'expiresAt',
  'appliedAt',
];

async function needsLegacyMigration(client) {
  const result = await client.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'ScoreRuleVersion'
       AND column_name = 'educationweight'
     LIMIT 1`,
  );
  return result.rowCount > 0;
}

async function migrateLegacyColumns(client) {
  if (!(await needsLegacyMigration(client))) {
    return 0;
  }

  const tables = await client.query(
    `SELECT DISTINCT table_name
     FROM information_schema.columns
     WHERE table_schema = 'public'`,
  );

  let renamed = 0;
  for (const { table_name: tableName } of tables.rows) {
    const columns = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [tableName],
    );
    const columnNames = new Set(columns.rows.map((row) => row.column_name));

    for (const target of CAMEL_COLUMNS) {
      const legacy = target.toLowerCase();
      if (columnNames.has(legacy) && !columnNames.has(target)) {
        await client.query(`ALTER TABLE "${tableName}" RENAME COLUMN ${legacy} TO "${target}"`);
        console.info(`[setup-db] Renamed ${tableName}.${legacy} -> "${target}"`);
        columnNames.delete(legacy);
        columnNames.add(target);
        renamed += 1;
      }
    }
  }

  return renamed;
}

module.exports = { migrateLegacyColumns, needsLegacyMigration };
