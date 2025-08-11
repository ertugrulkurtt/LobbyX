import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, UserCheck, Clock, Mail } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gaming-bg relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-32 h-32 bg-neon-cyan/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-neon-purple/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-neon-pink/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 text-gaming-muted hover:text-neon-cyan transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kayıt sayfasına dön</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neon mb-2">LobbyX</h1>
            <h2 className="text-2xl font-bold text-gaming-text">Gizlilik Sözleşmesi</h2>
            <p className="text-gaming-muted mt-2">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="card-glass backdrop-blur-xl bg-gaming-surface/20 border border-gaming-border/50">
          <div className="space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-neon-cyan" />
                <h3 className="text-xl font-semibold text-gaming-text">Giriş</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                LobbyX ("biz", "bizim", "platform") olarak, kullanıcılarımızın gizliliğini korumaya kararlıyız. 
                Bu Gizlilik Sözleşmesi, platformumuzu kullandığınızda kişisel verilerinizin nasıl toplandığını, 
                kullanıldığını ve korunduğunu açıklar.
              </p>
            </section>

            {/* Data Collection */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Database className="w-6 h-6 text-neon-purple" />
                <h3 className="text-xl font-semibold text-gaming-text">Toplanan Bilgiler</h3>
              </div>
              <div className="space-y-3">
                <p className="text-gaming-muted leading-relaxed">
                  Platformumuzu kullanırken aşağıdaki bilgileri topluyoruz:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gaming-muted ml-4">
                  <li>Hesap bilgileri (kullanıcı adı, ad, soyad, e-posta, telefon numarası)</li>
                  <li>Profil bilgileri (doğum tarihi, profil fotoğrafı, oyun tercihleri)</li>
                  <li>Platform kullanım verileri (giriş zamanları, mesajlar, arkadaşlık etkileşimleri)</li>
                  <li>Teknik bilgiler (IP adresi, cihaz bilgileri, tarayıcı türü)</li>
                  <li>İletişim geçmişi ve sohbet kayıtları</li>
                </ul>
              </div>
            </section>

            {/* Data Usage */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-6 h-6 text-neon-green" />
                <h3 className="text-xl font-semibold text-gaming-text">Bilgilerin Kullanımı</h3>
              </div>
              <div className="space-y-3">
                <p className="text-gaming-muted leading-relaxed">
                  Topladığımız bilgileri şu amaçlarla kullanırız:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gaming-muted ml-4">
                  <li>Hesap oluşturma ve kimlik doğrulama</li>
                  <li>Platform hizmetlerinin sağlanması ve geliştirilmesi</li>
                  <li>Kullanıcı deneyiminin kişiselleştirilmesi</li>
                  <li>Güvenlik önlemlerinin uygulanması</li>
                  <li>Teknik destek ve müşteri hizmetleri</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                </ul>
              </div>
            </section>

            {/* Data Protection */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-6 h-6 text-neon-orange" />
                <h3 className="text-xl font-semibold text-gaming-text">Veri Güvenliği</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. 
                Verileriniz şifrelenerek saklanır ve yetkisiz erişime karşı korunur. Ancak, 
                internet üzerinden veri iletiminin %100 güvenli olmadığını hatırlatırız.
              </p>
            </section>

            {/* Data Retention */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-neon-pink" />
                <h3 className="text-xl font-semibold text-gaming-text">Veri Saklama</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                Kişisel verilerinizi, yasal yükümlülüklerimizi yerine getirmek ve hizmetlerimizi 
                sağlamak için gerekli olan süre boyunca saklarız. Hesabınızı silmeniz durumunda, 
                verileriniz 30 gün içinde sistemlerimizden kalıcı olarak silinir.
              </p>
            </section>

            {/* User Rights */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-neon-cyan" />
                <h3 className="text-xl font-semibold text-gaming-text">Kullanıcı Hakları</h3>
              </div>
              <div className="space-y-3">
                <p className="text-gaming-muted leading-relaxed">
                  KVKK kapsamında aşağıdaki haklara sahipsiniz:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gaming-muted ml-4">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                  <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-6 h-6 text-neon-purple" />
                <h3 className="text-xl font-semibold text-gaming-text">İletişim</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                Gizlilik politikamız hakkında sorularınız varsa veya haklarınızı kullanmak istiyorsanız, 
                bizimle <span className="text-neon-cyan">privacy@lobbyx.com</span> adresinden iletişime geçebilirsiniz.
              </p>
            </section>

            {/* Updates */}
            <section className="space-y-4 border-t border-gaming-border/30 pt-6">
              <h3 className="text-xl font-semibold text-gaming-text">Güncellemeler</h3>
              <p className="text-gaming-muted leading-relaxed">
                Bu Gizlilik Sözleşmesi'ni zaman zaman güncelleyebiliriz. Önemli değişiklikler 
                durumunda size bildirim göndereceğiz. Bu sayfayı düzenli olarak kontrol etmenizi öneririz.
              </p>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/terms"
            className="px-6 py-3 bg-gaming-surface/50 hover:bg-gaming-surface/70 border border-gaming-border rounded-xl text-gaming-text hover:text-neon-cyan transition-all duration-300 text-center"
          >
            Kullanım Şartları
          </Link>
          <Link
            to="/register"
            className="btn-neon"
          >
            Kayıt Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
