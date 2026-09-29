# Editar el contenido del evento

Todo lo que dice el sitio —precios, fechas, premios, horarios, patrocinadores—
vive en `src/content/`. No hace falta tocar un componente.

Cada archivo se valida contra el esquema del dominio al importarse. Si un dato
está mal, el build falla nombrando el campo y el motivo; no llega a producción
como un `NaN` o una imagen rota.

## Dónde está cada cosa

| Qué querés cambiar                        | Archivo                                                  |
| ----------------------------------------- | -------------------------------------------------------- |
| Nombre, edición, fecha, lema, organizador | `src/content/event.ts`                                   |
| Distancias, horas de salida, categorías   | `src/content/distances.ts`                               |
| Premiación por distancia y rama           | `src/content/awards.ts`                                  |
| Fases de preventa y precios               | `src/content/pricing.ts`                                 |
| Kit del corredor                          | `src/content/kit.ts`                                     |
| Sede, dirección, mapa, apertura           | `src/content/venue.ts`                                   |
| Patrocinadores                            | `src/content/sponsors.ts`                                |
| Pilares del propósito social              | `src/content/purpose.ts`                                 |
| Pasos y requisitos para inscribirse       | `src/content/registration.ts`                            |
| Textos del formulario y del reglamento    | `src/content/registration-form.ts`                       |
| Códigos de descuento y QR de pago         | `src/lib/registration/payment-config.ts` (solo servidor) |
| Textos de los correos al corredor         | `src/lib/email/templates.ts`                             |
| Enlaces del menú                          | `src/content/navigation.ts`                              |
| Enlace de inscripción, redes, créditos    | `src/config/site.ts`                                     |

Los códigos y los QR no están en `src/content/` a propósito: ese contenido lo
importan componentes del navegador, y los códigos terminarían en el JavaScript
público. Cómo cambiarlos, y qué hacer cuando empiece la preventa 3, en
[REGISTRATION.md](REGISTRATION.md).

## Reglas que conviene entender

**Los montos son números, no texto.** Se escribe `140_000`, no `'$140.000'`.
El formato `$140.000` lo pone el sitio al renderizar. Por eso el **total** de
cada tarjeta de premiación se calcula solo: no puede contradecir a sus filas.

**Las fechas son `YYYY-MM-DD`.** El texto «1 de agosto al 15 de septiembre de
2026» se deriva de `startsOn` y `endsOn`. Si las dos caen en el mismo mes, el
sitio escribe «1 al 21 de noviembre de 2026» sin que nadie lo indique.

**Las distancias tienen un id estable.** `'5k'`, `'7k'`, `'10k'`,
`'3k-infantil'`. Ese id une los horarios, los premios y los precios.

**Los logos van en `public/`.** La ruta empieza con `/` y el esquema verifica
que termine en una extensión de imagen.

## Recetas

### Subir un precio de preventa

`src/content/pricing.ts`, dentro de la fase que corresponda:

```ts
prices: { '5k': 120_000, '7k': 140_000, '10k': 170_000, '3k-infantil': 90_000 },
```

Se actualizan solos: la tabla de preventas, las ofertas del JSON-LD y el
rango de precios que muestra Google.

Hay una prueba que exige que el precio **nunca baje** al avanzar la fase. Si
tenés que bajarlo a propósito, hay que ajustar la prueba en
`src/content/content.test.ts` — y ese es el punto: obliga a que sea una
decisión y no un dedazo.

### Correr la fecha del evento

`src/content/event.ts`:

```ts
date: '2026-11-29',
```

Se actualizan el hero, la sección de ubicación, el pie de página, los
metadatos, el sitemap y los datos estructurados.

### Agregar un patrocinador

1. Convertí el logo a WebP y dejalo en `public/sponsors/`. Si el original es
   PNG: `cwebp -lossless -m 6 logo.png -o logo.webp`, y si pesa más de 1200 px
   de lado, agregá `-resize 1200 0`. El sitio lo muestra a 300 px como máximo.
2. Agregá la entrada en `src/content/sponsors.ts`:

```ts
{
  id: 'nombre-del-aliado',
  name: 'Nombre del Aliado',
  logo: '/sponsors/nombre-del-aliado.webp',
  tier: 'oficial',
}
```

El `id` tiene que ser único: hay una prueba que lo verifica, porque es lo que
React usa como `key`.

### Agregar una distancia nueva

Esta es la que toca varios archivos, y a propósito:

1. `src/domain/event/schema.ts` → agregá el id a `distanceIdSchema`.
2. `src/content/distances.ts` → la distancia, con su hora y su descripción.
3. `src/content/pricing.ts` → el precio en **las tres** fases.
4. `src/content/awards.ts` → la premiación, si la tiene.

Si te olvidás del paso 3, no compila: `prices` es un registro cerrado sobre los
ids de distancia. Eso es exactamente lo que se quería.

### Cambiar el lema

`src/content/event.ts`. Está partido en dos porque el diseño subraya la segunda
mitad:

```ts
tagline: {
  lead: 'CADA KILÓMETRO',
  highlight: 'PROTEGE, INSPIRA Y TRANSFORMA',
},
claim: 'Cada kilómetro protege, inspira y transforma',
```

`claim` es la versión en prosa para `<meta>`, Open Graph y datos estructurados.

## Antes de abrir el PR

```bash
npm run verify
```

Lint, tipos y pruebas. Si el contenido está mal, falla acá.
