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
    CheckSquare,
    Circle,
    ChevronLeft,
    ChevronRight,
    Clock,
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
import { calculateProgress, formatDate, isOverdue, isDueSoon, getRelativeTime } from '../utils/helpers';
import ChatPanel from '../components/chat/ChatPanel';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants';

// List View Component
const ListView = ({ tasks, team }) => {
    const [sortBy, setSortBy] = useState('status');
    const [filterStatus, setFilterStatus] = useState('all');

    const getAssignee = (assigneeId) => team.find(m => m.id === assigneeId);

    const filteredTasks = filterStatus === 'all'
        ? tasks
        : tasks.filter(t => t.status === filterStatus);

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'status') {
            const order = ['todo', 'in-progress', 'review', 'done'];
            return order.indexOf(a.status) - order.indexOf(b.status);
        }
        if (sortBy === 'priority') {
            const order = ['high', 'medium', 'low'];
            return order.indexOf(a.priority) - order.indexOf(b.priority);
        }
        if (sortBy === 'dueDate') {
            return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
        }
        return 0;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="status">Status</option>
                        <option value="priority">Priority</option>
                        <option value="dueDate">Due Date</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Filter:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Tasks</option>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="done">Completed</option>
                    </select>
                </div>
                <span className="text-sm text-slate-500">{sortedTasks.length} tasks</span>
            </div>

            {/* Task List */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-800 border-b border-slate-700 text-sm font-medium text-slate-400">
                    <div className="col-span-5">Task</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Priority</div>
                    <div className="col-span-2">Assignee</div>
                    <div className="col-span-1">Due</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-700/50">
                    {sortedTasks.length > 0 ? (
                        sortedTasks.map(task => {
                            const assignee = getAssignee(task.assigneeId);
                            const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
                            const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

                            return (
                                <div key={task.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-slate-700/30 transition-colors items-center">
                                    <div className="col-span-5 flex items-center gap-3">
                                        {task.status === 'done' ? (
                                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-white'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant={statusConfig.variant || 'default'} size="sm">
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant={priorityConfig.variant || 'default'} size="sm">
                                            {priorityConfig.label}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        {assignee ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar name={assignee.name} size="xs" />
                                                <span className="text-sm text-slate-300 truncate">{assignee.name.split(' ')[0]}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-500">Unassigned</span>
                                        )}
                                    </div>
                                    <div className="col-span-1">
                                        {task.dueDate ? (
                                            <span className={`text-xs ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-400' :
                                                    isDueSoon(task.dueDate) && task.status !== 'done' ? 'text-amber-400' :
                                                        'text-slate-400'
                                                }`}>
                                                {formatDate(task.dueDate)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500">—</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            No tasks found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Calendar View Component
const CalendarView = ({ tasks }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const getTasksForDay = (day) => {
        if (!day) return [];
        return tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            return dueDate.getDate() === day.getDate() &&
                dueDate.getMonth() === day.getMonth() &&
                dueDate.getFullYear() === day.getFullYear();
        });
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();
    };

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-semibold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-slate-700">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-slate-400 border-r border-slate-700/50 last:border-r-0">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.slice(0, 3)}</span>
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                    {days.map((day, i) => {
                        const dayTasks = getTasksForDay(day);

                        return (
                            <div
                                key={i}
                                className={`min-h-[100px] p-2 border-b border-r border-slate-700/50 last:border-r-0 ${day ? 'bg-slate-800/30' : 'bg-slate-900/30'
                                    } ${isToday(day) ? 'bg-indigo-500/10 ring-1 ring-indigo-500/30 ring-inset' : ''}`}
                            >
                                {day && (
                                    <>
                                        <div className={`text-sm font-medium mb-2 ${isToday(day) ? 'text-indigo-400' : 'text-slate-400'
                                            }`}>
                                            {day.getDate()}
                                        </div>
                                        {dayTasks.length > 0 && (
                                            <div className="space-y-1">
                                                {dayTasks.slice(0, 3).map(task => (
                                                    <div
                                                        key={task.id}
                                                        className={`text-xs px-2 py-1 rounded truncate ${task.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                isOverdue(task.dueDate) ? 'bg-red-500/20 text-red-400' :
                                                                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                                        'bg-indigo-500/20 text-indigo-400'
                                                            }`}
                                                        title={task.title}
                                                    >
                                                        {task.title}
                                                    </div>
                                                ))}
                                                {dayTasks.length > 3 && (
                                                    <div className="text-xs text-slate-500 px-2">
                                                        +{dayTasks.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-indigo-500/40" />
                    <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500/40" />
                    <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/40" />
                    <span>Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500/40" />
                    <span>Completed</span>
                </div>
            </div>
        </div>
    );
};

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
                <ListView tasks={tasks} team={team} />
            )}

            {activeTab === 'calendar' && (
                <CalendarView tasks={tasks} />
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

