import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Loader2 } from 'lucide-react';
import GlassPanel from './spatial/GlassPanel.jsx';

export default function NewTaskModal({ isOpen, onClose, projects = [], onSaveTask }) {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('Alex Dev');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep selected projectId in sync with loaded projects
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (projects.length > 0) {
        const exists = projects.some(p => String(p.id) === String(projectId));
        if (!exists || !projectId) {
          setProjectId(projects[0].id);
        }
      }
    }
  }, [isOpen, projects, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetProjectId = projectId || (projects.length > 0 ? projects[0].id : null);
    if (!targetProjectId) {
      setErrorMessage('Please create or select a project before creating a task.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onSaveTask({
        projectId: targetProjectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || '',
        assignee: assignee || 'Alex Dev'
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <GlassPanel level="floating" className="w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-400/30 text-cyan-400 rounded-xl flex items-center justify-center shadow-md">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Create New Task</h3>
              <p className="text-xs text-slate-400">Add an action item linked to a project</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Associated Project *
            </label>
            {projects.length === 0 ? (
              <p className="text-xs text-amber-300 bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30">
                No active projects found. Please create a project first before assigning tasks.
              </p>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={isSubmitting}
                className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50 cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.title}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Write SQL migration for users table"
              className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all disabled:opacity-50 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              disabled={isSubmitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide implementation details or acceptance criteria..."
              className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all resize-none disabled:opacity-50 placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                disabled={isSubmitting}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50 cursor-pointer"
              >
                <option value="todo" className="bg-slate-900 text-slate-200">To Do</option>
                <option value="in-progress" className="bg-slate-900 text-slate-200">In Progress</option>
                <option value="done" className="bg-slate-900 text-slate-200">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                disabled={isSubmitting}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50 cursor-pointer"
              >
                <option value="Low" className="bg-slate-900 text-slate-200">Low</option>
                <option value="Medium" className="bg-slate-900 text-slate-200">Medium</option>
                <option value="High" className="bg-slate-900 text-slate-200">High</option>
                <option value="Urgent" className="bg-slate-900 text-slate-200">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                disabled={isSubmitting}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || projects.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
