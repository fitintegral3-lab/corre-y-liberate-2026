import {
  MAX_RECEIPT_BYTES,
  RECEIPT_TYPES,
  receiptObjectName,
  receiptsConfig,
  uploadReceipt,
} from '@/lib/gcs/receipts';

/**
 * Sube el comprobante al bucket privado de Cloud Storage y devuelve su ruta.
 * Recibe `multipart/form-data` con el campo `file`. El nombre lo decide el
 * servidor; el tipo y el tamano se vuelven a revisar aca aunque el navegador
 * ya los haya filtrado.
 */
export async function POST(request: Request): Promise<Response> {
  const config = receiptsConfig();
  if (!config) return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > MAX_RECEIPT_BYTES ||
    !(file.type in RECEIPT_TYPES)
  ) {
    return Response.json({ ok: false, reason: 'receipt-invalid' }, { status: 422 });
  }

  const objectName = receiptObjectName(file.type);
  if (!objectName) return Response.json({ ok: false, reason: 'receipt-invalid' }, { status: 422 });

  try {
    await uploadReceipt(config, objectName, await file.arrayBuffer(), file.type);
  } catch (error) {
    console.error('[comprobantes] no se pudo subir:', (error as Error).message);
    return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });
  }
  return Response.json({ ok: true, path: objectName });
}
