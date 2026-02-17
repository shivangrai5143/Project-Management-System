import { auth } from '../lib/firebase-admin.js';
import * as usersModel from '../models/firestore/users.js';
import { jsonResponse, errorResponse } from '../lib/auth.js';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return errorResponse(res, 'Method not allowed', 405);
    }

    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return errorResponse(res, 'Please provide email, password, and name');
        }

        if (password.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters');
        }

        // Check if user already exists
        const existingUser = await usersModel.getUserByEmail(email);
        if (existingUser) {
            return errorResponse(res, 'Email already registered');
        }

        // Create Firebase Auth user
        const userRecord = await auth.createUser({
            email: email.toLowerCase(),
            password,
            displayName: name,
        });

        // Create user profile in Firestore
        const user = await usersModel.createUser(userRecord.uid, {
            email: email.toLowerCase(),
            name,
        });

        // Generate custom token for immediate login
        const token = await auth.createCustomToken(userRecord.uid);

        // Return user data and token
        return jsonResponse(res, {
            success: true,
            user: usersModel.toPublicJSON(user),
            token, // Custom token - client will exchange this for ID token
        }, 201);

    } catch (error) {
        console.error('Register error:', error);

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-exists') {
            return errorResponse(res, 'Email already registered');
        }
        if (error.code === 'auth/invalid-email') {
            return errorResponse(res, 'Invalid email address');
        }
        if (error.code === 'auth/weak-password') {
            return errorResponse(res, 'Password is too weak');
        }

        return errorResponse(res, 'Server error', 500);
    }
}
