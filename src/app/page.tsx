import { offSeason } from '@/content';
import { EventLanding } from '@/features/landing/EventLanding';
import { OffSeasonHome } from '@/features/off-season/OffSeasonHome';
import { buildEventJsonLd, buildOrganizationJsonLd } from '@/lib/seo/json-ld';

/**
 * La pagina se prerenderiza y se revalida cada hora.
 *
 * El contenido es estatico salvo por el cierre de inscripciones. La revalidacion
 * permite reflejar el cierre sin redesplegar ni renderizar en cada visita.
 */
export const revalidate = 3600;

/**
 * Serializa datos estructurados para incrustarlos en el HTML.
 *
 * `</script>` dentro de una cadena cerraria la etiqueta antes de tiempo; se
 * escapa el `<` para que eso no pueda pasar aunque manana el contenido lo
 * incluya.
 */
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function HomePage() {
  return (
    <>
      {offSeason.active ? <OffSeasonHome /> : <EventLanding />}

      {/* Entre ediciones no hay carrera que anunciar: solo queda la organización. */}
      {!offSeason.active && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildEventJsonLd()) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildOrganizationJsonLd()) }}
      />
    </>
  );
}
