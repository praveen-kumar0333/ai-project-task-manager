/**
 * Dashboard & Productivity Metrics Utility
 * 
 * Centralized calculations for workspace metrics, project progress,
 * task breakdowns, and dashboard queues.
 * 
 * All functions are pure, safe against null/undefined values,
 * and guarantee no NaN or division-by-zero outputs.
 */

/**
 * Calculates task counts and completion progress for a single project.
 *
 * @param {object} project - The project record
 * @param {Array} [tasks=[]] - List of all loaded tasks
 * @returns {object} Derived task metrics { tasksCount, todoTasksCount, inProgressTasksCount, completedTasksCount, progress }
 */
export function calculateProjectMetrics(project, tasks = []) {
  if (!project || !project.id) {
    return {
      tasksCount: 0,
      todoTasksCount: 0,
      inProgressTasksCount: 0,
      completedTasksCount: 0,
      progress: 0
    };
  }

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const projectTasks = safeTasks.filter(
    t => t && String(t.projectId) === String(project.id)
  );

  const tasksCount = projectTasks.length;
  const todoTasksCount = projectTasks.filter(t => t.status === 'todo').length;
  const inProgressTasksCount = projectTasks.filter(t => t.status === 'in-progress').length;
  const completedTasksCount = projectTasks.filter(t => t.status === 'done').length;

  const progress = tasksCount > 0
    ? Math.round((completedTasksCount / tasksCount) * 100)
    : 0;

  return {
    tasksCount,
    todoTasksCount,
    inProgressTasksCount,
    completedTasksCount,
    progress: Number.isFinite(progress) ? progress : 0
  };
}

/**
 * Enriches a single project with real computed task metrics.
 *
 * @param {object} project - Base project object
 * @param {Array} [tasks=[]] - List of all loaded tasks
 * @returns {object} Project enriched with progress and task counts
 */
export function enrichProjectWithMetrics(project, tasks = []) {
  if (!project) return null;
  const metrics = calculateProjectMetrics(project, tasks);
  return {
    ...project,
    ...metrics
  };
}

/**
 * Enriches a list of projects with real computed task metrics.
 *
 * @param {Array} [projects=[]] - List of project objects
 * @param {Array} [tasks=[]] - List of all loaded tasks
 * @returns {Array} List of enriched projects
 */
export function enrichProjectsWithMetrics(projects = [], tasks = []) {
  if (!Array.isArray(projects)) return [];
  return projects.map(project => enrichProjectWithMetrics(project, tasks));
}

/**
 * Computes high-level developer productivity metrics across all projects and tasks.
 *
 * @param {Array} [projects=[]] - List of all loaded projects
 * @param {Array} [tasks=[]] - List of all loaded tasks
 * @returns {object} High-level productivity metrics
 */
export function calculateDashboardMetrics(projects = [], tasks = []) {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const totalProjects = safeProjects.length;

  // Active projects: Projects with status 'active', 'in-progress', or 'planning'
  // Excludes completed or archived projects.
  const activeProjects = safeProjects.filter(p => {
    if (!p) return false;
    const status = (p.status || '').toString().toLowerCase().trim();
    if (status === 'completed' || status === 'archived') {
      return false;
    }
    return true;
  }).length;

  const totalTasks = safeTasks.length;
  const todoTasks = safeTasks.filter(t => t && t.status === 'todo').length;
  const inProgressTasks = safeTasks.filter(t => t && t.status === 'in-progress').length;
  const completedTasks = safeTasks.filter(t => t && t.status === 'done').length;
  const pendingTasks = todoTasks + inProgressTasks;

  const rawRate = totalTasks > 0
    ? (completedTasks / totalTasks) * 100
    : 0;
  const completionRate = Number.isFinite(rawRate) ? Math.round(rawRate) : 0;

  return {
    totalProjects,
    activeProjects,
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
    pendingTasks,
    completionRate
  };
}

/**
 * Priority rank helper for ordering
 */
const PRIORITY_ORDER = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4
};

/**
 * Sorts and selects tasks for the active dashboard task queue.
 * Prioritizes 'in-progress' items first, followed by 'todo', then 'done'.
 * Within each status, items are sorted by priority and recency.
 *
 * @param {Array} [tasks=[]] - List of tasks
 * @param {number} [limit=4] - Maximum number of tasks to return
 * @returns {Array} Sorted task slice for the dashboard
 */
export function sortTasksForDashboard(tasks = [], limit = 4) {
  if (!Array.isArray(tasks)) return [];

  const statusWeight = {
    'in-progress': 1,
    'todo': 2,
    'done': 3
  };

  const sorted = [...tasks].sort((a, b) => {
    // 1. Status weight: in-progress > todo > done
    const weightA = statusWeight[a.status] || 99;
    const weightB = statusWeight[b.status] || 99;
    if (weightA !== weightB) {
      return weightA - weightB;
    }

    // 2. Priority: Urgent > High > Medium > Low
    const prioA = PRIORITY_ORDER[(a.priority || '').toLowerCase()] || 99;
    const prioB = PRIORITY_ORDER[(b.priority || '').toLowerCase()] || 99;
    if (prioA !== prioB) {
      return prioA - prioB;
    }

    // 3. Recency / ID descending
    const idA = typeof a.id === 'number' ? a.id : parseInt(a.id, 10) || 0;
    const idB = typeof b.id === 'number' ? b.id : parseInt(b.id, 10) || 0;
    return idB - idA;
  });

  return sorted.slice(0, limit);
}
