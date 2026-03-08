"use client";

import { useState } from 'react';
import Link from 'next/link';

const LogoSantisoft = ({ className = "h-10 w-10" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" className="fill-slate-900 stroke-blue-500" strokeWidth="4"/>
    <path d="M35 40L50 30L65 40V60L50 70L35 60V50" className="stroke-cyan-400" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* BANNER DE URGENCIA GLOBAL */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white text-center py-2 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
        <span className="relative z-10">⚡ SOLO 15 CUPOS DISPONIBLES PARA GARANTIZAR CALIDAD DE IA</span>
      </div>

      <nav className="w-full md:w-[95%] md:mx-auto md:mt-4 max-w-7xl bg-[#030712]/95 md:bg-slate-950/60 backdrop-blur-xl border-b md:border border-white/10 md:rounded-2xl transition-all shadow-2xl">
        <div className="flex justify-between items-center p-4 md:px-8">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsOpen(false)}>
            <LogoSantisoft className="h-9 w-9 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              SANTISOFT
            </span>
          </Link>

          {/* MENÚ DESKTOP */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-semibold text-slate-300">
            <Link href="/#servicios" className="hover:text-blue-400 transition-colors">Servicios</Link>
            
            <Link href="/automatizacion-rrss" className="hover:text-cyan-400 transition-colors">RRSS Autónomas</Link>
            
            {/* NUEVO ENLACE: GASTRONÓMICO */}
            <Link href="/gastronomico" className="relative group flex items-center gap-2 text-slate-300 transition-colors">
              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"></span>
              <span className="group-hover:text-orange-400 transition-colors">IA Gastronómica</span>
            </Link>
            
            <Link href="/#demo" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Demo IA
            </Link>
            <Link href="/#precios" className="hover:text-blue-400 transition-colors">Planes</Link>
            <Link href="/contacto" className="bg-white text-black px-6 py-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-lg shadow-blue-500/20">
              Cotizar Proyecto
            </Link>
          </div>

          {/* BOTÓN HAMBURGUESA MOBILE */}
          <button 
            className="md:hidden text-white p-2 focus:outline-none" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* MENÚ MOBILE DESPLEGABLE */}
        {isOpen && (
          <div className="md:hidden bg-[#030712] border-t border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top-2">
            <Link href="/#servicios" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 hover:text-white">Servicios</Link>
            
            <Link href="/automatizacion-rrss" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 hover:text-white">RRSS Autónomas</Link>
            
            {/* NUEVO ENLACE MOBILE: GASTRONÓMICO */}
            <Link href="/gastronomico" onClick={() => setIsOpen(false)} className="text-lg font-bold text-orange-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"></span> IA Gastronómica
            </Link>

            <Link href="/#demo" onClick={() => setIsOpen(false)} className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Demo en Vivo
            </Link>
            <Link href="/#precios" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 hover:text-white">Planes</Link>
            <Link href="/contacto" onClick={() => setIsOpen(false)} className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-center mt-2">
              Cotizar Proyecto
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}