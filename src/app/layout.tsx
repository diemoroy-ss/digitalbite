import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AlertModal from "../components/AlertModal";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digitalbite.app"),
  title: "DigitalBite | Creador de Menús Digitales e Imágenes con IA",
  description: "Software para restaurantes que permite crear banners, posts y menús digitales con Inteligencia Artificial. La herramienta SaaS definitiva para marketing gastronómico sin agencias.",
  keywords: ["Software para restaurantes","Menú Digital","Generador de menú","Banners para Restaurantes","Editor de Imágenes IA","Diseño para Comida","SaaS Gastronómico"],
  authors: [{ name: "DigitalBite Team", url: "https://digitalbite.app" }],
  creator: "DigitalBite AI",
  publisher: "DigitalBite",
  robots: "index, follow",
  alternates: { canonical: "https://digitalbite.app" },
  openGraph: {
    type: "website", locale: "es_CL", url: "https://digitalbite.app",
    title: "DigitalBite - Diseño Gastronómico con IA",
    description: "Crea banners, menús y videos para tu restaurante en segundos con Inteligencia Artificial.",
    siteName: "DigitalBite",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "DigitalBite AI Design" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DigitalBite | Diseño Gastronómico IA sin límites",
    description: "Sitios Web, Apps y Automatizaciones impulsadas por IA en Chile.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#02060f",
  width: "device-width",
  initialScale: 1,
};

import MainWrapper from "../components/MainWrapper";
import AnalyticsProvider from "../components/AnalyticsProvider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`scroll-smooth ${spaceGrotesk.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context":"https://schema.org","@type":"SoftwareApplication",
          "name":"DigitalBite",
          "applicationCategory": "DesignApplication",
          "operatingSystem": "All",
          "image":"https://digitalbite.app/logo.png",
          "description": "Plataforma de inteligencia artificial para diseño gastronómico y creación de menús para restaurantes.",
          "@id":"https://digitalbite.app","url":"https://digitalbite.app",
        })}} />
      </head>
      <body className="antialiased min-h-screen flex flex-col" style={{ background: '#0E0D0B', color: '#F0EDE6' }}>
        <Navbar />
        <AnalyticsProvider>
          <MainWrapper>
            {children}
          </MainWrapper>
        </AnalyticsProvider>
        <AlertModal />
        <Footer />
      </body>
    </html>
  );
}