/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#667eea',
                    600: '#5969d6',
                    700: '#4c51bf',
                    800: '#434190',
                    900: '#3c366b',
                },
            },
            animation: {
                'slide-in': 'slideIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'scale-in': 'scaleIn 0.2s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                slideIn: {
                    from: { opacity: 0, transform: 'translateX(-20px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                },
                slideUp: {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
                fadeIn: {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                },
                scaleIn: {
                    from: { opacity: 0, transform: 'scale(0.9)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
