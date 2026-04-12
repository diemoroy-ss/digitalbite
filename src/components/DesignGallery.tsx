"use client";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

interface DesignItem {
  id: string;
  fondoUrl?: string;
  imageUrl?: string;
  formato?: string;
  titulo?: string;
  _snap?: DocumentSnapshot;
}

type FilterType = "todos" | "stories" | "menu" | "feed";

const PAGE_SIZE = 9;
const COLLECTION = "renders_temporales";

// URL del render final generado por Butterfly (imagen completa con capas)
function butterflyUrl(id: string) {
  return `https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(`https://digitalbite.santisoft.cl/render?id=${id}`)}`;
}

const FILTER_LABELS: { key: FilterType; label: string; emoji: string }[] = [
  { key: "todos", label: "Todos", emoji: "🎨" },
  { key: "stories", label: "Stories", emoji: "📱" },
  { key: "menu", label: "Menú Wall", emoji: "📺" },
  { key: "feed", label: "Feed", emoji: "🖼" },
];

function matchFilter(item: DesignItem, filter: FilterType): boolean {
  if (filter === "todos") return true;
  const f = item.formato || "";
  if (filter === "stories") return f === "story" || f === "tv_v";
  if (filter === "menu") return f === "tv_h" || f === "tv_v";
  if (filter === "feed") return f === "post";
  return true;
}

export default function DesignGallery() {
  const [allItems, setAllItems] = useState<DesignItem[]>([]);
  const [lastSnap, setLastSnap] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterType>("todos");
  const [lightbox, setLightbox] = useState<{ idx: number } | null>(null);

  // Cargar primera página
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"), limit(PAGE_SIZE * 3));
        const snap = await getDocs(q);
        const docs: DesignItem[] = snap.docs
          .map(d => ({ id: d.id, ...d.data(), _snap: d } as DesignItem))
          .filter(d => !!d.id && d.fondoUrl); // fondoUrl asegura que tiene fondo real
        setAllItems(docs);
        setLastSnap(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === PAGE_SIZE * 3);
      } catch (err) {
        console.error("DesignGallery error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadMore = useCallback(async () => {
    if (!lastSnap || loadingMore) return;
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, "renders"),
        orderBy("createdAt", "desc"),
        startAfter(lastSnap),
        limit(PAGE_SIZE * 2)
      );
      const snap = await getDocs(q);
      const docs: DesignItem[] = snap.docs
        .map(d => ({ id: d.id, ...d.data(), _snap: d } as DesignItem))
        .filter(d => !!d.id && d.fondoUrl);
      setAllItems(prev => [...prev, ...docs]);
      setLastSnap(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE * 2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [lastSnap, loadingMore]);

  // Filtrado local sin re-query
  const filtered = allItems.filter(item => matchFilter(item, filter));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset visible al cambiar filtro
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filter]);

  const visible = filtered.slice(0, visibleCount);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox(prev => prev && { idx: (prev.idx + 1) % visible.length });
      if (e.key === "ArrowLeft") setLightbox(prev => prev && { idx: (prev.idx - 1 + visible.length) % visible.length });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, visible.length]);

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

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {FILTER_LABELS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
              filter === f.key
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            <span>{f.emoji}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">🎨</div>
          <p className="font-bold">No hay diseños en esta categoría aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setLightbox({ idx: i })}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-zoom-in"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-white text-xs font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {item.formato?.includes("tv") ? "📺 Menú Wall" : item.formato === "story" ? "📱 Story" : "🖼 Post"}
                </span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-black px-2 py-1 rounded-lg shadow">
                  🔍 Ver
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Ver más */}
      {!loading && (visibleCount < filtered.length || hasMore) && (
        <div className="text-center mt-8">
          <button
            onClick={async () => {
              const nextCount = visibleCount + PAGE_SIZE;
              if (nextCount > filtered.length && hasMore) {
                await loadMore();
              }
              setVisibleCount(nextCount);
            }}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold px-8 py-3.5 rounded-2xl transition-all"
          >
            {loadingMore ? (
              <><span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" /> Cargando...</>
            ) : (
              <>Ver más diseños <span>↓</span></>
            )}
          </button>
        </div>
      )}

      {/* CTA final */}
      <div className="text-center mt-16">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-lg px-10 py-5 rounded-2xl shadow-xl shadow-rose-500/30 hover:-translate-y-1 transition-all"
        >
          Quiero diseños así para mi restaurante →
        </Link>
      </div>

      {/* Lightbox */}
      {lightbox !== null && visible.length > 0 && (
        <div
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>

          {/* Prev */}
          {visible.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(prev => prev && { idx: (prev.idx - 1 + visible.length) % visible.length }); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-md w-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={butterflyUrl(visible[lightbox.idx]?.id)}
              alt="Diseño ampliado"
              className="w-full h-auto object-contain max-h-[85vh]"
              onError={(e) => {
                const item = visible[lightbox.idx];
                if (item?.fondoUrl) e.currentTarget.src = item.fondoUrl;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <span className="text-white text-sm font-bold">
                {visible[lightbox.idx]?.formato?.includes("tv") ? "📺 Menú Wall" : visible[lightbox.idx]?.formato === "story" ? "📱 Story" : "🖼 Post Feed"} · DigitalBite
              </span>
            </div>
          </div>

          {/* Next */}
          {visible.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(prev => prev && { idx: (prev.idx + 1) % visible.length }); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
            >
              ›
            </button>
          )}

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {visible.slice(0, Math.min(visible.length, 9)).map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox({ idx: i }); }}
                className={`rounded-full transition-all ${i === lightbox.idx ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
