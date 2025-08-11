import React, { useState, useRef } from 'react';
import {
  User,
  Edit3,
  Save,
  X,
  Shield,
  Trophy,
  MessageSquare,
  Users,
  Clock,
  Camera,
  Check,
  AlertTriangle,
  Lock,
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Palette,
  Image,
  Star,
  Award,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadProfilePhoto } from '../lib/storage';
import { useUserStats } from '../hooks/useUserStats';

// Note: User statistics are now handled by useUserStats hook

// Session data
const getSessionHistory = () => [
  {
    id: '1',
    device: 'Windows PC',
    location: 'İstanbul, Türkiye',
    ip: '192.168.1.***',
    loginTime: '2 dakika önce',
    isActive: true,
    browser: 'Chrome 120'
  },
  {
    id: '2',
    device: 'iPhone 15',
    location: 'İstanbul, Türkiye',
    ip: '10.0.0.***',
    loginTime: '2 saat önce',
    isActive: false,
    browser: 'Safari Mobile'
  },
  {
    id: '3',
    device: 'Android',
    location: 'Ankara, Türkiye',
    ip: '172.16.0.***',
    loginTime: '1 gün önce',
    isActive: false,
    browser: 'Chrome Mobile'
  }
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { stats, loading: statsLoading, error: statsError, formatActiveTime, formatJoinDate, formatLastActivity } = useUserStats();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [editData, setEditData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: user?.bio || 'Gaming enthusiast, competitive player, always looking for new challenges!',
    status: user?.status || '🎮 Ready to game!'
  });

  const [customization, setCustomization] = useState({
    profileBackground: user?.customization?.profileBackground || 'gradient-1',
    themeColor: user?.customization?.themeColor || 'purple',
    backgroundType: user?.customization?.backgroundType || 'gradient',
    profileFrame: user?.customization?.profileFrame || 'none'
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Two-factor state
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);

  // Profile background options
  const backgroundOptions = {
    gradient: [
      { id: 'gradient-1', name: 'Neon Purple', class: 'bg-gradient-to-br from-neon-purple/30 via-neon-cyan/20 to-neon-pink/30' },
      { id: 'gradient-2', name: 'Cyber Blue', class: 'bg-gradient-to-br from-neon-cyan/30 via-neon-blue/20 to-neon-green/30' },
      { id: 'gradient-3', name: 'Gaming Red', class: 'bg-gradient-to-br from-red-500/30 via-neon-orange/20 to-neon-pink/30' },
      { id: 'gradient-4', name: 'Matrix Green', class: 'bg-gradient-to-br from-neon-green/30 via-green-400/20 to-neon-cyan/30' },
      { id: 'gradient-5', name: 'Royal Gold', class: 'bg-gradient-to-br from-yellow-500/30 via-neon-orange/20 to-red-500/30' }
    ],
    color: [
      { id: 'purple', name: 'Purple', class: 'bg-neon-purple/20' },
      { id: 'cyan', name: 'Cyan', class: 'bg-neon-cyan/20' },
      { id: 'pink', name: 'Pink', class: 'bg-neon-pink/20' },
      { id: 'green', name: 'Green', class: 'bg-neon-green/20' },
      { id: 'orange', name: 'Orange', class: 'bg-neon-orange/20' }
    ]
  };

  // Theme color options
  const themeColors = [
    { id: 'purple', name: 'Purple', primary: 'text-neon-purple', bg: 'bg-neon-purple' },
    { id: 'cyan', name: 'Cyan', primary: 'text-neon-cyan', bg: 'bg-neon-cyan' },
    { id: 'pink', name: 'Pink', primary: 'text-neon-pink', bg: 'bg-neon-pink' },
    { id: 'green', name: 'Green', primary: 'text-neon-green', bg: 'bg-neon-green' },
    { id: 'orange', name: 'Orange', primary: 'text-neon-orange', bg: 'bg-neon-orange' },
    { id: 'blue', name: 'Blue', primary: 'text-neon-blue', bg: 'bg-neon-blue' }
  ];

  // Profile frames
  const profileFrames = [
    { id: 'none', name: 'None', class: '' },
    { id: 'gold', name: 'Gold Elite', class: 'ring-4 ring-yellow-500/50' },
    { id: 'diamond', name: 'Diamond', class: 'ring-4 ring-cyan-500/50' },
    { id: 'legendary', name: 'Legendary', class: 'ring-4 ring-purple-500/50 ring-offset-2 ring-offset-purple-500/20' }
  ];

  const sessionHistory = getSessionHistory();

  // Create profile stats from real user statistics
  const profileStats = stats ? [
    { label: 'Toplam Mesaj', value: stats.totalMessages.toLocaleString(), icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Arkadaş Sayısı', value: stats.friendCount.toString(), icon: Users, color: 'text-neon-green' },
    { label: 'Aktiflik Süresi', value: formatActiveTime(stats.activeHours), icon: Clock, color: 'text-neon-orange' },
    { label: 'Başarımlar', value: stats.achievements.toString(), icon: Trophy, color: 'text-neon-pink' },
  ] : [
    { label: 'Toplam Mesaj', value: '0', icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Arkadaş Sayısı', value: '0', icon: Users, color: 'text-neon-green' },
    { label: 'Aktiflik Süresi', value: '0 dakika', icon: Clock, color: 'text-neon-orange' },
    { label: 'Başarımlar', value: '0', icon: Trophy, color: 'text-neon-pink' },
  ];

  // Get current profile background class
  const getCurrentBackgroundClass = () => {
    const backgroundType = user?.customization?.backgroundType || customization.backgroundType;
    const backgroundId = user?.customization?.profileBackground || customization.profileBackground;
    
    if (backgroundType === 'gradient') {
      const gradient = backgroundOptions.gradient.find(g => g.id === backgroundId);
      return gradient?.class || backgroundOptions.gradient[0].class;
    } else {
      const color = backgroundOptions.color.find(c => c.id === backgroundId);
      return color?.class || backgroundOptions.color[0].class;
    }
  };

  // Get current theme color
  const getCurrentThemeColor = () => {
    const themeColorId = user?.customization?.themeColor || customization.themeColor;
    const theme = themeColors.find(t => t.id === themeColorId);
    return theme || themeColors[0];
  };

  // Get current profile frame
  const getCurrentProfileFrame = () => {
    const frameId = user?.customization?.profileFrame || customization.profileFrame;
    const frame = profileFrames.find(f => f.id === frameId);
    return frame?.class || '';
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: editData.displayName,
        username: editData.username,
        bio: editData.bio,
        status: editData.status
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Profil güncellenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleCustomizationSave = async () => {
    try {
      await updateProfile({
        customization: customization
      });
      setShowCustomizationModal(false);
    } catch (error) {
      console.error('Customization update failed:', error);
      alert('Özelleştirme kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleCancel = () => {
    setEditData({
      displayName: user?.displayName || '',
      username: user?.username || '',
      bio: user?.bio || 'Gaming enthusiast, competitive player, always looking for new challenges!',
      status: user?.status || '🎮 Ready to game!'
    });
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    setIsUploading(true);

    try {
      console.log('Starting photo upload for user:', user.uid);

      // Use the storage service to upload the photo
      const result = await uploadProfilePhoto(file, user.uid);

      if (result.success && result.url) {
        console.log('Photo uploaded successfully. URL:', result.url);

        // Update user profile with new photo URL
        await updateProfile({ photoURL: result.url });

        alert('Profil fotoğrafı başarıyla güncellendi!');

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error('Upload failed:', result.error);
        alert(result.error || 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
      }

    } catch (error: any) {
      console.error('Fotoğraf yükleme hatası:', error);
      alert(`Fotoğraf yüklenemedi: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      // In real app: Firebase Auth password update
      // await updatePassword(auth.currentUser, passwordData.newPassword);
      console.log('Password change:', passwordData);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Şifre başarıyla değiştirildi!');
    } catch (error) {
      alert('Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.');
    }
  };

  const handleTwoFactorSetup = () => {
    // In real app: Setup 2FA with Firebase or other service
    console.log('2FA setup with code:', twoFactorCode.join(''));
    setShowTwoFactorModal(false);
    setTwoFactorCode(['', '', '', '', '', '']);
    alert('İki faktörlü doğrulama başarıyla aktifleştirildi!');
  };

  const handleCodeInput = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...twoFactorCode];
      newCode[index] = value;
      setTwoFactorCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Profile Header */}
      <section className={`relative overflow-hidden rounded-3xl ${getCurrentBackgroundClass()} p-8`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                user?.username === 'LobbyXAdmin' 
                  ? 'bg-gradient-to-br from-neon-cyan to-neon-blue' 
                  : `bg-gradient-to-br from-${getCurrentThemeColor().id} to-neon-cyan`
              } ${getCurrentProfileFrame()} ${isUploading ? 'opacity-50' : ''}`}>
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-2 right-2 w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center hover:bg-neon-purple/80 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-2">
                      Görünen Ad
                    </label>
                    <input
                      type="text"
                      value={editData.displayName}
                      onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                      className="w-full px-4 py-2 bg-gaming-surface rounded-lg border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-2">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({...editData, username: e.target.value})}
                      className="w-full px-4 py-2 bg-gaming-surface rounded-lg border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-2">
                      Durum Mesajı
                    </label>
                    <input
                      type="text"
                      value={editData.status}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                      placeholder="🎮 Ready to game!"
                      className="w-full px-4 py-2 bg-gaming-surface rounded-lg border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-2">
                      Hakkında
                    </label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 bg-gaming-surface rounded-lg border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text resize-none"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Kaydet</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>İptal</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                    <h1 className={`text-3xl font-bold ${
                      user?.username === 'LobbyXAdmin' ? 'text-neon-cyan' : getCurrentThemeColor().primary
                    }`}>
                      {user?.displayName || 'Kullanıcı'}
                    </h1>
                    {user?.username === 'LobbyXAdmin' && (
                      <>
                        <div className="flex items-center justify-center w-6 h-6 bg-neon-cyan rounded-full">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <Shield className="w-6 h-6 text-neon-cyan" />
                      </>
                    )}
                  </div>
                  <p className="text-gaming-muted mb-2">@{user?.username}</p>
                  <p className={`text-sm mb-4 ${getCurrentThemeColor().primary}`}>{user?.status || editData.status}</p>
                  <p className="text-gaming-text max-w-md">{editData.bio}</p>
                  <div className="flex items-center space-x-4 mt-4 text-sm text-gaming-muted">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Katılma: {stats ? formatJoinDate(stats.joinDate) : 'Yükleniyor...'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Son aktiflik: {stats ? formatLastActivity(stats.lastActivity) : 'Yükleniyor...'}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`px-4 py-2 ${getCurrentThemeColor().bg} text-white rounded-lg hover:opacity-80 transition-colors flex items-center space-x-2`}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Profili Düzenle</span>
                    </button>
                    <button
                      onClick={() => setShowCustomizationModal(true)}
                      className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors flex items-center space-x-2 border border-gaming-border"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Özelleştir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <h2 className="text-2xl font-bold text-gaming-text mb-6 flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-neon-orange" />
          <span>İstatistiklerim</span>
          {statsLoading && (
            <div className="w-4 h-4 border border-neon-orange border-t-transparent rounded-full animate-spin"></div>
          )}
        </h2>

        {statsError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-center">{statsError}</p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {profileStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`card-glass text-center hover:shadow-glow transition-all duration-300 animate-scale-in ${
                  statsLoading ? 'opacity-50' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold text-gaming-text mb-1">
                  {statsLoading ? '...' : stat.value}
                </div>
                <div className="text-sm text-gaming-muted">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Account Information */}
      <section>
        <h2 className="text-2xl font-bold text-gaming-text mb-6">Hesap Bilgileri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-glass">
            <h3 className="text-lg font-semibold text-gaming-text mb-4">Kişisel Bilgiler</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gaming-muted">E-posta</label>
                <p className="text-gaming-text">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gaming-muted">Telefon</label>
                <p className="text-gaming-text">{user?.phoneNumber || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <label className="text-sm text-gaming-muted">Hesap Oluşturma</label>
                <p className="text-gaming-text">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : (stats ? formatJoinDate(stats.joinDate) : 'Bilinmiyor')}
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass">
            <h3 className="text-lg font-semibold text-gaming-text mb-4">Güvenlik</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors text-left"
              >
                Şifre Değiştir
              </button>
              <button 
                onClick={() => setShowTwoFactorModal(true)}
                className="w-full px-4 py-2 bg-neon-orange/20 text-neon-orange rounded-lg hover:bg-neon-orange/30 transition-colors text-left"
              >
                İki Faktörlü Doğrulama
              </button>
              <button 
                onClick={() => setShowSessionModal(true)}
                className="w-full px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-left"
              >
                Oturum Geçmişi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      {user?.username !== 'LobbyXAdmin' && (
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-6">Tehlikeli Bölge</h2>
          
          <div className="card-glass border-red-500/30">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gaming-text">Hesabı Sil</h3>
                <p className="text-gaming-muted">Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Hesabı Sil
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Customization Modal */}
      {showCustomizationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-gaming-border max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gaming-text mb-6 flex items-center space-x-2">
              <Palette className="w-6 h-6" />
              <span>Profil Özelleştirme</span>
            </h3>
            
            <div className="space-y-6">
              {/* Background Type Selection */}
              <div>
                <h4 className="text-lg font-semibold text-gaming-text mb-3">Arka Plan Türü</h4>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCustomization({...customization, backgroundType: 'gradient'})}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      customization.backgroundType === 'gradient' 
                        ? 'bg-neon-purple text-white' 
                        : 'bg-gaming-surface text-gaming-text border border-gaming-border'
                    }`}
                  >
                    Gradyan
                  </button>
                  <button
                    onClick={() => setCustomization({...customization, backgroundType: 'color'})}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      customization.backgroundType === 'color' 
                        ? 'bg-neon-purple text-white' 
                        : 'bg-gaming-surface text-gaming-text border border-gaming-border'
                    }`}
                  >
                    Düz Renk
                  </button>
                </div>
              </div>

              {/* Background Selection */}
              <div>
                <h4 className="text-lg font-semibold text-gaming-text mb-3">Arka Plan</h4>
                <div className="grid grid-cols-3 gap-3">
                  {backgroundOptions[customization.backgroundType as keyof typeof backgroundOptions].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setCustomization({...customization, profileBackground: bg.id})}
                      className={`h-20 rounded-lg ${bg.class} border-2 transition-all ${
                        customization.profileBackground === bg.id 
                          ? 'border-neon-purple' 
                          : 'border-gaming-border hover:border-gaming-border/60'
                      }`}
                      title={bg.name}
                    >
                      <div className="h-full w-full rounded-md flex items-center justify-center text-xs text-white font-medium">
                        {bg.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color Selection */}
              <div>
                <h4 className="text-lg font-semibold text-gaming-text mb-3">Tema Rengi</h4>
                <div className="grid grid-cols-6 gap-3">
                  {themeColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setCustomization({...customization, themeColor: color.id})}
                      className={`h-12 w-12 rounded-full ${color.bg} border-2 transition-all ${
                        customization.themeColor === color.id 
                          ? 'border-white' 
                          : 'border-gaming-border hover:border-gaming-border/60'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Profile Frame Selection */}
              <div>
                <h4 className="text-lg font-semibold text-gaming-text mb-3">Profil Çerçevesi</h4>
                <div className="grid grid-cols-4 gap-3">
                  {profileFrames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setCustomization({...customization, profileFrame: frame.id})}
                      className={`p-3 rounded-lg border transition-all ${
                        customization.profileFrame === frame.id 
                          ? 'border-neon-purple bg-gaming-surface' 
                          : 'border-gaming-border hover:border-gaming-border/60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-neon-purple/20 mx-auto ${frame.class}`}></div>
                      <p className="text-xs text-gaming-text mt-2">{frame.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCustomizationModal(false)}
                className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCustomizationSave}
                className="flex-1 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface rounded-2xl p-6 max-w-md w-full border border-gaming-border">
            <h3 className="text-xl font-bold text-gaming-text mb-6">Şifre Değiştir</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Mevcut Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 pr-10 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-muted"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 pr-10 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-muted"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Yeni Şifre Tekrar
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 pr-10 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-muted"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-2 bg-neon-cyan text-white rounded-lg hover:bg-neon-cyan/80 transition-colors"
              >
                Değiştir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface rounded-2xl p-6 max-w-md w-full border border-gaming-border">
            <h3 className="text-xl font-bold text-gaming-text mb-6">İki Faktörlü Doğrulama</h3>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neon-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-neon-orange" />
              </div>
              <p className="text-gaming-muted">
                Doğrulama uygulamanızdan 6 haneli kodu girin
              </p>
            </div>

            <div className="flex space-x-2 mb-6 justify-center">
              {twoFactorCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  className="w-12 h-12 text-center bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-orange/50 text-gaming-text text-lg font-bold"
                />
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleTwoFactorSetup}
                disabled={twoFactorCode.some(code => !code)}
                className="flex-1 px-4 py-2 bg-neon-orange text-white rounded-lg hover:bg-neon-orange/80 transition-colors disabled:opacity-50"
              >
                Aktifleştir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session History Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-gaming-border">
            <h3 className="text-xl font-bold text-gaming-text mb-6">Oturum Geçmişi</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sessionHistory.map((session) => (
                <div key={session.id} className="card-glass border border-gaming-border/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gaming-surface rounded-lg flex items-center justify-center">
                      {session.device.includes('PC') ? (
                        <Monitor className="w-6 h-6 text-gaming-muted" />
                      ) : (
                        <Smartphone className="w-6 h-6 text-gaming-muted" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gaming-text">{session.device}</h4>
                        {session.isActive && (
                          <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gaming-muted">{session.browser}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gaming-muted">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{session.location}</span>
                        </span>
                        <span>IP: {session.ip}</span>
                        <span>{session.loginTime}</span>
                      </div>
                    </div>
                    
                    {!session.isActive && (
                      <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                        Sonlandır
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface rounded-2xl p-6 max-w-md w-full border border-red-500/30">
            <h3 className="text-xl font-bold text-gaming-text mb-4">Hesabı Sil</h3>
            <p className="text-gaming-muted mb-6">
              Bu işlem geri alınamaz. Hesabınızı silmek istediğinizden emin misiniz?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
              >
                İptal
              </button>
              <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-500/80 transition-colors">
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
