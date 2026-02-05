import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { standupsApi } from '../utils/api';
import { generateId } from '../utils/helpers';
import {
    getYesterdayActivities,
    getTodayActivities,
    generateActivitySummary,
    generateSuggestions,
} from '../utils/activityTracker';
import {
    generateMockGitHubActivity,
    fetchGitHubActivity,
    formatGitHubSuggestions,
    isGitHubConnected,
} from '../utils/githubSimulator';

const StandupBotContext = createContext();

export const useStandupBot = () => {
    const context = useContext(StandupBotContext);
    if (!context) {
        throw new Error('useStandupBot must be used within a StandupBotProvider');
    }
    return context;
};

const DEFAULT_SETTINGS = {
    enabled: true,
    standupTime: '09:00',
    enabledProjects: [],
    gitHubConnected: false,
    showGitHubSuggestions: true,
    autoSuggest: true,
    snoozeDuration: 30,
};

// Check if we should use API or localStorage fallback
const USE_API = false; // Set to true when backend is deployed

export const StandupBotProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [standupHistory, setStandupHistory] = useState([]);
    const [isStandupActive, setIsStandupActive] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState([]);
    const [snoozedUntil, setSnoozedUntil] = useState(null);
    const [lastTriggeredDate, setLastTriggeredDate] = useState(null);
    const schedulerRef = useRef(null);

    // Load settings and history from storage
    useEffect(() => {
        const savedSettings = getItem(STORAGE_KEYS.STANDUP_SETTINGS);
        const savedHistory = getItem(STORAGE_KEYS.STANDUP_HISTORY);

        if (savedSettings) {
            setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
        }
        if (savedHistory) {
            setStandupHistory(savedHistory);
        }
    }, []);

    // Save settings to storage
    const saveSettings = useCallback((newSettings) => {
        setSettings(newSettings);
        setItem(STORAGE_KEYS.STANDUP_SETTINGS, newSettings);
    }, []);

    // Save history to storage
    const saveHistory = useCallback((newHistory) => {
        // Keep only last 30 standups
        const trimmed = newHistory.slice(-30);
        setStandupHistory(trimmed);
        setItem(STORAGE_KEYS.STANDUP_HISTORY, trimmed);
    }, []);

    // Update settings
    const updateSettings = useCallback((updates) => {
        const newSettings = { ...settings, ...updates };
        saveSettings(newSettings);
    }, [settings, saveSettings]);

    // Generate suggestions based on activity (now async for real GitHub API)
    const generateStandupSuggestions = useCallback(async (userId, userName) => {
        const suggestions = [];

        // Get task activity suggestions
        const yesterdayActivities = getYesterdayActivities(userId);
        const todayActivities = getTodayActivities(userId);

        // Combine activities (prioritize yesterday, include early today)
        const allActivities = [...yesterdayActivities, ...todayActivities];

        if (allActivities.length > 0) {
            const summary = generateActivitySummary(allActivities);
            const taskSuggestions = generateSuggestions(summary);
            suggestions.push(...taskSuggestions);
        }

        // Add GitHub suggestions if connected - now uses real API
        if (isGitHubConnected() && settings.showGitHubSuggestions) {
            try {
                const githubActivities = await fetchGitHubActivity();
                if (githubActivities.length > 0) {
                    const githubSuggestions = formatGitHubSuggestions(githubActivities);
                    suggestions.push(...githubSuggestions);
                } else {
                    // Fallback to mock if no recent activity
                    const mockActivities = generateMockGitHubActivity(userName);
                    const githubSuggestions = formatGitHubSuggestions(mockActivities);
                    suggestions.push(...githubSuggestions);
                }
            } catch (error) {
                console.error('Failed to fetch GitHub activity:', error);
                // Fallback to mock data
                const mockActivities = generateMockGitHubActivity(userName);
                const githubSuggestions = formatGitHubSuggestions(mockActivities);
                suggestions.push(...githubSuggestions);
            }
        }

        return suggestions;
    }, [settings.showGitHubSuggestions]);

    // Trigger standup prompt (now async)
    const triggerStandup = useCallback(async (userId, userName, force = false) => {
        // Check if already triggered today (unless forced)
        const today = new Date().toDateString();
        if (!force && lastTriggeredDate === today) {
            return false;
        }

        // Check if snoozed
        if (!force && snoozedUntil && new Date() < new Date(snoozedUntil)) {
            return false;
        }

        // Generate suggestions (async)
        const suggestions = await generateStandupSuggestions(userId, userName);
        setCurrentSuggestions(suggestions);
        setIsStandupActive(true);
        setLastTriggeredDate(today);
        setSnoozedUntil(null);

        return true;
    }, [generateStandupSuggestions, lastTriggeredDate, snoozedUntil]);

    // Submit standup response
    const submitStandupResponse = useCallback(async (userId, userName, response, selectedSuggestions = []) => {
        const standupEntry = {
            id: generateId(),
            userId,
            userName,
            response,
            selectedSuggestions,
            submittedAt: new Date().toISOString(),
            suggestions: currentSuggestions,
        };

        // Try to save to API if enabled
        if (USE_API) {
            try {
                await standupsApi.submit(response, selectedSuggestions, currentSuggestions);
            } catch (err) {
                console.error('Failed to save standup to API:', err);
            }
        }

        // Always save to local history
        const newHistory = [...standupHistory, standupEntry];
        saveHistory(newHistory);
        setIsStandupActive(false);
        setCurrentSuggestions([]);

        return standupEntry;
    }, [standupHistory, currentSuggestions, saveHistory]);

    // Dismiss standup
    const dismissStandup = useCallback((snooze = false) => {
        if (snooze) {
            const snoozeTime = new Date();
            snoozeTime.setMinutes(snoozeTime.getMinutes() + settings.snoozeDuration);
            setSnoozedUntil(snoozeTime.toISOString());
        }
        setIsStandupActive(false);
        setCurrentSuggestions([]);
    }, [settings.snoozeDuration]);

    // Get today's standup (if submitted)
    const getTodayStandup = useCallback(() => {
        const today = new Date().toDateString();
        return standupHistory.find(
            entry => new Date(entry.submittedAt).toDateString() === today
        );
    }, [standupHistory]);

    // Check if standup time has passed
    const checkStandupTime = useCallback((userId, userName) => {
        if (!settings.enabled) return false;

        const now = new Date();
        const [hours, minutes] = settings.standupTime.split(':').map(Number);
        const standupTime = new Date();
        standupTime.setHours(hours, minutes, 0, 0);

        // Check if we're within 5 minutes after standup time
        const diffMs = now - standupTime;
        const diffMins = diffMs / (1000 * 60);

        // Trigger if within 5-minute window after standup time
        if (diffMins >= 0 && diffMins <= 5) {
            return triggerStandup(userId, userName);
        }

        return false;
    }, [settings.enabled, settings.standupTime, triggerStandup]);

    // Setup scheduler
    useEffect(() => {
        // Clear existing scheduler
        if (schedulerRef.current) {
            clearInterval(schedulerRef.current);
        }

        // Check every minute
        schedulerRef.current = setInterval(() => {
            // The actual check will be done by components with user context
        }, 60000);

        return () => {
            if (schedulerRef.current) {
                clearInterval(schedulerRef.current);
            }
        };
    }, []);

    return (
        <StandupBotContext.Provider value={{
            // State
            settings,
            standupHistory,
            isStandupActive,
            currentSuggestions,
            snoozedUntil,

            // Actions
            updateSettings,
            triggerStandup,
            submitStandupResponse,
            dismissStandup,
            getTodayStandup,
            checkStandupTime,
            generateStandupSuggestions,
        }}>
            {children}
        </StandupBotContext.Provider>
    );
};
