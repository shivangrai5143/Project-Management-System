'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';

const TONE_STYLES = {
    slate: {
        icon: 'bg-slate-800 text-slate-200 border-slate-700',
        value: 'text-white',
    },
    indigo: {
        icon: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        value: 'text-white',
    },
    emerald: {
        icon: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        value: 'text-white',
    },
    amber: {
        icon: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        value: 'text-white',
    },
    rose: {
        icon: 'bg-red-500/10 text-red-300 border-red-500/20',
        value: 'text-white',
    },
};

const StatsCard = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    tone = 'indigo',
}) => {
    const toneStyle = TONE_STYLES[tone] || TONE_STYLES.indigo;

    const changeStyles = {
        positive: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        negative: 'bg-red-500/10 text-red-300 border-red-500/20',
        neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    };

    return (
        <Card padding="dashboard" className="h-full">
            <div className="flex h-full flex-col justify-between gap-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-400">{title}</p>
                        <p className={`text-3xl font-semibold tracking-tight ${toneStyle.value}`}>
                            {value}
                        </p>
                    </div>

                    {Icon && (
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneStyle.icon}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>

                {change !== undefined && (
                    <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${changeStyles[changeType]}`}>
                        {changeType === 'positive' && <TrendingUp className="h-3.5 w-3.5" />}
                        {changeType === 'negative' && <TrendingDown className="h-3.5 w-3.5" />}
                        <span>{change}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatsCard;
