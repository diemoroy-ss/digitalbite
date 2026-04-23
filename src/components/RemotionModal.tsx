import { useEffect, useState, useRef } from 'react';
import { DynamicTemplate } from '../remotion/DynamicTemplate';
import type { TextLayer, RemotionTemplateProps, AnimationType } from '../remotion/types';

interface RemotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  layers: TextLayer[];
  formato: string;
  menuData?: RemotionTemplateProps['menuData'];
}

export default function RemotionModal({ isOpen, onClose, imageUrl, layers, formato, menuData }: RemotionModalProps) {
  const [Player, setPlayer] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [animationType, setAnimationType] = useState<AnimationType>('suave');
  const [isRendering, setIsRendering] = useState(false);
  const playerRef = useRef<any>(null);

  const handleExport = async () => {
    if (!playerRef.current || isRendering) return;

    try {
      setIsRendering(true);
      const player = playerRef.current;
      
      // 1. Ir al inicio
      player.pause();
      player.seekTo(0);

      // 2. Encontrar el canvas (Remotion Player lo renderiza dentro del container)
      const container = document.querySelector('[data-remotion-player]');
      const canvas = container?.querySelector('canvas');

      if (!canvas) {
        throw new Error("No se encontró el canvas del reproductor.");
      }

      // 3. Configurar Grabación
      const stream = canvas.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000 // 5Mbps para alta calidad
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DigitalBite-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRendering(false);
      };

      // 4. Iniciar y esperar
      recorder.start();
      await player.play();
      
      // Esperar la duración del video (8 segundos @ 30fps = 240 frames)
      setTimeout(() => {
        recorder.stop();
        player.pause();
      }, 8100); // 8 segundos + pequeño margen

    } catch (err) {
      console.error(err);
      alert("Error al exportar el video localmente.");
      setIsRendering(false);
    }
  };

  // Dynamically import Player on client only (Remotion is client-only)
  useEffect(() => {
    setMounted(true);
    import('@remotion/player').then((mod) => {
      setPlayer(() => mod.Player);
    });
  }, []);

  // Calculate dimensions based on format
  const getDimensions = () => {
    if (formato === 'post') return { width: 1080, height: 1080 };
    if (formato === 'tv_h') return { width: 1920, height: 1080 };
    return { width: 1080, height: 1920 }; // story / tv_v
  };

  const { width, height } = getDimensions();

  // Display aspect ratio for the preview
  const getDisplayStyle = () => {
    if (formato === 'post') return { width: '380px', height: '380px' };
    if (formato === 'tv_h') return { width: '560px', height: '315px' };
    return { width: '280px', height: '497px' }; // 9:16
  };

  if (!isOpen || !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0A0A0A] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center p-6 gap-6 max-w-[700px] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-white font-semibold text-lg">Vista Previa Animada</h3>
            <p className="text-white/40 text-xs mt-0.5">8 segundos · {formato === 'story' ? 'Story 9:16' : formato === 'post' ? 'Feed 1:1' : 'TV 16:9'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Multi-Animation Selection */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          {[
            { id: 'suave', label: 'Suave', icon: '🪄' },
            { id: 'energetico', label: 'Energetico', icon: '⚡' },
            { id: 'cinematografico', label: 'Cine', icon: '🎬' },
            { id: 'minimalista', label: 'Minimal', icon: '✨' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAnimationType(opt.id as AnimationType)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${animationType === opt.id ? 'bg-[#C8F060] text-black shadow-lg shadow-[#C8F060]/20' : 'text-white/60 hover:bg-white/5'}`}
            >
              <span className="text-lg">{opt.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Player */}
        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group" style={getDisplayStyle()}>
          {Player ? (
            <Player
              ref={playerRef}
              component={DynamicTemplate}
              inputProps={{
                imageUrl,
                layers,
                formato,
                menuData,
                animationType,
              }}
              durationInFrames={240}
              compositionWidth={width}
              compositionHeight={height}
              fps={30}
              style={{ width: '100%', height: '100%' }}
              controls
              autoPlay
              loop
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#141414]">
              <div className="text-white/40 text-sm animate-pulse">Cargando reproductor...</div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleExport}
            disabled={isRendering}
            className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-3 ${isRendering ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-[#C8F060] text-black shadow-xl hover:-translate-y-0.5 active:scale-95'}`}
          >
            {isRendering ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                GENERANDO VIDEO...
              </>
            ) : (
              <>
                <span>🚀</span> GENERAR Y DESCARGAR MP4
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-white/30 font-medium">Recordatorio: La generación se procesa en tu navegador. Mantén esta pestaña abierta.</p>
        </div>
      </div>
    </div>
  );
}
