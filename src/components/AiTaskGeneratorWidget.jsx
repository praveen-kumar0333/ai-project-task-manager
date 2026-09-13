import React from 'react';
import { Sparkles, ArrowRight, Check, Plus, Bot, Layers } from 'lucide-react';

export default function AiTaskGeneratorWidget({ 
  selectedProject, 
  projects = [], 
  onSelectProject, 
  onOpenGeneratorModal,
  onQuickAddTasks
}) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-indigo-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Subtle decorative background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-indigo-500/10 to-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">AI Task Generator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Powered by Google Gemini AI</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 uppercase tracking-wider">
          Gemini 2.5
        </span>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4 relative z-10">
        {selectedProject ? (
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 rounded-xl border border-indigo-100 flex flex-col gap-2 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-500" /> Target Project
              </span>
              <button 
                onClick={() => onSelectProject && onSelectProject(null)}
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
            <h4 className="font-bold text-slate-900 text-sm truncate">{selectedProject.title}</h4>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{selectedProject.description}</p>
          </div>
        ) : (
          <div className="p-5 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 flex-1 flex flex-col justify-center items-center text-center min-h-[140px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 border border-indigo-100/60 shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700">No Target Project Selected</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              Select an active project or enter technical requirements to generate tasks automatically
            </p>
            {projects.length > 0 && (
              <div className="mt-3 w-full max-w-xs">
                <select 
                  onChange={(e) => {
                    const p = projects.find(item => String(item.id) === String(e.target.value));
                    if (p && onSelectProject) onSelectProject(p);
                  }}
                  defaultValue=""
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all cursor-pointer"
                >
                  <option value="" disabled>Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onOpenGeneratorModal}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Generator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
