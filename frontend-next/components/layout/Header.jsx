'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Bell,
    Moon,
    Sun,
    Menu,
    Plus,
    Trash2,
    CheckCheck,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { Dropdown } from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import { getRelativeTime } from '@/utils/helpers';

const Header = ({ onMenuClick, title }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { notifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = useNotifications();
    const router = useRouter();
    const unreadCount = getUnreadCount();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <>
            <header className="h-16 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {title && (
                        <h1 className="text-xl font-semibold text-white hidden md:block">{title}</h1>
                    )}
                </div>

                {/* Center - Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects, tasks..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                </form>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="primary"
                        size="sm"
                        icon={Plus}
                        className="hidden sm:flex"
                        onClick={() => router.push('/projects')}
                    >
                        New Project
                    </Button>

                    {/* Theme toggle */}
                    <div className="relative group">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title={`${isDark ? 'Light' : 'Dark'} mode (Ctrl+D)`}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowAllNotifications(true)}
                            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* All Notifications Panel */}
            {showAllNotifications && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        onClick={() => setShowAllNotifications(false)}
                    />
                    <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl z-[101] animate-slide-in-right">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                            <h2 className="text-xl font-semibold text-white">All Notifications</h2>
                            <button
                                onClick={() => setShowAllNotifications(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >✕</button>
                        </div>
                        {notifications.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
                                <span className="text-sm text-slate-400">
                                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </span>
                                <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
                                    Mark all as read
                                </Button>
                            </div>
                        )}
                        <div className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 130px)' }}>
                            {notifications.length === 0 ? (
                                <div className="py-16 text-center">
                                    <Bell className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-400 text-lg">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 rounded-xl border transition-all ${!notif.read
                                                ? 'bg-indigo-500/10 border-indigo-500/30'
                                                : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 cursor-pointer" onClick={() => markAsRead(notif.id)}>
                                                    <div className="flex items-center gap-2">
                                                        {!notif.read && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                                                        <h4 className={`font-medium ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                                                            {notif.title}
                                                        </h4>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mt-2">{notif.message}</p>
                                                    <p className="text-xs text-slate-500 mt-2">{getRelativeTime(notif.createdAt)}</p>
                                                </div>
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Header;
