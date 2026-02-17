import { auth } from './firebase-admin.js';

/**
 * Verify Firebase ID token from Authorization header
 */
export async function verifyFirebaseToken(token) {
    try {
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function getTokenFromHeader(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.substring(7);
}

/**
 * Authentication middleware for API routes
 * Verifies Firebase token and adds `user` to the result
 */
export async function authMiddleware(req) {
    const token = getTokenFromHeader(req);

    if (!token) {
        return { error: 'No token provided', status: 401 };
    }

    const decodedToken = await verifyFirebaseToken(token);

    if (!decodedToken) {
        return { error: 'Invalid or expired token', status: 401 };
    }

    // Return decoded token data (uid, email, etc.)
    return {
        user: {
            id: decodedToken.uid,
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split('@')[0],
        }
    };
}

/**
 * Helper to send JSON response
 */
export function jsonResponse(res, data, status = 200) {
    res.status(status).json(data);
}

/**
 * Helper to send error response
 */
export function errorResponse(res, message, status = 400) {
    res.status(status).json({ error: message });
}

