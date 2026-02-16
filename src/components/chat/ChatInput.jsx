import { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-slate-700/50">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={disabled}
                className="
                    flex-1 px-4 py-2.5 rounded-xl
                    bg-slate-800/50 border border-slate-700
                    text-white placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-all disabled:opacity-50
                "
            />
            <button
                type="submit"
                disabled={!message.trim() || disabled}
                className="
                    p-2.5 rounded-xl bg-indigo-500 text-white
                    hover:bg-indigo-600 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                "
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
};

export default ChatInput;
