import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useUserStats } from '../hooks/useUserStats';
import {
  Home,
  MessageSquare,
  Users,
  User,
  Settings,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Gamepad2,
  Zap,
  LogOut,
  Server,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Headphones,
  Volume2,
  VolumeX,
  PhoneCall,
  Video,
  Monitor,
  Phone
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Anasayfa', path: '/dashboard', icon: Home },
  { id: 'servers', label: 'Sunucular', path: '/servers', icon: Server },
  { id: 'groups', label: 'Gruplar', path: '/groups', icon: UsersRound },
  { id: 'chat', label: 'Sohbet', path: '/chat', icon: MessageSquare },
  { id: 'friends', label: 'Arkadaşlar', path: '/friends', icon: Users },
];

export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { trackVoice } = useUserStats();
  const { counts } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [voiceChannel, setVoiceChannel] = useState<{
    id: string;
    name: string;
    server: string;
    members: Array<{ id: string; name: string; isMuted: boolean; isDeafened: boolean; }>;
  } | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    isMuted: false,
    isDeafened: false,
    volume: 80,
    pushToTalk: false,
    videoEnabled: false,
    screenShare: false
  });
  const [voiceStartTime, setVoiceStartTime] = useState<Date | null>(null);

  const currentPath = location.pathname;

  // Listen for voice channel join events from other components
  React.useEffect(() => {
    const handleJoinVoiceChannel = (event: CustomEvent) => {
      const { channelId, channelName, serverName } = event.detail;
      joinVoiceChannel(channelId, channelName, serverName);
    };

    window.addEventListener('joinVoiceChannel', handleJoinVoiceChannel as EventListener);

    return () => {
      window.removeEventListener('joinVoiceChannel', handleJoinVoiceChannel as EventListener);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const joinVoiceChannel = (channelId: string, channelName: string, serverName: string) => {
    setVoiceChannel({
      id: channelId,
      name: channelName,
      server: serverName,
      members: [
        { id: user?.uid || '', name: user?.displayName || user?.username || 'Sen', isMuted: false, isDeafened: false },
        { id: 'user2', name: 'ProGamer123', isMuted: false, isDeafened: false },
        { id: 'user3', name: 'GameMaster', isMuted: true, isDeafened: false }
      ]
    });
    setVoiceStartTime(new Date());
    console.log('Ses kanalına katıldı:', channelName);
  };

  const leaveVoiceChannel = async () => {
    // Track voice time before leaving
    if (voiceStartTime) {
      const endTime = new Date();
      const voiceTimeMinutes = Math.floor((endTime.getTime() - voiceStartTime.getTime()) / (1000 * 60));

      if (voiceTimeMinutes > 0) {
        try {
          await trackVoice(voiceTimeMinutes);
          console.log(`Ses kanalında ${voiceTimeMinutes} dakika geçirildi`);
        } catch (error) {
          console.error('Error tracking voice time:', error);
        }
      }
    }

    setVoiceChannel(null);
    setVoiceStartTime(null);
    setVoiceSettings(prev => ({ ...prev, videoEnabled: false, screenShare: false }));
    console.log('Ses kanalından ayrıldı');
  };

  const toggleMute = () => {
    setVoiceSettings(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleDeafen = () => {
    setVoiceSettings(prev => ({ ...prev, isDeafened: !prev.isDeafened, isMuted: prev.isDeafened ? prev.isMuted : true }));
  };

  const toggleVideo = () => {
    setVoiceSettings(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
  };

  const toggleScreenShare = () => {
    setVoiceSettings(prev => ({ ...prev, screenShare: !prev.screenShare }));
  };

  return (
    <div className="min-h-screen bg-gaming-bg">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${voiceChannel ? 'h-32' : 'h-16'} bg-gaming-surface/80 backdrop-blur-xl border-b border-gaming-border transition-all duration-300`}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gaming-surface transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-neon bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              LobbyX
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gaming-surface transition-all duration-300 hover:shadow-glow"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-neon-orange" />
              ) : (
                <Moon className="w-5 h-5 text-neon-purple" />
              )}
            </button>

            {/* Settings and Notifications */}
            <div className="flex items-center space-x-2">
              <Link
                to="/notifications"
                className="p-2 rounded-lg hover:bg-gaming-surface transition-all duration-300 hover:shadow-glow text-gaming-muted hover:text-neon-cyan"
                title="Bildirimler"
              >
                <Bell className="w-5 h-5" />
              </Link>

              <Link
                to="/settings"
                className="p-2 rounded-lg hover:bg-gaming-surface transition-all duration-300 hover:shadow-glow text-gaming-muted hover:text-neon-cyan"
                title="Ayarlar"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            {/* User avatar */}
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gaming-surface transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 status-online"></div>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.displayName || user?.username || 'Oyuncu'}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Voice Channel Controls */}
        {voiceChannel && (
          <div className="px-4 py-3 border-t border-gaming-border/50 bg-gaming-surface/50">
            <div className="flex items-center justify-between">
              {/* Voice Channel Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  <Headphones className="w-4 h-4 text-neon-green" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gaming-text">{voiceChannel.name}</p>
                  <p className="text-xs text-gaming-muted">{voiceChannel.server} • {voiceChannel.members.length} kişi</p>
                </div>
              </div>

              {/* Voice Controls */}
              <div className="flex items-center space-x-2">
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    voiceSettings.isMuted
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-gaming-surface/50 hover:bg-gaming-surface text-gaming-muted hover:text-neon-green'
                  }`}
                  title={voiceSettings.isMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
                >
                  {voiceSettings.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Deafen Button */}
                <button
                  onClick={toggleDeafen}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    voiceSettings.isDeafened
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-gaming-surface/50 hover:bg-gaming-surface text-gaming-muted hover:text-neon-blue'
                  }`}
                  title={voiceSettings.isDeafened ? 'Sesi Aç' : 'Sesi Kapat'}
                >
                  {voiceSettings.isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                </button>

                {/* Video Button */}
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    voiceSettings.videoEnabled
                      ? 'bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue'
                      : 'bg-gaming-surface/50 hover:bg-gaming-surface text-gaming-muted hover:text-neon-blue'
                  }`}
                  title={voiceSettings.videoEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
                >
                  <Video className="w-4 h-4" />
                </button>

                {/* Screen Share Button */}
                <button
                  onClick={toggleScreenShare}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    voiceSettings.screenShare
                      ? 'bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple'
                      : 'bg-gaming-surface/50 hover:bg-gaming-surface text-gaming-muted hover:text-neon-purple'
                  }`}
                  title={voiceSettings.screenShare ? 'Ekran Paylaşımını Durdur' : 'Ekran Paylaş'}
                >
                  <Monitor className="w-4 h-4" />
                </button>

                {/* Settings */}
                <button
                  className="p-2 rounded-lg bg-gaming-surface/50 hover:bg-gaming-surface text-gaming-muted hover:text-gaming-text transition-colors"
                  title="Ses Ayarları"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Leave Channel */}
                <button
                  onClick={leaveVoiceChannel}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  title="Kanaldan Ayrıl"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>

              {/* Voice Channel Members */}
              <div className="hidden xl:flex items-center space-x-2">
                {voiceChannel.members.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg bg-gaming-surface/50 ${
                      member.isMuted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="w-5 h-5 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                      {member.id === user?.uid && user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-xs text-gaming-text">{member.name}</span>
                    {member.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                  </div>
                ))}
                {voiceChannel.members.length > 3 && (
                  <span className="text-xs text-gaming-muted">+{voiceChannel.members.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gaming-surface/50 backdrop-blur-xl border-r border-gaming-border z-40 transform transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Collapse Toggle Button */}
        <div className="hidden lg:block absolute -right-3 top-6 z-50">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-6 h-6 bg-gaming-surface border border-gaming-border rounded-full flex items-center justify-center hover:bg-gaming-surface/80 transition-all duration-300 hover:shadow-glow"
            title={sidebarCollapsed ? 'Genişlet' : 'Daralt'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3 h-3 text-gaming-muted" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-gaming-muted" />
            )}
          </button>
        </div>

        <nav className={`${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-2 flex flex-col h-full transition-all duration-300`}>
          <div className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`${sidebarCollapsed ? 'p-3 justify-center' : 'nav-item'} group relative flex items-center rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gaming-surface shadow-glow border border-neon-purple/20'
                      : 'hover:bg-gaming-surface/50'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className={`${sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5'} ${isActive ? 'text-neon-purple' : 'text-gaming-muted'}`} />
                  {!sidebarCollapsed && (
                    <span className={`ml-3 font-medium ${isActive ? 'text-neon-purple' : 'text-gaming-text'}`}>
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gaming-surface border border-gaming-border rounded text-sm text-gaming-text opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logout button at bottom of sidebar */}
          <div className="border-t border-gaming-border pt-4">
            <button
              onClick={handleLogout}
              className={`${sidebarCollapsed ? 'p-3 justify-center' : 'nav-item'} group relative w-full flex items-center rounded-xl text-left hover:bg-red-500/10 hover:shadow-glow text-gaming-muted hover:text-red-400 transition-all duration-300`}
              title={sidebarCollapsed ? 'Çıkış Yap' : ''}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && (
                <span className="ml-3 font-medium">Çıkış Yap</span>
              )}

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gaming-surface border border-gaming-border rounded text-sm text-gaming-text opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Çıkış Yap
                </div>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`${voiceChannel ? 'pt-32' : 'pt-16'} min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
