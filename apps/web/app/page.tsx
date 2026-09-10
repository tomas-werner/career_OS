import { getHealth } from '@/lib/health';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const health = await getHealth();
  return (
    <div>
      <h1>Career OS — Dashboard</h1>
      <div className="card">
        <strong>System health</strong>
        <p className={health.db ? 'ok' : 'err'}>
          Database (Neon PostgreSQL): {health.db ? 'connected' : 'unavailable'}
        </p>
        <p className="muted">Checked at {health.checkedAt.toISOString()}</p>
      </div>
      <div className="card">
        <strong>Stage A status</strong>
        <ul>
          <li>Monorepo: pnpm workspace (apps/web, packages/db, packages/shared)</li>
          <li>Database: Prisma + Neon PostgreSQL via POSTGRES_URL</li>
          <li>Health endpoints: /health, /health/db, /health/n8n</li>
          <li>Automation: docker compose (web + n8n)</li>
        </ul>
        <p className="muted">
          Next stages (plan.md section 52): Master Profile UI, Evidence engine, Claim engine,
          then Job Intelligence.
        </p>
      </div>
    </div>
  );
}
