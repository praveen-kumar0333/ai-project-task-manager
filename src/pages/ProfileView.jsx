import React from 'react';
import { User, Mail, Award, CheckCircle2, ShieldCheck, Code2, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import GlassPanel from '../components/spatial/GlassPanel.jsx';

export default function ProfileView({ user: propUser, projectsCount = 4, tasksDoneCount = 14, onLogout: propOnLogout }) {
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser;
  const onLogout = propOnLogout || logout;
  const avatarInitials = user?.avatarInitials || (user?.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD');

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Developer Profile</h2>
        <p className="text-sm text-slate-400 mt-1">
          Internship credentials, developer metrics, and workspace configuration
        </p>
      </div>

      <GlassPanel level="elevated" className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0">
          {avatarInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-white">{user?.name || 'Alex Dev'}</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Active Intern
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="sm:ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                title="Sign out of current account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">{user?.role || 'Full-Stack Developer Intern'}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              {user?.email || 'alex.dev@internship.example'}
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              {user?.cohort || 'Innovation Hacks #1042'}
            </span>
          </div>
        </div>
      </GlassPanel>

      {/* Tech Stack & Internship Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <GlassPanel level="base" className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white text-sm">Approved Technology Stack</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['React.js', 'Node.js', 'Express.js', 'MySQL', 'JavaScript', 'Tailwind CSS', 'Vite', 'Gemini AI', 'JWT Auth'].map((tech) => (
              <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-xs font-medium">
                {tech}
              </span>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel level="base" className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Internship Tasks Tracked</h4>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg">
              <span>Task 1: Developer Productivity Dashboard</span>
              <span className="font-bold text-emerald-400">Completed (Phase 2)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg">
              <span>Task 2: Node.js & Express REST API</span>
              <span className="font-bold text-cyan-400">Ready for Phase 3</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg">
              <span>Task 3: Persistent Data Layer (MySQL)</span>
              <span className="font-bold text-slate-400">Scheduled (Phase 4)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg">
              <span>Task 4: AI Platform & Integration</span>
              <span className="font-bold text-slate-400">Scheduled (Phase 5-7)</span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
