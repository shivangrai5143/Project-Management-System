import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNotifications } from '../../context/NotificationContext';
import ToastContainer from '../ui/Toast';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { toasts, removeToast } = useNotifications();

    // Get page title based on current route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/projects') return 'Projects';
        if (path.startsWith('/projects/')) return 'Project Details';
        if (path === '/tasks') return 'My Tasks';
        if (path === '/team') return 'Team';
        if (path === '/settings') return 'Settings';
        return '';
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="lg:pl-64 min-h-screen transition-all duration-300">
                <Header
                    title={getPageTitle()}
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                <main className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Toast notifications */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default Layout;
