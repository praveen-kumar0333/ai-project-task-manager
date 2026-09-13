/**
 * Centralized API Service Layer
 * Provides a unified communication interface between the React frontend and Express backend.
 */

// Base API URL configuration from environment variables.
// Supports relative '/api' for dev proxy / same-origin hosting,
// as well as fully-qualified external production backend URLs (e.g., 'https://api.domain.example' or 'https://api.domain.example/api').
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : '/api';

// Decoupled listeners for 401 Unauthorized authentication events
const unauthorizedListeners = new Set();

/**
 * Register a decoupled callback to be invoked whenever a 401 Unauthorized response is received.
 * Does NOT require React hooks or component context.
 *
 * @param {Function} callback - Handler called with { endpoint, status, message }
 * @returns {Function} Unsubscribe function
 */
export function onUnauthorized(callback) {
  if (typeof callback === 'function') {
    unauthorizedListeners.add(callback);
    return () => unauthorizedListeners.delete(callback);
  }
  return () => {};
}

/**
 * Emits an unauthorized event to both registered in-memory listeners
 * and the browser window as a CustomEvent.
 */
function notifyUnauthorized(endpoint, userMessage) {
  // Notify in-memory subscribers
  unauthorizedListeners.forEach((callback) => {
    try {
      callback({ endpoint, status: 401, message: userMessage });
    } catch (err) {
      console.error('Error in unauthorized listener:', err);
    }
  });

  // Dispatch browser CustomEvent for decoupled listeners
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: {
            endpoint,
            status: 401,
            message: userMessage
          }
        })
      );
    } catch (err) {
      console.error('Error dispatching auth:unauthorized event:', err);
    }
  }
}

/**
 * Derives a sanitized, user-friendly error message based on HTTP status code.
 * Prevents technical stack traces or internal backend errors from leaking to UI.
 *
 * @param {number} status - HTTP status code
 * @param {object} [data] - Parsed response payload
 * @returns {string} Sanitized error message
 */
function formatHttpErrorMessage(status, data) {
  // Use user-facing backend message if clean and provided
  const backendMsg = data?.message || data?.error;
  if (backendMsg && typeof backendMsg === 'string' && !backendMsg.includes('at ') && !backendMsg.includes('node_modules')) {
    return backendMsg;
  }

  switch (status) {
    case 400:
      return 'Bad Request: The submitted information is invalid or incomplete.';
    case 401:
      return 'Unauthorized: Your session has expired or authentication is invalid.';
    case 403:
      return 'Forbidden: You do not have permission to perform this action.';
    case 404:
      return 'Not Found: The requested resource could not be found.';
    case 500:
      return 'Internal Server Error: A server issue occurred. Please try again later.';
    default:
      return `Request failed with status code ${status}.`;
  }
}

/**
 * Generic API request helper using standard fetch.
 * - Handles base URL prepending
 * - Attaches JSON Content-Type
 * - Automatically injects JWT Bearer token from localStorage
 * - Parses JSON responses safely
 * - Formats network and HTTP errors into structured JavaScript Error objects
 * - Notifies unauthorized handlers on 401 responses
 *
 * @param {string} endpoint - Endpoint path (e.g. '/auth/login', '/projects')
 * @param {object} [options={}] - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - Resolved response data payload
 */
export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  let url;
  if (API_BASE_URL === '/api' || !API_BASE_URL) {
    url = cleanEndpoint.startsWith('/api/') ? cleanEndpoint : `/api${cleanEndpoint}`;
  } else {
    const baseHasApi = API_BASE_URL.endsWith('/api');
    const endpointHasApi = cleanEndpoint.startsWith('/api/');

    if (baseHasApi && endpointHasApi) {
      url = `${API_BASE_URL}${cleanEndpoint.slice(4)}`;
    } else if (!baseHasApi && !endpointHasApi) {
      url = `${API_BASE_URL}/api${cleanEndpoint}`;
    } else {
      url = `${API_BASE_URL}${cleanEndpoint}`;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  // Automatically attach JWT token from localStorage if present
  if (typeof localStorage !== 'undefined') {
    try {
      const token = localStorage.getItem('token');
      if (token && typeof token === 'string' && token.trim()) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }
    } catch {
      // Ignore localStorage access errors
    }
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...options
  };

  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error(`Network failure: Unable to reach backend server. Please check your connection.`);
    error.isNetworkError = true;
    error.status = 0;
    error.endpoint = cleanEndpoint;
    throw error;
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      const error = new Error(`Malformed response received from server (${response.status})`);
      error.status = response.status;
      error.endpoint = cleanEndpoint;
      throw error;
    }
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    const userMessage = formatHttpErrorMessage(response.status, data);
    const error = new Error(userMessage);
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    error.endpoint = cleanEndpoint;

    if (response.status === 401) {
      error.isUnauthorized = true;
      notifyUnauthorized(cleanEndpoint, userMessage);
    } else if (response.status === 400) {
      error.isBadRequest = true;
    } else if (response.status === 403) {
      error.isForbidden = true;
    } else if (response.status === 404) {
      error.isNotFound = true;
    } else if (response.status >= 500) {
      error.isServerError = true;
    }

    throw error;
  }

  return data;
}

/* =============================================================================
   Authentication API Functions
   ============================================================================= */

/**
 * Registers a new user.
 * @param {object} userData - { name, email, password }
 * @returns {Promise<object>} Backend response with user data and JWT token
 */
export async function registerUser(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: userData
  });
}

/**
 * Authenticates user credentials.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} Backend response with user data and JWT token
 */
export async function loginUser(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  });
}

/* =============================================================================
   Projects API Functions
   ============================================================================= */

/**
 * Retrieves all projects.
 * @returns {Promise<object>} List of projects
 */
export async function getProjects() {
  return apiRequest('/projects', {
    method: 'GET'
  });
}

/**
 * Retrieves a single project by ID.
 * @param {number|string} id - Project ID
 * @returns {Promise<object>} Project details
 */
export async function getProjectById(id) {
  return apiRequest(`/projects/${id}`, {
    method: 'GET'
  });
}

/**
 * Creates a new project.
 * @param {object} projectData - Project payload { title, description, ... }
 * @returns {Promise<object>} Created project
 */
export async function createProject(projectData) {
  return apiRequest('/projects', {
    method: 'POST',
    body: projectData
  });
}

/**
 * Updates an existing project by ID.
 * @param {number|string} id - Project ID
 * @param {object} projectData - Updated fields
 * @returns {Promise<object>} Updated project
 */
export async function updateProject(id, projectData) {
  return apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: projectData
  });
}

/**
 * Deletes a project by ID.
 * @param {number|string} id - Project ID
 * @returns {Promise<object>} Deletion confirmation
 */
export async function deleteProject(id) {
  return apiRequest(`/projects/${id}`, {
    method: 'DELETE'
  });
}

/* =============================================================================
   Tasks API Functions
   ============================================================================= */

/**
 * Retrieves tasks with optional filtering by projectId and/or status.
 * @param {object} [filters={}] - Optional filters: { projectId, status }
 * @returns {Promise<object>} List of tasks
 */
export async function getTasks(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.projectId !== undefined && filters.projectId !== null && filters.projectId !== '') {
    queryParams.append('projectId', filters.projectId);
  }

  if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
    queryParams.append('status', filters.status);
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';

  return apiRequest(endpoint, {
    method: 'GET'
  });
}

/**
 * Retrieves a single task by ID.
 * @param {number|string} id - Task ID
 * @returns {Promise<object>} Task details
 */
export async function getTaskById(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'GET'
  });
}

/**
 * Creates a new task.
 * @param {object} taskData - Task payload { title, description, status, priority, projectId, ... }
 * @returns {Promise<object>} Created task
 */
export async function createTask(taskData) {
  return apiRequest('/tasks', {
    method: 'POST',
    body: taskData
  });
}

/**
 * Saves multiple tasks in batch to a project in MySQL with database transaction support.
 * Sends POST /api/tasks/batch with JWT Bearer token authentication.
 *
 * @param {number|string} projectId - Target project ID
 * @param {Array<object>} tasks - Array of task items { title, description, priority, status, dueDate }
 * @returns {Promise<object>} API response envelope containing created tasks in data
 */
export async function createTasksBatch(projectId, tasks) {
  return apiRequest('/tasks/batch', {
    method: 'POST',
    body: {
      projectId: parseInt(projectId, 10),
      tasks
    }
  });
}

/**
 * Updates an existing task by ID.
 * @param {number|string} id - Task ID
 * @param {object} taskData - Updated fields
 * @returns {Promise<object>} Updated task
 */
export async function updateTask(id, taskData) {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: taskData
  });
}

/**
 * Updates only the status of an existing task.
 * @param {number|string} id - Task ID
 * @param {string} status - New status (e.g. 'Todo', 'In Progress', 'Done')
 * @returns {Promise<object>} Updated task
 */
export async function updateTaskStatus(id, status) {
  return apiRequest(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: { status }
  });
}

/**
 * Deletes a task by ID.
 * @param {number|string} id - Task ID
 * @returns {Promise<object>} Deletion confirmation
 */
export async function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  });
}

/* =============================================================================
   Activities API Functions
   ============================================================================= */

/**
 * Retrieves persistent activity logs for the authenticated user ordered newest first.
 * @returns {Promise<object>} List of user activities
 */
export async function getActivities() {
  return apiRequest('/activities', {
    method: 'GET'
  });
}

/* =============================================================================
   AI Assistant API Functions
   ============================================================================= */

/**
 * Generates structured task suggestions using Google Gemini AI on the Express backend.
 * Sends POST /api/ai/generate-tasks with JWT Bearer token authentication.
 *
 * @param {object} payload - Project information
 * @param {string} payload.projectName - Name of the project (required)
 * @param {string} payload.projectDescription - Description of what the project achieves
 * @param {string} [payload.requirements] - Tech stack, key requirements, or constraints
 * @returns {Promise<object>} API response envelope containing data.tasks
 */
export async function generateTasksWithAI(payload) {
  return apiRequest('/ai/generate-tasks', {
    method: 'POST',
    body: payload
  });
}

/* =============================================================================
   Conversational AI Chat API Functions
   ============================================================================= */

/**
 * Creates a new chat conversation.
 * @param {string} [title='New Conversation']
 * @returns {Promise<object>} Created conversation
 */
export async function createConversation(title = 'New Conversation') {
  return apiRequest('/conversations', {
    method: 'POST',
    body: { title }
  });
}

/**
 * Retrieves all chat conversations for the current user.
 * @returns {Promise<object>} List of conversations
 */
export async function getConversations() {
  return apiRequest('/conversations', {
    method: 'GET'
  });
}

/**
 * Retrieves a single conversation by ID with its message history.
 * @param {number|string} id - Conversation ID
 * @returns {Promise<object>} Conversation details and messages
 */
export async function getConversationById(id) {
  return apiRequest(`/conversations/${id}`, {
    method: 'GET'
  });
}

/**
 * Alias for getConversationById for backward compatibility.
 */
export const getConversation = getConversationById;

/**
 * Deletes a conversation and its messages.
 * @param {number|string} id - Conversation ID
 * @returns {Promise<object>} Deletion confirmation
 */
export async function deleteConversation(id) {
  return apiRequest(`/conversations/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Sends a message in a conversation to the conversational AI endpoint.
 * Supports sendChatMessage(payload), sendChatMessage({ message, conversationId }),
 * and sendChatMessage(conversationId, message).
 * Triggers workspace context grounding and Gemini AI response.
 * @param {object|number|string} payloadOrConversationId - Payload { message, conversationId } or conversationId
 * @param {string} [maybeMessage] - Message text if first param is conversationId
 * @returns {Promise<object>} Assistant response and conversation details
 */
export async function sendChatMessage(payloadOrConversationId, maybeMessage) {
  let body;
  if (typeof payloadOrConversationId === 'object' && payloadOrConversationId !== null) {
    body = payloadOrConversationId;
  } else if (maybeMessage !== undefined) {
    body = {
      conversationId: payloadOrConversationId,
      message: maybeMessage
    };
  } else {
    body = {
      message: payloadOrConversationId
    };
  }

  return apiRequest('/ai/chat', {
    method: 'POST',
    body
  });
}

/* =============================================================================
   Knowledge Base / Document Management API Functions
   ============================================================================= */

/**
 * Uploads a document (PDF or TXT) to the user's Knowledge Base for RAG.
 * @param {File} file - File object to upload
 * @returns {Promise<object>} Document metadata and indexed chunk count
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('document', file);

  return apiRequest('/documents/upload', {
    method: 'POST',
    body: formData
  });
}

/**
 * Retrieves all documents in the user's Knowledge Base.
 * @returns {Promise<object>} List of documents
 */
export async function getDocuments() {
  return apiRequest('/documents', {
    method: 'GET'
  });
}

/**
 * Deletes a document from the user's Knowledge Base.
 * @param {number|string} id - Document ID
 * @returns {Promise<object>} Deletion confirmation
 */
export async function deleteDocument(id) {
  return apiRequest(`/documents/${id}`, {
    method: 'DELETE'
  });
}

/* =============================================================================
   Murf Text-to-Speech Voice API Functions
   ============================================================================= */

/**
 * Synthesizes speech from text using Murf AI on the Express backend.
 * @param {string} text - Text to synthesize
 * @param {string} [voiceId] - Optional voice ID
 * @returns {Promise<object>} Audio URL and playback metadata
 */
export async function generateSpeech(text, voiceId) {
  return apiRequest('/voice/speak', {
    method: 'POST',
    body: { text, voiceId }
  });
}

/**
 * Checks if the backend has Murf API configured.
 * @returns {Promise<object>} Status object
 */
export async function getVoiceStatus() {
  return apiRequest('/voice/status', {
    method: 'GET'
  });
}

export { API_BASE_URL };

