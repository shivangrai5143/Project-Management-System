import { useEffect, useRef } from 'react';
import { X, Users, MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Avatar from '../ui/Avatar';

const ChatPanel = ({ isOpen, onClose, projectId, projectName, teamMembers }) => {
    const { getMessagesByProject, sendMessage } = useChat();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const messages = getMessagesByProject(projectId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = (content) => {
        if (user) {
            sendMessage(projectId, user.id, user.name, content);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 z-50 flex flex-col animate-slide-in-right shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{projectName}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Users className="w-3 h-3" />
                                <span>{teamMembers?.length || 0} members</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Team Members */}
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Team:</span>
                    <div className="flex -space-x-2">
                        {teamMembers?.slice(0, 6).map(member => (
                            <Avatar
                                key={member.id}
                                name={member.name}
                                size="xs"
                                className="border-2 border-slate-900"
                            />
                        ))}
                        {teamMembers?.length > 6 && (
                            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-300">
                                +{teamMembers.length - 6}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm">No messages yet</p>
                            <p className="text-slate-500 text-xs mt-1">Start the conversation with your team!</p>
                        </div>
                    ) : (
                        messages.map(message => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                isOwnMessage={user?.id === message.userId}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={!user}
                />
            </div>
        </>
    );
};

export default ChatPanel;
