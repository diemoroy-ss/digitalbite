"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function PlanesGastronomicosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [modalStatus, setModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ nombre: '', email: '', whatsapp: '' });

  const openModal = (planName: string) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
    setModalStatus('idle');
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalStatus('loading');

    try {
      const response = await fetch('https://n8n.santisoft.cl/webhook/solicitar-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
          origen: 'Planes Gastronómicos',
          fecha: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })
        }),
      });

      if (response.ok) {
        setModalStatus('success');
        setFormData({ nombre: '', email: '', whatsapp: '' });
        setTimeout(() => setIsModalOpen(false), 4000); 
      } else {
        setModalStatus('error');
      }
    } catch (error) {
      setModalStatus('error');
    }
  };

  return (
    /* El contenedor principal ahora usa "fixed inset-0 z-50 overflow-y-auto" 
       para cubrir completamente el menú corporativo y la barra de urgencia */
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0a] font-sans text-stone-100 selection:bg-orange-500 selection:text-white">
      
      {/* Fondo Dinámico fijado al fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] rounded-full bg-red-600/20 blur-[150px]"></div>
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="relative z-10">
        
        {/* Navegación Superior */}
        <nav className="w-full p-6 flex justify-between items-center max-w-6xl mx-auto">
          <Link 
            href="/gastronomico" 
            className="group flex items-center space-x-3 text-sm font-bold tracking-widest uppercase text-stone-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10"
          >
            <span className="transform transition-transform group-hover:-translate-x-1 text-orange-500">←</span>
            <span>Volver al Generador</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="pt-12 pb-16 px-4 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 font-semibold text-sm tracking-wide shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            Precios y Planes
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            Sube el nivel de tu <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              marketing digital
            </span>
          </h1>
          <p className="mt-6 text-lg text-stone-400 font-light leading-relaxed">
            Elige el plan que mejor se adapte a tu restaurante. Generación ilimitada, integraciones exclusivas y calidad cinematográfica.
          </p>
        </header>

        {/* Tarjetas de Planes */}
        <main className="max-w-6xl mx-auto px-4 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Plan 1 */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col">
              <h3 className="text-2xl font-black text-white mb-2">Visual Starter</h3>
              <p className="text-stone-400 text-sm mb-6 h-10">Banners estáticos de alta conversión generados por IA fotorealista.</p>
              <div className="text-4xl font-black text-white mb-8">$29.990<span className="text-sm font-normal text-stone-500">/mes</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center text-sm text-stone-300"><span className="text-orange-500 mr-2 font-bold">✓</span> 30 Banners IA al mes</li>
                <li className="flex items-center text-sm text-stone-300"><span className="text-orange-500 mr-2 font-bold">✓</span> Uso de plantillas Cloudinary</li>
                <li className="flex items-center text-sm text-stone-300"><span className="text-orange-500 mr-2 font-bold">✓</span> Descarga en Alta Resolución</li>
              </ul>
              <button onClick={() => openModal('Visual Starter')} className="w-full py-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-all">
                Solicitar Plan
              </button>
            </div>

            {/* Plan 2 (Destacado) */}
            <div className="bg-gradient-to-b from-orange-900/40 to-black/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.2)] transform md:-translate-y-4 transition-all duration-300 flex flex-col relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-lg">
                Más Popular
              </div>
              <h3 className="text-2xl font-black text-orange-400 mb-2">Cine Veo 3</h3>
              <p className="text-stone-300 text-sm mb-6 h-10">La experiencia completa. Da vida a tus platos con videos cinematográficos.</p>
              <div className="text-4xl font-black text-white mb-8">$59.990<span className="text-sm font-normal text-stone-500">/mes</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center text-sm text-stone-200"><span className="text-orange-400 mr-2 font-bold">✓</span> Banners IA Ilimitados</li>
                <li className="flex items-center text-sm text-stone-200"><span className="text-orange-400 mr-2 font-bold">✓</span> 15 Videos Veo 3 al mes</li>
                <li className="flex items-center text-sm text-stone-200"><span className="text-orange-400 mr-2 font-bold">✓</span> Envío directo a WhatsApp</li>
                <li className="flex items-center text-sm text-stone-200"><span className="text-orange-400 mr-2 font-bold">✓</span> Soporte prioritario</li>
              </ul>
              <button onClick={() => openModal('Cine Veo 3')} className="w-full py-4 rounded-xl font-black bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg transition-all">
                Solicitar Plan
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col">
              <h3 className="text-2xl font-black text-white mb-2">Agencia n8n</h3>
              <p className="text-stone-400 text-sm mb-6 h-10">Instalamos este generador dentro de tu propia infraestructura.</p>
              <div className="text-4xl font-black text-white mb-8">A Medida</div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center text-sm text-stone-300"><span className="text-orange-500 mr-2 font-bold">✓</span> Flujos n8n propios</li>
                <li className="flex items-center text-sm text-stone-300"><span className="text-orange-500 mr-2 font-bold">✓</span> Conexión con tu Instagram</li>
                <li className="flex items-center text-sm text-stone-300"><span className="text-orange-500 mr-2 font-bold">✓</span> Creación de plantillas personalizadas</li>
              </ul>
              <button onClick={() => openModal('Agencia n8n')} className="w-full py-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-all">
                Cotizar Proyecto
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Modal de Contacto para Planes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-orange-500/30 p-8 md:p-10 rounded-[2.5rem] max-w-md w-full relative shadow-[0_0_50px_rgba(249,115,22,0.15)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-white text-xl">✕</button>
            
            <h3 className="text-2xl font-black text-white mb-2">Plan <span className="text-orange-400">{selectedPlan}</span></h3>
            <p className="text-stone-400 text-sm mb-8">Déjanos tus datos para activar tu cuenta o enviarte la propuesta formal.</p>
            
            {modalStatus === 'success' ? (
              <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                <span className="text-5xl block mb-4">✅</span>
                <p className="text-green-400 font-bold text-lg">¡Solicitud recibida!</p>
                <p className="text-stone-300 text-sm mt-2">Nos pondremos en contacto contigo a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Nombre</label>
                  <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input required type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
                  <input required type="tel" placeholder="+569..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                </div>
                <button type="submit" disabled={modalStatus === 'loading'} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4">
                  {modalStatus === 'loading' ? 'ENVIANDO...' : 'SOLICITAR PLAN'}
                </button>
                {modalStatus === 'error' && <p className="text-red-400 text-center text-sm font-bold mt-2">Error al conectar. Reintenta.</p>}
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}