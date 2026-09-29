import { accessToken } from '@/lib/google/service-account';
import { SHEET_HEADERS } from '@/lib/sheets/registration-row';

import type { SheetsConfig } from '@/lib/sheets/config';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

/** Letra de columna de una hoja: 0 -> A, 25 -> Z, 26 -> AA. */
export function columnLetter(index: number): string {
  let letters = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
  }
  return letters;
}

// Las columnas salen de los encabezados y no se escriben a mano: si se agrega
// una columna antes, estas letras se corren solas.
const STATUS_COLUMN = columnLetter(SHEET_HEADERS.indexOf('Estado pago'));
const ID_COLUMN = columnLetter(SHEET_HEADERS.indexOf('ID'));

const a1 = (tab: string, range: string) => `'${tab.replace(/'/g, "''")}'!${range}`;

/**
 * Cambia "Estado pago" en la fila de una inscripcion, buscandola por su ID.
 * Devuelve `false` si la fila no esta (por ejemplo, una inscripcion de antes
 * de la copia a Drive): la base es la fuente de verdad y no se inventa la fila.
 */
export async function updateSheetStatus(
  config: SheetsConfig,
  id: string,
  status: string,
): Promise<boolean> {
  const token = await accessToken(config.account, [SCOPE]);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base = `${SHEETS_API}/${encodeURIComponent(config.spreadsheetId)}/values`;

  const ids = await fetch(
    `${base}/${encodeURIComponent(a1(config.tab, `${ID_COLUMN}:${ID_COLUMN}`))}`,
    { headers },
  );
  if (!ids.ok)
    throw new Error(`Sheets respondio ${ids.status} al buscar el ID: ${await ids.text()}`);
  const { values } = (await ids.json()) as { values?: string[][] };
  const rowIndex = (values ?? []).findIndex((row) => row[0] === id);
  if (rowIndex < 0) return false;

  const cell = a1(config.tab, `${STATUS_COLUMN}${rowIndex + 1}`);
  const update = await fetch(`${base}/${encodeURIComponent(cell)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ range: cell, majorDimension: 'ROWS', values: [[status]] }),
  });
  if (!update.ok)
    throw new Error(
      `Sheets respondio ${update.status} al cambiar el estado: ${await update.text()}`,
    );
  return true;
}
