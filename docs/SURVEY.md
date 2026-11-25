# Encuesta de experiencia

`/encuesta` recoge la opinión de quienes corrieron la edición. Es la fuente del informe de satisfacción
para preparar la siguiente.

Cómo se configura (migración, variables, permisos de la hoja): [DEPLOYMENT.md](DEPLOYMENT.md#variables-de-entorno).

## Quién puede responder

Solo quien tiene una inscripción en `registrations` de la edición actual (`event.edition`), que no esté
rechazada. Se identifica con:

- **la cédula**, con o sin puntos, espacios o guiones: `1.234.567.890` y `1234567890` son la misma;
- **el celular**, con o sin `+57`.

La normalización es la misma que usa la inscripción (`cedulaSchema` y `mobileSchema` en
`src/domain/registration/schema.ts`), así que lo que se guardó al inscribirse coincide con lo que se escribe
aquí.

**Una respuesta por inscripción.** Si un mismo celular tiene varias inscripciones (una familia), cada envío
ocupa la siguiente que falte por responder. Un segundo intento con una inscripción ya respondida recibe
«Esa inscripción ya respondió la encuesta». Reenviar el mismo formulario (doble clic, red lenta) no duplica.

**Quién puede quedar afuera:** quien no tiene su inscripción en Supabase. La hoja de inscripciones tiene 13
filas anteriores al formulario propio (del 7 de agosto al 15 de septiembre de 2026); se comprobó el 25 de
noviembre que una de ellas no está en la base y la encuesta le responde «No encontramos una inscripción».
Falta revisar las otras doce; está registrado en `ops/planning/HUMAN_ACTIONS.md`.

## Las preguntas

| #   | Pregunta                                          | Respuesta       | Columna en la base |
| --- | ------------------------------------------------- | --------------- | ------------------ |
| 1   | Experiencia general                               | 1 a 5 estrellas | `overall`          |
| 2   | Organización del evento                           | 1 a 5           | `organization`     |
| 3   | Ruta y señalización                               | 1 a 5           | `route`            |
| 4   | Hidratación y atención en el recorrido            | 1 a 5           | `hydration`        |
| 5   | Zona de llegada y actividades                     | 1 a 5           | `finish_area`      |
| 6   | Lo que más le gustó                               | texto           | `liked_most`       |
| 7   | Qué mejorar                                       | texto           | `improve`          |
| 8   | ¿Participaría en 2027?                            | 4 opciones      | `return_intent`    |
| 9   | Del 0 al 10, ¿recomendaría la carrera? (opcional) | 0 a 10          | `recommend`        |

Las calificaciones se guardan como número (5 = Excelente, 1 = Muy mala) para poder promediarlas. Los textos
de las preguntas y las opciones viven en `src/features/experience-survey/schema.ts`; si cambian de forma que
altere el significado de una respuesta, se sube `surveyVersion` para distinguir las respuestas viejas.

## Dónde ver las respuestas

- **La hoja de Drive** «Encuesta de experiencia - Corre y Libérate 2026», en la carpeta TECH de la cuenta de
  Integral Fit. Cada respuesta es una fila, con nombre, cédula, celular, correo, distancia y categoría
  tomados de la inscripción. Es la vista para la organización.
- **La tabla `experience_survey_responses`** en Supabase. Es la fuente de verdad: la hoja es una copia
  que se escribe después de guardar, y si Google falla la respuesta queda igual en la base (el error queda
  en los logs como `[encuesta] no se copió la respuesta a Sheets`).

Para cruzar una respuesta con su inscripción, `registration_id` apunta a `registrations.id`.

## Borrar una respuesta de prueba

La cuenta del servidor solo puede leer e insertar en la tabla, a propósito. Borrar se hace a mano desde el
SQL Editor de Supabase, por la referencia (`submission_id`, la columna «Referencia» de la hoja):

```sql
delete from public.experience_survey_responses
where submission_id = '<referencia>'
returning submission_id;
```

Y después se borra su fila en la hoja. Al borrarla de la base, esa inscripción puede volver a responder.

## En las vistas previas

En la vista previa del PR #58 (25 de noviembre de 2026) `/encuesta` mostraba «La encuesta no está
disponible en este momento», que es lo que la página hace cuando no encuentra configuración de Supabase.
En producción sí funciona. Para probarla en una vista previa hay que cargar `SUPABASE_URL` y
`SUPABASE_SECRET_KEY` en el ambiente Preview de Vercel.
