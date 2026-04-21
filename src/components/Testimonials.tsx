// Testimonials — aligned with new dark design system

const TESTIMONIALS = [
  {
    name: "Gabriela M.",
    restaurant: "El Jardín",
    initials: "GM",
    avatarBg: "#9FE1CB",
    avatarColor: "#0a2e26",
    quote: "Pasamos de 3 horas de contenido por semana a 15 minutos. Cualquier persona del equipo puede crear un diseño profesional.",
    stars: 5,
  },
  {
    name: "Carlos R.",
    restaurant: "BurgerBox",
    initials: "CR",
    avatarBg: "#FAC775",
    avatarColor: "#3d2500",
    quote: "Nuestros posts tienen 3× más interacciones. Probé la demo el martes y el viernes ya tenía mis primeros diseños publicados.",
    stars: 5,
  },
  {
    name: "Valentina S.",
    restaurant: "Café Nómada",
    initials: "VS",
    avatarBg: "#F0997B",
    avatarColor: "#3d1200",
    quote: "Antes pagaba $150.000 por sesión. Ahora genero 20 diseños al mes. Las imágenes compiten con marcas que tienen equipos completos.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section style={{ marginBottom: '64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Lo que dicen los que ya usaron</p>
        <h2 className="h2">
          Resultados <em style={{ fontStyle: 'italic', color: '#C8F060' }}>reales</em> de negocios como el tuyo.
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="grid-3-cols">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(240,237,230,0.08)',
              borderRadius: 14,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Stars */}
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: t.stars }).map((_, si) => (
                <span key={si} style={{ color: '#C8F060', fontSize: 14 }}>★</span>
              ))}
            </div>

            {/* Quote */}
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(240,237,230,0.7)', lineHeight: 1.7, flex: 1 }}>
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '0.5px solid rgba(240,237,230,0.06)' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: t.avatarBg, color: t.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 500, flexShrink: 0,
              }}>
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
    </section>
  );
}
