import React, { useState } from 'react';
import {
  MessageSquare,
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
  UserPlus,
  Star,
  Archive,
  Mute,
  Settings
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
  isDelivered: boolean;
  isRead: boolean;
}

interface FriendChat {
  id: string;
  name: string;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isVerified?: boolean;
  isFavorite?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
  gameStatus?: {
    game: string;
    status: string;
  };
}

export default function Chat() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>('progamer123');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'favorites'>('all');

  // Mock friend chat data
  const friendChats: FriendChat[] = [
    {
      id: 'progamer123',
      name: 'ProGamer123',
      username: 'progamer123',
      isOnline: true,
      lastMessage: 'Valorant oynayalım mı?',
      lastMessageTime: '15 dk',
      unreadCount: 2,
      isVerified: true,
      isFavorite: true,
      gameStatus: {
        game: 'Valorant',
        status: 'Ranked maçta'
      }
    },
    {
      id: 'gamemaster',
      name: 'GameMaster',
      username: 'gamemaster',
      isOnline: false,
      lastSeen: '1 saat önce',
      lastMessage: 'Bu akşam CS2 turnuvası var',
      lastMessageTime: '1 saat',
      unreadCount: 0,
      isVerified: false,
      gameStatus: {
        game: 'Counter-Strike 2',
        status: 'Çevrimdışı'
      }
    },
    {
      id: 'valorantking',
      name: 'Valorant King',
      username: 'valorantking',
      isOnline: true,
      lastMessage: 'Gg wp!',
      lastMessageTime: '2 saat',
      unreadCount: 0,
      isVerified: false,
      isFavorite: false,
      gameStatus: {
        game: 'Valorant',
        status: 'Menüde'
      }
    },
    {
      id: 'cs2ninja',
      name: 'CS2 Ninja',
      username: 'cs2ninja',
      isOnline: true,
      lastMessage: 'Takım kuruyoruz, gel',
      lastMessageTime: '30 dk',
      unreadCount: 1,
      isVerified: false,
      gameStatus: {
        game: 'Counter-Strike 2',
        status: 'Lobby\'de'
      }
    },
    {
      id: 'indielover',
      name: 'Indie Lover',
      username: 'indielover',
      isOnline: false,
      lastSeen: '3 saat önce',
      lastMessage: 'O oyunu da bitirdim!',
      lastMessageTime: '1 gün',
      unreadCount: 0,
      isVerified: false,
      isFavorite: true
    },
    {
      id: 'casualgamer',
      name: 'Casual Gamer',
      username: 'casualgamer',
      isOnline: false,
      lastSeen: '1 gün önce',
      lastMessage: 'Yarın online olurum',
      lastMessageTime: '2 gün',
      unreadCount: 0,
      isVerified: false,
      isMuted: true
    }
  ];

  // Mock messages for selected chat
  const messages: Message[] = [
    {
      id: '1',
      senderId: 'progamer123',
      senderName: 'ProGamer123',
      content: 'Selam! Bugün Valorant oynayacak mısın?',
      timestamp: '19:45',
      type: 'text',
      isDelivered: true,
      isRead: true
    },
    {
      id: '2',
      senderId: user?.uid || '',
      senderName: user?.displayName || user?.username || 'Sen',
      content: 'Evet, akşam müsaitim. Hangi saatte?',
      timestamp: '19:47',
      type: 'text',
      isDelivered: true,
      isRead: true
    },
    {
      id: '3',
      senderId: 'progamer123',
      senderName: 'ProGamer123',
      content: '20:00 gibi nasıl? Ranked oynayalım.',
      timestamp: '19:48',
      type: 'text',
      isDelivered: true,
      isRead: false
    },
    {
      id: '4',
      senderId: 'progamer123',
      senderName: 'ProGamer123',
      content: 'Valorant oynayalım mı?',
      timestamp: '20:15',
      type: 'text',
      isDelivered: true,
      isRead: false
    }
  ];

  const selectedChatData = friendChats.find(chat => chat.id === selectedChat);

  const filteredChats = friendChats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'online') return matchesSearch && chat.isOnline;
    if (activeTab === 'favorites') return matchesSearch && chat.isFavorite;
    return matchesSearch;
  });

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

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gaming-bg rounded-2xl overflow-hidden">
      {/* Friends Chat List Sidebar */}
      <div className="w-80 bg-gaming-surface/50 backdrop-blur-xl border-r border-gaming-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gaming-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gaming-text">Sohbet</h2>
            <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
              <UserPlus className="w-4 h-4 text-gaming-muted" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-4">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'online', label: 'Çevrimiçi' },
              { id: 'favorites', label: 'Favoriler' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neon-purple text-white'
                    : 'text-gaming-muted hover:text-gaming-text hover:bg-gaming-surface/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-muted" />
            <input
              type="text"
              placeholder="Arkadaş ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gaming-surface rounded-lg border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gaming-border/50 cursor-pointer transition-all duration-200 ${
                selectedChat === chat.id 
                  ? 'bg-neon-purple/10 border-l-4 border-l-neon-purple' 
                  : 'hover:bg-gaming-surface/30'
              } ${chat.isSpecial ? 'bg-gradient-to-r from-neon-cyan/5 to-transparent' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    chat.isSpecial 
                      ? 'bg-gradient-to-br from-neon-cyan to-neon-blue' 
                      : 'bg-gradient-to-br from-neon-purple to-neon-cyan'
                  }`}>
                    {chat.type === 'group' ? (
                      <Users className="w-6 h-6 text-white" />
                    ) : (
                      <MessageSquare className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium truncate ${
                        chat.isSpecial ? 'text-neon-cyan' : 'text-gaming-text'
                      }`}>
                        {chat.name}
                      </h3>
                      {chat.isVerified && (
                        <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gaming-muted">{chat.lastMessageTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gaming-muted truncate flex-1">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-neon-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {chat.type === 'group' && chat.members && (
                    <p className="text-xs text-gaming-muted mt-1">
                      {chat.members.toLocaleString()} üye
                    </p>
                  )}
                  
                  {chat.type === 'individual' && !chat.isOnline && chat.lastSeen && (
                    <p className="text-xs text-gaming-muted mt-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Son görülme: {chat.lastSeen}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gaming-surface/30 backdrop-blur-xl border-b border-gaming-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedChatData.isSpecial 
                      ? 'bg-gradient-to-br from-neon-cyan to-neon-blue' 
                      : 'bg-gradient-to-br from-neon-purple to-neon-cyan'
                  }`}>
                    {selectedChatData.type === 'group' ? (
                      <Users className="w-5 h-5 text-white" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className={`font-semibold ${
                        selectedChatData.isSpecial ? 'text-neon-cyan' : 'text-gaming-text'
                      }`}>
                        {selectedChatData.name}
                      </h2>
                      {selectedChatData.isVerified && (
                        <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {selectedChatData.isSpecial && (
                        <Shield className="w-4 h-4 text-neon-cyan" />
                      )}
                    </div>
                    <p className="text-sm text-gaming-muted">
                      {selectedChatData.type === 'group' ? (
                        `${selectedChatData.members?.toLocaleString()} üye`
                      ) : selectedChatData.isOnline ? (
                        'Çevrimiçi'
                      ) : (
                        `Son gör��lme: ${selectedChatData.lastSeen}`
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <Phone className="w-5 h-5 text-gaming-muted" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <Video className="w-5 h-5 text-gaming-muted" />
                  </button>
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
              {selectedChatData.isSpecial && selectedChatData.id === 'lobbyx-official' && user?.username !== 'LobbyXAdmin' ? (
                <div className="text-center p-4 text-gaming-muted">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
                  <p>Bu sunucuda sadece yöneticiler mesaj gönderebilir.</p>
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
                      placeholder="Mesajınızı yazın..."
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
              <MessageSquare className="w-16 h-16 text-gaming-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gaming-text mb-2">Sohbet Seç</h3>
              <p className="text-gaming-muted">Mesajlaşmaya başlamak için bir sohbet seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
