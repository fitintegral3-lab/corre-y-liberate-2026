import { ImageResponse } from 'next/og';

import { distances, editionLabel, event, eventTitle, venue } from '@/content';
import { formatWeekdayLongDate } from '@/lib/format';

/**
 * Imagen de vista previa al compartir el enlace.
 *
 * El sitio no tenia ninguna: compartirlo por WhatsApp —que es el canal donde
 * de verdad circula— mostraba un rectangulo vacio. Se genera en el build desde
 * el mismo contenido que la pagina, asi que no hay una imagen aparte que se
 * quede con la fecha vieja.
 */
export const alt = `${eventTitle} — ${editionLabel}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '64px 72px',
        backgroundColor: '#111111',
        backgroundImage:
          'radial-gradient(circle at 18% 22%, rgba(204,66,13,0.55) 0%, rgba(17,17,17,0) 58%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 6,
            color: '#ff5512',
            fontWeight: 700,
          }}
        >
          {editionLabel} · {venue.city.toUpperCase()}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {eventTitle}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#d4d4d4' }}>
          {event.tagline.lead} {event.tagline.highlight}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 18 }}>
          {distances.map((distance) => (
            <div
              key={distance.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 26px',
                borderRadius: 999,
                border: '2px solid rgba(255,255,255,0.35)',
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              {distance.label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#a3a3a3' }}>
          {formatWeekdayLongDate(event.date)} · {venue.name}
        </div>
      </div>
    </div>,
    size,
  );
}
