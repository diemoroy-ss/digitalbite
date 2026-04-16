"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import Image from "next/image";
import TemplateBuilderModal from "../../../components/TemplateBuilderModal";
import { TextLayer } from "../../../components/TextLayerEditor";

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
}

export default function PlantillasAdmin() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [customFonts, setCustomFonts] = useState<any[]>([]);
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

  // Data Formulario
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comercioId, setComercioId] = useState("gastronomico");
  
  // Archivos
  const [fileVertical, setFileVertical] = useState<File | null>(null);
  const [filePost, setFilePost] = useState<File | null>(null);
  const [fileHorizontal, setFileHorizontal] = useState<File | null>(null);
  
  // Array de 3 items forzosos
  const [colors, setColors] = useState(["#ffffff", "#f97316", "#1e293b"]);
  const [fonts, setFonts] = useState(["Inter", "Bebas Neue", "Montserrat"]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchCategorias(), fetchPlantillas(), fetchCustomFonts(), fetchComercios()]);
    setLoading(false);
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

  const handleColorChange = (index: number, val: string) => {
    const nw = [...colors];
    nw[index] = val;
    setColors(nw);
  };

  const handleFontChange = (index: number, val: string) => {
    const nw = [...fonts];
    nw[index] = val;
    setFonts(nw);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedCategories.length === 0) {
      alert("Por favor ingresa un nombre y selecciona al menos una categoría.");
      return;
    }
    if (!editId && !fileVertical && !filePost && !fileHorizontal) { 
       alert("Sube al menos 1 formato de imagen para la plantilla"); 
       return; 
    }

    try {
      setSaving(true);
      
      const updateData: any = { name, categories: selectedCategories, colors, fonts, comercioId: comercioId || "gastronomico", isPremium };

      // Helper to upload a specific file
      const uploadFile = async (f: File, type: string) => {
        const storageRef = ref(storage, `templates/${type}_${Date.now()}_${f.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, f);
        const url = await getDownloadURL(uploadTask.ref);
        return { url, path: uploadTask.ref.fullPath };
      };

      if (fileVertical) {
        const res = await uploadFile(fileVertical, 'vertical');
        updateData.imageUrlVertical = res.url;
        updateData.storagePathVertical = res.path;
      }
      if (filePost) {
        const res = await uploadFile(filePost, 'post');
        updateData.imageUrlPost = res.url;
        updateData.storagePathPost = res.path;
      }
      if (fileHorizontal) {
        const res = await uploadFile(fileHorizontal, 'horizontal');
        updateData.imageUrlHorizontal = res.url;
        updateData.storagePathHorizontal = res.path;
      }

      if (editId) {
        // UPDATE
        await updateDoc(doc(db, "templates", editId), updateData);
      } else {
        // CREATE
        updateData.createdAt = serverTimestamp();
        await addDoc(collection(db, "templates"), updateData);
      }

      // Reiniciar Formulario
      resetForm();
      await fetchPlantillas();

    } catch (error) {
      console.error("Error save plantilla:", error);
      alert("Error al guardar la plantilla.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLayouts = async (layers: TextLayer[], menuData: any) => {
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
    setColors(p.colors || ["#ffffff", "#f97316", "#1e293b"]);
    setFonts(p.fonts || ["Inter", "Bebas Neue", "Montserrat"]);
    setIsPremium(p.isPremium || false);
    setFileVertical(null);
    setFilePost(null);
    setFileHorizontal(null);
    setIsDrawerOpen(true);
  };

  const deleteItem = async (p: Plantilla) => {
    if (!window.confirm("¿Estás seguro de eliminar esta plantilla visual?")) return;
    
    try {
      await deleteDoc(doc(db, "templates", p.id));
      
      const deletePromises = [];
      if (p.storagePath) deletePromises.push(deleteObject(ref(storage, p.storagePath)).catch(() => {}));
      if (p.storagePathVertical) deletePromises.push(deleteObject(ref(storage, p.storagePathVertical)).catch(() => {}));
      if (p.storagePathPost) deletePromises.push(deleteObject(ref(storage, p.storagePathPost)).catch(() => {}));
      if (p.storagePathHorizontal) deletePromises.push(deleteObject(ref(storage, p.storagePathHorizontal)).catch(() => {}));
      
      await Promise.all(deletePromises);
      
      setPlantillas(plantillas.filter(item => item.id !== p.id));
    } catch (error) {
       console.error(error); alert("Hubo un error al eliminar.");
    }
  };

  const resetForm = () => {
     setName(""); setEditId(null);
     setFileVertical(null); setFilePost(null); setFileHorizontal(null);
     if(categorias.length>0) setSelectedCategories([categorias[0].slug]);
     setColors(["#ffffff", "#f97316", "#1e293b"]);
     setFonts(["Inter", "Bebas Neue", "Montserrat"]);
     setComercioId("gastronomico");
     setIsPremium(false);
     setIsDrawerOpen(false);
     
     ['file-vertical', 'file-post', 'file-horizontal'].forEach(id => {
       const el = document.getElementById(id) as HTMLInputElement;
       if (el) el.value = '';
     });
  }

  const InputLabel = ({t}: {t:string}) => <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t}</label>;
  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-medium transition-all";

  const allFonts = [...FONTS, ...customFonts.map(f => f.name)];

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

                {/* 2. ARCHIVOS DE IMAGEN */}
                <details className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/50 hover:bg-slate-50 font-bold text-sm text-slate-800 select-none">
                    <span>2. Archivos (Vertical, Cuadrado, Horiz)</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 pt-2 space-y-4 border-t border-slate-100 bg-white">
                     <p className="text-[11px] text-slate-500 mb-2">Sube los fondos limpios para cada formato. Puedes crear la plantilla solo con uno.</p>
                     <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                          <span>📱 Vertical (1080x1920)</span>
                          {editId && <span className="text-slate-400 font-normal">Opcional rev</span>}
                       </label>
                       <input id="file-vertical" type="file" accept="image/*" onChange={e => { if(e.target.files) setFileVertical(e.target.files[0])}}
                         className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                     </div>
                     <div className="pt-2 border-t border-slate-100">
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                          <span>⏹️ Cuadrado (1080x1080)</span>
                          {editId && <span className="text-slate-400 font-normal">Opcional rev</span>}
                       </label>
                       <input id="file-post" type="file" accept="image/*" onChange={e => { if(e.target.files) setFilePost(e.target.files[0])}}
                         className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                     </div>
                     <div className="pt-2 border-t border-slate-100">
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                          <span>📺 Horizontal (1920x1080)</span>
                          {editId && <span className="text-slate-400 font-normal">Opcional rev</span>}
                       </label>
                       <input id="file-horizontal" type="file" accept="image/*" onChange={e => { if(e.target.files) setFileHorizontal(e.target.files[0])}}
                         className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                     </div>
                  </div>
                </details>

                {/* 3. IDENTIDAD VISUAL */}
                <details className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/50 hover:bg-slate-50 font-bold text-sm text-slate-800 select-none">
                    <span>3. Identidad Visual Sugerida</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 pt-2 space-y-4 border-t border-slate-100 bg-white">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">3 Colores Sugeridos</label>
                        <div className="space-y-2">
                          {[0, 1, 2].map((idx) => (
                            <div key={`color-${idx}`} className="flex items-center gap-2">

                             <span className="text-slate-400 font-bold text-xs">{idx + 1}.</span>
                             <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 flex-1 shadow-sm">
                               <input type="color" className="w-8 h-8 rounded shrink-0 cursor-pointer border-none bg-transparent" 
                                 title="Color" value={colors[idx]} onChange={e => handleColorChange(idx, e.target.value)} />
                               <span className="text-xs font-mono text-slate-500 uppercase flex-1">{colors[idx]}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>

                    {/* FUENTES */}
                    <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">3 Fuentes Sugeridas</label>
                       <div className="space-y-2">
                         {[0, 1, 2].map((idx) => (
                           <div key={`font-${idx}`} className="flex items-center gap-2">
                             <span className="text-slate-400 font-bold text-xs">{idx + 1}.</span>
                             <select className="flex-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none p-2.5 shadow-sm cursor-pointer"
                               value={fonts[idx]} onChange={e => handleFontChange(idx, e.target.value)}>
                               {allFonts.map(f => <option key={f} value={f} style={{fontFamily: f}}>{f}</option>)}
                             </select>
                           </div>
                         ))}
                       </div>
                    </div>
                 </div>
                </details>

                {/* 4. MONETIZACIÓN */}
                <details className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/50 hover:bg-slate-50 font-bold text-sm text-slate-800 select-none">
                    <span>4. Exclusividad (Monetización)</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 pt-2 border-t border-slate-100 bg-white">
                     <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} />
                          <div className={`block w-10 h-6 pl-1 rounded-full border-2 transition-colors ${isPremium ? 'bg-amber-500 border-amber-500' : 'bg-slate-200 border-slate-200'}`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPremium ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-amber-600 flex items-center gap-1">⭐ Plantilla Premium</span>
                           <span className="text-[10px] text-slate-500">Ocultar de planes gratis / Plan One</span>
                        </div>
                     </label>
                  </div>
                </details>
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
                                         
                                         // Width scaling guard (auto-heals legacy arbitrary pixel widths)
                                         const wVal = l.width;
                                         let widthPct = "100%";
                                         if (wVal) {
                                            if (typeof wVal === 'number' && wVal <= 100) widthPct = `${wVal}%`;
                                            else widthPct = `${(wVal / (p.displayFormat === 'post' ? 400 : p.displayFormat === 'tv_h' ? 700 : 250)) * 100}%`;
                                         }
                                         
                                         const transformStr = 'translate(-50%, -50%)';

                                         return (
                                            <div key={l.id} style={{
                                               position: 'absolute',
                                               left: `${leftPct}%`,
                                               top: `${topPct}%`,
                                               width: widthPct,
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
         customFonts={customFonts.map(f => f.name)}
         initialCategory={filterCat === "todas" ? ((plantillas.find(p => p.id === editId)?.categories?.[0]) || 'general') : filterCat}
      />
    </div>
  );
}
