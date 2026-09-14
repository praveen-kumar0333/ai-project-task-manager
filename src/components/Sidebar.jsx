import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  Sparkles, 
  User, 
  BarChart3, 
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ currentTab, setCurrentTab, user: propUser, isMobileOpen, setIsMobileOpen, onLogout: propOnLogout }) {
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser;
  const onLogout = propOnLogout || logout;

  const navGroups = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: FolderGit2 },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Gemini', isSpecial: true },
      ]
    },
    {
      title: 'ANALYTICS & SYSTEM',
      items: [
        { id: 'analytics', label: 'Productivity', icon: BarChart3 },
        { id: 'profile', label: 'Profile', icon: User },
      ]
    }
  ];

  const handleNavClick = (id) => {
    setCurrentTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const avatarInitials = user?.avatarInitials || (user?.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD');

  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-900/75 backdrop-blur-2xl border-r border-white/10 select-none text-slate-200">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30 tracking-wider transition-transform group-hover:scale-105 border border-white/20">
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 ring-2 ring-emerald-400/50 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">AI Manager</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-cyan-300 border border-indigo-400/30">
                SPATIAL
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Developer Suite & Gemini</p>
          </div>
        </div>
        {isMobileOpen && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 p-3.5 space-y-6 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 text-left relative cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-500/90 via-purple-600/90 to-cyan-500/80 text-white shadow-lg shadow-indigo-500/30 font-semibold border border-white/25' 
                        : 'text-slate-300 hover:bg-indigo-500/15 hover:text-cyan-300 border border-transparent hover:border-indigo-400/30'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-cyan-400 group-hover:bg-indigo-500/30'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-white/25 text-white backdrop-blur-xs' 
                        : 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                    }`}>
                      {item.badge}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left cursor-pointer border ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-300 font-semibold shadow-md border-indigo-400/40 shadow-indigo-500/10' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / Profile section */}
      <div className="p-3.5 border-t border-white/10 space-y-2 bg-slate-950/40">
        <div 
          onClick={() => handleNavClick('profile')}
          className="flex items-center gap-3 p-2 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl transition-all border border-white/10 shadow-sm cursor-pointer group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md border border-white/20">
              {avatarInitials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-200 group-hover:text-indigo-300 transition-colors">
              {user?.name || 'Alex Dev'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Logged in'}</p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 flex-col shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 border-r border-white/10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

