"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  generationLimit: number;
  videoLimit: number;
  comercioLimit: number;
  features: string[];
  featured: boolean;
  payPerUse: boolean;
  orderIndex: number;
  isActive: boolean;
}

export default function PlanesAdminPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState("/mes");
  const [desc, setDesc] = useState("");
  const [generationLimit, setGenerationLimit] = useState(0);
  const [videoLimit, setVideoLimit] = useState(0);
  const [comercioLimit, setComercioLimit] = useState(1);
  const [features, setFeatures] = useState("");
  const [featured, setFeatured] = useState(false);
  const [payPerUse, setPayPerUse] = useState(false);
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "planes"), orderBy("orderIndex", "asc"));
      const snapshot = await getDocs(q);
      const data: Plan[] = [];
      snapshot.docs.forEach((d) => data.push({ id: d.id, ...d.data() } as Plan));
      setPlanes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const openCreateDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (p: Plan) => {
    setEditingPlan(p);
    setName(p.name);
    setPrice(p.price);
    setPeriod(p.period || "");
    setDesc(p.desc || "");
    setGenerationLimit(p.generationLimit ?? 0);
    setVideoLimit(p.videoLimit ?? 0);
    setComercioLimit(p.comercioLimit ?? 1);
    setFeatures((p.features || []).join("\n"));
    setFeatured(p.featured ?? false);
    setPayPerUse(p.payPerUse ?? false);
    setOrderIndex(p.orderIndex ?? 0);
    setIsActive(p.isActive ?? true);
    setIsDrawerOpen(true);
  };

  const resetForm = () => {
    setEditingPlan(null);
    setName("");
    setPrice("");
    setPeriod("/mes");
    setDesc("");
    setGenerationLimit(0);
    setVideoLimit(0);
    setComercioLimit(1);
    setFeatures("");
    setFeatured(false);
    setPayPerUse(false);
    setOrderIndex(0);
    setIsActive(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const planData = {
      name,
      price,
      period,
      desc,
      generationLimit: Number(generationLimit),
      videoLimit: Number(videoLimit),
      comercioLimit: Number(comercioLimit),
      features: features.split("\n").map(f => f.trim()).filter(f => f.length > 0),
      featured,
      payPerUse,
      orderIndex: Number(orderIndex),
      isActive,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingPlan) {
        await updateDoc(doc(db, "planes", editingPlan.id), planData);
      } else {
        await addDoc(collection(db, "planes"), {
          ...planData,
          createdAt: serverTimestamp()
        });
      }
      setIsDrawerOpen(false);
      resetForm();
      await fetchPlanes();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Borrar definitivamente el plan: ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "planes", id));
      setPlanes(planes.filter(p => p.id !== id));
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-x-hidden animate-in fade-in duration-500">
      
      {/* HEADER SECTION (Sticky Sub-Bar) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Estructura Comercial</h2>
            <p className="text-xs text-slate-400 font-medium">Gestiona suscripciones, límites y precios.</p>
          </div>
          <button 
            onClick={openCreateDrawer}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <span>+</span> Nuevo Plan
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic font-mono">Cargando planes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {planes.map((p) => (
              <div 
                key={p.id} 
                className={`group bg-white rounded-[40px] border-2 p-8 transition-all duration-500 flex flex-col relative overflow-hidden ${p.featured ? 'border-amber-400 shadow-2xl shadow-amber-900/10' : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200'}`}
              >
                {/* Visual Accent */}
                {p.featured && (
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                )}

                <div className="flex justify-between items-start mb-6">
                   <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-2xl text-slate-800 tracking-tight">{p.name}</h3>
                        {p.featured && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">Recomendado</span>}
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tight mt-1">{p.desc}</p>
                   </div>
                   <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <button 
                        onClick={() => openEditDrawer(p)}
                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm"
                        title="Configurar Plan"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id, p.name)}
                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                        title="Eliminar"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                   </div>
                </div>

                <div className="mb-8">
                   <span className="text-4xl font-black text-slate-900 tracking-tighter">{p.price}</span>
                   <span className="text-slate-400 font-bold text-sm ml-1.5 uppercase tracking-widest">{p.period}</span>
                </div>

                {/* LIMITS HUB */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                   <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">🖼️ Diseños</span>
                      <span className="text-xs font-black text-slate-700">{p.generationLimit === 0 ? 'ILIM' : p.generationLimit}</span>
                   </div>
                   <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">🎥 Videos</span>
                      <span className="text-xs font-black text-slate-700">{p.videoLimit}</span>
                   </div>
                   <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">🏢 Orgs</span>
                      <span className="text-xs font-black text-slate-700">{p.comercioLimit}</span>
                   </div>
                </div>

                <div className="flex-1">
                   <ul className="space-y-3">
                      {p.features && p.features.map((f, i) => (
                        <li key={i} className="flex gap-3 text-[12px] font-bold text-slate-500 items-start">
                           <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                           </div>
                           <span className="leading-tight">{f}</span>
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-tight">Estatus de Ventas</span>
                      <span className={`text-[10px] font-bold ${p.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>{p.isActive ? 'Activo en Tienda' : 'Pausado'}</span>
                   </div>
                   <div className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                </div>
              </div>
            ))}

            {/* Placeholder / Add New Card */}
            <button 
              onClick={openCreateDrawer}
              className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center min-h-[300px] group hover:border-emerald-400 transition-all duration-300"
            >
               <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl text-slate-300 mb-4 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                  +
               </div>
               <span className="text-sm font-black text-slate-400 group-hover:text-emerald-600 transition-colors uppercase tracking-widest">Crear Nueva Oferta</span>
            </button>
          </div>
        )}
      </div>

      {/* DRAWER COMPONENT (MODAL RIGHT) */}
      {isDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-300" 
            onClick={() => setIsDrawerOpen(false)}
          />
          
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            
            {/* Drawer Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#fafafa]">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingPlan ? 'Editar Plan' : 'Configurar Nuevo Plan'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Estructura Comercial y Límites</p>
               </div>
               <button 
                 onClick={() => setIsDrawerOpen(false)}
                 className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors"
               >
                 ✕
               </button>
            </div>

            {/* Drawer Body (Form) */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col">
               
               <div className="space-y-8">
                  {/* Identidad Básica */}
                  <div className="space-y-4">
                     <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Comercial</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej: Plan Crecimiento"
                          className="w-full px-4 py-4 bg-white border border-slate-200 rounded-[22px] text-slate-900 font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Precio Público</label>
                           <input
                             type="text"
                             required
                             value={price}
                             onChange={(e) => setPrice(e.target.value)}
                             placeholder="$9.990"
                             className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[22px] text-slate-900 font-black focus:outline-none focus:border-emerald-500 transition-all"
                           />
                        </div>
                        <div>
                           <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Periodo</label>
                           <input
                             type="text"
                             required
                             value={period}
                             onChange={(e) => setPeriod(e.target.value)}
                             placeholder="/mes"
                             className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[22px] text-slate-900 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Eslogan / Bajada</label>
                        <input
                          type="text"
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          placeholder="Ideal para agencias pequeñas"
                          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[22px] text-slate-600 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                        />
                     </div>
                  </div>

                  {/* LÍMITES TÉCNICOS */}
                  <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col gap-6">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span>⚙️</span> Límites de Uso
                     </h3>
                     <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase text-center">Diseños (PNG/PDF)</label>
                           <input 
                              type="number" 
                              required
                              value={generationLimit} 
                              onChange={(e) => setGenerationLimit(Number(e.target.value))} 
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center font-black text-lg focus:outline-none focus:border-emerald-500 transition-all"
                           />
                           <p className="text-[9px] text-slate-300 text-center font-bold">0 = Ilimitado</p>
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase text-center">Videos (Reels)</label>
                           <input 
                              type="number" 
                              required
                              value={videoLimit} 
                              onChange={(e) => setVideoLimit(Number(e.target.value))} 
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center font-black text-lg focus:outline-none focus:border-emerald-500 transition-all"
                           />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase text-center">Org / Marcas</label>
                           <input 
                              type="number" 
                              required
                              value={comercioLimit} 
                              onChange={(e) => setComercioLimit(Number(e.target.value))} 
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center font-black text-lg focus:outline-none focus:border-emerald-500 transition-all"
                           />
                        </div>
                     </div>
                  </div>

                  {/* CARACTERÍSTICAS */}
                  <div>
                     <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center justify-between">
                        Checklist de Funcionalidades
                        <span className="text-[9px] lowercase font-medium text-slate-300">(uno por línea)</span>
                     </label>
                     <textarea
                        rows={6}
                        value={features}
                        onChange={(e) => setFeatures(e.target.value)}
                        placeholder={`Soporte Prioritario 24/7\nSin marca de agua\nAcceso a galería premium\nExportación en 4K`}
                        className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[28px] text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm leading-relaxed"
                     />
                  </div>

                  {/* CONFIGURACIÓN AVANZADA */}
                  <div className="grid grid-cols-2 gap-6 bg-amber-50/30 rounded-[32px] p-6 border border-amber-100/50">
                     <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input 
                              type="checkbox" 
                              checked={featured} 
                              onChange={(e) => setFeatured(e.target.checked)} 
                              className="w-5 h-5 rounded-lg border-slate-300 text-amber-500 focus:ring-amber-500 transition-all" 
                           />
                           <span className="text-sm font-black text-slate-700 group-hover:text-amber-600 transition-colors">⭐ Destacar en Web</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input 
                              type="checkbox" 
                              checked={payPerUse} 
                              onChange={(e) => setPayPerUse(e.target.checked)} 
                              className="w-5 h-5 rounded-lg border-slate-300 text-emerald-500 focus:ring-emerald-500 transition-all" 
                           />
                           <span className="text-sm font-black text-slate-700 group-hover:text-emerald-600 transition-colors">💳 Cobro x Generación</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input 
                              type="checkbox" 
                              checked={isActive} 
                              onChange={(e) => setIsActive(e.target.checked)} 
                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-500 focus:ring-blue-500 transition-all" 
                           />
                           <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">🟢 Plan Activo</span>
                        </label>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-right">Orden de Aparición</label>
                        <input
                           type="number"
                           value={orderIndex}
                           onChange={(e) => setOrderIndex(Number(e.target.value))}
                           className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center font-black text-xl focus:outline-none focus:border-amber-500 transition-all"
                        />
                     </div>
                  </div>
               </div>

               <div className="mt-auto pt-8">
                 <button
                   type="submit"
                   disabled={saving}
                   className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black py-5 rounded-[28px] shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   {saving ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       <span className="uppercase tracking-widest text-xs">Publicando Cambios...</span>
                     </>
                   ) : (
                     <>
                       <span className="text-xl">💰</span>
                       <span className="uppercase tracking-widest text-xs">{editingPlan ? 'Confirmar Actualización' : 'Lanzar Nuevo Plan'}</span>
                     </>
                   )}
                 </button>
               </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
