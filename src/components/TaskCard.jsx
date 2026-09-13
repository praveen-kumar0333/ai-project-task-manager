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

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return {
          label: 'Done',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          icon: CheckCircle2,
          iconColor: 'text-emerald-500'
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: Clock,
          iconColor: 'text-amber-500'
        };
      default:
        return {
          label: 'To Do',
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Circle,
          iconColor: 'text-slate-400'
        };
    }
  };

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
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 group ${
      isDone 
        ? 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300' 
        : 'bg-white border-slate-200/90 hover:border-indigo-300/80'
    }`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.projectTitle && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50/70 text-indigo-700 border border-indigo-100/60">
              <Tag className="w-3 h-3 text-indigo-500" />
              <span className="truncate max-w-[140px]">{task.projectTitle}</span>
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
            {task.priority || 'MEDIUM'}
          </span>
        </div>

        <button
          onClick={() => onDelete && onDelete(task)}
          className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Description */}
      <div className="flex items-start gap-3 mt-2.5">
        <button
          onClick={cycleStatus}
          className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-full transition-transform active:scale-90 cursor-pointer"
          title={`Status: ${statusConfig.label}. Click to toggle status`}
        >
          <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor} hover:scale-110 transition-transform`} />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
            isDone ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 ${
              isDone ? 'text-slate-400/80' : 'text-slate-500'
            }`}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Info: Status Selector & Due Date */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange && onStatusChange(task.id, e.target.value)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer outline-none transition-colors ${statusConfig.classes}`}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{task.dueDate}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
              <UserCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>{task.assignee}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

