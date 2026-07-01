'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    CheckCheck,
    LogOut,
    Menu,
    Moon,
    Plus,
    Settings,
    Sun,
    Trash2,
    X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useRBAC } from '@/context/RBACContext';
import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/projects/ProjectForm';
import TaskForm from '@/components/tasks/TaskForm';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import RoleBadge from '@/components/ui/RoleBadge';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { getRelativeTime } from '@/utils/helpers';

export default function Header({ onMenuClick, title }) {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    const quickCreateRef = useRef(null);
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const { userRole } = useRBAC();
    const { createProject } = useProjects();
    const { createTask } = useTasks();
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getUnreadCount,
        showToast,
    } = useNotifications();
    const router = useRouter();
    const unreadCount = getUnreadCount();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (quickCreateRef.current && !quickCreateRef.current.contains(event.target)) {
                setIsQuickCreateOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            const target = event.target;
            const isInput =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target?.isContentEditable;

            if (event.key === 'Escape') {
                setIsQuickCreateOpen(false);
            }

            if (!isInput && event.key.toLowerCase() === 'n' && !event.metaKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault();
                setIsQuickCreateOpen((current) => !current);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleCreateProject = async (formData) => {
        setIsCreatingProject(true);

        try {
            await createProject(formData);
            setShowProjectModal(false);
            showToast(`Project "${formData.name}" created`, 'success');
        } catch (error) {
            showToast('Failed to create project. Try again.', 'error');
        } finally {
            setIsCreatingProject(false);
        }
    };

    const handleCreateTask = async (formData) => {
        setIsCreatingTask(true);

        try {
            await createTask(formData);
            setShowTaskModal(false);
            showToast(`Task "${formData.title}" created`, 'success');
        } catch (error) {
            showToast('Failed to create task. Try again.', 'error');
        } finally {
            setIsCreatingTask(false);
        }
    };

    const openProjectModal = () => {
        setIsQuickCreateOpen(false);
        setShowProjectModal(true);
    };

    const openTaskModal = () => {
        setIsQuickCreateOpen(false);
        setShowTaskModal(true);
    };

    const quickActions = [
        {
            title: 'New project',
            hint: 'Spin up a workspace and team scope.',
            onClick: openProjectModal,
        },
        {
            title: 'Create task',
            hint: 'Capture work and assign owners quickly.',
            onClick: openTaskModal,
        },
        {
            title: 'Sprint workspace',
            hint: 'Open capacity and burndown planning.',
            onClick: () => {
                setIsQuickCreateOpen(false);
                router.push('/sprints');
            },
        },
        {
            title: 'Bug triage',
            hint: 'Jump into severity and issue tracking.',
            onClick: () => {
                setIsQuickCreateOpen(false);
                router.push('/bugs');
            },
        },
    ];

    return (
        <>
            <header className="sticky top-0 z-30 shrink-0 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl">
                <div className="flex min-h-[76px] items-center gap-3 px-4 sm:px-6">
                    <div className="flex shrink-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/70 text-slate-400 transition-colors hover:border-slate-700 hover:text-white lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-4 w-4" />
                        </button>

                        {title && (
                            <div className="hidden min-w-0 sm:block">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                    Workspace
                                </p>
                                <h1 className="truncate text-sm font-semibold tracking-tight text-white md:text-base">
                                    {title}
                                </h1>
                            </div>
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center">
                        <div className="hidden w-full max-w-2xl min-w-0 md:block">
                            <CommandPalette placeholder="Search projects, tasks, bugs, docs, and teammates..." />
                        </div>
                        <CommandPalette compact className="md:hidden" />
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <div ref={quickCreateRef} className="relative hidden sm:block">
                            <button
                                type="button"
                                onClick={() => setIsQuickCreateOpen((current) => !current)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/25 bg-violet-500/12 px-3.5 py-2 text-sm font-semibold text-violet-100 transition-colors hover:border-violet-400/35 hover:bg-violet-500/18"
                            >
                                <Plus className="h-4 w-4" />
                                Quick Create
                                <span className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-violet-100/80">
                                    N
                                </span>
                            </button>

                            {isQuickCreateOpen && (
                                <div className="absolute right-0 top-full z-50 mt-3 w-[320px] rounded-[1.4rem] border border-slate-800 bg-slate-900/98 p-2 shadow-2xl shadow-slate-950/40">
                                    <div className="px-3 py-2">
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                            Quick create
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Launch the most common workspace actions.
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        {quickActions.map((action) => (
                                            <button
                                                key={action.title}
                                                type="button"
                                                onClick={action.onClick}
                                                className="w-full rounded-2xl border border-transparent px-3 py-3 text-left transition-colors hover:border-slate-800 hover:bg-slate-800/70"
                                            >
                                                <p className="text-sm font-semibold text-white">
                                                    {action.title}
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                                    {action.hint}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/70 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/70 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                            aria-label="Open notifications"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-violet-500 px-1 py-px text-[10px] font-bold text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <Dropdown
                            align="right"
                            trigger={(
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-800/70 px-2 py-1.5 text-left transition-colors hover:border-slate-700"
                                >
                                    <Avatar
                                        name={user?.name}
                                        src={user?.avatar}
                                        size="sm"
                                        className="ring-1 ring-slate-700"
                                    />
                                    <div className="hidden min-w-0 lg:block">
                                        <p className="truncate text-sm font-semibold leading-tight text-white">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="truncate text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                            Account
                                        </p>
                                    </div>
                                </button>
                            )}
                        >
                            {(close) => (
                                <>
                                    <div className="border-b border-slate-800 px-4 py-3">
                                        <p className="text-sm font-semibold text-white">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {user?.email}
                                        </p>
                                        <div className="mt-2.5">
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
                        aria-hidden="true"
                    />

                    <div className="fixed bottom-0 right-0 top-[76px] z-50 flex w-full max-w-sm flex-col border-l border-slate-800 bg-slate-900 shadow-2xl sm:max-w-md">
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Notifications
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {unreadCount} unread
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNotificationsOpen(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                                aria-label="Close notifications"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {notifications.length > 0 && (
                            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                                <span className="text-xs text-slate-500">Recent updates</span>
                                <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
                                    Mark all read
                                </Button>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            {notifications.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-800/30 p-6 text-center">
                                    <Bell className="mb-3 h-8 w-8 text-slate-600" />
                                    <p className="text-sm font-semibold text-slate-300">
                                        No notifications yet
                                    </p>
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Mentions, reminders, and workspace updates appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={[
                                                'rounded-2xl border p-4 transition-colors',
                                                notification.read
                                                    ? 'border-slate-800 bg-slate-800/40'
                                                    : 'border-violet-500/20 bg-violet-500/8',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="min-w-0 flex-1 text-left"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {!notification.read && (
                                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                                                        )}
                                                        <p className="text-sm font-semibold text-white">
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

            <Modal
                isOpen={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                title="Create Project"
                size="md"
            >
                <ProjectForm
                    onSubmit={handleCreateProject}
                    onCancel={() => setShowProjectModal(false)}
                    isLoading={isCreatingProject}
                />
            </Modal>

            <Modal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                title="Create Task"
                size="lg"
            >
                <TaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setShowTaskModal(false)}
                    isLoading={isCreatingTask}
                />
            </Modal>
        </>
    );
}
