"use client";

import { useState } from "react";

interface WorkflowDef {
  id: string;
  name: string;
  method: "POST" | "GET";
  url: string;
  isEnv?: boolean;
  description: string;
  nodesDesc: string;
  mockPayload: any;
  expectedResponseSnippet: string;
}

const WORKFLOWS: WorkflowDef[] = [
  {
    id: "lead_contacto",
    name: "Lead de Contacto (Landing Page)",
    method: "POST",
    url: "NEXT_PUBLIC_N8N_WEBHOOK_URL (Var Entorno)",
    isEnv: true,
    description: "Recibe los datos del formulario de contacto/demo desde la web pública y notifica al área comercial.",
    nodesDesc: "1. Webhook Trigger\n2. IF (Es Demo o Form Genérico)\n3. Notion/Trello (Crear ficha)\n4. Slack/WhatsApp (Notificar equipo ventas)",
    mockPayload: {
      tipo_formulario: "demo_rrss",
      nombre: "Prueba Test",
      email: "prueba@test.com",
      telefono: "+56912345678",
      rubro: "Sushi",
      idea: "Quiero probar la plataforma",
      origen: "admin-tester",
      fecha: new Date().toISOString()
    },
    expectedResponseSnippet: `// 200 OK\n"Recibido con éxito" // (Generalmente no retorna JSON sino status HTTP 200)`
  },
  {
    id: "gen_video_rrss",
    name: "🎬 Generador Video RRSS (1:1 / 9:16)",
    method: "POST",
    url: "https://n8n.santisoft.cl/webhook-test/generador-gastronomico",
    description: "Inicia la renderización pesada de video post/story cuando el usuario presiona 'Hacer Video' en el dashboard.",
    nodesDesc: "1. Webhook Trigger\n2. Set Vars (Toma código pedido)\n3. HTTP Request (Datocms o render farm)\n4. Wait (Hasta que termine el video)\n5. WhatsApp API (Enviar Video al cliente)",
    mockPayload: {
      tipo: "video",
      codigoPedido: "test_pedido_123",
      layoutId: "pizza_01",
      categoria: "pizza",
      celular: "+56999999999",
      correo: "test@correo.com",
      formato: "story"
    },
    expectedResponseSnippet: `// 200 OK\n{\n  "success": true,\n  "msg": "Proceso de video iniciado en background"\n}`
  },
  {
    id: "gen_video_tv",
    name: "📺 Generador Video Menu Wall (TV 16:9)",
    method: "POST",
    url: "https://n8n.santisoft.cl/webhook/generador-gastronomico-video-tv",
    description: "Versión horizontal del renderizador de video de catálogo. Actuá sobre las templates 1920x1080.",
    nodesDesc: "Idéntico al RRSS pero apunta a composiciones de After Effects/Plantillas diferentes (16:9).",
    mockPayload: {
      tipo: "video",
      codigoPedido: "test_pedido_456",
      layoutId: "menu_tv_01",
      categoria: "general",
      celular: "+56999999999",
      correo: "test@correo.com",
      formato: "tv_h"
    },
    expectedResponseSnippet: `// 200 OK\n{\n  "success": true,\n  "msg": "Video TV Encolado"\n}`
  },
  {
    id: "enviar_renders_estaticos",
    name: "📤 Enviar Renders Imágenes",
    method: "POST",
    url: "https://n8n.santisoft.cl/webhook/generador-gastronomico-enviar",
    description: "El usuario generó banners de imagen statica y pide que se le envíen por WhatsApp y Correo.",
    nodesDesc: "1. Webhook (Recibe array de URLs limitadas)\n2. Resend / SMTP Node (Enviar Mail HTML con imgs)\n3. WhatsApp Business (Enviar Template Text + Links)",
    mockPayload: {
      urls: ["https://butterfly.santisoft.cl/preview/test1.jpg"],
      correo: "test@correo.com",
      celular: "+56999999999"
    },
    expectedResponseSnippet: `// 200 OK\n{\n   "dispatched": ["email", "whatsapp"]\n}`
  },
  {
    id: "ia_start",
    name: "🧠 IA: Iniciar Scraping y Banner",
    method: "POST",
    url: "https://n8n.santisoft.cl/webhook/banner-ia",
    description: "Comienza la magia de IA. Visita redes del usuario para extraer colores, luego crea el prompt y llama a API de imágenes.",
    nodesDesc: "1. Webhook\n2. Switch (Verificar qué redes envió)\n3. HTTP (Scraping de perfiles usando Apify o similar)\n4. OpenAI Node (Generar Prompt visual)\n5. OpenAI Node (DALL-E 3 para generar imagen)\n6. Firebase Node (Guardar {ticketId: status, url})",
    mockPayload: {
      web: "https://www.google.cl",
      facebook: "@test",
      instagram: "@test",
      idea: "Hamburguesa volando en el espacio negro",
      ticketId: "test_ticket_123"
    },
    expectedResponseSnippet: `// 200 OK\n// (n8n corta la conexión de inmediato y procesa en background)`
  },
  {
    id: "ia_status",
    name: "🔄 IA: Polling Status Check",
    method: "GET",
    url: "https://n8n.santisoft.cl/webhook/banner-ia-status",
    description: "El frontend le pregunta a n8n (o directo a DB) cada 3 segundos si el ticketId de IA ya terminó y rescatar la imagen.",
    nodesDesc: "1. Webhook GET\n2. Firebase / DB Node (Find ticketId)\n3. IF (status === 'completed') -> Retorna url\n4. ELSE -> Retorna {status: 'processing'}",
    mockPayload: {
      ticketId: "test_ticket_123"
    },
    expectedResponseSnippet: `// 200 OK\n{\n  "status": "completed",\n  "url": "https://url-a-la-image-ia.com/imagen.png"\n}`
  }
];

export default function AdminWorkflowsPage() {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string, status: number, data: string, error?: boolean } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const testWebhook = async (wf: WorkflowDef) => {
    setTestingId(wf.id);
    setTestResult(null);

    let apiUrl = wf.isEnv ? process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL : wf.url;

    if (!apiUrl) {
       setTestResult({ id: wf.id, status: 0, data: "❌ ERROR: URL NO ESTÁ DEFINIDA. Verifica las variables de entorno o la configuración.", error: true });
       setTestingId(null);
       return;
    }

    try {
      let finalUrl = apiUrl;
      let reqOptions: RequestInit = {
        method: wf.method,
      };

      if (wf.method === "POST") {
        reqOptions.headers = { "Content-Type": "application/json" };
        reqOptions.body = JSON.stringify(wf.mockPayload);
      } else if (wf.method === "GET") {
        const queryParams = new URLSearchParams(wf.mockPayload).toString();
        finalUrl = `${apiUrl}?${queryParams}`;
      }

      const res = await fetch(finalUrl, reqOptions);
      const text = await res.text();
      
      let parsed;
      try { parsed = JSON.stringify(JSON.parse(text), null, 2); } catch { parsed = text || "(Sin body)"; }

      setTestResult({
        id: wf.id,
        status: res.status,
        data: parsed,
        error: !res.ok
      });

    } catch (err: any) {
      setTestResult({
        id: wf.id,
        status: 0,
        data: err.toString(),
        error: true
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6 max-w-5xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span>🧠</span> Conexiones n8n (Workflows)
        </h1>
        <p className="text-slate-500 mt-2">
          Lista de todos los flujos de automatización que esta plataforma gatilla externamente vía Webhook hacia n8n. Puedes probarlos directamente.
        </p>
      </div>

      <div className="space-y-4">
        {WORKFLOWS.map((wf) => {
          const isExpanded = expandedId === wf.id;
          const isTesting = testingId === wf.id;
          const result = testResult?.id === wf.id ? testResult : null;

          return (
            <div key={wf.id} className="bg-white border text-sm border-slate-200 rounded-[20px] shadow-sm overflow-hidden transition-all">
              {/* Header Tópico */}
              <div 
                className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedId(isExpanded ? null : wf.id)}
              >
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-${wf.method === 'POST' ? 'indigo' : 'emerald'}-700 bg-${wf.method === 'POST' ? 'indigo' : 'emerald'}-50 border border-${wf.method === 'POST' ? 'indigo' : 'emerald'}-100`}>
                    {wf.method}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-[15px]">{wf.name}</h3>
                    <p className="text-slate-400 font-mono text-[11px] mt-0.5 truncate max-w-[200px] sm:max-w-md">{wf.isEnv ? "Env: NEXT_PUBLIC_N8N_WEBHOOK_URL" : wf.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); testWebhook(wf); }}
                    disabled={isTesting}
                    className={`px-4 py-2 font-bold text-xs rounded-xl transition-all shadow-sm ${isTesting ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5'}`}
                  >
                    {isTesting ? "⏳ Ejecutando..." : "▶ Probar"}
                  </button>
                  <span className="text-slate-300 ml-2 font-bold">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Resultado de Test Inline */}
              {result && (
                <div className={`px-5 py-3 border-y border-slate-100 flex flex-col gap-2 ${result.error ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                   <div className="flex items-center gap-2 font-bold text-xs">
                      {result.error ? <span className="text-rose-600">❌ Error (Status {result.status})</span> : <span className="text-emerald-600">✅ Éxito (Status {result.status})</span>}
                   </div>
                   <pre className={`font-mono text-[10px] p-3 rounded-xl overflow-x-auto ${result.error ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                     {result.data}
                   </pre>
                </div>
              )}

              {/* Detalle Acordeón */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* Col 1 */}
                   <div className="space-y-6 flex flex-col justify-start">
                     <div>
                       <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-widest mb-2 flex items-center gap-1">📋 Descripción</h4>
                       <p className="text-slate-600 text-[13px] leading-relaxed">{wf.description}</p>
                     </div>

                     <div>
                       <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-widest mb-2 flex items-center gap-1">⚙️ Flujo Interno en n8n (Estimado)</h4>
                       <pre className="text-slate-600 whitespace-pre-wrap font-mono text-[11px] bg-slate-100 p-3 rounded-xl border border-slate-200 leading-relaxed">
                         {wf.nodesDesc}
                       </pre>
                     </div>
                   </div>

                   {/* Col 2 */}
                   <div className="space-y-4">
                     <div>
                       <h4 className="font-black text-indigo-700 text-[11px] uppercase tracking-widest mb-2 flex items-center gap-1">⬆️ Variables Enviadas (Payload)</h4>
                       <pre className="font-mono text-[11px] bg-indigo-900 text-indigo-100 p-3 rounded-xl border-4 border-indigo-950 overflow-x-auto shadow-inner">
                         {JSON.stringify(wf.mockPayload, null, 2)}
                       </pre>
                     </div>

                     <div>
                       <h4 className="font-black text-emerald-600 text-[11px] uppercase tracking-widest mb-2 flex items-center gap-1">⬇️ Respuesta Esperada (Output)</h4>
                       <pre className="font-mono text-[11px] bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 overflow-x-auto">
                         {wf.expectedResponseSnippet}
                       </pre>
                     </div>
                   </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
