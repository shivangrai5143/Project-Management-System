'use client';

import { Bot, ChevronRight, Sparkles } from 'lucide-react';
import { useAIAgent } from '@/context/AIAgentContext';
import Card from '@/components/ui/Card';

const AIInsightsCard = () => {
    const { getInsights, openPanel } = useAIAgent();
    const insights = getInsights();

    const getInsightStyle = (type) => {
        switch (type) {
            case 'positive':
                return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
            case 'danger':
                return 'bg-red-500/10 border-red-500/30 text-red-300';
            default:
                return 'bg-slate-800/70 border-slate-700 text-slate-300';
        }
    };

    return (
        <Card padding="dashboard" className="h-full">
            <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">AI Assistant</p>
                            <h2 className="mt-1 text-xl font-semibold text-white">ERA insights</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Recommendations based on workload, project health, and delivery risk.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => openPanel()}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
                    >
                        Open
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-6 flex-1 space-y-3">
                    {insights.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-4 text-sm text-slate-400">
                            Add more project data to unlock AI recommendations for planning and prioritization.
                        </div>
                    ) : (
                        insights.slice(0, 3).map((insight, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border p-4 ${getInsightStyle(insight.type)}`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-base">{insight.icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">{insight.message}</p>
                                        {insight.action && (
                                            <p className="mt-1 text-xs opacity-80">{insight.action}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-indigo-500/10 p-2 text-indigo-300">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Turn insight into action</p>
                            <p className="mt-1 text-sm text-slate-400">
                                Use ERA to draft a plan, summarize blockers, or suggest the next best tasks for your team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default AIInsightsCard;
