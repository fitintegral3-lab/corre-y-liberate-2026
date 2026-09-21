# Inbox sin promover

El runner puede agregar; solo una persona promueve y elimina.

Cada ítem empieza con su nombre en negrita, porque ese nombre es con el que se lo cita después desde
`HUMAN_ACTIONS.md`, desde una épica o desde una propuesta mensual. Una viñeta sin nombre no se cuenta, y
`ops tree` avisa cuántas quedaron afuera:

```markdown
- **slug-del-item** — Qué es, y qué se decide o se resuelve con esto.
```

Lo que separa a las cuatro secciones es el sujeto del ítem, no su tamaño ni su urgencia:

- **Deuda** — un costo que ya estamos cargando en código nuestro, conocido y no bloqueante.
- **Ideas** — una pregunta abierta, sin respuesta propuesta.
- **Propuestas** — un cambio concreto del producto y su fix propuesto. La evidencia no se copia acá: se
  cita dónde vive —el `done/` de la tarea, el informe—.
- **Lecciones** — sobre cómo trabajamos; es lo que alimenta reglas y propuestas de cargo.

Ideas y Propuestas se separan por si hay una respuesta propuesta. Deuda y Propuestas, por si el costo
ya se aceptó o el cambio recién se propone. Propuestas y Lecciones, por si el sujeto es el producto o
la forma de trabajar — un defecto encontrado de paso es una propuesta, no una lección.

## Deuda

- **csp-sin-nonce** — La CSP de `next.config.ts` admite `script-src 'unsafe-inline'` porque el App Router inyecta su bootstrap y el payload de Flight como scripts inline sin nonce. Sigue cortando scripts de terceros, pero no protege contra inyección inline. Pasar a nonces exige un `proxy.ts` que los emita por request. Costo aceptado y documentado en `docs/ARCHITECTURE.md`.
- **fuentes-sin-referencia** — `public/fonts/` conserva diez archivos `.cff` y dos `Teko` que no referencia ningún estilo desde que las tipografías pasaron a `next/font`. Ocupan lugar en cada clon y confunden sobre cuál fuente usa el sitio.
- **logo-alma-pesado** — `public/sponsors/alma.png` pesa 1,8 MB. `next/image` lo re-comprime al servirlo, así que no afecta a quien visita, pero sí al repositorio.
- **verify-de-cauce-vs-turbopack** — El guard de `verify` corre `npm run build` sobre un worktree temporal con `node_modules` enlazado por symlink, y Turbopack lo rechaza: «Symlink [project]/node_modules is invalid, it points out of the filesystem root». El build real del proyecto pasa; es una incompatibilidad del guard con Next 16, no un rojo. Mientras no se resuelva, cada commit exige aprobación humana. Vale reportarlo a ingeniomaps/cauce.
- **favicon-apaisado** — Los tres íconos (`icon`, `shortcut`, `apple`) apuntan a `logo_nav.png`, un logotipo apaisado. A 16 px en una pestaña queda ilegible. Hay un `src/app/icon.png` sin usar.

## Ideas

## Propuestas

- **medir-el-clic-de-inscripcion** — El sitio tiene un solo objetivo —que la persona llegue a la plataforma de cronometraje— y hoy nadie sabe cuánta gente lo cumple. Propuesta: un escucha delegado de clics sobre `[data-analytics]` en un único componente cliente, para no volver componente cliente a cada CTA. Requiere elegir proveedor y agregar su dominio a `script-src` y `connect-src`.
- **pruebas-visuales-por-seccion** — Lint y tipos no ven que una sección se corrió veinte píxeles. Una captura por sección en dos anchos atraparía la regresión que hoy solo se nota mirando.

## Lecciones
