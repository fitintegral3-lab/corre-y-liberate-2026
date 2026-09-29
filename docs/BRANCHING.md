# Ramas y flujo de trabajo

## Las dos ramas permanentes

| Rama          | Entorno                                   | Quién la mueve                          |
| ------------- | ----------------------------------------- | --------------------------------------- |
| `main`        | **Producción** — lo que ve el público     | Solo merges desde `development`, por PR |
| `development` | **Desarrollo** — preview con datos reales | Merges desde ramas de trabajo, por PR   |

`main` nunca recibe un commit directo. `development` es la base de toda rama de
trabajo y el lugar donde las cosas se integran entre sí antes de publicarse.

## Ramas de trabajo

Salen de `development` y vuelven a `development`. El nombre usa el mismo tipo
que el commit:

```text
feat/precios-preventa-4
fix/ancla-kit-en-safari
docs/guia-de-contenido
chore/subir-next-16-4
```

```bash
git switch development
git pull
git switch -c feat/lo-que-sea
```

Una rama de trabajo es corta: si vive más de unos días, se integró tarde y el
merge va a doler. Si el trabajo es grande, se parte en hitos —que es lo que
hace `ops/planning/BACKLOG.md`— y cada hito es una rama.

## El ciclo

```text
idea → ops/planning/INBOX.md
         └─ promoción humana ─▶ roadmap/ ─▶ BACKLOG.md
                                              └─ rama ─▶ PR ─▶ development
                                                                   └─ release ─▶ main
```

1. La idea se anota en `ops/planning/INBOX.md`. Nada entra a la cola solo.
2. Una persona la promueve: se especifica como épica en
   `ops/planning/roadmap/` con sus criterios de aceptación.
3. Las historias listas pasan a un `## Hito` de `ops/planning/BACKLOG.md`.
4. Se abre una rama, se trabaja, se abre PR contra `development`.
5. CI corre formato, lint, tipos, pruebas, build, que ningún código de descuento
   llegue al navegador (`check:bundle`) y la validación del planning.
6. Se mergea. La evidencia de la tarea queda en `ops/planning/done/`.

## Release a producción

Cuando `development` tiene un conjunto coherente y verificado:

```bash
git switch development
git pull
git switch main
git pull
git merge --no-ff development
git push origin main
```

O, preferible, por PR de `development` → `main`, para que quede el registro de
qué entró y quién lo aprobó.

El merge a `main` es `--no-ff` a propósito: el commit de merge es el marcador de
release en el historial.

## Hotfix

Un fallo en producción que no puede esperar al siguiente ciclo:

```bash
git switch main
git pull
git switch -c fix/lo-que-se-rompio
# arreglar, verificar
```

El PR va **a `main`**. Apenas se mergea, se baja a `development` para que las
dos ramas no se separen:

```bash
git switch development
git merge main
git push origin development
```

Un hotfix que no vuelve a `development` reaparece en el siguiente release.

## Commits

Conventional Commits, en inglés, máximo 70 caracteres por línea, sin trailers.
El hook `commit-msg` lo exige; la convención completa está en
[CONTRIBUTING.md](../CONTRIBUTING.md) y en `.claude/commands/commit.md`.

## Protección de ramas (pendiente de configurar en GitHub)

Recomendado para `main` y `development`, en Settings → Branches:

- Requerir PR antes de mergear.
- Requerir que pasen los checks `quality`, `build` y `planning`.
- Requerir que la rama esté al día con la base.
- Prohibir push forzado y borrado.
- En `main`, además: requerir al menos una aprobación.

Está anotado en `ops/planning/HUMAN_ACTIONS.md` porque necesita permisos de
administración del repositorio.
