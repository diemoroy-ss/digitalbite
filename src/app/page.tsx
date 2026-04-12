import Link from 'next/link';
import Testimonials from '../components/Testimonials';
import { HeroCarouselClient, DesignGalleryClient } from '../components/LandingClientWrappers';

// Hardcoded urgency config — update manually each month
const CUPOS_RESTANTES = 3;
const CUPOS_TOTALES = 10;
const CUPOS_TOMADOS = CUPOS_TOTALES - CUPOS_RESTANTES;
const CUPOS_PCT = Math.round((CUPOS_TOMADOS / CUPOS_TOTALES) * 100);
const FECHA_OFERTA = "30 de abril";
const WA_LINK = "https://wa.me/56900000000?text=Hola%2C%20quiero%20reservar%20mi%20cupo%20gratuito%20de%20consultor%C3%ADa%20DigitalBite";

export default function FunnelPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 font-sans selection:bg-rose-200 selection:text-rose-900 pb-20 overflow-x-hidden">

      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: `radial-gradient(#f43f5e 2px, transparent 2px)`, backgroundSize: '32px 32px' }} />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-gradient-to-br from-rose-50/50 via-transparent to-orange-50/50" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo-digitalbite.png"
              alt="DigitalBite Logo"
              className="h-16 w-auto object-contain block"
              style={{ minWidth: '60px' }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
            <a href="#galeria" className="hover:text-rose-600 transition-colors">Galería</a>
            <a href="#beneficios" className="hover:text-rose-600 transition-colors">Beneficios</a>
            <a href="#comparativa" className="hover:text-rose-600 transition-colors">Tradicional vs IA</a>
            <a href="#faq" className="hover:text-rose-600 transition-colors">Preguntas Frecuentes</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block font-bold text-sm text-slate-600 hover:text-indigo-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/demo" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-md">
              Probar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="relative z-10 pt-32 max-w-[1200px] mx-auto px-6">

        {/* ═══════════════════════════════════════════════
            HERO — 2 columnas en desktop
        ═══════════════════════════════════════════════ */}
        <section className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-28 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Columna izquierda: Texto */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[12px] font-bold tracking-widest uppercase mb-6">
              <span>✨</span> El Futuro del Marketing Gastronómico
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.05]">
              Contenido para tu restaurante usando{' '}
              <span className="bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
                Inteligencia Artificial.
              </span>
            </h1>

            <p className="text-slate-500 text-lg md:text-xl max-w-xl leading-relaxed mb-5">
              Sin sesiones de fotos costosas ni esperas largas. Calidad de agencia al instante para multiplicar tus ventas.
            </p>

            {/* Prueba social */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
              <div className="flex -space-x-2">
                {["🍔","🍕","🥗","☕"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-rose-100 border-2 border-white text-sm flex items-center justify-center shadow-sm">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-sm font-semibold">
                <span className="font-black text-slate-800">+50 restaurantes</span> ya crean contenido con DigitalBite
              </p>
            </div>

            {/* CTA único */}
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/25 hover:-translate-y-1 transition-all"
            >
              Ver mis diseños gratis →
            </Link>
            <p className="text-slate-400 text-xs mt-3">Sin tarjeta de crédito · Acceso inmediato</p>
          </div>

          {/* Columna derecha: Carrusel */}
          <div className="flex items-center justify-center">
            <HeroCarouselClient />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            COMPARATIVA
        ═══════════════════════════════════════════════ */}
        <section id="comparativa" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Analizamos tu Situación y te Damos un Plan Claro
            </h2>
            <p className="text-slate-500">¿Por qué seguir perdiendo tiempo y dinero en métodos antiguos?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Problema */}
            <div className="bg-slate-100 border border-slate-200 p-8 rounded-[32px]">
              <h3 className="text-2xl font-black text-slate-500 mb-6 flex items-center gap-3">
                <span className="text-3xl">📷</span> Sesión Tradicional
              </h3>
              <ul className="space-y-4">
                {['Alto costo (Fotógrafo, luces, chef)', 'Desperdicio de comida durante las tomas', 'Limitado al set físico y a unas pocas variaciones', 'Riesgo de cambios de personal', 'Entrega en 5-10 días hábiles'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                    <span className="text-red-400 font-black mt-0.5">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solucion */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-8 rounded-[32px] shadow-lg shadow-indigo-100">
              <h3 className="text-2xl font-black text-indigo-700 mb-6 flex items-center gap-3">
                <span className="text-3xl">🚀</span> Sistema con IA
              </h3>
              <ul className="space-y-4">
                {['Costo optimizado y accesible', 'Cero desperdicio de alimentos', 'Creatividad ilimitada (fondos, ángulos, estilos)', 'Identidad 100% tuya (Logo y Colores)', 'Entrega inmediata en segundos'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-800 font-bold">
                    <span className="text-indigo-500 font-black mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            GALERÍA DE DISEÑOS REALES
        ═══════════════════════════════════════════════ */}
        <div id="galeria">
          <DesignGalleryClient />
        </div>

        {/* ═══════════════════════════════════════════════
            BENEFICIOS
        ═══════════════════════════════════════════════ */}
        <section id="beneficios" className="mb-32 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 text-balance">
            Te damos las plantillas. <br className="hidden md:block" />
            <span className="text-rose-500">Tú las adaptas, editas y publicas.</span>
          </h2>
          <p className="text-slate-500 text-lg mb-12">Una herramienta hecha por y para gastronómicos.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center text-2xl mb-4">🎨</div>
              <h4 className="font-black text-slate-800 text-lg mb-2">Biblioteca Premium</h4>
              <p className="text-slate-500 text-sm">Cientos de plantillas listas para Story, Menús y Feed.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4">⚡</div>
              <h4 className="font-black text-slate-800 text-lg mb-2">Editor Intuitivo</h4>
              <p className="text-slate-500 text-sm">Cambia textos y precios al menú en segundos. Guía básica incluida.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4">🔄</div>
              <h4 className="font-black text-slate-800 text-lg mb-2">Actualizaciones</h4>
              <p className="text-slate-500 text-sm">Nuevos diseños y componentes agregados todos los meses.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-4">🤝</div>
              <h4 className="font-black text-slate-800 text-lg mb-2">Soporte Continuo</h4>
              <p className="text-slate-500 text-sm">Comunidad en WhatsApp y atención prioritaria garantizada.</p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            TESTIMONIOS
        ═══════════════════════════════════════════════ */}
        <Testimonials />

        {/* ═══════════════════════════════════════════════
            CTA CONSULTORÍA — con urgencia
        ═══════════════════════════════════════════════ */}
        <section className="mb-32">
          <div className="bg-slate-900 text-white rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">

            {/* Texto + urgencia */}
            <div className="flex-1 text-center md:text-left">
              {/* Badge oferta */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-black tracking-widest uppercase mb-4 border border-emerald-500/30">
                🟢 Oferta de lanzamiento
              </div>

              <h3 className="text-3xl md:text-4xl font-black mb-4">
                Consultoría sin costo.<br />
                <span className="text-indigo-400">A cambio: tu caso de éxito</span>
              </h3>

              {/* Cupos */}
              <div className="mb-5">
                <p className="text-white font-black text-lg mb-2">
                  Quedan <span className="text-rose-400">{CUPOS_RESTANTES}</span> de {CUPOS_TOTALES} cupos este mes
                </p>
                {/* Barra de progreso */}
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden w-full max-w-xs mx-auto md:mx-0">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all"
                    style={{ width: `${CUPOS_PCT}%` }}
                  />
                </div>
                <p className="text-slate-400 text-xs mt-1.5">{CUPOS_TOMADOS} cupos tomados de {CUPOS_TOTALES}</p>
              </div>

              {/* Fecha */}
              <p className="text-slate-400 text-sm mb-6 flex items-center justify-center md:justify-start gap-1.5">
                ⏰ Oferta válida hasta el {FECHA_OFERTA}
              </p>

              <p className="text-slate-400 text-base mb-8 max-w-lg">
                Auditoría completa de tu marca gastronómica, análisis de oportunidades y un paquete inicial de diseños impulsados por IA para ti.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 inline-block text-center shadow-lg shadow-indigo-500/30 text-base"
                >
                  Reservar mi cupo gratis ahora
                </a>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-xl transition-all inline-block text-center border border-white/20 text-sm"
                >
                  💬 Hablar con un Asesor
                </a>
              </div>

              <p className="text-slate-500 text-xs mt-3">
                Sin tarjeta de crédito · Sin compromiso · Respuesta en menos de 24h
              </p>
            </div>

            {/* Checklist */}
            <div className="flex-1 bg-slate-800/50 p-6 rounded-[32px] border border-slate-700 w-full overflow-hidden relative">
              <ul className="space-y-4">
                <li className="flex gap-3"><span className="text-rose-400">✓</span> 10 plantillas pre-configuradas</li>
                <li className="flex gap-3"><span className="text-rose-400">✓</span> Diseño optimizado a tu paleta</li>
                <li className="flex gap-3"><span className="text-rose-400">✓</span> Auditoría completa de tu menú wall digital</li>
                <li className="flex gap-3"><span className="text-rose-400">✓</span> Identificamos dónde la IA es más útil</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            FAQS
        ═══════════════════════════════════════════════ */}
        <section id="faq" className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Total Transparencia Digital</h2>
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-800 text-lg mb-2">🤖 ¿Por qué utilizamos IA?</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Utilizamos tecnología de IA generativa para crear contenido visual premium. Te permite tener contenido de calidad de agencia sin los costos altísimos ($2,000-5,000/mes) ni las complicaciones logísticas de sesiones fotográficas tradicionales.
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-800 text-lg mb-2">⏱️ ¿Cuáles son los tiempos de entrega si pido diseños custom?</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                <strong>Plantillas públicas:</strong> Acceso inmediato con el uso de la aplicación.<br />
                <strong>Diseños Exclusivos:</strong> 1-3 días hábiles desde la reunión inicial si eres un Kitchen Partner.
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-800 text-lg mb-2">🎨 ¿El contenido es 100% personalizado a mi marca?</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Completamente. Integramos tu logo y colores corporativos, respetamos tu estilo visual y adaptamos los formatos para Redes o Menú Walls en TVs.
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-800 text-lg mb-2">⚖️ ¿Tengo derechos sobre las imágenes y diseños generados?</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                ¡Sí! Derechos comerciales plenos. El contenido final exportado lo puedes publicar en Facebook Ads, Tu Sitio Web, TV Locales, WhatsApp. Nunca verás regalías adicionales.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Tengo otra pregunta (Realizar Vía WhatsApp)
            </a>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 mt-20 pt-10 pb-6">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo-digitalbite.png" alt="DigitalBite Logo" className="h-10 w-auto grayscale opacity-70" />
            <span className="text-slate-500 font-bold text-sm">© {new Date().getFullYear()} DigitalBite App.</span>
          </div>
          <div className="flex gap-4 text-sm font-bold text-slate-400">
            <Link href="/terms" className="hover:text-slate-600">Términos de Servicio</Link>
            <Link href="/privacy" className="hover:text-slate-600">Privacidad</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
