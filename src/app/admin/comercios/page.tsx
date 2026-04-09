"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

interface Comercio {
  id: string; // ID Firestore
  slug: string; // "gastronomico", "automotriz"
  name: string; // "Gastronómico", "Automotriz"
  icon: string; // "🍽️", "🚗"
  createdAt?: any;
}

const COMMON_EMOJIS = ["🏢", "🍽️", "🍔", "🍕", "🍺", "🏋️", "🏀", "⚽", "💄", "💅", "✂️", "🚗", "🏍️", "🏠", "🏥", "👔", "🎬", "🛒", "🎒", "💻", "🐾", "🚲", "🎨", "🎵", "💼", "📸", "📦", "🍰", "🍷"];

export default function ComerciosAdmin() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  
  // Data Formulario
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("🏢");

  useEffect(() => {
    fetchComercios();
  }, []);

  const fetchComercios = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "comercios"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const data: Comercio[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Comercio);
      });
      setComercios(data);
    } catch (error) {
      console.error("Error fetching comercios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    try {
      setSaving(true);
      
      const data = {
        name, 
        slug: cleanSlug, 
        icon
      };

      if (editId) {
        await updateDoc(doc(db, "comercios", editId), data);
      } else {
        await addDoc(collection(db, "comercios"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      setIsDrawerOpen(false);
      resetForm();
      await fetchComercios();
      alert(editId ? "Comercio actualizado" : "Comercio creado con éxito");

    } catch (error) {
      console.error("Error saving commerce:", error);
      alert("Error al procesar la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  const openCreateDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (com: Comercio) => {
    setEditId(com.id);
    setName(com.name);
    setSlug(com.slug);
    setIcon(com.icon || "🏢");
    setIsDrawerOpen(true);
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar definitivamente el comercio: ${name}?\nEsto no eliminará en cascada los datos asociados.`)) return;
    try {
      await deleteDoc(doc(db, "comercios", id));
      setComercios(comercios.filter(c => c.id !== id));
    } catch (e) {
      console.error("error delete", e);
      alert("No se pudo eliminar.");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setIcon("🏢");
  };

  const generateSlug = (val: string) => {
    setName(val);
    if (!editId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-x-hidden animate-in fade-in duration-500">
      
      {/* HEADER SECTION (Sticky Sub-Bar) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sectores Disponibles</h2>
            <p className="text-xs text-slate-400 mt-1">Gestiona las verticales de negocio de la plataforma.</p>
          </div>
          <button 
            onClick={openCreateDrawer}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <span>+</span> Nuevo Comercio
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Actualizando registros...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {comercios.map((com) => (
              <div key={com.id} className="group bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col relative overflow-hidden">
                
                {/* Background Pattern */}
                <div className="absolute -top-4 -right-4 text-7xl opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none grayscale">
                   {com.icon}
                </div>

                <div className="flex justify-between items-start mb-6">
                   <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[22px] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                      {com.icon}
                   </div>
                   <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <button 
                        onClick={() => openEditDrawer(com)}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm"
                        title="Editar Comercio"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => deleteItem(com.id, com.name)}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                        title="Eliminar Permanente"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                   </div>
                </div>

                <div className="mt-auto">
                   <h3 className="font-black text-slate-800 text-xl leading-tight mb-1">{com.name}</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">slug: {com.slug}</span>
                   </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-tight">Acceso Rápido</span>
                      <span className="text-[10px] font-bold text-indigo-500">Configuración Activa</span>
                   </div>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            ))}

            {/* Placeholder / Add New Card */}
            <button 
              onClick={openCreateDrawer}
              className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center min-h-[220px] group hover:border-indigo-400 transition-all duration-300"
            >
               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl text-slate-300 mb-4 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                  +
               </div>
               <span className="text-sm font-black text-slate-400 group-hover:text-indigo-500 transition-colors">Añadir Nuevo Comercio</span>
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
          
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            
            {/* Drawer Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#fafafa]">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editId ? 'Editar Comercio' : 'Nuevo Comercio'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Parámetros del Sector</p>
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
               
               <div className="space-y-6">
                 <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Identidad del Negocio</label>
                    <div className="flex items-start gap-4 mb-4">
                       <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-[28px] flex items-center justify-center text-5xl shadow-inner shrink-0 transition-transform hover:scale-105 duration-300">
                          {icon}
                       </div>
                       <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-300 mb-1.5 ml-1">Icono Seleccionado</label>
                          <input
                            type="text"
                            required
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            maxLength={25}
                            placeholder="🏢"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all mb-3 text-center"
                          />
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-2">O elige un acceso rápido:</p>
                          <div className="grid grid-cols-6 gap-2">
                             {COMMON_EMOJIS.map(e => (
                               <button 
                                 key={e} 
                                 type="button" 
                                 onClick={() => setIcon(e)}
                                 className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-slate-100 transition-all shadow-sm ${icon === e ? 'bg-indigo-50 border-2 border-indigo-500 scale-110' : 'bg-white border border-slate-100'}`}
                               >
                                  {e}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                       <div>
                          <label className="block text-[10px] font-bold text-slate-300 mb-1 ml-1">Nombre Público</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => generateSlug(e.target.value)}
                            placeholder="Ej: Gastronómico"
                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-300 mb-1 ml-1">Slug (Identificador interno)</label>
                          <input
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                            placeholder="ej-comercio"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm focus:outline-none focus:border-rose-500 transition-all font-bold"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Information Box */}
                 <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 flex items-start gap-4">
                    <span className="text-xl">ℹ️</span>
                    <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                       Selecciona un emoji representativo. Esto ayudará a identificar visualmente las plantillas y productos de este sector en toda la plataforma.
                    </p>
                 </div>
               </div>

               <div className="mt-auto pt-8">
                 <button
                   type="submit"
                   disabled={saving || !name || !slug}
                   className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   {saving ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Guardando...</span>
                     </>
                   ) : (
                     <>
                       <span className="text-xl leading-none">✅</span>
                       <span>{editId ? 'Guardar Cambios' : 'Confirmar Comercio'}</span>
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
