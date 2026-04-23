"use client";
import { motion } from "framer-motion";

const stats = [
  { value: "3×", label: "más interacciones en redes", sub: "promedio en 30 días" },
  { value: "15 min", label: "a la semana", sub: "vs. 6 horas con diseñador" },
  { value: "$0", label: "en fotógrafo o agencia", sub: "ahorro promedio: $400/mes" },
];

export default function Stats() {
  return (
    <section className="relative py-20 lg:py-28 border-y border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-3 gap-10 lg:gap-16">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="text-center md:text-left"
          >
            <div className="font-display text-7xl lg:text-8xl font-medium text-primary leading-none">
              {s.value}
            </div>
            <p className="mt-3 text-lg font-medium text-white">{s.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
