import React, { useEffect, useState } from 'react';

/**
 * SpatialBackground
 * Ambient spatial depth canvas featuring subtle nebulas, perspective grid matrix,
 * and delicate floating micro-particles.
 */
export default function SpatialBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const handler = (e) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#0a0f1d]">
      {/* Base Deep Cosmic Gradient */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 50% -20%, rgba(30, 58, 138, 0.28), rgba(10, 15, 29, 0.98) 75%)'
        }}
      />

      {/* Layer 1: Ambient Blurred Nebulas */}
      <div 
        className={`absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[130px] ${
          !prefersReducedMotion ? 'animate-pulse' : ''
        }`}
        style={{ animationDuration: '9s' }}
      />
      <div 
        className={`absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] ${
          !prefersReducedMotion ? 'animate-pulse' : ''
        }`}
        style={{ animationDuration: '11s', animationDelay: '2s' }}
      />
      <div 
        className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[140px]"
      />

      {/* Layer 2: Subtle Spatial Grid Matrix with Perspective */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 85%)'
        }}
      />

      {/* Layer 3: Floating Micro Particles / Ambient Star dust */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 opacity-40">
          <div 
            className="absolute top-[18%] left-[12%] w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] animate-ping"
            style={{ animationDuration: '4s' }}
          />
          <div 
            className="absolute top-[35%] right-[18%] w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_#a5b4fc] animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
          <div 
            className="absolute top-[68%] left-[22%] w-1 h-1 rounded-full bg-purple-300 shadow-[0_0_6px_#d8b4fe] animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2.5s' }}
          />
          <div 
            className="absolute top-[82%] right-[28%] w-1 h-1 rounded-full bg-cyan-200 shadow-[0_0_6px_#a5f3fc] animate-ping"
            style={{ animationDuration: '7s', animationDelay: '3s' }}
          />
        </div>
      )}

      {/* Layer 4: Vignette Border Depth */}
      <div 
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 120px rgba(5, 8, 16, 0.7)'
        }}
      />
    </div>
  );
}
