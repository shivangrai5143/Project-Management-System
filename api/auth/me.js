import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';
import * as usersModel from '../models/firestore/users.js';

export default async function handler(req, res) {
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 'Method not allowed', 405);
    }

    try {
        // Verify Firebase token
        const authResult = await authMiddleware(req);

        if (authResult.error) {
            return errorResponse(res, authResult.error, authResult.status);
        }

        // Get user data from Firestore
        const user = await usersModel.getUser(authResult.user.uid);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Return user data
        return jsonResponse(res, {
            success: true,
            user: usersModel.toPublicJSON(user),
        });

    } catch (error) {
        console.error('Get user error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
