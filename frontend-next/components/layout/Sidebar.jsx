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
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: null },
    { path: '/projects', icon: FolderKanban, label: 'Projects', permission: RBAC_PERMISSIONS.PROJECTS_READ },
    { path: '/tasks', icon: CheckSquare, label: 'My Tasks', permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', permission: RBAC_PERMISSIONS.ANALYTICS_READ },
    { path: '/sprints', icon: Timer, label: 'Sprints', permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/bugs', icon: Bug, label: 'Bug Tracker', permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/automation', icon: Zap, label: 'Automation', permission: RBAC_PERMISSIONS.PROJECTS_UPDATE },
    { path: '/knowledge', icon: BookOpen, label: 'Knowledge', permission: RBAC_PERMISSIONS.PROJECTS_READ },
    { path: '/integrations', icon: GitBranch, label: 'Integrations', permission: RBAC_PERMISSIONS.PROJECTS_UPDATE },
    { path: '/gamification', icon: Trophy, label: 'Achievements', permission: RBAC_PERMISSIONS.TASKS_READ },
    { path: '/team', icon: Users, label: 'Team', permission: RBAC_PERMISSIONS.TEAM_READ },
    { path: '/audit', icon: FileText, label: 'Audit Logs', permission: RBAC_PERMISSIONS.AUDIT_READ },
    { path: '/activity', icon: Activity, label: 'Activity', permission: RBAC_PERMISSIONS.ACTIVITY_READ },
    { path: '/settings', icon: Settings, label: 'Settings', permission: null },
    { path: '/admin', icon: ShieldCheck, label: 'Admin Panel', permission: RBAC_PERMISSIONS.ADMIN_ALL },
];

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
        <>
            <div className="flex h-16 items-center justify-between px-3">
                <Link
                    href="/dashboard"
                    onClick={onNavigate}
                    className={`flex min-w-0 items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-white">YojnaFlow</p>
                            <p className="truncate text-xs text-slate-500">Project command center</p>
                        </div>
                    )}
                </Link>

                {isDesktop ? (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onNavigate}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto px-2 pb-4">
                <div className="space-y-1">
                    {visibleNavItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={onNavigate}
                            title={isCollapsed ? item.label : undefined}
                            className={`
                                flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors
                                ${isActive(item.path)
                                    ? 'border-slate-700 bg-slate-800 text-white'
                                    : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-800/60 hover:text-white'
                                }
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </div>

                <div className="mt-6 border-t border-slate-800 pt-6">
                    <button
                        type="button"
                        onClick={onOpenAssistant}
                        className={`
                            flex w-full items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-3 text-left text-sm font-medium text-indigo-300 transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/15 hover:text-white
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title="Open AI assistant"
                    >
                        <Bot className="h-5 w-5 shrink-0" />
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p>ERA Assistant</p>
                                <p className="mt-0.5 text-xs text-indigo-200/70">
                                    Plan, summarize, and unblock work
                                </p>
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            <div className="border-t border-slate-800 p-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <Avatar name={user?.name} src={user?.avatar} size="md" className="ring-2 ring-slate-700" />
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                                <p className="truncate text-xs text-slate-400">{user?.email}</p>
                                <div className="mt-2">
                                    <RoleBadge role={userRole} size="sm" />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className={`mt-3 flex w-full items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 ${isCollapsed ? 'justify-center' : ''}`}
                        title="Log out"
                    >
                        <LogOut className="h-4 w-4" />
                        {!isCollapsed && <span>Log out</span>}
                    </button>
                </div>
            </div>
        </>
    );
}

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

    return (
        <>
            <aside className="hidden h-screen flex-col border-r border-slate-800 bg-slate-900 lg:flex">
                <SidebarContent
                    isCollapsed={isCollapsed}
                    isDesktop
                    visibleNavItems={visibleNavItems}
                    isActive={isActive}
                    onNavigate={() => {}}
                    onToggleCollapse={onToggleCollapse}
                    onLogout={logout}
                    onOpenAssistant={handleOpenAssistant}
                    user={user}
                    userRole={userRole}
                />
            </aside>

            <div
                className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                    isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={onCloseMobile}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:hidden ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <SidebarContent
                    isCollapsed={false}
                    isDesktop={false}
                    visibleNavItems={visibleNavItems}
                    isActive={isActive}
                    onNavigate={onCloseMobile}
                    onToggleCollapse={onToggleCollapse}
                    onLogout={logout}
                    onOpenAssistant={handleOpenAssistant}
                    user={user}
                    userRole={userRole}
                />
            </aside>
        </>
    );
};

export default Sidebar;
