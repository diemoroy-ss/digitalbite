"use client";
export default function MobileCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden p-3 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur">
      <a
        href="/login"
        className="flex items-center justify-center gap-2 w-full rounded-full bg-lime-400 px-6 py-4 text-base font-semibold text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
      >
        Probar gratis
        <span>→</span>
      </a>
    </div>
  );
}
