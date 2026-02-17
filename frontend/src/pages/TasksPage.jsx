import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useProjects } from '../context/ProjectContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, Flag } from 'lucide-react';
import { formatDate, isOverdue, isDueSoon } from '../utils/helpers';
import { STATUS_CONFIG, PRIORITY_CONFIG, TASK_STATUSES } from '../utils/constants';

const TasksPage = () => {
    const { user } = useAuth();
    const { tasks } = useTasks();
    const { projects, getTeamMember } = useProjects();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    // Get user's tasks
    const myTasks = tasks.filter(task => task.assigneeId === user?.id);

    // Apply filters
    const filteredTasks = myTasks.filter(task => {
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (statusFilter && task.status !== statusFilter) {
            return false;
        }
        if (priorityFilter && task.priority !== priorityFilter) {
            return false;
        }
        return true;
    });

    const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
    }));

    const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
    }));

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.name || 'Unknown Project';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">My Tasks</h1>
                <p className="text-slate-400 mt-1">
                    {filteredTasks.length} tasks assigned to you
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 max-w-md">
                    <Input
                        icon={Search}
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <Select
                        placeholder="Status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-40"
                    />
                    <Select
                        placeholder="Priority"
                        options={priorityOptions}
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-40"
                    />
                </div>
            </div>

            {/* Tasks list */}
            {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <Filter className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                    <p className="text-slate-400">
                        {searchQuery || statusFilter || priorityFilter
                            ? 'Try different filters'
                            : "You don't have any tasks assigned yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map(task => {
                        const statusConfig = STATUS_CONFIG[task.status];
                        const priorityConfig = PRIORITY_CONFIG[task.priority];

                        return (
                            <Card key={task.id} className="hover:border-indigo-500/30 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    {/* Status indicator */}
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: statusConfig?.color }}
                                    />

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-white truncate">{task.title}</h3>
                                                <p className="text-sm text-slate-400 truncate">
                                                    {getProjectName(task.projectId)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Priority */}
                                                <Badge size="sm" className={priorityConfig?.bgColor}>
                                                    <Flag className={`w-3 h-3 mr-1 ${priorityConfig?.textColor}`} />
                                                    <span className={priorityConfig?.textColor}>{priorityConfig?.label}</span>
                                                </Badge>

                                                {/* Status */}
                                                <Badge size="sm" color={statusConfig?.color}>
                                                    {statusConfig?.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        {task.dueDate && (
                                            <div className={`
                        flex items-center gap-1 mt-2 text-xs
                        ${isOverdue(task.dueDate) ? 'text-red-400' : ''}
                        ${isDueSoon(task.dueDate) && !isOverdue(task.dueDate) ? 'text-amber-400' : ''}
                        ${!isOverdue(task.dueDate) && !isDueSoon(task.dueDate) ? 'text-slate-400' : ''}
                      `}>
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {isOverdue(task.dueDate) ? 'Overdue: ' : 'Due: '}
                                                    {formatDate(task.dueDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TasksPage;
