import Link from 'next/link';
import React from 'react';
import { HeroCarouselClient, LandingTemplateGalleryClient } from '../components/LandingClientWrappers';



// ─── Config ─────────────────────────────────────────────────────────────────
const CUPOS_TOMADOS = 7;
const CUPOS_TOTALES = 10;
const CUPOS_PCT     = Math.round((CUPOS_TOMADOS / CUPOS_TOTALES) * 100);
const FECHA_OFERTA  = "30 de abril";
const WA_LINK = "https://wa.me/56900000000?text=Hola%2C%20quiero%20reservar%20mi%20cupo%20gratuito%20de%20consultor%C3%ADa%20DigitalBite";

// ─── Sub-components ─────────────────────────────────────────────────────────

function StarRow() {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: '#C8F060', fontSize: 14 }}>★</span>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow" style={{ marginBottom: 16 }}>{children}</p>
  );
}


// ─── Page ────────────────────────────────────────────────────────────────────
export default function FunnelPage() {
  return (
    <div style={{ background: '#0E0D0B', color: '#F0EDE6', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════
          SECCIÓN 1 — NAVEGACIÓN
      ══════════════════════════════════════ */}
      <nav className="landing-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 20, color: '#F0EDE6', letterSpacing: '-0.02em' }}>
              Digital<span style={{ color: '#C8F060' }}>Bite</span>
            </span>
          </Link>

          {/* Links centro */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 32 }}>
            {[['#galeria', 'Galería'], ['#beneficios', 'Beneficios'], ['#precios', 'Precios'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link href="/demo" className="btn-primary btn-primary-sm" style={{ textDecoration: 'none' }}>
            Probar gratis
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          SECCIÓN 2 — HERO
      ══════════════════════════════════════ */}
      <section style={{ paddingTop: 104, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="hero-grid">

            {/* ── Columna izquierda ── */}
            <div style={{ paddingRight: 48 }} className="hero-left">

              {/* Badge pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(200,240,96,0.1)', border: '0.5px solid rgba(200,240,96,0.28)',
                borderRadius: 100, padding: '6px 14px', marginBottom: 24
              }}>
                <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8F060', display: 'inline-block' }} />
                <span style={{ color: '#C8F060', fontSize: 12, fontWeight: 500 }}>+50 restaurantes ya confían en nosotros</span>
              </div>

              {/* H1 */}
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 52, lineHeight: 1.08, fontWeight: 600, letterSpacing: '-0.025em', color: '#F0EDE6', marginBottom: 20, maxWidth: 520 }}>
                Tu menú, con look de{' '}
                <em style={{ fontStyle: 'italic', color: '#C8F060' }}>agencia</em>.{' '}
                En segundos.
              </h1>

              {/* Subtítulo */}
              <p style={{ color: 'rgba(240,237,230,0.5)', fontSize: 14, lineHeight: 1.7, maxWidth: 440, marginBottom: 32 }}>
                Sin fotógrafo, sin esperas, sin presupuesto de agencia. Sube tu plato y generamos diseños que venden — listos para Instagram, tu menú digital o pantallas en el local.
              </p>

              {/* CTA */}
              <Link href="/demo" className="btn-primary" style={{ textDecoration: 'none', marginBottom: 12, display: 'inline-flex' }}>
                Ver mis diseños gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>

              <p style={{ color: 'rgba(240,237,230,0.38)', fontSize: 12, marginBottom: 32 }}>
                Sin tarjeta de crédito · Acceso inmediato · Responde en minutos
              </p>

              {/* Trust row */}
              <div style={{ paddingTop: 24, borderTop: '0.5px solid rgba(240,237,230,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex' }}>
                  {[
                    { initials: 'GM', bg: '#9FE1CB', color: '#0a2e26' },
                    { initials: 'CR', bg: '#FAC775', color: '#3d2500' },
                    { initials: 'VS', bg: '#F0997B', color: '#3d1200' },
                    { initials: '+48', bg: 'rgba(240,237,230,0.1)', color: 'rgba(240,237,230,0.6)' },
                  ].map((av, i) => (
                    <div key={i} className="avatar-initial" style={{
                      background: av.bg, color: av.color,
                      marginLeft: i === 0 ? 0 : -8,
                    }}>
                      {av.initials}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.5)', lineHeight: 1.4 }}>
                  Gabriela, Carlos y 48 dueños más<br />
                  <span style={{ color: 'rgba(240,237,230,0.3)' }}>crean contenido esta semana con DigitalBite</span>
                </p>
              </div>
            </div>

            {/* Divider vertical */}
            <div style={{ background: 'rgba(240,237,230,0.07)', alignSelf: 'stretch', minHeight: 480 }} className="hero-divider" />

            {/* ── Columna derecha — Carousel real del producto ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

              {/* Label sobre el carousel */}
              <div style={{ alignSelf: 'flex-start' }}>
                <Eyebrow>Resultados reales del editor</Eyebrow>
              </div>

              {/* Carousel envuelto en marco de diseño oscuro */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(240,237,230,0.08)',
                borderRadius: 20,
                padding: 20,
                width: '100%',
              }}>
                <HeroCarouselClient />
              </div>

              {/* 3 Stat chips debajo del carousel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
                {[
                  { num: '3×', label: 'más interacciones' },
                  { num: '15 min', label: 'contenido/semana' },
                  { num: '$0', label: 'en fotógrafo' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(240,237,230,0.06)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#C8F060', lineHeight: 1.1 }}>{s.num}</div>
                    <div style={{ fontSize: 10, color: 'rgba(240,237,230,0.35)', lineHeight: 1.4, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* AI chip */}
              <div style={{
                background: 'rgba(200,240,96,0.06)', border: '0.5px solid rgba(200,240,96,0.16)',
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%'
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(200,240,96,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8F060" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.6)', lineHeight: 1.6 }}>
                  <span style={{ color: '#C8F060', fontWeight: 500 }}>IA que entiende gastronomía</span> — aplica tu logo, paleta y estilo automáticamente en cada diseño.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════
          SECCIÓN 4 — GALERÍA (plantillas reales)
      ══════════════════════════════════════ */}
      <section id="galeria" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Eyebrow>Galería de plantillas</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <h2 className="h2" style={{ maxWidth: 420 }}>
              Esto es lo que vas a{' '}
              <em style={{ fontStyle: 'italic', color: '#C8F060' }}>publicar</em>.
            </h2>
            <Link href="/demo" className="btn-primary btn-primary-sm" style={{ textDecoration: 'none' }}>
              Ver todas las plantillas
            </Link>
          </div>
          <p style={{ color: 'rgba(240,237,230,0.5)', fontSize: 14, marginBottom: 32, maxWidth: 520 }}>
            Plantillas reales cargadas del editor. Cada diseño incluye tu logo, precios y colores.
          </p>

          {/* Galería real de Firebase */}
          <LandingTemplateGalleryClient />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 4b — BENEFICIOS (4 tarjetas)
      ══════════════════════════════════════ */}
      <section style={{ padding: '64px 0', borderTop: '0.5px solid rgba(240,237,230,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="h2" style={{ marginBottom: 12 }}>
              Te damos las plantillas.{' '}
              <em style={{ fontStyle: 'italic', color: '#C8F060' }}>Tú las publicas.</em>
            </h2>
            <p style={{ color: 'rgba(240,237,230,0.45)', fontSize: 14 }}>Una herramienta hecha por y para gastronómicos.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="grid-benefits">
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8F060" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
                title: 'Biblioteca Premium',
                desc: 'Cientos de plantillas listas para Story, Menús y Feed.',
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8F060" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                title: 'Editor Intuitivo',
                desc: 'Cambia textos y precios al menú en segundos. Guía básica incluida.',
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8F060" strokeWidth="1.5"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/></svg>,
                title: 'Actualizaciones',
                desc: 'Nuevos diseños y componentes agregados todos los meses.',
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8F060" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
                title: 'Soporte Continuo',
                desc: 'Comunidad en WhatsApp y atención prioritaria garantizada.',
              },
            ].map((b, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(240,237,230,0.08)',
                borderRadius: 14,
                padding: 24,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={undefined}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(200,240,96,0.08)', border: '0.5px solid rgba(200,240,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {b.icon}
                </div>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#F0EDE6', marginBottom: 8 }}>{b.title}</h4>
                <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.4)', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 5 — COMPARATIVA
      ══════════════════════════════════════ */}
      <section id="beneficios" style={{ padding: '80px 0', borderTop: '0.5px solid rgba(240,237,230,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Eyebrow>Por qué cambiarse</Eyebrow>
          <h2 className="h2" style={{ marginBottom: 40, maxWidth: 500 }}>
            El método antiguo te está{' '}
            <em style={{ fontStyle: 'italic', color: '#C8F060' }}>costando</em> de más.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-2-cols">

            {/* Sesión tradicional */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(240,237,230,0.08)', borderRadius: 14, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(240,237,230,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,237,230,0.3)" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <span style={{ color: 'rgba(240,237,230,0.6)', fontSize: 15, fontWeight: 500 }}>Sesión tradicional</span>
                <span style={{ marginLeft: 'auto', background: 'rgba(240,237,230,0.06)', border: '0.5px solid rgba(240,237,230,0.1)', borderRadius: 100, padding: '2px 10px', fontSize: 11, color: 'rgba(240,237,230,0.35)', fontWeight: 500 }}>Método antiguo</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Alto costo', 'Desperdicio de comida', 'Entrega 5-10 días', 'Variaciones limitadas', 'Dependencia de terceros'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(240,237,230,0.5)' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(240,237,230,0.06)', border: '0.5px solid rgba(240,237,230,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(240,80,80,0.7)', fontSize: 11 }}>✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sistema DigitalBite */}
            <div style={{ background: 'rgba(200,240,96,0.04)', border: '0.5px solid rgba(200,240,96,0.35)', borderRadius: 14, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(200,240,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8F060" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <span style={{ color: '#F0EDE6', fontSize: 15, fontWeight: 500 }}>Sistema con DigitalBite</span>
                <span style={{ marginLeft: 'auto', background: 'rgba(200,240,96,0.12)', border: '0.5px solid rgba(200,240,96,0.3)', borderRadius: 100, padding: '2px 10px', fontSize: 11, color: '#C8F060', fontWeight: 500 }}>Recomendado</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Costo accesible', 'Cero desperdicio', 'Listo en segundos', 'Estilos ilimitados', 'Tu marca siempre aplicada'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(240,237,230,0.8)' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(200,240,96,0.1)', border: '0.5px solid rgba(200,240,96,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#C8F060', fontSize: 11 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 6 — TESTIMONIOS
      ══════════════════════════════════════ */}
      <section style={{ padding: '80px 0', borderTop: '0.5px solid rgba(240,237,230,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Eyebrow>Lo que dicen los que ya usaron</Eyebrow>
          <h2 className="h2" style={{ marginBottom: 40, maxWidth: 460 }}>
            Resultados <em style={{ fontStyle: 'italic', color: '#C8F060' }}>reales</em> de negocios como el tuyo.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="grid-3-cols">
            {[
              {
                name: 'Gabriela M.', restaurant: 'El Jardín',
                initials: 'GM', avatarBg: '#9FE1CB', avatarColor: '#0a2e26',
                quote: 'Pasamos de 3 horas de contenido por semana a 15 minutos. Cualquier persona del equipo puede crear un diseño profesional.'
              },
              {
                name: 'Carlos R.', restaurant: 'BurgerBox',
                initials: 'CR', avatarBg: '#FAC775', avatarColor: '#3d2500',
                quote: 'Nuestros posts tienen 3× más interacciones. Probé la demo el martes y el viernes ya tenía mis primeros diseños publicados.'
              },
              {
                name: 'Valentina S.', restaurant: 'Café Nómada',
                initials: 'VS', avatarBg: '#F0997B', avatarColor: '#3d1200',
                quote: 'Antes pagaba $150.000 por sesión. Ahora genero 20 diseños al mes. Las imágenes compiten con marcas que tienen equipos completos.'
              },
            ].map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(240,237,230,0.08)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <StarRow />
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(240,237,230,0.7)', lineHeight: 1.7, flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: '0.5px solid rgba(240,237,230,0.06)' }}>
                  <div className="avatar-initial" style={{ background: t.avatarBg, color: t.avatarColor, width: 36, height: 36 }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#F0EDE6' }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)' }}>{t.restaurant}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 7 — CTA CONVERSIÓN
      ══════════════════════════════════════ */}
      <section id="precios" style={{ padding: '80px 0', borderTop: '0.5px solid rgba(240,237,230,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="grid-2-cols">

            {/* Izquierda */}
            <div>
              <Eyebrow>Oferta de lanzamiento</Eyebrow>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 24, maxWidth: 380 }}>
                Consultoría{' '}
                <em style={{ fontStyle: 'italic', color: '#C8F060' }}>sin costo</em>. A cambio: tu caso de éxito.
              </h2>

              {/* Progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div className="progress-bar-track" style={{ marginBottom: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${CUPOS_PCT}%` }} />
                </div>
                <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)' }}>
                  {CUPOS_TOMADOS} de {CUPOS_TOTALES} cupos tomados este mes · Oferta válida hasta el {FECHA_OFERTA}
                </p>
              </div>

              {/* 2x2 chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  '10 plantillas pre-configuradas',
                  'Auditoría completa menú digital',
                  'Diseño aplicado a tu paleta y logo',
                  'Identificamos dónde la IA ayuda más',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'rgba(240,237,230,0.7)' }}>
                    <span style={{ color: '#C8F060', marginTop: 1, flexShrink: 0 }}>·</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Derecha — tarjeta de acción */}
            <div className="card-accent" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#F0EDE6', marginBottom: 8 }}>
                  Reserva tu cupo gratuito ahora
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.5)', lineHeight: 1.6 }}>
                  Sin tarjeta de crédito. Sin compromiso. Respuesta en menos de 24 horas.
                </p>
              </div>

              {/* Botón WhatsApp */}
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Reservar por WhatsApp
              </a>

              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ textDecoration: 'none' }}>
                Hablar con un asesor
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 8 — FAQ
      ══════════════════════════════════════ */}
      <section id="faq" style={{ padding: '80px 0', borderTop: '0.5px solid rgba(240,237,230,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <h2 className="h2" style={{ marginBottom: 40 }}>
            Todo lo que necesitas{' '}
            <em style={{ fontStyle: 'italic', color: '#C8F060' }}>saber</em>.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="grid-2-cols">
            {[
              {
                q: '¿Por qué utilizamos IA?',
                a: 'Utilizamos IA generativa para crear contenido visual premium. Te permite tener calidad de agencia sin los costos altísimos ($2.000–5.000/mes) ni las complicaciones logísticas de sesiones fotográficas tradicionales.'
              },
              {
                q: '¿Cuáles son los tiempos de entrega si pido diseños custom?',
                a: 'Plantillas públicas: acceso inmediato con la aplicación. Diseños exclusivos: 1-3 días hábiles desde la reunión inicial si eres Kitchen Partner.'
              },
              {
                q: '¿El contenido es 100% personalizado a mi marca?',
                a: 'Completamente. Integramos tu logo y colores corporativos, respetamos tu estilo visual y adaptamos los formatos para redes sociales o Menú Walls en TVs.'
              },
              {
                q: '¿Tengo derechos sobre las imágenes y diseños generados?',
                a: '¡Sí! Derechos comerciales plenos. El contenido final exportado lo puedes publicar en Facebook Ads, tu sitio web, TV locales y WhatsApp. Nunca verás regalías adicionales.'
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(240,237,230,0.09)', borderRadius: 12, padding: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F0EDE6', marginBottom: 10 }}>{item.q}</p>
                <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.45)', lineHeight: 1.7 }}>{item.a}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Tengo otra pregunta — escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ borderTop: '0.5px solid rgba(240,237,230,0.08)', padding: '28px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Logo */}
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 18, color: '#F0EDE6', letterSpacing: '-0.02em' }}>
            Digital<span style={{ color: '#C8F060' }}>Bite</span>
          </span>

          {/* Links */}
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/terms" className="footer-link">Términos</Link>
            <Link href="/privacy" className="footer-link">Privacidad</Link>
          </div>

          {/* Copyright */}
          <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.28)' }}>
            © {new Date().getFullYear()} DigitalBite App.
          </span>
        </div>
      </footer>

    </div>
  );
}
