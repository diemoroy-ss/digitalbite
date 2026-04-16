"use client";

import { useState, useEffect, useMemo } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, doc, increment, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileMenu from "../../components/ProfileMenu";
import { useAlertStore } from "../../store/useAlertStore";

// Generator Components
import CategorySelector from "../../components/CategorySelector";
import BannerForm from "../../components/BannerForm";
import ProductModal from "../../components/ProductModal";
import { BANNER_IDEAS } from "../../components/TemplatesData";
import type { TextLayer } from "../../components/TextLayerEditor";
import VirtualTour from "../../components/VirtualTour";
import ChatBot from "../../components/ChatBot";

export default function DashboardPage() {
  const router = useRouter();

  // ----- AUTH & GLOBAL STATE -----
  const [user, setUser] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ----- NAVIGATION & VIEW MODE -----
  const [activeTab, setActiveTab] = useState<"list" | "rrss" | "tv" | "ia" | "proximamente" | "cuota">("list");
  const [isLienzosMenuOpen, setIsLienzosMenuOpen] = useState(true);

  // ----- DB DATA (Templates & Categories) -----
  const [renders, setRenders] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);

  // ----- PRODUCTS -----
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [pendingProductToAdd, setPendingProductToAdd] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ----- VIDEO & WEBOOK STATE -----
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);
  const [loadingSendId, setLoadingSendId] = useState<string | null>(null);
  const [lastGeneratedRenders, setLastGeneratedRenders] = useState<any[]>([]);

  // ----- CUSTOM FONTS -----
  const [customFonts, setCustomFonts] = useState<any[]>([]);

  // ----- GEMINI ASISTENTE -----
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // ----- GENERATOR STATE -----
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [imageUrlWatermark, setImageUrlWatermark] = useState<string[] | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [renderingIndex, setRenderingIndex] = useState<number>(0);
  const [loadingImg, setLoadingImg] = useState(false);

  // ----- MIS DISEÑOS FILTERS -----
  const [filterFormat, setFilterFormat] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const displayedRenders = useMemo(() => {
    let result = [...renders];
    
    // Filter
    if (filterFormat !== "all") {
       result = result.filter(r => {
          if (filterFormat === "rrss") return r.destType === 'rrss' || r.formato === 'post' || r.formato === 'story' || r.formato === 'reel';
          if (filterFormat === "tv") return r.destType === 'tv' || r.formato === 'tv_v' || r.formato === 'tv_h';
          if (filterFormat === "historia") return r.formato === 'story';
          if (filterFormat === "post") return r.formato === 'post';
          if (filterFormat === "reel") return r.formato === 'reel';
          return true;
       });
    }
    
    // Sort
    if (sortOrder === "asc") {
       result = result.reverse(); // Since original is desc
    }
    
    return result;
  }, [renders, filterFormat, sortOrder]);

  // ----- SEND MEDIA MODAL -----
  const [sendModalRender, setSendModalRender] = useState<any>(null);
  const [sendMethod, setSendMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [sendDestination, setSendDestination] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [generatingCopy, setGeneratingCopy] = useState(false);

  const openSendModal = (render: any) => {
    setSendModalRender(render);
    setSendMethod('whatsapp');
    setSendDestination(userDoc?.whatsapp || "");
    setSendMessage("");
  };

  const handleGenerateCopy = async () => {
     if (!sendModalRender) return;
     setGeneratingCopy(true);
     try {
       const prompt = `Escribe un breve y atractivo copy de venta publicitario (max 2 lineas, listo para redes o whatsapp) para acompañar una imagen promocional de: ${sendModalRender.titulo}. Usa emojis.`;
       const res = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
       const data = await res.json();
       if (res.ok) setSendMessage(data.text);
       else alert("Error: " + data.error);
     } catch (err) {
       console.error(err);
       alert("Error conectando con la IA");
     } finally {
       setGeneratingCopy(false);
     }
  };

  // ----- ONBOARDING & HELP -----
  const [runTour, setRunTour] = useState(false);
  const [tourType, setTourType] = useState<"all" | "textos" | "tvs" | "borrar">("all");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const startVirtualTour = (type: "all" | "textos" | "tvs" | "borrar" = "all") => {
    setIsHelpOpen(false);
    setActiveTab("rrss");
    setTourType(type);
    
    if (categoriesData && categoriesData.length > 0) {
      let currentCatId = selectedTemplate;
      if (!currentCatId) {
        const cat = categoriesData.find((c: any) => c.id !== 'plantilla-ia');
        if (cat) currentCatId = cat.id;
      }
      
      if (currentCatId) {
        setSelectedTemplate(currentCatId);
        if (!selectedLayout) {
          const catObj = categoriesData.find((c: any) => c.id === currentCatId);
          if (catObj && catObj.layouts && catObj.layouts.length > 0) {
            setSelectedLayout(catObj.layouts[0].id);
            setFormData((prev) => ({ ...prev, destType: 'rrss', formato: 'story', screensCount: 1 }));
          }
        }
      }
    }
    
    // Give time to React to render the newly selected layouts in the DOM
    setTimeout(() => setRunTour(true), 800);
  };

  useEffect(() => {
    if (categoriesData.length > 0 && typeof window !== "undefined") {
      const hasSeenTour = localStorage.getItem("digitalbite_tour_seen");
      if (!hasSeenTour) {
        startVirtualTour();
        localStorage.setItem("digitalbite_tour_seen", "true");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesData]);

  const [formData, setFormData] = useState({
    nombreLocal: '', titulo: '', subtitulo: '', ingredientes: '', precio: '', mensaje: '',
    facebook: '', instagram: '', tiktok: '', destType: 'rrss', formato: 'story', screensCount: 1,
    logo: '', menusByScreen: [{ isMenuMode: false, menuItems: [{ name: '', price: '' }, { name: '', price: '' }, { name: '', price: '' }] }] as import("../../components/BannerForm").MenuScreenData[]
  });

  // INITIALIZE DATA
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const q = query(collection(db, "products"));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const loadTemplates = async (userData?: any) => {
      try {
        const [snapshot, catSnapshot, fontsSnapshot] = await Promise.all([
          getDocs(collection(db, "templates")),
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "fonts"))
        ]);

        let docs = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        let fetchedCats = catSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        let fetchedFonts = fontsSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        
        // --- MULTI-COMERCIO FILTER ---
        // If the user has a selected comercioIds array, restrict the categories shown to those commerces (plus general/null fallbacks).
        const allowedComercios = userData?.comercioIds || ["gastronomico"]; // fallback to gastronomico if empty/legacy user
        
        // Admin or Free mode fallbacks could bypass this, but for now we enforce the plan limits.
        if (userData?.role !== "admin") {
          fetchedCats = fetchedCats.filter((c: any) => 
             !c.comercioId || c.comercioId === "todos" || allowedComercios.includes(c.comercioId)
          );
        }

        fetchedCats.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        
        // --- PREMIUM FILTER ---
        const pName = String(userData?.plan || "").toLowerCase();
        // El plan "ONE" no tiene acceso a plantillas premium
        const isOnePlan = pName === "one";
        const isPremiumUser = (userData?.role === "admin" || pName.includes("premium") || pName.includes("business") || pName.includes("bussines")) && !isOnePlan;
        
        // Ocultar plantillas que tienen isPremium a aquellos que no sean admins o premium
        if (!isPremiumUser) {
           docs = docs.filter(t => !t.isPremium);
        }

        setDbCategories(fetchedCats);
        setTemplates(docs); 
        setCustomFonts(fetchedFonts);

        docs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

        const mapTemplateToLayout = (t: any, contextCatSlug: string) => ({
          id: t.id, name: t.name, desc: t.desc, 
          url: t.imageUrlPost || t.imageUrl, 
          urlStory: t.imageUrlVertical || t.imageUrlStory || t.imageUrl, 
          urlTv: t.imageUrlHorizontal || t.imageUrlTv || t.imageUrl, 
          colors: t.colors, fonts: t.fonts,
          defaultLayersVertical: (t.layouts && t.layouts[contextCatSlug]?.tv_v) ? t.layouts[contextCatSlug].tv_v.layers : t.defaultLayersVertical,
          defaultMenuDataVertical: (t.layouts && t.layouts[contextCatSlug]?.tv_v) ? t.layouts[contextCatSlug].tv_v.menuData : t.defaultMenuDataVertical,
          defaultLayersPost: (t.layouts && t.layouts[contextCatSlug]?.post) ? t.layouts[contextCatSlug].post.layers : t.defaultLayersPost,
          defaultMenuDataPost: (t.layouts && t.layouts[contextCatSlug]?.post) ? t.layouts[contextCatSlug].post.menuData : t.defaultMenuDataPost,
          defaultLayersHorizontal: (t.layouts && t.layouts[contextCatSlug]?.tv_h) ? t.layouts[contextCatSlug].tv_h.layers : t.defaultLayersHorizontal,
          defaultMenuDataHorizontal: (t.layouts && t.layouts[contextCatSlug]?.tv_h) ? t.layouts[contextCatSlug].tv_h.menuData : t.defaultMenuDataHorizontal,
        });

        const loadedCategories = fetchedCats
           .filter(dbCat => dbCat.slug !== 'precio' && dbCat.slug !== 'linea')
           .map(dbCat => {
          const catTemplates = docs.filter(d => {
            if (d.categories && Array.isArray(d.categories)) return d.categories.includes(dbCat.slug);
            return d.category === dbCat.slug || d.categoryId === dbCat.slug;
          });
          
          let layouts: any[] = [];
          if (dbCat.slug === "general") {
            layouts = catTemplates.map(t => mapTemplateToLayout(t, 'general'));
          } else {
            layouts = BANNER_IDEAS.map((idea) => {
              const customDbTemplate = catTemplates.find(t => t.name === idea.name);
              if (customDbTemplate) {
                return mapTemplateToLayout(customDbTemplate, dbCat.slug);
              }
              return null;
            }).filter((layout): layout is NonNullable<typeof layout> => layout !== null);
            
            const extraTemplates = catTemplates.filter(t => !BANNER_IDEAS.find(i => i.name === t.name));
            extraTemplates.forEach(t => layouts.push(mapTemplateToLayout(t, dbCat.slug)));
          }
          return { id: dbCat.slug || dbCat.id, name: dbCat.name || "N/A", icon: dbCat.emoji || "🍽️", layouts };
        });

        if (!loadedCategories.find(c => c.id === 'general')) {
             const generalTemplates = docs.filter(d => !d.categories?.length && !d.category);
             loadedCategories.push({
                 id: 'general', name: 'General', icon: '✨',
                 layouts: generalTemplates.map(t => mapTemplateToLayout(t, 'general'))
             });
        }
        setCategoriesData(loadedCategories);
      } catch (err) {
        console.error("Error loading templates:", err);
      }
    };

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
         setUser(u);
         try {
           const uDocSnapshot = await getDocs(query(collection(db, "users"), where("email", "==", u.email)));
           let dataDoc = null;
           if (!uDocSnapshot.empty) {
             dataDoc = uDocSnapshot.docs[0].data();
             if (u.email === "admin@digitalbite.santisoft.cl" || u.email === "diemondy@gmail.com") dataDoc.role = 'admin';
             setUserDoc(dataDoc);
           }

           // Fetch user renders
           const q = query(collection(db, "renders_temporales"), where("userId", "==", u.uid));
           const renderSnap = await getDocs(q);
           const data = renderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
           data.sort((a: any, b: any) => {
              const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return tB - tA;
           });
           setRenders(data);
           
           await loadTemplates(dataDoc);
         } catch(e) { console.error(e); }
         
         setLoading(false);
      } else {
         router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);


  // ----- ACTIONS -----

  const handleSidebarClick = (tab: typeof activeTab, destOptions?: { destType: string, formato: string }) => {
    setActiveTab(tab);
    if (destOptions) {
      setFormData({ ...formData, destType: destOptions.destType, formato: destOptions.formato, screensCount: 1 });
      setSelectedTemplate(null);
      setSelectedLayout(null);
      setImageUrlWatermark(null);
    }
  };

  const handleVideoGenerate = async (renderObj: any) => {
    if (!renderObj) return;
    setLoadingVideoId(renderObj.id);

    try {
      // 1. Marcar en Firestore que el video se está procesando
      const renderRef = doc(db, "renders_temporales", renderObj.id);
      await updateDoc(renderRef, { videoStatus: 'creating' });

      const layout = templates.find((t: any) => 
        t.imageUrlStory === renderObj.fondoUrl || t.imageUrlPost === renderObj.fondoUrl || 
        t.imageUrlTv === renderObj.fondoUrl || t.urlStory === renderObj.fondoUrl || t.urlPost === renderObj.fondoUrl
      );
      const layoutId = layout?.id || renderObj.layoutId || "general";
      const categoria = layout?.categoryId || layout?.category || renderObj.categoria || "general";

      const isTv = renderObj.destType === 'tv' || renderObj.formato?.includes('tv');
      const webhookUrl = isTv ? "https://n8n.santisoft.cl/webhook/generador-gastronomico-video-tv" : "https://n8n.santisoft.cl/webhook-test/generador-gastronomico";

      // Agregamos la URL del render final para que Gemini/n8n puedan ver el diseño completo
      const finalImageUrl = `https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(`https://digitalbite.santisoft.cl/render?id=${renderObj.id}`)}`;
      
      const payload = { 
        tipo: "video", 
        codigoPedido: renderObj.id, 
        layoutId, 
        categoria, 
        finalImageUrl,
        ...renderObj 
      };

      const res = await fetch(webhookUrl, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Error en webhook");

      // Usamos el sistema de alertas premium con auto-cierre de 6 segundos
      useAlertStore.getState().openAlert("¡Animación de video iniciada! Aparecerá automáticamente en esta lista en unos minutos.", 'success', 6000);
      setShowResultModal(false);
    } catch (err) {
      console.error(err); 
      // Error no desaparece solo para que el usuario lo vea
      useAlertStore.getState().openAlert("Error al iniciar la generación de video.", 'error');
      // Revertir estado si falla el inicio
      const renderRef = doc(db, "renders_temporales", renderObj.id);
      await updateDoc(renderRef, { videoStatus: null });
    } finally {
      setLoadingVideoId(null);
    }
  };

  const handleSendMediaAction = async () => {
    if (!sendModalRender) return;
    setLoadingSendId(sendModalRender.id);

    try {
      const payload = {
        tipo: "enviar_media",
        metodoEnvio: sendMethod,
        destinoEnvio: sendDestination,
        mensajeEnvio: sendMessage,
        ...sendModalRender,
        usuarioContacto: {
          whatsapp: sendMethod === 'whatsapp' ? sendDestination : (userDoc?.whatsapp || ""),
          contactoEmail: sendMethod === 'email' ? sendDestination : (userDoc?.contactoEmail || ""),
          nombre: userDoc?.name || auth.currentUser?.email || "",
          sitioWeb: userDoc?.sitioWeb || "",
          instagram: userDoc?.instagram || "",
          facebook: userDoc?.facebook || ""
        }
      };

      const res = await fetch("https://n8n.santisoft.cl/webhook/generador-gastronomico-enviar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Error en webhook de envío");

      alert(`¡Enviado! El contenido fue enviado por ${sendMethod === 'whatsapp' ? 'WhatsApp' : 'Correo'}.`);
      setSendModalRender(null);
    } catch (err) {
      console.error(err); alert("Error al intentar enviar el contenido.");
    } finally {
      setLoadingSendId(null);
    }
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setLoadingAi(true); setAiResult("");
    try {
      const res = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt }) });
      const data = await res.json();
      if (res.ok) setAiResult(data.text);
      else setAiResult(data.error || "Error generando ideas.");
    } catch {
      setAiResult("Error de conexión con el asistente.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleImg = async (e: React.FormEvent, layersByScreen: TextLayer[][] = [[]]) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedLayout) { alert("Elige una categoría y un diseño primero."); return; }
    setLoadingImg(true);
    setImageUrlWatermark(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://digitalbite.santisoft.cl";
      const urls: string[] = [];
      const generatedRenders: any[] = [];
      const validLayouts = categoriesData.find(c => c.id === selectedTemplate)?.layouts || [];
      
      for (let i = 0; i < layersByScreen.length; i++) {
        const screenLayoutId = formData.menusByScreen[i]?.layoutId || selectedLayout;
        const screenLayoutObj = validLayouts.find((l: any) => l.id === screenLayoutId) || selectedLayoutObj;

        let screenFondoUrl = screenLayoutObj?.url || "";
        if (formData.formato) {
          if (formData.formato.includes("tv_h") && screenLayoutObj?.urlTv) screenFondoUrl = screenLayoutObj.urlTv;
          else if ((formData.formato === 'story' || formData.formato.includes("tv_v")) && screenLayoutObj?.urlStory) screenFondoUrl = screenLayoutObj.urlStory;
        }
        if (!screenFondoUrl) screenFondoUrl = screenLayoutObj?.urlStory || screenLayoutObj?.url || "";

        const docRef = await addDoc(collection(db, "renders_temporales"), {
          ...formData, fondoUrl: screenFondoUrl, textLayers: layersByScreen[i], screenIndex: i, screensCount: layersByScreen.length,
          userId: auth.currentUser?.uid || null, createdAt: new Date()
        });
        
        if (userDoc?.id) {
           await updateDoc(doc(db, "users", userDoc.id), {
             generationCount: increment(1)
           });
           setUserDoc((prev: any) => prev ? { ...prev, generationCount: (prev.generationCount || 0) + 1 } : prev);
        }
        const targetUrl = `https://digitalbite.santisoft.cl/render?id=${docRef.id}`;
        urls.push(`https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(targetUrl)}`);
        
        const newRender = { id: docRef.id, ...formData, fondoUrl: screenFondoUrl, textLayers: layersByScreen[i], screenIndex: i, screensCount: layersByScreen.length, userId: auth.currentUser?.uid, createdAt: { toDate: () => new Date() } };
        generatedRenders.push(newRender);
        // Add to list and place it at top
        setRenders(prev => [newRender, ...prev]);
      }
      setLastGeneratedRenders(generatedRenders);

      setRenderingIndex(0);
      setImageUrlWatermark(urls);
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      useAlertStore.getState().openAlert("Error al guardar el diseño. Inténtalo de nuevo.", 'error');
    } finally { setLoadingImg(false); }
  };


  const activeCat = categoriesData.find(t => t.id === selectedTemplate);
  const selectedLayoutObj = activeCat?.layouts.find(l => l.id === selectedLayout) as any;
  const isGeneratorMode = activeTab === "rrss" || activeTab === "tv";
  const validLayouts = activeCat?.layouts.filter((l: any) => {
    if (formData.formato === 'story' || formData.formato === 'tv_v') return !!l.urlStory;
    if (formData.formato === 'tv_h') return !!l.urlTv;
    if (formData.formato === 'post') return !!l.url;
    return !!l.urlTv || !!l.urlStory || !!l.url;
  }) || [];


  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Skeleton Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
          <div className="flex flex-col gap-1.5">
            <div className="w-24 h-3.5 bg-slate-200 rounded animate-pulse" />
            <div className="w-16 h-2.5 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_,i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
      {/* Skeleton Main */}
      <div className="flex-1 p-6 md:p-10 space-y-6">
        <div className="h-10 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_,i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="aspect-[4/5] bg-slate-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleDeleteDesign = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("¿Seguro que deseas eliminar este diseño permanentemente?")) return;
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "renders_temporales", id));
      setRenders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el diseño.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-gradient-to-br from-indigo-50 to-rose-50" />

      {/* ----- DESKTOP TOP NAV ----- */}
      <header className="hidden md:flex w-full bg-white border-b border-slate-200 z-[60] h-20 px-6 items-center justify-between sticky top-0 shadow-sm shrink-0">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl shadow-md" aria-hidden="true">🖌️</div>
            <div>
              <span className="font-black text-slate-800 leading-tight block">DigitalBite App</span>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Workspace</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2" aria-label="Navegación principal">
            <button onClick={() => handleSidebarClick("list")}
              aria-current={activeTab === 'list' ? 'page' : undefined}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'list' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              Mis Diseños
            </button>
            <button onClick={() => handleSidebarClick("rrss", { destType: 'rrss', formato: 'story' })}
              aria-current={activeTab === 'rrss' ? 'page' : undefined}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'rrss' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              📱 Crear Redes Sociales
            </button>
            <button onClick={() => handleSidebarClick("tv", { destType: 'tv', formato: 'tv_v' })}
              aria-current={activeTab === 'tv' ? 'page' : undefined}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'tv' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              📺 Crear Menu Wall
            </button>
            <button onClick={() => handleSidebarClick("cuota")}
              aria-current={activeTab === 'cuota' ? 'page' : undefined}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'cuota' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              📊 Uso y Cuota
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4 hidden md:block">
           <ProfileMenu user={auth.currentUser} userDoc={userDoc} />
        </div>
      </header>

      {/* ----- MOBILE BOTTOM NAV ----- */}
      <nav aria-label="Navegación móvil" className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 flex safe-area-pb">
        {[
          { tab: 'list',  icon: '🖼️', label: 'Diseños' },
          { tab: 'rrss',  icon: '📱', label: 'Crear RRSS' },
          { tab: 'tv',    icon: '📺', label: 'TV Wall' },
          { tab: 'ia',    icon: '✨', label: 'IA' },
          { tab: 'cuota', icon: '📊', label: 'Cuota' },
        ].map(item => (
          <button key={item.tab}
            onClick={() => item.tab === 'rrss'
              ? handleSidebarClick('rrss', { destType: 'rrss', formato: 'story' })
              : item.tab === 'tv'
              ? handleSidebarClick('tv', { destType: 'tv', formato: 'tv_v' })
              : handleSidebarClick(item.tab as any)}
            aria-current={activeTab === item.tab ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-[10px] font-bold transition-colors
              ${activeTab === item.tab ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* ----- MAIN CONTENT ----- */}
      <main className="flex-1 overflow-y-auto w-full z-10 min-h-[calc(100vh-80px)] relative bg-[#fafaf9]" role="main">
        <div className={`w-full p-4 md:p-8 2xl:px-12 relative pb-36 md:pb-20 flex-col items-center flex`}>
          <div className="w-full">
          
          {/* TAB: LIST VIEW */}
          {activeTab === "list" && (
             <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" aria-label="Mis diseños">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                       Mis Diseños
                       {userDoc && (
                         <span className="text-[12px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full whitespace-nowrap">
                           Cuota usada: {userDoc.generationCount || renders.length}
                         </span>
                       )}
                    </h1>
                    <p className="text-slate-500 mt-1">Administra tus diseños generados, conviértelos en videos y crea más.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                      value={filterFormat} 
                      onChange={e => setFilterFormat(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm cursor-pointer hover:bg-slate-100 transition-colors"
                      title="Filtrar por formato"
                    >
                      <option value="all">🎨 Todos los Formatos</option>
                      <option value="rrss">📱 Redes Sociales (Todos)</option>
                      <option value="tv">📺 Menú TV (Todos)</option>
                      <option value="historia">📸 Historias (9:16)</option>
                      <option value="post">🖼️ Posts Cuadrados (1:1)</option>
                      <option value="reel">🎬 Reels / TikTok (Video 9:16)</option>
                    </select>

                    <select 
                      value={sortOrder} 
                      onChange={e => setSortOrder(e.target.value as "desc" | "asc")}
                      className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm cursor-pointer hover:bg-slate-100 transition-colors"
                      title="Ordenar por fecha"
                    >
                      <option value="desc">⬇️ Del más reciente al más antiguo</option>
                      <option value="asc">⬆️ Del más antiguo al más reciente</option>
                    </select>
                  </div>
                </div>

                {renders.length === 0 ? (
                  <div className="bg-gradient-to-br from-rose-50 to-indigo-50 p-12 rounded-[32px] border border-rose-100 text-center mt-8 shadow-sm">
                     <div className="text-6xl mb-4" aria-hidden="true">🎨</div>
                     <h2 className="text-2xl font-black text-slate-900 mb-2">
                       Tu primer diseño tarda menos de 2 minutos
                     </h2>
                     <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                       Elige una plantilla, escribe el nombre de tu plato y precio —
                       el resto lo hacemos nosotros. Sin diseño previo, sin complicaciones.
                     </p>
                     <div className="flex flex-col sm:flex-row gap-3 justify-center">
                       <button onClick={() => handleSidebarClick("rrss", { destType: 'rrss', formato: 'story' })}
                         className="inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-rose-500/30 transition-all text-sm">
                         <span aria-hidden="true">📱</span> Crear mi primer diseño →
                       </button>
                       <button onClick={() => handleSidebarClick("tv", { destType: 'tv', formato: 'tv_v' })}
                         className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:scale-95 text-indigo-700 font-bold px-8 py-4 rounded-2xl border-2 border-indigo-200 transition-all text-sm">
                         <span aria-hidden="true">📺</span> Crear Menú para TV
                       </button>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-8">
                    {displayedRenders.map(render => {
                        const targetUrl = `https://digitalbite.santisoft.cl/render?id=${render.id}`;
                        const imageUrl = `https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(targetUrl)}`;
                         const isHorizontal = render.formato === 'tv_h';
                         const isPost = render.formato === 'post';
                         const isVideo = render.formato?.includes('tv');
                         const renderAspect = isHorizontal ? 'aspect-[16/9]' : (isPost ? 'aspect-square' : 'aspect-[9/16]');
                         
                         return (
                           <article key={render.id} aria-label={`Diseño: ${render.titulo || 'Sin título'}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                             <div className={`${renderAspect} bg-slate-100 relative overflow-hidden`}>
                              <img src={imageUrl} alt={`Vista previa de ${render.titulo || 'diseño'}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" onError={(e) => { e.currentTarget.src = render.fondoUrl || "https://digitalbite.santisoft.cl/logo.png"; }} />
                              <div className="absolute top-3 left-3 flex gap-2">
                                  <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                                    {isVideo ? '🎥 Render TV' : '📱 Render RRSS'}
                                  </span>
                              </div>
                              <div className="absolute top-3 right-3 flex gap-2 z-10 transition-opacity opacity-0 group-hover:opacity-100">
                                  <button onClick={(e) => handleDeleteDesign(render.id, e)} disabled={deletingId === render.id} className="bg-red-500/90 hover:bg-red-600 backdrop-blur-md text-white text-[12px] font-black w-7 h-7 flex items-center justify-center rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50">
                                    {deletingId === render.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <span aria-hidden="true" title="Eliminar Diseño">🗑️</span>}
                                  </button>
                              </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">ID: {render.id.substring(0,5).toUpperCase()}</span>
                                  <time dateTime={render.createdAt?.toDate?.()?.toISOString?.()} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{render.createdAt?.toDate ? render.createdAt.toDate().toLocaleDateString() : 'Reciente'}</time>
                               </div>
                               <h2 className="font-bold text-slate-800 text-sm mb-4 line-clamp-1">{render.titulo || 'Sin título'}</h2>
                               <div className="mt-auto grid grid-cols-2 gap-2">
                                  <a href={targetUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-[11px] transition-colors">
                                     Ver Original
                                  </a>
                                  {render.videoUrl ? (
                                    <a href={render.videoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 font-bold py-2 rounded-xl text-[11px] transition-colors">
                                       <span aria-hidden="true">▶️</span> Play Video
                                    </a>
                                  ) : render.videoStatus === 'creating' ? (
                                    <div className="flex items-center justify-center gap-2 w-full bg-amber-50 border border-amber-100 text-amber-600 font-bold py-2 rounded-xl text-[10px] animate-pulse">
                                      <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                      🎬 Procesando...
                                    </div>
                                  ) : (
                                    <button onClick={() => handleVideoGenerate(render)} disabled={loadingVideoId === render.id} aria-label={`Generar video de ${render.titulo || 'diseño'}`} className="flex items-center justify-center gap-1 w-full bg-rose-50 hover:bg-rose-100 disabled:bg-slate-50 border border-rose-100 disabled:border-slate-100 text-rose-600 disabled:text-slate-400 font-bold py-2 rounded-xl text-[11px] transition-colors">
                                       {loadingVideoId === render.id ? <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin"/> : <span aria-hidden="true">🎬</span>} 
                                       {loadingVideoId === render.id ? 'Iniciando...' : 'Generar Video'}
                                    </button>
                                  )}
                               </div>
                               
                               {(render.videoUrl || render.fondoUrl) && (
                                   <button onClick={() => openSendModal(render)} disabled={loadingSendId === render.id} className="mt-2 flex items-center justify-center gap-1 w-full bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-50 border border-indigo-100 disabled:border-slate-100 text-indigo-700 disabled:text-slate-400 font-bold py-2 rounded-xl text-[11px] transition-colors">
                                     {loadingSendId === render.id ? <div className="w-3 h-3 border-2 border-indigo-400 border-t-white rounded-full animate-spin"/> : <span aria-hidden="true">📤</span>} 
                                     {loadingSendId === render.id ? 'Cargando modal...' : (render.videoUrl ? 'Enviar Video por WS/Email' : 'Enviar Imagen por WS/Email')}
                                   </button>
                               )}
                            </div>
                          </article>
                        )
                    })}
                  </div>
                )}
             </section>
          )}

          {/* TAB: GENERATOR VIEW (RRSS / TV) */}
          {isGeneratorMode && (
            <section className="animate-in fade-in slide-in-from-right-4 duration-500" aria-label={activeTab === 'rrss' ? 'Crear diseño para redes sociales' : 'Crear Menú Wall para TV'}>
              
              {/* PROGRESS BAR */}
              {(() => {
                const currentStep = !selectedTemplate ? 0 : !selectedLayout ? 1 : 2;
                const steps = ["Categoría", "Formato y Diseño", "Personalizar"];
                return (
                  <div className="flex items-center gap-1 mb-8 bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-sm max-w-2xl mx-auto" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={3} aria-label={`Paso ${currentStep + 1} de 3: ${steps[currentStep]}`}>
                    {steps.map((label, i) => (
                      <div key={label} className="flex items-center gap-2 flex-1">
                        <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black transition-colors
                          ${currentStep > i ? 'bg-rose-500 text-white' : currentStep === i ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-400'}`}>
                          {currentStep > i ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs font-bold hidden sm:block ${currentStep === i ? 'text-indigo-700' : currentStep > i ? 'text-slate-500' : 'text-slate-300'}`}>{label}</span>
                        {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${currentStep > i ? 'bg-rose-400' : 'bg-slate-200'}`} aria-hidden="true" />}
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="mb-8 text-center">
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                   {activeTab === 'rrss' ? 'Crear diseño para Redes Sociales 📱' : 'Crear Menú Wall para TV 📺'}
                 </h1>
                 <p className="text-slate-500 text-sm mt-1">Calidad Pro sin marcas de agua.</p>
              </div>

              {/* Paso 1 en Vista Generador: Categoría */}
              {!selectedTemplate && (
                 <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-200 shadow-sm text-center animate-in fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold tracking-widest uppercase mb-4">Paso 1: Categoría</div>
                    <h3 className="text-3xl font-black mb-10">¿Qué producto promocionarás?</h3>
                    <div className="max-w-4xl mx-auto">
                      <CategorySelector 
                        categories={categoriesData.filter(c => c.id !== 'plantilla-ia')} 
                        selectedTemplate={selectedTemplate} 
                        onSelect={(id) => { setSelectedTemplate(id); setSelectedLayout(null); }} 
                        allowedCategories={null} 
                      />
                    </div>
                 </div>
              )}

              {/* Paso 2 y 3: Formato, Plantillas Arriba, Formulario Abajo */}
              {selectedTemplate && (
                 <div className="flex flex-col gap-6 mt-6">
                    
                    {/* TOP HORIZONTAL: FORMAT & TEMPLATES */}
                    <div className="w-full max-w-5xl mx-auto bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-6">
                       
                       <div className="flex flex-col gap-3 shrink-0">
                         <div className="flex items-center justify-between">
                           <div>
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold tracking-widest uppercase mb-1">Paso 2: Formato</div>
                              <h3 className="text-xl font-black leading-none">Tipo de Pantalla</h3>
                           </div>
                           <button onClick={() => { setSelectedTemplate(null); setSelectedLayout(null); }} className="text-[12px] font-bold text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200">
                             Cambiar Categoría
                           </button>
                         </div>
                         
                         {/* FORMAT SELECTOR */}
                         <div className="flex gap-2">
                            {formData.destType === 'rrss' ? (
                              <>
                                <button type="button" onClick={() => { setFormData({ ...formData, formato: 'story', screensCount: 1 }); setSelectedLayout(null); }}
                                  className={`flex-1 py-3 rounded-xl text-[12px] font-bold border-2 transition-all flex flex-col items-center gap-2 ${
                                    formData.formato === 'story' ? "border-rose-400 bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white"
                                  }`}>
                                  <div className={`w-6 h-9 rounded-[4px] border-2 ${formData.formato === 'story' ? 'border-rose-400 bg-rose-100' : 'border-slate-300 bg-slate-200'}`} />
                                  Historia / Reel
                                  <span className={`text-[10px] font-normal ${formData.formato === 'story' ? 'text-rose-400' : 'text-slate-400'}`}>9:16</span>
                                </button>
                                <button type="button" onClick={() => { setFormData({ ...formData, formato: 'post', screensCount: 1 }); setSelectedLayout(null); }}
                                  className={`flex-1 py-3 rounded-xl text-[12px] font-bold border-2 transition-all flex flex-col items-center gap-2 ${
                                    formData.formato === 'post' ? "border-rose-400 bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white"
                                  }`}>
                                  <div className={`w-8 h-8 rounded-[4px] border-2 ${formData.formato === 'post' ? 'border-rose-400 bg-rose-100' : 'border-slate-300 bg-slate-200'}`} />
                                  Post Cuadrado
                                  <span className={`text-[10px] font-normal ${formData.formato === 'post' ? 'text-rose-400' : 'text-slate-400'}`}>1:1</span>
                                </button>
                              </>
                            ) : (
                               <>
                                <button type="button" onClick={() => { setFormData({ ...formData, formato: 'tv_v' }); setSelectedLayout(null); }}
                                  className={`flex-1 py-3 rounded-xl text-[12px] font-bold border-2 transition-all flex flex-col items-center gap-2 outline-none ${
                                    formData.formato === 'tv_v' ? "border-rose-400 bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white"
                                  }`}>
                                  <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="18" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill={formData.formato === 'tv_v' ? 'rgba(251,113,133,0.2)' : '#f1f5f9'}/>
                                    <rect x="7" y="26" width="6" height="3" rx="1" fill="currentColor" opacity="0.5"/>
                                  </svg>
                                  TV Vertical
                                  <span className={`text-[10px] font-normal ${formData.formato === 'tv_v' ? 'text-rose-400' : 'text-slate-400'}`}>9:16</span>
                                </button>
                                <button type="button" onClick={() => { setFormData({ ...formData, formato: 'tv_h' }); setSelectedLayout(null); }}
                                  className={`flex-1 py-3 rounded-xl text-[12px] font-bold border-2 transition-all flex flex-col items-center gap-2 outline-none ${
                                    formData.formato === 'tv_h' ? "border-rose-400 bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white"
                                  }`}>
                                  <svg width="30" height="22" viewBox="0 0 30 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="28" height="17" rx="2" stroke="currentColor" strokeWidth="2" fill={formData.formato === 'tv_h' ? 'rgba(251,113,133,0.2)' : '#f1f5f9'}/>
                                    <rect x="10" y="19" width="10" height="2" rx="1" fill="currentColor" opacity="0.5"/>
                                  </svg>
                                  TV Horizontal
                                  <span className={`text-[10px] font-normal ${formData.formato === 'tv_h' ? 'text-rose-400' : 'text-slate-400'}`}>16:9</span>
                                </button>
                               </>
                            )}
                         </div>

                         {/* TV Count Selector */}
                         {formData.destType === 'tv' && (
                           <div className="mt-1 flex items-center justify-end gap-3 text-right">
                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">
                               Cantidad de Pantallas
                             </span>
                             <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                               {([1, 2, 3] as const).map(num => (
                                 <button key={num} type="button"
                                   onClick={() => {
                                     const newMenus = [...formData.menusByScreen];
                                     while (newMenus.length < num) { newMenus.push({ isMenuMode: false, menuItems: [{ name: '', price: '' }] }); }
                                     setFormData({ ...formData, screensCount: num, menusByScreen: newMenus });
                                   }}
                                   className={`w-9 h-7 rounded-md text-[12px] font-black transition-all ${
                                     formData.screensCount === num ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                   }`}>
                                   {num}
                                 </button>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>

                       <hr className="border-slate-100" />

                       {/* TEMPLATE FILTERED LIST */}
                       <div className="flex flex-col gap-3 shrink-0">
                         <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold tracking-widest uppercase mb-1">Paso 3: Diseño</div>
                            <h3 className="text-xl font-black leading-none">Plantillas Disponibles {activeCat?.name ? <span className="text-slate-400 font-medium">— {activeCat.name}</span> : ''}</h3>
                         </div>

                         <div className="overflow-x-auto pb-4 custom-scrollbar flex-1 relative flex gap-3 tour-plantillas">
                           {validLayouts.length === 0 ? (
                             <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full">
                                <span className="text-3xl mb-2 block">🤷‍♂️</span>
                                <p className="text-[13px] font-bold text-slate-600">No hay plantillas disponibles.</p>
                                <p className="text-[11px] text-slate-400 mt-1">Sube diseño(s) en la sección Admin de la plataforma para utilizar {formData.formato}.</p>
                             </div>
                           ) : (
                              validLayouts.map((l: any) => {
                                let layoutUrl = l.url;
                                if (formData.formato === 'story' || formData.formato === 'tv_v') layoutUrl = l.urlStory || l.url;
                                if (formData.formato === 'tv_h') layoutUrl = l.urlTv || l.url;
                                const isHorizontal = formData.formato === 'tv_h';
                                const isSelected = selectedLayout === l.id;
                                const baseWidth = isHorizontal ? 1920 : 1080;
                                const baseHeight = formData.formato === 'post' ? 1080 : isHorizontal ? 1080 : 1920;
                                const localLayers = (formData.formato === 'story' || formData.formato === 'tv_v')
                                  ? (l.defaultLayersVertical || l.layouts?.story?.layers)
                                  : isHorizontal
                                    ? (l.defaultLayersHorizontal || l.layouts?.tv_h?.layers)
                                    : (l.defaultLayersPost || l.layouts?.post?.layers);
                                return (
                                  <button key={l.id} onClick={() => setSelectedLayout(l.id)}
                                    className={`flex-shrink-0 relative rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border-[3px] group outline-none ${
                                      isHorizontal ? 'w-48 aspect-[16/9]' : (formData.formato === 'post' ? 'w-32 aspect-square' : 'w-24 aspect-[9/16]')
                                    } ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[0.98]' : 'border-transparent hover:border-slate-300 hover:scale-[1.02]'}`}
                                    style={{ containerType: 'inline-size' }}>
                                    <img src={layoutUrl} alt={l.name} className="w-full h-full object-cover" loading="lazy" />
                                    {localLayers && localLayers.length > 0 && (
                                      <div className="absolute inset-0 z-10 pointer-events-none">
                                        {localLayers.map((lyr: any) => {
                                          const leftPct = lyr.posX !== undefined ? lyr.posX : (lyr.x / baseWidth) * 100;
                                          const topPct = lyr.posY !== undefined ? lyr.posY : (lyr.y / baseHeight) * 100;
                                          const wVal = lyr.width;
                                          let widthPct = "100%";
                                          if (wVal) {
                                            if (typeof wVal === 'string' && wVal.endsWith('%')) widthPct = wVal;
                                            else if (typeof wVal === 'number' && wVal <= 100) widthPct = `${wVal}%`;
                                            else widthPct = `${(wVal / (formData.formato === 'post' ? 400 : isHorizontal ? 700 : 250)) * 100}%`;
                                          }
                                          return (
                                            <div key={lyr.id} style={{
                                              position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`,
                                              width: widthPct, transform: 'translate(-50%, -50%)',
                                              display: 'flex', alignItems: 'center',
                                              justifyContent: lyr.textAlign === 'center' ? 'center' : lyr.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                              fontFamily: lyr.fontFamily || 'Inter', fontWeight: lyr.fontWeight || '700',
                                            }}>
                                              {lyr.type === 'text' && (
                                                <div style={{ width: '100%', color: lyr.color || '#fff', textAlign: lyr.textAlign || 'center',
                                                  fontSize: `${((lyr.fontSize || 40) / baseWidth) * 100}cqi`, lineHeight: 1.1,
                                                  textShadow: lyr.shadow !== false ? '0px 2px 8px rgba(0,0,0,0.8)' : 'none', wordBreak: 'break-word' }}>
                                                  {lyr.text || 'Texto'}
                                                </div>
                                              )}
                                              {lyr.type === 'image' && lyr.text && lyr.text.startsWith('http') && (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                  <img src={lyr.text} alt="img" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: lyr.shadow !== false ? 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' : 'none' }} />
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs shadow-md">✓</div>
                                    )}
                                    <div className={`absolute bottom-0 inset-x-0 p-2 text-left bg-gradient-to-t from-black/80 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                       <p className="text-white font-bold text-[10px] truncate">{l.name}</p>
                                    </div>
                                  </button>
                                )
                              })
                           )}
                         </div>
                       </div>
                    </div>

                    {/* BOTTOM FULL WIDTH: EDITOR */}
                    <div className="w-full bg-slate-100 p-6 md:p-10 rounded-[32px] border border-slate-200 shadow-inner min-h-[500px]">
                      {selectedLayout ? (
                         <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="bg-white rounded-[24px] p-0 md:p-6 shadow-sm border border-slate-200">
                             {customFonts.length > 0 && (
                                <style>{customFonts.map(f => f.url.includes("fonts.googleapis.com") ? `@import url('${f.url}');` : `
                                  @font-face {
                                    font-family: "${f.name}";
                                    src: url(${f.url});
                                  }
                                `).join("\n")}</style>
                             )}
                             <BannerForm
                                formData={formData}
                                setFormData={setFormData}
                                handleImg={handleImg}
                                loadingImg={loadingImg}
                                selectedLayoutObj={selectedLayoutObj}
                                validLayouts={validLayouts}
                                imageUrlWatermark={imageUrlWatermark}
                                setShowResultModal={setShowResultModal}
                                pendingProductToAdd={pendingProductToAdd}
                                setPendingProductToAdd={setPendingProductToAdd}
                                onOpenProductModal={() => setIsProductModalOpen(true)}
                                customFonts={customFonts}
                                products={products}
                                categorySlug={selectedTemplate}
                                userDoc={userDoc}
                             />
                           </div>
                         </div>
                      ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center py-20 px-4">
                            <div className="w-24 h-24 mb-6 relative">
                               <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-30"></div>
                               <div className="absolute inset-0 bg-white border-2 border-dashed border-indigo-200 rounded-full flex items-center justify-center text-4xl shadow-sm z-10">👆</div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Selecciona un diseño arriba</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">Elige qué plantilla se adapta mejor a tu idea para desplegar el editor a pantalla completa.</p>
                         </div>
                      )}
                    </div>

                 </div>
              )}
            </section>
          )}

          {/* TAB: IA */}
          {activeTab === "ia" && (
             <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-200">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20">✨</div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">Asistente Creativo de IA</h2>
                     <p className="text-slate-500 text-sm mt-1">Obtén ideas de textos, mensajes o títulos al instante.</p>
                   </div>
                 </div>

                 <form onSubmit={handleAskGemini} className="space-y-4 relative z-10 text-black">
                   <textarea
                     value={aiPrompt}
                     onChange={e => setAiPrompt(e.target.value)}
                     placeholder="Ej: Dame 3 ideas de títulos llamativos y subtítulos para una promo de hamburguesa doble queso para Instagram..."
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-800 min-h-[140px] outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all resize-none"
                   />
                   <button disabled={loadingAi || !aiPrompt.trim()} type="submit" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md">
                      {loadingAi ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : '✨ '}
                      {loadingAi ? 'Pensando...' : 'Generar Ideas'}
                   </button>
                 </form>

                 {aiResult && (
                   <div className="mt-8 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-in fade-in">
                     <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Resultado IA:</p>
                     {aiResult}
                   </div>
                 )}
               </div>
             </div>
          )}

          {/* TAB: PROXIMAMENTE */}
          {activeTab === "proximamente" && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 animate-in fade-in duration-500">
              <span className="text-4xl mb-3 grayscale opacity-60" aria-hidden="true">🚗</span>
              <h2 className="text-xl font-bold">Tema Automotriz en construcción</h2>
            </div>
          )}

          {/* TAB: CUOTA */}
          {activeTab === "cuota" && (
             <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto" aria-label="Uso y Cuota">
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
                       Uso y Cuota 📊
                   </h1>
                   <p className="text-slate-500 mb-8">Revisa el historial de uso de tu cuenta y evalúa un cambio de plan si estás cerca del límite.</p>

                   {userDoc ? (() => {
                      const limit = userDoc.plan?.creaciones_mes || userDoc.generationLimit || 0;
                      const used = userDoc.generationCount || renders.length || 0;
                      const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : (used > 0 ? 100 : 0);
                      
                      return (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                           <div className="flex justify-between items-end mb-4">
                              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cuota de Generación Mensual</span>
                              <span className="text-2xl font-black text-indigo-600">{used} <span className="text-slate-400 text-lg">/ {limit === 0 ? 'Ilimitado' : limit}</span></span>
                           </div>
                           <div className="h-4 bg-slate-200 rounded-full overflow-hidden w-full relative shadow-inner">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000" style={{ width: `${pct}%` }} />
                           </div>
                           <div className="mt-3 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">{pct}% Utilizado</div>
                        </div>
                      )
                   })() : null}
                   
                   <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">Historial de Diseños Generados</h2>
                   
                   <div className="bg-white border flex flex-col border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="grid grid-cols-4 bg-slate-50 p-4 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         <div className="col-span-2">Diseño</div>
                         <div className="text-center">Fecha de Creación</div>
                         <div className="text-right">Ataque a Cuota</div>
                      </div>
                      
                      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                         {renders.map((r, i) => {
                            const dateObj = r.createdAt?.toDate ? r.createdAt.toDate() : null;
                            const dateStr = dateObj ? dateObj.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Desconocido';
                            return (
                              <div key={r.id || i} className="grid grid-cols-4 p-4 items-center hover:bg-slate-50 transition-colors">
                                 <div className="col-span-2 flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 overflow-hidden border border-slate-200">
                                     {r.fondoUrl ? (
                                        <img src={r.fondoUrl} alt="thumb" className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg">🖼️</div>
                                     )}
                                   </div>
                                   <div className="flex flex-col">
                                     <span className="text-sm font-bold text-slate-800 line-clamp-1">{r.titulo || 'Muestra de Diseño'}</span>
                                     <span className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">{r.formato?.includes('tv') ? '📺 TV WALL' : '📱 RRSS'}</span>
                                   </div>
                                 </div>
                                 <div className="text-center text-xs font-bold text-slate-500 uppercase">{dateStr}</div>
                                 <div className="text-right text-sm font-black text-slate-700 flex justify-end items-center gap-2">
                                    <span className="bg-rose-100 text-rose-600 px-2.5 py-1 rounded-lg text-[10px] tracking-widest leading-none">-1 Cuota</span>
                                 </div>
                              </div>
                            )
                         })}
                         
                         {renders.length === 0 && (
                            <div className="p-12 text-center text-slate-400 text-sm font-bold">Aún no has generado ningún diseño.</div>
                         )}
                      </div>
                   </div>
                </div>
             </section>
          )}

          </div>
        </div>
      </main>

      {/* ------ SEND MEDIA MODAL ------ */}
      {sendModalRender && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800">Compartir Diseño</h3>
              <button title="Cerrar" onClick={() => setSendModalRender(null)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-100 hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-xl transition-all">✖</button>
            </div>
            
            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Thumbnail mini-preview */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                 <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                    <img src={`https://butterfly.santisoft.cl/link-previews/v1?url=${encodeURIComponent(`https://digitalbite.santisoft.cl/render?id=${sendModalRender.id}`)}`} alt="Miniatura" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = sendModalRender.fondoUrl || '/logo.png'; }} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest leading-none mb-1">Adjunto HD Listo</span>
                    <span className="text-sm font-bold text-slate-700 line-clamp-1">{sendModalRender.titulo || 'Muestra de Diseño'}</span>
                 </div>
              </div>

              {/* Method Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0">
                <button type="button" onClick={() => { setSendMethod('whatsapp'); setSendDestination(userDoc?.whatsapp || ""); }} className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${sendMethod === 'whatsapp' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <span className="text-lg">💬</span> WhatsApp
                </button>
                <button type="button" onClick={() => { setSendMethod('email'); setSendDestination(userDoc?.contactoEmail || ""); }} className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${sendMethod === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <span className="text-lg">📧</span> Correo Electrónico
                </button>
              </div>

              {/* Destination Input */}
              <div className="shrink-0">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{sendMethod === 'whatsapp' ? 'Número de WhatsApp Destino' : 'Dirección de Correo Destino'}</label>
                <input 
                  type={sendMethod === 'email' ? 'email' : 'tel'} 
                  value={sendDestination} 
                  onChange={e => setSendDestination(e.target.value)} 
                  placeholder={sendMethod === 'whatsapp' ? '+56912345678' : 'ejemplo@tucorreo.com'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Message / Copy */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Texto Acompañante (Opcional)</label>
                   <button type="button" onClick={handleGenerateCopy} disabled={generatingCopy} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                     {generatingCopy ? <span className="animate-spin inline-block border-2 border-indigo-400 border-t-transparent rounded-full w-3 h-3" /> : <span>✨</span>}
                     {generatingCopy ? 'Pensando copy...' : 'Crear con IA'}
                   </button>
                </div>
                <textarea 
                  value={sendMessage} 
                  onChange={e => setSendMessage(e.target.value)} 
                  placeholder="Escribe el texto que acompañará a la foto o video..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
               <button onClick={() => setSendModalRender(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-[13px]">Cancelar</button>
               <button onClick={handleSendMediaAction} disabled={!sendDestination || !!loadingSendId} className={`px-6 py-2.5 rounded-xl font-black disabled:bg-opacity-50 text-white shadow-lg transition-all text-[13px] flex items-center gap-2 ${sendMethod === 'whatsapp' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'}`}>
                  {loadingSendId ? <span className="animate-spin inline-block border-2 border-white/50 border-t-white rounded-full w-4 h-4" /> : '🚀' }
                  {loadingSendId ? 'Enviando...' : `Enviar por ${sendMethod === 'whatsapp' ? 'WhatsApp' : 'Correo'}`}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ProductModal 
        isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} products={products} dbCategories={dbCategories}
        onSelect={(url) => { setPendingProductToAdd(url); setIsProductModalOpen(false); }} refreshProducts={fetchProducts} category={selectedTemplate}
      />

      {/* Result Image Generated Modal with Video Action */}
      {showResultModal && imageUrlWatermark && imageUrlWatermark.length > 0 && isGeneratorMode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in" onClick={() => { setShowResultModal(false); setActiveTab("list"); }}>
          <div className="bg-white rounded-[32px] p-6 md:p-8 text-center max-w-4xl w-full shadow-2xl relative my-8" onClick={e => e.stopPropagation()}>
             <div className="hidden md:flex absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full items-center justify-center text-3xl shadow-inner z-10" aria-hidden="true">✨</div>
             
             <h2 className="text-2xl mt-4 md:mt-6 font-black text-slate-900 mb-2">¡Lienzos Creados Exitosamente!</h2>
             <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Tus diseños han sido guardados en 'Mis Diseños'. Además, puedes <strong>animar cualquiera de ellos para convertirlo en video</strong>.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-4 mb-8">
               {lastGeneratedRenders.map((renderObj, idx) => (
                  <div key={renderObj.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col items-center max-w-xs mx-auto w-full">
                     <h3 className="font-bold text-slate-800 mb-3 text-sm">
                        {lastGeneratedRenders.length > 1 ? `Pantalla ${renderObj.screenIndex + 1}` : 'Tu Diseño'}
                     </h3>
                     
                     <div className={`relative w-full ${renderObj.formato?.includes("tv_h") ? 'aspect-video' : 'aspect-[9/16]'} bg-slate-200 rounded-xl overflow-hidden shadow-sm mb-4`}>
                        <img src={imageUrlWatermark[idx]} alt={`Preview TV ${renderObj.screenIndex + 1}`} className="object-cover w-full h-full" />
                     </div>
                     
                     <button 
                        onClick={() => handleVideoGenerate(renderObj)} 
                        disabled={loadingVideoId === renderObj.id}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-100 disabled:text-slate-400 text-indigo-700 font-bold text-[12px] py-3 rounded-xl border border-indigo-200 disabled:border-slate-200 flex items-center justify-center gap-2 transition-colors">
                        {loadingVideoId === renderObj.id ? (
                          <><div className="w-4 h-4 border-2 border-indigo-400 border-t-white rounded-full animate-spin"/> Generando...</>
                        ) : (
                          <><span className="text-lg">🎬</span> Animar a Video</>
                        )}
                     </button>
                  </div>
               ))}
             </div>

             <button onClick={() => { setShowResultModal(false); setActiveTab("list"); }} className="w-full max-w-sm mx-auto block bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95">
               Ir a Mis Diseños
             </button>
          </div>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button 
        onClick={() => setIsHelpOpen(true)}
        aria-label="Abrir panel de ayuda"
        className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-slate-900 hover:bg-slate-800 text-white shadow-2xl rounded-full px-5 py-3.5 flex items-center gap-2 font-bold text-sm transition-transform hover:-translate-y-1"
      >
        <span aria-hidden="true">❓</span> Ayuda
      </button>

      {/* HELP SIDEBAR */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in" onClick={() => setIsHelpOpen(false)}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 md:p-10 flex flex-col relative animate-in slide-in-from-right-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsHelpOpen(false)} aria-label="Cerrar panel de ayuda" className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full transition-colors"><span aria-hidden="true">✕</span></button>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2 mt-4">¿Cómo Funciona?</h2>
            <p className="text-slate-500 text-sm mb-8">Una guía rápida para usar el creador como un experto.</p>
            
            <button 
              onClick={() => startVirtualTour("all")}
              className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors mb-6 shadow-sm w-full"
            >
              <span className="text-2xl" aria-hidden="true">🗺️</span>
              Ver Tour Completo
            </button>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <button onClick={() => startVirtualTour("textos")} className="w-full text-left bg-slate-50 hover:bg-slate-100 p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-colors group">
                <h3 className="font-bold text-slate-800 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2"><span className="text-lg" aria-hidden="true">👆</span> Editar Textos Mágicos</span>
                  <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">Ver ▸</span>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">Paso a paso de cómo hacer clic y modificar cualquier texto del lienzo.</p>
              </button>
              
              <button onClick={() => startVirtualTour("tvs")} className="w-full text-left bg-slate-50 hover:bg-slate-100 p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-colors group">
                <h3 className="font-bold text-slate-800 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2"><span className="text-lg" aria-hidden="true">📺</span> Menu Wall TVs</span>
                  <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">Ver ▸</span>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">Tutorial de cómo configurar varias pantallas sincronizadas en horizontal.</p>
              </button>
              
              <button onClick={() => startVirtualTour("borrar")} className="w-full text-left bg-slate-50 hover:bg-slate-100 p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-colors group">
                <h3 className="font-bold text-slate-800 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2"><span className="text-lg" aria-hidden="true">🗑️</span> Borrar Elementos</span>
                  <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">Ver ▸</span>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">Descubre dónde está el botón para eliminar cualquier capa que no te sirva.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIRTUAL TOUR COMPONENT */}
      {isGeneratorMode && runTour && <VirtualTour run={true} tourType={tourType} onFinish={() => setRunTour(false)} />}

      <ChatBot />

      {/* WIDGET FLOTANTE DE FACTURACIÓN Y LÍMITES */}
      {userDoc && userDoc.role !== "admin" && (
         <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-5 duration-500">
           <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl shadow-slate-900/50 w-64">
             <div className="flex justify-between items-center mb-3">
                <span className="text-white font-black text-sm">Tu Plan: <span className="text-amber-400 capitalize">{userDoc.plan || "Gratis"}</span></span>
                <Link href="/onboarding" className="text-indigo-400 text-xs font-bold hover:text-indigo-300">Modificar</Link>
             </div>
             
             {/* Limit: Plantillas */}
             <div className="mb-3">
               <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <span>🖼️ Plantillas</span>
                  <span>{userDoc.generationCount || 0} / {userDoc.generationLimit === 0 ? "∞" : userDoc.generationLimit || 0}</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden relative">
                 <div 
                   className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                     userDoc.generationLimit === 0 
                     ? 'bg-emerald-500 w-full' 
                     : ((userDoc.generationCount||0) / (userDoc.generationLimit||1)) >= 1 
                        ? 'bg-rose-500' 
                        : ((userDoc.generationCount||0) / (userDoc.generationLimit||1)) >= 0.8 
                          ? 'bg-amber-400' 
                          : 'bg-indigo-500'
                   }`} 
                   style={{ width: userDoc.generationLimit === 0 ? '100%' : `${Math.min(((userDoc.generationCount||0) / (userDoc.generationLimit||1))*100, 100)}%` }}
                 />
               </div>
             </div>

             {/* Limit: Videos */}
             <div>
               <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <span>🎥 Videos</span>
                  <span>{userDoc.videoGenerationCount || 0} / {userDoc.videoLimit === 0 ? "∞" : userDoc.videoLimit || 0}</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden relative">
                 <div 
                   className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                     userDoc.videoLimit === 0 
                     ? 'bg-emerald-500 w-full' 
                     : ((userDoc.videoGenerationCount||0) / (userDoc.videoLimit||1)) >= 1 
                        ? 'bg-rose-500' 
                        : ((userDoc.videoGenerationCount||0) / (userDoc.videoLimit||1)) >= 0.8 
                          ? 'bg-amber-400' 
                          : 'bg-indigo-500'
                   }`} 
                   style={{ width: userDoc.videoLimit === 0 ? '100%' : `${Math.min(((userDoc.videoGenerationCount||0) / (userDoc.videoLimit||1))*100, 100)}%` }}
                 />
               </div>
             </div>

             {/* Limit: Org */}
             <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between text-xs text-slate-400 font-medium">
               <span>Comercios: <b className="text-white">{(userDoc.comercioIds || []).length} seleccionados</b></span>
             </div>

           </div>
         </div>
      )}

    </div>
  )
}
