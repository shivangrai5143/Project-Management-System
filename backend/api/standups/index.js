import * as standupsModel from '../models/firestore/standups.js';
import * as usersModel from '../models/firestore/users.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';
import { hasPermission, PERMISSIONS } from '../lib/rbac.js';

/** Inline permission guard. */
function checkPermission(req, res, permission, next) {
    if (!hasPermission(req.user.role, permission)) {
        return res.status(403).json({
            error: 'Forbidden: you do not have permission to perform this action',
            code: 'INSUFFICIENT_PERMISSIONS',
            requiredPermission: permission,
            userRole: req.user.role,
        });
    }
    return next();
}

export default async function handler(req, res) {
    // Authenticate and attach role-enriched user
    const authResult = await authMiddleware(req);
    if (authResult.error) {
        return errorResponse(res, authResult.error, authResult.status);
    }
    req.user = authResult.user;
    const userId = authResult.user.uid;

    switch (req.method) {
        case 'GET':
            return checkPermission(req, res, PERMISSIONS.STANDUPS_READ,
                () => getStandups(req, res, userId)
            );

        case 'POST':
            return checkPermission(req, res, PERMISSIONS.STANDUPS_CREATE,
                () => createStandup(req, res, userId, authResult.user.name)
            );

        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// ---------------------------------------------------------------------------
// GET /api/standups — Get standup history for the user
// ---------------------------------------------------------------------------
async function getStandups(req, res, userId) {
    try {
        const { limit = 30, today } = req.query;

        if (today === 'true') {
            const todayStandup = await standupsModel.getTodayStandup(userId);
            return jsonResponse(res, {
                success: true,
                standup: todayStandup,
                hasSubmittedToday: !!todayStandup,
            });
        }

        const standups = await standupsModel.getStandupHistory(userId, parseInt(limit));
        return jsonResponse(res, {
            success: true,
            standups,
            count: standups.length,
        });

    } catch (error) {
        console.error('Get standups error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// ---------------------------------------------------------------------------
// POST /api/standups — Submit a daily standup
// ---------------------------------------------------------------------------
async function createStandup(req, res, userId, userName) {
    try {
        const { response, selectedSuggestions, allSuggestions, projectId, mood, blockers } = req.body;

        if (!response || response.trim().length === 0) {
            return errorResponse(res, 'Standup response is required');
        }

        // Prevent duplicate submission
        const existingStandup = await standupsModel.getTodayStandup(userId);
        if (existingStandup) {
            return errorResponse(res, 'You have already submitted a standup today');
        }

        // Resolve user name if not passed via token
        let standupUserName = userName;
        if (!standupUserName) {
            const user = await usersModel.getUser(userId);
            standupUserName = user?.name || user?.email || 'Unknown';
        }

        const standup = await standupsModel.createStandup({
            userId,
            userName: standupUserName,
            response: response.trim(),
            selectedSuggestions: selectedSuggestions || [],
            allSuggestions: allSuggestions || [],
            projectId: projectId || null,
            mood: mood || null,
            blockers: blockers || null,
        });

        return jsonResponse(res, {
            success: true,
            standup,
            message: 'Standup submitted successfully!',
        }, 201);

    } catch (error) {
        console.error('Create standup error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
