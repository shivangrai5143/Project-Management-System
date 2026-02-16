import { useState, useRef, useEffect } from 'react';

const Dropdown = ({
    trigger,
    children,
    align = 'left',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const alignments = {
        left: 'left-0',
        right: 'right-0',
        center: 'left-1/2 -translate-x-1/2',
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`
            absolute top-full mt-2 z-50
            min-w-[200px] py-2
            bg-slate-800 border border-slate-700
            rounded-xl shadow-xl
            animate-scale-in origin-top
            ${alignments[align]}
          `}
                >
                    {typeof children === 'function'
                        ? children(() => setIsOpen(false))
                        : children
                    }
                </div>
            )}
        </div>
    );
};

const DropdownItem = ({
    children,
    icon: Icon,
    onClick,
    danger = false,
    className = '',
}) => {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 px-4 py-2 text-left text-sm
        transition-colors
        ${danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
        ${className}
      `}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};

const DropdownDivider = () => (
    <div className="my-2 border-t border-slate-700" />
);

export { Dropdown, DropdownItem, DropdownDivider };
export default Dropdown;
