import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStandupBot } from '../context/StandupBotContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { User, Mail, Lock, Bell, Palette, Save, Bot, Clock, Github, Sparkles, Camera } from 'lucide-react';
import { connectGitHub, disconnectGitHub, isGitHubConnected, getGitHubUsername } from '../utils/githubSimulator';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const SettingsPage = () => {
    const { user, updateProfile } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { settings, updateSettings, triggerStandup } = useStandupBot();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarError, setAvatarError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [gitHubConnected, setGitHubConnected] = useState(isGitHubConnected());
    const [gitHubUsername, setGitHubUsername] = useState(getGitHubUsername());

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        setAvatarError(null);

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setAvatarError('Please select an image file (JPG, PNG, or WebP)');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setAvatarError('Image must be less than 2MB');
            return;
        }

        // Read file and create base64 preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatarPreview(event.target.result);
        };
        reader.onerror = () => {
            setAvatarError('Failed to read file. Please try again.');
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        updateProfile({ ...formData, avatar: avatarPreview });
        setIsSaving(false);
    };

    const handleGitHubToggle = () => {
        if (gitHubConnected) {
            disconnectGitHub();
            setGitHubConnected(false);
        } else {
            connectGitHub(gitHubUsername);
            setGitHubConnected(true);
        }
    };

    const handleTriggerDemo = () => {
        if (user) {
            triggerStandup(user.id, user.name, true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-white">Settings</h1>

            {/* Profile Section */}
            <Card padding="lg">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    Profile
                </h2>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar name={user?.name} src={avatarPreview} size="xl" />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            icon={Camera}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change Avatar
                        </Button>
                        {avatarError && (
                            <p className="text-xs text-red-400 text-center max-w-[150px]">
                                {avatarError}
                            </p>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <Input
                            label="Full Name"
                            icon={User}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            icon={Mail}
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Button icon={Save} loading={isSaving} onClick={handleSave}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Standup Bot */}
            <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Bot className="w-5 h-5 text-indigo-400" />
                        Standup Bot
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                    </h2>
                    <button
                        onClick={handleTriggerDemo}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors"
                    >
                        Demo Now
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Enable Daily Standup</p>
                            <p className="text-sm text-slate-400">Get reminded to share your daily update</p>
                        </div>
                        <button
                            onClick={() => updateSettings({ enabled: !settings.enabled })}
                            className={`
                                relative w-14 h-8 rounded-full transition-colors
                                ${settings.enabled ? 'bg-indigo-500' : 'bg-slate-600'}
                            `}
                        >
                            <div
                                className={`
                                    absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg
                                    transition-transform
                                    ${settings.enabled ? 'left-7' : 'left-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Standup Time */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Standup Time
                            </p>
                            <p className="text-sm text-slate-400">When should I ask for your update?</p>
                        </div>
                        <input
                            type="time"
                            value={settings.standupTime}
                            onChange={(e) => updateSettings({ standupTime: e.target.value })}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>

                    {/* Snooze Duration */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Snooze Duration</p>
                            <p className="text-sm text-slate-400">How long to wait before reminding again</p>
                        </div>
                        <select
                            value={settings.snoozeDuration}
                            onChange={(e) => updateSettings({ snoozeDuration: parseInt(e.target.value) })}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                        </select>
                    </div>

                    {/* Auto-suggest Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Smart Suggestions</p>
                            <p className="text-sm text-slate-400">Suggest updates based on your activity</p>
                        </div>
                        <button
                            onClick={() => updateSettings({ autoSuggest: !settings.autoSuggest })}
                            className={`
                                relative w-14 h-8 rounded-full transition-colors
                                ${settings.autoSuggest ? 'bg-indigo-500' : 'bg-slate-600'}
                            `}
                        >
                            <div
                                className={`
                                    absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg
                                    transition-transform
                                    ${settings.autoSuggest ? 'left-7' : 'left-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* GitHub Connection */}
                    <div className="pt-4 border-t border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-medium text-white flex items-center gap-2">
                                    <Github className="w-4 h-4 text-slate-400" />
                                    GitHub Integration
                                </p>
                                <p className="text-sm text-slate-400">
                                    {gitHubConnected
                                        ? `Connected as @${gitHubUsername} - fetching real activity`
                                        : 'Connect to include commit activity in your standups'}
                                </p>
                            </div>
                            <button
                                onClick={handleGitHubToggle}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${gitHubConnected
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                    }
                                `}
                            >
                                {gitHubConnected ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>

                        {!gitHubConnected && (
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    GitHub Username
                                </label>
                                <input
                                    type="text"
                                    value={gitHubUsername}
                                    onChange={(e) => setGitHubUsername(e.target.value)}
                                    placeholder="e.g., shivangrai5143"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-500"
                                />
                            </div>
                        )}

                        {gitHubConnected && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Live from GitHub API
                                </span>
                                <a
                                    href={`https://github.com/${gitHubUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    View Profile →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Appearance */}
            <Card padding="lg">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-400" />
                    Appearance
                </h2>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white">Dark Mode</p>
                        <p className="text-sm text-slate-400">Use dark theme across the app</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`
                            relative w-14 h-8 rounded-full transition-colors
                            ${isDark ? 'bg-indigo-500' : 'bg-slate-600'}
                        `}
                    >
                        <div
                            className={`
                                absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg
                                transition-transform
                                ${isDark ? 'left-7' : 'left-1'}
                            `}
                        />
                    </button>
                </div>
            </Card>

            {/* Notifications */}
            <Card padding="lg">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    Notifications
                </h2>

                <div className="space-y-4">
                    {[
                        { label: 'Task assignments', description: 'Get notified when assigned to a task' },
                        { label: 'Task due dates', description: 'Remind me of upcoming due dates' },
                        { label: 'Project updates', description: 'Updates on projects you\'re part of' },
                        { label: 'Team mentions', description: 'When someone mentions you' },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-white">{item.label}</p>
                                <p className="text-sm text-slate-400">{item.description}</p>
                            </div>
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                            />
                        </div>
                    ))}
                </div>
            </Card>

            {/* Security */}
            <Card padding="lg">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    Security
                </h2>

                <div className="space-y-4">
                    <Button variant="outline">
                        Change Password
                    </Button>
                    <Button variant="outline">
                        Two-Factor Authentication
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;

