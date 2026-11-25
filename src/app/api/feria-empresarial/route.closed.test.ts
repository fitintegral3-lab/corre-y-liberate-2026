import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/feria-empresarial/route';

// Supabase se habla por HTTP: si la ruta intentara guardar, este `fetch` lo registraría.
const dbFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', 'https://testproject.supabase.co');
  vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
  vi.stubGlobal('fetch', dbFetch);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Feria Empresarial cerrada', () => {
  it('rechaza envíos nuevos sin tocar la base', async () => {
    const request = new Request('http://localhost/api/feria-empresarial', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ submissionId: crypto.randomUUID() }),
    });

    const response = await POST(request);
    expect(response.status).toBe(410);
    expect(await response.json()).toEqual({ ok: false, reason: 'closed' });
    expect(dbFetch).not.toHaveBeenCalled();
  });
});
