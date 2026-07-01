'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FolderKanban,
    Grid,
    List,
    Plus,
    Search,
    TriangleAlert,
} from 'lucide-react';
import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';
import { useNotifications } from '@/context/NotificationContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/projects/ProjectForm';
import PageHero from '@/components/workspace/PageHero';
import EmptyState from '@/components/workspace/EmptyState';
import { calculateProgress, formatDate, isOverdue } from '@/utils/helpers';

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

export default function ProjectsPage() {
    const router = useRouter();
    const { projects, team, createProject, updateProject, deleteProject } = useProjects();
    const { getTasksByProject } = useTasks();
    const { showToast } = useNotifications();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const projectRows = projects.map((project) => {
        const projectTasks = getTasksByProject(project.id);
        const progress = calculateProgress(projectTasks);
        const activeTasks = projectTasks.filter((task) => task.status !== 'done');
        const overdueCount = activeTasks.filter((task) => isOverdue(task.dueDate)).length;
        const nextDeadline = activeTasks
            .filter((task) => task.dueDate)
            .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))[0];
        const urgentCount = activeTasks.filter((task) => task.priority === 'urgent' || task.priority === 'high').length;
        const members = project.teamIds?.map((id) => team.find((member) => member.id === id)).filter(Boolean) || [];

        let health = 'Healthy';
        if (overdueCount > 0 || urgentCount > 2) {
            health = 'At Risk';
        } else if (progress < 50 && activeTasks.length > 0) {
            health = 'Watch';
        }

        return {
            ...project,
            progress,
            activeTasks,
            overdueCount,
            nextDeadline,
            urgentCount,
            members,
            health,
        };
    });

    const filteredProjects = projectRows.filter((project) => {
        const query = searchQuery.toLowerCase();
        return (
            project.name.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query)
        );
    });

    const averageProgress = projectRows.length
        ? Math.round(projectRows.reduce((sum, project) => sum + project.progress, 0) / projectRows.length)
        : 0;

    const atRiskProjects = projectRows.filter((project) => project.health === 'At Risk').length;

    const handleCreateProject = async (formData) => {
        try {
            await createProject(formData);
            showToast('Project created successfully', 'success');
            setIsModalOpen(false);
        } catch (error) {
            showToast('Failed to create project', 'error');
        }
    };

    const handleUpdateProject = async (formData) => {
        try {
            await updateProject(editingProject.id, formData);
            showToast('Project updated successfully', 'success');
            setIsModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            showToast('Failed to update project', 'error');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            await deleteProject(projectId);
            showToast('Project deleted', 'info');
        } catch (error) {
            showToast('Failed to delete project', 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHero
                eyebrow="Projects"
                title="A portfolio view built for fast scanning"
                description="See project health, team coverage, and upcoming deadlines without digging into each workspace individually."
                tone="indigo"
                actions={(
                    <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
                        Create Project
                    </Button>
                )}
                meta={[
                    { label: 'Projects', value: `${projects.length}`, hint: 'Active workspaces in the portfolio' },
                    { label: 'At Risk', value: `${atRiskProjects}`, hint: 'Projects needing intervention' },
                    { label: 'Avg progress', value: `${averageProgress}%`, hint: 'Average completion across projects' },
                    { label: 'Team members', value: `${team.length}`, hint: 'Visible contributors across workspaces' },
                ]}
            />

            <Card padding="dashboard">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <SectionTitle
                        eyebrow="Browse"
                        title="Project list"
                        description="Switch between visual cards and a denser list view depending on how you want to triage the portfolio."
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="w-full sm:w-80">
                            <Input
                                icon={Search}
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={[
                                    'inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors',
                                    viewMode === 'grid'
                                        ? 'border-violet-500/30 bg-violet-500/12 text-violet-100'
                                        : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                                ].join(' ')}
                                aria-label="Grid view"
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={[
                                    'inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors',
                                    viewMode === 'list'
                                        ? 'border-violet-500/30 bg-violet-500/12 text-violet-100'
                                        : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                                ].join(' ')}
                                aria-label="List view"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="mt-5">
                        <EmptyState
                            icon={FolderKanban}
                            title={searchQuery ? 'No matching projects' : 'No projects yet'}
                            description={searchQuery
                                ? 'Try a different search term or clear your filters.'
                                : 'Create your first project to start organizing work, teams, and delivery timelines.'}
                            tone="indigo"
                            action={!searchQuery ? (
                                <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
                                    Create Project
                                </Button>
                            ) : null}
                        />
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {filteredProjects.map((project) => (
                            <Card
                                key={project.id}
                                padding="dashboard"
                                hover
                                className="group cursor-pointer"
                                onClick={() => router.push(`/projects/${project.id}`)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                                        <div>
                                            <p className="text-lg font-semibold tracking-tight text-white group-hover:text-violet-200">
                                                {project.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {project.description || 'No description yet.'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={project.health === 'Healthy' ? 'success' : project.health === 'At Risk' ? 'danger' : 'warning'}
                                        size="md"
                                    >
                                        {project.health}
                                    </Badge>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
                                        <p className="mt-2 text-2xl font-semibold text-white">{project.progress}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Open tasks</p>
                                        <p className="mt-2 text-2xl font-semibold text-white">{project.activeTasks.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next deadline</p>
                                        <p className="mt-2 text-sm font-semibold text-white">
                                            {project.nextDeadline ? formatDate(project.nextDeadline.dueDate) : 'No date'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>

                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="default" size="sm">{project.members.length} team</Badge>
                                        <Badge variant={project.urgentCount > 0 ? 'warning' : 'success'} size="sm">
                                            {project.urgentCount} high priority
                                        </Badge>
                                        {project.overdueCount > 0 && (
                                            <Badge variant="danger" size="sm">
                                                {project.overdueCount} overdue
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setEditingProject(project);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeleteProject(project.id);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
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
                                        <th>Team</th>
                                        <th>Next deadline</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id}>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="text-left"
                                                    onClick={() => router.push(`/projects/${project.id}`)}
                                                >
                                                    <p className="text-sm font-semibold text-white">{project.name}</p>
                                                    <p className="mt-1 text-sm text-slate-400">{project.description || 'No description yet.'}</p>
                                                </button>
                                            </td>
                                            <td className="text-sm text-slate-300">{project.progress}%</td>
                                            <td>
                                                <Badge
                                                    variant={project.health === 'Healthy' ? 'success' : project.health === 'At Risk' ? 'danger' : 'warning'}
                                                    size="md"
                                                >
                                                    {project.health}
                                                </Badge>
                                            </td>
                                            <td className="text-sm text-slate-300">{project.members.length}</td>
                                            <td className="text-sm text-slate-300">
                                                {project.nextDeadline ? formatDate(project.nextDeadline.dueDate) : 'No date'}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingProject(project);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteProject(project.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>

            {atRiskProjects > 0 && (
                <Card padding="dashboard">
                    <div className="flex items-start gap-3">
                        <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-300" />
                        <div>
                            <p className="text-sm font-semibold text-white">Portfolio watchlist</p>
                            <p className="mt-1 text-sm text-slate-400">
                                {atRiskProjects} project{atRiskProjects === 1 ? '' : 's'} currently have risk signals from overdue work or concentrated high-priority load.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                }}
                title={editingProject ? 'Edit Project' : 'Create Project'}
            >
                <ProjectForm
                    project={editingProject}
                    onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingProject(null);
                    }}
                />
            </Modal>
        </div>
    );
}
