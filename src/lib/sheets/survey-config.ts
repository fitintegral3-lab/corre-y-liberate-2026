import { SURVEY_TAB } from '@/features/experience-survey/sheet-row';
import { linkedSheetsConfig } from '@/lib/sheets/linked-config';

import type { SheetsConfig } from '@/lib/sheets/config';

export function surveySheetsConfig(): Promise<SheetsConfig | null> {
  return linkedSheetsConfig({
    envValue: process.env.SURVEY_SHEETS_SPREADSHEET_ID,
    storageObject: 'config/encuesta.txt',
    tab: SURVEY_TAB,
    label: 'encuesta',
  });
}
