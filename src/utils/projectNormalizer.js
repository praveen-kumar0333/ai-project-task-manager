/**
 * Project Normalization and Compatibility Layer
 * 
 * Centralizes translation between MySQL / Express REST API schema
 * and React frontend component property expectations.
 */

/**
 * Normalizes a project record from backend API or dummy data into a consistent
 * object structure required by the dashboard and project UI components.
 *
 * @param {object} p - Raw project record from API or state
 * @param {Array} [tasks=[]] - Optional task list to compute progress metrics
 * @returns {object} Normalized project object
 */
export function normalizeProject(p, tasks = []) {
  if (!p) return null;

  // Derive task metrics if tasks array is provided
  const projectTasks = Array.isArray(tasks)
    ? tasks.filter(t => String(t.projectId) === String(p.id))
    : [];
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  
  const computedProgress = projectTasks.length > 0
    ? Math.round((doneTasks.length / projectTasks.length) * 100)
    : (p.progress !== undefined ? p.progress : (p.status === 'completed' ? 100 : 0));

  // Normalize priority to display casing (Low, Medium, High, Urgent)
  const rawPriority = (p.priority || 'Medium').toString();
  const capitalizedPriority = rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase();

  // Normalize date strings
  let derivedDueDate = p.dueDate || p.due_date || '';
  if (!derivedDueDate && (p.createdAt || p.created_at)) {
    const rawDate = p.createdAt || p.created_at;
    derivedDueDate = typeof rawDate === 'string' ? rawDate.split('T')[0] : '';
  }

  return {
    id: p.id,
    title: p.name || p.title || 'Untitled Project',
    name: p.name || p.title || 'Untitled Project',
    description: p.description || '',
    userId: p.userId !== undefined ? p.userId : (p.user_id !== undefined ? p.user_id : null),
    status: p.status || 'planning',
    priority: capitalizedPriority,
    category: p.category || 'Backend', // Visual category tag
    progress: p.progress !== undefined ? p.progress : computedProgress,
    tasksCount: p.tasksCount !== undefined ? p.tasksCount : projectTasks.length,
    completedTasksCount: p.completedTasksCount !== undefined ? p.completedTasksCount : doneTasks.length,
    dueDate: derivedDueDate,
    createdAt: p.createdAt || p.created_at || new Date().toISOString().split('T')[0],
    updatedAt: p.updatedAt || p.updated_at || null
  };
}

/**
 * Prepares and validates a payload suitable for the Express POST/PUT /api/projects endpoints.
 * Ensures compatibility with backend validation middleware:
 * - name: string, non-empty
 * - description: string, non-empty
 * - userId: positive integer
 * - status: 'planning' | 'active' | 'completed'
 * - priority: 'low' | 'medium' | 'high'
 *
 * @param {object} formData - Form input from NewProjectModal or edit views
 * @returns {object} Clean backend payload
 */
export function prepareProjectPayload(formData) {
  let mappedPriority = (formData.priority || 'medium').toString().toLowerCase();
  if (mappedPriority === 'urgent') {
    mappedPriority = 'high';
  }
  if (!['low', 'medium', 'high'].includes(mappedPriority)) {
    mappedPriority = 'medium';
  }

  let mappedStatus = (formData.status || 'planning').toString().toLowerCase();
  if (mappedStatus === 'todo') {
    mappedStatus = 'planning';
  } else if (mappedStatus === 'in-progress') {
    mappedStatus = 'active';
  } else if (mappedStatus === 'done') {
    mappedStatus = 'completed';
  }
  if (!['planning', 'active', 'completed'].includes(mappedStatus)) {
    mappedStatus = 'planning';
  }

  return {
    name: (formData.title || formData.name || '').trim(),
    description: (formData.description || 'No description provided.').trim(),
    status: mappedStatus,
    priority: mappedPriority
  };
}
