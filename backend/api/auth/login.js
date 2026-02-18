import { jsonResponse, errorResponse } from '../lib/auth.js';
import express
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return errorResponse(res, 'Method not allowed', 405);
    }

    try {
        // Firebase Auth login is handled entirely on the client side
        // using signInWithEmailAndPassword from Firebase SDK
        // This endpoint can be kept for backward compatibility or removed

        return jsonResponse(res, {
            success: true,
            message: 'Login should be performed on the client side using Firebase Auth SDK',
        });

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
