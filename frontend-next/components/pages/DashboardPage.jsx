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

const buildChartData = (tasks) => {
    const end = startOfDay(new Date());
    const days = eachDayOfInterval({ start: subDays(end, 6), end });

    return days.map((day) => ({
        label: format(day, 'EEE'),
        created: tasks.filter(task => task.createdAt && isSameDay(new Date(task.createdAt), day)).length,
        completed: tasks.filter(
            task => task.status === 'done' && task.updatedAt && isSameDay(new Date(task.updatedAt), day)
        ).length,
    }));
};

const quickActionClasses = 'flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-left transition-colors hover:border-slate-700 hover:bg-slate-800/70';

const SectionHeading = ({ eyebrow, title, description, action }) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
        {action}
    </div>
);

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
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${iconClassName}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{description}</p>
                </div>
            </div>
            <Badge variant="default" size="md">{tasks.length}</Badge>
        </div>

        {tasks.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-4 text-sm text-slate-400">
                {emptyMessage}
            </div>
        ) : (
            <div className="mt-6 space-y-3">
                {tasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">{task.title}</p>
                                <p className="mt-1 text-sm text-slate-400">
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

const DashboardPage = () => {
    const { user } = useAuth();
    const { openPanel } = useAIAgent();
    const { projects, getTeamMember } = useProjects();
    const { tasks, getTaskStats, getTasksByAssignee } = useTasks();

    const stats = getTaskStats();
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const myTasks = user ? getTasksByAssignee(user.id) : [];
    const myOpenTasks = myTasks.filter(task => task.status !== 'done').length;
    const openTasks = stats.total - stats.done;
    const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

    const projectNameById = useMemo(
        () => Object.fromEntries(projects.map(project => [project.id, project.name])),
        [projects]
    );

    const overdueTasks = useMemo(
        () => tasks
            .filter(task => isOverdue(task.dueDate) && task.status !== 'done')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 4),
        [tasks]
    );

    const upcomingTasks = useMemo(
        () => tasks
            .filter(task => isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && task.status !== 'done')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 4),
        [tasks]
    );

    const chartData = useMemo(() => buildChartData(tasks), [tasks]);

    const statsCards = [
        {
            title: 'Total Tasks',
            value: stats.total,
            change: `${openTasks} open tasks`,
            changeType: 'neutral',
            icon: ListTodo,
            tone: 'slate',
        },
        {
            title: 'Completed',
            value: stats.done,
            change: `${completionRate}% completion rate`,
            changeType: 'positive',
            icon: CheckCircle2,
            tone: 'emerald',
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            change: `${stats.review} in review`,
            changeType: 'neutral',
            icon: Clock3,
            tone: 'amber',
        },
        {
            title: 'Overdue',
            value: stats.overdue,
            change: stats.overdue > 0 ? 'Needs attention' : 'On track',
            changeType: stats.overdue > 0 ? 'negative' : 'positive',
            icon: AlertTriangle,
            tone: 'rose',
        },
    ];

    return (
        <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <Card padding="dashboard" className="h-full">
                    <div className="flex h-full flex-col justify-between gap-6">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Welcome</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Welcome back, {firstName}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                                You have {myOpenTasks} active tasks assigned to you across {projects.length} projects.
                                Keep momentum on in-progress work and resolve overdue items first.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="primary" size="md">{projects.length} active projects</Badge>
                            <Badge variant={stats.overdue > 0 ? 'danger' : 'success'} size="md">
                                {stats.overdue > 0 ? `${stats.overdue} overdue tasks` : 'No overdue tasks'}
                            </Badge>
                            <Badge variant="warning" size="md">{myOpenTasks} assigned to you</Badge>
                        </div>
                    </div>
                </Card>

                <Card padding="dashboard" className="h-full">
                    <p className="text-sm font-medium text-slate-400">Quick actions</p>
                    <div className="mt-4 flex flex-col gap-3">
                        <Link href="/projects" className={quickActionClasses}>
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300">
                                    <FolderKanban className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Open projects</p>
                                    <p className="mt-1 text-sm text-slate-400">Review roadmap, ownership, and active delivery.</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-500" />
                        </Link>

                        <Link href="/tasks" className={quickActionClasses}>
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
                                    <ListTodo className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Review tasks</p>
                                    <p className="mt-1 text-sm text-slate-400">Triage open work and move blockers forward.</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-500" />
                        </Link>

                        <button type="button" onClick={() => openPanel()} className={quickActionClasses}>
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-white">Open ERA</p>
                                    <p className="mt-1 text-sm text-slate-400">Generate plans, summaries, and next steps.</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-500" />
                        </button>
                    </div>
                </Card>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

            <section className="space-y-4">
                <SectionHeading
                    eyebrow="Analytics"
                    title="Created vs completed work"
                    description="A seven-day view of task throughput and delivery pace."
                />

                <div className="grid gap-6 xl:grid-cols-10">
                    <Card padding="dashboard" className="xl:col-span-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Activity chart</h3>
                                <p className="mt-1 text-sm text-slate-400">Tasks created and completed over the last 7 days.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                                    Completed
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                    Created
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 h-[320px] w-full sm:h-[360px]">
                            <ChartErrorBoundary>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#64748b" />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} stroke="#64748b" />
                                        <Tooltip
                                            cursor={{ stroke: '#334155', strokeDasharray: '4 4' }}
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: '1px solid #1e293b',
                                                borderRadius: '16px',
                                                color: '#e2e8f0',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="#818cf8"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#completedGradient)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="created"
                                            stroke="#34d399"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#createdGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartErrorBoundary>
                        </div>
                    </Card>

                    <Card padding="dashboard" className="xl:col-span-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Recent activity</h3>
                                <p className="mt-1 text-sm text-slate-400">The latest changes across your workspace.</p>
                            </div>
                            <Sparkles className="h-5 w-5 text-slate-500" />
                        </div>

                        <div className="mt-6 space-y-3">
                            {demoActivities.slice(0, 5).map((activity) => {
                                const activityUser = getTeamMember(activity.userId);

                                return (
                                    <div key={activity.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar name={activityUser?.name} src={activityUser?.avatar} size="sm" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm leading-6 text-slate-300">
                                                    <span className="font-medium text-white">{activityUser?.name || 'Teammate'}</span>{' '}
                                                    {activity.message}
                                                </p>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    {getRelativeTime(activity.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </section>

            <section id="productivity-section" className="space-y-4">
                <SectionHeading
                    eyebrow="Productivity"
                    title="Daily execution"
                    description="Stay on top of your standup rhythm and AI-guided focus areas."
                />

                <div className="grid gap-6 xl:grid-cols-2">
                    <StandupWidget />
                    <AIInsightsCard />
                </div>
            </section>

            <section className="space-y-4">
                <SectionHeading
                    eyebrow="Tasks"
                    title="Priority queue"
                    description="The work that needs attention soonest."
                    action={(
                        <Link href="/tasks" className="text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200">
                            Open task board
                        </Link>
                    )}
                />

                <div className="grid gap-6 xl:grid-cols-2">
                    <TaskListCard
                        title="Overdue tasks"
                        description="Items that have slipped past their due date."
                        icon={AlertTriangle}
                        iconClassName="border-red-500/20 bg-red-500/10 text-red-300"
                        tasks={overdueTasks}
                        emptyMessage="No overdue work right now. Your current commitments are on track."
                        projectNameById={projectNameById}
                        renderBadge={(task) => (
                            <Badge variant="danger" size="md">
                                {PRIORITY_CONFIG[task.priority]?.label || 'Priority'}
                            </Badge>
                        )}
                    />

                    <TaskListCard
                        title="Upcoming tasks"
                        description="Work due soon so you can stay ahead of the deadline."
                        icon={Clock3}
                        iconClassName="border-amber-500/20 bg-amber-500/10 text-amber-300"
                        tasks={upcomingTasks}
                        emptyMessage="Nothing due in the next few days. You have room to plan proactively."
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
