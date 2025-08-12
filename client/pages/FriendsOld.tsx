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
import { useUserStats } from '../hooks/useUserStats';
import {
  getUserFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend as removeUserFriend,
  searchUsers,
  subscribeToUserFriends,
  subscribeToFriendRequests,
  RealUser,
  FriendRequest as FriendRequestType
} from '../lib/userService';

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

interface FriendRequestDisplay {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  type: 'incoming' | 'outgoing';
  sentAt?: string;
}

export default function FriendsOld() {
  const { user } = useAuth();
  const { addFriend, removeFriend } = useUserStats();
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RealUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - replace with real data from Firebase
  const allFriends: Friend[] = [
    {
      id: '1',
      username: 'ProGamer123',
      displayName: 'ProGamer123',
      isOnline: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      status: 'Oyunda',
      game: 'Valorant',
      isVerified: true,
      isSpecial: true
    },
    {
      id: '2', 
      username: 'GameMaster',
      displayName: 'GameMaster',
      isOnline: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      status: 'Müsait',
      isVerified: false
    },
    {
      id: '3',
      username: 'NightOwl',
      displayName: 'NightOwl',
      isOnline: false,
      lastSeen: '2 saat önce',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1f5?w=100&h=100&fit=crop&crop=face',
      status: 'Uzakta',
      isVerified: false
    }
  ];

  const currentFriendRequests: {
    incoming: FriendRequestDisplay[];
    outgoing: FriendRequestDisplay[];
  } = {
    incoming: [
      {
        id: '1',
        username: 'NewPlayer456',
        displayName: 'NewPlayer456',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        type: 'incoming',
        sentAt: '2 saat önce'
      }
    ],
    outgoing: [
      {
        id: '2',
        username: 'LegendaryGamer',
        displayName: 'LegendaryGamer', 
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face',
        type: 'outgoing',
        sentAt: '1 gün önce'
      }
    ]
  };

  const filteredFriends = allFriends.filter(friend => {
    const matchesSearch = friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'online') {
      return matchesSearch && friend.isOnline;
    }
    
    return matchesSearch;
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() && user) {
      setIsSearching(true);
      try {
        const results = await searchUsers(query.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      await sendFriendRequest(user.uid, targetUserId);
      // Remove from search results or update UI
      setSearchResults(prev => prev.filter(u => u.uid !== targetUserId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await addFriend();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    
    try {
      await removeUserFriend(user.uid, friendId);
      await removeFriend();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const renderFriendCard = (friend: Friend) => (
    <div key={friend.id} className="card-glass hover:shadow-glow transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-neon-purple to-neon-cyan">
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          {friend.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium truncate text-gaming-text">
              {friend.displayName}
            </h4>
            {friend.isVerified && (
              <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {friend.isSpecial && (
              <Shield className="w-4 h-4 text-neon-orange" />
            )}
          </div>
          <p className="text-sm text-gaming-muted truncate">@{friend.username}</p>
          
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              friend.isOnline ? 'bg-neon-green' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gaming-muted">
              {friend.isOnline ? (friend.status || 'Çevrimiçi') : (friend.lastSeen || 'Çevrimdışı')}
            </span>
            {friend.game && (
              <>
                <span className="text-xs text-gaming-muted">•</span>
                <span className="text-xs text-neon-green">{friend.game}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 text-neon-green transition-colors"
            title="Mesaj Gönder"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleRemoveFriend(friend.id)}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            title="Arkadaşlıktan Çıkar"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neon">Arkadaşlar</h1>
        <div className="flex items-center space-x-2 text-sm">
          <Users className="w-4 h-4 text-neon-green" />
          <span className="text-gaming-muted">
            {allFriends.length} arkadaş • {allFriends.filter(f => f.isOnline).length} çevrimiçi
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Arkadaş ara veya kullanıcı adı ile yeni arkadaş ekle..."
          className="w-full pl-10 pr-4 py-3 bg-gaming-surface/50 border border-gaming-border rounded-xl text-gaming-text placeholder-gaming-muted focus:outline-none focus:border-neon-purple focus:shadow-glow transition-all duration-300"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gaming-text">Arama Sonuçları</h3>
          
          {isSearching ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gaming-muted">Aranıyor...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-4">
              {searchResults.map((searchUser) => (
                <div key={searchUser.uid} className="card-glass">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-neon-purple to-neon-cyan">
                        {searchUser.photoURL ? (
                          <img
                            src={searchUser.photoURL}
                            alt={searchUser.displayName || searchUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gaming-text">
                          {searchUser.displayName || searchUser.username}
                        </h4>
                        <p className="text-sm text-gaming-muted">@{searchUser.username}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSendFriendRequest(searchUser.uid)}
                      className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Arkadaş Ekle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gaming-muted mx-auto mb-2" />
              <p className="text-gaming-muted">Kullanıcı bulunamadı</p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gaming-surface/30 rounded-xl p-1">
        {[
          { id: 'all', label: 'Tümü', count: allFriends.length },
          { id: 'online', label: 'Çevrimiçi', count: allFriends.filter(f => f.isOnline).length },
          { id: 'requests', label: 'İstekler', count: currentFriendRequests.incoming.length + currentFriendRequests.outgoing.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gaming-surface text-neon-purple shadow-glow'
                : 'text-gaming-muted hover:text-gaming-text hover:bg-gaming-surface/50'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-neon-purple/20' : 'bg-gaming-surface/50'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'requests' ? (
        <div className="space-y-6">
          {/* Incoming Requests */}
          {currentFriendRequests.incoming.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gaming-text mb-4">Gelen İstekler</h3>
              <div className="grid gap-4">
                {currentFriendRequests.incoming.map((request) => (
                  <div key={request.id} className="card-glass">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-neon-purple to-neon-cyan">
                          {request.avatar ? (
                            <img
                              src={request.avatar}
                              alt={request.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gaming-text">{request.displayName}</h4>
                          <p className="text-sm text-gaming-muted">@{request.username}</p>
                          {request.sentAt && (
                            <p className="text-xs text-gaming-muted">{request.sentAt}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Kabul Et</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Reddet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing Requests */}
          {currentFriendRequests.outgoing.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gaming-text mb-4">Gönderilen İstekler</h3>
              <div className="grid gap-4">
                {currentFriendRequests.outgoing.map((request) => (
                  <div key={request.id} className="card-glass">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-neon-purple to-neon-cyan">
                          {request.avatar ? (
                            <img
                              src={request.avatar}
                              alt={request.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gaming-text">{request.displayName}</h4>
                          <p className="text-sm text-gaming-muted">@{request.username}</p>
                          {request.sentAt && (
                            <p className="text-xs text-gaming-muted">{request.sentAt}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-neon-orange" />
                        <span className="text-sm text-neon-orange">Bekliyor</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentFriendRequests.incoming.length === 0 && currentFriendRequests.outgoing.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gaming-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gaming-text mb-2">Bekleyen istek yok</h3>
              <p className="text-gaming-muted">Yeni arkadaşlar bulmak için yukarıdaki arama kutusunu kullan!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFriends.length > 0 ? (
            filteredFriends.map(renderFriendCard)
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gaming-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gaming-text mb-2">
                {activeTab === 'online' ? 'Çevrimiçi arkadaş bulunamadı' : 'Arkadaş bulunamadı'}
              </h3>
              <p className="text-gaming-muted">
                {searchQuery 
                  ? 'Arama kriterlerinize uygun arkadaş bulunamadı.'
                  : 'Henüz arkadaşınız yok. Yeni arkadaşlar eklemek için arama yapın!'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
