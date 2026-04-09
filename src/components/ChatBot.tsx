"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola! Soy el Asistente DigitalBite ✨ ¿En qué te puedo ayudar hoy? Pregúntame cómo crear imágenes o videos." }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setInputMsg("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviar historial sin el mensaje actual que se envia en la prop `message`
        body: JSON.stringify({
          history: messages.slice(1), // omitimos el mensaje de bienvenida local para no marear a Gemini, o enviamos todo
          message: userText
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${data.error || 'Algo salió mal'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ No pude conectarme con el servidor. Verifica tu conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 md:bottom-24 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl rounded-full w-14 h-14 flex items-center justify-center text-2xl transition-transform hover:-translate-y-1 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Abrir asistente de chat"
      >
        <span aria-hidden="true">🤖</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 w-[calc(100vw-32px)] md:w-[380px] h-[550px] max-h-[85vh] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-2xl z-[400] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-auto">
          {/* Header */}
          <div className="bg-indigo-600 p-4 md:p-5 flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-500 z-0"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner backdrop-blur-sm">🤖</div>
              <div>
                <h3 className="font-black text-white text-md tracking-tight leading-none">Asistente DigitalBite</h3>
                <span className="text-indigo-100 text-[11px] font-medium flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> En línea
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50 relative custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-[12px] flex items-center justify-center shrink-0 mr-2 mt-auto mb-1">✨</div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-br-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm whitespace-pre-wrap'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-[10px] flex items-center justify-center shrink-0 mr-2 mt-auto mb-1 opacity-60">✨</div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-end">
              <textarea
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputMsg.trim()) handleSend(e);
                  }
                }}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-slate-50 border border-slate-200 rounded-[20px] pl-4 pr-12 py-3 text-sm text-slate-700 min-h-[50px] max-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none custom-scrollbar"
                rows={1}
              />
              <button 
                type="submit"
                disabled={!inputMsg.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-indigo-600 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors shadow-sm disabled:shadow-none"
              >
                <span aria-hidden="true" className="ml-0.5">↑</span>
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[9px] text-slate-400">DigitalBite AI puede cometer errores. Revisa la información.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
