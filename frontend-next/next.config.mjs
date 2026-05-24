/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
        ],
    },
    // Empty turbopack config to silence warning; fallbacks handled by Next.js automatically
    turbopack: {},
};

export default nextConfig;
