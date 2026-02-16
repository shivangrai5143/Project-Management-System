import { Bot, AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useAIAgent } from '../../context/AIAgentContext';
import Card from '../ui/Card';

const AIInsightsCard = () => {
    const { getInsights, openPanel } = useAIAgent();
    const insights = getInsights();

    const getInsightStyle = (type) => {
        switch (type) {
            case 'positive':
                return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            case 'danger':
                return 'bg-red-500/10 border-red-500/30 text-red-400';
            default:
                return 'bg-slate-700/50 border-slate-600 text-slate-300';
        }
    };

    return (
        <Card padding="default" className="relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">ERA ⚡ Insights</h2>
                        <p className="text-xs text-slate-400">Powered by smart analysis</p>
                    </div>
                </div>
                <button
                    onClick={() => openPanel()}
                    className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    View all
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Insights list */}
            <div className="space-y-3 relative">
                {insights.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-slate-400 text-sm">No insights yet. Add more tasks to get AI-powered recommendations.</p>
                    </div>
                ) : (
                    insights.map((insight, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-xl border ${getInsightStyle(insight.type)} transition-all hover:scale-[1.01]`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-lg flex-shrink-0">{insight.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{insight.message}</p>
                                    {insight.action && (
                                        <p className="text-xs opacity-70 mt-1">{insight.action}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick stats footer */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 relative">
                <button
                    onClick={() => openPanel()}
                    className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white text-sm font-medium hover:from-indigo-500/30 hover:to-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <Bot className="w-4 h-4" />
                    Open AI Assistant
                </button>
            </div>
        </Card>
    );
};

export default AIInsightsCard;
