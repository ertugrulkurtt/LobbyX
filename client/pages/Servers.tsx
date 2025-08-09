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
  Upload
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

interface ServerChannel {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'voice';
  isPrivate: boolean;
  memberCount: number;
  isActive?: boolean;
  categoryId: string;
  permissions?: {
    canRead: boolean;
    canWrite: boolean;
    adminOnly?: boolean;
  };
}

interface ServerCategory {
  id: string;
  name: string;
  position: number;
  isCollapsed?: boolean;
  permissions?: {
    adminOnly?: boolean;
    moderatorOnly?: boolean;
  };
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
      channels: [
        { id: 'announcements', name: 'duyurular', description: 'Resmi duyurular', type: 'text', isPrivate: false, memberCount: 1247 },
        { id: 'general', name: 'genel-sohbet', description: 'Genel konuşma kanalı', type: 'text', isPrivate: false, memberCount: 856, isActive: true },
        { id: 'help', name: 'yardım', description: 'Yardım ve destek', type: 'text', isPrivate: false, memberCount: 234 },
        { id: 'voice-general', name: 'Genel Ses', description: 'Sesli sohbet', type: 'voice', isPrivate: false, memberCount: 12 }
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
      channels: [
        { id: 'val-general', name: 'genel', description: 'Genel Valorant sohbeti', type: 'text', isPrivate: false, memberCount: 2843, isActive: true },
        { id: 'val-lfg', name: 'takım-arama', description: 'Takım arkadaşı bulma', type: 'text', isPrivate: false, memberCount: 892 },
        { id: 'val-ranked', name: 'ranked-sohbet', description: 'Ranked oyun tartışmaları', type: 'text', isPrivate: false, memberCount: 567 },
        { id: 'val-voice', name: 'Oyun Ses', description: 'Oyun sırasında ses', type: 'voice', isPrivate: false, memberCount: 23 }
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
      channels: [
        { id: 'cs2-announcements', name: 'turnuva-duyuruları', description: 'Turnuva duyuruları', type: 'text', isPrivate: false, memberCount: 1567 },
        { id: 'cs2-general', name: 'genel-sohbet', description: 'CS2 genel sohbet', type: 'text', isPrivate: false, memberCount: 1234, isActive: true },
        { id: 'cs2-strategy', name: 'strateji', description: 'Oyun stratejileri', type: 'text', isPrivate: false, memberCount: 456 },
        { id: 'cs2-voice', name: 'Takım Ses', description: 'Takım koordinasyonu', type: 'voice', isPrivate: false, memberCount: 8 }
      ]
    },
    {
      id: 'indie-games',
      name: 'İndie Oyunlar Topluluğu',
      description: 'Indie oyun sevenler için özel topluluk.',
      isOfficial: false,
      isOnline: true,
      memberCount: 445,
      maxMembers: 1000,
      isVerified: false,
      tags: ['Indie', 'Topluluk', 'Keşif'],
      lastActivity: '15 dk',
      isJoined: joinedServers.has('indie-games'),
      channels: [
        { id: 'indie-discovery', name: 'oyun-keşfi', description: 'Yeni indie oyunlar', type: 'text', isPrivate: false, memberCount: 445, isActive: true },
        { id: 'indie-reviews', name: 'incelemeler', description: 'Oyun incelemeleri', type: 'text', isPrivate: false, memberCount: 234 },
        { id: 'indie-voice', name: 'Sohbet Ses', description: 'Sesli indie sohbet', type: 'voice', isPrivate: false, memberCount: 3 }
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
            <p className="text-sm text-gaming-muted mt-1">
              {selectedServerData.memberCount.toLocaleString()} üye
            </p>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {selectedServerData.channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${
                    selectedChannel === channel.id
                      ? 'bg-neon-purple/20 text-neon-purple'
                      : 'hover:bg-gaming-surface/50 text-gaming-muted hover:text-gaming-text'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {channel.type === 'voice' ? (
                      <Mic className="w-4 h-4" />
                    ) : channel.isPrivate ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {channel.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs truncate">
                      {channel.description}
                    </p>
                    <span className="text-xs text-gaming-muted">
                      {channel.memberCount}
                    </span>
                  </div>
                </button>
              ))}
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
              {selectedServerData.isOfficial && selectedChannelData.id === 'announcements' && user?.username !== 'LobbyXAdmin' ? (
                <div className="text-center p-4 text-gaming-muted">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
                  <p>Bu kanalda sadece yöneticiler mesaj gönderebilir.</p>
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
    </div>
  );
}
