import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Loader2, Plus, AlertCircle, Edit2, Trash2, CheckCircle2, RotateCcw, Bot, Wand2, Layers, SlidersHorizontal } from 'lucide-react';
import { generateTasksWithAI } from '../services/api.js';
import GlassPanel from './spatial/GlassPanel.jsx';

export default function AiTaskGeneratorModal({ 
  isOpen, 
  onClose, 
  projects = [], 
  currentProject, 
  onSaveTasks 
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectRequirements, setProjectRequirements] = useState(
    'User authentication with JWT, protected REST endpoints, relational database persistence, responsive UI and error validation.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selectedTasksIndices, setSelectedTasksIndices] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', priority: 'medium' });
  const [loadingStepText, setLoadingStepText] = useState('Consulting Google Gemini AI...');

  // Cycle loading messages during generation
  useEffect(() => {
    let timer;
    if (isLoading) {
      const messages = [
        'Analyzing project specification...',
        'Consulting Google Gemini AI model...',
        'Architecting task breakdown & milestones...',
        'Refining deliverables and priority scoring...'
      ];
      let i = 0;
      setLoadingStepText(messages[0]);
      timer = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingStepText(messages[i]);
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  // Synchronize initial project selection when modal opens or projects change
  useEffect(() => {
    if (isOpen) {
      const defaultId = currentProject?.id || (projects.length > 0 ? projects[0].id : '');
      setSelectedProjectId(defaultId);
      const matched = projects.find(p => String(p.id) === String(defaultId)) || currentProject;
      if (matched) {
        setProjectName(matched.title || matched.name || '');
        setProjectDescription(matched.description || '');
      }
      setGenerateError('');
      setSaveError('');
      setEditingIndex(null);
    }
  }, [isOpen, currentProject, projects]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (isLoading || isSaving) return;

    const trimmedName = (projectName || '').trim();
    const trimmedDesc = (projectDescription || '').trim();

    if (!trimmedName) {
      setGenerateError('Please enter a project name to generate tasks.');
      return;
    }

    setIsLoading(true);
    setGenerateError('');
    setSaveError('');
    setEditingIndex(null);

    try {
      const response = await generateTasksWithAI({
        projectName: trimmedName,
        projectDescription: trimmedDesc || 'Build and deploy full-stack software application.',
        requirements: (projectRequirements || '').trim() || undefined
      });

      const tasks = response?.data?.tasks || [];
      if (Array.isArray(tasks) && tasks.length > 0) {
        const formatted = tasks.map(t => ({
          title: t.title || 'Untitled Task',
          description: t.description || '',
          priority: (t.priority || 'medium').toLowerCase(),
          status: 'todo'
        }));
        setGeneratedTasks(formatted);
        setSelectedTasksIndices(formatted.map((_, i) => i));
        setGenerateError('');
      } else {
        setGenerateError('No tasks could be generated for this project specification. Please refine your inputs and try again.');
      }
    } catch (error) {
      console.error('Error generating AI tasks:', error);
      let message = error?.message || 'Unable to generate tasks right now. Please try again.';
      if (error?.isUnauthorized || error?.status === 401) {
        message = 'Your session has expired. Please log in again.';
      } else if (error?.isNetworkError || error?.status === 0) {
        message = 'Network failure: Unable to reach backend server. Please verify your connection.';
      }
      setGenerateError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskSelect = (index) => {
    if (selectedTasksIndices.includes(index)) {
      setSelectedTasksIndices(selectedTasksIndices.filter(i => i !== index));
    } else {
      setSelectedTasksIndices([...selectedTasksIndices, index]);
    }
  };

  const handleStartEdit = (idx, task, e) => {
    e.stopPropagation();
    setEditingIndex(idx);
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium'
    });
  };

  const handleSaveEdit = (idx, e) => {
    e.stopPropagation();
    if (!editFormData.title.trim()) return;

    setGeneratedTasks(prev => prev.map((t, i) => {
      if (i === idx) {
        return {
          ...t,
          title: editFormData.title.trim(),
          description: editFormData.description.trim(),
          priority: editFormData.priority.toLowerCase()
        };
      }
      return t;
    }));
    setEditingIndex(null);
  };

  const handleDeleteTask = (idx, e) => {
    e.stopPropagation();
    setGeneratedTasks(prev => prev.filter((_, i) => i !== idx));
    setSelectedTasksIndices(prev => {
      return prev
        .filter(i => i !== idx)
        .map(i => (i > idx ? i - 1 : i));
    });
    if (editingIndex === idx) setEditingIndex(null);
  };

  const handleSaveAllSelected = async () => {
    if (isSaving || isLoading) return;

    if (!selectedProjectId) {
      setSaveError('Please select a target project before saving tasks.');
      return;
    }

    const targetProject = projects.find(p => String(p.id) === String(selectedProjectId));
    if (!targetProject) {
      setSaveError('Selected target project could not be found. Please choose a valid project.');
      return;
    }

    const tasksToSave = generatedTasks
      .filter((_, idx) => selectedTasksIndices.includes(idx))
      .map(t => ({
        title: t.title.trim(),
        description: t.description.trim(),
        priority: t.priority.toLowerCase(),
        status: 'todo',
        projectId: targetProject.id,
        projectTitle: targetProject.title || targetProject.name
      }));

    if (tasksToSave.length === 0) {
      setSaveError('Please select at least one task to save to the database.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      if (onSaveTasks) {
        await onSaveTasks(targetProject.id, tasksToSave);
      }
      setGeneratedTasks([]);
      setSelectedTasksIndices([]);
      onClose();
    } catch (err) {
      console.error('Error saving batch tasks to MySQL:', err);
      setSaveError(err?.message || 'Failed to persist tasks to MySQL database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <GlassPanel level="floating" className="w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">AI Task Generator</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Gemini
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Generate structured engineering tasks with Google Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Target Project Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Target Project <span className="text-rose-400">*</span>
            </label>
            {projects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const p = projects.find(item => String(item.id) === String(e.target.value));
                  if (p) {
                    setProjectName(p.title || p.name || '');
                    setProjectDescription(p.description || '');
                  }
                }}
                disabled={isSaving || isLoading}
                className="w-full text-xs sm:text-sm font-medium bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.title || p.name}</option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>No existing projects found. Please create a project first before saving AI tasks.</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isSaving || isLoading}
                placeholder="e.g., Cloud Authentication Gateway"
                className="w-full text-xs sm:text-sm font-medium bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all disabled:opacity-60 shadow-2xs placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Key Requirements
              </label>
              <input
                type="text"
                value={projectRequirements}
                onChange={(e) => setProjectRequirements(e.target.value)}
                disabled={isSaving || isLoading}
                placeholder="e.g., JWT, bcrypt, MySQL, Unit tests"
                className="w-full text-xs sm:text-sm font-medium bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all disabled:opacity-60 shadow-2xs placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Description
            </label>
            <textarea
              rows={2}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={isSaving || isLoading}
              placeholder="Describe architecture goals or user deliverables..."
              className="w-full text-xs sm:text-sm font-medium bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-400 transition-all resize-none disabled:opacity-60 shadow-2xs placeholder:text-slate-500"
            />
          </div>

          {generateError && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <p className="font-semibold">{generateError}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setGenerateError('')}
                className="text-rose-400 hover:text-rose-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {saveError && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <p className="font-semibold">Save Error: {saveError}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSaveError('')}
                className="text-rose-400 hover:text-rose-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Generator Action Button & Loading Visualizer */}
          {isLoading ? (
            <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-200">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse border border-white/20">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{loadingStepText}</p>
                <p className="text-xs text-cyan-400 mt-0.5 font-medium">Generating structured tasks with Google Gemini API</p>
              </div>
              <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full w-2/3 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isLoading || isSaving || !projectName.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 border border-white/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generatedTasks.length > 0 ? 'Regenerate Tasks with Gemini' : 'Generate Tasks with Google Gemini'}</span>
            </button>
          )}

          {/* Generated Tasks Review List */}
          {generatedTasks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Review AI Suggestions</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedTasksIndices.length} of {generatedTasks.length} tasks selected for persistence
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTasksIndices.length === generatedTasks.length) {
                        setSelectedTasksIndices([]);
                      } else {
                        setSelectedTasksIndices(generatedTasks.map((_, i) => i));
                      }
                    }}
                    className="text-xs text-cyan-400 font-bold hover:text-cyan-300 cursor-pointer px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >
                    {selectedTasksIndices.length === generatedTasks.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {generatedTasks.map((task, idx) => {
                  const isSelected = selectedTasksIndices.includes(idx);
                  const isEditing = editingIndex === idx;

                  if (isEditing) {
                    return (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-2xl border border-cyan-400/40 bg-slate-900/90 space-y-2.5 shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            className="flex-1 text-xs sm:text-sm bg-slate-800 border border-white/15 rounded-xl px-3 py-1.5 text-white outline-none focus:border-cyan-400 font-semibold"
                            placeholder="Task title"
                          />
                          <select
                            value={editFormData.priority}
                            onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                            className="text-xs font-semibold bg-slate-800 border border-white/15 rounded-xl px-2.5 py-1.5 text-white outline-none cursor-pointer"
                          >
                            <option value="low" className="bg-slate-900">Low</option>
                            <option value="medium" className="bg-slate-900">Medium</option>
                            <option value="high" className="bg-slate-900">High</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          className="w-full text-xs bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-slate-300 outline-none focus:border-cyan-400 resize-none"
                          placeholder="Task description"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleSaveEdit(idx, e)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer flex items-center gap-1 shadow-md transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTaskSelect(idx)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 shadow-sm ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-indigo-400/40 hover:border-indigo-400/60' 
                          : 'bg-slate-900/50 border-white/10 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center text-white shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 border-indigo-500 shadow-sm' : 'border-white/20 bg-slate-800'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{task.title}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                              task.priority === 'high'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : task.priority === 'medium'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {task.priority}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleStartEdit(idx, task, e)}
                              title="Edit task before saving"
                              className="p-1 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTask(idx, e)}
                              title="Remove from generated list"
                              className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white/5 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            {generatedTasks.length > 0 ? (
              <span>{selectedTasksIndices.length} of {generatedTasks.length} tasks ready to save</span>
            ) : (
              <span>Awaiting Gemini generation</span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAllSelected}
              disabled={isSaving || selectedTasksIndices.length === 0 || !selectedProjectId}
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25 border border-white/20 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Tasks to MySQL...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Selected Tasks ({selectedTasksIndices.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

