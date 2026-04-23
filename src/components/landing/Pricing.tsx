"use client";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "para siempre",
    desc: "Prueba el editor con 5 diseños gratis al mes.",
    features: [
      "5 diseños mensuales",
      "Plantillas básicas",
      "Marca de agua DigitalBite",
      "Soporte por correo",
    ],
    cta: "Empezar gratis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mes",
    desc: "Para el restaurante que publica todos los días.",
    features: [
      "Diseños ilimitados",
      "Tu logo, colores y tipografía",
      "Stories, posts, menús y TV",
      "Sin marca de agua",
      "Exporta en alta resolución",
      "Soporte prioritario",
    ],
    cta: "Probar Pro 7 días gratis",
    highlight: true,
  },
  {
    name: "Cadena",
    price: "Hablemos",
    period: "",
    desc: "Para grupos con varios locales o franquicias.",
    features: [
      "Multi-marca",
      "Roles y permisos",
      "API y onboarding asistido",
      "Account manager",
    ],
    cta: "Agendar llamada",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="precios" className="relative py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-amber-radial opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Precios honestos</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-balance text-white">
            Menos que un café{" "}
            <span className="italic text-primary">por semana.</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Una agencia te cobra desde $400/mes. Un fotógrafo, $200 por sesión. Nosotros, $19.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-7 items-stretch">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col ${
                p.highlight
                  ? "bg-gradient-to-b from-surface-elevated to-surface border-2 border-primary glow-amber"
                  : "bg-surface/60 border border-border"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">
                  Recomendado
                </div>
              )}
              <h3 className="font-display text-2xl font-medium text-white">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-medium text-white">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/login"
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
                  p.highlight
                    ? "bg-lime-400 text-slate-900 hover:scale-[1.02] glow-lime"
                    : "border border-border hover:bg-surface-elevated"
                }`}
              >
                {p.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
