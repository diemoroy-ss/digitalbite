"use client";
import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, query, orderBy, getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";

// Components
import CategorySelector from "../../components/CategorySelector";
import TemplateGrid from "../../components/TemplateGrid";
import PreviewModal from "../../components/PreviewModal";
import BannerForm from "../../components/BannerForm";
import ProductModal from "../../components/ProductModal";
import { BANNER_IDEAS, CheckCircle, Play, Smartphone } from "../../components/TemplatesData";
import type { TextLayer } from "../../components/TextLayerEditor";
import Link from "next/link";
import ChatBot from "../../components/ChatBot";
import ProfileMenu from "../../components/ProfileMenu";

function AutoRetryImage({ url, alt, className, shouldLoad, onLoaded }: { url: string; alt: string; className: string; shouldLoad: boolean; onLoaded?: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const onLoadedCalled = useRef(false);

  useEffect(() => {
    if (shouldLoad && !src) {
      setSrc(url);
    }
  }, [shouldLoad, url, src]);

  if (!shouldLoad && !loaded) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/30 backdrop-blur-sm z-20 space-y-2">
        <div className="text-2xl opacity-40 grayscale">⏳</div>
        <p className="text-[11px] font-bold text-slate-400 text-center px-4 uppercase tracking-wider">En cola</p>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-md z-20 space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-sm"></div>
          <p className="text-[12px] font-bold text-slate-600 animate-pulse text-center px-4">Procesando {alt.replace('Imagen generada', 'Pantalla')}...</p>
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => {
            setLoaded(true);
            if (onLoaded && !onLoadedCalled.current) {
              onLoadedCalled.current = true;
              onLoaded();
            }
          }}
          onError={() => {
            setTimeout(() => {
              try {
                const urlObj = new URL(url);
                urlObj.searchParams.set("retry", Date.now().toString());
                setSrc(urlObj.toString());
              } catch (err) { }
            }, 3000);
          }}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease-in" }}
        />
      )}
    </>
  );
}

export default function GastronomicoPage() {
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);

  // Modal Carousel State
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");

  // AI Mode State
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiFormData, setAiFormData] = useState({ web: "", facebook: "", instagram: "", idea: "" });
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPollingText, setAiPollingText] = useState<string>("");
  const [lastAiImageUrl, setLastAiImageUrl] = useState<string | null>(null);

  const [codigoPedido, setCodigoPedido] = useState("");
  const [imageUrlWatermark, setImageUrlWatermark] = useState<string[] | null>(null);
  const [renderingIndex, setRenderingIndex] = useState<number>(0);

  // Modal States
  const [showResultModal, setShowResultModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [loadingImg, setLoadingImg] = useState(false);
  const [wantsVideo, setWantsVideo] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombreLocal: '',
    titulo: '',
    subtitulo: '',
    ingredientes: '',
    precio: '',
    mensaje: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    destType: 'rrss', // 'rrss' | 'tv'
    formato: 'story',
    screensCount: 1, // initialize correctly
    logo: '',
    menusByScreen: [{ isMenuMode: false, menuItems: [{ name: '', price: '' }, { name: '', price: '' }, { name: '', price: '' }] }]
  });
  const [videoData, setVideoData] = useState({ celular: '', correo: '', formato: 'story' });

  const [isMounted, setIsMounted] = useState(false);

  // Product Gallery State
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [pendingProductToAdd, setPendingProductToAdd] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const q = query(collection(db, "products"));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (err: any) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };



  useEffect(() => {
    setIsMounted(true);

    // Fetch Templates from Firebase
    const loadTemplates = async () => {
      try {
        const [snapshot, catSnapshot] = await Promise.all([
          Promise.race([
            getDocs(collection(db, "templates")),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Timeout. Revisa tu conexión o reglas.")), 8000))
          ]) as Promise<any>,
          getDocs(collection(db, "categories"))
        ]);

        let docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as any));
        // En la landing (pantalla principal), nunca mostrar plantillas marcadas como Premium
        docs = docs.filter((doc: any) => !doc.isPremium);
        
        let fetchedCats = catSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as any));
        
        // Sort in JS to be safe
        fetchedCats.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        
        console.log("Fetched Categories:", fetchedCats.length);
        setDbCategories(fetchedCats);

        docs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

        // Map DB categories to the structure used by the app, dynamically resolving category-aware layout structures
        const mapTemplateToLayout = (t: any, catSlug: string) => {
          const lyt = t.layouts?.[catSlug] || {};
          return {
            id: t.id, name: t.name, desc: t.desc, 
            url: lyt.post?.displayUrl || t.imageUrlPost || t.imageUrl, 
            urlStory: lyt.story?.displayUrl || t.imageUrlVertical || t.imageUrlStory || t.imageUrl, 
            urlTv: lyt.tv_h?.displayUrl || t.imageUrlHorizontal || t.imageUrlTv || t.imageUrl, 
            colors: t.colors, fonts: t.fonts,
            // Prioritize the new Nested Category Schema, fallback to Legacy Root Schema
            defaultLayersVertical: lyt.story?.layers || t.defaultLayersVertical,
            defaultMenuDataVertical: lyt.story?.menuData || t.defaultMenuDataVertical,
            defaultLayersPost: lyt.post?.layers || t.defaultLayersPost,
            defaultMenuDataPost: lyt.post?.menuData || t.defaultMenuDataPost,
            defaultLayersHorizontal: lyt.tv_h?.layers || t.defaultLayersHorizontal,
            defaultMenuDataHorizontal: lyt.tv_h?.menuData || t.defaultMenuDataHorizontal,
          };
        };

        const loadedCategories = fetchedCats.map(dbCat => {
          const catTemplates = docs.filter(d => {
            if (d.categories && Array.isArray(d.categories)) return d.categories.includes(dbCat.slug);
            return d.category === dbCat.slug || d.categoryId === dbCat.slug;
          });
          
          let layouts: any[] = [];
          
          if (dbCat.slug === "general") {
            layouts = catTemplates.map(t => mapTemplateToLayout(t, dbCat.slug));
          } else {
            // First, find matches from hardcoded ideas (if any)
            layouts = BANNER_IDEAS.map((idea) => {
              const customDbTemplate = catTemplates.find(t => t.name === idea.name);
              if (customDbTemplate) return mapTemplateToLayout(customDbTemplate, dbCat.slug);
              return null;
            }).filter((layout): layout is NonNullable<typeof layout> => layout !== null);
            
            const extraTemplates = catTemplates.filter(t => !BANNER_IDEAS.find(i => i.name === t.name));
            extraTemplates.forEach(t => layouts.push(mapTemplateToLayout(t, dbCat.slug)));
          }

          return { 
            id: dbCat.slug || dbCat.id, 
            name: dbCat.name || "Sin Nombre", 
            icon: dbCat.emoji || "🍽️", 
            layouts 
          };
        });

        // Ensure "General" is present even if not in DB (optional, but safer)
        if (!loadedCategories.find(c => c.id === 'general')) {
             const generalTemplates = docs.filter(d => !d.categories?.length && !d.category);
             loadedCategories.push({
                 id: 'general',
                 name: 'General',
                 icon: '✨',
                 layouts: generalTemplates.map(t => mapTemplateToLayout(t, "general"))
             });
        }

        setCategoriesData(loadedCategories);
      } catch (err) {
        console.error("Error loading templates:", err);
      } finally {
        setLoadingData(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const uDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (uDoc.exists()) {
            let data = uDoc.data();
            if (currentUser.email === "admin@digitalbite.app" || currentUser.email === "diemondy@gmail.com" || currentUser.email === "gabriel.zarate@gmail.com") {
              data.role = "admin";
            }
            setUserDoc(data);
          }
        } catch (e) {
          console.error("Error fetching user role", e);
        }
      } else {
        setUserDoc(null);
      }
      setAuthLoading(false);
      loadTemplates();
      fetchProducts();
    });

    return () => unsubscribe();
  }, []);

  const activeCat = categoriesData.find(t => t.id === selectedTemplate);
  const selectedLayoutObj = activeCat?.layouts.find(l => l.id === selectedLayout) as { url?: string; urlStory?: string; urlTv?: string; name?: string; id?: string; desc?: string; colors?: string[]; fonts?: string[] } | undefined;

  const handleImg = async (e: React.FormEvent, layersByScreen: TextLayer[][] = [[]]) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedLayout) { alert("Elige una categoría y un diseño primero."); return; }
    setLoadingImg(true);
    setImageUrlWatermark(null);
    setCodigoPedido("");
    setWantsVideo(false);
    setVideoSuccess(false);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://digitalbite.app";
      let fondoUrl = selectedLayoutObj?.url || "";
      if (formData.formato) {
        if (formData.formato.includes("tv_h") && selectedLayoutObj?.urlTv) {
          fondoUrl = selectedLayoutObj.urlTv;
        } else if ((formData.formato === 'story' || formData.formato.includes("tv_v")) && selectedLayoutObj?.urlStory) {
          fondoUrl = selectedLayoutObj.urlStory;
        }
      }
      
      if (!fondoUrl) {
        fondoUrl = selectedLayoutObj?.urlStory || selectedLayoutObj?.url || "";
      }

      // Crear documentos y abrir modal de a UNO para que Butterfly genere de a una por vez
      const urls: string[] = [];
      for (let i = 0; i < layersByScreen.length; i++) {
        const docRef = await addDoc(collection(db, "renders_temporales"), {
          ...formData,
          fondoUrl,
          textLayers: layersByScreen[i],
          screenIndex: i,
          screensCount: layersByScreen.length,
          userId: auth.currentUser?.uid || null,
          createdAt: new Date()
        });

        const renderId = docRef.id;
        if (i === 0) setCodigoPedido(renderId);

        const targetUrl = `${origin}/render?id=${renderId}`;
        const butterflyUrl = `https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(targetUrl)}`;
        urls.push(butterflyUrl);
      }

      if (auth.currentUser) {
        const d = new Date();
        const yearMonth = `${d.getFullYear()}_${(d.getMonth()+1).toString().padStart(2, '0')}`;
        const usageRef = doc(db, "users", auth.currentUser.uid, "usage_stats", yearMonth);
        const usageSnap = await getDoc(usageRef);
        if (usageSnap.exists()) {
           await updateDoc(usageRef, {
              count: (usageSnap.data().count || 0) + 1,
              lastGeneratedAt: new Date()
           });
        } else {
           await setDoc(usageRef, {
              count: 1,
              lastGeneratedAt: new Date(),
              yearMonth
           });
        }
      }

      setRenderingIndex(0);
      setImageUrlWatermark(urls);
      setShowResultModal(true);

    } catch (err) {
      console.error(err);
      alert("Hubo un problema al crear la imagen. Intenta nuevamente.");
    }
    finally { setLoadingImg(false); }
  };

  const handleVideo = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingVideo(true);
    try {
      const r = await fetch("https://n8n.santisoft.cl/webhook/generador-gastronomico-video", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "video", codigoPedido, layoutId: selectedLayout, categoria: selectedTemplate, ...videoData, ...formData }),
      });
      if (!r.ok) throw new Error();
      setVideoSuccess(true);
    } catch { alert("Error al enviar la solicitud de video."); }
    finally { setLoadingVideo(false); }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);
    if (!aiFormData.web && !aiFormData.facebook && !aiFormData.instagram && !aiFormData.idea) {
      setAiError("Por favor ingresa alguna idea, red social o sitio web para que la IA tenga referencias.");
      return;
    }
    setLoadingAI(true);
    setAiPollingText("Iniciando conexión con la IA...");

    try {
      // 1. Generar Ticket ID único
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 2. Enviar petición inicial a través del proxy Next.js (evita CORS)
      const respInit = await fetch("/api/ai-banner/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...aiFormData, ticketId })
      });

      if (!respInit.ok) throw new Error("Error al contactar con la IA inicial.");

      // 3. Iniciar Polling (preguntar cada 5 segundos si el trabajo terminó)
      setAiPollingText("Analizando tu marca (puede tomar ~30s)...");
      let urlImage = null;
      let attempts = 0;
      const maxAttempts = 24; // 24 * 5s = 120 segundos máximo

      while (attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
        setAiPollingText(`Renderizando detalles mágicos... (Intento ${attempts}/${maxAttempts})`);

        const pollResp = await fetch(`/api/ai-banner/status?ticketId=${ticketId}`);
        if (!pollResp.ok) continue;

        const pollData = await pollResp.json();

        if (pollData.status === 'completed' && (pollData.url || pollData.imageUrl)) {
          urlImage = pollData.url || pollData.imageUrl;
          break; // Salir del loop!
        } else if (pollData.status === 'error') {
          throw new Error("La IA reportó un error durante la generación.");
        }
      }

      if (!urlImage) throw new Error("Tiempo de espera agotado. La IA tardó demasiado.");

      setAiPollingText("¡Imagen lista! Cargando editor...");

      setLastAiImageUrl(urlImage);
      applyAiImage(urlImage);

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Hubo un error al generar la imagen con IA. Intenta de nuevo.");
    } finally {
      setLoadingAI(false);
      setAiPollingText("");
    }
  };



  // Funcion para aplicar una imagen IA al editor (reusar o nueva)
  const applyAiImage = (url: string) => {
    setSelectedTemplate("plantilla-ia");
    setSelectedLayout("diseño-ia");
    setCategoriesData(prev => [
      {
        id: "plantilla-ia",
        name: "IA Generativa",
        desc: "Fondo único",
        icon: () => <span>✨</span>,
        layouts: [{
          id: "diseño-ia",
          name: "Tu Fondo IA",
          desc: "Creado exclusivamente para ti",
          url,
          urlStory: url
        }]
      },
      ...prev.filter(c => c.id !== "plantilla-ia")
    ]);
    setIsAIMode(false);
    setIsEditorOpen(true);
  };

  const handleSelectCat = (id: string) => {
    setSelectedTemplate(id);
    setSelectedLayout(null);
    setImageUrlWatermark(null);
  };

  if (!isMounted) return null;

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 font-sans selection:bg-rose-200 selection:text-rose-900 pb-32 relative">

      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#f43f5e 2px, transparent 2px)`,
          backgroundSize: '32px 32px'
        }} />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-gradient-to-br from-rose-50/50 via-transparent to-orange-50/50" />

      {/* Navbar Superior (Top Bar) para el Editor */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo-digitalbite.png" alt="DigitalBite Logo" className="h-6 w-auto" />
            <span className="font-bold text-slate-800 hidden md:inline ml-1 text-sm tracking-tight text-[15px]">DigitalBite</span>
          </Link>

          <div className="flex items-center gap-4">
             {authLoading ? (
                 <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             ) : (
                 <ProfileMenu user={user} userDoc={userDoc} />
             )}
          </div>
        </div>
      </div>

      {/* Contenedor principal expandido para aprovechar pantallas grandes */}
      <div className="w-full max-w-[1500px] mx-auto px-6 md:px-12 pt-16 relative z-10">

        <header className="mb-14 text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[12px] font-bold tracking-widest uppercase mb-6 mx-auto mt-6 md:mt-0">
            <span>🎨</span> Generador AI
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1] selection:bg-rose-200">
            Crea el cartel de <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">tu comida en segundos.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Una herramienta súper fácil. Sin fotógrafos, ni Photoshop.
          </p>
        </header>

        {/* AI TOGGLE MAGICO */}
        <div className="max-w-4xl mx-auto mb-16 relative">
          <div className={`p-1 rounded-[32px] transition-all duration-700 ${isAIMode ? 'bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/30' : 'bg-slate-200 shadow-inner'}`}>
            <div className={`flex w-full rounded-[28px] overflow-hidden relative cursor-pointer font-bold text-[15px]`}
              onClick={() => {
                if (loadingAI) return;
                const nextState = !isAIMode;
                setIsAIMode(nextState);
                if (nextState) {
                  // Limpiar Paso 3 si el usuario entra a la IA
                  setSelectedTemplate(null);
                  setSelectedLayout(null);
                  setImageUrlWatermark(null);
                }
              }}>
              {/* Sliding background */}
              <div
                className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[24px] bg-white shadow-md transition-all duration-500 ease-out z-0"
                style={{ left: isAIMode ? 'calc(50% + 4px)' : '4px' }}
              />

              <div className={`flex-1 py-4 text-center z-10 transition-colors duration-500 ${!isAIMode ? 'text-slate-800' : 'text-slate-100 hover:text-white'}`}>
                1. Escoger Plantilla Clásica
              </div>
              <div className={`flex-1 py-4 text-center z-10 transition-colors duration-500 flex items-center justify-center gap-2 ${isAIMode ? 'text-indigo-900' : 'text-slate-500 hover:text-slate-700'}`}>
                ✨ Ver el poder de nuestra IA
              </div>
            </div>
          </div>
        </div>

        {isAIMode ? (
          /* FORMULARIO IA */
          <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 p-8 md:p-12 mb-32 border border-indigo-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Diseño de fondo a tu medida</h3>
              <p className="text-[15px] text-slate-500 leading-relaxed max-w-md mx-auto">
                Analizamos los colores de tu web o redes sociales para crear un fondo totalmente único y alineado a tu marca. Solo necesitamos algunas referencias:
              </p>
            </div>

            {/* PREVIEW IMAGEN PREVIA */}
            {lastAiImageUrl && !loadingAI && (
              <div className="mb-10 rounded-[24px] overflow-hidden border border-indigo-100 bg-indigo-50/30 p-4">
                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3 text-center">✨ Última imagen generada con IA</p>
                <img src={lastAiImageUrl} alt="Fondo IA previo" className="w-full rounded-[16px] object-cover max-h-64 shadow-md" />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => applyAiImage(lastAiImageUrl)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200"
                  >
                    ✅ Usar esta imagen
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setLastAiImageUrl(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[13px] py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    🔄 Generar imagen nueva
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleAIGenerate} className="space-y-6 relative">

              {loadingAI && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center rounded-[24px]">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-indigo-900 font-bold text-[15px] animate-pulse">
                    {aiPollingText || "Analizando tu marca..."}
                  </p>
                  <p className="text-indigo-400 text-[13px] mt-1 text-center max-w-xs">No cierres esta pestaña. Generando tu fondo mágico usando IA...</p>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-2 uppercase tracking-wide">¿Qué te gustaría ver en el fondo? (Opcional)</label>
                <div className="relative border border-slate-200 rounded-2xl bg-slate-50 focus-within:ring-4 focus-within:ring-indigo-400/10 focus-within:border-indigo-400 transition-all overflow-hidden flex items-start">
                  <span className="pl-4 pt-4 text-slate-300">💡</span>
                  <textarea
                    value={aiFormData.idea}
                    onChange={e => setAiFormData({ ...aiFormData, idea: e.target.value })}
                    placeholder="Ejemplo: Quiero que aparezca una hamburguesa doble con queso derretido en un fondo oscuro de madera con fuego atrás..."
                    className="w-full bg-transparent px-3 py-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Sitio Web (Opcional)</label>
                <div className="relative border border-slate-200 rounded-2xl bg-slate-50 focus-within:ring-4 focus-within:ring-indigo-400/10 focus-within:border-indigo-400 transition-all overflow-hidden flex items-center">
                  <span className="pl-4 text-slate-300">🌐</span>
                  <input type="text" value={aiFormData.web} onChange={e => setAiFormData({ ...aiFormData, web: e.target.value })} placeholder="www.mi-negocio.com" className="w-full bg-transparent px-3 py-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Facebook (Opcional)</label>
                  <div className="relative border border-slate-200 rounded-2xl bg-slate-50 focus-within:ring-4 focus-within:ring-indigo-400/10 focus-within:border-indigo-400 transition-all overflow-hidden flex items-center">
                    <span className="pl-4 text-slate-300">📘</span>
                    <input
                      type="text"
                      value={aiFormData.facebook}
                      onChange={e => {
                        let val = e.target.value;
                        if (val && !val.startsWith('@')) val = '@' + val;
                        setAiFormData({ ...aiFormData, facebook: val });
                      }}
                      placeholder="@minegocio"
                      className="w-full bg-transparent px-3 py-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Instagram (Opcional)</label>
                  <div className="relative border border-slate-200 rounded-2xl bg-slate-50 focus-within:ring-4 focus-within:ring-indigo-400/10 focus-within:border-indigo-400 transition-all overflow-hidden flex items-center">
                    <span className="pl-4 text-slate-300">📸</span>
                    <input
                      type="text"
                      value={aiFormData.instagram}
                      onChange={e => {
                        let val = e.target.value;
                        if (val && !val.startsWith('@')) val = '@' + val;
                        setAiFormData({ ...aiFormData, instagram: val });
                      }}
                      placeholder="@mi_negocio"
                      className="w-full bg-transparent px-3 py-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {aiError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-2xl text-[13px] font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2">
                  <span>⚠️</span> {aiError}
                </div>
              )}

              <button type="submit" disabled={loadingAI} className="w-full pt-8 pb-2">
                <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-[16px] py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                  ✨ Construir mi fondo con IA
                </div>
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* PASO 1: Destino / Formato */}
            <section className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold tracking-widest uppercase mb-3">
                  📺 Paso 1: Destino
                </div>
                <h2 className="text-3xl font-black text-slate-900">¿Para dónde es el diseño?</h2>
              </div>
              
              <div className="flex flex-col gap-4 max-w-2xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({ ...formData, destType: 'rrss', formato: 'story', screensCount: 1 })}
                    className={`py-8 px-4 rounded-3xl text-xl font-bold border-2 transition-all shadow-sm flex flex-col items-center justify-center gap-3 ${formData.destType === 'rrss' || !formData.destType ? "border-rose-500 bg-rose-50 text-rose-600 scale-[1.02]" : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:text-rose-500"}`}>
                    <span className="text-5xl mb-2">📱</span>
                    Redes Sociales
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, destType: 'tv', formato: 'tv_v', screensCount: 1 })}
                    className={`py-8 px-4 rounded-3xl text-xl font-bold border-2 transition-all shadow-sm flex flex-col items-center justify-center gap-3 ${formData.destType === 'tv' ? "border-rose-500 bg-rose-50 text-rose-600 scale-[1.02]" : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:text-rose-500"}`}>
                    <span className="text-5xl mb-2">📺</span>
                    Menu Walls TV
                  </button>
                </div>
              </div>
            </section>

            {/* PASO 2: Categoria */}
            <div className="text-center mb-8">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold tracking-widest uppercase mb-3">
                 🍔 Paso 2: Categoría
               </div>
               <h2 className="text-3xl font-black text-slate-900">¿Qué vas a promocionar?</h2>
            </div>
            <CategorySelector 
              categories={categoriesData}
              selectedTemplate={selectedTemplate} 
              onSelect={(id) => setSelectedTemplate(id)} 
              allowedCategories={
                (!user || userDoc?.role === 'admin' || user.email === 'admin@digitalbite.app' || userDoc?.categoriesAllowed?.includes('all')) 
                  ? null 
                  : (userDoc?.categoriesAllowed && userDoc.categoriesAllowed.length > 0 ? userDoc.categoriesAllowed : ['general'])
              }
            />

            {/* Hint for non-logged users */}
            {!user && (
               <div className="max-w-md mx-auto mt-4 mb-8 text-center bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 animate-in fade-in duration-500">
                 <p className="text-[12px] font-bold text-indigo-900 mb-1">👑 MÁS CATEGORÍAS DISPONIBLES</p>
                 <p className="text-[12px] text-slate-500">
                   Para acceder a Pizza, Sushi, Helados y Plantillas Exclusivas, <Link href="/login" className="text-indigo-600 font-bold hover:underline">inicia sesión con tu cuenta Pro</Link>.
                 </p>
               </div>
            )}

            {/* PASO 3: Diseños o Empty State */}
            {activeCat && activeCat.layouts.length === 0 && (
              <div className="py-24 text-center max-w-md mx-auto animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner text-slate-300">
                  {typeof activeCat.icon === 'function' ? <activeCat.icon /> : activeCat.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Próximamente</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">Aún no hemos subido plantillas para esta categoría. Vuelve a revisar más tarde o cambia de opción.</p>
              </div>
            )}

            {activeCat && activeCat.layouts.length > 0 && selectedTemplate !== "plantilla-ia" && (
              <>
                <div className="text-center mb-8">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold tracking-widest uppercase mb-3">
                     🎨 Paso 3: Diseño
                   </div>
                   <h2 className="text-3xl font-black text-slate-900">Elige la base gráfica</h2>
                </div>
                <TemplateGrid
                  formato={formData.formato}
                  layouts={activeCat.layouts}
                  selectedLayout={selectedLayout}
                  onSelectLayout={(id) => { 
                    setSelectedLayout(id); 
                    setImageUrlWatermark(null); 
                    setIsEditorOpen(true);
                  }}
                  onOpenPreview={(index) => setPreviewIndex(index)}
                />
              </>
            )}
          </>
        )}

        {/* PASO 4: Editor Fullscreen Modal */}
        {isEditorOpen && selectedLayout && activeCat && activeCat.layouts.length > 0 && (
          <div className="fixed inset-0 z-[500] bg-slate-900/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-300">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-lg shadow-lg">🎨</div>
                <div>
                  <span className="font-black text-white text-sm leading-none block">Editor Visual</span>
                  <span className="text-slate-400 text-[11px]">DigitalBite Studio (Demo)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[13px] border border-slate-700 transition-all"
                >
                  <span>✕</span> Cerrar Editor
                </button>
              </div>
            </div>

            {/* Editor content */}
            <div className="flex-1 overflow-hidden">
              <BannerForm
                formData={formData}
                setFormData={setFormData}
                handleImg={handleImg}
                loadingImg={loadingImg}
                selectedLayoutObj={selectedLayoutObj}
                imageUrlWatermark={imageUrlWatermark}
                setShowResultModal={(show) => { setShowResultModal(show); if (show) setIsEditorOpen(false); }}
                pendingProductToAdd={pendingProductToAdd}
                setPendingProductToAdd={setPendingProductToAdd}
                onOpenProductModal={() => setIsProductModalOpen(true)}
                products={products}
                productsError={productsError}
                categorySlug={selectedTemplate}
              />
            </div>
          </div>
        )}
      </div>

      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        products={products}
        dbCategories={dbCategories}
        onSelect={(url) => { setPendingProductToAdd(url); setIsProductModalOpen(false); }}
        refreshProducts={fetchProducts}
        category={selectedTemplate}
      />

      {/* Modal Preview / Carousel */}
      {activeCat && (
        <PreviewModal
          layouts={activeCat.layouts}
          previewIndex={previewIndex}
          slideDir={slideDir}
          onClose={() => setPreviewIndex(null)}
          onSelectLayout={(id) => { setSelectedLayout(id); setPreviewIndex(null); setImageUrlWatermark(null); }}
          onNext={() => { setSlideDir("right"); setPreviewIndex(prev => prev! < activeCat.layouts.length - 1 ? prev! + 1 : 0); }}
          onPrev={() => { setSlideDir("left"); setPreviewIndex(prev => prev! > 0 ? prev! - 1 : activeCat.layouts.length - 1); }}
        />
      )}

      {/* MODAL RESULTADOS */}
      {showResultModal && imageUrlWatermark && imageUrlWatermark.length > 0 && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-6 animate-in fade-in zoom-in-95 duration-300" onClick={() => setShowResultModal(false)}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative flex flex-col gap-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowResultModal(false)} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors z-50">✕</button>

            {/* Header */}
            <div className="px-8 pt-8 pb-5 border-b border-slate-100">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 w-max ${renderingIndex >= imageUrlWatermark.length ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {renderingIndex >= imageUrlWatermark.length ? '✨ Generación Exitosa' : '✨ Procesando Diseño'}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{renderingIndex >= imageUrlWatermark.length ? 'Tu Diseño Final' : 'Generando tus imágenes...'}</h3>
              <p className="text-[13px] text-slate-500">{renderingIndex >= imageUrlWatermark.length ? 'Descarga tus diseños o remueve la marca de agua.' : 'Estamos renderizando pantalla por pantalla para asegurar la máxima calidad. ¡Tomará unos segundos!'}</p>
            </div>

            {/* Images Grid */}
            <div className="p-6 md:p-8">
              <div className={`grid gap-4 ${formData.formato === 'tv_h'
                ? 'grid-cols-1'
                : imageUrlWatermark.length >= 3
                  ? 'grid-cols-3'
                  : imageUrlWatermark.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-1 max-w-sm mx-auto'
                }`}>
                {imageUrlWatermark.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-50 relative group min-h-[180px]">
                    {imageUrlWatermark.length > 1 && (
                      <div className="absolute top-2 left-2 z-30 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md pointer-events-none">
                        Pantalla {idx + 1}
                      </div>
                    )}
                    <AutoRetryImage
                      url={url}
                      alt={`Imagen generada ${idx + 1}`}
                      className="w-full h-full object-contain"
                      shouldLoad={idx <= renderingIndex}
                      onLoaded={() => setRenderingIndex(prev => Math.max(prev, idx + 1))}
                    />
                    <a href={url} target="_blank" rel="noreferrer"
                      className="absolute bottom-2 right-2 z-30 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-lg backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-8 pb-5 flex gap-3">
              {imageUrlWatermark.length === 1 ? (
                <a href={imageUrlWatermark[0]} download="banner.jpg" target="_blank" rel="noreferrer"
                  className="flex-1 py-3.5 bg-slate-800 text-white text-[13px] font-bold rounded-2xl hover:bg-slate-700 transition-all text-center shadow-lg hover:-translate-y-0.5">
                  Descargar
                </a>
              ) : (
                <button type="button" onClick={() => imageUrlWatermark.forEach((url) => window.open(url, '_blank'))}
                  className="flex-1 py-3.5 bg-slate-800 text-white text-[13px] font-bold rounded-2xl hover:bg-slate-700 transition-all text-center shadow-lg hover:-translate-y-0.5">
                  Ver todas ({imageUrlWatermark.length})
                </button>
              )}
              <button type="button" onClick={() => { setShowResultModal(false); setIsPaymentModalOpen(true); }}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[13px] font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-orange-400/20 hover:-translate-y-0.5">
                Sin marca de agua
              </button>
            </div>

            {/* Video Upsell colapsable */}
            <div className="border-t border-slate-100 mx-6 md:mx-8 mb-6">
              {!videoSuccess ? (
                <div className="pt-5">
                  {!wantsVideo ? (
                    <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl px-5 py-4">
                      <div>
                        <p className="font-black text-slate-800 text-[14px]">¡Haz que se mueva! 🎬</p>
                        <p className="text-slate-500 text-[12px] mt-0.5">Conviértelo en video para TikTok o Reels.</p>
                      </div>
                      <button onClick={() => setWantsVideo(true)} className="flex-shrink-0 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-[13px]">
                        Quiero el Video
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVideo} className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 space-y-3 animate-in slide-in-from-bottom-4">
                      <p className="font-black text-slate-800 text-[14px] mb-1">¡Haz que se mueva! 🎬</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-[13px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 outline-none" type="tel" placeholder="WhatsApp" value={videoData.celular} onChange={e => setVideoData({ ...videoData, celular: e.target.value })} required />
                        <input className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-[13px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 outline-none" type="email" placeholder="Correo" value={videoData.correo} onChange={e => setVideoData({ ...videoData, correo: e.target.value })} required />
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="relative border border-slate-200 rounded-xl bg-white focus-within:ring-4 focus-within:ring-indigo-400/10 flex-1">
                          <select className="w-full bg-transparent px-3 py-2.5 text-slate-800 text-[13px] outline-none appearance-none cursor-pointer" value={videoData.formato} onChange={e => setVideoData({ ...videoData, formato: e.target.value })}>
                            <option value="story">Reel / Vertical (9:16)</option>
                            <option value="post">Feed / Cuadrado (1:1)</option>
                          </select>
                        </div>
                        <button type="submit" disabled={loadingVideo} className="flex-shrink-0 bg-indigo-600 py-2.5 px-5 rounded-xl font-bold text-[13px] text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-70 hover:bg-indigo-700">
                          {loadingVideo ? '⟳ Enviando...' : 'Enviar'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="pt-5 flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
                  <div className="text-emerald-500"><CheckCircle /></div>
                  <div>
                    <p className="font-black text-emerald-900 text-[14px]">Magia en camino</p>
                    <p className="text-emerald-700 text-[12px]">Tu video llegará por WhatsApp pronto.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 animate-in fade-in duration-200" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-[40px] shadow-2xl max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors">✕</button>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Licencia Pro</h3>
            <p className="text-slate-500 text-[15px] mb-8 leading-relaxed font-medium">Desbloquea imagen en alta resolución, sin marcas de agua, listo para impresión comercial.</p>
            <div className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">$2.990 <span className="text-lg font-bold text-slate-400 tracking-normal">CLP</span></div>
            <a href={`https://wa.me/56983656443?text=Hola,%20acabo%20de%20pagar.%20Mi%20código%20es%20SANTI-${codigoPedido}`} target="_blank" rel="noreferrer" className="flex w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[15px] font-bold tracking-wide justify-center items-center shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform">
              Notificar Pago
            </a>
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
}