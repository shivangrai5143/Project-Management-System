import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import { signToken, jsonResponse, errorResponse } from '../lib/auth.js';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return errorResponse(res, 'Method not allowed', 405);
    }

    try {
        await connectDB();

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return errorResponse(res, 'Please provide email and password');
        }

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        // Generate JWT token
        const token = signToken({
            id: user._id,
            email: user.email,
            name: user.name,
        });

        // Return user data and token
        return jsonResponse(res, {
            success: true,
            user: user.toPublicJSON(),
            token,
        });

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
