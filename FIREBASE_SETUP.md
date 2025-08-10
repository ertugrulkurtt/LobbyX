# Firebase Storage Kurulumu

Profil fotoğrafı yükleme özelliğinin çalışması için Firebase Storage kurallarının güncellenmesi gerekiyor.

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

## Güvenlik Kuralları Açıklaması:

- **users/{userId}/profile-photo/**: Kullanıcılar sadece kendi klasörlerine yükleme yapabilir
- **public/profile-photos/**: Herkese açık profil fotoğrafları
- **Root level**: Geçici çözüm olarak root seviyede yüklemeye izin verir
- **Dosya boyutu limiti**: 5MB
- **Dosya türü kontrolü**: Sadece resim dosyaları

## Test Etme:

1. Uygulamaya giriş yap
2. Profil sayfasına git
3. Kamera ikonuna tıkla
4. Bir resim dosyası seç
5. Yükleme işlemini bekle

Eğer hala sorun yaşıyorsan, tarayıcı konsolunu kontrol et ve hata mesajlarını incele.
