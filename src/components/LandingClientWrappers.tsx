"use client";
import dynamic from "next/dynamic";

const HeroCarousel = dynamic(() => import("./HeroCarousel"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="aspect-[9/16] rounded-3xl animate-pulse" style={{ background: 'rgba(240,237,230,0.04)', border: '0.5px solid rgba(240,237,230,0.08)' }} />
    </div>
  ),
});

const DesignGallery = dynamic(() => import("./DesignGallery"), {
  ssr: false,
  loading: () => (
    <div className="mb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    </div>
  ),
});

const LandingTemplateGallery = dynamic(() => import("./LandingTemplateGallery"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="gallery-real-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ aspectRatio: "9/16", borderRadius: 14, background: "rgba(240,237,230,0.04)" }} />
      ))}
    </div>
  ),
});

export function HeroCarouselClient() {
  return <HeroCarousel />;
}

export function DesignGalleryClient() {
  return <DesignGallery />;
}

export function LandingTemplateGalleryClient() {
  return <LandingTemplateGallery />;
}

