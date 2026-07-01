'use client';

import { useState } from 'react';
import {
    Calendar,
    CheckSquare,
    Flag,
    KanbanSquare,
    Plus,
    Search,
    Table2,
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/tasks/TaskForm';
import PageHero from '@/components/workspace/PageHero';
import EmptyState from '@/components/workspace/EmptyState';
import { formatDate, isDueSoon, isOverdue } from '@/utils/helpers';
import { PRIORITY_CONFIG, STATUS_CONFIG, TASK_STATUSES } from '@/utils/constants';

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

const VIEW_OPTIONS = [
    { id: 'table', icon: Table2, label: 'Table' },
    { id: 'board', icon: KanbanSquare, label: 'Kanban' },
];

const SORT_OPTIONS = [
    { value: 'dueDate', label: 'Due date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
];

const priorityOrder = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
};

function getSprintLabel(task) {
    if (!task.dueDate) {
        return 'Backlog';
    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / 86400000);

    return diffDays <= 14 ? 'Current Sprint' : 'Next Sprint';
}

export default function TasksPage() {
    const { user } = useAuth();
    const { tasks, createTask } = useTasks();
    const { projects, getTeamMember } = useProjects();
    const { showToast } = useNotifications();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [sortBy, setSortBy] = useState('dueDate');
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    const myTasks = tasks.filter((task) => task.assigneeId === user?.id);

    const filteredTasks = myTasks.filter((task) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesQuery =
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query);

            if (!matchesQuery) {
                return false;
            }
        }

        if (statusFilter && task.status !== statusFilter) {
            return false;
        }

        if (priorityFilter && task.priority !== priorityFilter) {
            return false;
        }

        if (projectFilter && task.projectId !== projectFilter) {
            return false;
        }

        return true;
    }).sort((left, right) => {
        if (sortBy === 'priority') {
            return (priorityOrder[left.priority] ?? 4) - (priorityOrder[right.priority] ?? 4);
        }

        if (sortBy === 'status') {
            return left.status.localeCompare(right.status);
        }

        const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return leftDate - rightDate;
    });

    const overdueCount = myTasks.filter((task) => task.status !== 'done' && isOverdue(task.dueDate)).length;
    const dueSoonCount = myTasks.filter((task) => task.status !== 'done' && isDueSoon(task.dueDate)).length;
    const doneCount = myTasks.filter((task) => task.status === 'done').length;
    const inProgressCount = myTasks.filter((task) => task.status === 'in-progress' || task.status === 'review').length;

    const projectOptions = projects.map((project) => ({
        value: project.id,
        label: project.name,
    }));

    const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
    }));

    const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
    }));

    const handleCreateTask = async (formData) => {
        setIsCreatingTask(true);

        try {
            await createTask(formData);
            setIsModalOpen(false);
            showToast(`Task "${formData.title}" created`, 'success');
        } catch (error) {
            showToast('Failed to create task', 'error');
        } finally {
            setIsCreatingTask(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHero
                eyebrow="My Tasks"
                title="A denser task workspace for prioritizing execution"
                description="Switch between a desktop-friendly table and a flow view without losing filters, status cues, or due-date context."
                tone="indigo"
                actions={(
                    <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
                        Create Task
                    </Button>
                )}
                meta={[
                    { label: 'Assigned', value: `${myTasks.length}`, hint: 'Total tasks assigned to you' },
                    { label: 'In flight', value: `${inProgressCount}`, hint: 'In progress or waiting review' },
                    { label: 'Due soon', value: `${dueSoonCount}`, hint: 'Upcoming deadlines in the next 3 days' },
                    { label: 'Overdue', value: `${overdueCount}`, hint: 'Needs immediate reprioritization' },
                ]}
            />

            <Card padding="dashboard">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <SectionTitle
                            eyebrow="Task Board"
                            title="Filters and views"
                            description="Control status, priority, and project scope without leaving the page."
                        />

                        <div className="flex flex-wrap gap-2">
                            {VIEW_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setViewMode(option.id)}
                                    className={[
                                        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                                        viewMode === option.id
                                            ? 'border-violet-500/30 bg-violet-500/12 text-violet-100'
                                            : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                                    ].join(' ')}
                                >
                                    <option.icon className="h-4 w-4" />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.7fr))]">
                        <Input
                            icon={Search}
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                        <Select
                            placeholder="Status"
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        />
                        <Select
                            placeholder="Priority"
                            options={priorityOptions}
                            value={priorityFilter}
                            onChange={(event) => setPriorityFilter(event.target.value)}
                        />
                        <Select
                            placeholder="Project"
                            options={projectOptions}
                            value={projectFilter}
                            onChange={(event) => setProjectFilter(event.target.value)}
                        />
                        <Select
                            placeholder="Sort"
                            options={SORT_OPTIONS}
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                        />
                    </div>
                </div>

                {filteredTasks.length === 0 ? (
                    <div className="mt-5">
                        <EmptyState
                            icon={CheckSquare}
                            title={myTasks.length === 0 ? 'No tasks assigned yet' : 'No tasks match these filters'}
                            description={myTasks.length === 0
                                ? 'Once work is assigned to you, it will appear here with task, sprint, and due-date context.'
                                : 'Try broadening the filters or clearing the current search query.'}
                            tone="indigo"
                            action={myTasks.length === 0 ? (
                                <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
                                    Create Task
                                </Button>
                            ) : null}
                        />
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="workspace-table min-w-full bg-slate-900/50">
                                <thead className="bg-slate-900/70 text-left">
                                    <tr>
                                        <th>Task Name</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                        <th>Assignee</th>
                                        <th>Sprint</th>
                                        <th>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map((task) => {
                                        const assignee = getTeamMember(task.assigneeId);
                                        const statusConfig = STATUS_CONFIG[task.status];
                                        const priorityConfig = PRIORITY_CONFIG[task.priority];

                                        return (
                                            <tr key={task.id}>
                                                <td>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{task.title}</p>
                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {projects.find((project) => project.id === task.projectId)?.name || 'General'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge variant="default" size="md" color={statusConfig?.color}>
                                                        {statusConfig?.label || task.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge variant="default" size="md" color={priorityConfig?.color}>
                                                        {priorityConfig?.label || task.priority}
                                                    </Badge>
                                                </td>
                                                <td className="text-sm text-slate-300">{assignee?.name || 'Unassigned'}</td>
                                                <td className="text-sm text-slate-300">{getSprintLabel(task)}</td>
                                                <td className="text-sm text-slate-300">
                                                    {task.dueDate ? formatDate(task.dueDate) : 'No date'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-4">
                        {[TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.REVIEW, TASK_STATUSES.DONE].map((status) => {
                            const columnTasks = filteredTasks.filter((task) => task.status === status);
                            const statusConfig = STATUS_CONFIG[status];

                            return (
                                <Card key={status} padding="dashboard" className="h-full">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-base font-semibold text-white">{statusConfig.label}</h3>
                                        <Badge variant="default" size="md" color={statusConfig.color}>
                                            {columnTasks.length}
                                        </Badge>
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        {columnTasks.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-4 text-sm text-slate-400">
                                                Nothing in this lane.
                                            </div>
                                        ) : (
                                            columnTasks.map((task) => (
                                                <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                                    <p className="text-sm font-semibold text-white">{task.title}</p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {projects.find((project) => project.id === task.projectId)?.name || 'General'}
                                                    </p>
                                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                                        <Badge variant="default" size="sm" color={PRIORITY_CONFIG[task.priority]?.color}>
                                                            <Flag className="mr-1 h-3 w-3" />
                                                            {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                                                        </Badge>
                                                        <Badge variant="default" size="sm">
                                                            {getSprintLabel(task)}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Card>

            <Card padding="dashboard">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                        <p className="text-sm font-semibold text-white">Open workload</p>
                        <p className="mt-1 text-sm text-slate-400">
                            {myTasks.length - doneCount} active tasks still need attention.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                        <p className="text-sm font-semibold text-white">Due-soon pressure</p>
                        <p className="mt-1 text-sm text-slate-400">
                            {dueSoonCount} items are approaching their due dates this week.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                        <p className="text-sm font-semibold text-white">Completed</p>
                        <p className="mt-1 text-sm text-slate-400">
                            {doneCount} tasks are already finished and off your plate.
                        </p>
                    </div>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Task"
                size="lg"
            >
                <TaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isCreatingTask}
                />
            </Modal>
        </div>
    );
}
