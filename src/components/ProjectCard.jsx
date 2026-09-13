import React from 'react';
import { 
  Server, 
  ShieldCheck, 
  Layout, 
  Database, 
  MoreVertical, 
  Trash2, 
  Eye, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export default function ProjectCard({ project, onView, onDelete }) {
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'backend':
        return { 
          icon: Server, 
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border-blue-200/60' 
        };
      case 'security':
        return { 
          icon: ShieldCheck, 
          bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border-emerald-200/60' 
        };
      case 'frontend':
        return { 
          icon: Layout, 
          bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-600 border-purple-200/60' 
        };
      case 'database':
        return { 
          icon: Database, 
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border-amber-200/60' 
        };
      default:
        return { 
          icon: Layers, 
          bg: 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border-indigo-200/60' 
        };
    }
  };

  const { icon: CategoryIcon, bg: iconStyle } = getCategoryIcon(project.category);

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'text-rose-700 bg-rose-50 border-rose-200/80';
      case 'high':
        return 'text-amber-700 bg-amber-50 border-amber-200/80';
      case 'medium':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200/80';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getProgressGradient = (progress) => {
    if (progress >= 90) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (progress >= 50) return 'bg-gradient-to-r from-indigo-600 to-purple-500';
    return 'bg-gradient-to-r from-amber-500 to-orange-400';
  };

  const progressPercent = Math.min(100, Math.max(0, project.progress || 0));

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-indigo-300/80 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Header: Category Icon & Badges / Actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${iconStyle}`}>
              <CategoryIcon className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-semibold text-slate-400 capitalize hidden sm:inline">
              {project.category || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider shadow-2xs ${getPriorityBadge(project.priority)}`}>
              {project.priority || 'NORMAL'}
            </span>
            <div className="flex items-center gap-1 ml-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onView && onView(project)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="View Project Details & Tasks"
              >
                <Eye className="w-4 h-4" />
              </button>
              {onDelete && (
                <button 
                  onClick={() => onDelete(project)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          className="font-bold text-base sm:text-lg leading-snug text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
        >
          {project.title}
        </h4>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed font-normal">
          {project.description}
        </p>
      </div>

      {/* Footer Metrics & Progress Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs mb-2">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.completedTasksCount || 0} of {project.tasksCount || 0} tasks done</span>
          </div>
          <span className="font-extrabold text-slate-800 tabular-nums">{progressPercent}%</span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getProgressGradient(progressPercent)}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

