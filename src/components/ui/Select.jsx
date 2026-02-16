import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    label,
    error,
    options = [],
    placeholder = 'Select...',
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
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer
            bg-slate-700/50 border border-slate-600
            text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                >
                    <option value="" className="bg-slate-800">{placeholder}</option>
                    {options.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-slate-800"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
            </div>
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
