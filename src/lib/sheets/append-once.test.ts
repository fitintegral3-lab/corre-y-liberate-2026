import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appendRowOnce } from '@/lib/sheets/append-once';

// Firmar un token real exige una llave privada; acá solo importa lo que se le pide a Sheets.
vi.mock('@/lib/google/service-account', () => ({ accessToken: vi.fn(async () => 'token') }));

const config = {
  spreadsheetId: 'test-sheet',
  tab: 'Encuesta',
  account: { clientEmail: 'test@example.com', privateKey: 'test-key' },
};
const headers = ['Referencia', 'Nombre', 'Nota'];
const row = ['ref-2', 'Corredora', 5];
// Google Sheets se habla por HTTP: se reemplaza `fetch` para no tocar ningún libro real.
const sheetsFetch = vi.fn<typeof fetch>();

function existing(values: string[][]) {
  sheetsFetch.mockResolvedValueOnce(Response.json(values.length ? { values } : {}));
  sheetsFetch.mockResolvedValueOnce(Response.json({}));
}

function appended() {
  const append = sheetsFetch.mock.calls.find(([, init]) => init?.method === 'POST');
  return (
    append && {
      range: decodeURIComponent(String(append[0])),
      values: JSON.parse(String(append[1]?.body)).values as unknown[][],
    }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', sheetsFetch);
});

afterEach(() => vi.unstubAllGlobals());

describe('agregar una fila sin repetirla', () => {
  it('en una pestaña vacía escribe los encabezados y la fila', async () => {
    existing([]);
    await appendRowOnce(config, headers, row);
    expect(appended()?.values).toEqual([headers, row]);
    expect(appended()?.range).toContain("'Encuesta'!A1:C");
  });

  it('con datos previos agrega solo la fila', async () => {
    existing([['Referencia'], ['ref-1']]);
    await appendRowOnce(config, headers, row);
    expect(appended()?.values).toEqual([row]);
  });

  it('no repite una referencia que ya está en la hoja', async () => {
    existing([['Referencia'], ['ref-2']]);
    await appendRowOnce(config, headers, row);
    expect(appended()).toBeUndefined();
  });

  it('falla si Sheets no deja leer, para que quien llama lo registre', async () => {
    sheetsFetch.mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(appendRowOnce(config, headers, row)).rejects.toThrow('HTTP 403');
  });
});
