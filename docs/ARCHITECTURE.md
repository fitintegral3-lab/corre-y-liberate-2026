# Arquitectura

## El problema que resuelve

La versión anterior era un solo archivo: `src/app/page.tsx`, 824 líneas,
marcado como `'use client'`. Los precios, las fechas, los premios y los enlaces
estaban escritos dentro del JSX; los mismos seis enlaces de navegación aparecían
tres veces; el color `#cc420d` aparecía treinta y nueve. Existía además un árbol
completo de componentes en `src/components/sections/` que no importaba nadie:
código muerto que igual había que leer para entender qué estaba vivo.

Nada de eso impedía que el sitio funcionara. Impedía cambiarlo: subir un precio
de preventa obligaba a encontrar las cuatro apariciones del número, y quien lo
hiciera tenía que saber JSX.

## Las capas

```text
app/        ──▶ features/ ──▶ components/ ──▶ lib/
                    │              │            ▲
                    └──▶ content/ ─┴──▶ domain/ ┘
```

Cada capa solo depende de las de abajo. Las flechas nunca vuelven.

### `src/domain/` — qué significa el evento

Tipos, esquemas de Zod y reglas puras. No importa React, no importa Next, no
contiene un solo dato del evento.

- `event/schema.ts` es el contrato: qué es una distancia, qué es una fase de
  preventa, en qué rango es válido cada campo. Los tipos se **infieren** del
  esquema, así que no pueden desincronizarse de la validación.
- `event/selectors.ts` son las derivaciones: cuánto suma la bolsa de una
  distancia, qué preventa está vigente hoy, si las inscripciones siguen
  abiertas. Son funciones puras y por eso se prueban sin montar nada.

Que «cuál preventa está vigente» sea una función del dominio y no un `if` dentro
de una sección es la diferencia entre una regla del negocio y una decisión de
maquetado.

### `src/content/` — los datos del evento

La única fuente de verdad del contenido. Cada archivo llama a `.parse()` del
esquema correspondiente al importarse: si un dato está mal, el build falla con
el campo y el motivo, en vez de llegar a producción como un `NaN` o una imagen
rota.

Los montos se guardan como enteros (`100000`) y no como cadenas (`'$100.000'`):
por eso los totales de premiación se **calculan** y no pueden contradecir a sus
filas. Las fechas se guardan como `YYYY-MM-DD` y el texto «1 de agosto al 15 de
septiembre de 2026» se **deriva**.

Ver [CONTENT.md](CONTENT.md).

### `src/features/` — una carpeta por sección

`hero/`, `awards/`, `pricing/`, `kit/`, `venue/`, `sponsors/`, `clubs/`,
`routes/`, `purpose/`, `edition/`, `registration/`. Cada una maqueta su sección
y nada más: lee de `@/content`, pide derivaciones a `@/domain` y compone
primitivas de `@/components/ui`.

Fuera de la landing: `registration-form/` es el formulario de `/inscripcion` y
`admin/` la lista de la revisión de pagos.

`awards/theme.ts` es el único lugar donde el contenido toca el estilo: traduce
`'purple' | 'light' | 'dark'` a colores y clases. El contenido dice cuál tarjeta
es; qué significa eso en píxeles se decide en la feature.

### `src/components/` — lo compartido

`ui/` tiene cuatro primitivas: `Container` (el lienzo de 1366px), `CtaLink`
(el botón de inscripción que se repite en varias secciones), `DotPattern` (la
trama de puntos de la identidad) y `LogoMarquee` (la tira de logos con su modal,
que usan patrocinadores y clubes). No hay un `SectionHeading` genérico a
propósito: los encabezados de las nueve secciones son demasiado distintos entre
sí, y un componente con nueve props sería peor que el marcado repetido.

`layout/` tiene el header, el footer y el botón flotante de WhatsApp.

### `src/lib/` — infraestructura

- `format/` — pesos colombianos, fechas en español, horas de reloj a ISO. Todo
  probado.
- `seo/` — metadatos y datos estructurados, armados desde el mismo contenido que
  renderiza la página.
- `env.ts` — variables de entorno validadas.
- `utils/cn.ts` — unión de clases de Tailwind con resolución de conflictos.
- La inscripción: `registration/` (el servicio que valida, cobra y guarda, y la
  configuración de códigos y QR, solo servidor), `supabase/`, `gcs/`
  (comprobantes), `sheets/` (la planilla), `email/`, `google/` (la cuenta de
  servicio) y `admin/`. Detalle en [REGISTRATION.md](REGISTRATION.md).
- `build/` — ajuste de Turbopack para compilar con `node_modules` enlazado (lo
  usa el guard de commits).

## Decisiones y por qué

### Servidor por defecto, cliente por excepción

La página entera era un componente cliente. Ahora `'use client'` queda solo
donde hay estado o interacción: `SiteHeader` (el menú móvil), `LogoMarquee` (el
modal de los logos), `RouteButton` (el mapa de cada distancia), el formulario de
inscripción con su QR, la lista de la administración y la página de error. Todo
lo demás —el hero, las tablas de premios, los precios, el footer— se renderiza
en el servidor y llega como HTML.

Se quitó `framer-motion` (~100 KB) en el mismo movimiento: no lo usaba ningún
componente vivo, solo el árbol muerto.

### El contenido se valida, no se confía

Zod al importar, no en un script aparte. La validación corre en `npm run build`,
en `npm test` y en CI sin que nadie la invoque.

Encima de la validación por campo hay pruebas de invariantes en
`src/content/content.test.ts`: que toda distancia tenga precio en toda fase, que
las ventanas de preventa encadenen sin huecos, que el precio nunca baje al
avanzar la fase. Eso es lo que atrapa el error real de agregar una distancia y
olvidar una de las tres tablas.

### La zona horaria es del evento, no del servidor

`new Date('2026-11-22')` es medianoche **UTC**: formateado en America/Bogotá
(UTC−5) devuelve «21 de noviembre». En Vercel el servidor corre en UTC, así que
el bug habría sido invisible en local y real en producción.

`parseIsoDate` construye la fecha por componentes y `toEventIsoDate` resuelve
«hoy» en `America/Bogotá`. Hay pruebas para las dos cosas.

### Fuentes auto-hospedadas

Antes: dos `<link>` a `fonts.googleapis.com` en el `<head>`. Eso son dos
conexiones nuevas antes de poder pintar texto, un salto de layout mientras
llegan, y una petición del visitante a un tercero.

Ahora `next/font` descarga Barlow en el build, la sirve desde el propio dominio
y calcula las métricas de la fuente de respaldo para que el intercambio no mueva
nada. Solo se pide la itálica, que es la única que usan las tres clases
`.font-athletic*`.

### Tokens de diseño

Los colores de marca son tokens `@theme` de Tailwind v4: `bg-brand-orange` en
vez de `bg-[#cc420d]`. Cambiar el naranja vuelve a ser una línea.

Las clases `.font-athletic*` quedaron **fuera** de `@layer` a propósito. Así
ganan sobre las utilidades de Tailwind, que es como se comporta el diseño hoy
—el `line-height` de `.font-athletic` manda sobre el de `text-6xl`—. Moverlas a
una capa invertiría esa precedencia y correría títulos en toda la página.

### Imágenes

Los siete fondos de sección se sirven por `background-image` de CSS, y eso los
deja **fuera del alcance de `next/image`**: no hay `srcset`, no hay AVIF, no hay
recorte por tamaño. Llegaban crudos, a 5692 px de ancho, sobre un lienzo de
1366: **13,2 MB en cada visita**.

Convertidos a WebP y redimensionados a 2560 px quedan en 791 KB — un 94 % menos
— sin diferencia visible: son fotografías bajo una capa de contraste y texto.

Los logos de patrocinadores pasaron de PNG a WebP eligiendo por archivo entre
sin pérdida y `q=88` con alfa intacto, el que pese menos. De 3,5 MB a 462 KB. Al
ir por `next/image`, lo que descarga quien visita ya estaba optimizado; lo que
se gana acá es el peso del repositorio y el trabajo de reencodear en cada build.

El mapa de la sede era un PNG de 422 KB marcado `unoptimized`, así que viajaba
entero. Ahora es WebP sin pérdida y sin esa marca: `next/image` entrega el
tamaño que cada pantalla pide.

|                    | antes   | después              |
| ------------------ | ------- | -------------------- |
| Fondos (7)         | 13,2 MB | 791 KB               |
| Patrocinadores (8) | 3,5 MB  | 462 KB               |
| Mapa de la sede    | 422 KB  | 266 KB, y responsive |

Lo que **no** está resuelto: un teléfono de 375 px descarga el mismo fondo de
2560 px que un monitor. La solución es `next/image` con `fill`, y está anotada
en el INBOX con lo que cuesta.

### Renderizado: estático con revalidación horaria

`export const revalidate = 3600` en `app/page.tsx`. La página es estática salvo
por un dato que depende del calendario: cuál preventa está vigente. Una hora
alcanza para que el cambio de fase se refleje solo, sin redesplegar y sin
renderizar en cada visita.

### SEO

- Metadatos derivados del contenido, no escritos a mano en el `layout`.
- `opengraph-image.tsx` genera la imagen de vista previa en el build. Antes no
  había ninguna: compartir el enlace por WhatsApp —el canal donde de verdad
  circula— mostraba un rectángulo vacío.
- JSON-LD `SportsEvent` con la sede, los horarios de cada distancia y un
  `Offer` por distancia con el precio de la fase vigente. Cuando ya no queda
  fase abierta, el evento se publica sin ofertas.
- Solo `NEXT_PUBLIC_APP_ENV=production` emite `index, follow`. Las previews
  piden `noindex` para no competir con el sitio real.

### Seguridad

`next.config.ts` fija CSP, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` y HSTS.

`src/proxy.ts` protege la administración de pagos con usuario y contraseña; la
página y cada una de sus rutas vuelven a verificar. Los datos de los corredores
viven detrás del servidor: la tabla de Supabase no tiene políticas públicas, el
bucket de comprobantes es privado y ninguna credencial lleva `NEXT_PUBLIC_`. Los
códigos de descuento tampoco llegan al navegador, y `npm run check:bundle` lo
comprueba en CI. Detalle en [REGISTRATION.md](REGISTRATION.md).

**Deuda consciente:** la CSP admite `script-src 'unsafe-inline'` porque el App
Router inyecta su bootstrap y el payload de Flight como scripts inline sin
nonce. La política sigue sirviendo —corta scripts de terceros, fija
`frame-ancestors` y `form-action`— pero no protege contra inyección inline. El
paso a nonces exige que `proxy.ts` los emita en cada request; el archivo ya
existe para la administración, pero emitir nonces ahí sigue pendiente. Está
anotado acá porque es una decisión, no un olvido.

### Analítica

No hay. Se evaluó y se dejó afuera: nadie la pidió, y montar el andamiaje sin
un proveedor elegido es decoración. Cuando se decida, el punto de entrada es un
componente cliente en `app/layout.tsx` y hay que agregar el dominio del
proveedor a `script-src` y `connect-src` en `next.config.ts`.

## `/api/health`

Devuelve entorno, commit desplegado y fecha del evento, sin caché. Le sirve a un
monitor de uptime y a quien despliega para confirmar qué quedó publicado sin
abrir el panel de Vercel.

## Qué queda pendiente

Registrado en `ops/planning/` y en `ops/planning/HUMAN_ACTIONS.md`:

- El enlace de Facebook del footer apunta al inicio de facebook.com, no a la
  página del evento. Necesita que la organización entregue la URL real.
- 46 archivos de `public/` (5,5 MB) no los referencia nadie: exportaciones de
  diseño, fragmentos de fuentes y duplicados. Borrarlos es decisión de una
  persona, no de un refactor.
- Los fondos son un solo WebP de 2560 px servido por CSS: un teléfono descarga
  lo mismo que un monitor. Pasarlos a `next/image` con `fill` daría `srcset`.
