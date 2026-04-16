"use client";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { storage, db, auth } from "../lib/firebase";
import TextLayerEditor, { TextLayer, createLayer, createImageLayer, LayerType, ActiveLayerPropertiesPanel } from "./TextLayerEditor";

const IconStore    = () => <span>🏪</span>;
const IconType     = () => <span>🔤</span>;
const IconMegaphone= () => <span>📣</span>;
const IconDollarSign= () => <span>💲</span>;
const IconFacebook = () => <span>👍</span>;
const IconInstagram= () => <span>📸</span>;
const IconTikTok   = () => <span>🎵</span>;
const IconImageIcon= () => <span>🖼</span>;
const Sparkles     = () => <span>✨</span>;

export interface MenuScreenData {
  isMenuMode: boolean;
  menuItems: { name: string; price: string; desc?: string }[];
  menuItems2?: { name: string; price: string; desc?: string }[];
  menuItems3?: { name: string; price: string; desc?: string }[];
  scale?: number; scale2?: number; scale3?: number;
  visible?: boolean; visible2?: boolean; visible3?: boolean;
  bgColor?: string; bgOpacity?: number; customZ?: number;
  posX?: number; posX2?: number; posX3?: number;
  posY?: number; posY2?: number; posY3?: number;
  width?: number; width2?: number; width3?: number;
  layoutId?: string;
  colors?: string[];
  fonts?: string[];
}

interface FormData {
  nombreLocal: string; titulo: string; subtitulo: string;
  ingredientes: string; precio: string; mensaje: string;
  facebook: string; instagram: string; tiktok: string;
  destType: string; formato: string; logo: string;
  screensCount: number;
  menusByScreen: MenuScreenData[];
}
interface BannerFormProps {
  formData: FormData;
  setFormData: (d: FormData) => void;
  handleImg: (e: React.FormEvent, layersByScreen: TextLayer[][]) => void;
  loadingImg: boolean;
  selectedLayoutObj: { url?: string; urlStory?: string; name?: string; colors?: string[]; fonts?: string[]; } | undefined;
  imageUrlWatermark: string[] | null;
  setShowResultModal: (show: boolean) => void;
  pendingProductToAdd: string | null;
  setPendingProductToAdd: (s: string | null) => void;
  onOpenProductModal?: () => void;
  validLayouts?: any[];
  customFonts?: { name: string; url: string }[];
  products?: any[];
  productsError?: string | null;
  categorySlug?: string | null;
  userDoc?: any;
  initialLayers?: TextLayer[][];
}

const SYS_DEFAULTS: Record<string, Partial<TextLayer> & { type: LayerType }> = {
  nombreLocal: { type:"text",   posX:50, posY:8,  fontSize:55,  fontFamily:"Syne, sans-serif",              fontWeight:"bold",   textAlign:"center", color:"#000000", shadow:true },
  titulo:      { type:"text",   posX:50, posY:64, fontSize:110, fontFamily:"'Playfair Display', serif",     fontWeight:"bold",   textAlign:"center", color:"#000000", shadow:true },
  mensaje:     { type:"text",   posX:50, posY:74, fontSize:38,  fontFamily:"Syne, sans-serif",              fontWeight:"normal", textAlign:"center", color:"#000000", shadow:true },
  precio:      { type:"price",  posX:50, posY:84, fontSize:80,  fontFamily:"'Playfair Display', serif",     fontWeight:"bold",   textAlign:"center", color:"#000000", shadow:false },
  instagram:   { type:"social", posX:50, posY:93, fontSize:34,  fontFamily:"Syne, sans-serif",              fontWeight:"bold",   textAlign:"left",   color:"#000000", shadow:true },
  facebook:    { type:"social", posX:50, posY:93, fontSize:34,  fontFamily:"Syne, sans-serif",              fontWeight:"bold",   textAlign:"left",   color:"#000000", shadow:true },
  tiktok:      { type:"social", posX:50, posY:93, fontSize:34,  fontFamily:"Syne, sans-serif",              fontWeight:"bold",   textAlign:"left",   color:"#000000", shadow:true },
};

function computeSocialPosX(key: string, activeFields: Record<string, string>): number {
  const socialKeys = ["instagram", "facebook", "tiktok"];
  const activeSocials = socialKeys.filter(k => !!activeFields[k]);
  const idx = activeSocials.indexOf(key);
  const total = activeSocials.length;
  if (total === 1) return 50;
  if (total === 2) return [33, 67][idx] ?? 50;
  return [20, 50, 80][idx] ?? 50;
}

function syncLayers(prev: TextLayer[], fields: Record<string, string>): TextLayer[] {
  const result: TextLayer[] = [];
  const processedKeys = new Set<string>();

  for (const l of prev) {
    if (!l.fieldKey) {
      result.push(l); 
    } else {
      const value = fields[l.fieldKey];
      if (value) {
        result.push({ ...l, text: value });
        processedKeys.add(l.fieldKey);
      }
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    if (!value || processedKeys.has(key)) continue;
    const isSocial = ["instagram", "facebook", "tiktok"].includes(key);
    const posX = isSocial ? computeSocialPosX(key, fields) : (SYS_DEFAULTS[key]?.posX ?? 50);
    result.push({ id:`sys-${key}`, fieldKey:key, text:value, ...SYS_DEFAULTS[key], posX } as TextLayer);
  }

  const prevSocialCount = prev.filter(l => ["instagram","facebook","tiktok"].includes(l.fieldKey || "")).length;
  const socialKeys = ["instagram", "facebook", "tiktok"];
  const activeSocials = socialKeys.filter(k => !!fields[k]);
  const newSocialCount = activeSocials.length;

  if (newSocialCount !== prevSocialCount && newSocialCount > 0) {
    return result.map(l => {
      if (!socialKeys.includes(l.fieldKey || "")) return l;
      return { ...l, posX: computeSocialPosX(l.fieldKey!, fields) };
    });
  }

  return result;
}

const fc = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-[14px] focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10 outline-none transition-all placeholder:text-slate-400";

function MenuOptionsToolbar({ menuData, onChange }: { menuData: MenuScreenData; onChange: (newData: MenuScreenData) => void }) {
  return (
    <div className="flex gap-4 mb-4 mt-2 w-full text-left bg-slate-100/50 border border-slate-200/50 p-4 rounded-2xl">
      <div className="flex-1">
        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">🔡 Tamaño del texto</label>
        <input 
          type="range" min="0.5" max="2" step="0.05" 
          value={menuData.scale ?? 1} 
          onChange={e => onChange({ ...menuData, scale: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </div>
      <div className="flex-1">
        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">🌫 Transparencia fondo</label>
        <input 
          type="range" min="0" max="1" step="0.05" 
          value={menuData.bgOpacity ?? 0.85} 
          onChange={e => onChange({ ...menuData, bgOpacity: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </div>
      <div className="w-[80px]">
        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">🎨 Color</label>
        <input 
          type="color" 
          value={menuData.bgColor || "#0f172a"} 
          onChange={e => onChange({ ...menuData, bgColor: e.target.value })}
          className="w-full h-8 rounded shrink-0 cursor-pointer border-0 p-0 overflow-hidden"
        />
      </div>
    </div>
  );
}

function MenuListEditor({ menuData, onChange, onOpenProduct, formato }: { menuData: MenuScreenData; onChange: (newData: MenuScreenData) => void; onOpenProduct?: () => void; formato?: string }) {
  const items = menuData?.menuItems || [{name: '', price: ''}];
  const items2 = menuData?.menuItems2 || [];
  const items3 = menuData?.menuItems3 || [];
  const isWide = formato === 'tv_h';
  const maxItems = isWide ? 6 : 10;

  const renderColumn = (list: {name: string, price: string, desc?: string}[], listKey: 'menuItems' | 'menuItems2' | 'menuItems3', title: string, scaleKey: 'scale'|'scale2'|'scale3', visibleKey: 'visible'|'visible2'|'visible3') => {
    const isVisible = menuData[visibleKey] !== false;
    return (
      <div className={`flex-1 flex flex-col gap-2 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm transition-all ${!isVisible ? 'opacity-40 grayscale focus-within:opacity-100 focus-within:grayscale-0' : ''}`}>
        <div className="flex items-center justify-between mb-2">
           <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</h5>
           {listKey !== 'menuItems' && (
              <button type="button" onClick={() => onChange({ ...menuData, [visibleKey]: !isVisible })} className="text-[10px] font-bold text-indigo-500">
                 {isVisible ? 'Ocultar' : 'Activar'}
              </button>
           )}
        </div>
        <div className="flex flex-col gap-2">
          {list.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
               <div className="flex gap-1.5">
                  <button type="button" onClick={onOpenProduct} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-sm shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors shrink-0 mt-0.5">🍔</button>
                  <input type="text" placeholder="Producto..." className="flex-[2] bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-400" value={item.name} onChange={e => {
                      const newArr = [...list]; newArr[idx].name = e.target.value; onChange({ ...menuData, [listKey]: newArr });
                  }} />
                  <input type="text" placeholder="$" className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-400 text-center" value={item.price} onChange={e => {
                      const newArr = [...list]; newArr[idx].price = e.target.value; onChange({ ...menuData, [listKey]: newArr });
                  }} />
                  {list.length > 1 && (
                     <button type="button" onClick={() => onChange({ ...menuData, [listKey]: list.filter((_, i) => i !== idx) })} className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-600 shrink-0">✕</button>
                  )}
               </div>
               <input type="text" placeholder="Descripción corta..." className="w-full bg-transparent px-2 text-[10px] text-slate-500 italic outline-none" value={item.desc || ''} onChange={e => {
                    const newArr = [...list]; newArr[idx].desc = e.target.value; onChange({ ...menuData, [listKey]: newArr });
               }} />
            </div>
          ))}
          {list.length < maxItems && (
            <button type="button" onClick={() => onChange({ ...menuData, [listKey]: [...list, { name: '', price: '', desc: '' }] })} className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 rounded-xl text-[11px] font-bold transition-all">+ Añadir fila</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {renderColumn(items, 'menuItems', 'Columna 1', 'scale', 'visible')}
      {renderColumn(items2, 'menuItems2', 'Columna 2', 'scale2', 'visible2')}
      {renderColumn(items3, 'menuItems3', 'Columna 3', 'scale3', 'visible3')}
    </div>
  );
}

export default function BannerForm({ formData, setFormData, handleImg, loadingImg, selectedLayoutObj, imageUrlWatermark, setShowResultModal, pendingProductToAdd, setPendingProductToAdd, onOpenProductModal, validLayouts, customFonts, products, productsError, userDoc, categorySlug, initialLayers }: BannerFormProps) {
  const screensCount = formData.screensCount || 1;
  const isMultiScreen = formData.formato === 'tv_h' || formData.formato === 'tv_v';

  const [layersByScreen, setLayersByScreen] = useState<TextLayer[][]>(initialLayers || [[]]);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [customImageLoading, setCustomImageLoading] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState<'PROPERTIES' | 'GALLERY' | 'TEXTS_LIST' | 'LAYERS_LIST'>('PROPERTIES');
  const [activeGalleryType, setActiveGalleryType] = useState<'producto' | 'precio'>('producto');
  const [galleryCategory, setGalleryCategory] = useState<string>('todas');
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);

  const currentLayoutId = formData.menusByScreen?.[activeScreenIndex]?.layoutId || (selectedLayoutObj as any)?.id;
  const currentScreenLayoutObj = validLayouts?.find(l => l.id === currentLayoutId) || selectedLayoutObj;

  // Manejo de inyección de productos desde galería
  useEffect(() => {
    if (pendingProductToAdd) {
      setLayersByScreen(prev => {
        const copy = [...prev];
        const targetIdx = activeScreenIndex;
        const currentLayers = [...(copy[targetIdx] || [])];
        
        let foundIdx = -1;
        
        if (activeGalleryType === 'precio') {
           foundIdx = currentLayers.findIndex(l => l.fieldKey === 'precio');
        } else {
           foundIdx = currentLayers.findIndex(l => l.id === activeLayerId && (l.type === "image" || l.type === "logo") && l.fieldKey !== 'precio');
           if (foundIdx === -1) {
              foundIdx = currentLayers.findIndex(l => l.type === "image" && l.fieldKey !== 'precio');
           }
        }
        
        if (foundIdx !== -1) {
           currentLayers[foundIdx] = { ...currentLayers[foundIdx], text: pendingProductToAdd };
           setTimeout(() => setActiveLayerId(currentLayers[foundIdx].id), 0);
        } else {
           console.warn("No se encontró ninguna imagen en la plantilla para reemplazar.");
        }
        copy[targetIdx] = currentLayers;
        return copy;
      });
      setPendingProductToAdd(null);
    }
  }, [pendingProductToAdd, activeScreenIndex, activeLayerId, setPendingProductToAdd]);

  const isVertical = formData.formato === "story" || formData.formato === "tv_v";
  
  let previewUrl = "";
  if (currentScreenLayoutObj) {
    if (isVertical) previewUrl = currentScreenLayoutObj.urlStory || currentScreenLayoutObj.url || "";
    else if (formData.formato === "tv_h") previewUrl = currentScreenLayoutObj.urlTv || currentScreenLayoutObj.url || "";
    else previewUrl = currentScreenLayoutObj.url || "";
  }

  const handleMenuChange = (idx: number, data: MenuScreenData) => {
    const list = [...(formData.menusByScreen || [])];
    list[idx] = data;
    setFormData({ ...formData, menusByScreen: list });
  };
  
  const activeMenu = formData.menusByScreen?.[activeScreenIndex] || { isMenuMode: false, menuItems: [{ name: '', price: '' }] };

  // Sincronización de Plantillas Dinámicas
  useEffect(() => {
    if (!currentScreenLayoutObj) return;
    let defs: any[] = [];
    if (isVertical) defs = (currentScreenLayoutObj as any).defaultLayersVertical;
    else if (formData.formato === "post") defs = (currentScreenLayoutObj as any).defaultLayersPost;
    else if (formData.formato === "tv_h") defs = (currentScreenLayoutObj as any).defaultLayersHorizontal;

    if (defs?.length > 0) {
      setLayersByScreen(prev => { const c = [...prev]; c[activeScreenIndex] = defs; return c; });
    }
  }, [currentLayoutId, formData.formato, activeScreenIndex]);
  
  // Condición de si la plantilla soporta menú
  let templateSupportsMenu = false;
  if (currentScreenLayoutObj) {
     const tpl = currentScreenLayoutObj as any;
     const fmt = isVertical ? 'story' : formData.formato;
     const cat = categorySlug || 'general';
     // check layouts
     let tplMenu = null;
     if (tpl.layouts && tpl.layouts[cat] && tpl.layouts[cat][fmt]) {
         tplMenu = tpl.layouts[cat][fmt].menuData;
     } else {
         if (isVertical) tplMenu = tpl.defaultMenuDataVertical;
         else if (formData.formato === "post") tplMenu = tpl.defaultMenuDataPost;
         else if (formData.formato === "tv_h") tplMenu = tpl.defaultMenuDataHorizontal;
     }
     if (tplMenu && tplMenu.isMenuMode) {
         templateSupportsMenu = true;
     }
  }

  const addCustomLayer = (idx: number) => {
    const l = createLayer("Nuevo Texto");
    setLayersByScreen(prev => { const c = [...prev]; c[idx] = [...(c[idx] || []), l]; return c; });
    setActiveLayerId(l.id);
  };

  const handleCustomImageUpload = async (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCustomImageLoading(true);
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const img = createImageLayer(url);
      img.type = "logo";
      setLayersByScreen(prev => { const c = [...prev]; c[idx] = [...(c[idx] || []), img]; return c; });
      setActiveLayerId(img.id);
    } catch (err) { console.error(err); } finally { setCustomImageLoading(false); }
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); handleImg(e, layersByScreen); };
  const activeLayers = layersByScreen[activeScreenIndex] || [];
  const hasLogo = activeLayers.some(l => l.type === 'logo');
  const hasPriceImage = activeLayers.some(l => l.fieldKey === 'precio');
  
  let validProducts = (products || []).filter(p => {
     if (activeGalleryType === 'precio') return p.category === 'precio';
     if (galleryCategory !== 'todas') return p.category === galleryCategory;
     if (categorySlug && categorySlug !== 'general') return p.category === categorySlug;
     return p.category !== 'precio' && p.category !== 'linea';
  });

  const renderTabs = () => {
    if (formData.destType !== 'tv' || screensCount <= 1) return null;
    return (
      <div className="flex flex-col gap-3 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {Array.from({ length: screensCount }).map((_, i) => (
             <button type="button" key={i} onClick={() => setActiveScreenIndex(i)} 
               className={`px-6 py-3 rounded-2xl font-black text-xs transition-all border-2 shrink-0 ${activeScreenIndex === i ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm scale-105' : 'bg-white border-slate-100 text-slate-400'}`}>
               PANTALLA {i + 1}
             </button>
          ))}
        </div>
        <div className="flex justify-end">
           <button type="button" onClick={() => setIsTemplateModalOpen(true)} className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200">
              🖼 Cambiar Diseño Pantalla {activeScreenIndex + 1}
           </button>
        </div>
      </div>
    );
  };

  return (
    <section className="animate-in fade-in duration-700">

      <form onSubmit={onSubmit} className="w-full max-w-[1800px] mx-auto bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 80px)', minHeight: '640px' }}>
        {renderTabs() && <div className="p-6 border-b border-slate-50 bg-slate-50/30">{renderTabs()}</div>}

        <div className="flex flex-col lg:flex-row flex-1 bg-[#fdfdfc] relative">
          
          {/* SIDEBAR IZQUIERDO: Estilo menú navegación */}
          <div className="hidden lg:flex lg:flex-col w-[200px] bg-white border-r border-slate-100 py-4 shrink-0 shadow-sm z-30 overflow-y-auto hide-scrollbar">

            {/* Sección: Herramientas */}
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 mb-2">Herramientas</p>

            <button type="button" onClick={() => setActiveRightPanel('TEXTS_LIST')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all group border-l-4 ${activeRightPanel === 'TEXTS_LIST' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform shrink-0">A</span>
              <div className="text-left">
                <span className="block text-[13px] font-black leading-none">Textos</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Editar capas</span>
              </div>
            </button>

            <button type="button" onClick={() => { setActiveRightPanel('GALLERY'); setActiveGalleryType('producto'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all group border-l-4 ${activeRightPanel === 'GALLERY' && activeGalleryType === 'producto' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform shrink-0">🍔</span>
              <div className="text-left">
                <span className="block text-[13px] font-black leading-none">Productos</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Galería PNG</span>
              </div>
            </button>

            <button type="button" onClick={() => { if(hasPriceImage) { setActiveRightPanel('GALLERY'); setActiveGalleryType('precio'); } }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all group border-l-4 ${!hasPriceImage ? 'opacity-30 cursor-not-allowed border-transparent text-slate-400' : activeRightPanel === 'GALLERY' && activeGalleryType === 'precio' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              title={!hasPriceImage ? "La plantilla no tiene etiqueta de precio" : "Cambiar precio"}>
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform shrink-0">💲</span>
              <div className="text-left">
                <span className="block text-[13px] font-black leading-none">Precio</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Imagen precio</span>
              </div>
            </button>

            <button type="button" onClick={() => { if (templateSupportsMenu) handleMenuChange(activeScreenIndex, { ...activeMenu, isMenuMode: !activeMenu.isMenuMode }) }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all group border-l-4 ${!templateSupportsMenu ? 'opacity-30 cursor-not-allowed border-transparent text-slate-400' : activeMenu.isMenuMode ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              title={!templateSupportsMenu ? "Esta plantilla no tiene diseño de menú configurado" : "Activar/Desactivar Menú"}>
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform shrink-0">📋</span>
              <div className="text-left">
                <span className="block text-[13px] font-black leading-none">Menú</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{activeMenu.isMenuMode ? 'Activo ✓' : 'Activar'}</span>
              </div>
            </button>

            <button type="button" onClick={() => setActiveRightPanel('LAYERS_LIST')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all group border-l-4 ${activeRightPanel === 'LAYERS_LIST' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              title="Posiciones y Capas">
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform shrink-0">📑</span>
              <div className="text-left">
                <span className="block text-[13px] font-black leading-none">Capas</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Organizar orden</span>
              </div>
            </button>

            <div className="mt-auto px-3 pb-2 pt-4 border-t border-slate-100">
              <label className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all shadow-md ${hasLogo ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed grayscale' : 'bg-slate-900 text-white hover:bg-black cursor-pointer hover:-translate-y-0.5'}`}>
                <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 shrink-0">{customImageLoading ? '⌛' : '☁️'}</span>
                <div className="text-left">
                  <span className="block text-[13px] font-black leading-none">{customImageLoading ? 'Subiendo...' : 'Subir Logo'}</span>
                  <span className="block text-[10px] opacity-60 mt-0.5">PNG transparente</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => { if(!hasLogo) handleCustomImageUpload(e, activeScreenIndex) }} disabled={customImageLoading || hasLogo} />
              </label>
            </div>
          </div>

          {/* PANEL DERECHO: Editor / Galería (AHORA EN EL CENTRO) */}
          <div className="w-full lg:w-[420px] bg-white border-r border-slate-100 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.02)] z-20">
             <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-800">
                   {activeRightPanel === 'GALLERY' ? '📦 Galería PNG' : (activeRightPanel === 'TEXTS_LIST' ? '📝 Textos' : activeRightPanel === 'LAYERS_LIST' ? '📑 Capas' : '⚙️ Propiedades')}
                </h3>
                <div className="flex items-center gap-2">
                   {activeRightPanel !== 'PROPERTIES' && (
                      <button type="button" onClick={() => setActiveRightPanel('PROPERTIES')} className="text-[10px] font-black text-indigo-500 hover:bg-indigo-50 px-2 py-1 rounded-md transition-all">TERMINAR</button>
                   )}
                   {activeRightPanel === 'PROPERTIES' && activeLayers.find(l => l.id === activeLayerId) && ['text', 'price', 'social'].includes(activeLayers.find(l => l.id === activeLayerId)?.type || '') && (
                      <button type="button" onClick={() => { setActiveLayerId(null); setActiveRightPanel('TEXTS_LIST'); }} className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-md transition-all">← VOLVER</button>
                   )}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 pb-32 custom-scrollbar">
                {activeRightPanel === 'GALLERY' ? (
                   <div className="flex flex-col gap-6">
                       <div className="grid grid-cols-2 gap-3">
                         {validProducts.map(p => (
                            <button type="button" key={p.id} onClick={() => setPendingProductToAdd(p.imageUrl)} className="group relative aspect-square bg-slate-50 rounded-[28px] border border-slate-100 p-2 flex items-center justify-center hover:bg-white hover:border-indigo-400 hover:shadow-xl transition-all overflow-hidden pattern-dots">
                               <img src={p.imageUrl} className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                               <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                                  <p className="text-[9px] font-bold text-white truncate">{p.name}</p>
                               </div>
                            </button>
                         ))}
                      </div>
                   </div>
                 ) : activeRightPanel === 'LAYERS_LIST' ? (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center">Organizador de Capas</p>
                       <p className="text-[10px] text-slate-400 text-center mb-4 leading-tight px-4">Ordenadas de Frente (arriba) hacia Atrás (abajo).</p>
                       
                       {activeMenu.isMenuMode && (
                           <div className={`w-full p-3 bg-white border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer shadow-sm`} onClick={() => setActiveRightPanel('PROPERTIES')}>
                               <div className="flex items-center gap-3 overflow-hidden">
                                   <span className="text-xl shrink-0 opacity-80 backdrop-blur-sm bg-emerald-50 p-2 rounded-xl text-emerald-600">📋</span>
                                   <div className="flex flex-col truncate">
                                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-0.5">Bloque Especial</span>
                                       <span className="text-xs font-bold text-slate-800 truncate">Menú Dinámico</span>
                                   </div>
                               </div>
                               <span className="text-[10px] font-black mr-2 text-emerald-400 uppercase">Nivel {activeMenu.customZ || 15}</span>
                           </div>
                       )}

                       {activeLayers.length === 0 ? (
                           <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400 text-xs font-bold mt-2">No hay capas insertadas.</div>
                       ) : (
                           [...activeLayers].reverse().map((l, indexReversed) => {
                               const actualIdx = activeLayers.length - 1 - indexReversed;
                               return (
                               <div key={l.id} className={`w-full p-2.5 bg-white border rounded-2xl flex items-center justify-between gap-3 transition-all ${activeLayerId === l.id ? 'border-purple-400 shadow-md ring-2 ring-purple-50' : 'border-slate-200 hover:border-purple-200'} cursor-pointer`} onClick={() => { setActiveLayerId(l.id); setActiveRightPanel('PROPERTIES'); }}>
                                   <div className="flex items-center gap-3 overflow-hidden">
                                       <span className="text-base shrink-0 border border-slate-100 bg-slate-50 w-9 h-9 flex items-center justify-center rounded-[10px]">
                                           {l.type === 'image' ? (l.fieldKey === 'precio' ? '💲' : '🍔') : l.type === 'logo' ? '☁️' : l.type === 'badge' ? '🏷️' : 'A'}
                                       </span>
                                       <div className="flex flex-col truncate">
                                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Nivel {10 + actualIdx} • {l.type === 'image' ? (l.fieldKey === 'precio' ? 'Precio' : 'Producto') : l.type === 'logo' ? 'Logo' : l.type === 'badge' ? 'Badge' : 'Texto'}</span>
                                           <span className="text-xs font-bold text-slate-700 truncate">{l.type === 'image' || l.type === 'logo' || l.type === 'badge' ? '(Capa Visual)' : l.text || '(Vacío)'}</span>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-0.5 shrink-0 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                                       <button type="button" 
                                           disabled={actualIdx === activeLayers.length - 1} 
                                           onClick={(e) => {
                                               e.stopPropagation();
                                               if (actualIdx < activeLayers.length - 1) {
                                                   const newL = [...activeLayers];
                                                   [newL[actualIdx], newL[actualIdx + 1]] = [newL[actualIdx + 1], newL[actualIdx]];
                                                   setLayersByScreen(prev => { const c = [...prev]; c[activeScreenIndex] = newL; return c; });
                                               }
                                           }}
                                           className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-white rounded-md disabled:opacity-20 transition-all hover:shadow-sm">
                                           <span className="text-[10px]">▲</span>
                                       </button>
                                       <button type="button" 
                                           disabled={actualIdx === 0} 
                                           onClick={(e) => {
                                               e.stopPropagation();
                                               if (actualIdx > 0) {
                                                   const newL = [...activeLayers];
                                                   [newL[actualIdx - 1], newL[actualIdx]] = [newL[actualIdx], newL[actualIdx - 1]];
                                                   setLayersByScreen(prev => { const c = [...prev]; c[activeScreenIndex] = newL; return c; });
                                               }
                                           }}
                                           className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-white rounded-md disabled:opacity-20 transition-all hover:shadow-sm">
                                           <span className="text-[10px]">▼</span>
                                       </button>
                                   </div>
                               </div>
                               );
                           })
                       )}
                    </div>
                 ) : activeRightPanel === 'TEXTS_LIST' ? (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 text-center">Selecciona un elemento para editar</p>
                       {activeLayers.filter(l => l.type === 'text' || l.type === 'price' || l.type === 'social').length === 0 ? (
                           <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400 text-xs font-bold">No hay textos insertados en esta plantilla.</div>
                       ) : (
                           activeLayers.filter(l => l.type === 'text' || l.type === 'price' || l.type === 'social').map(l => (
                               <button key={l.id} type="button" onClick={() => { setActiveLayerId(l.id); setActiveRightPanel('PROPERTIES'); }} className="text-left w-full p-4 bg-white border border-slate-200 rounded-3xl hover:border-rose-400 hover:shadow-lg transition-all group relative overflow-hidden hover:-translate-y-0.5">
                                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-4xl">✒️</div>
                                   <span className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5">{l.type === 'price' ? 'Precio' : (l.type === 'social' ? 'Red Social' : 'Texto Libre')}</span>
                                   <span className="block text-sm font-bold text-slate-800 line-clamp-2 leading-snug drop-shadow-sm" style={{ fontFamily: l.fontFamily || 'sans-serif' }}>{l.text || '(Vacío)'}</span>
                               </button>
                           ))
                       )}
                    </div>
                 ) : (
                   <div className="animate-in fade-in duration-300">
                      {activeLayerId ? (
                         <ActiveLayerPropertiesPanel 
                            layers={activeLayers}
                            onLayersChange={ns => { const c = [...layersByScreen]; c[activeScreenIndex] = ns; setLayersByScreen(c); }}
                            activeLayerId={activeLayerId}
                            onSetActiveLayer={(id) => {
                                const currentLayer = activeLayers.find(l => l.id === activeLayerId);
                                setActiveLayerId(id);
                                if (id === null && currentLayer && ['text', 'price', 'social'].includes(currentLayer.type)) {
                                    setActiveRightPanel('TEXTS_LIST');
                                }
                            }}
                            templateColors={currentScreenLayoutObj?.colors}
                            templateFonts={currentScreenLayoutObj?.fonts}
                            customFonts={customFonts}
                         />
                      ) : (
                         <div className="py-20 text-center opacity-30 px-6">
                            <span className="text-5xl block mb-6">🎯</span>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-2">Editor Inactivo</p>
                            <p className="text-[12px] leading-relaxed text-slate-500">Toca un elemento en el lienzo central para ver sus propiedades aquí.</p>
                         </div>
                      )}
                      {activeMenu.isMenuMode && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Ajustes del Menú</h4>
                           <MenuOptionsToolbar menuData={activeMenu} onChange={d => handleMenuChange(activeScreenIndex, d)} />
                        </div>
                      )}
                   </div>
                )}
             </div>

             {/* ACCIONES FINALES */}
             <div className="p-8 bg-white border-t border-slate-50 shadow-inner">
                {userDoc?.role === "admin" || (userDoc && (userDoc?.generationCount || 0) < (userDoc?.generationLimit || 0)) ? (
                   <button type="submit" disabled={loadingImg} className={`w-full py-5 rounded-3xl font-black text-sm tracking-wide transition-all shadow-xl hover:-translate-y-1 ${loadingImg ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-rose-200'}`}>
                      {loadingImg ? '🪄 GENERANDO HD...' : '🚀 EXPORTAR DISEÑO FINAL'}
                   </button>
                ) : (
                   <button type="button" onClick={async () => {
                       const res = await fetch("/api/mercadopago/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ userId: userDoc?.id, userEmail: userDoc?.email, price: 2990 }) });
                       const data = await res.json(); if(data.init_point) window.location.href = data.init_point;
                   }} className="w-full py-5 rounded-3xl bg-slate-900 border-2 border-amber-400 text-white font-black text-sm shadow-xl hover:-translate-y-1">
                      💳 DESCARGAR SIN MARCA ($2990)
                   </button>
                )}
                {imageUrlWatermark && imageUrlWatermark.length > 0 && (
                   <button type="button" onClick={() => setShowResultModal(true)} className="w-full mt-4 py-3 text-[11px] font-bold text-emerald-600 hover:text-emerald-700">Ver último diseño terminado</button>
                )}
             </div>
          </div>

          {/* ÁREA CENTRAL: Lienzo (AHORA A LA DERECHA) */}
          <div className="flex-1 p-8 lg:p-12 lg:pt-6 bg-[#f8f8f7] flex flex-col items-center justify-center relative group/canvas overflow-y-auto">

             <div className={`flex flex-col items-center justify-center relative transition-all duration-700 w-full h-full`}>
                {previewUrl ? (
                   <TextLayerEditor 
                     imageUrl={previewUrl} 
                     layers={layersByScreen[activeScreenIndex] || []} 
                     onLayersChange={(newLayers) => { setLayersByScreen(prev => { const c = [...prev]; c[activeScreenIndex] = newLayers; return c; }); }}
                     activeLayerId={activeLayerId} 
                     onSetActiveLayer={(id) => {
                         setActiveLayerId(id);
                         if (id) {
                             const layer = layersByScreen[activeScreenIndex]?.find(l => l.id === id);
                             if (layer && layer.type !== 'image') {
                                 setActiveRightPanel('PROPERTIES');
                             } else if (layer && layer.type === 'image') {
                                 if (layer.fieldKey === 'precio') setActiveGalleryType('precio');
                                 else setActiveGalleryType('producto');
                                 setActiveRightPanel('GALLERY');
                             }
                         } else {
                             setActiveRightPanel('PROPERTIES');
                         }
                     }} 
                     formato={formData.formato} 
                     menuData={activeMenu}
                     onMenuChange={(d) => handleMenuChange(activeScreenIndex, d)}
                     templateColors={currentScreenLayoutObj?.colors}
                     templateFonts={currentScreenLayoutObj?.fonts}
                     onImageClick={(layerId) => {
                         const layer = layersByScreen[activeScreenIndex]?.find(l => l.id === layerId);
                         if (layer?.fieldKey === 'precio') {
                             setActiveGalleryType('precio');
                         } else {
                             setActiveGalleryType('producto');
                         }
                         setActiveRightPanel('GALLERY');
                     }}
                     customFontsList={customFonts?.map(f => f.name)}
                   />
                ) : (
                   <div className="p-20 text-slate-400 font-bold italic">Selecciona un formato válido</div>
                )}
                
                {(!userDoc || (userDoc?.generationCount || 0) >= (userDoc?.generationLimit || 0)) && userDoc?.role !== "admin" && (
                   <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center overflow-hidden rotate-[-30deg]">
                      <span className="text-white text-[100px] font-black opacity-10">DIGITALBITE</span>
                   </div>
                )}
             </div>

             {activeMenu.isMenuMode && (
                <div className="w-full max-w-4xl mt-10 animate-in slide-in-from-top-4 duration-500">
                   <MenuListEditor menuData={activeMenu} onChange={d => handleMenuChange(activeScreenIndex, d)} onOpenProduct={() => setActiveRightPanel('GALLERY')} formato={formData.formato} />
                </div>
             )}
          </div>

        </div>
      </form>

      {/* MODAL CAMBIO PLANTILLA */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[48px] w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-2xl font-black text-slate-900">Plantillas para Pantalla {activeScreenIndex + 1}</h3>
                 <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {validLayouts?.map(l => (
                       <button type="button" key={l.id} onClick={() => { 
                          handleMenuChange(activeScreenIndex, { ...activeMenu, layoutId: l.id });
                          setIsTemplateModalOpen(false);
                       }} className={`group relative aspect-[9/16] rounded-3xl overflow-hidden border-4 transition-all ${currentLayoutId === l.id ? 'border-indigo-500 scale-[0.98]' : 'border-transparent hover:border-slate-300'}`}>
                          <img src={l.urlStory || l.url || ""} className="w-full h-full object-cover" />
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </section>
  );
}