"use client";
import { useRef, useEffect, useState } from "react";
import { Rnd } from "react-rnd";

export type LayerType = "text" | "social" | "price" | "logo" | "image" | "badge";

export interface TextLayer {
  id: string;
  fieldKey?: string;
  type: LayerType;
  text: string;
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

export const FONT_OPTIONS = [
  { label: "Playfair Display", value: "'Playfair Display', serif", preview: "Playfair" },
  { label: "Pacifico", value: "Pacifico, cursive", preview: "Pacifico" },
  { label: "Syne", value: "Syne, sans-serif", preview: "Syne" },
] as const;

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
  return { id: Math.random().toString(36).slice(2), type: "image", text: url, posX: 50, posY: 55, width: "40%", height: "40%", fontSize: 432, color: "#000000", fontWeight: "normal", textAlign: "center", fontFamily: "sans-serif", shadow: false };
}

function LayerPreview({ layer, scale, containerW, isEditing, onTextChange, onFinishEdit, onImageClick }: { layer: TextLayer; scale: number; containerW: number; isEditing?: boolean; onTextChange?: (txt:string)=>void; onFinishEdit?: ()=>void; onImageClick?: ()=>void; }) {
  const fs = Math.max(8, layer.fontSize * scale);

  if (layer.type === "logo") {
    return (
      <div style={{ background: "white", borderRadius: "12%", padding: "8%", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", display: "inline-block", width: "100%", height: "100%", cursor: "pointer" }} onClick={onImageClick}>
        <img src={layer.text} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxWidth: "none" }} alt="Logo" draggable={false} />
      </div>
    );
  }
  
  if (layer.type === "image") {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={onImageClick}>
        <img src={layer.text} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxWidth: "none", filter: layer.shadow ? "drop-shadow(0 15px 30px rgba(0,0,0,0.4))" : "none" }} alt="Imagen" draggable={false} />
      </div>
    );
  }

  if (layer.type === "badge") {
    const bgMap: Record<number, string> = {
      1: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      2: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      3: "#ffffff",
      4: "transparent"
    };
    const brMap: Record<number, string> = { 1: "none", 2: "none", 3: "none", 4: "2px solid rgba(255,255,255,0.4)" };
    return <div style={{ width: "100%", height: "100%", background: bgMap[layer.badgeStyle || 1], border: brMap[layer.badgeStyle || 1], borderRadius: "40px", boxShadow: layer.badgeStyle === 4 ? "none" : "0 10px 40px rgba(0,0,0,0.2)" }} />;
  }

  const commonStyle: any = {
    color: layer.color,
    fontFamily: layer.fontFamily,
    fontSize: `${fs}px`,
    fontWeight: layer.fontWeight,
    textAlign: layer.textAlign,
    textShadow: layer.shadow ? (layer.type === 'price' ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 15px rgba(0,0,0,0.3)") : "none",
    width: "100%",
    lineHeight: 1.1,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    cursor: "text"
  };

  if (isEditing) {
    return (
      <textarea
        autoFocus
        value={layer.text}
        onChange={(e) => onTextChange?.(e.target.value)}
        onBlur={onFinishEdit}
        style={{ ...commonStyle, background: "rgba(255,255,255,0.1)", border: "none", outline: "none", resize: "none" }}
      />
    );
  }

  return <div style={commonStyle} onClick={onImageClick}>{layer.text}</div>;
}

const FIELD_LABELS: Record<string, string> = {
  "producto": "Producto Auto",
  "precio": "Precio Auto",
  "linea": "Línea Decor.",
  "nombre": "Nombre Com.",
  "desc": "Descripción",
  "precio_t": "Precio Texto"
};

export function ActiveLayerPropertiesPanel({ layers, onLayersChange, activeLayerId, onSetActiveLayer, templateFonts, templateColors, customFonts }: { layers: TextLayer[]; onLayersChange: (ls: TextLayer[]) => void; activeLayerId: string; onSetActiveLayer: (id: string | null) => void; templateFonts?: string[]; templateColors?: string[]; customFonts?: any[]; }) {
  
  if (activeLayerId === 'menu') {
      const menuData = (layers as any)._menuData;
      const onMenuChange = (layers as any)._onMenuChange;
      if (!onMenuChange) return null;
      
      const updMenu = (upd: any) => onMenuChange({ ...menuData, ...upd });
      const getV = (k: string, def?: any) => menuData[k] !== undefined ? menuData[k] : def;
      const updM = (k: string, v: any) => updMenu({ [k]: v });

      return (
        <div className="w-full flex flex-col gap-4 mt-4">
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

            <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm w-full">
              <div className="flex items-center gap-2 mb-3 justify-between">
                 <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Tarjeta y Fondo</span>
                 <div className="flex items-center">
                   <button type="button" onClick={() => updMenu({ customZ: Math.max(1, (menuData.customZ || 15) - 3) })} className="text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 rounded-l-full transition-colors border border-slate-200 border-r-0">{"↓"} Atrás</button>
                   <button type="button" onClick={() => updMenu({ customZ: Math.min(50, (menuData.customZ || 15) + 3) })} className="text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-2.5 py-1.5 rounded-r-full transition-colors border border-slate-200">{"↑"} Frente</button>
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

            <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm w-full flex flex-col gap-4">
               <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Tipografías del Menú</span>
               </div>
               
               <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1.5 flex justify-between">
                     <span>Nombre del Plato</span>
                     <input type="color" value={getV('colorName', "#ffffff")} onChange={e => updM('colorName', e.target.value)} className="w-4 h-4 rounded p-0 border-0 cursor-pointer" />
                  </label>
                  <div className="flex gap-1.5 flex-wrap w-full">
                    {templateFonts && templateFonts.length > 0 ? (
                      templateFonts.map(f => {
                         const val = f.includes(" ") ? `'${f}'` : f;
                         const active = getV('fontName') === val || (!getV('fontName') && val.includes("Syne"));
                         return <button key={f} type="button" onClick={() => updM('fontName', val)} className={`flex-1 min-w-[30%] py-1.5 rounded-lg text-[11px] border-2 ${active ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`} style={{ fontFamily: val }}>{f}</button>;
                      })
                    ) : (
                      FONT_OPTIONS.map(f => (
                        <button key={f.value} type="button" onClick={() => updM('fontName', f.value)} className={`flex-1 py-1.5 rounded-lg text-[11px] border-2 ${getV('fontName') === f.value || (!getV('fontName') && f.value.includes("Syne")) ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600"}`} style={{ fontFamily: f.value }}>{f.preview}</button>
                      ))
                    )}
                  </div>
               </div>
               
               <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1.5 flex justify-between">
                     <span>Precio</span>
                     <input type="color" value={getV('colorPrice', "#fbbf24")} onChange={e => updM('colorPrice', e.target.value)} className="w-4 h-4 rounded p-0 border-0 cursor-pointer" />
                  </label>
                  <div className="flex gap-1.5 flex-wrap w-full">
                    {templateFonts && templateFonts.length > 0 ? (
                      templateFonts.map(f => {
                         const val = f.includes(" ") ? `'${f}'` : f;
                         const active = getV('fontPrice') === val || (!getV('fontPrice') && val.includes("Playfair"));
                         return <button key={f} type="button" onClick={() => updM('fontPrice', val)} className={`flex-1 min-w-[30%] py-1.5 rounded-lg text-[11px] border-2 ${active ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`} style={{ fontFamily: val }}>{f}</button>;
                      })
                    ) : (
                      FONT_OPTIONS.map(f => (
                        <button key={f.value} type="button" onClick={() => updM('fontPrice', f.value)} className={`flex-1 py-1.5 rounded-lg text-[11px] border-2 ${getV('fontPrice') === f.value || (!getV('fontPrice') && f.value.includes("Playfair")) ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600"}`} style={{ fontFamily: f.value }}>{f.preview}</button>
                      ))
                    )}
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1.5 flex justify-between">
                     <span>Descripción</span>
                     <input type="color" value={getV('colorDesc', "rgba(255,255,255,0.7)")} onChange={e => updM('colorDesc', e.target.value)} className="w-4 h-4 rounded p-0 border-0 cursor-pointer" />
                  </label>
                  <div className="flex gap-1.5 flex-wrap w-full">
                    {templateFonts && templateFonts.length > 0 ? (
                      templateFonts.map(f => {
                         const val = f.includes(" ") ? `'${f}'` : f;
                         const active = getV('fontDesc') === val || (!getV('fontDesc') && val.includes("Syne"));
                         return <button key={f} type="button" onClick={() => updM('fontDesc', val)} className={`flex-1 min-w-[30%] py-1.5 rounded-lg text-[11px] border-2 ${active ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`} style={{ fontFamily: val }}>{f}</button>;
                      })
                    ) : (
                      FONT_OPTIONS.map(f => (
                        <button key={f.value} type="button" onClick={() => updM('fontDesc', f.value)} className={`flex-1 py-1.5 rounded-lg text-[11px] border-2 ${getV('fontDesc') === f.value || (!getV('fontDesc') && f.value.includes("Syne")) ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 bg-white text-slate-600"}`} style={{ fontFamily: f.value }}>{f.preview}</button>
                      ))
                    )}
                  </div>
               </div>
            </div>
        </div>
      );
  }

  const active = layers.find(l => l.id === activeLayerId);
  if (!active) return null;

  const upd = (id: string, updates: Partial<TextLayer>) => onLayersChange(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  const del = (id: string) => { onLayersChange(layers.filter(l => l.id !== id)); onSetActiveLayer(null); };

  return (
    <div className="w-full flex flex-col gap-3 mt-4">
      {(active.type === "text" || active.type === "social" || active.type === "price") && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Editar Capa</span>
              {active.fieldKey && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{FIELD_LABELS[active.fieldKey]}</span>}
            </div>
            <div className="flex items-center">
               <button type="button" onClick={() => { const idx = layers.findIndex(l => l.id === active.id); if (idx > 0) { const newL = [...layers]; [newL[idx - 1], newL[idx]] = [newL[idx], newL[idx - 1]]; onLayersChange(newL); } }} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-l-lg hover:bg-slate-50">↓</button>
               <button type="button" onClick={() => { const idx = layers.findIndex(l => l.id === active.id); if (idx < layers.length - 1) { const newL = [...layers]; [newL[idx], newL[idx + 1]] = [newL[idx + 1], newL[idx]]; onLayersChange(newL); } }} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 border-l-0 px-2 py-1 rounded-r-lg hover:bg-slate-50">↑</button>
               {!active.fieldKey && <button type="button" onClick={() => del(active.id)} className="ml-2 text-red-500">🗑</button>}
            </div>
          </div>
          {!active.fieldKey && <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-800 resize-none focus:border-rose-400 mb-3" rows={2} value={active.text} onChange={e => upd(active.id, { text: e.target.value })} />}

          {active.type !== "social" && (
            <>
              <div className="mb-3 w-full">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center justify-between w-full mb-1.5">
                  <span>Fuente</span>
                </label>
                <div className="flex gap-2 flex-wrap w-full">
                  {templateFonts && templateFonts.length > 0 ? (
                    templateFonts.map(f => {
                       const val = f.includes(" ") ? `'${f}'` : f;
                       return <button key={f} type="button" onClick={() => upd(active.id, { fontFamily: val })} className={`flex-1 min-w-[30%] py-2.5 rounded-xl text-[13px] border-2 ${active.fontFamily === val || active.fontFamily.includes(f) ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm" : "border-slate-200 bg-white text-slate-700"}`} style={{ fontFamily: val, fontWeight: "bold" }}>{f}</button>;
                    })
                  ) : (
                    <>
                      {customFonts?.map(cf => {
                        const val = cf.name.includes(" ") ? `'${cf.name}'` : cf.name;
                        return <button key={cf.name} type="button" onClick={() => upd(active.id, { fontFamily: val })} className={`flex-1 min-w-[30%] py-2.5 flex items-center justify-center gap-1 rounded-xl text-[13px] border-2 ${active.fontFamily === val || active.fontFamily.includes(cf.name) ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm" : "border-slate-200 bg-white text-slate-700"}`} style={{ fontFamily: val, fontWeight: "bold" }}>{cf.name} ✨</button>;
                      })}
                      {FONT_OPTIONS.map(f => <button key={f.value} type="button" onClick={() => upd(active.id, { fontFamily: f.value })} className={`flex-1 py-3 rounded-xl text-[14px] border-2 ${active.fontFamily === f.value ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm" : "border-slate-200 bg-white text-slate-700"}`} style={{ fontFamily: f.value, fontWeight: "bold" }}>{f.preview}</button>)}
                    </>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center justify-between w-full mb-1">
                  <span>Tamaño</span>
                  <span className="text-rose-500 font-mono text-xs">{active.fontSize}px</span>
                </label>
                <input type="range" min="10" max="400" step="2" value={active.fontSize} onChange={e => upd(active.id, { fontSize: parseInt(e.target.value) })} className="w-full accent-rose-500" />
              </div>
            </>
          )}

          <div className="w-full">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">Color</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {templateColors && templateColors.length > 0 ? (
                templateColors.map((c, i) => <button key={i} type="button" onClick={() => upd(active.id, { color: c })} className="w-8 h-8 rounded-lg border-2" style={{ background: c, borderColor: active.color === c ? "#f43f5e" : "rgba(0,0,0,0.1)" }} />)
              ) : (
                <div className="flex items-center gap-2">
                  <input type="color" value={active.color} onChange={e => upd(active.id, { color: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-200 p-0.5" />
                  <span className="text-[10px] text-slate-400">Color libre</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {(active.type === "image" || active.type === "logo") && (
         <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{active.type === "image" ? (active.fieldKey === "precio" ? "Precio" : "Producto") : "Logo"}</span>
               <div className="flex items-center">
                  <button type="button" onClick={() => { const idx = layers.findIndex(l => l.id === active.id); if (idx > 0) { const newL = [...layers]; [newL[idx - 1], newL[idx]] = [newL[idx], newL[idx - 1]]; onLayersChange(newL); } }} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-l-lg hover:bg-slate-100 transition-colors">↓ Atrás</button>
                  <button type="button" onClick={() => { const idx = layers.findIndex(l => l.id === active.id); if (idx < layers.length - 1) { const newL = [...layers]; [newL[idx], newL[idx + 1]] = [newL[idx + 1], newL[idx]]; onLayersChange(newL); } }} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 border-l-0 px-2 py-1 rounded-r-lg hover:bg-slate-100 transition-colors">↑ Frente</button>
                  <button type="button" onClick={() => del(active.id)} className="ml-3 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">🗑 Borrar</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

export default function TextLayerEditor({ imageUrl, layers, onLayersChange, activeLayerId, onSetActiveLayer, formato, menuData, onMenuChange, templateFonts, templateColors, customFonts, isAdminMode, onImageClick }: { imageUrl: string; layers: TextLayer[]; onLayersChange: (ls: TextLayer[]) => void; activeLayerId: string | null; onSetActiveLayer: (id: string | null) => void; formato: "story" | "post" | "tv_h"; menuData: any; onMenuChange: (data: any) => void; templateFonts?: string[]; templateColors?: string[]; customFonts?: any[]; isAdminMode?: boolean; onImageClick?: (id: string) => void; }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerW(width);
      setContainerH(height);
    }
  }, [formato]);

  const scale = containerW / (formato === 'tv_h' ? 1920 : 1080);
  const upd = (id: string, updates: Partial<TextLayer>) => onLayersChange(layers.map(l => l.id === id ? { ...l, ...updates } : l));

  // Load Custom Fonts
  const fontStyles = (customFonts || []).map(f => {
     if (!f.url) return null;
     if (f.url.includes("google")) return `@import url('${f.url}');`;
     return `@font-face { font-family: "${f.name}"; src: url(${f.url}); }`;
  }).filter(Boolean).join("\n");

  return (
    <div ref={containerRef} className={`relative bg-slate-100 shadow-2xl overflow-hidden ${formato === 'tv_h' ? 'aspect-[16/9]' : formato === 'post' ? 'aspect-square' : 'aspect-[9/16]'}`} style={{ width: "100%", maxWidth: formato === 'tv_h' ? "100%" : "500px" }}>
      <style>{`
        ${fontStyles}
        .rnd-handle-br, .rnd-handle-bl, .rnd-handle-tr, .rnd-handle-tl {
          width: 10px !important;
          height: 10px !important;
          background: white !important;
          border: 2px solid #f43f5e !important;
          border-radius: 50% !important;
          opacity: ${activeLayerId ? 1 : 0};
        }
      `}</style>
      <img src={imageUrl} alt="Background" className="absolute inset-0 object-cover w-full h-full pointer-events-none" />
      
      {containerW > 0 && layers.map((layer) => {
        let initX = (layer.posX / 100) * containerW;
        let initY = (layer.posY / 100) * containerH;
        let w = typeof layer.width === 'string' ? (parseFloat(layer.width)/100)*containerW : (layer.width || 0)*scale;
        let h = typeof layer.height === 'string' ? (parseFloat(layer.height)/100)*containerH : (layer.height || 0)*scale;
        
        initX -= (w/2);
        initY -= (h/2);

        return (
          <Rnd
            key={layer.id}
            style={{ 
              border: activeLayerId === layer.id ? "2px dashed #f43f5e" : "none",
              zIndex: 10 + layers.findIndex(l => l.id === layer.id)
            }}
            position={{ x: initX, y: initY }}
            size={{ width: w || "auto", height: h || "auto" }}
            onDragStart={() => onSetActiveLayer(layer.id)}
            onDragStop={(e, d) => {
               const cx = d.x + (w/2);
               const cy = d.y + (h/2);
               upd(layer.id, { posX: (cx/containerW)*100, posY: (cy/containerH)*100 });
            }}
            onResizeStop={(e, dir, ref, delta, pos) => {
               const nw = parseInt(ref.style.width);
               const nh = parseInt(ref.style.height);
               const cx = pos.x + (nw/2);
               const cy = pos.y + (nh/2);
               upd(layer.id, { posX: (cx/containerW)*100, posY: (cy/containerH)*100, width: `${(nw/containerW)*100}%`, height: `${(nh/containerH)*100}%` });
            }}
            bounds="parent"
            enableResizing={activeLayerId === layer.id}
            disableDragging={activeLayerId !== layer.id}
            lockAspectRatio={layer.type === "image" || layer.type === "logo"}
            resizeHandleClasses={{
              bottomRight: "rnd-handle-br",
              bottomLeft: "rnd-handle-bl",
              topRight: "rnd-handle-tr",
              topLeft: "rnd-handle-tl"
            }}
          >
            <LayerPreview layer={layer} scale={scale} containerW={containerW} onImageClick={() => onSetActiveLayer(layer.id)} />
          </Rnd>
        );
      })}
    </div>
  );
}