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
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, withExponentialBackoff } from './firebase';
import { wrapOperation, reportError } from './unifiedErrorHandler';
import { RealUser, areFriends } from './userService';
import { createMessageNotification } from './notificationService';
import { handleNetworkError } from './firebaseConnectionMonitor';

// Use unified error handler for all operations
const withRetry = <T>(
  operation: () => Promise<T>,
  operationName: string = 'firebase_operation'
): Promise<T> => {
  return wrapOperation(operation, operationName);
};

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: RealUser;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isDelivered: boolean;
  isRead: boolean;
  readBy: { userId: string; readAt: string }[];
  editedAt?: string;
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
  };
  reactions?: {
    emoji: string;
    users: string[];
    count: number;
  }[];
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'server';
  participants: string[];
  participantDetails: RealUser[];
  name?: string; // For group conversations
  icon?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    senderId: string;
    content: string;
    timestamp: string;
    type: string;
  };
  unreadCounts: Record<string, number>;
  serverId?: string; // For server channels
  channelId?: string; // For server channels
}

/**
 * Get conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  return withRetry(async () => {
    const conversationsRef = collection(db, 'conversations');
    // Remove orderBy to avoid composite index requirement
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

    // Sort conversations by updatedAt on client side
    return conversations.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime; // Descending order (newest first)
    });
  }, 'getUserConversations');
};

/**
 * Get or create direct conversation between two users
 */
export const getOrCreateDirectConversation = async (
  userId1: string,
  userId2: string
): Promise<string> => {
  return withRetry(async () => {
    // Check if users are friends before allowing conversation
    const friendshipStatus = await areFriends(userId1, userId2);
    if (!friendshipStatus) {
      throw new Error('Sadece arkadaşlarınızla sohbet edebilirsiniz. Önce arkadaş olmanız gerekiyor.');
    }

    // Check if conversation already exists
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('type', '==', 'direct'),
      where('participants', 'array-contains', userId1)
    );

    const snapshot = await getDocs(q);

    // Find existing conversation
    for (const conversationDoc of snapshot.docs) {
      const data = conversationDoc.data();
      if (data.participants.includes(userId2)) {
        return conversationDoc.id;
      }
    }

    // Create new conversation (only if they are friends)
    const newConversation = {
      type: 'direct',
      participants: [userId1, userId2],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCounts: {
        [userId1]: 0,
        [userId2]: 0
      }
    };

    const conversationRef = await addDoc(conversationsRef, newConversation);
    return conversationRef.id;
  });
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> => {
  return withRetry(async () => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    const messages = await Promise.all(
      snapshot.docs.map(async (messageDoc) => {
        const messageData = messageDoc.data();

        // Get sender details
        const senderDoc = await getDoc(doc(db, 'users', messageData.senderId));
        const sender = { uid: senderDoc.id, ...senderDoc.data() } as RealUser;

        return {
          id: messageDoc.id,
          ...messageData,
          sender
        } as Message;
      })
    );

    return messages.reverse(); // Return in chronological order
  }, 'getConversationMessages');
};

/**
 * Send message
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: 'text' | 'image' | 'file' | 'voice' = 'text',
  fileUrl?: string,
  fileName?: string,
  fileSize?: number,
  replyTo?: { messageId: string; content: string; senderId: string }
): Promise<string> => {
  console.log('Sending message:', { conversationId, senderId, content, type });

  return withRetry(async () => {
    // First, check if this is a direct conversation and verify friendship
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();

      // If it's a direct conversation, check friendship
      if (conversationData.type === 'direct') {
        const participants = conversationData.participants || [];
        const otherParticipant = participants.find((id: string) => id !== senderId);

        if (otherParticipant) {
          const friendshipStatus = await areFriends(senderId, otherParticipant);
          if (!friendshipStatus) {
            throw new Error('Bu kişiyle artık arkadaş olmadığınız için mesaj gönderemezsiniz.');
          }
        }
      }
    }

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const timestamp = new Date().toISOString();

    const messageData: any = {
      conversationId,
      senderId,
      content,
      timestamp,
      type,
      isDelivered: true,
      isRead: false,
      readBy: [],
      reactions: []
    };

    // Only add optional fields if they have values (not undefined)
    if (fileUrl !== undefined) messageData.fileUrl = fileUrl;
    if (fileName !== undefined) messageData.fileName = fileName;
    if (fileSize !== undefined) messageData.fileSize = fileSize;
    if (replyTo !== undefined) messageData.replyTo = replyTo;

    console.log('Adding message to Firestore:', messageData);
    const messageRef = await addDoc(messagesRef, messageData);
    console.log('Message added with ID:', messageRef.id);

    // Update conversation with last message (reuse existing conversationRef)
    const conversationUpdate = {
      lastMessage: {
        senderId,
        content: type === 'text' ? content : `📎 ${fileName || 'Dosya'}`,
        timestamp,
        type
      },
      updatedAt: timestamp
    };

    console.log('Updating conversation:', conversationUpdate);
    await updateDoc(conversationRef, conversationUpdate);

    // Update unread counts for other participants and create notifications
    // Get fresh conversation data after the last message update
    const updatedConversationDoc = await getDoc(conversationRef);
    if (updatedConversationDoc.exists()) {
      const updatedConversationData = updatedConversationDoc.data();
      const participants = updatedConversationData.participants || [];
      const currentUnreadCounts = updatedConversationData.unreadCounts || {};

      const newUnreadCounts = { ...currentUnreadCounts };

      // Get sender details for notifications
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.exists() ? senderDoc.data() : null;
      const senderName = senderData?.displayName || senderData?.username || 'Unknown User';
      const senderAvatar = senderData?.photoURL || '';

      // Update unread counts and create notifications for other participants
      for (const participantId of participants) {
        if (participantId !== senderId) {
          newUnreadCounts[participantId] = (newUnreadCounts[participantId] || 0) + 1;

          // Create notification for this participant
          try {
            await createMessageNotification(
              participantId,
              senderId,
              senderName,
              senderAvatar,
              conversationId,
              content
            );
          } catch (notificationError) {
            console.error('Error creating message notification:', notificationError);
            // Don't fail the message sending if notification creation fails
          }
        }
      }

      console.log('Updating unread counts:', newUnreadCounts);
      await updateDoc(conversationRef, {
        unreadCounts: newUnreadCounts
      });
    }

    console.log('Message sent successfully');
    return messageRef.id;
  }, 'sendMessage');
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    // Reset unread count for this user
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const currentUnreadCounts = conversationData.unreadCounts || {};

      await updateDoc(conversationRef, {
        unreadCounts: {
          ...currentUnreadCounts,
          [userId]: 0
        }
      });
    }

    // Mark individual messages as read
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    // Remove compound where clause to avoid index requirement
    const unreadQuery = query(
      messagesRef,
      where('isRead', '==', false)
    );

    const unreadSnapshot = await getDocs(unreadQuery);

    // Filter on client side to avoid composite index requirement
    const updatePromises = unreadSnapshot.docs
      .filter(messageDoc => {
        const messageData = messageDoc.data();
        return messageData.senderId !== userId; // Filter out user's own messages
      })
      .map(async (messageDoc) => {
        const messageData = messageDoc.data();
        const readBy = messageData.readBy || [];

        // Add this user to readBy if not already there
        if (!readBy.some((read: any) => read.userId === userId)) {
          await updateDoc(messageDoc.ref, {
            readBy: [
              ...readBy,
              { userId, readAt: new Date().toISOString() }
            ],
            isRead: true
          });
        }
      });

    await Promise.all(updatePromises);

    // Mark related message notifications as read
    await markMessageNotificationsAsRead(conversationId, userId);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Mark message notifications as read for a specific conversation
 */
const markMessageNotificationsAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const notificationQuery = query(
      notificationsRef,
      where('userId', '==', userId),
      where('type', '==', 'message'),
      where('conversationId', '==', conversationId),
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
    console.error('Error marking message notifications as read:', error);
    // Don't throw error as this is secondary functionality
  }
};

/**
 * Add reaction to message
 */
export const addReaction = async (
  conversationId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) return;
    
    const messageData = messageDoc.data();
    const reactions = messageData.reactions || [];
    
    // Find existing reaction with this emoji
    const existingReactionIndex = reactions.findIndex((r: any) => r.emoji === emoji);
    
    if (existingReactionIndex >= 0) {
      const existingReaction = reactions[existingReactionIndex];
      
      if (existingReaction.users.includes(userId)) {
        // Remove user's reaction
        const updatedUsers = existingReaction.users.filter((id: string) => id !== userId);
        
        if (updatedUsers.length === 0) {
          // Remove entire reaction if no users left
          reactions.splice(existingReactionIndex, 1);
        } else {
          // Update users list
          reactions[existingReactionIndex] = {
            ...existingReaction,
            users: updatedUsers,
            count: updatedUsers.length
          };
        }
      } else {
        // Add user to existing reaction
        reactions[existingReactionIndex] = {
          ...existingReaction,
          users: [...existingReaction.users, userId],
          count: existingReaction.users.length + 1
        };
      }
    } else {
      // Create new reaction
      reactions.push({
        emoji,
        users: [userId],
        count: 1
      });
    }
    
    await updateDoc(messageRef, { reactions });
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

/**
 * Delete message
 */
export const deleteMessage = async (
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) return;
    
    const messageData = messageDoc.data();
    
    // Only sender can delete their own messages
    if (messageData.senderId !== userId) {
      throw new Error('You can only delete your own messages');
    }
    
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Edit message
 */
export const editMessage = async (
  conversationId: string,
  messageId: string,
  userId: string,
  newContent: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) return;
    
    const messageData = messageDoc.data();
    
    // Only sender can edit their own messages
    if (messageData.senderId !== userId) {
      throw new Error('You can only edit your own messages');
    }
    
    await updateDoc(messageRef, {
      content: newContent,
      editedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Subscribe to conversation messages
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
) => {
  console.log('Setting up message subscription for conversation:', conversationId);

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      console.log('Messages snapshot received:', snapshot.docs.length, 'messages');

      const messages = await Promise.all(
        snapshot.docs.map(async (messageDoc) => {
          const messageData = messageDoc.data();
          console.log('Processing message:', messageDoc.id, messageData);

          // Get sender details with retry
          const senderDoc = await withRetry(() => getDoc(doc(db, 'users', messageData.senderId)));
          const sender = { uid: senderDoc.id, ...senderDoc.data() } as RealUser;

          return {
            id: messageDoc.id,
            ...messageData,
            sender
          } as Message;
        })
      );

      const chronologicalMessages = messages.reverse();
      console.log('Sending', chronologicalMessages.length, 'messages to callback');
      callback(chronologicalMessages);
    } catch (error) {
      console.error('Error in messages subscription:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Messages subscription error:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied: Please update Firestore rules for conversations/messages');
    } else if (error.message.includes('Failed to fetch') || error.code === 'unavailable') {
      console.warn('Network error in messages subscription - will retry automatically');
      // Firebase SDK will automatically retry, so we don't need to do anything
    } else if (error.message.includes('network-request-failed')) {
      console.warn('Network request failed - Firebase will retry');
    }
    callback([]);
  });
};

/**
 * Subscribe to conversations
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const conversationsRef = collection(db, 'conversations');
  // Remove orderBy to avoid composite index requirement
  // We'll sort on the client side instead
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
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

    // Sort conversations by updatedAt on client side to avoid index requirement
    const sortedConversations = conversations.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime; // Descending order (newest first)
    });

    callback(sortedConversations);
    } catch (error) {
      console.error('Error in conversations subscription:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Conversations subscription error:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied: Please update Firestore rules for conversations');
    } else if (error.message.includes('Failed to fetch') || error.code === 'unavailable') {
      console.warn('Network error in conversations subscription - Firebase will retry automatically');
    } else if (error.message.includes('network-request-failed')) {
      console.warn('Network request failed in conversations subscription - Firebase will retry');
    }
    callback([]);
  });
};

export default {
  getUserConversations,
  getOrCreateDirectConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  addReaction,
  deleteMessage,
  editMessage,
  subscribeToMessages,
  subscribeToConversations
};
