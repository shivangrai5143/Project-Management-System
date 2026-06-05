'use client';

/**
 * Access Denied Page — shown when a user navigates to a route they don't have
 * permission to access.
 *
 * Also used as the default fallback inside <RoleGuard />.
 */

import { useRouter } from 'next/navigation';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRBAC } from '@/context/RBACContext';
import RoleBadge from '@/components/ui/RoleBadge';

export default function AccessDenied() {
    const router  = useRouter();
    const { user } = useAuth();
    const { userRole } = useRBAC();

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6 animate-fade-in">

                {/* Icon */}
                <div className="relative mx-auto w-28 h-28">
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-red-500/10" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center">
                        <ShieldX className="w-12 h-12 text-red-400" />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">Access Denied</h1>
                    <p className="text-slate-400 text-base leading-relaxed">
                        You don't have permission to view this page. Contact your administrator
                        if you believe this is a mistake.
                    </p>
                </div>

                {/* Current role info */}
                {user && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm text-slate-300">
                        <span className="text-slate-400">Your role:</span>
                        <RoleBadge role={userRole} size="sm" />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 transition-all duration-200 text-sm font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </button>
                </div>

                {/* Role permissions hint */}
                <div className="pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500">
                        Error code: <code className="font-mono text-slate-400">403 FORBIDDEN</code>
                        {' · '}
                        Permission insufficient for your role
                    </p>
                </div>
            </div>
        </div>
    );
}
