'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface TemplateBaseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { baseFonts: string[], baseColors: string[], baseProducts: string[] }) => void;
  template: any;
  categorySlug: string;
  allSystemFonts: string[];
  customFonts: any[];
}

export default function TemplateBaseEditorModal({
  isOpen,
  onClose,
  onSave,
  template,
  categorySlug,
  allSystemFonts,
  customFonts
}: TemplateBaseEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'fonts' | 'colors' | 'products'>('fonts');
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // URLs
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [customHex, setCustomHex] = useState('#ffffff');

  // Pre-load data
  useEffect(() => {
    if (isOpen && template && categorySlug) {
      const catLayout = template.layouts?.[categorySlug] || {};
      
      // Try to get from layout, otherwise fallback to template defaults
      setSelectedFonts(catLayout.baseFonts || template.fonts || []);
      setSelectedColors(catLayout.baseColors || template.colors || []);
      setSelectedProducts(catLayout.baseProducts || []);
      
      fetchProducts();
    }
  }, [isOpen, template, categorySlug]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', categorySlug),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const prods: any[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.images && data.images.length > 0) {
          data.images.forEach((img: any) => prods.push({ id: d.id + img.url, url: img.url, name: data.name }));
        } else if (data.imageUrl) {
          prods.push({ id: d.id, url: data.imageUrl, name: data.name });
        }
      });
      setDbProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (!isOpen) return null;

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      if (list.length >= 6) {
        alert("Máximo 6 elementos permitidos");
        return;
      }
      setList([...list, item]);
    }
  };

  const allAvailableFonts = Array.from(new Set([...allSystemFonts, ...customFonts.map(f => f.name)]));

  const standardColors = [
    '#ffffff', '#000000', '#f8fafc', '#1e293b', '#ef4444', '#f97316', 
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
    '#d946ef', '#f43f5e', '#22c55e', '#eab308'
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom duration-500">
      
      {/* HEADER */}
      <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Base de Diseño</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{categorySlug}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Configurar "{template.name}"
          </h2>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={onClose}
             className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all"
           >
             Cancelar
           </button>
           <button 
             onClick={() => onSave({ baseFonts: selectedFonts, baseColors: selectedColors, baseProducts: selectedProducts })}
             className="px-8 py-3 rounded-2xl bg-rose-500 text-white font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all transform hover:-translate-y-1 active:scale-95"
           >
             Guardar Configuración Base
           </button>
        </div>
      </header>

      {/* TABS NAV */}
      <nav className="flex justify-center border-b border-slate-100 py-4 gap-8">
        {[
          { id: 'fonts', label: 'Tipografías', icon: '🔤', count: selectedFonts.length },
          { id: 'colors', label: 'Paleta de Colores', icon: '🎨', count: selectedColors.length },
          { id: 'products', label: 'Imágenes Producto', icon: '🍔', count: selectedProducts.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all relative ${
              activeTab === tab.id 
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
              : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-bold text-sm">{tab.label}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {tab.count}/6
            </span>
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          
          {/* FONTS SECTION */}
          {activeTab === 'fonts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-left duration-300">
              {allAvailableFonts.map(font => {
                const isSelected = selectedFonts.includes(font);
                const customUrl = customFonts.find(f => f.name === font)?.url;
                return (
                  <button
                    key={font}
                    onClick={() => toggleItem(selectedFonts, setSelectedFonts, font)}
                    className={`p-6 rounded-[32px] border-2 text-left transition-all relative group h-32 flex flex-col justify-between ${
                      isSelected 
                      ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-600/5' 
                      : 'bg-white border-transparent hover:border-slate-200'
                    }`}
                  >
                    {customUrl && (
                      <style>{customUrl.includes("google") ? `@import url('${customUrl}');` : `@font-face { font-family: "${font}"; src: url(${customUrl}); }`}</style>
                    )}
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{font}</span>
                    <span 
                      style={{ fontFamily: `"${font}", sans-serif` }} 
                      className={`text-2xl truncate ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}
                    >
                      Abc 123
                    </span>
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* COLORS SECTION */}
          {activeTab === 'colors' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-left duration-300">
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center">
                 <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-10 text-center">Tu Paleta Seleccionada</h3>
                 <div className="flex gap-4 md:gap-8 justify-center flex-wrap min-h-[100px]">
                    {[0,1,2,3,4,5].map(i => {
                      const c = selectedColors[i];
                      return (
                        <div key={i} className="flex flex-col items-center gap-3">
                           <div 
                             className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-4 shadow-xl transition-all ${
                               c ? 'border-white scale-110 shadow-slate-200' : 'border-dashed border-slate-200 shadow-none'
                             }`}
                             style={{ backgroundColor: c || 'transparent' }}
                           />
                           <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{c || '---'}</span>
                        </div>
                      )
                    })}
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[40px] border border-slate-100">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-rose-500"/> Colores Sugeridos
                    </h4>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                       {standardColors.map(c => (
                         <button
                           key={c}
                           onClick={() => toggleItem(selectedColors, setSelectedColors, c)}
                           className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-125 ${
                             selectedColors.includes(c) ? 'border-slate-800 scale-110' : 'border-transparent'
                           }`}
                           style={{ backgroundColor: c }}
                         />
                       ))}
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col justify-center">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6">Color Personalizado</h4>
                    <div className="flex gap-4">
                       <input 
                         type="color" 
                         value={customHex}
                         onChange={(e) => setCustomHex(e.target.value)}
                         className="w-16 h-16 rounded-2xl cursor-pointer border-none bg-transparent"
                       />
                       <div className="flex-1">
                          <input 
                            type="text" 
                            value={customHex}
                            onChange={(e) => setCustomHex(e.target.value)}
                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-bold text-slate-800 uppercase"
                          />
                          <button 
                            type="button"
                            onClick={() => toggleItem(selectedColors, setSelectedColors, customHex)}
                            className="w-full mt-2 bg-slate-900 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-slate-800"
                          >
                            + Añadir a Paleta
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* PRODUCTS SECTION */}
          {activeTab === 'products' && (
            <div className="animate-in fade-in slide-in-from-left duration-300">
               {loadingProducts ? (
                 <div className="flex flex-col items-center py-20">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Cargando Productos de {categorySlug}...</p>
                 </div>
               ) : dbProducts.length === 0 ? (
                 <div className="bg-white rounded-[48px] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center">
                    <span className="text-6xl mb-6 grayscale opacity-30">🍔</span>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No hay productos en esta categoría</h3>
                    <p className="text-slate-400 text-sm max-w-sm">Sube productos a la categoría "{categorySlug}" para verlos aquí y poder seleccionarlos como base.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {dbProducts.map(prod => {
                      const isSelected = selectedProducts.includes(prod.url);
                      return (
                        <button
                          key={prod.id}
                          onClick={() => toggleItem(selectedProducts, setSelectedProducts, prod.url)}
                          className={`group aspect-square rounded-[32px] border-2 bg-white relative transition-all flex items-center justify-center overflow-hidden h-full ${
                            isSelected ? 'border-indigo-600 shadow-xl shadow-indigo-600/10' : 'border-transparent hover:border-slate-200'
                          }`}
                        >
                           <div className="w-full h-full bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-50/50 p-4 transition-transform group-hover:scale-110">
                              <img src={prod.url} alt={prod.name} className="w-full h-full object-contain drop-shadow-lg" />
                           </div>
                           
                           {isSelected && (
                              <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px] flex items-center justify-center">
                                 <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg font-black text-xs">✓</div>
                              </div>
                           )}
                           
                           <div className="absolute bottom-0 inset-x-0 bg-white/95 p-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[9px] font-black text-slate-800 uppercase tracking-tight truncate px-1">{prod.name}</p>
                           </div>
                        </button>
                      )
                    })}
                 </div>
               )}
            </div>
          )}

        </div>
      </main>

      <style jsx global>{`
        header { background-color: rgba(255, 255, 255, 0.8) !important; }
      `}</style>
    </div>
  );
}
