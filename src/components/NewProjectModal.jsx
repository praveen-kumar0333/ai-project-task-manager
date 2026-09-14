import React, { useState } from 'react';
import { X, Sparkles, FolderPlus, Loader2 } from 'lucide-react';
import GlassPanel from './spatial/GlassPanel.jsx';

export default function NewProjectModal({ isOpen, onClose, onSaveProject }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Backend');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleGenerateAiDescription = () => {
    if (!title.trim() || isSubmitting) return;
    setIsGeneratingAi(true);

    setTimeout(() => {
      let generatedDesc = '';
      if (title.toLowerCase().includes('auth') || title.toLowerCase().includes('jwt')) {
        generatedDesc = 'Secure authentication and authorization service with JWT token issuance, refresh token rotation, bcrypt password hashing, and role-based access control.';
      } else if (title.toLowerCase().includes('api') || title.toLowerCase().includes('service')) {
        generatedDesc = 'High-performance Node.js and Express REST API service with input validation, centralized error handling, and normalized database persistence.';
      } else if (title.toLowerCase().includes('dash') || title.toLowerCase().includes('metric')) {
        generatedDesc = 'Responsive productivity dashboard designed with Clean Minimalism aesthetics, intuitive progress tracking, search filters, and real-time state updates.';
      } else {
        generatedDesc = `Engineered full-stack module for ${title} featuring structured database models, validated REST endpoints, and an accessible, responsive user interface.`;
      }
      setDescription(generatedDesc);
      setIsGeneratingAi(false);
    }, 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSaveProject({
        title: title.trim(),
        description: description.trim() || 'No description provided.',
        category,
        priority,
        status: 'planning',
        dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });

      // Reset and close
      setTitle('');
      setDescription('');
      setCategory('Backend');
      setPriority('Medium');
      setDueDate('');
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create project. Please check backend connection.');
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
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Create New Project</h3>
              <p className="text-xs text-slate-400">Initialize a workspace project with tracked milestones</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Notification Microservice"
              className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all placeholder:text-slate-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Project Description
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAi || !title.trim()}
                className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 flex items-center gap-1 disabled:opacity-40 cursor-pointer transition-colors"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Writing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Description with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the scope and purpose..."
              className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all resize-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Backend" className="bg-slate-900 text-slate-200">Backend</option>
                <option value="Frontend" className="bg-slate-900 text-slate-200">Frontend</option>
                <option value="Security" className="bg-slate-900 text-slate-200">Security</option>
                <option value="Database" className="bg-slate-900 text-slate-200">Database</option>
                <option value="Full-Stack" className="bg-slate-900 text-slate-200">Full-Stack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Low" className="bg-slate-900 text-slate-200">Low</option>
                <option value="Medium" className="bg-slate-900 text-slate-200">Medium</option>
                <option value="High" className="bg-slate-900 text-slate-200">High</option>
                <option value="Urgent" className="bg-slate-900 text-slate-200">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
              {submitError}
            </div>
          )}

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
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Creating Project...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
