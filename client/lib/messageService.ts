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
import { db } from './firebase';
import { RealUser } from './userService';

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
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
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
    
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get or create direct conversation between two users
 */
export const getOrCreateDirectConversation = async (
  userId1: string, 
  userId2: string
): Promise<string> => {
  try {
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
    
    // Create new conversation
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
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> => {
  try {
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
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
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
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const timestamp = new Date().toISOString();
    
    const messageData = {
      conversationId,
      senderId,
      content,
      timestamp,
      type,
      fileUrl,
      fileName,
      fileSize,
      isDelivered: true,
      isRead: false,
      readBy: [],
      replyTo,
      reactions: []
    };
    
    const messageRef = await addDoc(messagesRef, messageData);
    
    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        senderId,
        content: type === 'text' ? content : `📎 ${fileName || 'Dosya'}`,
        timestamp,
        type
      },
      updatedAt: timestamp
    });
    
    // Update unread counts for other participants
    const conversationDoc = await getDoc(conversationRef);
    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const participants = conversationData.participants || [];
      const currentUnreadCounts = conversationData.unreadCounts || {};
      
      const newUnreadCounts = { ...currentUnreadCounts };
      participants.forEach((participantId: string) => {
        if (participantId !== senderId) {
          newUnreadCounts[participantId] = (newUnreadCounts[participantId] || 0) + 1;
        }
      });
      
      await updateDoc(conversationRef, {
        unreadCounts: newUnreadCounts
      });
    }
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
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
    const unreadQuery = query(
      messagesRef,
      where('isRead', '==', false),
      where('senderId', '!=', userId)
    );
    
    const unreadSnapshot = await getDocs(unreadQuery);
    
    const updatePromises = unreadSnapshot.docs.map(async (messageDoc) => {
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
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
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
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, async (snapshot) => {
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
    
    callback(messages.reverse()); // Return in chronological order
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
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
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
    
    callback(conversations);
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
