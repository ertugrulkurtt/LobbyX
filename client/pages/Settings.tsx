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
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<'intro' | 'qr' | 'verify' | 'backup' | 'complete'>('intro');
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // In real app: Save to Firebase
      // await updateDoc(doc(db, 'users', user.uid), {
      //   settings: settings,
      //   preferences: {
      //     ...user.preferences,
      //     notifications: settings.notifications.systemUpdates
      //   }
      // });

      // Mock save delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage for demo
      localStorage.setItem('lobbyx-settings', JSON.stringify(settings));

      setSaveMessage('Ayarlar başarıyla kaydedildi!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Settings save failed:', error);
      setSaveMessage('Ayarlar kaydedilemedi. Lütfen tekrar deneyin.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('lobbyx-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, []);

  // Generate 2FA secret and QR code
  const generateTwoFactorSecret = () => {
    // In real app: use authenticator library like speakeasy
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setGeneratedSecret(secret);

    // Generate QR code URL (in real app use proper QR library)
    const appName = 'LobbyX Gaming Platform';
    const username = user?.email || user?.username || 'user';
    const qrUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(username)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);

    // Generate backup codes
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const verifyTwoFactorCode = () => {
    // In real app: verify with authenticator library
    // For demo, accept any 6-digit code
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      setTwoFactorStep('backup');
      return true;
    }
    return false;
  };

  const completeTwoFactorSetup = () => {
    updateSetting('', 'twoFactorEnabled', true);
    setShowTwoFactorSetup(false);
    setTwoFactorStep('intro');
    setVerificationCode('');
    handleSaveSettings();
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gaming-text flex items-center space-x-2">
          <SettingsIcon className="w-8 h-8 text-neon-purple" />
          <span>Ayarlar</span>
        </h1>
        <div className="flex items-center space-x-4">
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('başarıyla') ? 'text-neon-green' : 'text-red-400'}`}>
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Değişiklikleri Kaydet</span>
              </>
            )}
          </button>
        </div>
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
                onClick={() => {
                  if (theme !== 'dark') {
                    toggleTheme();
                    // Auto-save theme change
                    setTimeout(handleSaveSettings, 500);
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-neon-purple bg-neon-purple/10'
                    : 'border-gaming-border hover:border-neon-purple/50'
                }`}
              >
                <Moon className="w-8 h-8 mx-auto mb-2 text-neon-purple" />
                <span className="text-gaming-text font-medium">Karanlık Mod</span>
                {theme === 'dark' && (
                  <div className="mt-2">
                    <Check className="w-5 h-5 mx-auto text-neon-purple" />
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  if (theme !== 'light') {
                    toggleTheme();
                    // Auto-save theme change
                    setTimeout(handleSaveSettings, 500);
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'light'
                    ? 'border-neon-orange bg-neon-orange/10'
                    : 'border-gaming-border hover:border-neon-orange/50'
                }`}
              >
                <Sun className="w-8 h-8 mx-auto mb-2 text-neon-orange" />
                <span className="text-gaming-text font-medium">Aydınlık Mod</span>
                {theme === 'light' && (
                  <div className="mt-2">
                    <Check className="w-5 h-5 mx-auto text-neon-orange" />
                  </div>
                )}
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
              <p className="text-sm text-gaming-muted">
                {settings.twoFactorEnabled
                  ? 'Hesabınız 2FA ile korunuyor'
                  : 'Hesabınızı ekstra güvenlik katmanı ile koruyun'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {settings.twoFactorEnabled && (
                <div className="flex items-center space-x-2 text-neon-green">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Aktif</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (settings.twoFactorEnabled) {
                    // Disable 2FA
                    updateSetting('', 'twoFactorEnabled', false);
                    handleSaveSettings();
                  } else {
                    // Start setup process
                    setShowTwoFactorSetup(true);
                    setTwoFactorStep('intro');
                    generateTwoFactorSecret();
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  settings.twoFactorEnabled
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                }`}
              >
                {settings.twoFactorEnabled ? 'Devre Dışı Bırak' : 'Kurulum Başlat'}
              </button>
            </div>
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

      {/* Two-Factor Authentication Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/95 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full border border-gaming-border">
            {/* Step 1: Introduction */}
            {twoFactorStep === 'intro' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="text-2xl font-bold text-gaming-text mb-4">İki Adımlı Doğrulama</h3>
                <p className="text-gaming-muted mb-6">
                  Hesabınızı ekstra güvenlik katmanı ile koruyun. Bu özelliği aktifleştirmek için:
                </p>
                <div className="space-y-3 text-left mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-purple rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span className="text-gaming-text">Google Authenticator veya benzeri bir uygulama indirin</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-purple rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span className="text-gaming-text">QR kodu tarayarak hesabınızı ekleyin</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-purple rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <span className="text-gaming-text">Uygulamadan alacağınız kodu girerek doğrulayın</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowTwoFactorSetup(false)}
                    className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => setTwoFactorStep('qr')}
                    className="flex-1 px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors"
                  >
                    Devam Et
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: QR Code */}
            {twoFactorStep === 'qr' && (
              <div className="text-center">
                <h3 className="text-xl font-bold text-gaming-text mb-6">QR Kodu Tarayın</h3>

                <div className="bg-white p-4 rounded-lg mb-6 mx-auto w-fit">
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                <div className="bg-gaming-surface/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gaming-muted mb-2">Manuel giriş için secret key:</p>
                  <code className="text-neon-cyan font-mono text-sm break-all bg-gaming-bg px-2 py-1 rounded">
                    {generatedSecret}
                  </code>
                </div>

                <p className="text-gaming-muted text-sm mb-6">
                  Google Authenticator, Authy veya benzeri bir uygulamada QR kodu tarayın.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setTwoFactorStep('intro')}
                    className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={() => setTwoFactorStep('verify')}
                    className="flex-1 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
                  >
                    Doğrula
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {twoFactorStep === 'verify' && (
              <div className="text-center">
                <h3 className="text-xl font-bold text-gaming-text mb-6">Kodu Doğrulayın</h3>

                <p className="text-gaming-muted mb-6">
                  Authenticator uygulamanızdan 6 haneli kodu girin:
                </p>

                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-32 h-12 text-center text-2xl font-mono bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text mx-auto block mb-6"
                />

                {verificationCode.length === 6 && !/^\d{6}$/.test(verificationCode) && (
                  <p className="text-red-400 text-sm mb-4">L��tfen 6 haneli sayı girin</p>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setTwoFactorStep('qr')}
                    className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={() => {
                      if (verifyTwoFactorCode()) {
                        setTwoFactorStep('backup');
                      } else {
                        alert('Geçersiz kod. Lütfen tekrar deneyin.');
                      }
                    }}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors disabled:opacity-50"
                  >
                    Doğrula
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Backup Codes */}
            {twoFactorStep === 'backup' && (
              <div>
                <h3 className="text-xl font-bold text-gaming-text mb-6 text-center">Yedek Kodlarınız</h3>

                <div className="bg-neon-orange/10 border border-neon-orange/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-neon-orange" />
                    <span className="font-medium text-neon-orange">ÖNEMLİ!</span>
                  </div>
                  <p className="text-sm text-gaming-text">
                    Bu kodları güvenli bir yerde saklayın. Telefonunuza erişim kaybettiğinizde hesabınıza giriş yapmanız için gereklidir.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-gaming-surface p-3 rounded-lg font-mono text-center text-gaming-text">
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const codesText = backupCodes.join('\n');
                    navigator.clipboard?.writeText(codesText);
                    alert('Yedek kodlar panoya kopyalandı!');
                  }}
                  className="w-full px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors mb-4"
                >
                  Kodları Kopyala
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setTwoFactorStep('verify')}
                    className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={completeTwoFactorSetup}
                    className="flex-1 px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors"
                  >
                    Kurulumu Tamamla
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
                ��ptal
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
