# Firebase Kurulum Rehberi

Bu rehber, LobbyX uygulaması için Firebase'i doğru şekilde yapılandırmanızı sağlar.

## 🚀 Hızlı Kurulum Adımları

### 1. Firebase Console'a Giriş
1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. `lobbyx-87c98` projesini seçin

### 2. Authentication Kurulumu
1. **Authentication** → **Sign-in method**'a gidin
2. **Email/Password** yöntemini etkinleştirin
3. **Authorized domains** kısmına domain'inizi ekleyin

### 3. Firestore Database Kurulumu
1. **Firestore Database**'e gidin
2. **Rules** sekmesine tıklayın
3. Aşağıdaki kuralları kopyalayıp yapıştırın:

```javascript
// firestore.rules dosyasının içeriğini buraya kopyalayın
```

4. **Publish** butonuna tıklayın

### 4. Storage Kurulumu
1. **Storage**'a gidin
2. **Rules** sekmesine tıklayın
3. `storage.rules` dosyasındaki kuralları kopyalayıp yapıştırın
4. **Publish** butonına tıklayın

### 5. Realtime Database Kurulumu (Opsiyonel)
1. **Realtime Database**'e gidin
2. **Create Database** seçin
3. **Test mode** seçin (geliştirme için)

## 🔧 Detaylı Yapılandırma

### Firestore Koleksiyonları
Uygulamanız şu koleksiyonları kullanır:

- `users` - Kullanıcı profilleri
- `userStats` - Kullanıcı istatistikleri
- `friendRequests` - Arkadaşlık istekleri
- `friendships` - Arkadaşlık ilişkileri
- `conversations` - Sohbet konuşmaları
  - `messages` (subcollection) - Mesajlar
- `notifications` - Bildirimler
- `groups` - Gruplar
- `servers` - Sunucular
- `dailyActivity` - Günlük aktivite
- `xpLogs` - XP kayıtları

### Storage Dizin Yapısı
```
storage/
├── profileImages/{userId}/{fileName}
├── attachments/{conversationId}/{messageId}/{fileName}
├── groupFiles/{groupId}/{fileName}
├── voiceMessages/{conversationId}/{messageId}/{fileName}
├── temp/{userId}/{fileName}
└── public/{fileName}
```

## 🛠️ Hata Giderme

### "Missing or insufficient permissions" Hatası
1. Firestore Rules'ın doğru deploy edildiğinden emin olun
2. Kullanıcının authenticate olduğunu kontrol edin
3. Browser'da Authentication durumunu kontrol edin

### "Client is offline" Hatası
1. İnternet bağlantınızı kontrol edin
2. Firebase hosting/domain ayarlarını kontrol edin
3. Browser'da Network sekmesini kontrol edin

### Authentication Sorunları
1. **Authorized domains** listesini kontrol edin
2. Email/Password authentication'ın etkin olduğunu doğrulayın
3. API key'lerin doğru olduğunu kontrol edin

## 📝 Deploy Komutları

Firebase CLI kullanarak deploy yapmak için:

```bash
# Firebase CLI kurulumu
npm install -g firebase-tools

# Firebase'e login
firebase login

# Proje başlatma
firebase init

# Rules deploy
firebase deploy --only firestore:rules
firebase deploy --only storage

# Tüm deploy
firebase deploy
```

## 🔐 Güvenlik Notları

1. **Asla production'da test rules kullanmayın**
2. **API key'leri güvende tutun**
3. **Rules'ı düzenli olarak gözden geçirin**
4. **User input'larını validate edin**

## 🚨 Önemli Kontroller

Deploy öncesi bu kontrolleri yapın:

- [ ] Firestore rules deploy edildi
- [ ] Storage rules deploy edildi
- [ ] Authentication etkinleştirildi
- [ ] Domain authorize edildi
- [ ] Test kullanıcısı oluşturuldu
- [ ] Uygulamada login test edildi

## 📞 Destek

Sorun yaşarsanız:
1. Firebase Console'da logs'ları kontrol edin
2. Browser DevTools'da Network/Console'u kontrol edin
3. Bu dokümanı tekrar gözden geçirin
