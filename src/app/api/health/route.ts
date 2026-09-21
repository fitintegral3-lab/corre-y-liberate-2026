import { env } from '@/lib/env';
import { event } from '@/content';

/** Nunca se cachea: un chequeo de salud cacheado no chequea nada. */
export const dynamic = 'force-dynamic';

/**
 * Estado del despliegue.
 *
 * Le sirve a un monitor de uptime para saber si el sitio responde, y a quien
 * despliega para confirmar que entorno y que commit quedaron publicados sin
 * tener que abrir el panel del proveedor.
 */
export async function GET(): Promise<Response> {
  return Response.json(
    {
      status: 'ok',
      environment: env.NEXT_PUBLIC_APP_ENV,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      event: { name: event.name, edition: event.edition, date: event.date },
      checkedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
