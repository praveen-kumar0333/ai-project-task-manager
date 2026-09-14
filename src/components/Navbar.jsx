import React from 'react';
import { Search, Menu, Plus, Sparkles, RefreshCw, AlertTriangle, LogOut, Database, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import FloatingOrb from './spatial/FloatingOrb.jsx';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenNewModal, 
  setIsMobileOpen,
  onOpenAiGenerator,
  isLoading = false,
  isError = false,
  onSimulateReload,
  onToggleSimulateError,
  onLogout: propOnLogout
}) {
  const { logout } = useAuth();
  const onLogout = propOnLogout || logout;

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 gap-4 transition-all text-slate-200">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <div className="flex items-center gap-2.5 bg-slate-950/50 hover:bg-slate-950/70 px-3.5 py-2 rounded-xl text-slate-200 focus-within:ring-2 focus-within:ring-cyan-500/25 focus-within:bg-slate-950/80 border border-white/10 focus-within:border-cyan-400/50 transition-all shadow-inner">
            <Search className="w-4 h-4 text-cyan-400/70 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tasks, or milestones..."
              className="bg-transparent border-none outline-none text-xs sm:text-sm w-full placeholder:text-slate-500 text-slate-100"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-900 border border-white/10 rounded shadow-xs font-mono">
                /
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Right: State Indicators & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Status Pill & Demo State Controls */}
        <div className="flex items-center gap-1.5">
          {isError ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-rose-500/15 text-rose-300 rounded-lg border border-rose-500/30 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
              <span className="hidden sm:inline">SIMULATED ERROR</span>
              <span className="sm:hidden">ERROR</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded-lg border border-emerald-500/25 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline">SYSTEM ONLINE</span>
            </span>
          )}

          {/* Simulate Reload Button */}
          {onSimulateReload && (
            <button
              onClick={onSimulateReload}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
              title="Reload data (Simulate Loading State)"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}

          {/* Simulate Error Toggle Button for Testing */}
          {onToggleSimulateError && (
            <button
              onClick={onToggleSimulateError}
              className={`hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                isError 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20'
              }`}
              title="Toggle simulated error to test ErrorState component"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{isError ? 'Dismiss Error' : 'Simulate Error'}</span>
            </button>
          )}
        </div>

        {/* AI Task Generator Quick Button with Mini Floating Orb */}
        <button
          onClick={onOpenAiGenerator}
          className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-cyan-600/30 text-cyan-200 hover:text-white hover:from-indigo-600/50 hover:to-cyan-600/50 border border-cyan-400/30 hover:border-cyan-400/60 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-cyan-500/20 cursor-pointer group"
          title="Open AI Task Generator"
        >
          <FloatingOrb size="sm" showRings={false} state="active" />
          <span>AI Task Gen</span>
        </button>

        {/* Primary Create Button */}
        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 border border-white/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
            title="Sign out of your account"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

