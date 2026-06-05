'use client';

/**
 * AdminPage — User management panel for Admins.
 *
 * Features:
 *   - Lists all users with their current role
 *   - Allows admins to change any user's role via dropdown
 *   - Shows role badges, avatars, emails
 *   - Requires RBAC_PERMISSIONS.ADMIN_ALL (admin role only)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { usersApi } from '@/utils/api';
import { USER_ROLES, USER_ROLE_CONFIG } from '@/utils/constants';
import Avatar from '@/components/ui/Avatar';
import RoleBadge from '@/components/ui/RoleBadge';
import Card from '@/components/ui/Card';
import {
    ShieldCheck,
    Users,
    RefreshCw,
    Save,
    Search,
    AlertTriangle,
} from 'lucide-react';

// Role options shown in the dropdown selector
const ROLE_OPTIONS = Object.entries(USER_ROLE_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
}));

export default function AdminPage() {
    const { user: currentUser } = useAuth();
    const { showToast } = useNotifications();

    const [users, setUsers]           = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [searchQuery, setSearch]    = useState('');
    const [saving, setSaving]         = useState({});  // { [userId]: boolean }
    const [pendingRoles, setPending]  = useState({});  // { [userId]: newRole }

    // Load all users on mount
    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setIsLoading(true);
        try {
            const data = await usersApi.getAll();
            setUsers(data.users || []);
        } catch (err) {
            showToast('Failed to load users: ' + err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }

    function handleRoleChange(userId, newRole) {
        setPending(prev => ({ ...prev, [userId]: newRole }));
    }

    async function saveRole(targetUser) {
        const newRole = pendingRoles[targetUser.id];
        if (!newRole || newRole === targetUser.role) return;

        setSaving(prev => ({ ...prev, [targetUser.id]: true }));
        try {
            await usersApi.updateRole(targetUser.id, newRole);
            setUsers(prev =>
                prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u)
            );
            setPending(prev => {
                const next = { ...prev };
                delete next[targetUser.id];
                return next;
            });
            showToast(`Role updated to "${USER_ROLE_CONFIG[newRole]?.label}" for ${targetUser.name}`, 'success');
        } catch (err) {
            showToast('Failed to update role: ' + err.message, 'error');
        } finally {
            setSaving(prev => ({ ...prev, [targetUser.id]: false }));
        }
    }

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-purple-400" />
                        </div>
                        Admin Panel
                    </h1>
                    <p className="text-slate-400 mt-1 ml-[52px]">
                        Manage user roles and system access
                    </p>
                </div>
                <button
                    onClick={loadUsers}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(USER_ROLE_CONFIG).map(([role, cfg]) => {
                    const count = users.filter(u => (u.role || 'developer') === role).length;
                    return (
                        <Card key={role} padding="md">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${cfg.bgColor} border ${cfg.borderColor} flex items-center justify-center`}>
                                    <Users className={`w-5 h-5 ${cfg.textColor}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{count}</p>
                                    <p className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Users table */}
            <Card padding="none">
                {/* Table header / search */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search users by name or email..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                        />
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                        {filteredUsers.length} of {users.length} users
                    </span>
                </div>

                {/* Loading */}
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                        <p className="text-slate-400 text-sm">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-20 text-center">
                        <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400">No users found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {filteredUsers.map(u => {
                            const effectiveRole = pendingRoles[u.id] || u.role || 'developer';
                            const hasChanges    = pendingRoles[u.id] && pendingRoles[u.id] !== u.role;
                            const isSelf        = u.id === currentUser?.id;

                            return (
                                <div
                                    key={u.id}
                                    className={`flex items-center gap-4 p-4 transition-colors ${hasChanges ? 'bg-indigo-500/5' : 'hover:bg-slate-800/30'}`}
                                >
                                    {/* Avatar */}
                                    <Avatar name={u.name} src={u.avatar} size="md" />

                                    {/* User info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium text-white truncate">{u.name}</p>
                                            {isSelf && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                        <div className="mt-1.5">
                                            <RoleBadge role={u.role || 'developer'} size="sm" />
                                        </div>
                                    </div>

                                    {/* Role selector */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {isSelf ? (
                                            /* Prevent admins from accidentally changing their own role */
                                            <div className="flex items-center gap-1.5 text-xs text-amber-400/70 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Your account
                                            </div>
                                        ) : (
                                            <>
                                                <select
                                                    value={effectiveRole}
                                                    onChange={e => handleRoleChange(u.id, e.target.value)}
                                                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                                                >
                                                    {ROLE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                {hasChanges && (
                                                    <button
                                                        onClick={() => saveRole(u)}
                                                        disabled={saving[u.id]}
                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
                                                    >
                                                        {saving[u.id] ? (
                                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Save className="w-3.5 h-3.5" />
                                                        )}
                                                        Save
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Role descriptions reference */}
            <Card padding="lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Role Permissions Reference
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(USER_ROLE_CONFIG).map(([role, cfg]) => (
                        <div key={role} className={`p-3 rounded-xl border ${cfg.borderColor} ${cfg.bgColor}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <RoleBadge role={role} size="sm" />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{cfg.description}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
