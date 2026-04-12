// Testimonials — Hardcoded placeholders (replace content as needed)

const TESTIMONIALS = [
  {
    name: "Gabriela M.",
    restaurant: "Restaurante El Jardín",
    avatar: "🍃",
    headline: "Redujimos el tiempo de crear contenido de 3 horas a 15 minutos por semana.",
    text: "Antes perdíamos horas coordinando fotos, filtros y publicaciones. Con DigitalBite, cualquier miembro del equipo puede generar un diseño profesional en minutos. La diferencia en el feed de Instagram fue inmediata.",
    stars: 5,
  },
  {
    name: "Carlos R.",
    restaurant: "BurgerBox",
    avatar: "🍔",
    headline: "Nuestros posts tienen 3x más interacciones desde que usamos DigitalBite.",
    text: "Probé la demo un martes. El viernes ya tenía mis primeros diseños publicados. El nivel visual compite perfectamente con marcas que tienen equipos de diseño completos. No puedo creer que sea tan fácil.",
    stars: 5,
  },
  {
    name: "Valentina S.",
    restaurant: "Café Nómada",
    avatar: "☕",
    headline: "Antes pagaba $150.000 por sesión fotográfica. Ahora genero 20 diseños al mes.",
    text: "DigitalBite cambió completamente la forma en que presentamos nuestro menú. Las imágenes se ven profesionales, las puedo actualizar con cada cambio de precio y el costo es una fracción de lo que pagábamos antes.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="mb-32">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold tracking-widest uppercase mb-5">
          ⭐ Casos de Éxito
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
          Lo que dicen los restaurantes<br className="hidden md:block" /> que ya usan DigitalBite
        </h2>
        <p className="text-slate-500 text-lg max-w-lg mx-auto">
          Resultados reales de negocios gastronómicos como el tuyo.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="bg-white rounded-[28px] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-5">
              {Array.from({ length: t.stars }).map((_, si) => (
                <span key={si} className="text-amber-400 text-lg">★</span>
              ))}
            </div>

            {/* Headline bold */}
            <p className="font-black text-slate-900 text-lg leading-snug mb-4">
              &ldquo;{t.headline}&rdquo;
            </p>

            {/* Body */}
            <p className="text-slate-500 text-sm leading-relaxed flex-1">
              {t.text}
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-rose-100 border-2 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">{t.name}</p>
                <p className="text-slate-400 text-xs font-medium">{t.restaurant}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
