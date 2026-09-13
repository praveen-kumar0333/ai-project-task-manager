import React from 'react';
import { Search, Menu, Plus, Sparkles, RefreshCw, AlertTriangle, LogOut, Database, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 gap-4 transition-all">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <div className="flex items-center gap-2.5 bg-slate-100/90 hover:bg-slate-100 px-3.5 py-2 rounded-xl text-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white border border-slate-200/60 focus-within:border-indigo-400 transition-all shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tasks, or milestones..."
              className="bg-transparent border-none outline-none text-xs sm:text-sm w-full placeholder:text-slate-400 text-slate-800"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-200/60 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs font-mono">
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
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="hidden sm:inline">SIMULATED ERROR</span>
              <span className="sm:hidden">ERROR</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database className="w-3 h-3 text-emerald-600" />
              <span className="hidden md:inline">SYSTEM ONLINE</span>
            </span>
          )}

          {/* Simulate Reload Button */}
          {onSimulateReload && (
            <button
              onClick={onSimulateReload}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reload data (Simulate Loading State)"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}

          {/* Simulate Error Toggle Button for Testing */}
          {onToggleSimulateError && (
            <button
              onClick={onToggleSimulateError}
              className={`hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                isError 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200'
              }`}
              title="Toggle simulated error to test ErrorState component"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{isError ? 'Dismiss Error' : 'Simulate Error'}</span>
            </button>
          )}
        </div>

        {/* AI Task Generator Quick Button */}
        <button
          onClick={onOpenAiGenerator}
          className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/60 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
          title="Open AI Task Generator"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
          <span>AI Task Gen</span>
        </button>

        {/* Primary Create Button */}
        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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

