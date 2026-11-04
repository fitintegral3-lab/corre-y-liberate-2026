import { sendEmail } from '@/lib/email/send';
import {
  organizationPaymentEmail,
  paymentApprovedEmail,
  paymentRejectedEmail,
  registrationReceivedEmail,
} from '@/lib/email/templates';

import type { EmailConfig } from '@/lib/email/config';
import type { OrganizationNotice, RegistrationEmailData } from '@/lib/email/templates';

/** Destinatario de los avisos internos confirmado por la organización. */
export const ORGANIZATION_EMAIL = 'fitintegral3@gmail.com';

/** Un rechazo del buzón del participante no debe impedir el aviso interno. */
export async function sendRegistrationNotifications(
  config: EmailConfig,
  to: string,
  data: RegistrationEmailData,
  kind: OrganizationNotice = 'received',
): Promise<void> {
  const participantMessage =
    kind === 'received'
      ? registrationReceivedEmail(data)
      : kind === 'approved'
        ? paymentApprovedEmail(data)
        : paymentRejectedEmail(data);
  const deliveries = [
    { recipient: 'participante', to, message: participantMessage },
    {
      recipient: 'organizacion',
      to: ORGANIZATION_EMAIL,
      message: organizationPaymentEmail(kind, { ...data, email: to }),
    },
  ];
  const results = await Promise.allSettled(
    deliveries.map((delivery) => sendEmail(config, delivery.to, delivery.message)),
  );
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        '[correo] no se envio el aviso',
        kind,
        deliveries[index].recipient,
        result.reason instanceof Error ? result.reason.message : String(result.reason),
      );
    }
  });
}
