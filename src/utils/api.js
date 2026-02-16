/**
 * API Client for backend communication
 * Handles Firebase Auth tokens, request formatting, and error handling
 */

import { auth } from '../lib/firebase';

const API_BASE = '/api';

/**
 * Get current Firebase Auth ID token
 */
export const getToken = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return null;
        return await user.getIdToken();
    } catch (error) {
        console.error('Error getting Firebase token:', error);
        return null;
    }
};

/**
 * Make an authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
    const token = await getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(data.error || 'Request failed', response.status);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Network error. Please check your connection.', 0);
    }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// ============ AUTH API ============
// Note: Login and signup are handled by Firebase Auth on the client side
// These methods are kept for backward compatibility with other parts of the app

export const authApi = {
    async getMe() {
        return apiRequest('/auth/me');
    },

    // Firebase Auth handles login/signup on client side now
    // These are legacy methods
    logout() {
        // Firebase signOut is handled in AuthContext
        console.log('Logout handled by Firebase Auth');
    },

    isAuthenticated() {
        return !!auth.currentUser;
    },
};

// ============ STANDUPS API ============

export const standupsApi = {
    async getHistory(limit = 30) {
        return apiRequest(`/standups?limit=${limit}`);
    },

    async getToday() {
        return apiRequest('/standups?today=true');
    },

    async submit(response, selectedSuggestions = [], allSuggestions = [], options = {}) {
        return apiRequest('/standups', {
            method: 'POST',
            body: {
                response,
                selectedSuggestions,
                allSuggestions,
                projectId: options.projectId,
                mood: options.mood,
                blockers: options.blockers,
            },
        });
    },
};

// ============ PROJECTS API ============

export const projectsApi = {
    async getAll() {
        return apiRequest('/projects');
    },

    async create(name, description = '', color, icon) {
        return apiRequest('/projects', {
            method: 'POST',
            body: { name, description, color, icon },
        });
    },

    async getById(projectId) {
        return apiRequest(`/projects/${projectId}`);
    },

    async update(projectId, updates) {
        return apiRequest(`/projects/${projectId}`, {
            method: 'PUT',
            body: updates,
        });
    },

    async delete(projectId) {
        return apiRequest(`/projects/${projectId}`, {
            method: 'DELETE',
        });
    },
};

// ============ TASKS API ============

export const tasksApi = {
    async getForProject(projectId, status = null) {
        const params = new URLSearchParams({ projectId });
        if (status) params.append('status', status);
        return apiRequest(`/tasks?${params}`);
    },

    async getMyTasks() {
        return apiRequest('/tasks?assignee=me');
    },

    async create(taskData) {
        return apiRequest('/tasks', {
            method: 'POST',
            body: taskData,
        });
    },

    async update(taskId, updates) {
        return apiRequest('/tasks', {
            method: 'PATCH',
            body: { taskId, ...updates },
        });
    },

    async moveTask(taskId, newStatus, order = 0) {
        return apiRequest('/tasks', {
            method: 'PATCH',
            body: { taskId, status: newStatus, order },
        });
    },
};

// ============ USERS API ============

export const usersApi = {
    async updateAvatar(userId, avatar) {
        return apiRequest(`/users/${userId}`, {
            method: 'PATCH',
            body: { avatar },
        });
    },

    async getAll() {
        return apiRequest('/users');
    },
};

export { ApiError };
export default apiRequest;
