/**
 * Firestore Service Layer
 * Centralized CRUD helpers for all Firestore collections.
 * Replaces localStorage and backend API for data persistence.
 */

import { db } from '../lib/firebase';
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';

// ============ COLLECTION REFERENCES ============

const COLLECTIONS = {
    PROJECTS: 'projects',
    TASKS: 'tasks',
    CHAT_MESSAGES: 'chatMessages',
    NOTIFICATIONS: 'notifications',
    STANDUPS: 'standups',
    STANDUP_SETTINGS: 'standupSettings',
    WHITEBOARDS: 'whiteboards',
    USERS: 'users',
};

// ============ PROJECTS ============

export const projectsService = {
    /**
     * Listen to all projects for a user (real-time)
     */
    onProjectsChange(userId, callback) {
        // We listen to all projects and filter client-side for owner or team member
        const q = collection(db, COLLECTIONS.PROJECTS);
        return onSnapshot(q, (snapshot) => {
            const allProjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            console.log('[Firestore] All projects:', allProjects.length, 'userId:', userId);
            const projects = allProjects.filter(
                p => p.ownerId === userId || (p.teamIds && p.teamIds.includes(userId))
            );
            console.log('[Firestore] Filtered projects for user:', projects.length);
            callback(projects);
        }, (error) => {
            console.error('[Firestore] Projects listener error:', error);
            callback([]);
        });
    },

    /**
     * Get all projects (one-time)
     */
    async getAll() {
        const snapshot = await getDocs(collection(db, COLLECTIONS.PROJECTS));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Create a new project
     */
    async create(projectData) {
        const timestamp = new Date().toISOString();
        const project = {
            name: projectData.name,
            description: projectData.description || '',
            color: projectData.color || '#6366f1',
            icon: projectData.icon || 'folder',
            ownerId: projectData.ownerId,
            teamIds: projectData.teamIds || [],
            status: projectData.status || 'active',
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), project);
        return { id: docRef.id, ...project };
    },

    /**
     * Update a project
     */
    async update(projectId, updates) {
        const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    },

    /**
     * Delete a project
     */
    async delete(projectId) {
        await deleteDoc(doc(db, COLLECTIONS.PROJECTS, projectId));
    },
};

// ============ TASKS ============

export const tasksService = {
    /**
     * Listen to all tasks (real-time)
     */
    onTasksChange(callback) {
        const q = collection(db, COLLECTIONS.TASKS);
        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(tasks);
        });
    },

    /**
     * Get tasks for a project (one-time)
     */
    async getForProject(projectId) {
        const q = query(
            collection(db, COLLECTIONS.TASKS),
            where('projectId', '==', projectId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Create a new task
     */
    async create(taskData) {
        const timestamp = new Date().toISOString();
        const task = {
            projectId: taskData.projectId,
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            assigneeId: taskData.assigneeId || null,
            createdBy: taskData.createdBy || null,
            labels: taskData.labels || [],
            order: taskData.order || 0,
            dueDate: taskData.dueDate || null,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), task);
        return { id: docRef.id, ...task };
    },

    /**
     * Update a task
     */
    async update(taskId, updates) {
        const docRef = doc(db, COLLECTIONS.TASKS, taskId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    },

    /**
     * Delete a task
     */
    async delete(taskId) {
        await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
    },
};

// ============ CHAT MESSAGES ============

export const chatService = {
    /**
     * Listen to messages for a project (real-time)
     */
    onMessagesChange(projectId, callback) {
        const q = query(
            collection(db, COLLECTIONS.CHAT_MESSAGES),
            where('projectId', '==', projectId),
            orderBy('createdAt', 'asc')
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(messages);
        });
    },

    /**
     * Listen to ALL messages (real-time)
     */
    onAllMessagesChange(callback) {
        const q = collection(db, COLLECTIONS.CHAT_MESSAGES);
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(messages);
        });
    },

    /**
     * Send a message
     */
    async send(messageData) {
        const message = {
            projectId: messageData.projectId,
            userId: messageData.userId,
            userName: messageData.userName,
            content: messageData.content,
            createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_MESSAGES), message);
        return { id: docRef.id, ...message };
    },

    /**
     * Delete a message
     */
    async delete(messageId) {
        await deleteDoc(doc(db, COLLECTIONS.CHAT_MESSAGES, messageId));
    },
};

// ============ NOTIFICATIONS ============

export const notificationsService = {
    /**
     * Listen to notifications for a user (real-time)
     */
    onNotificationsChange(userId, callback) {
        const q = query(
            collection(db, COLLECTIONS.NOTIFICATIONS),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(notifications);
        });
    },

    /**
     * Add a notification
     */
    async add(notificationData) {
        const notification = {
            userId: notificationData.userId,
            type: notificationData.type || 'info',
            title: notificationData.title,
            message: notificationData.message,
            read: false,
            createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notification);
        return { id: docRef.id, ...notification };
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId) {
        const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
        await updateDoc(docRef, { read: true });
    },

    /**
     * Mark all notifications for a user as read
     */
    async markAllAsRead(userId) {
        const q = query(
            collection(db, COLLECTIONS.NOTIFICATIONS),
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => {
            batch.update(d.ref, { read: true });
        });
        await batch.commit();
    },

    /**
     * Delete a notification
     */
    async delete(notificationId) {
        await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId));
    },

    /**
     * Clear all notifications for a user
     */
    async clearAll(userId) {
        const q = query(
            collection(db, COLLECTIONS.NOTIFICATIONS),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => {
            batch.delete(d.ref);
        });
        await batch.commit();
    },
};

// ============ STANDUPS ============

export const standupsService = {
    /**
     * Listen to standup history for a user (real-time)
     */
    onStandupsChange(userId, callback) {
        const q = query(
            collection(db, COLLECTIONS.STANDUPS),
            where('userId', '==', userId),
            orderBy('submittedAt', 'desc'),
            limit(30)
        );
        return onSnapshot(q, (snapshot) => {
            const standups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(standups);
        });
    },

    /**
     * Submit a standup
     */
    async submit(standupData) {
        const standup = {
            userId: standupData.userId,
            userName: standupData.userName,
            response: standupData.response,
            selectedSuggestions: standupData.selectedSuggestions || [],
            suggestions: standupData.suggestions || [],
            submittedAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, COLLECTIONS.STANDUPS), standup);
        return { id: docRef.id, ...standup };
    },

    /**
     * Get standup settings for a user
     */
    async getSettings(userId) {
        const docRef = doc(db, COLLECTIONS.STANDUP_SETTINGS, userId);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? snapshot.data() : null;
    },

    /**
     * Save standup settings for a user
     */
    async saveSettings(userId, settings) {
        const docRef = doc(db, COLLECTIONS.STANDUP_SETTINGS, userId);
        await setDoc(docRef, settings, { merge: true });
    },
};

// ============ WHITEBOARDS ============

export const whiteboardsService = {
    /**
     * Listen to whiteboard for a project (real-time)
     */
    onWhiteboardChange(projectId, callback) {
        const docRef = doc(db, COLLECTIONS.WHITEBOARDS, projectId);
        return onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() });
            } else {
                callback(null);
            }
        });
    },

    /**
     * Get or create whiteboard for a project
     */
    async getOrCreate(projectId) {
        const docRef = doc(db, COLLECTIONS.WHITEBOARDS, projectId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() };
        }

        // Create empty whiteboard
        const whiteboard = {
            projectId,
            strokes: [],
            shapes: [],
            texts: [],
            stickyNotes: [],
            version: 0,
            lastCleared: null,
            updatedAt: new Date().toISOString(),
        };
        await setDoc(docRef, whiteboard);
        return { id: projectId, ...whiteboard };
    },

    /**
     * Update whiteboard data (full replace of element arrays)
     */
    async update(projectId, updates) {
        const docRef = doc(db, COLLECTIONS.WHITEBOARDS, projectId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    },

    /**
     * Clear the whiteboard
     */
    async clear(projectId) {
        const docRef = doc(db, COLLECTIONS.WHITEBOARDS, projectId);
        const data = {
            strokes: [],
            shapes: [],
            texts: [],
            stickyNotes: [],
            version: 0,
            lastCleared: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await updateDoc(docRef, data);
        return data;
    },
};

// ============ USERS ============

export const usersService = {
    /**
     * Listen to all users (real-time) — for team display
     */
    onUsersChange(callback) {
        const q = collection(db, COLLECTIONS.USERS);
        return onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(users);
        });
    },

    /**
     * Get all users (one-time)
     */
    async getAll() {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Update user profile
     */
    async update(userId, updates) {
        const docRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    },
};

export default COLLECTIONS;
