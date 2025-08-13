# 🔥 Güncellenmiş Firebase Kuralları - Cloudflare R2 Mimarisi

## Yeni Mimari:
- **Firebase**: Kullanıcı verileri, mesajlar, bildirimler, istatistikler
- **Cloudflare R2**: Tüm dosyalar (fotoğraflar, videolar, müzikler, dökümanlar)

---

## 1️⃣ **FIRESTORE RULES** (Ana Veritabanı)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı profilleri
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    // Arkadaşlık istekleri
    match /friendRequests/{requestId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.fromUserId || 
        request.auth.uid == resource.data.toUserId ||
        request.auth.uid == request.resource.data.fromUserId || 
        request.auth.uid == request.resource.data.toUserId
      );
    }
    
    // Arkadaşlıklar
    match /friendships/{friendshipId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.user1 || 
        request.auth.uid == resource.data.user2 ||
        request.auth.uid == request.resource.data.user1 || 
        request.auth.uid == request.resource.data.user2
      );
    }
    
    // Sohbetler
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && (
        request.auth.uid in resource.data.participants ||
        request.auth.uid in request.resource.data.participants
      );
    }
    
    // Mesajlar
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null && (
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants
      );
    }
    
    // Bildirimler
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == request.resource.data.userId
      );
    }
    
    // Kullanıcı istatistikleri
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Mesaj istatistikleri
    match /messageStats/{messageStatsId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == request.resource.data.userId
      );
    }

    // Günlük aktivite
    match /dailyActivity/{activityId} {
      allow read, write: if request.auth != null &&
        activityId.matches('^' + request.auth.uid + '_.*');
    }

    // XP logları
    match /xpLogs/{logId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        request.resource.data.userId == request.auth.uid
      );
    }

    // 🆕 Dosya metadata'ları (asıl dosyalar R2'de)
    match /files/{fileId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.uploadedBy ||
        request.auth.uid == request.resource.data.uploadedBy
      );
    }

    // Sunucular
    match /servers/{serverId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Gruplar
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 2️⃣ **REALTIME DATABASE RULES** (Canlı Veriler)
```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "userPresence": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
    "typing": {
      "$conversationId": {
        "$uid": {
          ".read": true,
          ".write": "$uid === auth.uid"
        }
      }
    },
    "onlineUsers": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 3️⃣ **STORAGE RULES** (Artık Kullanılmıyor)
```javascript
rules_version = '2';

// NOT: Firebase Storage artık dosya depolama için kullanılmıyor
// Tüm dosyalar şimdi Cloudflare R2'de saklanıyor

service firebase.storage {
  match /b/{bucket}/o {
    // R2 kullandığımız için tüm erişimi reddet
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🚀 **YENİ ÖZELLİKLER:**

### **Cloudflare R2 Entegrasyonu:**
- ✅ Dosya yüklemeleri artık R2'ye gidiyor
- ✅ Metadata Firebase'de saklanıyor
- ✅ CDN ile hızlı erişim
- ✅ 50MB dosya boyutu limiti
- ✅ Tüm dosya tipleri destekli

### **API Endpoints:**
- `POST /api/upload-to-r2` - Dosya yükleme
- `DELETE /api/delete-from-r2` - Dosya silme
- `POST /api/get-r2-upload-url` - Presigned URL
- `GET /api/r2-health` - R2 bağlantı kontrolü

### **Desteklenen Dosya Tipleri:**
- 🖼️ **Resimler**: JPG, PNG, GIF, WebP, SVG
- 🎵 **Müzikler**: MP3, WAV, OGG, MP4, FLAC
- 🎬 **Videolar**: MP4, AVI, MKV, MOV, WebM
- 📄 **Dökümanlar**: PDF, Word, Excel, PowerPoint
- 📦 **Arşivler**: ZIP, RAR, 7Z

---

## 🔧 **DEPLOYMENT TALİMATLARI:**

1. **Firestore Rules**: Firebase Console → Firestore → Rules
2. **Realtime Database**: Firebase Console → Realtime Database → Rules  
3. **Storage Rules**: Firebase Console → Storage → Rules
4. **Cloudflare R2**: Environment variables ayarla
5. **Dependencies**: `npm install` çalıştır

**Artık %100 hibrit mimari! Firebase'de veri, Cloudflare'de dosyalar! 🎉**
