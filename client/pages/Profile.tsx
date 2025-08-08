import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: 'Gaming enthusiast, competitive player, always looking for new challenges!'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const profileStats = [
    { label: 'Toplam Mesaj', value: '2,847', icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Arkadaş Sayısı', value: '47', icon: Users, color: 'text-neon-green' },
    { label: 'Aktiflik Süresi', value: '128 saat', icon: Clock, color: 'text-neon-orange' },
    { label: 'Başarımlar', value: '23', icon: Trophy, color: 'text-neon-pink' },
  ];

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: editData.displayName,
        username: editData.username
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      displayName: user?.displayName || '',
      username: user?.username || '',
      bio: 'Gaming enthusiast, competitive player, always looking for new challenges!'
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-purple/10 via-neon-cyan/10 to-neon-pink/10 p-8">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                user?.username === 'LobbyXAdmin' 
                  ? 'bg-gradient-to-br from-neon-cyan to-neon-blue' 
                  : 'bg-gradient-to-br from-neon-purple to-neon-cyan'
              }`}>
                <User className="w-16 h-16 text-white" />
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center hover:bg-neon-purple/80 transition-colors">
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
                      user?.username === 'LobbyXAdmin' ? 'text-neon-cyan' : 'text-gaming-text'
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
                  <p className="text-gaming-muted mb-4">@{user?.username}</p>
                  <p className="text-gaming-text max-w-md">{editData.bio}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Profili Düzenle</span>
                  </button>
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
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {profileStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card-glass text-center hover:shadow-glow transition-all duration-300 animate-scale-in"
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
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass">
            <h3 className="text-lg font-semibold text-gaming-text mb-4">Güvenlik</h3>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors text-left">
                Şifre Değiştir
              </button>
              <button className="w-full px-4 py-2 bg-neon-orange/20 text-neon-orange rounded-lg hover:bg-neon-orange/30 transition-colors text-left">
                İki Faktörlü Doğrulama
              </button>
              <button className="w-full px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-left">
                Oturum Geçmişi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="text-2xl font-bold text-gaming-text mb-6">Tercihler</h2>
        
        <div className="card-glass">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gaming-text mb-4">Tema</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    defaultChecked 
                    className="w-4 h-4 text-neon-purple"
                  />
                  <span className="text-gaming-text">Karanlık Mod</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    className="w-4 h-4 text-neon-purple"
                  />
                  <span className="text-gaming-text">Aydınlık Mod</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gaming-text mb-4">Bildirimler</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gaming-text">Mesaj Bildirimleri</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gaming-text">Arkadaş İstekleri</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gaming-text">Grup Davetleri</span>
                  <input type="checkbox" className="toggle" />
                </label>
              </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gaming-surface rounded-2xl p-6 max-w-md mx-4 border border-red-500/30">
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
