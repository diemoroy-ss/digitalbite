"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "¿Necesito saber diseñar?",
    a: "No. Subes una foto de tu plato y la IA hace el resto. Si quieres ajustar algo, el editor es tipo arrastrar y soltar.",
  },
  {
    q: "¿Funciona en mi país?",
    a: "Sí. Trabajamos con restaurantes en Chile, Argentina, México, España, Colombia y Perú. La interfaz está en español.",
  },
  {
    q: "¿Qué pasa con mi logo y colores?",
    a: "Subes tu logo una sola vez y eliges tu paleta. Todos los diseños futuros respetan tu identidad de marca automáticamente.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Cuando quieras, sin letras chicas. Si cancelas, mantienes acceso hasta el final del mes pagado.",
  },
  {
    q: "¿Las fotos se ven bien aunque sean del celular?",
    a: "Justamente para eso lo hicimos. La IA limpia el fondo, ajusta luz y aplica un look cinemático aunque la foto sea simple.",
  },
  {
    q: "¿Qué formatos puedo crear?",
    a: "Stories y posts de Instagram, menús digitales (PDF), pantallas para TV del local, banners para Uber/Rappi/PedidosYa y flyers para impresión.",
  },
  {
    q: "¿Necesito instalar algo?",
    a: "Nada. Funciona en el navegador desde tu computador o celular. Tus diseños quedan guardados en la nube.",
  },
  {
    q: "¿Cómo es el plan gratis?",
    a: "5 diseños cada mes, sin tarjeta de crédito. Suficiente para que pruebes y veas el resultado en tus redes antes de decidir.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 lg:py-36 overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Preguntas frecuentes</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-balance text-white">
            Lo que <span className="italic text-primary">todos preguntan.</span>
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="border border-border rounded-2xl bg-surface/40 backdrop-blur overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between text-left text-base font-medium px-6 py-5 hover:bg-white/5 transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="text-white">{f.q}</span>
                <svg
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
