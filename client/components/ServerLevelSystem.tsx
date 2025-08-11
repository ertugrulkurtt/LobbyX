import React, { useState } from 'react';
import {
  TrendingUp,
  Star,
  Trophy,
  Award,
  Crown,
  Zap,
  Target,
  Shield,
  Gem,
  Users,
  MessageSquare,
  Clock,
  Calendar,
  Gift,
  Lock,
  Unlock,
  ChevronRight,
  BarChart3,
  Activity,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from '../hooks/useUserStats';
import BadgeSystem, { Badge } from './BadgeSystem';

export interface UserLevel {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  title?: string;
  perks: string[];
  badges: string[];
  achievements: string[];
  weeklyXP: number;
  monthlyXP: number;
  rank: number; // Server rank position
  prestige: number;
}

export interface LevelReward {
  level: number;
  xpRequired: number;
  title?: string;
  badge?: string;
  perks: string[];
  unlocks: string[];
  specialReward?: {
    type: 'role' | 'channel' | 'feature' | 'cosmetic';
    name: string;
    description: string;
  };
}

// XP Sources
export interface XPSource {
  action: string;
  xp: number;
  description: string;
  cooldown?: number; // in minutes
  dailyLimit?: number;
}

const xpSources: XPSource[] = [
  { action: 'message', xp: 5, description: 'Mesaj gönderme', cooldown: 1, dailyLimit: 500 },
  { action: 'voice_join', xp: 10, description: 'Sesli sohbete katılma' },
  { action: 'voice_minute', xp: 2, description: 'Sesli sohbette dakika başı', dailyLimit: 120 },
  { action: 'reaction', xp: 1, description: 'Tepki verme', dailyLimit: 50 },
  { action: 'invite', xp: 100, description: 'Sunucuya birini davet etme' },
  { action: 'event_join', xp: 50, description: 'Etkinliğe katılma' },
  { action: 'poll_create', xp: 25, description: 'Anket oluşturma' },
  { action: 'poll_vote', xp: 10, description: 'Ankete oy verme' },
  { action: 'game_activity', xp: 15, description: 'Oyun aktivitesi', cooldown: 30 },
  { action: 'daily_login', xp: 20, description: 'Günlük giriş' },
  { action: 'weekly_challenge', xp: 200, description: 'Haftalık meydan okuma' },
  { action: 'tournament_win', xp: 500, description: 'Turnuva kazanma' },
  { action: 'tournament_participate', xp: 100, description: 'Turnuvaya katılma' }
];

// Level rewards configuration
const levelRewards: LevelReward[] = [
  {
    level: 5,
    xpRequired: 500,
    title: 'Acemi',
    perks: ['Özel emoji kullanımı'],
    unlocks: ['Reaction permissions']
  },
  {
    level: 10,
    xpRequired: 1500,
    title: 'Aktif Üye',
    badge: 'active-member',
    perks: ['Özel kanal erişimi', 'Renk seçimi'],
    unlocks: ['Color role selection'],
    specialReward: {
      type: 'channel',
      name: 'VIP Sohbet',
      description: 'Sadece Level 10+ üyeler için özel kanal'
    }
  },
  {
    level: 15,
    xpRequired: 3000,
    title: 'Düzenli',
    perks: ['Nickname değiştirme', 'Özel ses efektleri'],
    unlocks: ['Change nickname permission']
  },
  {
    level: 20,
    xpRequired: 5000,
    title: 'Deneyimli',
    badge: 'experienced',
    perks: ['Mesaj pinleme', 'Slow mode bypass'],
    unlocks: ['Pin messages', 'Bypass slow mode']
  },
  {
    level: 25,
    xpRequired: 8000,
    title: 'Uzman',
    perks: ['Anket oluşturma', 'Etkinlik önerme'],
    unlocks: ['Create polls', 'Suggest events'],
    specialReward: {
      type: 'feature',
      name: 'Etkinlik Yöneticisi',
      description: 'Kendi etkinliklerinizi oluşturabilirsiniz'
    }
  },
  {
    level: 30,
    xpRequired: 12000,
    title: 'Elit',
    badge: 'elite',
    perks: ['Özel profil çerçevesi', 'Öncelikli destek'],
    unlocks: ['Elite profile frame'],
    specialReward: {
      type: 'cosmetic',
      name: 'Elit Çerçeve',
      description: 'Altın rengi özel profil çerçevesi'
    }
  },
  {
    level: 40,
    xpRequired: 20000,
    title: 'Usta',
    badge: 'master',
    perks: ['Moderasyon yardımcısı rolleri', 'Özel komutlar'],
    unlocks: ['Helper role', 'Special commands']
  },
  {
    level: 50,
    xpRequired: 35000,
    title: 'Efsane',
    badge: 'legend',
    perks: ['Tüm özelliklere erişim', 'Geliştiricilerle iletişim'],
    unlocks: ['All features'],
    specialReward: {
      type: 'role',
      name: 'Efsane Üye',
      description: 'En üst düzey sunucu üyesi rolü'
    }
  }
];

// Mock user level data
const mockUserLevel: UserLevel = {
  userId: 'user1',
  level: 23,
  xp: 2450,
  xpToNextLevel: 550,
  totalXP: 6450,
  title: 'Deneyimli',
  perks: ['Özel emoji kullanımı', 'Özel kanal erişimi', 'Nickname değiştirme', 'Mesaj pinleme'],
  badges: ['active-member', 'experienced'],
  achievements: ['first-message', 'chatter', 'friend-maker'],
  weeklyXP: 890,
  monthlyXP: 3200,
  rank: 7,
  prestige: 0
};

// Mock leaderboard data
const mockLeaderboard = [
  { userId: 'user1', username: 'ProGamer123', level: 45, totalXP: 28500, weeklyXP: 1200, avatar: null },
  { userId: 'user2', username: 'eSportsKing', level: 42, totalXP: 25800, weeklyXP: 980, avatar: null },
  { userId: 'user3', username: 'GameMaster', level: 38, totalXP: 19200, weeklyXP: 850, avatar: null },
  { userId: 'user4', username: 'SkillfulPlayer', level: 35, totalXP: 16500, weeklyXP: 720, avatar: null },
  { userId: 'user5', username: 'CompetitiveGamer', level: 32, totalXP: 14200, weeklyXP: 650, avatar: null },
  { userId: 'user6', username: 'LobbyHero', level: 28, totalXP: 11800, weeklyXP: 580, avatar: null },
  { userId: 'current', username: 'Sen', level: 23, totalXP: 6450, weeklyXP: 890, avatar: null }
];

interface ServerLevelSystemProps {
  serverId: string;
  userId?: string;
}

export default function ServerLevelSystem({ serverId, userId }: ServerLevelSystemProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'leaderboard' | 'activities'>('overview');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  const currentUser = userId || user?.uid || 'current';
  const userLevel = mockUserLevel; // In real app, fetch from API
  const leaderboard = mockLeaderboard;

  const getProgressPercentage = () => {
    const currentLevelXP = userLevel.totalXP - userLevel.xp;
    const nextLevelTotalXP = currentLevelXP + userLevel.xpToNextLevel + userLevel.xp;
    return (userLevel.xp / (userLevel.xp + userLevel.xpToNextLevel)) * 100;
  };

  const getLevelReward = (level: number) => {
    return levelRewards.find(reward => reward.level === level);
  };

  const getNextMilestone = () => {
    return levelRewards.find(reward => reward.level > userLevel.level);
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'inci';
    if (rank === 2) return 'inci';
    if (rank === 3) return 'üncü';
    return 'ıncı';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 50) return Crown;
    if (level >= 40) return Gem;
    if (level >= 30) return Trophy;
    if (level >= 20) return Award;
    if (level >= 10) return Star;
    return Zap;
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-neon-orange';
    if (level >= 40) return 'text-neon-purple';
    if (level >= 30) return 'text-neon-cyan';
    if (level >= 20) return 'text-neon-pink';
    if (level >= 10) return 'text-neon-green';
    return 'text-gaming-muted';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-neon-cyan" />
          <h2 className="text-2xl font-bold text-gaming-text">Seviye Sistemi</h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gaming-surface rounded-lg p-1">
        {[
          { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
          { id: 'rewards', name: 'Ödüller', icon: Gift },
          { id: 'leaderboard', name: 'Sıralama', icon: Trophy },
          { id: 'activities', name: 'Aktiviteler', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-neon-purple text-white'
                  : 'text-gaming-text hover:bg-gaming-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Level Progress Card */}
          <div className="card-glass">
            <div className="flex items-center space-x-6">
              {/* Level Badge */}
              <div className="flex-shrink-0">
                <div className={`w-20 h-20 rounded-full ${getLevelColor(userLevel.level).replace('text-', 'bg-')}/20 flex items-center justify-center relative`}>
                  {(() => {
                    const LevelIcon = getLevelIcon(userLevel.level);
                    return <LevelIcon className={`w-10 h-10 ${getLevelColor(userLevel.level)}`} />;
                  })()}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gaming-surface ${getLevelColor(userLevel.level)}`}>
                      {userLevel.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gaming-text">
                    {userLevel.title || `Seviye ${userLevel.level}`}
                  </h3>
                  <span className="text-sm text-gaming-muted">
                    {userLevel.rank}{getRankSuffix(userLevel.rank)} sırada
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gaming-muted">
                      {userLevel.xp.toLocaleString()} / {(userLevel.xp + userLevel.xpToNextLevel).toLocaleString()} XP
                    </span>
                    <span className="text-gaming-text font-medium">
                      Seviye {userLevel.level + 1}'e {userLevel.xpToNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  
                  <div className="w-full bg-gaming-border rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-neon-purple to-neon-cyan h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-3 text-xs text-gaming-muted">
                  <span>Toplam XP: {userLevel.totalXP.toLocaleString()}</span>
                  <span>Bu hafta: {userLevel.weeklyXP.toLocaleString()}</span>
                  <span>Bu ay: {userLevel.monthlyXP.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Mevcut Seviye', value: userLevel.level.toString(), icon: TrendingUp, color: 'text-neon-cyan' },
              { label: 'Toplam XP', value: userLevel.totalXP.toLocaleString(), icon: Zap, color: 'text-neon-purple' },
              { label: 'Sunucu Sırası', value: `${userLevel.rank}${getRankSuffix(userLevel.rank)}`, icon: Trophy, color: 'text-neon-orange' },
              { label: 'Aktif Rozet', value: userLevel.badges.length.toString(), icon: Award, color: 'text-neon-green' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card-glass text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gaming-text mb-1">{stat.value}</div>
                  <div className="text-sm text-gaming-muted">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Current Perks */}
          <div className="card-glass">
            <h3 className="text-lg font-semibold text-gaming-text mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-neon-pink" />
              <span>Aktif Ayrıcalıklar</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userLevel.perks.map((perk, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gaming-surface rounded-lg">
                  <Unlock className="w-4 h-4 text-neon-green" />
                  <span className="text-gaming-text">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Milestone */}
          {getNextMilestone() && (
            <div className="card-glass border border-neon-purple/30">
              <h3 className="text-lg font-semibold text-gaming-text mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-neon-purple" />
                <span>Sonraki Hedef: Seviye {getNextMilestone()!.level}</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gaming-muted">Gereken XP:</span>
                  <span className="text-gaming-text font-medium">
                    {(getNextMilestone()!.xpRequired - userLevel.totalXP).toLocaleString()}
                  </span>
                </div>
                {getNextMilestone()!.title && (
                  <div className="flex items-center justify-between">
                    <span className="text-gaming-muted">Yeni Unvan:</span>
                    <span className="text-neon-purple font-medium">{getNextMilestone()!.title}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <span className="text-gaming-muted text-sm">Yeni Ayrıcalıklar:</span>
                  {getNextMilestone()!.perks.map((perk, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <ChevronRight className="w-3 h-3 text-neon-purple" />
                      <span className="text-gaming-text text-sm">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Badge Collection */}
          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gaming-text flex items-center space-x-2">
                <Award className="w-5 h-5 text-neon-orange" />
                <span>Rozet Koleksiyonu</span>
              </h3>
              <button
                onClick={() => setShowBadgeModal(true)}
                className="text-neon-cyan hover:text-neon-cyan/80 text-sm"
              >
                Tümünü Gör
              </button>
            </div>
            <BadgeSystem userBadges={userLevel.badges} />
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gaming-text">Seviye Ödülleri</h3>
          
          <div className="space-y-4">
            {levelRewards.map((reward) => {
              const isUnlocked = userLevel.level >= reward.level;
              const isCurrent = userLevel.level === reward.level;
              const LevelIcon = getLevelIcon(reward.level);
              
              return (
                <div
                  key={reward.level}
                  className={`card-glass transition-all duration-300 ${
                    isCurrent
                      ? 'border border-neon-purple shadow-glow'
                      : isUnlocked
                        ? 'border border-neon-green/30'
                        : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isUnlocked
                        ? `${getLevelColor(reward.level).replace('text-', 'bg-')}/20`
                        : 'bg-gaming-border'
                    }`}>
                      {isUnlocked ? (
                        <LevelIcon className={`w-8 h-8 ${getLevelColor(reward.level)}`} />
                      ) : (
                        <Lock className="w-8 h-8 text-gaming-muted" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-lg font-semibold ${
                          isUnlocked ? 'text-gaming-text' : 'text-gaming-muted'
                        }`}>
                          Seviye {reward.level}
                          {reward.title && ` - ${reward.title}`}
                        </h4>
                        <span className={`text-sm ${
                          isUnlocked ? 'text-neon-green' : 'text-gaming-muted'
                        }`}>
                          {reward.xpRequired.toLocaleString()} XP
                        </span>
                      </div>
                      
                      {isCurrent && (
                        <div className="mb-3 px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm inline-block">
                          Mevcut Seviye
                        </div>
                      )}

                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium text-gaming-text mb-1">Ayrıcalıklar:</h5>
                          <div className="flex flex-wrap gap-2">
                            {reward.perks.map((perk, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded text-xs ${
                                  isUnlocked
                                    ? 'bg-neon-green/20 text-neon-green'
                                    : 'bg-gaming-border text-gaming-muted'
                                }`}
                              >
                                {perk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {reward.specialReward && (
                          <div>
                            <h5 className="text-sm font-medium text-gaming-text mb-1">Özel Ödül:</h5>
                            <div className={`p-2 rounded-lg ${
                              isUnlocked
                                ? 'bg-neon-orange/20 border border-neon-orange/30'
                                : 'bg-gaming-border/20 border border-gaming-border'
                            }`}>
                              <div className={`font-medium ${
                                isUnlocked ? 'text-neon-orange' : 'text-gaming-muted'
                              }`}>
                                {reward.specialReward.name}
                              </div>
                              <div className="text-xs text-gaming-muted">
                                {reward.specialReward.description}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gaming-text">Sunucu Sıralaması</h3>
          
          <div className="space-y-3">
            {leaderboard.map((player, index) => {
              const isCurrentUser = player.userId === currentUser;
              const LevelIcon = getLevelIcon(player.level);
              
              return (
                <div
                  key={player.userId}
                  className={`card-glass transition-all duration-300 ${
                    isCurrentUser ? 'border border-neon-purple shadow-glow' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="w-12 h-12 rounded-full bg-gaming-surface flex items-center justify-center">
                      {index < 3 ? (
                        <Trophy className={`w-6 h-6 ${
                          index === 0 ? 'text-neon-orange' :
                          index === 1 ? 'text-gray-300' :
                          'text-amber-600'
                        }`} />
                      ) : (
                        <span className="text-gaming-text font-bold">#{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
                      <span className="text-white font-bold">
                        {player.username.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-semibold ${
                          isCurrentUser ? 'text-neon-purple' : 'text-gaming-text'
                        }`}>
                          {player.username}
                        </h4>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded text-xs">
                            Sen
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gaming-muted">
                        <span>Seviye {player.level}</span>
                        <span>{player.totalXP.toLocaleString()} XP</span>
                        <span className="text-neon-cyan">Bu hafta: {player.weeklyXP}</span>
                      </div>
                    </div>

                    {/* Level Icon */}
                    <div className={`w-10 h-10 rounded-full ${getLevelColor(player.level).replace('text-', 'bg-')}/20 flex items-center justify-center`}>
                      <LevelIcon className={`w-5 h-5 ${getLevelColor(player.level)}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gaming-text">XP Kazanma Yolları</h3>
          
          <div className="grid gap-4">
            {xpSources.map((source, index) => (
              <div key={index} className="card-glass">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gaming-text mb-1">{source.description}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gaming-muted">
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-neon-cyan" />
                        <span>+{source.xp} XP</span>
                      </span>
                      {source.cooldown && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{source.cooldown} dk bekleme</span>
                        </span>
                      )}
                      {source.dailyLimit && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Günlük limit: {source.dailyLimit}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-neon-cyan">+{source.xp}</div>
                    <div className="text-xs text-gaming-muted">XP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {showBadgeModal && (
        <BadgeSystem
          userBadges={userLevel.badges}
          showModal={true}
          onClose={() => setShowBadgeModal(false)}
        />
      )}
    </div>
  );
}
