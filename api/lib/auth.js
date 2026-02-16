import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Sign a JWT token with user data
 */
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
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
 * Adds `req.user` if token is valid
 */
export async function authMiddleware(req) {
    const token = getTokenFromHeader(req);

    if (!token) {
        return { error: 'No token provided', status: 401 };
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return { error: 'Invalid or expired token', status: 401 };
    }

    return { user: decoded };
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
