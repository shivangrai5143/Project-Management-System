'use client';

import React from 'react';
import { Target } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function SprintsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <Target className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Sprint Manager</h1>
            <p className="text-slate-400 max-w-md text-lg">
                Agile sprints and burndown charts are coming soon. Plan and execute iterations seamlessly.
            </p>
        </div>
    );
}
