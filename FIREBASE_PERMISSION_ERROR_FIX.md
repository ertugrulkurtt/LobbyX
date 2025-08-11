# 🚨 Firebase Permission Error - ACİL ÇÖZÜM

## Aldığınız Hata:
```
FirebaseError: Missing or insufficient permissions.
```

## ⚡ 2 DAKİKALIK ÇÖZÜM:

### 1. Firebase Console'a Girin
🔗 **Link:** https://console.firebase.google.com/

### 2. Projeyi Seçin
📱 **Proje:** `lobbyx-87c98`

### 3. Firestore Rules'ı Güncelleyin
1. Sol menüden **"Firestore Database"** seçin
2. **"Rules"** sekmesine tıklayın
3. Aşağıdaki kuralı **TAM** olarak kopyalayın:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **"Publish"** butonuna tıklayın
5. Deploy işleminin tamamlanmasını bekleyin (1-2 dakika)

### 4. Authentication Kontrol
1. Sol menüden **"Authentication"** seçin
2. **"Sign-in method"** sekmesine tıklayın  
3. **"Email/Password"** metodunun **"Enabled"** olduğunu kontrol edin

## ✅ Test Edin:

Deploy tamamlandıktan sonra:
1. Sayfayı yenileyin (F5)
2. Tekrar login olun
3. Mesaj işlemlerini test edin

## 🔍 Hala Çalışmıyorsa:

### Browser Console Test:
```javascript
// Browser console'da çalıştırın:
firebase.auth().currentUser
```

- **null** dönerse → Authentication sorunu
- **User object** dönerse → Rules sorunu

### Cache Temizleme:
1. Browser'da **F12** → **Application** → **Storage** → **"Clear storage"**
2. Sayfayı yenileyin

## 📱 Mobil/Farklı Domain:

Eğer farklı bir domain kullanıyorsanız:
1. **Authentication** → **Settings** → **Authorized domains**
2. Domain'inizi ekleyin

## ⚠️ ÖNEMLİ:

Bu kurallar geliştirme amaçlıdır. Production'da daha güvenli kurallar kullanılmalıdır.

---
**Bu adımları takip ettikten sonra tüm permission hataları çözülecektir.**
