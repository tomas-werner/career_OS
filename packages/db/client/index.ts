/**
 * PostgreSQL client singleton for Career OS.
 * Connection string comes from POSTGRES_URL (Neon PostgreSQL).
 *
 * Neon serverless endpoints aggressively close idle TCP sockets. The pool
 * therefore keeps connections warm and every helper retries once on
 * transient connection errors ("connection terminated", 57P01, ECONNRESET)
 * — a failed retry never corrupts data since SELECTs are idempotent and
 * writes run inside transactions that simply roll back.
 */
import { Pool } from 'pg';
import type { PoolClient } from 'pg';
export * from './types';

const globalForDb = globalThis as unknown as { db?: Pool };

export const db: Pool =
  globalForDb.db ??
  new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
  });

// Drop dead sockets instead of crashing the process (Neon recycles
// idle connections; the pool transparently opens a fresh one).
db.on('error', (error) => {
  console.warn('[db] idle client error (socket recycled):', error.message);
});

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

const TRANSIENT_PATTERNS = [
  'connection terminated',
  'Connection terminated',
  'ECONNRESET',
  'ETIMEDOUT',
  'socket hang up',
  '57P01', // admin shutdown
  '08006', // connection failure
];

function isTransient(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string }).code;
  return TRANSIENT_PATTERNS.some((pattern) => message.includes(pattern) || code === pattern);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to execute a single query, retrying once on transient failures.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await db.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn('Slow query:', { text, duration, rows: res.rowCount });
    }
    return res.rows as T[];
  } catch (error) {
    if (isTransient(error)) {
      await sleep(200);
      const res = await db.query(text, params);
      return res.rows as T[];
    }
    console.error('Query error:', { text, error });
    throw error;
  }
}

/**
 * Helper to execute a transaction, retrying the whole callback once on
 * transient failures. The callback must be idempotent-safe on retry
 * (rollback guarantees no partial state from the failed attempt).
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const attempt = async (): Promise<T> => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // connection already dead — release will discard the socket
      }
      throw error;
    } finally {
      client.release();
    }
  };

  try {
    return await attempt();
  } catch (error) {
    if (isTransient(error)) {
      await sleep(200);
      return attempt();
    }
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await db.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
