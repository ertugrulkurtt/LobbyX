import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Trophy,
  Globe,
  Shield,
  Headphones,
  TrendingUp,
  Play,
  UserPlus,
  Gamepad2,
  Zap,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const gameStats = [
    { label: 'Aktif Oyuncular', value: '12,547', icon: Users, color: 'text-neon-green' },
    { label: 'Günlük Mesajlar', value: '847K', icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Tamamlanan Maçlar', value: '3,421', icon: Trophy, color: 'text-neon-orange' },
    { label: 'Aktif Odalar', value: '156', icon: Globe, color: 'text-neon-pink' },
  ];

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

  return (
    <div className="min-h-screen bg-gaming-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-gaming-surface/80 backdrop-blur-xl border-b border-gaming-border">
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F3fa3fe0360c74c0a80bb8a229c50ca2c%2F8524f1f78eaf4eddbe4c314d3298bfa8?format=webp&width=800"
                alt="LobbyX Logo"
                className="w-10 h-10 object-contain mix-blend-screen filter brightness-110 animate-pulse-glow"
                style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))' }}
              />
            </div>
            <span className="text-xl font-bold text-neon bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              LobbyX
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-medium text-center"
            >
              Giriş Yap
            </Link>
            <Link
              to="/register"
              className="btn-neon inline-flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Kayıt Ol</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-16">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-purple/10 via-neon-cyan/10 to-neon-pink/10 p-8 lg:p-16">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl lg:text-7xl font-bold mb-8 text-neon animate-neon-pulse">
                  Geleceğin Oyun Platformu
                </h1>
                <p className="text-xl lg:text-2xl text-gaming-muted mb-12 leading-relaxed max-w-3xl mx-auto">
                  Arkadaşlarınla bağlan, takım kur ve oyun dünyasında yeni keşifler yap. 
                  Hiper-modern arayüzümüzle gaming deneyimini bir sonraki seviyeye taşı.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    to="/login"
                    className="btn-neon inline-flex items-center justify-center space-x-3 px-8 py-4 text-lg"
                  >
                    <Play className="w-6 h-6" />
                    <span>Sohbete Başla</span>
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-semibold text-center text-lg"
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
          <section>
            <h2 className="text-3xl font-bold text-center text-gaming-text mb-8">
              Canlı İstatistikler
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {gameStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="card-glass text-center animate-scale-in hover:shadow-3d transition-all duration-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gaming-text mb-1">{stat.value}</div>
                    <div className="text-sm text-gaming-muted">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Popular Rooms */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gaming-text mb-4 flex items-center justify-center space-x-2">
                <Zap className="w-8 h-8 text-neon-orange" />
                <span>Popüler Sohbet Odaları</span>
              </h2>
              <p className="text-gaming-muted max-w-2xl mx-auto">
                En popüler oyunlarda binlerce oyuncuyla tanış, takım kur ve yeni arkadaşlıklar edin.
              </p>
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

                    <h3 className="text-lg font-semibold text-gaming-text mb-3 group-hover:text-neon-cyan transition-colors">
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
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gaming-text mb-4">
                Neden LobbyX?
              </h2>
              <p className="text-gaming-muted max-w-2xl mx-auto">
                Modern teknoloji ile desteklenen en gelişmiş oyuncu deneyimi için tasarlandı.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="card-glass group hover:shadow-3d transition-all duration-500 animate-fade-in-up text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gaming-text mb-4">Güvenli Ortam</h3>
                <p className="text-gaming-muted">
                  Gelişmiş moderasyon sistemi ile güvenli ve dostane bir oyun ortamı. 
                  Toksik davranışlara karşı sıfır tolerans politikası.
                </p>
              </div>

              <div className="card-glass group hover:shadow-3d transition-all duration-500 animate-fade-in-up text-center" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-pink rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gaming-text mb-4">Sesli Sohbet</h3>
                <p className="text-gaming-muted">
                  Kristal berraklığında ses kalitesi ile takım arkadaşlarınla koordinasyon kur. 
                  Düşük gecikme ile anlık iletişim.
                </p>
              </div>

              <div className="card-glass group hover:shadow-3d transition-all duration-500 animate-fade-in-up text-center" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-neon-orange to-neon-pink rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gaming-text mb-4">Oyun İstatistikleri</h3>
                <p className="text-gaming-muted">
                  Oyun performansını detaylı olarak takip et, gelişimini gör ve rekabette öne geç. 
                  Kişisel analizler ve raporlar.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gaming-text mb-6">
                Hazır mısın?
              </h2>
              <p className="text-xl text-gaming-muted mb-8">
                Binlerce oyuncunun beklediği geleceğin gaming platformuna katıl.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="btn-neon inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Sohbete Başla</span>
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-semibold text-center text-lg"
                >
                  Profil Oluştur
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
