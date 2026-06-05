'use client';

/**
 * RoleBadge — displays the current user's system role as a styled pill badge.
 *
 * Props:
 *   role    {string}   - One of USER_ROLES.* ('admin', 'project_manager', etc.)
 *   size    {string}   - 'sm' | 'md' (default 'md')
 *   showIcon {boolean} - Whether to show the role icon (default true)
 */

import { Shield, Briefcase, Code2, Eye } from 'lucide-react';
import { USER_ROLE_CONFIG } from '@/utils/constants';

// Map icon name string → Lucide component
const ICON_MAP = {
    Shield,
    Briefcase,
    Code2,
    Eye,
};

export default function RoleBadge({ role, size = 'md', showIcon = true }) {
    // Normalise unknown roles gracefully
    const config = USER_ROLE_CONFIG[role] || {
        label:       role ?? 'Unknown',
        bgColor:     'bg-slate-500/20',
        textColor:   'text-slate-400',
        borderColor: 'border-slate-500/30',
        icon:        null,
    };

    const IconComponent = showIcon && config.icon ? ICON_MAP[config.icon] : null;

    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5 gap-1',
        md: 'text-xs px-2.5 py-1 gap-1.5',
    };

    const iconSizes = {
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
    };

    return (
        <span
            className={`
                inline-flex items-center font-medium rounded-full border
                ${config.bgColor} ${config.textColor} ${config.borderColor}
                ${sizeClasses[size] || sizeClasses.md}
            `}
        >
            {IconComponent && (
                <IconComponent className={`flex-shrink-0 ${iconSizes[size] || iconSizes.md}`} />
            )}
            {config.label}
        </span>
    );
}
