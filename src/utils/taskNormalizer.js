/**
 * Utility functions for normalizing task objects between backend MySQL/Express API
 * and frontend React UI components.
 */

/**
 * Capitalizes the first letter of a string for UI consistency.
 */
function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Normalizes a task received from the backend API into the shape
 * expected by TaskCard, TasksView, ProjectDetailModal, and Dashboard.
 *
 * @param {object} raw - Task object from backend or raw MySQL row
 * @param {Array} [projects=[]] - Optional list of loaded projects to resolve projectTitle
 * @returns {object} Normalized task object
 */
export function normalizeTask(raw, projects = []) {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id;
  const projectId = raw.projectId ?? raw.project_id ?? null;

  // Resolve project title from loaded projects if not present on task
  let projectTitle = raw.projectTitle || raw.project_title || '';
  if (!projectTitle && projectId !== null && Array.isArray(projects)) {
    const matchedProject = projects.find(p => String(p.id) === String(projectId));
    if (matchedProject) {
      projectTitle = matchedProject.title || matchedProject.name || '';
    }
  }
  if (!projectTitle) {
    projectTitle = 'Project ' + (projectId || '');
  }

  // Normalize status: 'todo' | 'in-progress' | 'done'
  let status = (raw.status || 'todo').toString().toLowerCase().trim();
  if (status === 'in_progress' || status === 'inprogress') {
    status = 'in-progress';
  } else if (!['todo', 'in-progress', 'done'].includes(status)) {
    status = 'todo';
  }

  // Normalize priority for display: 'Low' | 'Medium' | 'High' | 'Urgent'
  const rawPriority = (raw.priority || 'medium').toString().toLowerCase().trim();
  let priority = capitalize(rawPriority);
  if (rawPriority === 'urgent') priority = 'Urgent';
  else if (rawPriority === 'high') priority = 'High';
  else if (rawPriority === 'low') priority = 'Low';
  else priority = 'Medium';

  // Format dueDate (YYYY-MM-DD)
  let dueDate = raw.dueDate || raw.due_date || '';
  if (dueDate) {
    if (dueDate instanceof Date) {
      dueDate = dueDate.toISOString().split('T')[0];
    } else if (typeof dueDate === 'string' && dueDate.includes('T')) {
      dueDate = dueDate.split('T')[0];
    }
  }

  return {
    id,
    projectId,
    projectTitle,
    title: raw.title || 'Untitled Task',
    description: raw.description || '',
    status,
    priority,
    dueDate: dueDate || '',
    assignee: raw.assignee || 'Alex Dev',
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString()
  };
}

/**
 * Prepares a task payload from frontend form inputs to match the backend API validation rules.
 * Backend schema:
 * - title: required string
 * - description: required string
 * - projectId: required positive integer
 * - status: 'todo' | 'in-progress' | 'done' (optional)
 * - priority: 'low' | 'medium' | 'high' (optional, maps 'urgent' -> 'high')
 * - dueDate: valid date string (YYYY-MM-DD) or null (optional)
 *
 * @param {object} formData - Form input from NewTaskModal
 * @param {number|string} [fallbackProjectId] - Project ID if not set in formData
 * @returns {object} Backend task payload
 */
export function prepareTaskPayload(formData, fallbackProjectId) {
  const chosenProjectId = formData.projectId || fallbackProjectId;
  const parsedProjectId = parseInt(chosenProjectId, 10);

  // Normalize priority to backend enum ('low', 'medium', 'high')
  let mappedPriority = (formData.priority || 'medium').toString().toLowerCase().trim();
  if (mappedPriority === 'urgent') {
    mappedPriority = 'high';
  } else if (!['low', 'medium', 'high'].includes(mappedPriority)) {
    mappedPriority = 'medium';
  }

  // Normalize status
  let mappedStatus = (formData.status || 'todo').toString().toLowerCase().trim();
  if (mappedStatus === 'in_progress' || mappedStatus === 'inprogress') {
    mappedStatus = 'in-progress';
  } else if (!['todo', 'in-progress', 'done'].includes(mappedStatus)) {
    mappedStatus = 'todo';
  }

  // Due date check
  let cleanDueDate = null;
  if (formData.dueDate && typeof formData.dueDate === 'string' && formData.dueDate.trim().length > 0) {
    cleanDueDate = formData.dueDate.trim().split('T')[0];
  }

  return {
    title: (formData.title || '').trim(),
    description: (formData.description || 'No description provided.').trim(),
    projectId: isNaN(parsedProjectId) ? 1 : parsedProjectId,
    status: mappedStatus,
    priority: mappedPriority,
    dueDate: cleanDueDate
  };
}
