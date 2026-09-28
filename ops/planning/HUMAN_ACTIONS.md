# Acciones humanas

Lo que sólo puede hacer una persona: credenciales, cuentas, DNS, permisos, decisiones de negocio,
gasto real y escritura en producción. El runner agrega la fila y para esa línea de trabajo; nunca
inventa el dato ni rodea el bloqueo.

Mientras una fila esté `pendiente`, la tarea que nombra su primera columna no se toma. El `Estado` es
vocabulario cerrado —`pendiente` o `resuelta`, y detrás puede ir la fecha—; cualquier otra palabra
deja la fila abierta, y `check` la rechaza en vez de dejar la tarea bloqueada en silencio.

Cuando el bloqueo aparece antes de que exista la tarea —una instancia recién creada, un descubrimiento
que todavía no se promovió—, la fila se escribe igual: es lo único que hace que una persona se entere.
La primera columna nombra entonces lo que el bloqueo detiene —la épica, el recorrido, o `—` si es toda
la línea de trabajo—, y no un slug de tarea inventado.

Esa fila no saltea nada, porque sólo se saltea lo que está en la cola del BACKLOG, y `check` tampoco la
rechaza: de esta tabla juzga el `Estado` y nada más. Lo que sí hace es contar y aparecer en `ops context`
como `HUMAN <primera columna>: <acción>`, que es el punto. Está fijado en `test/contracts.test.js`, y no
se deduce de la regla del WIP —que sí exige existir en BACKLOG o DONE—: son dos contratos distintos.

Las filas resueltas se sacan con `ops archive <planning> human-actions`, que las mueve a
`done/human-actions.md`. No ahorra contexto —una fila resuelta ya no llega a ningún runner—; mantiene
legible lo que queda por decidir.

| Tarea | Estado | Origen | Acción concreta y condición de desbloqueo |
|---|---|---|---|
| — | pendiente | Ready | **No se puede inscribir al 3K.** En el formulario de cronometrajeinstantaneo.com/inscripciones/corre-y-liberate el campo `idcarrera` tiene exactamente tres opciones —`23877`, `23876`, `23874`, que son 5K, 7K y 10K— y el selector de talla va de XS a XXL, sin tallas de niño. El afiche de esa misma página anuncia 3K a $90.000. Hay que pedirle al proveedor que habilite la carrera 3K y tallas infantiles: el 3K es para todo público, así que también corren niños. Se desbloquea cuando `idcarrera` tenga una cuarta opción. |
| — | pendiente | Ready | El afiche que el proveedor muestra en esa página se contradice: el encabezado dice «PREVENTA 2 · Del 16 de septiembre al 31 de octubre de 2026» y el banner de abajo dice «¡ASEGURA TU CUPO EN PREVENTA 1!». Pedir que reemplacen la imagen. |
| — | pendiente | Ready | Entregar la URL real de la página de Facebook del evento. Hoy `src/config/site.ts` apunta al inicio de facebook.com y el ícono del pie lleva a ningún lado. Se desbloquea cuando la organización pase el enlace. |
| — | pendiente | Ready | Confirmar la razón social exacta de CES Fundación Educativa, Cereales JJ, Casa de la Mujer Jamundí y El Cartel Running Club. Los nombres se leyeron de sus propios logos, así que sirven para el `alt`, pero no son una fuente autorizada. |
| — | pendiente | Ready | Confirmar el dominio definitivo y cargar `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_APP_ENV` en Vercel para Production, Preview y Development. Sin eso el sitemap, el robots y las vistas previas al compartir apuntan mal. Se desbloquea cuando `/api/health` en producción devuelva `environment: production`. |
| — | pendiente | Ready | Proteger `main` y `development` en GitHub: PR obligatorio, checks `quality`, `build` y `planning` requeridos, sin push forzado, y una aprobación en `main`. Requiere permisos de administración del repositorio. |

<!--
| slug-de-tarea | pendiente | Ready | Crear la cuenta en el proveedor y dejar el token en `.env`. Se desbloquea cuando `ops check` pasa. |
| otro-slug | resuelta 2026-08-17 | QA | Se aprobó el gasto del plan pago. |
-->
