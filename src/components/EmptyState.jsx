import React from 'react';
import { Plus, FolderOpen, RotateCcw } from 'lucide-react';

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
    <div className="p-8 sm:p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-indigo-200/80 text-center flex flex-col items-center justify-center my-4 shadow-xs relative overflow-hidden transition-all">
      {/* Soft ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />

      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mb-3.5 shadow-xs relative z-10">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-bold text-slate-900 relative z-10">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm leading-relaxed relative z-10">{description}</p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 relative z-10">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
            >
              <ActionIcon className="w-4 h-4" />
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

