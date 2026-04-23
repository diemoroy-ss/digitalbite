import { Eye } from "./TemplatesData";

interface Layout {
  id: string;
  name: string;
  desc: string;
  url: string;
  urlStory?: string;
  urlTv?: string;
  colors?: string[];
  fonts?: string[];
  defaultLayersVertical?: any[];
  defaultMenuDataVertical?: any;
  defaultLayersPost?: any[];
  defaultMenuDataPost?: any;
  defaultLayersHorizontal?: any[];
  defaultMenuDataHorizontal?: any;
}

interface TemplateGridProps {
  layouts: Layout[];
  selectedLayout: string | null;
  onSelectLayout: (id: string) => void;
  onOpenPreview: (index: number) => void;
  formato: string;
}

export default function TemplateGrid({ layouts, selectedLayout, onSelectLayout, onOpenPreview, formato }: TemplateGridProps) {
  return (
    <section className="mb-20 animate-in zoom-in-95 duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-center gap-4 mb-10">
        <h2 className="text-[18px] font-black tracking-tight text-slate-800">Selecciona el ambiente visual ✨</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
        {layouts.filter(lay => {
          const url = formato === 'story' || formato === 'tv_v' ? lay.urlStory || lay.url : formato === 'tv_h' ? lay.urlTv || lay.url : lay.url;
          return !!url;
        }).map((lay, idx) => {
          const displayUrl = formato === 'story' || formato === 'tv_v' ? lay.urlStory || lay.url : formato === 'tv_h' ? lay.urlTv || lay.url : lay.url;
          const displayRatio = formato === 'tv_h' ? 'aspect-[16/9]' : formato === 'post' ? 'aspect-square' : 'aspect-[9/16]';
          const localLayers = formato === 'story' || formato === 'tv_v' ? lay.defaultLayersVertical : formato === 'tv_h' ? lay.defaultLayersHorizontal : lay.defaultLayersPost;
          const baseWidth = formato === 'tv_h' ? 1920 : 1080;
          const baseHeight = formato === 'post' ? 1080 : formato === 'tv_h' ? 1080 : 1920;

          return (
            <div key={lay.id} className="group relative cursor-pointer flex flex-col" onClick={() => onSelectLayout(lay.id)}>
              <div className={`w-full ${displayRatio} rounded-[24px] overflow-hidden transition-all duration-300 relative bg-slate-100 ${selectedLayout === lay.id ? 'ring-4 ring-rose-400 ring-offset-2 ring-offset-[#fafaf9] shadow-lg scale-105' : 'border border-slate-200 group-hover:border-slate-300 opacity-80 group-hover:opacity-100 hover:scale-[1.03] shadow-sm'}`} style={{ containerType: 'inline-size' }}>
                <img src={displayUrl} alt={lay.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {localLayers && localLayers.length > 0 && (
                   <div className="absolute inset-0 z-10 pointer-events-none">
                      {localLayers.map((l: any) => {
                         const leftPct = l.posX !== undefined ? l.posX : (l.x / baseWidth) * 100;
                         const topPct = l.posY !== undefined ? l.posY : (l.y / baseHeight) * 100;
                         
                         // Width and Height scaling guard auto-healer
                         let widthPct = "100%";
                         if (l.width !== undefined && l.width !== null && l.width !== "") {
                            if (typeof l.width === 'string' && l.width.endsWith('%')) {
                               widthPct = l.width;
                            } else {
                               const wNum = parseFloat(String(l.width));
                               if (!isNaN(wNum)) {
                                  if (wNum <= 100) widthPct = `${wNum}%`;
                                  else widthPct = `${(wNum / (formato === 'post' ? 400 : formato === 'tv_h' ? 700 : 250)) * 100}%`;
                               }
                            }
                         }
                         
                         let heightPct = "auto";
                         if (l.height !== undefined && l.height !== null && l.height !== "") {
                            if (typeof l.height === 'string' && l.height.endsWith('%')) {
                               heightPct = l.height;
                            } else {
                               const hNum = parseFloat(String(l.height));
                               if (!isNaN(hNum)) {
                                  if (hNum <= 100) heightPct = `${hNum}%`;
                               }
                            }
                         }
                         
                         const transformStr = 'translate(-50%, -50%)';

                         return (
                            <div key={l.id} style={{
                               position: 'absolute',
                               left: `${leftPct}%`,
                               top: `${topPct}%`,
                               width: widthPct,
                               height: heightPct,
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
                            </div>
                         );
                      })}
                   </div>
                )}

                <button onClick={(e) => { e.stopPropagation(); onOpenPreview(idx); }} className="absolute m-auto top-0 bottom-0 left-0 right-0 w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-all border border-slate-100 hover:text-rose-500 hover:scale-110 z-20">
                <Eye />
              </button>
            </div>
            
            <div className="mt-4 text-center px-1">
              <h4 className={`text-[13px] font-bold transition-colors ${selectedLayout === lay.id ? 'text-rose-600' : 'text-slate-800 group-hover:text-rose-500'}`}>{lay.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{lay.desc}</p>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
