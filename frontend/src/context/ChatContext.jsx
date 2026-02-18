import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/firestore';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const { user } = useAuth();

    // Listen to all chat messages from Firestore
    useEffect(() => {
        if (!user?.id) {
            setMessages([]);
            return;
        }

        const unsub = chatService.onAllMessagesChange((messagesList) => {
            setMessages(messagesList);
        });

        return () => unsub();
    }, [user?.id]);

    const sendMessage = async (projectId, userId, userName, content) => {
        try {
            const newMessage = await chatService.send({
                projectId,
                userId,
                userName,
                content,
            });
            return newMessage;
        } catch (err) {
            console.error('Failed to send message:', err);
            throw err;
        }
    };

    const getMessagesByProject = (projectId) => {
        return messages
            .filter(msg => msg.projectId === projectId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    };

    const deleteMessage = async (messageId) => {
        try {
            await chatService.delete(messageId);
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    const getUnreadCount = (projectId, lastReadAt) => {
        if (!lastReadAt) return 0;
        return messages.filter(
            msg => msg.projectId === projectId && new Date(msg.createdAt) > new Date(lastReadAt)
        ).length;
    };

    return (
        <ChatContext.Provider value={{
            messages,
            sendMessage,
            getMessagesByProject,
            deleteMessage,
            getUnreadCount,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
