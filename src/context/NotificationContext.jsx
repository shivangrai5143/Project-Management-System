import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { demoNotifications } from '../data/mockData';
import { generateId } from '../utils/helpers';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Load notifications from localStorage or use demo data
        const savedNotifications = getItem(STORAGE_KEYS.NOTIFICATIONS);

        if (savedNotifications) {
            setNotifications(savedNotifications);
        } else {
            setNotifications(demoNotifications);
            setItem(STORAGE_KEYS.NOTIFICATIONS, demoNotifications);
        }
    }, []);

    const saveNotifications = (newNotifications) => {
        setNotifications(newNotifications);
        setItem(STORAGE_KEYS.NOTIFICATIONS, newNotifications);
    };

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: generateId(),
            ...notification,
            read: false,
            createdAt: new Date().toISOString(),
        };

        const updatedNotifications = [newNotification, ...notifications];
        saveNotifications(updatedNotifications);

        // Also show as toast
        showToast(notification.title, notification.type || 'info');

        return newNotification;
    }, [notifications]);

    const markAsRead = (id) => {
        const updatedNotifications = notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        );
        saveNotifications(updatedNotifications);
    };

    const markAllAsRead = () => {
        const updatedNotifications = notifications.map(notif => ({
            ...notif,
            read: true,
        }));
        saveNotifications(updatedNotifications);
    };

    const deleteNotification = (id) => {
        const updatedNotifications = notifications.filter(notif => notif.id !== id);
        saveNotifications(updatedNotifications);
    };

    const clearAll = () => {
        saveNotifications([]);
    };

    const getUnreadCount = () => {
        return notifications.filter(notif => !notif.read).length;
    };

    // Toast management
    const showToast = useCallback((message, type = 'info') => {
        const id = generateId();
        const toast = { id, message, type };

        setToasts(prev => [...prev, toast]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            toasts,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
            getUnreadCount,
            showToast,
            removeToast,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
