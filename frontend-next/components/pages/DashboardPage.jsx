'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    AlertTriangle,
    ArrowRight,
    Bot,
    Bug,
    CheckCircle2,
    Clock3,
    FolderKanban,
    Gauge,
    ListTodo,
    Plus,
    Sparkles,
    Timer,
    Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAIAgent } from '@/context/AIAgentContext';
import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';
import { useNotifications } from '@/context/NotificationContext';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/dashboard/StatsCard';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/projects/ProjectForm';
import TaskForm from '@/components/tasks/TaskForm';
import StandupWidget from '@/components/dashboard/StandupWidget';
import AIInsightsCard from '@/components/ai/AIInsightsCard';
import AnalyticsGrid from '@/components/dashboard/AnalyticsGrid';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { demoActivities } from '@/data/mockData';
import { formatDate, getRelativeTime, isOverdue, isDueSoon } from '@/utils/helpers';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/utils/constants';

/* ─────────────────────────────────────────────────────────────
   Section heading — consistent eyebrow / title / description
   pattern across all dashboard sections (Notion aesthetic).
───────────────────────────────────────────────────────────── */
const SectionHeading = ({ eyebrow, title, description, action }) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
            {description && (
                <p className="mt-0.5 text-sm text-slate-400">{description}</p>
            )}
        </div>
        {action}
    </div>
);

/* ─────────────────────────────────────────────────────────────
   Reusable task list card (overdue + upcoming)
───────────────────────────────────────────────────────────── */
const TaskListCard = ({
    title,
    description,
    icon: Icon,
    iconClassName,
    tasks,
    emptyMessage,
    projectNameById,
    renderBadge,
}) => (
    <Card padding="dashboard" className="h-full">
        {/* Card header */}
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClassName}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <p className="mt-0.5 text-sm text-slate-400">{description}</p>
                </div>
            </div>
            <Badge variant="default" size="md">{tasks.length}</Badge>
        </div>

        {/* Task list */}
        {tasks.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-800 bg-slate-800/30 p-4 text-sm text-slate-400">
                {emptyMessage}
            </div>
        ) : (
            <div className="mt-5 space-y-2">
                {tasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 transition-colors hover:border-slate-700 hover:bg-slate-800/60">
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">{task.title}</p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {projectNameById[task.projectId] || 'General'} · Due {formatDate(task.dueDate)}
                                </p>
                            </div>
                            {renderBadge(task)}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </Card>
);

/* ─────────────────────────────────────────────────────────────
   Dashboard page — redesigned with Linear/Jira/Notion/Stripe
   aesthetic and 12-column responsive grid.
───────────────────────────────────────────────────────────── */
const DashboardPage = () => {
    const { user } = useAuth();
    const { openPanel } = useAIAgent();
    const { projects, createProject, getTeamMember } = useProjects();
    const { tasks, isLoading, getTaskStats, getTasksByAssignee, createTask } = useTasks();
    const { showToast } = useNotifications();

    const [showNewProject, setShowNewProject] = useState(false);
    const [showNewTask, setShowNewTask]       = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isCreatingTask, setIsCreatingTask]       = useState(false);

    const handleCreateProject = async (formData) => {
        setIsCreatingProject(true);
        try {
            await createProject(formData);
            setShowNewProject(false);
            showToast(`Project "${formData.name}" created!`, 'success');
        } catch (err) {
            showToast('Failed to create project. Try again.', 'error');
        } finally {
            setIsCreatingProject(false);
        }
    };

    const handleCreateTask = async (formData) => {
        setIsCreatingTask(true);
        try {
            await createTask(formData);
            setShowNewTask(false);
            showToast(`Task "${formData.title}" created!`, 'success');
        } catch (err) {
            showToast('Failed to create task. Try again.', 'error');
        } finally {
            setIsCreatingTask(false);
        }
    };

    /* ── Derived data ── */
    const stats       = getTaskStats();
    const firstName   = user?.name ? user.name.split(' ')[0] : 'there';
    const myTasks     = user ? getTasksByAssignee(user.id) : [];
    const myOpenTasks = myTasks.filter(t => t.status !== 'done').length;
    const openTasks   = stats.total - stats.done;
    const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

    const projectNameById = useMemo(
        () => Object.fromEntries(projects.map(p => [p.id, p.name])),
        [projects]
    );

    /* Sprint progress — simulated from tasks in-progress + done ratio */
    const sprintProgress = useMemo(() => {
        const sprintTasks = tasks.filter(t => t.status === 'in-progress' || t.status === 'review' || t.status === 'done');
        if (tasks.length === 0) return 0;
        return Math.round((sprintTasks.length / tasks.length) * 100);
    }, [tasks]);

    /* Bug count — tasks with 'bug' label that aren't done */
    const bugStats = useMemo(() => {
        const allBugs = tasks.filter(t => t.labels?.includes('bug'));
        const openBugs = allBugs.filter(t => t.status !== 'done');
        const criticalBugs = openBugs.filter(t => t.priority === 'high' || t.priority === 'urgent');
        return { total: allBugs.length, open: openBugs.length, critical: criticalBugs.length };
    }, [tasks]);

    /* Team productivity — completion rate with comparison */
    const teamProductivity = useMemo(() => {
        const rate = completionRate;
        const trend = rate >= 70 ? 'positive' : rate >= 40 ? 'neutral' : 'negative';
        return { rate, trend };
    }, [completionRate]);

    const overdueTasks = useMemo(
        () => tasks
            .filter(t => isOverdue(t.dueDate) && t.status !== 'done')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 4),
        [tasks]
    );

    const upcomingTasks = useMemo(
        () => tasks
            .filter(t => isDueSoon(t.dueDate) && !isOverdue(t.dueDate) && t.status !== 'done')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 4),
        [tasks]
    );

    /* ── 5 KPI cards definition ── */
    const statsCards = [
        {
            title:      'Total Projects',
            value:      projects.length,
            change:     `${openTasks} active tasks`,
            changeType: 'neutral',
            icon:       FolderKanban,
            tone:       'indigo',
        },
        {
            title:      'Active Tasks',
            value:      openTasks,
            change:     `${stats.inProgress} in progress`,
            changeType: 'neutral',
            icon:       ListTodo,
            tone:       'cyan',
        },
        {
            title:      'Sprint Progress',
            value:      `${sprintProgress}%`,
            change:     `${stats.done} completed`,
            changeType: 'positive',
            icon:       Gauge,
            tone:       'emerald',
            progress:   sprintProgress,
        },
        {
            title:      'Open Bugs',
            value:      bugStats.open,
            change:     bugStats.critical > 0 ? `${bugStats.critical} critical` : 'No critical bugs',
            changeType: bugStats.critical > 0 ? 'negative' : 'positive',
            icon:       Bug,
            tone:       'rose',
        },
        {
            title:      'Team Productivity',
            value:      `${teamProductivity.rate}%`,
            change:     `${stats.done}/${stats.total} tasks completed`,
            changeType: teamProductivity.trend,
            icon:       Users,
            tone:       'violet',
            progress:   teamProductivity.rate,
        },
    ];

    /* ── Show skeleton while loading ── */
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <>
        {/*
         * Root: space-y-6 = 24px between sections.
         * Tighter than space-y-8 — sections feel like one workspace
         * rather than isolated panels (Linear / Notion aesthetic).
         */}
        <div className="space-y-6">

            {/* ════════════════════════════════════════
                § 1  WELCOME HEADER
                ════════════════════════════════════════
                No Card wrapper — this is a page-header section, not a panel.
                Left: greeting + subtitle. Right: workspace pulse stats.
                Below: compact horizontal Quick Action bar (Linear-style).
            */}
            <section aria-label="Welcome" className="space-y-4">

                {/* Top row: greeting ↔ live stats */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        {/* Eyebrow */}
                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                            Welcome back
                        </p>
                        {/* h1 — single landmark, clear Level 1 */}
                        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                            {firstName} 👋
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-400">
                            You have{' '}
                            <span className="font-medium text-slate-200">{myOpenTasks} active tasks</span>{' '}
                            across{' '}
                            <span className="font-medium text-slate-200">{projects.length} projects</span>.
                        </p>
                    </div>

                    {/* Right: compact pill stats */}
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                        <Badge variant="primary" size="md">
                            {projects.length} projects
                        </Badge>
                        <Badge variant={stats.overdue > 0 ? 'danger' : 'success'} size="md">
                            {stats.overdue > 0 ? `${stats.overdue} overdue` : 'All on track'}
                        </Badge>
                        <Badge variant="warning" size="md">
                            {myOpenTasks} assigned
                        </Badge>
                    </div>
                </div>

                {/* ── Horizontal Quick Action Bar ── */}
                <div
                    role="toolbar"
                    aria-label="Quick actions"
                    className="flex flex-wrap items-center gap-2 border-t border-slate-800/60 pt-4"
                >
                    {/* Primary: New Project — opens modal */}
                    <button
                        type="button"
                        id="qa-new-project"
                        onClick={() => setShowNewProject(true)}
                        className="dash-action-primary"
                        aria-label="Create a new project"
                    >
                        <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                        New Project
                    </button>

                    {/* Secondary: Create Task — opens modal */}
                    <button
                        type="button"
                        id="qa-create-task"
                        onClick={() => setShowNewTask(true)}
                        className="dash-action-secondary"
                        aria-label="Create a new task"
                    >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Create Task
                    </button>

                    {/* Ghost: Start Sprint */}
                    <Link
                        href="/sprints"
                        id="qa-start-sprint"
                        className="dash-action-secondary"
                        aria-label="Go to Sprints"
                    >
                        <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                        Start Sprint
                    </Link>

                    {/* AI: Ask AI */}
                    <button
                        type="button"
                        id="qa-ask-ai"
                        onClick={openPanel}
                        className="dash-action-ai"
                        aria-label="Open AI assistant"
                    >
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        Ask AI
                    </button>
                </div>
            </section>

            {/* ════════════════════════════════════════
                § 2  KPI CARDS ROW — 5 cards
                ════════════════════════════════════════
                2-col mobile · 3-col tablet · 5-col desktop.
                12-column grid: each card spans ~2.4 cols at xl.
            */}
            <section
                aria-label="Key metrics"
                className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
            >
                {statsCards.map((card) => (
                    <StatsCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        change={card.change}
                        changeType={card.changeType}
                        icon={card.icon}
                        tone={card.tone}
                        progress={card.progress}
                    />
                ))}
            </section>

            {/* ════════════════════════════════════════
                § 3  ANALYTICS — 4 charts in 2×2 grid
                ════════════════════════════════════════
                Task Completion Trend, Sprint Velocity,
                Team Workload, Bug Resolution Trend.
            */}
            <section aria-label="Analytics" className="space-y-3">
                <SectionHeading
                    eyebrow="Analytics"
                    title="Performance overview"
                    description="Track velocity, workload distribution, and delivery trends."
                />
                <AnalyticsGrid />
            </section>

            {/* ════════════════════════════════════════
                § 4  ACTIVITY FEED + UPCOMING DEADLINES
                ════════════════════════════════════════
                7fr / 5fr split at xl. Single column below.
            */}
            <section aria-label="Activity & Deadlines" className="space-y-3">
                <SectionHeading
                    eyebrow="Timeline"
                    title="Activity & deadlines"
                    description="Recent workspace changes and upcoming due dates."
                />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">

                    {/* ── Recent activity card ── */}
                    <Card padding="dashboard">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">Recent activity</h3>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        Latest changes across your workspace.
                                    </p>
                                </div>
                            </div>
                            <Badge variant="default" size="md">{demoActivities.length}</Badge>
                        </div>

                        <div className="activity-scroll-container mt-4">
                            <div className="space-y-2 pt-1">
                                {demoActivities.slice(0, 8).map((activity) => {
                                    const activityUser = getTeamMember(activity.userId);
                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3 transition-colors hover:border-slate-700"
                                        >
                                            <Avatar
                                                name={activityUser?.name}
                                                src={activityUser?.avatar}
                                                size="sm"
                                                className="shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs leading-5 text-slate-300">
                                                    <span className="font-medium text-white">
                                                        {activityUser?.name || 'Teammate'}
                                                    </span>{' '}
                                                    {activity.message}
                                                </p>
                                                <p className="mt-1 text-[11px] text-slate-500">
                                                    {getRelativeTime(activity.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* View all link */}
                        <div className="mt-3 border-t border-slate-800/60 pt-3">
                            <Link
                                href="/activity"
                                className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                            >
                                View all activity
                                <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </Link>
                        </div>
                    </Card>

                    {/* ── Upcoming Deadlines ── */}
                    <UpcomingDeadlines />
                </div>
            </section>

            {/* ════════════════════════════════════════
                § 5  AI INSIGHTS + STANDUP
                ════════════════════════════════════════
                2-col at xl, 1-col below.
            */}
            <section id="productivity-section" aria-label="Productivity" className="space-y-3">
                <SectionHeading
                    eyebrow="Productivity"
                    title="Daily execution"
                    description="Standup rhythm and AI-guided focus areas."
                />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <StandupWidget />
                    <AIInsightsCard />
                </div>
            </section>

            {/* ════════════════════════════════════════
                § 6  TASKS PRIORITY QUEUE
                ════════════════════════════════════════
                2-col at xl, 1-col below.
            */}
            <section aria-label="Task priority queue" className="space-y-3">
                <SectionHeading
                    eyebrow="Tasks"
                    title="Priority queue"
                    description="Work that needs attention soonest."
                    action={(
                        <Link
                            href="/tasks"
                            className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                        >
                            Open task board →
                        </Link>
                    )}
                />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <TaskListCard
                        title="Overdue tasks"
                        description="Items past their due date."
                        icon={AlertTriangle}
                        iconClassName="border-red-500/20 bg-red-500/10 text-red-300"
                        tasks={overdueTasks}
                        emptyMessage="No overdue work right now — your commitments are on track."
                        projectNameById={projectNameById}
                        renderBadge={(task) => (
                            <Badge variant="danger" size="md">
                                {PRIORITY_CONFIG[task.priority]?.label || 'Priority'}
                            </Badge>
                        )}
                    />

                    <TaskListCard
                        title="Upcoming tasks"
                        description="Work due soon — stay ahead of deadlines."
                        icon={Clock3}
                        iconClassName="border-amber-500/20 bg-amber-500/10 text-amber-300"
                        tasks={upcomingTasks}
                        emptyMessage="Nothing due in the next few days — you have room to plan proactively."
                        projectNameById={projectNameById}
                        renderBadge={(task) => (
                            <Badge variant="warning" size="md">
                                {STATUS_CONFIG[task.status]?.label || 'Open'}
                            </Badge>
                        )}
                    />
                </div>
            </section>

        </div>

        {/* ── Quick Action Modals ── */}
        <Modal
            isOpen={showNewProject}
            onClose={() => setShowNewProject(false)}
            title="New Project"
            size="md"
        >
            <ProjectForm
                onSubmit={handleCreateProject}
                onCancel={() => setShowNewProject(false)}
                isLoading={isCreatingProject}
            />
        </Modal>

        <Modal
            isOpen={showNewTask}
            onClose={() => setShowNewTask(false)}
            title="Create Task"
            size="lg"
        >
            <TaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setShowNewTask(false)}
                isLoading={isCreatingTask}
            />
        </Modal>
        </>
    );
};

export default DashboardPage;
