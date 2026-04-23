"use client";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const links = [
  { href: "#galeria", label: "Galería" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#precios", label: "Precios" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled || menuOpen
            ? "backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/60"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 group z-50">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/30">
              <span className="absolute inset-0 rounded-lg bg-indigo-500/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="relative font-bold text-indigo-400 text-lg">d</span>
            </span>
            <span className="text-lg lg:text-xl font-semibold tracking-tight text-white">
              digital<span className="text-indigo-400">bite</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-slate-400 hover:text-white transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-indigo-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:scale-105 transition-transform z-50"
            >
              Probar gratis
              <span aria-hidden>→</span>
            </a>

            {/* Mobile Nav Toggle */}
            <button
              className="md:hidden z-50 p-2 text-slate-300 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Alternar menú"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          <nav className="flex flex-col items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-display font-medium text-slate-300 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-4 flex items-center gap-2 rounded-full bg-lime-400 px-8 py-4 text-lg font-bold text-slate-900 shadow-lg glow-lime"
            >
              Probar gratis <span>→</span>
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
