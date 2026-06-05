'use client';

/**
 * RoleGuard — Protects a page or section from users who lack the required permission.
 *
 * Usage:
 *   <RoleGuard permission="analytics.read">
 *     <AnalyticsPage />
 *   </RoleGuard>
 *
 *   // Or with a custom fallback:
 *   <RoleGuard permission="admin.all" fallback={<p>Admins only</p>}>
 *     <AdminPanel />
 *   </RoleGuard>
 *
 * Props:
 *   permission  {string}         - RBAC_PERMISSIONS.* value (null = allow all)
 *   fallback    {React.ReactNode} - What to render on denial (default: <AccessDenied />)
 *   children    {React.ReactNode}
 */

import { useRBAC } from '@/context/RBACContext';
import AccessDenied from '@/app/(protected)/access-denied/page';

export default function RoleGuard({ permission, fallback, children }) {
    const { hasPermission } = useRBAC();

    // null permission means no restriction
    if (permission && !hasPermission(permission)) {
        return fallback ?? <AccessDenied />;
    }

    return children;
}
