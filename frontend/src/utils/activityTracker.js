import { getItem, setItem, STORAGE_KEYS } from './storage';

// Activity Types
export const ACTIVITY_TYPES = {
    TASK_CREATED: 'task_created',
    TASK_COMPLETED: 'task_completed',
    TASK_MOVED: 'task_moved',
    TASK_UPDATED: 'task_updated',
    COMMENT_ADDED: 'comment_added',
    PROJECT_CREATED: 'project_created',
};

// Get all activities from storage
export const getActivities = () => {
    return getItem(STORAGE_KEYS.ACTIVITY_LOG) || [];
};

// Save activities to storage
const saveActivities = (activities) => {
    // Keep only last 100 activities to prevent storage bloat
    const trimmed = activities.slice(-100);
    setItem(STORAGE_KEYS.ACTIVITY_LOG, trimmed);
};

// Log a new activity
export const logActivity = (userId, userName, type, data) => {
    const activities = getActivities();
    const newActivity = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName,
        type,
        data,
        timestamp: new Date().toISOString(),
    };
    activities.push(newActivity);
    saveActivities(activities);
    return newActivity;
};

// Get yesterday's activities for a user
export const getYesterdayActivities = (userId) => {
    const activities = getActivities();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    return activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return (
            activity.userId === userId &&
            activityDate >= yesterday &&
            activityDate < today
        );
    });
};

// Get today's activities for a user
export const getTodayActivities = (userId) => {
    const activities = getActivities();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activity.userId === userId && activityDate >= today;
    });
};

// Generate summary from activities
export const generateActivitySummary = (activities) => {
    const summary = {
        tasksCompleted: [],
        tasksMoved: [],
        tasksCreated: [],
        tasksUpdated: [],
        projectsCreated: [],
    };

    activities.forEach(activity => {
        switch (activity.type) {
            case ACTIVITY_TYPES.TASK_COMPLETED:
                summary.tasksCompleted.push(activity.data);
                break;
            case ACTIVITY_TYPES.TASK_MOVED:
                summary.tasksMoved.push(activity.data);
                break;
            case ACTIVITY_TYPES.TASK_CREATED:
                summary.tasksCreated.push(activity.data);
                break;
            case ACTIVITY_TYPES.TASK_UPDATED:
                summary.tasksUpdated.push(activity.data);
                break;
            case ACTIVITY_TYPES.PROJECT_CREATED:
                summary.projectsCreated.push(activity.data);
                break;
        }
    });

    return summary;
};

// Generate human-readable suggestions from summary
export const generateSuggestions = (summary) => {
    const suggestions = [];

    if (summary.tasksCompleted.length > 0) {
        const taskNames = summary.tasksCompleted.map(t => t.taskTitle).slice(0, 3);
        suggestions.push({
            type: 'completed',
            icon: '✅',
            text: `Completed ${summary.tasksCompleted.length} task${summary.tasksCompleted.length > 1 ? 's' : ''}: ${taskNames.join(', ')}${summary.tasksCompleted.length > 3 ? '...' : ''}`,
            data: summary.tasksCompleted,
        });
    }

    if (summary.tasksCreated.length > 0) {
        suggestions.push({
            type: 'created',
            icon: '📝',
            text: `Created ${summary.tasksCreated.length} new task${summary.tasksCreated.length > 1 ? 's' : ''}`,
            data: summary.tasksCreated,
        });
    }

    if (summary.tasksMoved.length > 0) {
        const inProgressCount = summary.tasksMoved.filter(t => t.newStatus === 'in-progress').length;
        const reviewCount = summary.tasksMoved.filter(t => t.newStatus === 'review').length;

        if (inProgressCount > 0) {
            suggestions.push({
                type: 'moved',
                icon: '🔄',
                text: `Started working on ${inProgressCount} task${inProgressCount > 1 ? 's' : ''}`,
                data: summary.tasksMoved.filter(t => t.newStatus === 'in-progress'),
            });
        }

        if (reviewCount > 0) {
            suggestions.push({
                type: 'review',
                icon: '👀',
                text: `Moved ${reviewCount} task${reviewCount > 1 ? 's' : ''} to review`,
                data: summary.tasksMoved.filter(t => t.newStatus === 'review'),
            });
        }
    }

    if (summary.projectsCreated.length > 0) {
        suggestions.push({
            type: 'project',
            icon: '🚀',
            text: `Created ${summary.projectsCreated.length} new project${summary.projectsCreated.length > 1 ? 's' : ''}`,
            data: summary.projectsCreated,
        });
    }

    return suggestions;
};
