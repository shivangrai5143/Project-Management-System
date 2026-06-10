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
            {/*
             * Header: sticky within the content column (not the whole viewport).
             * h-16 = 64px — matches the sidebar logo row height.
             * z-30 sits above page content (z-0) but below mobile drawer (z-50)
             * and notification panel (z-40).
             * No max-width wrapper — header spans full content column width.
             */}
            <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl">
                <div className="flex h-full items-center gap-3 px-4 sm:px-6">

                    {/* ── Left: mobile menu + page breadcrumb ── */}
                    <div className="flex shrink-0 items-center gap-3">
                        {/* Mobile hamburger — hidden on desktop (sidebar always visible) */}
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-white lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-4 w-4" />
                        </button>

                        {/* Page breadcrumb label */}
                        {title && (
                            <div className="hidden sm:block">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500">Workspace</p>
                                <h1 className="text-sm font-semibold text-white leading-tight">{title}</h1>
                            </div>
                        )}
                    </div>

                    {/*
                     * ── Centre: global search ──
                     * flex-1 min-w-0 allows the palette to grow into available space
                     * without ever overflowing into the sidebar or right controls.
                     */}
                    <div className="flex min-w-0 flex-1 items-center">
                        {/* Full search bar on md+ */}
                        <div className="hidden w-full max-w-md min-w-0 md:block">
                            <CommandPalette
                                placeholder="Search projects, tasks, teammates..."
                            />
                        </div>
                        {/* Icon-only compact trigger on mobile */}
                        <CommandPalette compact className="md:hidden" />
                    </div>

                    {/* ── Right: action controls ── */}
                    <div className="flex shrink-0 items-center gap-1.5">
                        {/* Theme toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {/* Notifications bell */}
                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                            aria-label="Open notifications"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-indigo-500 px-1 py-px text-[10px] font-bold text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* User menu */}
                        <Dropdown
                            align="right"
                            trigger={(
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-800/60 px-2 py-1.5 text-left transition-colors hover:border-slate-700"
                                >
                                    <Avatar
                                        name={user?.name}
                                        src={user?.avatar}
                                        size="sm"
                                        className="ring-1 ring-slate-700"
                                    />
                                    <div className="hidden min-w-0 lg:block">
                                        <p className="truncate text-sm font-medium text-white leading-tight">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="truncate text-[11px] text-slate-400">Account</p>
                                    </div>
                                </button>
                            )}
                        >
                            {(close) => (
                                <>
                                    <div className="border-b border-slate-800 px-4 py-3">
                                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                                        <p className="text-xs text-slate-400">{user?.email}</p>
                                        <div className="mt-2.5">
                                            <RoleBadge role={userRole} size="sm" />
                                        </div>
                                    </div>
                                    <DropdownItem
                                        icon={Settings}
                                        onClick={() => { close(); router.push('/settings'); }}
                                    >
                                        Settings
                                    </DropdownItem>
                                    <DropdownItem
                                        icon={isDark ? Sun : Moon}
                                        onClick={() => { close(); toggleTheme(); }}
                                    >
                                        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                    </DropdownItem>
                                    <DropdownDivider />
                                    <DropdownItem
                                        icon={LogOut}
                                        danger
                                        onClick={() => { close(); logout(); }}
                                    >
                                        Log out
                                    </DropdownItem>
                                </>
                            )}
                        </Dropdown>
                    </div>
                </div>
            </header>

            {/* ── Notifications slide-over panel ── */}
            {isNotificationsOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
                        onClick={() => setIsNotificationsOpen(false)}
                        aria-hidden="true"
                    />

                    {/*
                     * Panel: fixed to viewport edges, starts below the header (top-16).
                     * max-w-sm on mobile, max-w-md on sm+.
                     */}
                    <div className="fixed bottom-0 right-0 top-16 z-50 flex w-full max-w-sm flex-col border-l border-slate-800 bg-slate-900 shadow-2xl sm:max-w-md">
                        {/* Panel header */}
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-white">Notifications</h2>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {unreadCount} unread
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNotificationsOpen(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/50 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                                aria-label="Close notifications"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Mark all read action */}
                        {notifications.length > 0 && (
                            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                                <span className="text-xs text-slate-500">Recent updates</span>
                                <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
                                    Mark all read
                                </Button>
                            </div>
                        )}

                        {/* Notification list */}
                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            {notifications.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-6 text-center">
                                    <Bell className="mb-3 h-8 w-8 text-slate-600" />
                                    <p className="text-sm font-medium text-slate-300">No notifications yet</p>
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Updates, mentions, and reminders appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`rounded-xl border p-4 transition-colors ${
                                                notification.read
                                                    ? 'border-slate-800 bg-slate-800/40'
                                                    : 'border-indigo-500/20 bg-indigo-500/8'
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
                                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                                                        )}
                                                        <p className="text-sm font-medium text-white">
                                                            {notification.title}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1.5 text-sm text-slate-400">
                                                        {notification.message}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        {getRelativeTime(notification.createdAt)}
                                                    </p>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                    aria-label="Delete notification"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
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
