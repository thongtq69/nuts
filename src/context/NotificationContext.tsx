'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface NotificationItem {
    _id: string;
    title: string;
    message: string;
    type: 'order' | 'user' | 'system';
    link?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const canFetchNotifications = user?.role === 'admin' || user?.role === 'staff';

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
    };

    const fetchNotifications = useCallback(async () => {
        if (!canFetchNotifications) {
            clearNotifications();
            return;
        }

        try {
            const res = await fetch('/api/admin/notifications?limit=20');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            } else if (res.status === 401 || res.status === 403) {
                clearNotifications();
            } else {
                throw new Error(`Notification request failed with status ${res.status}`);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    }, [canFetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            await fetch(`/api/admin/notifications/${id}/read`, { method: 'PUT' });
        } catch (error) {
            console.error('Failed to mark notification as read', error);
            // Revert on error could be implemented here
            await fetchNotifications();
        }
    };

    useEffect(() => {
        if (authLoading) return;

        fetchNotifications();
        if (!canFetchNotifications) return;

        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [authLoading, canFetchNotifications, fetchNotifications]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, refresh: fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
