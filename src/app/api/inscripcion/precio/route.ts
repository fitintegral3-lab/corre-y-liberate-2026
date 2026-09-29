import { quote } from '@/lib/registration/service';

/** Precio y QR para mostrar antes de pagar. El monto que vale lo recalcula el envio. */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const result = quote(params.get('distance'), params.get('code'));
  const headers = { 'Cache-Control': 'no-store' };
  if (!result.ok) return Response.json(result, { status: 422, headers });

  const { price } = result;
  return Response.json(
    {
      ok: true,
      phase: price.phase.name,
      basePrice: price.basePrice,
      code: price.code,
      discount: price.discount,
      total: price.total,
      qrImage: price.qr.image,
    },
    { headers },
  );
}
