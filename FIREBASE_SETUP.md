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

    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User statistics - users can read/write their own stats
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading for leaderboard
    }

    // Daily activity tracking - users can read/write their own activity
    match /dailyActivity/{activityId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Message statistics - users can read/write their own message stats
    match /messageStats/{messageStatsId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // XP logs - users can read their own XP logs, write is controlled
    match /xpLogs/{logId} {
      allow read: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Achievement progress - users can read/write their own achievements
    match /achievementProgress/{progressId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Default deny rule for any other documents
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

1. Uygulamaya giriş yap
2. Profil sayfasına git
3. Kamera ikonuna tıkla
4. Bir resim dosyası seç
5. Yükleme işlemini bekle

Eğer hala sorun yaşıyorsan, tarayıcı konsolunu kontrol et ve hata mesajlarını incele.
