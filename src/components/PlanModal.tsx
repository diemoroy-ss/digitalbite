"use client";
import React from 'react';
import { sendToN8n } from '@/app/actions';

export default function PlanModal({ isOpen, onClose, planName }: { isOpen: boolean, onClose: () => void, planName: string }) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('plan', planName);
    formData.append('type', 'info_request');
    
    await sendToN8n(formData);
    alert("Solicitud enviada con éxito. Revisa tu correo.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/20 p-8 rounded-[2rem] max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        <h3 className="text-2xl font-bold text-white mb-2 text-center">Interés en Plan {planName}</h3>
        <p className="text-slate-400 text-center mb-6">Completa tus datos para enviarte la propuesta.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="nombre" placeholder="Nombre completo" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <input name="email" type="email" placeholder="Correo electrónico" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <textarea name="mensaje" placeholder="¿Tienes alguna duda?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-24 outline-none" />
          <button type="submit" className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors">
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
}