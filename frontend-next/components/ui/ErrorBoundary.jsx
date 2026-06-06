'use client';

/**
 * ErrorBoundary — catches render errors in the React subtree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   // With a custom fallback UI:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log to console in development; swap in a real error reporter (Sentry etc.) for prod
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // If a custom fallback was provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default full-page fallback
            return (
                <div
                    className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center"
                    role="alert"
                >
                    {/* Icon */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-pulse" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/10 border border-amber-500/30 flex items-center justify-center">
                            <AlertTriangle className="w-9 h-9 text-amber-400" />
                        </div>
                    </div>

                    {/* Message */}
                    <h2 className="text-xl font-bold text-white mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-slate-400 text-sm max-w-sm mb-6">
                        An unexpected error occurred while rendering this section.
                        {this.props.context && ` (${this.props.context})`}
                    </p>

                    {/* Error detail — only in development */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mb-6 max-w-lg w-full text-left">
                            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 mb-2">
                                Error details
                            </summary>
                            <pre className="text-xs text-red-400 bg-slate-900 p-4 rounded-xl overflow-auto border border-red-500/20 whitespace-pre-wrap">
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={this.handleReset}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 transition-all text-sm font-medium"
                        >
                            <Home className="w-4 h-4" />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Minimal chart-specific error boundary — shows a small inline fallback
 * so a broken chart doesn't hide surrounding page content.
 */
export function ChartErrorBoundary({ children }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="h-64 flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <p className="text-sm text-slate-400">Chart could not be rendered.</p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
