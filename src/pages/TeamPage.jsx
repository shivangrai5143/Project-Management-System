import { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Mail, UserPlus, Copy, Check } from 'lucide-react';
import { ROLE_CONFIG } from '../utils/constants';

const TeamPage = () => {
    const { team } = useProjects();
    const { showToast } = useNotifications();
    const [copied, setCopied] = useState(false);

    const handleCopyInviteLink = async () => {
        const inviteLink = `${window.location.origin}/invite`;
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            showToast('Invite link copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Failed to copy link', 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Team</h1>
                    <p className="text-slate-400 mt-1">
                        {team.length} team members
                    </p>
                </div>
                <Button
                    icon={copied ? Check : UserPlus}
                    onClick={handleCopyInviteLink}
                >
                    {copied ? 'Link Copied!' : 'Copy Invite Link'}
                </Button>
            </div>

            {/* Team grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.map(member => (
                    <Card key={member.id} className="group" hover>
                        <div className="flex items-start gap-4">
                            <Avatar name={member.name} size="lg" />

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate">
                                    {member.name}
                                </h3>
                                <p className="text-sm text-slate-400 truncate">
                                    {member.email}
                                </p>
                                <Badge
                                    size="sm"
                                    color={ROLE_CONFIG[member.role]?.color}
                                    className="mt-2"
                                >
                                    {ROLE_CONFIG[member.role]?.label || member.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={Mail}
                                className="flex-1"
                            >
                                Message
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TeamPage;
