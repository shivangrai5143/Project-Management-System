'use client';

import { memo } from 'react';
import {
    FolderPlus,
    FolderEdit,
    SquarePlus,
    UserCheck,
    CheckCircle2,
    Timer,
    FileUp,
    MessageSquare,
} from 'lucide-react';
import { ACTION_CONFIG, formatRelativeTime } from '@/services/activityService';

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const ICON_MAP = {
    FolderPlus,
    FolderEdit,
    SquarePlus,
    UserCheck,
    CheckCircle2,
    Timer,
    FileUp,
    MessageSquare,
};

// ---------------------------------------------------------------------------
// Avatar — initials fallback
// ---------------------------------------------------------------------------
function ActivityAvatar({ name, src, size = 32 }) {
    const initials = (name || '?')
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                style={{ width: size, height: size }}
                className="rounded-full object-cover ring-2 ring-slate-700 flex-shrink-0"
            />
        );
    }

    // Generate a deterministic hue from the name
    let hue = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hue = (hue + name.charCodeAt(i) * 37) % 360;
    }

    return (
        <div
            style={{
                width:           size,
                height:          size,
                background:      `hsl(${hue}, 65%, 45%)`,
                fontSize:        size * 0.35,
                flexShrink:      0,
            }}
            className="rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-slate-700"
        >
            {initials}
        </div>
    );
}

// ---------------------------------------------------------------------------
// ActivityItem
// ---------------------------------------------------------------------------
const ActivityItem = memo(function ActivityItem({ event, isLast }) {
    const config  = ACTION_CONFIG[event.action] || {
        label:   event.action,
        icon:    'MessageSquare',
        color:   '#667eea',
        bgColor: 'rgba(102,126,234,0.15)',
    };
    const IconComponent = ICON_MAP[config.icon] || MessageSquare;
    const relTime = formatRelativeTime(event.createdAt);
    const absTime = new Date(event.createdAt).toLocaleString('en-US', {
        month:  'short',
        day:    'numeric',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="activity-item flex gap-4 group">
            {/* Left column: avatar + connector line */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
                <ActivityAvatar name={event.actorName} src={event.actorAvatar} size={36} />
                {!isLast && (
                    <div
                        className="w-px flex-1 mt-2"
                        style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.3), transparent)', minHeight: 24 }}
                    />
                )}
            </div>

            {/* Right column: event card */}
            <div
                className="flex-1 mb-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
                style={{
                    background:   'rgba(15, 23, 42, 0.6)',
                    borderColor:  'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <div className="p-4 flex items-start gap-3">
                    {/* Action icon badge */}
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: config.bgColor }}
                    >
                        <IconComponent size={15} style={{ color: config.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Sentence */}
                        <p className="text-sm text-slate-200 leading-snug">
                            <span className="font-semibold text-white">{event.actorName}</span>
                            {' '}
                            <span className="text-slate-400">{config.label}</span>
                            {' '}
                            {event.targetName && (
                                <span
                                    className="font-medium px-1.5 py-0.5 rounded-md text-xs"
                                    style={{
                                        color:      config.color,
                                        background: config.bgColor,
                                    }}
                                >
                                    {event.targetName}
                                </span>
                            )}
                            {event.projectName && event.targetType !== 'project' && (
                                <span className="text-slate-500 text-xs ml-1">
                                    in <span className="text-slate-400">{event.projectName}</span>
                                </span>
                            )}
                        </p>

                        {/* Metadata chips */}
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {event.metadata.priority && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
                                        Priority: {event.metadata.priority}
                                    </span>
                                )}
                                {event.metadata.previousStatus && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
                                        From: {event.metadata.previousStatus}
                                    </span>
                                )}
                                {event.metadata.updatedFields && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
                                        Fields: {event.metadata.updatedFields.join(', ')}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-right ml-2">
                        <span
                            className="text-xs text-slate-500 cursor-default"
                            title={absTime}
                        >
                            {relTime}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ActivityItem;
