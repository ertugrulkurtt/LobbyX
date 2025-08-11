import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Trophy,
  Shield,
  Crown,
  Star,
  Activity,
  UserPlus,
  UserMinus,
  Settings
} from 'lucide-react';
import { RealUser } from '../lib/userService';
import { getUserStats, UserStats as UserStatsType } from '../lib/userStats';

interface UserProfileModalProps {
  user: RealUser | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onSendMessage?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  onRemoveFriend?: (userId: string) => void;
  isFriend?: boolean;
}

interface DisplayUserStats {
  level: number;
  totalXP: number;
  messagesCount: number;
  voiceMinutes: number;
  joinDate: string;
  lastSeen: string;
  serversCount: number;
  friendsCount: number;
  achievements: number;
}

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
  currentUserId,
  onSendMessage,
  onAddFriend,
  onRemoveFriend,
  isFriend = false
}: UserProfileModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadUserStats();
    }
  }, [user, isOpen]);

  const loadUserStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const stats = await getUserStats(user.uid);
      setUserStats({
        level: stats?.level || 1,
        totalXP: stats?.totalXP || 0,
        messagesCount: stats?.messagesCount || 0,
        voiceMinutes: stats?.voiceMinutes || 0,
        joinDate: user.joinDate || new Date().toISOString(),
        lastSeen: user.lastSeen || new Date().toISOString(),
        serversCount: 0, // You can implement this
        friendsCount: 0, // You can implement this
        achievements: stats?.achievements || []
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Bilinmiyor';
    }
  };

  const formatLastSeen = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'Şimdi';
      if (minutes < 60) return `${minutes} dakika önce`;
      if (hours < 24) return `${hours} saat önce`;
      return `${days} gün önce`;
    } catch {
      return 'Bilinmiyor';
    }
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-neon-green' : 'bg-gray-500';
  };

  const getStatusText = (isOnline: boolean) => {
    return isOnline ? 'Çevrimiçi' : 'Çevrimdışı';
  };

  if (!isOpen || !user) return null;

  const isOwnProfile = user.uid === currentUserId;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gaming-surface rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gaming-border">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gaming-surface/50 transition-colors"
          >
            <X className="w-5 h-5 text-gaming-muted" />
          </button>

          {/* Profile Picture and Status */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.username}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getStatusColor(user.isOnline)} rounded-full border-2 border-gaming-surface`}></div>
            </div>

            {/* User Name and Tag */}
            <div className="mb-2">
              <h2 className="text-xl font-bold text-gaming-text flex items-center gap-2">
                {user.displayName || user.username}
                {user.isVerified && (
                  <div className="flex items-center justify-center w-5 h-5 bg-neon-cyan rounded-full">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </h2>
              <p className="text-gaming-muted">@{user.username}</p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 ${getStatusColor(user.isOnline)} rounded-full`}></div>
              <span className="text-sm text-gaming-muted">{getStatusText(user.isOnline)}</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div className="px-6 py-4 border-b border-gaming-border">
            <h3 className="text-sm font-medium text-gaming-text mb-2">Hakkında</h3>
            <p className="text-sm text-gaming-muted">{user.bio}</p>
          </div>
        )}

        {/* Game Status */}
        {user.gameStatus && (
          <div className="px-6 py-4 border-b border-gaming-border">
            <h3 className="text-sm font-medium text-gaming-text mb-2">Şu an Oynuyor</h3>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-gaming-text">{user.gameStatus.game}</span>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="px-6 py-4 border-b border-gaming-border">
          <h3 className="text-sm font-medium text-gaming-text mb-3">İstatistikler</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="w-4 h-4 text-neon-orange mr-1" />
                  <span className="text-lg font-bold text-gaming-text">{userStats.level}</span>
                </div>
                <p className="text-xs text-gaming-muted">Seviye</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-neon-yellow mr-1" />
                  <span className="text-lg font-bold text-gaming-text">{userStats.totalXP}</span>
                </div>
                <p className="text-xs text-gaming-muted">Toplam XP</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-neon-cyan mr-1" />
                  <span className="text-lg font-bold text-gaming-text">{userStats.messagesCount}</span>
                </div>
                <p className="text-xs text-gaming-muted">Mesaj</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-neon-purple mr-1" />
                  <span className="text-lg font-bold text-gaming-text">{Math.floor(userStats.voiceMinutes / 60)}s</span>
                </div>
                <p className="text-xs text-gaming-muted">Ses Sohbeti</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gaming-muted text-center">İstatistikler yüklenemedi</p>
          )}
        </div>

        {/* Member Since & Last Seen */}
        <div className="px-6 py-4 border-b border-gaming-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gaming-muted" />
              <span className="text-sm text-gaming-muted">Üye olma:</span>
              <span className="text-sm text-gaming-text">{userStats ? formatDate(userStats.joinDate) : 'Yükleniyor...'}</span>
            </div>
            
            {!user.isOnline && userStats && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gaming-muted" />
                <span className="text-sm text-gaming-muted">Son görülme:</span>
                <span className="text-sm text-gaming-text">{formatLastSeen(userStats.lastSeen)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="p-6">
            <div className="flex gap-3">
              {onSendMessage && (
                <button
                  onClick={() => onSendMessage(user.uid)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Mesaj Gönder
                </button>
              )}
              
              {isFriend ? (
                onRemoveFriend && (
                  <button
                    onClick={() => onRemoveFriend(user.uid)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                    Arkadaşlıktan Çıkar
                  </button>
                )
              ) : (
                onAddFriend && (
                  <button
                    onClick={() => onAddFriend(user.uid)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Arkadaş Ekle
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Settings for own profile */}
        {isOwnProfile && (
          <div className="p-6">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg hover:bg-gaming-surface/80 transition-colors">
              <Settings className="w-4 h-4" />
              Profili Düzenle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
