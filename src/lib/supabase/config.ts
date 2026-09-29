/**
 * Configuracion de Supabase leida del entorno.
 *
 * Es opcional: sin ella el formulario de inscripcion no aparece y el resto
 * del sitio funciona igual. La llave secreta salta las reglas de seguridad de
 * la base (RLS), asi que vive solo en el servidor y nunca lleva `NEXT_PUBLIC_`.
 */
export interface SupabaseConfig {
  url: string;
  secretKey: string;
}

export function readSupabaseConfig(
  source: Record<string, string | undefined>,
): SupabaseConfig | null {
  const url = source.SUPABASE_URL?.trim() ?? '';
  const secretKey = source.SUPABASE_SECRET_KEY?.trim() ?? '';

  if (!url && !secretKey) return null;
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)) {
    throw new Error('SUPABASE_URL debe ser https://<proyecto>.supabase.co');
  }
  if (!secretKey.startsWith('sb_secret_')) {
    throw new Error(
      'SUPABASE_SECRET_KEY debe empezar con sb_secret_ (Supabase > Settings > API Keys)',
    );
  }
  return { url, secretKey };
}

/** Como `readSupabaseConfig` sobre el proceso, pero nunca lanza: registra y apaga. */
export function supabaseConfig(): SupabaseConfig | null {
  try {
    return readSupabaseConfig({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    });
  } catch (error) {
    console.error(
      '[supabase] configuracion invalida, la inscripcion queda apagada:',
      (error as Error).message,
    );
    return null;
  }
}

export const RECEIPTS_BUCKET = 'comprobantes';
