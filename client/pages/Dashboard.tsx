import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Trophy,
  Clock,
  Star,
  Play,
  UserPlus,
  Headphones,
  Plus,
  Shield,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from '../hooks/useUserStats';
import { getUserConversations } from '../lib/messageService';
import { createTestNotifications } from '../lib/testNotifications';
import { forceCleanup, getLastCleanupTime } from '../lib/fileCleanupService';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading: statsLoading, formatActiveTime } = useUserStats();

  const handleCreateTestNotifications = async () => {
    if (!user?.uid) return;

    try {
      await createTestNotifications(user.uid);
      alert('Test bildirimleri oluşturuldu! Bildirimler sayfasını kontrol edin.');
    } catch (error) {
      console.error('Error creating test notifications:', error);
      alert('Test bildirimleri oluşturulamadı.');
    }
  };

  const handleForceFileCleanup = async () => {
    try {
      await forceCleanup();
      alert('Dosya temizleme işlemi tamamlandı!');
    } catch (error) {
      console.error('Error during file cleanup:', error);
      alert('Dosya temizleme işlemi başarısız oldu.');
    }
  };

  const lastCleanupTime = getLastCleanupTime();

  // User statistics based on real data
  const userStats = stats ? [
    { label: 'Toplam Arkadaş', value: stats.friendCount.toString(), icon: Users, color: 'text-neon-green' },
    { label: 'Gönderilen Mesaj', value: stats.totalMessages.toLocaleString(), icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Seviye', value: stats.level.toString(), icon: Trophy, color: 'text-neon-orange' },
    { label: 'Oyun Süresi', value: formatActiveTime(stats.activeHours), icon: Clock, color: 'text-neon-pink' },
  ] : [
    { label: 'Toplam Arkadaş', value: '0', icon: Users, color: 'text-neon-green' },
    { label: 'Gönderilen Mesaj', value: '0', icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Seviye', value: '1', icon: Trophy, color: 'text-neon-orange' },
    { label: 'Oyun Süresi', value: '0 dakika', icon: Clock, color: 'text-neon-pink' },
  ];

  // Real conversation data from Firebase
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // Load real conversations
  useEffect(() => {
    if (!user?.uid) return;

    const loadConversations = async () => {
      try {
        setConversationsLoading(true);
        const conversations = await getUserConversations(user.uid);

        // Format conversations for display (limit to 3 most recent)
        const formattedConversations = conversations.slice(0, 3).map(conv => {
          // For direct conversations, show the other participant
          if (conv.type === 'direct') {
            const otherParticipant = conv.participantDetails.find(p => p.uid !== user.uid);
            return {
              id: conv.id,
              name: otherParticipant?.displayName || otherParticipant?.username || 'Kullanıcı',
              isVerified: otherParticipant?.isVerified || false,
              isOnline: otherParticipant?.isOnline || false,
              avatar: otherParticipant?.photoURL,
              lastMessage: conv.lastMessage?.content || 'Mesaj yok',
              time: formatTime(conv.lastMessage?.timestamp || conv.updatedAt),
              isSpecial: false
            };
          } else {
            // Group conversation
            return {
              id: conv.id,
              name: conv.name || 'Grup Sohbeti',
              isVerified: false,
              isOnline: true,
              avatar: conv.icon,
              lastMessage: conv.lastMessage?.content || 'Mesaj yok',
              time: formatTime(conv.lastMessage?.timestamp || conv.updatedAt),
              isSpecial: false
            };
          }
        });

        setRecentConversations(formattedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setRecentConversations([]);
      } finally {
        setConversationsLoading(false);
      }
    };

    loadConversations();
  }, [user?.uid]);

  // Helper function to format time
  const formatTime = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Şimdi';
      if (diffMinutes < 60) return `${diffMinutes} dk`;
      if (diffHours < 24) return `${diffHours} saat`;
      if (diffDays < 7) return `${diffDays} gün`;
      return date.toLocaleDateString('tr-TR');
    } catch {
      return 'Bilinmiyor';
    }
  };

  // Quick access actions
  const quickActions = [
    {
      title: 'Sesli Sohbete Gir',
      description: 'Anında sesli odaya katıl',
      icon: Headphones,
      color: 'from-neon-purple to-neon-cyan',
      href: '/chat',
      action: 'voice'
    },
    {
      title: 'Yeni Grup Oluştur',
      description: 'Arkadaşlarınla grup kur',
      icon: Plus,
      color: 'from-neon-green to-neon-cyan',
      href: '/chat',
      action: 'group'
    },
    {
      title: 'Yeni Arkadaş Ekle',
      description: 'Oyuncu topluluğunu genişlet',
      icon: UserPlus,
      color: 'from-neon-orange to-neon-pink',
      href: '/friends',
      action: 'add'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-purple/10 via-neon-cyan/10 to-neon-pink/10 p-8">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neon flex items-center space-x-2">
                <span>Hoş geldin, {user?.displayName || user?.username}!</span>
                {user?.username === 'LobbyXAdmin' && (
                  <Shield className="w-6 h-6 text-neon-cyan" />
                )}
                {statsLoading && (
                  <div className="w-5 h-5 border border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                )}
              </h1>
              <p className="text-gaming-muted">Bugün hangi maceraya atılacaksın?</p>
              {stats && (
                <div className="mt-3 flex items-center space-x-3 text-sm">
                  <span className="bg-neon-purple/20 text-neon-purple px-2 py-1 rounded-full">
                    Seviye {stats.level}
                  </span>
                  <span className="bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded-full">
                    {stats.totalXP.toLocaleString()} XP
                  </span>
                  {stats.rank > 0 && (
                    <span className="bg-neon-orange/20 text-neon-orange px-2 py-1 rounded-full">
                      #{stats.rank} Sırada
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* User Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {userStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`bg-gaming-surface/50 backdrop-blur-sm rounded-xl p-4 border border-gaming-border animate-scale-in hover:shadow-glow transition-all duration-300 ${
                    statsLoading ? 'opacity-50' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                  <div className="text-xl font-bold text-gaming-text">
                    {statsLoading ? '...' : stat.value}
                  </div>
                  <div className="text-xs text-gaming-muted">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-gaming-text mb-6 flex items-center space-x-2">
          <Star className="w-6 h-6 text-neon-orange" />
          <span>Hızlı Erişim</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="group relative overflow-hidden rounded-2xl p-6 bg-gaming-surface/30 border border-gaming-border hover:shadow-glow transition-all duration-500 animate-slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gaming-text group-hover:text-neon-cyan transition-colors">
                  {action.title}
                </h3>
                <p className="text-gaming-muted text-sm">{action.description}</p>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Conversations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gaming-text flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-neon-green" />
            <span>Son Konuşmalar</span>
          </h2>
          <Link
            to="/chat"
            className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {conversationsLoading ? (
            // Loading placeholders
            [1, 2, 3].map((index) => (
              <div key={index} className="card-glass animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gaming-surface rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gaming-surface rounded mb-2"></div>
                    <div className="h-3 bg-gaming-surface rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : recentConversations.length > 0 ? (
            recentConversations.map((conversation, index) => (
              <Link
                key={conversation.id}
                to="/chat"
                className="group card-glass hover:shadow-glow transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-neon-purple to-neon-cyan">
                      {conversation.avatar ? (
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium truncate text-gaming-text">
                        {conversation.name}
                      </h4>
                      {conversation.isVerified && (
                        <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gaming-muted truncate">{conversation.lastMessage}</p>
                    <span className="text-xs text-gaming-muted">{conversation.time}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // No conversations placeholder
            <div className="col-span-full text-center py-8">
              <Users className="w-12 h-12 text-gaming-muted mx-auto mb-4" />
              <p className="text-gaming-muted">Henüz sohbet geçmişin yok</p>
              <p className="text-sm text-gaming-muted">Arkadaşlarınla sohbet etmeye başla!</p>
            </div>
          )}
        </div>
      </section>

      {/* Activity Feed Preview */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gaming-text flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-neon-orange" />
            <span>Son Aktiviteler</span>
          </h2>
          <Link
            to="/notifications"
            className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="space-y-4">
          <div className="card-glass hover:shadow-3d transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-neon-green" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gaming-text">Yeni arkadaş eklendi</h4>
                <p className="text-sm text-gaming-muted">ProGamer123 arkadaş listene eklendi</p>
              </div>
              <span className="text-xs text-gaming-muted">5 dk önce</span>
            </div>
          </div>

          <div className="card-glass hover:shadow-3d transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-neon-cyan/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gaming-text">LobbyX Resmi Sunucu</h4>
                <p className="text-sm text-gaming-muted">Sunucuya davet edildiniz</p>
              </div>
              <span className="text-xs text-gaming-muted">15 dk önce</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Test Section - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <section className="card-glass">
          <h2 className="text-xl font-bold text-gaming-text mb-4">🧪 Geliştirici Araçları</h2>
          <div className="space-y-3">
            <p className="text-gaming-muted text-sm">
              Test bildirimleri oluşturmak için aşağıdaki butonu kullanın:
            </p>
            <button
              onClick={handleCreateTestNotifications}
              className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors text-sm"
            >
              Test Bildirimleri Oluştur
            </button>
            <button
              onClick={handleForceFileCleanup}
              className="px-4 py-2 bg-neon-orange/20 text-neon-orange rounded-lg hover:bg-neon-orange/30 transition-colors text-sm"
            >
              Dosya Temizleme Yap
            </button>
            {lastCleanupTime && (
              <p className="text-xs text-gaming-muted">
                Son temizlik: {lastCleanupTime.toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
