'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock, Clock } from 'lucide-react';
import { differenceInDays, differenceInHours, isPast, isToday, isTomorrow } from 'date-fns';
import { useTasks } from '@/context/TaskContext';
import { useProjects } from '@/context/ProjectContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/helpers';

/*
 * Countdown text + urgency level for a given due date.
 * Returns { text, level } where level ∈ { 'critical' | 'warning' | 'safe' }.
 */
const getCountdown = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();

    if (isPast(due) && !isToday(due)) {
        const days = Math.abs(differenceInDays(due, now));
        return { text: `${days}d overdue`, level: 'critical' };
    }
    if (isToday(due)) {
        const hours = Math.max(0, differenceInHours(due, now));
        return { text: hours > 0 ? `${hours}h left` : 'Due now', level: 'critical' };
    }
    if (isTomorrow(due)) {
        return { text: 'Tomorrow', level: 'warning' };
    }

    const days = differenceInDays(due, now);
    if (days <= 3) return { text: `${days}d left`, level: 'warning' };
    return { text: `${days}d left`, level: 'safe' };
};

const LEVEL_STYLES = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/20',
    warning:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
    safe:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
};

const UpcomingDeadlines = () => {
    const { tasks } = useTasks();
    const { projects } = useProjects();

    const projectNameById = useMemo(
        () => Object.fromEntries(projects.map(p => [p.id, p.name])),
        [projects]
    );

    const upcoming = useMemo(() => {
        const now = new Date();
        return tasks
            .filter(t => t.dueDate && t.status !== 'done')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 6);
    }, [tasks]);

    return (
        <Card padding="dashboard" className="h-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                        <CalendarClock className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Upcoming deadlines</h3>
                        <p className="mt-0.5 text-sm text-slate-400">
                            Tasks with the nearest due dates.
                        </p>
                    </div>
                </div>
                <Badge variant="default" size="md">{upcoming.length}</Badge>
            </div>

            {/* List */}
            {upcoming.length === 0 ? (
                <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-800 bg-slate-800/30 p-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">No upcoming deadlines</p>
                        <p className="mt-1 text-xs text-slate-500">
                            All tasks are either completed or have no due dates set.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="mt-5 space-y-2">
                    {upcoming.map((task) => {
                        const countdown = getCountdown(task.dueDate);
                        return (
                            <div
                                key={task.id}
                                className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 transition-colors hover:border-slate-700 hover:bg-slate-800/60"
                            >
                                {/* Timeline dot */}
                                <div className={`h-2 w-2 shrink-0 rounded-full ${
                                    countdown.level === 'critical' ? 'bg-red-400' :
                                    countdown.level === 'warning' ? 'bg-amber-400' :
                                    'bg-emerald-400'
                                }`} />

                                {/* Task info */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">
                                        {task.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {projectNameById[task.projectId] || 'General'} · {formatDate(task.dueDate)}
                                    </p>
                                </div>

                                {/* Countdown badge */}
                                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${LEVEL_STYLES[countdown.level]}`}>
                                    {countdown.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer link */}
            <div className="mt-4 border-t border-slate-800/60 pt-3">
                <Link
                    href="/tasks"
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                    View all tasks
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
            </div>
        </Card>
    );
};

export default UpcomingDeadlines;
