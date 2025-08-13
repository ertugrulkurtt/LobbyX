import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Clock,
  Heart,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { deleteNotification } from '../lib/notificationService';
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../lib/userService';

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, counts, loading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-neon-purple" />;
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-neon-green" />;
      case 'friend_accepted':
        return <Heart className="w-5 h-5 text-neon-pink" />;
      case 'group_invite':
        return <Users className="w-5 h-5 text-neon-orange" />;
      case 'server_invite':
        return <Shield className="w-5 h-5 text-neon-cyan" />;
      case 'mention':
        return <MessageSquare className="w-5 h-5 text-neon-blue" />;
      default:
        return <Bell className="w-5 h-5 text-gaming-muted" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-neon-purple/10';
      case 'friend_request':
        return 'bg-neon-green/10';
      case 'friend_accepted':
        return 'bg-neon-pink/10';
      case 'group_invite':
        return 'bg-neon-orange/10';
      case 'server_invite':
        return 'bg-neon-cyan/10';
      case 'mention':
        return 'bg-neon-blue/10';
      default:
        return 'bg-gaming-surface/10';
    }
  };

  const formatTime = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'Şimdi';
      if (diffMinutes < 60) return `${diffMinutes} dk önce`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} saat önce`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} gün önce`;
      
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return '';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleAcceptFriendRequest = async (notification: any) => {
    if (!notification.relatedUserId) return;

    try {
      // Get the friend request ID from the database
      const friendRequests = await getFriendRequests(user?.uid || '');
      const friendRequest = friendRequests.incoming.find(
        req => req.fromUserId === notification.relatedUserId && req.status === 'pending'
      );

      if (friendRequest) {
        await acceptFriendRequest(friendRequest.id);
        // Mark notification as read
        await handleMarkAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Arkadaşlık isteği kabul edilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleRejectFriendRequest = async (notification: any) => {
    if (!notification.relatedUserId) return;

    try {
      // Get the friend request ID from the database
      const friendRequests = await getFriendRequests(user?.uid || '');
      const friendRequest = friendRequests.incoming.find(
        req => req.fromUserId === notification.relatedUserId && req.status === 'pending'
      );

      if (friendRequest) {
        await rejectFriendRequest(friendRequest.id);
        // Mark notification as read
        await handleMarkAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Arkadaşlık isteği reddedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to the appropriate page
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case 'message':
          if (notification.conversationId) {
            navigate(`/chat?conversation=${notification.conversationId}`);
          } else {
            navigate('/chat');
          }
          break;
        case 'friend_request':
        case 'friend_accepted':
          navigate('/friends');
          break;
        case 'group_invite':
          navigate('/groups');
          break;
        case 'server_invite':
          navigate('/servers');
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
        <span className="ml-2 text-gaming-text">Bildirimler yükleniyor...</span>
      </div>
    );
  }

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
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Tümünü Okundu İşaretle</span>
            </button>
          )}
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
              className={`group relative card-glass transition-all duration-300 hover:shadow-glow cursor-pointer ${
                !notification.isRead ? 'border-l-4 border-l-neon-purple' : ''
              } ${getNotificationColor(notification.type)}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gaming-surface`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Avatar if available */}
                {notification.relatedUserAvatar && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-neon-purple to-neon-cyan">
                    <img
                      src={notification.relatedUserAvatar}
                      alt={notification.relatedUserName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gaming-text">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
                    )}
                  </div>
                  
                  <p className="text-gaming-muted mt-1">{notification.message}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gaming-muted flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(notification.createdAt)}</span>
                    </span>
                    
                    {notification.relatedUserName && (
                      <span className="text-xs text-gaming-muted flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{notification.relatedUserName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div 
                  className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 rounded-lg hover:bg-neon-green/20 transition-colors"
                      title="Okundu İşaretle"
                    >
                      <Check className="w-4 h-4 text-neon-green" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Bildirimi Sil"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Action buttons for friend requests */}
              {notification.type === 'friend_request' && !notification.isRead && (
                <div className="mt-4 flex space-x-3 pt-4 border-t border-gaming-border" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleAcceptFriendRequest(notification)}
                    className="px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors text-sm"
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={() => handleRejectFriendRequest(notification)}
                    className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-sm"
                  >
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
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span>Toplam bildirim: </span>
              <span className="text-neon-cyan font-medium">
                {counts.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mesaj bildirimleri: </span>
              <span className="text-neon-purple font-medium">
                {counts.messages}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Arkadaş istekleri: </span>
              <span className="text-neon-green font-medium">
                {counts.friendRequests}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Diğer bildirimler: </span>
              <span className="text-neon-orange font-medium">
                {counts.others}
              </span>
            </div>
          </div>
          <Link
            to="/settings"
            className="mt-4 inline-block text-neon-cyan hover:text-neon-purple transition-colors"
          >
            Ayarlara Git →
          </Link>
        </div>
      </div>
    </div>
  );
}
