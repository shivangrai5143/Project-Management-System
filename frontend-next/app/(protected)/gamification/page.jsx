'use client';

import React from 'react';
import { Trophy } from 'lucide-react';

export default function GamificationPage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <Trophy className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Achievements</h1>
            <p className="text-slate-400 max-w-md text-lg">
                Team gamification, badges, and leaderboards will be available in the next major update.
            </p>
        </div>
    );
}
