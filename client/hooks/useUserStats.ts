import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserStats, 
  subscribeToUserStats, 
  trackDailyLogin,
  incrementMessageCount,
  updateFriendCount,
  trackVoiceTime,
  calculateUserRank,
  UserStats 
} from '../lib/userStats';

export interface UseUserStatsReturn {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  incrementMessages: (conversationId?: string) => Promise<void>;
  addFriend: () => Promise<void>;
  removeFriend: () => Promise<void>;
  trackVoice: (minutes: number) => Promise<void>;
  formatActiveTime: (minutes: number) => string;
  formatJoinDate: (isoDate: string) => string;
  formatLastActivity: (isoDate: string) => string;
}

export const useUserStats = (): UseUserStatsReturn => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize stats and set up real-time subscription
  useEffect(() => {
    if (!user?.uid) {
      setStats(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initializeStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Track daily login when component mounts (non-blocking)
        trackDailyLogin(user.uid).catch(err => {
          console.warn('Daily login tracking failed:', err);
        });

        // Get initial stats
        const initialStats = await getUserStats(user.uid);

        // Calculate and update rank (non-blocking for better UX)
        calculateUserRank(user.uid)
          .then(rank => {
            setStats(prevStats => prevStats ? { ...prevStats, rank } : null);
          })
          .catch(err => {
            console.warn('Rank calculation failed:', err);
          });

        setStats(initialStats);

        // Set up real-time subscription
        unsubscribe = subscribeToUserStats(user.uid, async (updatedStats) => {
          console.log('Stats updated:', updatedStats);
          setStats(updatedStats);

          // Recalculate rank (non-blocking)
          calculateUserRank(user.uid)
            .then(newRank => {
              setStats(prevStats => prevStats ? { ...prevStats, rank: newRank } : null);
            })
            .catch(err => {
              console.warn('Rank recalculation failed:', err);
            });
        });

      } catch (err: any) {
        console.error('Error initializing user stats:', err);

        if (err.message?.includes('izin')) {
          setError('İstatistiklere erişim izni yok. Firebase kurallarını kontrol edin.');
        } else if (err.message?.includes('giriş')) {
          setError('Kullanıcı girişi gerekli. Lütfen tekrar giriş yapın.');
        } else {
          setError(err.message || 'İstatistikler yüklenemedi');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeStats();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  // Refresh stats manually
  const refreshStats = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      const freshStats = await getUserStats(user.uid);
      const rank = await calculateUserRank(user.uid);
      setStats({ ...freshStats, rank });
    } catch (err) {
      console.error('Error refreshing stats:', err);
      setError('İstatistikler yenilenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Increment message count
  const incrementMessages = async (conversationId?: string) => {
    if (!user?.uid) return;

    try {
      await incrementMessageCount(user.uid, conversationId);
    } catch (err) {
      console.error('Error incrementing message count:', err);
    }
  };

  // Add friend
  const addFriend = async () => {
    if (!user?.uid) return;

    try {
      await updateFriendCount(user.uid, true);
    } catch (err) {
      console.error('Error adding friend:', err);
    }
  };

  // Remove friend
  const removeFriend = async () => {
    if (!user?.uid) return;

    try {
      await updateFriendCount(user.uid, false);
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };

  // Track voice time
  const trackVoice = async (minutes: number) => {
    if (!user?.uid || minutes <= 0) return;

    try {
      await trackVoiceTime(user.uid, minutes);
    } catch (err) {
      console.error('Error tracking voice time:', err);
    }
  };

  // Format active time from minutes to human readable format
  const formatActiveTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} dakika`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      return remainingMinutes > 0 
        ? `${hours} saat ${remainingMinutes} dakika`
        : `${hours} saat`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days < 30) {
      return remainingHours > 0
        ? `${days} gün ${remainingHours} saat`
        : `${days} gün`;
    }
    
    // For very long times, show in months
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    
    return remainingDays > 0
      ? `${months} ay ${remainingDays} gün`
      : `${months} ay`;
  };

  // Format join date
  const formatJoinDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Bilinmiyor';
    }
  };

  // Format last activity
  const formatLastActivity = (isoDate: string): string => {
    try {
      const now = new Date();
      const activityDate = new Date(isoDate);
      const diffMs = now.getTime() - activityDate.getTime();
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) {
        return 'Şimdi';
      } else if (diffMinutes < 60) {
        return `${diffMinutes} dakika önce`;
      } else if (diffHours < 24) {
        return `${diffHours} saat önce`;
      } else if (diffDays < 30) {
        return `${diffDays} gün önce`;
      } else {
        return activityDate.toLocaleDateString('tr-TR');
      }
    } catch {
      return 'Bilinmiyor';
    }
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
    incrementMessages,
    addFriend,
    removeFriend,
    trackVoice,
    formatActiveTime,
    formatJoinDate,
    formatLastActivity
  };
};

export default useUserStats;
