// Task statuses
export const TASK_STATUSES = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    REVIEW: 'review',
    DONE: 'done',
};

export const STATUS_CONFIG = {
    [TASK_STATUSES.TODO]: {
        label: 'To Do',
        color: '#64748b',
        bgColor: 'bg-slate-500',
        textColor: 'text-slate-500',
    },
    [TASK_STATUSES.IN_PROGRESS]: {
        label: 'In Progress',
        color: '#3b82f6',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-500',
    },
    [TASK_STATUSES.REVIEW]: {
        label: 'Review',
        color: '#f59e0b',
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-500',
    },
    [TASK_STATUSES.DONE]: {
        label: 'Done',
        color: '#10b981',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-500',
    },
};

// Priority levels
export const PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
};

export const PRIORITY_CONFIG = {
    [PRIORITIES.LOW]: {
        label: 'Low',
        color: '#10b981',
        bgColor: 'bg-emerald-500/20',
        textColor: 'text-emerald-400',
        icon: 'ArrowDown',
    },
    [PRIORITIES.MEDIUM]: {
        label: 'Medium',
        color: '#f59e0b',
        bgColor: 'bg-amber-500/20',
        textColor: 'text-amber-400',
        icon: 'Minus',
    },
    [PRIORITIES.HIGH]: {
        label: 'High',
        color: '#ef4444',
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-400',
        icon: 'ArrowUp',
    },
    [PRIORITIES.URGENT]: {
        label: 'Urgent',
        color: '#dc2626',
        bgColor: 'bg-red-600/20',
        textColor: 'text-red-500',
        icon: 'AlertTriangle',
    },
};

// Default labels
export const DEFAULT_LABELS = [
    { id: 'bug', name: 'Bug', color: '#ef4444' },
    { id: 'feature', name: 'Feature', color: '#3b82f6' },
    { id: 'enhancement', name: 'Enhancement', color: '#8b5cf6' },
    { id: 'documentation', name: 'Documentation', color: '#10b981' },
    { id: 'design', name: 'Design', color: '#ec4899' },
    { id: 'backend', name: 'Backend', color: '#f59e0b' },
    { id: 'frontend', name: 'Frontend', color: '#06b6d4' },
];

// Project colors
export const PROJECT_COLORS = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#f5576c',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#a8edea',
    '#30cfd0',
    '#38f9d7',
    '#fc5c7d',
];

// Team roles
export const TEAM_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
};

export const ROLE_CONFIG = {
    [TEAM_ROLES.OWNER]: {
        label: 'Owner',
        color: '#667eea',
        permissions: ['all'],
    },
    [TEAM_ROLES.ADMIN]: {
        label: 'Admin',
        color: '#8b5cf6',
        permissions: ['create', 'edit', 'delete', 'assign'],
    },
    [TEAM_ROLES.MEMBER]: {
        label: 'Member',
        color: '#10b981',
        permissions: ['create', 'edit'],
    },
    [TEAM_ROLES.VIEWER]: {
        label: 'Viewer',
        color: '#64748b',
        permissions: ['view'],
    },
};

// Notification types
export const NOTIFICATION_TYPES = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_COMPLETED: 'task_completed',
    TASK_DUE_SOON: 'task_due_soon',
    TASK_OVERDUE: 'task_overdue',
    PROJECT_CREATED: 'project_created',
    MENTION: 'mention',
    COMMENT: 'comment',
};

// Kanban column order
export const KANBAN_COLUMNS = [
    TASK_STATUSES.TODO,
    TASK_STATUSES.IN_PROGRESS,
    TASK_STATUSES.REVIEW,
    TASK_STATUSES.DONE,
];
