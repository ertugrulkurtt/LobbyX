import React, { useState, useEffect } from 'react';
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
  User,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  FriendRequest
} from '../lib/userService';
import { getOrCreateDirectConversation } from '../lib/messageService';

export default function FriendsReal() {
  const { user } = useAuth();
  const { addFriend, removeFriend } = useUserStats();
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending' | 'add'>('online');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFriendUsername, setNewFriendUsername] = useState('');
  
  // Real Firebase data states
  const [friends, setFriends] = useState<RealUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    incoming: [],
    outgoing: []
  });
  const [searchResults, setSearchResults] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Manual refresh function for debugging
  const refreshFriendRequests = async () => {
    if (!user?.uid) return;
    try {
      const requests = await getFriendRequests(user.uid);
      console.log('Manual refresh - Friend requests:', requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error refreshing friend requests:', error);
    }
  };

  // Real-time data subscriptions
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    // Subscribe to friends list
    const unsubscribeFriends = subscribeToUserFriends(user.uid, (realFriends) => {
      setFriends(realFriends);
      setLoading(false);
    });

    // Subscribe to friend requests
    const unsubscribeRequests = subscribeToFriendRequests(user.uid, (requests) => {
      setFriendRequests(requests);
    });

    // Also manually fetch once
    refreshFriendRequests();

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, [user?.uid]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const results = await searchUsers(searchQuery);
          // Filter out current user and existing friends
          const filteredResults = results.filter(u => 
            u.uid !== user?.uid && 
            !friends.some(f => f.uid === u.uid)
          );
          setSearchResults(filteredResults);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, friends, user?.uid]);

  // Filter friends based on search
  const filteredFriends = friends.filter(friend =>
    friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(friend => friend.isOnline);
  const offlineFriends = filteredFriends.filter(friend => !friend.isOnline);

  // Event handlers
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await addFriend();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Arkadaşlık isteği kabul edilemedi.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Arkadaşlık isteği reddedilemedi.');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      if (!user?.uid) return;
      await removeUserFriend(user.uid, friendId);
      await removeFriend();
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Arkadaş çıkarılamadı.');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!newFriendUsername.trim() || !user?.uid) return;
    
    try {
      // Find user by username
      const searchResults = await searchUsers(newFriendUsername);
      const targetUser = searchResults.find(u => 
        u.username?.toLowerCase() === newFriendUsername.toLowerCase()
      );
      
      if (!targetUser) {
        alert('Kullanıcı bulunamadı.');
        return;
      }
      
      await sendFriendRequest(user.uid, targetUser.uid);
      setNewFriendUsername('');
      alert('Arkadaşlık isteği gönderildi!');
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      alert(error.message || 'Arkadaşlık isteği gönderilemedi.');
    }
  };

  const handleSendRequestToUser = async (targetUserId: string) => {
    if (!user?.uid) return;

    try {
      await sendFriendRequest(user.uid, targetUserId);
      alert('Arkadaşlık isteği gönderildi!');
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      alert(error.message || 'Arkadaşlık isteği gönderilemedi.');
    }
  };

  const handleStartConversation = async (friendId: string) => {
    if (!user?.uid) return;

    try {
      // Create or get conversation between current user and friend
      const conversationId = await getOrCreateDirectConversation(user.uid, friendId);

      // Navigate to chat page with the conversation
      // Since we don't have router, we'll update the URL manually and trigger navigation
      window.location.hash = `#/chat?conversation=${conversationId}`;

      // Alternative: If you have a way to change pages directly, use that instead
      // For example: navigate('/chat', { state: { conversationId } });
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Sohbet başlatılamadı.');
    }
  };

  const renderFriendCard = (friend: RealUser) => (
    <div
      key={friend.uid}
      className="group card-glass hover:shadow-glow transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-neon-purple to-neon-cyan">
            {friend.photoURL ? (
              <img 
                src={friend.photoURL} 
                alt={friend.displayName || friend.username} 
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
            <h3 className="font-medium text-gaming-text">{friend.displayName || friend.username}</h3>
            {friend.isVerified && (
              <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-gaming-muted">@{friend.username}</p>
          {friend.status && (
            <p className="text-xs text-neon-cyan">{friend.status}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStartConversation(friend.uid)}
            className="p-2 rounded-lg hover:bg-neon-cyan/20 transition-colors"
            title="Mesaj gönder"
          >
            <MessageSquare className="w-4 h-4 text-neon-cyan" />
          </button>
          <button
            onClick={() => handleRemoveFriend(friend.uid)}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
            title="Arkadaşlıktan çıkar"
          >
            <UserMinus className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderRequestCard = (request: FriendRequest) => (
    <div key={request.id} className="card-glass hover:shadow-glow transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-neon-orange to-neon-pink rounded-full flex items-center justify-center">
          {request.fromUser.photoURL ? (
            <img 
              src={request.fromUser.photoURL} 
              alt={request.fromUser.displayName || request.fromUser.username} 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gaming-text">{request.fromUser.displayName || request.fromUser.username}</h3>
          <p className="text-sm text-gaming-muted">@{request.fromUser.username}</p>
          <p className="text-xs text-gaming-muted">{request.sentAt}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAcceptRequest(request.id)}
            className="p-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 transition-colors"
          >
            <Check className="w-4 h-4 text-neon-green" />
          </button>
          <button
            onClick={() => handleRejectRequest(request.id)}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'online', label: `Çevrimiçi (${onlineFriends.length})`, icon: Users },
    { id: 'all', label: `Tümü (${friends.length})`, icon: Users },
    { id: 'pending', label: `Bekleyen (${friendRequests.incoming.length + friendRequests.outgoing.length})`, icon: Clock },
    { id: 'add', label: 'Arkadaş Ekle', icon: UserPlus }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
        <span className="ml-2 text-gaming-text">Arkadaşlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-gaming-text mb-2">Arkadaşlar</h1>
        <p className="text-gaming-muted">Arkadaşlarınızla bağlantıda kalın ve yeni kişilerle tanışın.</p>
      </section>

      {/* Search and Tabs */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex space-x-1 bg-gaming-surface/50 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-neon-purple text-white shadow-glow'
                      : 'text-gaming-muted hover:text-gaming-text hover:bg-gaming-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-muted" />
            <input
              type="text"
              placeholder="Arkadaş ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text w-full md:w-64"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'online' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gaming-text flex items-center space-x-2">
              <Users className="w-5 h-5 text-neon-green" />
              <span>Çevrimiçi Arkadaşlar ({onlineFriends.length})</span>
            </h2>
            
            {onlineFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onlineFriends.map(renderFriendCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gaming-muted">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Çevrimiçi arkadaşınız yok</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-6">
            {onlineFriends.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gaming-text mb-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full"></div>
                  <span>Çevrimiçi ({onlineFriends.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onlineFriends.map(renderFriendCard)}
                </div>
              </div>
            )}

            {offlineFriends.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gaming-text mb-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Çevrimdışı ({offlineFriends.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offlineFriends.map(renderFriendCard)}
                </div>
              </div>
            )}

            {friends.length === 0 && (
              <div className="text-center py-8 text-gaming-muted">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz arkadaşınız yok</p>
                <p className="text-sm">Yeni arkadaşlar eklemek için "Arkadaş Ekle" sekmesini kullanın</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-6">
            {friendRequests.incoming.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gaming-text mb-4 flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-neon-green" />
                  <span>Gelen İstekler ({friendRequests.incoming.length})</span>
                </h2>
                <div className="space-y-3">
                  {friendRequests.incoming.map(renderRequestCard)}
                </div>
              </div>
            )}

            {friendRequests.outgoing.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gaming-text mb-4 flex items-center space-x-2">
                  <Send className="w-5 h-5 text-neon-orange" />
                  <span>Giden İstekler ({friendRequests.outgoing.length})</span>
                </h2>
                <div className="space-y-3">
                  {friendRequests.outgoing.map((request) => (
                    <div key={request.id} className="card-glass">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-orange to-neon-pink rounded-full flex items-center justify-center">
                            {request.toUser.photoURL ? (
                              <img 
                                src={request.toUser.photoURL} 
                                alt={request.toUser.displayName || request.toUser.username} 
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gaming-text">{request.toUser.displayName || request.toUser.username}</h4>
                            <p className="text-sm text-gaming-muted">{request.sentAt}</p>
                          </div>
                        </div>
                        <span className="text-sm text-neon-orange">Bekliyor</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {friendRequests.incoming.length === 0 && friendRequests.outgoing.length === 0 && (
              <div className="text-center py-8 text-gaming-muted">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Bekleyen arkadaşlık isteğiniz yok</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-6">
            <div className="card-glass">
              <h2 className="text-xl font-semibold text-gaming-text mb-4">Arkadaş Ekle</h2>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Kullanıcı adı girin..."
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                />
                <button
                  onClick={handleSendFriendRequest}
                  disabled={!newFriendUsername.trim()}
                  className="px-6 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gönder
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div>
                <h3 className="text-lg font-medium text-gaming-text mb-4 flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Arama Sonuçları</span>
                  {searchLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </h3>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div key={user.uid} className="card-glass">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                              {user.photoURL ? (
                                <img 
                                  src={user.photoURL} 
                                  alt={user.displayName || user.username} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gaming-text">{user.displayName || user.username}</h4>
                              <p className="text-sm text-gaming-muted">@{user.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSendRequestToUser(user.uid)}
                            className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery && !searchLoading && (
                  <div className="text-center py-8 text-gaming-muted">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>"{searchQuery}" için sonuç bulunamadı</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
