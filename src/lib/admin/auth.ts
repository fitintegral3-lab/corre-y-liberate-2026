/**
 * Acceso a la pagina de administracion de pagos.
 *
 * Dos barreras: la direccion (`/p/<ADMIN_SLUG>`, que no esta en el
 * repositorio) y usuario y contrasena por autenticacion basica. La direccion
 * sola no protege nada —un enlace se reenvia—, asi que la que cuenta es la
 * segunda; la primera evita que la pagina aparezca con solo probar rutas.
 *
 * Se verifica en `src/proxy.ts`, que pide las credenciales, y otra vez en la
 * pagina y en cada una de sus rutas: la guia de Next 16 dice que proxy es
 * para comprobaciones optimistas y no para autorizacion completa.
 */
export interface AdminConfig {
  slug: string;
  user: string;
  password: string;
}

export function readAdminConfig(source: Record<string, string | undefined>): AdminConfig | null {
  const slug = source.ADMIN_SLUG?.trim() ?? '';
  const user = source.ADMIN_USER?.trim() ?? '';
  const password = source.ADMIN_PASSWORD ?? '';
  if (!slug && !user && !password) return null;
  // Largos minimos para que ni la direccion ni la contrasena se adivinen probando.
  if (!/^[A-Za-z0-9_-]{16,}$/.test(slug)) return null;
  if (user.length < 3 || password.length < 16) return null;
  return { slug, user, password };
}

export function adminConfig(): AdminConfig | null {
  return readAdminConfig({
    ADMIN_SLUG: process.env.ADMIN_SLUG,
    ADMIN_USER: process.env.ADMIN_USER,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  });
}

/** Igualdad que tarda lo mismo coincida o no, para no filtrar por tiempo cuanto acerto. */
function sameText(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/** Si el encabezado `Authorization: Basic ...` trae el usuario y la contrasena correctos. */
export function isAuthorized(header: string | null, config: AdminConfig): boolean {
  if (!header?.startsWith('Basic ')) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return false;
  }
  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  // Las dos comparaciones corren siempre: cortar en la primera diria si el usuario era correcto.
  const userOk = sameText(user, config.user);
  const passwordOk = sameText(password, config.password);
  return userOk && passwordOk;
}

export const BASIC_CHALLENGE = 'Basic realm="Corre y Liberate - pagos", charset="UTF-8"';

/**
 * La verificacion que repite cada pagina y ruta de la administracion:
 * direccion secreta correcta y credenciales correctas.
 */
export function adminAllowed(slug: string, authorization: string | null): AdminConfig | null {
  const config = adminConfig();
  if (!config || slug !== config.slug || !isAuthorized(authorization, config)) return null;
  return config;
}
