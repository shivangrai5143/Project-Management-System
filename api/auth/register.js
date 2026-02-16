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

        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return errorResponse(res, 'Please provide email, password, and name');
        }

        if (password.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return errorResponse(res, 'Email already registered');
        }

        // Create new user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            name,
        });

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
        }, 201);

    } catch (error) {
        console.error('Register error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
