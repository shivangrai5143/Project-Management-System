'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';

/*
 * Tone → icon container style + top accent colour.
 * The accent bar at the top of each card provides instant colour-coded
 * scanability without competing with the number — a Linear / Stripe pattern.
 */
const TONE_STYLES = {
    slate:   {
        icon:   'bg-slate-800   text-slate-300  border-slate-700',
        accent: 'text-slate-300',
        bar:    'bg-slate-600/60',
    },
    indigo:  {
        icon:   'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        accent: 'text-indigo-300',
        bar:    'bg-indigo-500/70',
    },
    emerald: {
        icon:   'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        accent: 'text-emerald-300',
        bar:    'bg-emerald-500/70',
    },
    amber:   {
        icon:   'bg-amber-500/10 text-amber-300  border-amber-500/20',
        accent: 'text-amber-300',
        bar:    'bg-amber-500/70',
    },
    rose:    {
        icon:   'bg-red-500/10   text-red-300    border-red-500/20',
        accent: 'text-red-300',
        bar:    'bg-red-500/70',
    },
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
        /*
         * group enables child hover effects.
         * hover:translate-y-[-2px] gives a subtle lift — Linear / Vercel micro-interaction.
         * transition-transform is cheap vs transition-all (no paint triggers).
         */
        <div className="group h-full transition-transform duration-200 hover:-translate-y-0.5">
            <Card padding="dashboard" className="relative h-full overflow-hidden">

                {/* ── Tone accent bar (top edge) ── */}
                {/*
                 * 3px high bar pinned to the card's top edge.
                 * overflow-hidden on Card clips it cleanly to the border-radius.
                 */}
                <div className={`absolute left-0 right-0 top-0 h-[3px] ${toneStyle.bar}`} />

                <div className="flex h-full flex-col justify-between gap-4 pt-1">

                    {/* ── Metric row: title + icon ── */}
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                            {title}
                        </p>
                        {Icon && (
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneStyle.icon} transition-transform duration-200 group-hover:scale-110`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        )}
                    </div>

                    {/* ── Value ── */}
                    {/*
                     * text-3xl: larger than before (text-2xl) — clear Level 2 hierarchy.
                     * tabular-nums prevents layout shift as numbers update.
                     */}
                    <p className="text-3xl font-bold tabular-nums tracking-tight text-white">
                        {value}
                    </p>

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
        </div>
    );
};

export default StatsCard;
