/**
 * Envio de correos desde el Gmail de la organizacion, con contrasena de
 * aplicacion. Opcional: sin estas variables no se envia ningun correo y la
 * inscripcion funciona igual.
 *
 * Gmail personal permite unos 500 correos al dia (support.google.com/mail/answer/22839),
 * de sobra para unas 400 inscripciones con tres correos como maximo cada una
 * repartidos en semanas.
 */
export interface EmailConfig {
  user: string;
  appPassword: string;
  fromName: string;
}

export function readEmailConfig(source: Record<string, string | undefined>): EmailConfig | null {
  const user = source.GMAIL_USER?.trim() ?? '';
  // Google muestra la contrasena de aplicacion en grupos de cuatro con espacios.
  const appPassword = (source.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, '');
  const fromName = source.EMAIL_FROM_NAME?.trim() || 'Corre y Libérate';

  if (!user && !appPassword) return null;
  if (!/^[^@\s]+@(gmail|googlemail)\.com$/.test(user)) {
    throw new Error(
      'GMAIL_USER debe ser la cuenta de Gmail que envia, por ejemplo fitintegral3@gmail.com',
    );
  }
  if (!/^[A-Za-z0-9]{16}$/.test(appPassword)) {
    throw new Error(
      'GMAIL_APP_PASSWORD debe ser la contrasena de aplicacion de 16 caracteres que da Google',
    );
  }
  return { user, appPassword, fromName };
}

/** Como `readEmailConfig` sobre el proceso, pero nunca lanza: registra y apaga el envio. */
export function emailConfig(): EmailConfig | null {
  try {
    return readEmailConfig({
      GMAIL_USER: process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    });
  } catch (error) {
    console.error(
      '[correo] configuracion invalida, no se envian correos:',
      (error as Error).message,
    );
    return null;
  }
}
