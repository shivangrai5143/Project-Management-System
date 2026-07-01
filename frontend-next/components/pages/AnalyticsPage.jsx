'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    BarChart3,
    Bug,
    CheckCircle2,
    FolderKanban,
    Timer,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useProjects } from '@/context/ProjectContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsGrid from '@/components/dashboard/AnalyticsGrid';
import PageHero from '@/components/workspace/PageHero';
import EmptyState from '@/components/workspace/EmptyState';
import { calculateProgress, formatDate, isOverdue } from '@/utils/helpers';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'velocity', label: 'Velocity' },
    { id: 'team', label: 'Team' },
    { id: 'projects', label: 'Projects' },
    { id: 'bugs', label: 'Bugs' },
];

function TabButton({ label, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'border-violet-500/30 bg-violet-500/12 text-violet-100'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200',
            ].join(' ')}
        >
            {label}
        </button>
    );
}

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

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const { tasks, getTaskStats } = useTasks();
    const { projects, team, getTeamMember } = useProjects();

    const taskStats = getTaskStats();
    const openTasks = taskStats.total - taskStats.done;
    const completionRate = taskStats.total ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
    const bugTasks = tasks.filter((task) => task.labels?.includes('bug'));
    const openBugs = bugTasks.filter((task) => task.status !== 'done');
    const criticalBugs = openBugs.filter((task) => task.priority === 'high' || task.priority === 'urgent');
    const overdueTasks = tasks.filter((task) => task.status !== 'done' && isOverdue(task.dueDate));

    const workload = team
        .map((member) => {
            const assignedTasks = tasks.filter((task) => task.assigneeId === member.id && task.status !== 'done');
            const completedTasks = tasks.filter((task) => task.assigneeId === member.id && task.status === 'done');

            return {
                ...member,
                assignedTasks,
                completedCount: completedTasks.length,
                loadPercent: Math.min(100, assignedTasks.length * 18),
            };
        })
        .sort((left, right) => right.assignedTasks.length - left.assignedTasks.length);

    const projectHealth = projects
        .map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const progress = calculateProgress(projectTasks);
            const overdueCount = projectTasks.filter((task) => task.status !== 'done' && isOverdue(task.dueDate)).length;
            const nextDeadline = projectTasks
                .filter((task) => task.dueDate && task.status !== 'done')
                .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))[0];

            let health = 'Healthy';
            if (overdueCount > 0 || progress < 35) {
                health = 'At Risk';
            } else if (progress < 60) {
                health = 'Watch';
            }

            return {
                ...project,
                progress,
                overdueCount,
                nextDeadline,
                health,
                teamMembers: project.teamIds
                    ?.map((memberId) => getTeamMember(memberId))
                    .filter(Boolean) ?? [],
            };
        })
        .sort((left, right) => right.overdueCount - left.overdueCount || left.progress - right.progress);

    const analyticsCards = [
        {
            title: 'Delivery rate',
            value: `${completionRate}%`,
            change: `${taskStats.done} tasks shipped`,
            changeType: completionRate >= 65 ? 'positive' : completionRate >= 40 ? 'neutral' : 'negative',
            icon: TrendingUp,
            tone: 'emerald',
            progress: completionRate,
        },
        {
            title: 'Open work',
            value: openTasks,
            change: `${taskStats.inProgress} in progress`,
            changeType: 'neutral',
            icon: Timer,
            tone: 'cyan',
        },
        {
            title: 'At-risk items',
            value: overdueTasks.length,
            change: overdueTasks.length ? 'Needs intervention' : 'No blockers flagged',
            changeType: overdueTasks.length ? 'negative' : 'positive',
            icon: AlertTriangle,
            tone: 'rose',
        },
        {
            title: 'Project coverage',
            value: `${projects.length}`,
            change: `${projectHealth.filter((project) => project.health === 'Healthy').length} healthy`,
            changeType: 'neutral',
            icon: FolderKanban,
            tone: 'indigo',
        },
    ];

    const activeProjectRisks = projectHealth.filter((project) => project.health !== 'Healthy').slice(0, 3);
    const busiestMembers = workload.filter((member) => member.assignedTasks.length > 0).slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHero
                eyebrow="Analytics"
                title="Operational intelligence for every delivery stream"
                description="Monitor throughput, workload balance, project health, and defect pressure without digging through separate dashboards."
                tone="indigo"
                meta={[
                    { label: 'Completion', value: `${completionRate}%`, hint: 'Across all tracked work' },
                    { label: 'Open work', value: `${openTasks}`, hint: `${taskStats.inProgress} items currently moving` },
                    { label: 'Risk signals', value: `${overdueTasks.length}`, hint: 'Overdue or delayed work items' },
                    { label: 'Projects', value: `${projects.length}`, hint: `${projectHealth.filter((project) => project.health === 'At Risk').length} at risk` },
                ]}
            />

            <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                    <TabButton
                        key={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {analyticsCards.map((card) => (
                            <StatsCard key={card.title} {...card} />
                        ))}
                    </section>

                    <section className="space-y-4">
                        <SectionTitle
                            eyebrow="Charts"
                            title="Performance overview"
                            description="Compact visual trends for delivery, sprint flow, team workload, and bug resolution."
                        />
                        <AnalyticsGrid />
                    </section>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                        <Card padding="dashboard">
                            <SectionTitle
                                eyebrow="Signals"
                                title="What needs attention now"
                                description="A short operational brief for the current workspace state."
                            />
                            <div className="mt-5 space-y-3">
                                <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Overdue work</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {overdueTasks.length
                                                    ? `${overdueTasks.length} tasks are past due and need reprioritization.`
                                                    : 'No overdue work is currently blocking the workspace.'}
                                            </p>
                                        </div>
                                        <Badge variant={overdueTasks.length ? 'danger' : 'success'} size="md">
                                            {overdueTasks.length || '0'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Defect pressure</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {openBugs.length
                                                    ? `${openBugs.length} open bugs and ${criticalBugs.length} critical issues are on the board.`
                                                    : 'No open bug tickets are tagged right now.'}
                                            </p>
                                        </div>
                                        <Badge variant={criticalBugs.length ? 'danger' : 'default'} size="md">
                                            {criticalBugs.length} critical
                                        </Badge>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Capacity balance</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {busiestMembers[0]
                                                    ? `${busiestMembers[0].name} currently carries the highest active workload.`
                                                    : 'No active assignees have work in motion right now.'}
                                            </p>
                                        </div>
                                        <Badge variant="warning" size="md">
                                            {busiestMembers[0]?.assignedTasks.length ?? 0} tasks
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card padding="dashboard">
                            <SectionTitle
                                eyebrow="Projects"
                                title="Watch list"
                                description="Projects that need the fastest intervention."
                            />
                            {activeProjectRisks.length === 0 ? (
                                <div className="mt-5 rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-5 text-sm text-slate-400">
                                    Every active project is currently tracking as healthy.
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {activeProjectRisks.map((project) => (
                                        <div key={project.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{project.name}</p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {project.progress}% complete
                                                        {project.nextDeadline ? `, next due ${formatDate(project.nextDeadline.dueDate)}` : ', no due date set'}
                                                    </p>
                                                </div>
                                                <Badge variant={project.health === 'At Risk' ? 'danger' : 'warning'} size="md">
                                                    {project.health}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </section>
                </div>
            )}

            {activeTab === 'velocity' && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Velocity"
                            title="Delivery heartbeat"
                            description="A compact operational readout for sprint and flow health."
                        />
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <p className="text-sm text-slate-400">Done this cycle</p>
                                <p className="mt-2 text-3xl font-semibold text-white">{taskStats.done}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <p className="text-sm text-slate-400">In review</p>
                                <p className="mt-2 text-3xl font-semibold text-white">{taskStats.review}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <p className="text-sm text-slate-400">Blocked by time</p>
                                <p className="mt-2 text-3xl font-semibold text-white">{overdueTasks.length}</p>
                            </div>
                        </div>
                        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-800/30 p-5 text-sm leading-6 text-slate-300">
                            Delivery is healthiest when in-progress work stays lower than completed work. Right now the workspace has{' '}
                            <span className="font-semibold text-white">{taskStats.inProgress}</span> items in progress and{' '}
                            <span className="font-semibold text-white">{taskStats.done}</span> completed items.
                        </div>
                    </Card>

                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Recommendations"
                            title="ERA suggestions"
                            description="Actions that would likely improve near-term throughput."
                        />
                        <div className="mt-5 space-y-3">
                            {[
                                'Reduce work in progress by closing or pausing aging review items.',
                                'Move overdue work into a dedicated risk lane for leadership visibility.',
                                'Confirm sprint scope against current team capacity before pulling more work.',
                            ].map((recommendation) => (
                                <div key={recommendation} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-sm text-slate-300">
                                    {recommendation}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'team' && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Workload"
                            title="Team balance"
                            description="How active work is distributed across the workspace."
                        />
                        <div className="mt-5 space-y-3">
                            {busiestMembers.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-5 text-sm text-slate-400">
                                    No active workload is assigned yet.
                                </div>
                            ) : (
                                busiestMembers.map((member) => (
                                    <div key={member.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{member.name}</p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {member.assignedTasks.length} active tasks, {member.completedCount} completed
                                                </p>
                                            </div>
                                            <Badge variant={member.loadPercent > 70 ? 'warning' : 'success'} size="md">
                                                {member.loadPercent}%
                                            </Badge>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                                                style={{ width: `${member.loadPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Leads"
                            title="Support needed"
                            description="People with the highest active load should get the fastest unblock path."
                        />
                        <div className="mt-5 space-y-3">
                            {busiestMembers.slice(0, 3).map((member) => (
                                <div key={member.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{member.name}</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Highest active ownership in the current workspace.
                                            </p>
                                        </div>
                                        <Badge variant="warning" size="md">
                                            {member.assignedTasks.length} open
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {busiestMembers.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-5 text-sm text-slate-400">
                                    No one is carrying a visible active workload yet.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'projects' && (
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Portfolio"
                        title="Project health matrix"
                        description="A compact view of progress, deadlines, and risk by project."
                    />
                    {projectHealth.length === 0 ? (
                        <div className="mt-5">
                            <EmptyState
                                icon={FolderKanban}
                                title="No projects yet"
                                description="Create your first project to start tracking portfolio health and delivery momentum."
                                tone="indigo"
                            />
                        </div>
                    ) : (
                        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800">
                            <div className="overflow-x-auto">
                                <table className="workspace-table min-w-full bg-slate-900/50">
                                    <thead className="bg-slate-900/70 text-left">
                                        <tr>
                                            <th>Project</th>
                                            <th>Progress</th>
                                            <th>Health</th>
                                            <th>Overdue</th>
                                            <th>Next deadline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projectHealth.map((project) => (
                                            <tr key={project.id}>
                                                <td>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{project.name}</p>
                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {project.teamMembers.length} teammates involved
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="w-44 max-w-full">
                                                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                                            <span>{project.progress}% complete</span>
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                                                                style={{ width: `${project.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge
                                                        variant={
                                                            project.health === 'Healthy'
                                                                ? 'success'
                                                                : project.health === 'At Risk'
                                                                    ? 'danger'
                                                                    : 'warning'
                                                        }
                                                        size="md"
                                                    >
                                                        {project.health}
                                                    </Badge>
                                                </td>
                                                <td className="text-sm text-slate-300">{project.overdueCount}</td>
                                                <td className="text-sm text-slate-300">
                                                    {project.nextDeadline ? formatDate(project.nextDeadline.dueDate) : 'No date'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'bugs' && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Defects"
                            title="Bug pressure"
                            description="Severity and resolution posture for issues tagged as bugs."
                        />
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <p className="text-sm text-slate-400">Open bugs</p>
                                <p className="mt-2 text-3xl font-semibold text-white">{openBugs.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <p className="text-sm text-slate-400">Critical</p>
                                <p className="mt-2 text-3xl font-semibold text-white">{criticalBugs.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <p className="text-sm text-slate-400">Resolved</p>
                                <p className="mt-2 text-3xl font-semibold text-white">{bugTasks.length - openBugs.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Queue"
                            title="Bug list"
                            description="Current issues marked with the bug label."
                        />
                        {bugTasks.length === 0 ? (
                            <div className="mt-5">
                                <EmptyState
                                    icon={Bug}
                                    title="No bugs are tagged yet"
                                    description="Once tasks are labeled as bugs, severity and resolution analytics will appear here automatically."
                                    tone="rose"
                                />
                            </div>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {bugTasks.map((bug) => (
                                    <div key={bug.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{bug.title}</p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {bug.status === 'done' ? 'Resolved' : 'Open'}
                                                    {bug.dueDate ? `, due ${formatDate(bug.dueDate)}` : ', no due date set'}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={bug.priority === 'urgent' || bug.priority === 'high' ? 'danger' : 'warning'}
                                                size="md"
                                            >
                                                {bug.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
