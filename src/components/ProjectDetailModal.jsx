import React from 'react';
import { X, Calendar, CheckCircle2, Tag, Plus, Server } from 'lucide-react';
import TaskCard from '../components/TaskCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ProjectDetailModal({ 
  project, 
  tasks = [], 
  isOpen, 
  onClose, 
  onTaskStatusChange,
  onDeleteTask,
  onOpenNewTaskModal
}) {
  if (!isOpen || !project) return null;

  const projectTasks = tasks.filter(t => String(t.projectId) === String(project.id));
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  const progressPercent = projectTasks.length > 0 
    ? Math.round((doneTasks.length / projectTasks.length) * 100) 
    : project.progress || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                {project.category}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                {project.priority} Priority
              </span>
            </div>
            <h3 className="font-bold text-xl text-slate-900">{project.title}</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{project.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar info */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sprint Completion:</span>
            <span className="font-bold text-slate-800">{progressPercent}%</span>
            <span className="text-slate-400">({doneTasks.length}/{projectTasks.length} tasks)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Due: {project.dueDate}
            </span>
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base text-slate-900">Project Tasks ({projectTasks.length})</h4>
            <button
              onClick={onOpenNewTaskModal}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task to Project</span>
            </button>
          </div>

          {projectTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projectTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onTaskStatusChange}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No tasks linked to this project"
              description="Break down this project into deliverables using the button above or AI Task Generator."
              actionLabel="Add First Task"
              onAction={onOpenNewTaskModal}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
