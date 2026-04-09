"use client";

import { useAlertStore } from "../store/useAlertStore";
import { useEffect, useState } from "react";

export default function AlertModal() {
  const { isOpen, message, type, closeAlert } = useAlertStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Intercept native browser alerts globally
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      useAlertStore.getState().openAlert(String(msg), 'info');
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!mounted || !isOpen) return null;

  const typeConfig = {
    success: { icon: "✅", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    error: { icon: "❌", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
    warning: { icon: "⚠️", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    info: { icon: "ℹ️", bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={closeAlert}>
      <div 
        className={`relative w-full max-w-sm p-6 md:p-8 rounded-[32px] shadow-2xl border ${config.bg} ${config.border} flex flex-col items-center text-center animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={closeAlert}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 hover:bg-white rounded-full p-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div className="text-5xl mb-4" aria-hidden="true">{config.icon}</div>
        <p className={`font-bold ${config.text} whitespace-pre-wrap leading-relaxed text-[15px]`}>{message}</p>
        <button 
          onClick={closeAlert}
          className={`mt-6 w-full py-3.5 rounded-xl font-bold bg-white/80 hover:bg-white border ${config.border} ${config.text} transition-colors shadow-sm`}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
