import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Bell,
    Moon,
    Sun,
    Menu,
    Plus,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import Button from '../ui/Button';
import { getRelativeTime } from '../../utils/helpers';

const Header = ({ onMenuClick, title }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { isDark, toggleTheme } = useTheme();
    const { notifications, markAsRead, getUnreadCount } = useNotifications();
    const navigate = useNavigate();
    const unreadCount = getUnreadCount();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="h-16 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            {/* Left section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {title && (
                    <h1 className="text-xl font-semibold text-white hidden md:block">{title}</h1>
                )}
            </div>

            {/* Center - Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects, tasks..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
            </form>

            {/* Right section */}
            <div className="flex items-center gap-2">
                <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    className="hidden sm:flex"
                    onClick={() => navigate('/projects/new')}
                >
                    New Project
                </Button>

                {/* Theme toggle */}
                <div className="relative group">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title={`${isDark ? 'Light' : 'Dark'} mode (Ctrl+D)`}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {isDark ? 'Light' : 'Dark'} mode <kbd className="ml-1 px-1 py-0.5 bg-slate-600 rounded text-[10px]">Ctrl+D</kbd>
                    </div>
                </div>

                {/* Notifications */}
                <Dropdown
                    align="right"
                    trigger={
                        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    }
                >
                    {(close) => (
                        <div className="w-80">
                            <div className="px-4 py-3 border-b border-slate-700">
                                <h3 className="font-semibold text-white">Notifications</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-slate-400">No notifications</p>
                                ) : (
                                    notifications.slice(0, 5).map(notif => (
                                        <button
                                            key={notif.id}
                                            onClick={() => {
                                                markAsRead(notif.id);
                                                close();
                                            }}
                                            className={`
                        w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors
                        ${!notif.read ? 'bg-indigo-500/10' : ''}
                      `}
                                        >
                                            <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                                            <p className="text-xs text-slate-500 mt-1">{getRelativeTime(notif.createdAt)}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="px-4 py-3 border-t border-slate-700">
                                    <button
                                        onClick={close}
                                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </Dropdown>
            </div>
        </header>
    );
};

export default Header;
