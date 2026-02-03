const Card = ({
    children,
    className = '',
    variant = 'default',
    hover = false,
    padding = 'default',
    ...props
}) => {
    const variants = {
        default: 'bg-slate-800/50 border border-slate-700/50',
        glass: 'glass',
        solid: 'bg-slate-800 border border-slate-700',
        gradient: 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50',
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        default: 'p-4 md:p-6',
        lg: 'p-6 md:p-8',
    };

    return (
        <div
            className={`
        rounded-xl
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? 'hover-lift cursor-pointer' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
