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
  bgColor?: string; bgOpacity?: number;
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

export default function BannerForm({ formData, setFormData, handleImg, loadingImg, selectedLayoutObj, imageUrlWatermark, setShowResultModal, pendingProductToAdd, setPendingProductToAdd, onOpenProductModal, validLayouts, customFonts, products, productsError, userDoc }: BannerFormProps) {
  const screensCount = formData.screensCount || 1;
  const isMultiScreen = formData.formato === 'tv_h' || formData.formato === 'tv_v';

  const [layersByScreen, setLayersByScreen] = useState<TextLayer[][]>([[]]);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [customImageLoading, setCustomImageLoading] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState<'PROPERTIES' | 'GALLERY'>('PROPERTIES');
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
        
        const activeIdx = currentLayers.findIndex(l => l.id === activeLayerId && (l.type === "image" || l.type === "logo"));
        
        if (activeIdx !== -1) {
           currentLayers[activeIdx] = { ...currentLayers[activeIdx], text: pendingProductToAdd };
        } else {
           const newImg = createImageLayer(pendingProductToAdd);
           newImg.fontSize = 350; newImg.posY = 50;
           currentLayers.push(newImg);
           setTimeout(() => setActiveLayerId(newImg.id), 0);
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

  const addCustomLayer = (idx: number) => {
    const l = createLayer("Nuevo Texto");
    setLayersByScreen(prev => { const c = [...prev]; c[idx] = [...(c[idx] || []), l]; return c; });
    setActiveLayerId(l.id);
  };

  const addPriceLayer = (idx: number) => {
    const b: TextLayer = { id: "b-"+Math.random(), type:"badge", text:"", posX:40, posY:40, fontSize:80, color:"#000", fontWeight:"bold", fontFamily:"sans", shadow:false, badgeStyle:1 };
    const p: TextLayer = { id: "p-"+Math.random(), type:"text", text:"$9.990", posX:42, posY:42, fontSize:80, color:"#000", fontWeight:"bold", fontFamily:"serif", shadow:true };
    setLayersByScreen(prev => { const c = [...prev]; c[idx] = [...(c[idx] || []), b, p]; return c; });
    setActiveLayerId(p.id);
  };

  const handleCustomImageUpload = async (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCustomImageLoading(true);
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const img = createImageLayer(url);
      setLayersByScreen(prev => { const c = [...prev]; c[idx] = [...(c[idx] || []), img]; return c; });
      setActiveLayerId(img.id);
    } catch (err) { console.error(err); } finally { setCustomImageLoading(false); }
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); handleImg(e, layersByScreen); };
  const activeLayers = layersByScreen[activeScreenIndex] || [];
  let validProducts = (products || []).filter(p => galleryCategory === 'todas' || p.category === galleryCategory);

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
    <section className="animate-in fade-in duration-700 mb-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-black uppercase mb-3 tracking-widest">
           ✨ DigitalBite Studio 2.0
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Crea tu experiencia visual</h2>
        <p className="text-slate-500 mt-2 text-sm">Arrastra, edita y diseña en tiempo real.</p>
      </div>

      <form onSubmit={onSubmit} className="w-full max-w-[1400px] mx-auto bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[800px]">
        {renderTabs() && <div className="p-6 border-b border-slate-50 bg-slate-50/30">{renderTabs()}</div>}

        <div className="flex flex-col lg:flex-row flex-1 bg-[#fdfdfc] relative">
          
          {/* TOOLBAR IZQUIERDO: Estilo Studio */}
          <div className="w-full lg:w-[100px] bg-white border-r border-slate-100 p-3 flex lg:flex-col gap-3 items-center shrink-0 shadow-sm z-30">
             <button type="button" onClick={() => addCustomLayer(activeScreenIndex)} className="w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all group">
                <span className="text-xl group-hover:scale-110 transition-transform">A</span>
                <span className="text-[9px] font-black uppercase">Texto</span>
             </button>
             <button type="button" onClick={() => setActiveRightPanel('GALLERY')} className={`w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-2xl border transition-all group ${activeRightPanel === 'GALLERY' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'}`}>
                <span className="text-xl group-hover:scale-110 transition-transform">🍔</span>
                <span className="text-[9px] font-black uppercase">Pngs</span>
             </button>
             <button type="button" onClick={() => addPriceLayer(activeScreenIndex)} className="w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all group">
                <span className="text-xl group-hover:scale-110 transition-transform">💲</span>
                <span className="text-[9px] font-black uppercase">Precio</span>
             </button>
             <label className="w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-slate-800 text-white hover:bg-black cursor-pointer transition-all mt-auto shadow-lg hover:-translate-y-1">
                <span className="text-xl">{customImageLoading ? '⌛' : '☁️'}</span>
                <span className="text-[9px] font-black uppercase">Subir</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleCustomImageUpload(e, activeScreenIndex)} disabled={customImageLoading} />
             </label>
          </div>

          {/* ÁREA CENTRAL: Lienzo */}
          <div className="flex-1 p-8 lg:p-12 bg-[#f8f8f7] flex flex-col items-center justify-center relative group/canvas">
             <div className="flex items-center gap-3 mb-6 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-100 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => handleMenuChange(activeScreenIndex, { ...activeMenu, isMenuMode: !activeMenu.isMenuMode })} className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg transition-all ${activeMenu.isMenuMode ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                   {activeMenu.isMenuMode ? '✓ Menú Lista Activo' : '📋 Activar Menú Lista'}
                </button>
             </div>

             <div className={`w-full max-w-4xl bg-black rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center border-[12px] border-white relative transition-all duration-700 ${formData.formato === 'post' ? 'aspect-square' : (formData.formato === 'tv_h' ? 'aspect-[16/9]' : 'min-h-[600px]')}`}>
                {previewUrl ? (
                   <TextLayerEditor 
                     imageUrl={previewUrl} 
                     layers={layersByScreen[activeScreenIndex] || []} 
                     onLayersChange={(newLayers) => { setLayersByScreen(prev => { const c = [...prev]; c[activeScreenIndex] = newLayers; return c; }); }}
                     activeLayerId={activeLayerId} 
                     onSetActiveLayer={(id) => setActiveLayerId(id)} 
                     formato={formData.formato} 
                     menuData={activeMenu}
                     onMenuChange={(d) => handleMenuChange(activeScreenIndex, d)}
                     templateColors={currentScreenLayoutObj?.colors}
                     templateFonts={currentScreenLayoutObj?.fonts}
                     onImageClick={() => setActiveRightPanel('GALLERY')}
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

          {/* PANEL DERECHO: Editor / Galería */}
          <div className="w-full lg:w-[380px] bg-white border-l border-slate-100 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.02)] z-20">
             <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-800">
                   {activeRightPanel === 'GALLERY' ? '📦 Galería PNG' : '⚙️ Propiedades'}
                </h3>
                {activeRightPanel === 'GALLERY' && (
                   <button type="button" onClick={() => setActiveRightPanel('PROPERTIES')} className="text-[10px] font-black text-indigo-500 hover:bg-indigo-50 px-2 py-1 rounded-md transition-all">TERMINAR</button>
                )}
             </div>

             <div className="flex-1 overflow-y-auto p-6 pb-32 custom-scrollbar">
                {activeRightPanel === 'GALLERY' ? (
                   <div className="flex flex-col gap-6">
                      <label className={`w-full py-5 rounded-3xl border-2 border-dashed border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${isUploadingProduct ? 'animate-pulse opacity-50' : ''}`}>
                         <span className="text-2xl">{isUploadingProduct ? '⏳' : '📥'}</span>
                         <span className="text-[10px] font-black uppercase text-indigo-500">{isUploadingProduct ? 'Procesando...' : 'Subir PNG a Galería'}</span>
                         <input type="file" accept="image/png" className="hidden" onChange={async (e) => {
                            const f = e.target.files?.[0]; if(!f) return;
                            setIsUploadingProduct(true);
                            try {
                               const r = ref(storage, `products/${Date.now()}_${f.name}`);
                               await uploadBytes(r, f);
                               const u = await getDownloadURL(r);
                               const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
                               await addDoc(collection(db, "products"), { name: f.name.split('.')[0], imageUrl: u, category: 'general', createdAt: serverTimestamp() });
                               setPendingProductToAdd(u);
                            } catch(err) { alert("Error"); } finally { setIsUploadingProduct(false); }
                         }} />
                      </label>

                      <div className="grid grid-cols-2 gap-4">
                         {validProducts.map(p => (
                            <button type="button" key={p.id} onClick={() => setPendingProductToAdd(p.imageUrl)} className="group relative aspect-square bg-slate-50 rounded-[32px] border border-slate-100 p-4 flex items-center justify-center hover:bg-white hover:border-indigo-400 hover:shadow-xl transition-all overflow-hidden pattern-dots">
                               <img src={p.imageUrl} className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                               <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                                  <p className="text-[9px] font-bold text-white truncate">{p.name}</p>
                               </div>
                            </button>
                         ))}
                      </div>
                   </div>
                ) : (
                   <div className="animate-in fade-in duration-300">
                      {activeLayerId ? (
                         <ActiveLayerPropertiesPanel 
                            layers={activeLayers}
                            onLayersChange={ns => { const c = [...layersByScreen]; c[activeScreenIndex] = ns; setLayersByScreen(c); }}
                            activeLayerId={activeLayerId}
                            onSetActiveLayer={setActiveLayerId}
                            templateColors={currentScreenLayoutObj?.colors}
                            templateFonts={currentScreenLayoutObj?.fonts}
                            customFontsList={customFonts?.map(f => f.name)}
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