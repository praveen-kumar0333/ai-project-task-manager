import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Trash2, 
  Tag, 
  UserCircle 
} from 'lucide-react';
import SpatialCard from './spatial/SpatialCard.jsx';

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return {
          label: 'Done',
          classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400'
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
          icon: Clock,
          iconColor: 'text-amber-400'
        };
      default:
        return {
          label: 'To Do',
          classes: 'bg-slate-800/80 text-slate-300 border-white/10',
          icon: Circle,
          iconColor: 'text-slate-400'
        };
    }
  };

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

  const statusConfig = getStatusBadge(task.status);
  const StatusIcon = statusConfig.icon;

  const cycleStatus = () => {
    if (!onStatusChange) return;
    if (task.status === 'todo') onStatusChange(task.id, 'in-progress');
    else if (task.status === 'in-progress') onStatusChange(task.id, 'done');
    else onStatusChange(task.id, 'todo');
  };

  const isDone = task.status === 'done';

  return (
    <SpatialCard 
      depth={8}
      glowColor={isDone ? 'emerald' : 'indigo'}
      className={`p-4 sm:p-5 flex flex-col justify-between group ${
        isDone ? 'opacity-85' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.projectTitle && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-cyan-300 border border-indigo-400/30">
              <Tag className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[140px]">{task.projectTitle}</span>
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
            {task.priority || 'MEDIUM'}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(task);
          }}
          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Description */}
      <div className="flex items-start gap-3 mt-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            cycleStatus();
          }}
          className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 rounded-full transition-transform active:scale-90 cursor-pointer"
          title={`Status: ${statusConfig.label}. Click to toggle status`}
        >
          <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor} hover:scale-110 transition-transform`} />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
            isDone ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-cyan-300'
          }`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 ${
              isDone ? 'text-slate-500/80' : 'text-slate-400'
            }`}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Info: Status Selector & Due Date */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              if (onStatusChange) onStatusChange(task.id, e.target.value);
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer outline-none transition-colors ${statusConfig.classes} bg-slate-900`}
          >
            <option value="todo" className="bg-slate-900 text-slate-200">To Do</option>
            <option value="in-progress" className="bg-slate-900 text-slate-200">In Progress</option>
            <option value="done" className="bg-slate-900 text-slate-200">Done</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{task.dueDate}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
              <UserCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>{task.assignee}</span>
            </div>
          )}
        </div>
      </div>
    </SpatialCard>
  );
}

