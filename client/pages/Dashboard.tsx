import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Trophy,
  Zap,
  Star,
  TrendingUp,
  Play,
  Shield,
  Headphones,
  Globe,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const gameStats = [
    { label: 'Aktif Arkadaşlar', value: '23', icon: Users, color: 'text-neon-green' },
    { label: 'Bu Hafta Mesajlar', value: '1.2K', icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Oyun Saati', value: '47h', icon: Trophy, color: 'text-neon-orange' },
    { label: 'Rank Puanı', value: '2,847', icon: Star, color: 'text-neon-pink' },
  ];

  const recentActivity = [
    {
      type: 'game',
      title: 'Valorant Competitive',
      description: '13-11 Kazandın - Bind',
      time: '2 saat önce',
      icon: Trophy,
      color: 'text-neon-green'
    },
    {
      type: 'friend',
      title: 'Yeni arkadaş',
      description: 'ProGamer123 arkadaş listene eklendi',
      time: '4 saat önce',
      icon: Users,
      color: 'text-neon-cyan'
    },
    {
      type: 'message',
      title: 'Sohbet odası',
      description: 'LoL Takım Arama odasında 5 yeni mesaj',
      time: '6 saat önce',
      icon: MessageSquare,
      color: 'text-neon-purple'
    }
  ];

  const quickActions = [
    {
      title: 'Hızlı Maç',
      description: 'Anlık takım bul',
      icon: Play,
      color: 'from-neon-purple to-neon-cyan',
      href: '/chat'
    },
    {
      title: 'Arkadaş Ekle',
      description: 'Yeni oyuncularla tanış',
      icon: Users,
      color: 'from-neon-green to-neon-cyan',
      href: '/friends'
    },
    {
      title: 'Ses Sohbeti',
      description: 'Sesli odaya katıl',
      icon: Headphones,
      color: 'from-neon-orange to-neon-pink',
      href: '/chat'
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
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neon">
                Hoş geldin, {user?.displayName || user?.username}!
              </h1>
              <p className="text-gaming-muted">Bugün hangi oyunu oynayacaksın?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gameStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-gaming-surface/50 backdrop-blur-sm rounded-xl p-4 border border-gaming-border animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                  <div className="text-xl font-bold text-gaming-text">{stat.value}</div>
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
          <Zap className="w-6 h-6 text-neon-orange" />
          <span>Hızlı Eylemler</span>
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

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gaming-text flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-neon-green" />
            <span>Son Aktiviteler</span>
          </h2>
          <Link
            to="/notifications"
            className="text-neon-cyan hover:text-neon-purple transition-colors font-medium flex items-center space-x-1"
          >
            <Bell className="w-4 h-4" />
            <span>Tümünü Gör</span>
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className="card-glass hover:shadow-3d transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-gaming-surface rounded-lg flex items-center justify-center ${activity.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gaming-text">{activity.title}</h4>
                    <p className="text-sm text-gaming-muted">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gaming-muted">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Friends */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gaming-text flex items-center space-x-2">
            <Users className="w-6 h-6 text-neon-cyan" />
            <span>Çevrimiçi Arkadaşlar</span>
          </h2>
          <Link
            to="/friends"
            className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="card-glass text-center hover:shadow-glow transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative mx-auto mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
              </div>
              <div className="text-sm font-medium text-gaming-text">Oyuncu{index + 1}</div>
              <div className="text-xs text-gaming-muted">Valorant</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
