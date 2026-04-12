"use client";
import { useRef, useEffect, useState } from "react";
import { Rnd } from "react-rnd";

export type LayerType = "text" | "social" | "price" | "logo" | "image" | "badge";

export interface TextLayer {
  id: string;
  fieldKey?: string;
  type: LayerType;
  text: string;
  // posX y posY ya no representan un X/Y porcentual de arrastre centro, 
  // sino la posición base X/Y en el contenedor
  posX: number;
  posY: number;
  width?: number | string;
  height?: number | string;
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  fontFamily: string;
  shadow: boolean;
  badgeStyle?: number; 
}

// Solo 3 fuentes curadas para banners
export const FONT_OPTIONS = [
  { label: "Playfair Display", value: "'Playfair Display', serif", preview: "Playfair" },
  { label: "Pacifico", value: "Pacifico, cursive", preview: "Pacifico" },
  { label: "Syne", value: "Syne, sans-serif", preview: "Syne" },
] as const;

// ... Iconos
const IgIcon = ({ s, c }: { s: number; c: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);
const FbIcon = ({ s, c }: { s: number; c: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.39-4h-4.2V7a1 1 0 0 1 1-1h3z" /></svg>
);
const TkIcon = ({ s, c }: { s: number; c: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
);

function useImageColors(imageUrl: string) {
  const [colors, setColors] = useState(["#ffffff", "#f43f5e", "#fbbf24", "#34d399", "#60a5fa"]);
  const [fromImage, setFromImage] = useState(false);
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 80; c.height = Math.round(80 * img.naturalHeight / img.naturalWidth);
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const pts = [[0.15, 0.15], [0.85, 0.15], [0.5, 0.5], [0.15, 0.85], [0.85, 0.85]];
        const hex = pts.map(([px, py]) => {
          const d = ctx.getImageData(Math.round(px * c.width), Math.round(py * c.height), 1, 1).data;
          return `#${d[0].toString(16).padStart(2, "0")}${d[1].toString(16).padStart(2, "0")}${d[2].toString(16).padStart(2, "0")}`;
        });
        setColors(["#ffffff", ...hex.filter(h => h !== "#ffffff")].slice(0, 5));
        setFromImage(true);
      } catch { /* CORS fallback */ }
    };
  }, [imageUrl]);
  return { colors, fromImage };
}

export function createLayer(text = "Tu texto aquí"): TextLayer {
  return { id: Math.random().toString(36).slice(2), type: "text", text, posX: 30, posY: 30, width: 600, height: 120, fontSize: 90, color: "#000000", fontWeight: "bold", textAlign: "center", fontFamily: "'Playfair Display', serif", shadow: true, badgeStyle: 1 };
}

export function createImageLayer(url: string): TextLayer {
  return { id: Math.random().toString(36).slice(2), type: "image", text: url, posX: 20, posY: 30, width: 300, height: 300, fontSize: 300, color: "#000000", fontWeight: "normal", textAlign: "center", fontFamily: "sans-serif", shadow: false };
}

function LayerPreview({ layer, scale, containerW, isEditing, onTextChange, onFinishEdit, onImageClick }: { layer: TextLayer; scale: number; containerW: number; isEditing?: boolean; onTextChange?: (txt:string)=>void; onFinishEdit?: ()=>void; onImageClick?: ()=>void; }) {
  const fs = Math.max(8, layer.fontSize * scale);

  if (layer.type === "logo") {
    // Para logo, Rnd ya aplicó el ancho/alto estirando el div padre, 
    // así que interiormente solo ocupamos 100%. Usamos CSS puro para el padding/border-radius.
    return (
      <div style={{ background: "white", borderRadius: "12%", padding: "8%", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", display: "inline-block", width: "100%", height: "100%", cursor: "pointer" }} onClick={onImageClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={layer.text} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxWidth: "none" }} alt="Logo" draggable={false} />
      </div>
    );
  }
  
  if (layer.type === "image") {
    const w = layer.width || Math.max(50, (layer.fontSize || 300) * scale);
    const h = layer.height || w; // Estabilidad: si no hay h, usar el mismo que w
    return (
      <div style={{ display: "inline-block", position: "relative", width: w, height: h, cursor: "pointer" }} onClick={onImageClick}>
        <img src={layer.text} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxWidth: "none" }} alt="Custom Image" draggable={false} />
      </div>
    );
  }
  
  const baseStyle: React.CSSProperties = {
    fontFamily: layer.fontFamily, fontSize: `${fs}px`, color: layer.color, fontWeight: layer.fontWeight,
    textAlign: layer.textAlign, textShadow: layer.shadow ? "0 2px 6px rgba(0,0,0,0.95)" : "none",
    display: "block", whiteSpace: "pre-wrap", lineHeight: 1.2, userSelect: "none", width: "100%", height: "100%"
  };

  if (layer.type === "social") {
    const ico = fs * 0.9;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: `${fs * 0.3}px`, userSelect: "none", width: "100%", height: "100%" }}>
        {layer.fieldKey === "instagram" && <IgIcon s={ico} c={layer.color} />}
        {layer.fieldKey === "facebook" && <FbIcon s={ico} c={layer.color} />}
        {layer.fieldKey === "tiktok" && <TkIcon s={ico} c={layer.color} />}
        <span style={baseStyle}>{layer.text}</span>
      </div>
    );
  }
  if (layer.type === "price" || layer.type === "badge") {
    const bStyle = layer.badgeStyle || 1;
    let style: React.CSSProperties = {};
    const borderRadius = (layer.type === "badge" ? "20px" : "9999px"); // Simplified defaults

    if (bStyle === 1) style = { background: "linear-gradient(135deg,#f43f5e,#fb923c)", borderRadius: "9999px", boxShadow: "0 4px 16px rgba(244,63,94,0.4)" };
    else if (bStyle === 2) style = { background: "rgba(15,23,42,0.95)", border: `${fs * 0.04}px solid #fbbf24`, borderRadius: `${fs * 0.2}px`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" };
    else if (bStyle === 3) style = { background: "rgba(255,255,255,0.95)", borderRadius: "9999px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" };
    else if (bStyle === 4) style = { border: "2px dashed rgba(255,255,255,0.3)", borderRadius: "12px" };

    return (
      <div style={{ ...style, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {layer.type === "price" && (
          <span 
             contentEditable={isEditing} suppressContentEditableWarning
             onBlur={e => { if (onTextChange) onTextChange(e.currentTarget.textContent || ""); if (onFinishEdit) onFinishEdit(); }}
             onKeyDown={e => { if (e.key==='Enter') e.currentTarget.blur() }}
             style={{...baseStyle, textShadow: "none", outline: isEditing ? '2px dashed rgba(255,255,255,0.8)' : 'none', cursor: isEditing ? 'text' : 'inherit'}}
             ref={el => { if(isEditing && el) el.focus() }}>
             {layer.text}
          </span>
        )}
      </div>
    );
  }
  return (
    <span 
      contentEditable={isEditing} suppressContentEditableWarning
      onBlur={e => { if (onTextChange) onTextChange(e.currentTarget.textContent || ""); if (onFinishEdit) onFinishEdit(); }}
      onKeyDown={e => { if (e.key==='Enter') e.currentTarget.blur() }}
      style={{...baseStyle, display: "flex", outline: isEditing ? '2px dashed rgba(255,255,255,0.5)' : 'none', cursor: isEditing ? 'text' : 'inherit', alignItems: "center", justifyContent: layer.textAlign === "center" ? "center" : layer.textAlign === "right" ? "flex-end" : "flex-start"}}
      ref={el => { if(isEditing && el) el.focus() }}>
      {layer.text || "Texto..."}
    </span>
  );
}

const FIELD_LABELS: Record<string, string> = {
  nombreLocal: "Nombre del Local", titulo: "Título", precio: "Precio",
  mensaje: "Mensaje", instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", logo: "Logo",
};

interface Props {
  imageUrl: string;
  layers: TextLayer[];
  onLayersChange: (l: TextLayer[]) => void;
  activeLayerId: string | null;
  onSetActiveLayer: (id: string | null) => void;
  formato?: string;
  menuData?: { isMenuMode: boolean; menuItems: {name: string, price: string}[], scale?: number, bgColor?: string, posX?: number, posY?: number, width?: number, bgOpacity?: number, customZ?: number };
  onMenuChange?: (menu: any) => void;
  templateFonts?: string[];
  templateColors?: string[];
  customFontsList?: string[];
  onImageClick?: (layerId: string) => void;
  isStrictTemplateMode?: boolean;
}

export default function TextLayerEditor({ imageUrl, layers, onLayersChange, activeLayerId, onSetActiveLayer, formato = "story", menuData, onMenuChange, templateColors, templateFonts, onImageClick, isStrictTemplateMode = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(350);
  const [containerH, setContainerH] = useState(500); 
  const [hideHint, setHideHint] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const prevLayerIdsRef = useRef<Set<string>>(new Set());
  const { colors, fromImage } = useImageColors(imageUrl);
  const isPost = formato === "post";
  // Forzar 1/1 para post, 16/9 para tv_h, 9/16 para el resto (story, tv_v)
  const aspectRatio = isPost ? "1/1" : (formato === "tv_h" ? "16/9" : "9/16");

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => {
        setContainerW(e[0].contentRect.width);
        setContainerH(e[0].contentRect.height);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [imageUrl, formato]);

  const scale = containerW / 1080;

  // Detect newly added layers and flash-pulse them briefly
  useEffect(() => {
    const currentIds = new Set(layers.map(l => l.id));
    for (const id of Array.from(currentIds)) {
      if (!prevLayerIdsRef.current.has(id)) {
        setRecentlyAddedId(id);
        setTimeout(() => setRecentlyAddedId(null), 1200);
        break;
      }
    }
    prevLayerIdsRef.current = currentIds;
  }, [layers]);

  const upd = (id: string, p: Partial<TextLayer>) => onLayersChange(layers.map(l => l.id === id ? { ...l, ...p } : l));
  const del = (id: string) => { onLayersChange(layers.filter(l => l.id !== id)); if (activeLayerId === id) onSetActiveLayer(null); };
  const active = layers.find(l => l.id === activeLayerId);

  return (
    <div className="flex flex-col gap-3 h-full items-center justify-center w-full">
      <div ref={containerRef}
        className="relative rounded-[24px] overflow-hidden shadow-2xl border-4 border-slate-800/20 bg-slate-900 cursor-crosshair transition-all"
        style={{ 
          aspectRatio,
          maxHeight: "82vh",
          maxWidth: "100%",
          height: "100%",
          width: "auto"
        }}
        onClick={() => onSetActiveLayer(null)}>
        
        <img src={imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        
        <div style={{ position: "absolute", bottom: "1.5%", right: "2%", zIndex: 25, display: "flex", alignItems: "center", gap: `${containerW * 0.008}px`, pointerEvents: "none", opacity: 0.8 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: `${containerW * 0.026}px`, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.9)", lineHeight: 1 }}>hecho con amor ❤️ por digitalbite.app</span>
        </div>

        {layers.length === 0 && !hideHint && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="bg-black/60 relative backdrop-blur-sm text-white text-[12px] font-semibold px-5 py-3 rounded-2xl text-center leading-relaxed max-w-[70%] shadow-2xl">
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setHideHint(true); }}
                className="absolute -top-3 -right-3 w-7 h-7 bg-slate-800 hover:bg-rose-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg transition-colors border-2 border-slate-700 font-normal"
                title="Cerrar ayuda"
              >
                ✕
              </button>
              <span className="text-xl block mb-1">✏️</span>
              Usa los botones del editor para agregar texto, precio o imagen.<br/>
              <span className="text-white/60 text-[10px]">¡Luego arrástralos a donde quieras!</span>
            </div>
          </div>
        )}

        {/* ── MODO C: Menu Mode Preview (D&D via Rnd) ── */}
        {menuData?.isMenuMode && menuData.menuItems && menuData.menuItems.length > 0 && containerW > 0 && (() => {
          const menuDefs = [];
          if ((menuData as any).visible !== false) {
            menuDefs.push({ 
              id: 'menu-box', 
              list: menuData.menuItems, 
              posX: menuData.posX ?? 10, posY: menuData.posY ?? 20, 
              width: menuData.width, scale: menuData.scale ?? 1, 
              xKey: 'posX', yKey: 'posY', wKey: 'width', sKey: 'scale' 
            });
          }
          
          const items2 = (menuData as any).menuItems2 || [];
          if ((menuData as any).visible2 !== false && items2.some((i:any) => i.name || i.price)) {
             menuDefs.push({ 
               id: 'menu-box-2', list: items2, 
               posX: (menuData as any).posX2 ?? 40, posY: (menuData as any).posY2 ?? 20, 
               width: (menuData as any).width2, scale: (menuData as any).scale2 ?? 1, 
               xKey: 'posX2', yKey: 'posY2', wKey: 'width2', sKey: 'scale2' 
             });
          }
          
          const items3 = (menuData as any).menuItems3 || [];
          if ((menuData as any).visible3 !== false && items3.some((i:any) => i.name || i.price)) {
             menuDefs.push({ 
               id: 'menu-box-3', list: items3, 
               posX: (menuData as any).posX3 ?? 70, posY: (menuData as any).posY3 ?? 20, 
               width: (menuData as any).width3, scale: (menuData as any).scale3 ?? 1, 
               xKey: 'posX3', yKey: 'posY3', wKey: 'width3', sKey: 'scale3' 
             });
          }

          return (
            <>
              {menuDefs.map(def => {
                const s = scale * def.scale;
                const baseDefaultPct = formato === 'tv_h' ? 0.28 : 0.8;
                const defaultWidth = def.width ? (def.width * containerW / 100) : (containerW * baseDefaultPct * def.scale);
                let initX = (def.posX / 100) * containerW;
                let initY = (def.posY / 100) * containerH;
                const isActive = activeLayerId === def.id;
                
                const suff = def.id === 'menu-box-3' ? '3' : def.id === 'menu-box-2' ? '2' : '';
                const getV = (k: string, defaultVal?: any) => (menuData as any)[`${k}${suff}`] !== undefined ? (menuData as any)[`${k}${suff}`] : ((menuData as any)[k] !== undefined ? (menuData as any)[k] : defaultVal);
                
                const bgHex = getV('bgColor', "#0f172a");
                let r = 15, g = 23, b = 42;
                if (/^#[0-9A-F]{6}$/i.test(bgHex)) {
                  r = parseInt(bgHex.slice(1, 3), 16);
                  g = parseInt(bgHex.slice(3, 5), 16);
                  b = parseInt(bgHex.slice(5, 7), 16);
                }
                const localBgOpacity = getV('bgOpacity', 0.85);
                const localBgRgba = `rgba(${r},${g},${b},${localBgOpacity})`;

                return (
                  <Rnd
                    key={def.id}
                    position={{ x: initX, y: initY }}
                    size={{ width: defaultWidth, height: "auto" }}
                    onDragStart={(e) => { e.stopPropagation(); onSetActiveLayer(def.id); }}
                    onDragStop={(e, d) => {
                       if (onMenuChange) {
                         const newPx = (d.x / containerW) * 100;
                         const newPy = (d.y / containerH) * 100;
                         onMenuChange({ ...menuData, [def.xKey]: newPx, [def.yKey]: newPy });
                       }
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      if (onMenuChange) {
                        const newWidthPx = parseInt(ref.style.width);
                        const newWidthPct = (newWidthPx / containerW) * 100;
                        const newPx = (position.x / containerW) * 100;
                        const newPy = (position.y / containerH) * 100;
                        
                        // Adjust scale based on width change
                        const oldWidth = defaultWidth;
                        const newScale = (def.scale) * (newWidthPx / oldWidth);
                        
                        onMenuChange({ ...menuData, [def.xKey]: newPx, [def.yKey]: newPy, [def.wKey]: newWidthPct, [def.sKey]: newScale });
                      }
                    }}
                    enableResizing={{ 
                      top: false, right: true, bottom: false, left: false, 
                      topRight: true, bottomRight: true, bottomLeft: true, topLeft: true 
                    }}
                    disableDragging={!isActive}
                    z={menuData.customZ !== undefined ? menuData.customZ : (isActive ? 30 : 15)}
                    style={{
                       pointerEvents: "auto",
                       border: isActive ? "2px dashed #6366f1" : "1px solid transparent",
                       cursor: isActive ? "move" : "pointer",
                    }}
                    onClick={(e:any) => { e.stopPropagation(); onSetActiveLayer(def.id); }}
                  >
                    <div style={{ width: "100%", background: localBgRgba, backdropFilter: localBgOpacity > 0 ? "blur(20px)" : "none", borderRadius: 48 * s, border: localBgOpacity > 0 ? `2px solid rgba(255,255,255,0.1)` : "none", padding: `${64 * s}px ${48 * s}px`, color: "white", boxShadow: localBgOpacity > 0 ? "0 30px 60px rgba(0,0,0,0.5)" : "none", display: "flex", flexDirection: "column", gap: 24 * s, pointerEvents: "none" }}>
                      {def.list.filter((i: any) => i.name || i.price).map((item: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 * s, borderBottom: `2px dashed rgba(255,255,255,0.2)`, paddingBottom: 16 * s }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontFamily: getV('fontName', "Syne, sans-serif"), fontSize: 44 * s, fontWeight: 700, color: getV('colorName', "white"), paddingRight: 24 * s }}>{item.name || "Nombre del Producto"}</span>
                            <span style={{ fontFamily: getV('fontPrice', "'Playfair Display', serif"), fontSize: 48 * s, fontWeight: 900, color: getV('colorPrice', "#fbbf24"), flexShrink: 0 }}>{item.price || "$0.000"}</span>
                          </div>
                          <span style={{ fontFamily: getV('fontDesc', "Syne, sans-serif"), fontSize: 24 * s, color: getV('colorDesc', "rgba(255,255,255,0.7)"), fontWeight: 400, marginTop: -4 * s, textAlign: "left", alignSelf: "flex-start", paddingRight: 80 * s }}>
                            {item.desc || (item.name ? "" : "Descripción breve del producto que puede ocupar más de una línea si es necesario.")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Rnd>
                );
              })}
            </>
          );
        })()}

        {/* Mapeo de Rnd para DRAG & DROP con mouse */}
        {containerW > 0 && containerH > 0 && layers.map((layer, idx) => {
          // Convertimos las posiciones base (que vienen en %) a pixeles para react-rnd
          // Si el layer no ahs sido movido libremente desde el código legacy, su centro estaba en posX/posY
          // Hacemos una aproximación para posicionar inicialmente.
          
          let initX = (layer.posX / 100) * containerW;
          let initY = (layer.posY / 100) * containerH;
          
          // Por los estilos legacy, el drag center de CSS transform translation origin era 50,50
          const fs = Math.max(8, layer.fontSize * scale);
          let defaultWidth: any = layer.width;
          let defaultHeight: any = layer.height;

          // Estimamos dimensiones si no hay width/height.
          if (!defaultWidth) {
              if (layer.type === "logo") defaultWidth = Math.max(24, layer.fontSize * scale);
              else if (layer.type === "image") defaultWidth = Math.max(50, (layer.fontSize || 300) * scale);
              else defaultWidth = containerW * 0.78; // texto toma ancho relativo
          } else {
              if (typeof defaultWidth === 'string' && defaultWidth.endsWith('%')) defaultWidth = (parseFloat(defaultWidth) / 100) * containerW;
              else if (typeof defaultWidth === 'number' && defaultWidth <= 100) defaultWidth = (defaultWidth / 100) * containerW;
          }
          if (!defaultHeight) {
              if (layer.type === "logo" || layer.type === "image") defaultHeight = defaultWidth;
              else defaultHeight = fs * 2; // estimacion altura de texto
          } else {
              if (typeof defaultHeight === 'string' && defaultHeight.endsWith('%')) defaultHeight = (parseFloat(defaultHeight) / 100) * containerH;
              else if (typeof defaultHeight === 'number' && defaultHeight <= 100) defaultHeight = (defaultHeight / 100) * containerH;
          }

          // Ajustamos X,Y asumiendo que el legacy posX/Y era el CENTRO geométrico, pero RND usa Top-Left.
          initX = initX - ((defaultWidth as number) / 2);
          initY = initY - ((defaultHeight as number) / 2);

          const isActive = activeLayerId === layer.id;

          return (
            <Rnd
              key={layer.id}
              position={{ x: initX, y: initY }}
              size={{ width: defaultWidth || "auto", height: defaultHeight || "auto" }}
              onDragStart={(e) => { e.stopPropagation(); onSetActiveLayer(layer.id); }}
              onDragStop={(e, d) => {
                 // RND positions Top-Left. Re-save as Geometric Center for mathematical stability across render targets.
                 const rawCenterX = d.x + ((defaultWidth as number) / 2);
                 const rawCenterY = d.y + ((defaultHeight as number) / 2);
                 const newPx = (rawCenterX / containerW) * 100;
                 const newPy = (rawCenterY / containerH) * 100;
                 
                 const updW = `${(Number(defaultWidth) / containerW) * 100}%`;
                 const updH = `${(Number(defaultHeight) / containerH) * 100}%`;

                 upd(layer.id, { posX: newPx, posY: newPy, width: updW, height: updH });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const newWidthPx = parseInt(ref.style.width);
                const newHeightPx = parseInt(ref.style.height);
                
                const rawCenterX = position.x + (newWidthPx / 2);
                const rawCenterY = position.y + (newHeightPx / 2);
                
                const newPx = (rawCenterX / containerW) * 100;
                const newPy = (rawCenterY / containerH) * 100;
                const newWidthPct = `${(newWidthPx / containerW) * 100}%`;
                const newHeightPct = `${(newHeightPx / containerH) * 100}%`;
                
                let addProps: any = {};
                if (layer.type === "text" || layer.type === "price" || layer.type === "social") {
                    addProps.fontSize = (newHeightPx / scale) * 0.7; 
                } else {
                    addProps.fontSize = (newWidthPx / scale);
                }
                upd(layer.id, { posX: newPx, posY: newPy, width: newWidthPct, height: newHeightPct, ...addProps });
              }}
              enableResizing={isStrictTemplateMode || layer.type !== "logo" ? false : {
                  top:false, right:false, bottom:false, left:false, 
                  topRight: isActive,
                  bottomRight: isActive, 
                  bottomLeft: isActive, 
                  topLeft: isActive 
              }}
              disableDragging={isStrictTemplateMode || !isActive || layer.type !== "logo"}
              style={{
                 zIndex: 10 + idx,
                 pointerEvents: "auto",
                 border: isActive ? (isStrictTemplateMode ? "2px solid #f43f5e" : "2px dashed #f43f5e") : (recentlyAddedId === layer.id ? "2px solid #6366f1" : "1px solid transparent"),
                 cursor: isStrictTemplateMode || layer.type !== "logo" ? "pointer" : (isActive ? "move" : "pointer"),
                 boxShadow: recentlyAddedId === layer.id && !isActive ? "0 0 0 4px rgba(99,102,241,0.35)" : "none",
                 transition: "box-shadow 0.3s ease, border 0.3s ease",
              }}
              onClick={(e:any) => { e.stopPropagation(); onSetActiveLayer(layer.id); }}
              onDoubleClick={(e:any) => {
                 e.stopPropagation();
                 if (layer.type !== "image" && layer.type !== "logo" && layer.type !== "badge") {
                    setEditingLayerId(layer.id);
                 } else if (layer.type === "image" && onImageClick) {
                    onImageClick(layer.id);
                 }
              }}
            >
              <LayerPreview 
                 layer={layer} scale={scale} containerW={containerW} 
                 isEditing={editingLayerId === layer.id}
                 onTextChange={(txt) => upd(layer.id, { text: txt })}
                 onFinishEdit={() => setEditingLayerId(null)}
                 onImageClick={(e?: any) => { e?.stopPropagation?.(); onSetActiveLayer(layer.id); if(onImageClick) { onImageClick(layer.id); } }}
              />
              {isActive && !isStrictTemplateMode && layer.type !== "image" && (
                  <button title="Borrar Capa" onClick={(e) => {
                      e.stopPropagation();
                      onLayersChange(layers.filter(l => l.id !== layer.id));
                      if (activeLayerId === layer.id) onSetActiveLayer(null);
                  }} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform z-50">✕</button>
              )}
            </Rnd>
          );
        })}
      </div>


    </div>
  );
}

export function ActiveLayerPropertiesPanel({
  layers,
  onLayersChange,
  activeLayerId,
  onSetActiveLayer,
  templateFonts,
  templateColors,
  fromImage = false,
  customFonts,
  menuData,
  onMenuChange
}: {
  layers: TextLayer[];
  onLayersChange: (layers: TextLayer[]) => void;
  activeLayerId: string | null;
  onSetActiveLayer: (id: string | null) => void;
  templateFonts?: string[];
  templateColors?: string[];
  fromImage?: boolean;
  customFonts?: { name: string; url: string }[];
  menuData?: any;
  onMenuChange?: (menu: any) => void;
}) {
  if (activeLayerId?.startsWith('menu-box') && menuData && onMenuChange) {
      const isMenu = true;
      const updMenu = (updates: any) => onMenuChange({ ...menuData, ...updates });
      
      const suff = activeLayerId === 'menu-box-3' ? '3' : activeLayerId === 'menu-box-2' ? '2' : '';
      const mData = menuData as any;
      const getV = (k: string, defaultVal?: any) => mData[`${k}${suff}`] !== undefined ? mData[`${k}${suff}`] : (mData[k] !== undefined ? mData[k] : defaultVal);
      const updM = (k: string, v: any) => updMenu({ [`${k}${suff}`]: v });
      
      return (
        <div className="w-full flex flex-col gap-4 mt-4">
           {/* TEXTO DE MUESTRA */}
           <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm w-full">
             <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Textos de Prueba</span>
             </div>
             <p className="text-[10px] text-slate-500 mb-3 leading-tight">Edita estos textos para ver cómo quedará la plantilla final con datos reales.</p>
             
             <div className="flex flex-col gap-2">
                <input type="text" value={getV('menuItems')?.[0]?.name || ""} onChange={e => {
                   const newItems = [...(getV('menuItems') || [])];
                   if(!newItems[0]) newItems[0] = {};
                   newItems[0].name = e.target.value;
                   updM('menuItems', newItems);
                }} placeholder="Nombre del Producto" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" />
                
                <input type="text" value={getV('menuItems')?.[0]?.price || ""} onChange={e => {
                   const newItems = [...(getV('menuItems') || [])];
                   if(!newItems[0]) newItems[0] = {};
                   newItems[0].price = e.target.value;
                   updM('menuItems', newItems);
                }} placeholder="/ Precio" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 focus:bg-white" />
                
                <textarea value={getV('menuItems')?.[0]?.desc || ""} onChange={e => {
                   const newItems = [...(getV('menuItems') || [])];
                   if(!newItems[0]) newItems[0] = {};
                   newItems[0].desc = e.target.value;
                   updM('menuItems', newItems);
                }} placeholder="Descripción" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs resize-none" />
             </div>
           </div>

           {/* TARJETA DE MENÚ (Fondo) */}
           <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm w-full">
             <div className="flex items-center gap-2 mb-3 justify-between">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Tarjeta y Fondo</span>
                <div className="flex items-center">
                  <button type="button" 
                    onClick={() => updMenu({ customZ: Math.max(1, (menuData.customZ || 15) - 3) })} 
                    className="text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 rounded-l-full transition-colors border border-slate-200 border-r-0" title="Enviar capa más atrás">
                    {"↓"} Atrás
                  </button>
                  <button type="button" 
                    onClick={() => updMenu({ customZ: Math.min(50, (menuData.customZ || 15) + 3) })} 
                    className="text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 rounded-r-full transition-colors border border-slate-200" title="Traer capa al frente">
                    {"↑"} Frente
                  </button>
                </div>
             </div>
             <div className="flex gap-4">
                 <div className="w-1/3">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">Color</label>
                    <input type="color" value={getV('bgColor', "#0f172a")} onChange={e => updM('bgColor', e.target.value)} className="w-full h-8 rounded-lg cursor-pointer p-0.5 border border-slate-200" />
                 </div>
                 <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center justify-between mb-1">
                      <span>Transparencia</span>
                      <span className="text-amber-500 font-mono text-xs">{Math.round(getV('bgOpacity', 0.85)*100)}%</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.01" value={getV('bgOpacity', 0.85)} onChange={e => updM('bgOpacity', parseFloat(e.target.value))} className="w-full accent-amber-500" />
                 </div>
             </div>
           </div>

           {/* TIPOGRAFIA */}
           <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm w-full flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Tipografías del Menú</span>
              </div>
              
              {/* Fuente Nombre */}
              <div>
                 <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1.5 flex justify-between">
                    <span>Nombre del Plato</span>
                    <input type="color" value={getV('colorName', "#ffffff")} onChange={e => updM('colorName', e.target.value)} className="w-4 h-4 rounded p-0 border-0 cursor-pointer" />
                 </label>
                 <div className="flex gap-1.5 flex-wrap w-full">
                   {templateFonts?.map(f => {
                      const val = f.includes(" ") ? `'${f}'` : f;
                      const active = getV('fontName') === val || (!getV('fontName') && val.includes("Syne"));
                      return <button key={f} type="button" onClick={() => updM('fontName', val)} className={`flex-1 min-w-[30%] py-1.5 rounded-lg text-[11px] border-2 ${active ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`} style={{ fontFamily: val }}>{f}</button>;
                   })}
                   {(!templateFonts || templateFonts.length === 0) && FONT_OPTIONS.map(f => (
                     <button key={f.value} type="button" onClick={() => updM('fontName', f.value)} className={`flex-1 py-1.5 rounded-lg text-[11px] border-2 ${getV('fontName') === f.value || (!getV('fontName') && f.value.includes("Syne")) ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600"}`} style={{ fontFamily: f.value }}>{f.preview}</button>
                   ))}
                 </div>
              </div>
              
              {/* Fuente Precio */}
              <div>
                 <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1.5 flex justify-between">
                    <span>Precio</span>
                    <input type="color" value={getV('colorPrice', "#fbbf24")} onChange={e => updM('colorPrice', e.target.value)} className="w-4 h-4 rounded p-0 border-0 cursor-pointer" />
                 </label>
                 <div className="flex gap-1.5 flex-wrap w-full">
                   {templateFonts?.map(f => {
                      const val = f.includes(" ") ? `'${f}'` : f;
                      const active = getV('fontPrice') === val || (!getV('fontPrice') && val.includes("Playfair"));
                      return <button key={f} type="button" onClick={() => updM('fontPrice', val)} className={`flex-1 min-w-[30%] py-1.5 rounded-lg text-[11px] border-2 ${active ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`} style={{ fontFamily: val }}>{f}</button>;
                   })}
                   {(!templateFonts || templateFonts.length === 0) && FONT_OPTIONS.map(f => (
                     <button key={f.value} type="button" onClick={() => updM('fontPrice', f.value)} className={`flex-1 py-1.5 rounded-lg text-[11px] border-2 ${getV('fontPrice') === f.value || (!getV('fontPrice') && f.value.includes("Playfair")) ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600"}`} style={{ fontFamily: f.value }}>{f.preview}</button>
                   ))}
                 </div>
              </div>

              {/* Fuente Descripcion */}
              <div>
                 <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1.5 flex justify-between">
                    <span>Descripción</span>
                    <input type="color" value={getV('colorDesc', "rgba(255,255,255,0.7)")} onChange={e => updM('colorDesc', e.target.value)} className="w-4 h-4 rounded p-0 border-0 cursor-pointer" />
                 </label>
                 <div className="flex gap-1.5 flex-wrap w-full">
                   {templateFonts?.map(f => {
                      const val = f.includes(" ") ? `'${f}'` : f;
                      const active = getV('fontDesc') === val || (!getV('fontDesc') && val.includes("Syne"));
                      return <button key={f} type="button" onClick={() => updM('fontDesc', val)} className={`flex-1 min-w-[30%] py-1.5 rounded-lg text-[11px] border-2 ${active ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`} style={{ fontFamily: val }}>{f}</button>;
                   })}
                   {(!templateFonts || templateFonts.length === 0) && FONT_OPTIONS.map(f => (
                     <button key={f.value} type="button" onClick={() => updM('fontDesc', f.value)} className={`flex-1 py-1.5 rounded-lg text-[11px] border-2 ${getV('fontDesc') === f.value || (!getV('fontDesc') && f.value.includes("Syne")) ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600"}`} style={{ fontFamily: f.value }}>{f.preview}</button>
                   ))}
                 </div>
              </div>

           </div>
        </div>
      )
  }

  const active = layers.find(l => l.id === activeLayerId);
  if (!active) return null;

  const upd = (id: string, updates: Partial<TextLayer>) => onLayersChange(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  const del = (id: string) => { onLayersChange(layers.filter(l => l.id !== id)); onSetActiveLayer(null); };

  return (
    <div className="w-full flex flex-col gap-3 mt-4">
      {/* Panel de edición para TEXTO, SOCIAL, PRECIO */}
      {(active.type === "text" || active.type === "social" || active.type === "price") && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Editar Capa</span>
              {active.fieldKey && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{FIELD_LABELS[active.fieldKey]}</span>}
            </div>
            <div className="flex items-center">
              <button type="button" 
                onClick={() => {
                  const idx = layers.findIndex(l => l.id === active.id);
                  if (idx > 0) {
                     const newL = [...layers];
                     [newL[idx - 1], newL[idx]] = [newL[idx], newL[idx - 1]];
                     onLayersChange(newL);
                  }
                }} 
                className="text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 rounded-l-full transition-colors border border-slate-200 border-r-0" title="Enviar capa más atrás">
                {"↓"} Atrás
              </button>
              <button type="button" 
                onClick={() => {
                  const idx = layers.findIndex(l => l.id === active.id);
                  if (idx < layers.length - 1) {
                     const newL = [...layers];
                     [newL[idx], newL[idx + 1]] = [newL[idx + 1], newL[idx]];
                     onLayersChange(newL);
                  }
                }} 
                className={`text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 transition-colors border border-slate-200 ${!active.fieldKey ? 'border-r-0' : 'rounded-r-full'}`} title="Traer capa al frente">
                {"↑"} Frente
              </button>
              {!active.fieldKey && (
                <button type="button" onClick={() => del(active.id)} className="text-[10px] font-bold text-red-400 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-r-full transition-colors border border-red-100">🗑</button>
              )}
            </div>
          </div>
          {!active.fieldKey && (
            <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-800 resize-none focus:outline-none focus:border-rose-400 mb-3" rows={2}
              value={active.text} onChange={e => upd(active.id, { text: e.target.value })} placeholder="Escribe el texto..." />
          )}

          {active.type !== "social" && (
            <>
              <div className="mb-3 w-full">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center justify-between w-full mb-1.5">
                <span>Fuente</span>
                {templateFonts && templateFonts.length > 0 && <span className="text-rose-400 normal-case">(Estilo de plantilla)</span>}
              </label>
              <div className="flex gap-2 flex-wrap w-full">
                {templateFonts?.map(f => {
                   const val = f.includes(" ") ? `'${f}'` : f;
                   return (
                     <button key={f} type="button" onClick={() => upd(active.id, { fontFamily: val })}
                        className={`flex-1 min-w-[30%] py-2.5 rounded-xl text-[13px] border-2 transition-all ${active.fontFamily === val || active.fontFamily.includes(f) ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"}`}
                        style={{ fontFamily: val, fontWeight: "bold" }}>{f}</button>
                   );
                })}
                {customFonts?.map(cf => {
                   const val = cf.name.includes(" ") ? `'${cf.name}'` : cf.name;
                   return (
                     <button key={cf.name} type="button" onClick={() => upd(active.id, { fontFamily: val })}
                        className={`flex-1 min-w-[30%] py-2.5 flex items-center justify-center gap-1 rounded-xl text-[13px] border-2 transition-all ${active.fontFamily === val || active.fontFamily.includes(cf.name) ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"}`}
                        style={{ fontFamily: val, fontWeight: "bold" }}>{cf.name} <span aria-hidden="true" className="text-[10px]">✨</span></button>
                   );
                })}
                {(!templateFonts || templateFonts.length === 0) && FONT_OPTIONS.map(f => (
                  <button key={f.value} type="button" onClick={() => upd(active.id, { fontFamily: f.value })}
                    className={`flex-1 py-3 rounded-xl text-[14px] border-2 transition-all ${active.fontFamily === f.value ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"}`}
                    style={{ fontFamily: f.value, fontWeight: "bold" }}>{f.preview}</button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center justify-between w-full mb-1">
                <span>Tamaño de Texto</span>
                <span className="text-rose-500 font-mono text-xs">{Math.round(active.fontSize)}px</span>
              </label>
              <input 
                 type="range" min="10" max="400" step="2"
                 value={active.fontSize}
                 onChange={e => upd(active.id, { fontSize: parseInt(e.target.value) })}
                 className="w-full accent-rose-500" 
              />
              </div>
            </>
          )}

          {/* Color Section */}
          <div className="w-full">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">
              Color {(fromImage || (templateColors && templateColors.length > 0)) && <span className="text-rose-400 normal-case">(de plantilla)</span>}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {templateColors?.map((c, i) => (
                <button key={`tpl-${i}`} type="button" onClick={() => upd(active.id, { color: c })}
                  className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 shadow-sm"
                  style={{ background: c, borderColor: active.color === c ? "#f43f5e" : "rgba(0,0,0,0.1)" }} title={c} />
              ))}
              
              {(!templateColors || templateColors.length === 0) && (
                <div className="flex items-center gap-2">
                  <input type="color" value={active.color} onChange={e => upd(active.id, { color: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                  <span className="text-[10px] text-slate-400">Sin colores definidos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Panel de edición simplificado para LOGO e IMAGEN */}
      {(active.type === "image" || active.type === "logo") && (
         <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm w-full">
           <div className="flex items-center justify-between mb-0">
             <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{active.type === "image" ? (active.fieldKey === "precio" ? "Precio" : "Producto") : "Logo"}</span>
             </div>
             <div className="flex items-center">
               <button type="button" 
                 onClick={() => {
                   const idx = layers.findIndex(l => l.id === active.id);
                   if (idx > 0) {
                      const newL = [...layers];
                      [newL[idx - 1], newL[idx]] = [newL[idx], newL[idx - 1]];
                      onLayersChange(newL);
                   }
                 }} 
                 className="text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 rounded-l-full transition-colors border border-slate-200 border-r-0" title="Enviar capa más atrás">
                 {"↓"} Atrás
               </button>
               <button type="button" 
                 onClick={() => {
                   const idx = layers.findIndex(l => l.id === active.id);
                   if (idx < layers.length - 1) {
                      const newL = [...layers];
                      [newL[idx], newL[idx + 1]] = [newL[idx + 1], newL[idx]];
                      onLayersChange(newL);
                   }
                 }} 
                 className={`text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 transition-colors border border-slate-200 ${!active.fieldKey && active.type !== "image" ? 'border-r-0' : 'rounded-r-full'}`} title="Traer capa al frente">
                 {"↑"} Frente
               </button>
               {!active.fieldKey && active.type !== "image" && (
                  <button type="button" onClick={() => del(active.id)} className="text-[10px] font-bold text-red-400 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-r-full transition-colors border border-red-100">🗑</button>
               )}
             </div>
           </div>
         </div>
      )}

      {/* Panel de edición simplificado para BADGE */}
      {active.type === "badge" && (
         <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm w-full">
           <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Editar Fondo / Badge</span>
             </div>
             <button type="button" onClick={() => del(active.id)} className="text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors">🗑 Eliminar</button>
           </div>
           
           <div className="mb-0">
             <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1.5">Estilo de Fondo</label>
             <div className="flex gap-2">
               <button type="button" onClick={() => upd(active.id, { badgeStyle: 1 })} className={`flex-1 py-2 text-[11px] font-bold rounded-lg border-2 transition-all ${active.badgeStyle === 1 || !active.badgeStyle ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"}`}>Naranjo</button>
               <button type="button" onClick={() => upd(active.id, { badgeStyle: 2 })} className={`flex-1 py-2 text-[11px] font-bold rounded-lg border-2 transition-all ${active.badgeStyle === 2 ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"}`}>Oscuro</button>
               <button type="button" onClick={() => upd(active.id, { badgeStyle: 3 })} className={`flex-1 py-2 text-[11px] font-bold rounded-lg border-2 transition-all ${active.badgeStyle === 3 ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"}`}>Blanco</button>
               <button type="button" onClick={() => upd(active.id, { badgeStyle: 4 })} className={`flex-1 py-2 text-[11px] font-bold rounded-lg border-2 transition-all ${active.badgeStyle === 4 ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"}`}>Borde</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}