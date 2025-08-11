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
  CheckCheck,
  User,
  Loader2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from '../hooks/useUserStats';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
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
import { areFriends, RealUser, sendFriendRequest, removeFriend } from '../lib/userService';
import UserProfileModal from '../components/UserProfileModal';
import { uploadFile, UploadProgress } from '../lib/fileService';
import FileUploadModal from '../components/FileUploadModal';
import FileUploadProgress from '../components/FileUploadProgress';
import FileMessage from '../components/FileMessage';
import EmojiPicker from '../components/EmojiPicker';
import MessageSearch from '../components/MessageSearch';
import VoiceCallModal from '../components/VoiceCallModal';
import voiceChatService, { VoiceCallState } from '../lib/voiceChatService';
import CallNotificationModal from '../components/CallNotificationModal';
import { useCallManager } from '../hooks/useCallManager';

export default function ChatReal() {
  const { user } = useAuth();
  const { incrementMessages } = useUserStats();
  const { isOnline, wasOffline } = useNetworkStatus();
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
  const [selectedUserProfile, setSelectedUserProfile] = useState<RealUser | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // File upload states
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, { file: File; progress: number; status: 'uploading' | 'completed' | 'error'; error?: string }>>(new Map());

  // Emoji picker state
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Message search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Voice call state (legacy - keeping for compatibility)
  const [voiceCallState, setVoiceCallState] = useState<VoiceCallState>({
    isInCall: false,
    isMuted: false,
    isDeafened: false,
    isConnecting: false
  });
  const [isVoiceCallModalOpen, setIsVoiceCallModalOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  // New call manager
  const [callState, callActions] = useCallManager();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize voice chat service
  useEffect(() => {
    voiceChatService.initialize({
      onCallStarted: (userId) => {
        setIsVoiceCallModalOpen(true);
        setIsIncomingCall(false);
      },
      onCallEnded: () => {
        setIsVoiceCallModalOpen(false);
        setIsIncomingCall(false);
        setVoiceCallState({
          isInCall: false,
          isMuted: false,
          isDeafened: false,
          isConnecting: false
        });
      },
      onCallReceived: (from) => {
        setVoiceCallState(prev => ({ ...prev, remoteUser: from }));
        setIsIncomingCall(true);
        setIsVoiceCallModalOpen(true);
      },
      onCallAccepted: () => {
        setIsIncomingCall(false);
        setVoiceCallState(prev => ({ ...prev, isInCall: true, isConnecting: false }));
      },
      onError: (error) => {
        setVoiceCallState(prev => ({ ...prev, error, isConnecting: false }));
      }
    });
  }, []);

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


    // Subscribe to real-time conversations with better error handling
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
      } else if (error.name === 'NetworkError' ||
                 error.message.includes('Ağ bağlantısı sorunu')) {
        alert('Ağ bağlantısı sorunu. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      } else if (error.message.includes('Failed to fetch') ||
                 error.code === 'unavailable' ||
                 error.message.includes('network-request-failed')) {
        if (!isOnline) {
          alert('İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.');
        } else {
          alert('Bağlantı sorunu yaşanıyor. Lütfen tekrar deneyin.');
        }
      } else if (error.code === 'permission-denied') {
        alert('Bu sohbete mesaj gönderme izniniz yok.');
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

  // Profile modal handlers
  const handleUserProfileClick = (user: RealUser) => {
    setSelectedUserProfile(user);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUserProfile(null);
  };

  const handleSendMessageFromProfile = async (targetUserId: string) => {
    if (!user?.uid) return;

    try {
      const conversationId = await getOrCreateDirectConversation(user.uid, targetUserId);
      setSelectedChat(conversationId);
      handleCloseProfileModal();
    } catch (error: any) {
      console.error('Error starting conversation from profile:', error);
      if (error.message.includes('arkadaş')) {
        alert(error.message);
      } else {
        alert('Sohbet başlatılamadı.');
      }
    }
  };

  const handleAddFriendFromProfile = async (targetUserId: string) => {
    if (!user?.uid) return;

    try {
      await sendFriendRequest(user.uid, targetUserId);
      alert('Arkadaşlık isteği gönderildi!');
    } catch (error: any) {
      console.error('Error sending friend request from profile:', error);
      if (error.message.includes('already sent')) {
        alert('Bu kullanıcıya zaten arkadaşlık isteği gönderilmiş.');
      } else if (error.message.includes('already friends')) {
        alert('Bu kullanıcı zaten arkadaşınız.');
      } else if (error.message.includes('Failed to fetch') || error.code === 'unavailable') {
        alert('Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      } else {
        alert(error.message || 'Arkadaşlık isteği gönderilemedi.');
      }
    }
  };

  const handleRemoveFriendFromProfile = async (targetUserId: string) => {
    if (!user?.uid) return;

    const confirmRemove = window.confirm('Bu kişiyi arkadaşlıktan çıkarmak istediğinizden emin misiniz?');
    if (!confirmRemove) return;

    try {
      await removeFriend(user.uid, targetUserId);
      alert('Arkadaşlıktan çıkarıldı.');
    } catch (error: any) {
      console.error('Error removing friend from profile:', error);
      if (error.message.includes('Failed to fetch') || error.code === 'unavailable') {
        alert('Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      } else {
        alert('Arkadaşlıktan çıkarılamadı. Lütfen tekrar deneyin.');
      }
    }
  };

  // File upload handlers
  const handleFileSelect = async (file: File) => {
    if (!selectedChat || !user?.uid) return;

    const fileId = `${Date.now()}_${file.name}`;

    // Add to uploading files map
    setUploadingFiles(prev => new Map(prev.set(fileId, {
      file,
      progress: 0,
      status: 'uploading'
    })));

    try {
      // Upload file to Firebase Storage
      const fileMetadata = await uploadFile(
        file,
        selectedChat,
        user.uid,
        (progress: UploadProgress) => {
          setUploadingFiles(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(fileId);
            if (existing) {
              newMap.set(fileId, {
                ...existing,
                progress: progress.progress
              });
            }
            return newMap;
          });
        }
      );

      // Update upload status to completed
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(fileId);
        if (existing) {
          newMap.set(fileId, {
            ...existing,
            status: 'completed'
          });
        }
        return newMap;
      });

      // Send file message
      await sendMessage(
        selectedChat,
        user.uid,
        file.name,
        'file',
        fileMetadata.downloadUrl,
        file.name,
        file.size
      );

      // Remove from uploading files after successful send
      setTimeout(() => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 2000);

    } catch (error: any) {
      console.error('Error uploading file:', error);

      // Update upload status to error
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(fileId);
        if (existing) {
          newMap.set(fileId, {
            ...existing,
            status: 'error',
            error: error.message || 'Dosya yüklenemedi'
          });
        }
        return newMap;
      });

      // Remove error after a delay
      setTimeout(() => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 5000);
    }
  };

  const handleCancelUpload = (fileId: string) => {
    setUploadingFiles(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  // Emoji handlers
  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Search handlers
  const handleMessageSelect = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('animate-pulse', 'bg-neon-purple/20', 'rounded-lg');
      setTimeout(() => {
        messageElement.classList.remove('animate-pulse', 'bg-neon-purple/20', 'rounded-lg');
      }, 2000);
    }
    setIsSearchOpen(false);
  };

  // Voice call handlers
  const handleStartVoiceCall = async () => {
    if (!selectedChatData || selectedChatData.type !== 'direct') return;

    const otherParticipant = selectedChatData.participantDetails.find(p => p.uid !== user?.uid);
    if (!otherParticipant) return;

    try {
      await callActions.initiateCall(
        otherParticipant.uid,
        otherParticipant.displayName || otherParticipant.username || 'Kullanıcı',
        otherParticipant.photoURL,
        selectedChat!,
        'voice'
      );
    } catch (error: any) {
      console.error('Error starting voice call:', error);
      alert('Sesli arama başlatılamadı: ' + error.message);
    }
  };

  const handleStartVideoCall = async () => {
    if (!selectedChatData || selectedChatData.type !== 'direct') return;

    const otherParticipant = selectedChatData.participantDetails.find(p => p.uid !== user?.uid);
    if (!otherParticipant) return;

    try {
      await callActions.initiateCall(
        otherParticipant.uid,
        otherParticipant.displayName || otherParticipant.username || 'Kullanıcı',
        otherParticipant.photoURL,
        selectedChat!,
        'video'
      );
    } catch (error: any) {
      console.error('Error starting video call:', error);
      alert('Görüntülü arama başlatılamadı: ' + error.message);
    }
  };

  const handleAnswerCall = async () => {
    try {
      await callActions.answerCall();
    } catch (error: any) {
      console.error('Error answering call:', error);
      alert('Arama cevaplanamadı: ' + error.message);
    }
  };

  const handleRejectCall = () => {
    callActions.rejectCall();
  };

  const handleEndCall = () => {
    callActions.endCall();
  };

  const handleToggleMute = () => {
    callActions.toggleMute();
  };

  const handleToggleDeafen = () => {
    callActions.toggleDeafen();
  };

  // Demo: Simulate incoming call
  const handleSimulateIncomingCall = () => {
    if (!selectedChatData || selectedChatData.type !== 'direct') return;

    const otherParticipant = selectedChatData.participantDetails.find(p => p.uid !== user?.uid);
    if (!otherParticipant) return;

    voiceChatService.simulateIncomingCall({
      id: otherParticipant.uid,
      name: otherParticipant.displayName || otherParticipant.username || 'Kullanıcı',
      avatar: otherParticipant.photoURL
    });
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

  // Check if message is read by other participants
  const isMessageRead = (message: Message): boolean => {
    if (!message.readBy || message.readBy.length === 0) return false;

    // For direct conversations, check if the other participant has read it
    if (selectedChatData?.type === 'direct') {
      const otherParticipant = selectedChatData.participantDetails.find(p => p.uid !== user?.uid);
      return message.readBy.some(read => read.userId === otherParticipant?.uid);
    }

    // For group conversations, check if anyone else has read it
    return message.readBy.some(read => read.userId !== user?.uid);
  };

  // Get read status tooltip text
  const getReadStatusTooltip = (message: Message): string => {
    if (!message.readBy || message.readBy.length === 0) return 'Gönderildi';

    if (selectedChatData?.type === 'direct') {
      const otherParticipant = selectedChatData.participantDetails.find(p => p.uid !== user?.uid);
      const readInfo = message.readBy.find(read => read.userId === otherParticipant?.uid);

      if (readInfo) {
        const readTime = formatTime(readInfo.readAt);
        return `Görüldü ${readTime}`;
      }
      return 'Gönderildi';
    }

    // For group conversations, show who read it
    const readByOthers = message.readBy.filter(read => read.userId !== user?.uid);
    if (readByOthers.length === 0) return 'Gönderildi';

    if (readByOthers.length === 1) {
      const reader = selectedChatData?.participantDetails.find(p => p.uid === readByOthers[0].userId);
      const readerName = reader?.displayName || reader?.username || 'Kullanıcı';
      return `${readerName} tarafından görüldü`;
    }

    return `${readByOthers.length} kişi tarafından görüldü`;
  };

  // Get unread count for conversation
  const getUnreadCount = (conversation: Conversation): number => {
    return conversation.unreadCounts?.[user?.uid || ''] || 0;
  };

  // Check if last message was sent by current user and is read
  const isLastMessageRead = (conversation: Conversation): boolean => {
    if (!conversation.lastMessage || conversation.lastMessage.senderId !== user?.uid) {
      return false; // Not our message or no message
    }

    // For direct conversations, check if other participant has unread count of 0
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participantDetails.find(p => p.uid !== user?.uid);
      if (otherParticipant) {
        const otherUnreadCount = conversation.unreadCounts?.[otherParticipant.uid] || 0;
        return otherUnreadCount === 0;
      }
    }

    // For group conversations, check if anyone else has read it
    const otherParticipants = conversation.participantDetails.filter(p => p.uid !== user?.uid);
    return otherParticipants.some(p => (conversation.unreadCounts?.[p.uid] || 0) === 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
        <span className="ml-2 text-gaming-text">
          {!isOnline ? 'Bağlantı bekleniyor...' : 'Sohbetler yükleniyor...'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-gaming-bg rounded-2xl overflow-hidden">
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">İnternet bağlantısı yok</span>
          </div>
        </div>
      )}

      {wasOffline && isOnline && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">Bağlantı yeniden kuruldu</span>
          </div>
        </div>
      )}

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
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <p className="text-sm text-gaming-muted truncate">
                            {chat.lastMessage?.content || 'Mesaj yok'}
                          </p>
                          {/* Show read status for last message if sent by current user */}
                          {chat.lastMessage && chat.lastMessage.senderId === user?.uid && (
                            <div className="flex-shrink-0" title={isLastMessageRead(chat) ? 'Görüldü' : 'Gönderildi'}>
                              {isLastMessageRead(chat) ? (
                                <CheckCheck className="w-3 h-3 text-neon-cyan" />
                              ) : (
                                <Check className="w-3 h-3 text-gaming-muted" />
                              )}
                            </div>
                          )}
                        </div>
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
      <div className="flex-1 flex flex-col relative">
        {selectedChatData ? (
          <>
            {/* Message Search */}
            <MessageSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              messages={messages}
              onMessageSelect={handleMessageSelect}
            />

            {/* Chat Header */}
            <div className="p-4 bg-gaming-surface/30 backdrop-blur-xl border-b border-gaming-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => {
                      // For direct conversations, show the other participant's profile
                      if (selectedChatData.type === 'direct') {
                        const otherParticipant = selectedChatData.participantDetails.find(p => p.uid !== user?.uid);
                        if (otherParticipant) {
                          handleUserProfileClick(otherParticipant);
                        }
                      }
                    }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center hover:ring-2 hover:ring-neon-purple/50 transition-all">
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
                  <div
                    className="cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => {
                      // For direct conversations, show the other participant's profile
                      if (selectedChatData.type === 'direct') {
                        const otherParticipant = selectedChatData.participantDetails.find(p => p.uid !== user?.uid);
                        if (otherParticipant) {
                          handleUserProfileClick(otherParticipant);
                        }
                      }
                    }}
                  >
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
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 rounded-lg hover:bg-gaming-surface transition-colors"
                    title="Mesajlarda Ara"
                  >
                    <Search className="w-5 h-5 text-gaming-muted hover:text-neon-purple" />
                  </button>
                  <button
                    onClick={handleStartVoiceCall}
                    className="p-2 rounded-lg hover:bg-gaming-surface transition-colors"
                    title="Sesli Arama"
                    disabled={selectedChatData?.type !== 'direct'}
                  >
                    <Phone className="w-5 h-5 text-gaming-muted hover:text-neon-green" />
                  </button>
                  <button
                    onClick={handleStartVideoCall}
                    className="p-2 rounded-lg hover:bg-gaming-surface transition-colors"
                    title="Görüntülü Arama"
                    disabled={selectedChatData?.type !== 'direct'}
                  >
                    <Video className="w-5 h-5 text-gaming-muted hover:text-neon-blue" />
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
              ) : (
                <>
                  {/* File Upload Progress */}
                  {Array.from(uploadingFiles.entries()).map(([fileId, uploadInfo]) => (
                    <div key={fileId} className="flex justify-end">
                      <FileUploadProgress
                        file={uploadInfo.file}
                        progress={uploadInfo.progress}
                        status={uploadInfo.status}
                        error={uploadInfo.error}
                        onCancel={() => handleCancelUpload(fileId)}
                      />
                    </div>
                  ))}

                  {/* Messages */}
                  {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    id={`message-${message.id}`}
                    className={`flex items-start space-x-3 ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for received messages */}
                    {message.senderId !== user?.uid && (
                      <div
                        className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-neon-purple/50 transition-all"
                        onClick={() => handleUserProfileClick(message.sender)}
                      >
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
                          <span
                            className="text-sm font-medium text-gaming-text cursor-pointer hover:text-neon-purple transition-colors"
                            onClick={() => handleUserProfileClick(message.sender)}
                          >
                            {message.sender.displayName || message.sender.username}
                          </span>
                        </div>
                      )}
                      
                      {/* Render different message types */}
                      {message.type === 'file' && message.fileUrl && message.fileName && message.fileSize ? (
                        <div className={message.senderId === user?.uid ? 'ml-4' : 'mr-4'}>
                          <FileMessage
                            fileName={message.fileName}
                            fileSize={message.fileSize}
                            fileType={message.fileUrl.includes('.') ?
                              `file/${message.fileName.split('.').pop()}` : 'application/octet-stream'
                            }
                            downloadUrl={message.fileUrl}
                            className="max-w-xs"
                          />
                          <div className={`flex items-center justify-between mt-1 px-1 ${
                            message.senderId === user?.uid
                              ? 'text-white/70'
                              : 'text-gaming-muted'
                          }`}>
                            <p className="text-xs">
                              {formatTime(message.timestamp)}
                            </p>
                            {/* Read receipt for sent messages */}
                            {message.senderId === user?.uid && (
                              <div
                                className="flex items-center ml-2"
                                title={getReadStatusTooltip(message)}
                              >
                                {isMessageRead(message) ? (
                                  <CheckCheck className="w-3 h-3 text-neon-cyan" />
                                ) : (
                                  <Check className="w-3 h-3 text-white/50" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            message.senderId === user?.uid
                              ? 'bg-neon-purple text-white ml-4'
                              : 'bg-gaming-surface text-gaming-text mr-4'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-between mt-1 ${
                            message.senderId === user?.uid
                              ? 'text-white/70'
                              : 'text-gaming-muted'
                          }`}>
                            <p className="text-xs">
                              {formatTime(message.timestamp)}
                            </p>
                            {/* Read receipt for sent messages */}
                            {message.senderId === user?.uid && (
                              <div
                                className="flex items-center ml-2"
                                title={getReadStatusTooltip(message)}
                              >
                                {isMessageRead(message) ? (
                                  <CheckCheck className="w-3 h-3 text-neon-cyan" />
                                ) : (
                                  <Check className="w-3 h-3 text-white/50" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                </>
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
                  onClick={() => setIsFileModalOpen(true)}
                  className="p-2 rounded-lg hover:bg-gaming-surface transition-colors disabled:opacity-50"
                  disabled={!canSendMessage}
                  title="Dosya Gönder"
                >
                  <Paperclip className="w-5 h-5 text-gaming-muted hover:text-neon-purple" />
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
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 relative">
                    <button
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      className="p-1 rounded-lg hover:bg-gaming-surface transition-colors disabled:opacity-50"
                      disabled={!canSendMessage}
                      title="Emoji Ekle"
                    >
                      <Smile className="w-5 h-5 text-gaming-muted hover:text-neon-purple" />
                    </button>
                    <EmojiPicker
                      isOpen={isEmojiPickerOpen}
                      onClose={() => setIsEmojiPickerOpen(false)}
                      onEmojiSelect={handleEmojiSelect}
                      position="top"
                    />
                  </div>
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

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUserProfile}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        currentUserId={user?.uid || ''}
        onSendMessage={handleSendMessageFromProfile}
        onAddFriend={handleAddFriendFromProfile}
        onRemoveFriend={handleRemoveFriendFromProfile}
        isFriend={selectedUserProfile ? conversations.some(c =>
          c.type === 'direct' &&
          c.participantDetails.some(p => p.uid === selectedUserProfile.uid)
        ) : false}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onFileSelect={handleFileSelect}
        disabled={!canSendMessage}
      />

      {/* Voice Call Modal */}
      <VoiceCallModal
        isOpen={isVoiceCallModalOpen}
        callState={voiceCallState}
        onEndCall={handleEndCall}
        onToggleMute={handleToggleMute}
        onToggleDeafen={handleToggleDeafen}
        onAnswer={handleAnswerCall}
        onReject={handleRejectCall}
        isIncoming={isIncomingCall}
      />

      {/* New Call Notification Modal */}
      <CallNotificationModal
        isOpen={callState.isCallModalOpen}
        callData={callState.currentCall}
        isIncoming={callState.isIncomingCall}
        isConnected={callState.isConnected}
        isMuted={callState.isMuted}
        isDeafened={callState.isDeafened}
        callDuration={callState.callDuration}
        onAnswer={handleAnswerCall}
        onReject={handleRejectCall}
        onEndCall={handleEndCall}
        onToggleMute={handleToggleMute}
        onToggleDeafen={handleToggleDeafen}
      />

      {/* Call Error Alert */}
      {callState.error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">{callState.error}</span>
            <button
              onClick={callActions.clearError}
              className="ml-2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
