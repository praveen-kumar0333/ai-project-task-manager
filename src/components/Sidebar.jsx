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
    <div className="h-full flex flex-col bg-white border-r border-slate-200/90 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100/90">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/25 tracking-wider">
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400/40"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">AI Manager</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Developer Suite & Gemini</p>
          </div>
        </div>
        {isMobileOpen && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
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
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/25 font-semibold' 
                        : 'text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-white/25 text-white backdrop-blur-xs' 
                        : 'bg-purple-100 text-purple-700 border border-purple-200/60'
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
                  className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs border border-indigo-100/80' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / Profile section */}
      <div className="p-3.5 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <div 
          onClick={() => handleNavClick('profile')}
          className="flex items-center gap-3 p-2 bg-white hover:bg-slate-100/80 rounded-xl transition-all border border-slate-200/80 shadow-2xs cursor-pointer group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {avatarInitials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-800 group-hover:text-indigo-600 transition-colors">
              {user?.name || 'Alex Dev'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Logged in'}</p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors cursor-pointer"
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
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/80 flex-col shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

