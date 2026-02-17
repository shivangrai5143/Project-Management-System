import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

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

    useEffect(() => {
        // Load messages from localStorage
        const savedMessages = getItem(STORAGE_KEYS.CHAT_MESSAGES);
        if (savedMessages) {
            setMessages(savedMessages);
        }
    }, []);

    const saveMessages = (newMessages) => {
        setMessages(newMessages);
        setItem(STORAGE_KEYS.CHAT_MESSAGES, newMessages);
    };

    const sendMessage = (projectId, userId, userName, content) => {
        const newMessage = {
            id: generateId(),
            projectId,
            userId,
            userName,
            content,
            createdAt: new Date().toISOString(),
        };

        const updatedMessages = [...messages, newMessage];
        saveMessages(updatedMessages);
        return newMessage;
    };

    const getMessagesByProject = (projectId) => {
        return messages
            .filter(msg => msg.projectId === projectId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    };

    const deleteMessage = (messageId) => {
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        saveMessages(updatedMessages);
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
