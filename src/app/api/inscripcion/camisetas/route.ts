import { cedulaSchema } from '@/domain/registration/schema';
import { findShirtReservation, listShirtStock } from '@/lib/registration/shirt-inventory';
import { supabaseConfig } from '@/lib/supabase/config';

export async function GET(): Promise<Response> {
  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false }, { status: 503 });
  try {
    return Response.json(
      { ok: true, stock: await listShirtStock(config) },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    console.error('[stock]', (error as Error).message);
    return Response.json({ ok: false }, { status: 503 });
  }
}

/** Cédula en el cuerpo: no aparece en URLs, historial ni cachés compartidos. */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const cedula = cedulaSchema.safeParse(body?.cedula);
  if (!cedula.success) return Response.json({ ok: false }, { status: 422 });
  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false }, { status: 503 });
  try {
    return Response.json(
      { ok: true, reservation: await findShirtReservation(config, cedula.data) },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    console.error('[stock]', (error as Error).message);
    return Response.json({ ok: false }, { status: 503 });
  }
}
