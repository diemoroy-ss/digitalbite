"use client";
import { useRef, useState } from "react";
import Image from "next/image";

import beforeBurger from "../../assets/before-burger.jpg";
import afterBurger from "../../assets/after-burger.jpg";
import beforeCoffee from "../../assets/before-coffee.jpg";
import afterCoffee from "../../assets/after-coffee.jpg";
import beforeDessert from "../../assets/before-dessert.jpg";
import afterDessert from "../../assets/after-dessert.jpg";

const examples = [
  { id: "burger", label: "Hamburguesa", before: beforeBurger, after: afterBurger },
  { id: "coffee", label: "Café", before: beforeCoffee, after: afterCoffee },
  { id: "dessert", label: "Postre", before: beforeDessert, after: afterDessert },
];

export default function BeforeAfter() {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <section id="beneficios" className="relative py-24 lg:py-36 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">El antes y el después</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-balance text-white">
            De foto de celular a{" "}
            <span className="italic text-primary">portada de revista.</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Arrastra el control para ver la magia. Misma foto, otra historia.
          </p>
        </div>

        {/* Selector */}
        <div className="mt-10 flex justify-center gap-2 flex-wrap">
          {examples.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => {
                setActive(i);
                setPos(50);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                active === i
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div
            ref={ref}
            className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border select-none cursor-ew-resize touch-none shadow-elevated"
            style={{ boxShadow: "var(--shadow-elevated)" }}
            onMouseDown={(e) => {
              dragging.current = true;
              updatePos(e.clientX);
            }}
            onMouseMove={(e) => dragging.current && updatePos(e.clientX)}
            onMouseUp={() => (dragging.current = false)}
            onMouseLeave={() => (dragging.current = false)}
            onTouchStart={(e) => {
              dragging.current = true;
              updatePos(e.touches[0].clientX);
            }}
            onTouchMove={(e) => updatePos(e.touches[0].clientX)}
            onTouchEnd={() => (dragging.current = false)}
          >
            <div className="absolute inset-0 h-full w-full">
               <Image
                 src={examples[active].before}
                 alt="Antes"
                 fill
                 className="object-cover"
                 draggable={false}
               />
            </div>
            
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
            >
              <div className="absolute inset-0 h-full w-full">
                <Image
                   src={examples[active].after}
                   alt="Después"
                   fill
                   className="object-cover"
                   draggable={false}
                />
              </div>
            </div>

            {/* labels */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-xs uppercase tracking-widest text-white/80">
              Antes
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 text-xs uppercase tracking-widest text-primary-foreground font-semibold">
              Con DigitalBite
            </div>

            {/* divider */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary pointer-events-none"
              style={{ left: `${pos}%`, boxShadow: "0 0 20px var(--primary)" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary-foreground">
                  <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            ← Arrastra para comparar →
          </p>
        </div>
      </div>
    </section>
  );
}
