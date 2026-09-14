import React from 'react';
import { Sparkles, ArrowRight, Bot, Layers } from 'lucide-react';
import GlassPanel from './spatial/GlassPanel.jsx';
import FloatingOrb from './spatial/FloatingOrb.jsx';

export default function AiTaskGeneratorWidget({ 
  selectedProject, 
  projects = [], 
  onSelectProject, 
  onOpenGeneratorModal
}) {
  return (
    <GlassPanel level="elevated" className="overflow-hidden flex flex-col justify-between group">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
              <FloatingOrb size="sm" showRings={false} state="active" />
            </div>
            <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">AI Task Generator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Powered by Google Gemini AI</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 uppercase tracking-wider">
          Gemini 2.5
        </span>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4 relative z-10">
        {selectedProject ? (
          <div className="p-4 bg-slate-950/60 rounded-xl border border-indigo-500/30 flex flex-col gap-2 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" /> Target Project
              </span>
              <button 
                onClick={() => onSelectProject && onSelectProject(null)}
                className="text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
            <h4 className="font-bold text-white text-sm truncate">{selectedProject.title}</h4>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{selectedProject.description}</p>
          </div>
        ) : (
          <div className="p-5 bg-slate-950/50 rounded-xl border border-dashed border-white/15 flex-1 flex flex-col justify-center items-center text-center min-h-[140px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-cyan-300 flex items-center justify-center mb-2 border border-indigo-400/30 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-200">No Target Project Selected</p>
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
                  className="w-full text-xs font-medium bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/50 shadow-inner transition-all cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onOpenGeneratorModal}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Launch AI Generator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </GlassPanel>
  );
}
