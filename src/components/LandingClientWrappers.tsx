"use client";
import dynamic from "next/dynamic";

const HeroCarousel = dynamic(() => import("./HeroCarousel"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="aspect-[9/16] rounded-3xl bg-slate-200 animate-pulse" />
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

export function HeroCarouselClient() {
  return <HeroCarousel />;
}

export function DesignGalleryClient() {
  return <DesignGallery />;
}
