import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ 
  message = "Loading dashboard data...", 
  subtext = "Preparing your projects, tasks, and workspace metrics",
  type = "skeleton" 
}) {
  if (type === "spinner") {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[380px] bg-white rounded-2xl border border-slate-200 shadow-xs text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="font-bold text-base text-slate-800">{message}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{subtext}</p>
      </div>
    );
  }

  // High-fidelity Clean Minimalism Skeleton Loader
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Loading Banner */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span>{message}</span>
        </div>
      </div>

      {/* 4 Skeleton Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div 
            key={item} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-100 rounded" />
              <div className="w-7 h-7 bg-slate-100 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-16 bg-slate-200 rounded-lg" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
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
                <div className="h-5 w-36 bg-slate-200 rounded-md" />
                <div className="h-3 w-48 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="h-4 w-16 bg-slate-100 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                      <div className="h-3 w-8 bg-slate-100 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Skeleton Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-40 bg-slate-200 rounded-md" />
                <div className="h-3 w-52 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                  </div>
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-5/6 bg-slate-200 rounded" />
                      <div className="h-3 w-4/6 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <div className="h-4 w-16 bg-slate-100 rounded" />
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
            <div className="h-28 bg-slate-50 rounded-xl border border-slate-100" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="h-5 w-28 bg-slate-200 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3.5 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-24 bg-slate-50 rounded" />
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
