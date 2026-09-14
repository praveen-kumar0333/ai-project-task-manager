import React, { useState } from 'react';
import { CheckSquare, Plus, Filter, Tag, Search, RotateCcw } from 'lucide-react';
import TaskCard from '../components/TaskCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GlassPanel from '../components/spatial/GlassPanel.jsx';

export default function TasksView({ 
  tasks = [], 
  projects = [],
  onTaskStatusChange, 
  onDeleteTask, 
  onOpenNewTaskModal,
  searchQuery = '',
  onClearSearch
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.projectTitle && t.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority?.toLowerCase() === priorityFilter.toLowerCase();
    const matchesProject = projectFilter === 'all' || String(t.projectId) === String(projectFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const handleResetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    if (onClearSearch) onClearSearch();
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || Boolean(searchQuery);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Task Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize assignments, prioritize deliverables, and track completion status
          </p>
        </div>
        <button
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 shrink-0 cursor-pointer self-start sm:self-auto border border-white/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Spatial Status Chips Toolbar */}
      <GlassPanel level="base" className="p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-500/30 text-cyan-300 border border-indigo-400/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('todo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'todo'
                ? 'bg-indigo-500/30 text-cyan-300 border border-indigo-400/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            To Do ({todoCount})
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'in-progress'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'done'
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            Done ({doneCount})
          </button>
        </div>

        {/* Dropdown Filters & Reset */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.title}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Priorities</option>
              <option value="urgent" className="bg-slate-900 text-slate-200">Urgent</option>
              <option value="high" className="bg-slate-900 text-slate-200">High</option>
              <option value="medium" className="bg-slate-900 text-slate-200">Medium</option>
              <option value="low" className="bg-slate-900 text-slate-200">Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </GlassPanel>

      {/* Task List Grid / Empty States */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onTaskStatusChange}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks in workspace"
          description="Your task queue is completely empty. Create your first task to start organizing work."
          actionLabel="Create First Task"
          onAction={onOpenNewTaskModal}
        />
      ) : searchQuery ? (
        <EmptyState
          icon={Search}
          title={`No tasks found for "${searchQuery}"`}
          description="No tasks matched your search keywords. Clear the search query or add a new task."
          secondaryActionLabel="Clear Search"
          onSecondaryAction={onClearSearch}
          actionLabel="Create Task"
          onAction={onOpenNewTaskModal}
        />
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match your criteria"
          description="Try adjusting your status, priority, or project filters."
          secondaryActionLabel="Reset Filters"
          onSecondaryAction={handleResetFilters}
          actionLabel="Create Task"
          onAction={onOpenNewTaskModal}
        />
      )}
    </div>
  );
}
