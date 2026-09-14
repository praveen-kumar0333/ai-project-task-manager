import React from 'react';
import { Plus, FolderOpen, RotateCcw } from 'lucide-react';
import GlassPanel from './spatial/GlassPanel.jsx';

export default function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = "No items found", 
  description = "Get started by adding your first item.", 
  actionLabel, 
  onAction,
  actionIcon: ActionIcon = Plus,
  secondaryActionLabel,
  onSecondaryAction
}) {
  return (
    <GlassPanel level="base" className="p-8 sm:p-12 border-dashed border-white/20 text-center flex flex-col items-center justify-center my-4 relative overflow-hidden transition-all">
      {/* Soft ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-cyan-300 mb-3.5 shadow-[0_0_15px_rgba(99,102,241,0.25)] relative z-10">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-bold text-white relative z-10">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm leading-relaxed relative z-10">{description}</p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 relative z-10">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] cursor-pointer border border-white/20"
            >
              <ActionIcon className="w-4 h-4" />
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </GlassPanel>
  );
}

