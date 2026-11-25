import { FAIR_HEADERS, toFairRow } from '@/features/entrepreneur-fair/sheet-row';
import { appendRowOnce } from '@/lib/sheets/append-once';

import type { FairResponse } from '@/features/entrepreneur-fair/schema';
import type { SheetsConfig } from '@/lib/sheets/config';

// Una respuesta puede estar ya en Sheets si se envió antes del paso a la base:
// `appendRowOnce` no la repite.
export function appendFairResponse(
  config: SheetsConfig,
  data: FairResponse,
  createdAt: string,
  consentVersion: string,
) {
  return appendRowOnce(config, FAIR_HEADERS, toFairRow(data, createdAt, consentVersion));
}
