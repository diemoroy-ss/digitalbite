"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  desc?: string;
  url?: string;
  urlStory?: string;
  urlTv?: string;
  imageUrl?: string;
  imageUrlPost?: string;
  imageUrlVertical?: string;
  isFeaturedOnLanding?: boolean;
}

const FORMAT_LABELS: Record<string, string> = {
  story: "Story",
  post:  "Feed",
  tv_v:  "Menú Wall",
  tv_h:  "TV",
};

export default function LandingTemplateGallery() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [activeFormat, setActiveFormat] = useState<"story" | "post">("story");

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "templates"));
        const docs: Template[] = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Template))
          .filter((t) => t.isFeaturedOnLanding && !!(t.url || t.urlStory || t.imageUrl || t.imageUrlVertical));
        // Shuffle deterministically — show variety
        docs.sort(() => 0.5 - Math.random());
        setTemplates(docs.slice(0, 8));
      } catch (err) {
        console.error("LandingTemplateGallery error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getDisplayUrl = (t: Template) => {
    if (activeFormat === "story") {
      return t.urlStory || t.imageUrlVertical || t.url || t.imageUrl || t.imageUrlPost || "";
    }
    return t.url || t.imageUrlPost || t.urlStory || t.imageUrlVertical || t.imageUrl || "";
  };

  const formatLabel = activeFormat === "story" ? "Story" : "Feed";
  const aspectClass = activeFormat === "story" ? "aspect-[9/16]" : "aspect-square";

  // Keyboard nav for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((p) => p !== null ? (p + 1) % templates.length : null);
      if (e.key === "ArrowLeft")  setLightbox((p) => p !== null ? (p - 1 + templates.length) % templates.length : null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, templates.length]);

  return (
    <>
      {/* Format toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {(["story", "post"] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => setActiveFormat(fmt)}
            style={{
              background: activeFormat === fmt ? "#C8F060" : "rgba(255,255,255,0.04)",
              color: activeFormat === fmt ? "#0E0D0B" : "rgba(240,237,230,0.45)",
              border: activeFormat === fmt ? "none" : "0.5px solid rgba(240,237,230,0.12)",
              borderRadius: 100,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {fmt === "story" ? "📱 Story" : "🖼 Feed"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="gallery-real-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={activeFormat === "story" ? "aspect-[9/16]" : "aspect-square"}
              style={{ borderRadius: 14, background: "rgba(240,237,230,0.04)", animation: "pulse 2s infinite" }}
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(240,237,230,0.35)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
          <p style={{ fontSize: 14 }}>Cargando plantillas...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="gallery-real-grid">
          {templates.map((t, i) => {
            const imgUrl = getDisplayUrl(t);
            if (!imgUrl) return null;
            return (
              <button
                key={t.id}
                onClick={() => setLightbox(i)}
                style={{
                  background: "#141414",
                  borderRadius: 14,
                  border: "0.5px solid rgba(240,237,230,0.08)",
                  overflow: "hidden",
                  cursor: "zoom-in",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s, transform 0.2s",
                  position: "relative",
                }}
                className="template-gallery-card"
              >
                <div
                  className={aspectClass}
                  style={{ width: "100%", position: "relative", overflow: "hidden" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={t.name}
                    loading="lazy"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                    className="template-gallery-img"
                  />
                  {/* Hover overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                      opacity: 0,
                      transition: "opacity 0.25s",
                    }}
                    className="template-gallery-overlay"
                  />
                  {/* Format badge */}
                  <div style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(200,240,96,0.18)",
                    border: "0.5px solid rgba(200,240,96,0.35)",
                    borderRadius: 100,
                    padding: "2px 8px",
                    fontSize: 10,
                    color: "#C8F060",
                    fontWeight: 500,
                  }}>
                    {formatLabel}
                  </div>
                  {/* Zoom icon on hover */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(200,240,96,0.15)",
                      border: "0.5px solid rgba(200,240,96,0.3)",
                      borderRadius: 100,
                      padding: "4px 12px",
                      fontSize: 11,
                      color: "#C8F060",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    className="template-gallery-zoom"
                  >
                    🔍 Ver
                  </div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, color: "rgba(240,237,230,0.75)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && templates[lightbox] && (() => {
        const t = templates[lightbox];
        const imgUrl = getDisplayUrl(t);
        return (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(14,13,11,0.95)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setLightbox(null)}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 40, height: 40,
                borderRadius: "50%",
                background: "rgba(240,237,230,0.08)",
                border: "0.5px solid rgba(240,237,230,0.12)",
                color: "#F0EDE6",
                fontSize: 18,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>

            {/* Prev */}
            {templates.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((p) => p !== null ? (p - 1 + templates.length) % templates.length : null); }}
                style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(240,237,230,0.06)", border: "0.5px solid rgba(240,237,230,0.12)",
                  color: "#F0EDE6", fontSize: 22, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >‹</button>
            )}

            {/* Image */}
            <div
              style={{
                maxWidth: activeFormat === "story" ? 380 : 520,
                width: "100%",
                borderRadius: 20,
                overflow: "hidden",
                border: "0.5px solid rgba(240,237,230,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={t.name}
                style={{ width: "100%", height: "auto", display: "block", maxHeight: "85vh", objectFit: "contain" }}
              />
              <div style={{
                background: "#0E0D0B",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: "rgba(240,237,230,0.6)", fontWeight: 500 }}>{t.name}</span>
                <Link
                  href="/demo"
                  style={{
                    background: "#C8F060", color: "#0E0D0B",
                    borderRadius: 100, padding: "6px 16px",
                    fontSize: 12, fontWeight: 500, textDecoration: "none",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Usar plantilla →
                </Link>
              </div>
            </div>

            {/* Next */}
            {templates.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((p) => p !== null ? (p + 1) % templates.length : null); }}
                style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(240,237,230,0.06)", border: "0.5px solid rgba(240,237,230,0.12)",
                  color: "#F0EDE6", fontSize: 22, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >›</button>
            )}
          </div>
        );
      })()}
    </>
  );
}
