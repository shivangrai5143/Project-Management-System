/**
 * activityService.js
 *
 * Frontend service for the activity timeline.
 * - Fetches paginated events from the Express backend (authenticated)
 * - Provides direct Firestore write for client-originated events
 *   (comment.added, file.uploaded, sprint.created)
 * - Real-time Firestore subscription for live timeline updates
 */

import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    startAfter,
    getDocs,
    doc,
    getDoc,
} from 'firebase/firestore';
import { auth } from '@/lib/firebase';

// ---------------------------------------------------------------------------
// Action type constants (mirrors backend/api/models/firestore/activityLogs.js)
// ---------------------------------------------------------------------------
export const ACTIVITY_ACTIONS = {
    PROJECT_CREATED: 'project.created',
    PROJECT_UPDATED: 'project.updated',
    TASK_CREATED:    'task.created',
    TASK_ASSIGNED:   'task.assigned',
    TASK_COMPLETED:  'task.completed',
    SPRINT_CREATED:  'sprint.created',
    FILE_UPLOADED:   'file.uploaded',
    COMMENT_ADDED:   'comment.added',
};

// ---------------------------------------------------------------------------
// Human-readable labels and icon/color config per action
// ---------------------------------------------------------------------------
export const ACTION_CONFIG = {
    [ACTIVITY_ACTIONS.PROJECT_CREATED]: {
        label:    'created project',
        icon:     'FolderPlus',
        color:    '#667eea',
        bgColor:  'rgba(102, 126, 234, 0.15)',
        category: 'project',
    },
    [ACTIVITY_ACTIONS.PROJECT_UPDATED]: {
        label:    'updated project',
        icon:     'FolderEdit',
        color:    '#8b5cf6',
        bgColor:  'rgba(139, 92, 246, 0.15)',
        category: 'project',
    },
    [ACTIVITY_ACTIONS.TASK_CREATED]: {
        label:    'created task',
        icon:     'SquarePlus',
        color:    '#3b82f6',
        bgColor:  'rgba(59, 130, 246, 0.15)',
        category: 'task',
    },
    [ACTIVITY_ACTIONS.TASK_ASSIGNED]: {
        label:    'assigned task',
        icon:     'UserCheck',
        color:    '#f59e0b',
        bgColor:  'rgba(245, 158, 11, 0.15)',
        category: 'task',
    },
    [ACTIVITY_ACTIONS.TASK_COMPLETED]: {
        label:    'completed task',
        icon:     'CheckCircle2',
        color:    '#10b981',
        bgColor:  'rgba(16, 185, 129, 0.15)',
        category: 'task',
    },
    [ACTIVITY_ACTIONS.SPRINT_CREATED]: {
        label:    'created sprint',
        icon:     'Timer',
        color:    '#06b6d4',
        bgColor:  'rgba(6, 182, 212, 0.15)',
        category: 'sprint',
    },
    [ACTIVITY_ACTIONS.FILE_UPLOADED]: {
        label:    'uploaded file',
        icon:     'FileUp',
        color:    '#ec4899',
        bgColor:  'rgba(236, 72, 153, 0.15)',
        category: 'file',
    },
    [ACTIVITY_ACTIONS.COMMENT_ADDED]: {
        label:    'commented on',
        icon:     'MessageSquare',
        color:    '#f97316',
        bgColor:  'rgba(249, 115, 22, 0.15)',
        category: 'comment',
    },
};

// ---------------------------------------------------------------------------
// Helper — get current user's Firebase ID token
// ---------------------------------------------------------------------------
async function getAuthToken() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    return currentUser.getIdToken();
}

// ---------------------------------------------------------------------------
// Fetch paginated timeline from Express backend
// ---------------------------------------------------------------------------
export async function fetchTimeline({ scope = 'global', projectId, userId, limit: pageLimit = 20, cursor } = {}) {
    const token = await getAuthToken();
    const params = new URLSearchParams({ scope, limit: String(pageLimit) });
    if (projectId) params.set('projectId', projectId);
    if (userId)    params.set('userId', userId);
    if (cursor)    params.set('cursor', cursor);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/activity?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Activity fetch failed: ${res.status}`);
    }

    return res.json(); // { success, events, nextCursor, hasMore, scope }
}

// ---------------------------------------------------------------------------
// Direct Firestore write — for client-side events
// (comment.added, file.uploaded, sprint.created)
// ---------------------------------------------------------------------------
export async function logActivityDirect({ actorId, actorName, actorAvatar, action, targetId, targetType, targetName, projectId, projectName, metadata = {} }) {
    if (!actorId || !action || !targetId) {
        throw new Error('actorId, action and targetId are required');
    }

    const timestamp = new Date().toISOString();
    const ttl = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const entry = {
        actorId,
        actorName,
        actorAvatar: actorAvatar || null,
        action,
        targetId,
        targetType,
        targetName,
        projectId:   projectId   || null,
        projectName: projectName || null,
        metadata,
        createdAt: timestamp,
        ttl,
    };

    const docRef = await addDoc(collection(db, 'activityLogs'), entry);
    return { id: docRef.id, ...entry };
}

// ---------------------------------------------------------------------------
// Real-time subscription — listens to the 50 newest global logs
// Returns an unsubscribe function
// ---------------------------------------------------------------------------
export function subscribeToTimeline(callback, { projectId, pageLimit = 50 } = {}) {
    let q = query(
        collection(db, 'activityLogs'),
        orderBy('createdAt', 'desc'),
        limit(pageLimit)
    );

    if (projectId) {
        q = query(
            collection(db, 'activityLogs'),
            where('projectId', '==', projectId),
            orderBy('createdAt', 'desc'),
            limit(pageLimit)
        );
    }

    return onSnapshot(
        q,
        (snapshot) => {
            const events = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(events);
        },
        (error) => {
            console.error('[ActivityService] Snapshot error:', error);
            callback([]);
        }
    );
}

// ---------------------------------------------------------------------------
// Group events by calendar day (for the UI)
// ---------------------------------------------------------------------------
export function groupEventsByDay(events) {
    const groups = {};
    events.forEach(event => {
        const date = new Date(event.createdAt);
        const dayKey = date.toLocaleDateString('en-US', {
            year:  'numeric',
            month: 'long',
            day:   'numeric',
        });
        if (!groups[dayKey]) groups[dayKey] = [];
        groups[dayKey].push(event);
    });

    // Return as sorted array of { date, events }
    return Object.entries(groups).map(([date, dayEvents]) => ({ date, events: dayEvents }));
}

// ---------------------------------------------------------------------------
// Format relative time (e.g. "2 hours ago")
// ---------------------------------------------------------------------------
export function formatRelativeTime(timestamp) {
    const now  = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSec  = Math.floor(diffMs / 1000);
    const diffMin  = Math.floor(diffSec / 60);
    const diffHr   = Math.floor(diffMin / 60);
    const diffDay  = Math.floor(diffHr / 24);
    const diffWk   = Math.floor(diffDay / 7);
    const diffMo   = Math.floor(diffDay / 30);

    if (diffSec < 10)   return 'just now';
    if (diffSec < 60)   return `${diffSec}s ago`;
    if (diffMin < 60)   return `${diffMin}m ago`;
    if (diffHr  < 24)   return `${diffHr}h ago`;
    if (diffDay < 7)    return `${diffDay}d ago`;
    if (diffWk  < 4)    return `${diffWk}w ago`;
    if (diffMo  < 12)   return `${diffMo}mo ago`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Build a human-readable sentence for an event
// ---------------------------------------------------------------------------
export function buildEventSentence(event) {
    const config = ACTION_CONFIG[event.action];
    const verb   = config?.label || event.action;
    return `${verb} `;
}
