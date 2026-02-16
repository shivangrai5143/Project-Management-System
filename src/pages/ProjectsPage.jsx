import { useState } from 'react';
import { Plus, Grid, List, Search } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import { useNotifications } from '../context/NotificationContext';

const ProjectsPage = () => {
    const { projects, createProject, updateProject, deleteProject } = useProjects();
    const { user } = useAuth();
    const { showToast } = useNotifications();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateProject = (formData) => {
        createProject({
            ...formData,
            ownerId: user.id,
            teamIds: [user.id],
        });
        showToast('Project created successfully', 'success');
        setIsModalOpen(false);
    };

    const handleUpdateProject = (formData) => {
        updateProject(editingProject.id, formData);
        showToast('Project updated successfully', 'success');
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleDeleteProject = (projectId) => {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            deleteProject(projectId);
            showToast('Project deleted', 'info');
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projects</h1>
                    <p className="text-slate-400 mt-1">
                        {projects.length} projects total
                    </p>
                </div>
                <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
                    New Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 max-w-md">
                    <Input
                        icon={Search}
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`
              p-2 rounded-lg transition-colors
              ${viewMode === 'grid'
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }
            `}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`
              p-2 rounded-lg transition-colors
              ${viewMode === 'list'
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }
            `}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Projects grid */}
            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <Grid className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
                    <p className="text-slate-400 mb-4">
                        {searchQuery ? 'Try a different search term' : 'Get started by creating your first project'}
                    </p>
                    {!searchQuery && (
                        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
                            Create Project
                        </Button>
                    )}
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-4'
                }>
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={handleEdit}
                            onDelete={handleDeleteProject}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                }}
                title={editingProject ? 'Edit Project' : 'Create New Project'}
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
};

export default ProjectsPage;
