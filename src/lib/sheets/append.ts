import { accessToken } from '@/lib/google/service-account';
import { SHEET_HEADERS, toSheetRow, type SheetRegistration } from '@/lib/sheets/registration-row';

import type { SheetsConfig } from '@/lib/sheets/config';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

/** `'Inscripciones'!A1`, con comillas por si la pestana tiene espacios. */
const a1 = (tab: string, cell: string) => `'${tab.replace(/'/g, "''")}'!${cell}`;

/**
 * Agrega una inscripcion al final de la pestana. Si la pestana esta vacia,
 * escribe antes los encabezados, para que la hoja se arme sola la primera vez.
 *
 * `valueInputOption=RAW`: los valores se guardan tal cual, sin interpretarse.
 * Con la otra opcion un nombre que empiece con `=` podria leerse como formula.
 */
export async function appendRegistration(
  config: SheetsConfig,
  registration: SheetRegistration,
): Promise<void> {
  const token = await accessToken(config.account, [SCOPE]);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base = `${SHEETS_API}/${encodeURIComponent(config.spreadsheetId)}/values`;

  const first = await fetch(`${base}/${encodeURIComponent(a1(config.tab, 'A1'))}`, { headers });
  if (!first.ok)
    throw new Error(
      `Sheets respondio ${first.status} al leer ${config.tab}!A1: ${await first.text()}`,
    );
  const { values } = (await first.json()) as { values?: string[][] };

  const rows = values?.length
    ? [toSheetRow(registration)]
    : [[...SHEET_HEADERS], toSheetRow(registration)];
  const append = await fetch(
    `${base}/${encodeURIComponent(a1(config.tab, 'A1'))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: 'POST', headers, body: JSON.stringify({ majorDimension: 'ROWS', values: rows }) },
  );
  if (!append.ok)
    throw new Error(`Sheets respondio ${append.status} al agregar la fila: ${await append.text()}`);
}
