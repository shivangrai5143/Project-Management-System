import * as projectsModel from '../models/firestore/projects.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';
import { hasPermission, PERMISSIONS } from '../lib/rbac.js';

/**
 * Inline permission check helper.
 * Since these handlers are plain functions (not Express Router handlers),
 * we perform the check synchronously here instead of using middleware.
 *
 * @param {object} req
 * @param {object} res
 * @param {string} permission
 * @param {Function} next
 */
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

// ---------------------------------------------------------------------------
// Main Handler (for /api/projects — collection-level operations)
// ---------------------------------------------------------------------------

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
            // All authenticated users with projects.read can list their projects
            return checkPermission(req, res, PERMISSIONS.PROJECTS_READ,
                () => getProjects(req, res, userId)
            );

        case 'POST':
            // Only admin and project_manager can create projects
            return checkPermission(req, res, PERMISSIONS.PROJECTS_CREATE,
                () => createProject(req, res, userId)
            );

        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// ---------------------------------------------------------------------------
// GET /api/projects — List projects for the authenticated user
// ---------------------------------------------------------------------------
async function getProjects(req, res, userId) {
    try {
        const projects = await projectsModel.getProjectsForUser(userId);

        return jsonResponse(res, {
            success: true,
            projects,
            count: projects.length,
        });

    } catch (error) {
        console.error('Get projects error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// ---------------------------------------------------------------------------
// POST /api/projects — Create a new project
// ---------------------------------------------------------------------------
async function createProject(req, res, userId) {
    try {
        const { name, description, color, icon } = req.body;

        if (!name || name.trim().length === 0) {
            return errorResponse(res, 'Project name is required');
        }

        const project = await projectsModel.createProject({
            name: name.trim(),
            description: description || '',
            color: color || '#6366f1',
            icon: icon || 'folder',
            ownerId: userId,
            members: [{
                userId,
                role: 'owner',
            }],
        });

        return jsonResponse(res, {
            success: true,
            project,
            message: 'Project created successfully!',
        }, 201);

    } catch (error) {
        console.error('Create project error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
