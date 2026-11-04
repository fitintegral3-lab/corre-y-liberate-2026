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

La organización también recibe un aviso separado en **fitintegral3@gmail.com**
al recibir una inscripción con comprobante y cuando el pago pasa a aprobado o
rechazado. El aviso incluye nombre, correo, carrera, valor y código de descuento.
Un comprobante recibido se anuncia como **pendiente de revisión**, no como pago
confirmado. Ambos destinatarios se procesan de forma independiente: un error del
buzón del participante no impide el aviso interno, ni viceversa. Un fallo de
envío queda registrado en los logs; no se reenvía automáticamente.

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

## Inventario de camisetas

La migración `supabase/migrations/20261104000000_shirt_inventory.sql` usa los saldos
finales de la columna **verde** confirmados el 3 de noviembre de 2026. Reemplazan
las cantidades de la primera imagen:

| Talla | Mujer | Hombre | Reservas externas mujer | Reservas externas hombre |
| ----- | ----: | -----: | ----------------------: | -----------------------: |
| XS    |     1 |      0 |                       2 |                        0 |
| S     |    18 |      0 |                       3 |                        0 |
| M     |    56 |     15 |                       7 |                        0 |
| L     |    18 |     26 |                       1 |                        2 |
| XL    |     7 |      9 |                       1 |                        2 |
| XXL   |     0 |      2 |                       0 |                        2 |
| Total |   100 |     52 |                      14 |                        6 |

Los valores verdes **ya son saldos**, no stock original: no se les vuelve a restar
el histórico ni las veinte reservas externas. La migración captura las
inscripciones pendientes y aprobadas actuales bajo bloqueo de escrituras y fija
`total = initial_available + reserved`. Así `total - reserved` coincide exactamente
con cada celda verde al activar, independientemente del número de registros
anteriores. `initial_available` conserva la referencia de esa inicialización.
Las nuevas inscripciones normales sí descuentan; las rechazadas y las
inscripciones «Sin camiseta» no consumen existencias.

Aplicar la migración **antes de desplegar este código**, en la base del entorno
correspondiente. Bloquea escrituras mientras calcula las reservas históricas y
activa el trigger. Los registros existentes se conservan sin cambios.
Las tablas tienen RLS sin políticas; únicamente el servidor accede a ellas.

- El formulario consulta `/api/inscripcion/camisetas` al abrirse, cada 30 segundos
  y al recuperar el foco. Deshabilita las tallas agotadas del género elegido y
  muestra el QR solo después de elegir una talla disponible o su reserva externa.
- La consulta y la validación previa no reservan camisetas. El trigger reserva
  junto con la inscripción y evita sobreventa incluso si llegan dos solicitudes
  al mismo tiempo. Un pago aprobado mantiene su reserva; un rechazo la libera.
  Reactivar un rechazo exige existencias otra vez. Cambiar talla/género o borrar
  una inscripción también actualiza el inventario en la misma transacción.
- La administración `/p/<ADMIN_SLUG>` muestra base contable, inscripciones del
  stock, disponibles y reservas externas, indicando cuántas ya tienen cédula.
  Para corregir o reponer stock después de activar, editar **solo `total`** en
  Supabase > Table Editor > `shirt_inventory`; no modificar `reserved` a mano.
  `total` es la base contable más reposiciones, no el saldo disponible ni el
  total físico de la hoja. `initial_available` no se modifica al reponer.
- Al pasar de disponible a agotada se encola un correo a
  **fitintegral3@gmail.com**, con género y talla. También se encolan tallas que ya
  estaban agotadas por registros anteriores al activar el inventario. Una talla
  con cero unidades y sin reservas desde el inicio se muestra agotada sin aviso.
- La cola se procesa después de inscribirse, en el webhook de estados y al abrir
  la administración. Si Gmail falla, el aviso sigue pendiente y puede reintentarse
  una vez vencida su concesión de cinco minutos. Dos procesos no reclaman el mismo
  aviso simultáneamente. Una reposición cancela avisos pendientes; si vuelve a
  agotarse, se crea un aviso nuevo.

Después de aplicar la migración y desplegar, abrir la administración para procesar
los avisos iniciales. También se puede llamar **POST `/api/inventario/avisos`** con
el encabezado `x-webhook-secret: <SUPABASE_WEBHOOK_SECRET>`; está pensado para un
programador externo si se requieren reintentos periódicos sin visitas al sitio.
Responde 401 sin autorización y 503 si falla el procesamiento o falta configuración.
No hay un programador periódico instalado por este cambio.

El envío usa confirmación SMTP y luego marca la fila como enviada. Si el proceso
se interrumpe entre ambos pasos, un reintento puede duplicar ese aviso; SMTP no
permite garantizar entrega exactamente una vez.

Verificación: `npm run test:inventory` crea un Postgres 16 temporal en Docker y
prueba la migración sobre registros anteriores, reservas concurrentes, estados,
reposiciones, reservas externas por cédula y reclamación de avisos. No usa
`.env.local` ni datos de Supabase.

### Las veinte reservas externas

La organización confirmó que estas personas deben poder inscribirse **sin
descontar otra vez el saldo verde**. La migración crea veinte filas en
`shirt_reservations` con el género y la talla de la tabla anterior, inicialmente
sin cédula. **Falta la lista de cédulas para asignarlas.** Antes de que estas
personas se inscriban, llenar `cedula` en su fila correspondiente en Supabase >
Table Editor > `shirt_reservations`. Usar cédulas normalizadas, sin puntos,
espacios ni guiones. No asignar reservas a personas ya inscritas: la base rechaza
esa operación para evitar modificar retrospectivamente el saldo.

El corredor ingresa primero su cédula. El formulario la consulta por POST (no
queda en la URL), reconoce su género/talla y habilita esa camiseta incluso si
está agotada para el público. La API vuelve a consultar la reserva y **el trigger
decide la excepción por cédula, edición, género y talla**: el cliente no envía ni
elige el ID de reserva. Elegir una talla o género distinto requiere existencias
públicas. Una reserva externa rechazada, eliminada o reactivada mantiene su
camiseta fuera del saldo público; no genera unidades adicionales disponibles.
Una persona tiene una sola reserva por edición y no puede inscribirse dos veces.
Las reservas vinculadas a una inscripción no se pueden reasignar o eliminar.

Si no se ha cargado su cédula, la persona se trata como inscripción normal y
consumirá stock. Cargar todas las cédulas antes de comunicarles que se inscriban.
Las reservas solo afectan la camiseta: el pago y la revisión del comprobante
siguen el proceso habitual.
