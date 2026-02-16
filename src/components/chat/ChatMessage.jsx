import { getRelativeTime } from '../../utils/helpers';
import Avatar from '../ui/Avatar';

const ChatMessage = ({ message, isOwnMessage }) => {
    return (
        <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
            {!isOwnMessage && (
                <Avatar name={message.userName} size="sm" className="flex-shrink-0" />
            )}

            <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
                {!isOwnMessage && (
                    <span className="text-xs text-slate-400 mb-1">{message.userName}</span>
                )}
                <div
                    className={`
                        px-4 py-2 rounded-2xl text-sm break-words
                        ${isOwnMessage
                            ? 'bg-indigo-500 text-white rounded-tr-md'
                            : 'bg-slate-700/80 text-slate-200 rounded-tl-md'
                        }
                    `}
                >
                    {message.content}
                </div>
                <span className="text-[10px] text-slate-500 mt-1">
                    {getRelativeTime(message.createdAt)}
                </span>
            </div>
        </div>
    );
};

export default ChatMessage;
