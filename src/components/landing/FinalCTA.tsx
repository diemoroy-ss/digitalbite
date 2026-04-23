"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import bg from "../../assets/cta-bg.jpg";

export default function FinalCTA() {
  return (
    <section className="relative py-32 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 h-full w-full opacity-30">
        <Image
          src={bg}
          alt=""
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
      <div className="absolute inset-0 bg-amber-radial opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-4xl px-6 lg:px-10 text-center"
      >
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-6">
          Tu próxima publicación, en 8 segundos
        </p>
        <h2 className="font-display text-5xl sm:text-6xl lg:text-8xl font-medium leading-[0.95] text-balance text-white">
          Empieza con{" "}
          <span className="italic text-primary">5 diseños</span>{" "}
          <span className="text-shimmer">gratis.</span>
        </h2>
        <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Sin tarjeta. Sin instalación. Sin diseñador. Solo tu marca, lista para
          brillar en redes esta misma noche.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-lime-400 px-9 py-5 text-lg font-semibold text-slate-900 hover:scale-[1.04] transition-all glow-lime"
          >
            Crear mi primer diseño
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Sin tarjeta
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Acceso inmediato
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Cancela cuando quieras
          </span>
        </div>
      </motion.div>
    </section>
  );
}
