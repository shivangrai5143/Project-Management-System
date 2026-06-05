/**
 * Role-Based Access Control (RBAC) — Permissions Matrix & Middleware
 *
 * Roles:
 *   admin           - Full system access
 *   project_manager - Can manage projects and teams; cannot change roles
 *   developer       - Can work on tasks; limited project access
 *   client          - Read-only view of project progress
 *
 * Legacy role 'user' is treated as 'developer' for backward compatibility.
 */

// ---------------------------------------------------------------------------
// Role Definitions
// ---------------------------------------------------------------------------

export const ROLES = {
    ADMIN: 'admin',
    PROJECT_MANAGER: 'project_manager',
    DEVELOPER: 'developer',
    CLIENT: 'client',
};

/** Roles that are valid in the system (ordered by privilege level) */
export const VALID_ROLES = [
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.DEVELOPER,
    ROLES.CLIENT,
];

/**
 * Map legacy role values to the new RBAC roles.
 * Called when reading a user whose role field hasn't been migrated yet.
 */
export function normaliseRole(role) {
    if (VALID_ROLES.includes(role)) return role;
    if (role === 'admin') return ROLES.ADMIN;
    // 'user' and any unknown values → developer (safest default)
    return ROLES.DEVELOPER;
}

// ---------------------------------------------------------------------------
// Permissions Catalogue
// ---------------------------------------------------------------------------

export const PERMISSIONS = {
    // Projects
    PROJECTS_CREATE: 'projects.create',
    PROJECTS_READ:   'projects.read',
    PROJECTS_UPDATE: 'projects.update',
    PROJECTS_DELETE: 'projects.delete',

    // Tasks
    TASKS_CREATE: 'tasks.create',
    TASKS_READ:   'tasks.read',
    TASKS_UPDATE: 'tasks.update',
    TASKS_DELETE: 'tasks.delete',

    // Users / Team
    USERS_READ:   'users.read',
    USERS_UPDATE: 'users.update',   // update own profile
    USERS_MANAGE: 'users.manage',   // change any user's role (admin only)
    TEAM_READ:    'team.read',
    TEAM_INVITE:  'team.invite',

    // Standups
    STANDUPS_READ:   'standups.read',
    STANDUPS_CREATE: 'standups.create',

    // Whiteboard
    WHITEBOARD_READ:   'whiteboard.read',
    WHITEBOARD_WRITE:  'whiteboard.write',
    WHITEBOARD_DELETE: 'whiteboard.delete',

    // Analytics / Audit
    ANALYTICS_READ: 'analytics.read',
    AUDIT_READ:     'audit.read',

    // Catch-all for admin-only operations
    ADMIN_ALL: 'admin.all',
};

// ---------------------------------------------------------------------------
// Role → Permissions Mapping
// ---------------------------------------------------------------------------

/** @type {Record<string, string[]>} */
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        // Admins get every permission
        ...Object.values(PERMISSIONS),
    ],

    [ROLES.PROJECT_MANAGER]: [
        PERMISSIONS.PROJECTS_CREATE,
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.PROJECTS_UPDATE,
        // NOT projects.delete — only admins can permanently delete

        PERMISSIONS.TASKS_CREATE,
        PERMISSIONS.TASKS_READ,
        PERMISSIONS.TASKS_UPDATE,
        PERMISSIONS.TASKS_DELETE,

        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.TEAM_READ,
        PERMISSIONS.TEAM_INVITE,

        PERMISSIONS.STANDUPS_READ,
        PERMISSIONS.STANDUPS_CREATE,

        PERMISSIONS.WHITEBOARD_READ,
        PERMISSIONS.WHITEBOARD_WRITE,
        PERMISSIONS.WHITEBOARD_DELETE,

        PERMISSIONS.ANALYTICS_READ,
    ],

    [ROLES.DEVELOPER]: [
        PERMISSIONS.PROJECTS_READ,

        PERMISSIONS.TASKS_CREATE,
        PERMISSIONS.TASKS_READ,
        PERMISSIONS.TASKS_UPDATE,

        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.TEAM_READ,

        PERMISSIONS.STANDUPS_READ,
        PERMISSIONS.STANDUPS_CREATE,

        PERMISSIONS.WHITEBOARD_READ,
        PERMISSIONS.WHITEBOARD_WRITE,
    ],

    [ROLES.CLIENT]: [
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.TASKS_READ,
        PERMISSIONS.USERS_UPDATE,   // self profile only — enforced at handler level
        PERMISSIONS.WHITEBOARD_READ,
    ],
};

// ---------------------------------------------------------------------------
// Permission Check Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the given role has the specified permission.
 *
 * @param {string} role       - One of ROLES.*
 * @param {string} permission - One of PERMISSIONS.*
 */
export function hasPermission(role, permission) {
    const normalisedRole = normaliseRole(role);
    const perms = ROLE_PERMISSIONS[normalisedRole] || [];
    return perms.includes(permission);
}

/**
 * Returns the full permission list for a given role.
 *
 * @param {string} role
 * @returns {string[]}
 */
export function getPermissionsForRole(role) {
    const normalisedRole = normaliseRole(role);
    return ROLE_PERMISSIONS[normalisedRole] || [];
}

// ---------------------------------------------------------------------------
// Express Middleware Factory
// ---------------------------------------------------------------------------

/**
 * Creates an Express middleware that:
 *   1. Expects `req.user` to already be populated by authMiddleware
 *   2. Checks whether the user's role grants the required permission
 *   3. Returns 403 if the check fails, or calls next() to continue
 *
 * Usage:
 *   router.post('/projects', requirePermission(PERMISSIONS.PROJECTS_CREATE), handler);
 *
 * @param {string} permission - The PERMISSIONS.* value required for the route
 */
export function requirePermission(permission) {
    return function (req, res, next) {
        // authMiddleware must run first and populate req.user
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized: authentication required',
                code: 'AUTH_REQUIRED',
            });
        }

        const userRole = req.user.role || ROLES.DEVELOPER;

        if (!hasPermission(userRole, permission)) {
            return res.status(403).json({
                error: `Forbidden: you do not have permission to perform this action`,
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredPermission: permission,
                userRole,
            });
        }

        next();
    };
}

/**
 * Convenience: require that the authenticated user is an admin.
 * Equivalent to requirePermission(PERMISSIONS.ADMIN_ALL) but with clearer error.
 */
export function requireAdmin() {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
        }
        if (normaliseRole(req.user.role) !== ROLES.ADMIN) {
            return res.status(403).json({
                error: 'Forbidden: admin access required',
                code: 'ADMIN_REQUIRED',
                userRole: req.user.role,
            });
        }
        next();
    };
}
