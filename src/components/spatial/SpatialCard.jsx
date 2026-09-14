import React, { useRef, useState, useEffect } from 'react';

/**
 * SpatialCard
 * A high-performance 3D spatial card with subtle cursor tracking tilt,
 * specular surface reflection, and Apple Vision-style glass depth.
 * Automatically disables 3D tilt on touch devices and for users with prefers-reduced-motion.
 */
export default function SpatialCard({ 
  children, 
  className = '', 
  elevation = 'normal', // 'low' | 'normal' | 'high'
  glowColor = 'indigo', // 'indigo' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'none'
  depth = 12, // max tilt degrees
  onClick,
  interactive = true,
  id
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!interactive || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Normalize -1 to 1
    const rotateX = ((y - centerY) / centerY) * -depth;
    const rotateY = ((x - centerX) / centerX) * depth;

    setCoords({
      rotateX: Math.max(-depth, Math.min(depth, rotateX)),
      rotateY: Math.max(-depth, Math.min(depth, rotateY)),
      lightX: (x / rect.width) * 100,
      lightY: (y / rect.height) * 100
    });
  };

  const handleMouseEnter = () => {
    if (interactive && !prefersReducedMotion) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rotateX: 0, rotateY: 0, lightX: 50, lightY: 50 });
  };

  const getElevationClasses = () => {
    switch (elevation) {
      case 'low':
        return 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30';
      case 'high':
        return 'shadow-2xl shadow-indigo-950/40 hover:shadow-3xl hover:shadow-indigo-950/50';
      default:
        return 'shadow-xl shadow-black/25 hover:shadow-2xl hover:shadow-black/40';
    }
  };

  const getGlowBorder = () => {
    switch (glowColor) {
      case 'cyan':
        return 'hover:border-cyan-400/40 hover:shadow-cyan-500/10';
      case 'purple':
        return 'hover:border-purple-400/40 hover:shadow-purple-500/10';
      case 'emerald':
        return 'hover:border-emerald-400/40 hover:shadow-emerald-500/10';
      case 'amber':
        return 'hover:border-amber-400/40 hover:shadow-amber-500/10';
      case 'none':
        return 'hover:border-slate-600/60';
      default:
        return 'hover:border-indigo-400/40 hover:shadow-indigo-500/15';
    }
  };

  const transformStyle = isHovered && !prefersReducedMotion
    ? {
        transform: `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) translateY(-3px)`,
        transition: 'transform 0.08s ease-out, box-shadow 0.2s ease, border-color 0.2s ease'
      }
    : {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease'
      };

  return (
    <div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={transformStyle}
      className={`relative rounded-2xl bg-slate-900/65 backdrop-blur-xl border border-white/10 text-slate-100 overflow-hidden ${getElevationClasses()} ${getGlowBorder()} ${interactive ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Specular glass reflection layer moving with cursor */}
      {isHovered && !prefersReducedMotion && (
        <div
          className="pointer-events-none absolute -inset-px opacity-35 transition-opacity duration-300 rounded-2xl"
          style={{
            background: `radial-gradient(400px circle at ${coords.lightX}% ${coords.lightY}%, rgba(255,255,255,0.18), transparent 60%)`
          }}
        />
      )}

      {/* Top subtle rim light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content wrapper with slight 3D preservation */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
