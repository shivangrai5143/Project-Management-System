import { getInitials, getAvatarColor } from '../../utils/helpers';

const Avatar = ({
    name,
    src,
    size = 'md',
    className = '',
}) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`
          rounded-full object-cover
          ${sizes[size]}
          ${className}
        `}
            />
        );
    }

    return (
        <div
            className={`
        flex items-center justify-center rounded-full font-medium text-white
        ${sizes[size]}
        ${className}
      `}
            style={{ backgroundColor: bgColor }}
        >
            {initials}
        </div>
    );
};

export default Avatar;
