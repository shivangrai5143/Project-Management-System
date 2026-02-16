import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';

// Generate unique ID
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format date for display
export const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy');
};

// Format date with time
export const formatDateTime = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Check if date is overdue
export const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return isBefore(new Date(dueDate), new Date());
};

// Check if date is due soon (within 3 days)
export const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    return isAfter(due, now) && isBefore(due, addDays(now, 3));
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Generate avatar color from name
export const getAvatarColor = (name) => {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];

    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

// Calculate project progress
export const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
};

// Group tasks by status
export const groupTasksByStatus = (tasks) => {
    return {
        todo: tasks.filter(t => t.status === 'todo'),
        inProgress: tasks.filter(t => t.status === 'in-progress'),
        review: tasks.filter(t => t.status === 'review'),
        done: tasks.filter(t => t.status === 'done'),
    };
};

// Sort tasks by priority
export const sortByPriority = (tasks) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...tasks].sort((a, b) =>
        (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    );
};

// Filter tasks
export const filterTasks = (tasks, filters) => {
    return tasks.filter(task => {
        if (filters.search) {
            const search = filters.search.toLowerCase();
            if (!task.title.toLowerCase().includes(search) &&
                !task.description?.toLowerCase().includes(search)) {
                return false;
            }
        }
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.assignee && task.assigneeId !== filters.assignee) return false;
        if (filters.projectId && task.projectId !== filters.projectId) return false;
        return true;
    });
};

// Truncate text
export const truncate = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
