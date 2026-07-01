'use client';

import Card from '@/components/ui/Card';

const tones = {
    indigo: 'border-indigo-500/25 bg-indigo-500/8 text-indigo-200',
    emerald: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-200',
    amber: 'border-amber-500/25 bg-amber-500/8 text-amber-200',
    rose: 'border-rose-500/25 bg-rose-500/8 text-rose-200',
    slate: 'border-slate-700 bg-slate-800/70 text-slate-200',
};

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    tone = 'indigo',
}) {
    return (
        <Card
            padding="lg"
            className="flex min-h-[320px] flex-col items-center justify-center border-dashed text-center"
        >
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${tones[tone] ?? tones.indigo}`}>
                {Icon && <Icon className="h-9 w-9" />}
            </div>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">
                {title}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
                {description}
            </p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </Card>
    );
}
