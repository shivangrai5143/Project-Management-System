'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    CheckCheck,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    Trash2,
    X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useRBAC } from '@/context/RBACContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import RoleBadge from '@/components/ui/RoleBadge';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { getRelativeTime } from '@/utils/helpers';

const Header = ({ onMenuClick, title }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const { userRole } = useRBAC();
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getUnreadCount,
    } = useNotifications();
    const router = useRouter();
    const unreadCount = getUnreadCount();

    return (
        <>
            <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-6">
                    <div className="flex shrink-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="hidden sm:block">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workspace</p>
                            <h1 className="text-sm font-semibold text-white">{title}</h1>
                        </div>
                    </div>

                    <div className="hidden min-w-0 flex-1 md:block">
                        <CommandPalette
                            className="max-w-xl"
                            placeholder="Search projects, tasks, teammates..."
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <CommandPalette compact className="md:hidden" />

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                            aria-label="Open notifications"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <Dropdown
                            align="right"
                            trigger={(
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/60 px-2 py-2 text-left transition-colors hover:border-slate-700"
                                >
                                    <Avatar
                                        name={user?.name}
                                        src={user?.avatar}
                                        size="sm"
                                        className="ring-2 ring-slate-700"
                                    />
                                    <div className="hidden min-w-0 lg:block">
                                        <p className="truncate text-sm font-medium text-white">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="truncate text-xs text-slate-400">
                                            Account
                                        </p>
                                    </div>
                                </button>
                            )}
                        >
                            {(close) => (
                                <>
                                    <div className="border-b border-slate-800 px-4 py-3">
                                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                                        <p className="text-xs text-slate-400">{user?.email}</p>
                                        <div className="mt-3">
                                            <RoleBadge role={userRole} size="sm" />
                                        </div>
                                    </div>
                                    <DropdownItem
                                        icon={Settings}
                                        onClick={() => {
                                            close();
                                            router.push('/settings');
                                        }}
                                    >
                                        Settings
                                    </DropdownItem>
                                    <DropdownItem
                                        icon={isDark ? Sun : Moon}
                                        onClick={() => {
                                            close();
                                            toggleTheme();
                                        }}
                                    >
                                        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                    </DropdownItem>
                                    <DropdownDivider />
                                    <DropdownItem
                                        icon={LogOut}
                                        danger
                                        onClick={() => {
                                            close();
                                            logout();
                                        }}
                                    >
                                        Log out
                                    </DropdownItem>
                                </>
                            )}
                        </Dropdown>
                    </div>
                </div>
            </header>

            {isNotificationsOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
                        onClick={() => setIsNotificationsOpen(false)}
                    />
                    <div className="fixed bottom-0 right-0 top-16 z-50 flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                                <p className="text-sm text-slate-400">
                                    {unreadCount} unread
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNotificationsOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/50 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                                aria-label="Close notifications"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {notifications.length > 0 && (
                            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6">
                                <span className="text-sm text-slate-400">
                                    Keep your inbox clear and review recent updates.
                                </span>
                                <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
                                    Mark all read
                                </Button>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                            {notifications.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-6 text-center">
                                    <Bell className="mb-4 h-10 w-10 text-slate-600" />
                                    <p className="text-sm font-medium text-slate-300">No notifications yet</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Activity updates, mentions, and reminders will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`rounded-2xl border p-4 transition-colors ${
                                                notification.read
                                                    ? 'border-slate-800 bg-slate-800/40'
                                                    : 'border-indigo-500/20 bg-indigo-500/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="min-w-0 flex-1 text-left"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {!notification.read && (
                                                            <span className="h-2 w-2 rounded-full bg-indigo-400" />
                                                        )}
                                                        <p className="text-sm font-medium text-white">
                                                            {notification.title}
                                                        </p>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-400">
                                                        {notification.message}
                                                    </p>
                                                    <p className="mt-3 text-xs text-slate-500">
                                                        {getRelativeTime(notification.createdAt)}
                                                    </p>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                                                    aria-label="Delete notification"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
