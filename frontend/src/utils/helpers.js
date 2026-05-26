export const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const PRIORITY_COLORS = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#f97316',
  urgent: '#ef4444',
};

export const STATUS_COLORS = {
  open: '#60a5fa',
  in_progress: '#a78bfa',
  resolved: '#34d399',
  closed: '#6b7280',
};

// Returns the valid next statuses from a given status
export function getAllowedTransitions(status) {
  const FORWARD = { open: 'in_progress', in_progress: 'resolved', resolved: 'closed' };
  const BACKWARD = { in_progress: 'open', resolved: 'in_progress', closed: 'resolved' };
  const allowed = [];
  if (FORWARD[status]) allowed.push(FORWARD[status]);
  if (BACKWARD[status]) allowed.push(BACKWARD[status]);
  return allowed;
}

export function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}
