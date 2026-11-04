import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sendShirtStockAlerts, shirtSoldOutEmail } from '@/lib/email/shirt-stock';
import { sendEmail } from '@/lib/email/send';
import { supabaseAdmin } from '@/lib/supabase/admin';

vi.mock('@/lib/email/send', () => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ supabaseAdmin: vi.fn() }));

const db = { url: 'https://test.supabase.co', secretKey: 'test-only' };
const mail = { user: 'sender@gmail.com', appPassword: 'test-only', fromName: 'Carrera' };
const alert = {
  id: 'alert-id',
  claim_token: 'lease-token',
  gender: 'femenino',
  shirt_size: 'Small (S)',
};
const rpc = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const from = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(supabaseAdmin).mockReturnValue({ rpc, from } as unknown as ReturnType<
    typeof supabaseAdmin
  >);
  rpc.mockResolvedValue({ data: [alert], error: null });
  from.mockReturnValue({ update });
  update.mockReturnValue({ eq });
  eq.mockReturnValueOnce({ eq }).mockResolvedValue({ error: null });
  vi.mocked(sendEmail).mockResolvedValue(undefined);
});
afterEach(() => vi.restoreAllMocks());

describe('avisos de agotamiento', () => {
  it('avisa a Integral Fit y confirma solo el aviso reclamado', async () => {
    await sendShirtStockAlerts(db, mail);
    expect(sendEmail).toHaveBeenCalledWith(
      mail,
      'fitintegral3@gmail.com',
      expect.objectContaining({
        subject: 'Camisetas agotadas: femenino · Small (S)',
      }),
    );
    expect(update).toHaveBeenCalledWith({ sent_at: expect.any(String), claimed_until: null });
    expect(eq).toHaveBeenCalledWith('id', alert.id);
    expect(eq).toHaveBeenCalledWith('claim_token', alert.claim_token);
  });

  it('sin avisos pendientes no envía correos', async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    await sendShirtStockAlerts(db, mail);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('un fallo SMTP conserva el aviso pendiente y permite señalar fallo al reintentar', async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error('SMTP unavailable'));
    await expect(sendShirtStockAlerts(db, mail)).rejects.toThrow('pendientes');
    expect(update).not.toHaveBeenCalled();
  });

  it('si falla la confirmación, no da el lote por enviado', async () => {
    eq.mockReset()
      .mockReturnValueOnce({ eq })
      .mockResolvedValue({ error: { message: 'database unavailable' } });
    await expect(sendShirtStockAlerts(db, mail)).rejects.toThrow('pendientes');
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('un fallo al reclamar no envía correos', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'database unavailable' } });
    await expect(sendShirtStockAlerts(db, mail)).rejects.toThrow('reclamar');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('escapa el HTML y describe género y talla', () => {
    const message = shirtSoldOutEmail('femenino', '<talla>');
    expect(message.html).toContain('&lt;talla&gt;');
    expect(message.html).not.toContain('<talla>');
    expect(message.text).toContain('pendientes y aprobadas');
  });
});
