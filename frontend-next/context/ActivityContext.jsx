'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    fetchTimeline,
    logActivityDirect,
    subscribeToTimeline,
    groupEventsByDay,
    ACTIVITY_ACTIONS,
} from '@/services/activityService';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ActivityContext = createContext(null);

export function useActivity() {
    const ctx = useContext(ActivityContext);
    if (!ctx) throw new Error('useActivity must be used within an ActivityProvider');
    return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ActivityProvider({ children }) {
    const { user, isAuthenticated } = useAuth();

    // Global timeline state
    const [events,     setEvents]     = useState([]);
    const [grouped,    setGrouped]    = useState([]);
    const [isLoading,  setIsLoading]  = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error,      setError]      = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore,    setHasMore]    = useState(false);

    // Filter state
    const [activeFilters, setActiveFilters] = useState({
        categories: [],   // [] = all
        dateFrom:   null,
        dateTo:     null,
    });

    // Abort controller ref — cancel in-flight fetches on unmount
    const abortRef = useRef(null);

    // ---------------------------------------------------------------------------
    // Load initial page from backend
    // ---------------------------------------------------------------------------
    const loadTimeline = useCallback(async ({ scope = 'global', projectId, userId, reset = true } = {}) => {
        if (!isAuthenticated) return;
        if (abortRef.current) abortRef.current.abort();

        setIsLoading(true);
        setError(null);
        if (reset) {
            setEvents([]);
            setNextCursor(null);
            setHasMore(false);
        }

        try {
            const data = await fetchTimeline({ scope, projectId, userId, limit: 20 });
            const newEvents = data.events || [];
            setEvents(newEvents);
            setGrouped(groupEventsByDay(newEvents));
            setNextCursor(data.nextCursor || null);
            setHasMore(data.hasMore || false);
        } catch (err) {
            console.error('[ActivityContext] Load error:', err);
            setError(err.message || 'Failed to load activity');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // ---------------------------------------------------------------------------
    // Load next page (infinite scroll)
    // ---------------------------------------------------------------------------
    const loadMore = useCallback(async ({ scope = 'global', projectId, userId } = {}) => {
        if (!hasMore || isLoadingMore || !nextCursor) return;

        setIsLoadingMore(true);
        try {
            const data = await fetchTimeline({ scope, projectId, userId, limit: 20, cursor: nextCursor });
            const moreEvents = data.events || [];
            setEvents(prev => {
                const combined = [...prev, ...moreEvents];
                setGrouped(groupEventsByDay(combined));
                return combined;
            });
            setNextCursor(data.nextCursor || null);
            setHasMore(data.hasMore || false);
        } catch (err) {
            console.error('[ActivityContext] Load more error:', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, nextCursor]);

    // ---------------------------------------------------------------------------
    // Log a client-side event (comment, file upload, sprint)
    // ---------------------------------------------------------------------------
    const logActivity = useCallback(async (params) => {
        if (!user) return null;
        try {
            const entry = await logActivityDirect({
                actorId:    user.id,
                actorName:  user.name,
                actorAvatar: user.avatar || null,
                ...params,
            });
            // Prepend to local state for instant feedback
            setEvents(prev => {
                const updated = [entry, ...prev];
                setGrouped(groupEventsByDay(updated));
                return updated;
            });
            return entry;
        } catch (err) {
            console.error('[ActivityContext] logActivity error:', err);
            return null;
        }
    }, [user]);

    // ---------------------------------------------------------------------------
    // Computed: apply client-side filters
    // ---------------------------------------------------------------------------
    const filteredGrouped = grouped.map(group => ({
        ...group,
        events: group.events.filter(event => {
            // Category filter
            if (activeFilters.categories.length > 0) {
                const category = event.action?.split('.')[0];
                if (!activeFilters.categories.includes(category)) return false;
            }
            // Date range filter
            const ts = new Date(event.createdAt);
            if (activeFilters.dateFrom && ts < new Date(activeFilters.dateFrom)) return false;
            if (activeFilters.dateTo   && ts > new Date(activeFilters.dateTo + 'T23:59:59')) return false;
            return true;
        }),
    })).filter(g => g.events.length > 0);

    // ---------------------------------------------------------------------------
    // Load on auth
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (isAuthenticated) {
            loadTimeline();
        }
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <ActivityContext.Provider value={{
            // Data
            events,
            grouped: filteredGrouped,
            rawGrouped: grouped,
            isLoading,
            isLoadingMore,
            error,
            hasMore,
            nextCursor,
            // Actions
            loadTimeline,
            loadMore,
            logActivity,
            // Filters
            activeFilters,
            setActiveFilters,
            // Constants re-exported for convenience
            ACTIVITY_ACTIONS,
        }}>
            {children}
        </ActivityContext.Provider>
    );
}
