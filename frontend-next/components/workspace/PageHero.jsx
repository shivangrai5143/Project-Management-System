'use client';

import Card from '@/components/ui/Card';

const tones = {
    indigo: {
        badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200',
        orb: 'from-indigo-500/18 via-fuchsia-500/8 to-transparent',
    },
    emerald: {
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        orb: 'from-emerald-500/18 via-cyan-500/8 to-transparent',
    },
    amber: {
        badge: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        orb: 'from-amber-500/18 via-rose-500/8 to-transparent',
    },
    rose: {
        badge: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
        orb: 'from-rose-500/18 via-orange-500/8 to-transparent',
    },
    slate: {
        badge: 'border-slate-700 bg-slate-800/80 text-slate-200',
        orb: 'from-slate-500/15 via-slate-400/8 to-transparent',
    },
};

export default function PageHero({
    eyebrow,
    title,
    description,
    actions,
    meta = [],
    tone = 'indigo',
}) {
    const theme = tones[tone] ?? tones.indigo;

    return (
        <Card
            variant="gradient"
            padding="lg"
            className="relative overflow-hidden border-slate-800/80 bg-slate-900/92"
        >
            <div className={`pointer-events-none absolute right-[-96px] top-[-96px] h-60 w-60 rounded-full bg-gradient-to-br blur-3xl ${theme.orb}`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_45%,rgba(124,58,237,0.04))]" />

            <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        {eyebrow && (
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${theme.badge}`}>
                                {eyebrow}
                            </span>
                        )}
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                                {description}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                            {actions}
                        </div>
                    )}
                </div>

                {meta.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {meta.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
                            >
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-xl font-semibold tracking-tight text-white">
                                    {item.value}
                                </p>
                                {item.hint && (
                                    <p className="mt-1 text-xs text-slate-400">
                                        {item.hint}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
