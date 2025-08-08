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
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Anasayfa', path: '/dashboard', icon: Home },
  { id: 'chat', label: 'Sohbet Odaları', path: '/chat', icon: MessageSquare },
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
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Gamepad2 className="w-8 h-8 text-neon-purple animate-pulse-glow" />
              <Zap className="absolute -top-1 -right-1 w-4 h-4 text-neon-cyan" />
            </div>
            <span className="text-xl font-bold text-neon bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              GameChat
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
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-gaming-surface/50 backdrop-blur-xl border-r border-gaming-border z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${
                  isActive 
                    ? 'bg-gaming-surface shadow-glow border border-neon-purple/20' 
                    : 'hover:bg-gaming-surface/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-neon-purple' : 'text-gaming-muted'}`} />
                <span className={`font-medium ${isActive ? 'text-neon-purple' : 'text-gaming-text'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
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
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
