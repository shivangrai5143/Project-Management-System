import { useState, useEffect } from 'react';
import { Bot, Sparkles, Play, Clock, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { useStandupBot } from '../../context/StandupBotContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import { formatDate, getRelativeTime } from '../../utils/helpers';

const StandupWidget = () => {
    const { user } = useAuth();
    const {
        settings,
        standupHistory,
        triggerStandup,
        getTodayStandup,
        checkStandupTime,
    } = useStandupBot();

    const [todayStandup, setTodayStandup] = useState(null);

    // Check for standup time periodically
    useEffect(() => {
        if (!user) return;

        const checkTime = () => {
            checkStandupTime(user.id, user.name);
        };

        // Initial check
        checkTime();

        // Check every minute
        const interval = setInterval(checkTime, 60000);

        return () => clearInterval(interval);
    }, [user, checkStandupTime]);

    // Update today's standup
    useEffect(() => {
        setTodayStandup(getTodayStandup());
    }, [getTodayStandup, standupHistory]);

    const handleTriggerNow = () => {
        if (user) {
            triggerStandup(user.id, user.name, true);
        }
    };

    // Get recent standups (last 7 days)
    const recentStandups = standupHistory.slice(-7).reverse();

    // Calculate streak
    const calculateStreak = () => {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const hasStandup = standupHistory.some(
                entry => new Date(entry.submittedAt).toDateString() === checkDate.toDateString()
            );

            if (hasStandup || i === 0) {
                if (hasStandup) streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const streak = calculateStreak();

    return (
        <Card padding="lg" className="relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">Daily Standup</h3>
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                            Scheduled at {settings.standupTime}
                        </p>
                    </div>
                </div>

                {/* Streak Badge */}
                {streak > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-medium text-amber-400">{streak} day streak</span>
                    </div>
                )}
            </div>

            {/* Today's Status */}
            <div className="relative z-10">
                {todayStandup ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">Completed today</span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">
                            {todayStandup.response}
                        </p>
                        <span className="text-xs text-slate-500 mt-2 block">
                            Submitted {getRelativeTime(todayStandup.submittedAt)}
                        </span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-400">Not submitted yet</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                Share what you worked on yesterday
                            </p>
                        </div>

                        <button
                            onClick={handleTriggerNow}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                        >
                            <Play className="w-4 h-4" />
                            Start Standup Now
                        </button>
                    </div>
                )}
            </div>

            {/* Recent History */}
            {recentStandups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-400">Recent Standups</span>
                    </div>
                    <div className="flex gap-1">
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
                                        flex-1 h-8 rounded-lg flex items-center justify-center text-xs
                                        ${hasStandup
                                            ? 'bg-indigo-500/30 border border-indigo-500/50 text-indigo-300'
                                            : 'bg-slate-800/50 border border-slate-700/30 text-slate-500'
                                        }
                                        ${isToday ? 'ring-2 ring-indigo-500/50 ring-offset-1 ring-offset-slate-900' : ''}
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
        </Card>
    );
};

export default StandupWidget;
