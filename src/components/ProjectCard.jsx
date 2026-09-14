import React from 'react';
import { 
  Server, 
  ShieldCheck, 
  Layout, 
  Database, 
  Trash2, 
  Eye, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import SpatialCard from './spatial/SpatialCard.jsx';

export default function ProjectCard({ project, onView, onDelete }) {
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'backend':
        return { 
          icon: Server, 
          bg: 'bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
        };
      case 'security':
        return { 
          icon: ShieldCheck, 
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
        };
      case 'frontend':
        return { 
          icon: Layout, 
          bg: 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
        };
      case 'database':
        return { 
          icon: Database, 
          bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
        };
      default:
        return { 
          icon: Layers, 
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
        };
    }
  };

  const { icon: CategoryIcon, bg: iconStyle } = getCategoryIcon(project.category);

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'text-rose-300 bg-rose-500/20 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
      case 'high':
        return 'text-amber-300 bg-amber-500/20 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
      case 'medium':
        return 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40 shadow-[0_0_8px_rgba(99,102,241,0.2)]';
      default:
        return 'text-slate-400 bg-slate-800/80 border-white/10';
    }
  };

  const getProgressGradient = (progress) => {
    if (progress >= 90) return 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]';
    if (progress >= 50) return 'bg-gradient-to-r from-indigo-400 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]';
    return 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]';
  };

  const progressPercent = Math.min(100, Math.max(0, project.progress || 0));

  return (
    <SpatialCard 
      depth={10}
      glowColor="indigo"
      className="p-5 sm:p-6 flex flex-col justify-between group"
    >
      <div>
        {/* Top Header: Category Icon & Badges / Actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className={`p-2.5 rounded-xl border ${iconStyle} transition-transform group-hover:scale-105`}>
              <CategoryIcon className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-semibold text-slate-400 capitalize hidden sm:inline">
              {project.category || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityBadge(project.priority)}`}>
              {project.priority || 'NORMAL'}
            </span>
            <div className="flex items-center gap-1 ml-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onView) onView(project);
                }}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="View Project Details & Tasks"
              >
                <Eye className="w-4 h-4" />
              </button>
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project Title & Description */}
        <h4 
          onClick={() => onView && onView(project)}
          className="font-bold text-base sm:text-lg leading-snug text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
        >
          {project.title}
        </h4>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed font-normal">
          {project.description}
        </p>
      </div>

      {/* Footer Metrics & Progress Bar */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center text-xs mb-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{project.completedTasksCount || 0} of {project.tasksCount || 0} tasks done</span>
          </div>
          <span className="font-extrabold text-cyan-300 tabular-nums">{progressPercent}%</span>
        </div>

        <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getProgressGradient(progressPercent)}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </SpatialCard>
  );
}

