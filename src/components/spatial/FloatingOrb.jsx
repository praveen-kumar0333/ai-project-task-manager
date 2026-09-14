import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * FloatingOrb
 * 3D Spatial AI Assistant Core / Holographic Glowing Orb.
 * Uses lightweight, 60fps GPU-accelerated CSS 3D transforms & SVG energy rings.
 * Features customizable states: 'idle', 'thinking', 'generating', 'speaking', 'active'.
 */
export default function FloatingOrb({
  size = 'md', // 'sm' (36px) | 'md' (56px) | 'lg' (84px) | 'xl' (120px)
  state = 'idle', // 'idle' | 'thinking' | 'generating' | 'active'
  onClick,
  label = '',
  showRings = true,
  className = ''
}) {
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

  const sizeStyles = {
    sm: { container: 'w-9 h-9', core: 'w-5 h-5', icon: 'w-3 h-3', ring: 32 },
    md: { container: 'w-14 h-14', core: 'w-8 h-8', icon: 'w-4 h-4', ring: 48 },
    lg: { container: 'w-20 h-20', core: 'w-12 h-12', icon: 'w-6 h-6', ring: 72 },
    xl: { container: 'w-28 h-28', core: 'w-16 h-16', icon: 'w-8 h-8', ring: 104 }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const getStateClasses = () => {
    switch (state) {
      case 'generating':
      case 'thinking':
        return {
          glow: 'from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_35px_rgba(6,182,212,0.6)] animate-pulse',
          aura: 'bg-cyan-500/25 scale-125',
          ring1Color: 'stroke-cyan-400',
          ring2Color: 'stroke-indigo-400',
          speed: 'duration-1000'
        };
      case 'active':
        return {
          glow: 'from-indigo-400 via-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(99,102,241,0.55)]',
          aura: 'bg-indigo-500/20 scale-110',
          ring1Color: 'stroke-indigo-400',
          ring2Color: 'stroke-purple-400',
          speed: 'duration-3000'
        };
      default: // idle
        return {
          glow: 'from-indigo-500/90 via-purple-600/90 to-cyan-500/80 shadow-[0_0_24px_rgba(99,102,241,0.4)]',
          aura: 'bg-indigo-500/15',
          ring1Color: 'stroke-indigo-400/60',
          ring2Color: 'stroke-purple-400/50',
          speed: 'duration-6000'
        };
    }
  };

  const stateStyle = getStateClasses();

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      title={label || 'Gemini 3D AI Core'}
    >
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Soft Ambient Radial Backdrop Aura */}
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 pointer-events-none ${stateStyle.aura}`}
        />

        {/* 3D Orbital Energy Rings (SVG with 3D rotation) */}
        {showRings && !prefersReducedMotion && (
          <>
            {/* Horizontal tilted orbit ring */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none animate-spin"
              style={{
                animationDuration: state === 'thinking' ? '3s' : '9s',
                transform: 'rotateX(70deg) rotateZ(20deg)'
              }}
            >
              <div
                className={`w-full h-full rounded-full border border-dashed border-indigo-400/40 opacity-70`}
                style={{
                  boxShadow: '0 0 12px rgba(99,102,241,0.3)'
                }}
              />
            </div>

            {/* Vertical tilted counter-orbit ring */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: 'rotateY(65deg) rotateX(30deg)',
                animation: `spin ${state === 'thinking' ? '2.5s' : '7s'} linear infinite reverse`
              }}
            >
              <div
                className={`w-full h-full rounded-full border border-cyan-400/35 opacity-60`}
                style={{
                  boxShadow: '0 0 10px rgba(6,182,212,0.25)'
                }}
              />
            </div>
          </>
        )}

        {/* Outer Pulsing Particle Nodes */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] -top-1"
              style={{ animation: 'bounce 2.8s infinite ease-in-out' }}
            />
            <span
              className="absolute w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_#818cf8] -bottom-1"
              style={{ animation: 'bounce 3.4s infinite ease-in-out 0.8s' }}
            />
          </div>
        )}

        {/* Glowing 3D AI Core Sphere */}
        <div
          className={`relative ${currentSize.core} rounded-full bg-gradient-to-tr ${stateStyle.glow} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-active:scale-95 border border-white/40`}
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Specular Inner Glint */}
          <div className="absolute top-1 left-1.5 w-2.5 h-2.5 rounded-full bg-white/70 blur-xs pointer-events-none" />

          {/* Core Emblem / Sparkle */}
          <Sparkles className={`${currentSize.icon} text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]`} />
        </div>
      </div>

      {label && (
        <span className="mt-1.5 text-[11px] font-semibold tracking-wide text-indigo-200/90 group-hover:text-cyan-300 transition-colors">
          {label}
        </span>
      )}
    </div>
  );
}
