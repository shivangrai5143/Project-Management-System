'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useNotifications } from '@/context/NotificationContext';
import ToastContainer from '@/components/ui/Toast';
import StandupPrompt from '@/components/standup/StandupPrompt';
import AIAgentPanel from '@/components/ai/AIAgentPanel';

export default function ProtectedLayout({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { toasts, removeToast } = useNotifications();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    <p className="text-slate-400 text-sm">Loading YojnaFlow...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Page title based on pathname
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
        return '';
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />

            <div className="lg:pl-64 min-h-screen transition-all duration-300">
                <Header title={getPageTitle()} />
                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <StandupPrompt />
            <AIAgentPanel />
        </div>
    );
}
