import { after } from 'next/server';

import { entrepreneurFair } from '@/content/entrepreneur-fair';
import { consentVersion, fairResponseSchema } from '@/features/entrepreneur-fair/schema';
import { toFairSubmission } from '@/features/entrepreneur-fair/submission-row';
import { appendFairResponse } from '@/lib/sheets/append-fair';
import { fairSheetsConfig } from '@/lib/sheets/fair-config';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabaseConfig } from '@/lib/supabase/config';

export async function POST(request: Request) {
  if (!entrepreneurFair.open)
    return Response.json({ ok: false, reason: 'closed' }, { status: 410 });

  const parsed = fairResponseSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ ok: false, reason: 'invalid' }, { status: 422 });
  }

  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false }, { status: 503 });

  const submission = parsed.data;
  const { data: inserted, error } = await supabaseAdmin(config)
    .from('fair_submissions')
    .upsert(toFairSubmission(submission, consentVersion), {
      onConflict: 'submission_id',
      ignoreDuplicates: true,
    })
    .select('created_at')
    .maybeSingle<{ created_at: string }>();

  if (error) {
    console.error('[feria] no se guardó la respuesta en Supabase:', error.code);
    return Response.json({ ok: false }, { status: 503 });
  }
  if (!inserted) return Response.json({ ok: true });

  after(async () => {
    const sheets = await fairSheetsConfig();
    if (!sheets) return;

    try {
      await appendFairResponse(sheets, submission, inserted.created_at, consentVersion);
    } catch (error) {
      console.error(
        '[feria] no se copió la respuesta a Sheets',
        submission.submissionId,
        (error as Error).message,
      );
    }
  });

  return Response.json({ ok: true }, { status: 201 });
}
