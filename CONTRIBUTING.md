# Contribuir

## Antes de escribir código

El trabajo sale de `ops/planning/`, no de la cabeza de quien abre el editor:

- Una idea nueva se anota en `ops/planning/INBOX.md`. No entra a la cola sola.
- Lo que está aprobado está en `ops/planning/BACKLOG.md`.
- `npm run ops:tree` muestra en qué etapa está cada cosa.

## Preparar el entorno

```bash
nvm use            # Node 24
npm install        # instala también los hooks de git (husky)
cp .env.example .env.local
npm run dev
```

`npm install` corre `husky`, que engancha dos hooks:

- `pre-commit` → `lint-staged`: ESLint y Prettier sobre lo que vas a commitear.
- `commit-msg` → `commitlint`: valida el mensaje.

## Ramas

Salen de `development` y vuelven a `development`. `main` es producción y no
recibe commits directos. Detalle en [docs/BRANCHING.md](docs/BRANCHING.md).

## Commits

**Conventional Commits, en inglés, máximo 70 caracteres por línea, sin
trailers.** El hook `commit-msg` lo exige.

```text
type(scope): description

Cuerpo opcional que explica el qué y el por qué,
no el cómo. Cada línea, 70 caracteres como máximo.
```

- Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`,
  `ci`, `build`.
- Scopes de este repo: `app`, `content`, `domain`, `features`, `ui`, `seo`,
  `a11y`, `perf`, `lib`, `config`, `deps`, `ci`, `ops`, `docs`, `test`,
  `registration` (inscripción, pago, correos) y `admin` (revisión de pagos). Se usa
  cuando el cambio está acotado a un módulo; se omite si toca varios.
- La descripción empieza en minúscula, en imperativo, sin punto final.
- **Sin trailers**: nada de `Co-Authored-By` ni `Signed-off-by`.
- Nunca `git add -A` ni `git add .` — siempre rutas explícitas.

Ejemplos:

```text
feat(content): add a fourth presale phase

fix(seo): use the event time zone for the sitemap date

Parsing the ISO date as UTC shifted every date one day
back when rendered from a UTC server.
```

La convención completa, con la tabla de cuándo usar cada tipo, está en
`.claude/commands/commit.md`.

## Dónde va cada cambio

| Si cambiás…                           | Va en…                                                        |
| ------------------------------------- | ------------------------------------------------------------- |
| Un precio, una fecha, un patrocinador | `src/content/` — ver [docs/CONTENT.md](docs/CONTENT.md)       |
| Una regla del evento                  | `src/domain/` + su prueba                                     |
| El maquetado de una sección           | `src/features/<seccion>/`                                     |
| Algo que usan varias secciones        | `src/components/ui/`                                          |
| Colores, tipografía, tokens           | `src/app/globals.css`                                         |
| Enlaces externos, créditos            | `src/config/site.ts`                                          |
| Códigos de descuento y QR de pago     | `src/lib/registration/payment-config.ts` (solo servidor)      |
| La inscripción, correos, planilla     | `src/lib/` — ver [docs/REGISTRATION.md](docs/REGISTRATION.md) |

Lo que **no** se edita a mano: `ops/` y `.claude/skills/`, `.claude/workflows/`.
Los regenera `cd ops && make install-claude` desde la dependencia de Cauce.

## Definición de terminado

- [ ] `npm run verify` pasa (lint + tipos + pruebas).
- [ ] Si tocaste la inscripción o los códigos: `npm run build && npm run check:bundle` pasa.
- [ ] Si tocaste el dominio, hay una prueba que cubre el caso.
- [ ] Si tocaste una sección, la miraste en 375px y en escritorio.
- [ ] Los enlaces externos llevan `target="_blank"` y `rel="noopener noreferrer"`.
- [ ] Las imágenes tienen `alt`; las decorativas, `alt=""` o `aria-hidden`.
- [ ] El PR explica el porqué, no solo el qué.

## Estilo de código

Lo que no resuelven ESLint y Prettier:

- **Server Components por defecto.** `'use client'` solo cuando hay estado o
  eventos del navegador, y en el componente más chico posible. Hoy el único es
  `SiteHeader`.
- **Los comentarios explican por qué, no qué.** Si el comentario describe lo
  que hace la línea siguiente, sobra: renombrá la variable.
- **Nada de `../../`.** ESLint lo bloquea: usá el alias `@/`.
- **Los datos son datos.** Un monto es un número, una fecha es una cadena ISO.
  El formato se aplica al renderizar, en `src/lib/format/`.

## Revisión

Un PR se aprueba cuando quien revisa pudo **comprobar** lo que dice, no cuando
confía en que funciona. Por eso el template pide pasos de verificación y, si el
cambio se ve, capturas de antes y después.
