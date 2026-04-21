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
        const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"), limit(3));
        const snap = await getDocs(q);
        const docs: RenderItem[] = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as RenderItem))
          .filter(d => !!d.id && d.fondoUrl);
        setItems(docs);
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
        <div className="aspect-[9/16] rounded-3xl animate-pulse" style={{ background: 'rgba(240,237,230,0.04)', border: '0.5px solid rgba(240,237,230,0.08)' }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[320px] mx-auto">
        <div className="aspect-[9/16] rounded-3xl flex items-center justify-center" style={{ background: 'rgba(200,240,96,0.04)', border: '0.5px solid rgba(200,240,96,0.15)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎨</div>
            <p style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)' }}>Cargando renders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[320px] mx-auto select-none">
      {/* Teléfono / Marco */}
      <div
        className="relative w-full aspect-[9/16] rounded-[32px] overflow-hidden cursor-pointer"
        style={{ background: '#0E0D0B', border: '0.5px solid rgba(240,237,230,0.1)' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Badge DEMO */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20, background: 'rgba(200,240,96,0.15)', border: '0.5px solid rgba(200,240,96,0.3)', color: '#C8F060', fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Render real
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
              style={{
                borderRadius: 100,
                transition: 'all 0.3s',
                width: i === current ? 24 : 8,
                height: 8,
                background: i === current ? '#C8F060' : 'rgba(240,237,230,0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
