import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { SupabaseConfig } from '@/lib/supabase/config';

/**
 * Cliente con la llave secreta. Salta RLS: solo se importa desde rutas del
 * servidor (`src/app/api/...`), nunca desde un componente de cliente.
 */
export function supabaseAdmin(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
