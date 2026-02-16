import {
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import Card from '../ui/Card';

const StatsCard = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    iconColor = '#667eea',
}) => {
    return (
        <Card className="relative overflow-hidden group hover-lift">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>

                    {change !== undefined && (
                        <div className={`
              flex items-center gap-1 mt-2 text-sm
              ${changeType === 'positive' ? 'text-emerald-400' : ''}
              ${changeType === 'negative' ? 'text-red-400' : ''}
              ${changeType === 'neutral' ? 'text-slate-400' : ''}
            `}>
                            {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
                            {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
                            <span>{change}</span>
                        </div>
                    )}
                </div>

                {Icon && (
                    <div
                        className="p-3 rounded-xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${iconColor}20` }}
                    >
                        <Icon className="w-6 h-6" style={{ color: iconColor }} />
                    </div>
                )}
            </div>

            {/* Decorative gradient */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
                style={{ background: `linear-gradient(90deg, ${iconColor}, transparent)` }}
            />
        </Card>
    );
};

export default StatsCard;
