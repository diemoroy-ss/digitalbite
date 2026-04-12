"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

interface RenderItem {
  id: string;
  fondoUrl?: string;
  imageUrl?: string;
  formato?: string;
}

const INTERVAL_MS = 3500;
const COLLECTION = "renders_temporales";

// URL del render completo generado por Butterfly
function butterflyUrl(id: string) {
  return `https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(`https://digitalbite.santisoft.cl/render?id=${id}`)}`;
}

export default function HeroCarousel() {
  const [items, setItems] = useState<RenderItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"), limit(20));
        const snap = await getDocs(q);
        const docs: RenderItem[] = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as RenderItem))
          .filter(d => !!d.id && d.fondoUrl); // fondoUrl asegura que tiene contenido real

        // Shuffle — tomar 4 aleatorios del pool
        const shuffled = docs.sort(() => Math.random() - 0.5).slice(0, 4);
        setItems(shuffled);
        setLoaded(true);
      } catch (err) {
        console.error("HeroCarousel error:", err);
        setLoaded(true);
      }
    }
    load();
  }, []);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % Math.max(items.length, 1));
  }, [items.length]);

  // Autoplay
  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = setInterval(next, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next, items.length]);

  const goTo = (i: number) => {
    setCurrent(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, INTERVAL_MS);
  };

  if (!loaded) {
    return (
      <div className="w-full max-w-[320px] mx-auto">
        <div className="aspect-[9/16] rounded-3xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[320px] mx-auto">
        <div className="aspect-[9/16] rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
          <span className="text-6xl">🎨</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[320px] mx-auto select-none">
      {/* Teléfono / Marco */}
      <div
        className="relative w-full aspect-[9/16] rounded-[32px] overflow-hidden shadow-2xl shadow-slate-400/40 border-4 border-slate-100 cursor-pointer bg-slate-900"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Badge DEMO */}
        <div className="absolute top-3 left-3 z-20 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase shadow-md">
          ✨ RENDER RRSS
        </div>

        {items.map((item, i) => (
          <div
            key={item.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={butterflyUrl(item.id)}
              alt="Diseño DigitalBite"
              className="w-full h-full object-cover"
              draggable={false}
              onError={(e) => {
                // Fallback al fondo plano si Butterfly falla
                if (item.fondoUrl) e.currentTarget.src = item.fondoUrl;
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        ))}

        {/* Marca agua fija */}
        <div className="absolute bottom-3 right-3 z-20 text-white/60 text-[9px] font-bold">
          hecho con ❤️ digitalbite.santisoft.cl
        </div>

        {/* Pause overlay indicator */}
        {paused && items.length > 1 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/80 text-[11px] font-bold">
              ⏸ Pausado
            </div>
          </div>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="flex gap-2 items-center">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2.5 bg-indigo-600"
                  : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
