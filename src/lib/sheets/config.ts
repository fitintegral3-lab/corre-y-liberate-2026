/**
 * Configuracion de la hoja de Drive. Opcional: sin ella las inscripciones se
 * guardan igual en Supabase, que es la fuente de verdad, y solo no se copian.
 *
 * La llave privada de la cuenta de servicio viene del JSON que da Google, en
 * una sola linea con `\n` escritos; aca se devuelven a saltos de linea reales,
 * que es lo que espera la firma.
 */
export interface SheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  tab: string;
}

export function readSheetsConfig(source: Record<string, string | undefined>): SheetsConfig | null {
  const spreadsheetId = source.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? '';
  const clientEmail = source.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? '';
  const privateKey = (source.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n').trim();
  const tab = source.GOOGLE_SHEETS_TAB?.trim() || 'Inscripciones';

  if (!spreadsheetId && !clientEmail && !privateKey) return null;
  if (!/^[A-Za-z0-9_-]{20,}$/.test(spreadsheetId)) {
    throw new Error(
      'GOOGLE_SHEETS_SPREADSHEET_ID debe ser el id de la hoja (lo que va entre /d/ y /edit en la URL)',
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(clientEmail)) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL debe ser el client_email de la cuenta de servicio (...iam.gserviceaccount.com)',
    );
  }
  if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY debe ser el private_key del JSON (empieza con -----BEGIN PRIVATE KEY-----)',
    );
  }
  return { spreadsheetId, clientEmail, privateKey, tab };
}

/** Como `readSheetsConfig` sobre el proceso, pero nunca lanza: registra y apaga la copia. */
export function sheetsConfig(): SheetsConfig | null {
  try {
    return readSheetsConfig({
      GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      GOOGLE_SHEETS_TAB: process.env.GOOGLE_SHEETS_TAB,
    });
  } catch (error) {
    console.error(
      '[sheets] configuracion invalida, no se copia a Drive:',
      (error as Error).message,
    );
    return null;
  }
}
