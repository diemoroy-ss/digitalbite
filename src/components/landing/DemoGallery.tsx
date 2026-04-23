"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import pizza from "../../assets/gallery-pizza.jpg";
import cocktail from "../../assets/gallery-cocktail.jpg";
import sushi from "../../assets/gallery-sushi.jpg";
import tacos from "../../assets/gallery-tacos.jpg";
import ramen from "../../assets/gallery-ramen.jpg";
import icecream from "../../assets/gallery-icecream.jpg";
import burger from "../../assets/after-burger.jpg";
import coffee from "../../assets/after-coffee.jpg";
import dessert from "../../assets/after-dessert.jpg";

const items = [
  { src: pizza, cat: "Feed", title: "Margherita", tag: "Pizzería Bottega" },
  { src: cocktail, cat: "Story", title: "Negroni de la casa", tag: "Bar Lumen" },
  { src: ramen, cat: "Menú", title: "Tonkotsu ramen", tag: "Sakura" },
  { src: tacos, cat: "Feed", title: "Tacos al pastor", tag: "Cantina 21" },
  { src: burger, cat: "Story", title: "Smash burger", tag: "Brasa & Pan" },
  { src: sushi, cat: "Pantalla TV", title: "Selección omakase", tag: "Sakura" },
  { src: coffee, cat: "Story", title: "Espresso reserva", tag: "Origen Café" },
  { src: icecream, cat: "Feed", title: "Helado artesano", tag: "Frutta" },
  { src: dessert, cat: "Menú", title: "Coulant de chocolate", tag: "Dolce" },
];

const filters = ["Todo", "Story", "Feed", "Menú", "Pantalla TV"];

export default function DemoGallery() {
  const [filter, setFilter] = useState("Todo");
  const visible = filter === "Todo" ? items : items.filter((i) => i.cat === filter);

  return (
    <section id="galeria" className="relative py-24 lg:py-36 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">La galería</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-balance text-white">
              Diseños reales,{" "}
              <span className="italic text-primary">hechos por restaurantes como el tuyo.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
          {visible.map((it, i) => (
            <motion.figure
              key={`${filter}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={it.src}
                  alt={it.title}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  priority={i < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-[10px] uppercase tracking-widest text-primary">{it.cat}</span>
                <p className="font-display text-xl text-cream mt-1">{it.title}</p>
                <p className="text-xs text-neutral-400">{it.tag}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-4 text-base font-semibold text-slate-900 hover:scale-[1.03] transition-all glow-lime"
          >
            Quiero diseños así para mi local
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
