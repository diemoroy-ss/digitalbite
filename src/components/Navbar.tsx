"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Logo = ({ className = "h-9 w-9" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" fill="#1a1916" stroke="#f43f5e" strokeWidth="4"/>
    <path d="M30 45C30 35 40 30 50 30C60 30 70 35 70 45V60C70 65 65 70 55 70H45C35 70 30 65 30 60V45Z" fill="#f43f5e" opacity="0.2"/>
    <path d="M35 45L50 35L65 45V55L50 65L35 55V45Z" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Hide global navbar on specialized pages and dashboard
  // Hide global navbar on specialized pages and login
  if (pathname === '/' || pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/demo')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="px-3 pt-6">
        <nav className="max-w-7xl mx-auto rounded-[24px] overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(26, 25, 22, 0.08)',
            boxShadow: 'var(--shadow-premium)',
          }}>

          <div className="flex items-center justify-between px-6 py-4">

            {/* LOGO */}
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 group">
              <Logo className="h-9 w-9 group-hover:rotate-12 transition-transform duration-500" />
              <div className="flex flex-col">
                <span className="font-display text-[20px] font-black tracking-tighter leading-none" style={{ color: '#1a1916' }}>DIGITALBITE</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-500 mt-1">Smart Graphics</span>
              </div>
            </Link>

            {/* DESKTOP LINKS */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Link href="/dashboard"
                  className="ml-2 px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white transition-all bg-rose-500 shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95">
                  Mi Panel 🚀
                </Link>
              ) : (
                <Link href="/login"
                  className="ml-2 px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white transition-all bg-rose-500 shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95">
                  Ingresar 🚪
                </Link>
              )}
            </div>

            {/* HAMBURGER */}
            <button className="md:hidden p-2 rounded-xl bg-slate-100" style={{ color: '#1a1916' }} onClick={() => setOpen(!open)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {open && (
            <div className="md:hidden px-6 pb-8 pt-4 flex flex-col gap-4 bg-white/50 border-t border-slate-100">
              <Link href={user ? "/dashboard" : "/login"} onClick={() => setOpen(false)}
                className="mt-4 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-center shadow-xl"
                style={{ background: user ? '#6366f1' : '#1a1916' }}>
                {user ? "Ir a mi Panel" : "Iniciar Sesión"}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}