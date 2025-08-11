import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// User statistics interface
export interface UserStats {
  userId: string;
  totalMessages: number;
  friendCount: number;
  activeHours: number; // in minutes, we'll convert to hours for display
  achievements: number;
  joinDate: string;
  lastActivity: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  weeklyXP: number;
  monthlyXP: number;
  rank: number;
  gamesPlayed: number;
  gameWins: number;
  favoriteGames: string[];
  dailyStreak: number;
  lastLoginDate: string;
  voiceChannelTime: number; // in minutes
  serversJoined: number;
  eventsParticipated: number;
}

// Daily activity tracking
export interface DailyActivity {
  userId: string;
  date: string; // YYYY-MM-DD format
  messagesCount: number;
  voiceTime: number; // in minutes
  gamesPlayed: number;
  xpEarned: number;
  activeTime: number; // in minutes
}

// Message statistics for each conversation
export interface MessageStats {
  conversationId: string;
  userId: string;
  messageCount: number;
  lastMessageDate: string;
  characterCount: number;
}

// Achievement progress tracking
export interface AchievementProgress {
  userId: string;
  achievementId: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
}

// XP calculation constants
export const XP_REWARDS = {
  MESSAGE_SENT: 5,
  VOICE_MINUTE: 2,
  FRIEND_ADDED: 10,
  GAME_WIN: 25,
  DAILY_LOGIN: 10,
  EVENT_PARTICIPATION: 50,
  ACHIEVEMENT_UNLOCK: 100,
  SERVER_JOIN: 15
};

// Level requirements
export const LEVEL_REQUIREMENTS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, // 0-10
  3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450, 11500, // 11-20
  12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200, 24750 // 21-30
];

/**
 * Get user statistics from Firestore
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    if (userStatsDoc.exists()) {
      const data = userStatsDoc.data() as UserStats;
      
      // Calculate current level and XP to next level
      const level = calculateLevel(data.totalXP);
      const xpToNextLevel = calculateXPToNextLevel(data.totalXP);
      
      return {
        ...data,
        level,
        xpToNextLevel
      };
    } else {
      // Initialize stats for new user
      const initialStats: UserStats = {
        userId,
        totalMessages: 0,
        friendCount: 0,
        activeHours: 0,
        achievements: 0,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        level: 1,
        xp: 0,
        xpToNextLevel: LEVEL_REQUIREMENTS[1],
        totalXP: 0,
        weeklyXP: 0,
        monthlyXP: 0,
        rank: 0,
        gamesPlayed: 0,
        gameWins: 0,
        favoriteGames: [],
        dailyStreak: 0,
        lastLoginDate: new Date().toISOString().split('T')[0],
        voiceChannelTime: 0,
        serversJoined: 0,
        eventsParticipated: 0
      };
      
      await setDoc(userStatsRef, initialStats);
      return initialStats;
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Update user statistics
 */
export const updateUserStats = async (userId: string, updates: Partial<UserStats>) => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    await updateDoc(userStatsRef, {
      ...updates,
      lastActivity: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

/**
 * Add XP to user and track daily/weekly/monthly totals
 */
export const addXP = async (userId: string, xpAmount: number, source: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentWeek = getWeekNumber(new Date());
    const currentMonth = new Date().getMonth();
    
    // Update user stats
    const userStatsRef = doc(db, 'userStats', userId);
    await updateDoc(userStatsRef, {
      totalXP: increment(xpAmount),
      weeklyXP: increment(xpAmount),
      monthlyXP: increment(xpAmount),
      lastActivity: new Date().toISOString()
    });
    
    // Track daily activity
    await updateDailyActivity(userId, today, { xpEarned: xpAmount });
    
    // Log XP gain
    await addDoc(collection(db, 'xpLogs'), {
      userId,
      amount: xpAmount,
      source,
      timestamp: new Date().toISOString(),
      date: today
    });
    
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
};

/**
 * Increment message count and award XP
 */
export const incrementMessageCount = async (userId: string, conversationId?: string) => {
  try {
    // Update total message count
    const userStatsRef = doc(db, 'userStats', userId);
    await updateDoc(userStatsRef, {
      totalMessages: increment(1),
      lastActivity: new Date().toISOString()
    });
    
    // Track message stats for conversation
    if (conversationId) {
      const messageStatsRef = doc(db, 'messageStats', `${userId}_${conversationId}`);
      const messageStatsDoc = await getDoc(messageStatsRef);
      
      if (messageStatsDoc.exists()) {
        await updateDoc(messageStatsRef, {
          messageCount: increment(1),
          lastMessageDate: new Date().toISOString()
        });
      } else {
        await setDoc(messageStatsRef, {
          conversationId,
          userId,
          messageCount: 1,
          lastMessageDate: new Date().toISOString(),
          characterCount: 0
        });
      }
    }
    
    // Award XP for message
    await addXP(userId, XP_REWARDS.MESSAGE_SENT, 'message_sent');
    
    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    await updateDailyActivity(userId, today, { messagesCount: 1 });
    
  } catch (error) {
    console.error('Error incrementing message count:', error);
    throw error;
  }
};

/**
 * Update friend count
 */
export const updateFriendCount = async (userId: string, increment_: boolean = true) => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    await updateDoc(userStatsRef, {
      friendCount: increment(increment_ ? 1 : -1),
      lastActivity: new Date().toISOString()
    });
    
    if (increment_) {
      await addXP(userId, XP_REWARDS.FRIEND_ADDED, 'friend_added');
    }
  } catch (error) {
    console.error('Error updating friend count:', error);
    throw error;
  }
};

/**
 * Track voice channel time
 */
export const trackVoiceTime = async (userId: string, minutes: number) => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    await updateDoc(userStatsRef, {
      voiceChannelTime: increment(minutes),
      activeHours: increment(minutes),
      lastActivity: new Date().toISOString()
    });
    
    // Award XP for voice time
    const xpAmount = Math.floor(minutes * XP_REWARDS.VOICE_MINUTE);
    if (xpAmount > 0) {
      await addXP(userId, xpAmount, 'voice_activity');
    }
    
    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    await updateDailyActivity(userId, today, { voiceTime: minutes, activeTime: minutes });
    
  } catch (error) {
    console.error('Error tracking voice time:', error);
    throw error;
  }
};

/**
 * Update daily activity
 */
export const updateDailyActivity = async (userId: string, date: string, updates: Partial<DailyActivity>) => {
  try {
    const dailyActivityRef = doc(db, 'dailyActivity', `${userId}_${date}`);
    const dailyActivityDoc = await getDoc(dailyActivityRef);
    
    if (dailyActivityDoc.exists()) {
      const currentData = dailyActivityDoc.data() as DailyActivity;
      await updateDoc(dailyActivityRef, {
        messagesCount: increment(updates.messagesCount || 0),
        voiceTime: increment(updates.voiceTime || 0),
        gamesPlayed: increment(updates.gamesPlayed || 0),
        xpEarned: increment(updates.xpEarned || 0),
        activeTime: increment(updates.activeTime || 0)
      });
    } else {
      await setDoc(dailyActivityRef, {
        userId,
        date,
        messagesCount: updates.messagesCount || 0,
        voiceTime: updates.voiceTime || 0,
        gamesPlayed: updates.gamesPlayed || 0,
        xpEarned: updates.xpEarned || 0,
        activeTime: updates.activeTime || 0
      });
    }
  } catch (error) {
    console.error('Error updating daily activity:', error);
    throw error;
  }
};

/**
 * Get leaderboard data
 */
export const getLeaderboard = async (limit_: number = 10) => {
  try {
    const q = query(
      collection(db, 'userStats'),
      orderBy('totalXP', 'desc'),
      limit(limit_)
    );
    
    const querySnapshot = await getDocs(q);
    const leaderboard = querySnapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data()
    }));
    
    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

/**
 * Calculate level based on total XP
 */
export const calculateLevel = (totalXP: number): number => {
  for (let level = LEVEL_REQUIREMENTS.length - 1; level >= 0; level--) {
    if (totalXP >= LEVEL_REQUIREMENTS[level]) {
      return level;
    }
  }
  return 1;
};

/**
 * Calculate XP needed to reach next level
 */
export const calculateXPToNextLevel = (totalXP: number): number => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = currentLevel + 1;
  
  if (nextLevel >= LEVEL_REQUIREMENTS.length) {
    return 0; // Max level reached
  }
  
  return LEVEL_REQUIREMENTS[nextLevel] - totalXP;
};

/**
 * Get current week number
 */
function getWeekNumber(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil(days / 7);
}

/**
 * Calculate user rank based on total XP
 */
export const calculateUserRank = async (userId: string): Promise<number> => {
  try {
    const userStats = await getUserStats(userId);
    const q = query(
      collection(db, 'userStats'),
      where('totalXP', '>', userStats.totalXP)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size + 1; // Rank is number of users with higher XP + 1
  } catch (error) {
    console.error('Error calculating user rank:', error);
    return 0;
  }
};

/**
 * Listen to real-time user stats updates
 */
export const subscribeToUserStats = (userId: string, callback: (stats: UserStats) => void) => {
  const userStatsRef = doc(db, 'userStats', userId);
  
  return onSnapshot(userStatsRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as UserStats;
      const level = calculateLevel(data.totalXP);
      const xpToNextLevel = calculateXPToNextLevel(data.totalXP);
      
      callback({
        ...data,
        level,
        xpToNextLevel
      });
    }
  });
};

/**
 * Track daily login and award streak bonus
 */
export const trackDailyLogin = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userStats = await getUserStats(userId);
    
    const lastLoginDate = userStats.lastLoginDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    if (lastLoginDate === yesterdayStr) {
      // Continuing streak
      newStreak = userStats.dailyStreak + 1;
    } else if (lastLoginDate !== today) {
      // Reset streak if more than 1 day gap
      newStreak = 1;
    } else {
      // Already logged in today
      return;
    }
    
    // Update stats
    await updateUserStats(userId, {
      dailyStreak: newStreak,
      lastLoginDate: today
    });
    
    // Award daily login XP
    await addXP(userId, XP_REWARDS.DAILY_LOGIN, 'daily_login');
    
    // Streak bonus XP
    if (newStreak >= 7) {
      await addXP(userId, XP_REWARDS.DAILY_LOGIN * 2, 'weekly_streak_bonus');
    }
    
  } catch (error) {
    console.error('Error tracking daily login:', error);
    throw error;
  }
};

export default {
  getUserStats,
  updateUserStats,
  addXP,
  incrementMessageCount,
  updateFriendCount,
  trackVoiceTime,
  getLeaderboard,
  calculateLevel,
  calculateXPToNextLevel,
  calculateUserRank,
  subscribeToUserStats,
  trackDailyLogin,
  XP_REWARDS,
  LEVEL_REQUIREMENTS
};
