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
  Globe
} from 'lucide-react';

export default function Index() {
  const featuredRooms = [
    {
      id: 1,
      name: 'Valorant Takım Arama',
      members: 1247,
      category: 'FPS',
      isLive: true,
      bgGradient: 'from-red-500/20 to-orange-500/20',
      borderColor: 'border-red-500/30'
    },
    {
      id: 2,
      name: 'League of Legends TR',
      members: 2834,
      category: 'MOBA',
      isLive: true,
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 3,
      name: 'CS2 Competitive',
      members: 967,
      category: 'FPS',
      isLive: true,
      bgGradient: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 4,
      name: 'Fortnite Squad',
      members: 1523,
      category: 'Battle Royale',
      isLive: false,
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30'
    }
  ];

  const gameStats = [
    { label: 'Aktif Oyuncular', value: '12,547', icon: Users, color: 'text-neon-green' },
    { label: 'Günlük Mesajlar', value: '847K', icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Tamamlanan Maçlar', value: '3,421', icon: Trophy, color: 'text-neon-orange' },
    { label: 'Aktif Odalar', value: '156', icon: Globe, color: 'text-neon-pink' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-purple/10 via-neon-cyan/10 to-neon-pink/10 p-8 lg:p-12">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-neon animate-neon-pulse">
              Geleceğin Oyun Platformu
            </h1>
            <p className="text-xl lg:text-2xl text-gaming-muted mb-8 leading-relaxed">
              Arkadaşlarınla bağlan, takım kur ve oyun dünyasında yeni keşifler yap. 
              Hiper-modern arayüzümüzle gaming deneyimini bir sonraki seviyeye taşı.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/chat"
                className="btn-neon inline-flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Sohbete Başla</span>
              </Link>
              <Link
                to="/profile"
                className="px-6 py-3 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-semibold text-center"
              >
                Profil Oluştur
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-neon-purple/20 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-20 w-12 h-12 bg-neon-cyan/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-5 w-8 h-8 bg-neon-pink/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {gameStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card-glass text-center animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold text-gaming-text mb-1">{stat.value}</div>
              <div className="text-sm text-gaming-muted">{stat.label}</div>
            </div>
          );
        })}
      </section>

      {/* Featured Rooms */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gaming-text flex items-center space-x-2">
            <Zap className="w-6 h-6 text-neon-orange" />
            <span>Popüler Odalar</span>
          </h2>
          <Link
            to="/chat"
            className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {featuredRooms.map((room, index) => (
            <div
              key={room.id}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${room.bgGradient} p-6 border ${room.borderColor} hover:shadow-glow transition-all duration-500 cursor-pointer animate-slide-in-right`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-gaming-surface/50 text-xs font-medium text-gaming-text">
                    {room.category}
                  </span>
                  {room.isLive && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-500 font-medium">CANLI</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gaming-text mb-2 group-hover:text-neon-cyan transition-colors">
                  {room.name}
                </h3>

                <div className="flex items-center space-x-2 text-gaming-muted">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{room.members.toLocaleString()} üye</span>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-glass group hover:shadow-3d transition-all duration-500 animate-fade-in-up">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gaming-text mb-3">Güvenli Ortam</h3>
            <p className="text-gaming-muted">
              Gelişmiş moderasyon sistemi ile güvenli ve dostane bir oyun ortamı.
            </p>
          </div>
        </div>

        <div className="card-glass group hover:shadow-3d transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-pink rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gaming-text mb-3">Sesli Sohbet</h3>
            <p className="text-gaming-muted">
              Kristal berraklığında ses kalitesi ile takım arkadaşlarınla iletişim kur.
            </p>
          </div>
        </div>

        <div className="card-glass group hover:shadow-3d transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-orange to-neon-pink rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gaming-text mb-3">İstatistikler</h3>
            <p className="text-gaming-muted">
              Oyun performansını takip et, gelişimini gör ve rekabette öne geç.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
