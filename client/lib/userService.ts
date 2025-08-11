import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { wrapOperation } from './unifiedErrorHandler';
import { createFriendRequestNotification, createFriendAcceptedNotification } from './notificationService';

// Use unified error handler for all operations
const withRetry = <T>(
  operation: () => Promise<T>,
  operationName: string = 'user_service_operation'
): Promise<T> => {
  return wrapOperation(operation, operationName);
};

export interface RealUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  username?: string;
  bio?: string;
  status?: string;
  isOnline: boolean;
  lastSeen: string;
  joinDate: string;
  isVerified?: boolean;
  gameStatus?: {
    game: string;
    status: string;
  };
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: RealUser;
  toUser: RealUser;
  sentAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  participantDetails: RealUser[];
  lastMessage?: {
    senderId: string;
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
  };
  updatedAt: string;
  unreadCounts: Record<string, number>;
}

/**
 * Get all registered users from Firebase Auth/Firestore
 */
export const getAllUsers = async (): Promise<RealUser[]> => {
  return withRetry(async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as RealUser[];

    // Sort on client side to avoid permission issues
    return users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
  }, 'getAllUsers');
};

/**
 * Get online users
 */
export const getOnlineUsers = async (): Promise<RealUser[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isOnline', '==', true));
    const snapshot = await getDocs(q);

    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as RealUser[];

    // Sort on client side to avoid permission issues
    return users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
  } catch (error) {
    console.error('Error fetching online users:', error);
    throw error;
  }
};

/**
 * Get user's friends
 */
export const getUserFriends = async (userId: string): Promise<RealUser[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];
    
    const userData = userDoc.data();
    const friendIds = userData.friends || [];
    
    if (friendIds.length === 0) return [];
    
    const friendsPromises = friendIds.map((friendId: string) => 
      getDoc(doc(db, 'users', friendId))
    );
    
    const friendsDocs = await Promise.all(friendsPromises);
    
    return friendsDocs
      .filter(doc => doc.exists())
      .map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as RealUser[];
  } catch (error) {
    console.error('Error fetching user friends:', error);
    throw error;
  }
};

/**
 * Get friend requests for a user
 */
export const getFriendRequests = async (userId: string): Promise<{
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}> => {
  try {
    const requestsRef = collection(db, 'friendRequests');
    
    // Get incoming requests
    const incomingQuery = query(
      requestsRef, 
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const incomingSnapshot = await getDocs(incomingQuery);
    
    // Get outgoing requests  
    const outgoingQuery = query(
      requestsRef,
      where('fromUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const outgoingSnapshot = await getDocs(outgoingQuery);
    
    // Get user details for requests
    const incoming = await Promise.all(
      incomingSnapshot.docs.map(async (requestDoc) => {
        const requestData = requestDoc.data();
        const fromUserDoc = await getDoc(doc(db, 'users', requestData.fromUserId));
        const toUserDoc = await getDoc(doc(db, 'users', requestData.toUserId));
        
        return {
          id: requestDoc.id,
          ...requestData,
          fromUser: { uid: fromUserDoc.id, ...fromUserDoc.data() } as RealUser,
          toUser: { uid: toUserDoc.id, ...toUserDoc.data() } as RealUser
        } as FriendRequest;
      })
    );
    
    const outgoing = await Promise.all(
      outgoingSnapshot.docs.map(async (requestDoc) => {
        const requestData = requestDoc.data();
        const fromUserDoc = await getDoc(doc(db, 'users', requestData.fromUserId));
        const toUserDoc = await getDoc(doc(db, 'users', requestData.toUserId));
        
        return {
          id: requestDoc.id,
          ...requestData,
          fromUser: { uid: fromUserDoc.id, ...fromUserDoc.data() } as RealUser,
          toUser: { uid: toUserDoc.id, ...toUserDoc.data() } as RealUser
        } as FriendRequest;
      })
    );
    
    return { incoming, outgoing };
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    throw error;
  }
};

/**
 * Send friend request
 */
export const sendFriendRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
  return withRetry(async () => {
    // Check if request already exists
    const requestsRef = collection(db, 'friendRequests');
    const existingQuery = query(
      requestsRef,
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error('Friend request already sent');
    }

    // Check if already friends
    const userDoc = await getDoc(doc(db, 'users', fromUserId));
    const userData = userDoc.data();
    if (userData?.friends?.includes(toUserId)) {
      throw new Error('Users are already friends');
    }

    await addDoc(requestsRef, {
      fromUserId,
      toUserId,
      sentAt: new Date().toISOString(),
      status: 'pending'
    });

    // Create notification for the recipient
    try {
      const fromUserDoc = await getDoc(doc(db, 'users', fromUserId));
      const fromUserData = fromUserDoc.exists() ? fromUserDoc.data() : null;
      const fromUserName = fromUserData?.displayName || fromUserData?.username || 'Unknown User';
      const fromUserAvatar = fromUserData?.photoURL || '';

      await createFriendRequestNotification(
        toUserId,
        fromUserId,
        fromUserName,
        fromUserAvatar
      );
    } catch (notificationError) {
      console.error('Error creating friend request notification:', notificationError);
      // Don't fail the friend request if notification creation fails
    }
  }, 'sendFriendRequest');
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const requestData = requestDoc.data();
    const { fromUserId, toUserId } = requestData;

    // Add each user to the other's friends list
    await updateDoc(doc(db, 'users', fromUserId), {
      friends: arrayUnion(toUserId)
    });

    await updateDoc(doc(db, 'users', toUserId), {
      friends: arrayUnion(fromUserId)
    });

    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    });

    // Mark friend request notification as read for the person who accepted it
    await markFriendRequestNotificationAsRead(fromUserId, toUserId);

    // Create notification for the person who sent the request
    try {
      const toUserDoc = await getDoc(doc(db, 'users', toUserId));
      const toUserData = toUserDoc.exists() ? toUserDoc.data() : null;
      const toUserName = toUserData?.displayName || toUserData?.username || 'Unknown User';
      const toUserAvatar = toUserData?.photoURL || '';

      await createFriendAcceptedNotification(
        fromUserId,
        toUserId,
        toUserName,
        toUserAvatar
      );
    } catch (notificationError) {
      console.error('Error creating friend accepted notification:', notificationError);
      // Don't fail the accept if notification creation fails
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Reject friend request
 */
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (requestDoc.exists()) {
      const requestData = requestDoc.data();
      const { fromUserId, toUserId } = requestData;

      // Mark friend request notification as read for the person who rejected it
      await markFriendRequestNotificationAsRead(fromUserId, toUserId);
    }

    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

/**
 * Remove friend
 */
export const removeFriend = async (userId: string, friendId: string): Promise<void> => {
  try {
    // Remove friend from both users' friend lists
    await updateDoc(doc(db, 'users', userId), {
      friends: arrayRemove(friendId)
    });

    await updateDoc(doc(db, 'users', friendId), {
      friends: arrayRemove(userId)
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

/**
 * Check if two users are friends
 */
export const areFriends = async (userId1: string, userId2: string): Promise<boolean> => {
  try {
    const user1Doc = await getDoc(doc(db, 'users', userId1));
    if (!user1Doc.exists()) return false;

    const user1Data = user1Doc.data();
    const friends = user1Data.friends || [];

    return friends.includes(userId2);
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};

/**
 * Mark friend request notifications as read
 */
const markFriendRequestNotificationAsRead = async (
  fromUserId: string,
  toUserId: string
): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const notificationQuery = query(
      notificationsRef,
      where('userId', '==', toUserId),
      where('type', '==', 'friend_request'),
      where('relatedUserId', '==', fromUserId),
      where('isRead', '==', false)
    );

    const notificationSnapshot = await getDocs(notificationQuery);

    const updatePromises = notificationSnapshot.docs.map(notificationDoc =>
      updateDoc(notificationDoc.ref, {
        isRead: true,
        updatedAt: new Date().toISOString()
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking friend request notifications as read:', error);
    // Don't throw error as this is secondary functionality
  }
};

/**
 * Mark all friend-related notifications as read for a user
 */
export const markAllFriendNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const notificationQuery = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const notificationSnapshot = await getDocs(notificationQuery);

    // Filter friend-related notifications and mark them as read
    const updatePromises = notificationSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.type === 'friend_request' || data.type === 'friend_accepted';
      })
      .map(notificationDoc =>
        updateDoc(notificationDoc.ref, {
          isRead: true,
          updatedAt: new Date().toISOString()
        })
      );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all friend notifications as read:', error);
    throw error;
  }
};

/**
 * Get conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );

    const snapshot = await getDocs(q);

    const conversations = await Promise.all(
      snapshot.docs.map(async (conversationDoc) => {
        const conversationData = conversationDoc.data();

        // Get participant details
        const participantDetails = await Promise.all(
          conversationData.participants.map(async (participantId: string) => {
            const userDoc = await getDoc(doc(db, 'users', participantId));
            return { uid: userDoc.id, ...userDoc.data() } as RealUser;
          })
        );

        return {
          id: conversationDoc.id,
          ...conversationData,
          participantDetails
        } as Conversation;
      })
    );

    // Sort on client side by updatedAt descending
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Search users by username or display name
 */
export const searchUsers = async (searchTerm: string): Promise<RealUser[]> => {
  if (!searchTerm.trim()) return [];

  return withRetry(async () => {
    const usersRef = collection(db, 'users');

    // Get all users and filter on client side to avoid permission issues
    const snapshot = await getDocs(usersRef);

    const allUsers = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as RealUser[];

    // Client-side search
    const searchTermLower = searchTerm.toLowerCase();
    const filteredUsers = allUsers.filter(user => {
      const username = (user.username || '').toLowerCase();
      const displayName = (user.displayName || '').toLowerCase();
      return username.includes(searchTermLower) || displayName.includes(searchTermLower);
    });

    // Return first 10 results
    return filteredUsers.slice(0, 10);
  }, 'searchUsers');
};

/**
 * Subscribe to real-time user friends updates
 */
export const subscribeToUserFriends = (userId: string, callback: (friends: RealUser[]) => void) => {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(userRef, async (userDoc) => {
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const friendIds = userData.friends || [];

      if (friendIds.length === 0) {
        callback([]);
        return;
      }

      try {
        const friendsPromises = friendIds.map((friendId: string) =>
          getDoc(doc(db, 'users', friendId))
        );

        const friendsDocs = await Promise.all(friendsPromises);

        const friends = friendsDocs
          .filter(doc => doc.exists())
          .map(doc => ({
            uid: doc.id,
            ...doc.data()
          })) as RealUser[];

        callback(friends);
      } catch (error) {
        console.error('Error in friends subscription:', error);
        callback([]);
      }
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('User friends subscription error:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied: Please update Firestore rules');
    }
    callback([]);
  });
};

/**
 * Subscribe to real-time friend requests
 */
export const subscribeToFriendRequests = (
  userId: string,
  callback: (requests: { incoming: FriendRequest[]; outgoing: FriendRequest[] }) => void
) => {
  // Refresh function that fetches all data with retry
  const refreshData = async () => {
    try {
      const requests = await withRetry(() => getFriendRequests(userId), 'getFriendRequests');
      callback(requests);
    } catch (error: any) {
      console.error('Error refreshing friend requests:', error);

      // Show user-friendly error message for network issues
      if (error.message.includes('Failed to fetch') || error.code === 'unavailable') {
        console.warn('Network connection issue - retrying in background');
      }

      callback({ incoming: [], outgoing: [] });
    }
  };

  // Initial load
  refreshData();

  // Set up real-time listening for any changes in friendRequests collection
  const requestsRef = collection(db, 'friendRequests');

  const unsubscribe = onSnapshot(requestsRef, () => {
    // When any document in friendRequests changes, refresh all data
    refreshData();
  }, (error) => {
    console.error('Friend requests subscription error:', error);

    if (error.code === 'permission-denied') {
      console.error('Permission denied: Please update Firestore rules');
    } else if (error.message.includes('Failed to fetch') || error.code === 'unavailable') {
      console.warn('Network connection issue with subscription - will retry automatically');
      // Try to reconnect after a delay
      setTimeout(() => {
        refreshData();
      }, 5000);
    }
  });

  return unsubscribe;
};

export default {
  getAllUsers,
  getOnlineUsers,
  getUserFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getUserConversations,
  searchUsers,
  subscribeToUserFriends,
  subscribeToFriendRequests,
  areFriends
};
