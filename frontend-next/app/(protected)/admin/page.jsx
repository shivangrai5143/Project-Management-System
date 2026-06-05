'use client';

import RoleGuard from '@/components/rbac/RoleGuard';
import AdminPage from '@/components/pages/AdminPage';
import { RBAC_PERMISSIONS } from '@/utils/constants';

export default function Admin() {
    return (
        <RoleGuard permission={RBAC_PERMISSIONS.ADMIN_ALL}>
            <AdminPage />
        </RoleGuard>
    );
}
