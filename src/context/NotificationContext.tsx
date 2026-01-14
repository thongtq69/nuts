'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { INotification } from '@/models/Notification'; // We might need to omit server-only types if INotification imports mongoose. 
// Actually INotification imports mongoose in the model file, which is not good for client.
// Let's define a CleanNotification interface locally or in a shared types file. 
// For now, I'll define it here to avoid import issues with mongoose in client components.

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
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications?limit=20');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

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
            fetchNotifications();
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

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
