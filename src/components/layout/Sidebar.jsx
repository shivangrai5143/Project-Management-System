import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles,
    Bot,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAIAgent } from '../../context/AIAgentContext';
import Avatar from '../ui/Avatar';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const { openPanel } = useAIAgent();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/projects', icon: FolderKanban, label: 'Projects' },
        { path: '/tasks', icon: CheckSquare, label: 'My Tasks' },
        { path: '/team', icon: Users, label: 'Team' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside
            className={`
        fixed left-0 top-0 h-screen z-40
        bg-slate-900 border-r border-slate-800
        flex flex-col
        transition-all duration-300 ease-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            YojnaFlow
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
            p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800
            transition-colors
            ${isCollapsed ? 'absolute -right-3 top-6 bg-slate-800 border border-slate-700 shadow-lg' : ''}
          `}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200
              ${isActive
                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }
              ${isCollapsed ? 'justify-center' : ''}
            `}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}

                {/* AI Assistant Button */}
                <button
                    onClick={() => openPanel()}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-200
                        bg-gradient-to-r from-indigo-500/10 to-purple-500/10
                        text-indigo-400 hover:text-white hover:from-indigo-500/20 hover:to-purple-500/20
                        border border-indigo-500/20 hover:border-indigo-500/40
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title="AI Assistant"
                >
                    <Bot className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">ERA ⚡</span>}
                </button>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-slate-800">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <Avatar name={user?.name} src={user?.avatar} size="md" />
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
