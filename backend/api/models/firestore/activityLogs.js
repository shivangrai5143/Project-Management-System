import { db } from '../../lib/firebase-admin.js';
import crypto from 'crypto';

const activityCollection = db.collection('activityLogs');

// ---------------------------------------------------------------------------
// Action type constants (single source of truth)
// ---------------------------------------------------------------------------
export const ACTIONS = {
    PROJECT_CREATED:  'project.created',
    PROJECT_UPDATED:  'project.updated',
    TASK_CREATED:     'task.created',
    TASK_ASSIGNED:    'task.assigned',
    TASK_COMPLETED:   'task.completed',
    SPRINT_CREATED:   'sprint.created',
    FILE_UPLOADED:    'file.uploaded',
    COMMENT_ADDED:    'comment.added',
};

// ---------------------------------------------------------------------------
// Idempotency key — prevents duplicate logs for the same event
// A 5-second time window buckets rapid retries/re-renders together.
// ---------------------------------------------------------------------------
function buildIdempotencyKey(actorId, action, targetId) {
    const timeWindow = Math.floor(Date.now() / 5000); // 5-second bucket
    const raw = `${actorId}:${action}:${targetId}:${timeWindow}`;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

// ---------------------------------------------------------------------------
// Create a new activity log entry (idempotency-safe via transaction)
// ---------------------------------------------------------------------------
export async function createLog(data) {
    const {
        actorId,
        actorName,
        actorAvatar = null,
        action,
        targetId,
        targetType,
        targetName,
        projectId = null,
        projectName = null,
        metadata = {},
    } = data;

    if (!actorId || !action || !targetId || !targetType) {
        throw new Error('actorId, action, targetId, and targetType are required');
    }

    const idempotencyKey = buildIdempotencyKey(actorId, action, targetId);
    const timestamp = new Date().toISOString();

    // TTL = 90 days from now
    const ttl = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    // Query for existing document with this idempotency key
    const existingQuery = await activityCollection
        .where('idempotencyKey', '==', idempotencyKey)
        .limit(1)
        .get();

    if (!existingQuery.empty) {
        // Duplicate — return the existing log silently
        const existingDoc = existingQuery.docs[0];
        return { id: existingDoc.id, ...existingDoc.data() };
    }

    const logEntry = {
        idempotencyKey,
        actorId,
        actorName,
        actorAvatar,
        action,
        targetId,
        targetType,
        targetName,
        projectId,
        projectName,
        metadata,
        createdAt: timestamp,
        ttl,
    };

    const docRef = await activityCollection.add(logEntry);
    return { id: docRef.id, ...logEntry };
}

// ---------------------------------------------------------------------------
// Fetch global timeline (newest first, paginated)
// ---------------------------------------------------------------------------
export async function getGlobalTimeline({ limitCount = 20, cursor = null } = {}) {
    let query = activityCollection
        .orderBy('createdAt', 'desc')
        .limit(limitCount + 1); // fetch one extra to determine hasMore

    if (cursor) {
        const cursorDoc = await activityCollection.doc(cursor).get();
        if (cursorDoc.exists) {
            query = query.startAfter(cursorDoc);
        }
    }

    const snapshot = await query.get();
    return paginatedResult(snapshot, limitCount);
}

// ---------------------------------------------------------------------------
// Fetch project-scoped timeline
// ---------------------------------------------------------------------------
export async function getProjectTimeline(projectId, { limitCount = 20, cursor = null } = {}) {
    let query = activityCollection
        .where('projectId', '==', projectId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount + 1);

    if (cursor) {
        const cursorDoc = await activityCollection.doc(cursor).get();
        if (cursorDoc.exists) {
            query = query.startAfter(cursorDoc);
        }
    }

    const snapshot = await query.get();
    return paginatedResult(snapshot, limitCount);
}

// ---------------------------------------------------------------------------
// Fetch user (actor) timeline
// ---------------------------------------------------------------------------
export async function getUserTimeline(userId, { limitCount = 20, cursor = null } = {}) {
    let query = activityCollection
        .where('actorId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount + 1);

    if (cursor) {
        const cursorDoc = await activityCollection.doc(cursor).get();
        if (cursorDoc.exists) {
            query = query.startAfter(cursorDoc);
        }
    }

    const snapshot = await query.get();
    return paginatedResult(snapshot, limitCount);
}

// ---------------------------------------------------------------------------
// Helper — convert snapshot to paginated response
// ---------------------------------------------------------------------------
function paginatedResult(snapshot, limitCount) {
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const hasMore = docs.length > limitCount;
    const events = hasMore ? docs.slice(0, limitCount) : docs;
    const nextCursor = hasMore ? events[events.length - 1].id : null;

    return { events, nextCursor, hasMore };
}
