'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    Bot,
    Bug,
    CheckCircle2,
    Clock3,
    Plus,
    ShieldAlert,
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useProjects } from '@/context/ProjectContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAIAgent } from '@/context/AIAgentContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/tasks/TaskForm';
import PageHero from '@/components/workspace/PageHero';
import EmptyState from '@/components/workspace/EmptyState';
import { formatDate, isOverdue } from '@/utils/helpers';

const FILTERS = [
    { id: 'all', label: 'All Bugs' },
    { id: 'open', label: 'Open' },
    { id: 'critical', label: 'Critical' },
    { id: 'resolved', label: 'Resolved' },
];

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

export default function BugsPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [isCreatingBug, setIsCreatingBug] = useState(false);

    const { tasks, createTask } = useTasks();
    const { getProject } = useProjects();
    const { showToast } = useNotifications();
    const { openPanel } = useAIAgent();

    const bugs = tasks.filter((task) => task.labels?.includes('bug'));
    const openBugs = bugs.filter((task) => task.status !== 'done');
    const resolvedBugs = bugs.filter((task) => task.status === 'done');
    const criticalBugs = openBugs.filter((task) => task.priority === 'high' || task.priority === 'urgent');
    const overdueBugs = openBugs.filter((task) => isOverdue(task.dueDate));

    const filteredBugs = bugs.filter((task) => {
        if (activeFilter === 'open') {
            return task.status !== 'done';
        }
        if (activeFilter === 'critical') {
            return task.priority === 'high' || task.priority === 'urgent';
        }
        if (activeFilter === 'resolved') {
            return task.status === 'done';
        }
        return true;
    });

    const severityGroups = [
        {
            label: 'Critical',
            count: bugs.filter((task) => task.priority === 'urgent').length,
            variant: 'danger',
            hint: 'Immediate fix required',
        },
        {
            label: 'High',
            count: bugs.filter((task) => task.priority === 'high').length,
            variant: 'warning',
            hint: 'Strong business impact',
        },
        {
            label: 'Medium',
            count: bugs.filter((task) => task.priority === 'medium').length,
            variant: 'info',
            hint: 'Needs prioritization',
        },
        {
            label: 'Low',
            count: bugs.filter((task) => task.priority === 'low').length,
            variant: 'default',
            hint: 'Can be scheduled later',
        },
    ];

    const handleCreateBug = async (formData) => {
        setIsCreatingBug(true);

        try {
            const labels = Array.from(new Set([...(formData.labels || []), 'bug']));
            await createTask({
                ...formData,
                labels,
            });
            setIsBugModalOpen(false);
            showToast(`Bug "${formData.title}" logged`, 'success');
        } catch (error) {
            showToast('Failed to log bug. Try again.', 'error');
        } finally {
            setIsCreatingBug(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHero
                eyebrow="Bug Tracker"
                title="Centralize triage, severity, and resolution flow"
                description="Track defect pressure without bouncing between task lists, sprint boards, and ad hoc notes."
                tone="rose"
                actions={(
                    <>
                        <Button icon={Plus} onClick={() => setIsBugModalOpen(true)}>
                            Log Bug
                        </Button>
                        <button type="button" onClick={openPanel} className="dash-action-ai">
                            <Bot className="h-3.5 w-3.5" />
                            Ask ERA for root cause
                        </button>
                    </>
                )}
                meta={[
                    { label: 'Open bugs', value: `${openBugs.length}`, hint: 'Issues not yet resolved' },
                    { label: 'Critical', value: `${criticalBugs.length}`, hint: 'High-severity work to unblock' },
                    { label: 'Resolved', value: `${resolvedBugs.length}`, hint: 'Closed bug tasks' },
                    { label: 'Overdue', value: `${overdueBugs.length}`, hint: 'Bugs past expected resolution date' },
                ]}
            />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Open bugs</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{openBugs.length}</p>
                        </div>
                        <Bug className="h-5 w-5 text-rose-200" />
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Critical bugs</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{criticalBugs.length}</p>
                        </div>
                        <ShieldAlert className="h-5 w-5 text-red-300" />
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Resolved</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{resolvedBugs.length}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-400">Aging issues</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{overdueBugs.length}</p>
                        </div>
                        <Clock3 className="h-5 w-5 text-amber-300" />
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <Card padding="dashboard">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <SectionTitle
                            eyebrow="Queue"
                            title="Defect backlog"
                            description="Filter issues by severity or resolution state without leaving the page."
                        />
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={[
                                        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                                        activeFilter === filter.id
                                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-100'
                                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                                    ].join(' ')}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {bugs.length === 0 ? (
                        <div className="mt-5">
                            <EmptyState
                                icon={Bug}
                                title="No bugs have been logged"
                                description="Use the bug tracker to capture regressions, triage severity, and keep fixes out of chat threads."
                                tone="rose"
                                action={(
                                    <Button icon={Plus} onClick={() => setIsBugModalOpen(true)}>
                                        Log First Bug
                                    </Button>
                                )}
                            />
                        </div>
                    ) : (
                        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800">
                            <div className="overflow-x-auto">
                                <table className="workspace-table min-w-full bg-slate-900/50">
                                    <thead className="bg-slate-900/70 text-left">
                                        <tr>
                                            <th>Title</th>
                                            <th>Severity</th>
                                            <th>Status</th>
                                            <th>Project</th>
                                            <th>Due</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBugs.map((bug) => (
                                            <tr key={bug.id}>
                                                <td>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{bug.title}</p>
                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {bug.description || 'No reproduction notes added yet.'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge
                                                        variant={bug.priority === 'urgent' || bug.priority === 'high' ? 'danger' : 'warning'}
                                                        size="md"
                                                    >
                                                        {bug.priority}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge
                                                        variant={bug.status === 'done' ? 'success' : bug.status === 'review' ? 'warning' : 'default'}
                                                        size="md"
                                                    >
                                                        {bug.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-sm text-slate-300">
                                                    {getProject(bug.projectId)?.name || 'General'}
                                                </td>
                                                <td className="text-sm text-slate-300">
                                                    {bug.dueDate ? formatDate(bug.dueDate) : 'No date'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Card>

                <div className="space-y-5">
                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Severity"
                            title="Issue distribution"
                            description="How the current bug load breaks down across severity levels."
                        />
                        <div className="mt-5 space-y-3">
                            {severityGroups.map((group) => (
                                <div key={group.label} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{group.label}</p>
                                            <p className="mt-1 text-sm text-slate-400">{group.hint}</p>
                                        </div>
                                        <Badge variant={group.variant} size="md">
                                            {group.count}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Triage"
                            title="What to do next"
                            description="Suggested bug-tracker actions for a tighter resolution loop."
                        />
                        <div className="mt-5 space-y-3">
                            {[
                                `${criticalBugs.length} critical bugs should stay isolated from feature work until triaged.`,
                                `${overdueBugs.length} bug tasks are aging beyond their expected fix window.`,
                                'Capture reproduction steps and owner assignment directly in the bug record before escalation.',
                            ].map((item) => (
                                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-sm leading-6 text-slate-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

            <Modal
                isOpen={isBugModalOpen}
                onClose={() => setIsBugModalOpen(false)}
                title="Log Bug"
                size="lg"
            >
                <TaskForm
                    defaults={{
                        status: 'todo',
                        priority: 'high',
                        labels: ['bug'],
                    }}
                    onSubmit={handleCreateBug}
                    onCancel={() => setIsBugModalOpen(false)}
                    isLoading={isCreatingBug}
                    submitLabel="Log Bug"
                />
            </Modal>
        </div>
    );
}
