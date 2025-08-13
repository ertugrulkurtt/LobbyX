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
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { RealUser } from './userService';

export interface ServerChannel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'announcement';
  category?: string;
  description?: string;
  isPrivate: boolean;
  connectedUsers?: string[]; // For voice channels
  lastActivity?: string;
  permissions?: {
    view: string[]; // role IDs or user IDs
    send: string[];
    connect?: string[]; // for voice channels
  };
}

export interface ServerCategory {
  id: string;
  name: string;
  channels: ServerChannel[];
  order: number;
  permissions?: {
    view: string[];
  };
}

export interface ServerRole {
  id: string;
  name: string;
  color: string;
  permissions: string[];
  mentionable: boolean;
  hoisted: boolean; // Display separately in member list
  order: number;
}

export interface ServerMember {
  userId: string;
  user: RealUser;
  roles: string[];
  joinedAt: string;
  nickname?: string;
  isOnline: boolean;
  status?: 'online' | 'away' | 'busy' | 'invisible';
  voiceChannelId?: string;
}

export interface Server {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  banner?: string;
  ownerId: string;
  createdAt: string;
  memberCount: number;
  categories: ServerCategory[];
  roles: ServerRole[];
  members: ServerMember[];
  isPublic: boolean;
  inviteCode?: string;
  features: string[]; // 'VOICE_CHANNELS', 'ANNOUNCEMENTS', etc.
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  ownerId: string;
  members: string[];
  memberDetails: RealUser[];
  createdAt: string;
  isPrivate: boolean;
  lastActivity: string;
  maxMembers?: number;
  tags?: string[];
}

export interface ServerInvite {
  id: string;
  serverId: string;
  server: Server;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

/**
 * Get all public servers
 */
export const getPublicServers = async (): Promise<Server[]> => {
  try {
    const serversRef = collection(db, 'servers');
    const q = query(
      serversRef,
      where('isPublic', '==', true),
      orderBy('memberCount', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const servers = await Promise.all(
      snapshot.docs.map(async (serverDoc) => {
        const serverData = serverDoc.data();
        
        // Get member details
        const memberDetails = await getServerMembers(serverDoc.id);
        
        return {
          id: serverDoc.id,
          ...serverData,
          members: memberDetails
        } as Server;
      })
    );
    
    return servers;
  } catch (error) {
    console.error('Error fetching public servers:', error);
    throw error;
  }
};

/**
 * Get servers that user is a member of
 */
export const getUserServers = async (userId: string): Promise<Server[]> => {
  try {
    const serversRef = collection(db, 'servers');
    const q = query(
      serversRef,
      where('members', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    
    const servers = await Promise.all(
      snapshot.docs.map(async (serverDoc) => {
        const serverData = serverDoc.data();
        const memberDetails = await getServerMembers(serverDoc.id);
        
        return {
          id: serverDoc.id,
          ...serverData,
          members: memberDetails
        } as Server;
      })
    );
    
    return servers;
  } catch (error) {
    console.error('Error fetching user servers:', error);
    throw error;
  }
};

/**
 * Get server details by ID
 */
export const getServerById = async (serverId: string): Promise<Server | null> => {
  try {
    const serverDoc = await getDoc(doc(db, 'servers', serverId));
    
    if (!serverDoc.exists()) return null;
    
    const serverData = serverDoc.data();
    const memberDetails = await getServerMembers(serverId);
    
    return {
      id: serverDoc.id,
      ...serverData,
      members: memberDetails
    } as Server;
  } catch (error) {
    console.error('Error fetching server:', error);
    throw error;
  }
};

/**
 * Get server members with user details
 */
export const getServerMembers = async (serverId: string): Promise<ServerMember[]> => {
  try {
    const membersRef = collection(db, 'servers', serverId, 'members');
    const snapshot = await getDocs(membersRef);
    
    const members = await Promise.all(
      snapshot.docs.map(async (memberDoc) => {
        const memberData = memberDoc.data();
        const userDoc = await getDoc(doc(db, 'users', memberData.userId));
        
        return {
          ...memberData,
          user: { uid: userDoc.id, ...userDoc.data() } as RealUser
        } as ServerMember;
      })
    );
    
    return members;
  } catch (error) {
    console.error('Error fetching server members:', error);
    throw error;
  }
};

/**
 * Join server
 */
export const joinServer = async (serverId: string, userId: string): Promise<void> => {
  try {
    // Add user to server members
    const memberRef = doc(db, 'servers', serverId, 'members', userId);
    await updateDoc(memberRef, {
      userId,
      roles: ['member'], // Default role
      joinedAt: new Date().toISOString(),
      isOnline: true
    });
    
    // Update server member count
    const serverRef = doc(db, 'servers', serverId);
    const serverDoc = await getDoc(serverRef);
    if (serverDoc.exists()) {
      const currentCount = serverDoc.data().memberCount || 0;
      await updateDoc(serverRef, {
        memberCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error joining server:', error);
    throw error;
  }
};

/**
 * Leave server
 */
export const leaveServer = async (serverId: string, userId: string): Promise<void> => {
  try {
    // Remove user from server members
    const memberRef = doc(db, 'servers', serverId, 'members', userId);
    await deleteDoc(memberRef);
    
    // Update server member count
    const serverRef = doc(db, 'servers', serverId);
    const serverDoc = await getDoc(serverRef);
    if (serverDoc.exists()) {
      const currentCount = serverDoc.data().memberCount || 0;
      await updateDoc(serverRef, {
        memberCount: Math.max(0, currentCount - 1)
      });
    }
  } catch (error) {
    console.error('Error leaving server:', error);
    throw error;
  }
};

/**
 * Create server
 */
export const createServer = async (serverData: Partial<Server>, ownerId: string): Promise<string> => {
  try {
    const defaultCategories: ServerCategory[] = [
      {
        id: 'general',
        name: 'GENEL',
        order: 0,
        channels: [
          {
            id: 'general-text',
            name: 'genel',
            type: 'text',
            category: 'general',
            isPrivate: false,
            lastActivity: new Date().toISOString()
          },
          {
            id: 'general-voice',
            name: 'Genel Sohbet',
            type: 'voice',
            category: 'general',
            isPrivate: false,
            connectedUsers: []
          }
        ]
      }
    ];

    const defaultRoles: ServerRole[] = [
      {
        id: 'owner',
        name: 'Owner',
        color: '#ff0000',
        permissions: ['ADMINISTRATOR'],
        mentionable: false,
        hoisted: true,
        order: 0
      },
      {
        id: 'member',
        name: 'Member',
        color: '#99aab5',
        permissions: ['VIEW_CHANNELS', 'SEND_MESSAGES', 'CONNECT'],
        mentionable: true,
        hoisted: false,
        order: 999
      }
    ];

    const newServer = {
      name: serverData.name || 'Yeni Sunucu',
      description: serverData.description || '',
      ownerId,
      createdAt: new Date().toISOString(),
      memberCount: 1,
      categories: defaultCategories,
      roles: defaultRoles,
      isPublic: serverData.isPublic || false,
      features: ['VOICE_CHANNELS', 'TEXT_CHANNELS']
    };

    const serverRef = await addDoc(collection(db, 'servers'), newServer);
    
    // Add owner as first member
    const memberRef = doc(db, 'servers', serverRef.id, 'members', ownerId);
    await updateDoc(memberRef, {
      userId: ownerId,
      roles: ['owner'],
      joinedAt: new Date().toISOString(),
      isOnline: true
    });

    return serverRef.id;
  } catch (error) {
    console.error('Error creating server:', error);
    throw error;
  }
};

/**
 * Get user's groups
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(
      groupsRef,
      where('members', 'array-contains', userId),
      orderBy('lastActivity', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const groups = await Promise.all(
      snapshot.docs.map(async (groupDoc) => {
        const groupData = groupDoc.data();
        
        // Get member details
        const memberDetails = await Promise.all(
          groupData.members.map(async (memberId: string) => {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            return { uid: userDoc.id, ...userDoc.data() } as RealUser;
          })
        );
        
        return {
          id: groupDoc.id,
          ...groupData,
          memberDetails
        } as Group;
      })
    );
    
    return groups;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};

/**
 * Create group
 */
export const createGroup = async (groupData: Partial<Group>, ownerId: string): Promise<string> => {
  try {
    const newGroup = {
      name: groupData.name || 'Yeni Grup',
      description: groupData.description || '',
      ownerId,
      members: [ownerId],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isPrivate: groupData.isPrivate || false,
      maxMembers: groupData.maxMembers || 50,
      tags: groupData.tags || []
    };

    const groupRef = await addDoc(collection(db, 'groups'), newGroup);
    return groupRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

/**
 * Join voice channel
 */
export const joinVoiceChannel = async (
  serverId: string, 
  channelId: string, 
  userId: string
): Promise<void> => {
  try {
    const serverRef = doc(db, 'servers', serverId);
    const serverDoc = await getDoc(serverRef);
    
    if (!serverDoc.exists()) return;
    
    const serverData = serverDoc.data();
    const categories = serverData.categories || [];
    
    // Find and update the channel
    const updatedCategories = categories.map((category: ServerCategory) => ({
      ...category,
      channels: category.channels.map((channel: ServerChannel) => {
        if (channel.id === channelId && channel.type === 'voice') {
          return {
            ...channel,
            connectedUsers: [...(channel.connectedUsers || []), userId]
          };
        }
        return channel;
      })
    }));
    
    await updateDoc(serverRef, { categories: updatedCategories });
    
    // Update user's voice channel status
    const memberRef = doc(db, 'servers', serverId, 'members', userId);
    await updateDoc(memberRef, {
      voiceChannelId: channelId
    });
  } catch (error) {
    console.error('Error joining voice channel:', error);
    throw error;
  }
};

/**
 * Leave voice channel
 */
export const leaveVoiceChannel = async (
  serverId: string, 
  channelId: string, 
  userId: string
): Promise<void> => {
  try {
    const serverRef = doc(db, 'servers', serverId);
    const serverDoc = await getDoc(serverRef);
    
    if (!serverDoc.exists()) return;
    
    const serverData = serverDoc.data();
    const categories = serverData.categories || [];
    
    // Find and update the channel
    const updatedCategories = categories.map((category: ServerCategory) => ({
      ...category,
      channels: category.channels.map((channel: ServerChannel) => {
        if (channel.id === channelId && channel.type === 'voice') {
          return {
            ...channel,
            connectedUsers: (channel.connectedUsers || []).filter(id => id !== userId)
          };
        }
        return channel;
      })
    }));
    
    await updateDoc(serverRef, { categories: updatedCategories });
    
    // Update user's voice channel status
    const memberRef = doc(db, 'servers', serverId, 'members', userId);
    await updateDoc(memberRef, {
      voiceChannelId: null
    });
  } catch (error) {
    console.error('Error leaving voice channel:', error);
    throw error;
  }
};

/**
 * Subscribe to server updates
 */
export const subscribeToServer = (serverId: string, callback: (server: Server | null) => void) => {
  const serverRef = doc(db, 'servers', serverId);
  
  return onSnapshot(serverRef, async (serverDoc) => {
    if (serverDoc.exists()) {
      const serverData = serverDoc.data();
      const memberDetails = await getServerMembers(serverId);
      
      callback({
        id: serverDoc.id,
        ...serverData,
        members: memberDetails
      } as Server);
    } else {
      callback(null);
    }
  });
};

/**
 * Subscribe to user's servers
 */
export const subscribeToUserServers = (userId: string, callback: (servers: Server[]) => void) => {
  const serversRef = collection(db, 'servers');
  const q = query(
    serversRef,
    where('members', 'array-contains', userId)
  );
  
  return onSnapshot(q, async (snapshot) => {
    const servers = await Promise.all(
      snapshot.docs.map(async (serverDoc) => {
        const serverData = serverDoc.data();
        const memberDetails = await getServerMembers(serverDoc.id);
        
        return {
          id: serverDoc.id,
          ...serverData,
          members: memberDetails
        } as Server;
      })
    );
    
    callback(servers);
  });
};

export default {
  getPublicServers,
  getUserServers,
  getServerById,
  getServerMembers,
  joinServer,
  leaveServer,
  createServer,
  getUserGroups,
  createGroup,
  joinVoiceChannel,
  leaveVoiceChannel,
  subscribeToServer,
  subscribeToUserServers
};
