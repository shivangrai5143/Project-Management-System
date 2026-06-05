import * as tasksModel from '../models/firestore/tasks.js';
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
            return checkPermission(req, res, PERMISSIONS.TASKS_READ,
                () => getTasks(req, res, userId)
            );

        case 'POST':
            return checkPermission(req, res, PERMISSIONS.TASKS_CREATE,
                () => createTask(req, res, userId)
            );

        case 'PATCH':
            return checkPermission(req, res, PERMISSIONS.TASKS_UPDATE,
                () => updateTask(req, res, userId)
            );

        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// ---------------------------------------------------------------------------
// GET /api/tasks — Get tasks (by project or assigned to user)
// ---------------------------------------------------------------------------
async function getTasks(req, res, userId) {
    try {
        const { projectId, assignee, status } = req.query;

        let tasks;

        if (projectId) {
            tasks = await tasksModel.getTasksByProject(projectId, status || null);
        } else if (assignee === 'me') {
            tasks = await tasksModel.getTasksByAssignee(userId);
        } else {
            // Default: tasks assigned to this user
            const assignedTasks = await tasksModel.getTasksByAssignee(userId);
            return jsonResponse(res, {
                success: true,
                tasks: assignedTasks,
                count: assignedTasks.length,
            });
        }

        return jsonResponse(res, {
            success: true,
            tasks,
            count: tasks.length,
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// ---------------------------------------------------------------------------
// POST /api/tasks — Create a new task
// ---------------------------------------------------------------------------
async function createTask(req, res, userId) {
    try {
        const { title, description, projectId, assigneeId, status, priority, dueDate, labels } = req.body;

        if (!title || title.trim().length === 0) {
            return errorResponse(res, 'Task title is required');
        }

        if (!projectId) {
            return errorResponse(res, 'Project ID is required');
        }

        // Determine insertion order in the status column
        const existingTasks = await tasksModel.getTasksByProject(projectId, status || 'todo');
        const newOrder = existingTasks.length > 0
            ? Math.max(...existingTasks.map(t => t.order || 0)) + 1
            : 0;

        const task = await tasksModel.createTask({
            title: title.trim(),
            description: description || '',
            projectId,
            assigneeId: assigneeId || null,
            creatorId: userId,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            labels: labels || [],
            order: newOrder,
        });

        return jsonResponse(res, {
            success: true,
            task,
            message: 'Task created successfully!',
        }, 201);

    } catch (error) {
        console.error('Create task error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// ---------------------------------------------------------------------------
// PATCH /api/tasks — Update a task
// ---------------------------------------------------------------------------
async function updateTask(req, res, userId) {
    try {
        const { taskId, ...updates } = req.body;

        if (!taskId) {
            return errorResponse(res, 'Task ID is required');
        }

        const task = await tasksModel.getTask(taskId);
        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        // Build updates from only the allowed fields
        const allowedUpdates = ['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId', 'labels', 'order'];
        const updateData = {};
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        });

        const updatedTask = await tasksModel.updateTask(taskId, updateData);

        return jsonResponse(res, {
            success: true,
            task: updatedTask,
            message: 'Task updated successfully!',
        });

    } catch (error) {
        console.error('Update task error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
