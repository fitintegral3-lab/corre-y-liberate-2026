import { MessageCircle } from 'lucide-react';

import { siteConfig } from '@/config/site';

/** Boton flotante de contacto por WhatsApp, presente en toda la pagina. */
export function WhatsAppFab() {
  return (
    <a
      href={siteConfig.links.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="group fixed right-6 bottom-6 z-50 flex cursor-pointer items-center justify-center rounded-full bg-whatsapp p-4 text-white shadow-2xl shadow-green-950/40 transition-all duration-300 hover:scale-[1.08] hover:bg-whatsapp-dark hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] active:scale-95"
    >
      <MessageCircle
        size={30}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:scale-110"
      />
    </a>
  );
}
