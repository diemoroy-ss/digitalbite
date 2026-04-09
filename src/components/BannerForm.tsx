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

// ───────────────────────────────────────────────────────────────────────
// CORRECCIÓN: Posiciones por defecto ajustadas (Y coordinadas).
// Ahora el mensaje está debajo del título, luego el precio, y las 
// redes sociales están más arriba (posY: 93) para no pisar la firma.
// ───────────────────────────────────────────────────────────────────────
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

function F({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        <span className="text-rose-400">{icon}</span>{label}
      </label>
      {children}
    </div>
  );
}

function MenuToggle({ menuData, onChange }: { menuData: MenuScreenData; onChange: (newData: MenuScreenData) => void }) {
  const isMenu = menuData?.isMenuMode || false;
  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl mb-2 relative w-full h-auto">
      <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-slate-200 transition-transform duration-300 ${isMenu ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}></div>
      <button type="button" onClick={() => onChange({ ...menuData, isMenuMode: false })}
        className={`flex-1 py-3 text-[13px] font-bold z-10 transition-colors ${!isMenu ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
        📢 Promoción
      </button>
      <button type="button" onClick={() => onChange({ ...menuData, isMenuMode: true })}
        className={`flex-1 py-3 text-[13px] font-bold z-10 transition-colors ${isMenu ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
        📋 Menú Lista
      </button>
    </div>
  );
}

function MenuOptionsToolbar({ menuData, onChange }: { menuData: MenuScreenData; onChange: (newData: MenuScreenData) => void }) {
  return (
    <div className="flex gap-4 mb-4 mt-2 w-full text-left bg-slate-50 border border-slate-100 p-4 rounded-xl">
      <div className="flex-1">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">🔡 Tamaño del texto</label>
        <p className="text-[9px] text-slate-400 mb-1">Ajusta cuán grande se ven los precios y nombres</p>
        <input 
          type="range" min="0.5" max="2" step="0.05" 
          value={menuData.scale ?? 1} 
          onChange={e => onChange({ ...menuData, scale: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </div>
      <div className="flex-1">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">🌫 Transparencia del fondo</label>
        <p className="text-[9px] text-slate-400 mb-1">Mueve hacia la izquierda para que el fondo desaparezca</p>
        <input 
          type="range" min="0" max="1" step="0.05" 
          value={menuData.bgOpacity ?? 0.85} 
          onChange={e => onChange({ ...menuData, bgOpacity: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </div>
      <div className="w-1/4">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">🎨 Color de fondo</label>
        <p className="text-[9px] text-slate-400 mb-1">Qué color tiene la tarjeta del menú</p>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={menuData.bgColor || "#0f172a"} 
            onChange={e => onChange({ ...menuData, bgColor: e.target.value })}
            className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0"
          />
        </div>
      </div>
    </div>
  );
}

function MenuListEditor({ menuData, onChange, onOpenProduct, formato }: { menuData: MenuScreenData; onChange: (newData: MenuScreenData) => void; onOpenProduct?: () => void; formato?: string }) {
  const items = menuData?.menuItems || [{name: '', price: ''}];
  const items2 = menuData?.menuItems2 || [];
  const items3 = menuData?.menuItems3 || [];
  const isWide = formato === 'tv_h';
  const maxItems = isWide ? 5 : 10;

  const renderColumn = (list: {name: string, price: string, desc?: string}[], listKey: 'menuItems' | 'menuItems2' | 'menuItems3', title: string, scaleKey: 'scale'|'scale2'|'scale3', visibleKey: 'visible'|'visible2'|'visible3') => {
    const isVisible = menuData[visibleKey] !== false; // defaults to true
    const scaleVal = menuData[scaleKey] ?? 1;

    return (
      <div className={`flex-1 flex flex-col gap-2 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100 shadow-sm relative w-full transition-all ${!isVisible ? 'opacity-60 saturate-50' : ''}`}>
        {isWide && (
          <div className="flex items-center justify-between mb-1 px-1">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onChange({ ...menuData, [visibleKey]: !isVisible })} 
                className={`p-1.5 rounded-md transition-colors ${isVisible ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`} title={isVisible ? "Ocultar menú" : "Mostrar menú"}>
                {isVisible ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>}
              </button>
              <h5 className="text-[11px] font-bold text-indigo-500 uppercase">{title}</h5>
            </div>
            
            <div className="flex items-center gap-1.5" title="Tamaño de texto">
              <span className="text-[10px] font-black text-indigo-400">A</span>
              <input type="range" min="0.2" max="2" step="0.05" value={scaleVal}
                onChange={e => {
                  const newScale = parseFloat(e.target.value);
                  const oldScale = scaleVal || 1;
                  const wKeyMap: Record<string, 'width'|'width2'|'width3'> = { scale: 'width', scale2: 'width2', scale3: 'width3' };
                  const wKey = wKeyMap[scaleKey];
                  
                  const baseDefaultPct = isWide ? 28 : 80;
                  const oldWidth = menuData[wKey] ?? baseDefaultPct;
                  const newWidth = oldWidth * (newScale / oldScale);
                  
                  onChange({ ...menuData, [scaleKey]: newScale, [wKey]: newWidth });
                }}
                className="w-16 h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                disabled={!isVisible}
              />
              <span className="text-[12px] font-black text-indigo-500">A</span>
            </div>
          </div>
        )}
        <div className={`flex flex-col gap-2 ${!isVisible ? 'pointer-events-none' : ''}`}>
          {list.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1 relative group bg-white p-2 rounded-xl border border-indigo-50 shadow-sm">
              <div className="flex gap-1 items-start w-full">
                <div className="flex-[2] flex gap-1">
                  <button type="button" onClick={onOpenProduct} title="Añadir Imagen de Producto"
                     className="bg-indigo-50 hover:bg-indigo-100 text-indigo-500 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors border border-indigo-200 mt-[1px]">
                     🍔
                  </button>
                  <input type="text" placeholder="Plato..." className={`${fc} text-[12px] px-2 py-1.5 min-h-[36px] min-w-0 w-full`}
                    value={item.name} 
                    onChange={e => {
                      const newArr = [...list];
                      newArr[idx].name = e.target.value;
                      onChange({ ...menuData, [listKey]: newArr });
                    }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input type="text" placeholder="$0" className={`${fc} text-[12px] px-2 py-1.5 min-h-[36px] min-w-0 w-full text-center`}
                    value={item.price} 
                    onChange={e => {
                      const newArr = [...list];
                      newArr[idx].price = e.target.value;
                      onChange({ ...menuData, [listKey]: newArr });
                    }} 
                  />
                </div>
                {list.length > 1 && (
                  <button type="button" 
                    onClick={() => onChange({ ...menuData, [listKey]: list.filter((_, i) => i !== idx) })}
                    className="bg-white hover:bg-rose-50 border border-slate-200 text-rose-500 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors shadow-sm mt-[1px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m11 6-6 6 6 6"/></svg>
                  </button>
                )}
              </div>
              {/* Description row */}
              <div className="pl-10">
                <input type="text" placeholder="Detalle (opcional)..." className={`${fc} text-[11px] px-2 py-1 min-h-[28px] w-full text-slate-500 bg-slate-50/50 placeholder:italic`}
                  value={item.desc || ''} 
                  onChange={e => {
                    const newArr = [...list];
                    newArr[idx].desc = e.target.value;
                    onChange({ ...menuData, [listKey]: newArr });
                  }} 
                />
              </div>
            </div>
          ))}
          {list.length < maxItems && (
            <button type="button" 
              onClick={() => onChange({ ...menuData, [listKey]: [...list, { name: '', price: '', desc: '' }] })}
              className="w-full py-2.5 border-2 border-dashed border-indigo-200 text-indigo-500 hover:bg-indigo-100 font-bold text-[12px] rounded-xl transition-colors mt-1">
              + Agregar plato
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className={`grid gap-3 w-full ${menuData.visible3 ? 'grid-cols-1 md:grid-cols-3' : (menuData.visible2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}`}>
        {renderColumn(items, 'menuItems', 'Menú 1', 'scale', 'visible')}
        {menuData.visible2 && renderColumn(items2, 'menuItems2', 'Menú 2', 'scale2', 'visible2')}
        {menuData.visible3 && renderColumn(items3, 'menuItems3', 'Menú 3', 'scale3', 'visible3')}
      </div>
    </div>
  );
}

export default function BannerForm({ formData, setFormData, handleImg, loadingImg, selectedLayoutObj, imageUrlWatermark, setShowResultModal, pendingProductToAdd, setPendingProductToAdd, onOpenProductModal, validLayouts, customFonts, products, productsError, categorySlug, userDoc }: BannerFormProps) {
  const screensCount = formData.screensCount || 1;
  const isMultiScreen = formData.formato === 'tv_h' || formData.formato === 'tv_v';

  // State: One array of layers per screen
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const [layersByScreen, setLayersByScreen] = useState<TextLayer[][]>([[]]);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [customImageLoading, setCustomImageLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const currentLayoutId = formData.menusByScreen?.[activeScreenIndex]?.layoutId || (selectedLayoutObj as any)?.id;
  const currentScreenLayoutObj = validLayouts?.find(l => l.id === currentLayoutId) || selectedLayoutObj;


  // Handle pending product injection / swap
  useEffect(() => {
    if (pendingProductToAdd) {
      setLayersByScreen(prev => {
        const copy = [...prev];
        const targetIdx = isMultiScreen ? activeScreenIndex : 0;
        const currentLayers = copy[targetIdx];
        
        // Verificar si la capa activa es una imagen que se desea reemplazar
        const targetImageIdx = currentLayers.findIndex(l => l.id === activeLayerId && (l.type === "image" || l.type === "logo" || l.fieldKey === "logo"));
        
        if (targetImageIdx !== -1) {
           const updatedLayer = { ...currentLayers[targetImageIdx], text: pendingProductToAdd };
           // Asegurar una reactividad forzada clonando el array
           copy[targetIdx] = [...currentLayers.slice(0, targetImageIdx), updatedLayer, ...currentLayers.slice(targetImageIdx + 1)];
        } else {
           const newImgLayer = createImageLayer(pendingProductToAdd);
           newImgLayer.fontSize = 300; 
           newImgLayer.posY = 50;
           copy[targetIdx] = [...currentLayers, newImgLayer];
           // Only change active pointer to the newly created layer. Si es swap, mantener activo el editado.
           const tmout = setTimeout(() => setActiveLayerId(newImgLayer.id), 0);
        }
        return copy;
      });
      setPendingProductToAdd(null);
    }
  }, [pendingProductToAdd, isMultiScreen, activeScreenIndex, setPendingProductToAdd, activeLayerId]);

  const isVertical = formData.formato === "story" || formData.formato === "tv_v";
  
  let previewUrl = "";
  if (currentScreenLayoutObj) {
    if (isVertical) {
      previewUrl = (currentScreenLayoutObj as any).urlStory || (currentScreenLayoutObj as any).url || "";
    } else if (formData.formato === "tv_h") {
      previewUrl = (currentScreenLayoutObj as any).urlTv || (currentScreenLayoutObj as any).url || "";
    } else {
      previewUrl = (currentScreenLayoutObj as any).url || "";
    }
  }


  const handleMenuChange = (screenIndex: number, newMenuData: MenuScreenData) => {
    const newMenus = [...(formData.menusByScreen || [])];
    newMenus[screenIndex] = newMenuData;
    // ensure array is padded
    for (let i = 0; i < screensCount; i++) {
        if (!newMenus[i]) newMenus[i] = { isMenuMode: false, menuItems: [{ name: '', price: '' }] };
    }
    setFormData({ ...formData, menusByScreen: newMenus });
  };
  
  const activeMenu = formData.menusByScreen?.[isMultiScreen ? activeScreenIndex : 0] || { isMenuMode: false, menuItems: [{ name: '', price: '' }] };

  // ----- DYNAMIC TEMPLATES INJECTION -----
  useEffect(() => {
    if (!currentScreenLayoutObj) return;

    let defaultLayers: any[] = [];
    let defaultMenuData: any = null;

    if (formData.formato === "story" || formData.formato === "tv_v") {
      defaultLayers = (currentScreenLayoutObj as any).defaultLayersVertical;
      defaultMenuData = (currentScreenLayoutObj as any).defaultMenuDataVertical;
    } else if (formData.formato === "post") {
      defaultLayers = (currentScreenLayoutObj as any).defaultLayersPost;
      defaultMenuData = (currentScreenLayoutObj as any).defaultMenuDataPost;
    } else if (formData.formato === "tv_h") {
      defaultLayers = (currentScreenLayoutObj as any).defaultLayersHorizontal;
      defaultMenuData = (currentScreenLayoutObj as any).defaultMenuDataHorizontal;
    }

    if (defaultLayers && defaultLayers.length > 0) {
      // Evita sincronizar textos de sistema encima de esto. Las plantillas dinámicas toman el control manual.
      setLayersByScreen(prev => {
        const copy = [...prev];
        // Solo inyectar si la pantalla no ha sido forzada por el admin
        copy[activeScreenIndex] = defaultLayers;
        return copy;
      });
    }

    if (defaultMenuData) {
      const newMenus = [...(formData.menusByScreen || [])];
      newMenus[activeScreenIndex] = defaultMenuData;
      setFormData({ ...formData, menusByScreen: newMenus });
    }
  }, [currentLayoutId, formData.formato, activeScreenIndex]);
  // ---------------------------------------

  useEffect(() => {
    const fields: Record<string, string> = {
      nombreLocal: formData.nombreLocal,
      titulo:      formData.titulo,
      precio:      formData.precio,
      mensaje:     formData.mensaje,
      instagram:   formData.instagram,
      facebook:    formData.facebook,
      tiktok:      formData.tiktok,
      logo:        formData.logo,
    };

    setLayersByScreen(prev => {
      // Ensure the array has `screensCount` elements
      const newArr = Array.from({ length: screensCount }).map((_, i) => prev[i] || []);
      
      // We ONLY sync system fields if we are NOT in TV formats 
      // AND if the layout does not provide its own defaultLayers.
      
      const hasDynamicLayers = 
         (formData.formato === "story" || formData.formato === "tv_v" ? (currentScreenLayoutObj as any)?.defaultLayersVertical?.length > 0 :
          formData.formato === "post" ? (currentScreenLayoutObj as any)?.defaultLayersPost?.length > 0 :
          formData.formato === "tv_h" ? (currentScreenLayoutObj as any)?.defaultLayersHorizontal?.length > 0 : false);

      if (!isMultiScreen && !hasDynamicLayers) {
        return newArr.map(screenLayers => syncLayers(screenLayers, fields));
      } else {
        // En TV Mode o Plantilla Dinamica, evitamos sincronizar campos auto (evita que textos se repitan entre form global y lienzo)
        return newArr.map(screenLayers => screenLayers.filter(l => !l.fieldKey || hasDynamicLayers));
      }
    });
  }, [screensCount, isMultiScreen, formData.nombreLocal, formData.titulo, formData.precio, formData.mensaje, formData.instagram, formData.facebook, formData.tiktok, formData.logo]);

  const addCustomLayer = (screenIndex: number) => {
    const l = createLayer("Tu texto aquí");
    setLayersByScreen(prev => {
      const copy = [...prev];
      copy[screenIndex] = [...copy[screenIndex], l];
      return copy;
    });
    setActiveScreenIndex(screenIndex);
    setActiveLayerId(l.id);
  };

  const addPriceLayer = (screenIndex: number) => {
    const badge: TextLayer = {
      id: "badge-" + Math.random().toString(36).slice(2),
      type: "badge",
      text: "",
      posX: 40,
      posY: 40,
      width: 180,
      height: 80,
      fontSize: 80,
      color: "#000000",
      fontWeight: "bold",
      textAlign: "center",
      fontFamily: "sans-serif",
      shadow: false,
      badgeStyle: 1
    };
    
    const priceText: TextLayer = {
      id: "price-" + Math.random().toString(36).slice(2),
      type: "text",
      text: "$9.990",
      posX: 42,
      posY: 42,
      width: 200,
      height: 80,
      fontSize: 80,
      color: "#000000",
      fontWeight: "bold",
      textAlign: "center",
      fontFamily: "'Playfair Display', serif",
      shadow: true
    };

    setLayersByScreen(prev => {
      const copy = [...prev];
      copy[screenIndex] = [...copy[screenIndex], badge, priceText];
      return copy;
    });
    setActiveScreenIndex(screenIndex);
    setActiveLayerId(priceText.id);
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    try {
      const localPreview = URL.createObjectURL(file);
      setLogoPreview(localPreview);
      const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setFormData({ ...formData, logo: downloadUrl });
      
      const logoLayer: TextLayer = {
        id: "sys-logo", fieldKey: "logo", type: "logo",
        text: downloadUrl, posX: 85, posY: 8, fontSize: 150,
        color: "#ffffff", fontWeight: "bold", textAlign: "center", fontFamily: "sans-serif", shadow: false, badgeStyle: 1
      };
      // Aplicar logo a todas las pantallas
      setLayersByScreen(prev => prev.map(screenLayers => [...screenLayers.filter(l => l.fieldKey !== "logo"), logoLayer]));
    } catch (err) {
      console.error("Error subiendo logo:", err);
    } finally {
      setLogoLoading(false);
    }
  };

  const handleCustomImageUpload = async (e: ChangeEvent<HTMLInputElement>, screenIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomImageLoading(true);
    try {
      const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      const newImgLayer = createImageLayer(downloadUrl);
      setLayersByScreen(prev => {
        const copy = [...prev];
        copy[screenIndex] = [...copy[screenIndex], newImgLayer];
        return copy;
      });
      setActiveScreenIndex(screenIndex);
      setActiveLayerId(newImgLayer.id);
    } catch (err) {
      console.error("Error subiendo imagen libre:", err);
      alert("Hubo un error subiendo la imagen, intenta de nuevo.");
    } finally {
      setCustomImageLoading(false);
      if (fileInputRefs.current[screenIndex]) {
        fileInputRefs.current[screenIndex]!.value = "";
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); handleImg(e, layersByScreen); };
  
  const activeLayers = layersByScreen[activeScreenIndex] || [];
  const customCount = activeLayers.filter(l => !l.fieldKey).length;

  const hasDynamicLayers = 
     (formData.formato === "story" || formData.formato === "tv_v" ? (currentScreenLayoutObj as any)?.defaultLayersVertical?.length > 0 :
      formData.formato === "post" ? (currentScreenLayoutObj as any)?.defaultLayersPost?.length > 0 :
      formData.formato === "tv_h" ? (currentScreenLayoutObj as any)?.defaultLayersHorizontal?.length > 0 : false);

  const activeLayerObj = activeLayers.find(l => l.id === activeLayerId);
  const isImageActive = activeLayerObj && (activeLayerObj.type === "image" || activeLayerObj.type === "logo");
  const isTextActive = activeLayerObj && (activeLayerObj.type === "text" || activeLayerObj.type === "price");
  
  let validProducts = (products || []).filter(p => !categorySlug || categorySlug === 'general' || p.categories?.includes(categorySlug) || p.category === categorySlug);
  if (validProducts.length === 0) validProducts = products || [];

  const renderTabs = () => {
    if (formData.destType !== 'tv' || screensCount <= 1) return null;
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex overflow-x-auto hide-scrollbar gap-2">
          {Array.from({ length: screensCount }).map((_, idx) => {
            const screenData = formData.menusByScreen[idx];
            const hasItems = screenData?.menuItems?.some(item => item.name?.trim() || item.price?.trim());
            return (
              <button type="button" key={idx} onClick={() => setActiveScreenIndex(idx)}
                aria-selected={activeScreenIndex === idx}
                className={`px-5 py-4 text-[13px] font-bold tracking-wide transition-all flex-1 text-center flex items-center justify-center gap-2 rounded-2xl border-2 outline-none focus:outline-none 
                  ${activeScreenIndex === idx
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'
                  }`}>
                TV {idx + 1}
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${hasItems ? 'bg-emerald-400' : 'bg-slate-300'}`}
                  aria-label={hasItems ? 'Con contenido' : 'Vacío'} />
              </button>
            );
          })}
        </div>
        <div className="flex justify-end mt-1 pr-1">
          <button type="button" onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors shadow-sm">
            <span aria-hidden="true">🖼️</span> Cambiar plantilla TV {activeScreenIndex + 1}
          </button>
        </div>
      </div>
    );
  };

  const renderEditorActions = () => (
    <div className={`flex flex-col items-center justify-center gap-2 text-center w-full tour-herramientas ${formData.formato === 'tv_h' ? '' : 'p-6 bg-white min-h-[300px]'}`}>
      <h4 className="text-[16px] font-black text-slate-800">
        {screensCount > 1 ? `Editor del Lienzo ${activeScreenIndex + 1}` : "Editor Libre de Textos"}
      </h4>
      <p className="text-[13px] text-slate-500 max-w-sm leading-relaxed mb-2">
        {screensCount > 1 ? "Personaliza esta pantalla con tus productos." : "Agrega textos libres, precios y más a tu diseño."}
      </p>
      
      <MenuToggle menuData={activeMenu} onChange={d => handleMenuChange(activeScreenIndex, d)} />
      
      {activeMenu.isMenuMode && (
         <div className="w-full text-left max-w-4xl mt-0">
           <MenuOptionsToolbar menuData={activeMenu} onChange={d => handleMenuChange(activeScreenIndex, d)} />
           <MenuListEditor menuData={activeMenu} onChange={d => handleMenuChange(activeScreenIndex, d)} onOpenProduct={onOpenProductModal} formato={formData.formato} />
         </div>
      )}
      
      <div className="w-full flex flex-col items-center gap-3 mt-3 pt-4 border-t border-slate-100">
        {/* Helper text for empty canvas */}
        {!activeMenu.isMenuMode && activeLayers.filter(l => !l.fieldKey).length === 0 && (
          <div className="w-full max-w-lg text-center bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-indigo-600 text-[12px] leading-relaxed mb-2">
            <span className="text-lg">👆</span><br/>
            <strong>¡Empieza aquí!</strong> Usa los botones de abajo para agregar texto, precio o imagen sobre el diseño. Luego puedes arrastrarlo al lugar que quieras.
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
              <button type="button" onClick={() => onOpenProductModal?.()}
                title="Añade el nombre y foto de un producto al diseño"
                className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:-translate-y-0.5">
                🍔 Producto
              </button>
              <span className="text-[10px] text-slate-400">nombre + imagen</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <button type="button" onClick={() => addCustomLayer(activeScreenIndex)}
                title="Añade un bloque de texto libre que puedes escribir y mover"
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:-translate-y-0.5">
                ＋ Texto libre
              </button>
              <span className="text-[10px] text-slate-400">escribe lo que quieras</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <button type="button" onClick={() => addPriceLayer(activeScreenIndex)}
                title="Añade un badge de precio con fondo destacado"
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:-translate-y-0.5">
                💲 Precio
              </button>
              <span className="text-[10px] text-slate-400">badge con fondo</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <label title="Sube una imagen o logo desde tu computador" className={`flex items-center gap-1.5 text-[12px] font-bold px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer ${customImageLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 text-white hover:-translate-y-0.5'}`}>
                {customImageLoading ? (
                  <><span className="animate-spin leading-none">⟳</span> Subiendo...</>
                ) : (
                  <>🖼 Imagen</>
                )}
                <input type="file" accept="image/*" className="hidden" 
                  ref={el => { fileInputRefs.current[activeScreenIndex] = el; }}
                  onChange={e => handleCustomImageUpload(e, activeScreenIndex)} 
                  disabled={customImageLoading} 
                />
              </label>
              <span className="text-[10px] text-slate-400">foto o logo</span>
            </div>
          </div>
        </div>
    </div>
  );

  return (
    <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 mb-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold tracking-widest uppercase mb-3">
          <Sparkles /> Paso 4
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Personaliza tu banner</h2>
        <p className="text-slate-500 mt-2 text-[15px]">Completa los datos · Arrastra los textos sobre la imagen.</p>
      </div>

      <form onSubmit={onSubmit} className="w-full max-w-7xl mx-auto bg-white rounded-[40px] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col">
        
        {/* TOP COMPONENT: Tabs ALWAYS AT THE TOP for TV formats */}
        {renderTabs() && (
          <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50 flex flex-col">
            {renderTabs()}
          </div>
        )}

        {/* GRID LAYOUT: Stacked for Horizontal/Square (!isVertical), Split for Vertical (isVertical) */}
        {!hasDynamicLayers ? (
        <div className={`grid gap-0 ${!isVertical ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

          {/* Preview Panel (Left if split, Top if stacked) */}
          <div className={`bg-gradient-to-br from-rose-50 to-orange-50 p-6 lg:p-10 flex flex-col gap-4 relative ${!isVertical ? 'border-b' : 'border-r'} border-slate-100 tour-lienzo`}>
            {isVertical && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 text-[16px]">Previsualización</h3>
                  <p className="text-[12px] text-slate-400">Completa el formulario · Los textos aparecen y son arrastrables</p>
                </div>
              </div>
            )}

            {previewUrl ? (
              <div className="w-full flex justify-center">
                {/* Solamente mostramos la pantalla activa para no sobrecargar el lienzo (vista individual) */}
                <div className="relative flex flex-col gap-2 w-full max-w-5xl items-center">
                  {isMultiScreen && (
                    <div className="w-full flex items-center justify-between px-2 mb-2">
                      <span className="font-bold text-[14px] text-indigo-700 bg-indigo-100/50 px-3 py-1 rounded-full border border-indigo-200">
                         Pantalla {activeScreenIndex + 1} de {screensCount}
                      </span>
                    </div>
                  )}
                  
                  <div className="w-full flex-1 mx-auto bg-black/5 rounded-xl overflow-hidden shadow-inner flex flex-col text-center relative">
                    <TextLayerEditor 
                      imageUrl={previewUrl} 
                      layers={layersByScreen[activeScreenIndex] || []} 
                      onLayersChange={(newLayers) => {
                        setLayersByScreen(prev => {
                          const copy = [...prev];
                          copy[activeScreenIndex] = newLayers;
                          return copy;
                        });
                      }}
                      activeLayerId={activeLayerId} 
                      onSetActiveLayer={(id) => setActiveLayerId(id)} 
                      formato={formData.formato} 
                      menuData={formData.menusByScreen?.[activeScreenIndex]}
                      onMenuChange={(d) => handleMenuChange(activeScreenIndex, d)}
                      templateColors={selectedLayoutObj?.colors}
                      templateFonts={selectedLayoutObj?.fonts}
                      onImageClick={() => onOpenProductModal?.()}
                      customFontsList={customFonts?.map(f => f.name)}
                    />
                    
                    {/* DIGITALBITE WATERMARK */}
                    {(!userDoc || (userDoc?.generationCount || 0) >= (userDoc?.generationLimit || 0)) && userDoc?.role !== "admin" && (
                       <svg className="absolute inset-0 w-full h-full pointer-events-none z-[100]" xmlns="http://www.w3.org/2000/svg">
                         <pattern id="watermark" x="0" y="0" width="220" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                           <text x="0" y="110" fill="rgba(255,255,255,0.4)" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fontSize="30" fontWeight="900" fontFamily="sans-serif">DIGITALBITE</text>
                         </pattern>
                         <rect x="0" y="0" width="100%" height="100%" fill="url(#watermark)" />
                       </svg>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center py-10 md:py-20 animate-in fade-in zoom-in-95">
                <div className="bg-white/80 backdrop-blur border border-rose-100 border-dashed rounded-[32px] p-10 text-center max-w-sm w-full mx-auto shadow-sm">
                   <div className="text-5xl mb-3 grayscale opacity-40 mix-blend-luminosity" aria-hidden="true">🤷‍♂️</div>
                   <h3 className="text-[16px] font-black text-rose-900 mb-2">Formato No Disponible</h3>
                   <p className="text-[12px] text-rose-500/80 leading-relaxed font-medium">
                     La plantilla que seleccionaste no tiene un diseño adaptado para el formato <strong>{formData.formato === 'tv_v' ? 'Vertical (9:16)' : formData.formato === 'tv_h' ? 'Horizontal (16:9)' : formData.formato === 'story' ? 'Historia/Reel (9:16)' : 'Post Cuadrado'}</strong>.
                   </p>
                   <p className="text-[11px] text-slate-500 mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-inner">
                     Por favor, selecciona otro formato en la botonera superior o elige una plantilla diferente en el <strong>Paso 2</strong>.
                   </p>
                </div>
              </div>
            )}

            {previewUrl && activeLayers.length > 0 && (
              <div className="bg-white/70 rounded-2xl p-4 border border-rose-100 text-[11px] mt-2 max-w-5xl mx-auto w-full">
                <p className="font-bold text-rose-500 mb-2 uppercase tracking-widest text-[10px]">
                  {isMultiScreen && `Pantalla ${activeScreenIndex + 1} · `}{activeLayers.length} capa{activeLayers.length !== 1 ? "s" : ""} · {customCount} texto{customCount !== 1 ? "s" : ""} libre{customCount !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeLayers.map(l => (
                    <span key={l.id} onClick={() => { setActiveScreenIndex(activeScreenIndex); setActiveLayerId(l.id); }}
                      className={`cursor-pointer border px-2.5 py-1 rounded-full text-slate-600 transition-colors truncate max-w-[120px] ${activeLayerId === l.id && activeScreenIndex === activeScreenIndex ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold' : 'bg-slate-100 hover:bg-rose-50 border-slate-200 hover:border-rose-200 hover:text-rose-600'}`}>
                      {l.text || "(vacío)"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {previewUrl && imageUrlWatermark && imageUrlWatermark.length > 0 && (
              <div className="mt-4 max-w-5xl mx-auto w-full">
                <button type="button" onClick={() => setShowResultModal(true)}
                  className="w-full py-4 bg-emerald-50 text-emerald-600 font-bold rounded-2xl border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm">
                  👀 Volver a Ver Diseño Final
                </button>
              </div>
            )}
          </div>

          {/* SIDE/BOTTOM EDITOR PANEL */}
          <div className="p-6 lg:p-10 flex flex-col gap-5 bg-white items-center">
            
            {/* Editor Data solely based on Layout Type */}
            {!isVertical ? (
               <div className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-slate-50 border border-indigo-100 rounded-[32px] shadow-sm flex flex-col items-center">
                 {renderEditorActions()}
                 {activeLayerId && (
                   <div className="w-full mt-4">
                     <ActiveLayerPropertiesPanel 
                       layers={layersByScreen[activeScreenIndex] || []}
                       onLayersChange={(newLayers) => {
                         setLayersByScreen(prev => {
                           const copy = [...prev];
                           copy[activeScreenIndex] = newLayers;
                           return copy;
                         });
                       }}
                       activeLayerId={activeLayerId}
                       onSetActiveLayer={setActiveLayerId}
                       templateFonts={selectedLayoutObj?.fonts}
                       templateColors={selectedLayoutObj?.colors}
                     />
                   </div>
                 )}
               </div>
            ) : (
               <div className="w-full rounded-2xl border border-indigo-100 shadow-sm overflow-hidden flex flex-col mb-2 p-4">
                 {renderEditorActions()}
                 {activeLayerId && (
                   <div className="w-full mt-0">
                     <ActiveLayerPropertiesPanel 
                       layers={layersByScreen[activeScreenIndex] || []}
                       onLayersChange={(newLayers) => {
                         setLayersByScreen(prev => {
                           const copy = [...prev];
                           copy[activeScreenIndex] = newLayers;
                           return copy;
                         });
                       }}
                       activeLayerId={activeLayerId}
                       onSetActiveLayer={setActiveLayerId}
                       templateFonts={selectedLayoutObj?.fonts}
                       templateColors={selectedLayoutObj?.colors}
                     />
                   </div>
                 )}
               </div>
            )}

            {userDoc?.role === "admin" || (userDoc?.generationCount || 0) < (userDoc?.generationLimit || 0) ? (
              <button type="submit" disabled={loadingImg}
                className={`w-full py-5 rounded-2xl font-black text-[16px] tracking-wide transition-all disabled:opacity-60 mt-auto shadow-lg tour-generar ${!isVertical ? 'max-w-5xl mx-auto' : ''}`}
                style={{ background: loadingImg ? "#e2e8f0" : "linear-gradient(135deg,#f43f5e,#fb923c)", color: loadingImg ? "#94a3b8" : "#fff", boxShadow: loadingImg ? "none" : "0 8px 30px -6px rgba(244,63,94,0.5)" }}>
                {loadingImg ? "🪄 Generando en la nube..." : "🚀 Crear imagen HD — sin marcas de agua"}
              </button>
            ) : (
              <button type="button" onClick={async () => {
                     // LÓGICA DE COBRO MP UNITARIO
                     try {
                        const res = await fetch("/api/mercadopago/checkout", {
                           method:"POST", headers:{"Content-Type":"application/json"},
                           body: JSON.stringify({ userId: auth.currentUser?.uid || userDoc?.id || userDoc?.uid, userEmail: auth.currentUser?.email || userDoc?.email, price: 2990 })
                        });
                        const data = await res.json();
                        if (data.init_point) window.location.href = data.init_point;
                     } catch(err) { console.error(err); alert("Error abriendo caja de pago."); }
              }}
                className={`w-full py-5 rounded-2xl font-black text-[16px] tracking-wide transition-all mt-auto shadow-lg ${!isVertical ? 'max-w-5xl mx-auto' : ''} bg-slate-900 border-2 border-amber-400 text-white shadow-amber-400/20`}>
                ⚡ Pago por Generación ($2990)
              </button>
            )}
          </div>
        </div>
        ) : (
        <div className="flex flex-col lg:flex-row border-t border-slate-100 bg-[#fdfdfc] relative">
            {/* Left Panel: Products */}
            <div className="w-full lg:w-[180px] bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 lg:h-[600px]">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-[10px] font-black tracking-widest text-slate-800 uppercase flex items-center gap-2">
                  <span>🍔</span> Galería PNG
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar">
                {validProducts.map(p => (
                  <button type="button" key={p.id} onClick={() => {
                     let targetLayerId = activeLayerId;
                     if (!isImageActive || !targetLayerId) {
                        const firstImg = layersByScreen[activeScreenIndex]?.find(l => l.type === 'image' || l.type === 'logo');
                        if (firstImg) targetLayerId = firstImg.id;
                     }

                     if (targetLayerId) {
                       setLayersByScreen(prev => {
                         const copy = [...prev];
                         const activeScrnLayers = [...copy[activeScreenIndex]];
                         const idx = activeScrnLayers.findIndex(l => l.id === targetLayerId);
                         if (idx > -1) {
                            activeScrnLayers[idx] = { ...activeScrnLayers[idx], text: p.imageUrl };
                            copy[activeScreenIndex] = activeScrnLayers;
                         }
                         return copy;
                       });
                       setActiveLayerId(targetLayerId);
                     }
                  }} className="group relative w-full aspect-square rounded-xl overflow-hidden border-2 border-slate-100 hover:border-indigo-400 focus:border-indigo-500 transition-all text-left bg-slate-50 shrink-0">
                     <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-[9px] font-bold truncate">{p.name}</p>
                        <p className="text-emerald-400 font-bold text-[8px]">{p.price && `$${p.price}`}</p>
                     </div>
                  </button>
                ))}
                {validProducts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-10 px-4">No hay productos disponibles en esta categoría.</p>
                )}
              </div>
            </div>

            {/* Center Panel: Canvas */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 relative tour-lienzo bg-[#f8f8f7]">
               <div className={`w-full flex-1 mx-auto bg-black/5 rounded-[32px] overflow-hidden shadow-inner flex flex-col items-center justify-center border-[6px] border-white max-w-2xl ${formData.formato === 'post' ? 'aspect-square' : 'min-h-[500px]'}`}>
                  <TextLayerEditor 
                      isStrictTemplateMode={true}
                      imageUrl={previewUrl} 
                      layers={layersByScreen[activeScreenIndex] || []} 
                      onLayersChange={(newLayers) => {
                        setLayersByScreen(prev => {
                          const copy = [...prev];
                          copy[activeScreenIndex] = newLayers;
                          return copy;
                        });
                      }}
                      activeLayerId={activeLayerId} 
                      onSetActiveLayer={(id) => setActiveLayerId(id)} 
                      formato={formData.formato} 
                      menuData={formData.menusByScreen?.[activeScreenIndex]}
                      onMenuChange={(d) => handleMenuChange(activeScreenIndex, d)}
                      templateColors={selectedLayoutObj?.colors}
                      templateFonts={selectedLayoutObj?.fonts}
                      customFontsList={customFonts?.map(f => f.name)}
                  />
               </div>
               
               {previewUrl && imageUrlWatermark && imageUrlWatermark.length > 0 && (
                 <div className="mt-8 max-w-sm mx-auto w-full">
                   <button type="button" onClick={() => setShowResultModal(true)}
                     className="w-full py-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-2xl border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm">
                     👀 Ver Diseño HD Terminado
                   </button>
                 </div>
               )}
            </div>

            {/* Right Panel: Text Editor */}
            <div className={`w-full lg:w-[320px] bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 block`}>
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-[13px] font-black tracking-wide text-slate-800 uppercase flex items-center gap-2">
                  <span>✏️</span> Editar Elemento
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 pb-32 custom-scrollbar bg-slate-50">
                {isTextActive ? (
                  <ActiveLayerPropertiesPanel 
                       layers={layersByScreen[activeScreenIndex] || []}
                       onLayersChange={(newLayers) => {
                         setLayersByScreen(prev => {
                           const copy = [...prev];
                           copy[activeScreenIndex] = newLayers;
                           return copy;
                         });
                       }}
                       activeLayerId={activeLayerId}
                       onSetActiveLayer={setActiveLayerId}
                       templateFonts={selectedLayoutObj?.fonts}
                       templateColors={selectedLayoutObj?.colors}
                  />
                ) : isImageActive ? (
                  <div className="text-center py-10 opacity-60">
                     <div className="text-4xl mb-3 grayscale">🍔</div>
                     <p className="text-[12px] font-bold text-slate-800 mb-1">Imagen Seleccionada</p>
                     <p className="text-[11px] text-slate-500">Toca un producto en la lista izquierda para intercambiar la foto instantáneamente manteniendo su diseño exacto.</p>
                  </div>
                ) : (
                  <div className="text-center py-10 opacity-60">
                     <div className="text-4xl mb-3 grayscale">👆</div>
                     <p className="text-[12px] font-bold text-slate-800 mb-1">Seccion Interactiva</p>
                     <p className="text-[11px] text-slate-500">Toca un texto o cuadro de imagen en el lienzo al medio para comenzar a editar.</p>
                  </div>
                )}
              </div>
              
              <div className="absolute lg:relative bottom-0 inset-x-0 p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-safe">
                {userDoc?.role === "admin" || (userDoc && (userDoc?.generationCount || 0) < (userDoc?.generationLimit || 0)) ? (
                  <button type="submit" disabled={loadingImg}
                    className={`w-full py-4 rounded-[14px] font-black text-[14px] tracking-wide transition-all disabled:opacity-60 shadow-lg tour-generar cursor-pointer`}
                    style={{ background: loadingImg ? "#e2e8f0" : "linear-gradient(135deg,#f43f5e,#fb923c)", color: loadingImg ? "#94a3b8" : "#fff", boxShadow: loadingImg ? "none" : "0 8px 30px -6px rgba(244,63,94,0.5)" }}>
                    {loadingImg ? "🪄 Generando HD..." : "🚀 Finalizar Exportación HD"}
                  </button>
                ) : !userDoc ? (
                  <a href="/onboarding" className="flex items-center justify-center w-full py-4 rounded-[14px] font-black text-[14px] tracking-wide transition-all shadow-lg cursor-pointer bg-slate-900 border border-indigo-400/50 text-white shadow-indigo-400/10">
                    ✨ Regístrate Gratis para Exportar
                  </a>
                ) : (
                  <button type="button" onClick={async () => {
                     // LÓGICA DE COBRO MP UNITARIO
                     try {
                        const res = await fetch("/api/mercadopago/checkout", {
                           method:"POST", headers:{"Content-Type":"application/json"},
                           body: JSON.stringify({ userId: auth.currentUser?.uid || userDoc?.id || userDoc?.uid, userEmail: auth.currentUser?.email || userDoc?.email, price: 2990 })
                        });
                        const data = await res.json();
                        if (data.init_point) window.location.href = data.init_point;
                     } catch(err) { console.error(err); alert("Error abriendo caja de pago."); }
                  }}
                    className={`w-full py-4 rounded-[14px] font-black text-[14px] tracking-wide transition-all shadow-lg cursor-pointer bg-slate-900 border border-amber-400/50 text-white shadow-amber-400/10`}>
                    💳 Quitar Marca de Agua ($2990)
                  </button>
                )}
              </div>
            </div>
        </div>
        )}
      </form>

      {/* MODAL DE CAMBIAR PLANTILLA FOR TV */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-800">Elige plantilla para TV {activeScreenIndex + 1}</h3>
                <p className="text-sm text-slate-500 mt-1">Esta plantilla solo se aplicará a esta pantalla.</p>
              </div>
              <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {validLayouts?.map(l => {
                  const layoutUrl = l.urlStory || l.urlTv || l.url;
                  const isSelected = currentLayoutId === l.id;
                  return (
                    <button type="button" key={l.id} 
                      onClick={() => {
                        const newMenus = [...formData.menusByScreen];
                        newMenus[activeScreenIndex] = { ...newMenus[activeScreenIndex], layoutId: l.id };
                        setFormData({ ...formData, menusByScreen: newMenus });
                        setIsTemplateModalOpen(false);
                      }}
                      className={`relative rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border-[3px] group outline-none ${
                        formData.formato === 'tv_h' ? 'aspect-[16/9]' : (formData.formato === 'post' ? 'aspect-square' : 'aspect-[9/16]')
                      } ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[0.98]' : 'border-transparent hover:border-slate-300 hover:scale-[1.02] bg-white'}`}>
                      <img src={layoutUrl} alt={l.name} className="w-full h-full object-cover" loading="lazy" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs shadow-md">✓</div>
                      )}
                      {(() => {
                        const baseWidth = formData.formato === 'tv_h' ? 1920 : 1080;
                        const baseHeight = formData.formato === 'tv_h' ? 1080 : formData.formato === 'post' ? 1080 : 1920;
                        const localLayers = (formData.formato === 'story' || formData.formato === 'tv_v')
                          ? (l.defaultLayersVertical || l.layouts?.story?.layers)
                          : formData.formato === 'tv_h'
                            ? (l.defaultLayersHorizontal || l.layouts?.tv_h?.layers)
                            : (l.defaultLayersPost || l.layouts?.post?.layers) || l.layers;

                        if (!localLayers || localLayers.length === 0) return null;

                        return (
                          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" style={{ containerType: 'inline-size' }}>
                            <div style={{
                               position: 'absolute', top: 0, left: 0,
                               width: `${baseWidth}px`, height: `${baseHeight}px`,
                               transformOrigin: 'top left',
                               transform: `scale(calc(100cqi / ${baseWidth}))`
                            }}>
                              {localLayers.map((lyr: any) => {
                              const leftPct = lyr.posX !== undefined ? lyr.posX : (lyr.x / baseWidth) * 100;
                              const topPct = lyr.posY !== undefined ? lyr.posY : (lyr.y / baseHeight) * 100;
                              
                              let widthPct = "78%";
                              if (lyr.width) {
                                if (typeof lyr.width === 'string' && lyr.width.endsWith('%')) widthPct = lyr.width;
                                else if (typeof lyr.width === 'number' && lyr.width <= 100) widthPct = `${lyr.width}%`;
                                else widthPct = `${(Number(lyr.width) / baseWidth) * 100}%`;
                              } else {
                                if (lyr.type === 'image') widthPct = `${((lyr.fontSize || 300) / baseWidth) * 100}%`;
                                if (lyr.type === 'logo') widthPct = `${((lyr.fontSize || 100) / baseWidth) * 100}%`;
                              }
                              
                              let heightPct = "auto";
                              if (lyr.height) {
                                if (typeof lyr.height === 'string' && lyr.height.endsWith('%')) heightPct = lyr.height;
                                else if (typeof lyr.height === 'number' && lyr.height <= 100) heightPct = `${lyr.height}%`;
                                else heightPct = `${(Number(lyr.height) / baseHeight) * 100}%`;
                              } else if (lyr.type === 'image' || lyr.type === 'logo') {
                                heightPct = widthPct; 
                              }

                              return (
                                <div key={lyr.id} style={{
                                  position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`,
                                  width: widthPct, height: heightPct, transform: 'translate(-50%, -50%)',
                                  display: 'flex', alignItems: 'center',
                                  justifyContent: lyr.textAlign === 'center' ? 'center' : lyr.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                  fontFamily: lyr.fontFamily || 'Inter', fontWeight: lyr.fontWeight || '700',
                                }}>
                                  {lyr.type === 'text' && (
                                    <div style={{ width: '100%', color: lyr.color || '#fff', textAlign: lyr.textAlign || 'center',
                                      fontSize: `${lyr.fontSize || 60}px`, lineHeight: 1.1,
                                      textShadow: lyr.shadow !== false ? '0px 4px 16px rgba(0,0,0,0.8)' : 'none', whiteSpace: 'pre-wrap' }}>
                                      {lyr.text || 'Texto'}
                                    </div>
                                  )}
                                  {(lyr.type === 'image' || lyr.type === 'logo') && lyr.text && lyr.text.startsWith('http') && (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <img src={lyr.text} alt="img" style={{ maxWidth: '100%', maxHeight: '100%', width: lyr.type === 'logo' ? '100%' : 'auto', objectFit: 'contain', filter: lyr.shadow !== false ? 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' : 'none' }} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                    <div className={`absolute bottom-0 inset-x-0 p-3 flex flex-col justify-end min-h-[50%] bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                         <p className="text-white font-bold text-[11px] truncate">{l.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}