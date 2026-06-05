'use client';

/**
 * RBACContext — Frontend Role-Based Access Control
 *
 * Provides a `useRBAC()` hook that gives components access to:
 *   - userRole         : the current user's role string
 *   - hasPermission(p) : returns true if the user's role grants permission p
 *   - canAccess(path)  : returns true if the user can visit a given route path
 *
 * Permission logic mirrors backend/api/lib/rbac.js — keep both in sync.
 */

import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RBAC_PERMISSIONS, ROUTE_PERMISSIONS, USER_ROLES } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Role → Permissions map (mirrors backend/api/lib/rbac.js)
// ---------------------------------------------------------------------------

const ALL_PERMISSIONS = Object.values(RBAC_PERMISSIONS);

const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: ALL_PERMISSIONS,

    [USER_ROLES.PROJECT_MANAGER]: [
        RBAC_PERMISSIONS.PROJECTS_CREATE,
        RBAC_PERMISSIONS.PROJECTS_READ,
        RBAC_PERMISSIONS.PROJECTS_UPDATE,

        RBAC_PERMISSIONS.TASKS_CREATE,
        RBAC_PERMISSIONS.TASKS_READ,
        RBAC_PERMISSIONS.TASKS_UPDATE,
        RBAC_PERMISSIONS.TASKS_DELETE,

        RBAC_PERMISSIONS.USERS_READ,
        RBAC_PERMISSIONS.USERS_UPDATE,
        RBAC_PERMISSIONS.TEAM_READ,
        RBAC_PERMISSIONS.TEAM_INVITE,

        RBAC_PERMISSIONS.STANDUPS_READ,
        RBAC_PERMISSIONS.STANDUPS_CREATE,

        RBAC_PERMISSIONS.WHITEBOARD_READ,
        RBAC_PERMISSIONS.WHITEBOARD_WRITE,
        RBAC_PERMISSIONS.WHITEBOARD_DELETE,

        RBAC_PERMISSIONS.ANALYTICS_READ,
    ],

    [USER_ROLES.DEVELOPER]: [
        RBAC_PERMISSIONS.PROJECTS_READ,

        RBAC_PERMISSIONS.TASKS_CREATE,
        RBAC_PERMISSIONS.TASKS_READ,
        RBAC_PERMISSIONS.TASKS_UPDATE,

        RBAC_PERMISSIONS.USERS_READ,
        RBAC_PERMISSIONS.USERS_UPDATE,
        RBAC_PERMISSIONS.TEAM_READ,

        RBAC_PERMISSIONS.STANDUPS_READ,
        RBAC_PERMISSIONS.STANDUPS_CREATE,

        RBAC_PERMISSIONS.WHITEBOARD_READ,
        RBAC_PERMISSIONS.WHITEBOARD_WRITE,
    ],

    [USER_ROLES.CLIENT]: [
        RBAC_PERMISSIONS.PROJECTS_READ,
        RBAC_PERMISSIONS.TASKS_READ,
        RBAC_PERMISSIONS.USERS_UPDATE,
        RBAC_PERMISSIONS.WHITEBOARD_READ,
    ],
};

/**
 * Normalise a raw role string from Firestore to one of the 4 known roles.
 * Legacy `'user'` maps to `'developer'`.
 */
function normaliseRole(role) {
    if (Object.values(USER_ROLES).includes(role)) return role;
    if (role === 'admin') return USER_ROLES.ADMIN;
    return USER_ROLES.DEVELOPER;  // safe default
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RBACContext = createContext(null);

export function useRBAC() {
    const ctx = useContext(RBACContext);
    if (!ctx) throw new Error('useRBAC must be used within an RBACProvider');
    return ctx;
}

export function RBACProvider({ children }) {
    const { user } = useAuth();

    const value = useMemo(() => {
        const rawRole  = user?.role ?? USER_ROLES.DEVELOPER;
        const userRole = normaliseRole(rawRole);
        const perms    = ROLE_PERMISSIONS[userRole] || [];

        /**
         * Check if the current user has a specific permission.
         * @param {string} permission - One of RBAC_PERMISSIONS.*
         */
        function hasPermission(permission) {
            return perms.includes(permission);
        }

        /**
         * Check if the current user can access a given route path.
         * @param {string} path - e.g. '/analytics'
         */
        function canAccess(path) {
            // Find the most specific matching route
            const matchedPath = Object.keys(ROUTE_PERMISSIONS)
                .filter(route => path === route || path.startsWith(route + '/'))
                .sort((a, b) => b.length - a.length)[0];  // longest match wins

            if (!matchedPath) return true;                  // unknown routes: allow

            const requiredPermission = ROUTE_PERMISSIONS[matchedPath];
            if (!requiredPermission) return true;           // null = no restriction

            return hasPermission(requiredPermission);
        }

        return { userRole, hasPermission, canAccess, normaliseRole };
    }, [user?.role]);

    return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}
