import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-slate-400" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 rounded-lg
            bg-slate-700/50 border border-slate-600
            text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-slate-400">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
