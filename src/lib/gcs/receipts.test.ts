import { describe, expect, it } from 'vitest';

import { readReceiptsConfig, receiptObjectName, receiptUrl } from '@/lib/gcs/receipts';

const account = {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'inscripciones@corre-y-liberate.iam.gserviceaccount.com',
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n',
};

describe('receiptObjectName', () => {
  it('genera un nombre propio en pendientes/ con la extension del tipo', () => {
    expect(receiptObjectName('image/webp')).toMatch(/^pendientes\/[0-9a-f-]{36}\.webp$/);
    expect(receiptObjectName('application/pdf')).toMatch(/\.pdf$/);
  });

  it('rechaza un tipo que no es imagen ni PDF', () => {
    expect(receiptObjectName('text/html')).toBeNull();
  });
});

describe('receiptUrl', () => {
  it('apunta a la descarga autenticada de Cloud Storage', () => {
    expect(receiptUrl('corre-y-liberate-comprobantes', 'pendientes/abc.webp')).toBe(
      'https://storage.cloud.google.com/corre-y-liberate-comprobantes/pendientes/abc.webp',
    );
  });
});

describe('readReceiptsConfig', () => {
  it('sin bucket el comprobante no tiene donde guardarse', () => {
    expect(readReceiptsConfig(account)).toBeNull();
  });

  it('reusa la cuenta de servicio de la hoja', () => {
    expect(
      readReceiptsConfig({ ...account, GCS_RECEIPTS_BUCKET: 'corre-y-liberate-comprobantes' }),
    ).toMatchObject({
      bucket: 'corre-y-liberate-comprobantes',
      account: { clientEmail: account.GOOGLE_SERVICE_ACCOUNT_EMAIL },
    });
  });

  it('pide la cuenta de servicio si hay bucket', () => {
    expect(() =>
      readReceiptsConfig({ GCS_RECEIPTS_BUCKET: 'corre-y-liberate-comprobantes' }),
    ).toThrow(/GOOGLE_SERVICE_ACCOUNT/);
  });
});
