'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRBAC } from '@/context/RBACContext';
import { useNotifications } from '@/context/NotificationContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/ui/Toast';
import StandupPrompt from '@/components/standup/StandupPrompt';
import AIAgentPanel from '@/components/ai/AIAgentPanel';
import AccessDenied from '@/app/(protected)/access-denied/page';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/projects': 'Projects',
    '/tasks': 'My Tasks',
    '/team': 'Team',
    '/settings': 'Settings',
    '/analytics': 'Analytics',
    '/sprints': 'Sprint Workspace',
    '/bugs': 'Bug Tracker',
    '/automation': 'Automation',
    '/knowledge': 'Knowledge Hub',
    '/integrations': 'Integrations',
    '/gamification': 'Achievements',
    '/audit': 'Audit Logs',
    '/activity': 'Activity Timeline',
    '/admin': 'Admin Panel',
    '/access-denied': 'Access Denied',
};

export default function ProtectedLayout({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const { canAccess } = useRBAC();
    const router = useRouter();
    const pathname = usePathname();
    const { toasts, removeToast } = useNotifications();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-500/20 bg-violet-500/10 text-violet-200">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                    <p className="text-sm text-slate-400">Loading YojnaFlow...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const title = pathname?.startsWith('/projects/') ? 'Project Details' : PAGE_TITLES[pathname] ?? '';
    const isAccessible = pathname === '/access-denied' || canAccess(pathname);

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header title={title} onMenuClick={() => setIsMobileSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
                    <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-6">
                        <ErrorBoundary>
                            {isAccessible ? children : <AccessDenied />}
                        </ErrorBoundary>
                    </div>
                </main>
            </div>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <StandupPrompt />
            <AIAgentPanel />
        </div>
    );
}
