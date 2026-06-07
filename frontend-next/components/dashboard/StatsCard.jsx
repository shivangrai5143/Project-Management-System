'use client';

import {
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const StatsCard = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    iconColor = '#667eea',
}) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <Card className="relative overflow-hidden group h-full bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/80 shadow-lg hover:shadow-xl transition-colors">
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>

                        {change !== undefined && (
                            <div className={`
                                flex items-center gap-1 mt-3 text-sm font-medium px-2 py-1 rounded-md w-fit
                                ${changeType === 'positive' ? 'text-emerald-400 bg-emerald-400/10' : ''}
                                ${changeType === 'negative' ? 'text-red-400 bg-red-400/10' : ''}
                                ${changeType === 'neutral' ? 'text-slate-400 bg-slate-800' : ''}
                            `}>
                                {changeType === 'positive' && <TrendingUp className="w-3.5 h-3.5" />}
                                {changeType === 'negative' && <TrendingDown className="w-3.5 h-3.5" />}
                                <span>{change}</span>
                            </div>
                        )}
                    </div>

                    {Icon && (
                        <div
                            className="p-3 rounded-2xl transition-transform group-hover:rotate-12 duration-300"
                            style={{ 
                                backgroundColor: `${iconColor}15`,
                                border: `1px solid ${iconColor}30`,
                                boxShadow: `0 0 20px ${iconColor}20` 
                            }}
                        >
                            <Icon className="w-6 h-6" style={{ color: iconColor }} />
                        </div>
                    )}
                </div>

                {/* Decorative glow */}
                <div
                    className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                    style={{ background: iconColor }}
                />
            </Card>
        </motion.div>
    );
};

export default StatsCard;
