import * as activityModel from '../models/firestore/activityLogs.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';
import { hasPermission, PERMISSIONS } from '../lib/rbac.js';

/**
 * GET /api/activity
 *
 * Query params:
 *   scope      — 'global' | 'project' | 'user'  (default: 'global')
 *   projectId  — required when scope === 'project'
 *   userId     — required when scope === 'user'
 *   limit      — number of events per page (default: 20, max: 50)
 *   cursor     — last document ID from previous page (for cursor pagination)
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return errorResponse(res, 'Method not allowed', 405);
    }

    // Auth
    const authResult = await authMiddleware(req);
    if (authResult.error) {
        return errorResponse(res, authResult.error, authResult.status);
    }
    req.user = authResult.user;

    // Permission check
    if (!hasPermission(req.user.role, PERMISSIONS.ACTIVITY_READ)) {
        return res.status(403).json({
            error: 'Forbidden: you do not have permission to view the activity timeline',
            code: 'INSUFFICIENT_PERMISSIONS',
        });
    }

    const { scope = 'global', projectId, userId, cursor } = req.query;
    const rawLimit = parseInt(req.query.limit, 10);
    const limitCount = Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, 50)
        : 20;

    try {
        let result;

        switch (scope) {
            case 'project': {
                if (!projectId) {
                    return errorResponse(res, 'projectId is required when scope is "project"', 400);
                }
                result = await activityModel.getProjectTimeline(projectId, { limitCount, cursor });
                break;
            }

            case 'user': {
                // Allow fetching own timeline; admin can fetch any user's
                const targetUserId = userId || req.user.uid;
                result = await activityModel.getUserTimeline(targetUserId, { limitCount, cursor });
                break;
            }

            case 'global':
            default: {
                result = await activityModel.getGlobalTimeline({ limitCount, cursor });
                break;
            }
        }

        return jsonResponse(res, {
            success: true,
            ...result,
            scope,
        });

    } catch (error) {
        console.error('[GET /api/activity] Error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
