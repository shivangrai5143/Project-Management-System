import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
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

        await connectDB();

        // Get user ID from query params
        const { id } = req.query;

        if (!id) {
            return errorResponse(res, 'User ID is required', 400);
        }

        // Parse request body
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { avatar } = body;

        // Find and update user
        const user = await User.findById(id);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Update avatar if provided
        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        await user.save();

        // Return updated user data
        return jsonResponse(res, {
            success: true,
            user: user.toPublicJSON(),
        });

    } catch (error) {
        console.error('Update user error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
