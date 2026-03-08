"use client";

import React, { useState } from 'react';

export default function DemoForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'validation-error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    rubro: '',
    idea: ''
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[1-9]\d{10,14}$/.test(phone);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value && !value.startsWith('+')) value = '+' + value;
    const formattedValue = value.replace(/(?!^\+)\D/g, '');
    setFormData({ ...formData, whatsapp: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateEmail(formData.email)) {
      setStatus('validation-error');
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (!validatePhone(formData.whatsapp)) {
      setStatus('validation-error');
      setErrorMessage('El formato de WhatsApp debe ser internacional completo (ej: +56912345678).');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('https://n8n.santisoft.cl/webhook/demo-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          whatsapp: formData.whatsapp,
          rubro: formData.rubro || "No especificado",
          idea: formData.idea,
          fecha: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" }),
          origen: "Demo en Vivo - Landing Principal"
        }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage('Hubo un problema con el servidor. Reintenta en unos momentos.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error de conexión. Revisa tu internet.');
    }
  };

  // ESTADO DE ÉXITO: Mensaje "La Magia Sucede"
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse">
          <span className="text-5xl">✨</span>
        </div>
        <h3 className="text-3xl font-black text-white mb-4 italic">¡Información enviada!</h3>
        <p className="text-slate-300 text-lg max-w-md leading-relaxed">
          Nuestra Inteligencia Artificial está procesando tu solicitud ahora mismo. <br />
          <span className="text-cyan-400 font-bold">Espera unos momentos a que la magia suceda...</span> recibirás el resultado directamente en tu WhatsApp.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-10 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
        >
          ← Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tu Nombre</label>
          <input
            required
            type="text"
            placeholder="Ej. Juan Pérez"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600 shadow-inner"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Corporativo</label>
          <input
            required
            type="email"
            placeholder="juan@empresa.cl"
            className={`w-full bg-slate-900/80 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all placeholder:text-slate-600 ${
              status === 'validation-error' && !validateEmail(formData.email) ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-700 focus:border-cyan-500'
            }`}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
          <input
            required
            type="tel"
            placeholder="+569..."
            className={`w-full bg-slate-900/80 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all placeholder:text-slate-600 ${
              status === 'validation-error' && !validatePhone(formData.whatsapp) ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-700 focus:border-cyan-500'
            }`}
            value={formData.whatsapp}
            onChange={handlePhoneChange}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Rubro (Opcional)</label>
          <input
            type="text"
            placeholder="Ej. Inmobiliaria, Retail..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600 shadow-inner"
            value={formData.rubro}
            onChange={(e) => setFormData({...formData, rubro: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">¿Qué quieres crear?</label>
        <textarea
          required
          rows={3}
          placeholder="Describe brevemente tu idea de post o automatización..."
          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 transition-all resize-none placeholder:text-slate-600 shadow-inner"
          value={formData.idea}
          onChange={(e) => setFormData({...formData, idea: e.target.value})}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg ${
          status === 'loading' 
            ? 'bg-slate-800 cursor-not-allowed text-slate-500 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-[0.98]'
        }`}
      >
        {status === 'loading' ? '🚀 CONECTANDO CON LA IA...' : 'GENERAR DEMO GRATIS'}
      </button>

      {/* Mensajes de Validación/Error */}
      {(status === 'validation-error' || status === 'error') && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold text-center">
          {errorMessage}
        </div>
      )}
    </form>
  );
}