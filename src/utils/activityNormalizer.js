/**
 * Formats an ISO date string or Date object into a readable relative timestamp.
 * Examples: "Just now", "5m ago", "2h ago", "Yesterday", "Sep 7, 2026"
 *
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {string} Human-friendly relative timestamp
 */
export function formatActivityTimestamp(dateInput) {
  if (!dateInput) return 'Recently';
  
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If in the future or under 1 minute
  if (diffMs < 60 * 1000) {
    return 'Just now';
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Derives a context label for the activity (Project / Task / Workspace).
 */
function deriveCategory(type, message) {
  if (!type) return 'Workspace';
  const upper = String(type).toUpperCase();
  if (upper.startsWith('PROJECT_')) return 'Project';
  if (upper.startsWith('TASK_')) return 'Task';
  return 'Workspace';
}

/**
 * Normalizes backend MySQL activity record to the frontend activity format.
 * Maps backend `created_at` to frontend `createdAt` and provides `text`, `timestamp`, and `project`.
 *
 * @param {object} rawActivity - Backend activity row { id, type, message, created_at }
 * @returns {object} Normalized activity object
 */
export function normalizeActivity(rawActivity) {
  if (!rawActivity) return null;

  const rawDate = rawActivity.created_at || rawActivity.createdAt;
  const isoDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();
  const displayMessage = rawActivity.message || rawActivity.text || '';
  const activityType = rawActivity.type || 'ACTIVITY';

  return {
    id: rawActivity.id,
    type: activityType,
    message: displayMessage,
    text: displayMessage,
    createdAt: isoDate,
    timestamp: formatActivityTimestamp(rawDate),
    project: rawActivity.project || deriveCategory(activityType, displayMessage)
  };
}
