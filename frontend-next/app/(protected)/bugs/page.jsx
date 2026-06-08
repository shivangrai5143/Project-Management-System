'use client';

import React from 'react';
import { Bug } from 'lucide-react';

export default function BugsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <Bug className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Bug Tracker</h1>
            <p className="text-slate-400 max-w-md text-lg">
                The centralized bug tracker is currently under development. Stay tuned for advanced issue reporting.
            </p>
        </div>
    );
}
