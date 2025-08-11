import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export interface NotificationData {
  id: string;
  userId: string; // Who should receive this notification
  type: 'message' | 'friend_request' | 'friend_accepted' | 'group_invite' | 'server_invite' | 'mention';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Additional data based on type
  relatedUserId?: string; // For friend requests, who sent it
  relatedUserName?: string;
  relatedUserAvatar?: string;
  conversationId?: string; // For messages
  serverId?: string; // For server related notifications
  groupId?: string; // For group related notifications
  
  // Action data
  actionUrl?: string; // Where to navigate when clicked
  actionData?: any; // Additional action data
}

export interface NotificationCounts {
  total: number;
  messages: number;
  friendRequests: number;
  others: number;
}

/**
 * Create a new notification
 */
export const createNotification = async (notification: Omit<NotificationData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const notificationData = {
      ...notification,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(notificationsRef, notificationData);
    console.log('Notification created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (
  userId: string, 
  limitCount: number = 50
): Promise<NotificationData[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NotificationData[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        isRead: true,
        updatedAt: new Date().toISOString()
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Get notification counts
 */
export const getNotificationCounts = async (userId: string): Promise<NotificationCounts> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => doc.data()) as NotificationData[];
    
    const counts: NotificationCounts = {
      total: notifications.length,
      messages: notifications.filter(n => n.type === 'message').length,
      friendRequests: notifications.filter(n => n.type === 'friend_request').length,
      others: notifications.filter(n => !['message', 'friend_request'].includes(n.type)).length
    };
    
    return counts;
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    return { total: 0, messages: 0, friendRequests: 0, others: 0 };
  }
};

/**
 * Subscribe to real-time notifications
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: NotificationData[]) => void
) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    try {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationData[];
      
      callback(notifications);
    } catch (error) {
      console.error('Error in notifications subscription:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Notifications subscription error:', error);
    callback([]);
  });
};

/**
 * Subscribe to notification counts
 */
export const subscribeToNotificationCounts = (
  userId: string,
  callback: (counts: NotificationCounts) => void
) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('isRead', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    try {
      const notifications = snapshot.docs.map(doc => doc.data()) as NotificationData[];
      
      const counts: NotificationCounts = {
        total: notifications.length,
        messages: notifications.filter(n => n.type === 'message').length,
        friendRequests: notifications.filter(n => n.type === 'friend_request').length,
        others: notifications.filter(n => !['message', 'friend_request'].includes(n.type)).length
      };
      
      callback(counts);
    } catch (error) {
      console.error('Error in notification counts subscription:', error);
      callback({ total: 0, messages: 0, friendRequests: 0, others: 0 });
    }
  }, (error) => {
    console.error('Notification counts subscription error:', error);
    callback({ total: 0, messages: 0, friendRequests: 0, others: 0 });
  });
};

/**
 * Helper functions for creating specific notification types
 */

// Message notification
export const createMessageNotification = async (
  recipientUserId: string,
  senderUserId: string,
  senderName: string,
  senderAvatar: string,
  conversationId: string,
  messageContent: string
): Promise<string> => {
  return createNotification({
    userId: recipientUserId,
    type: 'message',
    title: `${senderName} size mesaj gönderdi`,
    message: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent,
    isRead: false,
    relatedUserId: senderUserId,
    relatedUserName: senderName,
    relatedUserAvatar: senderAvatar,
    conversationId,
    actionUrl: `/chat?conversation=${conversationId}`
  });
};

// Friend request notification
export const createFriendRequestNotification = async (
  recipientUserId: string,
  senderUserId: string,
  senderName: string,
  senderAvatar: string
): Promise<string> => {
  return createNotification({
    userId: recipientUserId,
    type: 'friend_request',
    title: 'Yeni arkadaşlık isteği',
    message: `${senderName} size arkadaşlık isteği gönderdi`,
    isRead: false,
    relatedUserId: senderUserId,
    relatedUserName: senderName,
    relatedUserAvatar: senderAvatar,
    actionUrl: '/friends'
  });
};

// Friend request accepted notification
export const createFriendAcceptedNotification = async (
  recipientUserId: string,
  acceptedByUserId: string,
  acceptedByName: string,
  acceptedByAvatar: string
): Promise<string> => {
  return createNotification({
    userId: recipientUserId,
    type: 'friend_accepted',
    title: 'Arkadaşlık isteği kabul edildi',
    message: `${acceptedByName} arkadaşlık isteğinizi kabul etti`,
    isRead: false,
    relatedUserId: acceptedByUserId,
    relatedUserName: acceptedByName,
    relatedUserAvatar: acceptedByAvatar,
    actionUrl: '/friends'
  });
};

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCounts,
  subscribeToNotifications,
  subscribeToNotificationCounts,
  createMessageNotification,
  createFriendRequestNotification,
  createFriendAcceptedNotification
};
