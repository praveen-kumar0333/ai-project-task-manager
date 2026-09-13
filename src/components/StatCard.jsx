import React from 'react';

export default function StatCard({ label, value, subtext, isHighlight = false, icon: Icon }) {
  // Determine contextual icon theme based on label
  const getIconTheme = () => {
    const l = (label || '').toLowerCase();
    if (l.includes('project')) {
      return {
        bg: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/20 text-indigo-600 border-indigo-200/50',
        ring: 'group-hover:ring-indigo-100'
      };
    }
    if (l.includes('task') || l.includes('pending')) {
      return {
        bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/20 text-amber-600 border-amber-200/50',
        ring: 'group-hover:ring-amber-100'
      };
    }
    if (l.includes('ai') || l.includes('suggestion')) {
      return {
        bg: 'bg-gradient-to-br from-purple-500/15 to-indigo-500/25 text-purple-600 border-purple-200/60 shadow-xs',
        ring: 'group-hover:ring-purple-100'
      };
    }
    if (l.includes('completion') || l.includes('rate')) {
      return {
        bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-600 border-emerald-200/50',
        ring: 'group-hover:ring-emerald-100'
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      ring: 'group-hover:ring-slate-100'
    };
  };

  const theme = getIconTheme();

  return (
    <div className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-default">
      <div className="flex items-center justify-between gap-2">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        {Icon && (
          <span className={`p-2 rounded-xl border ${theme.bg} transition-all duration-200 group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
            isHighlight ? 'text-indigo-600' : 'text-slate-900'
          }`}>
            {value}
          </h3>
        </div>
        {subtext && (
          <p className="text-xs text-slate-400 mt-1 font-medium truncate flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors"></span>
            <span>{subtext}</span>
          </p>
        )}
      </div>
    </div>
  );
}

