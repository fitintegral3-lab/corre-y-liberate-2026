import { after } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/feria-empresarial/route';
import { appendFairResponse } from '@/lib/sheets/append-fair';
import { fairSheetsConfig } from '@/lib/sheets/fair-config';

vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/lib/sheets/append-fair', () => ({ appendFairResponse: vi.fn() }));
vi.mock('@/lib/sheets/fair-config', () => ({ fairSheetsConfig: vi.fn() }));

const payload = {
  submissionId: '46f4a99e-015b-4f2a-8f91-e517a292dea6',
  fullName: 'Emprendedora de prueba',
  identification: '000123',
  age: '30',
  phone: '3000000000',
  email: 'feria@example.com',
  neighborhood: 'Sector de prueba',
  headOfHousehold: 'Sí',
  businessName: 'Emprendimiento de prueba',
  products: 'Productos locales',
  activities: ['Comercio', 'Otro'],
  otherActivity: 'Actividad de prueba',
  operatingTime: 'Menos de 1 año',
  teamSize: '2',
  formalization: 'En proceso',
  consent: 'on',
};

const sheets = {
  spreadsheetId: 'test-sheet',
  tab: 'Feria Empresarial',
  account: { clientEmail: 'test@example.com', privateKey: 'test-key' },
};
const createdAt = '2026-11-22T05:00:00+00:00';
const dbFetch = vi.fn<typeof fetch>();

function request(body: unknown = payload) {
  return new Request('http://localhost/api/feria-empresarial', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SUPABASE_URL', 'https://testproject.supabase.co');
  vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
  vi.stubGlobal('fetch', dbFetch);
  vi.mocked(fairSheetsConfig).mockResolvedValue(sheets);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('guardado de la Feria Empresarial', () => {
  it('confirma tras guardar en Supabase y después intenta la copia a Sheets', async () => {
    dbFetch.mockResolvedValueOnce(Response.json([{ created_at: createdAt }], { status: 201 }));
    vi.mocked(appendFairResponse).mockRejectedValueOnce(new Error('Sheets no disponible'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect((await POST(request())).status).toBe(201);
      expect(dbFetch).toHaveBeenCalledTimes(1);
      const [url, init] = dbFetch.mock.calls[0];
      expect(String(url)).toContain('/rest/v1/fair_submissions?on_conflict=submission_id');
      expect(new Headers(init?.headers).get('Prefer')).toContain('resolution=ignore-duplicates');
      expect(JSON.parse(String(init?.body))).toMatchObject({
        submission_id: payload.submissionId,
        identification: '000123',
        activities: ['Comercio', 'Otro'],
        other_activity: payload.otherActivity,
        team_size: 2,
        consent_version: 'feria-empresarial-2026-v1',
      });
      expect(fairSheetsConfig).not.toHaveBeenCalled();
      const copy = vi.mocked(after).mock.calls[0][0];
      if (typeof copy !== 'function') throw new Error('Se esperaba una tarea de copia');
      await copy();
      expect(appendFairResponse).toHaveBeenCalledWith(
        sheets,
        expect.objectContaining({ submissionId: payload.submissionId }),
        createdAt,
        'feria-empresarial-2026-v1',
      );
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it('confirma un reintento sin programar otra copia', async () => {
    dbFetch.mockResolvedValueOnce(Response.json([], { status: 201 }));
    expect((await POST(request())).status).toBe(200);
    expect(after).not.toHaveBeenCalled();
  });

  it('rechaza un envío inválido antes de acceder a la base', async () => {
    expect((await POST(request({}))).status).toBe(422);
    expect(dbFetch).not.toHaveBeenCalled();
  });

  it('devuelve un error recuperable si Supabase no puede guardar', async () => {
    dbFetch.mockResolvedValueOnce(
      Response.json({ code: '42501', message: 'permission denied' }, { status: 403 }),
    );
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect((await POST(request())).status).toBe(503);
      expect(after).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
