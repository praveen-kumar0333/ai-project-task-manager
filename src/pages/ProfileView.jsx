import React from 'react';
import { User, Mail, Award, CheckCircle2, ShieldCheck, Code2, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfileView({ user: propUser, projectsCount = 4, tasksDoneCount = 14, onLogout: propOnLogout }) {
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser;
  const onLogout = propOnLogout || logout;
  const avatarInitials = user?.avatarInitials || (user?.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD');

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="font-bold text-2xl text-slate-900">Developer Profile</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Internship credentials, developer metrics, and workspace configuration
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
          {avatarInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-slate-900">{user?.name || 'Alex Dev'}</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Active Intern
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="sm:ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                title="Sign out of current account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">{user?.role || 'Full-Stack Developer Intern'}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email || 'alex.dev@internship.example'}
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              {user?.cohort || 'Innovation Hacks #1042'}
            </span>
          </div>
        </div>
      </div>

      {/* Tech Stack & Internship Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-sm">Approved Technology Stack</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['React.js', 'Node.js', 'Express.js', 'MySQL', 'JavaScript', 'Tailwind CSS', 'Vite', 'Gemini AI', 'JWT Auth'].map((tech) => (
              <span key={tech} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-slate-800 text-sm">Internship Tasks Tracked</h4>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span>Task 1: Developer Productivity Dashboard</span>
              <span className="font-bold text-emerald-600">Completed (Phase 2)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span>Task 2: Node.js & Express REST API</span>
              <span className="font-bold text-indigo-600">Ready for Phase 3</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span>Task 3: Persistent Data Layer (MySQL)</span>
              <span className="font-bold text-slate-400">Scheduled (Phase 4)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span>Task 4: AI Platform & Integration</span>
              <span className="font-bold text-slate-400">Scheduled (Phase 5-7)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
