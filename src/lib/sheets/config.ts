import { readServiceAccount, type ServiceAccount } from '@/lib/google/service-account';

/**
 * Configuracion de la hoja de Drive. Opcional: sin ella las inscripciones se
 * guardan igual en Supabase, que es la fuente de verdad, y solo no se copian.
 */
export interface SheetsConfig {
  spreadsheetId: string;
  account: ServiceAccount;
  tab: string;
}

export function readSheetsConfig(source: Record<string, string | undefined>): SheetsConfig | null {
  const spreadsheetId = source.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? '';
  const account = readServiceAccount(source);
  const tab = source.GOOGLE_SHEETS_TAB?.trim() || 'Inscripciones';

  if (!spreadsheetId && !account) return null;
  if (!/^[A-Za-z0-9_-]{20,}$/.test(spreadsheetId)) {
    throw new Error(
      'GOOGLE_SHEETS_SPREADSHEET_ID debe ser el id de la hoja (lo que va entre /d/ y /edit en la URL)',
    );
  }
  if (!account) {
    throw new Error('Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
  }
  return { spreadsheetId, account, tab };
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
