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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/60"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/30">
            <span className="absolute inset-0 rounded-lg bg-indigo-500/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="relative font-bold text-indigo-400 text-lg">d</span>
          </span>
          <span className="text-lg lg:text-xl font-semibold tracking-tight text-white">
            digital<span className="text-indigo-400">bite</span>
          </span>
        </a>

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

        <a
          href="/login"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:scale-105 transition-transform"
        >
          Probar gratis
          <span aria-hidden>→</span>
        </a>
      </div>
    </header>
  );
}
