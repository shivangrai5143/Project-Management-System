'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { eachDayOfInterval, format, isSameDay, startOfDay, subDays } from 'date-fns';
import { useTasks } from '@/context/TaskContext';
import { useProjects } from '@/context/ProjectContext';
import Card from '@/components/ui/Card';
import { ChartErrorBoundary } from '@/components/ui/ErrorBoundary';

/* ─── Custom dark-mode tooltip (Stripe style) ─── */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm shadow-xl">
            <p className="mb-2 font-medium text-white">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-400 capitalize">{entry.dataKey}:</span>
                    <span className="font-medium text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ─── ResizeObserver hook — only fires when real dimensions exist ─── */
const useContainerSize = () => {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setSize({ width: Math.floor(width), height: Math.floor(height) });
                }
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, ...size };
};

/* ─── Chart wrapper card — uses ResizeObserver, not ResponsiveContainer ─── */
const ChartCard = ({ title, subtitle, legend, children, className = '' }) => {
    const { ref, width, height } = useContainerSize();
    const ready = width > 0 && height > 0;

    return (
        <Card padding="dashboard" className={className}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    {subtitle && (
                        <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
                    )}
                </div>
                {legend && (
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        {legend}
                    </div>
                )}
            </div>
            <div ref={ref} className="mt-5 w-full overflow-hidden" style={{ height: 280 }}>
                {ready ? (
                    <ChartErrorBoundary>
                        {typeof children === 'function'
                            ? children({ width, height })
                            : children}
                    </ChartErrorBoundary>
                ) : (
                    <div className="skeleton h-full w-full rounded-xl" />
                )}
            </div>
        </Card>
    );
};

/* ─── Legend dot ─── */
const LegendDot = ({ color, label }) => (
    <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
        {label}
    </div>
);

/* ─── Build 7-day task completion data ─── */
const buildCompletionData = (tasks) => {
    const end = startOfDay(new Date());
    const days = eachDayOfInterval({ start: subDays(end, 6), end });

    return days.map((day) => ({
        label: format(day, 'EEE'),
        created: tasks.filter(
            t => t.createdAt && isSameDay(new Date(t.createdAt), day)
        ).length,
        completed: tasks.filter(
            t => t.status === 'done' && t.updatedAt && isSameDay(new Date(t.updatedAt), day)
        ).length,
    }));
};

/* ─── Simulated sprint velocity data (6 sprints) ─── */
const buildVelocityData = (tasks) => {
    const total = tasks.length;
    const base = Math.max(3, Math.floor(total / 6));

    return ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'].map(
        (name, i) => ({
            name,
            planned: base + Math.floor(Math.sin(i * 1.2) * 3) + 4,
            completed: base + Math.floor(Math.cos(i * 0.8) * 2) + 2,
        })
    );
};

/* ─── Build team workload data ─── */
const buildWorkloadData = (tasks, getTeamMember) => {
    const assigneeCounts = {};
    tasks.forEach(t => {
        if (t.assigneeId && t.status !== 'done') {
            assigneeCounts[t.assigneeId] = (assigneeCounts[t.assigneeId] || 0) + 1;
        }
    });

    return Object.entries(assigneeCounts)
        .map(([id, count]) => {
            const member = getTeamMember(id);
            return {
                name: member?.name?.split(' ')[0] || 'Unknown',
                tasks: count,
            };
        })
        .sort((a, b) => b.tasks - a.tasks)
        .slice(0, 6);
};

/* ─── Build bug resolution data ─── */
const buildBugData = (tasks) => {
    const end = startOfDay(new Date());
    const days = eachDayOfInterval({ start: subDays(end, 6), end });

    const bugTasks = tasks.filter(
        t => t.labels?.includes('bug')
    );

    return days.map((day) => ({
        label: format(day, 'EEE'),
        opened: bugTasks.filter(
            t => t.createdAt && isSameDay(new Date(t.createdAt), day)
        ).length,
        resolved: bugTasks.filter(
            t => t.status === 'done' && t.updatedAt && isSameDay(new Date(t.updatedAt), day)
        ).length,
    }));
};

/* ─── Workload bar colors ─── */
const WORKLOAD_COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];

/* ════════════════════════════════════════════════════════════
   AnalyticsGrid — 4 charts in a 2×2 grid
   ════════════════════════════════════════════════════════════ */
const AnalyticsGrid = () => {
    const { tasks } = useTasks();
    const { getTeamMember } = useProjects();

    const completionData = useMemo(() => buildCompletionData(tasks), [tasks]);
    const velocityData   = useMemo(() => buildVelocityData(tasks), [tasks]);
    const workloadData   = useMemo(() => buildWorkloadData(tasks, getTeamMember), [tasks, getTeamMember]);
    const bugData        = useMemo(() => buildBugData(tasks), [tasks]);

    const gridCommon = {
        vertical: false,
        stroke: '#1e293b',
        strokeDasharray: '4 4',
    };

    const axisCommon = {
        axisLine: false,
        tickLine: false,
        tick: { fill: '#64748b', fontSize: 11 },
    };

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* ── 1. Task Completion Trend ── */}
            <ChartCard
                title="Task completion trend"
                subtitle="Tasks created vs completed — 7 day rolling."
                legend={
                    <>
                        <LegendDot color="#818cf8" label="Completed" />
                        <LegendDot color="#34d399" label="Created" />
                    </>
                }
            >
                {({ width, height }) => (
                    <AreaChart width={width} height={height} data={completionData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid {...gridCommon} />
                        <XAxis dataKey="label" {...axisCommon} />
                        <YAxis allowDecimals={false} {...axisCommon} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="completed" stroke="#818cf8" strokeWidth={2} fill="url(#gradCompleted)" />
                        <Area type="monotone" dataKey="created"   stroke="#34d399" strokeWidth={2} fill="url(#gradCreated)" />
                    </AreaChart>
                )}
            </ChartCard>

            {/* ── 2. Sprint Velocity ── */}
            <ChartCard
                title="Sprint velocity"
                subtitle="Story points planned vs completed per sprint."
                legend={
                    <>
                        <LegendDot color="#818cf8" label="Planned" />
                        <LegendDot color="#a78bfa" label="Completed" />
                    </>
                }
            >
                {({ width, height }) => (
                    <BarChart width={width} height={height} data={velocityData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                        <CartesianGrid {...gridCommon} />
                        <XAxis dataKey="name" {...axisCommon} />
                        <YAxis allowDecimals={false} {...axisCommon} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="planned"   fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="completed" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                )}
            </ChartCard>

            {/* ── 3. Team Workload ── */}
            <ChartCard
                title="Team workload"
                subtitle="Active tasks per team member."
            >
                {({ width, height }) => (
                    <BarChart
                        width={width}
                        height={height}
                        data={workloadData}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                    >
                        <CartesianGrid horizontal={false} stroke="#1e293b" strokeDasharray="4 4" />
                        <XAxis type="number" allowDecimals={false} {...axisCommon} />
                        <YAxis type="category" dataKey="name" width={64} {...axisCommon} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="tasks" radius={[0, 4, 4, 0]} barSize={24}>
                            {workloadData.map((_, i) => (
                                <Cell key={i} fill={WORKLOAD_COLORS[i % WORKLOAD_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ChartCard>

            {/* ── 4. Bug Resolution Trend ── */}
            <ChartCard
                title="Bug resolution trend"
                subtitle="Bugs opened vs resolved — 7 day rolling."
                legend={
                    <>
                        <LegendDot color="#f87171" label="Opened" />
                        <LegendDot color="#34d399" label="Resolved" />
                    </>
                }
            >
                {({ width, height }) => (
                    <AreaChart width={width} height={height} data={bugData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradBugOpened" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f87171" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradBugResolved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid {...gridCommon} />
                        <XAxis dataKey="label" {...axisCommon} />
                        <YAxis allowDecimals={false} {...axisCommon} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="opened"   stroke="#f87171" strokeWidth={2} fill="url(#gradBugOpened)" />
                        <Area type="monotone" dataKey="resolved" stroke="#34d399" strokeWidth={2} fill="url(#gradBugResolved)" />
                    </AreaChart>
                )}
            </ChartCard>
        </div>
    );
};

export default AnalyticsGrid;
