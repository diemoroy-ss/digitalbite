"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

import heroBurger from "../../assets/hero-burger.jpg";
import afterCoffee from "../../assets/after-coffee.jpg";
import afterDessert from "../../assets/after-dessert.jpg";
import galleryCocktail from "../../assets/gallery-cocktail.jpg";

const slides = [heroBurger, afterCoffee, afterDessert, galleryCocktail];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="relative min-h-screen pt-28 lg:pt-32 pb-16 overflow-hidden grain bg-hero-radial">
      {/* ambient amber glow */}
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[700px] w-[700px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left: copy */}
        <div className="lg:col-span-7 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-4 py-1.5 text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
            Hecho para restaurantes, cafés y bares
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[0.95] text-balance text-white"
          >
            Tu menú,{" "}
            <span className="italic text-primary">con look</span>
            <br className="hidden sm:block" /> de agencia.{" "}
            <span className="text-shimmer">En segundos.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Sube una foto de tu plato y obtén stories, posts y menús digitales con
            calidad de agencia creativa. Sin diseñador, sin fotógrafo, sin
            esperas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center"
          >
            <a
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 text-base font-semibold text-lime-foreground hover:scale-[1.03] transition-all glow-lime"
            >
              Ver mis 5 diseños gratis
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#galeria"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 backdrop-blur px-6 py-4 text-base font-medium text-foreground hover:bg-surface transition-colors"
            >
              Ver galería
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Sin tarjeta · Acceso inmediato · 5 diseños gratis
          </motion.p>

          {/* Social proof badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex items-center gap-3 justify-center lg:justify-start"
          >
            <div className="flex -space-x-2">
              {["#E8B86B", "#D4A574", "#B58456", "#8C6239"].map((c, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full ring-2 ring-background flex items-center justify-center text-xs font-semibold text-background"
                  style={{ backgroundColor: c }}
                >
                  {["JM", "AS", "RC", "+50"][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-primary text-sm">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">+50 restaurantes ya se sumaron</p>
            </div>
          </motion.div>
        </div>

        {/* Right: phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="lg:col-span-5 relative flex justify-center"
        >
          {/* glow */}
          <div className="absolute inset-0 bg-amber-radial blur-2xl opacity-80" />

          <div className="relative animate-float">
            {/* phone frame */}
            <div className="relative h-[560px] w-[280px] sm:h-[640px] sm:w-[320px] rounded-[3rem] bg-gradient-to-b from-neutral-800 to-neutral-950 p-3 shadow-elevated"
              style={{ boxShadow: "var(--shadow-elevated), var(--shadow-glow)" }}>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-24 rounded-b-2xl bg-black z-10" />
              <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-black">
                {slides.map((src, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 h-full w-full"
                    initial={false}
                    animate={{
                      opacity: i === idx ? 1 : 0,
                      scale: i === idx ? 1 : 1.1,
                    }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  >
                    <Image
                      src={src}
                      alt={`Diseño gastronómico premium generado con Inteligencia Artificial - Ejemplo ${i + 1}`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                ))}
                {/* overlay UI */}
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/70 to-transparent">
                  <p className="text-[10px] uppercase tracking-widest text-primary">Hoy en carta</p>
                  <p className="font-display text-xl text-cream mt-1">Smash burger artesanal</p>
                  <p className="text-xs text-neutral-400 mt-1">Cheddar añejo · cebolla caramelizada</p>
                </div>
                {/* slide indicators */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {slides.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === idx ? "w-6 bg-primary" : "w-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* floating chip */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -left-8 top-20 hidden sm:flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-3 py-2 shadow-elevated"
            >
              <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
              <span className="text-xs text-white-80">+312% interacciones</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -right-6 bottom-32 hidden sm:flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-3 py-2 shadow-elevated"
            >
              <span className="text-primary">✨</span>
              <span className="text-xs text-white-80">Listo en 8 seg</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
