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
 * Handler for /api/users/:id
 *   PATCH         — update profile fields    (self or users.manage)
 *   PATCH /role   — change a user's role     (users.manage — admin only)
 */
export default async function handler(req, res) {
    // Authenticate and attach role-enriched user
    const authResult = await authMiddleware(req);
    if (authResult.error) {
        return errorResponse(res, authResult.error, authResult.status);
    }
    req.user = authResult.user;

    const { id } = req.query;
    if (!id) {
        return errorResponse(res, 'User ID is required', 400);
    }

    // Check whether this is a role-change request
    if (req.query.action === 'role' || req.body?.action === 'role') {
        return checkPermission(req, res, PERMISSIONS.USERS_MANAGE,
            () => updateUserRole(req, res, id)
        );
    }

    switch (req.method) {
        case 'PATCH':
            return handlePatch(req, res, id);

        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// ---------------------------------------------------------------------------
// PATCH /api/users/:id — Update profile (profile fields)
// ---------------------------------------------------------------------------
async function handlePatch(req, res, targetUserId) {
    const requestingUserId = req.user.uid;
    const isSelf = requestingUserId === targetUserId;
    const canManageOthers = hasPermission(req.user.role, PERMISSIONS.USERS_MANAGE);

    // Only allow if editing own profile, or if the user has users.manage
    if (!isSelf && !canManageOthers) {
        return res.status(403).json({
            error: 'Forbidden: you can only update your own profile',
            code: 'INSUFFICIENT_PERMISSIONS',
        });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const updates = {};

        // Standard profile fields anyone can update on their own profile
        const profileFields = ['avatar', 'name', 'gitHubUsername', 'standupSettings'];
        profileFields.forEach(field => {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        });

        const user = await usersModel.updateUser(targetUserId, updates);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        return jsonResponse(res, {
            success: true,
            user: usersModel.toPublicJSON(user),
        });

    } catch (error) {
        console.error('Update user error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// ---------------------------------------------------------------------------
// PATCH /api/users/:id?action=role — Change a user's role (admin only)
// ---------------------------------------------------------------------------
async function updateUserRole(req, res, targetUserId) {
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { role } = body;

        if (!role) {
            return errorResponse(res, 'Role is required', 400);
        }

        // Validate that the new role is one of the known RBAC roles
        const normalisedRole = normaliseRole(role);
        if (!VALID_ROLES.includes(normalisedRole)) {
            return errorResponse(res, `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 400);
        }

        const user = await usersModel.updateUser(targetUserId, { role: normalisedRole });
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        return jsonResponse(res, {
            success: true,
            user: usersModel.toPublicJSON(user),
            message: `User role updated to '${normalisedRole}'`,
        });

    } catch (error) {
        console.error('Update user role error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
