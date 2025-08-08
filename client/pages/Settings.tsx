import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Volume2,
  Palette,
  Shield,
  LogOut,
  Save,
  Check,
  Moon,
  Sun,
  VolumeX,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      friendRequests: true,
      groupInvites: false,
      systemUpdates: true
    },
    audio: {
      masterVolume: 80,
      notificationSounds: true,
      voiceChatVolume: 75,
      muteMicrophone: false
    },
    privacy: {
      onlineStatus: true,
      profileVisibility: 'friends',
      messageRequests: 'everyone'
    },
    twoFactorEnabled: false
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gaming-text flex items-center space-x-2">
          <SettingsIcon className="w-8 h-8 text-neon-purple" />
          <span>Ayarlar</span>
        </h1>
        <button className="px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Değişiklikleri Kaydet</span>
        </button>
      </div>

      {/* Notifications */}
      <section className="card-glass">
        <h2 className="text-xl font-bold text-gaming-text mb-6 flex items-center space-x-2">
          <Bell className="w-6 h-6 text-neon-cyan" />
          <span>Bildirimler</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gaming-text">Mesaj Bildirimleri</h3>
              <p className="text-sm text-gaming-muted">Yeni mesajlar için bildirim al</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notifications.messages}
                onChange={(e) => updateSetting('notifications', 'messages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gaming-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gaming-text">Arkadaşlık İstekleri</h3>
              <p className="text-sm text-gaming-muted">Yeni arkadaşlık istekleri için bildirim</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notifications.friendRequests}
                onChange={(e) => updateSetting('notifications', 'friendRequests', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gaming-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gaming-text">Grup Davetleri</h3>
              <p className="text-sm text-gaming-muted">Grup davetleri için bildirim</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notifications.groupInvites}
                onChange={(e) => updateSetting('notifications', 'groupInvites', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gaming-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gaming-text">Sistem Güncellemeleri</h3>
              <p className="text-sm text-gaming-muted">Önemli duyurular ve güncellemeler</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notifications.systemUpdates}
                onChange={(e) => updateSetting('notifications', 'systemUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gaming-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Audio Settings */}
      <section className="card-glass">
        <h2 className="text-xl font-bold text-gaming-text mb-6 flex items-center space-x-2">
          <Volume2 className="w-6 h-6 text-neon-orange" />
          <span>Ses Ayarları</span>
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gaming-text">Ana Ses Seviyesi</h3>
              <span className="text-gaming-text">{settings.audio.masterVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.audio.masterVolume}
              onChange={(e) => updateSetting('audio', 'masterVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gaming-surface rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gaming-text">Sesli Sohbet Seviyesi</h3>
              <span className="text-gaming-text">{settings.audio.voiceChatVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.audio.voiceChatVolume}
              onChange={(e) => updateSetting('audio', 'voiceChatVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gaming-surface rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gaming-text">Bildirim Sesleri</h3>
              <p className="text-sm text-gaming-muted">Mesaj ve bildirim sesleri</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.audio.notificationSounds}
                onChange={(e) => updateSetting('audio', 'notificationSounds', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gaming-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Theme Settings */}
      <section className="card-glass">
        <h2 className="text-xl font-bold text-gaming-text mb-6 flex items-center space-x-2">
          <Palette className="w-6 h-6 text-neon-pink" />
          <span>Tema Ayarları</span>
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gaming-text mb-3">Tema Seçimi</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={theme === 'light' ? undefined : toggleTheme}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'border-neon-purple bg-neon-purple/10' 
                    : 'border-gaming-border hover:border-neon-purple/50'
                }`}
              >
                <Moon className="w-8 h-8 mx-auto mb-2 text-neon-purple" />
                <span className="text-gaming-text font-medium">Karanlık Mod</span>
              </button>
              
              <button
                onClick={theme === 'dark' ? undefined : toggleTheme}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'light' 
                    ? 'border-neon-orange bg-neon-orange/10' 
                    : 'border-gaming-border hover:border-neon-orange/50'
                }`}
              >
                <Sun className="w-8 h-8 mx-auto mb-2 text-neon-orange" />
                <span className="text-gaming-text font-medium">Aydınlık Mod</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="card-glass">
        <h2 className="text-xl font-bold text-gaming-text mb-6 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-neon-green" />
          <span>Güvenlik</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gaming-text">İki Adımlı Doğrulama</h3>
              <p className="text-sm text-gaming-muted">Hesabınızı ekstra güvenlik katmanı ile koruyun</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.twoFactorEnabled}
                onChange={(e) => updateSetting('', 'twoFactorEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gaming-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
            </label>
          </div>

          <button className="w-full px-4 py-3 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors text-left flex items-center space-x-3">
            <Lock className="w-5 h-5" />
            <span>Şifre Değiştir</span>
          </button>

          <button className="w-full px-4 py-3 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-left">
            Aktif Oturumları Görüntüle
          </button>
        </div>
      </section>

      {/* Logout */}
      <section className="card-glass border-red-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gaming-text">Oturum Kapat</h3>
            <p className="text-gaming-muted">Tüm cihazlarda oturumunu sonlandır</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </section>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gaming-surface rounded-2xl p-6 max-w-md mx-4 border border-gaming-border">
            <h3 className="text-xl font-bold text-gaming-text mb-4">Oturum Kapat</h3>
            <p className="text-gaming-muted mb-6">
              Oturumunuzu kapatmak istediğinizden emin misiniz?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-500/80 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
