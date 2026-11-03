import { after } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/inscripcion/estado/route';
import { emailConfig } from '@/lib/email/config';
import { sendRegistrationNotifications } from '@/lib/email/notifications';

vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/lib/email/config', () => ({ emailConfig: vi.fn() }));
vi.mock('@/lib/email/notifications', () => ({ sendRegistrationNotifications: vi.fn() }));

const config = {
  user: 'fitintegral3@gmail.com',
  appPassword: 'abcdefghijklmnop',
  fromName: 'Carrera',
};
const payload = (before: string, status: string) => ({
  type: 'UPDATE',
  table: 'registrations',
  old_record: { payment_status: before },
  record: {
    payment_status: status,
    email: 'ana@example.com',
    first_name: 'Ana',
    category: '5K',
    total: 108_000,
    referral_code: null,
  },
});
const request = (body: unknown, secret = 'test-secret') =>
  new Request('http://localhost/api/inscripcion/estado', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-webhook-secret': secret },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SUPABASE_WEBHOOK_SECRET', 'test-secret');
  vi.mocked(emailConfig).mockReturnValue(config);
  vi.mocked(sendRegistrationNotifications).mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe('notificacion de revision de pago', () => {
  it.each([
    ['aprobado', 'approved'],
    ['rechazado', 'rejected'],
  ] as const)('%s programa avisos a ambos destinatarios', async (status, kind) => {
    const response = await POST(request(payload('pendiente', status)));
    expect(response.status).toBe(200);
    expect(after).toHaveBeenCalledTimes(1);
    const callback = vi.mocked(after).mock.calls[0][0];
    if (typeof callback !== 'function') throw new Error('Se esperaba una tarea de envio');
    await callback();
    expect(sendRegistrationNotifications).toHaveBeenCalledWith(
      config,
      'ana@example.com',
      expect.objectContaining({ total: 108_000 }),
      kind,
    );
  });

  it('sin cambio de estado no programa nuevos avisos', async () => {
    await POST(request(payload('aprobado', 'aprobado')));
    expect(after).not.toHaveBeenCalled();
    expect(sendRegistrationNotifications).not.toHaveBeenCalled();
  });

  it('un aviso sin autenticar no dispara correos', async () => {
    expect((await POST(request(payload('pendiente', 'aprobado'), 'wrong'))).status).toBe(401);
    expect(after).not.toHaveBeenCalled();
  });
});
