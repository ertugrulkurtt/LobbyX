import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Send,
  Check,
  X,
  MessageSquare,
  MoreVertical,
  Shield,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  isOnline: boolean;
  lastSeen?: string;
  avatar?: string;
  status?: string;
  game?: string;
  isVerified?: boolean;
  isSpecial?: boolean;
}

interface FriendRequest {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  type: 'incoming' | 'outgoing';
  sentAt: string;
  isSpecial?: boolean;
}

export default function Friends() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending' | 'add'>('online');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFriendUsername, setNewFriendUsername] = useState('');

  // Mock friends data - including current user for testing avatar display
  const friends: Friend[] = [
    // Add current user as a friend for testing avatar display
    ...(user ? [{
      id: user.uid,
      username: user.username || 'CurrentUser',
      displayName: user.displayName || 'Kullanıcı',
      isOnline: true,
      status: user.status || 'Online',
      avatar: user.photoURL,
      isVerified: false,
      isSpecial: false
    }] : []),
    {
      id: 'lobbyx-admin',
      username: 'LobbyXAdmin',
      displayName: 'LobbyX Admin',
      isOnline: true,
      status: 'Yönetici - Her zaman burada',
      game: 'LobbyX Yönetimi',
      isVerified: true,
      isSpecial: true
    },
    {
      id: 'progamer123',
      username: 'ProGamer123',
      displayName: 'Pro Gamer',
      isOnline: true,
      status: 'Ranked climbing 💪',
      game: 'Valorant'
    },
    {
      id: 'gamemaster',
      username: 'GameMaster',
      displayName: 'Game Master',
      isOnline: false,
      lastSeen: '2 saat önce',
      status: 'Tournament organizating',
      game: 'CS2'
    },
    {
      id: 'speedrunner',
      username: 'SpeedRunner',
      displayName: 'Speed Runner',
      isOnline: true,
      status: 'WR attempt...',
      game: 'Celeste'
    },
    {
      id: 'strategist',
      username: 'Strategist',
      displayName: 'Master Strategist',
      isOnline: false,
      lastSeen: '1 gün önce',
      status: 'Planning next move',
      game: 'Chess.com'
    }
  ];

  // Mock friend requests
  const friendRequests: FriendRequest[] = [
    // Add current user's photo to test avatar display
    ...(user ? [{
      id: 'req-user',
      username: user.username || 'CurrentUser',
      displayName: user.displayName || 'Kullanıcı',
      avatar: user.photoURL,
      type: 'incoming' as const,
      sentAt: 'Test - Avatar'
    }] : []),
    {
      id: 'req1',
      username: 'NewPlayer2024',
      displayName: 'New Player',
      type: 'incoming',
      sentAt: '5 dk önce'
    },
    {
      id: 'req2',
      username: 'GamingLegend',
      displayName: 'Gaming Legend',
      type: 'incoming',
      sentAt: '1 saat önce'
    },
    {
      id: 'req3',
      username: 'CompetitivePlr',
      displayName: 'Competitive Player',
      type: 'outgoing',
      sentAt: '2 gün önce'
    }
  ];

  const onlineFriends = friends.filter(friend => friend.isOnline);
  const offlineFriends = friends.filter(friend => !friend.isOnline);
  const incomingRequests = friendRequests.filter(req => req.type === 'incoming');
  const outgoingRequests = friendRequests.filter(req => req.type === 'outgoing');

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendFriendRequest = () => {
    if (!newFriendUsername.trim()) return;
    
    // In real app, this would send to Firebase
    console.log('Sending friend request to:', newFriendUsername);
    setNewFriendUsername('');
  };

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting friend request:', requestId);
  };

  const handleRejectRequest = (requestId: string) => {
    console.log('Rejecting friend request:', requestId);
  };

  const handleRemoveFriend = (friendId: string) => {
    console.log('Removing friend:', friendId);
  };

  const renderFriendCard = (friend: Friend) => (
    <div
      key={friend.id}
      className={`group card-glass hover:shadow-glow transition-all duration-300 ${
        friend.isSpecial ? 'border-neon-cyan/50 bg-gradient-to-br from-neon-cyan/5 to-transparent' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            friend.isSpecial
              ? 'bg-gradient-to-br from-neon-cyan to-neon-blue'
              : 'bg-gradient-to-br from-neon-purple to-neon-cyan'
          }`}>
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.displayName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          {friend.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className={`font-medium truncate ${
              friend.isSpecial ? 'text-neon-cyan' : 'text-gaming-text'
            }`}>
              {friend.displayName}
            </h3>
            <span className="text-sm text-gaming-muted">@{friend.username}</span>
            {friend.isVerified && (
              <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {friend.isSpecial && (
              <Shield className="w-4 h-4 text-neon-cyan" />
            )}
          </div>
          
          {friend.status && (
            <p className="text-sm text-gaming-muted truncate">{friend.status}</p>
          )}
          
          {friend.game && (
            <p className="text-xs text-neon-purple font-medium">Oynuyor: {friend.game}</p>
          )}
          
          {!friend.isOnline && friend.lastSeen && (
            <p className="text-xs text-gaming-muted flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Son görülme: {friend.lastSeen}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 rounded-lg hover:bg-neon-cyan/20 transition-colors"
            title="Mesaj Gönder"
          >
            <MessageSquare className="w-4 h-4 text-neon-cyan" />
          </button>
          {!friend.isSpecial && (
            <button
              onClick={() => handleRemoveFriend(friend.id)}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
              title="Arkadaşlıktan Çıkar"
            >
              <UserMinus className="w-4 h-4 text-red-400" />
            </button>
          )}
          <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
            <MoreVertical className="w-4 h-4 text-gaming-muted" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderRequestCard = (request: FriendRequest) => (
    <div key={request.id} className="card-glass hover:shadow-glow transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-neon-orange to-neon-pink rounded-full flex items-center justify-center">
          {request.avatar ? (
            <img
              src={request.avatar}
              alt={request.displayName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gaming-text">{request.displayName}</h3>
          <p className="text-sm text-gaming-muted">@{request.username}</p>
          <p className="text-xs text-gaming-muted">{request.sentAt}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {request.type === 'incoming' ? (
            <>
              <button
                onClick={() => handleAcceptRequest(request.id)}
                className="p-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 transition-colors"
                title="Kabul Et"
              >
                <Check className="w-4 h-4 text-neon-green" />
              </button>
              <button
                onClick={() => handleRejectRequest(request.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                title="Reddet"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </>
          ) : (
            <span className="text-xs text-gaming-muted px-3 py-1 bg-gaming-surface rounded-full">
              Bekliyor...
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gaming-text flex items-center space-x-2">
          <Users className="w-8 h-8 text-neon-cyan" />
          <span>Arkadaşlar</span>
        </h1>
        <div className="text-gaming-muted">
          Toplam: {friends.length} arkadaş
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gaming-surface/30 rounded-xl p-1">
        {[
          { id: 'online', label: `Çevrimiçi (${onlineFriends.length})`, icon: Users },
          { id: 'all', label: `Tümü (${friends.length})`, icon: Users },
          { id: 'pending', label: `Bekleyen (${friendRequests.length})`, icon: Clock },
          { id: 'add', label: 'Arkadaş Ekle', icon: UserPlus }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-neon-purple text-white shadow-glow'
                  : 'text-gaming-muted hover:text-gaming-text hover:bg-gaming-surface/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar (for friends tabs) */}
      {(activeTab === 'online' || activeTab === 'all') && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
          <input
            type="text"
            placeholder="Arkadaş ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gaming-surface rounded-xl border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'online' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gaming-text">Çevrimiçi Arkadaşlar</h2>
            {onlineFriends.filter(friend =>
              friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(renderFriendCard)}
            {onlineFriends.length === 0 && (
              <div className="text-center py-8 text-gaming-muted">
                Şu anda çevrimiçi arkadaş bulunmuyor.
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-6">
            {onlineFriends.filter(friend =>
              friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gaming-text text-neon-green">
                  Çevrimiçi — {onlineFriends.filter(friend =>
                    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length}
                </h2>
                {onlineFriends.filter(friend =>
                  friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(renderFriendCard)}
              </div>
            )}

            {offlineFriends.filter(friend =>
              friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gaming-text text-gaming-muted">
                  Çevrimdışı — {offlineFriends.filter(friend =>
                    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length}
                </h2>
                {offlineFriends.filter(friend =>
                  friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(renderFriendCard)}
              </div>
            )}

            {filteredFriends.length === 0 && (
              <div className="text-center py-8 text-gaming-muted">
                Arama kriterinize uygun arkadaş bulunamadı.
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-6">
            {incomingRequests.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gaming-text text-neon-orange">
                  Gelen İstekler — {incomingRequests.length}
                </h2>
                {incomingRequests.map(renderRequestCard)}
              </div>
            )}

            {outgoingRequests.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gaming-text text-gaming-muted">
                  Gönderilen İstekler — {outgoingRequests.length}
                </h2>
                {outgoingRequests.map(renderRequestCard)}
              </div>
            )}

            {friendRequests.length === 0 && (
              <div className="text-center py-8 text-gaming-muted">
                Bekleyen arkadaşlık isteği bulunmuyor.
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-md mx-auto">
            <div className="card-glass">
              <h2 className="text-xl font-semibold text-gaming-text mb-6 text-center">
                Arkadaş Ekle
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Kullanıcı Adı
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="örnek: ProGamer123"
                      value={newFriendUsername}
                      onChange={(e) => setNewFriendUsername(e.target.value)}
                      className="flex-1 px-4 py-3 bg-gaming-surface rounded-xl border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                    />
                    <button
                      onClick={handleSendFriendRequest}
                      disabled={!newFriendUsername.trim()}
                      className="px-6 py-3 bg-neon-purple text-white rounded-xl hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Gönder</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gaming-muted">
                  <p>• Kullanıcı adını tam olarak yazın</p>
                  <p>• Büyük/küçük harf duyarlıdır</p>
                  <p>• İstek gönderildikten sonra onaylanmasını bekleyin</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
