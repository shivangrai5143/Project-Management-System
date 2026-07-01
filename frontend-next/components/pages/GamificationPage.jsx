'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Award,
    BookOpen,
    Bug,
    CalendarDays,
    CheckCircle2,
    Crown,
    Flame,
    FolderKanban,
    Handshake,
    Medal,
    Rocket,
    Sparkles,
    Star,
    Target,
    Trophy,
    Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';
import { useStandupBot } from '@/context/StandupBotContext';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/workspace/EmptyState';
import PageHero from '@/components/workspace/PageHero';
import {
    XP_RULES,
    buildAchievementWorkspace,
    getLeaderboardDisplay,
} from '@/utils/gamification';
import { formatDate, getRelativeTime } from '@/utils/helpers';

const BADGE_ICONS = {
    'first-task-completed': CheckCircle2,
    'sprint-hero': Trophy,
    'streak-keeper': Flame,
    'bug-hunter': Bug,
    'documentation-expert': BookOpen,
    'team-player': Handshake,
    'fast-finisher': Zap,
    'project-champion': Crown,
    'goal-achiever': Target,
    'knowledge-contributor': Sparkles,
};

const TIMELINE_STYLES = {
    task: {
        icon: CheckCircle2,
        tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    project: {
        icon: Crown,
        tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    milestone: {
        icon: Target,
        tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    },
    badge: {
        icon: Award,
        tone: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
    },
    level: {
        icon: Rocket,
        tone: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    },
};

const RECOGNITION_STYLES = {
    'employee-of-sprint': {
        icon: Trophy,
        tone: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
    },
    'collaboration-award': {
        icon: Handshake,
        tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
    },
    'innovation-award': {
        icon: Sparkles,
        tone: 'border-violet-500/20 bg-violet-500/10 text-violet-200',
    },
    appreciation: {
        icon: Star,
        tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    },
};

function SectionTitle({ eyebrow, title, description, action }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
            {action}
        </div>
    );
}

function OverviewMetric({ icon: Icon, label, value, hint, tone }) {
    return (
        <Card padding="dashboard" className="h-full">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        {value}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        {hint}
                    </p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tone}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </Card>
    );
}

function PeriodButton({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                    ? 'border-violet-500/30 bg-violet-500/12 text-violet-100'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200',
            ].join(' ')}
        >
            {children}
        </button>
    );
}

function ProgressBar({ value, tone = 'from-violet-500 to-cyan-400' }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
                className={`h-full rounded-full bg-gradient-to-r ${tone}`}
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
            />
        </div>
    );
}

function getHeatmapTone(count, busiestDay) {
    if (count === 0) {
        return 'border-slate-800 bg-slate-900/80';
    }

    const ratio = busiestDay > 0 ? count / busiestDay : 0;

    if (ratio <= 0.25) {
        return 'border-emerald-950/80 bg-emerald-950/80';
    }

    if (ratio <= 0.5) {
        return 'border-emerald-800/80 bg-emerald-800/80';
    }

    if (ratio <= 0.75) {
        return 'border-emerald-600/80 bg-emerald-600/80';
    }

    return 'border-emerald-400/90 bg-emerald-400/90';
}

function LoadingState() {
    return (
        <div className="space-y-6 animate-pulse">
            <Card padding="lg" className="h-52 border-slate-800 bg-slate-900/90" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} padding="dashboard" className="h-32 border-slate-800 bg-slate-900/90" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <Card padding="dashboard" className="h-96 border-slate-800 bg-slate-900/90" />
                <Card padding="dashboard" className="h-96 border-slate-800 bg-slate-900/90" />
            </div>
        </div>
    );
}

export default function GamificationPage() {
    const [leaderboardPeriod, setLeaderboardPeriod] = useState('all');

    const { user } = useAuth();
    const { projects, team, isLoading: projectsLoading } = useProjects();
    const { tasks, isLoading: tasksLoading } = useTasks();
    const { standupHistory } = useStandupBot();

    const workspace = useMemo(() => (
        buildAchievementWorkspace({
            user,
            team,
            tasks,
            projects,
            standupHistory,
        })
    ), [user, team, tasks, projects, standupHistory]);

    const isLoading = tasksLoading || projectsLoading;
    const currentProfile = workspace.currentProfile;
    const leaderboardRows = getLeaderboardDisplay(workspace.leaderboard, leaderboardPeriod).slice(0, 6);

    if (isLoading) {
        return <LoadingState />;
    }

    if (!currentProfile || workspace.empty) {
        return (
            <EmptyState
                icon={Trophy}
                title="Achievements will light up once work starts moving"
                description="Create tasks, close work, and keep standups going. The module will automatically compute XP, badges, streaks, and leaderboards from your real workspace activity."
                tone="amber"
                action={(
                    <Link
                        href="/tasks"
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
                    >
                        Open Task Board
                    </Link>
                )}
            />
        );
    }

    const unlockedBadges = currentProfile.badges.filter((badge) => badge.unlocked);
    const completedChallenges = currentProfile.challenges.filter((challenge) => challenge.completed).length;
    const currentRank = workspace.summary?.rank;
    const heroMeta = [
        {
            label: 'Level',
            value: `${currentProfile.levelInfo.level}`,
            hint: currentProfile.rewards.currentTitle,
        },
        {
            label: 'XP',
            value: `${currentProfile.levelInfo.totalXp}`,
            hint: `${currentProfile.levelInfo.xpForNextLevel} XP to next level`,
        },
        {
            label: 'Rank',
            value: currentRank ? `#${currentRank}` : '-',
            hint: 'Across the current workspace',
        },
        {
            label: 'Streak',
            value: `${currentProfile.stats.standupStreak} days`,
            hint: 'Standup consistency streak',
        },
    ];

    const overviewMetrics = [
        {
            label: 'Unlocked badges',
            value: unlockedBadges.length,
            hint: `${currentProfile.badges.length - unlockedBadges.length} still in progress`,
            icon: Award,
            tone: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
        },
        {
            label: 'Completed tasks',
            value: currentProfile.stats.completedTasks,
            hint: `${currentProfile.stats.completedEarly} finished ahead of schedule`,
            icon: CheckCircle2,
            tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
        },
        {
            label: 'Milestones reached',
            value: currentProfile.stats.milestonesReached,
            hint: `${currentProfile.stats.completedProjects} projects at 100%`,
            icon: Target,
            tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
        },
        {
            label: 'Active challenges',
            value: workspace.summary?.activeChallenges ?? 0,
            hint: `${completedChallenges} completed this cycle`,
            icon: Trophy,
            tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
        },
        {
            label: 'Shared projects',
            value: currentProfile.stats.collaborativeProjects,
            hint: 'Projects with 3 or more teammates involved',
            icon: Handshake,
            tone: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
        },
    ];

    const xpBreakdown = [
        {
            label: 'Task completions',
            xp: currentProfile.stats.completedTasks * XP_RULES.TASK_COMPLETED,
            value: `${currentProfile.stats.completedTasks} shipped`,
        },
        {
            label: 'On-time finishes',
            xp: currentProfile.stats.completedEarly * XP_RULES.TASK_CLOSED_EARLY,
            value: `${currentProfile.stats.completedEarly} ahead of due date`,
        },
        {
            label: 'Bug fixes',
            xp: currentProfile.stats.bugFixes * XP_RULES.BUG_FIXED,
            value: `${currentProfile.stats.bugFixes} resolved`,
        },
        {
            label: 'Documentation',
            xp: currentProfile.stats.documentationTasks * XP_RULES.DOCUMENTATION_ADDED,
            value: `${currentProfile.stats.documentationTasks} documented`,
        },
        {
            label: 'Collaboration',
            xp: currentProfile.stats.collaborativeProjects * XP_RULES.COLLABORATION_BONUS,
            value: `${currentProfile.stats.collaborativeProjects} shared projects`,
        },
    ].filter((entry) => entry.xp > 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHero
                eyebrow="Achievements"
                title="Recognition that rewards momentum, consistency, and teamwork"
                description="XP, badges, streaks, milestones, and leaderboard signals are computed from real workspace activity so progress stays visible without turning collaboration into unhealthy competition."
                tone="amber"
                actions={(
                    <>
                        <Link
                            href="/tasks"
                            className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-500/12 px-4 py-2.5 text-sm font-semibold text-amber-100 transition-colors hover:border-amber-300/35 hover:bg-amber-500/18"
                        >
                            Open Tasks
                        </Link>
                        <Link
                            href="/team"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/80"
                        >
                            View Team
                        </Link>
                    </>
                )}
                meta={heroMeta}
            />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {overviewMetrics.map((metric) => (
                    <OverviewMetric key={metric.label} {...metric} />
                ))}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Contribution History"
                        title="Your last 12 weeks"
                        description="Inspired by GitHub-style activity surfaces, but tuned to task completions, task creation, and standup consistency."
                    />

                    <div className="mt-6 overflow-x-auto">
                        <div className="inline-grid grid-flow-col gap-1">
                            {currentProfile.heatmap.weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                                    {week.map((cell) => (
                                        <div
                                            key={cell.key}
                                            className={`h-4 w-4 rounded-[4px] border ${getHeatmapTone(cell.count, currentProfile.heatmap.busiestDay)}`}
                                            title={`${cell.label}: ${cell.count} contributions`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{currentProfile.heatmap.totalContributions} contributions in 84 days</span>
                        <span>Most active day: {currentProfile.heatmap.busiestDay}</span>
                        <div className="flex items-center gap-2">
                            <span>Less</span>
                            {[
                                'border-slate-800 bg-slate-900/80',
                                'border-emerald-950/80 bg-emerald-950/80',
                                'border-emerald-800/80 bg-emerald-800/80',
                                'border-emerald-600/80 bg-emerald-600/80',
                                'border-emerald-400/90 bg-emerald-400/90',
                            ].map((tone) => (
                                <span key={tone} className={`h-3 w-3 rounded-[3px] border ${tone}`} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>
                </Card>

                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Profile Spotlight"
                        title="Current level and reward path"
                        description="A compact profile summary aligned to the module roadmap."
                    />

                    <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-800/40 p-5">
                        <div className="flex items-center gap-4">
                            <Avatar name={currentProfile.member.name} src={currentProfile.member.avatar} size="xl" />
                            <div className="min-w-0">
                                <p className="truncate text-lg font-semibold text-white">
                                    {currentProfile.member.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                    {currentProfile.rewards.currentTitle}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge variant="primary" size="md">
                                        Level {currentProfile.levelInfo.level}
                                    </Badge>
                                    <Badge variant="warning" size="md">
                                        #{currentRank || '-'} in workspace
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                                <span>Progress to level {currentProfile.levelInfo.level + 1}</span>
                                <span>{currentProfile.levelInfo.progressPercent}%</span>
                            </div>
                            <ProgressBar value={currentProfile.levelInfo.progressPercent} tone="from-amber-400 via-orange-400 to-rose-400" />
                            <p className="mt-2 text-sm text-slate-400">
                                {currentProfile.levelInfo.totalXp} XP earned, {currentProfile.levelInfo.xpForNextLevel} XP remaining.
                            </p>
                        </div>

                        <div className="mt-6 space-y-3">
                            {xpBreakdown.slice(0, 4).map((entry) => (
                                <div key={entry.label} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-white">{entry.label}</p>
                                        <p className="mt-1 text-xs text-slate-500">{entry.value}</p>
                                    </div>
                                    <Badge variant="success" size="md">
                                        {entry.xp} XP
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {currentProfile.rewards.nextReward && (
                            <div className="mt-6 rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/6 p-4">
                                <p className="text-sm font-semibold text-amber-100">
                                    Next unlock: {currentProfile.rewards.nextReward.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-300">
                                    Reach level {currentProfile.rewards.nextReward.level} to unlock this {currentProfile.rewards.nextReward.type.toLowerCase()}.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Milestones"
                        title="Current project progress"
                        description="Milestone checkpoints across the projects you are helping move forward."
                    />

                    <div className="mt-5 space-y-3">
                        {currentProfile.milestoneSummaries.slice(0, 5).map((project) => (
                            <div key={project.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{project.name}</p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {project.completedTasks}/{project.totalTasks} tasks completed
                                        </p>
                                    </div>
                                    <Badge
                                        variant={project.progress === 100 ? 'success' : project.progress >= 50 ? 'primary' : 'warning'}
                                        size="md"
                                    >
                                        {project.progress}%
                                    </Badge>
                                </div>

                                <div className="mt-4">
                                    <ProgressBar value={project.progress} />
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {project.reached.map((step) => (
                                        <Badge key={step} variant="success" size="sm">
                                            {step}% reached
                                        </Badge>
                                    ))}
                                    {project.next && (
                                        <Badge variant="warning" size="sm">
                                            Next: {project.next}%
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Achievement Timeline"
                        title="Recent personal milestones"
                        description="A short history of badges, shipped work, and level progression."
                    />

                    <div className="mt-5 space-y-3">
                        {currentProfile.timeline.map((item) => {
                            const style = TIMELINE_STYLES[item.type] || TIMELINE_STYLES.badge;
                            const Icon = style.icon;

                            return (
                                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${style.tone}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-white">
                                                    {item.title}
                                                </p>
                                                <span className="text-xs text-slate-500">
                                                    {getRelativeTime(item.date)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {item.description}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {formatDate(item.date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </section>

            <section>
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Badges"
                        title="Earned and in-progress collection"
                        description="Badges stay tied to observable work so recognition feels meaningful and transparent."
                    />

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {currentProfile.badges.map((badge) => {
                            const Icon = BADGE_ICONS[badge.id] || Award;

                            return (
                                <div
                                    key={badge.id}
                                    className={[
                                        'rounded-3xl border p-5 transition-colors',
                                        badge.unlocked
                                            ? 'border-amber-500/20 bg-amber-500/8'
                                            : 'border-slate-800 bg-slate-800/40',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${badge.unlocked ? 'border-amber-400/25 bg-amber-400/10 text-amber-300' : 'border-slate-700 bg-slate-900/70 text-slate-400'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <Badge variant={badge.unlocked ? 'warning' : 'default'} size="sm">
                                            {badge.category}
                                        </Badge>
                                    </div>

                                    <p className="mt-4 text-base font-semibold text-white">
                                        {badge.title}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        {badge.description}
                                    </p>

                                    <div className="mt-4">
                                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                                            <span>{badge.value}/{badge.target}</span>
                                            <span>{badge.progressPercent}%</span>
                                        </div>
                                        <ProgressBar
                                            value={badge.progressPercent}
                                            tone={badge.unlocked ? 'from-amber-400 to-orange-400' : 'from-violet-500 to-cyan-400'}
                                        />
                                    </div>

                                    <p className="mt-3 text-xs text-slate-500">
                                        {badge.unlocked && badge.unlockedAt
                                            ? `Unlocked ${formatDate(badge.unlockedAt)}`
                                            : 'Still in progress'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Leaderboard"
                        title="Workspace ranking"
                        description="Use leaderboard context to celebrate momentum, not to create pressure."
                        action={(
                            <div className="flex flex-wrap gap-2">
                                <PeriodButton active={leaderboardPeriod === 'all'} onClick={() => setLeaderboardPeriod('all')}>
                                    All time
                                </PeriodButton>
                                <PeriodButton active={leaderboardPeriod === '30d'} onClick={() => setLeaderboardPeriod('30d')}>
                                    30 days
                                </PeriodButton>
                                <PeriodButton active={leaderboardPeriod === '7d'} onClick={() => setLeaderboardPeriod('7d')}>
                                    7 days
                                </PeriodButton>
                            </div>
                        )}
                    />

                    <div className="mt-5 space-y-3">
                        {leaderboardRows.map((entry) => (
                            <div
                                key={`${leaderboardPeriod}-${entry.userId}`}
                                className={[
                                    'rounded-2xl border p-4',
                                    entry.isCurrentUser
                                        ? 'border-violet-500/25 bg-violet-500/8'
                                        : 'border-slate-800 bg-slate-800/40',
                                ].join(' ')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 text-sm font-semibold text-white">
                                        {entry.rank <= 3 ? <Medal className="h-4 w-4 text-amber-300" /> : entry.rank}
                                    </div>
                                    <Avatar name={entry.name} src={entry.avatar} size="md" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-white">
                                                {entry.name}
                                            </p>
                                            {entry.isCurrentUser && (
                                                <Badge variant="primary" size="sm">
                                                    You
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Level {entry.level} · {entry.badgesUnlocked} badges unlocked
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-white">
                                            {entry.score}
                                        </p>
                                        <p className="text-xs text-slate-500">XP</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Team Recognition"
                        title="Celebrations worth surfacing"
                        description="Manager-ready recognition cards derived from the same activity engine."
                    />

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
                        {workspace.recognitions.map((recognition) => {
                            const style = RECOGNITION_STYLES[recognition.id] || RECOGNITION_STYLES.appreciation;
                            const Icon = style.icon;

                            return (
                                <div key={recognition.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${style.tone}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-white">
                                                {recognition.label}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-300">
                                                {recognition.winner?.member.name || 'No winner yet'}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {recognition.reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Challenges"
                        title="Daily, weekly, and monthly goals"
                        description="Short missions designed to reinforce healthy productivity habits."
                    />

                    <div className="mt-5 space-y-3">
                        {currentProfile.challenges.map((challenge) => (
                            <div key={challenge.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant={challenge.completed ? 'success' : 'warning'} size="sm">
                                                {challenge.period}
                                            </Badge>
                                            <p className="text-sm font-semibold text-white">
                                                {challenge.title}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-400">
                                            {challenge.description}
                                        </p>
                                    </div>
                                    <Badge variant={challenge.completed ? 'success' : 'default'} size="md">
                                        {challenge.reward}
                                    </Badge>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                                        <span>{challenge.progress}/{challenge.target}</span>
                                        <span>{Math.min(100, Math.round((challenge.progress / challenge.target) * 100))}%</span>
                                    </div>
                                    <ProgressBar
                                        value={Math.min(100, Math.round((challenge.progress / challenge.target) * 100))}
                                        tone={challenge.completed ? 'from-emerald-400 to-cyan-400' : 'from-violet-500 to-cyan-400'}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Rewards"
                        title="Unlockable titles and customizations"
                        description="A simple reward track that stays grounded in meaningful contribution."
                    />

                    <div className="mt-5 space-y-3">
                        {currentProfile.rewards.unlocked.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-800/30 p-5 text-sm text-slate-400">
                                Rewards unlock once you hit the first level milestone.
                            </div>
                        )}

                        {currentProfile.rewards.unlocked.map((reward) => (
                            <div key={reward.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {reward.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            {reward.type}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {reward.description}
                                        </p>
                                    </div>
                                    <Badge variant="success" size="md">
                                        L{reward.level}
                                    </Badge>
                                </div>
                            </div>
                        ))}

                        {currentProfile.rewards.nextReward && (
                            <div className="rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/6 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-amber-100">
                                            Up next: {currentProfile.rewards.nextReward.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            {currentProfile.rewards.nextReward.type}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {currentProfile.rewards.nextReward.description}
                                        </p>
                                    </div>
                                    <Badge variant="warning" size="md">
                                        L{currentProfile.rewards.nextReward.level}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </section>

            <section>
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Design Notes"
                        title="How this module interprets progress"
                        description="The current implementation rewards task completions, early finishes, bug fixes, documentation, shared project work, standup streaks, and project milestones. The structure leaves room for future PR review, knowledge sharing, manager-awarded recognition, and organization-level seasonal events."
                        action={(
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Updated from the achievement implementation plan
                            </div>
                        )}
                    />
                </Card>
            </section>
        </div>
    );
}
