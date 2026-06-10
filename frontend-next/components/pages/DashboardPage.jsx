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
    Sparkles,
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
   Shared quick-action link style
───────────────────────────────────────────────────────────── */
const quickActionClasses =
    'flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-left transition-colors hover:border-slate-700 hover:bg-slate-800/70';

/* ─────────────────────────────────────────────────────────────
   Section heading — consistent eyebrow / title / description
   pattern across all dashboard sections.
───────────────────────────────────────────────────────────── */
const SectionHeading = ({ eyebrow, title, description, action }) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
            {/* Eyebrow — 10px uppercase label (design system tier 1) */}
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                {eyebrow}
            </p>
            {/* Title — 18px semibold (design system tier 2) */}
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
                    <div key={task.id} className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
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
         * Root: space-y-8 = 32px between sections (one step above card gap-6).
         * This creates clear visual rhythm: sections feel distinct, cards feel grouped.
         */
        <div className="space-y-8">

            {/* ════════════════════════════════════════
                § 1  WELCOME + QUICK ACTIONS
                ════════════════════════════════════════
                Two-column grid: greeting expands, quick actions pinned to 300px.
                Collapses to single column below lg.
            */}
            <section
                aria-label="Welcome"
                className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
            >
                {/* Greeting card */}
                <Card padding="dashboard">
                    <div className="flex h-full flex-col justify-between gap-6">
                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                                Welcome back
                            </p>
                            {/* h1 — single page landmark, 28px/32px */}
                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                {firstName} 👋
                            </h1>
                            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
                                You have{' '}
                                <span className="font-medium text-white">{myOpenTasks} active tasks</span>{' '}
                                assigned to you across{' '}
                                <span className="font-medium text-white">{projects.length} projects</span>.
                                Keep momentum on in-progress work and resolve overdue items first.
                            </p>
                        </div>

                        {/* Status badges */}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="primary" size="md">
                                {projects.length} active projects
                            </Badge>
                            <Badge variant={stats.overdue > 0 ? 'danger' : 'success'} size="md">
                                {stats.overdue > 0 ? `${stats.overdue} overdue` : 'No overdue tasks'}
                            </Badge>
                            <Badge variant="warning" size="md">
                                {myOpenTasks} assigned to you
                            </Badge>
                        </div>
                    </div>
                </Card>

                {/* Quick actions card */}
                <Card padding="dashboard">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Quick actions
                    </p>
                    <div className="mt-4 flex flex-col gap-2.5">
                        <Link href="/projects" className={quickActionClasses}>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
                                    <FolderKanban className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Projects</p>
                                    <p className="mt-0.5 text-xs text-slate-400">Roadmap & ownership</p>
                                </div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        </Link>

                        <Link href="/tasks" className={quickActionClasses}>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
                                    <ListTodo className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Tasks</p>
                                    <p className="mt-0.5 text-xs text-slate-400">Triage & move blockers</p>
                                </div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => openPanel()}
                            className={quickActionClasses}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-violet-500/10 p-2 text-violet-300">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-white">ERA Assistant</p>
                                    <p className="mt-0.5 text-xs text-slate-400">Plans, summaries & steps</p>
                                </div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        </button>
                    </div>
                </Card>
            </section>

            {/* ════════════════════════════════════════
                § 2  STATS GRID (4 cards)
                ════════════════════════════════════════
                2-col on mobile → 4-col at lg.
                lg breakpoint (1024px) is the correct threshold when the sidebar
                is 256px wide, leaving ~768px for content — enough for 4 cards.
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
                70/30 split at xl (≥1280px). Below that, single column stack.
                Named fr fractions prevent the columns from ever blowing past
                their parent's width.
            */}
            <section aria-label="Analytics" className="space-y-4">
                <SectionHeading
                    eyebrow="Analytics"
                    title="Created vs completed"
                    description="7-day task throughput and delivery pace."
                />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">

                    {/* Activity chart card */}
                    <Card padding="dashboard">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">Activity chart</h3>
                                <p className="mt-0.5 text-sm text-slate-400">
                                    Tasks created and completed over the last 7 days.
                                </p>
                            </div>
                            {/* Legend */}
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                                    Completed
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    Created
                                </div>
                            </div>
                        </div>

                        {/*
                         * Chart container height — responsive steps:
                         *  h-48  (192px) on mobile  — visible, not dominant
                         *  h-64  (256px) on sm       — comfortable reading
                         *  h-80  (320px) on lg+      — full analytics view
                         *
                         * ResponsiveContainer fills 100% of this container.
                         * No magic pixel values — all Tailwind scale.
                         */}
                        <div className="mt-5 h-48 w-full sm:h-64 lg:h-80">
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

                    {/* Recent activity card */}
                    <Card padding="dashboard">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-white">Recent activity</h3>
                                <p className="mt-0.5 text-sm text-slate-400">
                                    Latest changes across your workspace.
                                </p>
                            </div>
                            <Sparkles className="h-4 w-4 shrink-0 text-slate-600" />
                        </div>

                        <div className="mt-5 space-y-2.5">
                            {demoActivities.slice(0, 5).map((activity) => {
                                const activityUser = getTeamMember(activity.userId);
                                return (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3"
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
                    </Card>

                </div>
            </section>

            {/* ════════════════════════════════════════
                § 4  PRODUCTIVITY
                ════════════════════════════════════════
                2-col at xl, 1-col below.
            */}
            <section id="productivity-section" aria-label="Productivity" className="space-y-4">
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
            <section aria-label="Task priority queue" className="space-y-4">
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
