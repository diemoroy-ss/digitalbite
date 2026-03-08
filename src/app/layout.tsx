import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ⚠️ Usamos rutas relativas (../) para evitar el error del alias @
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Santisoft | Desarrollo de Sitios Web y Apps con IA",
  description: "Agencia líder en Chile en creación de sitios web, aplicaciones móviles y automatización de procesos utilizando Inteligencia Artificial avanzada. Sin límites técnicos.",
  keywords: [
    "Desarrollo IA Chile", 
    "Creación de sitios web con IA", 
    "Apps con Inteligencia Artificial", 
    "Automatización n8n Chile", 
    "Santisoft", 
    "Agencia de software IA",
    "Transformación digital Santiago"
  ],
  authors: [{ name: "Felipe Bermúdez", url: "https://santisoft.cl" }],
  creator: "Santisoft AI Agency",
  publisher: "Santisoft",
  robots: "index, follow",
  alternates: {
    canonical: "https://santisoft.cl",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://santisoft.cl",
    title: "Santisoft - El futuro del desarrollo con IA",
    description: "Creamos software, webs y apps que antes eran imposibles. Potencia tu empresa con agentes autónomos y tecnología de vanguardia.",
    siteName: "Santisoft",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Santisoft AI Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Santisoft | Desarrollo IA sin límites",
    description: "Sitios Web, Apps y Automatizaciones impulsadas por IA en Chile.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Santisoft",
              "image": "https://santisoft.cl/logo.png",
              "@id": "https://santisoft.cl",
              "url": "https://santisoft.cl",
              "telephone": "", 
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Chicauma",
                "addressLocality": "Lampa",
                "addressRegion": "RM",
                "addressCountry": "CL"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -33.284, 
                "longitude": -70.885
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "09:00",
                "closes": "18:00"
              },
              "sameAs": [
                "https://www.linkedin.com/company/santisoft"
              ],
              "description": "Agencia de desarrollo impulsada por Inteligencia Artificial especializada en sitios web y aplicaciones."
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030712] text-slate-100 selection:bg-blue-500/30 min-h-screen flex flex-col`}>
        <Navbar />
        {/* El padding top compensa el Navbar fijo en escritorio y móvil */}
        <main className="flex-grow pt-28 md:pt-40">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}