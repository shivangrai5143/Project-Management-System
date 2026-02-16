import * as usersModel from '../models/firestore/users.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';

export default async function handler(req, res) {
    // Only allow PATCH for updates
    if (req.method !== 'PATCH') {
        return errorResponse(res, 'Method not allowed', 405);
    }

    try {
        // Verify authentication
        const authResult = await authMiddleware(req);

        if (authResult.error) {
            return errorResponse(res, authResult.error, authResult.status);
        }

        // Get user ID from query params
        const { id } = req.query;

        if (!id) {
            return errorResponse(res, 'User ID is required', 400);
        }

        // Parse request body
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const updates = {};

        // Only allow updating certain fields
        const allowedFields = ['avatar', 'name', 'gitHubUsername', 'standupSettings'];
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        });

        // Update user in Firestore
        const user = await usersModel.updateUser(id, updates);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Return updated user data
        return jsonResponse(res, {
            success: true,
            user: usersModel.toPublicJSON(user),
        });

    } catch (error) {
        console.error('Update user error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
