import React, { useState } from 'react';
import {
  Bell,
  Check,
  Users,
  MessageSquare,
  Shield,
  Trophy,
  Settings,
  Trash2,
  CheckCircle,
  X,
  User,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'message' | 'friend_request' | 'group_invite' | 'system' | 'achievement';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  senderName?: string;
  isSpecial?: boolean;
}

export default function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    friendRequests: true,
    groupInvites: false,
    systemUpdates: true
  });

  // Load notification settings
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('lobbyx-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setNotificationSettings(parsedSettings.notifications || notificationSettings);
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }, []);
  
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'system',
      title: 'LobbyX Resmi Sunucu',
      content: 'LobbyX platformuna hoş geldiniz! Sunucumuza katıldığınız için teşekkürler.',
      timestamp: '5 dk önce',
      isRead: false,
      senderName: 'LobbyXAdmin',
      isSpecial: true
    },
    {
      id: '2',
      type: 'friend_request',
      title: 'Yeni arkadaşlık isteği',
      content: 'ProGamer123 size arkadaşlık isteği gönderdi.',
      timestamp: '15 dk önce',
      isRead: false,
      senderName: 'ProGamer123'
    },
    {
      id: '3',
      type: 'message',
      title: 'Yeni mesaj',
      content: 'GameMaster: Bu akşam CS2 turnuvası var, katılmak ister misin?',
      timestamp: '1 saat önce',
      isRead: true,
      senderName: 'GameMaster'
    },
    {
      id: '4',
      type: 'group_invite',
      title: 'Grup davet',
      content: 'Valorant Takımı grubuna davet edildiniz.',
      timestamp: '2 saat önce',
      isRead: false,
      senderName: 'SpeedRunner'
    },
    {
      id: '5',
      type: 'achievement',
      title: 'Yeni başarım',
      content: 'İlk 50 mesajınızı tamamladınız! "Sohbet Ustası" başarımını kazandınız.',
      timestamp: '1 gün önce',
      isRead: true
    },
    {
      id: '6',
      type: 'system',
      title: 'Sistem güncellemesi',
      content: 'LobbyX v2.1 güncellemesi yayınlandı. Yeni özellikler ve iyileştirmeler mevcut.',
      timestamp: '2 gün önce',
      isRead: true,
      isSpecial: true
    }
  ]);

  const getNotificationIcon = (type: string, isSpecial?: boolean) => {
    const iconClass = isSpecial ? 'text-neon-cyan' : 'text-gaming-muted';
    
    switch (type) {
      case 'message':
        return <MessageSquare className={`w-5 h-5 ${iconClass}`} />;
      case 'friend_request':
        return <Users className={`w-5 h-5 ${iconClass}`} />;
      case 'group_invite':
        return <Users className={`w-5 h-5 ${iconClass}`} />;
      case 'system':
        return <Shield className={`w-5 h-5 ${iconClass}`} />;
      case 'achievement':
        return <Trophy className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getNotificationColor = (type: string, isSpecial?: boolean) => {
    if (isSpecial) return 'bg-neon-cyan/10 border-neon-cyan/30';
    
    switch (type) {
      case 'message':
        return 'bg-neon-purple/10';
      case 'friend_request':
        return 'bg-neon-green/10';
      case 'group_invite':
        return 'bg-neon-orange/10';
      case 'system':
        return 'bg-neon-cyan/10';
      case 'achievement':
        return 'bg-neon-pink/10';
      default:
        return 'bg-gaming-surface/10';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gaming-text flex items-center space-x-2">
          <Bell className="w-8 h-8 text-neon-orange" />
          <span>Bildirimler</span>
          {unreadCount > 0 && (
            <span className="bg-neon-purple text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h1>
        
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Tümünü Okundu İşaretle</span>
            </button>
          )}
          
          <button
            onClick={clearAllNotifications}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tümünü Temizle</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gaming-surface/30 rounded-xl p-1 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            filter === 'all'
              ? 'bg-neon-purple text-white shadow-glow'
              : 'text-gaming-muted hover:text-gaming-text hover:bg-gaming-surface/50'
          }`}
        >
          Tümü ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            filter === 'unread'
              ? 'bg-neon-purple text-white shadow-glow'
              : 'text-gaming-muted hover:text-gaming-text hover:bg-gaming-surface/50'
          }`}
        >
          Okunmamış ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative card-glass transition-all duration-300 hover:shadow-glow ${
                !notification.isRead ? 'border-l-4 border-l-neon-purple' : ''
              } ${getNotificationColor(notification.type, notification.isSpecial)}`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  notification.isSpecial 
                    ? 'bg-neon-cyan/20' 
                    : 'bg-gaming-surface'
                }`}>
                  {getNotificationIcon(notification.type, notification.isSpecial)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium ${
                      notification.isSpecial ? 'text-neon-cyan' : 'text-gaming-text'
                    }`}>
                      {notification.title}
                    </h3>
                    {notification.isSpecial && (
                      <div className="flex items-center justify-center w-4 h-4 bg-neon-cyan rounded-full">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
                    )}
                  </div>
                  
                  <p className="text-gaming-muted mt-1">{notification.content}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gaming-muted flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{notification.timestamp}</span>
                    </span>
                    
                    {notification.senderName && (
                      <span className="text-xs text-gaming-muted flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{notification.senderName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 rounded-lg hover:bg-neon-green/20 transition-colors"
                      title="Okundu İşaretle"
                    >
                      <Check className="w-4 h-4 text-neon-green" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Bildirimi Sil"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Action buttons for specific notification types */}
              {notification.type === 'friend_request' && !notification.isRead && (
                <div className="mt-4 flex space-x-3 pt-4 border-t border-gaming-border">
                  <button className="px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors text-sm">
                    Kabul Et
                  </button>
                  <button className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-sm">
                    Reddet
                  </button>
                </div>
              )}

              {notification.type === 'group_invite' && !notification.isRead && (
                <div className="mt-4 flex space-x-3 pt-4 border-t border-gaming-border">
                  <button className="px-4 py-2 bg-neon-cyan text-white rounded-lg hover:bg-neon-cyan/80 transition-colors text-sm">
                    Gruba Katıl
                  </button>
                  <button className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-sm">
                    Reddet
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gaming-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gaming-text mb-2">
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Bildirim bulunmuyor'}
            </h3>
            <p className="text-gaming-muted">
              {filter === 'unread' 
                ? 'Tüm bildirimleriniz okunmuş.' 
                : 'Henüz herhangi bir bildiriminiz bulunmuyor.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Settings */}
      <div className="card-glass">
        <h3 className="text-lg font-semibold text-gaming-text mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Bildirim Ayarları</span>
        </h3>
        
        <div className="text-gaming-muted">
          <p>Bildirim tercihlerinizi ayarlamak için Ayarlar sayfasını ziyaret edin.</p>
          <button className="mt-2 text-neon-cyan hover:text-neon-purple transition-colors">
            Ayarlara Git →
          </button>
        </div>
      </div>
    </div>
  );
}
