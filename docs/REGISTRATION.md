# Inscripción propia

Reemplaza al formulario de cronometrajeinstantaneo.com con los mismos campos, en `/inscripcion`. Los
datos quedan en Supabase y el pago es por QR de monto fijo, con comprobante que revisa una persona.

## Cómo funciona

1. El corredor elige distancia, género y talla, llena sus datos y, si tiene, un código de descuento.
2. El servidor devuelve el valor y el QR que le toca (`/api/inscripcion/precio`). Con código es el QR «con
   descuento»; sin código, el normal.
3. Paga escaneando el QR (o descargándolo, si está en el celular) y sube el comprobante.
4. Al enviar, el servidor valida todo **antes** de subir el archivo, así no quedan comprobantes de
   formularios rechazados. Con todo en orden firma una URL de subida (`/api/inscripcion/comprobante`), el
   navegador sube el comprobante directo a Supabase Storage y el servidor guarda la inscripción
   (`/api/inscripcion`).
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

`src/content/registration-payment.ts`. Todos los códigos dan el mismo descuento: el del QR «con descuento».

| Distancia | QR normal | QR con descuento |
| --------- | --------- | ---------------- |
| 3K        | $90.000   | $80.000          |
| 5K        | $120.000  | $108.000         |
| 7K        | $140.000  | $126.000         |
| 10K       | $160.000  | $144.000         |

Los montos salen de decodificar cada QR (campo 54 del formato EMVCo). **Solo hay QR para la preventa 2**
(hasta el 31 de octubre). Para la preventa 3 hay que agregar sus QR en `public/qr/` y en ese archivo;
sin ellos el formulario muestra «Todavía no hay QR de pago para esta preventa» y no cobra. Una prueba
compara el monto del QR normal con el precio de `pricing.ts`.

## Puesta en marcha

1. **Base de datos.** Correr una vez `supabase/migrations/20260928000000_registrations.sql` en Supabase >
   SQL Editor. Crea la tabla `registrations` con RLS activado y sin políticas (la llave pública no puede
   leer ni escribir) y el bucket privado `comprobantes` (5 MB, JPG/PNG/WEBP/PDF).
2. **Variables** (local en `.env.local`, en Vercel en Settings > Environment Variables):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`. La secreta
   salta RLS y lee todas las inscripciones: solo servidor, nunca con `NEXT_PUBLIC_`.

Sin esas variables `/inscripcion` responde 404 y el resto del sitio funciona igual.

## Revisar pagos

Hoy desde Supabase > Table Editor > `registrations`: filtrar `payment_status = pendiente`, abrir el
comprobante en Storage > `comprobantes` con la ruta de `receipt_path`, y cambiar el estado a `aprobado` o
`rechazado`. `bib_number` es para el número de dorsal.

## Pendiente

- Sincronizar cada inscripción a una hoja de Google Drive (paso 2).
- Enlazar los botones «Inscríbete» de la página principal a `/inscripcion` cuando se decida dejar de usar
  cronometraje.
- Tallas infantiles para el 3K, si la organización las va a tener.
