import { FAIR_TAB } from '@/features/entrepreneur-fair/sheet-row';
import { downloadStorageObject, receiptsConfig } from '@/lib/gcs/receipts';
import { readSheetsConfig, type SheetsConfig } from '@/lib/sheets/config';

const FAIR_CONFIG_OBJECT = 'config/feria-empresarial.txt';

export async function fairSheetsConfig(): Promise<SheetsConfig | null> {
  try {
    let spreadsheetId = process.env.FAIR_SHEETS_SPREADSHEET_ID?.trim();
    if (!spreadsheetId) {
      const storage = receiptsConfig();
      if (!storage) return null;

      const file = await downloadStorageObject(storage, FAIR_CONFIG_OBJECT);
      if (!file) return null;
      spreadsheetId = new TextDecoder().decode(file.body).trim();
    }

    if (!spreadsheetId || spreadsheetId === process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim()) {
      return null;
    }

    return readSheetsConfig({
      GOOGLE_SHEETS_SPREADSHEET_ID: spreadsheetId,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      GOOGLE_SHEETS_TAB: FAIR_TAB,
    });
  } catch (error) {
    console.error('[feria] configuración de Sheets no disponible:', (error as Error).message);
    return null;
  }
}
