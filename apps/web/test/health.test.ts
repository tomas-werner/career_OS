import { describe, expect, it } from 'vitest';

describe('api route exports', () => {
  it('health route exports GET only', async () => {
    const mod = await import('../app/api/health/route');
    expect(typeof mod.GET).toBe('function');
    expect(Object.keys(mod).sort()).toEqual(['GET', 'dynamic']);
  });

  it('health/db route exports GET only', async () => {
    const mod = await import('../app/api/health/db/route');
    expect(typeof mod.GET).toBe('function');
    expect(Object.keys(mod).sort()).toEqual(['GET', 'dynamic']);
  });

  it('jobs route exports POST only', async () => {
    const mod = await import('../app/api/jobs/route');
    expect(typeof mod.POST).toBe('function');
    expect(Object.keys(mod).sort()).toEqual(['POST', 'dynamic']);
  });
});
