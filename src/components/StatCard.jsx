import React from 'react';
import SpatialCard from './spatial/SpatialCard.jsx';

export default function StatCard({ label, value, subtext, isHighlight = false, icon: Icon }) {
  // Determine contextual icon theme based on label
  const getIconTheme = () => {
    const l = (label || '').toLowerCase();
    if (l.includes('project')) {
      return {
        bg: 'bg-indigo-500/20 text-cyan-300 border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
        glow: 'indigo',
        dot: 'bg-indigo-400'
      };
    }
    if (l.includes('task') || l.includes('pending')) {
      return {
        bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        glow: 'amber',
        dot: 'bg-amber-400'
      };
    }
    if (l.includes('ai') || l.includes('suggestion')) {
      return {
        bg: 'bg-purple-500/25 text-purple-200 border-purple-400/40 shadow-[0_0_14px_rgba(168,85,247,0.3)]',
        glow: 'purple',
        dot: 'bg-purple-400'
      };
    }
    if (l.includes('completion') || l.includes('rate')) {
      return {
        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
        glow: 'emerald',
        dot: 'bg-emerald-400'
      };
    }
    return {
      bg: 'bg-slate-800/80 text-slate-300 border-white/10',
      glow: 'indigo',
      dot: 'bg-slate-400'
    };
  };

  const theme = getIconTheme();

  return (
    <SpatialCard 
      glowColor={theme.glow}
      depth={8}
      className="p-5 flex flex-col justify-between group"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        {Icon && (
          <span className={`p-2 rounded-xl border ${theme.bg} transition-all duration-300 group-hover:scale-110`}>
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
            isHighlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]' : 'text-white'
          }`}>
            {value}
          </h3>
        </div>
        {subtext && (
          <p className="text-xs text-slate-400 mt-1 font-medium truncate flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shadow-xs`}></span>
            <span>{subtext}</span>
          </p>
        )}
      </div>
    </SpatialCard>
  );
}

