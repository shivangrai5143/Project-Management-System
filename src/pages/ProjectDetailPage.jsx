import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Settings,
    Users,
    LayoutGrid,
    List,
    Calendar,
    MoreVertical,
    Edit,
    Trash2,
    UserPlus,
    MessageCircle,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import KanbanBoard from '../components/kanban/KanbanBoard';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { Dropdown, DropdownItem, DropdownDivider } from '../components/ui/Dropdown';
import { calculateProgress, formatDate } from '../utils/helpers';
import ChatPanel from '../components/chat/ChatPanel';

const ProjectDetailPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { getProject, updateProject, deleteProject, team } = useProjects();
    const { getTasksByProject, getTaskStats } = useTasks();
    const { showToast } = useNotifications();

    const [activeTab, setActiveTab] = useState('kanban');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const project = getProject(projectId);
    const tasks = getTasksByProject(projectId);
    const stats = getTaskStats(projectId);
    const progress = calculateProgress(tasks);

    const projectMembers = project?.teamIds
        .map(id => team.find(m => m.id === id))
        .filter(Boolean) || [];

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <h2 className="text-xl font-semibold text-white mb-2">Project not found</h2>
                <p className="text-slate-400 mb-4">The project you're looking for doesn't exist.</p>
                <Link to="/projects">
                    <Button variant="secondary" icon={ArrowLeft}>
                        Back to Projects
                    </Button>
                </Link>
            </div>
        );
    }

    const handleUpdateProject = (formData) => {
        updateProject(project.id, formData);
        showToast('Project updated successfully', 'success');
        setIsEditModalOpen(false);
    };

    const handleDeleteProject = () => {
        if (confirm('Are you sure you want to delete this project? All tasks will be lost.')) {
            deleteProject(project.id);
            showToast('Project deleted', 'info');
            navigate('/projects');
        }
    };

    const tabs = [
        { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
        { id: 'list', label: 'List', icon: List },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigate('/projects')}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: project.color }}
                            />
                            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                        </div>
                        <p className="text-slate-400 max-w-2xl">{project.description}</p>
                    </div>
                </div>

                <Dropdown
                    align="right"
                    trigger={
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    }
                >
                    {(close) => (
                        <>
                            <DropdownItem
                                icon={Edit}
                                onClick={() => {
                                    setIsEditModalOpen(true);
                                    close();
                                }}
                            >
                                Edit Project
                            </DropdownItem>
                            <DropdownItem icon={UserPlus}>
                                Add Members
                            </DropdownItem>
                            <DropdownItem icon={Settings}>
                                Settings
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem
                                icon={Trash2}
                                danger
                                onClick={() => {
                                    handleDeleteProject();
                                    close();
                                }}
                            >
                                Delete Project
                            </DropdownItem>
                        </>
                    )}
                </Dropdown>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <div>
                        <span className="text-slate-400">Tasks</span>
                        <p className="text-white font-semibold">{stats.total}</p>
                    </div>
                    <div>
                        <span className="text-slate-400">Completed</span>
                        <p className="text-emerald-400 font-semibold">{stats.done}</p>
                    </div>
                    <div>
                        <span className="text-slate-400">In Progress</span>
                        <p className="text-blue-400 font-semibold">{stats.inProgress}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Team:</span>
                    <div className="flex -space-x-2">
                        {projectMembers.slice(0, 5).map(member => (
                            <Avatar
                                key={member.id}
                                name={member.name}
                                size="sm"
                                className="border-2 border-slate-800"
                            />
                        ))}
                        {projectMembers.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs text-slate-300">
                                +{projectMembers.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-px">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium
              border-b-2 -mb-px transition-colors
              ${activeTab === tab.id
                                ? 'border-indigo-500 text-white'
                                : 'border-transparent text-slate-400 hover:text-white'
                            }
            `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'kanban' && (
                <KanbanBoard projectId={projectId} />
            )}

            {activeTab === 'list' && (
                <div className="text-center py-12 text-slate-400">
                    List view coming soon...
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="text-center py-12 text-slate-400">
                    Calendar view coming soon...
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Project"
            >
                <ProjectForm
                    project={project}
                    onSubmit={handleUpdateProject}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            {/* Group Chat Panel */}
            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                projectId={projectId}
                projectName={project.name}
                teamMembers={projectMembers}
            />

            {/* Chat Floating Button */}
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all hover:scale-110 z-30"
                title="Open team chat"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        </div>
    );
};

export default ProjectDetailPage;

