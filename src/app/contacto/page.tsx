"use client";

import React, { useState } from 'react';
import ContactForm from '../ContactForm';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'validation-error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    rubro: '',
    mensaje: ''
  });

  // Validaciones con Regex
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[1-9]\d{10,14}$/.test(phone);

  // Formateador automático de WhatsApp
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
      const response = await fetch('https://n8n.santisoft.cl/webhook/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rubro: formData.rubro || "No especificado",
          fecha: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" }),
          origen: "Formulario de Contacto Oficial"
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ nombre: '', email: '', whatsapp: '', rubro: '', mensaje: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Error enviando a n8n:", error);
      setStatus('error');
    }
  };

  return (
    <div className="px-6 pb-20 pt-10 flex flex-col items-center justify-center relative w-full min-h-screen bg-[#030712]">
      {/* Luces de fondo de alto contraste */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-3xl bg-slate-900/80 p-8 md:p-14 rounded-[3rem] border border-slate-700 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white">¿Hablamos?</h1>
          <p className="text-slate-400 text-lg">
            Cuéntanos qué necesitas. Enviaremos tus datos directo a nuestro sistema y nos contactaremos para hacerlo realidad.
          </p>
        </div>

        <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre</label>
                <input
                  required
                  type="text"
                  className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input
                  required
                  type="email"
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all ${
                    status === 'validation-error' && !validateEmail(formData.email) ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
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
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all ${
                    status === 'validation-error' && !validatePhone(formData.whatsapp) ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                  value={formData.whatsapp}
                  onChange={handlePhoneChange}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Rubro (Opcional)</label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.rubro}
                  onChange={(e) => setFormData({...formData, rubro: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tu Mensaje o Proyecto</label>
              <textarea
                required
                rows={4}
                className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                value={formData.mensaje}
                onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:bg-slate-700"
            >
              {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
            </button>

            {status === 'validation-error' && <p className="text-red-400 text-center font-bold">{errorMessage}</p>}
            {status === 'success' && <p className="text-cyan-400 text-center font-bold">¡Mensaje enviado con éxito! Nos vemos pronto. ✨</p>}
            {status === 'error' && <p className="text-red-400 text-center font-bold">Error al enviar. Inténtalo de nuevo.</p>}
          </form>
        </div>
      </div>
    </div>
  );
}