import { useEffect } from "react";

interface Layout {
  id: string;
  name: string;
  desc: string;
  url: string;
  urlStory?: string;
}

interface PreviewModalProps {
  layouts: Layout[];
  previewIndex: number | null;
  slideDir: "left" | "right";
  onClose: () => void;
  onSelectLayout: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PreviewModal({ layouts, previewIndex, slideDir, onClose, onSelectLayout, onNext, onPrev }: PreviewModalProps) {
  
  // Keyboard navigation for carousel
  useEffect(() => {
    if (previewIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, onClose, onPrev, onNext]);

  if (previewIndex === null || !layouts[previewIndex]) return null;

  const currentLayout = layouts[previewIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors z-10 text-xl font-black shadow-lg">❮</button>

      <div className="flex flex-col items-center w-full max-w-sm bg-white p-5 md:p-6 rounded-[32px] shadow-2xl overflow-hidden relative" onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors z-20">✕</button>
        
        <div key={previewIndex} className={`w-full animate-in fade-in ${slideDir === 'right' ? 'slide-in-from-right-8' : 'slide-in-from-left-8'} duration-300`}>
          <div className="w-full aspect-[4/5] rounded-[24px] overflow-hidden mb-5 relative bg-slate-100">
             <img src={currentLayout.url} alt={currentLayout.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center px-2 mb-6">
             <h3 className="text-xl font-black text-slate-800 mb-2">{currentLayout.name}</h3>
             <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{currentLayout.desc}</p>
          </div>
          <button onClick={() => onSelectLayout(currentLayout.id)} className="w-full text-[15px] font-bold tracking-wide text-white bg-gradient-to-r from-rose-500 to-orange-500 py-4 rounded-2xl hover:scale-[1.02] shadow-xl shadow-rose-500/30 transition-all flex justify-center items-center gap-2">
            Seleccionar esta plantilla ✨
          </button>
        </div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors z-10 text-xl font-black shadow-lg">❯</button>
    </div>
  );
}
