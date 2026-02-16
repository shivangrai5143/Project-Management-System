import { useState, useEffect, useRef } from 'react';
import {
    Bot,
    X,
    Sparkles,
    AlertTriangle,
    TrendingUp,
    ListChecks,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Plus,
    Clock,
    Target,
    Users,
    CheckCircle2,
    Calendar,
    List,
    CheckSquare,
    Circle,
    MessageCircle,
    Send,
    Pen
} from 'lucide-react';
import { useAIAgent } from '../../context/AIAgentContext';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate, isOverdue, isDueSoon } from '../../utils/helpers';
import Whiteboard from '../whiteboard/Whiteboard';

// Lists Tab Component
const ListsTabContent = ({ projects, selectedProject, setSelectedProject }) => {
    const { tasks } = useTasks();

    const projectTasks = selectedProject
        ? tasks.filter(t => t.projectId === selectedProject)
        : tasks;

    const groupedTasks = {
        todo: projectTasks.filter(t => t.status === 'todo'),
        'in-progress': projectTasks.filter(t => t.status === 'in-progress'),
        review: projectTasks.filter(t => t.status === 'review'),
        done: projectTasks.filter(t => t.status === 'done')
    };

    const statusConfig = {
        todo: { label: 'To Do', color: 'text-slate-400', bg: 'bg-slate-500/20' },
        'in-progress': { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/20' },
        review: { label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-500/20' },
        done: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
    };

    return (
        <div className="space-y-4">
            {/* Project filter */}
            <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="">All projects</option>
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            {/* Task Lists */}
            <div className="space-y-4">
                {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                    <div key={status} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                        <div className={`flex items-center justify-between p-3 ${statusConfig[status].bg}`}>
                            <span className={`font-medium ${statusConfig[status].color}`}>
                                {statusConfig[status].label}
                            </span>
                            <Badge variant="secondary" size="sm">{statusTasks.length}</Badge>
                        </div>
                        {statusTasks.length > 0 ? (
                            <div className="divide-y divide-slate-700/50 max-h-40 overflow-y-auto">
                                {statusTasks.map(task => (
                                    <div key={task.id} className="p-3 flex items-center gap-3">
                                        {status === 'done' ? (
                                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${status === 'done' ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                {task.title}
                                            </p>
                                            {task.dueDate && (
                                                <p className={`text-xs mt-0.5 ${isOverdue(task.dueDate) && status !== 'done' ? 'text-red-400' :
                                                    isDueSoon(task.dueDate) && status !== 'done' ? 'text-amber-400' :
                                                        'text-slate-500'
                                                    }`}>
                                                    Due {formatDate(task.dueDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="p-3 text-sm text-slate-500">No tasks</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Calendar Tab Component
const CalendarTabContent = ({ projects, selectedProject, setSelectedProject }) => {
    const { tasks } = useTasks();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const projectTasks = selectedProject
        ? tasks.filter(t => t.projectId === selectedProject)
        : tasks;

    // Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add padding for days before first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add all days in month
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
        return projectTasks.filter(t => {
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

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
        <div className="space-y-4">
            {/* Project filter */}
            <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="">All projects</option>
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-slate-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center text-xs font-medium text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                    {days.map((day, i) => {
                        const dayTasks = getTasksForDay(day);
                        const hasOverdue = dayTasks.some(t => isOverdue(t.dueDate) && t.status !== 'done');

                        return (
                            <div
                                key={i}
                                className={`min-h-[60px] p-1 border-b border-r border-slate-700/50 ${day ? 'bg-slate-800/30' : 'bg-slate-900/50'
                                    } ${isToday(day) ? 'bg-indigo-500/10' : ''}`}
                            >
                                {day && (
                                    <>
                                        <div className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-indigo-400' : 'text-slate-400'
                                            }`}>
                                            {day.getDate()}
                                        </div>
                                        {dayTasks.length > 0 && (
                                            <div className="space-y-0.5">
                                                {dayTasks.slice(0, 2).map(task => (
                                                    <div
                                                        key={task.id}
                                                        className={`text-xs px-1 py-0.5 rounded truncate ${task.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            hasOverdue ? 'bg-red-500/20 text-red-400' :
                                                                'bg-indigo-500/20 text-indigo-400'
                                                            }`}
                                                        title={task.title}
                                                    >
                                                        {task.title}
                                                    </div>
                                                ))}
                                                {dayTasks.length > 2 && (
                                                    <div className="text-xs text-slate-500 px-1">
                                                        +{dayTasks.length - 2} more
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
        </div>
    );
};

// Chat Tab Component
const ChatTabContent = ({ projects, selectedProject, setSelectedProject }) => {
    const { getMessagesByProject, sendMessage } = useChat();
    const { user } = useAuth();
    const { tasks } = useTasks();
    const { getRisks, getProjectAnalysis } = useAIAgent();
    const messagesEndRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const [isAITyping, setIsAITyping] = useState(false);

    const messages = selectedProject ? getMessagesByProject(selectedProject) : [];
    const currentProject = projects.find(p => p.id === selectedProject);
    const teamMembers = currentProject?.teamMembers || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAITyping]);

    // AI Response Generator
    const generateAIResponse = (userMessage) => {
        const msg = userMessage.toLowerCase();
        const projectTasks = tasks.filter(t => t.projectId === selectedProject);
        const todoTasks = projectTasks.filter(t => t.status === 'todo');
        const inProgressTasks = projectTasks.filter(t => t.status === 'in-progress');
        const doneTasks = projectTasks.filter(t => t.status === 'done');
        const risks = getRisks();
        const projectRisks = risks.filter(r => r.items?.some(i => projectTasks.find(t => t.id === i.id)));

        // Greeting responses
        if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/i)) {
            const greetings = [
                `Hello! 👋 I'm ERA, your AI project assistant. How can I help you with ${currentProject?.name || 'your project'} today?`,
                `Hey there! Ready to help you with ${currentProject?.name || 'your project'}. Ask me about tasks, progress, or team status!`,
                `Hi! I'm here to help. You can ask me about project status, tasks, risks, or team workload.`
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // Project status
        if (msg.match(/status|how.*going|overview|summary/i)) {
            const completionRate = projectTasks.length > 0
                ? Math.round((doneTasks.length / projectTasks.length) * 100)
                : 0;
            return `📊 **${currentProject?.name || 'Project'} Status:**\n\n` +
                `• **Progress:** ${completionRate}% complete\n` +
                `• **To Do:** ${todoTasks.length} tasks\n` +
                `• **In Progress:** ${inProgressTasks.length} tasks\n` +
                `• **Completed:** ${doneTasks.length} tasks\n\n` +
                (completionRate >= 80 ? `🎉 Great progress! Almost there!` :
                    completionRate >= 50 ? `👍 Good momentum! Keep it up!` :
                        `💪 Let's push forward! Focus on high-priority items.`);
        }

        // Tasks queries
        if (msg.match(/task|todo|what.*do|pending|remaining/i)) {
            if (todoTasks.length === 0 && inProgressTasks.length === 0) {
                return `✅ Amazing! All tasks are complete for ${currentProject?.name || 'this project'}!`;
            }
            let response = `📋 **Current Tasks:**\n\n`;
            if (inProgressTasks.length > 0) {
                response += `**In Progress:**\n`;
                inProgressTasks.slice(0, 3).forEach(t => {
                    response += `• ${t.title}\n`;
                });
                if (inProgressTasks.length > 3) response += `  ...and ${inProgressTasks.length - 3} more\n`;
                response += `\n`;
            }
            if (todoTasks.length > 0) {
                response += `**To Do:**\n`;
                todoTasks.slice(0, 3).forEach(t => {
                    response += `• ${t.title}\n`;
                });
                if (todoTasks.length > 3) response += `  ...and ${todoTasks.length - 3} more\n`;
            }
            return response;
        }

        // Risk queries
        if (msg.match(/risk|issue|problem|blocke|concern|overdue/i)) {
            if (risks.length === 0) {
                return `✅ **All Clear!** No major risks detected for your projects. Keep up the great work!`;
            }
            let response = `⚠️ **Current Risks:**\n\n`;
            risks.slice(0, 3).forEach(r => {
                const emoji = r.severity === 'high' ? '🔴' : r.severity === 'medium' ? '🟡' : '🔵';
                response += `${emoji} **${r.title}**\n   ${r.description}\n\n`;
            });
            if (risks.length > 3) {
                response += `...and ${risks.length - 3} more risks. Check the Risks tab for details.`;
            }
            return response;
        }

        // Progress queries
        if (msg.match(/progress|complete|done|finish/i)) {
            const completionRate = projectTasks.length > 0
                ? Math.round((doneTasks.length / projectTasks.length) * 100)
                : 0;
            return `📈 **Progress Report:**\n\n` +
                `${currentProject?.name || 'Project'} is **${completionRate}%** complete!\n\n` +
                `• ✅ ${doneTasks.length} tasks completed\n` +
                `• 🔄 ${inProgressTasks.length} tasks in progress\n` +
                `• 📝 ${todoTasks.length} tasks remaining`;
        }

        // Team queries
        if (msg.match(/team|member|who|assign/i)) {
            if (!teamMembers || teamMembers.length === 0) {
                return `👥 No team members assigned to this project yet. Add team members in the project settings!`;
            }
            let response = `👥 **Team Members (${teamMembers.length}):**\n\n`;
            teamMembers.slice(0, 5).forEach(m => {
                const memberName = m.name || m;
                const memberTasks = projectTasks.filter(t => t.assigneeId === (m.id || m));
                response += `• ${memberName} - ${memberTasks.length} tasks\n`;
            });
            if (teamMembers.length > 5) {
                response += `...and ${teamMembers.length - 5} more members`;
            }
            return response;
        }

        // Help
        if (msg.match(/help|what can you|how.*use|command/i)) {
            return `🤖 **I'm ERA, your AI Project Assistant!**\n\n` +
                `Here's what I can help you with:\n\n` +
                `📊 **"What's the status?"** - Get project overview\n` +
                `📋 **"Show tasks"** - See current tasks\n` +
                `⚠️ **"Any risks?"** - Check for issues\n` +
                `📈 **"How's progress?"** - View completion stats\n` +
                `👥 **"Who's on the team?"** - See team members\n\n` +
                `Just type naturally - I'll understand! 💬`;
        }

        // Thank you
        if (msg.match(/thank|thanks|appreciate/i)) {
            const responses = [
                `You're welcome! 😊 Let me know if you need anything else!`,
                `Happy to help! Feel free to ask me anytime! 🚀`,
                `Anytime! I'm here to make your project management easier! 💪`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // Default response
        const defaultResponses = [
            `I can help you with project status, tasks, risks, progress, and team info. Try asking "What's the status?" or "Show me the tasks"! 🤖`,
            `Not sure I understood that. You can ask me about:\n• Project status\n• Current tasks\n• Risks and issues\n• Team workload\n\nHow can I help?`,
            `I'm ERA, your project assistant! Try asking about your project's status, tasks, or team. Type "help" for more options! 💡`
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };

    const handleSendMessage = () => {
        if (inputValue.trim() && user && selectedProject) {
            const userMsg = inputValue.trim();
            sendMessage(selectedProject, user.id, user.name, userMsg);
            setInputValue('');

            // Trigger AI response after a short delay
            setIsAITyping(true);
            setTimeout(() => {
                const aiResponse = generateAIResponse(userMsg);
                sendMessage(selectedProject, 'era-ai', 'ERA ⚡', aiResponse);
                setIsAITyping(false);
            }, 1000 + Math.random() * 1000); // 1-2 second delay for natural feel
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateHeader = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 180px)' }}>
            {/* Project filter */}
            <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            >
                <option value="">Select a project...</option>
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            {!selectedProject ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">Select a project to start chatting</p>
                    <p className="text-slate-500 text-xs mt-1">Chat with your team members in real-time</p>
                </div>
            ) : (
                <>
                    {/* Team Members */}
                    <div className="px-2 py-3 border-b border-slate-700/50 flex items-center gap-2 mb-3">
                        <span className="text-xs text-slate-400">Team:</span>
                        <div className="flex -space-x-2">
                            {teamMembers?.slice(0, 6).map(member => (
                                <Avatar
                                    key={member.id || member}
                                    name={member.name || member}
                                    size="xs"
                                    className="border-2 border-slate-900"
                                />
                            ))}
                            {teamMembers?.length > 6 && (
                                <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-300">
                                    +{teamMembers.length - 6}
                                </div>
                            )}
                        </div>
                        {teamMembers?.length === 0 && (
                            <span className="text-xs text-slate-500">No team members</span>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 text-slate-500" />
                                </div>
                                <p className="text-slate-400 text-sm">No messages yet</p>
                                <p className="text-slate-500 text-xs mt-1">Start the conversation with your team!</p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const isOwnMessage = user?.id === message.userId;
                                const isAIMessage = message.userId === 'era-ai';
                                const showDateHeader = index === 0 ||
                                    new Date(message.createdAt).toDateString() !==
                                    new Date(messages[index - 1].createdAt).toDateString();

                                // Format message content with basic markdown
                                const formatContent = (content) => {
                                    // Convert **bold** to <strong>
                                    return content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    });
                                };

                                return (
                                    <div key={message.id}>
                                        {showDateHeader && (
                                            <div className="flex items-center justify-center my-3">
                                                <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                                                    {formatDateHeader(message.createdAt)}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                                {!isOwnMessage && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {isAIMessage ? (
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                                <Bot className="w-3 h-3 text-white" />
                                                            </div>
                                                        ) : (
                                                            <Avatar name={message.userName} size="xs" />
                                                        )}
                                                        <span className={`text-xs ${isAIMessage ? 'text-indigo-400 font-medium' : 'text-slate-400'}`}>
                                                            {message.userName}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`px-3 py-2 rounded-2xl ${isOwnMessage
                                                        ? 'bg-indigo-500 text-white rounded-br-md'
                                                        : isAIMessage
                                                            ? 'bg-gradient-to-br from-slate-800 to-slate-800/80 text-slate-100 rounded-bl-md border border-indigo-500/20'
                                                            : 'bg-slate-800 text-slate-100 rounded-bl-md'
                                                        }`}
                                                >
                                                    <p className="text-sm break-words whitespace-pre-line">{formatContent(message.content)}</p>
                                                </div>
                                                <p className={`text-xs text-slate-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                                    {formatTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {/* AI Typing Indicator */}
                        {isAITyping && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <Bot className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs text-slate-400">ERA ⚡</span>
                                    </div>
                                    <div className="px-3 py-2 rounded-2xl bg-slate-800 text-slate-100 rounded-bl-md">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="mt-4 flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


const AIAgentPanel = () => {
    const { isPanelOpen, closePanel, activeProjectId, getTrends, getRisks, getProjectPlanSuggestions, getProjectAnalysis } = useAIAgent();
    const { projects } = useProjects();
    const { createTask } = useTasks();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('insights');
    const [selectedProject, setSelectedProject] = useState(activeProjectId || '');
    const [expandedPhases, setExpandedPhases] = useState({});
    const [addingTask, setAddingTask] = useState(null);

    useEffect(() => {
        if (activeProjectId) {
            setSelectedProject(activeProjectId);
        }
    }, [activeProjectId]);

    if (!isPanelOpen) return null;

    const trends = getTrends();
    const risks = getRisks();
    const suggestions = selectedProject ? getProjectPlanSuggestions(selectedProject) : [];
    const projectAnalysis = selectedProject ? getProjectAnalysis(selectedProject) : null;

    const togglePhase = (phase) => {
        setExpandedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
    };

    const handleAddTask = async (task, projectId) => {
        if (!projectId) return;

        setAddingTask(task.title);

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + task.estimatedDays);

        await createTask({
            title: task.title,
            description: `AI-suggested task`,
            projectId,
            status: 'todo',
            priority: task.priority,
            dueDate: dueDate.toISOString(),
            assigneeId: user?.id
        }, user?.id, user?.name);

        setAddingTask(null);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'bg-red-500/20 border-red-500/40 text-red-400';
            case 'medium': return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
            case 'low': return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
            default: return 'bg-slate-500/20 border-slate-500/40 text-slate-400';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={closePanel}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">ERA ⚡</h2>
                            <p className="text-xs text-slate-400">Project insights & suggestions</p>
                        </div>
                    </div>
                    <button
                        onClick={closePanel}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 overflow-x-auto">
                    {[
                        { id: 'insights', label: 'Insights', icon: Sparkles },
                        { id: 'risks', label: 'Risks', icon: AlertTriangle },
                        { id: 'planner', label: 'Planner', icon: ListChecks },
                        { id: 'lists', label: 'Lists', icon: List },
                        { id: 'calendar', label: 'Calendar', icon: Calendar },
                        { id: 'chat', label: 'Chat', icon: MessageCircle },
                        { id: 'whiteboard', label: 'Board', icon: Pen },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 flex-shrink-0" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Insights Tab */}
                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            {/* Velocity */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-medium text-white">Team Velocity</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 rounded-lg bg-slate-700/50">
                                        <p className="text-2xl font-bold text-white">{trends.velocity.thisWeek}</p>
                                        <p className="text-xs text-slate-400">This week</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-slate-700/50">
                                        <p className="text-2xl font-bold text-white">{trends.velocity.lastWeek}</p>
                                        <p className="text-xs text-slate-400">Last week</p>
                                    </div>
                                </div>
                                <div className={`mt-3 p-2 rounded-lg text-center text-sm ${trends.velocity.trend === 'increasing' ? 'bg-emerald-500/20 text-emerald-400' :
                                    trends.velocity.trend === 'decreasing' ? 'bg-red-500/20 text-red-400' :
                                        'bg-slate-700/50 text-slate-400'
                                    }`}>
                                    {trends.velocity.trend === 'increasing' && '📈 Velocity is up!'}
                                    {trends.velocity.trend === 'decreasing' && '📉 Velocity decreased'}
                                    {trends.velocity.trend === 'stable' && '➡️ Velocity is stable'}
                                </div>
                            </div>

                            {/* Completion Rate */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-5 h-5 text-emerald-400" />
                                    <h3 className="font-medium text-white">Completion Rate</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-20 h-20 transform -rotate-90">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="32"
                                                fill="none"
                                                stroke="#334155"
                                                strokeWidth="8"
                                            />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="32"
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="8"
                                                strokeDasharray={`${trends.completionRate.rate * 2.01} 201`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">{trends.completionRate.rate}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-300">
                                            <span className="font-semibold text-white">{trends.completionRate.completed}</span> of{' '}
                                            <span className="font-semibold text-white">{trends.completionRate.total}</span> tasks complete
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Avg time to complete: {trends.avgTimeToComplete.days} days
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Busiest Days */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                    <h3 className="font-medium text-white">Most Productive Days</h3>
                                </div>
                                <div className="space-y-2">
                                    {trends.busiestDays.map((day, i) => (
                                        <div key={day.day} className="flex items-center gap-3">
                                            <span className="text-sm text-slate-400 w-24">{day.day}</span>
                                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                    style={{ width: `${(day.count / (trends.busiestDays[0]?.count || 1)) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-white w-8 text-right">{day.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Risks Tab */}
                    {activeTab === 'risks' && (
                        <div className="space-y-4">
                            {risks.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-white mb-1">All Clear!</h3>
                                    <p className="text-slate-400 text-sm">No potential risks detected in your projects.</p>
                                </div>
                            ) : (
                                risks.map((risk, i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-xl border ${getSeverityColor(risk.severity)}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">{risk.title}</h4>
                                                    <Badge
                                                        variant={risk.severity === 'high' ? 'danger' : risk.severity === 'medium' ? 'warning' : 'default'}
                                                        size="sm"
                                                    >
                                                        {risk.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm opacity-80 mb-2">{risk.description}</p>
                                                {risk.action && (
                                                    <p className="text-xs opacity-60">💡 {risk.action}</p>
                                                )}
                                                {risk.items && risk.items.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {risk.items.slice(0, 3).map(item => (
                                                            <div key={item.id} className="text-xs opacity-70 flex items-center gap-1">
                                                                <ChevronRight className="w-3 h-3" />
                                                                {item.title}
                                                            </div>
                                                        ))}
                                                        {risk.items.length > 3 && (
                                                            <p className="text-xs opacity-50">+{risk.items.length - 3} more</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Planner Tab */}
                    {activeTab === 'planner' && (
                        <div className="space-y-4">
                            {/* Project selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Select a project
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedProject && suggestions.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-400">
                                        Based on your project, here are suggested tasks:
                                    </p>

                                    {suggestions.map((phase, phaseIndex) => (
                                        <div key={phaseIndex} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                                            <button
                                                onClick={() => togglePhase(phase.phase)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 transition-colors"
                                            >
                                                <span className="font-medium text-white">{phase.phase}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" size="sm">{phase.tasks.length} tasks</Badge>
                                                    {expandedPhases[phase.phase] ? (
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {expandedPhases[phase.phase] && (
                                                <div className="border-t border-slate-700 divide-y divide-slate-700/50">
                                                    {phase.tasks.map((task, taskIndex) => (
                                                        <div key={taskIndex} className="p-3 flex items-center justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-white truncate">{task.title}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge
                                                                        variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}
                                                                        size="sm"
                                                                    >
                                                                        {task.priority}
                                                                    </Badge>
                                                                    <span className="text-xs text-slate-400">~{task.estimatedDays}d</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddTask(task, selectedProject)}
                                                                disabled={addingTask === task.title}
                                                                className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
                                                                title="Add this task"
                                                            >
                                                                {addingTask === task.title ? (
                                                                    <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                                                                ) : (
                                                                    <Plus className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedProject && suggestions.length === 0 && (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-white mb-1">Looking Good!</h3>
                                    <p className="text-slate-400 text-sm">
                                        This project already has comprehensive task coverage.
                                    </p>
                                </div>
                            )}

                            {!selectedProject && (
                                <div className="text-center py-8 text-slate-400">
                                    <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Select a project to get AI-generated task suggestions</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lists Tab */}
                    {activeTab === 'lists' && (
                        <ListsTabContent
                            projects={projects}
                            selectedProject={selectedProject}
                            setSelectedProject={setSelectedProject}
                        />
                    )}

                    {/* Calendar Tab */}
                    {activeTab === 'calendar' && (
                        <CalendarTabContent
                            projects={projects}
                            selectedProject={selectedProject}
                            setSelectedProject={setSelectedProject}
                        />
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                        <ChatTabContent
                            projects={projects}
                            selectedProject={selectedProject}
                            setSelectedProject={setSelectedProject}
                        />
                    )}

                    {/* Whiteboard Tab */}
                    {activeTab === 'whiteboard' && (
                        <div className="space-y-4">
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a project...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <Whiteboard projectId={selectedProject} />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default AIAgentPanel;
