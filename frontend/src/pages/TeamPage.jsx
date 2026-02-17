import { useState, useRef } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Mail, UserPlus, Copy, Check, Send, X, Camera, Save } from 'lucide-react';
import { ROLE_CONFIG } from '../utils/constants';
import { usersApi } from '../utils/api';

const TeamPage = () => {
    const { team, updateTeamMember } = useProjects();
    const { showToast } = useNotifications();
    const [copied, setCopied] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // Avatar editing state
    const [avatarMember, setAvatarMember] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);
    const avatarInputRef = useRef(null);

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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

    const openEmailModal = (member) => {
        setSelectedMember(member);
        setEmailSubject('');
        setEmailBody('');
    };

    const closeEmailModal = () => {
        setSelectedMember(null);
        setEmailSubject('');
        setEmailBody('');
    };

    const handleSendEmail = () => {
        if (!selectedMember) return;

        // Construct mailto link with subject and body
        const mailtoLink = `mailto:${selectedMember.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // Open default email client
        window.location.href = mailtoLink;

        showToast(`Opening email to ${selectedMember.name}`, 'success');
        closeEmailModal();
    };

    const handleQuickEmail = (member) => {
        // Quick email without modal - just opens email client
        window.location.href = `mailto:${member.email}`;
        showToast(`Opening email to ${member.name}`, 'success');
    };

    // Avatar editing functions
    const openAvatarModal = (member) => {
        setAvatarMember(member);
        setAvatarPreview(member.avatar || null);
    };

    const closeAvatarModal = () => {
        setAvatarMember(null);
        setAvatarPreview(null);
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showToast('Image must be less than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatarPreview(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveAvatar = async () => {
        if (!avatarMember || !avatarPreview) return;

        setIsSavingAvatar(true);
        try {
            // Update local team state (saves to localStorage)
            // API call is skipped for local development
            // When deployed to Vercel, you can add: await usersApi.updateAvatar(avatarMember.id, avatarPreview);
            if (updateTeamMember) {
                updateTeamMember(avatarMember.id, { avatar: avatarPreview });
            }

            showToast(`Avatar updated for ${avatarMember.name}`, 'success');
            closeAvatarModal();
        } catch (error) {
            showToast('Failed to update avatar', 'error');
        } finally {
            setIsSavingAvatar(false);
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
                            <div className="relative">
                                <Avatar name={member.name} src={member.avatar} size="lg" />
                                <button
                                    onClick={() => openAvatarModal(member)}
                                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition-colors shadow-lg"
                                    title="Change avatar"
                                >
                                    <Camera className="w-3 h-3" />
                                </button>
                            </div>

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
                                onClick={() => openEmailModal(member)}
                            >
                                Message
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Email Compose Modal */}
            <Modal
                isOpen={!!selectedMember}
                onClose={closeEmailModal}
                title={`Send Email to ${selectedMember?.name || ''}`}
            >
                {selectedMember && (
                    <div className="space-y-4">
                        {/* Recipient Info */}
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <Avatar name={selectedMember.name} size="md" />
                            <div>
                                <p className="font-medium text-white">{selectedMember.name}</p>
                                <p className="text-sm text-slate-400">{selectedMember.email}</p>
                            </div>
                        </div>

                        {/* Subject Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Subject
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter email subject..."
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                            />
                        </div>

                        {/* Message Body */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Message
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                rows={6}
                                placeholder="Write your message here..."
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={closeEmailModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                icon={Send}
                                className="flex-1"
                                onClick={handleSendEmail}
                            >
                                Send Email
                            </Button>
                        </div>

                        {/* Quick Send Option */}
                        <div className="pt-2 border-t border-slate-700/50">
                            <button
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                onClick={() => handleQuickEmail(selectedMember)}
                            >
                                Or click here to open email client directly →
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Avatar Edit Modal */}
            <Modal
                isOpen={!!avatarMember}
                onClose={closeAvatarModal}
                title={`Change Avatar for ${avatarMember?.name || ''}`}
            >
                {avatarMember && (
                    <div className="space-y-6">
                        {/* Avatar Preview */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <Avatar
                                    name={avatarMember.name}
                                    src={avatarPreview}
                                    size="xl"
                                />
                            </div>
                            <p className="text-sm text-slate-400">
                                {avatarMember.name}
                            </p>
                        </div>

                        {/* File Upload */}
                        <div className="flex flex-col items-center gap-3">
                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                icon={Camera}
                                onClick={() => avatarInputRef.current?.click()}
                            >
                                Choose Image
                            </Button>
                            <p className="text-xs text-slate-500">
                                Max file size: 2MB. Supported: JPG, PNG, WebP
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={closeAvatarModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                icon={Save}
                                className="flex-1"
                                onClick={handleSaveAvatar}
                                loading={isSavingAvatar}
                                disabled={!avatarPreview}
                            >
                                Save Avatar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TeamPage;
