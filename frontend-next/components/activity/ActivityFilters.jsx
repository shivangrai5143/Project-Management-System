'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react';
import { useActivity } from '@/context/ActivityContext';

const CATEGORIES = [
    { id: 'project', label: 'Projects',  color: '#667eea' },
    { id: 'task',    label: 'Tasks',     color: '#3b82f6' },
    { id: 'sprint',  label: 'Sprints',   color: '#06b6d4' },
    { id: 'file',    label: 'Files',     color: '#ec4899' },
    { id: 'comment', label: 'Comments',  color: '#f97316' },
];

export default function ActivityFilters() {
    const { activeFilters, setActiveFilters } = useActivity();
    const [showDatePanel, setShowDatePanel] = useState(false);

    const toggleCategory = (id) => {
        setActiveFilters(prev => {
            const already = prev.categories.includes(id);
            return {
                ...prev,
                categories: already
                    ? prev.categories.filter(c => c !== id)
                    : [...prev.categories, id],
            };
        });
    };

    const setDate = (field, value) => {
        setActiveFilters(prev => ({ ...prev, [field]: value || null }));
    };

    const hasActiveFilters =
        activeFilters.categories.length > 0 ||
        activeFilters.dateFrom ||
        activeFilters.dateTo;

    const resetFilters = () => {
        setActiveFilters({ categories: [], dateFrom: null, dateTo: null });
    };

    return (
        <div
            className="rounded-xl border p-4 mb-6"
            style={{
                background:  'rgba(15, 23, 42, 0.7)',
                borderColor: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div className="flex items-center gap-2 mb-3">
                <Filter size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Filter Activity</span>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                        <RotateCcw size={11} />
                        Reset
                    </button>
                )}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                    const active = activeFilters.categories.includes(cat.id);
                    return (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                            style={{
                                background:  active ? `${cat.color}22` : 'rgba(30,41,59,0.8)',
                                color:       active ? cat.color : '#94a3b8',
                                border:      `1px solid ${active ? cat.color + '55' : 'rgba(255,255,255,0.08)'}`,
                                boxShadow:   active ? `0 0 12px ${cat.color}20` : 'none',
                                transform:   active ? 'scale(1.05)' : 'scale(1)',
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: cat.color, opacity: active ? 1 : 0.5 }}
                            />
                            {cat.label}
                            {active && <X size={10} className="ml-0.5 opacity-70" />}
                        </button>
                    );
                })}

                {/* Date range toggle */}
                <button
                    onClick={() => setShowDatePanel(p => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                    style={{
                        background:  showDatePanel || activeFilters.dateFrom || activeFilters.dateTo
                            ? 'rgba(102,126,234,0.15)' : 'rgba(30,41,59,0.8)',
                        color:       showDatePanel || activeFilters.dateFrom || activeFilters.dateTo
                            ? '#667eea' : '#94a3b8',
                        border:      '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    Date Range
                    <ChevronDown
                        size={11}
                        style={{ transform: showDatePanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    />
                </button>
            </div>

            {/* Date range inputs */}
            {showDatePanel && (
                <div className="mt-3 flex flex-wrap gap-3 animate-fade-in">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wide">From</label>
                        <input
                            type="date"
                            value={activeFilters.dateFrom || ''}
                            onChange={e => setDate('dateFrom', e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-300 border outline-none focus:border-indigo-500/50"
                            style={{
                                background:  'rgba(15,23,42,0.8)',
                                borderColor: 'rgba(255,255,255,0.1)',
                                colorScheme: 'dark',
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wide">To</label>
                        <input
                            type="date"
                            value={activeFilters.dateTo || ''}
                            onChange={e => setDate('dateTo', e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-300 border outline-none focus:border-indigo-500/50"
                            style={{
                                background:  'rgba(15,23,42,0.8)',
                                borderColor: 'rgba(255,255,255,0.1)',
                                colorScheme: 'dark',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
