import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  NotificationData, 
  NotificationCounts,
  subscribeToNotifications,
  subscribeToNotificationCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../lib/notificationService';

interface NotificationContextType {
  notifications: NotificationData[];
  counts: NotificationCounts;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    messages: 0,
    friendRequests: 0,
    others: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setCounts({ total: 0, messages: 0, friendRequests: 0, others: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Subscribe to notifications
      const unsubscribeNotifications = subscribeToNotifications(user.uid, (realTimeNotifications) => {
        setNotifications(realTimeNotifications);
        setLoading(false);
      });

      // Subscribe to notification counts
      const unsubscribeCounts = subscribeToNotificationCounts(user.uid, (realTimeCounts) => {
        setCounts(realTimeCounts);
      });

      return () => {
        try {
          unsubscribeNotifications();
          unsubscribeCounts();
        } catch (error) {
          console.warn('Error unsubscribing from notifications:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up notification subscriptions:', error);
      setLoading(false);
    }
  }, [user?.uid]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // The real-time subscription will update the state automatically
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      await markAllNotificationsAsRead(user.uid);
      // The real-time subscription will update the state automatically
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = () => {
    // The real-time subscriptions will automatically refresh
    // This is just a placeholder for manual refresh if needed
  };

  const value: NotificationContextType = {
    notifications,
    counts,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
