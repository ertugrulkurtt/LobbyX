# 🔥 Tam Firebase Kuralları - Tüm Servisler

## 1️⃣ **FIRESTORE RULES** (Firestore Database)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow other users to read profiles for friend discovery
    }
    
    // Allow authenticated users to manage their friend requests
    match /friendRequests/{requestId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.fromUserId || 
        request.auth.uid == resource.data.toUserId ||
        request.auth.uid == request.resource.data.fromUserId || 
        request.auth.uid == request.resource.data.toUserId
      );
    }
    
    // Allow authenticated users to manage their friendships
    match /friendships/{friendshipId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.user1 || 
        request.auth.uid == resource.data.user2 ||
        request.auth.uid == request.resource.data.user1 || 
        request.auth.uid == request.resource.data.user2
      );
    }
    
    // Allow authenticated users to access conversations they're part of
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && (
        request.auth.uid in resource.data.participants ||
        request.auth.uid in request.resource.data.participants
      );
    }
    
    // Allow authenticated users to access messages in conversations they're part of
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null && (
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants
      );
    }
    
    // Allow authenticated users to manage their servers
    match /servers/{serverId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.ownerId ||
        request.auth.uid == request.resource.data.ownerId ||
        request.auth.uid in resource.data.admins ||
        request.auth.uid in request.resource.data.admins
      );
    }
    
    // Allow authenticated users to manage their notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == request.resource.data.userId
      );
    }
    
    // Allow authenticated users to manage their groups
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.ownerId ||
        request.auth.uid == request.resource.data.ownerId ||
        request.auth.uid in resource.data.members ||
        request.auth.uid in request.resource.data.members
      );
    }
    
    // Allow authenticated users to manage their user stats
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to manage their message stats
    match /messageStats/{messageStatsId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == request.resource.data.userId
      );
    }

    // Allow authenticated users to manage their daily activity
    match /dailyActivity/{activityId} {
      allow read, write: if request.auth != null &&
        activityId.matches('^' + request.auth.uid + '_.*');
    }

    // Allow authenticated users to read their XP logs
    match /xpLogs/{logId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        request.resource.data.userId == request.auth.uid
      );
    }

    // Test document for connection testing
    match /_test/connection {
      allow read: if false; // This will cause permission denied, which is expected for connection test
    }
  }
}
```

## 2️⃣ **REALTIME DATABASE RULES** (Realtime Database)
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
    "userStats": {
      "$uid": {
        ".read": "$uid === auth.uid",
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
    },
    "chatTyping": {
      "$conversationId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "$userId === auth.uid"
        }
      }
    },
    "liveActivity": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 3️⃣ **STORAGE RULES** (Firebase Storage)
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload files to conversations they're part of
    match /conversations/{conversationId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid != null;
    }
    
    // Allow authenticated users to upload profile pictures
    match /profile-pictures/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload server assets
    match /servers/{serverId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to upload group files
    match /groups/{groupId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Public assets (logos, etc.)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // File size and type restrictions
    match /{allPaths=**} {
      allow write: if request.auth != null 
        && resource.size < 50 * 1024 * 1024  // 50MB limit
        && (resource.contentType.matches('image/.*') 
            || resource.contentType.matches('video/.*')
            || resource.contentType.matches('audio/.*')
            || resource.contentType.matches('application/pdf')
            || resource.contentType.matches('text/.*'));
    }
  }
}
```

## 🚀 **Deploy Talimatları:**

### Firebase Console'da:
1. **Firestore Database** → **Rules** → Yukarıdaki Firestore kurallarını yapıştır
2. **Realtime Database** → **Rules** → Yukarıdaki Realtime Database kurallarını yapıştır  
3. **Storage** → **Rules** → Yukarıdaki Storage kurallarını yapıştır

### Firebase CLI ile:
```bash
firebase deploy --only firestore:rules,database,storage
```

## ✅ **Bu kurallar ne sağlar:**

**Firestore:**
- ✅ Kullanıcı profilleri ve istatistikleri
- ✅ Arkadaşlık sistemi 
- ✅ Mesajlaşma ve sohbet
- ✅ Sunucu/grup yönetimi
- ✅ Bildirimler
- ✅ XP ve aktivite takibi

**Realtime Database:**
- ✅ Çevrimiçi kullanıcı takibi
- ✅ Yazıyor/typing göstergeleri
- ✅ Canlı aktivite güncellemeleri

**Storage:**
- ✅ Profil resimleri
- ✅ Sohbet dosyaları
- ✅ Sunucu/grup dosyaları
- ✅ 50MB dosya boyutu sınırı
- ✅ Güvenli dosya türü kontrolü
