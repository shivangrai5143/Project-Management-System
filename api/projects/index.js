import connectDB from '../lib/mongodb.js';
import Project from '../models/Project.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';

export default async function handler(req, res) {
    // Verify authentication for all routes
    const authResult = await authMiddleware(req);

    if (authResult.error) {
        return errorResponse(res, authResult.error, authResult.status);
    }

    await connectDB();
    const userId = authResult.user.id;

    switch (req.method) {
        case 'GET':
            return getProjects(req, res, userId);
        case 'POST':
            return createProject(req, res, userId);
        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// GET /api/projects - Get all projects for user
async function getProjects(req, res, userId) {
    try {
        const projects = await Project.getForUser(userId);

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

// POST /api/projects - Create a new project
async function createProject(req, res, userId) {
    try {
        const { name, description, color, icon } = req.body;

        if (!name || name.trim().length === 0) {
            return errorResponse(res, 'Project name is required');
        }

        // Create project with owner as first member
        const project = await Project.create({
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
