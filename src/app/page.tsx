"use client";

import { useState } from 'react';

const LogoSantisoft = ({ className = "h-10 w-10" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" className="fill-slate-900 stroke-blue-500" strokeWidth="4"/>
    <path d="M35 40L50 30L65 40V60L50 70L35 60V50" className="stroke-cyan-400" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Home() {
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
          fecha: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })
        }),
      });

      if (response.ok) {
        setModalStatus('success');
        setFormData({ nombre: '', email: '', whatsapp: '' });
        setTimeout(() => setIsModalOpen(false), 3000); 
      } else {
        setModalStatus('error');
      }
    } catch (error) {
      setModalStatus('error');
    }
  };

  return (
    <div className="overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pb-24 px-6 text-center pt-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/30 blur-[120px] -z-10 animate-[blob_7s_infinite]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] -z-10 animate-[blob_7s_infinite] animation-delay-2000"></div>
        
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            DESARROLLO DE SOFTWARE IMPULSADO POR IA
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-white drop-shadow-md">
            Sitios Web y Apps <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              en tiempo récord.
            </span>
          </h1>
          
          <p className="text-slate-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed mb-12 font-medium">
            Utilizamos Inteligencia Artificial avanzada para construir la plataforma que tu negocio necesita. <strong className="text-white">No hay límites para la creación ni para tus necesidades.</strong> Si puedes imaginarlo, nosotros lo desarrollamos.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a href="/contacto" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all hover:scale-105 shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)]">
              Hacer mi idea realidad
            </a>
            <a href="/automatizacion-rrss#demo" className="px-8 py-4 bg-transparent border border-cyan-500/50 text-cyan-400 rounded-2xl font-bold text-lg hover:bg-cyan-500/10 transition-all flex justify-center items-center gap-2">
              <span className="text-xl">✨</span> Probar IA en vivo
            </a>
          </div>
        </div>
      </section>

      {/* BLOQUE DE SOLUCIONES DESTACADAS */}
      <div className="max-w-5xl mx-auto space-y-8 mb-16 relative z-10 px-6">
        
        {/* BANNER DESTACADO 1: RRSS */}
        <section className="bg-gradient-to-r from-cyan-500/40 to-blue-600/40 p-[2px] rounded-[2rem] shadow-[0_0_50px_-10px_rgba(34,211,238,0.4)] overflow-hidden hover:scale-[1.02] transition-transform duration-500">
          <div className="bg-slate-900/95 backdrop-blur-xl p-8 md:p-12 rounded-[1.9rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 blur-[80px] pointer-events-none"></div>
            
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 border border-cyan-500/30 animate-pulse">
                <span className="text-base">🔥</span> NUEVO SERVICIO ESTRELLA
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                Redes Sociales en <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 italic">Piloto Automático</span>
              </h2>
              <p className="text-slate-300 text-lg md:text-xl font-medium">
                Descubre cómo nuestro ecosistema <strong className="text-white">n8n + IA</strong> puede pensar, diseñar, redactar y publicar por ti. Libera docenas de horas a la semana.
              </p>
            </div>

            <div className="w-full md:w-auto shrink-0 relative z-10">
              <a href="/automatizacion-rrss" className="block w-full text-center px-10 py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-all hover:scale-105 active:scale-95 border border-cyan-400">
                VER CÓMO FUNCIONA →
              </a>
            </div>
          </div>
        </section>

        {/* BANNER DESTACADO 2: HERRAMIENTA GASTRONÓMICA */}
        <section className="bg-gradient-to-r from-orange-500/40 to-red-600/40 p-[2px] rounded-[2rem] shadow-[0_0_50px_-10px_rgba(249,115,22,0.3)] overflow-hidden hover:scale-[1.02] transition-transform duration-500">
          <div className="bg-slate-900/95 backdrop-blur-xl p-8 md:p-12 rounded-[1.9rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 blur-[80px] pointer-events-none"></div>
            
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 border border-orange-500/30">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                HERRAMIENTA REVOLUCIONARIA
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                Estudio IA para el <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 italic">Rubro Gastronómico</span>
              </h2>
              <p className="text-slate-300 text-lg md:text-xl font-medium mb-4">
                Genera banners promocionales e historias de video cinematográficas en 4K sin costosas sesiones de fotos. Solo ingresa los ingredientes y la IA cocina por ti.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-black/50 border border-slate-700 text-slate-300 px-3 py-1 rounded-md text-xs font-bold">🍔 IA Fotorealista</span>
                <span className="bg-black/50 border border-slate-700 text-slate-300 px-3 py-1 rounded-md text-xs font-bold">🎬 Videos Veo 3</span>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 relative z-10">
              <a href="/gastronomico" className="block w-full text-center px-10 py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95 border border-orange-400">
                PROBAR GENERADOR →
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* SECCIÓN SERVICIOS */}
      <section id="servicios" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-800 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Nuestros Servicios <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 italic drop-shadow-lg">Ilimitados</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Soluciones de vanguardia donde tu imaginación es el único límite.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group p-8 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-blue-500/50 transition-all duration-500 shadow-2xl flex flex-col h-full hover:shadow-blue-500/10">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30 group-hover:scale-110 transition-transform shadow-inner">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Webs & Apps Ilimitadas</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow">
              Creamos plataformas en tiempo récord. La IA nos permite programar funcionalidades a medida sin las barreras técnicas tradicionales.
            </p>
            <div className="border-t border-slate-700 pt-6 mt-auto">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-md bg-black/50 border border-slate-700 text-blue-400 text-xs font-bold tracking-wide">SITIOS WEB</span>
                <span className="px-3 py-1.5 rounded-md bg-black/50 border border-slate-700 text-blue-400 text-xs font-bold tracking-wide">APPS MÓVILES</span>
              </div>
            </div>
          </div>

          <div className="group p-8 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl flex flex-col h-full hover:shadow-cyan-400/10">
            <div className="w-14 h-14 bg-cyan-400/20 rounded-2xl flex items-center justify-center mb-8 border border-cyan-400/30 group-hover:scale-110 transition-transform shadow-inner">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">RRSS en Piloto Automático</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow">
              La IA genera el diseño y el copy perfecto y lo publica en Instagram y Facebook por ti.
            </p>
            <div className="border-t border-slate-700 pt-6 mt-auto">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-md bg-black/50 border border-slate-700 text-cyan-400 text-xs font-bold tracking-wide">POSTS IA RRSS</span>
              </div>
            </div>
          </div>

          <div className="group p-8 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-indigo-400/50 transition-all duration-500 shadow-2xl flex flex-col h-full hover:shadow-indigo-400/10">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/30 group-hover:scale-110 transition-transform shadow-inner">
              <span className="text-3xl">⚙️</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Automatización n8n</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow">
              Conectamos todas tus herramientas para que tu empresa opere sin fricciones manuales.
            </p>
            <div className="border-t border-slate-700 pt-6 mt-auto">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-md bg-black/50 border border-slate-700 text-indigo-400 text-xs font-bold tracking-wide">SISTEMAS CRM</span>
                <span className="px-3 py-1.5 rounded-md bg-black/50 border border-slate-700 text-indigo-400 text-xs font-bold tracking-wide">FLUJOS n8n</span>
              </div>
            </div>
          </div>

          <div className="group p-8 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-purple-400/50 transition-all duration-500 shadow-2xl flex flex-col h-full hover:shadow-purple-400/10">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30 group-hover:scale-110 transition-transform shadow-inner">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Agentes IA Autónomos</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow">
              Desplegamos empleados digitales 24/7 capaces de atender clientes y gestionar requerimientos complejos.
            </p>
            <div className="border-t border-slate-700 pt-6 mt-auto">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-md bg-black/50 border border-slate-700 text-purple-400 text-xs font-bold tracking-wide">AGENTES IA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES / PROPUESTAS DE VALOR */}
      <section id="precios" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-slate-800">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-white uppercase tracking-[0.2em] drop-shadow-md">
          Propuestas de Valor
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <SimplePlan 
            title="Starter" 
            desc="Ideal para digitalización rápida y presencia profesional." 
            details={["Web Landing en Next.js", "Integración básica de Formulario", "Optimización SEO Core", "Soporte por correo"]}
            onSelect={() => openModal("Starter")}
          />
          <SimplePlan 
            title="Business" 
            desc="Omnicanalidad y automatización avanzada con IA." 
            highlighted={true} 
            details={["Ecosistema Red Social", "Flujos n8n personalizados", "Automatización de Contenido con IA", "Dashboard de Resultados"]}
            onSelect={() => openModal("Business")}
          />
          <SimplePlan 
            title="Enterprise" 
            desc="Sistemas robustos de CRM y desarrollo sin límites." 
            details={["Ecosistema Multi-red Social", "Flujos n8n a medida", "Generación de Contenido con IA", "Dashboard de Resultados", "Agentes de IA exclusivos", "Infraestructura escalable", "Consultoría Estratégica"]}
            onSelect={() => openModal("Enterprise")}
          />
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="py-24 px-6 relative z-10 border-t border-slate-800">
        <div className="max-w-4xl mx-auto bg-slate-900/80 p-8 md:p-16 rounded-[40px] border border-slate-700 shadow-2xl relative overflow-hidden text-center backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-0"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 text-white">¿Listo para escalar?</h2>
            <p className="text-slate-300 mb-10 text-lg">Webs, Apps o Sistemas complejos. Cotiza con nosotros y desarrollaremos tu idea en tiempo récord.</p>
            <a href="/contacto" className="inline-block px-10 py-5 bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 transition-all">
              IR AL FORMULARIO DE COTIZACIÓN
            </a>
          </div>
        </div>
      </section>

      {/* MODAL SOLICITUD DE PLAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-white mb-2">Plan <span className="text-blue-400">{selectedPlan}</span></h3>
            <p className="text-slate-400 text-sm mb-6">Déjanos tus datos y te enviaremos toda la información detallada al instante.</p>
            
            {modalStatus === 'success' ? (
              <div className="p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-center">
                <span className="text-4xl block mb-2">✨</span>
                <p className="text-cyan-400 font-bold">¡Solicitud enviada!</p>
                <p className="text-slate-300 text-sm mt-2">Revisa tu bandeja de entrada.</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre</label>
                  <input required type="text" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input required type="email" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
                  <input required type="tel" placeholder="+569..." className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                </div>
                <button type="submit" disabled={modalStatus === 'loading'} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition-all disabled:bg-slate-700 mt-2">
                  {modalStatus === 'loading' ? 'ENVIANDO...' : 'SOLICITAR INFORMACIÓN'}
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

// COMPONENTE DE PLANES
function SimplePlan({ title, desc, details, highlighted = false, onSelect }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border backdrop-blur-md transition-all duration-500 flex flex-col h-full ${
      highlighted 
        ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] scale-105 z-10' 
        : 'border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:bg-slate-800'
    }`}>
      <h4 className={`font-black text-3xl mb-4 ${highlighted ? 'text-blue-400' : 'text-white'}`}>{title}</h4>
      <p className="text-slate-300 text-sm leading-relaxed mb-8 font-medium h-10">{desc}</p>
      
      <ul className="space-y-4 text-left mb-8 flex-grow">
        {details.map((item: string, index: number) => (
          <li key={index} className="flex items-start gap-3 text-sm text-slate-200">
            <span className="text-blue-500 font-bold mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button onClick={onSelect} className={`w-full py-4 text-center rounded-xl font-bold transition-all ${
        highlighted
          ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
          : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'
      }`}>
        Solicitar Información
      </button>
    </div>
  );
}