'use client';

import Link from 'next/link';
import {
    AlertTriangle,
    ArrowRight,
    Bot,
    CheckCircle2,
    Gauge,
    Target,
    Timer,
    Users,
} from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useTasks } from '@/context/TaskContext';
import { useProjects } from '@/context/ProjectContext';
import { useAIAgent } from '@/context/AIAgentContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageHero from '@/components/workspace/PageHero';
import EmptyState from '@/components/workspace/EmptyState';
import { formatDate, isOverdue } from '@/utils/helpers';

function SectionTitle({ eyebrow, title, description }) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                {title}
            </h2>
            {description && (
                <p className="mt-1 text-sm text-slate-400">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function SprintsPage() {
    const { tasks } = useTasks();
    const { team, getProject } = useProjects();
    const { openPanel } = useAIAgent();

    const activeTasks = tasks.filter((task) => task.status !== 'done');
    const backlogTasks = activeTasks.filter((task) => task.status === 'todo');
    const inProgressTasks = activeTasks.filter((task) => task.status === 'in-progress');
    const reviewTasks = activeTasks.filter((task) => task.status === 'review');
    const completedTasks = tasks.filter((task) => task.status === 'done');
    const overdueTasks = activeTasks.filter((task) => isOverdue(task.dueDate));

    const sprintVelocity = completedTasks.length * 3;
    const totalScope = activeTasks.length + completedTasks.length;
    const progress = totalScope ? Math.round((completedTasks.length / totalScope) * 100) : 0;
    const capacity = team.length * 6;
    const usedCapacity = Math.min(100, activeTasks.length * 14);

    const health = overdueTasks.length > 0 || reviewTasks.length > inProgressTasks.length ? 'At Risk' : progress > 45 ? 'Healthy' : 'Watch';
    const healthVariant = health === 'Healthy' ? 'success' : health === 'At Risk' ? 'danger' : 'warning';

    const burndownData = Array.from({ length: 7 }, (_, index) => {
        const ideal = Math.max(0, Math.round(activeTasks.length - (activeTasks.length / 6) * index));
        const actual = Math.max(0, Math.round(activeTasks.length - (completedTasks.length / 7) * index + (overdueTasks.length > 0 ? overdueTasks.length / 2 : 0)));

        return {
            name: `Day ${index + 1}`,
            ideal,
            actual,
        };
    });

    const sprintColumns = [
        { label: 'Backlog', tone: 'default', tasks: backlogTasks },
        { label: 'In Progress', tone: 'primary', tasks: inProgressTasks },
        { label: 'Review', tone: 'warning', tasks: reviewTasks },
    ];

    if (tasks.length === 0) {
        return (
            <div className="animate-fade-in">
                <EmptyState
                    icon={Target}
                    title="No sprint data yet"
                    description="Create tasks and start moving work to unlock sprint planning, burndown tracking, and capacity health."
                    tone="indigo"
                    action={(
                        <Link href="/tasks" className="dash-action-primary">
                            Open task board
                        </Link>
                    )}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHero
                eyebrow="Sprint Workspace"
                title="Plan, monitor, and unblock the active sprint"
                description="Keep iteration scope visible, track burndown against reality, and route risks into ERA before delivery slips."
                tone="indigo"
                actions={(
                    <>
                        <button type="button" onClick={openPanel} className="dash-action-ai">
                            <Bot className="h-3.5 w-3.5" />
                            Ask ERA for sprint risks
                        </button>
                        <Link href="/tasks" className="dash-action-secondary">
                            Review task board
                        </Link>
                    </>
                )}
                meta={[
                    { label: 'Progress', value: `${progress}%`, hint: `${completedTasks.length} items completed` },
                    { label: 'Velocity', value: `${sprintVelocity}`, hint: 'Estimated sprint points completed' },
                    { label: 'Capacity', value: `${usedCapacity}%`, hint: `${activeTasks.length} active tasks in flight` },
                    { label: 'Health', value: health, hint: overdueTasks.length ? `${overdueTasks.length} overdue items flagged` : 'No overdue work detected' },
                ]}
            />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Sprint progress</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{progress}%</p>
                        </div>
                        <Gauge className="h-5 w-5 text-violet-200" />
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Remaining work</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{activeTasks.length}</p>
                        </div>
                        <Timer className="h-5 w-5 text-cyan-200" />
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Team capacity</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{capacity}</p>
                        </div>
                        <Users className="h-5 w-5 text-emerald-200" />
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Sprint health</p>
                            <div className="mt-2">
                                <Badge variant={healthVariant} size="md">
                                    {health}
                                </Badge>
                            </div>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-amber-200" />
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Burndown"
                        title="Remaining work vs ideal line"
                        description="A lightweight sprint burn chart sized to stay above the fold on desktop."
                    />
                    <div className="mt-5 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={burndownData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 18,
                                        borderColor: '#1e293b',
                                        backgroundColor: '#0f172a',
                                        color: '#fff',
                                    }}
                                />
                                <Line type="monotone" dataKey="ideal" stroke="#38bdf8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, fill: '#8b5cf6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Health"
                        title="Sprint status"
                        description="The highest-impact signals for delivery confidence."
                    />
                    <div className="mt-5 space-y-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">Overdue work</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {overdueTasks.length
                                            ? `${overdueTasks.length} tasks are already late in the current sprint.`
                                            : 'No overdue tasks are currently pulling the sprint off track.'}
                                    </p>
                                </div>
                                <Badge variant={overdueTasks.length ? 'danger' : 'success'} size="md">
                                    {overdueTasks.length}
                                </Badge>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">Review queue</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {reviewTasks.length} items are waiting on review and release.
                                    </p>
                                </div>
                                <Badge variant={reviewTasks.length > 3 ? 'warning' : 'default'} size="md">
                                    {reviewTasks.length}
                                </Badge>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">Completed this sprint</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {completedTasks.length} tasks have crossed the finish line so far.
                                    </p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <SectionTitle
                    eyebrow="Board"
                    title="Current sprint lanes"
                    description="A compact board view for backlog, active execution, and review queues."
                />
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    {sprintColumns.map((column) => (
                        <Card key={column.label} padding="dashboard" className="h-full">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-white">{column.label}</h3>
                                <Badge variant={column.tone} size="md">
                                    {column.tasks.length}
                                </Badge>
                            </div>
                            <div className="mt-5 space-y-3">
                                {column.tasks.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-4 text-sm text-slate-400">
                                        Nothing in this lane right now.
                                    </div>
                                ) : (
                                    column.tasks.slice(0, 5).map((task) => (
                                        <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                            <p className="text-sm font-semibold text-white">{task.title}</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {getProject(task.projectId)?.name || 'Unscoped project'}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                                                <span>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
                                                <Link href="/tasks" className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200">
                                                    Open
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
