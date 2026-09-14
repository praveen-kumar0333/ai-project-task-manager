import React from 'react';
import { Loader2 } from 'lucide-react';
import GlassPanel from './spatial/GlassPanel.jsx';

export default function LoadingState({ 
  message = "Loading dashboard data...", 
  subtext = "Preparing your projects, tasks, and workspace metrics",
  type = "skeleton" 
}) {
  if (type === "spinner") {
    return (
      <GlassPanel level="elevated" className="p-12 flex flex-col items-center justify-center min-h-[380px] text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-cyan-300 flex items-center justify-center mb-4 border border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
        <h3 className="font-bold text-base text-white">{message}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{subtext}</p>
      </GlassPanel>
    );
  }

  // High-fidelity Clean Spatial Skeleton Loader
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Loading Banner */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-800 rounded-lg border border-white/5" />
          <div className="h-3.5 w-72 bg-slate-800/60 rounded-md" />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>{message}</span>
        </div>
      </div>

      {/* 4 Skeleton Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div 
            key={item} 
            className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-800 rounded" />
              <div className="w-7 h-7 bg-slate-800 rounded-lg border border-white/5" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-16 bg-slate-700/60 rounded-lg" />
              <div className="h-3 w-32 bg-slate-800/80 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Projects & Tasks (col-span-2) + AI / Activity (col-span-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects Skeleton Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-36 bg-slate-800 rounded-md" />
                <div className="h-3 w-48 bg-slate-800/60 rounded" />
              </div>
              <div className="h-4 w-16 bg-slate-800/60 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl border border-white/5" />
                    <div className="h-4 w-16 bg-slate-800/60 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-slate-700/60 rounded" />
                    <div className="h-3 w-full bg-slate-800/70 rounded" />
                    <div className="h-3 w-2/3 bg-slate-800/50 rounded" />
                  </div>
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-slate-800/60 rounded" />
                      <div className="h-3 w-8 bg-slate-800/60 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Skeleton Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-40 bg-slate-800 rounded-md" />
                <div className="h-3 w-52 bg-slate-800/60 rounded" />
              </div>
              <div className="h-4 w-20 bg-slate-800/60 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-800/70 rounded" />
                    <div className="h-4 w-12 bg-slate-800/50 rounded" />
                  </div>
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-5 h-5 rounded-full bg-slate-800 shrink-0 border border-white/5" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-5/6 bg-slate-700/60 rounded" />
                      <div className="h-3 w-4/6 bg-slate-800/60 rounded" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <div className="h-4 w-16 bg-slate-800/60 rounded" />
                    <div className="h-4 w-20 bg-slate-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="h-5 w-32 bg-slate-800 rounded" />
              <div className="h-4 w-16 bg-slate-800/60 rounded" />
            </div>
            <div className="h-28 bg-slate-950/50 rounded-xl border border-white/10" />
            <div className="h-10 w-full bg-slate-800/60 rounded-xl border border-white/5" />
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="h-5 w-28 bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-800/60 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3.5 w-full bg-slate-800 rounded" />
                    <div className="h-3 w-24 bg-slate-800/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
