# Firebase Kurulumu

LobbyX uygulamasının tüm özelliklerinin çalışması için hem Firebase Storage hem de Firestore Database kurallarının güncellenmesi gerekiyor.

## Firebase Console'da Yapılması Gerekenler:

1. **Firebase Console'a git**: https://console.firebase.google.com
2. **LobbyX projesini seç**
3. **Sol menüden "Storage" seçeneğine tıkla**
4. **"Rules" sekmesine git**
5. **Aşağıdaki kuralları yapıştır:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Kullanıcıların kendi profil fotoğraflarını yüklemelerine izin ver
    match /users/{userId}/profile-photo/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Herkese açık profil fotoğrafları için
    match /public/profile-photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024 
        && request.resource.contentType.matches('image/.*');
    }
    
    // Geçici çözüm: Root seviyede yüklemeye izin ver
    match /{filename} {
      allow read, write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024 
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

6. **"Publish" butonuna tıkla**

## 2. Firestore Database Kuralları

**İstatistik sistemi ve kullanıcı verilerinin çalışması için gereklidir!**

1. **Firebase Console'da "Firestore Database" seçeneğine tıkla**
2. **"Rules" sekmesine git**
3. **Aşağıdaki kuralları yapıştır:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - users can read all users for friends/search, write only their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // User statistics - users can read/write their own stats, read others for leaderboard
    match /userStats/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Daily activity tracking
    match /dailyActivity/{activityId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Message statistics
    match /messageStats/{messageStatsId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // XP logs
    match /xpLogs/{logId} {
      allow read: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Achievement progress
    match /achievementProgress/{progressId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Friend requests - users involved can read/write
    match /friendRequests/{requestId} {
      allow read, write: if request.auth != null
        && (request.auth.uid == resource.data.fromUserId
            || request.auth.uid == resource.data.toUserId);
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.fromUserId;
    }

    // Conversations - participants can read/write
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null
        && request.auth.uid in request.resource.data.participants;
    }

    // Messages within conversations - participants can read/write
    match /conversations/{conversationId}/messages/{messageId} {
      allow read: if request.auth != null
        && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.senderId
        && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      allow update: if request.auth != null
        && request.auth.uid == resource.data.senderId;
      allow delete: if request.auth != null
        && request.auth.uid == resource.data.senderId;
    }

    // Servers - all authenticated users can read, members can write
    match /servers/{serverId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && (request.auth.uid == resource.data.ownerId
            || request.auth.uid in resource.data.members);
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.ownerId;
    }

    // Groups - members can read/write
    match /groups/{groupId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.members;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.ownerId;
    }

    // Default deny rule
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **"Publish" butonuna tıkla**

## Güvenlik Kuralları Açıklaması:

### Storage Kuralları:
- **users/{userId}/profile-photo/**: Kullanıcılar sadece kendi klasörlerine yükleme yapabilir
- **public/profile-photos/**: Herkese açık profil fotoğrafları
- **Root level**: Geçici çözüm olarak root seviyede yüklemeye izin verir
- **Dosya boyutu limiti**: 5MB
- **Dosya türü kontrolü**: Sadece resim dosyaları

### Firestore Kuralları:
- **users/{userId}**: Kullanıcılar sadece kendi profil verilerini düzenleyebilir
- **userStats/{userId}**: Kullanıcılar kendi istatistiklerini okuyup yazabilir
- **dailyActivity**: Günlük aktivite takibi için kullanıcıya özel erişim
- **messageStats**: Mesaj istatistikleri için kullanıcıya özel erişim
- **xpLogs**: XP kazanım geçmişi için kullanıcıya özel okuma/yazma

## Test Etme:

### Profil Fotoğrafı Testi:
1. Uygulamaya giriş yap
2. Profil sayfasına git
3. Kamera ikonuna tıkla
4. Bir resim dosyası seç
5. Yükleme işlemini bekle

### İstatistik Sistemi Testi:
1. Uygulamaya giriş yap
2. Dashboard'da istatistiklerin yüklendiğini kontrol et
3. Bir mesaj gönder (Chat sayfasında)
4. Profil sayfasında mesaj sayısının arttığını kontrol et
5. Arkadaş ekle/çıkar ve arkadaş sayısının değiştiğini kontrol et

### Hata Giderme:
Eğer hala sorun yaşıyorsan:
1. Tarayıcı konsolunu kontrol et
2. Firebase Console'da "Authentication" > "Users" bölümünde kullanıcının var olduğunu kontrol et
3. Firestore Database'de "userStats" koleksiyonuna erişimin olduğunu kontrol et
4. Hata mesajlarını incele ve buradan bildirin
