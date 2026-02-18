import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { standupsService } from '../services/firestore';
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
import { useAuth } from './AuthContext';

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

export const StandupBotProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [standupHistory, setStandupHistory] = useState([]);
    const [isStandupActive, setIsStandupActive] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState([]);
    const [snoozedUntil, setSnoozedUntil] = useState(null);
    const [lastTriggeredDate, setLastTriggeredDate] = useState(null);
    const schedulerRef = useRef(null);
    const { user } = useAuth();

    // Load settings and history from Firestore
    useEffect(() => {
        if (!user?.id) return;

        // Load settings
        standupsService.getSettings(user.id).then((savedSettings) => {
            if (savedSettings) {
                setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
            }
        });

        // Listen to standup history
        const unsub = standupsService.onStandupsChange(user.id, (standups) => {
            setStandupHistory(standups);
        });

        return () => unsub();
    }, [user?.id]);

    // Save settings to Firestore
    const saveSettings = useCallback(async (newSettings) => {
        setSettings(newSettings);
        if (user?.id) {
            try {
                await standupsService.saveSettings(user.id, newSettings);
            } catch (err) {
                console.error('Failed to save standup settings:', err);
            }
        }
    }, [user?.id]);

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

    // Submit standup response to Firestore
    const submitStandupResponse = useCallback(async (userId, userName, response, selectedSuggestions = []) => {
        try {
            const standupEntry = await standupsService.submit({
                userId,
                userName,
                response,
                selectedSuggestions,
                suggestions: currentSuggestions,
            });

            setIsStandupActive(false);
            setCurrentSuggestions([]);

            return standupEntry;
        } catch (err) {
            console.error('Failed to save standup:', err);
            // Fallback: still close the standup UI
            setIsStandupActive(false);
            setCurrentSuggestions([]);
            return null;
        }
    }, [currentSuggestions]);

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
