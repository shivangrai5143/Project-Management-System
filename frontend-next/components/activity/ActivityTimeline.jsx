'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, Activity, RefreshCw } from 'lucide-react';
import { useActivity } from '@/context/ActivityContext';
import ActivityItem from './ActivityItem';

// ---------------------------------------------------------------------------
// Skeleton loader for individual items
// ---------------------------------------------------------------------------
function SkeletonItem() {
    return (
        <div className="flex gap-4 mb-4">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
                <div className="w-9 h-9 rounded-full skeleton" />
                <div className="w-px flex-1 mt-2 bg-slate-800" />
            </div>
            <div className="flex-1 rounded-xl border border-slate-800 p-4 skeleton" style={{ minHeight: 68 }} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Day separator
// ---------------------------------------------------------------------------
function DaySeparator({ date }) {
    const isToday = date === new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const isYesterday = date === new Date(Date.now() - 86400000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : date;

    return (
        <div className="flex items-center gap-3 my-6 first:mt-0">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <div
                className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                style={{
                    background:   'rgba(99,102,241,0.12)',
                    border:       '1px solid rgba(99,102,241,0.25)',
                    color:        '#a5b4fc',
                    letterSpacing: '0.02em',
                }}
            >
                {label}
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ hasFilters }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
                <Activity size={28} style={{ color: '#6366f1', opacity: 0.7 }} />
            </div>
            <div className="text-center">
                <p className="text-slate-300 font-medium mb-1">
                    {hasFilters ? 'No matching activity' : 'No activity yet'}
                </p>
                <p className="text-slate-500 text-sm">
                    {hasFilters
                        ? 'Try adjusting your filters to see more events.'
                        : 'Events will appear here as actions are taken in the system.'}
                </p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
                <AlertCircle size={24} className="text-red-400" />
            </div>
            <div className="text-center">
                <p className="text-slate-300 font-medium mb-1">Failed to load activity</p>
                <p className="text-slate-500 text-sm mb-3">{message}</p>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
                >
                    <RefreshCw size={13} />
                    Retry
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main timeline component
// ---------------------------------------------------------------------------
export default function ActivityTimeline({ scope = 'global', projectId }) {
    const {
        grouped,
        rawGrouped,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        loadTimeline,
        loadMore,
        activeFilters,
    } = useActivity();

    // IntersectionObserver sentinel for infinite scroll
    const sentinelRef = useRef(null);

    const handleLoadMore = useCallback(() => {
        loadMore({ scope, projectId });
    }, [loadMore, scope, projectId]);

    useEffect(() => {
        if (!hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) handleLoadMore();
            },
            { threshold: 0.1 }
        );

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, handleLoadMore]);

    // Reload when scope/projectId changes
    useEffect(() => {
        loadTimeline({ scope, projectId });
    }, [scope, projectId]); // eslint-disable-line react-hooks/exhaustive-deps

    const hasFilters =
        activeFilters.categories.length > 0 ||
        activeFilters.dateFrom ||
        activeFilters.dateTo;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="animate-fade-in">
                {[...Array(5)].map((_, i) => <SkeletonItem key={i} />)}
            </div>
        );
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => loadTimeline({ scope, projectId })} />;
    }

    if (grouped.length === 0) {
        return <EmptyState hasFilters={hasFilters} />;
    }

    return (
        <div className="animate-fade-in">
            {grouped.map((group, gi) => (
                <div key={group.date}>
                    <DaySeparator date={group.date} />
                    {group.events.map((event, ei) => {
                        const isLastInGroup = ei === group.events.length - 1;
                        const isLastGroup   = gi === grouped.length - 1;
                        const isLast = isLastInGroup && isLastGroup && !hasMore;
                        return (
                            <ActivityItem
                                key={event.id}
                                event={event}
                                isLast={isLast}
                            />
                        );
                    })}
                </div>
            ))}

            {/* Infinite scroll sentinel */}
            {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-6">
                    {isLoadingMore ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Loader2 size={16} className="animate-spin" />
                            Loading more...
                        </div>
                    ) : (
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                            style={{
                                background:  'rgba(99,102,241,0.1)',
                                border:      '1px solid rgba(99,102,241,0.25)',
                                color:       '#a5b4fc',
                            }}
                        >
                            Load more
                        </button>
                    )}
                </div>
            )}

            {/* End of timeline marker */}
            {!hasMore && grouped.length > 0 && (
                <div className="flex items-center justify-center py-10 gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800" />
                    <span className="text-xs text-slate-600">End of timeline</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800" />
                </div>
            )}
        </div>
    );
}
