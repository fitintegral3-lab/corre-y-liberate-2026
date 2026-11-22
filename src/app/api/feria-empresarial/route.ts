import { consentVersion, fairResponseSchema } from '@/features/entrepreneur-fair/schema';
import { toFairRow } from '@/features/entrepreneur-fair/sheet-row';
import { accessToken } from '@/lib/google/service-account';
import { fairSheetsConfig } from '@/lib/sheets/fair-config';

export async function POST(request: Request) {
  const parsed = fairResponseSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ ok: false, reason: 'invalid' }, { status: 422 });
  }

  const config = await fairSheetsConfig();
  if (!config) return Response.json({ ok: false }, { status: 503 });

  const data = parsed.data;

  try {
    const token = await accessToken(config.account, [
      'https://www.googleapis.com/auth/spreadsheets',
    ]);
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values`;
    const references = await fetch(`${base}/${encodeURIComponent(`'${config.tab}'!A2:A`)}`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!references.ok) throw new Error(`Lectura de referencias: HTTP ${references.status}`);

    const { values = [] } = (await references.json()) as { values?: string[][] };
    if (values.some(([reference]) => reference === data.submissionId)) {
      return Response.json({ ok: true });
    }

    const range = encodeURIComponent(`'${config.tab}'!A1:U`);
    const saved = await fetch(
      `${base}/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          values: [toFairRow(data, new Date().toISOString(), consentVersion)],
        }),
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!saved.ok) throw new Error(`Guardado: HTTP ${saved.status}`);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('[feria] no se guardó la respuesta:', (error as Error).message);
    return Response.json({ ok: false }, { status: 503 });
  }
}
