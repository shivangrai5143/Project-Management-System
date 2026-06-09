import './globals.css';
import { Providers } from './providers';

export const metadata = {
    title: 'YojnaFlow - AI-Powered Project Intelligence Platform',
    description: 'An AI-powered collaborative project intelligence platform with automation, analytics, and real-time teamwork.',
    keywords: 'project management, AI, collaboration, kanban, sprint planning, analytics',
    openGraph: {
        title: 'YojnaFlow - AI-Powered Project Management',
        description: 'Enterprise-grade AI project management with real-time collaboration.',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/jpg" href="/management.jpg" />
            </head>
            <body className="bg-slate-950 font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
