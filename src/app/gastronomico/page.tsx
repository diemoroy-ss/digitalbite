"use client";

import { useState } from "react";
import Link from "next/link"; // Importamos Link para la navegación fluida

const TEMPLATES = [
  { 
    id: "hamburguesa", 
    name: "Smash Burger", 
    emoji: "🍔", 
    desc: "Estilo rústico, humo y fuego",
    layouts: [
      { id: "nxOjMA5gQOkLbprE63", name: "Clásico Neón", url: "https://res.cloudinary.com/dtrsycv80/image/upload/v1772831721/BAnnerComida_l1gafp.png" },
      { id: "hamb_layout_2", name: "Minimalista Dark", url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&h=400&fit=crop" },
      { id: "hamb_layout_3", name: "Urbano Grunge", url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=400&h=400&fit=crop" }
    ]
  },
  { 
    id: "coctel", 
    name: "Coctelería", 
    emoji: "🍹", 
    desc: "Cristalería elegante, neón",
    layouts: [
      { id: "coctel_layout_1", name: "Lounge Noche", url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400&h=400&fit=crop" },
      { id: "coctel_layout_2", name: "Tropical", url: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=400&h=400&fit=crop" },
      { id: "coctel_layout_3", name: "Gourmet Elegante", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=400&h=400&fit=crop" }
    ]
  },
  { 
    id: "helado", 
    name: "Postre Gourmet", 
    emoji: "🍨", 
    desc: "Tonos pastel, luz de estudio",
    layouts: [
      { id: "helado_layout_1", name: "Pop Art", url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=400&h=400&fit=crop" },
      { id: "helado_layout_2", name: "Cafetería Chic", url: "https://images.unsplash.com/photo-1556708687-34064390f7a5?q=80&w=400&h=400&fit=crop" },
      { id: "helado_layout_3", name: "Chocolatier", url: "https://images.unsplash.com/photo-1563805042-7684c8e9e533?q=80&w=400&h=400&fit=crop" }
    ]
  },
  { 
    id: "pizza", 
    name: "Pizza Napolitana", 
    emoji: "🍕", 
    desc: "Bordes tostados a la leña",
    layouts: [
      { id: "pizza_layout_1", name: "Trattoria Clásica", url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400&h=400&fit=crop" },
      { id: "pizza_layout_2", name: "Fuego y Leña", url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&h=400&fit=crop" },
      { id: "pizza_layout_3", name: "Delivery Express", url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=400&h=400&fit=crop" }
    ]
  },
];

export default function GastronomicoPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [previewLayout, setPreviewLayout] = useState(null);
  
  const [isLoadingImagen, setIsLoadingImagen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const [wantsVideo, setWantsVideo] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombreLocal: "",
    titulo: "",
    subtitulo: "",
    ingredientes: "",
    precio: "",
    mensaje: "",
    colorMarca: "#ff5a1f",
  });

  const [videoData, setVideoData] = useState({
    celular: "",
    correo: "",
    formato: "story",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData((prev) => ({ ...prev, [name]: value }));
  };

  const activeCategory = TEMPLATES.find(t => t.id === selectedTemplate);

  const handleSubmitImagen = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedLayout) {
      alert("Chef, asegúrate de elegir una categoría y un diseño (Pasos 1 y 2).");
      return;
    }

    setIsLoadingImagen(true);
    setImageUrl(null);
    setWantsVideo(false);
    setVideoSuccess(false);

    const payload = {
      tipo: "imagen",
      categoria: selectedTemplate,
      layoutId: selectedLayout, 
      ...formData, 
    };

    try {
      const response = await fetch("https://n8n.santisoft.cl/webhook/generador-gastronomico-imagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error en la cocina (generación de imagen)");

      const data = await response.json();
      setImageUrl(data.imageUrl); 
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al crear la imagen. Intenta nuevamente.");
    } finally {
      setIsLoadingImagen(false);
    }
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    setIsLoadingVideo(true);

    const payload = {
      tipo: "video",
      imageUrl: imageUrl, 
      layoutId: selectedLayout,
      categoria: selectedTemplate,
      ...videoData, 
      ...formData,  
    };

    try {
      const response = await fetch("https://n8n.santisoft.cl/webhook/generador-gastronomico-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error solicitando el video");

      setVideoSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Error al enviar la solicitud de video. Revisa tus datos.");
    } finally {
      setIsLoadingVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0a] font-sans text-stone-100 selection:bg-orange-500 selection:text-white">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-600/20 blur-[120px]"></div>
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-red-600/20 blur-[150px]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px]"></div>
        
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="relative z-10">
        
        <nav className="w-full p-6 flex justify-between items-center relative z-20">
          <Link 
            href="/" 
            className="group flex items-center space-x-3 text-sm font-bold tracking-widest uppercase text-stone-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10"
          >
            <span className="transform transition-transform group-hover:-translate-x-1 text-orange-500">←</span>
            <span className="hidden sm:inline">Volver a la Agencia</span>
            <span className="sm:hidden">Volver</span>
          </Link>

          <Link 
            href="/gastronomico/planes"
            className="group flex items-center space-x-2 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]"
          >
            <span>Ver Planes</span>
            <span className="text-lg leading-none">✨</span>
          </Link>
        </nav>

        <header className="pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 font-semibold text-sm tracking-wide shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            Estudio Fotográfico IA
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            Tu menú, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              visualmente irresistible
            </span>
          </h1>
          <p className="mt-6 text-lg text-stone-400 max-w-2xl mx-auto font-light leading-relaxed">
            Ingresa los datos de tu platillo, elige un diseño maestro y deja que nuestra IA arme una pieza gráfica perfecta para tus redes sociales.
          </p>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-16">
          
          <section>
            <div className="flex items-center space-x-4 mb-8 justify-center md:justify-start">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-white font-black shadow-lg shadow-orange-500/30">1</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">Elige la categoría</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    setSelectedLayout(null); 
                  }}
                  className={`group relative flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-3xl transition-all duration-300 border ${
                    selectedTemplate === tpl.id
                      ? "border-orange-500 bg-white/10 shadow-[0_0_30px_rgba(249,115,22,0.3)] scale-105 z-10"
                      : "border-white/10 hover:border-orange-500/50 hover:bg-white/10"
                  }`}
                >
                  <span className="text-5xl mb-3 transform transition-transform group-hover:scale-110 drop-shadow-2xl">{tpl.emoji}</span>
                  <span className="font-bold text-white text-center text-md">{tpl.name}</span>
                  
                  {selectedTemplate === tpl.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {activeCategory && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center space-x-4 mb-8 justify-center md:justify-start">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-white font-black shadow-lg shadow-orange-500/30">2</span>
                <h2 className="text-3xl font-bold text-white tracking-tight">Selecciona un diseño</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeCategory.layouts.map((layout) => (
                  <div
                    key={layout.id}
                    className={`relative flex flex-col p-3 bg-white/5 backdrop-blur-sm rounded-3xl transition-all duration-300 border ${
                      selectedLayout === layout.id
                        ? "border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] z-10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div 
                      className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-black/50 mb-4 relative cursor-zoom-in group"
                      onClick={() => setPreviewLayout(layout)}
                    >
                      <img 
                        src={layout.url} 
                        alt={layout.name}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center space-x-2 border border-white/30 shadow-xl">
                          <span>👁️</span> <span>Ampliar</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full px-2 pb-2 text-center flex flex-col items-center">
                      <span className="block font-bold text-white text-lg">{layout.name}</span>
                      <span className="text-xs text-stone-400 font-mono mt-1 mb-4 block">ID: {layout.id.substring(0, 8)}...</span>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedLayout(layout.id)}
                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                          selectedLayout === layout.id
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/40"
                            : "bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {selectedLayout === layout.id ? "Diseño Elegido ✓" : "Elegir este Diseño"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="relative">
            <div className="flex items-center space-x-4 mb-8 justify-center md:justify-start">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-white font-black shadow-lg shadow-orange-500/30">3</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">Personaliza tu anuncio</h2>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
              <form onSubmit={handleSubmitImagen} className="space-y-8 relative z-10">
                
                <div className="pb-6 border-b border-white/10">
                  <h3 className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-6">Identidad de Marca</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-stone-300 uppercase tracking-widest">Nombre del Local</label>
                      <input type="text" name="nombreLocal" value={formData.nombreLocal} onChange={handleInputChange} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" placeholder="Ej: Santisoft Burger" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-stone-300 uppercase tracking-widest">Color Corporativo</label>
                      <div className="flex items-center space-x-4 bg-black/40 border border-white/10 rounded-2xl px-5 py-2.5">
                        <input type="color" name="colorMarca" value={formData.colorMarca} onChange={handleInputChange} className="h-8 w-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                        <span className="text-stone-400 font-mono text-sm uppercase tracking-wider">{formData.colorMarca}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pb-6 border-b border-white/10">
                  <h3 className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-6">Textos del Banner</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-stone-300 uppercase tracking-widest">Título Principal</label>
                      <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" placeholder="Ej: La Bestia Doble" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-stone-300 uppercase tracking-widest">Subtítulo</label>
                      <input type="text" name="subtitulo" value={formData.subtitulo} onChange={handleInputChange} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" placeholder="Ej: Exclusiva de temporada" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-stone-300 uppercase tracking-widest">Mensaje (Gancho Promocional)</label>
                      <input type="text" name="mensaje" value={formData.mensaje} onChange={handleInputChange} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" placeholder="Ej: 2x1 solo por hoy pidiendo online" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-stone-300 uppercase tracking-widest">Precio</label>
                      <input type="text" name="precio" value={formData.precio} onChange={handleInputChange} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" placeholder="Ej: $12.990" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-6">Detalles de la Imagen IA</h3>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-stone-300 uppercase tracking-widest">Ingredientes Estrella (Para generar la foto)</label>
                    <textarea name="ingredientes" value={formData.ingredientes} onChange={handleInputChange} required rows={2} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-stone-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none resize-none" placeholder="Pan brioche artesanal, 200g de carne Angus, cebolla caramelizada, mucho queso cheddar..." />
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={isLoadingImagen} className="w-full relative overflow-hidden group flex justify-center items-center py-5 px-8 rounded-2xl font-black text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:from-stone-800 disabled:to-stone-900 disabled:text-stone-500 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)]">
                    <span className="relative flex items-center space-x-3 text-xl tracking-wide">
                      {isLoadingImagen ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Ensamblando banner...</span>
                        </>
                      ) : (
                        <>
                          <span>Generar Imagen Promocional</span>
                          <span className="text-2xl">✨</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </section>

          {imageUrl && (
            <section className="bg-black/60 backdrop-blur-2xl p-8 md:p-14 rounded-[3rem] shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  ¡Tu Banner está Listo!
                </h2>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md aspect-[4/5] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl relative mb-6 border border-white/10 ring-4 ring-black">
                  <img src={imageUrl} alt="Generado por IA" className="w-full h-full object-cover" />
                </div>
                <a href={imageUrl} download target="_blank" rel="noreferrer" className="inline-flex items-center px-8 py-3 rounded-full bg-white/10 text-white hover:bg-stone-200 hover:text-stone-900 transition-all font-bold uppercase tracking-widest border border-white/20">
                  ↓ Descargar Imagen
                </a>
              </div>

              <div className="mt-16 pt-12 border-t border-white/10 max-w-2xl mx-auto">
                {!videoSuccess ? (
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/30 rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full"></div>
                    
                    <h3 className="text-3xl font-black text-white mb-4 relative z-10">
                      Dale vida a tu anuncio 🎬
                    </h3>
                    <p className="text-stone-300 mb-8 relative z-10">
                      Convierte este banner en un video cinematográfico para Reels o Feed. Ingresa tus datos y te lo enviaremos gratis en minutos a tu WhatsApp.
                    </p>

                    {!wantsVideo ? (
                      <button 
                        onClick={() => setWantsVideo(true)}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-transform hover:scale-105 relative z-10"
                      >
                        Sí, generar video con IA
                      </button>
                    ) : (
                      <form onSubmit={handleSubmitVideo} className="space-y-5 text-left relative z-10 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                          <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Celular (WhatsApp)</label>
                          <input type="tel" name="celular" value={videoData.celular} onChange={handleVideoInputChange} required className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none" placeholder="Ej: 56912345678" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                          <input type="email" name="correo" value={videoData.correo} onChange={handleVideoInputChange} required className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none" placeholder="chef@restaurante.com" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Formato de Video</label>
                          <select name="formato" value={videoData.formato} onChange={handleVideoInputChange} className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none">
                            <option value="story">Historias / Reels (9:16)</option>
                            <option value="post">Feed de Instagram / Post (1:1)</option>
                          </select>
                        </div>
                        <button type="submit" disabled={isLoadingVideo} className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:from-stone-800 disabled:text-stone-500 transition-all shadow-lg">
                          {isLoadingVideo ? "Enviando solicitud..." : "Renderizar y Enviar a mi WhatsApp"}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-10 text-center animate-in zoom-in-95">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-2xl font-black text-green-400 mb-2">¡Solicitud en proceso!</h3>
                    <p className="text-stone-300">
                      Nuestra IA ya está animando tu banner. 
                      Te enviaremos el archivo final a tu WhatsApp (<strong>{videoData.celular}</strong>) en unos 3 a 5 minutos.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {previewLayout && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewLayout(null)}
        >
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl max-h-[90vh] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setPreviewLayout(null)}
              className="absolute -top-14 right-0 md:-right-4 text-white hover:text-orange-500 bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl transition-all border border-white/10 shadow-lg"
              aria-label="Cerrar vista previa"
            >
              ✕
            </button>
            
            <div className="absolute -top-12 left-0 text-white font-bold text-xl tracking-wide">
              {previewLayout.name}
            </div>

            <img 
              src={previewLayout.url} 
              alt="Vista previa a gran escala" 
              className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/10"
              onClick={(e) => e.stopPropagation()} 
            />
            
            <div 
              className="absolute -bottom-20 left-0 right-0 flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedLayout(previewLayout.id);
                  setPreviewLayout(null);
                }}
                className="bg-orange-500 hover:bg-orange-400 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all transform hover:scale-105"
              >
                Usar este Diseño
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}