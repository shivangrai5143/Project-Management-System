import { useNavigate } from 'react-router-dom';
import { MoreVertical, Users, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import ProgressBar from '../ui/ProgressBar';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { calculateProgress, formatDate } from '../../utils/helpers';

const ProjectCard = ({ project, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { getTasksByProject } = useTasks();
    const { team } = useProjects();

    const tasks = getTasksByProject(project.id);
    const progress = calculateProgress(tasks);
    const completedTasks = tasks.filter(t => t.status === 'done').length;

    const projectMembers = project.teamIds
        .map(id => team.find(m => m.id === id))
        .filter(Boolean)
        .slice(0, 4);

    return (
        <Card
            hover
            className="group"
            onClick={() => navigate(`/projects/${project.id}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                />
                <Dropdown
                    align="right"
                    trigger={
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-slate-700 transition-all"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    }
                >
                    {(close) => (
                        <>
                            <DropdownItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(project);
                                    close();
                                }}
                            >
                                Edit Project
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem
                                danger
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(project.id);
                                    close();
                                }}
                            >
                                Delete Project
                            </DropdownItem>
                        </>
                    )}
                </Dropdown>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {project.name}
            </h3>

            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {project.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{completedTasks}/{tasks.length} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.teamIds.length} members</span>
                </div>
            </div>

            <ProgressBar value={progress} className="mb-4" />

            <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                    {projectMembers.map((member) => (
                        <Avatar
                            key={member.id}
                            name={member.name}
                            size="sm"
                            className="border-2 border-slate-800"
                        />
                    ))}
                    {project.teamIds.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs text-slate-300">
                            +{project.teamIds.length - 4}
                        </div>
                    )}
                </div>

                <span className="text-xs text-slate-500">
                    Updated {formatDate(project.updatedAt)}
                </span>
            </div>
        </Card>
    );
};

export default ProjectCard;
