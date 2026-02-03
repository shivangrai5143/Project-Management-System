const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    color,
    className = '',
}) => {
    const variants = {
        default: 'bg-slate-700 text-slate-300',
        primary: 'bg-indigo-500/20 text-indigo-400',
        success: 'bg-emerald-500/20 text-emerald-400',
        warning: 'bg-amber-500/20 text-amber-400',
        danger: 'bg-red-500/20 text-red-400',
        info: 'bg-blue-500/20 text-blue-400',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const customStyle = color ? {
        backgroundColor: `${color}20`,
        color: color,
    } : {};

    return (
        <span
            className={`
        inline-flex items-center rounded-full font-medium
        ${!color ? variants[variant] : ''}
        ${sizes[size]}
        ${className}
      `}
            style={customStyle}
        >
            {children}
        </span>
    );
};

export default Badge;
