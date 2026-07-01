'use client';

import { useRef, useState } from 'react';
import {
    Camera,
    Check,
    Copy,
    Mail,
    Save,
    Send,
    UserPlus,
    Users,
} from 'lucide-react';
import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';
import { useNotifications } from '@/context/NotificationContext';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import PageHero from '@/components/workspace/PageHero';
import { ROLE_CONFIG } from '@/utils/constants';

function SectionTitle({ eyebrow, title, description }) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                {title}
            </h2>
            {description && (
                <p className="mt-1 text-sm text-slate-400">
                    {description}
                </p>
            )}
        </div>
    );
}

function getAvailability(openTasks) {
    if (openTasks >= 6) {
        return { label: 'At Capacity', variant: 'danger', percent: 95 };
    }

    if (openTasks >= 3) {
        return { label: 'Focused', variant: 'warning', percent: 65 };
    }

    return { label: 'Available', variant: 'success', percent: 35 };
}

export default function TeamPage() {
    const { team, updateTeamMember } = useProjects();
    const { tasks } = useTasks();
    const { showToast } = useNotifications();

    const [copied, setCopied] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [avatarMember, setAvatarMember] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);

    const avatarInputRef = useRef(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const teamRows = team.map((member) => {
        const openTasks = tasks.filter((task) => task.assigneeId === member.id && task.status !== 'done');
        const completedTasks = tasks.filter((task) => task.assigneeId === member.id && task.status === 'done');
        const availability = getAvailability(openTasks.length);

        return {
            ...member,
            openTaskCount: openTasks.length,
            completedTaskCount: completedTasks.length,
            availability,
        };
    }).sort((left, right) => right.openTaskCount - left.openTaskCount);

    const availableNow = teamRows.filter((member) => member.availability.label === 'Available').length;
    const focusedNow = teamRows.filter((member) => member.availability.label === 'Focused').length;
    const atCapacity = teamRows.filter((member) => member.availability.label === 'At Capacity').length;

    const handleCopyInviteLink = async () => {
        const inviteLink = `${window.location.origin}/invite`;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            showToast('Invite link copied to clipboard', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showToast('Failed to copy invite link', 'error');
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
        if (!selectedMember) {
            return;
        }

        window.location.href = `mailto:${selectedMember.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        showToast(`Opening email to ${selectedMember.name}`, 'success');
        closeEmailModal();
    };

    const openAvatarModal = (member) => {
        setAvatarMember(member);
        setAvatarPreview(member.avatar || null);
    };

    const closeAvatarModal = () => {
        setAvatarMember(null);
        setAvatarPreview(null);
    };

    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showToast('Image must be less than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setAvatarPreview(loadEvent.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveAvatar = async () => {
        if (!avatarMember || !avatarPreview) {
            return;
        }

        setIsSavingAvatar(true);

        try {
            await updateTeamMember(avatarMember.id, { avatar: avatarPreview });
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
            <PageHero
                eyebrow="Team"
                title="See who is available, focused, and nearing capacity"
                description="A directory and workload surface built to support quick staffing conversations and faster unblock decisions."
                tone="emerald"
                actions={(
                    <Button icon={copied ? Check : UserPlus} onClick={handleCopyInviteLink}>
                        {copied ? 'Link Copied' : 'Copy Invite Link'}
                    </Button>
                )}
                meta={[
                    { label: 'Members', value: `${teamRows.length}`, hint: 'Visible workspace teammates' },
                    { label: 'Available', value: `${availableNow}`, hint: 'Low active workload' },
                    { label: 'Focused', value: `${focusedNow}`, hint: 'Healthy task concentration' },
                    { label: 'At Capacity', value: `${atCapacity}`, hint: 'May need relief or reprioritization' },
                ]}
            />

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Directory"
                        title="Team members"
                        description="Role, availability, and workload details stay visible inside each member card."
                    />
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {teamRows.map((member) => (
                            <div key={member.id} className="rounded-3xl border border-slate-800 bg-slate-800/40 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <Avatar name={member.name} src={member.avatar} size="lg" />
                                        <button
                                            type="button"
                                            onClick={() => openAvatarModal(member)}
                                            className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-600"
                                            title="Change avatar"
                                        >
                                            <Camera className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-base font-semibold text-white">{member.name}</p>
                                        <p className="truncate text-sm text-slate-400">{member.email}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Badge
                                                size="sm"
                                                color={ROLE_CONFIG[member.role]?.color}
                                            >
                                                {ROLE_CONFIG[member.role]?.label || member.role}
                                            </Badge>
                                            <Badge variant={member.availability.variant} size="sm">
                                                {member.availability.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Open Tasks</p>
                                        <p className="mt-2 text-2xl font-semibold text-white">{member.openTaskCount}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Completed</p>
                                        <p className="mt-2 text-2xl font-semibold text-white">{member.completedTaskCount}</p>
                                    </div>
                                </div>

                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                                        style={{ width: `${member.availability.percent}%` }}
                                    />
                                </div>

                                <div className="mt-5 flex gap-2">
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
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-5">
                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Workload"
                            title="Capacity overview"
                            description="Use this view to spot who can take on work and who needs help."
                        />
                        <div className="mt-5 space-y-3">
                            {teamRows.map((member) => (
                                <div key={member.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{member.name}</p>
                                            <p className="mt-1 text-sm text-slate-400">{member.availability.label}</p>
                                        </div>
                                        <Badge variant={member.availability.variant} size="md">
                                            {member.openTaskCount} open
                                        </Badge>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                                            style={{ width: `${member.availability.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Operating Notes"
                            title="Suggested team rituals"
                            description="A lightweight rhythm that keeps workload and context visible."
                        />
                        <div className="mt-5 space-y-3">
                            {[
                                'Review availability before assigning urgent work so the same people do not become bottlenecks.',
                                'Use direct notes or quick email only after the task owner and next action are clear.',
                                'Refresh profile avatars and role data so team cards stay legible across the workspace.',
                            ].map((item) => (
                                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-sm leading-6 text-slate-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

            <Modal
                isOpen={!!selectedMember}
                onClose={closeEmailModal}
                title={`Send Email to ${selectedMember?.name || ''}`}
            >
                {selectedMember && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                            <Avatar name={selectedMember.name} src={selectedMember.avatar} size="md" />
                            <div>
                                <p className="font-semibold text-white">{selectedMember.name}</p>
                                <p className="text-sm text-slate-400">{selectedMember.email}</p>
                            </div>
                        </div>

                        <Input
                            label="Subject"
                            type="text"
                            placeholder="Enter email subject..."
                            value={emailSubject}
                            onChange={(event) => setEmailSubject(event.target.value)}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Message
                            </label>
                            <textarea
                                className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                                rows={6}
                                placeholder="Write your message here..."
                                value={emailBody}
                                onChange={(event) => setEmailBody(event.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="ghost" className="flex-1" onClick={closeEmailModal}>
                                Cancel
                            </Button>
                            <Button variant="primary" icon={Send} className="flex-1" onClick={handleSendEmail}>
                                Send Email
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!avatarMember}
                onClose={closeAvatarModal}
                title={`Change Avatar for ${avatarMember?.name || ''}`}
            >
                {avatarMember && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <Avatar name={avatarMember.name} src={avatarPreview} size="xl" />
                            <p className="text-sm text-slate-400">{avatarMember.name}</p>
                        </div>

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

                        <div className="flex gap-3 pt-2">
                            <Button variant="ghost" className="flex-1" onClick={closeAvatarModal}>
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
}
