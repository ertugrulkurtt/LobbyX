import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
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
  { id: 'profile', label: 'Profilim', path: '/profile', icon: User },
  { id: 'settings', label: 'Ayarlar', path: '/settings', icon: Settings },
  { id: 'notifications', label: 'Bildirimler', path: '/notifications', icon: Bell },
];

export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gaming-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-gaming-surface/80 backdrop-blur-xl border-b border-gaming-border">
        <div className="flex items-center justify-between h-full px-4">
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

            {/* User avatar */}
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gaming-surface transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 status-online"></div>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.displayName || user?.username || 'Oyuncu'}
                </span>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gaming-surface transition-all duration-300 hover:shadow-glow text-gaming-muted hover:text-red-400"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
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
      <main className={`pt-16 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
