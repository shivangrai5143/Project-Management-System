/**
 * AI Analysis Utilities
 * Local rule-based analysis for project planning, trend identification, and risk detection
 */

import { isOverdue, isDueSoon } from './helpers';

// ============ PROJECT PLAN GENERATOR ============

/**
 * Generate suggested task breakdown based on project details
 */
export const generateProjectPlan = (project, existingTasks = []) => {
    const suggestions = [];
    const projectName = project?.name?.toLowerCase() || '';
    const description = project?.description?.toLowerCase() || '';

    // Common project phases
    const phases = [
        { name: 'Planning & Research', tasks: ['Define requirements', 'Research solutions', 'Create timeline'] },
        { name: 'Design', tasks: ['Create wireframes', 'Design mockups', 'Get design approval'] },
        { name: 'Development', tasks: ['Setup project structure', 'Implement core features', 'Add styling'] },
        { name: 'Testing', tasks: ['Write unit tests', 'Perform QA testing', 'Fix bugs'] },
        { name: 'Deployment', tasks: ['Prepare deployment', 'Deploy to production', 'Monitor performance'] }
    ];

    // Detect project type from name/description
    const isWebProject = /web|website|frontend|react|vue|angular/i.test(projectName + description);
    const isMobileProject = /mobile|app|ios|android|flutter/i.test(projectName + description);
    const isApiProject = /api|backend|server|database/i.test(projectName + description);
    const isDesignProject = /design|ui|ux|figma/i.test(projectName + description);

    // Add relevant phases based on project type
    if (isDesignProject) {
        suggestions.push({
            phase: 'Design Research',
            tasks: [
                { title: 'Conduct user research', priority: 'high', estimatedDays: 3 },
                { title: 'Create user personas', priority: 'medium', estimatedDays: 2 },
                { title: 'Design system setup', priority: 'high', estimatedDays: 2 },
                { title: 'Create wireframes', priority: 'high', estimatedDays: 3 },
                { title: 'High-fidelity mockups', priority: 'high', estimatedDays: 5 }
            ]
        });
    }

    if (isWebProject || isMobileProject) {
        suggestions.push({
            phase: 'Development Setup',
            tasks: [
                { title: 'Initialize project repository', priority: 'high', estimatedDays: 1 },
                { title: 'Setup development environment', priority: 'high', estimatedDays: 1 },
                { title: 'Configure CI/CD pipeline', priority: 'medium', estimatedDays: 2 },
                { title: 'Setup linting and formatting', priority: 'low', estimatedDays: 1 }
            ]
        });

        suggestions.push({
            phase: 'Core Features',
            tasks: [
                { title: 'Implement authentication', priority: 'high', estimatedDays: 3 },
                { title: 'Build main navigation', priority: 'high', estimatedDays: 2 },
                { title: 'Create core components', priority: 'high', estimatedDays: 5 },
                { title: 'Add state management', priority: 'medium', estimatedDays: 2 }
            ]
        });
    }

    if (isApiProject) {
        suggestions.push({
            phase: 'Backend Setup',
            tasks: [
                { title: 'Design database schema', priority: 'high', estimatedDays: 2 },
                { title: 'Setup API framework', priority: 'high', estimatedDays: 1 },
                { title: 'Implement authentication', priority: 'high', estimatedDays: 2 },
                { title: 'Create CRUD endpoints', priority: 'high', estimatedDays: 4 },
                { title: 'Add input validation', priority: 'medium', estimatedDays: 2 }
            ]
        });
    }

    // Always add testing and deployment
    suggestions.push({
        phase: 'Quality Assurance',
        tasks: [
            { title: 'Write unit tests', priority: 'medium', estimatedDays: 3 },
            { title: 'Perform integration testing', priority: 'medium', estimatedDays: 2 },
            { title: 'User acceptance testing', priority: 'high', estimatedDays: 2 },
            { title: 'Fix identified bugs', priority: 'high', estimatedDays: 3 }
        ]
    });

    suggestions.push({
        phase: 'Launch',
        tasks: [
            { title: 'Prepare deployment checklist', priority: 'high', estimatedDays: 1 },
            { title: 'Deploy to staging', priority: 'high', estimatedDays: 1 },
            { title: 'Deploy to production', priority: 'high', estimatedDays: 1 },
            { title: 'Post-launch monitoring', priority: 'medium', estimatedDays: 2 }
        ]
    });

    // If no specific type detected, provide generic suggestions
    if (suggestions.length === 2) {
        suggestions.unshift({
            phase: 'Project Kickoff',
            tasks: [
                { title: 'Define project scope', priority: 'high', estimatedDays: 2 },
                { title: 'Identify stakeholders', priority: 'medium', estimatedDays: 1 },
                { title: 'Create project timeline', priority: 'high', estimatedDays: 1 },
                { title: 'Setup communication channels', priority: 'low', estimatedDays: 1 }
            ]
        });
    }

    // Filter out tasks that already exist
    const existingTitles = existingTasks.map(t => t.title?.toLowerCase());
    suggestions.forEach(phase => {
        phase.tasks = phase.tasks.filter(
            task => !existingTitles.includes(task.title.toLowerCase())
        );
    });

    return suggestions.filter(phase => phase.tasks.length > 0);
};

// ============ TREND ANALYSIS ============

/**
 * Analyze project and task trends
 */
export const analyzeTrends = (tasks, projects) => {
    const trends = {
        velocity: calculateVelocity(tasks),
        completionRate: calculateCompletionRate(tasks),
        avgTimeToComplete: calculateAvgTimeToComplete(tasks),
        busiestDays: findBusiestDays(tasks),
        projectProgress: calculateProjectProgress(tasks, projects),
        recentActivity: getRecentActivity(tasks)
    };

    return trends;
};

const calculateVelocity = (tasks) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const completedThisWeek = tasks.filter(t => {
        if (t.status !== 'done') return false;
        const updated = new Date(t.updatedAt);
        return updated >= oneWeekAgo;
    }).length;

    const completedLastWeek = tasks.filter(t => {
        if (t.status !== 'done') return false;
        const updated = new Date(t.updatedAt);
        return updated >= twoWeeksAgo && updated < oneWeekAgo;
    }).length;

    const trend = completedThisWeek > completedLastWeek ? 'increasing' :
        completedThisWeek < completedLastWeek ? 'decreasing' : 'stable';

    return {
        thisWeek: completedThisWeek,
        lastWeek: completedLastWeek,
        trend,
        change: completedThisWeek - completedLastWeek
    };
};

const calculateCompletionRate = (tasks) => {
    if (tasks.length === 0) return { rate: 0, completed: 0, total: 0 };

    const completed = tasks.filter(t => t.status === 'done').length;
    const rate = Math.round((completed / tasks.length) * 100);

    return { rate, completed, total: tasks.length };
};

const calculateAvgTimeToComplete = (tasks) => {
    const completedTasks = tasks.filter(t =>
        t.status === 'done' && t.createdAt && t.updatedAt
    );

    if (completedTasks.length === 0) return { days: 0, trend: 'stable' };

    const totalDays = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt);
        const completed = new Date(task.updatedAt);
        const days = Math.max(1, Math.ceil((completed - created) / (1000 * 60 * 60 * 24)));
        return sum + days;
    }, 0);

    return {
        days: Math.round(totalDays / completedTasks.length),
        trend: 'stable'
    };
};

const findBusiestDays = (tasks) => {
    const dayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    tasks.filter(t => t.status === 'done' && t.updatedAt).forEach(task => {
        const day = new Date(task.updatedAt).getDay();
        dayCount[day]++;
    });

    const sortedDays = Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])
        .map(([day, count]) => ({ day: dayNames[day], count }));

    return sortedDays.slice(0, 3);
};

const calculateProjectProgress = (tasks, projects) => {
    return projects.map(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const completed = projectTasks.filter(t => t.status === 'done').length;
        const total = projectTasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            id: project.id,
            name: project.name,
            progress,
            completed,
            total,
            status: progress === 100 ? 'complete' : progress > 50 ? 'on-track' : 'needs-attention'
        };
    });
};

const getRecentActivity = (tasks) => {
    const now = new Date();
    const last24h = tasks.filter(t => {
        const updated = new Date(t.updatedAt);
        return (now - updated) < 24 * 60 * 60 * 1000;
    }).length;

    const last7d = tasks.filter(t => {
        const updated = new Date(t.updatedAt);
        return (now - updated) < 7 * 24 * 60 * 60 * 1000;
    }).length;

    return { last24h, last7d };
};

// ============ RISK DETECTION ============

/**
 * Detect potential risks in projects and tasks
 */
export const detectRisks = (tasks, projects, team) => {
    const risks = [];

    // Check for overdue tasks
    const overdueTasks = tasks.filter(t =>
        isOverdue(t.dueDate) && t.status !== 'done'
    );
    if (overdueTasks.length > 0) {
        risks.push({
            type: 'overdue',
            severity: overdueTasks.length > 3 ? 'high' : 'medium',
            title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
            description: `Tasks past their due date need immediate attention`,
            items: overdueTasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
            action: 'Review and reprioritize overdue tasks'
        });
    }

    // Check for tasks due soon
    const dueSoonTasks = tasks.filter(t =>
        isDueSoon(t.dueDate) && !isOverdue(t.dueDate) && t.status !== 'done'
    );
    if (dueSoonTasks.length > 0) {
        risks.push({
            type: 'due-soon',
            severity: 'low',
            title: `${dueSoonTasks.length} task${dueSoonTasks.length > 1 ? 's' : ''} due soon`,
            description: `Tasks due in the next 3 days`,
            items: dueSoonTasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
            action: 'Ensure these tasks are on track'
        });
    }

    // Check for blocked/stalled tasks (in progress for too long)
    const stalledTasks = tasks.filter(t => {
        if (t.status !== 'in-progress') return false;
        const updated = new Date(t.updatedAt);
        const daysSinceUpdate = (new Date() - updated) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 5;
    });
    if (stalledTasks.length > 0) {
        risks.push({
            type: 'stalled',
            severity: 'medium',
            title: `${stalledTasks.length} potentially stalled task${stalledTasks.length > 1 ? 's' : ''}`,
            description: `In-progress tasks with no updates for 5+ days`,
            items: stalledTasks.map(t => ({ id: t.id, title: t.title })),
            action: 'Check if these tasks are blocked'
        });
    }

    // Check for workload imbalance
    if (team && team.length > 1) {
        const workload = {};
        team.forEach(member => {
            workload[member.id] = tasks.filter(
                t => t.assigneeId === member.id && t.status !== 'done'
            ).length;
        });

        const loads = Object.values(workload);
        const maxLoad = Math.max(...loads);
        const minLoad = Math.min(...loads);

        if (maxLoad > 0 && maxLoad - minLoad > 5) {
            const overloadedMember = team.find(m => workload[m.id] === maxLoad);
            risks.push({
                type: 'workload-imbalance',
                severity: 'medium',
                title: 'Workload imbalance detected',
                description: `${overloadedMember?.name} has ${maxLoad} active tasks while others have ${minLoad}`,
                action: 'Consider redistributing tasks'
            });
        }
    }

    // Check for unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assigneeId && t.status !== 'done');
    if (unassignedTasks.length > 3) {
        risks.push({
            type: 'unassigned',
            severity: 'low',
            title: `${unassignedTasks.length} unassigned tasks`,
            description: `Tasks without owners may fall through the cracks`,
            items: unassignedTasks.slice(0, 5).map(t => ({ id: t.id, title: t.title })),
            action: 'Assign tasks to team members'
        });
    }

    // Check for high-priority tasks not in progress
    const blockedHighPriority = tasks.filter(t =>
        t.priority === 'high' && t.status === 'todo'
    );
    if (blockedHighPriority.length > 0) {
        const created3DaysAgo = blockedHighPriority.filter(t => {
            const created = new Date(t.createdAt);
            const daysSinceCreation = (new Date() - created) / (1000 * 60 * 60 * 24);
            return daysSinceCreation > 3;
        });

        if (created3DaysAgo.length > 0) {
            risks.push({
                type: 'priority-not-started',
                severity: 'high',
                title: `${created3DaysAgo.length} high-priority task${created3DaysAgo.length > 1 ? 's' : ''} not started`,
                description: `High-priority tasks created over 3 days ago still in To-Do`,
                items: created3DaysAgo.map(t => ({ id: t.id, title: t.title })),
                action: 'Start working on high-priority items'
            });
        }
    }

    // Sort risks by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return risks;
};

// ============ QUICK INSIGHTS ============

/**
 * Generate quick insights for dashboard display
 */
export const getQuickInsights = (tasks, projects, team) => {
    const insights = [];
    const risks = detectRisks(tasks, projects, team);
    const trends = analyzeTrends(tasks, projects);

    // Add velocity insight
    if (trends.velocity.trend === 'increasing') {
        insights.push({
            type: 'positive',
            icon: '📈',
            message: `Team velocity is up! ${trends.velocity.thisWeek} tasks completed this week vs ${trends.velocity.lastWeek} last week.`
        });
    } else if (trends.velocity.trend === 'decreasing') {
        insights.push({
            type: 'warning',
            icon: '📉',
            message: `Velocity decreased from ${trends.velocity.lastWeek} to ${trends.velocity.thisWeek} tasks this week.`
        });
    }

    // Add completion rate insight
    if (trends.completionRate.rate >= 80) {
        insights.push({
            type: 'positive',
            icon: '🎯',
            message: `Excellent! ${trends.completionRate.rate}% task completion rate.`
        });
    } else if (trends.completionRate.rate < 50 && trends.completionRate.total > 5) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            message: `Only ${trends.completionRate.rate}% of tasks completed. Consider reviewing priorities.`
        });
    }

    // Add high-severity risk alerts
    const highRisks = risks.filter(r => r.severity === 'high');
    highRisks.forEach(risk => {
        insights.push({
            type: 'danger',
            icon: '🚨',
            message: risk.title,
            action: risk.action
        });
    });

    // Add medium-severity risk alerts (limit to 2)
    const mediumRisks = risks.filter(r => r.severity === 'medium').slice(0, 2);
    mediumRisks.forEach(risk => {
        insights.push({
            type: 'warning',
            icon: '⚡',
            message: risk.title
        });
    });

    return insights.slice(0, 5); // Limit to 5 insights
};
