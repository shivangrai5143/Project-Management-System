const ProgressBar = ({
    value = 0,
    max = 100,
    size = 'md',
    color = 'primary',
    showLabel = false,
    className = '',
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    const colors = {
        primary: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500',
    };

    return (
        <div className={className}>
            {showLabel && (
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
