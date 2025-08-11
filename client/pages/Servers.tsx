import React, { useState } from 'react';
import {
  Server,
  Search,
  Users,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Reply,
  Trash2,
  Check,
  Shield,
  Clock,
  Image,
  Mic,
  Plus,
  Globe,
  Lock,
  Crown,
  X,
  UserPlus,
  UserMinus,
  Settings,
  Upload,
  ChevronDown,
  ChevronRight,
  Hash,
  Volume2,
  Eye,
  EyeOff,
  UserCog,
  Palette,
  MicOff,
  Headphones,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  replyTo?: string;
  reactions?: { emoji: string; users: string[] }[];
  isSpecial?: boolean;
}

interface VoiceChannelUser {
  id: string;
  username: string;
  displayName: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
}

interface ServerChannel {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'voice';
  isPrivate: boolean;
  memberCount: number;
  isActive?: boolean;
  categoryId: string;
  permissions?: PermissionSettings;
  connectedUsers?: VoiceChannelUser[];
}

interface ServerRole {
  id: string;
  name: string;
  color: string;
  position: number;
  permissions: {
    administrator?: boolean;
    manageChannels?: boolean;
    manageRoles?: boolean;
    kickMembers?: boolean;
    banMembers?: boolean;
    sendMessages?: boolean;
    readMessages?: boolean;
    manageMessages?: boolean;
    connectVoice?: boolean;
    speakVoice?: boolean;
    mentionEveryone?: boolean;
  };
  memberCount: number;
}

interface ChannelPermission {
  roleId: string;
  allow: string[];
  deny: string[];
}

interface PermissionSettings {
  canRead?: boolean;
  canWrite?: boolean;
  adminOnly?: boolean;
  moderatorOnly?: boolean;
}

interface ServerCategory {
  id: string;
  name: string;
  position: number;
  isCollapsed?: boolean;
  permissions?: PermissionSettings;
}

interface GameServer {
  id: string;
  name: string;
  description: string;
  isOfficial: boolean;
  isOnline: boolean;
  memberCount: number;
  maxMembers: number;
  isVerified: boolean;
  tags: string[];
  channels: ServerChannel[];
  categories: ServerCategory[];
  roles: ServerRole[];
  owner?: string;
  lastActivity: string;
  isJoined?: boolean;
}

export default function Servers() {
  const { user } = useAuth();
  const [selectedServer, setSelectedServer] = useState<string | null>('lobbyx-official');
  const [selectedChannel, setSelectedChannel] = useState<string | null>('general');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinedServers, setJoinedServers] = useState<Set<string>>(new Set(['lobbyx-official']));
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userRoles, setUserRoles] = useState<Map<string, string[]>>(new Map([
    ['LobbyXAdmin', ['admin']],
    [user?.username || '', ['member']]
  ]));

  // Voice channel integration - in a real app this would come from a context
  const joinVoiceChannel = (channelId: string, channelName: string, serverName: string) => {
    // This would trigger the Layout component's voice channel state
    console.log('Joining voice channel:', channelName, 'in server:', serverName);
    // For demo purposes, we'll simulate the join
    window.dispatchEvent(new CustomEvent('joinVoiceChannel', {
      detail: { channelId, channelName, serverName }
    }));
  };

  // Mock server data with isJoined property
  const servers: GameServer[] = [
    {
      id: 'lobbyx-official',
      name: 'LobbyX Resmi Sunucu',
      description: 'LobbyX\'in resmi sunucusu. Duyurular ve genel sohbet.',
      isOfficial: true,
      isOnline: true,
      memberCount: 1247,
      maxMembers: 5000,
      isVerified: true,
      tags: ['Resmi', 'Genel', 'Duyuru'],
      lastActivity: '2 dk',
      isJoined: joinedServers.has('lobbyx-official'),
      roles: [
        {
          id: 'admin',
          name: 'Admin',
          color: '#ff6b35',
          position: 100,
          permissions: {
            administrator: true,
            manageChannels: true,
            manageRoles: true,
            kickMembers: true,
            banMembers: true,
            sendMessages: true,
            readMessages: true,
            manageMessages: true,
            connectVoice: true,
            speakVoice: true,
            mentionEveryone: true
          },
          memberCount: 3
        },
        {
          id: 'moderator',
          name: 'Moderatör',
          color: '#4ecdc4',
          position: 50,
          permissions: {
            administrator: false,
            manageChannels: false,
            manageRoles: false,
            kickMembers: true,
            banMembers: false,
            sendMessages: true,
            readMessages: true,
            manageMessages: true,
            connectVoice: true,
            speakVoice: true,
            mentionEveryone: false
          },
          memberCount: 8
        },
        {
          id: 'member',
          name: 'Üye',
          color: '#95a5a6',
          position: 1,
          permissions: {
            administrator: false,
            manageChannels: false,
            manageRoles: false,
            kickMembers: false,
            banMembers: false,
            sendMessages: true,
            readMessages: true,
            manageMessages: false,
            connectVoice: true,
            speakVoice: true,
            mentionEveryone: false
          },
          memberCount: 1236
        }
      ],
      categories: [
        {
          id: 'genel',
          name: 'GENEL',
          position: 0,
          permissions: [
            { roleId: 'member', allow: ['readMessages'], deny: [] }
          ]
        },
        {
          id: 'yonetim',
          name: 'YÖNETİM',
          position: 1,
          permissions: [
            { roleId: 'admin', allow: ['readMessages', 'sendMessages'], deny: [] },
            { roleId: 'member', allow: [], deny: ['readMessages'] }
          ]
        }
      ],
      channels: [
        {
          id: 'announcements',
          name: 'duyurular',
          description: 'Resmi duyurular',
          type: 'text',
          isPrivate: false,
          memberCount: 1247,
          categoryId: 'genel',
          permissions: [
            { roleId: 'admin', allow: ['readMessages', 'sendMessages'], deny: [] },
            { roleId: 'moderator', allow: ['readMessages'], deny: ['sendMessages'] },
            { roleId: 'member', allow: ['readMessages'], deny: ['sendMessages'] }
          ]
        },
        {
          id: 'general',
          name: 'sohbet',
          description: 'Genel konuşma kanalı',
          type: 'text',
          isPrivate: false,
          memberCount: 856,
          isActive: true,
          categoryId: 'genel',
          permissions: [
            { roleId: 'admin', allow: ['readMessages', 'sendMessages', 'manageMessages'], deny: [] },
            { roleId: 'moderator', allow: ['readMessages', 'sendMessages', 'manageMessages'], deny: [] },
            { roleId: 'member', allow: ['readMessages', 'sendMessages'], deny: [] }
          ]
        },
        {
          id: 'help',
          name: 'yardım',
          description: 'Yardım ve destek',
          type: 'text',
          isPrivate: false,
          memberCount: 234,
          categoryId: 'genel',
          permissions: [
            { roleId: 'admin', allow: ['readMessages', 'sendMessages', 'manageMessages'], deny: [] },
            { roleId: 'moderator', allow: ['readMessages', 'sendMessages', 'manageMessages'], deny: [] },
            { roleId: 'member', allow: ['readMessages', 'sendMessages'], deny: [] }
          ]
        },
        {
          id: 'voice-general',
          name: 'Genel Ses',
          description: 'Sesli sohbet',
          type: 'voice',
          isPrivate: false,
          memberCount: 12,
          categoryId: 'genel',
          permissions: [
            { roleId: 'admin', allow: ['connectVoice', 'speakVoice'], deny: [] },
            { roleId: 'moderator', allow: ['connectVoice', 'speakVoice'], deny: [] },
            { roleId: 'member', allow: ['connectVoice', 'speakVoice'], deny: [] }
          ],
          connectedUsers: [
            { id: 'user1', username: 'ProGamer123', displayName: 'ProGamer123', isMuted: false, isDeafened: false, isSpeaking: true },
            { id: 'user2', username: 'GameMaster', displayName: 'GameMaster', isMuted: true, isDeafened: false, isSpeaking: false },
            { id: 'user3', username: 'ValorantKing', displayName: 'Valorant King', isMuted: false, isDeafened: false, isSpeaking: false }
          ]
        },
        {
          id: 'admin-chat',
          name: 'admin-sohbeti',
          description: 'Admin iletişimi',
          type: 'text',
          isPrivate: true,
          memberCount: 3,
          categoryId: 'yonetim',
          permissions: [
            { roleId: 'admin', allow: ['readMessages', 'sendMessages'], deny: [] },
            { roleId: 'moderator', allow: [], deny: ['readMessages', 'sendMessages'] },
            { roleId: 'member', allow: [], deny: ['readMessages', 'sendMessages'] }
          ]
        }
      ]
    },
    {
      id: 'valorant-tr',
      name: 'Valorant Türkiye',
      description: 'Türk Valorant oyuncuları için topluluk sunucusu.',
      isOfficial: false,
      isOnline: true,
      memberCount: 2843,
      maxMembers: 10000,
      isVerified: true,
      tags: ['Valorant', 'Türkiye', 'Rekabetçi'],
      lastActivity: '1 dk',
      isJoined: joinedServers.has('valorant-tr'),
      categories: [
        { id: 'genel', name: 'GENEL', position: 0 },
        { id: 'oyun', name: 'OYUN', position: 1 },
        { id: 'moderasyon', name: 'MODERASYON', position: 2, permissions: { moderatorOnly: true } }
      ],
      channels: [
        { id: 'val-duyuru', name: 'duyurular', description: 'Sunucu duyuruları', type: 'text', isPrivate: false, memberCount: 2843, categoryId: 'genel', permissions: { canRead: true, canWrite: false, adminOnly: true } },
        { id: 'val-general', name: 'sohbet', description: 'Genel sohbet', type: 'text', isPrivate: false, memberCount: 2843, isActive: true, categoryId: 'genel', permissions: { canRead: true, canWrite: true } },
        { id: 'val-lfg', name: 'takım-arama', description: 'Takım arkadaşı bulma', type: 'text', isPrivate: false, memberCount: 892, categoryId: 'oyun', permissions: { canRead: true, canWrite: true } },
        { id: 'val-ranked', name: 'ranked-sohbet', description: 'Ranked oyun tartışmaları', type: 'text', isPrivate: false, memberCount: 567, categoryId: 'oyun', permissions: { canRead: true, canWrite: true } },
        {
          id: 'val-voice',
          name: 'Oyun Sohbeti',
          description: 'Sesli oyun',
          type: 'voice',
          isPrivate: false,
          memberCount: 23,
          categoryId: 'oyun',
          permissions: [
            { roleId: 'admin', allow: ['connectVoice', 'speakVoice'], deny: [] },
            { roleId: 'moderator', allow: ['connectVoice', 'speakVoice'], deny: [] },
            { roleId: 'member', allow: ['connectVoice', 'speakVoice'], deny: [] }
          ],
          connectedUsers: [
            { id: 'user4', username: 'AcePlayer', displayName: 'Ace Player', isMuted: false, isDeafened: false, isSpeaking: false },
            { id: 'user5', username: 'ValorantPro', displayName: 'Valorant Pro', isMuted: false, isDeafened: true, isSpeaking: false }
          ]
        },
        { id: 'val-mod', name: 'moderatör-sohbeti', description: 'Moderatör iletişimi', type: 'text', isPrivate: true, memberCount: 5, categoryId: 'moderasyon', permissions: { canRead: false, canWrite: false, adminOnly: true } }
      ]
    },
    {
      id: 'cs2-pro',
      name: 'CS2 Pro League',
      description: 'Counter-Strike 2 profesyonel turnuva sunucusu.',
      isOfficial: false,
      isOnline: true,
      memberCount: 1567,
      maxMembers: 3000,
      isVerified: true,
      tags: ['CS2', 'Profesyonel', 'Turnuva'],
      lastActivity: '5 dk',
      isJoined: joinedServers.has('cs2-pro'),
      categories: [
        { id: 'genel', name: 'GENEL', position: 0 },
        { id: 'turnuva', name: 'TURNUVA', position: 1 }
      ],
      channels: [
        { id: 'cs2-announcements', name: 'turnuva-duyuruları', description: 'Turnuva duyuruları', type: 'text', isPrivate: false, memberCount: 1567, categoryId: 'turnuva', permissions: { canRead: true, canWrite: false, adminOnly: true } },
        { id: 'cs2-general', name: 'genel-sohbet', description: 'CS2 genel sohbet', type: 'text', isPrivate: false, memberCount: 1234, isActive: true, categoryId: 'genel', permissions: { canRead: true, canWrite: true } },
        { id: 'cs2-strategy', name: 'strateji', description: 'Oyun stratejileri', type: 'text', isPrivate: false, memberCount: 456, categoryId: 'turnuva', permissions: { canRead: true, canWrite: true } },
        { id: 'cs2-voice', name: 'Takım Ses', description: 'Takım koordinasyonu', type: 'voice', isPrivate: false, memberCount: 8, categoryId: 'turnuva', permissions: { canRead: true, canWrite: true } }
      ]
    },
    {
      id: 'indie-games',
      name: 'İndie Oyunlar Topluluğu',
      description: 'Indie oyun sevenler için ��zel topluluk.',
      isOfficial: false,
      isOnline: true,
      memberCount: 445,
      maxMembers: 1000,
      isVerified: false,
      tags: ['Indie', 'Topluluk', 'Keşif'],
      lastActivity: '15 dk',
      isJoined: joinedServers.has('indie-games'),
      categories: [
        { id: 'genel', name: 'GENEL', position: 0 },
        { id: 'oyunlar', name: 'OYUNLAR', position: 1 }
      ],
      channels: [
        { id: 'indie-sohbet', name: 'sohbet', description: 'Genel indie sohbet', type: 'text', isPrivate: false, memberCount: 445, categoryId: 'genel', permissions: { canRead: true, canWrite: true } },
        { id: 'indie-discovery', name: 'oyun-keşfi', description: 'Yeni indie oyunlar', type: 'text', isPrivate: false, memberCount: 445, isActive: true, categoryId: 'oyunlar', permissions: { canRead: true, canWrite: true } },
        { id: 'indie-reviews', name: 'incelemeler', description: 'Oyun incelemeleri', type: 'text', isPrivate: false, memberCount: 234, categoryId: 'oyunlar', permissions: { canRead: true, canWrite: true } },
        { id: 'indie-voice', name: 'Sohbet Ses', description: 'Sesli indie sohbet', type: 'voice', isPrivate: false, memberCount: 3, categoryId: 'genel', permissions: { canRead: true, canWrite: true } }
      ]
    }
  ];

  // Mock messages for selected channel
  const messages: Message[] = [
    {
      id: '1',
      senderId: 'lobbyx-admin',
      senderName: 'LobbyXAdmin',
      content: 'LobbyX Resmi Sunucusuna hoş geldiniz! Bu sunucuda tüm duyurular ve güncellemeler paylaşılacak.',
      timestamp: '14:30',
      type: 'text',
      isSpecial: true
    },
    {
      id: '2',
      senderId: 'lobbyx-admin',
      senderName: 'LobbyXAdmin',
      content: 'Lütfen sunucu kurallarına uyarak nezaket çerçevesinde iletişim kurunuz.',
      timestamp: '14:32',
      type: 'text',
      isSpecial: true
    }
  ];

  const selectedServerData = servers.find(server => server.id === selectedServer);
  const selectedChannelData = selectedServerData?.channels.find(channel => channel.id === selectedChannel);

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // In real app, this would send to Firebase
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleJoinServer = (serverId: string) => {
    setJoinedServers(prev => new Set([...prev, serverId]));
    console.log('Joined server:', serverId);
    // In real app, this would send request to Firebase
  };

  const handleLeaveServer = (serverId: string) => {
    if (serverId === 'lobbyx-official') {
      alert('LobbyX Resmi Sunucusundan ayrılamazsınız!');
      return;
    }
    setJoinedServers(prev => {
      const newSet = new Set(prev);
      newSet.delete(serverId);
      return newSet;
    });
    if (selectedServer === serverId) {
      setSelectedServer('lobbyx-official');
      setSelectedChannel('general');
    }
    console.log('Left server:', serverId);
    // In real app, this would update Firebase
  };

  const handleCreateServer = (serverData: any) => {
    console.log('Creating server:', serverData);
    // In real app, this would create server in Firebase
    setShowCreateModal(false);
  };

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const hasPermission = (channelOrCategory: ServerChannel | ServerCategory, permission: string): boolean => {
    const currentUserRoles = userRoles.get(user?.username || '') || ['member'];

    if (!channelOrCategory.permissions) return true;

    // Handle array format (ChannelPermission[])
    if (Array.isArray(channelOrCategory.permissions)) {
      // Check each role the user has
      for (const userRole of currentUserRoles) {
        const rolePermission = channelOrCategory.permissions.find(p => p.roleId === userRole);
        if (rolePermission) {
          if (rolePermission.deny.includes(permission)) return false;
          if (rolePermission.allow.includes(permission)) return true;
        }
      }
    } else {
      // Handle object format (legacy format with boolean properties)
      const perms = channelOrCategory.permissions as any;

      // Check specific permission mappings
      if (permission === 'readMessages' && perms.canRead !== undefined) {
        return perms.canRead;
      }
      if (permission === 'sendMessages' && perms.canWrite !== undefined) {
        return perms.canWrite;
      }
      if (perms.adminOnly && !currentUserRoles.includes('admin')) {
        return false;
      }
      if (perms.moderatorOnly && !currentUserRoles.includes('admin') && !currentUserRoles.includes('moderator')) {
        return false;
      }
    }

    // Default behavior based on role hierarchy
    if (currentUserRoles.includes('admin')) return true;
    if (permission === 'readMessages') return true;

    return false;
  };

  const canWriteToChannel = (channel: ServerChannel): boolean => {
    const currentUserRoles = userRoles.get(user?.username || '') || ['member'];

    if (!channel.permissions) return true;

    // Handle array format (ChannelPermission[])
    if (Array.isArray(channel.permissions)) {
      for (const userRole of currentUserRoles) {
        const rolePermission = channel.permissions.find(p => p.roleId === userRole);
        if (rolePermission) {
          if (rolePermission.deny.includes('sendMessages')) return false;
          if (rolePermission.allow.includes('sendMessages')) return true;
        }
      }
    } else {
      // Handle object format (legacy format with boolean properties)
      const perms = channel.permissions as any;

      if (perms.canWrite !== undefined) {
        return perms.canWrite;
      }
      if (perms.adminOnly && !currentUserRoles.includes('admin')) {
        return false;
      }
    }

    return currentUserRoles.includes('admin');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gaming-bg rounded-2xl overflow-hidden">
      {/* Server List Sidebar */}
      <div className="w-80 bg-gaming-surface/50 backdrop-blur-xl border-r border-gaming-border flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gaming-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gaming-text">Sunucular</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg bg-neon-purple/20 hover:bg-neon-purple/30 transition-colors"
              title="Sunucu Oluştur"
            >
              <Plus className="w-4 h-4 text-neon-purple" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-muted" />
            <input
              type="text"
              placeholder="Sunucu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gaming-surface rounded-lg border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
            />
          </div>
        </div>

        {/* Server List */}
        <div className="flex-1 overflow-y-auto">
          {filteredServers.map((server) => (
            <div
              key={server.id}
              onClick={() => {
                setSelectedServer(server.id);
                setSelectedChannel(server.channels[0]?.id || null);
              }}
              className={`p-4 border-b border-gaming-border/50 cursor-pointer transition-all duration-200 ${
                selectedServer === server.id 
                  ? 'bg-neon-purple/10 border-l-4 border-l-neon-purple' 
                  : 'hover:bg-gaming-surface/30'
              } ${server.isOfficial ? 'bg-gradient-to-r from-neon-cyan/5 to-transparent' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    server.isOfficial 
                      ? 'bg-gradient-to-br from-neon-cyan to-neon-blue' 
                      : 'bg-gradient-to-br from-neon-purple to-neon-cyan'
                  }`}>
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  {server.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium truncate ${
                        server.isOfficial ? 'text-neon-cyan' : 'text-gaming-text'
                      }`}>
                        {server.name}
                      </h3>
                      {server.isVerified && (
                        <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {server.isOfficial && (
                        <Crown className="w-4 h-4 text-neon-orange" />
                      )}
                      {server.isJoined && (
                        <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gaming-muted">{server.lastActivity}</span>
                  </div>

                  <p className="text-sm text-gaming-muted truncate mb-2">
                    {server.description}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-gaming-muted" />
                      <span className="text-xs text-gaming-muted">
                        {server.memberCount.toLocaleString()}/{server.maxMembers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {server.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gaming-surface rounded text-gaming-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Join/Leave Button */}
                  <div className="flex justify-end">
                    {server.isJoined ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveServer(server.id);
                        }}
                        className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 transition-colors"
                        disabled={server.isOfficial}
                      >
                        <UserMinus className="w-3 h-3 inline mr-1" />
                        {server.isOfficial ? 'Resmi' : 'Ayrıl'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinServer(server.id);
                        }}
                        className="px-3 py-1 text-xs bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded text-neon-green transition-colors"
                      >
                        <UserPlus className="w-3 h-3 inline mr-1" />
                        Katıl
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel List */}
      {selectedServerData && (
        <div className="w-64 bg-gaming-surface/30 backdrop-blur-xl border-r border-gaming-border flex flex-col">
          {/* Server Header */}
          <div className="p-4 border-b border-gaming-border">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold truncate ${
                selectedServerData.isOfficial ? 'text-neon-cyan' : 'text-gaming-text'
              }`}>
                {selectedServerData.name}
              </h3>
              {selectedServerData.isVerified && (
                <Check className="w-4 h-4 text-neon-cyan" />
              )}
            </div>

            {/* Role Management Button */}
            {userRoles.get(user?.username || '')?.includes('admin') && (
              <button
                onClick={() => setShowRoleModal(true)}
                className="p-1 rounded hover:bg-gaming-surface/50 transition-colors"
                title="Rol Yönetimi"
              >
                <UserCog className="w-4 h-4 text-gaming-muted hover:text-neon-purple" />
              </button>
            )}
          </div>
          <p className="text-sm text-gaming-muted mt-1">
            {selectedServerData.memberCount.toLocaleString()} üye
          </p>
          </div>

          {/* Channel List with Categories */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {selectedServerData.categories
                .sort((a, b) => a.position - b.position)
                .map((category) => {
                  const categoryChannels = selectedServerData.channels.filter(
                    channel => channel.categoryId === category.id && hasPermission(channel, 'readMessages')
                  );
                  const isCollapsed = collapsedCategories.has(category.id);
                  const canViewCategory = hasPermission(category, 'readMessages');

                  if (!canViewCategory) return null;

                  return (
                    <div key={category.id} className="mb-4">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gaming-surface/30 rounded transition-colors group"
                      >
                        <div className="flex items-center space-x-2">
                          {isCollapsed ? (
                            <ChevronRight className="w-3 h-3 text-gaming-muted" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-gaming-muted" />
                          )}
                          <span className="text-xs font-bold text-gaming-muted uppercase tracking-wider">
                            {category.name}
                          </span>
                          {category.permissions?.adminOnly && (
                            <Shield className="w-3 h-3 text-neon-orange" />
                          )}
                        </div>
                        {!isCollapsed && (
                          <Plus className="w-3 h-3 text-gaming-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>

                      {/* Category Channels */}
                      {!isCollapsed && (
                        <div className="ml-2 space-y-1">
                          {categoryChannels.map((channel) => {
                            const canViewChannel = hasPermission(channel, 'readMessages');
                            const canWriteChannel = canWriteToChannel(channel);

                            if (!canViewChannel) return null;

                            return (
                              <div key={channel.id} className="space-y-1">
                                <button
                                  onClick={() => {
                                    if (channel.type === 'voice') {
                                      joinVoiceChannel(channel.id, channel.name, selectedServerData.name);
                                    } else {
                                      setSelectedChannel(channel.id);
                                    }
                                  }}
                                  className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${
                                    selectedChannel === channel.id
                                      ? 'bg-neon-purple/20 text-neon-purple'
                                      : 'hover:bg-gaming-surface/50 text-gaming-muted hover:text-gaming-text'
                                  } ${channel.type === 'voice' ? 'hover:bg-neon-green/10' : ''}`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {channel.type === 'voice' ? (
                                      <Volume2 className="w-4 h-4" />
                                    ) : channel.isPrivate ? (
                                      <Lock className="w-4 h-4" />
                                    ) : (
                                      <Hash className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium truncate">
                                      {channel.name}
                                    </span>
                                    {!canWriteChannel && (
                                      <EyeOff className="w-3 h-3 text-gaming-muted" />
                                    )}
                                    {channel.isPrivate && (
                                      <Lock className="w-3 h-3 text-neon-orange" />
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs truncate text-gaming-muted">
                                      {channel.description}
                                    </p>
                                    <span className="text-xs text-gaming-muted">
                                      {channel.type === 'voice' ? (
                                        <span className="flex items-center space-x-1">
                                          <Users className="w-3 h-3" />
                                          <span>{channel.connectedUsers?.length || 0}</span>
                                        </span>
                                      ) : (
                                        channel.memberCount
                                      )}
                                    </span>
                                  </div>
                                </button>

                                {/* Connected Users for Voice Channels */}
                                {channel.type === 'voice' && channel.connectedUsers && channel.connectedUsers.length > 0 && (
                                  <div className="ml-6 space-y-1">
                                    {channel.connectedUsers.map((connectedUser) => (
                                      <div
                                        key={connectedUser.id}
                                        className="flex items-center space-x-2 p-1 rounded hover:bg-gaming-surface/30 transition-colors"
                                      >
                                        <div className="relative">
                                          <div className="w-4 h-4 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                                            <User className="w-2 h-2 text-white" />
                                          </div>
                                          {connectedUser.isSpeaking && (
                                            <div className="absolute -inset-1 rounded-full border-2 border-neon-green animate-pulse"></div>
                                          )}
                                        </div>

                                        <span className="text-xs text-gaming-text flex-1 truncate">
                                          {connectedUser.displayName}
                                        </span>

                                        <div className="flex items-center space-x-1">
                                          {connectedUser.isMuted && (
                                            <MicOff className="w-3 h-3 text-red-400" />
                                          )}
                                          {connectedUser.isDeafened && (
                                            <Headphones className="w-3 h-3 text-red-400" />
                                          )}
                                          {!connectedUser.isMuted && !connectedUser.isDeafened && (
                                            <Mic className="w-3 h-3 text-neon-green" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedServerData && selectedChannelData ? (
          <>
            {/* Channel Header */}
            <div className="p-4 bg-gaming-surface/30 backdrop-blur-xl border-b border-gaming-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {selectedChannelData.type === 'voice' ? (
                      <Mic className="w-5 h-5 text-gaming-muted" />
                    ) : selectedChannelData.isPrivate ? (
                      <Lock className="w-5 h-5 text-gaming-muted" />
                    ) : (
                      <Globe className="w-5 h-5 text-gaming-muted" />
                    )}
                    <h2 className="font-semibold text-gaming-text">
                      {selectedChannelData.name}
                    </h2>
                  </div>
                  <div className="text-sm text-gaming-muted">
                    {selectedChannelData.description}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gaming-muted">
                    <Users className="w-4 h-4" />
                    <span>{selectedChannelData.memberCount}</span>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <MoreVertical className="w-5 h-5 text-gaming-muted" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.senderId === user?.uid ? 'order-2' : 'order-1'
                  }`}>
                    {message.senderId !== user?.uid && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-medium ${
                          message.isSpecial ? 'text-neon-cyan' : 'text-gaming-text'
                        }`}>
                          {message.senderName}
                        </span>
                        {message.isSpecial && (
                          <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.senderId === user?.uid
                          ? 'bg-neon-purple text-white ml-4'
                          : message.isSpecial
                          ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/30 text-gaming-text'
                          : 'bg-gaming-surface text-gaming-text mr-4'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.uid 
                          ? 'text-white/70' 
                          : 'text-gaming-muted'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gaming-surface/30 backdrop-blur-xl border-t border-gaming-border">
              {!canWriteToChannel(selectedChannelData) ? (
                <div className="text-center p-4 text-gaming-muted">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
                  <p>Bu kanala mesaj gönderme izniniz yok.</p>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <Paperclip className="w-5 h-5 text-gaming-muted" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <Image className="w-5 h-5 text-gaming-muted" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={`#${selectedChannelData.name} kanalına mesaj gönder...`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-2 bg-gaming-surface rounded-xl border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                    />
                  </div>
                  
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <Smile className="w-5 h-5 text-gaming-muted" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <Mic className="w-5 h-5 text-gaming-muted" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="p-2 rounded-lg bg-neon-purple text-white hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Server className="w-16 h-16 text-gaming-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gaming-text mb-2">Sunucu Seç</h3>
              <p className="text-gaming-muted">Mesajlaşmaya başlamak için bir sunucu ve kanal seçin</p>
            </div>
          </div>
        )}
      </div>

      {/* Role Management Modal */}
      {showRoleModal && selectedServerData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl border border-gaming-border rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gaming-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCog className="w-6 h-6 text-neon-purple" />
                  <h2 className="text-xl font-bold text-gaming-text">Rol Yönetimi</h2>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-2 rounded-lg hover:bg-gaming-surface transition-colors"
                >
                  <X className="w-5 h-5 text-gaming-muted" />
                </button>
              </div>
              <p className="text-gaming-muted mt-2">{selectedServerData.name} sunucusu için roller ve izinler</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Roles List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gaming-text">Sunucu Rolleri</h3>
                  <button className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/30 rounded-lg text-neon-purple transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Yeni Rol
                  </button>
                </div>

                {selectedServerData.roles
                  .sort((a, b) => b.position - a.position)
                  .map((role) => (
                    <div key={role.id} className="p-4 bg-gaming-surface/50 rounded-xl border border-gaming-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: role.color }}
                          ></div>
                          <div>
                            <h4 className="font-semibold text-gaming-text">{role.name}</h4>
                            <p className="text-sm text-gaming-muted">{role.memberCount} üye</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                            <Palette className="w-4 h-4 text-gaming-muted" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                            <Settings className="w-4 h-4 text-gaming-muted" />
                          </button>
                        </div>
                      </div>

                      {/* Role Permissions */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(role.permissions).map(([permission, hasPermission]) => {
                          const permissionLabels: Record<string, string> = {
                            administrator: 'Yönetici',
                            manageChannels: 'Kanal Yönetimi',
                            manageRoles: 'Rol Yönetimi',
                            kickMembers: 'Üye Atma',
                            banMembers: 'Üye Yasaklama',
                            sendMessages: 'Mesaj Gönderme',
                            readMessages: 'Mesaj Okuma',
                            manageMessages: 'Mesaj Yönetimi',
                            connectVoice: 'Ses Kanalına Katılma',
                            speakVoice: 'Konuşma',
                            mentionEveryone: 'Herkesi Etiketleme'
                          };

                          return (
                            <div
                              key={permission}
                              className={`flex items-center space-x-2 p-2 rounded-lg ${
                                hasPermission
                                  ? 'bg-neon-green/10 border border-neon-green/20'
                                  : 'bg-red-500/10 border border-red-500/20'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                hasPermission ? 'bg-neon-green' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs ${
                                hasPermission ? 'text-neon-green' : 'text-red-400'
                              }`}>
                                {permissionLabels[permission] || permission}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Channel Permissions Overview */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gaming-text mb-4">Kanal İzinleri</h3>
                <div className="space-y-3">
                  {selectedServerData.channels.map((channel) => (
                    <div key={channel.id} className="p-3 bg-gaming-surface/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {channel.type === 'voice' ? (
                            <Volume2 className="w-4 h-4 text-gaming-muted" />
                          ) : (
                            <Hash className="w-4 h-4 text-gaming-muted" />
                          )}
                          <span className="font-medium text-gaming-text">{channel.name}</span>
                          {channel.isPrivate && (
                            <Lock className="w-3 h-3 text-neon-orange" />
                          )}
                        </div>
                        <button className="text-xs px-3 py-1 bg-gaming-surface hover:bg-gaming-surface/80 rounded text-gaming-muted transition-colors">
                          İzinleri Düzenle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
