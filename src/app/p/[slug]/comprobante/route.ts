import { adminAllowed } from '@/lib/admin/auth';
import { downloadReceipt, receiptsConfig } from '@/lib/gcs/receipts';

interface Context {
  params: Promise<{ slug: string }>;
}

/** Sirve un comprobante del bucket privado a la administracion: `?path=pendientes/<uuid>.webp`. */
export async function GET(request: Request, { params }: Context): Promise<Response> {
  const { slug } = await params;
  if (!adminAllowed(slug, request.headers.get('authorization')))
    return new Response(null, { status: 404 });

  const path = new URL(request.url).searchParams.get('path') ?? '';
  // Solo nombres que genera el servidor: nada de subir de carpeta ni otros buckets.
  if (!/^pendientes\/[0-9a-f-]{36}\.(webp|jpg|png|pdf)$/.test(path))
    return new Response(null, { status: 400 });

  const config = receiptsConfig();
  if (!config) return new Response(null, { status: 503 });
  const file = await downloadReceipt(config, path).catch(() => null);
  if (!file) return new Response(null, { status: 404 });

  return new Response(file.body, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
