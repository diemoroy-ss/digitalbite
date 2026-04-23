"use client";

import { useAlertStore } from "../store/useAlertStore";
import { useEffect, useState } from "react";

export default function AlertModal() {
  const { isOpen, message, type, closeAlert, isConfirm, onConfirm, onCancel, confirmText, cancelText, hasInput, inputValue, setInputValue } = useAlertStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Intercept native browser alerts globally
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      useAlertStore.getState().openAlert(String(msg), 'info', 5000);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!mounted || !isOpen) return null;

  const typeConfig = {
    success: { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      ), 
      colors: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      accent: "bg-emerald-500 shadow-emerald-500/40"
    },
    error: { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ), 
      colors: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      accent: "bg-rose-500 shadow-rose-500/40"
    },
    warning: { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ), 
      colors: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      accent: "bg-amber-500 shadow-amber-500/40"
    },
    info: { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      colors: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      accent: "bg-indigo-500 shadow-indigo-500/40"
    },
  };

  const config = typeConfig[type];

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
      onClick={closeAlert}
    >
      <div 
        className="relative w-full max-w-sm overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col items-center p-10 text-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className={`absolute -top-20 -left-20 w-40 h-40 blur-3xl opacity-20 rounded-full ${config.accent}`} />
        
        {/* Top bar indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.accent.split(' ')[0]}`} />

        {/* Close Button */}
        <button 
          onClick={closeAlert}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Icon container */}
        <div className={`mb-6 p-5 rounded-3xl ${config.colors} flex items-center justify-center shadow-inner`}>
          {config.icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">
          {type === 'success' ? '¡Excelente!' : type === 'error' ? 'Oops...' : type === 'warning' ? 'Atención' : 'Información'}
        </h3>

        {/* Message */}
        <p className="text-slate-500 font-medium leading-relaxed text-sm whitespace-pre-wrap max-w-xs transition-all">
          {message}
        </p>

        {/* Input Field (Optional) */}
        {hasInput && (
          <div className="w-full mt-6 animate-in slide-in-from-bottom-2 duration-300">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center"
              placeholder="Escribe aquí..."
              autoFocus
            />
          </div>
        )}
        
        {/* Combined Action Buttons */}
        <div className={`mt-8 w-full flex ${isConfirm ? 'flex-col sm:flex-row gap-3' : 'flex-col'}`}>
          {isConfirm ? (
            <>
              <button 
                onClick={() => {
                  if (onCancel) onCancel();
                  closeAlert();
                }}
                className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  if (onConfirm) onConfirm();
                  closeAlert();
                }}
                className={`flex-[1.5] py-4 rounded-2xl font-black text-white ${config.accent} hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button 
              onClick={closeAlert}
              className={`w-full py-4 rounded-2xl font-black text-white ${config.accent} hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2`}
            >
              Entendido
            </button>
          )}
        </div>

        {/* Brand signature */}
        <div className="mt-6 flex items-center gap-1.5 opacity-20">
          <div className="w-1 h-1 bg-slate-900 rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">DigitalBite AI</span>
          <div className="w-1 h-1 bg-slate-900 rounded-full" />
        </div>
      </div>
    </div>
  );
}
