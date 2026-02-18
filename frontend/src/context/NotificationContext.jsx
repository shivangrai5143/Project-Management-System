import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/firestore';
import { generateId } from '../utils/helpers';
import { useAuth } from './AuthContext';

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
    const { user } = useAuth();

    // Listen to notifications from Firestore
    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            return;
        }

        const unsub = notificationsService.onNotificationsChange(user.id, (notifsList) => {
            setNotifications(notifsList);
        });

        return () => unsub();
    }, [user?.id]);

    const addNotification = useCallback(async (notification) => {
        if (!user?.id) return null;

        try {
            const newNotification = await notificationsService.add({
                ...notification,
                userId: user.id,
            });

            // Also show as toast
            showToast(notification.title, notification.type || 'info');

            return newNotification;
        } catch (err) {
            console.error('Failed to add notification:', err);
            return null;
        }
    }, [user?.id]);

    const markAsRead = async (id) => {
        try {
            await notificationsService.markAsRead(id);
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await notificationsService.markAllAsRead(user.id);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await notificationsService.delete(id);
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const clearAll = async () => {
        if (!user?.id) return;
        try {
            await notificationsService.clearAll(user.id);
        } catch (err) {
            console.error('Failed to clear all notifications:', err);
        }
    };

    const getUnreadCount = () => {
        return notifications.filter(notif => !notif.read).length;
    };

    // Toast management (local only — ephemeral)
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
