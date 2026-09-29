import { describe, expect, it } from 'vitest';

import { readEmailConfig } from '@/lib/email/config';
import { secretMatches, statusEmailFor } from '@/lib/email/status-change';
import {
  paymentApprovedEmail,
  paymentRejectedEmail,
  registrationReceivedEmail,
} from '@/lib/email/templates';

const data = {
  firstName: 'Ana',
  category: '5K ( FEMENINO )',
  total: 108_000,
  referralCode: 'VALECORRE',
};

describe('plantillas', () => {
  it('la de recibida dice carrera, valor con codigo y que se esta revisando', () => {
    const email = registrationReceivedEmail(data);
    expect(email.subject).toMatch(/^Recibimos tu inscripción/);
    expect(email.text).toContain('Carrera: 5K ( FEMENINO )');
    expect(email.text).toContain('$108.000 (con el código VALECORRE)');
    expect(email.text).toContain('Estamos revisando tu comprobante');
  });

  it('la de aprobada confirma el cupo', () => {
    expect(paymentApprovedEmail(data).text).toContain(
      'Tu pago fue aprobado y tu cupo en 5K ( FEMENINO ) quedó asegurado',
    );
  });

  it('la de rechazada pide escribir por WhatsApp', () => {
    expect(paymentRejectedEmail(data).text).toMatch(/no pudimos validar el pago de \$108\.000/);
    expect(paymentRejectedEmail(data).text).toContain('wa.me');
  });

  it('no deja pasar HTML escrito por el corredor', () => {
    const html = registrationReceivedEmail({
      ...data,
      firstName: '<img src=x onerror=alert(1)>',
    }).html;
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('sin codigo no menciona codigo', () => {
    expect(registrationReceivedEmail({ ...data, referralCode: null }).text).not.toContain('código');
  });
});

const row = (status: string) => ({
  payment_status: status,
  email: 'ana@example.com',
  first_name: 'Ana',
  category: '5K ( FEMENINO )',
  total: 108_000,
  referral_code: null,
});
const update = (before: string, after: string) => ({
  type: 'UPDATE',
  table: 'registrations',
  record: row(after),
  old_record: row(before),
});

describe('statusEmailFor', () => {
  it('pendiente -> aprobado manda el correo de aprobado', () => {
    expect(statusEmailFor(update('pendiente', 'aprobado'))).toMatchObject({
      kind: 'approved',
      to: 'ana@example.com',
    });
  });

  it('pendiente -> rechazado manda el de rechazado', () => {
    expect(statusEmailFor(update('pendiente', 'rechazado'))?.kind).toBe('rejected');
  });

  it('editar otra columna de una fila aprobada no reenvia el correo', () => {
    expect(statusEmailFor(update('aprobado', 'aprobado'))).toBeNull();
  });

  it('volver a pendiente no manda nada', () => {
    expect(statusEmailFor(update('aprobado', 'pendiente'))).toBeNull();
  });

  it('ignora inserciones y otras tablas', () => {
    expect(statusEmailFor({ ...update('pendiente', 'aprobado'), type: 'INSERT' })).toBeNull();
    expect(statusEmailFor({ ...update('pendiente', 'aprobado'), table: 'otra' })).toBeNull();
    expect(statusEmailFor(null)).toBeNull();
  });
});

describe('secretMatches', () => {
  it('solo acepta el secreto exacto', () => {
    expect(secretMatches('abc123', 'abc123')).toBe(true);
    expect(secretMatches('abc124', 'abc123')).toBe(false);
    expect(secretMatches(null, 'abc123')).toBe(false);
  });

  it('sin secreto configurado no acepta nada', () => {
    expect(secretMatches('', '')).toBe(false);
  });
});

describe('readEmailConfig', () => {
  it('sin variables no se envian correos', () => {
    expect(readEmailConfig({})).toBeNull();
  });

  it('acepta la contrasena de aplicacion con los espacios que muestra Google', () => {
    expect(
      readEmailConfig({
        GMAIL_USER: 'fitintegral3@gmail.com',
        GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop',
      }),
    ).toMatchObject({ appPassword: 'abcdefghijklmnop', fromName: 'Corre y Libérate' });
  });

  it('rechaza una cuenta que no es de Gmail', () => {
    expect(() =>
      readEmailConfig({ GMAIL_USER: 'yo@empresa.com', GMAIL_APP_PASSWORD: 'abcdefghijklmnop' }),
    ).toThrow(/GMAIL_USER/);
  });
});
