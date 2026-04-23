'use client';

import React from 'react';
import { 
  AbsoluteFill, 
  Img, 
  spring, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate,
} from 'remotion';
import { RemotionTemplateProps } from './types';

// Icons mapping to match the main app
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

export const DynamicTemplate: React.FC<RemotionTemplateProps> = ({ 
  imageUrl, 
  layers, 
  formato, 
  menuData,
  animationType = 'suave'
}) => {
  const frame = useCurrentFrame();
  const { fps, width: containerW, height: containerH } = useVideoConfig();
  const scale = containerW / 1080;

  // 1. Background Animation Styles
  const getBgTransform = () => {
    if (animationType === 'cinematografico') {
       // Slow Pan and Zoom
       return `scale(${interpolate(frame, [0, 240], [1.1, 1.25])}) translateX(${interpolate(frame, [0, 240], [-2, 2])}%)`;
    }
    if (animationType === 'energetico') {
       // Pulsing zoom
       return `scale(${1 + Math.sin(frame / 20) * 0.02})`;
    }
    if (animationType === 'minimalista') {
       return 'scale(1)';
    }
    // Suave (default)
    return `scale(${interpolate(frame, [0, 240], [1, 1.08], { extrapolateRight: 'clamp' })})`;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      {/* Background Image */}
      <div style={{ 
        position: 'absolute', 
        inset: 0,
        transform: getBgTransform()
      }}>
        <Img 
          src={imageUrl} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' 
        }} />
      </div>

      {/* Layers */}
      {layers.map((layer, idx) => {
        const delay = idx * (animationType === 'energetico' ? 2 : 4);
        
        // SPRINGS based on animation type
        const spr = spring({
          frame: frame - delay,
          fps,
          config: animationType === 'energetico' 
            ? { damping: 8, stiffness: 200 } // Bouncy
            : { damping: 14, stiffness: 100 } // Smooth
        });

        // ANIMATION VALUES
        let opacity = spr;
        let translateY = 0;
        let layerScale = 1;

        if (animationType === 'minimalista') {
           opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
           translateY = interpolate(opacity, [0, 1], [10, 0]);
        } else if (animationType === 'energetico') {
           layerScale = interpolate(spr, [0, 1], [0.5, 1]);
           translateY = interpolate(spr, [0, 1], [100, 0]);
        } else if (animationType === 'cinematografico') {
           opacity = spr;
           translateY = interpolate(spr, [0, 1], [40, 0]);
           layerScale = interpolate(spr, [0, 1], [1.1, 1]);
        } else {
           // Suave
           opacity = spr;
           translateY = interpolate(spr, [0, 1], [20, 0]);
           layerScale = interpolate(spr, [0, 1], [0.95, 1]);
        }

        // Positioning logic (converted from % center to AbsoluteFill coords)
        let layerW: number;
        let layerH: number;

        if (typeof layer.width === 'string' && layer.width.endsWith('%')) {
          layerW = (parseFloat(layer.width) / 100) * containerW;
        } else if (typeof layer.width === 'number' && layer.width <= 100) {
          layerW = (layer.width / 100) * containerW;
        } else {
          layerW = (layer.width ? Number(layer.width) : 800) * scale;
        }

        if (typeof layer.height === 'string' && layer.height.endsWith('%')) {
          layerH = (parseFloat(layer.height) / 100) * containerH;
        } else if (typeof layer.height === 'number' && layer.height <= 100) {
          layerH = (layer.height / 100) * containerH;
        } else {
          layerH = (layer.height ? Number(layer.height) : 200) * scale;
        }

        const x = (layer.posX / 100) * containerW - (layerW / 2);
        const y = (layer.posY / 100) * containerH - (layerH / 2);

        const fs = Math.max(8, layer.fontSize * scale);

        return (
          <div
            key={layer.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: layerW,
              height: layerH,
              opacity,
              transform: `translateY(${translateY}px) scale(${layerScale})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start',
              zIndex: 10 + idx,
            }}
          >
            {layer.type === 'image' || layer.type === 'logo' ? (
               <div style={{ 
                 width: '100%', 
                 height: '100%', 
                 padding: layer.type === 'logo' ? '8%' : 0,
                 backgroundColor: layer.type === 'logo' ? '#fff' : 'transparent',
                 borderRadius: layer.type === 'logo' ? '12%' : 0,
                 boxShadow: layer.shadow ? '0 4px 20px rgba(0,0,0,0.25)' : 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}>
                 <Img src={layer.text} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
               </div>
            ) : layer.type === 'social' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: `${fs * 0.3}px`, width: '100%' }}>
                {layer.fieldKey === 'instagram' && <IgIcon s={fs * 0.9} c={layer.color} />}
                {layer.fieldKey === 'facebook' && <FbIcon s={fs * 0.9} c={layer.color} />}
                {layer.fieldKey === 'tiktok' && <TkIcon s={fs * 0.9} c={layer.color} />}
                <span style={{
                  fontFamily: layer.fontFamily,
                  fontSize: fs,
                  color: layer.color,
                  fontWeight: layer.fontWeight,
                  textAlign: layer.textAlign,
                  textShadow: layer.shadow ? '0 2px 6px rgba(0,0,0,0.95)' : 'none',
                  lineHeight: 1.2,
                }}>{layer.text}</span>
              </div>
            ) : layer.type === 'price' || layer.type === 'badge' ? (
               <div style={{ 
                 width: '100%', 
                 height: '100%', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 background: layer.badgeStyle === 1 ? 'linear-gradient(135deg,#f43f5e,#fb923c)' : 
                             layer.badgeStyle === 2 ? 'rgba(15,23,42,0.95)' : 
                             layer.badgeStyle === 3 ? 'rgba(255,255,255,0.95)' : 'transparent',
                 borderRadius: layer.type === 'badge' ? '20px' : '9999px',
                 border: layer.badgeStyle === 2 ? `${fs * 0.04}px solid #fbbf24` : 
                         layer.badgeStyle === 4 ? '2px dashed rgba(255,255,255,0.3)' : 'none',
                 boxShadow: layer.badgeStyle === 1 ? '0 4px 16px rgba(244,63,94,0.4)' : 
                            layer.badgeStyle === 2 ? '0 10px 30px rgba(0,0,0,0.5)' : 
                            layer.badgeStyle === 3 ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
               }}>
                 <span style={{
                   fontFamily: layer.fontFamily,
                   fontSize: fs,
                   color: layer.color,
                   fontWeight: layer.fontWeight,
                   textAlign: 'center',
                   lineHeight: 1.2,
                 }}>{layer.text}</span>
               </div>
            ) : (
              <span style={{
                fontFamily: layer.fontFamily,
                fontSize: fs,
                color: layer.color,
                fontWeight: layer.fontWeight,
                textAlign: layer.textAlign,
                textShadow: layer.shadow ? '0 2px 6px rgba(0,0,0,0.95)' : 'none',
                width: '100%',
                lineHeight: 1.2,
              }}>{layer.text}</span>
            )}
          </div>
        );
      })}

      {/* Menu Mode Support */}
      {menuData?.isMenuMode && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Simple Menu Animation (One column for now as MVP) */}
          {(() => {
            const spr = spring({
              frame: frame - 20,
              fps,
            });
            const opacity = spr;
            const translateY = interpolate(spr, [0, 1], [30, 0]);

            const mData = menuData as any;
            const bgHex = mData.bgColor || '#0f172a';
            const localBgOpacity = mData.bgOpacity ?? 0.85;
            
            const mX = (mData.posX ?? 10) * containerW / 100;
            const mY = (mData.posY ?? 20) * containerH / 100;
            const mWidth = (mData.width ?? 80) * containerW / 100;

            const s = scale * (mData.scale ?? 1);

            return (
              <div style={{
                position: 'absolute',
                left: mX,
                top: mY,
                width: mWidth,
                opacity,
                transform: `translateY(${translateY}px)`,
                background: bgHex + Math.floor(localBgOpacity * 255).toString(16).padStart(2, '0'),
                borderRadius: 48 * s,
                padding: `${64 * s}px ${48 * s}px`,
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24 * s,
                zIndex: mData.customZ ?? 15,
              }}>
                {menuData.menuItems.filter(i => i.name || i.price).map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 8 * s, 
                    borderBottom: '2px dashed rgba(255,255,255,0.2)', 
                    paddingBottom: 16 * s 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 44 * s, fontWeight: 700, color: '#fff' }}>{item.name}</span>
                      <span style={{ fontSize: 48 * s, fontWeight: 900, color: '#fbbf24' }}>{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </AbsoluteFill>
  );
};
