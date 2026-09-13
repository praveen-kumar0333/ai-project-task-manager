import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash, ShieldAlert } from 'lucide-react';

export default function ErrorState({
  title = "Failed to load dashboard data",
  message = "The application encountered an unexpected error while retrieving your projects and tasks.",
  details = "Request failed with simulated network exception (HTTP 503 Service Unavailable / Connection Timeout).",
  onRetry,
  onResetData,
  isRetrying = false
}) {
  return (
    <div className="p-8 sm:p-12 bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200/80 shadow-lg shadow-rose-500/5 text-center flex flex-col items-center justify-center my-6 max-w-2xl mx-auto animate-in fade-in duration-200">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50/60 shadow-xs">
        <ServerCrash className="w-8 h-8" />
      </div>

      {/* Title & Message */}
      <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
        {message}
      </p>

      {/* Technical Diagnostics Box */}
      {details && (
        <div className="mt-5 p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-left w-full max-w-lg border border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Diagnostics Output</span>
          </div>
          <p className="text-xs font-mono text-slate-300 break-words leading-relaxed">{details}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/25 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying Connection...' : 'Retry Connection'}</span>
          </button>
        )}

        {onResetData && (
          <button
            onClick={onResetData}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
          >
            Reset Workspace State
          </button>
        )}
      </div>

      <p className="text-[11px] font-medium text-slate-400 mt-4">
        Interactive Demo State: Click "Retry Connection" to simulate recovering data.
      </p>
    </div>
  );
}

