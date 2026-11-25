import { downloadStorageObject, receiptsConfig } from '@/lib/gcs/receipts';
import { readSheetsConfig, type SheetsConfig } from '@/lib/sheets/config';

/**
 * Configuración de un libro de respuestas aparte del de inscripciones. El ID
 * sale de la variable de entorno o, si no está, de un objeto del bucket
 * privado: así se conecta un libro nuevo sin volver a desplegar. Devuelve
 * `null` (y no copia) si falta, o si apunta al libro de inscripciones.
 */
export async function linkedSheetsConfig(link: {
  envValue: string | undefined;
  storageObject: string;
  tab: string;
  label: string;
}): Promise<SheetsConfig | null> {
  try {
    let spreadsheetId = link.envValue?.trim();
    if (!spreadsheetId) {
      const storage = receiptsConfig();
      if (!storage) return null;

      const file = await downloadStorageObject(storage, link.storageObject);
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
      GOOGLE_SHEETS_TAB: link.tab,
    });
  } catch (error) {
    console.error(
      `[${link.label}] configuración de Sheets no disponible:`,
      (error as Error).message,
    );
    return null;
  }
}
