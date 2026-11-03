import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendRegistrationNotifications } from '@/lib/email/notifications';
import { sendEmail } from '@/lib/email/send';
import { organizationPaymentEmail } from '@/lib/email/templates';

vi.mock('@/lib/email/send', () => ({ sendEmail: vi.fn() }));

const config = { user: 'sender@gmail.com', appPassword: 'abcdefghijklmnop', fromName: 'Carrera' };
const data = { firstName: 'Ana', category: '5K', total: 108_000, referralCode: 'VALECORRE' };

beforeEach(() => {
  vi.mocked(sendEmail).mockReset().mockResolvedValue(undefined);
});

describe('avisos al participante y a la organizacion', () => {
  it.each([
    ['received', 'Recibimos tu inscripción', 'Nueva inscripción por revisar'],
    ['approved', '¡Tu inscripción está confirmada!', 'Pago aprobado'],
    ['rejected', 'No pudimos validar tu pago', 'Pago rechazado'],
  ] as const)(
    '%s envia dos mensajes separados a los destinatarios correctos',
    async (kind, participantSubject, organizationSubject) => {
      await sendRegistrationNotifications(config, 'ana@example.com', data, kind);

      expect(sendEmail).toHaveBeenCalledTimes(2);
      const [participant, organization] = vi.mocked(sendEmail).mock.calls;
      expect(participant[1]).toBe('ana@example.com');
      expect(participant[2].subject).toContain(participantSubject);
      expect(organization[1]).toBe('fitintegral3@gmail.com');
      expect(organization[2].subject).toContain(organizationSubject);
      expect(organization[2].text).toContain('Correo del participante: ana@example.com');
      expect(organization[2].text).toContain('Carrera: 5K');
      expect(organization[2].text).toContain('$108.000 (con el código VALECORRE)');
    },
  );

  it('un rechazo al participante no bloquea el aviso interno', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      vi.mocked(sendEmail).mockRejectedValueOnce(new Error('mailbox unavailable'));
      await expect(
        sendRegistrationNotifications(config, 'ana@example.com', data),
      ).resolves.toBeUndefined();
      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(vi.mocked(sendEmail).mock.calls[1][1]).toBe('fitintegral3@gmail.com');
      expect(log).toHaveBeenCalledWith(
        '[correo] no se envio el aviso',
        'received',
        'participante',
        'mailbox unavailable',
      );
    } finally {
      log.mockRestore();
    }
  });

  it('un fallo del aviso interno no bloquea la confirmacion al participante', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      vi.mocked(sendEmail)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('SMTP unavailable'));
      await expect(
        sendRegistrationNotifications(config, 'ana@example.com', data, 'approved'),
      ).resolves.toBeUndefined();
      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(log).toHaveBeenCalledWith(
        '[correo] no se envio el aviso',
        'approved',
        'organizacion',
        'SMTP unavailable',
      );
    } finally {
      log.mockRestore();
    }
  });

  it('un comprobante recibido no se presenta como un pago confirmado', () => {
    const email = organizationPaymentEmail('received', { ...data, email: 'ana@example.com' });
    expect(email.text).toContain('pendiente de revisión');
    expect(email.subject).not.toContain('Pago aprobado');
  });

  it('escapa el nombre y el correo del participante en el aviso interno', () => {
    const email = organizationPaymentEmail('received', {
      ...data,
      firstName: '<img src=x>',
      email: '<test@example.com>',
    });
    expect(email.html).not.toContain('<img src=x>');
    expect(email.html).toContain('&lt;img src=x&gt;');
    expect(email.html).toContain('&lt;test@example.com&gt;');
  });
});
