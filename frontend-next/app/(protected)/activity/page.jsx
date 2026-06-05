'use client';

import { useState } from 'react';
import {
    Activity,
    Globe,
    FolderKanban,
    User,
    RefreshCw,
} from 'lucide-react';
import { useActivity } from '@/context/ActivityContext';
import ActivityTimeline from '@/components/activity/ActivityTimeline';
import ActivityFilters from '@/components/activity/ActivityFilters';

// ---------------------------------------------------------------------------
// Scope tab definitions
// ---------------------------------------------------------------------------
const SCOPE_TABS = [
    { id: 'global',  label: 'Global',  icon: Globe },
    { id: 'project', label: 'Project', icon: FolderKanban },
    { id: 'user',    label: 'My Feed', icon: User },
];

// ---------------------------------------------------------------------------
// Stats bar — total events in the current view
// ---------------------------------------------------------------------------
function StatsBar({ events }) {
    const byType = {};
    events.forEach(e => {
        const cat = e.action?.split('.')[0] || 'other';
        byType[cat] = (byType[cat] || 0) + 1;
    });

    const total = events.length;

    if (total === 0) return null;

    return (
        <div
            className="flex flex-wrap items-center gap-4 px-5 py-3 rounded-xl mb-6 text-sm"
            style={{
                background:  'rgba(99,102,241,0.06)',
                border:      '1px solid rgba(99,102,241,0.15)',
            }}
        >
            <span className="text-slate-400 text-xs">
                Showing <span className="text-indigo-400 font-semibold">{total}</span> events
            </span>
            {Object.entries(byType).map(([cat, count]) => (
                <span key={cat} className="text-xs text-slate-500">
                    {count} <span className="capitalize text-slate-400">{cat}</span>
                </span>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ActivityPage() {
    const [activeScope, setActiveScope] = useState('global');
    const { events, loadTimeline, isLoading } = useActivity();

    const handleScopeChange = (scope) => {
        setActiveScope(scope);
        // loadTimeline is also called inside ActivityTimeline on scope change
    };

    const handleRefresh = () => {
        loadTimeline({ scope: activeScope });
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* ── Page header ── */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow:  '0 4px 20px rgba(102,126,234,0.35)',
                            }}
                        >
                            <Activity size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Activity Timeline</h1>
                            <p className="text-slate-400 text-sm mt-0.5">
                                A real-time log of everything happening in your workspace
                            </p>
                        </div>
                    </div>
                </div>

                {/* Refresh button */}
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                    style={{
                        background:  'rgba(99,102,241,0.1)',
                        border:      '1px solid rgba(99,102,241,0.25)',
                        color:       '#a5b4fc',
                    }}
                >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* ── Scope tabs ── */}
            <div
                className="flex gap-1 p-1 rounded-xl mb-6"
                style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
                {SCOPE_TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeScope === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleScopeChange(tab.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                            style={{
                                background: active
                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)'
                                    : 'transparent',
                                color:      active ? '#e0e7ff' : '#64748b',
                                border:     active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                                boxShadow:  active ? '0 0 20px rgba(99,102,241,0.15)' : 'none',
                            }}
                        >
                            <Icon size={15} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Stats bar ── */}
            <StatsBar events={events} />

            {/* ── Filters ── */}
            <ActivityFilters />

            {/* ── Timeline ── */}
            <ActivityTimeline scope={activeScope} />
        </div>
    );
}
