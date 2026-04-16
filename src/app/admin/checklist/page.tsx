"use client";

import { useState } from "react";
import Link from "next/link";

type ChecklistItem = {
  id: string;
  fase: string;
  title: string;
  status: "done" | "pending";
  description: React.ReactNode;
};

const ITEMS: ChecklistItem[] = [
  {
    id: "fase1-chatbot",
    fase: "Fase 1: Calificación (TOFU/MOFU)",
    title: "🤖 Chatbot SDR Activo",
    status: "done",
    description: (
      <>
        <h4 className="font-bold text-slate-800 mb-2">Ya Implementado en la App</h4>
        <p className="text-sm text-slate-600 mb-4">
          El bot de la plataforma ya no es un simple bot de ayuda. Ahora persigue una agenda de calificación sutil: pregunta por locales y tipo de comida. Si el usuario tiene múltiples locales (Kitchen Partner), le promueve de inmediato agendar una consultoría gratuita.
        </p>
      </>
    )
  },
  {
    id: "fase1-wsp",
    fase: "Fase 1: Calificación (TOFU/MOFU)",
    title: "💬 Chat de Recepción WhatsApp (n8n/ManyChat)",
    status: "pending",
    description: (
      <>
        <h4 className="font-bold text-slate-800 mb-2">Implementación Sugerida por Gemini</h4>
        <p className="text-sm text-slate-600 mb-4">
          <strong>El Problema:</strong> Cuando el Asistente DigitalBite envía a un 'Kitchen Partner' a tu enlace de WhatsApp, el cliente te habla de forma manual. Podría perderse entre otros mensajes.
        </p>
        <p className="text-sm text-slate-600 mb-4">
          <strong>Qué hacer en n8n / ManyChat:</strong><br/>
          1. Configura un flujo que escuche los mensajes entrantes a la línea de ventas.<br/>
          2. Si el mensaje contiene el texto por defecto de la oferta de consultoría (ej: "Hola, quiero reservar mi cupo..."), etiqueta automáticamente el contacto como "VIP Partner" en tu CRM.<br/>
          3. Envía una notificación webhook a tu equipo (Slack/WSP Interno) diciendo: 🚨 "Un perfil Alto acaba de ser calificado por la plataforma, ¡atiéndelo rápido!".
        </p>
      </>
    )
  },
  {
    id: "fase2-cat",
    fase: "Fase 2: Personalización (Demo)",
    title: "🧠 Detección de Intención IA",
    status: "done",
    description: (
      <>
        <h4 className="font-bold text-slate-800 mb-2">Ya Implementado en la App</h4>
        <p className="text-sm text-slate-600 mb-4">
          Mientras la demo renderiza la foto (Make), usamos Gemini 2.5 Flash en paralelo para inferir de qué trata el requerimiento del usuario y al abrir el editor, se auto-seleccionan las plantillas más afines a ese rubro, acelerando la percepción de valor.
        </p>
      </>
    )
  },
  {
    id: "fase2-data",
    fase: "Fase 2: Personalización (Demo)",
    title: "📊 Dashboard de Análisis de Búsquedas",
    status: "pending",
    description: (
      <>
        <h4 className="font-bold text-slate-800 mb-2">Implementación Sugerida por Gemini</h4>
        <p className="text-sm text-slate-600 mb-4">
          <strong>El Problema:</strong> La plataforma sabe inteligentemente qué están pidiendo los leads de la demo, pero no hay un panel donde tú puedas verlo consolidado para tomar decisiones de negocio y marketing.
        </p>
        <p className="text-sm text-slate-600 mb-4">
          <strong>Qué hacer (Analytics):</strong><br/>
          Arma un simple Webhook desde la app de Next.js hacia Make o n8n cada vez que el usuario hace clic en "Generar Lienzo", enviando la categoría detectada. Make depositará esto en un Google Sheet en tiempo real. 
          Así sabrás objetivamente por ejemplo que el "65% de los prospectos anónimos de este mes tienen Pizzerías" y podrías subir tus precios o priorizar esos Ads.
        </p>
      </>
    )
  },
  {
    id: "fase3-lead",
    fase: "Fase 3: Cierre (BOFU)",
    title: "🔒 Protección y Gated Download",
    status: "done",
    description: (
      <>
        <h4 className="font-bold text-slate-800 mb-2">Ya Implementado en la App</h4>
        <p className="text-sm text-slate-600 mb-4">
          Integramos una marca de agua central (`logo-digitalbite.png`) y condicionamos la descarga de baja resolución a una recolección forzada del email del prospecto, volcando estos correos a la base de datos interna `demo_leads`.
        </p>
      </>
    )
  },
  {
    id: "fase3-nurt",
    fase: "Fase 3: Cierre (BOFU)",
    title: "📧 Secuencia Automática 24H",
    status: "pending",
    description: (
      <>
        <h4 className="font-bold text-slate-800 mb-2">Implementación Sugerida por Gemini</h4>
        <p className="text-sm text-slate-600 mb-4">
          <strong>El Oportunidad:</strong> Miles de personas entrarán, llenarán la demo, se llevarán su imagen (Borrador) y no sacarán la billetera al instante.
        </p>
        <p className="text-sm text-slate-600 mb-4">
          <strong>Qué hacer en n8n:</strong><br/>
          1. Escuchar la colección `demo_leads` en Firestore (o agregar una API que gatille a n8n).<br/>
          2. Usar un nodo "Wait" de 24 o 48 horas.<br/>
          3. Finalizada la espera, conectar al CRM y verificar: "¿Este email ya está en la colección de usuarios Premium?".<br/>
          4. Si es falso, enviar mediante Mailchimp/Sendgrid/ActiveCampaign el correo: <em>"Hey, sabemos que te gustó lo que DigitalBite puede hacer. Adquiere ahora el plan Pro y quita la marca de agua de todos tus futuros diseños."</em>
        </p>
      </>
    )
  }
];

export default function ChecklistFunnelPage() {
  const [selectedId, setSelectedId] = useState<string>("fase1-wsp");

  const selectedItem = ITEMS.find(i => i.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-32">
      {/* Header */}
      <div className="w-full max-w-5xl px-6 mb-8 mt-12 flex justify-between items-center">
         <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black tracking-widest uppercase rounded-full mb-3">
               DigitalBite Studio Interno
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Arquitectura de IA & Funnel</h1>
            <p className="text-slate-500 mt-2 max-w-xl">Supervisa qué piezas del motor de automatización ya están construidas en la App y qué falta construir por fuera (n8n, Make) para cerrar el embudo comercial.</p>
         </div>
         <Link href="/dashboard" className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm">
            ← Volver al App
         </Link>
      </div>

      <div className="w-full max-w-5xl px-6 flex flex-col md:flex-row gap-6 items-start h-[600px]">
        {/* Lado izquierdo: Lista */}
        <div className="w-full md:w-[40%] bg-white rounded-[32px] border border-slate-200 shadow-md overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-slate-800">Checklist Operativo</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
               {ITEMS.map((item) => (
                  <button 
                     key={item.id} 
                     onClick={() => setSelectedId(item.id)}
                     className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col ${
                        selectedId === item.id 
                           ? 'bg-indigo-50/80 border-indigo-200 ring-2 ring-indigo-500/20 shadow-sm transform scale-[1.02]' 
                           : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                     }`}
                  >
                     <span className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-wider">{item.fase}</span>
                     <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${selectedId === item.id ? 'text-indigo-900' : 'text-slate-700'}`}>{item.title}</span>
                        {item.status === 'done' ? (
                           <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                           </div>
                        ) : (
                           <div className="w-5 h-5 border-2 border-amber-400 border-dashed rounded-full flex items-center justify-center shrink-0 animate-spin-slow">
                           </div>
                        )}
                     </div>
                  </button>
               ))}
            </div>
        </div>

        {/* Lado derecho: Descripción interactiva de Gemini */}
        <div className="w-full md:flex-1 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[32px] shadow-xl p-8 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            
            {selectedItem ? (
               <div className="relative z-10 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/5 backdrop-blur-sm">🤖</div>
                     <div>
                        <span className="text-indigo-300 font-bold text-xs uppercase tracking-widest leading-none">Análisis Gemini</span>
                        <h2 className="text-white font-black text-xl leading-tight mt-1">{selectedItem.title}</h2>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 mb-8">
                     <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border ${selectedItem.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        Estado: {selectedItem.status === 'done' ? 'Completado' : 'Pendiente Externo'}
                     </span>
                     <span className="text-slate-400 text-xs font-medium">{selectedItem.fase}</span>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-inner flex-1 overflow-y-auto">
                     {selectedItem.description}
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                  Selecciona un ítem de la lista para ver el reporte de la IA.
               </div>
            )}
        </div>
      </div>
    </div>
  );
}
