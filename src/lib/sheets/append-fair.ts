import { toFairRow } from '@/features/entrepreneur-fair/sheet-row';
import { accessToken } from '@/lib/google/service-account';

import type { FairResponse } from '@/features/entrepreneur-fair/schema';
import type { SheetsConfig } from '@/lib/sheets/config';

export async function appendFairResponse(
  config: SheetsConfig,
  data: FairResponse,
  createdAt: string,
  consentVersion: string,
) {
  const token = await accessToken(config.account, ['https://www.googleapis.com/auth/spreadsheets']);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values`;

  // A response may already be in Sheets if it was submitted before the database cutover.
  const references = await fetch(`${base}/${encodeURIComponent(`'${config.tab}'!A2:A`)}`, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });
  if (!references.ok) throw new Error(`Lectura de referencias: HTTP ${references.status}`);

  const { values = [] } = (await references.json()) as { values?: string[][] };
  if (values.some(([reference]) => reference === data.submissionId)) return;

  const range = encodeURIComponent(`'${config.tab}'!A1:U`);
  const saved = await fetch(
    `${base}/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ values: [toFairRow(data, createdAt, consentVersion)] }),
      signal: AbortSignal.timeout(6000),
    },
  );
  if (!saved.ok) throw new Error(`Guardado: HTTP ${saved.status}`);
}
