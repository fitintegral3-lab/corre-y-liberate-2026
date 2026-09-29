import { randomUUID } from 'node:crypto';

import { accessToken, readServiceAccount, type ServiceAccount } from '@/lib/google/service-account';

/**
 * Comprobantes de pago en Google Cloud Storage.
 *
 * El bucket es privado (prevencion de acceso publico activada). La cuenta de
 * servicio tiene solo "Creador" y "Visualizador de objetos": sube y comprueba,
 * pero no puede borrar ni reemplazar un comprobante ya subido. Quien organiza
 * abre cada foto desde el enlace de la hoja con su cuenta de Google; ese
 * enlace no sirve para nadie sin permiso en el bucket.
 */
export interface ReceiptsConfig {
  bucket: string;
  account: ServiceAccount;
}

const SCOPE = 'https://www.googleapis.com/auth/devstorage.read_write';

export const RECEIPT_TYPES = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
} as const;

/**
 * El archivo pasa por una funcion de Vercel, cuyo cuerpo tiene un tope de
 * 4,5 MB. El navegador comprime las fotos antes (quedan en unos 300 KB), asi
 * que esto solo frena un PDF grande o una foto que no se pudo comprimir.
 */
export const MAX_RECEIPT_BYTES = 4 * 1024 * 1024;

export function readReceiptsConfig(
  source: Record<string, string | undefined>,
): ReceiptsConfig | null {
  const bucket = source.GCS_RECEIPTS_BUCKET?.trim() ?? '';
  const account = readServiceAccount(source);
  if (!bucket) return null;
  if (!/^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/.test(bucket)) {
    throw new Error(
      'GCS_RECEIPTS_BUCKET debe ser el nombre del bucket, por ejemplo corre-y-liberate-comprobantes',
    );
  }
  if (!account) {
    throw new Error(
      'Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY para el bucket',
    );
  }
  return { bucket, account };
}

/** Como `readReceiptsConfig` sobre el proceso, pero nunca lanza: registra y apaga. */
export function receiptsConfig(): ReceiptsConfig | null {
  try {
    return readReceiptsConfig({
      GCS_RECEIPTS_BUCKET: process.env.GCS_RECEIPTS_BUCKET,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    });
  } catch (error) {
    console.error(
      '[comprobantes] configuracion invalida, la inscripcion queda apagada:',
      (error as Error).message,
    );
    return null;
  }
}

/** Nombre del archivo en el bucket. Lo elige el servidor, nunca el navegador. */
export function receiptObjectName(contentType: string): string | null {
  const extension = RECEIPT_TYPES[contentType as keyof typeof RECEIPT_TYPES];
  return extension ? `pendientes/${randomUUID()}.${extension}` : null;
}

/**
 * Enlace para abrir el comprobante en el navegador. Es la descarga autenticada
 * de Cloud Storage: pide iniciar sesion con Google y muestra el archivo solo a
 * cuentas con permiso de lectura en el bucket.
 */
export function receiptUrl(bucket: string, objectName: string): string {
  return `https://storage.cloud.google.com/${bucket}/${objectName.split('/').map(encodeURIComponent).join('/')}`;
}

const API = 'https://storage.googleapis.com';

export async function uploadReceipt(
  config: ReceiptsConfig,
  objectName: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<void> {
  const token = await accessToken(config.account, [SCOPE]);
  const url = `${API}/upload/storage/v1/b/${encodeURIComponent(config.bucket)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType },
    body,
  });
  if (!response.ok) {
    throw new Error(
      `Cloud Storage respondio ${response.status} al subir ${objectName}: ${await response.text()}`,
    );
  }
}

export async function receiptExists(config: ReceiptsConfig, objectName: string): Promise<boolean> {
  const token = await accessToken(config.account, [SCOPE]);
  const url = `${API}/storage/v1/b/${encodeURIComponent(config.bucket)}/o/${encodeURIComponent(objectName)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) return false;
  if (!response.ok)
    throw new Error(`Cloud Storage respondio ${response.status} al buscar ${objectName}`);
  return true;
}
