# Despliegue

## Entornos

| Entorno        | Rama          | `NEXT_PUBLIC_APP_ENV` | Indexable      |
| -------------- | ------------- | --------------------- | -------------- |
| Producción     | `main`        | `production`          | Sí             |
| Desarrollo     | `development` | `development`         | No (`noindex`) |
| Preview por PR | rama del PR   | `preview`             | No (`noindex`) |

Solo producción emite `index, follow`. El resto pide `noindex` desde
`app/robots.ts` para que las previews no compitan en buscadores con el sitio
real por las mismas búsquedas.

## Variables de entorno

Las define `src/lib/env.ts` y se validan al construir: si falta una o llega con
formato inválido, el build falla ahí con el nombre y el motivo.

| Variable               | Obligatoria | Ejemplo                                    |
| ---------------------- | ----------- | ------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Sí          | `https://correyliberate.com`               |
| `NEXT_PUBLIC_APP_ENV`  | Sí          | `production` \| `development` \| `preview` |

En Vercel se configuran una vez por entorno (Production / Preview /
Development). Localmente, `cp .env.example .env.local`.

`NEXT_PUBLIC_SITE_URL` alimenta `metadataBase`, el `sitemap.xml`, el
`robots.txt` y las URLs absolutas de Open Graph. Si queda mal, las vistas
previas al compartir el enlace se rompen sin que nada avise.

## Vercel

| Ajuste            | Valor            |
| ----------------- | ---------------- |
| Framework         | Next.js          |
| Production Branch | `main`           |
| Build Command     | `npm run build`  |
| Install Command   | `npm ci`         |
| Node              | 24 (de `.nvmrc`) |

Cada push a `development` y cada PR generan una preview con URL propia. Esa es
la URL que se le pasa a quien tiene que aprobar un cambio: nunca se aprueba
mirando local.

## Comprobar un despliegue

```bash
curl -s https://correyliberate.com/api/health | jq
```

```json
{
  "status": "ok",
  "environment": "production",
  "commit": "a1b2c3d",
  "event": { "name": "Corre y Libérate", "edition": 2, "date": "2026-11-22" },
  "checkedAt": "2026-09-21T18:00:00.000Z"
}
```

`commit` dice qué quedó publicado sin abrir el panel de Vercel. El endpoint no
se cachea nunca: un chequeo de salud cacheado no chequea nada.

Además vale la pena mirar, después de cada release:

- `https://correyliberate.com/robots.txt` — debe permitir `/` y apuntar al sitemap.
- `https://correyliberate.com/sitemap.xml` — una URL, la raíz.
- `https://correyliberate.com/opengraph-image` — la imagen de vista previa.
- Pegar el enlace en un chat de WhatsApp y ver que aparezca la tarjeta.

## Revalidación

`app/page.tsx` declara `export const revalidate = 3600`. La página es estática
y se regenera cada hora. Eso importa por un motivo concreto: el texto «precios
especiales hasta el …» y las ofertas del JSON-LD salen de la fase de preventa
vigente, que cambia por calendario. Sin revalidación, un cambio de fase
necesitaría un redespliegue.

Si hace falta que un cambio de contenido salga ya, el camino es desplegar: el
contenido vive en el repositorio, no en una base de datos.

## Rollback

En Vercel, Deployments → el despliegue anterior → _Promote to Production_. Es
inmediato y no requiere tocar git.

Después hay que revertir en git también, o el siguiente push vuelve a publicar
lo mismo:

```bash
git switch main
git revert --no-ff <sha-del-merge>
git push origin main
```
