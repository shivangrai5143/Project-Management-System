'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

export default function KnowledgePage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <BookOpen className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Knowledge Base</h1>
            <p className="text-slate-400 max-w-md text-lg">
                A centralized wiki for your team's documentation and standards is coming soon.
            </p>
        </div>
    );
}
