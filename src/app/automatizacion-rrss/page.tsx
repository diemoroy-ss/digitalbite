import React from 'react';
import Link from 'next/link';
import DemoForm from '../DemoForm';

export default function RRSSAutomationPage() {
  return (
    <div className="overflow-x-hidden min-h-screen bg-[#030712]">
      
      {/* HERO SECTION CON VIDEO */}
      <section className="relative pt-20 pb-24 px-6 text-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/20 blur-[150px] -z-10 animate-[blob_7s_infinite]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] -z-10 animate-[blob_7s_infinite] animation-delay-2000"></div>
        
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            ECOSISTEMA N8N + IA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] text-white drop-shadow-md">
            Tus Redes Sociales en <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Piloto Automático.
            </span>
          </h1>
          
          <p className="text-slate-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed mb-12 font-medium">
            Olvídate de crear posts manualmente. Diseñamos un flujo de trabajo inteligente en <strong className="text-white">n8n</strong> que piensa, diseña, redacta y publica contenido de alta calidad por ti, 24/7.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-16">
            <Link href="/contacto" className="px-8 py-4 bg-cyan-600 text-white rounded-2xl font-bold text-lg hover:bg-cyan-500 transition-all hover:scale-105 shadow-[0_0_30px_-5px_rgba(8,145,178,0.5)]">
              Cotizar mi Automatización
            </Link>
            <a href="#demo" className="px-8 py-4 bg-slate-900 border border-slate-700 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-2">
              Ver Demo en Vivo ✨
            </a>
          </div>

          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-700 shadow-[0_0_50px_rgba(8,145,178,0.2)] bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none"></div>
            
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full aspect-video object-cover opacity-80"
            >
              <source src="/videos/rrss-demo.mp4" type="video/mp4" />
              Tu navegador no soporta la etiqueta de video.
            </video>

            {/* OVERLAY OPTIMIZADO PARA MÓVIL Y DESKTOP */}
            <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 z-20 flex flex-col gap-2 md:gap-3 scale-[0.85] md:scale-100 origin-bottom-left">
               <div className="flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl border border-white/10 shadow-lg">
                  <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
                  <span className="text-white text-xs md:text-sm font-bold tracking-wide">n8n Workflow Activo</span>
               </div>
               <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-white/5 w-fit">
                  <span className="text-cyan-400 text-[10px] md:text-xs font-mono">200 OK</span>
                  <span className="text-slate-300 text-[10px] md:text-xs">Publicando en Instagram...</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-800 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">¿Cómo funciona el flujo?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Conectamos las mejores herramientas del mundo a través de n8n para crear un proceso sin fricciones.</p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-xl relative">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl font-black text-slate-400 mb-6 border border-slate-600 absolute -top-6 left-8">1</div>
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-white mb-3">La Idea</h3>
              <p className="text-slate-400 text-sm">Tú solo envías una idea simple por Telegram, WhatsApp o un formulario. El sistema se activa al instante.</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-xl relative">
              <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center text-xl font-black text-blue-400 mb-6 border border-blue-500/50 absolute -top-6 left-8 shadow-[0_0_15px_rgba(59,130,246,0.5)]">2</div>
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-white mb-3">Magia con IA</h3>
              <p className="text-slate-400 text-sm">Gemini o ChatGPT analizan tu idea, redactan el copy perfecto con emojis y crean un prompt visual profesional.</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-xl relative">
              <div className="w-12 h-12 bg-cyan-900/50 rounded-full flex items-center justify-center text-xl font-black text-cyan-400 mb-6 border border-cyan-500/50 absolute -top-6 left-8 shadow-[0_0_15px_rgba(34,211,238,0.5)]">3</div>
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-3">Diseño Visual</h3>
              <p className="text-slate-400 text-sm">Sistemas como Midjourney generan una imagen hiperrealista y de alta conversión basada en el prompt de la IA.</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-xl relative">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center text-xl font-black text-indigo-400 mb-6 border border-indigo-500/50 absolute -top-6 left-8 shadow-[0_0_15px_rgba(99,102,241,0.5)]">4</div>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-3">Publicación</h3>
              <p className="text-slate-400 text-sm">n8n publica automáticamente el post en Instagram, Facebook, LinkedIn o te lo envía por WhatsApp para aprobación.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-slate-800">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black text-white mb-6">El fin del bloqueo creativo.</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Mantener una presencia constante en redes sociales exige tiempo y creatividad que podrías estar invirtiendo en cerrar ventas. Nuestro sistema n8n actúa como un <strong className="text-cyan-400">Community Manager y Diseñador 24/7</strong>.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">✓</div>
                Ahorra más de 20 horas semanales en creación de contenido.
              </li>
              <li className="flex items-center gap-4 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">✓</div>
                Calidad visual digna de una agencia profesional.
              </li>
              <li className="flex items-center gap-4 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">✓</div>
                Estrategia omnicanal: Publica en múltiples redes.
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 rounded-[3rem] blur-xl"></div>
            <div className="bg-slate-900 border border-slate-700 rounded-[3rem] p-8 relative z-10 shadow-2xl">
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-slate-800 rounded-2xl flex items-center gap-4 border border-slate-700">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">💬</div>
                  <div>
                    <p className="text-white font-bold text-sm">Webhook Triggers</p>
                    <p className="text-slate-400 text-xs">Esperando nueva idea...</p>
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-slate-700 mx-auto"></div>
                <div className="p-4 bg-slate-800 rounded-2xl flex items-center gap-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">✨</div>
                  <div>
                    <p className="text-white font-bold text-sm">Google Gemini</p>
                    <p className="text-slate-400 text-xs">Generando Copy y Prompt</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DEMO EN VIVO */}
      <section id="demo" className="py-24 px-6 relative z-10 border-t border-slate-800">
        <div className="max-w-4xl mx-auto p-1 rounded-[2.5rem] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 shadow-[0_0_40px_-10px_rgba(34,211,238,0.2)]">
          <div className="bg-[#030712] p-8 md:p-14 rounded-[2.4rem]">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-cyan-500/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> DEMO EN VIVO
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">Prueba nuestra IA ahora</h2>
              <p className="text-slate-400 text-lg">Ingresa los datos y una idea simple. La IA diseñará un post con imagen y copy, y lo enviará a tu WhatsApp.</p>
            </div>
            <DemoForm />
          </div>
        </div>
      </section>
    </div>
  );
}