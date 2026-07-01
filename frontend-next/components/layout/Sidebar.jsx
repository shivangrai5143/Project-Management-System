'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    BarChart3,
    BookOpen,
    Bot,
    Bug,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    FileText,
    FolderKanban,
    GitBranch,
    LayoutDashboard,
    LogOut,
    Settings,
    ShieldCheck,
    Sparkles,
    Timer,
    Trophy,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRBAC } from '@/context/RBACContext';
import { useAIAgent } from '@/context/AIAgentContext';
import Avatar from '@/components/ui/Avatar';
import RoleBadge from '@/components/ui/RoleBadge';
import { RBAC_PERMISSIONS } from '@/utils/constants';

const NAV_GROUPS = [
    {
        label: 'Core',
        items: [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: null },
            { path: '/projects', icon: FolderKanban, label: 'Projects', permission: RBAC_PERMISSIONS.PROJECTS_READ },
            { path: '/tasks', icon: CheckSquare, label: 'My Tasks', permission: RBAC_PERMISSIONS.TASKS_READ },
            { path: '/sprints', icon: Timer, label: 'Sprints', permission: RBAC_PERMISSIONS.TASKS_READ },
            { path: '/bugs', icon: Bug, label: 'Bug Tracker', permission: RBAC_PERMISSIONS.TASKS_READ },
            { path: '/analytics', icon: BarChart3, label: 'Analytics', permission: RBAC_PERMISSIONS.ANALYTICS_READ },
        ],
    },
    {
        label: 'Intelligence',
        items: [
            { path: '/automation', icon: Zap, label: 'Automation', permission: RBAC_PERMISSIONS.PROJECTS_UPDATE },
            { path: '/knowledge', icon: BookOpen, label: 'Knowledge Hub', permission: RBAC_PERMISSIONS.PROJECTS_READ },
            { path: '/integrations', icon: GitBranch, label: 'Integrations', permission: RBAC_PERMISSIONS.PROJECTS_UPDATE },
        ],
    },
    {
        label: 'Team',
        items: [
            { path: '/team', icon: Users, label: 'Team', permission: RBAC_PERMISSIONS.TEAM_READ },
            { path: '/gamification', icon: Trophy, label: 'Achievements', permission: RBAC_PERMISSIONS.TASKS_READ },
            { path: '/activity', icon: Activity, label: 'Activity', permission: RBAC_PERMISSIONS.ACTIVITY_READ },
            { path: '/audit', icon: FileText, label: 'Audit Logs', permission: RBAC_PERMISSIONS.AUDIT_READ },
        ],
    },
    {
        label: 'System',
        items: [
            { path: '/settings', icon: Settings, label: 'Settings', permission: null },
            { path: '/admin', icon: ShieldCheck, label: 'Admin Panel', permission: RBAC_PERMISSIONS.ADMIN_ALL },
        ],
    },
];

function SidebarGroup({
    group,
    isCollapsed,
    isDesktop,
    isActive,
    onNavigate,
}) {
    if (group.items.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {group.label}
                </p>
            )}

            <div className="space-y-1">
                {group.items.map((item) => {
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={onNavigate}
                            title={isCollapsed ? item.label : undefined}
                            aria-current={active ? 'page' : undefined}
                            className={[
                                'group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all',
                                active
                                    ? 'border-violet-500/30 bg-violet-500/10 text-white shadow-[0_10px_30px_rgba(124,58,237,0.12)]'
                                    : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-800/70 hover:text-slate-200',
                                isCollapsed ? 'justify-center px-2.5' : '',
                            ].join(' ')}
                        >
                            {active && (
                                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-violet-400" />
                            )}
                            <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-violet-200' : 'group-hover:text-slate-200'}`} />
                            {!isCollapsed && (
                                <span className="truncate">
                                    {item.label}
                                </span>
                            )}
                            {!isCollapsed && active && isDesktop && (
                                <span className="ml-auto rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-violet-200">
                                    Live
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function SidebarContent({
    isCollapsed,
    isDesktop,
    visibleGroups,
    isActive,
    onNavigate,
    onToggleCollapse,
    onLogout,
    onOpenAssistant,
    user,
    userRole,
}) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex h-[76px] items-center justify-between gap-3 border-b border-slate-800/80 px-3">
                <Link
                    href="/dashboard"
                    onClick={onNavigate}
                    className={`flex min-w-0 items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/12 text-violet-200 shadow-[0_10px_26px_rgba(124,58,237,0.18)]">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold tracking-tight text-white">
                                YojnaFlow
                            </p>
                            <p className="truncate text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                Project OS
                            </p>
                        </div>
                    )}
                </Link>

                <button
                    type="button"
                    onClick={isDesktop ? onToggleCollapse : onNavigate}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/70 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                    aria-label={isDesktop ? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Close sidebar'}
                >
                    {isDesktop
                        ? (isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
                        : <X className="h-4 w-4" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-5">
                    {visibleGroups.map((group) => (
                        <SidebarGroup
                            key={group.label}
                            group={group}
                            isCollapsed={isCollapsed}
                            isDesktop={isDesktop}
                            isActive={isActive}
                            onNavigate={onNavigate}
                        />
                    ))}

                    <button
                        type="button"
                        onClick={onOpenAssistant}
                        title={isCollapsed ? 'Open ERA Assistant' : undefined}
                        className={[
                            'w-full overflow-hidden rounded-[1.35rem] border border-violet-500/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(15,23,42,0.92))] p-3 text-left transition-all hover:border-violet-400/30 hover:shadow-[0_10px_34px_rgba(124,58,237,0.18)]',
                            isCollapsed ? 'flex justify-center px-2.5 py-3' : '',
                        ].join(' ')}
                    >
                        {isCollapsed ? (
                            <Bot className="h-5 w-5 text-violet-200" />
                        ) : (
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-200">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">
                                        ERA Assistant
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-violet-100/70">
                                        Generate tasks, assess sprint risk, and summarize the workspace from anywhere.
                                    </p>
                                    <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-violet-100/75">
                                        Ctrl + K
                                    </div>
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <div className="border-t border-slate-800/80 p-3">
                <div className={`rounded-[1.4rem] border border-slate-800 bg-slate-900/70 p-3 ${isCollapsed ? 'space-y-3' : ''}`}>
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <Avatar
                            name={user?.name}
                            src={user?.avatar}
                            size="sm"
                            className="ring-2 ring-slate-800"
                        />
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">
                                    {user?.name}
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                    {user?.email}
                                </p>
                                <div className="mt-2">
                                    <RoleBadge role={userRole} size="sm" />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        title="Log out"
                        className={[
                            'mt-3 flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300',
                            isCollapsed ? 'justify-center px-2' : '',
                        ].join(' ')}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>Log out</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Sidebar({
    isCollapsed,
    isMobileOpen,
    onToggleCollapse,
    onCloseMobile,
}) {
    const { user, logout } = useAuth();
    const { hasPermission, userRole } = useRBAC();
    const { openPanel } = useAIAgent();
    const pathname = usePathname();

    const visibleGroups = NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter(
            (item) => item.permission === null || hasPermission(item.permission)
        ),
    })).filter((group) => group.items.length > 0);

    const isActive = (path) => {
        if (path === '/dashboard') {
            return pathname === '/dashboard';
        }

        return pathname?.startsWith(path);
    };

    const handleOpenAssistant = () => {
        openPanel();
        onCloseMobile();
    };

    const sharedProps = {
        isActive,
        visibleGroups,
        onLogout: logout,
        onOpenAssistant: handleOpenAssistant,
        onToggleCollapse,
        user,
        userRole,
    };

    return (
        <>
            <aside
                className={[
                    'sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-slate-800/80 bg-slate-900/92 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex',
                    isCollapsed ? 'w-[80px]' : 'w-[280px]',
                ].join(' ')}
            >
                <SidebarContent
                    {...sharedProps}
                    isCollapsed={isCollapsed}
                    isDesktop
                    onNavigate={() => {}}
                />
            </aside>

            <div
                aria-hidden="true"
                className={[
                    'fixed inset-0 z-40 bg-slate-950/78 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
                    isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
                ].join(' ')}
                onClick={onCloseMobile}
            />

            <aside
                className={[
                    'fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[88vw] flex-col border-r border-slate-800/80 bg-slate-900/96 backdrop-blur-xl transition-transform duration-300 ease-out lg:hidden',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                <SidebarContent
                    {...sharedProps}
                    isCollapsed={false}
                    isDesktop={false}
                    onNavigate={onCloseMobile}
                />
            </aside>
        </>
    );
}
