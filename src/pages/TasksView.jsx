import React, { useState } from 'react';
import { CheckSquare, Plus, Filter, Calendar, Tag, Search, RotateCcw } from 'lucide-react';
import TaskCard from '../components/TaskCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-slate-900">Task Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize assignments, prioritize deliverables, and track completion status
          </p>
        </div>
        <button
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Status Chips Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('todo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'todo'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            To Do ({todoCount})
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'in-progress'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'done'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Done ({doneCount})
          </button>
        </div>

        {/* Dropdown Filters & Reset */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

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
