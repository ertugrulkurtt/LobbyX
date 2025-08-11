import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle, Gavel, Clock } from 'lucide-react';

export default function Terms() {
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
            <h2 className="text-2xl font-bold text-gaming-text">Kullanım Şartları</h2>
            <p className="text-gaming-muted mt-2">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="card-glass backdrop-blur-xl bg-gaming-surface/20 border border-gaming-border/50">
          <div className="space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-neon-cyan" />
                <h3 className="text-xl font-semibold text-gaming-text">Kabul ve Onay</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                LobbyX platformunu kullanarak, bu Kullanım Şartları'nı okuduğunuzu, anladığınızı ve 
                bunlara uymayı kabul ettiğinizi beyan edersiniz. Bu şartları kabul etmiyorsanız, 
                platformumuzu kullanmamanız gerekmektedir.
              </p>
            </section>

            {/* Platform Description */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-neon-purple" />
                <h3 className="text-xl font-semibold text-gaming-text">Platform Tanımı</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                LobbyX, oyuncuların bir araya gelerek sohbet edebileceği, arkadaşlık kurabileceği ve 
                oyun deneyimlerini paylaşabileceği sosyal bir platformdur. Platform, 13 yaş ve üzeri 
                kullanıcılar için tasarlanmıştır.
              </p>
            </section>

            {/* User Obligations */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-neon-green" />
                <h3 className="text-xl font-semibold text-gaming-text">Kullanıcı Yükümlülükleri</h3>
              </div>
              <div className="space-y-3">
                <p className="text-gaming-muted leading-relaxed">
                  Platformumuzu kullanırken aşağıdaki kurallara uymanız gerekmektedir:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gaming-muted ml-4">
                  <li>Doğru ve güncel bilgiler sağlamak</li>
                  <li>Hesap güvenliğinizi korumak ve şifrenizi kimseyle paylaşmamak</li>
                  <li>Diğer kullanıcılara saygılı davranmak</li>
                  <li>Spam, reklam veya zararlı içerik paylaşmamak</li>
                  <li>Telif hakkı ihlali yapan içerikler paylaşmamak</li>
                  <li>Platform güvenliğini tehlikeye atabilecek eylemlerden kaçınmak</li>
                  <li>Yasal olmayan faaliyetlerde bulunmamak</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-neon-orange" />
                <h3 className="text-xl font-semibold text-gaming-text">Yasaklanan Faaliyetler</h3>
              </div>
              <div className="space-y-3">
                <p className="text-gaming-muted leading-relaxed">
                  Aşağıdaki faaliyetler kesinlikle yasaktır ve hesabınız��n kapatılmasına yol açabilir:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gaming-muted ml-4">
                  <li>Nefret söylemi, taciz, zorbalık veya tehdit içeren davranışlar</li>
                  <li>Sahte hesap oluşturma veya kimlik hırsızlığı</li>
                  <li>Platform sistemlerine yetkisiz erişim veya hacking girişimleri</li>
                  <li>Bot, script veya otomatik araçlar kullanımı</li>
                  <li>Uygunsuz veya müstehcen içerik paylaşımı</li>
                  <li>Diğer kullanıcıların kişisel bilgilerini izinsiz paylaşma</li>
                  <li>Platform kurallarını kasıtlı olarak ihlal etme</li>
                </ul>
              </div>
            </section>

            {/* Content and Intellectual Property */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Gavel className="w-6 h-6 text-neon-pink" />
                <h3 className="text-xl font-semibold text-gaming-text">İçerik ve Fikri Mülkiyet</h3>
              </div>
              <div className="space-y-3">
                <p className="text-gaming-muted leading-relaxed">
                  Platform üzerinde paylaştığınız içeriklerle ilgili haklar:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gaming-muted ml-4">
                  <li>Paylaştığınız içeriklerin sorumluluğu size aittir</li>
                  <li>İçeriklerinizin yasal haklara sahip olduğunuzu garanti edersiniz</li>
                  <li>LobbyX'e içeriklerinizi platform üzerinde kullanma hakkı verirsiniz</li>
                  <li>Telif hakkı ihlali durumunda içerikler kaldırılabilir</li>
                  <li>Platform tasarımı ve yazılımı LobbyX'in fikri mülkiyetidir</li>
                </ul>
              </div>
            </section>

            {/* Service Availability */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-neon-cyan" />
                <h3 className="text-xl font-semibold text-gaming-text">Hizmet Kullanılabilirliği</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                Platform hizmetlerinin %100 kesintisiz olacağını garanti edemeyiz. Bakım, güncelleme 
                veya teknik sorunlar nedeniyle geçici kesintiler yaşanabilir. Bu durumlar için 
                önceden bildirim vermeye çalışırız ancak acil durumlarda anında müdahale gerekebilir.
              </p>
            </section>

            {/* Account Termination */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-neon-orange" />
                <h3 className="text-xl font-semibold text-gaming-text">Hesap Sonlandırma</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                Bu şartları ihlal etmeniz durumunda hesabınızı uyarı vermeden askıya alabilir veya 
                kalıcı olarak kapatabiliriz. Ayrıca, istediğiniz zaman hesabınızı kendiniz de 
                kapatabilirsiniz. Hesap kapatma durumunda verileriniz gizlilik politikamıza uygun 
                şekilde işlenir.
              </p>
            </section>

            {/* Liability */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-neon-purple" />
                <h3 className="text-xl font-semibold text-gaming-text">Sorumluluk Sınırlaması</h3>
              </div>
              <p className="text-gaming-muted leading-relaxed">
                LobbyX, platform kullanımından kaynaklanan doğrudan veya dolaylı zararlar için 
                sorumlu tutulamaz. Platform "olduğu gibi" sunulmaktadır ve hiçbir garanti verilmemektedir. 
                Kullanıcılar platformu kendi risk ve sorumluluklarında kullanır.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="space-y-4 border-t border-gaming-border/30 pt-6">
              <h3 className="text-xl font-semibold text-gaming-text">Şart Değişiklikleri</h3>
              <p className="text-gaming-muted leading-relaxed">
                Bu Kullanım Şartları'nı zaman zaman güncelleyebiliriz. Önemli değişiklikler için 
                size bildirim göndereceğiz. Güncelleme sonrası platformu kullanmaya devam etmeniz, 
                yeni şartları kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            {/* Governing Law */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gaming-text">Geçerli Hukuk</h3>
              <p className="text-gaming-muted leading-relaxed">
                Bu şartlar Türkiye Cumhuriyeti hukuku kapsamında yorumlanır ve uygulanır. 
                Uyuşmazlıklar İstanbul mahkemelerinde çözümlenir.
              </p>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/privacy"
            className="px-6 py-3 bg-gaming-surface/50 hover:bg-gaming-surface/70 border border-gaming-border rounded-xl text-gaming-text hover:text-neon-cyan transition-all duration-300 text-center"
          >
            Gizlilik Sözleşmesi
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
