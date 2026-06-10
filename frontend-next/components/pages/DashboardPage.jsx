'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { eachDayOfInterval, format, isSameDay, startOfDay, subDays } from 'date-fns';
import {
    AlertTriangle,
    ArrowRight,
    Bot,
    CheckCircle2,
    Clock3,
    FolderKanban,
    ListTodo,
    Plus,
    Sparkles,
    Timer,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAIAgent } from '@/context/AIAgentContext';
import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/dashboard/StatsCard';
import StandupWidget from '@/components/dashboard/StandupWidget';
import AIInsightsCard from '@/components/ai/AIInsightsCard';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { ChartErrorBoundary } from '@/components/ui/ErrorBoundary';
import { demoActivities } from '@/data/mockData';
import { formatDate, getRelativeTime, isDueSoon, isOverdue } from '@/utils/helpers';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/utils/constants';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/* ─────────────────────────────────────────────────────────────
   Chart data builder — 7-day rolling window
───────────────────────────────────────────────────────────── */
const buildChartData = (tasks) => {
    const end  = startOfDay(new Date());
    const days = eachDayOfInterval({ start: subDays(end, 6), end });

    return days.map((day) => ({
        label: format(day, 'EEE'),
        created: tasks.filter(
            t => t.createdAt && isSameDay(new Date(t.createdAt), day)
        ).length,
        completed: tasks.filter(
            t => t.status === 'done' && t.updatedAt && isSameDay(new Date(t.updatedAt), day)
        ).length,
    }));
};

/* ─────────────────────────────────────────────────────────────
   Section heading — consistent eyebrow / title / description
   pattern across all dashboard sections.
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
   Custom Recharts tooltip
───────────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm shadow-xl">
            <p className="mb-2 font-medium text-white">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-400 capitalize">{entry.dataKey}:</span>
                    <span className="font-medium text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Dashboard page
───────────────────────────────────────────────────────────── */
const DashboardPage = () => {
    const { user } = useAuth();
    const { openPanel } = useAIAgent();
    const { projects, getTeamMember } = useProjects();
    const { tasks, getTaskStats, getTasksByAssignee } = useTasks();

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

    const chartData = useMemo(() => buildChartData(tasks), [tasks]);

    const statsCards = [
        {
            title:      'Total Tasks',
            value:      stats.total,
            change:     `${openTasks} open tasks`,
            changeType: 'neutral',
            icon:       ListTodo,
            tone:       'slate',
        },
        {
            title:      'Completed',
            value:      stats.done,
            change:     `${completionRate}% completion rate`,
            changeType: 'positive',
            icon:       CheckCircle2,
            tone:       'emerald',
        },
        {
            title:      'In Progress',
            value:      stats.inProgress,
            change:     `${stats.review} in review`,
            changeType: 'neutral',
            icon:       Clock3,
            tone:       'amber',
        },
        {
            title:      'Overdue',
            value:      stats.overdue,
            change:     stats.overdue > 0 ? 'Needs attention' : 'On track',
            changeType: stats.overdue > 0 ? 'negative' : 'positive',
            icon:       AlertTriangle,
            tone:       'rose',
        },
    ];

    return (
        /*
         * Root: space-y-6 = 24px between sections.
         * Tighter than the old space-y-8 — sections feel like one workspace
         * rather than isolated pages (Linear / Notion aesthetic).
         */
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
                {/*
                 * Horizontal action toolbar directly beneath the greeting.
                 * This is the key UX change: replaces the 300px right-panel card.
                 * Buttons are styled via globals.css utility classes for portability.
                 * flex-wrap ensures graceful collapse on small screens.
                 *
                 * Actions:
                 *   New Project  → navigate to /projects (primary CTA)
                 *   Create Task  → navigate to /tasks
                 *   Start Sprint → navigate to /sprints
                 *   Ask AI       → open the AI panel
                 */}
                <div
                    role="toolbar"
                    aria-label="Quick actions"
                    className="flex flex-wrap items-center gap-2 border-t border-slate-800/60 pt-4"
                >
                    {/* Primary: New Project */}
                    <Link
                        href="/projects"
                        id="qa-new-project"
                        className="dash-action-primary"
                        aria-label="Go to Projects"
                    >
                        <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                        New Project
                    </Link>

                    {/* Secondary: Create Task */}
                    <Link
                        href="/tasks"
                        id="qa-create-task"
                        className="dash-action-secondary"
                        aria-label="Go to Tasks"
                    >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Create Task
                    </Link>

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
                § 2  KPI CARDS ROW
                ════════════════════════════════════════
                4-col desktop (lg+) · 2-col tablet · 1-col mobile.
                No entrance animations (per user preference).
            */}
            <section
                aria-label="Key metrics"
                className="grid grid-cols-2 gap-4 lg:grid-cols-4"
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
                    />
                ))}
            </section>

            {/* ════════════════════════════════════════
                § 3  ANALYTICS
                ════════════════════════════════════════
                7fr / 3fr split at xl (≥1280px). Single column below.
                Chart: min-h-[350px], capped at 400px on lg+.
                Activity panel: fixed height, independently scrollable.
            */}
            <section aria-label="Analytics" className="space-y-3">
                <SectionHeading
                    eyebrow="Analytics"
                    title="Created vs completed"
                    description="7-day task throughput and delivery pace."
                />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">

                    {/* ── Activity chart card ── */}
                    <Card padding="dashboard">
                        {/* Chart header: title + live indicator + legend */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-2.5">
                                {/*
                                 * Live indicator — 8px pulsing green dot.
                                 * Signals "this data is live / real-time" — a Vercel dashboard pattern.
                                 */}
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-live-pulse"
                                    aria-label="Live data"
                                    role="img"
                                />
                                <div>
                                    <h3 className="text-base font-semibold text-white">Activity chart</h3>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        Tasks created and completed over the last 7 days.
                                    </p>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-indigo-400" aria-hidden="true" />
                                    Completed
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                                    Created
                                </div>
                            </div>
                        </div>

                        {/*
                         * Chart container — responsive height steps:
                         *   280px mobile  : visible without dominating viewport
                         *   350px lg+     : comfortable desktop analytics view
                         *   max 400px      : prevents disproportionate height on tall screens
                         *
                         * min-h ensures the chart never collapses when data is empty.
                         */}
                        <div className="mt-5 min-h-[280px] w-full lg:h-[390px]">
                            <ChartErrorBoundary>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%"   stopColor="#818cf8" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0}   />
                                            </linearGradient>
                                            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%"   stopColor="#34d399" stopOpacity={0.25} />
                                                <stop offset="100%" stopColor="#34d399" stopOpacity={0}    />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            vertical={false}
                                            stroke="#1e293b"
                                            strokeDasharray="4 4"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="#818cf8"
                                            strokeWidth={2}
                                            fill="url(#completedGradient)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="created"
                                            stroke="#34d399"
                                            strokeWidth={2}
                                            fill="url(#createdGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartErrorBoundary>
                        </div>
                    </Card>

                    {/* ── Recent activity card ── */}
                    {/*
                     * sticky top-24 makes the activity panel sticky within
                     * the xl-grid column — it stays visible while the chart scrolls.
                     * Fixed card height + scrollable inner list = "sticky sidebar" pattern.
                     */}
                    <Card padding="dashboard" className="xl:sticky xl:top-24 xl:self-start">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-white">Recent activity</h3>
                                <p className="mt-0.5 text-sm text-slate-400">
                                    Latest changes across your workspace.
                                </p>
                            </div>
                            <Sparkles className="h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
                        </div>

                        {/*
                         * activity-scroll-container = custom CSS class (globals.css):
                         *   max-height: 400px + overflow-y: auto + fade-out top gradient.
                         * This keeps the card height bounded and visually integrated
                         * with the chart card beside it.
                         */}
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

                </div>
            </section>

            {/* ════════════════════════════════════════
                § 4  PRODUCTIVITY
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
                § 5  TASKS PRIORITY QUEUE
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
    );
};

export default DashboardPage;
