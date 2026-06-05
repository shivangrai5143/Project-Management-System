/**
 * activityLogger.js
 *
 * Thin utility that normalises event payloads and calls the Firestore model.
 * All errors are caught and logged — logging failures are non-fatal and
 * never interrupt the primary business operation.
 */

import { createLog, ACTIONS } from '../models/firestore/activityLogs.js';

export { ACTIONS };

/**
 * Log a user action to the activity timeline.
 *
 * @param {object} params
 * @param {string}  params.actorId      - Firebase UID of the user performing the action
 * @param {string}  params.actorName    - Display name of the actor
 * @param {string}  [params.actorAvatar]  - Avatar URL (optional)
 * @param {string}  params.action       - One of ACTIONS.*
 * @param {string}  params.targetId     - ID of the affected entity
 * @param {string}  params.targetType   - 'task' | 'project' | 'sprint' | 'file' | 'comment'
 * @param {string}  params.targetName   - Human-readable name of the entity
 * @param {string}  [params.projectId]  - Project this event belongs to (optional)
 * @param {string}  [params.projectName] - Project name for display (optional)
 * @param {object}  [params.metadata]   - Extra key/value data (e.g. previousStatus)
 *
 * @returns {Promise<object|null>} The created log entry, or null on error.
 */
export async function logEvent(params) {
    try {
        return await createLog(params);
    } catch (err) {
        // Non-fatal — log to server console but do not propagate
        console.warn('[ActivityLogger] Failed to write activity log:', err.message);
        return null;
    }
}
