import Link from 'next/link';
import { query } from '@career-os/db';

export const dynamic = 'force-dynamic';

interface AuditRow {
  id: string;
  timestamp: Date;
  actorType: string;
  action: string;
  entityType: string;
  entityId: string | null;
  correlationId: string | null;
  source: string | null;
}

interface FilterOptions {
  actors: string[];
  actions: string[];
  entityTypes: string[];
}

const PAGE_SIZE = 50;

function fmt(timestamp: Date): string {
  return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const actor = get('actor') ?? '';
  const action = get('action') ?? '';
  const entityType = get('entityType') ?? '';
  const correlationId = get('correlationId') ?? '';
  const date = get('date') ?? '';
  const page = Math.max(1, Number(get('page') ?? '1') || 1);

  const conditions: string[] = [];
  const values: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    values.push(value);
    conditions.push(clause.replace('$N', `$${values.length}`));
  };
  if (actor) add('"actorType" = $N', actor);
  if (action) add('action ILIKE $N', `%${action}%`);
  if (entityType) add('"entityType" = $N', entityType);
  if (correlationId) add('"correlationId" = $N', correlationId);
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    add('"timestamp" >= $N::date AND "timestamp" < ($N::date + INTERVAL \'1 day\')', date);
    // bind date twice for the two placeholders
    values.push(date);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows, countRows, options] = await Promise.all([
    query<AuditRow>(
      `SELECT id, timestamp, "actorType", action, "entityType", "entityId", "correlationId", source
       FROM "AuditLog" ${where}
       ORDER BY timestamp DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, PAGE_SIZE, (page - 1) * PAGE_SIZE],
    ),
    query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM "AuditLog" ${where}`, values),
    query<FilterOptions>(
      `SELECT
         (SELECT array_agg(DISTINCT "actorType") FROM "AuditLog") AS actors,
         (SELECT array_agg(DISTINCT action) FROM "AuditLog") AS actions,
         (SELECT array_agg(DISTINCT "entityType") FROM "AuditLog") AS entityTypes`,
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const opts = {
    actors: options[0]?.actors ?? [],
    actions: options[0]?.actions ?? [],
    entityTypes: options[0]?.entityTypes ?? [],
  };

  const buildHref = (overrides: Record<string, string>) => {
    const next = new URLSearchParams();
    const base = { actor, action, entityType, correlationId, date, ...overrides };
    for (const [key, value] of Object.entries(base)) {
      if (value) next.set(key, value);
    }
    return `/audit?${next.toString()}`;
  };

  return (
    <div>
      <h1>Audit trail</h1>
      <p className="muted">
        Immutable, append-only audit log (plan.md sections 30-32, 45). UPDATE and
        DELETE are blocked at the database level; filters follow §45.
      </p>

      <form className="card" method="get">
        <div className="form-grid">
          <label>
            Actor
            <select name="actor" defaultValue={actor}>
              <option value="">all</option>
              {opts.actors.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Action (contains)
            <select name="action" defaultValue={action}>
              <option value="">all</option>
              {opts.actions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Entity type
            <select name="entityType" defaultValue={entityType}>
              <option value="">all</option>
              {opts.entityTypes.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" name="date" defaultValue={date} />
          </label>
          <label>
            Correlation ID
            <input name="correlationId" defaultValue={correlationId} placeholder="APP-…" />
          </label>
        </div>
        <div className="panel-buttons">
          <button type="submit">Filter</button>
          <Link href="/audit" className="muted" style={{ alignSelf: 'center' }}>
            Reset
          </Link>
        </div>
      </form>

      <div className="card">
        <strong>
          {total} event{total === 1 ? '' : 's'} — page {page}/{pages}
        </strong>
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Correlation</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="muted">{fmt(row.timestamp)}</td>
                <td>
                  <code>{row.actorType}</code>
                </td>
                <td>{row.action}</td>
                <td className="muted">
                  {row.entityType}
                  {row.entityId ? ` (${row.entityId.slice(0, 8)}…)` : ''}
                </td>
                <td>
                  {row.correlationId ? <code>{row.correlationId}</code> : <span className="muted">—</span>}
                </td>
                <td className="muted">{row.source ?? '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No audit events match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {pages > 1 && (
          <p className="panel-buttons">
            {page > 1 && (
              <Link href={buildHref({ page: String(page - 1) })} className="muted">
                ← Previous
              </Link>
            )}
            {page < pages && (
              <Link href={buildHref({ page: String(page + 1) })} className="muted">
                Next →
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
