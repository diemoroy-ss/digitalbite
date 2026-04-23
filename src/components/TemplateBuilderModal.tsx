"use client";

import { useState, useEffect } from "react";
import TextLayerEditor, { TextLayer, createLayer, createImageLayer, FONT_OPTIONS, ActiveLayerPropertiesPanel } from "./TextLayerEditor";

import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Props {
  isOpen: boolean;
  plantilla: any;
  formato: "story" | "post" | "tv_h";
  initialCategory: string;
  onClose: () => void;
  onSave: (layers: TextLayer[], menuData: any, targetCategory: string) => Promise<void>;
  customFonts: string[];
}

export default function TemplateBuilderModal({ isOpen, plantilla, formato, initialCategory, onClose, onSave, customFonts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'general');
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<any>({ isMenuMode: false, menuItems: [{name: '', price: ''}] });
  const [saving, setSaving] = useState(false);
  
  // Galería Integrada
  const [galleryOpen, setGalleryOpen] = useState<'producto' | 'precio' | 'linea' | null>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    if (isOpen && initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  useEffect(() => {
    if (isOpen && plantilla) {
      if (!activeCategory) return;
      
      const layoutData = plantilla.layouts?.[activeCategory]?.[formato];
      if (layoutData) {
         setLayers(layoutData.layers || []);
         setMenuData(layoutData.menuData || { isMenuMode: false, menuItems: [{name: '', price: ''}] });
      } else {
         if (formato === "story") {
           setLayers(plantilla.defaultLayersVertical || []);
           setMenuData(plantilla.defaultMenuDataVertical || { isMenuMode: false, menuItems: [{name: '', price: ''}] });
         } else if (formato === "post") {
           setLayers(plantilla.defaultLayersPost || []);
           setMenuData(plantilla.defaultMenuDataPost || { isMenuMode: false, menuItems: [{name: '', price: ''}] });
         } else if (formato === "tv_h") {
           setLayers(plantilla.defaultLayersHorizontal || []);
           setMenuData(plantilla.defaultMenuDataHorizontal || { isMenuMode: false, menuItems: [{name: '', price: ''}] });
         }
      }
      setActiveLayerId(null);
    }
  }, [isOpen, plantilla, formato, activeCategory]);

  if (!isOpen || !plantilla) return null;

  let imageUrl = plantilla.imageUrl;
  if (formato === "story" && plantilla.imageUrlVertical) imageUrl = plantilla.imageUrlVertical;
  if (formato === "post" && plantilla.imageUrlPost) imageUrl = plantilla.imageUrlPost;
  if (formato === "tv_h" && plantilla.imageUrlHorizontal) imageUrl = plantilla.imageUrlHorizontal;

  const handleAddText = () => {
    const nw = createLayer("Tu Texto");
    setLayers([...layers, nw]);
    setActiveLayerId(nw.id);
  };

  const openGallery = async (type: 'producto' | 'precio' | 'linea') => {
    setGalleryOpen(type);
    setLoadingGallery(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      let items: any[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.images && data.images.length > 0) {
          data.images.forEach((img: any) => items.push({ id: d.id + img.url, ...data, imageUrl: img.url }));
        } else {
          items.push({ id: d.id, ...data });
        }
      });
      
      if (type === 'precio') {
        items = items.filter(i => i.category === 'precio');
      } else if (type === 'linea') {
        items = items.filter(i => i.category === 'linea');
      } else {
        // Para productos generales, si existe configuración base en esta categoría, RESTRINGIR
        const baseProds = plantilla.layouts?.[activeCategory]?.baseProducts;
        if (baseProds && baseProds.length > 0) {
          // Normalizamos las URLs para la comparación por si acaso hay espacios o diferencias menores
          items = items.filter(i => {
             if (!i.imageUrl) return false;
             return baseProds.some((bp: string) => bp.trim() === i.imageUrl.trim());
          });
        } else {
          items = items.filter(i => i.category !== 'precio' && i.category !== 'linea');
        }
      }
      
      setDbProducts(items);
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleSelectGalleryItem = (url: string) => {
    const nw = createImageLayer(url);
    nw.fieldKey = galleryOpen!;
    // Increase size slightly for products
    if(galleryOpen === 'producto') { nw.width = 400; nw.height = 400; }
    
    setLayers([...layers, nw]);
    setActiveLayerId(nw.id);
    setGalleryOpen(null);
  };

  const handleAddProduct = () => {
    const nw = createImageLayer("https://placehold.co/400x400/png?text=Producto");
    nw.fieldKey = "producto";
    setLayers([...layers, nw]);
    setActiveLayerId(nw.id);
  };

  const handleMenuCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    if (count === 0) {
      setMenuData({ ...menuData, isMenuMode: false });
    } else {
      setMenuData({ 
        ...menuData, 
        isMenuMode: true,
        menuItems: menuData.menuItems?.length && menuData.menuItems[0].name ? menuData.menuItems : [{name: 'Plato Principal', price: '$9.90', desc: 'Descripción breve'}],
        visible: true,
        
        menuItems2: count >= 2 ? (menuData.menuItems2?.length && menuData.menuItems2[0].name ? menuData.menuItems2 : [{name: 'Bebidas', price: '$2.50', desc: 'Descripción breve'}]) : menuData.menuItems2,
        visible2: count >= 2,
        
        menuItems3: count >= 3 ? (menuData.menuItems3?.length && menuData.menuItems3[0].name ? menuData.menuItems3 : [{name: 'Postres', price: '$4.00', desc: 'Descripción breve'}]) : menuData.menuItems3,
        visible3: count >= 3,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(layers, menuData, activeCategory);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex bg-slate-900 overflow-hidden animate-in fade-in">
      
      {/* SIDEBAR TWEAK */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-xl z-20 overflow-y-auto hidden md:flex">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col gap-4 sticky top-0 z-10">
           <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-lg leading-tight">Constructor Visual</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {formato === 'story' ? 'Vertical' : formato === 'post' ? 'Post Cuadrado' : 'TV Horizontal'}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-colors">✕</button>
           </div>
           
           {plantilla.categories && plantilla.categories.length > 0 && (
              <div className="bg-white border border-indigo-100 p-2 rounded-xl flex flex-col gap-1.5 shadow-sm">
                 <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 px-1">Diseñando para Categoría:</label>
                 <select 
                    value={activeCategory} 
                    onChange={e => {
                       if(confirm("Cambiar de categoría descartará los cambios no guardados. ¿Continuar?")) {
                          setActiveCategory(e.target.value);
                       }
                    }}
                    className="w-full bg-indigo-50/50 text-indigo-700 font-bold text-xs py-2 px-3 rounded-lg border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
                 >
                    {plantilla.categories.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {(plantilla as any).category && !plantilla.categories.includes((plantilla as any).category) && (
                      <option value={(plantilla as any).category}>{(plantilla as any).category}</option>
                    )}
                 </select>
              </div>
           )}
        </div>
        
        <div className="p-6 flex-1 space-y-6">
           <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Herramientas Base</label>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={handleAddText} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors text-slate-600 cursor-pointer">
                    <span className="text-xl">A</span>
                    <span className="text-[10px] font-bold">Texto Libre</span>
                 </button>
                 <button onClick={()=>openGallery('producto')} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors text-slate-600 cursor-pointer">
                    <span className="text-xl">🍔</span>
                    <span className="text-[10px] font-bold">Imag. Producto</span>
                 </button>
                 <button onClick={()=>openGallery('precio')} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-colors text-slate-600 cursor-pointer">
                    <span className="text-xl">🏷️</span>
                    <span className="text-[10px] font-bold">Etiqueta Precio</span>
                 </button>
                 <button onClick={()=>openGallery('linea')} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-colors text-slate-600 cursor-pointer">
                    <span className="text-xl">〰️</span>
                    <span className="text-[10px] font-bold">Línea Decor.</span>
                 </button>
                 
                 <div className={`col-span-2 flex flex-col p-3 rounded-xl border transition-colors mt-2 ${menuData.isMenuMode ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="text-xl">📋</span>
                         <span className={`text-[11px] font-bold leading-tight ${menuData.isMenuMode ? 'text-emerald-700' : 'text-slate-600'}`}>Lista de Precios<br/><span className="font-normal opacity-70">Menú dinámico</span></span>
                       </div>
                       <select 
                         value={!menuData.isMenuMode ? 0 : (menuData.visible3 ? 3 : (menuData.visible2 ? 2 : 1))}
                         onChange={handleMenuCountChange}
                         className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                       >
                         <option value={0}>0 Menús</option>
                         <option value={1}>1 Menú</option>
                         <option value={2}>2 Menús</option>
                         <option value={3}>3 Menús</option>
                       </select>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <span className="text-xl mb-2 block">💡</span>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Al usar <strong>Texto Libre</strong> y <strong>Producto Auto</strong>, estás dejando posiciones (placeholders) que el cliente editará directamente sobre el diseño con doble clic. Si agregas <strong>Lista de Precios</strong>, el cliente podrá llenar filas de menú de forma masiva.
              </p>
           </div>
           
           {(() => {
              const baseC = plantilla.layouts?.[activeCategory]?.baseColors;
              const baseF = plantilla.layouts?.[activeCategory]?.baseFonts;

              return activeLayerId && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <ActiveLayerPropertiesPanel 
                    layers={layers}
                    onLayersChange={setLayers}
                    activeLayerId={activeLayerId}
                    onSetActiveLayer={setActiveLayerId}
                    templateFonts={baseF && baseF.length > 0 ? baseF : (plantilla.fonts || [])}
                    templateColors={baseC && baseC.length > 0 ? baseC : (plantilla.colors || [])}
                    customFonts={customFonts ? customFonts.map(f => ({ name: f, url: "" })) : []}
                  />
                </div>
              );
           })()}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 sticky bottom-0">
           <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-[13px] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              {saving ? <span className="animate-spin">⟳</span> : <span>💾 Guardar Plantilla Visual</span>}
           </button>
        </div>
      </div>

      {/* CANVAS ZONE */}
      <div className="flex-1 h-full overflow-y-auto relative p-6 md:p-12 flex items-start justify-center pattern-grid" onClick={() => setActiveLayerId(null)}>
         <button onClick={onClose} className="md:hidden absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 border border-white/20 backdrop-blur rounded-full text-white shadow-sm transition-colors">✕</button>

         <div className="w-full max-w-5xl h-full flex items-center justify-center py-4" onClick={e => e.stopPropagation()}>
            <TextLayerEditor 
               imageUrl={imageUrl}
               layers={layers}
               onLayersChange={setLayers}
               activeLayerId={activeLayerId}
               onSetActiveLayer={setActiveLayerId}
               formato={formato}
               menuData={menuData}
               onMenuChange={setMenuData}
               templateFonts={(() => {
                 const base = plantilla.layouts?.[activeCategory]?.baseFonts;
                 return base && base.length > 0 ? base : (plantilla.fonts || []);
               })()}
               templateColors={(() => {
                 const base = plantilla.layouts?.[activeCategory]?.baseColors;
                 return base && base.length > 0 ? base : (plantilla.colors || []);
               })()}
               isAdminMode={true}
            />
         </div>
      </div>
      
      {/* PNG Gallery Modal Overlay */}
      {galleryOpen && (
         <div className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-xl text-slate-800">
                     {galleryOpen === 'producto' ? 'Seleccionar Producto PNG' : galleryOpen === 'precio' ? 'Seleccionar Etiqueta de Precio' : 'Seleccionar Línea Decorativa'}
                  </h3>
                  <button onClick={() => setGalleryOpen(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">✕</button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                  {loadingGallery ? (
                     <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
                  ) : dbProducts.length === 0 ? (
                     <div className="text-center py-12 text-slate-500">
                        <span className="text-4xl block mb-3 opacity-50">🖼️</span>
                        No hay imágenes agregadas en la categoría <b>{galleryOpen}</b>.
                     </div>
                  ) : (
                     <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {dbProducts.map(p => (
                           <div key={p.id} onClick={() => handleSelectGalleryItem(p.imageUrl || p.url)} className="relative aspect-square bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group flex items-center justify-center pattern-grid p-2">
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img src={p.imageUrl || p.url} alt={p.name} className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
