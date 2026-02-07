/**
 * API Client for backend communication
 * Handles JWT tokens, request formatting, and error handling
 */

const API_BASE = '/api';

// Token storage
const TOKEN_KEY = 'pms_auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Make an authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
    const token = getToken();

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

export const authApi = {
    async register(email, password, name) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: { email, password, name },
        });

        if (data.token) {
            setToken(data.token);
        }

        return data;
    },

    async login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email, password },
        });

        if (data.token) {
            setToken(data.token);
        }

        return data;
    },

    async getMe() {
        return apiRequest('/auth/me');
    },

    logout() {
        removeToken();
    },

    isAuthenticated() {
        return !!getToken();
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
