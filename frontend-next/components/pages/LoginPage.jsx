'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Sparkles, ArrowRight, CheckCircle2, Zap, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const FEATURES = [
    { icon: Zap,          text: 'AI-powered task automation' },
    { icon: Users,        text: 'Real-time team collaboration' },
    { icon: BarChart3,    text: 'Advanced analytics & insights' },
    { icon: CheckCircle2, text: 'Sprint planning & tracking' },
];

const LoginPage = () => {
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [error, setError]         = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router    = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        /* Full-viewport wrapper — min-h with svh fallback prevents collapse */
        <div
            className="flex bg-slate-950"
            style={{ minHeight: '100svh' }}
        >
            {/* ── Left column – Form ── */}
            <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-16">
                <div className="w-full max-w-md animate-slide-up">

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            YojnaFlow
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
                        <p className="text-slate-400 text-base">Sign in to continue to your dashboard</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Form card */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-8 shadow-2xl shadow-black/40">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email"
                                type="email"
                                icon={Mail}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                label="Password"
                                type="password"
                                icon={Lock}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-slate-400">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={isLoading}
                                icon={ArrowRight}
                                iconPosition="right"
                            >
                                Sign In
                            </Button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* ── Right column – Decorative panel (lg+) ── */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />

                {/* Animated glow orbs */}
                <div className="absolute top-16 left-16 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-16 right-16 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1.2s' }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: '0.6s' }}
                />

                {/* Dot-grid texture */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Panel content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-14">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Manage Projects<br />With Intelligence
                        </h2>
                        <p className="text-lg text-white/75 max-w-sm mx-auto leading-relaxed">
                            Streamline your workflow, collaborate in real-time,
                            and ship projects on schedule.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="w-full max-w-xs space-y-3">
                        {FEATURES.map(({ icon: Icon, text }) => (
                            <div
                                key={text}
                                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white/90 text-sm font-medium">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
