# Inscripción propia

Reemplaza al formulario de cronometrajeinstantaneo.com con los mismos campos, en `/inscripcion`. Los
datos quedan en Supabase, los comprobantes en Google Cloud Storage y el pago es por QR de monto fijo, con
comprobante que revisa una persona.

## Cómo funciona

1. El corredor elige distancia, género y talla, llena sus datos y, si tiene, un código de descuento.
2. El servidor devuelve el valor y el QR que le toca (`/api/inscripcion/precio`). Con código es el QR «con
   descuento»; sin código, el normal.
3. Paga escaneando el QR (o descargándolo, si está en el celular) y sube el comprobante.
4. Al enviar, el servidor valida todo **antes** de subir el archivo, así no quedan comprobantes de
   formularios rechazados. Con todo en orden, el navegador achica la foto (2000 px, WebP al 82 %: una
   foto de 13,8 MB quedó en 122 KB en la prueba), la manda a `/api/inscripcion/comprobante`, que la sube
   al bucket privado de Google Cloud Storage, y el servidor guarda la inscripción (`/api/inscripcion`).
5. La inscripción queda con `payment_status = 'pendiente'` hasta que alguien revise el comprobante.

Lo que decide el servidor y no el navegador: el precio, la categoría (`5K ( FEMENINO )`, sale de distancia
y género), que la cédula no esté repetida en la edición y que el comprobante exista.

## Reglas de negocio

| Regla                                                                                                                                   | Dónde vive                                         |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Campos y validaciones (cédula sin puntos, celular colombiano de 10 dígitos, correo, fecha de nacimiento no futura, reglamento aceptado) | `src/domain/registration/schema.ts`                |
| Si declara una enfermedad, tiene que decir cuál                                                                                         | idem                                               |
| El contacto de emergencia no puede ser el mismo celular del corredor                                                                    | idem                                               |
| Una inscripción por cédula por edición                                                                                                  | restricción `unique (edition, cedula)` en la tabla |
| Precio = monto del QR de la preventa vigente                                                                                            | `src/domain/registration/pricing.ts`               |
| Código inexistente: se avisa, no se cobra el precio lleno en silencio                                                                   | idem                                               |
| Sin QR para la preventa vigente, no se cobra                                                                                            | idem                                               |

## Códigos y QR

`src/lib/registration/payment-config.ts` (solo servidor, ver «Seguridad»). Todos los códigos dan el mismo
descuento: el del QR «con descuento». El pago es por QR Bre-B: el corredor lo escanea desde la app de su
banco o billetera, o lo amplía en un modal para tomarle captura.

| Distancia | QR normal | QR con descuento |
| --------- | --------- | ---------------- |
| 3K        | $90.000   | $80.000          |
| 5K        | $120.000  | $108.000         |
| 7K        | $140.000  | $126.000         |
| 10K       | $160.000  | $144.000         |

Los montos salen de decodificar cada QR (campo 54 del formato EMVCo). **Solo hay QR para la preventa 2**
(hasta el 31 de octubre). Para la preventa 3 hay que agregar sus QR (normales en `public/qr/`, con descuento en
`src/lib/registration/qr-descuento/`) y registrarlos en ese archivo;
sin ellos el formulario muestra «Todavía no hay QR de pago para esta preventa» y no cobra. Una prueba
compara el monto del QR normal con el precio de `pricing.ts`.

Los QR se guardan como WebP sin pérdida en blanco y negro (~1,8 KB cada uno, contra ~37 KB del JPEG
original). Antes de reemplazar uno se decodifica y se compara con el original: tiene que dar exactamente
el mismo contenido.

## Seguridad

- **Los códigos no llegan al navegador.** Viven en `src/lib/registration/payment-config.ts`, que solo
  importa el servidor. Estuvieron en `src/content/` y el build los metía en el JavaScript público; para
  que no vuelva a pasar, `npm run check:bundle` (corre en CI después del build) falla si alguno aparece
  en `.next/static`.
- **Los QR con descuento no están en `public/`.** Next los publica con un hash del contenido en el nombre
  y el servidor solo entrega esa dirección a quien escribió un código válido.
- **Lo que no se puede evitar:** un código es un nombre (`VALECORRE`) y se puede adivinar probando en
  `/api/inscripcion/precio`, y quien recibe un QR con descuento puede reenviarlo. El control real es la
  revisión del pago (abajo).

## Puesta en marcha

1. **Base de datos.** Correr una vez `supabase/migrations/20260928000000_registrations.sql` en Supabase >
   SQL Editor. Crea la tabla `registrations` con RLS activado y sin políticas (la llave pública no puede
   leer ni escribir) y un bucket `comprobantes` en Supabase Storage que ya **no se usa**: los comprobantes van a Google Cloud
   Storage (ver abajo).
2. **Variables** (local en `.env.local`, en Vercel en Settings > Environment Variables):
   `SUPABASE_URL` y `SUPABASE_SECRET_KEY`. Ninguna lleva `NEXT_PUBLIC_`: el navegador no habla con Supabase. La secreta
   salta RLS y lee todas las inscripciones: solo servidor, nunca con `NEXT_PUBLIC_`.

Sin esas variables `/inscripcion` responde 404 y el resto del sitio funciona igual.

## Copia a Google Drive

Cada inscripción guardada se copia como una fila en una hoja de Google Sheets, **después** de responderle
al corredor (`after()` de Next): el corredor no espera a Google, y si Google falla la inscripción ya está
en Supabase, que es la fuente de verdad. El error queda en el log con el id de la inscripción.

- Los encabezados siguen la planilla de cronometraje, más código, precio, total y **enlace al comprobante**. Si
  la pestaña está vacía, se escriben solos la primera vez.
- Se escribe en modo `RAW`: nada de lo que escriba un corredor se interpreta como fórmula.
- Autenticación con una cuenta de servicio (librería oficial `google-auth-library`). La hoja tiene que
  estar compartida con el correo de esa cuenta como **Editor**.
- Variables: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
  `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` y `GOOGLE_SHEETS_TAB` (por defecto `Inscripciones`).
- **La hoja tiene datos de salud y cédulas**: compartirla solo con quien organiza.
- El estado del pago en la hoja es el del momento de inscribirse (`pendiente`); el que vale es el de
  Supabase.

## Comprobantes en Google Cloud Storage

- Bucket `corre-y-liberate-comprobantes` del proyecto `corre-y-liberate`, en `us-central1` (dentro de la
  capa gratuita de 5 GB), con **prevención de acceso público** y control uniforme.
- La cuenta de servicio de la hoja tiene ahí solo **Creador** y **Visualizador de objetos**: sube y revisa
  que el archivo exista, pero no puede borrar ni reemplazar un comprobante.
- El enlace de la hoja (`https://storage.cloud.google.com/...`) pide iniciar sesión con Google y muestra la
  foto solo a cuentas con permiso de lectura en el bucket. Hoy: las dueñas del proyecto (Integral Fit). Para
  dar acceso a otra persona: bucket > Permisos > Otorgar acceso > su correo con el rol **Visualizador de
  objetos de Storage**.
- El archivo pasa por una función de Vercel, que acepta hasta 4,5 MB: por eso la foto se comprime en el
  navegador y el servidor rechaza lo que pase de 4 MB (un PDF grande).
- Variable: `GCS_RECEIPTS_BUCKET`, más las `GOOGLE_SERVICE_ACCOUNT_*` de la hoja.
- **La cuenta de facturación de Google Cloud es de prueba y termina el 29 de diciembre de 2026.** Al terminar,
  Google detiene los recursos (el bucket incluido) salvo que se pase a una cuenta pagada. Antes de esa fecha
  hay que actualizarla o descargar los comprobantes.

## Correos al corredor

Tres correos, enviados desde el Gmail de la organización (`GMAIL_USER`) con una contraseña de aplicación
(`GMAIL_APP_PASSWORD`). Gmail personal permite unos 500 por día.

| Cuándo                                  | Correo                                                                              | Cómo se dispara                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Al inscribirse                          | «Recibimos tu inscripción»: carrera, valor, código, y que se está revisando el pago | `/api/inscripcion`, después de responder (`after()`) |
| Al pasar `payment_status` a `aprobado`  | «¡Tu inscripción está confirmada!»                                                  | Webhook de Supabase → `/api/inscripcion/estado`      |
| Al pasar `payment_status` a `rechazado` | «No pudimos validar tu pago», con el WhatsApp                                       | Igual                                                |

- Si Gmail falla, la inscripción ya está guardada: el error queda en el log con el id.
- El correo de aprobado o rechazado sale **solo si el estado cambió**: editar el dorsal de una fila ya
  aprobada no le vuelve a escribir al corredor.
- Todo lo que escribió el corredor se escapa antes de entrar al HTML del correo.

### Webhook de Supabase (una vez, en el panel)

Database → Webhooks → Create a new hook:

- Tabla `registrations`, evento **Update**, tipo **HTTP Request**, método **POST**.
- URL: `https://<dominio del sitio>/api/inscripcion/estado` (en DEV, la URL de la preview de Vercel).
- Encabezado HTTP `x-webhook-secret` con el mismo valor de `SUPABASE_WEBHOOK_SECRET`. Sin ese secreto la
  ruta responde 401 y no envía nada.

Supabase no puede llamar a `localhost`: el correo de aprobado/rechazado se prueba con el sitio publicado.

## Revisar pagos

En la página de administración, `/p/<ADMIN_SLUG>`:

- La dirección no está en el repositorio y además el navegador pide **usuario y contraseña**
  (`ADMIN_USER`, `ADMIN_PASSWORD`). Cualquier otra dirección bajo `/p/` responde 404. Se verifica en
  `src/proxy.ts` y otra vez en la página y en cada ruta, como pide la guía de Next 16.
- Muestra las inscripciones filtradas por estado (pendiente por defecto), con **la foto del comprobante**
  (la sirve el servidor desde el bucket, sin iniciar sesión en Google) y el valor que tenía que pagar.
- **Aprobar / Rechazar / Devolver a pendiente**: cambia `payment_status` en Supabase —su webhook le escribe
  al corredor— y la columna «Estado pago» de la hoja, buscando la fila por el ID. Si la fila no está en la
  hoja (inscripción anterior a la copia a Drive) se avisa y no se inventa.
- **Comparar el monto del comprobante con el valor a pagar**: una inscripción sin código tiene que haber
  pagado el precio lleno, aunque alguien le haya pasado el QR con descuento.

También se puede cambiar el estado desde Supabase > Table Editor > `registrations`; el correo sale igual,
pero la hoja **no** se actualiza por ese camino.

Para generar la dirección y la contraseña (las imprime solo en tu terminal):

```bash
slug=$(openssl rand -hex 12) && pass=$(openssl rand -base64 30 | tr -dc 'A-Za-z0-9' | cut -c1-28) && echo "ADMIN_SLUG=$slug" && echo "ADMIN_PASSWORD=$pass"
```

## Pendiente

- Tallas infantiles para el 3K, si la organización las va a tener.
