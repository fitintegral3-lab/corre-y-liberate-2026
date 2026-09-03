import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Corre y Libérate 2026 — 2ª Edición Oficial | Integral Fit Jamundí",
  description: "Carrera deportiva y social en Jamundí, Valle del Cauca. Domingo 22 de noviembre de 2026. Distancias 10K, 7K, 5K y 3K Infantil. ¡Asegura tu cupo al mejor precio!",
  icons: {
    icon: "/logos/logo_nav.png",
    shortcut: "/logos/logo_nav.png",
    apple: "/logos/logo_nav.png",
  },
  keywords: [
    "Corre y Libérate",
    "Carrera Jamundí",
    "Integral Fit",
    "Maratón Jamundí 2026",
    "Carrera 10K Valle del Cauca",
    "Carrera con causa social",
    "Estadio El Cacique",
  ],
  authors: [{ name: "Integral Fit" }],
  openGraph: {
    title: "Corre y Libérate 2026 — Segunda Edición Oficial",
    description: "Cada kilómetro protege, inspira y transforma. Inscríbete ya para la carrera atlética de Jamundí.",
    url: "https://cronometrajeinstantaneo.com/inscripciones/corre-y-liberate",
    siteName: "Corre y Libérate",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corre y Libérate 2026 — 2ª Edición",
    description: "Cada kilómetro protege, inspira y transforma. 22 de noviembre de 2026 en Jamundí.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Montserrat:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#111111] antialiased">
        {children}
      </body>
    </html>
  );
}
