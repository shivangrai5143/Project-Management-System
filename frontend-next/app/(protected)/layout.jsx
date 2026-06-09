'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRBAC } from '@/context/RBACContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useNotifications } from '@/context/NotificationContext';
import ToastContainer from '@/components/ui/Toast';
import StandupPrompt from '@/components/standup/StandupPrompt';
import AIAgentPanel from '@/components/ai/AIAgentPanel';
import AccessDenied from '@/app/(protected)/access-denied/page';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const SIDEBAR_EXPANDED_WIDTH = '16rem';
const SIDEBAR_COLLAPSED_WIDTH = '5rem';

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
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <p className="text-sm text-slate-400">Loading YojnaFlow...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const getPageTitle = () => {
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname === '/projects') return 'Projects';
        if (pathname?.startsWith('/projects/')) return 'Project Details';
        if (pathname === '/tasks') return 'My Tasks';
        if (pathname === '/team') return 'Team';
        if (pathname === '/settings') return 'Settings';
        if (pathname === '/analytics') return 'Analytics';
        if (pathname === '/sprints') return 'Sprint Manager';
        if (pathname === '/bugs') return 'Bug Tracker';
        if (pathname === '/automation') return 'Automation';
        if (pathname === '/knowledge') return 'Knowledge Base';
        if (pathname === '/integrations') return 'Integrations';
        if (pathname === '/gamification') return 'Achievements';
        if (pathname === '/audit') return 'Audit Logs';
        if (pathname === '/activity') return 'Activity Timeline';
        if (pathname === '/admin') return 'Admin Panel';
        if (pathname === '/access-denied') return 'Access Denied';
        return '';
    };

    const isAccessible = pathname === '/access-denied' || canAccess(pathname);

    const desktopShellStyle = {
        gridTemplateColumns: `${isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH} minmax(0, 1fr)`,
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="lg:grid lg:min-h-screen" style={desktopShellStyle}>
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    isMobileOpen={isMobileSidebarOpen}
                    onToggleCollapse={() => setIsSidebarCollapsed(current => !current)}
                    onCloseMobile={() => setIsMobileSidebarOpen(false)}
                />

                <div className="min-w-0">
                    <Header title={getPageTitle()} onMenuClick={() => setIsMobileSidebarOpen(true)} />
                    <main className="px-4 py-6 sm:px-6 lg:px-6">
                        <div className="mx-auto w-full max-w-[1440px]">
                            <ErrorBoundary>
                                {isAccessible ? children : <AccessDenied />}
                            </ErrorBoundary>
                        </div>
                    </main>
                </div>
            </div>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <StandupPrompt />
            <AIAgentPanel />
        </div>
    );
}
