'use client';

import React from 'react';
import { Composition } from 'remotion';
import { DynamicTemplate } from './DynamicTemplate';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicTemplate"
        component={DynamicTemplate as any}
        durationInFrames={240} // 8 seconds at 30 fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1080&h=1920&fit=crop",
          layers: [],
          formato: "story"
        }}
      />
    </>
  );
}
