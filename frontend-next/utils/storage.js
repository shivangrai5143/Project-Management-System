// Storage utility functions for localStorage persistence

export const STORAGE_KEYS = {
    PROJECTS: 'pms_projects',
    TASKS: 'pms_tasks',
    USER: 'pms_user',
    TEAM: 'pms_team',
    THEME: 'pms_theme',
    NOTIFICATIONS: 'pms_notifications',
    CHAT_MESSAGES: 'pms_chat_messages',
    STANDUP_HISTORY: 'pms_standup_history',
    STANDUP_SETTINGS: 'pms_standup_settings',
    ACTIVITY_LOG: 'pms_activity_log',
    WHITEBOARD_LOCAL: 'pms_whiteboard_local',
};

export const getItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
    }
};

export const setItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing ${key} to localStorage:`, error);
        return false;
    }
};

export const removeItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
        return false;
    }
};

export const clearAll = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};
