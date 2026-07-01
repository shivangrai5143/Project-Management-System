const MILESTONE_STEPS = [10, 25, 50, 80, 100];

export const XP_RULES = {
    TASK_COMPLETED: 20,
    TASK_CLOSED_EARLY: 30,
    PROJECT_COMPLETED: 300,
    BUG_FIXED: 40,
    DOCUMENTATION_ADDED: 25,
    CODE_REVIEW: 15,
    STANDUP_SUBMITTED: 5,
    COLLABORATION_BONUS: 35,
    MILESTONE_REACHED: 20,
};

export const BADGE_DEFINITIONS = [
    {
        id: 'first-task-completed',
        title: 'First Task Completed',
        description: 'Ship your first completed task.',
        category: 'Productivity',
        metric: 'completedTasks',
        target: 1,
    },
    {
        id: 'sprint-hero',
        title: 'Sprint Hero',
        description: 'Close 5 tasks in the last 30 days.',
        category: 'Sprint',
        metric: 'recentCompleted',
        target: 5,
    },
    {
        id: 'streak-keeper',
        title: '7-Day Streak',
        description: 'Submit standups for 7 days in a row.',
        category: 'Consistency',
        metric: 'standupStreak',
        target: 7,
    },
    {
        id: 'bug-hunter',
        title: 'Bug Hunter',
        description: 'Resolve 3 bug tickets.',
        category: 'Bug Hunter',
        metric: 'bugFixes',
        target: 3,
    },
    {
        id: 'documentation-expert',
        title: 'Documentation Expert',
        description: 'Complete 3 documentation tasks.',
        category: 'Documentation',
        metric: 'documentationTasks',
        target: 3,
    },
    {
        id: 'team-player',
        title: 'Team Player',
        description: 'Contribute across 2 shared projects.',
        category: 'Collaboration',
        metric: 'collaborativeProjects',
        target: 2,
    },
    {
        id: 'fast-finisher',
        title: 'Fast Finisher',
        description: 'Close 5 tasks before their due date.',
        category: 'Productivity',
        metric: 'completedEarly',
        target: 5,
    },
    {
        id: 'project-champion',
        title: 'Project Champion',
        description: 'Help finish 1 project milestone to 100%.',
        category: 'Project',
        metric: 'completedProjects',
        target: 1,
    },
    {
        id: 'goal-achiever',
        title: 'Goal Achiever',
        description: 'Hit 4 milestone checkpoints across active projects.',
        category: 'Milestones',
        metric: 'milestonesReached',
        target: 4,
    },
    {
        id: 'knowledge-contributor',
        title: 'Knowledge Contributor',
        description: 'Combine 5 documentation and review contributions.',
        category: 'Knowledge',
        metric: 'knowledgeContributions',
        target: 5,
    },
];

export const REWARD_TRACK = [
    {
        id: 'title-focused-contributor',
        level: 2,
        type: 'Title',
        title: 'Focused Contributor',
        description: 'A title for steady execution and visible momentum.',
    },
    {
        id: 'frame-silver',
        level: 4,
        type: 'Badge Frame',
        title: 'Silver Frame',
        description: 'Add a cleaner badge frame to your achievement shelf.',
    },
    {
        id: 'theme-sunrise',
        level: 6,
        type: 'Profile Theme',
        title: 'Sunrise Theme',
        description: 'Unlock a brighter profile accent for your workspace card.',
    },
    {
        id: 'title-sprint-beacon',
        level: 8,
        type: 'Title',
        title: 'Sprint Beacon',
        description: 'Signals reliable delivery during active planning cycles.',
    },
    {
        id: 'workspace-constellation',
        level: 10,
        type: 'Workspace Accent',
        title: 'Constellation Accent',
        description: 'Decorate the achievement dashboard with a special backdrop.',
    },
    {
        id: 'title-atlas-champion',
        level: 12,
        type: 'Title',
        title: 'Atlas Champion',
        description: 'Reserved for teammates carrying high-impact delivery.',
    },
];

function toDate(value) {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(value = new Date()) {
    const date = toDate(value) || new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}

function startOfMonth(value = new Date()) {
    const date = startOfDay(value);
    date.setDate(1);
    return date;
}

function subDays(value, days) {
    const date = toDate(value) || new Date();
    date.setDate(date.getDate() - days);
    return date;
}

function isOnOrAfter(value, threshold) {
    const date = toDate(value);
    const floor = toDate(threshold);
    return !!date && !!floor && date >= floor;
}

function isSameDay(left, right) {
    const leftDate = startOfDay(left);
    const rightDate = startOfDay(right);
    return leftDate.getTime() === rightDate.getTime();
}

function dateKey(value) {
    const date = toDate(value);
    return date ? date.toISOString().slice(0, 10) : null;
}

function hasLabel(task, label) {
    return Array.isArray(task?.labels) && task.labels.includes(label);
}

function sortByDateAsc(items, getDate) {
    return [...items].sort((left, right) => {
        const leftDate = toDate(getDate(left))?.getTime() || 0;
        const rightDate = toDate(getDate(right))?.getTime() || 0;
        return leftDate - rightDate;
    });
}

function sortByDateDesc(items, getDate) {
    return [...items].sort((left, right) => {
        const leftDate = toDate(getDate(left))?.getTime() || 0;
        const rightDate = toDate(getDate(right))?.getTime() || 0;
        return rightDate - leftDate;
    });
}

function getNthEventDate(items, index, getDate) {
    const sorted = sortByDateAsc(items, getDate);
    return sorted[index] ? getDate(sorted[index]) : null;
}

function getProjectCompletionDate(projectTasks, project) {
    const datedTasks = projectTasks
        .map((task) => toDate(task.updatedAt || task.createdAt || task.dueDate))
        .filter(Boolean)
        .sort((left, right) => right - left);

    return datedTasks[0]?.toISOString() || project.updatedAt || project.createdAt || null;
}

function createEmptyMemberEntry(member) {
    return {
        ...member,
        assignedTasks: [],
        createdTasks: [],
        memberships: [],
        standupHistory: [],
    };
}

function normalizeTeam(team = [], user = null) {
    const teamById = new Map();

    team.forEach((member) => {
        if (member?.id) {
            teamById.set(member.id, member);
        }
    });

    if (user?.id && !teamById.has(user.id)) {
        teamById.set(user.id, {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || null,
            role: user.role || 'developer',
        });
    }

    return [...teamById.values()];
}

function getLevelThreshold(level) {
    if (level <= 1) {
        return 0;
    }

    const delta = level - 1;
    return (50 * delta * delta) + 50;
}

function getLevelFromXp(xp) {
    let level = 1;

    while (level < 50 && xp >= getLevelThreshold(level + 1)) {
        level += 1;
    }

    const currentThreshold = getLevelThreshold(level);
    const nextThreshold = getLevelThreshold(level + 1);
    const span = Math.max(1, nextThreshold - currentThreshold);
    const xpIntoLevel = Math.max(0, xp - currentThreshold);

    return {
        level,
        currentThreshold,
        nextThreshold,
        xpIntoLevel,
        xpForNextLevel: Math.max(0, nextThreshold - xp),
        progressPercent: Math.min(100, Math.round((xpIntoLevel / span) * 100)),
    };
}

function computeStandupStreak(standupHistory = []) {
    if (!standupHistory.length) {
        return 0;
    }

    const uniqueKeys = new Set(
        standupHistory
            .map((entry) => dateKey(entry.submittedAt))
            .filter(Boolean)
    );

    let streak = 0;
    const today = startOfDay();

    for (let offset = 0; offset < 365; offset += 1) {
        const checkDate = subDays(today, offset);
        const key = dateKey(checkDate);

        if (offset === 0 && !uniqueKeys.has(key)) {
            continue;
        }

        if (!uniqueKeys.has(key)) {
            break;
        }

        streak += 1;
    }

    return streak;
}

function buildContributionHeatmap({ userId, tasks = [], standupHistory = [], days = 84 }) {
    const today = startOfDay();
    const start = subDays(today, days - 1);
    const counts = new Map();

    tasks.forEach((task) => {
        if (task.createdBy === userId) {
            const key = dateKey(task.createdAt);
            if (key) {
                counts.set(key, (counts.get(key) || 0) + 1);
            }
        }

        if (task.assigneeId === userId && task.status === 'done') {
            const key = dateKey(task.updatedAt || task.createdAt);
            if (key) {
                counts.set(key, (counts.get(key) || 0) + 1);
            }
        }
    });

    standupHistory.forEach((entry) => {
        const key = dateKey(entry.submittedAt);
        if (key) {
            counts.set(key, (counts.get(key) || 0) + 1);
        }
    });

    const cells = [];
    let busiestDay = 0;

    for (let offset = 0; offset < days; offset += 1) {
        const date = subDays(today, days - 1 - offset);
        if (date < start) {
            continue;
        }

        const key = dateKey(date);
        const count = counts.get(key) || 0;
        busiestDay = Math.max(busiestDay, count);

        cells.push({
            key,
            date: date.toISOString(),
            count,
            label: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        });
    }

    const weeks = [];
    for (let index = 0; index < cells.length; index += 7) {
        weeks.push(cells.slice(index, index + 7));
    }

    return {
        weeks,
        totalContributions: cells.reduce((sum, cell) => sum + cell.count, 0),
        busiestDay,
    };
}

function computeBadgeUnlocks(stats) {
    return BADGE_DEFINITIONS.map((badge) => {
        const value = stats[badge.metric] || 0;
        const unlocked = value >= badge.target;

        let unlockedAt = null;
        if (unlocked) {
            switch (badge.id) {
                case 'first-task-completed':
                    unlockedAt = getNthEventDate(stats.completedTaskEvents, 0, (task) => task.updatedAt || task.createdAt);
                    break;
                case 'sprint-hero':
                    unlockedAt = getNthEventDate(stats.recentCompletedTaskEvents, badge.target - 1, (task) => task.updatedAt || task.createdAt);
                    break;
                case 'streak-keeper':
                    unlockedAt = getNthEventDate(stats.standupEvents, badge.target - 1, (entry) => entry.submittedAt);
                    break;
                case 'bug-hunter':
                    unlockedAt = getNthEventDate(stats.bugFixEvents, badge.target - 1, (task) => task.updatedAt || task.createdAt);
                    break;
                case 'documentation-expert':
                    unlockedAt = getNthEventDate(stats.documentationEvents, badge.target - 1, (task) => task.updatedAt || task.createdAt);
                    break;
                case 'team-player':
                    unlockedAt = getNthEventDate(stats.collaborativeProjectEvents, badge.target - 1, (project) => project.createdAt || project.updatedAt);
                    break;
                case 'fast-finisher':
                    unlockedAt = getNthEventDate(stats.completedEarlyEvents, badge.target - 1, (task) => task.updatedAt || task.createdAt);
                    break;
                case 'project-champion':
                    unlockedAt = getNthEventDate(stats.completedProjectEvents, badge.target - 1, (project) => project.completedAt || project.updatedAt || project.createdAt);
                    break;
                case 'goal-achiever':
                    unlockedAt = getNthEventDate(stats.milestoneEvents, badge.target - 1, (event) => event.date);
                    break;
                case 'knowledge-contributor':
                    unlockedAt = getNthEventDate(stats.knowledgeEvents, badge.target - 1, (event) => event.date);
                    break;
                default:
                    unlockedAt = null;
            }
        }

        return {
            ...badge,
            value,
            unlocked,
            progressPercent: Math.min(100, Math.round((value / badge.target) * 100)),
            unlockedAt,
        };
    });
}

function computeRewards(levelInfo) {
    const unlocked = REWARD_TRACK.filter((reward) => reward.level <= levelInfo.level);
    const nextReward = REWARD_TRACK.find((reward) => reward.level > levelInfo.level) || null;
    const currentTitle = [...unlocked]
        .reverse()
        .find((reward) => reward.type === 'Title')?.title || 'Rising Builder';

    return {
        unlocked,
        nextReward,
        currentTitle,
    };
}

function buildTimeline(stats, badges, levelInfo) {
    const items = [];

    stats.completedTaskEvents.forEach((task) => {
        items.push({
            id: `task-${task.id}`,
            type: 'task',
            date: task.updatedAt || task.createdAt,
            title: `Completed ${task.title}`,
            description: hasLabel(task, 'bug')
                ? 'Bug fix closed and shipped.'
                : hasLabel(task, 'documentation')
                    ? 'Documentation work published.'
                    : 'Task closed and moved into delivered work.',
        });
    });

    stats.completedProjectEvents.forEach((project) => {
        items.push({
            id: `project-${project.id}`,
            type: 'project',
            date: project.completedAt || project.updatedAt || project.createdAt,
            title: `Completed ${project.name}`,
            description: 'A full project milestone hit 100% completion.',
        });
    });

    stats.milestoneEvents.forEach((event) => {
        if (event.threshold === 100) {
            return;
        }

        items.push({
            id: `milestone-${event.projectId}-${event.threshold}`,
            type: 'milestone',
            date: event.date,
            title: `${event.projectName} reached ${event.threshold}%`,
            description: 'Project progress milestone unlocked additional XP.',
        });
    });

    badges
        .filter((badge) => badge.unlocked && badge.unlockedAt)
        .forEach((badge) => {
            items.push({
                id: `badge-${badge.id}`,
                type: 'badge',
                date: badge.unlockedAt,
                title: `Unlocked ${badge.title}`,
                description: badge.description,
            });
        });

    if (levelInfo.level > 1) {
        items.push({
            id: `level-${levelInfo.level}`,
            type: 'level',
            date: stats.latestContributionAt || new Date().toISOString(),
            title: `Reached level ${levelInfo.level}`,
            description: `${levelInfo.xpForNextLevel} XP remain until the next unlock.`,
        });
    }

    return sortByDateDesc(
        items.filter((item) => item.date),
        (item) => item.date
    ).slice(0, 8);
}

function buildChallenges(stats) {
    const dailyTarget = 2;
    const weeklyBugTarget = 3;
    const monthlyTarget = 8;

    return [
        {
            id: 'daily-velocity',
            period: 'Daily',
            title: 'Close 2 tasks today',
            description: 'Keep daily execution tight without sacrificing quality.',
            reward: '50 XP',
            progress: stats.completedToday,
            target: dailyTarget,
            completed: stats.completedToday >= dailyTarget,
        },
        {
            id: 'weekly-bug-sweep',
            period: 'Weekly',
            title: 'Resolve 3 bugs this week',
            description: 'Push defect pressure down before it compounds.',
            reward: '150 XP',
            progress: stats.bugFixesLast7Days,
            target: weeklyBugTarget,
            completed: stats.bugFixesLast7Days >= weeklyBugTarget,
        },
        {
            id: 'monthly-momentum',
            period: 'Monthly',
            title: 'Finish 8 tasks this month',
            description: 'Sustain momentum through the whole delivery cycle.',
            reward: 'Momentum badge frame',
            progress: stats.completedThisMonth,
            target: monthlyTarget,
            completed: stats.completedThisMonth >= monthlyTarget,
        },
    ];
}

function getLeaderboardScore(stats, period = 'all') {
    if (period === '7d') {
        return stats.scoreLast7Days;
    }

    if (period === '30d') {
        return stats.scoreLast30Days;
    }

    return stats.totalXp;
}

function buildRecognitionCards(profiles) {
    if (!profiles.length) {
        return [];
    }

    const byRecentScore = [...profiles].sort((left, right) => right.stats.scoreLast30Days - left.stats.scoreLast30Days);
    const byCollaboration = [...profiles].sort((left, right) => right.stats.collaborativeProjects - left.stats.collaborativeProjects || right.stats.completedTasks - left.stats.completedTasks);
    const byImpact = [...profiles].sort((left, right) => right.stats.highPriorityCompletions - left.stats.highPriorityCompletions || right.stats.completedEarly - left.stats.completedEarly);
    const bySupport = [...profiles].sort((left, right) => right.stats.documentationTasks + right.stats.reviewContributions - (left.stats.documentationTasks + left.stats.reviewContributions));

    return [
        {
            id: 'employee-of-sprint',
            label: 'Employee of Sprint',
            winner: byRecentScore[0],
            reason: 'Highest recent delivery score across the last 30 days.',
        },
        {
            id: 'collaboration-award',
            label: 'Collaboration Award',
            winner: byCollaboration[0],
            reason: 'Most visible contribution across shared project surfaces.',
        },
        {
            id: 'innovation-award',
            label: 'Innovation Award',
            winner: byImpact[0],
            reason: 'Strongest high-priority execution and on-time finishes.',
        },
        {
            id: 'appreciation',
            label: 'Appreciation',
            winner: bySupport[0],
            reason: 'Consistent support work through reviews and documentation.',
        },
    ];
}

function buildMemberStats(member, tasks, projects, standupHistory = []) {
    const today = startOfDay();
    const last7Days = subDays(today, 6);
    const last30Days = subDays(today, 29);
    const monthStart = startOfMonth(today);

    const memberships = projects.filter((project) =>
        project.ownerId === member.id || project.teamIds?.includes(member.id)
    );

    const assignedTasks = tasks.filter((task) => task.assigneeId === member.id);
    const createdTasks = tasks.filter((task) => task.createdBy === member.id);
    const completedTaskEvents = sortByDateDesc(
        assignedTasks.filter((task) => task.status === 'done'),
        (task) => task.updatedAt || task.createdAt
    );
    const completedEarlyEvents = completedTaskEvents.filter((task) => {
        const dueDate = toDate(task.dueDate);
        const completedAt = toDate(task.updatedAt || task.createdAt);
        return !!dueDate && !!completedAt && completedAt <= dueDate;
    });
    const documentationEvents = completedTaskEvents.filter((task) => hasLabel(task, 'documentation'));
    const bugFixEvents = completedTaskEvents.filter((task) => hasLabel(task, 'bug'));
    const reviewEvents = assignedTasks.filter((task) => task.status === 'review' || hasLabel(task, 'review'));
    const recentCompletedTaskEvents = completedTaskEvents.filter((task) =>
        isOnOrAfter(task.updatedAt || task.createdAt, last30Days)
    );
    const collaborativeProjectEvents = memberships.filter((project) => (project.teamIds || []).length >= 3);

    const milestoneEvents = [];
    const completedProjectEvents = [];
    const milestoneSummaries = memberships.map((project) => {
        const projectTasks = tasks.filter((task) => task.projectId === project.id);
        const completedTasks = projectTasks.filter((task) => task.status === 'done').length;
        const totalTasks = projectTasks.length;
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        const reached = MILESTONE_STEPS.filter((step) => progress >= step);
        const next = MILESTONE_STEPS.find((step) => progress < step) || null;
        const completedAt = getProjectCompletionDate(projectTasks, project);

        reached.forEach((threshold) => {
            milestoneEvents.push({
                projectId: project.id,
                projectName: project.name,
                threshold,
                date: completedAt || project.updatedAt || project.createdAt || null,
            });
        });

        if (progress === 100) {
            completedProjectEvents.push({
                ...project,
                completedAt,
            });
        }

        return {
            id: project.id,
            name: project.name,
            progress,
            totalTasks,
            completedTasks,
            remainingTasks: Math.max(0, totalTasks - completedTasks),
            reached,
            next,
            completedAt,
            updatedAt: project.updatedAt || project.createdAt || null,
        };
    });

    const knowledgeEvents = sortByDateDesc(
        [
            ...documentationEvents.map((task) => ({
                id: `knowledge-doc-${task.id}`,
                date: task.updatedAt || task.createdAt,
            })),
            ...reviewEvents.map((task) => ({
                id: `knowledge-review-${task.id}`,
                date: task.updatedAt || task.createdAt,
            })),
        ],
        (event) => event.date
    );

    const completedToday = completedTaskEvents.filter((task) =>
        isSameDay(task.updatedAt || task.createdAt, today)
    ).length;
    const completedThisMonth = completedTaskEvents.filter((task) =>
        isOnOrAfter(task.updatedAt || task.createdAt, monthStart)
    ).length;
    const completedLast7Days = completedTaskEvents.filter((task) =>
        isOnOrAfter(task.updatedAt || task.createdAt, last7Days)
    );
    const bugFixesLast7Days = bugFixEvents.filter((task) =>
        isOnOrAfter(task.updatedAt || task.createdAt, last7Days)
    ).length;
    const documentationLast30Days = documentationEvents.filter((task) =>
        isOnOrAfter(task.updatedAt || task.createdAt, last30Days)
    ).length;
    const highPriorityCompletions = completedTaskEvents.filter((task) =>
        task.priority === 'high' || task.priority === 'urgent'
    ).length;

    const totalXp =
        (completedTaskEvents.length * XP_RULES.TASK_COMPLETED) +
        (completedEarlyEvents.length * XP_RULES.TASK_CLOSED_EARLY) +
        (bugFixEvents.length * XP_RULES.BUG_FIXED) +
        (documentationEvents.length * XP_RULES.DOCUMENTATION_ADDED) +
        (reviewEvents.length * XP_RULES.CODE_REVIEW) +
        (completedProjectEvents.length * XP_RULES.PROJECT_COMPLETED) +
        (collaborativeProjectEvents.length * XP_RULES.COLLABORATION_BONUS) +
        (milestoneEvents.length * XP_RULES.MILESTONE_REACHED) +
        (standupHistory.length * XP_RULES.STANDUP_SUBMITTED);

    const scoreLast7Days =
        (completedLast7Days.length * XP_RULES.TASK_COMPLETED) +
        (completedLast7Days.filter((task) => {
            const dueDate = toDate(task.dueDate);
            const completedAt = toDate(task.updatedAt || task.createdAt);
            return !!dueDate && !!completedAt && completedAt <= dueDate;
        }).length * XP_RULES.TASK_CLOSED_EARLY) +
        (bugFixesLast7Days * XP_RULES.BUG_FIXED);

    const scoreLast30Days =
        (recentCompletedTaskEvents.length * XP_RULES.TASK_COMPLETED) +
        (recentCompletedTaskEvents.filter((task) => {
            const dueDate = toDate(task.dueDate);
            const completedAt = toDate(task.updatedAt || task.createdAt);
            return !!dueDate && !!completedAt && completedAt <= dueDate;
        }).length * XP_RULES.TASK_CLOSED_EARLY) +
        (bugFixEvents.filter((task) => isOnOrAfter(task.updatedAt || task.createdAt, last30Days)).length * XP_RULES.BUG_FIXED) +
        (documentationLast30Days * XP_RULES.DOCUMENTATION_ADDED);

    const standupStreak = computeStandupStreak(standupHistory);

    const stats = {
        completedTasks: completedTaskEvents.length,
        completedEarly: completedEarlyEvents.length,
        completedToday,
        completedThisMonth,
        reviewContributions: reviewEvents.length,
        documentationTasks: documentationEvents.length,
        knowledgeContributions: documentationEvents.length + reviewEvents.length,
        bugFixes: bugFixEvents.length,
        bugFixesLast7Days,
        collaborativeProjects: collaborativeProjectEvents.length,
        completedProjects: completedProjectEvents.length,
        milestonesReached: milestoneEvents.length,
        recentCompleted: recentCompletedTaskEvents.length,
        highPriorityCompletions,
        standupStreak,
        completedTaskEvents,
        recentCompletedTaskEvents,
        completedEarlyEvents,
        documentationEvents,
        bugFixEvents,
        reviewEvents,
        collaborativeProjectEvents,
        completedProjectEvents,
        milestoneEvents,
        knowledgeEvents,
        standupEvents: sortByDateDesc(standupHistory, (entry) => entry.submittedAt),
        totalXp,
        scoreLast7Days,
        scoreLast30Days,
        latestContributionAt:
            completedTaskEvents[0]?.updatedAt ||
            completedTaskEvents[0]?.createdAt ||
            standupHistory[0]?.submittedAt ||
            memberships[0]?.updatedAt ||
            null,
    };

    const levelInfo = {
        ...getLevelFromXp(totalXp),
        totalXp,
    };
    const badges = computeBadgeUnlocks(stats);
    const rewards = computeRewards(levelInfo);
    const challenges = buildChallenges(stats);

    return {
        member,
        memberships,
        assignedTasks,
        createdTasks,
        milestoneSummaries: sortByDateDesc(
            milestoneSummaries,
            (project) => project.updatedAt || project.completedAt
        ),
        heatmap: buildContributionHeatmap({
            userId: member.id,
            tasks,
            standupHistory,
        }),
        stats,
        levelInfo,
        badges,
        rewards,
        challenges,
        timeline: buildTimeline(stats, badges, levelInfo),
    };
}

export function buildAchievementWorkspace({
    user,
    team = [],
    tasks = [],
    projects = [],
    standupHistory = [],
}) {
    const normalizedTeam = normalizeTeam(team, user);
    const profiles = normalizedTeam.map((member) =>
        buildMemberStats(
            member,
            tasks,
            projects,
            member.id === user?.id ? standupHistory : []
        )
    );

    const leaderboardAll = [...profiles]
        .sort((left, right) => right.stats.totalXp - left.stats.totalXp || right.stats.completedTasks - left.stats.completedTasks)
        .map((profile, index) => ({
            userId: profile.member.id,
            name: profile.member.name,
            avatar: profile.member.avatar || null,
            totalXp: profile.stats.totalXp,
            score7d: profile.stats.scoreLast7Days,
            score30d: profile.stats.scoreLast30Days,
            completedTasks: profile.stats.completedTasks,
            badgesUnlocked: profile.badges.filter((badge) => badge.unlocked).length,
            level: profile.levelInfo.level,
            rank: index + 1,
            isCurrentUser: profile.member.id === user?.id,
        }));

    const leaderboardByPeriod = {
        all: leaderboardAll.map((entry) => ({
            ...entry,
            score: entry.totalXp,
        })),
        '30d': [...leaderboardAll]
            .sort((left, right) => right.score30d - left.score30d || right.completedTasks - left.completedTasks)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
                score: entry.score30d,
            })),
        '7d': [...leaderboardAll]
            .sort((left, right) => right.score7d - left.score7d || right.completedTasks - left.completedTasks)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
                score: entry.score7d,
            })),
    };

    const currentProfile = profiles.find((profile) => profile.member.id === user?.id) || null;
    const recognitions = buildRecognitionCards(profiles);

    return {
        currentProfile,
        profiles,
        leaderboard: leaderboardByPeriod,
        recognitions,
        empty: tasks.length === 0 && projects.length === 0,
        summary: currentProfile
            ? {
                rank: leaderboardByPeriod.all.find((entry) => entry.userId === user?.id)?.rank || null,
                totalAchievements:
                    currentProfile.badges.filter((badge) => badge.unlocked).length +
                    currentProfile.challenges.filter((challenge) => challenge.completed).length +
                    currentProfile.rewards.unlocked.length,
                activeChallenges: currentProfile.challenges.filter((challenge) => !challenge.completed).length,
            }
            : null,
    };
}

export function getLeaderboardDisplay(leaderboard, period) {
    return leaderboard?.[period] || leaderboard?.all || [];
}

