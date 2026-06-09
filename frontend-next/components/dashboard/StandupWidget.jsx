'use client';

import { useEffect } from 'react';
import { Bot, Calendar, CheckCircle2, Clock, Play, TrendingUp } from 'lucide-react';
import { useStandupBot } from '@/context/StandupBotContext';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { formatDate, getRelativeTime } from '@/utils/helpers';

const StandupWidget = () => {
    const { user } = useAuth();
    const {
        settings,
        standupHistory,
        triggerStandup,
        getTodayStandup,
        checkStandupTime,
    } = useStandupBot();

    useEffect(() => {
        if (!user) return;

        const checkTime = () => {
            checkStandupTime(user.id, user.name);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000);

        return () => clearInterval(interval);
    }, [user, checkStandupTime]);

    const handleTriggerNow = () => {
        if (user) {
            triggerStandup(user.id, user.name, true);
        }
    };

    const todayStandup = getTodayStandup();
    const recentStandups = standupHistory.slice(-7).reverse();

    const calculateStreak = () => {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i += 1) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const hasStandup = standupHistory.some(
                entry => new Date(entry.submittedAt).toDateString() === checkDate.toDateString()
            );

            if (hasStandup || i === 0) {
                if (hasStandup) streak += 1;
            } else {
                break;
            }
        }

        return streak;
    };

    const streak = calculateStreak();

    return (
        <Card padding="dashboard" className="h-full">
            <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">Daily Standup</p>
                            <h3 className="mt-1 text-xl font-semibold text-white">Capture progress before the day gets busy</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Scheduled for {settings.standupTime}. Share highlights, blockers, and next steps in one place.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="primary" size="md">
                            {settings.standupTime}
                        </Badge>
                        {streak > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {streak} day streak
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex-1 rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                    {todayStandup ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">Submitted today</span>
                            </div>
                            <p className="line-clamp-3 text-sm leading-6 text-slate-300">
                                {todayStandup.response}
                            </p>
                            <p className="text-xs text-slate-500">
                                Submitted {getRelativeTime(todayStandup.submittedAt)}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">Not submitted yet</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-400">
                                    Share what you worked on yesterday and flag blockers before the next handoff.
                                </p>
                            </div>
                            <button
                                onClick={handleTriggerNow}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
                            >
                                <Play className="h-4 w-4" />
                                Start standup
                            </button>
                        </div>
                    )}
                </div>

                {recentStandups.length > 0 && (
                    <div className="mt-6 border-t border-slate-800 pt-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-400">
                            <Calendar className="h-4 w-4" />
                            Recent submissions
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (6 - i));
                                const hasStandup = standupHistory.some(
                                    entry => new Date(entry.submittedAt).toDateString() === date.toDateString()
                                );
                                const isToday = date.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={i}
                                        className={`
                                            flex h-10 items-center justify-center rounded-xl border text-xs font-medium
                                            ${hasStandup
                                                ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
                                                : 'border-slate-800 bg-slate-800/40 text-slate-500'
                                            }
                                            ${isToday ? 'ring-1 ring-indigo-500/50' : ''}
                                        `}
                                        title={formatDate(date)}
                                    >
                                        {date.getDate()}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StandupWidget;
