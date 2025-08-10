import React, { useState } from 'react';
import {
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Users,
  MessageSquare,
  Calendar,
  Shield,
  Flame,
  Award,
  Gamepad2,
  HeartHandshake,
  TrendingUp,
  Clock,
  CheckCircle,
  Lock,
  X
} from 'lucide-react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'activity' | 'social' | 'achievement' | 'special' | 'time' | 'gaming';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  progress?: {
    current: number;
    required: number;
  };
  requirements: string;
}

const badgeData: Badge[] = [
  // Activity Badges
  {
    id: 'first-message',
    name: 'İlk Mesaj',
    description: 'İlk mesajınızı gönderin',
    icon: MessageSquare,
    category: 'activity',
    rarity: 'common',
    earned: true,
    earnedDate: '2024-10-15',
    requirements: '1 mesaj gönder'
  },
  {
    id: 'chatter',
    name: 'Konuşkan',
    description: '100 mesaj gönderin',
    icon: MessageSquare,
    category: 'activity',
    rarity: 'rare',
    earned: true,
    earnedDate: '2024-10-20',
    requirements: '100 mesaj gönder'
  },
  {
    id: 'messenger',
    name: 'Mesajlaşma Ustası',
    description: '1000 mesaj gönderin',
    icon: MessageSquare,
    category: 'activity',
    rarity: 'epic',
    earned: false,
    progress: { current: 847, required: 1000 },
    requirements: '1000 mesaj gönder'
  },
  
  // Social Badges
  {
    id: 'friend-maker',
    name: 'Arkadaş Edinici',
    description: '10 arkadaş edinin',
    icon: Users,
    category: 'social',
    rarity: 'common',
    earned: true,
    earnedDate: '2024-10-18',
    requirements: '10 arkadaş ekle'
  },
  {
    id: 'popular',
    name: 'Popüler',
    description: '50 arkadaş edinin',
    icon: HeartHandshake,
    category: 'social',
    rarity: 'rare',
    earned: false,
    progress: { current: 47, required: 50 },
    requirements: '50 arkadaş ekle'
  },
  
  // Gaming Badges
  {
    id: 'gamer',
    name: 'Oyuncu',
    description: 'İlk oyun aktivitesi',
    icon: Gamepad2,
    category: 'gaming',
    rarity: 'common',
    earned: true,
    earnedDate: '2024-10-16',
    requirements: 'Bir oyun oyna'
  },
  {
    id: 'hardcore-gamer',
    name: 'Hardcore Oyuncu',
    description: '100 saat oyun oyna',
    icon: Target,
    category: 'gaming',
    rarity: 'epic',
    earned: false,
    progress: { current: 78, required: 100 },
    requirements: '100 saat oyun oyna'
  },
  
  // Time Badges
  {
    id: 'early-bird',
    name: 'Erken Katılan',
    description: 'Platformun ilk 1000 kullanıcısı',
    icon: Clock,
    category: 'special',
    rarity: 'legendary',
    earned: true,
    earnedDate: '2024-10-15',
    requirements: 'İlk 1000 kullanıcı arasında katıl'
  },
  {
    id: 'loyal',
    name: 'Sadık Kullanıcı',
    description: '30 gün boyunca aktif ol',
    icon: Calendar,
    category: 'time',
    rarity: 'rare',
    earned: false,
    progress: { current: 23, required: 30 },
    requirements: '30 gün aktif olun'
  },
  
  // Achievement Badges
  {
    id: 'tournament-winner',
    name: 'Turnuva Kazananı',
    description: 'Bir turnuvada birinci ol',
    icon: Crown,
    category: 'achievement',
    rarity: 'legendary',
    earned: false,
    requirements: 'Turnuvada 1. ol'
  },
  {
    id: 'streak-master',
    name: 'Seri Ustası',
    description: '7 gün üst üste aktif ol',
    icon: Flame,
    category: 'achievement',
    rarity: 'epic',
    earned: true,
    earnedDate: '2024-10-22',
    requirements: '7 gün üst üste aktif ol'
  },
  
  // Special Badges
  {
    id: 'moderator',
    name: 'Moderatör',
    description: 'Sunucu moderatörü',
    icon: Shield,
    category: 'special',
    rarity: 'epic',
    earned: false,
    requirements: 'Moderatör olarak atanın'
  },
  {
    id: 'vip',
    name: 'VIP Üye',
    description: 'VIP üyelik satın alın',
    icon: Star,
    category: 'special',
    rarity: 'rare',
    earned: false,
    requirements: 'VIP üyelik satın alın'
  }
];

interface BadgeSystemProps {
  userBadges?: string[];
  showModal?: boolean;
  onClose?: () => void;
}

export default function BadgeSystem({ userBadges = [], showModal = false, onClose }: BadgeSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Tümü', icon: Award },
    { id: 'activity', name: 'Aktivite', icon: TrendingUp },
    { id: 'social', name: 'Sosyal', icon: Users },
    { id: 'gaming', name: 'Oyun', icon: Gamepad2 },
    { id: 'achievement', name: 'Başarım', icon: Trophy },
    { id: 'time', name: 'Zaman', icon: Clock },
    { id: 'special', name: 'Özel', icon: Star }
  ];

  const rarities = [
    { id: 'all', name: 'Tümü' },
    { id: 'common', name: 'Yaygın', color: 'text-gray-400' },
    { id: 'rare', name: 'Nadir', color: 'text-neon-cyan' },
    { id: 'epic', name: 'Efsanevi', color: 'text-neon-purple' },
    { id: 'legendary', name: 'Destansı', color: 'text-neon-orange' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400/50 bg-gray-400/10';
      case 'rare': return 'border-neon-cyan/50 bg-neon-cyan/10';
      case 'epic': return 'border-neon-purple/50 bg-neon-purple/10';
      case 'legendary': return 'border-neon-orange/50 bg-neon-orange/10';
      default: return 'border-gaming-border bg-gaming-surface';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-neon-cyan';
      case 'epic': return 'text-neon-purple';
      case 'legendary': return 'text-neon-orange';
      default: return 'text-gaming-text';
    }
  };

  const filteredBadges = badgeData.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const earnedBadges = badgeData.filter(badge => badge.earned);
  const totalBadges = badgeData.length;

  if (!showModal) {
    // Compact view for profile/dashboard
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gaming-text flex items-center space-x-2">
            <Award className="w-5 h-5 text-neon-orange" />
            <span>Rozetler</span>
          </h3>
          <span className="text-sm text-gaming-muted">
            {earnedBadges.length}/{totalBadges}
          </span>
        </div>
        
        <div className="grid grid-cols-6 gap-3">
          {earnedBadges.slice(0, 6).map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`aspect-square rounded-lg border-2 ${getRarityColor(badge.rarity)} flex items-center justify-center p-2 hover:scale-105 transition-transform cursor-pointer`}
                title={badge.name}
              >
                <Icon className={`w-6 h-6 ${getRarityTextColor(badge.rarity)}`} />
              </div>
            );
          })}
          
          {earnedBadges.length > 6 && (
            <div className="aspect-square rounded-lg border-2 border-gaming-border bg-gaming-surface flex items-center justify-center">
              <span className="text-xs text-gaming-muted">+{earnedBadges.length - 6}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full modal view
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gaming-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6 text-neon-orange" />
            <h2 className="text-2xl font-bold text-gaming-text">Rozet Koleksiyonu</h2>
            <span className="px-3 py-1 bg-neon-orange/20 text-neon-orange rounded-full text-sm">
              {earnedBadges.length}/{totalBadges}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gaming-text" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gaming-muted">Koleksiyon İlerlemesi</span>
            <span className="text-sm text-gaming-text">{Math.round((earnedBadges.length / totalBadges) * 100)}%</span>
          </div>
          <div className="w-full bg-gaming-border rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-orange to-neon-pink h-2 rounded-full transition-all duration-300"
              style={{ width: `${(earnedBadges.length / totalBadges) * 100}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-text">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1 ${
                      selectedCategory === category.id
                        ? 'bg-neon-purple text-white'
                        : 'bg-gaming-surface text-gaming-text hover:bg-gaming-surface/80'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rarity Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-text">Nadirlik</label>
            <div className="flex flex-wrap gap-2">
              {rarities.map((rarity) => (
                <button
                  key={rarity.id}
                  onClick={() => setSelectedRarity(rarity.id)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedRarity === rarity.id
                      ? 'bg-neon-purple text-white'
                      : 'bg-gaming-surface text-gaming-text hover:bg-gaming-surface/80'
                  }`}
                >
                  {rarity.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="overflow-y-auto max-h-96">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => {
              const Icon = badge.icon;
              const isEarned = badge.earned;
              
              return (
                <div
                  key={badge.id}
                  className={`rounded-lg border-2 p-4 transition-all duration-300 ${
                    isEarned 
                      ? `${getRarityColor(badge.rarity)} hover:scale-105` 
                      : 'border-gaming-border bg-gaming-surface/50 opacity-60'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    {/* Badge Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isEarned ? getRarityColor(badge.rarity) : 'bg-gaming-border'
                    }`}>
                      {isEarned ? (
                        <Icon className={`w-6 h-6 ${getRarityTextColor(badge.rarity)}`} />
                      ) : (
                        <Lock className="w-6 h-6 text-gaming-muted" />
                      )}
                    </div>

                    {/* Badge Info */}
                    <div className="text-center space-y-1">
                      <h4 className={`font-semibold ${isEarned ? 'text-gaming-text' : 'text-gaming-muted'}`}>
                        {badge.name}
                      </h4>
                      <p className="text-xs text-gaming-muted">{badge.description}</p>
                      <p className={`text-xs font-medium ${getRarityTextColor(badge.rarity)}`}>
                        {rarities.find(r => r.id === badge.rarity)?.name}
                      </p>
                    </div>

                    {/* Progress or Earned Date */}
                    {isEarned && badge.earnedDate ? (
                      <div className="flex items-center space-x-1 text-xs text-gaming-muted">
                        <CheckCircle className="w-3 h-3" />
                        <span>{new Date(badge.earnedDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    ) : badge.progress ? (
                      <div className="w-full space-y-1">
                        <div className="flex justify-between text-xs text-gaming-muted">
                          <span>{badge.progress.current}</span>
                          <span>{badge.progress.required}</span>
                        </div>
                        <div className="w-full bg-gaming-border rounded-full h-1.5">
                          <div 
                            className="bg-neon-cyan h-1.5 rounded-full"
                            style={{ width: `${(badge.progress.current / badge.progress.required) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gaming-muted text-center">
                        {badge.requirements}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export badge data and types for use in other components
export { badgeData };
export type { Badge };
