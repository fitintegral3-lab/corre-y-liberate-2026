# Corre y Libérate 2026

Landing oficial de la carrera atlética **Corre y Libérate**, 2ª edición —
domingo 22 de noviembre de 2026, Estadio El Cacique, Jamundí (Valle del Cauca).
Organiza Integral Fit.

El sitio tiene un solo objetivo medible: que quien entra termine inscrito en la
plataforma de cronometraje. Todo lo demás está subordinado a eso.

---

## Stack

| Pieza      | Elección                                                | Por qué                                                                                                          |
| ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                      | Renderizado en servidor por defecto: la página llega pintada y el JavaScript que baja el visitante es mínimo.    |
| Lenguaje   | TypeScript en modo estricto                             | El contenido del evento está tipado de punta a punta.                                                            |
| Estilos    | Tailwind CSS v4 con tokens `@theme`                     | Los colores de marca son tokens, no literales repetidos.                                                         |
| Validación | Zod                                                     | El contenido y las variables de entorno se validan al importarse; un dato malo rompe el build, no la producción. |
| Pruebas    | Vitest                                                  | Dominio y formateadores, sin montar React.                                                                       |
| Operación  | [Cauce](https://github.com/ingeniomaps/cauce) en `ops/` | El ciclo idea → backlog → WIP → evidencia, con una sola fuente de verdad.                                        |

## Arrancar

Requiere **Node 24** (está en `.nvmrc`).

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

El sitio queda en <http://localhost:3000>.

## Comandos

| Comando                           | Qué hace                                    |
| --------------------------------- | ------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo.                     |
| `npm run build`                   | Build de producción.                        |
| `npm start`                       | Sirve el build.                             |
| `npm run verify`                  | Lint + tipos + pruebas. Es lo que corre CI. |
| `npm run lint` / `lint:fix`       | ESLint.                                     |
| `npm run typecheck`               | `tsc --noEmit`.                             |
| `npm test` / `test:watch`         | Vitest.                                     |
| `npm run format` / `format:check` | Prettier.                                   |
| `npm run ops:check`               | Valida el planning de Cauce.                |
| `npm run ops:tree`                | Muestra roadmap, backlog, WIP y done.       |

## Estructura

```text
src/
├── app/          Rutas. Solo compone: layout, página, sitemap, robots, OG image, /api/health.
├── features/     Una carpeta por sección de la landing. Maquetado y nada más.
├── components/   layout/ (header, footer, FAB) y ui/ (primitivas compartidas).
├── content/      EL CONTENIDO DEL EVENTO. Precios, fechas, premios, patrocinadores.
├── domain/       Tipos, esquemas Zod y reglas puras del evento. Sin React.
├── lib/          Formateo es-CO, SEO, entorno validado, utilidades.
├── config/       Configuración del sitio: URL canónica, enlaces externos, créditos.
└── styles/       Fuentes auto-hospedadas.

ops/              Instancia de Cauce: planning, organización, flujos.
docs/             Arquitectura, ramas, despliegue y cómo editar contenido.
```

La regla que ordena todo: **`domain` no sabe de React, `content` no sabe de
CSS, y `features` no sabe de dónde salen los datos.** Cada capa depende solo de
la de abajo.

Detalle completo en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Cambiar el contenido del evento

Un precio, una hora de salida, un patrocinador nuevo: todo eso se edita en
`src/content/` y no requiere tocar un componente. El cambio se valida contra el
esquema del dominio al construir, así que un precio negativo o una fecha
inexistente rompen el build con el campo y el motivo.

Guía paso a paso en [docs/CONTENT.md](docs/CONTENT.md).

## Ramas y entornos

| Rama          | Entorno                  | Qué es                                                        |
| ------------- | ------------------------ | ------------------------------------------------------------- |
| `main`        | **Producción**           | Lo que ve el público. Solo recibe merges desde `development`. |
| `development` | **Desarrollo / preview** | Rama de integración. Es la base de toda rama de trabajo.      |

Nadie commitea directo a `main`. El detalle —nombres de rama, flujo de
release, hotfix— está en [docs/BRANCHING.md](docs/BRANCHING.md) y el despliegue
en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Contribuir

Convención de commits, definición de "terminado" y cómo se revisa:
[CONTRIBUTING.md](CONTRIBUTING.md).

## Operación con Cauce

El proyecto usa [Cauce](https://github.com/ingeniomaps/cauce) como sistema
operativo: las ideas entran por `ops/planning/INBOX.md`, se especifican como
épicas en `ops/planning/roadmap/`, se promueven a `ops/planning/BACKLOG.md` y
cierran con evidencia en `ops/planning/done/`. Nada se encola solo; la
promoción siempre es humana.

```bash
npm run ops:tree     # qué hay en cada etapa
npm run ops:check    # valida contratos y trazabilidad
```

Lo que necesita una persona con autoridad —credenciales, accesos, decisiones
que no puede tomar un agente— vive en `ops/planning/HUMAN_ACTIONS.md`.
