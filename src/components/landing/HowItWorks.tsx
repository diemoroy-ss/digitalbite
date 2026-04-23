"use client";
import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Subes tu foto",
    desc: "Una foto cualquiera desde el celular. No importa la luz ni el ángulo.",
    icon: "📸",
  },
  {
    n: "02",
    title: "La IA aplica tu marca",
    desc: "Logo, colores, tipografía y estilo cinemático. Todo automático en segundos.",
    icon: "✨",
  },
  {
    n: "03",
    title: "Publicas y vendes",
    desc: "Story, post, menú digital o pantalla TV. Listo para descargar y compartir.",
    icon: "🚀",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-amber-radial opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Cómo funciona</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-balance text-white">
            Tres pasos. <span className="italic text-primary">Cero diseñador.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative rounded-3xl border border-border bg-surface/60 backdrop-blur p-8 hover:border-primary/40 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/30 transition-colors" />
              <div className="relative">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-6xl text-primary/30 font-light">{s.n}</span>
                  <span className="text-3xl">{s.icon}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-medium text-white">{s.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 text-primary/40 text-2xl">→</div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-4 text-base font-semibold text-slate-900 hover:scale-[1.03] transition-all glow-lime"
          >
            Probar el editor gratis
            <span>→</span>
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Sin tarjeta · Acceso inmediato · 5 diseños gratis
          </p>
        </div>
      </div>
    </section>
  );
}
