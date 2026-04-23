"use client";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Antes pagaba $500 al mes a una agencia. Hoy hago todo yo en 10 minutos y se ve mejor.",
    name: "Javiera Muñoz",
    role: "Dueña, Brasa & Pan",
    city: "Santiago",
    initials: "JM",
  },
  {
    quote: "Subimos un 280% las reservas por Instagram en dos meses. Las fotos se ven de otro nivel.",
    name: "Andrés Soto",
    role: "Chef, Sakura Sushi",
    city: "Viña del Mar",
    initials: "AS",
  },
  {
    quote: "Lo más fácil que he usado. Le tomé una foto al café y salí con tres stories listas.",
    name: "Rocío Cárdenas",
    role: "Barista, Origen Café",
    city: "Concepción",
    initials: "RC",
  },
];

const logos = [
  "Brasa & Pan",
  "Sakura",
  "Origen Café",
  "Cantina 21",
  "Pizzería Bottega",
  "Bar Lumen",
  "Dolce",
  "Frutta",
];

export default function Testimonials() {
  return (
    <section className="relative py-24 lg:py-36 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Lo dicen ellos</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-balance text-white">
            Restaurantes que ya{" "}
            <span className="italic text-primary">no contratan agencia.</span>
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative rounded-3xl border border-border bg-surface/60 backdrop-blur p-8 hover:border-primary/30 transition-colors"
            >
              <div className="text-primary text-5xl font-display leading-none">"</div>
              <blockquote className="mt-2 text-lg leading-relaxed text-foreground/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-6 border-t border-border">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-amber-glow flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {t.initials}
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.city}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {/* Marquee logos */}
        <div className="mt-20 relative overflow-hidden border-y border-border py-8">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...logos, ...logos].map((l, i) => (
              <span key={i} className="font-display text-2xl text-muted-foreground/60 italic">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
