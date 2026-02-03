import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';

export default async function handler(req, res) {
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 'Method not allowed', 405);
    }

    try {
        // Verify authentication
        const authResult = await authMiddleware(req);

        if (authResult.error) {
            return errorResponse(res, authResult.error, authResult.status);
        }

        await connectDB();

        // Get user from database
        const user = await User.findById(authResult.user.id);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Return user data
        return jsonResponse(res, {
            success: true,
            user: user.toPublicJSON(),
        });

    } catch (error) {
        console.error('Get user error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
