import { auth, db } from './firebase-admin.js';
import { normaliseRole } from './rbac.js';

/**
 * Verify Firebase ID token from Authorization header.
 *
 * @param {string} token - Firebase ID token
 * @returns {Promise<import('firebase-admin').auth.DecodedIdToken | null>}
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
 * Extract Bearer token from Authorization header.
 *
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export function getTokenFromHeader(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.substring(7);
}

/**
 * Authentication middleware for API routes.
 *
 * Verifies the Firebase ID token, then loads the user's Firestore profile
 * to attach their RBAC role. Returns `{ user }` on success or `{ error, status }`
 * on failure.
 *
 * The returned `user` object shape:
 *   { id, uid, email, name, role }
 *
 * @param {import('express').Request} req
 * @returns {Promise<{ user: object } | { error: string, status: number }>}
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

    // Attempt to load the user's Firestore document to obtain their RBAC role.
    // Falls back gracefully if the document is missing (e.g., during registration).
    let role = 'developer'; // safe default
    try {
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
            role = normaliseRole(userDoc.data().role);
        }
    } catch (firestoreError) {
        console.warn('Could not fetch user role from Firestore:', firestoreError.message);
        // Non-fatal — continue with the default role
    }

    return {
        user: {
            id: decodedToken.uid,
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split('@')[0],
            role,
        },
    };
}

/**
 * Express middleware that runs `authMiddleware` and populates `req.user`.
 * Use this before `requirePermission()` middleware.
 *
 * On failure it responds with the appropriate HTTP status and ends the chain.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function attachUser(req, res, next) {
    const result = await authMiddleware(req);

    if (result.error) {
        return res.status(result.status || 401).json({ error: result.error });
    }

    req.user = result.user;
    next();
}

/**
 * Helper to send a JSON response.
 *
 * @param {import('express').Response} res
 * @param {object} data
 * @param {number} [status=200]
 */
export function jsonResponse(res, data, status = 200) {
    res.status(status).json(data);
}

/**
 * Helper to send an error response.
 *
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [status=400]
 */
export function errorResponse(res, message, status = 400) {
    res.status(status).json({ error: message });
}
