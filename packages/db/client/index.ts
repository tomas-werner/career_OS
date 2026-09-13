/**
 * PostgreSQL client singleton for Career OS.
 * Connection string comes from POSTGRES_URL (Neon PostgreSQL).
 */
import { Pool } from 'pg';
import type { PoolClient } from 'pg';
export * from './types';

const globalForDb = globalThis as unknown as { db?: Pool };

export const db: Pool =
  globalForDb.db ?? new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

/**
 * Helper to execute a single query
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
    console.error('Query error:', { text, error });
    throw error;
  }
}

/**
 * Helper to execute a transaction
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
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
