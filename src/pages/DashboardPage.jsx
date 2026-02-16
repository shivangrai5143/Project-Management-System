import { Link } from 'react-router-dom';
import {
    FolderKanban,
    CheckSquare,
    Clock,
    AlertTriangle,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { useTasks } from '../context/TaskContext';
import Card from '../components/ui/Card';
import StatsCard from '../components/dashboard/StatsCard';
import ProjectCard from '../components/projects/ProjectCard';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import AIInsightsCard from '../components/ai/AIInsightsCard';
import { getRelativeTime, isOverdue, isDueSoon, formatDate } from '../utils/helpers';
import { demoActivities } from '../data/mockData';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/constants';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const DashboardPage = () => {
    const { user } = useAuth();
    const { projects, getTeamMember } = useProjects();
    const { tasks, getTaskStats, getTasksByAssignee } = useTasks();

    const stats = getTaskStats();
    const myTasks = user ? getTasksByAssignee(user.id) : [];
    const overdueTasks = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done');
    const upcomingTasks = tasks.filter(t => isDueSoon(t.dueDate) && !isOverdue(t.dueDate) && t.status !== 'done');

    // Chart data - simulated weekly progress
    const chartData = [
        { name: 'Mon', completed: 4, created: 6 },
        { name: 'Tue', completed: 3, created: 4 },
        { name: 'Wed', completed: 5, created: 3 },
        { name: 'Thu', completed: 7, created: 5 },
        { name: 'Fri', completed: 6, created: 4 },
        { name: 'Sat', completed: 2, created: 1 },
        { name: 'Sun', completed: 1, created: 2 },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Here's what's happening with your projects today.
                    </p>
                </div>
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    View all projects
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Projects"
                    value={projects.length}
                    icon={FolderKanban}
                    iconColor="#667eea"
                    change="+2 this week"
                    changeType="positive"
                />
                <StatsCard
                    title="Total Tasks"
                    value={stats.total}
                    icon={CheckSquare}
                    iconColor="#10b981"
                    change={`${stats.done} completed`}
                    changeType="positive"
                />
                <StatsCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    iconColor="#f59e0b"
                />
                <StatsCard
                    title="Overdue"
                    value={stats.overdue}
                    icon={AlertTriangle}
                    iconColor="#ef4444"
                    changeType={stats.overdue > 0 ? 'negative' : 'neutral'}
                />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <Card className="lg:col-span-2" padding="default">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Task Activity</h2>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                <span className="text-slate-400">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-slate-400">Created</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#667eea"
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="created"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorCreated)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card padding="default">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {demoActivities.slice(0, 5).map(activity => {
                            const activityUser = getTeamMember(activity.userId);
                            return (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <Avatar name={activityUser?.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-300">
                                            <span className="font-medium text-white">{activityUser?.name}</span>{' '}
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {getRelativeTime(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIInsightsCard />
            </div>

            {/* Projects section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                    <Link
                        to="/projects"
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        View all
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.slice(0, 3).map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>

            {/* Upcoming & Overdue Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Due Soon */}
                <Card padding="default">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg font-semibold text-white">Due Soon</h2>
                    </div>
                    {upcomingTasks.length === 0 ? (
                        <p className="text-slate-400 text-sm">No tasks due soon</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingTasks.slice(0, 4).map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                        <p className="text-xs text-amber-400 mt-1">Due {formatDate(task.dueDate)}</p>
                                    </div>
                                    <Badge variant="warning" size="sm">{STATUS_CONFIG[task.status]?.label}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Overdue */}
                <Card padding="default">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h2 className="text-lg font-semibold text-white">Overdue</h2>
                    </div>
                    {overdueTasks.length === 0 ? (
                        <p className="text-slate-400 text-sm">No overdue tasks 🎉</p>
                    ) : (
                        <div className="space-y-3">
                            {overdueTasks.slice(0, 4).map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                        <p className="text-xs text-red-400 mt-1">Was due {formatDate(task.dueDate)}</p>
                                    </div>
                                    <Badge variant="danger" size="sm">{PRIORITY_CONFIG[task.priority]?.label}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
