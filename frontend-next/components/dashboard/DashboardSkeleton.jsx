'use client';

/**
 * DashboardSkeleton
 * -----------------
 * Full-page skeleton loader matching the redesigned dashboard layout.
 * Renders shimmer placeholders for every section so the UI feels
 * intentional while data loads — a Stripe / Linear pattern.
 *
 * Uses the `.skeleton` utility from globals.css (shimmer gradient animation).
 */

const Pulse = ({ className = '' }) => (
    <div className={`skeleton rounded-xl ${className}`} />
);

const CardSkeleton = ({ className = '' }) => (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 lg:p-6 ${className}`}>
        {/* Accent bar */}
        <div className="skeleton mb-4 h-[3px] w-full rounded-full" />
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-9 w-9 rounded-xl" />
        </div>
        {/* Value */}
        <Pulse className="mt-4 h-8 w-16" />
        {/* Change */}
        <Pulse className="mt-3 h-3 w-28" />
    </div>
);

const ChartSkeleton = ({ className = '' }) => (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 lg:p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
            <div>
                <Pulse className="h-4 w-32" />
                <Pulse className="mt-2 h-3 w-48" />
            </div>
            <div className="flex items-center gap-3">
                <Pulse className="h-3 w-16" />
                <Pulse className="h-3 w-16" />
            </div>
        </div>
        {/* Chart area */}
        <div className="mt-6 flex items-end gap-2">
            {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
                <div key={i} className="flex-1">
                    <Pulse className="w-full rounded-t-md" style={{ height: `${h * 2.5}px` }} />
                </div>
            ))}
        </div>
        <Pulse className="mt-3 h-[1px] w-full" />
    </div>
);

const ListSkeleton = ({ rows = 5, className = '' }) => (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 lg:p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
                <Pulse className="h-10 w-10 rounded-xl" />
                <div>
                    <Pulse className="h-4 w-28" />
                    <Pulse className="mt-2 h-3 w-40" />
                </div>
            </div>
            <Pulse className="h-5 w-8 rounded-full" />
        </div>
        {/* List rows */}
        <div className="mt-5 space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
                    <Pulse className="h-2 w-2 rounded-full" />
                    <div className="flex-1">
                        <Pulse className="h-3.5 w-3/4" />
                        <Pulse className="mt-2 h-2.5 w-1/2" />
                    </div>
                    <Pulse className="h-5 w-14 rounded-full" />
                </div>
            ))}
        </div>
    </div>
);

const DashboardSkeleton = () => (
    <div className="space-y-6 animate-fade-in">

        {/* ── Welcome header skeleton ── */}
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Pulse className="h-2.5 w-20" />
                    <Pulse className="mt-3 h-7 w-40" />
                    <Pulse className="mt-3 h-3.5 w-64" />
                </div>
                <div className="flex items-center gap-2">
                    <Pulse className="h-6 w-20 rounded-full" />
                    <Pulse className="h-6 w-24 rounded-full" />
                    <Pulse className="h-6 w-20 rounded-full" />
                </div>
            </div>
            {/* Quick actions */}
            <div className="flex items-center gap-2 border-t border-slate-800/60 pt-4">
                <Pulse className="h-8 w-28 rounded-lg" />
                <Pulse className="h-8 w-24 rounded-lg" />
                <Pulse className="h-8 w-24 rounded-lg" />
                <Pulse className="h-8 w-20 rounded-lg" />
            </div>
        </section>

        {/* ── KPI cards skeleton — 5 across ── */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </section>

        {/* ── Analytics skeleton — 2×2 grid ── */}
        <section className="space-y-3">
            <div>
                <Pulse className="h-2.5 w-16" />
                <Pulse className="mt-2 h-5 w-36" />
                <Pulse className="mt-1.5 h-3 w-56" />
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </section>

        {/* ── Activity + Deadlines skeleton ── */}
        <section className="space-y-3">
            <div>
                <Pulse className="h-2.5 w-16" />
                <Pulse className="mt-2 h-5 w-36" />
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <ListSkeleton rows={6} />
                <ListSkeleton rows={5} />
            </div>
        </section>

        {/* ── AI + Standup skeleton ── */}
        <section className="space-y-3">
            <div>
                <Pulse className="h-2.5 w-16" />
                <Pulse className="mt-2 h-5 w-36" />
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <ListSkeleton rows={3} />
                <ListSkeleton rows={3} />
            </div>
        </section>
    </div>
);

export default DashboardSkeleton;
