import { FAIR_TAB } from '@/features/entrepreneur-fair/sheet-row';
import { linkedSheetsConfig } from '@/lib/sheets/linked-config';

import type { SheetsConfig } from '@/lib/sheets/config';

export function fairSheetsConfig(): Promise<SheetsConfig | null> {
  return linkedSheetsConfig({
    envValue: process.env.FAIR_SHEETS_SPREADSHEET_ID,
    storageObject: 'config/feria-empresarial.txt',
    tab: FAIR_TAB,
    label: 'feria',
  });
}
