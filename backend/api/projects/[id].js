import * as projectsModel from '../models/firestore/projects.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';
import { hasPermission, PERMISSIONS } from '../lib/rbac.js';
import { logEvent, ACTIONS } from '../lib/activityLogger.js';

/**
 * Inline permission guard.
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

/**
 * Handler for /api/projects/:id
 * GET    — fetch project by ID        (projects.read)
 * PUT    — update project             (projects.update)
 * DELETE — permanently delete project (projects.delete)
 */
export default async function handler(req, res) {
    // Authenticate and attach role-enriched user
    const authResult = await authMiddleware(req);
    if (authResult.error) {
        return errorResponse(res, authResult.error, authResult.status);
    }
    req.user = authResult.user;

    // Extract project ID from params (server.js sets req.params.id)
    const projectId = req.params?.id || req.query?.id;
    if (!projectId) {
        return errorResponse(res, 'Project ID is required', 400);
    }

    switch (req.method) {
        case 'GET':
            return checkPermission(req, res, PERMISSIONS.PROJECTS_READ,
                () => getProject(req, res, projectId)
            );

        case 'PUT':
        case 'PATCH':
            return checkPermission(req, res, PERMISSIONS.PROJECTS_UPDATE,
                () => updateProject(req, res, projectId)
            );

        case 'DELETE':
            return checkPermission(req, res, PERMISSIONS.PROJECTS_DELETE,
                () => deleteProject(req, res, projectId, req.user.uid)
            );

        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// ---------------------------------------------------------------------------
// GET /api/projects/:id
// ---------------------------------------------------------------------------
async function getProject(req, res, projectId) {
    try {
        const project = await projectsModel.getProject(projectId);

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        return jsonResponse(res, { success: true, project });
    } catch (error) {
        console.error('Get project error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/:id
// ---------------------------------------------------------------------------
async function updateProject(req, res, projectId) {
    try {
        const project = await projectsModel.getProject(projectId);
        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        const allowedFields = ['name', 'description', 'color', 'icon', 'status', 'settings', 'members'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedProject = await projectsModel.updateProject(projectId, updates);

        // Log activity (non-blocking)
        logEvent({
            actorId:    req.user.uid,
            actorName:  req.user.name,
            action:     ACTIONS.PROJECT_UPDATED,
            targetId:   projectId,
            targetType: 'project',
            targetName: updatedProject.name,
            projectId:  projectId,
            projectName: updatedProject.name,
            metadata:   { updatedFields: Object.keys(updates) },
        });

        return jsonResponse(res, {
            success: true,
            project: updatedProject,
            message: 'Project updated successfully!',
        });
    } catch (error) {
        console.error('Update project error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/:id  (admin-only enforced via projects.delete permission)
// ---------------------------------------------------------------------------
async function deleteProject(req, res, projectId, userId) {
    try {
        const project = await projectsModel.getProject(projectId);
        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        await projectsModel.deleteProject(projectId);
        return jsonResponse(res, {
            success: true,
            message: 'Project deleted successfully!',
        });
    } catch (error) {
        console.error('Delete project error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
