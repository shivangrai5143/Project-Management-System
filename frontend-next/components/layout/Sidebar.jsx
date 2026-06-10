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

const NAV_ITEMS = [
    { path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    permission: null },
    { path: '/projects',     icon: FolderKanban,    label: 'Projects',     permission: RBAC_PERMISSIONS.PROJECTS_READ },
    { path: '/tasks',        icon: CheckSquare,     label: 'My Tasks',     permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/analytics',    icon: BarChart3,       label: 'Analytics',    permission: RBAC_PERMISSIONS.ANALYTICS_READ },
    { path: '/sprints',      icon: Timer,           label: 'Sprints',      permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/bugs',         icon: Bug,             label: 'Bug Tracker',  permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/automation',   icon: Zap,             label: 'Automation',   permission: RBAC_PERMISSIONS.PROJECTS_UPDATE },
    { path: '/knowledge',    icon: BookOpen,        label: 'Knowledge',    permission: RBAC_PERMISSIONS.PROJECTS_READ },
    { path: '/integrations', icon: GitBranch,       label: 'Integrations', permission: RBAC_PERMISSIONS.PROJECTS_UPDATE },
    { path: '/gamification', icon: Trophy,          label: 'Achievements', permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/team',         icon: Users,           label: 'Team',         permission: RBAC_PERMISSIONS.TEAM_READ },
    { path: '/audit',        icon: FileText,        label: 'Audit Logs',   permission: RBAC_PERMISSIONS.AUDIT_READ },
    { path: '/activity',     icon: Activity,        label: 'Activity',     permission: RBAC_PERMISSIONS.ACTIVITY_READ },
    { path: '/settings',     icon: Settings,        label: 'Settings',     permission: null },
    { path: '/admin',        icon: ShieldCheck,     label: 'Admin Panel',  permission: RBAC_PERMISSIONS.ADMIN_ALL },
];

/* ─────────────────────────────────────────────
   Inner content — shared between desktop & mobile
───────────────────────────────────────────── */
function SidebarContent({
    isCollapsed,
    isDesktop,
    visibleNavItems,
    isActive,
    onNavigate,
    onToggleCollapse,
    onLogout,
    onOpenAssistant,
    user,
    userRole,
}) {
    return (
        /* Full height flex column — ensures footer stays pinned to bottom */
        <div className="flex h-full flex-col">

            {/* ── Logo + collapse / close button ── */}
            <div className="flex h-16 shrink-0 items-center justify-between px-3">
                <Link
                    href="/dashboard"
                    onClick={onNavigate}
                    className={`flex min-w-0 items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">YojnaFlow</p>
                            <p className="truncate text-[11px] text-slate-500">Project command center</p>
                        </div>
                    )}
                </Link>

                {/* Collapse button (desktop) / Close button (mobile) */}
                <button
                    type="button"
                    onClick={isDesktop ? onToggleCollapse : onNavigate}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                    aria-label={isDesktop
                        ? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')
                        : 'Close sidebar'
                    }
                >
                    {isDesktop
                        ? (isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />)
                        : <X className="h-3.5 w-3.5" />
                    }
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-2 pb-2">
                <div className="space-y-0.5">
                    {visibleNavItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={onNavigate}
                                title={isCollapsed ? item.label : undefined}
                            className={`
                                    flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors
                                    ${active
                                        ? 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                            >
                            <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* AI assistant CTA */}
                <div className="mt-4 border-t border-slate-800/80 pt-4">
                    <button
                        type="button"
                        onClick={onOpenAssistant}
                        title={isCollapsed ? 'Open AI assistant' : undefined}
                        className={`
                            flex w-full items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/8
                            px-3 py-2.5 text-left text-sm font-medium text-indigo-300 transition-colors
                            hover:border-indigo-400/30 hover:bg-indigo-500/12 hover:text-white
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <Bot className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="text-sm">ERA Assistant</p>
                                <p className="mt-0.5 text-[11px] text-indigo-200/60">Plan, summarize, unblock</p>
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            {/* ── User profile footer ── */}
            <div className="shrink-0 border-t border-slate-800/80 p-2">
                <div className={`flex items-center gap-3 rounded-xl p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    <Avatar name={user?.name} src={user?.avatar} size="sm" className="shrink-0 ring-1 ring-slate-700" />
                    {!isCollapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                            <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
                            <div className="mt-1.5">
                                <RoleBadge role={userRole} size="sm" />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onLogout}
                    title="Log out"
                    className={`
                        mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium
                        text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Log out</span>}
                </button>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Sidebar shell — desktop (sticky) + mobile (drawer)
───────────────────────────────────────────── */
const Sidebar = ({
    isCollapsed,
    isMobileOpen,
    onToggleCollapse,
    onCloseMobile,
}) => {
    const { user, logout } = useAuth();
    const { hasPermission, userRole } = useRBAC();
    const { openPanel } = useAIAgent();
    const pathname = usePathname();

    const visibleNavItems = NAV_ITEMS.filter(
        item => item.permission === null || hasPermission(item.permission)
    );

    const isActive = (path) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname?.startsWith(path);
    };

    const handleOpenAssistant = () => {
        openPanel();
        onCloseMobile();
    };

    const sharedProps = {
        visibleNavItems,
        isActive,
        onLogout: logout,
        onOpenAssistant: handleOpenAssistant,
        user,
        userRole,
    };

    return (
        <>
            {/*
             * ── Desktop sidebar ──
             *
             * sticky top-0 h-screen: sidebar never scrolls — content column does.
             * Explicit w-64 / w-20 drives the flex layout (layout.jsx uses flex row).
             * overflow-hidden on outer + overflow-y-auto inside SidebarContent
             * prevents content from bleeding outside the sidebar boundary.
             * transition-all duration-300 gives the smooth collapse animation.
             */}
            <aside
                className={`
                    hidden lg:flex
                    sticky top-0 h-screen shrink-0 flex-col
                    overflow-hidden
                    border-r border-slate-800/80 bg-slate-900
                    transition-[width] duration-300 ease-in-out
                    ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
                `}
            >
                <SidebarContent
                    {...sharedProps}
                    isCollapsed={isCollapsed}
                    isDesktop
                    onNavigate={() => {}}
                    onToggleCollapse={onToggleCollapse}
                />
            </aside>

            {/* ── Mobile: backdrop overlay ── */}
            <div
                aria-hidden="true"
                className={`
                    fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm
                    transition-opacity duration-300 lg:hidden
                    ${isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}
                `}
                onClick={onCloseMobile}
            />

            {/*
             * ── Mobile sidebar drawer ──
             * Fixed position, slides in from left.
             * w-72 is intentionally wider than desktop w-64 for touch ergonomics.
             * z-50 ensures it sits above the backdrop (z-40) and header (z-30).
             */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    flex w-72 max-w-[86vw] flex-col
                    border-r border-slate-800 bg-slate-900
                    transition-transform duration-300 ease-in-out
                    lg:hidden
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <SidebarContent
                    {...sharedProps}
                    isCollapsed={false}
                    isDesktop={false}
                    onNavigate={onCloseMobile}
                    onToggleCollapse={onToggleCollapse}
                />
            </aside>
        </>
    );
};

export default Sidebar;
