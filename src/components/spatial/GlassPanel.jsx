import React from 'react';

/**
 * GlassPanel
 * Vision-OS inspired frosted glass container with crystalline light borders,
 * layered backdrop blur, and optional depth level.
 */
export default function GlassPanel({
  children,
  className = '',
  level = 'base', // 'sunken' | 'base' | 'elevated' | 'floating'
  highlight = false,
  onClick,
  id
}) {
  const getLevelClasses = () => {
    switch (level) {
      case 'sunken':
        return 'bg-slate-950/40 border-white/5 shadow-inner';
      case 'elevated':
        return 'bg-slate-900/80 backdrop-blur-2xl border-white/15 shadow-2xl shadow-black/40';
      case 'floating':
        return 'bg-slate-900/90 backdrop-blur-2xl border-indigo-500/30 shadow-2xl shadow-indigo-950/50';
      default:
        return 'bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-xl shadow-black/30';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative rounded-2xl ${getLevelClasses()} text-slate-100 transition-all duration-200 ${
        highlight ? 'ring-1 ring-indigo-400/40 border-indigo-400/30' : ''
      } ${className}`}
    >
      {/* Top subtle rim highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
      {children}
    </div>
  );
}
