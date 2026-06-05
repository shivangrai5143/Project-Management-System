import * as usersModel from '../models/firestore/users.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';
import { hasPermission, normaliseRole, PERMISSIONS, VALID_ROLES } from '../lib/rbac.js';

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

/**
 * Handler for /api/users
 *   GET  — list all users  (requires users.read)
 */
export default async function handler(req, res) {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
        return errorResponse(res, authResult.error, authResult.status);
    }
    req.user = authResult.user;

    switch (req.method) {
        case 'GET':
            return checkPermission(req, res, PERMISSIONS.USERS_READ,
                () => getAllUsers(req, res)
            );

        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// ---------------------------------------------------------------------------
// GET /api/users — Retrieve all users (admin/PM/developer only)
// ---------------------------------------------------------------------------
async function getAllUsers(req, res) {
    try {
        const users = await usersModel.getAllUsers();
        return jsonResponse(res, {
            success: true,
            users: users.map(usersModel.toPublicJSON),
            count: users.length,
        });
    } catch (error) {
        console.error('Get all users error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
