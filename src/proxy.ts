import { NextResponse, type NextRequest } from 'next/server';

import { adminConfig, BASIC_CHALLENGE, isAuthorized } from '@/lib/admin/auth';

/**
 * Pide usuario y contrasena para la administracion de pagos. Sin
 * configuracion responde 404, igual que una ruta que no existe. La pagina y
 * sus rutas vuelven a verificar: ver `src/lib/admin/auth.ts`.
 */
export function proxy(request: NextRequest) {
  const config = adminConfig();
  if (!config) return new NextResponse(null, { status: 404 });

  // Solo la direccion secreta y lo que cuelga de ella (comprobantes, cambios
  // de estado). Cualquier otra ruta bajo /p/ es 404, sin pedir credenciales.
  const { pathname } = request.nextUrl;
  const base = `/p/${config.slug}`;
  if (pathname !== base && !pathname.startsWith(`${base}/`)) {
    return new NextResponse(null, { status: 404 });
  }

  if (!isAuthorized(request.headers.get('authorization'), config)) {
    return new NextResponse('Se necesita usuario y contraseña.', {
      status: 401,
      headers: { 'WWW-Authenticate': BASIC_CHALLENGE },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/p/:path*'],
};
