import { JWT } from 'google-auth-library';

/**
 * Cuenta de servicio de Google del proyecto `corre-y-liberate`. La usan la
 * copia a la hoja de Drive y el bucket de comprobantes: un solo lugar lee y
 * valida las credenciales.
 *
 * La llave privada viene del JSON que da Google, con `\n` escritos; aca se
 * devuelven a saltos de linea reales, que es lo que espera la firma.
 */
export interface ServiceAccount {
  clientEmail: string;
  privateKey: string;
}

export function readServiceAccount(
  source: Record<string, string | undefined>,
): ServiceAccount | null {
  const clientEmail = source.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? '';
  const privateKey = (source.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n').trim();
  if (!clientEmail && !privateKey) return null;
  if (!/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(clientEmail)) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL debe ser el client_email de la cuenta de servicio (...iam.gserviceaccount.com)',
    );
  }
  if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY debe ser el private_key del JSON (empieza con -----BEGIN PRIVATE KEY-----)',
    );
  }
  return { clientEmail, privateKey };
}

/** Token de acceso para los permisos pedidos. La libreria oficial firma el JWT. */
export async function accessToken(account: ServiceAccount, scopes: string[]): Promise<string> {
  const client = new JWT({ email: account.clientEmail, key: account.privateKey, scopes });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Google no devolvio un token para la cuenta de servicio');
  return token;
}
