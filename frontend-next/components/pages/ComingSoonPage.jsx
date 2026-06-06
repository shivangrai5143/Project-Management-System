'use client';

/**
 * ComingSoonPage — Placeholder for routes that are planned but not yet implemented.
 *
 * Prevents 404 errors for sidebar nav items while giving users clear feedback
 * that the feature is on the roadmap.
 */

import Link from 'next/link';
import { ArrowLeft, Construction, Sparkles } from 'lucide-react';

const FEATURE_DETAILS = {
    '/analytics': {
        title: 'Analytics',
        description: 'Visualize project velocity, team performance, and sprint burndown charts in one unified dashboard.',
        eta: 'Coming soon',
        color: '#3b82f6',
    },
    '/sprints': {
        title: 'Sprint Manager',
        description: 'Plan, run, and retrospect on agile sprints with velocity tracking and capacity planning.',
        eta: 'Coming soon',
        color: '#8b5cf6',
    },
    '/bugs': {
        title: 'Bug Tracker',
        description: 'Log, triage, and resolve bugs with severity levels, reproducibility steps, and assignee tracking.',
        eta: 'Coming soon',
        color: '#ef4444',
    },
    '/automation': {
        title: 'Automation',
        description: 'Create trigger-based automation rules to auto-assign tasks, send alerts, and update statuses.',
        eta: 'Coming soon',
        color: '#f59e0b',
    },
    '/knowledge': {
        title: 'Knowledge Base',
        description: 'Centralize team documentation, SOPs, and runbooks with a searchable wiki-style knowledge base.',
        eta: 'Coming soon',
        color: '#10b981',
    },
    '/integrations': {
        title: 'Integrations',
        description: 'Connect GitHub, Slack, Jira, and more to sync your workflow across all the tools your team uses.',
        eta: 'Coming soon',
        color: '#06b6d4',
    },
    '/gamification': {
        title: 'Achievements',
        description: 'Boost team morale with XP, badges, leaderboards, and streaks that celebrate great work.',
        eta: 'Coming soon',
        color: '#f97316',
    },
    '/audit': {
        title: 'Audit Logs',
        description: 'Track every action taken in the workspace — who did what, when, and from where.',
        eta: 'Coming soon',
        color: '#64748b',
    },
};

export default function ComingSoonPage({ path }) {
    const feature = FEATURE_DETAILS[path] ?? {
        title: 'Feature',
        description: 'This feature is under development and will be available soon.',
        eta: 'Coming soon',
        color: '#667eea',
    };

    const accentColor = feature.color;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            {/* Animated icon */}
            <div className="relative mb-8">
                <div
                    className="absolute inset-0 rounded-2xl blur-2xl opacity-30 animate-pulse"
                    style={{ background: accentColor }}
                />
                <div
                    className="relative w-24 h-24 rounded-2xl flex items-center justify-center border"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}08 100%)`,
                        borderColor: `${accentColor}30`,
                        boxShadow: `0 8px 32px ${accentColor}20`,
                    }}
                >
                    <Construction
                        className="w-10 h-10"
                        style={{ color: accentColor }}
                    />
                </div>
            </div>

            {/* Badge */}
            <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                    background: `${accentColor}15`,
                    color: accentColor,
                    border: `1px solid ${accentColor}30`,
                }}
            >
                <Sparkles className="w-3 h-3" />
                {feature.eta}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-3">{feature.title}</h1>

            {/* Description */}
            <p className="text-slate-400 text-base leading-relaxed max-w-md mb-8">
                {feature.description}
            </p>

            {/* Progress bar — decorative */}
            <div className="w-64 h-1.5 rounded-full bg-slate-800 mb-8 overflow-hidden">
                <div
                    className="h-full rounded-full animate-pulse"
                    style={{
                        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
                        width: '45%',
                    }}
                />
            </div>

            {/* Back link */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{
                    background: `${accentColor}15`,
                    color: accentColor,
                    border: `1px solid ${accentColor}30`,
                }}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>
        </div>
    );
}
