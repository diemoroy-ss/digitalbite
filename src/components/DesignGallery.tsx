"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

interface DesignItem {
  id: string;
  fondoUrl?: string;
  formato?: string;
  titulo?: string;
}

const COLLECTION = "renders_temporales";

function butterflyUrl(id: string) {
  return `https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(`https://digitalbite.santisoft.cl/render?id=${id}`)}`;
}

export default function DesignGallery() {
  const [items, setItems] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"), limit(3));
        const snap = await getDocs(q);
        const docs = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as DesignItem))
          .filter(d => !!d.id && d.fondoUrl);
        setItems(docs);
      } catch (err) {
        console.error("DesignGallery error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox(prev => prev !== null ? (prev + 1) % items.length : null);
      if (e.key === "ArrowLeft") setLightbox(prev => prev !== null ? (prev - 1 + items.length) % items.length : null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, items.length]);

  return (
    <section className="mb-32">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-600 text-[11px] font-bold tracking-widest uppercase mb-5">
          ✨ Galería Real
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
          Diseños reales. Generados en segundos con IA.
        </h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Cada imagen fue creada desde cero con DigitalBite — sin fotógrafo, sin espera.
        </p>
      </div>

      {/* Grid — 3 columnas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">🎨</div>
          <p className="font-bold">¡Sé el primero en generar un diseño!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setLightbox(i)}
              className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={butterflyUrl(item.id)}
                alt={item.titulo || "Diseño DigitalBite"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  if (item.fondoUrl) e.currentTarget.src = item.fondoUrl;
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
                <span className="text-white text-xs font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {item.formato?.includes("tv") ? "📺 Menú Wall" : item.formato === "story" ? "📱 Story" : "🖼 Post"}
                </span>
                <span className="text-white text-xs font-black bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  🔍 Ver
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CTA final */}
      <div className="text-center mt-12">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-lg px-10 py-5 rounded-2xl shadow-xl shadow-rose-500/30 hover:-translate-y-1 transition-all"
        >
          Quiero diseños así para mi restaurante →
        </Link>
      </div>

      {/* Lightbox */}
      {lightbox !== null && items.length > 0 && (
        <div
          className="fixed inset-0 z-[300] bg-black/92 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>

          {items.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(prev => prev !== null ? (prev - 1 + items.length) % items.length : null); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
            >‹</button>
          )}

          <div
            className="relative max-w-md w-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={butterflyUrl(items[lightbox]?.id)}
              alt="Diseño ampliado"
              className="w-full h-auto object-contain max-h-[85vh]"
              onError={(e) => {
                const item = items[lightbox];
                if (item?.fondoUrl) e.currentTarget.src = item.fondoUrl;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <span className="text-white text-sm font-bold">
                {items[lightbox]?.formato?.includes("tv") ? "📺 Menú Wall" : items[lightbox]?.formato === "story" ? "📱 Story" : "🖼 Post"} · DigitalBite
              </span>
            </div>
          </div>

          {items.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(prev => prev !== null ? (prev + 1) % items.length : null); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
            >›</button>
          )}

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox(i); }}
                className={`rounded-full transition-all ${i === lightbox ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
