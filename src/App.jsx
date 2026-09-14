import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import DashboardView from './pages/DashboardView.jsx';
import ProjectsView from './pages/ProjectsView.jsx';
import TasksView from './pages/TasksView.jsx';
import AiAssistantView from './pages/AiAssistantView.jsx';
import ProfileView from './pages/ProfileView.jsx';
import NewProjectModal from './components/NewProjectModal.jsx';
import NewTaskModal from './components/NewTaskModal.jsx';
import AiTaskGeneratorModal from './components/AiTaskGeneratorModal.jsx';
import ConfirmationModal from './components/ConfirmationModal.jsx';
import ProjectDetailModal from './components/ProjectDetailModal.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import Toast from './components/Toast.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SpatialBackground from './components/spatial/SpatialBackground.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { 
  getProjects, 
  createProject, 
  deleteProject, 
  getTasks, 
  createTask, 
  createTasksBatch,
  updateTaskStatus, 
  deleteTask,
  getActivities
} from './services/api.js';
import { normalizeProject, prepareProjectPayload } from './utils/projectNormalizer.js';
import { normalizeTask, prepareTaskPayload } from './utils/taskNormalizer.js';
import { enrichProjectsWithMetrics } from './utils/dashboardMetrics.js';
import { normalizeActivity } from './utils/activityNormalizer.js';

import { 
  initialUser, 
  initialProjects, 
  initialTasks, 
  initialActivities 
} from './data/dummyData.js';

export default function App() {
  const { user: authUser, isAuthenticated, authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  // Realistic UI State Management (Loading & Error States)
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Merge context user profile with initial attributes safely
  const user = authUser ? { ...initialUser, ...authUser } : initialUser;

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);

  // Dynamically enrich projects with metrics derived from real tasks (single source of truth)
  const enrichedProjects = useMemo(() => {
    return enrichProjectsWithMetrics(projects, tasks);
  }, [projects, tasks]);

  // Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [detailProject, setDetailProject] = useState(null);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Delete',
    onConfirm: () => {}
  });

  // Feedback Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Fetch persistent activities from MySQL REST API
  const fetchActivitiesData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await getActivities();
      const rawActivities = Array.isArray(response)
        ? response
        : (response?.data && Array.isArray(response.data) ? response.data : []);
      const normalized = rawActivities.map(normalizeActivity).filter(Boolean);
      setActivities(normalized);
    } catch (err) {
      console.warn('Failed to refresh activities from backend:', err?.message || err);
    }
  }, [isAuthenticated]);

  // Centralized loader to fetch projects, tasks, and persistent activities from MySQL REST API
  const fetchWorkspaceData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setIsError(false);
    setErrorDetails(null);
    try {
      const [projectsResponse, tasksResponse, activitiesResponse] = await Promise.all([
        getProjects(),
        getTasks(),
        getActivities().catch(err => {
          console.warn('Activities failed to load:', err);
          return { data: [] };
        })
      ]);

      const rawProjects = Array.isArray(projectsResponse)
        ? projectsResponse
        : (projectsResponse?.data && Array.isArray(projectsResponse.data) ? projectsResponse.data : []);

      const rawTasks = Array.isArray(tasksResponse)
        ? tasksResponse
        : (tasksResponse?.data && Array.isArray(tasksResponse.data) ? tasksResponse.data : []);

      const rawActivities = Array.isArray(activitiesResponse)
        ? activitiesResponse
        : (activitiesResponse?.data && Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []);

      // Normalize tasks with project titles resolved from loaded projects
      const normalizedTasks = rawTasks.map(t => normalizeTask(t, rawProjects));
      setTasks(normalizedTasks);

      // Normalize projects with task counts and progress computed from real tasks
      const normalizedProjects = rawProjects.map(p => normalizeProject(p, normalizedTasks));
      setProjects(normalizedProjects);

      // Normalize real persistent activities from MySQL
      const normalizedActivities = rawActivities.map(normalizeActivity).filter(Boolean);
      setActivities(normalizedActivities);
    } catch (err) {
      if (!err?.isUnauthorized) {
        setIsError(true);
        setErrorDetails(err.message || 'Failed to retrieve workspace data from backend.');
        showToast(err.message || 'Failed to retrieve workspace data', 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [isAuthenticated]);

  // Load real workspace data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaceData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchWorkspaceData]);

  // Listen for session expiration or unauthorized API responses
  useEffect(() => {
    const handleUnauthorizedToast = (event) => {
      const endpoint = event?.detail?.endpoint || '';
      // Only display session expiration banner if request was not an auth form attempt
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        showToast('Your session has expired or is invalid. Please sign in again.', 'info');
      }
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('auth:unauthorized', handleUnauthorizedToast);
    }
    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('auth:unauthorized', handleUnauthorizedToast);
      }
    };
  }, []);

  // Data reload via real API
  const handleSimulateReload = async () => {
    await fetchWorkspaceData();
    showToast('Workspace data reloaded successfully!', 'success');
  };

  // Toggle simulated error for testing
  const handleToggleSimulateError = () => {
    if (isError) {
      setIsError(false);
      setErrorDetails(null);
      showToast('Simulated error dismissed', 'info');
    } else {
      setIsError(true);
      setErrorDetails('Simulated API connection failure (HTTP 500 Internal Server Error / Endpoint unreachable).');
      showToast('Simulated API error triggered for testing ErrorState', 'error');
    }
  };

  // Error recovery via Retry
  const handleRetryConnection = () => {
    setIsRetrying(true);
    fetchWorkspaceData();
  };

  // Reset workspace state helper
  const handleResetWorkspaceState = () => {
    setProjects(initialProjects);
    setTasks(initialTasks);
    setActivities(initialActivities);
    setIsError(false);
    setErrorDetails(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Workspace reset to initial dataset', 'success');
    }, 500);
  };

  // Helper to recalculate project progress based on tasks
  const recalculateProjectProgress = (projId, currentTasks) => {
    const pTasks = currentTasks.filter(t => String(t.projectId) === String(projId));
    const doneCount = pTasks.filter(t => t.status === 'done').length;
    const progress = pTasks.length > 0 ? Math.round((doneCount / pTasks.length) * 100) : 0;

    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projId)) {
        return {
          ...p,
          tasksCount: pTasks.length,
          completedTasksCount: doneCount,
          progress
        };
      }
      return p;
    }));
  };

  // Task Status Toggle handler via REST API
  const handleTaskStatusChange = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    // Optimistically update React state
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(updatedTasks);
    recalculateProjectProgress(targetTask.projectId, updatedTasks);

    try {
      const response = await updateTaskStatus(taskId, newStatus);
      const updatedData = response?.data || response;
      const normalized = normalizeTask(updatedData, projects);

      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...normalized } : t)));

      // Synchronize persistent activity stream from MySQL
      fetchActivitiesData();

      showToast(`Task moved to ${newStatus === 'done' ? 'Done' : newStatus === 'in-progress' ? 'In Progress' : 'To Do'}`);
    } catch (err) {
      // Revert React state on failure
      setTasks(originalTasks);
      recalculateProjectProgress(targetTask.projectId, originalTasks);
      showToast(err.message || 'Failed to update task status', 'error');
    }
  };

  // Project Deletion via REST API
  const confirmDeleteProject = (project) => {
    setConfirmation({
      isOpen: true,
      title: `Delete "${project.title}"?`,
      message: `Are you sure you want to delete this project? All associated tasks will also be removed.`,
      confirmLabel: 'Delete Project',
      onConfirm: async () => {
        try {
          await deleteProject(project.id);
          setProjects(prev => prev.filter(p => String(p.id) !== String(project.id)));
          setTasks(prev => prev.filter(t => String(t.projectId) !== String(project.id)));
          // Synchronize persistent activity stream from MySQL
          fetchActivitiesData();
          showToast(`Project "${project.title}" was deleted.`, 'info');
        } catch (err) {
          showToast(err.message || 'Failed to delete project', 'error');
        }
      }
    });
  };

  // Task Deletion via REST API
  const confirmDeleteTask = (task) => {
    setConfirmation({
      isOpen: true,
      title: `Delete Task?`,
      message: `Are you sure you want to delete "${task.title}"?`,
      confirmLabel: 'Delete Task',
      onConfirm: async () => {
        try {
          await deleteTask(task.id);
          const remaining = tasks.filter(t => t.id !== task.id);
          setTasks(remaining);
          recalculateProjectProgress(task.projectId, remaining);
          // Synchronize persistent activity stream from MySQL
          fetchActivitiesData();
          showToast(`Task "${task.title}" removed.`, 'info');
        } catch (err) {
          showToast(err.message || 'Failed to delete task', 'error');
        }
      }
    });
  };

  // Create Project via REST API
  const handleSaveProject = async (formData) => {
    try {
      const payload = prepareProjectPayload(formData);
      const response = await createProject(payload);
      const createdData = response?.data || response;

      const normalized = normalizeProject({
        ...createdData,
        category: formData.category || 'Backend',
        dueDate: formData.dueDate || ''
      }, tasks);

      setProjects(prev => [normalized, ...prev]);
      // Synchronize persistent activity stream from MySQL
      fetchActivitiesData();
      showToast(`Project "${normalized.title}" created successfully!`);
      return normalized;
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
      throw err;
    }
  };

  // Create Task via REST API
  const handleSaveTask = async (formData) => {
    try {
      const payload = prepareTaskPayload(formData);
      const response = await createTask(payload);
      const createdData = response?.data || response;

      const normalized = normalizeTask(createdData, projects);

      const updated = [normalized, ...tasks];
      setTasks(updated);
      recalculateProjectProgress(normalized.projectId, updated);

      // Synchronize persistent activity stream from MySQL
      fetchActivitiesData();
      showToast(`Task "${normalized.title}" created!`);
      return normalized;
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
      throw err;
    }
  };

  // Add multiple AI Generated Tasks to MySQL in batch
  const handleSaveAiTasks = async (projectIdOrTasks, maybeTasks) => {
    let targetProjectId = null;
    let rawTasksList = [];

    if (Array.isArray(projectIdOrTasks)) {
      rawTasksList = projectIdOrTasks;
      targetProjectId = projectIdOrTasks[0]?.projectId;
    } else {
      targetProjectId = projectIdOrTasks;
      rawTasksList = Array.isArray(maybeTasks) ? maybeTasks : [];
    }

    if (!targetProjectId) {
      const err = new Error('Please select a valid project to save the generated tasks.');
      showToast(err.message, 'error');
      throw err;
    }

    if (!rawTasksList || rawTasksList.length === 0) {
      const err = new Error('Please select at least one task to save.');
      showToast(err.message, 'error');
      throw err;
    }

    const numericProjectId = parseInt(targetProjectId, 10);
    const cleanTasksPayload = rawTasksList.map(t => {
      const rawPriority = (t.priority || 'medium').toString().toLowerCase();
      const validPriority = (rawPriority === 'urgent' || rawPriority === 'critical')
        ? 'high'
        : (['low', 'medium', 'high'].includes(rawPriority) ? rawPriority : 'medium');

      return {
        title: (t.title || '').trim(),
        description: (t.description || '').trim(),
        priority: validPriority,
        status: (t.status || 'todo').toString().toLowerCase(),
        dueDate: t.dueDate || null
      };
    });

    try {
      const response = await createTasksBatch(numericProjectId, cleanTasksPayload);
      const createdRows = response?.data && Array.isArray(response.data) ? response.data : [];

      // Normalize newly persisted MySQL tasks
      const normalizedCreated = createdRows.map(t => normalizeTask(t, projects));

      // 1. Update React workspace tasks state immediately
      const updatedTasks = [...normalizedCreated, ...tasks];
      setTasks(updatedTasks);

      // 2. Recalculate progress for the target project
      recalculateProjectProgress(numericProjectId, updatedTasks);

      // 3. Refresh activities from MySQL to synchronize TASKS_CREATED_BY_AI entry
      try {
        const activitiesResponse = await getActivities();
        const rawActivities = Array.isArray(activitiesResponse)
          ? activitiesResponse
          : (activitiesResponse?.data && Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []);
        setActivities(rawActivities.map(normalizeActivity).filter(Boolean));
      } catch (actErr) {
        console.warn('Could not refresh activities from MySQL:', actErr);
      }

      showToast(`Added ${normalizedCreated.length} AI-generated task${normalizedCreated.length === 1 ? '' : 's'} successfully!`);
      return normalizedCreated;
    } catch (err) {
      console.error('Failed to save AI-generated tasks in batch:', err);
      showToast(err.message || 'Failed to save tasks to MySQL', 'error');
      throw err;
    }
  };

  // Loading state while restoring session from localStorage
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        <LoadingState 
          message="Restoring session..." 
          subtext="Validating authentication tokens and user credentials" 
          type="spinner" 
        />
      </div>
    );
  }

  // If user is not authenticated, render Login or Register page
  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <Login
            onNavigateToRegister={() => setAuthView('register')}
          />
        ) : (
          <Register
            onNavigateToLogin={() => setAuthView('login')}
          />
        )}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="relative flex h-screen w-full bg-[#0a0f1d] font-sans text-slate-100 overflow-hidden">
      {/* Global Spatial 3D Ambient Background Canvas */}
      <SpatialBackground />

      {/* Sidebar Navigation */}
      <div className="relative z-20 h-full">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>

      {/* Main View Area */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Top Header & Search Bar */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsMobileOpen={setIsMobileOpen}
          isLoading={isLoading}
          isError={isError}
          onSimulateReload={handleSimulateReload}
          onToggleSimulateError={handleToggleSimulateError}
          onOpenNewModal={() => {
            if (currentTab === 'tasks') {
              setIsNewTaskOpen(true);
            } else {
              setIsNewProjectOpen(true);
            }
          }}
          onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
        />

        {/* Scrollable View Container */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {isError ? (
            <ErrorState
              title="Failed to retrieve projects"
              message="The application encountered an error while synchronizing projects with the backend database."
              details={errorDetails || "Request failed while connecting to the REST API."}
              onRetry={handleRetryConnection}
              onResetData={handleResetWorkspaceState}
              isRetrying={isRetrying}
            />
          ) : isLoading ? (
            <LoadingState 
              message="Synchronizing workspace..." 
              subtext="Loading active projects, task queue, and productivity indicators"
              type="skeleton" 
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  projects={enrichedProjects}
                  tasks={tasks}
                  activities={activities}
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onViewProject={(p) => setDetailProject(p)}
                  onDeleteProject={confirmDeleteProject}
                  onTaskStatusChange={handleTaskStatusChange}
                  onDeleteTask={confirmDeleteTask}
                  onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
                  onOpenNewModal={() => setIsNewProjectOpen(true)}
                />
              )}

              {currentTab === 'projects' && (
                <ProjectsView
                  projects={enrichedProjects}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                  onViewProject={(p) => setDetailProject(p)}
                  onDeleteProject={confirmDeleteProject}
                  onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
                />
              )}

              {currentTab === 'tasks' && (
                <TasksView
                  tasks={tasks}
                  projects={enrichedProjects}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                  onTaskStatusChange={handleTaskStatusChange}
                  onDeleteTask={confirmDeleteTask}
                  onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
                />
              )}

              {currentTab === 'ai-assistant' && (
                <AiAssistantView
                  projects={enrichedProjects}
                  tasks={tasks}
                  onSaveTasks={handleSaveAiTasks}
                  onSaveProject={handleSaveProject}
                />
              )}

              {currentTab === 'analytics' && (
                <DashboardView
                  projects={enrichedProjects}
                  tasks={tasks}
                  activities={activities}
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onViewProject={(p) => setDetailProject(p)}
                  onDeleteProject={confirmDeleteProject}
                  onTaskStatusChange={handleTaskStatusChange}
                  onDeleteTask={confirmDeleteTask}
                  onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
                  onOpenNewModal={() => setIsNewProjectOpen(true)}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  user={user}
                  projectsCount={enrichedProjects.length}
                  tasksDoneCount={tasks.filter(t => t.status === 'done').length}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onSaveProject={handleSaveProject}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        projects={enrichedProjects}
        onSaveTask={handleSaveTask}
      />

      {/* AI Task Generator Modal */}
      <AiTaskGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        projects={enrichedProjects}
        currentProject={enrichedProjects[0]}
        onSaveTasks={handleSaveAiTasks}
      />

      {/* Project Detail View Modal */}
      <ProjectDetailModal
        isOpen={Boolean(detailProject)}
        project={detailProject ? (enrichedProjects.find(p => String(p.id) === String(detailProject.id)) || detailProject) : null}
        tasks={tasks}
        onClose={() => setDetailProject(null)}
        onTaskStatusChange={handleTaskStatusChange}
        onDeleteTask={confirmDeleteTask}
        onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmLabel={confirmation.confirmLabel}
        onConfirm={confirmation.onConfirm}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Feedback Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
