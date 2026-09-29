import { describe, expect, it } from 'vitest';

import { isAuthorized, readAdminConfig } from '@/lib/admin/auth';

const config = {
  slug: 'k8x2m9q4w7e5r1t3',
  user: 'integralfit',
  password: 'una-contrasena-muy-larga-123',
};
const basic = (user: string, password: string) => `Basic ${btoa(`${user}:${password}`)}`;

describe('isAuthorized', () => {
  it('acepta el usuario y la contrasena correctos', () => {
    expect(isAuthorized(basic('integralfit', 'una-contrasena-muy-larga-123'), config)).toBe(true);
  });

  it('rechaza una contrasena incorrecta aunque el usuario sea el correcto', () => {
    expect(isAuthorized(basic('integralfit', 'otra-cosa'), config)).toBe(false);
  });

  it('rechaza un usuario incorrecto aunque la contrasena sea la correcta', () => {
    expect(isAuthorized(basic('otro', 'una-contrasena-muy-larga-123'), config)).toBe(false);
  });

  it('rechaza una contrasena que solo empieza igual', () => {
    expect(isAuthorized(basic('integralfit', 'una-contrasena-muy-larga-1234'), config)).toBe(false);
  });

  it('rechaza encabezados vacios o mal formados', () => {
    expect(isAuthorized(null, config)).toBe(false);
    expect(isAuthorized('Bearer abc', config)).toBe(false);
    expect(isAuthorized('Basic %%%', config)).toBe(false);
    expect(isAuthorized(`Basic ${btoa('sin-dos-puntos')}`, config)).toBe(false);
  });
});

describe('readAdminConfig', () => {
  it('sin variables la administracion no existe', () => {
    expect(readAdminConfig({})).toBeNull();
  });

  it('no acepta una direccion o una contrasena cortas', () => {
    expect(
      readAdminConfig({
        ADMIN_SLUG: 'corta',
        ADMIN_USER: 'integralfit',
        ADMIN_PASSWORD: config.password,
      }),
    ).toBeNull();
    expect(
      readAdminConfig({
        ADMIN_SLUG: config.slug,
        ADMIN_USER: 'integralfit',
        ADMIN_PASSWORD: 'corta',
      }),
    ).toBeNull();
  });

  it('con todo en regla devuelve la configuracion', () => {
    expect(
      readAdminConfig({
        ADMIN_SLUG: config.slug,
        ADMIN_USER: 'integralfit',
        ADMIN_PASSWORD: config.password,
      }),
    ).toEqual(config);
  });
});
