import { accessToken } from '@/lib/google/service-account';

import type { SheetsConfig } from '@/lib/sheets/config';

type Cell = string | number | null;

/**
 * Agrega `row` a la pestaña si su referencia (columna A) todavía no está.
 * Con la pestaña vacía escribe antes los encabezados, así que un libro recién
 * creado no necesita preparación.
 */
export async function appendRowOnce(
  config: SheetsConfig,
  headers: readonly string[],
  row: readonly Cell[],
) {
  const token = await accessToken(config.account, ['https://www.googleapis.com/auth/spreadsheets']);
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values`;

  const references = await fetch(`${base}/${encodeURIComponent(`'${config.tab}'!A1:A`)}`, {
    headers: auth,
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });
  if (!references.ok) throw new Error(`Lectura de referencias: HTTP ${references.status}`);

  const { values = [] } = (await references.json()) as { values?: string[][] };
  if (values.some(([reference]) => reference === row[0])) return;

  const lastColumn = String.fromCharCode(64 + headers.length);
  const range = encodeURIComponent(`'${config.tab}'!A1:${lastColumn}`);
  const saved = await fetch(
    `${base}/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ values: values.length === 0 ? [headers, row] : [row] }),
      signal: AbortSignal.timeout(6000),
    },
  );
  if (!saved.ok) throw new Error(`Guardado: HTTP ${saved.status}`);
}
