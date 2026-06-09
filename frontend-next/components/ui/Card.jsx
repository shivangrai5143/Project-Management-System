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
        default: 'bg-slate-900/80 border border-slate-800 shadow-lg shadow-slate-950/25',
        glass: 'glass-dark shadow-lg shadow-slate-950/25',
        solid: 'bg-slate-800 border border-slate-700 shadow-lg shadow-slate-950/20',
        gradient: 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 shadow-lg shadow-slate-950/25',
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        default: 'p-4 sm:p-5',
        dashboard: 'p-4',
        lg: 'p-6 md:p-8',
    };

    return (
        <div
            className={`
        rounded-2xl
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/30' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
