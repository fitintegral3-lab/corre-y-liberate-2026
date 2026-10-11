# Validación de compatibilidad del formulario

Cambio en `fix/mobile-registration-compatibility`, validado localmente con el build de producción.

## Comportamiento

- La fecha usa día, mes y año; el envío conserva `YYYY-MM-DD` y la validación del servidor.
- Las opciones usan radios nativos visibles, sin depender de `:has()`.
- Los controles tienen texto de 16 px y estilos básicos fuera de las capas de Tailwind.
- La compresión intenta `Image` si no hay `createImageBitmap` o falla la decodificación.
  Si no puede optimizar, conserva el original; el límite de carga del servidor sigue aplicando.
- El QR abre una imagen en otra pestaña cuando no existe `dialog.showModal`.

## Evidencia

- `npm run verify`: lint, tipos y 118 pruebas correctas.
- `npm run build`: compilación de producción correcta.
- `npm run check:bundle`: los códigos de descuento siguen fuera del cliente.
- Prettier y `git diff --check`: correctos.
- Pruebas de fecha: campos incompletos, año mal formado, fechas imposibles, futuras y bisiestos.
- Pruebas de compresión: ausencia de ImageBitmap y File constructor, codificación JPEG,
  escalado a 2000 px, liberación de URL, ausencia de toBlob, fallo al decodificar y PDF.
- Mutaciones comprobadas: intercambiar día y mes hace fallar la prueba de fecha ISO;
  eliminar el fallback Image hace fallar la prueba de compresión. Ambas mutaciones se revirtieron.
- UI en navegador moderno: selección de carrera y género, precio 10K y QR de $160.000,
  rechazo de 31 de abril, aceptación de 29 de febrero de 2000 en la validación previa,
  apertura y cierre del QR conservando la fecha, sin errores de consola.
- Ancho efectivo medido: 400 px; contenido de 392 px, sin desbordamiento horizontal.
  La herramienta no aplicó el ancho solicitado de 320 px; no se afirma haberlo validado.

## Límites de la comprobación

No se creó una inscripción ni se subió un comprobante real. La validación previa rechaza el
formulario incompleto, por lo que no escribe en los sistemas externos.

Las pruebas de APIs ausentes usan dobles en Vitest; no sustituyen una prueba en Android/iOS antiguo.
El fallback CSS se conserva en el archivo CSS compilado, pero no se verificó visualmente en un
navegador antiguo real. El fallback del QR se revisó en código; el modal se probó en navegador moderno.

Next.js 16 sigue teniendo como base Chrome/Edge 111, Firefox 111 y Safari 16.4; Tailwind 4,
Chrome 111, Firefox 128 y Safari 16.4. Los cambios reducen dependencias del formulario, pero no
garantizan que el runtime completo funcione en dispositivos fuera de esos límites.

Esta evidencia local no confirma por sí sola el despliegue. Para confirmar el caso reportado falta
probar la versión corregida en el teléfono y navegador originales, incluyendo el navegador interno
de WhatsApp.

La validación de fecha de nacimiento usa `America/Bogota`, igual que las preventas. La prueba de
regresión verifica las 23:59:59 y 00:00:00 de Colombia: el cambio de fecha ocurre a las 05:00 UTC.
