import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { User, Mail, Lock, Bell, Palette, Save } from 'lucide-react';

const SettingsPage = () => {
    const { user, updateProfile } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        updateProfile(formData);
        setIsSaving(false);
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
                        <Avatar name={user?.name} size="xl" />
                        <Button variant="outline" size="sm">
                            Change Avatar
                        </Button>
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
