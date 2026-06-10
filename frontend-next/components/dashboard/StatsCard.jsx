'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';

/*
 * Tone → icon container style.
 * Kept intentionally subtle — just tinted bg + border, no glow.
 */
const TONE_STYLES = {
    slate:   { icon: 'bg-slate-800   text-slate-300  border-slate-700',   accent: 'text-slate-300' },
    indigo:  { icon: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', accent: 'text-indigo-300' },
    emerald: { icon: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', accent: 'text-emerald-300' },
    amber:   { icon: 'bg-amber-500/10 text-amber-300  border-amber-500/20', accent: 'text-amber-300' },
    rose:    { icon: 'bg-red-500/10   text-red-300    border-red-500/20',   accent: 'text-red-300' },
};

const CHANGE_STYLES = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral:  'text-slate-500',
};

const StatsCard = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    tone = 'indigo',
}) => {
    const toneStyle = TONE_STYLES[tone] ?? TONE_STYLES.indigo;

    return (
        <Card padding="dashboard" className="h-full">
            {/*
             * Flex column with space-between:
             *  - Top: icon + metric
             *  - Bottom: change indicator
             * Gap between ensures padding doesn't feel cramped even at p-4.
             */}
            <div className="flex h-full flex-col justify-between gap-5">

                {/* ── Metric row ── */}
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
                        {/* text-2xl keeps the number readable without crowding the p-4 padding */}
                        <p className="text-2xl font-bold tracking-tight text-white">
                            {value}
                        </p>
                    </div>

                    {Icon && (
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneStyle.icon}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                </div>

                {/* ── Change indicator ── */}
                {change !== undefined && (
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${CHANGE_STYLES[changeType]}`}>
                        {changeType === 'positive' && <TrendingUp  className="h-3.5 w-3.5 shrink-0" />}
                        {changeType === 'negative' && <TrendingDown className="h-3.5 w-3.5 shrink-0" />}
                        <span className="text-slate-400">{change}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatsCard;
