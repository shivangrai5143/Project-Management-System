// Real GitHub API Integration
// Fetches actual activity from GitHub's public API

const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_USERNAME = 'shivangrai5143'; // Your GitHub username

// Get settings from localStorage
const getGitHubSettings = () => {
    const settings = JSON.parse(localStorage.getItem('pms_standup_settings') || '{}');
    return {
        username: settings.gitHubUsername || DEFAULT_USERNAME,
        connected: settings.gitHubConnected || false,
    };
};

// Fetch real GitHub events for a user
export const fetchGitHubActivity = async (username = null) => {
    const settings = getGitHubSettings();
    const targetUsername = username || settings.username;

    try {
        const response = await fetch(`${GITHUB_API_BASE}/users/${targetUsername}/events/public?per_page=30`);

        if (!response.ok) {
            console.error('GitHub API error:', response.status);
            return [];
        }

        const events = await response.json();
        return processGitHubEvents(events);
    } catch (error) {
        console.error('Error fetching GitHub activity:', error);
        return [];
    }
};

// Process GitHub events into activity format
const processGitHubEvents = (events) => {
    const activities = [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Group push events by repo/branch
    const pushGroups = {};
    const prEvents = [];
    const issueEvents = [];

    events.forEach(event => {
        const eventDate = new Date(event.created_at);

        // Only include events from yesterday and today
        if (eventDate < yesterday || eventDate > today) return;

        switch (event.type) {
            case 'PushEvent':
                const repoName = event.repo.name.split('/')[1];
                const branch = event.payload.ref?.replace('refs/heads/', '') || 'main';
                const key = `${repoName}:${branch}`;

                if (!pushGroups[key]) {
                    pushGroups[key] = {
                        repo: repoName,
                        branch,
                        commits: [],
                        fullRepoName: event.repo.name,
                    };
                }

                event.payload.commits?.forEach(commit => {
                    pushGroups[key].commits.push({
                        message: commit.message.split('\n')[0], // First line only
                        sha: commit.sha.substring(0, 7),
                    });
                });
                break;

            case 'PullRequestEvent':
                prEvents.push({
                    action: event.payload.action,
                    title: event.payload.pull_request.title,
                    repo: event.repo.name.split('/')[1],
                    number: event.payload.number,
                    merged: event.payload.pull_request.merged,
                    url: event.payload.pull_request.html_url,
                });
                break;

            case 'IssuesEvent':
                issueEvents.push({
                    action: event.payload.action,
                    title: event.payload.issue.title,
                    repo: event.repo.name.split('/')[1],
                    number: event.payload.issue.number,
                });
                break;

            case 'CreateEvent':
                if (event.payload.ref_type === 'branch') {
                    activities.push({
                        type: 'branch_created',
                        summary: `Created branch '${event.payload.ref}' in ${event.repo.name.split('/')[1]}`,
                        data: event.payload,
                    });
                }
                break;
        }
    });

    // Convert push groups to activities
    Object.values(pushGroups).forEach(group => {
        if (group.commits.length > 0) {
            activities.push({
                type: 'push',
                branch: group.branch,
                repo: group.repo,
                commits: group.commits,
                count: group.commits.length,
                summary: `Pushed ${group.commits.length} commit${group.commits.length > 1 ? 's' : ''} to '${group.branch}' in ${group.repo}`,
            });
        }
    });

    // Add PR activities
    prEvents.forEach(pr => {
        let action = pr.action;
        if (pr.action === 'closed' && pr.merged) action = 'merged';

        activities.push({
            type: 'pull_request',
            action,
            title: pr.title,
            repo: pr.repo,
            number: pr.number,
            url: pr.url,
            summary: `${action.charAt(0).toUpperCase() + action.slice(1)} PR #${pr.number}: "${pr.title}"`,
        });
    });

    // Add issue activities
    issueEvents.forEach(issue => {
        activities.push({
            type: 'issue',
            action: issue.action,
            title: issue.title,
            repo: issue.repo,
            number: issue.number,
            summary: `${issue.action.charAt(0).toUpperCase() + issue.action.slice(1)} issue #${issue.number}: "${issue.title}"`,
        });
    });

    return activities;
};

// Generate mock activity as fallback (for offline/rate-limited scenarios)
export const generateMockGitHubActivity = (userName) => {
    return [
        {
            type: 'push',
            branch: 'main',
            repo: 'project-management-system',
            count: 2,
            summary: "Pushed 2 commits to 'main' in project-management-system",
            commits: [
                { message: 'Update standup bot feature', sha: 'abc1234' },
                { message: 'Fix dashboard layout', sha: 'def5678' },
            ],
        },
    ];
};

// Format GitHub activities into suggestions for standup
export const formatGitHubSuggestions = (activities) => {
    return activities.map(activity => {
        switch (activity.type) {
            case 'push':
                return {
                    type: 'github_push',
                    icon: '🔀',
                    text: activity.summary,
                    data: activity,
                };
            case 'pull_request':
                const prIcon = activity.action === 'merged' ? '🎉' :
                    activity.action === 'opened' ? '📬' : '🔄';
                return {
                    type: 'github_pr',
                    icon: prIcon,
                    text: activity.summary,
                    data: activity,
                };
            case 'issue':
                return {
                    type: 'github_issue',
                    icon: '🐛',
                    text: activity.summary,
                    data: activity,
                };
            case 'branch_created':
                return {
                    type: 'github_branch',
                    icon: '🌿',
                    text: activity.summary,
                    data: activity,
                };
            default:
                return null;
        }
    }).filter(Boolean);
};

// Check if GitHub is connected
export const isGitHubConnected = () => {
    const settings = JSON.parse(localStorage.getItem('pms_standup_settings') || '{}');
    return settings.gitHubConnected || false;
};

// Get connected GitHub username
export const getGitHubUsername = () => {
    const settings = JSON.parse(localStorage.getItem('pms_standup_settings') || '{}');
    return settings.gitHubUsername || DEFAULT_USERNAME;
};

// Connect to GitHub (saves username)
export const connectGitHub = (username = DEFAULT_USERNAME) => {
    const settings = JSON.parse(localStorage.getItem('pms_standup_settings') || '{}');
    settings.gitHubConnected = true;
    settings.gitHubUsername = username;
    localStorage.setItem('pms_standup_settings', JSON.stringify(settings));
    return true;
};

// Disconnect from GitHub
export const disconnectGitHub = () => {
    const settings = JSON.parse(localStorage.getItem('pms_standup_settings') || '{}');
    settings.gitHubConnected = false;
    delete settings.gitHubUsername;
    localStorage.setItem('pms_standup_settings', JSON.stringify(settings));
    return true;
};
