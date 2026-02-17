import { Bot, Sparkles } from 'lucide-react';
import { getRelativeTime } from '../../utils/helpers';

const BotMessage = ({ message, children, actions }) => {
    return (
        <div className="flex gap-3">
            {/* Bot Avatar */}
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col max-w-[85%]">
                {/* Bot Name */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-indigo-400">Standup Bot</span>
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>

                {/* Message Content */}
                <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm border border-slate-600/30 px-4 py-3 rounded-2xl rounded-tl-md text-sm text-slate-200 shadow-lg">
                    {message.content || children}
                </div>

                {/* Action Buttons */}
                {actions && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                    ${action.primary
                                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/30'
                                    }
                                `}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Timestamp */}
                {message.createdAt && (
                    <span className="text-[10px] text-slate-500 mt-1">
                        {getRelativeTime(message.createdAt)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default BotMessage;
