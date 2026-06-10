'use client';

const Card = ({
    children,
    className = '',
    variant = 'default',
    hover = false,
    padding = 'default',
    ...props
}) => {
    const variants = {
        // Clean flat card — border only, no shadow noise
        default: 'bg-slate-900 border border-slate-800',
        // Subtle glass — used for header / overlays
        glass: 'glass-dark',
        // Slightly raised surface — for nested cards within cards
        solid: 'bg-slate-800 border border-slate-700',
        // Highlight card — sparingly for featured content
        gradient: 'bg-gradient-to-br from-slate-900 to-slate-800/60 border border-slate-800',
    };

    // 8px spacing system — matches the design system tokens
    const paddings = {
        none:      '',
        sm:        'p-3',
        default:   'p-4 sm:p-5',
        // Dashboard cards: 16px mobile → 24px desktop (respects outer 24px page padding)
        dashboard: 'p-4 sm:p-5 lg:p-6',
        lg:        'p-6 md:p-8',
    };

    return (
        <div
            className={`
                rounded-2xl
                ${variants[variant]}
                ${paddings[padding]}
                ${hover
                    ? 'cursor-pointer transition-colors duration-200 hover:border-slate-700 hover:bg-slate-800/50'
                    : ''
                }
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
