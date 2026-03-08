"use client";

import { useState } from 'react';
import { sendToN8n } from './actions';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(formData: FormData) {
    setStatus('loading');
    try {
      await sendToN8n(formData);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center p-10 bg-blue-500/10 rounded-3xl border border-blue-500/20">
        <span className="text-5xl mb-4 block">🚀</span>
        <h3 className="text-2xl font-bold text-white mb-2">¡Datos guardados con éxito!</h3>
        <p className="text-slate-400">Nuestro equipo ya recibió tu solicitud en nuestro sistema central. Te contactaremos muy pronto.</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="form_type" value="contacto_general" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input name="nombre" placeholder="Nombre completo" required className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all text-white" />
        <input type="email" name="email" placeholder="Email corporativo" required className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all text-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input type="tel" name="telefono" required placeholder="WhatsApp (+56 9...)" pattern="^\+56\s?9\s?\d{4}\s?\d{4}$" title="Debe tener el formato +56 9 XXXX XXXX" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all text-white" />
        
        {/* EL SELECTO SOLICITADO */}
        <select name="tipo_proyecto" required className="w-full bg-[#0b1120] border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all text-slate-300">
          <option value="" disabled selected>¿Qué estás buscando?</option>
          <option value="Creación de Sitios Web">Creación de Sitios Web</option>
          <option value="Desarrollo de Apps">Desarrollo de Apps (Móviles/Web)</option>
          <option value="Redes Sociales (IA)">Automatización de Redes Sociales</option>
          <option value="Sistemas Complejos">Sistemas a Medida o Agentes IA</option>
        </select>
      </div>
      
      <textarea name="descripcion" placeholder="Cuéntanos un poco más sobre tu necesidad o proyecto..." required rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all text-white" />

      <button type="submit" disabled={status === 'loading'} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl transition-all disabled:opacity-50">
        {status === 'loading' ? 'ENVIANDO A SISTEMA...' : 'ENVIAR SOLICITUD'}
      </button>

      {status === 'error' && <p className="text-red-400 text-center text-sm font-bold">Hubo un error de conexión. Por favor, intenta de nuevo.</p>}
    </form>
  );
}