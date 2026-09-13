import React, { useState } from 'react';
import { X, Sparkles, FolderPlus, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Create New Project</h3>
              <p className="text-xs text-slate-400">Initialize a workspace project with tracked milestones</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Notification Microservice"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Project Description
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAi || !title.trim()}
                className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
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
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
              >
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="Security">Security</option>
                <option value="Database">Database</option>
                <option value="Full-Stack">Full-Stack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {submitError}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Creating Project...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
