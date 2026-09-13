import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Check, Loader2, Lightbulb, FileText, CheckSquare, Plus, AlertCircle, X, Edit2, Trash2, MessageSquare, Database } from 'lucide-react';
import { generateTasksWithAI, getDocuments } from '../services/api.js';
import ChatInterface from '../components/chat/ChatInterface.jsx';
import DocumentKnowledgeBase from '../components/chat/DocumentKnowledgeBase.jsx';

export default function AiAssistantView({ 
  projects = [], 
  tasks = [], 
  onSaveTasks,
  onSaveProject
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'knowledge-base', 'task-gen', 'desc-gen', 'productivity'
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    getDocuments()
      .then(res => {
        if (Array.isArray(res?.data)) {
          setDocumentCount(res.data.length);
        }
      })
      .catch(() => {});
  }, []);

  // Task Gen State (Connected to real backend Gemini API)
  const [taskGenProject, setTaskGenProject] = useState(projects[0]?.id || '');
  const [taskGenName, setTaskGenName] = useState(projects[0]?.title || 'Cloud Auth Gateway');
  const [taskGenDesc, setTaskGenDesc] = useState('Centralized API gateway with JWT authorization, rate limiting, and audit logging.');
  const [taskGenReqs, setTaskGenReqs] = useState('Express middleware, bcrypt password hashing, MySQL foreign keys, automated testing.');
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isSavingTasks, setIsSavingTasks] = useState(false);
  const [taskGenError, setTaskGenError] = useState('');
  const [taskSaveError, setTaskSaveError] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState([]);
  const [editingTaskIdx, setEditingTaskIdx] = useState(null);
  const [taskEditForm, setTaskEditForm] = useState({ title: '', description: '', priority: 'medium' });

  // Desc Gen State (Preview UI — backend endpoint planned for future step)
  const [descProjectName, setDescProjectName] = useState('');
  const [descOutput, setDescOutput] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Productivity State (Preview UI — backend endpoint planned for future step)
  const [productivityReport, setProductivityReport] = useState(null);
  const [isAnalyzingProductivity, setIsAnalyzingProductivity] = useState(false);

  const handleGenerateTasks = async () => {
    // Prevent duplicate requests while generating
    if (isGeneratingTasks) return;

    const trimmedName = (taskGenName || '').trim();
    const trimmedDesc = (taskGenDesc || '').trim();

    if (!trimmedName) {
      setTaskGenError('Please enter a project name to generate tasks.');
      return;
    }

    setIsGeneratingTasks(true);
    setTaskGenError('');

    try {
      const response = await generateTasksWithAI({
        projectName: trimmedName,
        projectDescription: trimmedDesc || 'Build and deploy full-stack software application.',
        requirements: (taskGenReqs || '').trim() || undefined
      });

      const suggestions = response?.data?.tasks || [];
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        setGeneratedTasks(suggestions);
        setSelectedTaskIndices(suggestions.map((_, i) => i));
        setTaskGenError('');
      } else {
        setTaskGenError('No tasks could be generated for this project specification. Please refine your inputs and try again.');
      }
    } catch (error) {
      console.error('Failed to generate AI tasks on AI Assistant view:', error);
      let message = error?.message || 'Unable to generate tasks right now. Please try again.';
      if (error?.isUnauthorized || error?.status === 401) {
        message = 'Your session has expired. Please log in again.';
      } else if (error?.isNetworkError || error?.status === 0) {
        message = 'Network failure: Unable to reach backend server. Please verify your connection.';
      }
      setTaskGenError(message);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const handleStartEditTask = (idx, task, e) => {
    e.stopPropagation();
    setEditingTaskIdx(idx);
    setTaskEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium'
    });
  };

  const handleSaveEditTask = (idx, e) => {
    e.stopPropagation();
    if (!taskEditForm.title.trim()) return;

    setGeneratedTasks(prev => prev.map((t, i) => {
      if (i === idx) {
        return {
          ...t,
          title: taskEditForm.title.trim(),
          description: taskEditForm.description.trim(),
          priority: taskEditForm.priority.toLowerCase()
        };
      }
      return t;
    }));
    setEditingTaskIdx(null);
  };

  const handleDeleteGeneratedTask = (idx, e) => {
    e.stopPropagation();
    setGeneratedTasks(prev => prev.filter((_, i) => i !== idx));
    setSelectedTaskIndices(prev => {
      return prev
        .filter(i => i !== idx)
        .map(i => (i > idx ? i - 1 : i));
    });
    if (editingTaskIdx === idx) setEditingTaskIdx(null);
  };

  const handleSaveTasks = async () => {
    if (isSavingTasks || isGeneratingTasks) return;

    if (!taskGenProject) {
      setTaskSaveError('Please select a target project to persist these tasks.');
      return;
    }

    const targetProject = projects.find(p => String(p.id) === String(taskGenProject));
    if (!targetProject) {
      setTaskSaveError('Selected project could not be found. Please choose an active project.');
      return;
    }

    const tasksToSave = generatedTasks
      .filter((_, idx) => selectedTaskIndices.includes(idx))
      .map(t => ({
        title: (t.title || '').trim(),
        description: (t.description || '').trim(),
        priority: (t.priority || 'medium').toLowerCase(),
        status: 'todo',
        projectId: targetProject.id,
        projectTitle: targetProject.title || targetProject.name
      }));

    if (tasksToSave.length === 0) {
      setTaskSaveError('Please select at least one task to save to MySQL.');
      return;
    }

    setIsSavingTasks(true);
    setTaskSaveError('');

    try {
      if (onSaveTasks) {
        await onSaveTasks(targetProject.id, tasksToSave);
      }
      setGeneratedTasks([]);
      setSelectedTaskIndices([]);
      setEditingTaskIdx(null);
    } catch (err) {
      console.error('Failed to save tasks from AI Assistant:', err);
      setTaskSaveError(err?.message || 'Failed to save tasks to MySQL. Please try again.');
    } finally {
      setIsSavingTasks(false);
    }
  };

  const handleGenerateDesc = () => {
    if (!descProjectName.trim()) return;
    setIsGeneratingDesc(true);
    setTimeout(() => {
      setDescOutput(
        `A production-grade ${descProjectName} designed for high reliability and developer ergonomics. Featuring modular Express.js REST API routes, secure password hashing, prepared MySQL queries to eliminate SQL injections, and an accessible, responsive Clean Minimalist React interface with real-time state synchronization.`
      );
      setIsGeneratingDesc(false);
    }, 700);
  };

  const handleAnalyzeProductivity = () => {
    setIsAnalyzingProductivity(true);
    setTimeout(() => {
      setProductivityReport({
        velocityScore: '88/100',
        summary: 'Your current sprint velocity is high. Auth Microservice is 95% complete and ready for final staging testing.',
        recommendations: [
          {
            title: 'High Priority Bottleneck',
            detail: 'Task "Implement Stripe Webhook Handler" has been in progress for 3 days. Consider testing with mock Stripe CLI triggers.'
          },
          {
            title: 'Quick Wins',
            detail: 'Cloud Database Migration has 2 unassigned tasks in "To Do". Completing schema DDL will unblock dependent backend modules.'
          },
          {
            title: 'Focus Recommendation',
            detail: 'Finalize Auth Microservice token rotation to achieve 100% completion before onboarding next sprint items.'
          }
        ]
      });
      setIsAnalyzingProductivity(false);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="font-bold text-2xl text-slate-900">Google Gemini AI Assistant</h2>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Smart developer assistant for task generation, architectural descriptions, and workflow optimization
        </p>
      </div>

      {/* Feature Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-xl">
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'chat'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat Assistant</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">Voice &amp; Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('knowledge-base')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'knowledge-base'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">RAG</span>
        </button>
        <button
          onClick={() => setActiveTab('task-gen')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'task-gen'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Task Breakdown</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">Generator</span>
        </button>
        <button
          onClick={() => setActiveTab('desc-gen')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'desc-gen'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Description</span>
          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">Preview</span>
        </button>
        <button
          onClick={() => setActiveTab('productivity')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'productivity'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Productivity</span>
          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">Preview</span>
        </button>
      </div>

      {/* Tab: Conversational Chat with RAG and Voice */}
      {activeTab === 'chat' && (
        <ChatInterface 
          documentCount={documentCount}
          onOpenKnowledgeBase={() => setActiveTab('knowledge-base')}
        />
      )}

      {/* Tab: Document Knowledge Base Management */}
      {activeTab === 'knowledge-base' && (
        <DocumentKnowledgeBase 
          onDocumentsChanged={(docs) => setDocumentCount(docs.length)}
        />
      )}

      {/* Tab 1: AI-Assisted Task Generation */}
      {activeTab === 'task-gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Task Breakdown Input</h3>
              <p className="text-xs text-slate-400">Enter project specs to generate actionable tasks via backend Gemini API</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Link to Project
              </label>
              <select
                value={taskGenProject}
                onChange={(e) => {
                  setTaskGenProject(e.target.value);
                  const p = projects.find(item => item.id === e.target.value);
                  if (p) {
                    setTaskGenName(p.title);
                    setTaskGenDesc(p.description);
                  }
                }}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={taskGenName}
                onChange={(e) => setTaskGenName(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Description
              </label>
              <textarea
                rows={2}
                value={taskGenDesc}
                onChange={(e) => setTaskGenDesc(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Requirements & Tech Stack
              </label>
              <textarea
                rows={3}
                value={taskGenReqs}
                onChange={(e) => setTaskGenReqs(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {taskGenError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">{taskGenError}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setTaskGenError('')}
                  className="text-rose-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleGenerateTasks}
              disabled={isGeneratingTasks || !taskGenName.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isGeneratingTasks ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating your task breakdown...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Tasks List</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Generated Task Suggestions</h3>
                  <p className="text-xs text-slate-400">Review, edit, and select AI-generated items before database persistence</p>
                </div>
                {generatedTasks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {selectedTaskIndices.length} of {generatedTasks.length} Selected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTaskIndices.length === generatedTasks.length) {
                          setSelectedTaskIndices([]);
                        } else {
                          setSelectedTaskIndices(generatedTasks.map((_, i) => i));
                        }
                      }}
                      className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer ml-1"
                    >
                      {selectedTaskIndices.length === generatedTasks.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                )}
              </div>

              {taskSaveError && (
                <div className="mb-3.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Persistence Error: {taskSaveError}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setTaskSaveError('')}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {generatedTasks.length > 0 ? (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {generatedTasks.map((task, idx) => {
                    const isSelected = selectedTaskIndices.includes(idx);
                    const isEditing = editingTaskIdx === idx;

                    if (isEditing) {
                      return (
                        <div 
                          key={idx} 
                          className="p-3.5 rounded-xl border border-indigo-300 bg-indigo-50/30 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={taskEditForm.title}
                              onChange={(e) => setTaskEditForm({ ...taskEditForm, title: e.target.value })}
                              className="flex-1 text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:border-indigo-500 font-medium"
                              placeholder="Task title"
                            />
                            <select
                              value={taskEditForm.priority}
                              onChange={(e) => setTaskEditForm({ ...taskEditForm, priority: e.target.value })}
                              className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 outline-none"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <textarea
                            rows={2}
                            value={taskEditForm.description}
                            onChange={(e) => setTaskEditForm({ ...taskEditForm, description: e.target.value })}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500 resize-none"
                            placeholder="Task description"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingTaskIdx(null)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-md cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSaveEditTask(idx, e)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer flex items-center gap-1"
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
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTaskIndices(selectedTaskIndices.filter(i => i !== idx));
                          } else {
                            setSelectedTaskIndices([...selectedTaskIndices, idx]);
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected 
                            ? 'bg-indigo-50/40 border-indigo-200' 
                            : 'bg-white border-slate-200 opacity-60'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-white shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">{task.title}</h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                (task.priority || '').toLowerCase() === 'high' || (task.priority || '').toLowerCase() === 'urgent'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : (task.priority || '').toLowerCase() === 'medium'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {task.priority}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleStartEditTask(idx, task, e)}
                                title="Edit task before saving"
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteGeneratedTask(idx, e)}
                                title="Remove task from suggestions"
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl my-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No tasks generated yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Fill in your project details on the left and click "Generate Tasks List" to invoke Gemini.
                  </p>
                </div>
              )}
            </div>

            {generatedTasks.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                <span className="text-xs text-slate-500">
                  Target: <strong className="text-slate-700">{projects.find(p => String(p.id) === String(taskGenProject))?.title || 'Selected Project'}</strong>
                </span>
                <button
                  onClick={handleSaveTasks}
                  disabled={isSavingTasks || selectedTaskIndices.length === 0}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSavingTasks ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Tasks to MySQL...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save Selected Tasks ({selectedTaskIndices.length})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: AI-Generated Project Description */}
      {activeTab === 'desc-gen' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-900">Generate Project Description</h3>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                Preview Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive preview. Real-time Gemini description generation endpoint is planned for an upcoming backend step.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Title or Concept
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={descProjectName}
                onChange={(e) => setDescProjectName(e.target.value)}
                placeholder="e.g., Microservice Rate Limiter with Redis"
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <button
                onClick={handleGenerateDesc}
                disabled={isGeneratingDesc || !descProjectName.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                {isGeneratingDesc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Preview</span>
              </button>
            </div>
          </div>

          {descOutput && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Sample Architectural Overview
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(descOutput);
                  }}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                >
                  Copy text
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{descOutput}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Productivity Suggestions */}
      {activeTab === 'productivity' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">Sprint Productivity Analysis</h3>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  Preview Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates task velocity, backlog bottlenecks, and prioritization. Full backend telemetry endpoint planned for an upcoming step.
              </p>
            </div>
            <button
              onClick={handleAnalyzeProductivity}
              disabled={isAnalyzingProductivity}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isAnalyzingProductivity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
              <span>Run Preview Audit</span>
            </button>
          </div>

          {productivityReport ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Health Index</span>
                  <p className="text-sm text-slate-700 mt-1">{productivityReport.summary}</p>
                </div>
                <span className="text-2xl font-bold text-indigo-700 px-3 py-1 bg-white rounded-xl shadow-xs shrink-0">
                  {productivityReport.velocityScore}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actionable Recommendations</h4>
                {productivityReport.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <h5 className="font-semibold text-sm text-slate-800">{rec.title}</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-10 border border-dashed border-slate-200 rounded-xl text-center">
              <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Audit Ready</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click "Run AI Audit" to have Gemini inspect your current projects and tasks for workflow bottlenecks.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
