"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import Image from "next/image";
import TemplateBuilderModal from "../../../components/TemplateBuilderModal";
import TemplateBaseEditorModal from "../../../components/TemplateBaseEditorModal";
import { TextLayer } from "../../../components/TextLayerEditor";
import { useAlertStore } from "../../../store/useAlertStore";

// Fuentes comunes
const FONTS = [
  "Inter", "Roboto", "Montserrat", "Playfair Display", "Oswald", 
  "Bebas Neue", "Pacifico", "Anton", "Lobster", "Dancing Script"
];

interface Categoria {
  id: string;
  slug: string;
  name: string;
  comercioId?: string;
}

interface Comercio {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

interface Plantilla {
  id: string;
  name: string;
  categories: string[];
  comercioId?: string;
  
  // Legacy
  imageUrl?: string;
  storagePath?: string;

  // New Formats
  imageUrlVertical?: string;
  storagePathVertical?: string;
  
  imageUrlPost?: string;
  storagePathPost?: string;

  imageUrlHorizontal?: string;
  storagePathHorizontal?: string;

  colors: string[]; // [Color 1, Color 2, Color 3]
  fonts: string[];  // [Font 1, Font 2, Font 3]
  createdAt: any;
  defaultLayersVertical?: any[];
  defaultMenuDataVertical?: any;
  defaultLayersPost?: any[];
  defaultMenuDataPost?: any;
  defaultLayersHorizontal?: any[];
  defaultMenuDataHorizontal?: any;
  layouts?: Record<string, Record<string, { layers: any[], menuData: any }>>;
  isPremium?: boolean;
  isFeaturedOnLanding?: boolean;
}

interface Background {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  format: 'tv_v' | 'post' | 'tv_h';
}

export default function PlantillasAdmin() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [customFonts, setCustomFonts] = useState<any[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [filterComercio, setFilterComercio] = useState("todos");
  const [filterCat, setFilterCat] = useState("todas");
  const [filterFormat, setFilterFormat] = useState("tv_v");
  const [editId, setEditId] = useState<string|null>(null);
  const [previewImage, setPreviewImage] = useState<{url: string, template: Plantilla}|null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderFormat, setBuilderFormat] = useState<"story"|"post"|"tv_h">("story");

  // Base Assets Editor
  const [baseEditorOpen, setBaseEditorOpen] = useState(false);
  const [baseEditorTemplate, setBaseEditorTemplate] = useState<Plantilla | null>(null);

  // Duplicate / Clone Modal
  const [duplicateModalTemplate, setDuplicateModalTemplate] = useState<Plantilla | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<'full' | 'content'>('full');
  const [duplicateTargetCategories, setDuplicateTargetCategories] = useState<string[]>([]);
  const [duplicateTargetName, setDuplicateTargetName] = useState("");
  const [duplicateTargetTemplate, setDuplicateTargetTemplate] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  // Data Formulario
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comercioId, setComercioId] = useState("gastronomico");
  
  // Archivos
  const [fileVertical, setFileVertical] = useState<File | null>(null);
  const [filePost, setFilePost] = useState<File | null>(null);
  const [fileHorizontal, setFileHorizontal] = useState<File | null>(null);

  // Background selection
  const [bgIdVertical, setBgIdVertical] = useState<string>("");
  const [bgIdPost, setBgIdPost] = useState<string>("");
  const [bgIdHorizontal, setBgIdHorizontal] = useState<string>("");
  
  // Visual Selection Tab
  const [activeFmtTab, setActiveFmtTab] = useState<'tv_v' | 'post' | 'tv_h'>('tv_v');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchCategorias(), fetchPlantillas(), fetchCustomFonts(), fetchComercios(), fetchBackgrounds()]);
    setLoading(false);
  };

  const fetchBackgrounds = async () => {
    const q = query(collection(db, "backgrounds"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data: Background[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Background));
    setBackgrounds(data);
  };

  const fetchComercios = async () => {
    const q = query(collection(db, "comercios"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data: Comercio[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Comercio));
    setComercios(data);
  };

  const fetchCustomFonts = async () => {
    const q = query(collection(db, "fonts"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data: any[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() }));
    setCustomFonts(data);
  };

  const fetchCategorias = async () => {
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data: Categoria[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Categoria));
    setCategorias(data);
    if(data.length > 0 && selectedCategories.length === 0) setSelectedCategories([data[0].slug]);
  };

  const fetchPlantillas = async () => {
    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data: Plantilla[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Plantilla));
    setPlantillas(data);
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedCategories.length === 0) {
      useAlertStore.getState().openAlert("Por favor ingresa un nombre y selecciona al menos una categoría.", "warning");
      return;
    }
    
    // Validar que al menos un formato tenga fondo seleccionado
    if (!bgIdVertical && !bgIdPost && !bgIdHorizontal && !editId) {
      useAlertStore.getState().openAlert("Debes seleccionar al menos un fondo de la librería.", "warning");
      return;
    }

    try {
      setSaving(true);
      
      const updateData: any = { 
        name, 
        categories: selectedCategories, 
        comercioId: comercioId || "gastronomico"
      };

      // Si hay fondo seleccionado, actualizar URLs
      const bgV = backgrounds.find(b => b.id === bgIdVertical);
      if (bgV) {
        updateData.imageUrlVertical = bgV.url;
        updateData.storagePathVertical = bgV.storagePath;
      }
      
      const bgP = backgrounds.find(b => b.id === bgIdPost);
      if (bgP) {
        updateData.imageUrlPost = bgP.url;
        updateData.storagePathPost = bgP.storagePath;
      }

      const bgH = backgrounds.find(b => b.id === bgIdHorizontal);
      if (bgH) {
        updateData.imageUrlHorizontal = bgH.url;
        updateData.storagePathHorizontal = bgH.storagePath;
      }

      if (editId) {
        await updateDoc(doc(db, "templates", editId), updateData);
      } else {
        updateData.createdAt = serverTimestamp();
        await addDoc(collection(db, "templates"), updateData);
      }

      resetForm();
      await fetchPlantillas();

    } catch (e) {
      console.error(e);
      useAlertStore.getState().openAlert("Error al guardar la plantilla.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLayouts = async (layers: any[], menuData: any) => {
    if (!previewImage) return;
    const docRef = doc(db, "templates", previewImage.template.id);
    const updateData: any = {};
    if (builderFormat === "story") {
       updateData.defaultLayersVertical = layers;
       updateData.defaultMenuDataVertical = menuData;
       previewImage.template.defaultLayersVertical = layers;
       previewImage.template.defaultMenuDataVertical = menuData;
    } else if (builderFormat === "post") {
       updateData.defaultLayersPost = layers;
       updateData.defaultMenuDataPost = menuData;
       previewImage.template.defaultLayersPost = layers;
       previewImage.template.defaultMenuDataPost = menuData;
    } else if (builderFormat === "tv_h") {
       updateData.defaultLayersHorizontal = layers;
       updateData.defaultMenuDataHorizontal = menuData;
       previewImage.template.defaultLayersHorizontal = layers;
       previewImage.template.defaultMenuDataHorizontal = menuData;
    }
    
    await updateDoc(docRef, updateData);
    setPlantillas(plantillas.map(p => p.id === previewImage.template.id ? previewImage.template : p));
    setBuilderOpen(false);
  };

  const editItem = (p: Plantilla) => {
    setEditId(p.id);
    setName(p.name);
    // Backward compatibility for old `category` string field
    setSelectedCategories(p.categories ? p.categories : (p as any).category ? [(p as any).category] : []);
    setComercioId(p.comercioId || "gastronomico");
    
    // Buscar fondos que coincidan con las URLs actuales
    const bgV = backgrounds.find(b => b.url === p.imageUrlVertical || b.url === p.imageUrl);
    const bgP = backgrounds.find(b => b.url === p.imageUrlPost);
    const bgH = backgrounds.find(b => b.url === p.imageUrlHorizontal);
    
    setBgIdVertical(bgV?.id || "");
    setBgIdPost(bgP?.id || "");
    setBgIdHorizontal(bgH?.id || "");
    setActiveFmtTab('tv_v');

    setIsDrawerOpen(true);
  };

  const deleteItem = async (p: Plantilla) => {
    useAlertStore.getState().openConfirm({
      message: "¿Estás seguro de eliminar esta plantilla visual?",
      type: 'error',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "templates", p.id));
          
          const deletePromises = [];
          if (p.storagePath) deletePromises.push(deleteObject(ref(storage, p.storagePath)).catch(() => {}));
          if (p.storagePathVertical) deletePromises.push(deleteObject(ref(storage, p.storagePathVertical)).catch(() => {}));
          if (p.storagePathPost) deletePromises.push(deleteObject(ref(storage, p.storagePathPost)).catch(() => {}));
          if (p.storagePathHorizontal) deletePromises.push(deleteObject(ref(storage, p.storagePathHorizontal)).catch(() => {}));
          
          await Promise.all(deletePromises);
          
          setPlantillas(plantillas.filter(item => item.id !== p.id));
          useAlertStore.getState().openAlert("Plantilla eliminada exitosamente.", "success");
        } catch (error) {
          console.error(error);
          useAlertStore.getState().openAlert("Hubo un error al eliminar.", "error");
        }
      }
    });
  };

  const resetForm = () => {
     setName(""); setEditId(null);
     setBgIdVertical(""); setBgIdPost(""); setBgIdHorizontal("");
     if(categorias.length>0) setSelectedCategories([categorias[0].slug]);
     setComercioId("gastronomico");
     setIsDrawerOpen(false);
  }

  const openDuplicateModal = (p: Plantilla) => {
    setDuplicateModalTemplate(p);
    setDuplicateMode('full');
    setDuplicateTargetName(p.name + " (copia)");
    setDuplicateTargetCategories(p.categories || []);
    setDuplicateTargetTemplate(null);
  };

  const handleDuplicate = async () => {
    if (!duplicateModalTemplate) return;
    setDuplicating(true);
    try {
      const orig = duplicateModalTemplate;

      if (duplicateMode === 'full') {
        // Duplicate everything: create a new template doc
        const newDoc: any = {
          name: duplicateTargetName || orig.name + " (copia)",
          categories: duplicateTargetCategories.length > 0 ? duplicateTargetCategories : (orig.categories || []),
          comercioId: orig.comercioId || "gastronomico",
          imageUrlVertical: orig.imageUrlVertical || null,
          storagePathVertical: orig.storagePathVertical || null,
          imageUrlPost: orig.imageUrlPost || null,
          storagePathPost: orig.storagePathPost || null,
          imageUrlHorizontal: orig.imageUrlHorizontal || null,
          storagePathHorizontal: orig.storagePathHorizontal || null,
          imageUrl: orig.imageUrl || null,
          storagePath: orig.storagePath || null,
          colors: orig.colors || [],
          fonts: orig.fonts || [],
          defaultLayersVertical: orig.defaultLayersVertical || [],
          defaultMenuDataVertical: orig.defaultMenuDataVertical || null,
          defaultLayersPost: orig.defaultLayersPost || [],
          defaultMenuDataPost: orig.defaultMenuDataPost || null,
          defaultLayersHorizontal: orig.defaultLayersHorizontal || [],
          defaultMenuDataHorizontal: orig.defaultMenuDataHorizontal || null,
          layouts: orig.layouts || {},
          isPremium: orig.isPremium || false,
          isFeaturedOnLanding: false,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "templates"), newDoc);
      } else {
        // Clone content only: copy layers/menu/colors/fonts to existing target template
        if (!duplicateTargetTemplate) {
          useAlertStore.getState().openAlert("Selecciona una plantilla destino.", "warning");
          setDuplicating(false);
          return;
        }
        const targetRef = doc(db, "templates", duplicateTargetTemplate);
        const updateData: any = {
          defaultLayersVertical: orig.defaultLayersVertical || [],
          defaultMenuDataVertical: orig.defaultMenuDataVertical || null,
          defaultLayersPost: orig.defaultLayersPost || [],
          defaultMenuDataPost: orig.defaultMenuDataPost || null,
          defaultLayersHorizontal: orig.defaultLayersHorizontal || [],
          defaultMenuDataHorizontal: orig.defaultMenuDataHorizontal || null,
          layouts: orig.layouts || {},
          colors: orig.colors || [],
          fonts: orig.fonts || [],
        };
        await updateDoc(targetRef, updateData);
      }

      await fetchPlantillas();
      setDuplicateModalTemplate(null);
      useAlertStore.getState().openAlert(duplicateMode === 'full'
        ? "¡Plantilla duplicada exitosamente!"
        : "¡Contenido clonado a la plantilla destino!", "success");
    } catch (err) {
      console.error(err);
      useAlertStore.getState().openAlert("Error al duplicar/clonar la plantilla.", "error");
    } finally {
      setDuplicating(false);
    }
  };

  const InputLabel = ({t}: {t:string}) => <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t}</label>;
  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-medium transition-all";

  const allFonts = Array.from(new Set([...FONTS, ...customFonts.map(f => f.name)]));

  const filteredPlantillas = plantillas.flatMap(p => {
    // Comercio Filter
    const pCom = p.comercioId || "gastronomico";
    if (filterComercio !== "todos" && pCom !== filterComercio) return [];

    const passCat = filterCat === "todas" || p.categories?.includes(filterCat) || (p as any).category === filterCat;
    if (!passCat) return [];

    // Identify which Category context we are previewing. If viewing 'todas', default to the primary category.
    const contextCat = filterCat === "todas" ? ((p.categories && p.categories.length > 0) ? p.categories[0] : (p as any).category || 'general') : filterCat;
    
    // Helper to retrieve category-specific layout or fallback to legacy global layout
    const getLayers = (fmtKey: string, legacyKey: string) => {
       if (p.layouts && p.layouts[contextCat] && p.layouts[contextCat][fmtKey]) {
          return p.layouts[contextCat][fmtKey].layers || [];
       }
       return (p as any)[legacyKey] || [];
    };

    let variations = [];
    const hasVertical = !!p.imageUrlVertical || !!p.imageUrl;
    
    // Vertical
    if (hasVertical && (filterFormat === 'todos' || filterFormat === 'tv_v')) {
       variations.push({ ...p, displayFormat: 'tv_v', displayUrl: p.imageUrlVertical || p.imageUrl, formatLabel: '📱 Vertical / Story', defaultLayers: getLayers('tv_v', 'defaultLayersVertical') });
    }
    // Horizontal
    if (p.imageUrlHorizontal && (filterFormat === 'todos' || filterFormat === 'tv_h')) {
       variations.push({ ...p, displayFormat: 'tv_h', displayUrl: p.imageUrlHorizontal, formatLabel: '📺 Horizontal', defaultLayers: getLayers('tv_h', 'defaultLayersHorizontal') });
    }
    // Post Cuadrado
    if (p.imageUrlPost && (filterFormat === 'todos' || filterFormat === 'post')) {
       variations.push({ ...p, displayFormat: 'post', displayUrl: p.imageUrlPost, formatLabel: '⏹️ Cuadrado', defaultLayers: getLayers('post', 'defaultLayersPost') });
    }
    return variations;
  }).sort((a, b) => {
     const order: Record<string, number> = { 'tv_v': 1, 'tv_h': 2, 'post': 3 };
     if (order[a.displayFormat] !== order[b.displayFormat]) {
        return order[a.displayFormat] - order[b.displayFormat];
     }
     return 0; // retain creation order inside same format
  });

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto h-screen overflow-y-auto">
      {customFonts.length > 0 && (
         <style>{customFonts.map(f => f.url.includes("fonts.googleapis.com") ? `@import url('${f.url}');` : `
           @font-face {
             font-family: "${f.name}";
             src: url(${f.url});
           }
         `).join("\n")}</style>
      )}

      {/* BARRA SUPERIOR DE SELECTORES (STEPPER / PROGRESSIVE FILTERS) - STICKY */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center gap-4 sticky top-0 z-30">
         <div className="flex-1 w-full relative">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">Paso 1: Comercio</label>
            <select value={filterComercio} onChange={(e) => { setFilterComercio(e.target.value); setFilterCat("todas"); }} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors">
               <option value="todos">🗂️ Todos los Comercios</option>
               {comercios.map(c => <option key={c.id} value={c.slug}>{c.icon||"🏢"} {c.name}</option>)}
            </select>
         </div>
         <div className="shrink-0 text-slate-300 font-black hidden md:block pt-5">➔</div>
         <div className="flex-1 w-full relative">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">Paso 2: Categoría</label>
            <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); }} disabled={filterComercio === "todos"} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors">
               <option value="todas">Todas las categorías</option>
               {categorias.filter(cat => filterComercio === "todos" || (cat.comercioId || "gastronomico") === filterComercio).map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
               ))}
            </select>
         </div>
         <div className="shrink-0 text-slate-300 font-black hidden md:block pt-5">➔</div>
         <div className="flex-1 w-full relative">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">Paso 3: Formato</label>
            <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)} disabled={filterCat === "todas" && filterComercio !== "todos"} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors">
               <option value="todos">Todos los Formatos</option>
               <option value="tv_v">📱 Story / Vertical</option>
               <option value="tv_h">📺 TV Horizontal</option>
               <option value="post">⏹️ Post Cuadrado</option>
            </select>
         </div>
         
         <div className="shrink-0 pt-5">
            <button onClick={() => { resetForm(); setIsDrawerOpen(true); }} className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">
               <span>+</span> Crear
            </button>
         </div>
      </div>
      
      {/* FEEDBACK DE ESTADO (BREADCRUMB CHIP) */}
      <div className="mb-6 flex items-center justify-between">
         <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 shadow-sm">
            <span>👁️ Estás viendo:</span>
            <span className="font-black">{filterComercio === "todos" ? "Todos los comercios" : comercios.find(c => c.slug === filterComercio)?.name}</span>
            {filterComercio !== "todos" && <span className="text-indigo-300">/</span>}
            {filterComercio !== "todos" && <span className="font-black">{filterCat === "todas" ? "Todas las Categorías" : categorias.find(c => c.slug === filterCat)?.name}</span>}
            {filterCat !== "todas" && filterComercio !== "todos" && <span className="text-indigo-300">/</span>}
            {filterCat !== "todas" && filterComercio !== "todos" && <span className="font-black">{filterFormat === "tv_v" ? "Vertical" : filterFormat === "tv_h" ? "Horizontal" : filterFormat === "post" ? "Cuadrado" : "Todos los Formatos"}</span>}
         </div>
         <a href="/admin/fuentes" className="shrink-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl border border-slate-200 transition-colors text-sm shadow-sm">
           <span aria-hidden="true">🔤</span> Gestionar Fuentes
         </a>
      </div>

      <div className="flex w-full items-start relative gap-8">
        
        {/* PANEL LATERAL (DRAWER) DE EDICIÓN/CREACIÓN */}
        <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] border-l border-slate-200 transform transition-transform duration-300 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-24">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
                  {editId ? <span>✏️ Editar Plantilla</span> : <span>✨ Crear Plantilla</span>}
                </h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
              </div>
              
              <form id="drawer-form" onSubmit={handleSave} className="space-y-4">
                
                {/* 1. INFORMACIÓN BÁSICA (Accordion) */}
                <details className="group border border-slate-200 rounded-xl bg-white overflow-hidden" open>
                  <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/50 hover:bg-slate-50 font-bold text-sm text-slate-800 select-none">
                    <span>1. Información Básica</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 pt-2 space-y-4 border-t border-slate-100 bg-white">
                     <div>
                        <InputLabel t="Nombre Descriptivo" />
                        <input type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Pizzería Fuego" className={inputClass} />
                     </div>
                     <div>
                        <InputLabel t="Comercio Asignado" />
                        <select value={comercioId} onChange={(e) => setComercioId(e.target.value)} className={`${inputClass} font-bold text-indigo-700`}>
                           {comercios.length === 0 && <option value="gastronomico">Gastronómico</option>}
                           {comercios.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <InputLabel t="Categorías Interesadas" />
                        <div className="flex flex-wrap gap-2">
                           {categorias.filter(c => (c.comercioId || "gastronomico") === comercioId).map(c => {
                             const isSelected = selectedCategories.includes(c.slug);
                             return (
                               <button type="button" key={c.slug} onClick={() => {
                                   if (isSelected && selectedCategories.length > 1) setSelectedCategories(selectedCategories.filter(s => s !== c.slug));
                                   else if (!isSelected) setSelectedCategories([...selectedCategories, c.slug]);
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                                 {c.name}
                               </button>
                             )
                           })}
                        </div>
                     </div>
                  </div>
                </details>

                              {/* 2. GALEÍA VISUAL DE FONDOS */}
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <div className="bg-slate-50/50 px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-black text-sm text-slate-800">2. Fondos de Librería</span>
                    <div className="flex gap-1 items-center">
                      {bgIdVertical && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Story asignado" />}
                      {bgIdPost && <span className="w-2 h-2 rounded-full bg-blue-400" title="Post asignado" />}
                      {bgIdHorizontal && <span className="w-2 h-2 rounded-full bg-violet-400" title="TV asignado" />}
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Tabs de Formato */}
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      {[
                        { id: 'tv_v', label: '📱 Story', count: bgIdVertical ? 1 : 0 },
                        { id: 'post', label: '⏹️ Post', count: bgIdPost ? 1 : 0 },
                        { id: 'tv_h', label: '📺 TV', count: bgIdHorizontal ? 1 : 0 },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFmtTab(tab.id as any)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-black transition-all ${
                            activeFmtTab === tab.id
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {tab.label}
                          {tab.count > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Grid de Miniaturas */}
                    {(() => {
                      const fmtBgs = backgrounds.filter(b => b.format === activeFmtTab);
                      const currentId = activeFmtTab === 'tv_v' ? bgIdVertical : activeFmtTab === 'post' ? bgIdPost : bgIdHorizontal;
                      const setCurrentId = activeFmtTab === 'tv_v' ? setBgIdVertical : activeFmtTab === 'post' ? setBgIdPost : setBgIdHorizontal;

                      if (fmtBgs.length === 0) return (
                        <div className="py-10 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                          <p className="text-2xl mb-2">🖼️</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin fondos en este formato</p>
                          <p className="text-[9px] text-slate-300 mt-1">Súbelos desde el panel "Fondos"</p>
                        </div>
                      );

                      return (
                        <div className={`grid gap-2 max-h-[340px] overflow-y-auto pr-1 ${
                          activeFmtTab === 'tv_v' ? 'grid-cols-3' : 
                          activeFmtTab === 'post' ? 'grid-cols-3' : 'grid-cols-2'
                        }`}>
                          {fmtBgs.map(bg => {
                            const isSelected = currentId === bg.id;
                            return (
                              <button
                                key={bg.id}
                                type="button"
                                onClick={() => setCurrentId(isSelected ? '' : bg.id)}
                                className={`relative rounded-xl overflow-hidden group transition-all duration-200 ${
                                  isSelected
                                    ? 'ring-[3px] ring-offset-2 ring-rose-500 shadow-lg shadow-rose-200'
                                    : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-1'
                                }`}
                              >
                                <div className={`w-full ${
                                  activeFmtTab === 'tv_v' ? 'aspect-[9/16]' :
                                  activeFmtTab === 'post' ? 'aspect-square' : 'aspect-[16/9]'
                                }`}>
                                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                </div>
                                <div className={`absolute inset-0 transition-opacity ${
                                  isSelected ? 'bg-rose-500/20' : 'bg-transparent'
                                }`} />
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                                    ✓
                                  </div>
                                )}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-[8px] font-black text-white uppercase truncate">{bg.name}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Resumen de selección */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      {[
                        { id: 'tv_v', label: 'Story', bgId: bgIdVertical },
                        { id: 'post', label: 'Post', bgId: bgIdPost },
                        { id: 'tv_h', label: 'TV', bgId: bgIdHorizontal },
                      ].map(fmt => {
                        const bg = backgrounds.find(b => b.id === fmt.bgId);
                        return (
                          <div key={fmt.id} onClick={() => setActiveFmtTab(fmt.id as any)} className="cursor-pointer group">
                            <div className={`rounded-lg overflow-hidden border-2 transition-all ${
                              bg ? 'border-emerald-300' : 'border-dashed border-slate-200'
                            } ${activeFmtTab === fmt.id ? 'ring-2 ring-rose-300' : ''}`}>
                              {bg ? (
                                <div className={`w-full ${
                                  fmt.id === 'tv_v' ? 'aspect-[9/16]' : fmt.id === 'post' ? 'aspect-square' : 'aspect-[16/9]'
                                }`}>
                                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className={`w-full flex items-center justify-center text-slate-300 ${
                                  fmt.id === 'tv_v' ? 'aspect-[9/16]' : fmt.id === 'post' ? 'aspect-square' : 'aspect-[16/9]'
                                }`}>
                                  <span className="text-lg">+</span>
                                </div>
                              )}
                            </div>
                            <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-1">{fmt.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* BOTÓN STICKY DEL DRAWER */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-safe z-50">
               <button type="submit" form="drawer-form" disabled={saving || !name || selectedCategories.length===0} 
                  className={`w-full py-4 text-white font-black text-sm rounded-xl tracking-widest shadow-md transition-all ${saving || !name || selectedCategories.length===0 ? 'bg-slate-300 opacity-70 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 hover:shadow-lg'}`}>
                 {saving ? "⏳ Guardando..." : editId ? "💾 Guardar Cambios" : "🚀 Publicar Plantilla"}
               </button>
            </div>
          </div>
        </div>

        {/* OVERLAY DEL DRAWER */}
        {isDrawerOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
        )}

        {/* LADO DERECHO: GALERÍA DE PLANTILLAS */}
        <div className="w-full flex-1">


           {loading ? (
             <div className="p-20 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
           ) : filterComercio === "todos" ? (
             <div className="bg-white border border-slate-200 border-dashed rounded-[32px] p-10 md:p-20 text-center text-slate-500 w-full mt-4 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-sm border border-slate-100">🏢</div>
                <h3 className="font-black text-slate-800 text-2xl mb-2 tracking-tight">Selecciona un Comercio</h3>
                <p className="max-w-md mx-auto text-slate-500">El espacio está limpio. Filtra por el tipo de comercio arriba para empezar a gestionar sus plantillas asociadas.</p>
             </div>
           ) : filterCat === "todas" ? (
             <div className="bg-white border border-slate-200 border-dashed rounded-[32px] p-10 md:p-20 text-center text-slate-500 w-full mt-4 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-sm border border-slate-100">🗂️</div>
                <h3 className="font-black text-slate-800 text-2xl mb-2 tracking-tight">Selecciona una Categoría</h3>
                <p className="max-w-md mx-auto text-slate-500">Para evitar saturación visual, te mostramos las plantillas de una categoría a la vez. Elige una de las pestañas superiores.</p>
             </div>
           ) : filteredPlantillas.filter(p => filterFormat === 'todos' || p.displayFormat === filterFormat).length === 0 ? (
             <div className="bg-white border border-slate-200 border-dashed rounded-[32px] p-10 md:p-20 text-center text-slate-500 w-full mt-4 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-5xl mb-6 opacity-30 drop-shadow-sm">🖼️</div>
                <h3 className="font-black text-slate-800 text-2xl mb-2 tracking-tight">Sin Resultados</h3>
                <p className="max-w-md mx-auto text-slate-500">No hay plantillas creadas que coincidan con este comercio, categoría y formato.</p>
              </div>
           ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 pb-12 w-full">
                 {filteredPlantillas.filter(p => filterFormat === 'todos' || p.displayFormat === filterFormat).map(p => {
                         const firstCatSlug = (p.categories && p.categories.length > 0) ? p.categories[0] : (p as any).category;
                         const catData = categorias.find(c => c.slug === firstCatSlug);
                         const isMulti = p.categories && p.categories.length > 1;

                         return (
                           <div key={`${p.id}-${p.displayFormat}`} className="bg-white group rounded-[20px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col items-center relative">
                             
                             <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={(e)=>{ e.stopPropagation(); openDuplicateModal(p); }} className="bg-white/90 backdrop-blur-sm text-amber-600 p-2.5 rounded-xl shadow-sm hover:bg-amber-50" title="Duplicar / Clonar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                 </button>
                                <button onClick={()=>{ setBaseEditorTemplate(p); setBaseEditorOpen(true); }} className="bg-white/90 backdrop-blur-sm text-emerald-600 p-2.5 rounded-xl shadow-sm hover:bg-emerald-50" title="Configurar Base (Fuentes/Colores/Productos)">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.23 3.003a7.3 7.3 0 0 1 7.007 10.012 7.5 7.5 0 0 1-10.012 7.007 7.5 7.5 0 0 1-7.007-10.012 7.5 7.5 0 0 1 10.012-7.007Z"/><path d="m16 9-4 4-2-2"/><path d="M12 3v3"/><path d="M18.5 4.5 16 7"/><path d="M21 9h-3"/><path d="M18.5 13.5 16 11"/><path d="M12 15v-3"/></svg>
                                </button>
                                <button onClick={()=>editItem(p)} className="bg-white/90 backdrop-blur-sm text-indigo-600 p-2.5 rounded-xl shadow-sm hover:bg-indigo-50" title="Editar config"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
                                <button onClick={()=>deleteItem(p)} className="bg-white/90 backdrop-blur-sm text-rose-500 p-2.5 rounded-xl shadow-sm hover:bg-rose-50" title="Borrar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                             </div>

                             <div className={`w-full bg-slate-100 relative overflow-hidden ${p.displayFormat === 'tv_h' ? 'aspect-[16/9]' : p.displayFormat === 'post' ? 'aspect-square' : 'aspect-[9/16]'}`} style={{ containerType: 'inline-size' }}>
                                <div className="absolute inset-0 flex p-0 bg-slate-200">
                                   <div className="relative flex-1 h-full cursor-pointer hover:scale-105 transition-transform duration-500" onClick={() => { 
                                       setPreviewImage({ url: p.displayUrl, template: p }); 
                                       setBuilderFormat(p.displayFormat === 'tv_v' ? 'story' : p.displayFormat === 'tv_h' ? 'tv_h' : 'post');
                                       setBuilderOpen(true); 
                                    }}>
                                      <Image src={p.displayUrl} alt={p.name} fill className="object-cover" unoptimized />
                                   </div>
                                </div>
                                {p.defaultLayers && p.defaultLayers.length > 0 && (
                                   <div className="absolute inset-0 z-10 pointer-events-none">
                                      {p.defaultLayers.map((l: any) => {
                                         const baseWidth = p.displayFormat === 'tv_h' ? 1920 : 1080;
                                         const baseHeight = p.displayFormat === 'post' ? 1080 : p.displayFormat === 'tv_h' ? 1080 : 1920;
                                         
                                         const leftPct = l.posX !== undefined ? l.posX : (l.x / baseWidth) * 100;
                                         const topPct = l.posY !== undefined ? l.posY : (l.y / baseHeight) * 100;
                                         
                                         // Width and Height scaling guard auto-healer
                                         let widthPct = "100%";
                                         if (l.width !== undefined && l.width !== null && l.width !== "") {
                                            if (typeof l.width === 'string' && l.width.endsWith('%')) {
                                               widthPct = l.width;
                                            } else {
                                               const wNum = parseFloat(String(l.width));
                                               if (!isNaN(wNum)) {
                                                  if (wNum <= 100) widthPct = `${wNum}%`;
                                                  else widthPct = `${(wNum / (p.displayFormat === 'post' ? 400 : p.displayFormat === 'tv_h' ? 700 : 250)) * 100}%`;
                                               }
                                            }
                                         }
                                         
                                         let heightPct = "auto";
                                         if (l.height !== undefined && l.height !== null && l.height !== "") {
                                            if (typeof l.height === 'string' && l.height.endsWith('%')) {
                                               heightPct = l.height;
                                            } else {
                                               const hNum = parseFloat(String(l.height));
                                               if (!isNaN(hNum)) {
                                                  if (hNum <= 100) heightPct = `${hNum}%`;
                                               }
                                            }
                                         }
                                         
                                         const transformStr = 'translate(-50%, -50%)';

                                         return (
                                            <div key={l.id} style={{
                                               position: 'absolute',
                                               left: `${leftPct}%`,
                                               top: `${topPct}%`,
                                               width: widthPct,
                                               height: heightPct,
                                               transform: transformStr,
                                               display: 'flex',
                                               alignItems: 'center',
                                               justifyContent: l.textAlign === 'center' ? 'center' : l.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                               fontFamily: l.fontFamily || 'Inter',
                                               fontWeight: l.fontWeight || '700',
                                            }}>
                                               {l.type === 'text' && (
                                                  <div style={{
                                                     width: '100%',
                                                     color: l.color || '#fff',
                                                     textAlign: l.textAlign || 'center',
                                                     fontSize: `${((l.fontSize || 40) / baseWidth) * 100}cqi`,
                                                     lineHeight: 1.1,
                                                     textShadow: l.shadow !== false ? '0px 2px 8px rgba(0,0,0,0.8)' : 'none',
                                                     wordBreak: 'break-word',
                                                  }}>
                                                     {l.text || 'Texto'}
                                                  </div>
                                               )}
                                               {l.type === 'image' && l.text && l.text.startsWith('http') && (
                                                  <div style={{
                                                     width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                  }}>
                                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                                     <img src={l.text} alt="img" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: l.shadow !== false ? 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' : 'none' }} />
                                                  </div>
                                               )}
                                               {l.type === 'image' && (!l.text || !l.text.startsWith('http')) && (
                                                  <div style={{
                                                     width: '100%', height: '100%', borderRadius: '8%', border: '2px dashed rgba(255,255,255,0.7)',
                                                     backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                  }}>
                                                     <span style={{ fontSize: `${(60 / baseWidth) * 100}cqi`, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}>🖼️</span>
                                                  </div>
                                               )}
                                            </div>
                                         );
                                      })}
                                   </div>
                                )}
                                 <div className="absolute bottom-2 left-2 flex gap-1 z-20 pointer-events-none">
                                   <span className="bg-black/60 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase backdrop-blur-sm shadow-sm">{p.formatLabel.split(' ')[0]} {p.displayFormat === 'tv_v' ? 'Vertical' : p.displayFormat === 'tv_h' ? 'Horiz' : 'Post'}</span>
                                 </div>
                                 {p.isPremium && (
                                   <div className="absolute top-2 left-2 z-20 pointer-events-none bg-amber-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-amber-500/40 border border-amber-400">
                                      ⭐ Premium
                                   </div>
                                 )}
                                 {p.isFeaturedOnLanding && (
                                   <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-indigo-500/40 border border-indigo-400">
                                      🌟 En Landing
                                   </div>
                                 )}
                              </div>

                             <div className="w-full p-4 border-t border-slate-100 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[60%]" title={p.categories?.join(', ')}>
                                    {catData?.name || firstCatSlug} {isMulti && <span className="bg-slate-100 text-slate-400 px-1 rounded ml-1">+{p.categories.length - 1}</span>}
                                  </span>
                                  <div className="flex -space-x-1">
                                    {p.colors && p.colors.map((c, i) => (
                                      <div key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{backgroundColor: c}} />
                                    ))}
                                  </div>
                                </div>
                                <h3 className="font-black text-slate-800 text-sm truncate">{p.name}</h3>
                             </div>
                           </div>
                         )
                       })}
              </div>
            )}

        </div>
      </div>

      {/* Lightbox / Preview Modal removed as per user request to open Builder directly */}

      {/* Visual Workspace Modal */}
      <TemplateBuilderModal 
         isOpen={builderOpen}
         plantilla={previewImage?.template}
         formato={builderFormat}
         onClose={() => setBuilderOpen(false)}
         onSave={async (layers, menuData, targetCategory) => {
                   const targetId = previewImage?.template?.id || editId;
                   if (!targetId) return;
                   
                   // Fetch fresh template directly in case it changed
                   const tSnap = await getDocs(query(collection(db, "templates")));
                   const currentT = tSnap.docs.find(d => d.id === targetId)?.data();
                   if (!currentT) return;

                   // We use the new layouts format
                   const catTarget = targetCategory || 'general';
                   
                   const existingLayouts = currentT.layouts || {};
                   const thisCatLayouts = existingLayouts[catTarget] || {};
                   thisCatLayouts[builderFormat] = { layers, menuData };
                   existingLayouts[catTarget] = thisCatLayouts;

                   // also backward compatibility saving on legacy keys to not break anything
                   let legacyKey1 = "defaultLayersVertical";
                   let legacyKey2 = "defaultMenuDataVertical";
                   if(builderFormat === "post") { legacyKey1 = "defaultLayersPost"; legacyKey2 = "defaultMenuDataPost"; }
                   if(builderFormat === "tv_h") { legacyKey1 = "defaultLayersHorizontal"; legacyKey2 = "defaultMenuDataHorizontal"; }

                   await updateDoc(doc(db, "templates", targetId), {
                     layouts: existingLayouts,
                     [legacyKey1]: layers,
                     [legacyKey2]: menuData
                   });

                   setBuilderOpen(false);
                   fetchPlantillas();
                }}
         customFonts={customFonts}
         initialCategory={filterCat === "todas" ? ((plantillas.find(p => p.id === editId)?.categories?.[0]) || 'general') : filterCat}
      />

      {baseEditorOpen && baseEditorTemplate && (
         <TemplateBaseEditorModal 
           isOpen={baseEditorOpen}
           template={baseEditorTemplate}
           categorySlug={filterCat === "todas" ? (baseEditorTemplate.categories?.[0] || 'general') : filterCat}
           onClose={() => setBaseEditorOpen(false)}
           allSystemFonts={FONTS}
           customFonts={customFonts}
           onSave={async (data) => {
             try {
               setSaving(true);
               const docRef = doc(db, "templates", baseEditorTemplate.id);
               
               // We need the full fresh layouts object
               const freshSnap = await getDocs(query(collection(db, "templates")));
               const currentFull = freshSnap.docs.find(d => d.id === baseEditorTemplate.id)?.data() as Plantilla;
               const existingLayouts = currentFull?.layouts || {};
               
               const catKey = filterCat === "todas" ? (baseEditorTemplate.categories?.[0] || 'general') : filterCat;
               
               // Ensure the category object exists
               if (!existingLayouts[catKey]) {
                 existingLayouts[catKey] = {};
               }

               // Update specifically the base assets
               existingLayouts[catKey] = {
                 ...(existingLayouts[catKey] as any),
                 baseFonts: data.baseFonts,
                 baseColors: data.baseColors,
                 baseProducts: data.baseProducts
               };

               await updateDoc(docRef, { layouts: existingLayouts });
                
                setBaseEditorOpen(false);
                fetchPlantillas();
                useAlertStore.getState().openAlert("Base guardada correctamente", "success");
             } catch (e) {
               console.error(e);
               useAlertStore.getState().openAlert("Error al guardar la base", "error");
             } finally {
               setSaving(false);
             }
           }}
         />
       )}
       {/* MODAL DUPLICAR / CLONAR PLANTILLA */}
       {duplicateModalTemplate && (
         <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDuplicateModalTemplate(null)}>
           <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">📋</div>
                 <div>
                   <h3 className="text-lg font-black text-slate-800">Duplicar / Clonar Plantilla</h3>
                   <p className="text-[11px] text-slate-500 font-medium">{duplicateModalTemplate.name}</p>
                 </div>
               </div>
               <button onClick={() => setDuplicateModalTemplate(null)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-100 hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-xl transition-all">✕</button>
             </div>

             <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
               <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                 <button type="button" onClick={() => { setDuplicateMode('full'); setDuplicateTargetTemplate(null); }}
                   className={`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${duplicateMode === 'full' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                   <span className="text-lg">📑</span> Duplicar Completo
                 </button>
                 <button type="button" onClick={() => setDuplicateMode('content')}
                   className={`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${duplicateMode === 'content' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                   <span className="text-lg">🔄</span> Clonar a Otra
                 </button>
               </div>
             </div>

             <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
               <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                 <div className={`w-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200 ${(duplicateModalTemplate as any).displayFormat === 'tv_v' ? 'aspect-[9/16]' : (duplicateModalTemplate as any).displayFormat === 'post' ? 'aspect-square' : 'aspect-[16/9]'}`}>
                    {(duplicateModalTemplate.imageUrlVertical || (duplicateModalTemplate as any).displayUrl || duplicateModalTemplate.imageUrl) && (
                      <img src={(duplicateModalTemplate as any).displayUrl || duplicateModalTemplate.imageUrlVertical || duplicateModalTemplate.imageUrl || ''} alt="Origen" className="w-full h-full object-cover" />
                    )}
                 </div>
                 <div className="flex flex-col flex-1 min-w-0">
                   <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest leading-none mb-1">Plantilla Origen</span>
                   <span className="text-sm font-bold text-slate-700 truncate">{duplicateModalTemplate.name}</span>
                 </div>
               </div>

               {duplicateMode === 'full' ? (
                 <div className="flex flex-col gap-4">
                   <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[12px] text-amber-800 font-medium">
                     <strong>📑 Duplicar Completo:</strong> Crea una nueva plantilla idéntica con todos los fondos, capas y configuración.
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nombre de copia</label>
                     <input type="text" value={duplicateTargetName} onChange={e => setDuplicateTargetName(e.target.value)}
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col gap-4">
                   <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-[12px] text-indigo-800 font-medium">
                     <strong>🔄 Clonar Contenido:</strong> Copia capas y configuraciones a una plantilla destino, manteniendo sus propios fondos.
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Destino</label>
                     <div className="grid grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-1">
                       {plantillas.filter(p => {
                         if (p.id === duplicateModalTemplate.id) return false;
                         const fmt = (duplicateModalTemplate as any).displayFormat;
                         if (fmt === 'tv_v') return !!p.imageUrlVertical || !!p.imageUrl;
                         if (fmt === 'post') return !!p.imageUrlPost;
                         if (fmt === 'tv_h') return !!p.imageUrlHorizontal;
                         return true;
                       }).map(p => {
                         const isSelected = duplicateTargetTemplate === p.id;
                         const fmt = (duplicateModalTemplate as any).displayFormat;
                         let thumbUrl = '';
                         if (fmt === 'tv_v') thumbUrl = p.imageUrlVertical || p.imageUrl || '';
                         else if (fmt === 'post') thumbUrl = p.imageUrlPost || '';
                         else if (fmt === 'tv_h') thumbUrl = p.imageUrlHorizontal || '';
                         else thumbUrl = p.imageUrlVertical || p.imageUrl || p.imageUrlPost || p.imageUrlHorizontal || '';
                         
                         return (
                           <button type="button" key={p.id} onClick={() => setDuplicateTargetTemplate(isSelected ? null : p.id)}
                             className={`relative rounded-xl overflow-hidden transition-all duration-200 border-[3px] flex flex-col ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-transparent hover:border-slate-300'} ${fmt === 'tv_v' ? 'aspect-[9/16]' : fmt === 'post' ? 'aspect-square' : 'aspect-[16/9]'}`}>
                             <div className="flex-1 bg-slate-100 relative">
                               {thumbUrl ? <img src={thumbUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-[10px] text-slate-400">Sin Base</div>}
                               {isSelected && <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-black">✓</div>}
                             </div>
                             <div className="p-1 bg-white text-center">
                               <p className="text-[9px] font-black text-slate-700 truncate">{p.name}</p>
                             </div>
                           </button>
                         );
                       })}
                     </div>
                   </div>
                 </div>
               )}
             </div>

             <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
               <button onClick={() => setDuplicateModalTemplate(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-[13px]">Cancelar</button>
               <button
                 onClick={handleDuplicate}
                 disabled={duplicating || (duplicateMode === 'full' && !duplicateTargetName.trim()) || (duplicateMode === 'content' && !duplicateTargetTemplate)}
                 className={`px-6 py-2.5 rounded-xl font-black disabled:opacity-40 text-white shadow-lg transition-all text-[13px] flex items-center gap-2 ${duplicateMode === 'full' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'}`}>
                 {duplicating ? 'Procesando...' : (duplicateMode === 'full' ? 'Duplicar' : 'Clonar')}
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}