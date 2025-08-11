import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  Star,
  Archive,
  VolumeX,
  Settings,
  Check,
  User,
  Loader2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from '../hooks/useUserStats';
import {
  getUserConversations,
  getOrCreateDirectConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToConversations,
  subscribeToMessages,
  Conversation,
  Message
} from '../lib/messageService';
import { areFriends, RealUser } from '../lib/userService';
import UserProfileModal from '../components/UserProfileModal';

export default function ChatReal() {
  const { user } = useAuth();
  const { incrementMessages } = useUserStats();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'favorites'>('all');

  // Real Firebase data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for conversation ID in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const conversationFromUrl = urlParams.get('conversation');

    if (conversationFromUrl && conversationFromUrl !== selectedChat) {
      setSelectedChat(conversationFromUrl);
    }
  }, [location.search, selectedChat]);

  // Load conversations on mount
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    // Subscribe to real-time conversations
    const unsubscribe = subscribeToConversations(user.uid, (realTimeConversations) => {
      setConversations(realTimeConversations);
      setLoading(false);

      // Auto-select first conversation if none selected and no URL param
      const urlParams = new URLSearchParams(location.search);
      const conversationFromUrl = urlParams.get('conversation');

      if (!conversationFromUrl && !selectedChat && realTimeConversations.length > 0) {
        setSelectedChat(realTimeConversations[0].id);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, location.search, selectedChat]);

  // Check friendship status for selected conversation
  useEffect(() => {
    const checkFriendship = async () => {
      if (!selectedChat || !user?.uid) {
        setCanSendMessage(true);
        setFriendshipStatus('');
        return;
      }

      // Find the selected conversation
      const selectedConversation = conversations.find(c => c.id === selectedChat);

      if (selectedConversation && selectedConversation.type === 'direct') {
        // Get the other participant
        const otherParticipant = selectedConversation.participantDetails.find(p => p.uid !== user.uid);

        if (otherParticipant) {
          try {
            const friendshipStatus = await areFriends(user.uid, otherParticipant.uid);
            setCanSendMessage(friendshipStatus);

            if (!friendshipStatus) {
              setFriendshipStatus(`${otherParticipant.displayName || otherParticipant.username} ile artık arkadaş değilsiniz. Mesaj gönderemezsiniz.`);
            } else {
              setFriendshipStatus('');
            }
          } catch (error) {
            console.error('Error checking friendship:', error);
            setCanSendMessage(true);
            setFriendshipStatus('');
          }
        }
      } else {
        // Group conversation or server channel - always allow
        setCanSendMessage(true);
        setFriendshipStatus('');
      }
    };

    checkFriendship();
  }, [selectedChat, user?.uid, conversations]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);

    const unsubscribe = subscribeToMessages(selectedChat, (realTimeMessages) => {
      setMessages(realTimeMessages);
      setMessagesLoading(false);

      // Mark messages as read
      if (user?.uid) {
        markMessagesAsRead(selectedChat, user.uid).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [selectedChat, user?.uid]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user?.uid || !canSendMessage) return;

    try {
      await sendMessage(selectedChat, user.uid, messageText.trim());
      await incrementMessages(selectedChat);
      setMessageText('');
    } catch (error: any) {
      console.error('Error sending message:', error);

      if (error.message.includes('arkadaş')) {
        // This shouldn't happen anymore since we check friendship status in UI
        setCanSendMessage(false);
        setFriendshipStatus(error.message);
      } else if (error.message.includes('Failed to fetch') || error.code === 'unavailable') {
        alert('Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      } else {
        alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSendMessage) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Manual refresh for debugging
  const handleManualRefresh = async () => {
    if (!selectedChat) return;

    try {
      console.log('Manual refresh triggered for conversation:', selectedChat);
      const messages = await getConversationMessages(selectedChat);
      console.log('Manual refresh got', messages.length, 'messages');
      setMessages(messages);
    } catch (error) {
      console.error('Manual refresh error:', error);
    }
  };

  // Get conversation details
  const selectedChatData = conversations.find(c => c.id === selectedChat);

  // Filter conversations based on search and tab
  const filteredChats = conversations.filter(chat => {
    const matchesSearch = !searchQuery || 
      chat.participantDetails.some(p => 
        p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (activeTab === 'online') {
      return matchesSearch && chat.participantDetails.some(p => p.isOnline && p.uid !== user?.uid);
    }
    
    return matchesSearch;
  });

  // Get display name for conversation
  const getConversationDisplayName = (conversation: Conversation): string => {
    if (conversation.type === 'group') {
      return conversation.name || 'Grup Sohbeti';
    }
    
    const otherParticipant = conversation.participantDetails.find(p => p.uid !== user?.uid);
    return otherParticipant?.displayName || otherParticipant?.username || 'Kullanıcı';
  };

  // Get conversation avatar
  const getConversationAvatar = (conversation: Conversation): string | undefined => {
    if (conversation.type === 'group') {
      return conversation.icon;
    }
    
    const otherParticipant = conversation.participantDetails.find(p => p.uid !== user?.uid);
    return otherParticipant?.photoURL;
  };

  // Check if other participant is online
  const isOtherParticipantOnline = (conversation: Conversation): boolean => {
    if (conversation.type === 'group') return true;
    
    const otherParticipant = conversation.participantDetails.find(p => p.uid !== user?.uid);
    return otherParticipant?.isOnline || false;
  };

  // Format time for display
  const formatTime = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  // Get unread count for conversation
  const getUnreadCount = (conversation: Conversation): number => {
    return conversation.unreadCounts?.[user?.uid || ''] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
        <span className="ml-2 text-gaming-text">Sohbetler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-gaming-bg rounded-2xl overflow-hidden">
      {/* Chat List */}
      <div className="w-80 bg-gaming-surface/30 backdrop-blur-xl border-r border-gaming-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gaming-border">
          <h1 className="text-xl font-bold text-gaming-text mb-4">Sohbetler</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-muted" />
            <input
              type="text"
              placeholder="Sohbet ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gaming-surface/50 rounded-lg p-1">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'online', label: 'Çevrimiçi' },
              { id: 'favorites', label: 'Favoriler' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neon-purple text-white'
                    : 'text-gaming-muted hover:text-gaming-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const displayName = getConversationDisplayName(chat);
              const avatar = getConversationAvatar(chat);
              const isOnline = isOtherParticipantOnline(chat);
              const unreadCount = getUnreadCount(chat);

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 border-b border-gaming-border/50 cursor-pointer transition-colors hover:bg-gaming-surface/50 ${
                    selectedChat === chat.id ? 'bg-gaming-surface' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                        {avatar ? (
                          <img 
                            src={avatar} 
                            alt={displayName} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <MessageSquare className="w-6 h-6 text-white" />
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate text-gaming-text">
                          {displayName}
                        </h3>
                        <span className="text-xs text-gaming-muted">
                          {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gaming-muted truncate">
                          {chat.lastMessage?.content || 'Mesaj yok'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-neon-red text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gaming-muted">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sohbet bulunamadı</p>
              <p className="text-sm">Arkadaşlarınızla sohbet etmeye başlayın</p>
            </div>
          )}
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
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                      {getConversationAvatar(selectedChatData) ? (
                        <img 
                          src={getConversationAvatar(selectedChatData)!} 
                          alt={getConversationDisplayName(selectedChatData)} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-white" />
                      )}
                    </div>
                    {isOtherParticipantOnline(selectedChatData) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="font-semibold text-gaming-text">
                        {getConversationDisplayName(selectedChatData)}
                      </h2>
                    </div>
                    <p className="text-sm text-gaming-muted">
                      {isOtherParticipantOnline(selectedChatData) ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleManualRefresh}
                    className="p-2 rounded-lg hover:bg-gaming-surface transition-colors bg-red-500/20"
                    title="Debug: Refresh Messages"
                  >
                    <Search className="w-5 h-5 text-red-400" />
                  </button>
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
              {messagesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-neon-purple mx-auto" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for received messages */}
                    {message.senderId !== user?.uid && (
                      <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center flex-shrink-0">
                        {message.sender.photoURL ? (
                          <img 
                            src={message.sender.photoURL} 
                            alt={message.sender.displayName || message.sender.username} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-white">
                            {(message.sender.displayName || message.sender.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}

                    <div className={`max-w-xs lg:max-w-md ${
                      message.senderId === user?.uid ? 'order-2' : 'order-1'
                    }`}>
                      {message.senderId !== user?.uid && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gaming-text">
                            {message.sender.displayName || message.sender.username}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.senderId === user?.uid
                            ? 'bg-neon-purple text-white ml-4'
                            : 'bg-gaming-surface text-gaming-text mr-4'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.uid 
                            ? 'text-white/70' 
                            : 'text-gaming-muted'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gaming-muted">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz mesaj yok</p>
                  <p className="text-sm">Sohbeti başlatmak için bir mesaj gönderin</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gaming-surface/30 backdrop-blur-xl border-t border-gaming-border">
              {/* Friendship Status Warning */}
              {!canSendMessage && friendshipStatus && (
                <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {friendshipStatus}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  className="p-2 rounded-lg hover:bg-gaming-surface transition-colors disabled:opacity-50"
                  disabled={!canSendMessage}
                >
                  <Paperclip className="w-5 h-5 text-gaming-muted" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={canSendMessage ? "Mesaj yazın..." : "Mesaj gönderemezsiniz"}
                    disabled={!canSendMessage}
                    className="w-full px-4 py-3 bg-gaming-surface border border-gaming-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gaming-surface transition-colors disabled:opacity-50"
                    disabled={!canSendMessage}
                  >
                    <Smile className="w-5 h-5 text-gaming-muted" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !canSendMessage}
                  className="p-3 bg-neon-purple text-white rounded-xl hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gaming-muted">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Sohbet Seç</h2>
              <p>Mesajlaşmaya başlamak için bir sohbet seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
