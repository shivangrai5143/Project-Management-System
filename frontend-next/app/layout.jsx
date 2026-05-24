import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata = {
    title: 'YojnaFlow — AI-Powered Project Intelligence Platform',
    description: 'An AI-Powered Collaborative Project Intelligence Platform. Predict delays, automate workflows, collaborate in real-time.',
    keywords: 'project management, AI, collaboration, kanban, sprint planning, analytics',
    openGraph: {
        title: 'YojnaFlow — AI-Powered Project Management',
        description: 'Enterprise-grade AI project management with real-time collaboration',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/jpg" href="/management.jpg" />
            </head>
            <body className={`${inter.variable} font-sans bg-slate-950 antialiased`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
