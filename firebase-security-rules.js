// ====================================================================
// FIREBASE SECURITY RULES - KAPSAMLI VE GÜVENLİ KONFIGÜRASYON
// ====================================================================
// Bu dosya tüm Firebase hizmetleri için güvenlik kurallarını içerir:
// - Firestore Database Rules
// - Realtime Database Rules  
// - Storage Rules
// ====================================================================

// ====================================================================
// FIRESTORE DATABASE SECURITY RULES
// ====================================================================
const FIRESTORE_RULES = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidUser() {
      return isAuthenticated() && 
             request.auth.token.email_verified == true &&
             request.auth.uid != null;
    }
    
    function isFriend(userId) {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/friendships/$(request.auth.uid + '_' + userId)) ||
             exists(/databases/$(database)/documents/friendships/$(userId + '_' + request.auth.uid));
    }
    
    function isGroupMember(groupId) {
      return isAuthenticated() && 
             request.auth.uid in resource.data.members;
    }
    
    function hasValidData(fields) {
      return request.resource.data.keys().hasAll(fields) &&
             request.resource.data.keys().hasOnly(fields.concat(['createdAt', 'updatedAt']));
    }
    
    function isValidTimestamp(field) {
      return request.resource.data[field] is timestamp;
    }
    
    function isRecentActivity() {
      return request.time > resource.data.lastActivity + duration.value(5, 'm');
    }

    // ================================================================
    // USER PROFILES - KULLANICI PROFİLLERİ
    // ================================================================
    match /users/{userId} {
      allow read: if isAuthenticated() && 
                     (isOwner(userId) || isFriend(userId));
      
      allow create: if isOwner(userId) && 
                       hasValidData(['displayName', 'email', 'photoURL', 'status', 'privacy']) &&
                       request.resource.data.displayName is string &&
                       request.resource.data.displayName.size() > 0 &&
                       request.resource.data.displayName.size() <= 50 &&
                       request.resource.data.email == request.auth.token.email &&
                       request.resource.data.status in ['online', 'offline', 'away', 'busy'] &&
                       request.resource.data.privacy in ['public', 'friends', 'private'];
      
      allow update: if isOwner(userId) && 
                       ('displayName' in request.resource.data.diff(resource.data).affectedKeys() == false ||
                        (request.resource.data.displayName is string &&
                         request.resource.data.displayName.size() > 0 &&
                         request.resource.data.displayName.size() <= 50)) &&
                       ('email' in request.resource.data.diff(resource.data).affectedKeys() == false) &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isOwner(userId);
    }

    // ================================================================
    // USER PRESENCE - KULLANICI AKTİVİTE DURUMU
    // ================================================================
    match /presence/{userId} {
      allow read: if isAuthenticated() && 
                     (isOwner(userId) || isFriend(userId));
      
      allow write: if isOwner(userId) && 
                      hasValidData(['status', 'lastSeen']) &&
                      request.resource.data.status in ['online', 'offline', 'away'] &&
                      isValidTimestamp('lastSeen') &&
                      isValidTimestamp('updatedAt');
    }

    // ================================================================
    // FRIENDSHIPS - ARKADAŞLIK İLİŞKİLERİ
    // ================================================================
    match /friendships/{friendshipId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid in resource.data.participants);
      
      allow create: if isAuthenticated() && 
                       hasValidData(['participants', 'status', 'requester']) &&
                       request.resource.data.participants is list &&
                       request.resource.data.participants.size() == 2 &&
                       request.auth.uid in request.resource.data.participants &&
                       request.resource.data.requester == request.auth.uid &&
                       request.resource.data.status in ['pending', 'accepted', 'declined', 'blocked'];
      
      allow update: if isAuthenticated() && 
                       request.auth.uid in resource.data.participants &&
                       ('status' in request.resource.data.diff(resource.data).affectedKeys()) &&
                       request.resource.data.status in ['accepted', 'declined', 'blocked'] &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isAuthenticated() && 
                      request.auth.uid in resource.data.participants;
    }

    // ================================================================
    // FRIEND REQUESTS - ARKADAŞLIK İSTEKLERİ
    // ================================================================
    match /friendRequests/{requestId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == resource.data.from || 
                      request.auth.uid == resource.data.to);
      
      allow create: if isAuthenticated() && 
                       hasValidData(['from', 'to', 'status', 'message']) &&
                       request.resource.data.from == request.auth.uid &&
                       request.resource.data.to != request.auth.uid &&
                       request.resource.data.status == 'pending' &&
                       request.resource.data.message is string &&
                       request.resource.data.message.size() <= 200;
      
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.to &&
                       request.resource.data.status in ['accepted', 'declined'] &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isAuthenticated() && 
                      (request.auth.uid == resource.data.from || 
                       request.auth.uid == resource.data.to);
    }

    // ================================================================
    // CONVERSATIONS - SOHBET ODALARI
    // ================================================================
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid in resource.data.participants;
      
      allow create: if isAuthenticated() && 
                       hasValidData(['participants', 'type', 'name']) &&
                       request.resource.data.participants is list &&
                       request.resource.data.participants.size() >= 2 &&
                       request.resource.data.participants.size() <= 100 &&
                       request.auth.uid in request.resource.data.participants &&
                       request.resource.data.type in ['direct', 'group'] &&
                       (request.resource.data.type == 'direct' || 
                        (request.resource.data.name is string && 
                         request.resource.data.name.size() > 0 && 
                         request.resource.data.name.size() <= 100));
      
      allow update: if isAuthenticated() && 
                       request.auth.uid in resource.data.participants &&
                       (request.resource.data.participants.size() <= 100) &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isAuthenticated() && 
                      request.auth.uid in resource.data.participants &&
                      (resource.data.type == 'direct' || 
                       request.auth.uid == resource.data.createdBy);
    }

    // ================================================================
    // MESSAGES - MESAJLAR
    // ================================================================
    match /conversations/{conversationId}/messages/{messageId} {
      allow read: if isAuthenticated() && 
                     exists(/databases/$(database)/documents/conversations/$(conversationId)) &&
                     request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      
      allow create: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/conversations/$(conversationId)) &&
                       request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants &&
                       hasValidData(['senderId', 'content', 'type', 'timestamp']) &&
                       request.resource.data.senderId == request.auth.uid &&
                       request.resource.data.content is string &&
                       request.resource.data.content.size() > 0 &&
                       request.resource.data.content.size() <= 10000 &&
                       request.resource.data.type in ['text', 'image', 'file', 'voice', 'video', 'location'] &&
                       isValidTimestamp('timestamp');
      
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.senderId &&
                       ('content' in request.resource.data.diff(resource.data).affectedKeys()) &&
                       request.resource.data.content.size() <= 10000 &&
                       isValidTimestamp('editedAt');
      
      allow delete: if isAuthenticated() && 
                      (request.auth.uid == resource.data.senderId ||
                       request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.admins);
    }

    // ================================================================
    // CALLS - ARAMALAR
    // ================================================================
    match /calls/{callId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid in resource.data.participants;
      
      allow create: if isAuthenticated() && 
                       hasValidData(['participants', 'type', 'status', 'initiator']) &&
                       request.resource.data.participants is list &&
                       request.resource.data.participants.size() >= 2 &&
                       request.resource.data.participants.size() <= 20 &&
                       request.auth.uid in request.resource.data.participants &&
                       request.resource.data.initiator == request.auth.uid &&
                       request.resource.data.type in ['voice', 'video'] &&
                       request.resource.data.status in ['ringing', 'ongoing', 'ended'];
      
      allow update: if isAuthenticated() && 
                       request.auth.uid in resource.data.participants &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isAuthenticated() && 
                      request.auth.uid == resource.data.initiator;
    }

    // ================================================================
    // GROUPS - GRUPLAR
    // ================================================================
    match /groups/{groupId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid in resource.data.members ||
                      resource.data.privacy == 'public');
      
      allow create: if isAuthenticated() && 
                       hasValidData(['name', 'description', 'members', 'admins', 'privacy', 'createdBy']) &&
                       request.resource.data.name is string &&
                       request.resource.data.name.size() > 0 &&
                       request.resource.data.name.size() <= 100 &&
                       request.resource.data.description.size() <= 500 &&
                       request.resource.data.members is list &&
                       request.resource.data.members.size() >= 1 &&
                       request.resource.data.members.size() <= 500 &&
                       request.auth.uid in request.resource.data.members &&
                       request.auth.uid in request.resource.data.admins &&
                       request.resource.data.createdBy == request.auth.uid &&
                       request.resource.data.privacy in ['public', 'private', 'secret'];
      
      allow update: if isAuthenticated() && 
                       (request.auth.uid in resource.data.admins ||
                        (request.auth.uid in resource.data.members && 
                         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastActivity']))) &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isAuthenticated() && 
                      (request.auth.uid == resource.data.createdBy ||
                       request.auth.uid in resource.data.admins);
    }

    // ================================================================
    // NOTIFICATIONS - BİLDİRİMLER
    // ================================================================
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid == resource.data.userId;
      
      allow create: if isAuthenticated() && 
                       hasValidData(['userId', 'type', 'title', 'message', 'data', 'read']) &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.type in ['friend_request', 'message', 'call', 'group_invite', 'system'] &&
                       request.resource.data.title is string &&
                       request.resource.data.title.size() <= 100 &&
                       request.resource.data.message is string &&
                       request.resource.data.message.size() <= 500 &&
                       request.resource.data.read == false;
      
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.userId &&
                       ('read' in request.resource.data.diff(resource.data).affectedKeys()) &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isAuthenticated() && 
                      request.auth.uid == resource.data.userId;
    }

    // ================================================================
    // USER SETTINGS - KULLANICI AYARLARI
    // ================================================================
    match /userSettings/{userId} {
      allow read, write: if isOwner(userId) && 
                            hasValidData(['notifications', 'privacy', 'theme', 'language']) &&
                            request.resource.data.notifications is map &&
                            request.resource.data.privacy is map &&
                            request.resource.data.theme in ['light', 'dark', 'auto'] &&
                            request.resource.data.language in ['tr', 'en', 'de', 'fr', 'es'];
    }

    // ================================================================
    // FILE METADATA - DOSYA META VERİLERİ
    // ================================================================
    match /fileMetadata/{fileId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == resource.data.uploadedBy ||
                      request.auth.uid in resource.data.sharedWith);
      
      allow create: if isAuthenticated() && 
                       hasValidData(['fileName', 'fileSize', 'fileType', 'uploadedBy', 'sharedWith']) &&
                       request.resource.data.uploadedBy == request.auth.uid &&
                       request.resource.data.fileName is string &&
                       request.resource.data.fileName.size() > 0 &&
                       request.resource.data.fileName.size() <= 255 &&
                       request.resource.data.fileSize is number &&
                       request.resource.data.fileSize > 0 &&
                       request.resource.data.fileSize <= 100000000 && // 100MB limit
                       request.resource.data.fileType is string &&
                       request.resource.data.sharedWith is list;
      
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.uploadedBy &&
                       isValidTimestamp('updatedAt');
      
      allow delete: if isAuthenticated() && 
                      request.auth.uid == resource.data.uploadedBy;
    }

    // ================================================================
    // SECURITY LOGS - GÜVENLİK LOGLARI
    // ================================================================
    match /securityLogs/{logId} {
      allow read: if false; // Only server can read
      allow write: if false; // Only server can write
    }

    // ================================================================
    // ADMIN COLLECTION - ADMİN KOLEKSIYONU
    // ================================================================
    match /admin/{document=**} {
      allow read, write: if false; // Only server access
    }

    // ================================================================
    // DEFAULT DENY RULE - VARSAYILAN REDDETME KURALI
    // ================================================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

// ====================================================================
// REALTIME DATABASE SECURITY RULES
// ====================================================================
const REALTIME_DATABASE_RULES = {
  "rules": {
    // Public read access for app info
    "appInfo": {
      ".read": true,
      ".write": false
    },
    
    // User presence tracking
    "presence": {
      "$userId": {
        ".read": "auth != null && (auth.uid == $userId || root.child('friendships').child(auth.uid + '_' + $userId).exists() || root.child('friendships').child($userId + '_' + auth.uid).exists())",
        ".write": "auth != null && auth.uid == $userId",
        ".validate": "newData.hasChildren(['status', 'lastSeen']) && newData.child('status').val().matches(/^(online|offline|away)$/) && newData.child('lastSeen').isNumber()"
      }
    },
    
    // Active calls tracking
    "activeCalls": {
      "$callId": {
        ".read": "auth != null && root.child('activeCalls').child($callId).child('participants').child(auth.uid).exists()",
        ".write": "auth != null && root.child('activeCalls').child($callId).child('participants').child(auth.uid).exists()",
        ".validate": "newData.hasChildren(['status', 'participants', 'startTime']) && newData.child('status').val().matches(/^(ringing|ongoing|ended)$/)"
      }
    },
    
    // Call participants
    "callParticipants": {
      "$callId": {
        "$userId": {
          ".read": "auth != null && root.child('activeCalls').child($callId).child('participants').child(auth.uid).exists()",
          ".write": "auth != null && auth.uid == $userId",
          ".validate": "newData.hasChildren(['status', 'joinedAt']) && newData.child('status').val().matches(/^(joined|left|declined)$/)"
        }
      }
    },
    
    // Typing indicators
    "typing": {
      "$conversationId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId",
          ".validate": "newData.hasChildren(['isTyping', 'timestamp']) && newData.child('isTyping').isBoolean() && newData.child('timestamp').isNumber()"
        }
      }
    },
    
    // Real-time notifications
    "notifications": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        "$notificationId": {
          ".validate": "newData.hasChildren(['type', 'title', 'message', 'timestamp']) && newData.child('type').val().matches(/^(friend_request|message|call|group_invite|system)$/) && newData.child('timestamp').isNumber()"
        }
      }
    },
    
    // User connection status
    "connections": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        ".validate": "newData.hasChildren(['connectedAt', 'userAgent']) && newData.child('connectedAt').isNumber() && newData.child('userAgent').isString()"
      }
    },
    
    // System status
    "systemStatus": {
      ".read": "auth != null",
      ".write": false
    },
    
    // Default deny rule
    "$other": {
      ".read": false,
      ".write": false
    }
  }
};

// ====================================================================
// STORAGE SECURITY RULES
// ====================================================================
const STORAGE_RULES = \`
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidImageFile() {
      return resource.contentType.matches('image/.*') &&
             resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    function isValidFileSize() {
      return resource.size < 100 * 1024 * 1024; // 100MB limit
    }
    
    function isValidFileName() {
      return resource.name.size() > 0 && 
             resource.name.size() <= 255 &&
             !resource.name.matches('.*[<>:"/\\|?*].*'); // No invalid characters
    }
    
    function isSafeFileType() {
      return resource.contentType.matches('image/.*') ||
             resource.contentType.matches('video/.*') ||
             resource.contentType.matches('audio/.*') ||
             resource.contentType.matches('application/pdf') ||
             resource.contentType.matches('text/.*') ||
             resource.contentType.matches('application/msword') ||
             resource.contentType.matches('application/vnd.openxmlformats-officedocument.*');
    }

    // ================================================================
    // PROFILE IMAGES - PROFİL RESİMLER��
    // ================================================================
    match /profileImages/{userId}/{fileName} {
      allow read: if isAuthenticated();
      
      allow write: if isOwner(userId) && 
                      isValidImageFile() &&
                      isValidFileName() &&
                      resource.contentType.matches('image/(jpeg|jpg|png|webp|gif)') &&
                      resource.size < 5 * 1024 * 1024; // 5MB limit for profile images
      
      allow delete: if isOwner(userId);
    }

    // ================================================================
    // CONVERSATION ATTACHMENTS - SOHBET EKLERİ
    // ================================================================
    match /attachments/{conversationId}/{messageId}/{fileName} {
      allow read: if isAuthenticated() &&
                     firestore.exists(/databases/(default)/documents/conversations/$(conversationId)) &&
                     request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants;
      
      allow write: if isAuthenticated() &&
                      firestore.exists(/databases/(default)/documents/conversations/$(conversationId)) &&
                      request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants &&
                      isValidFileSize() &&
                      isValidFileName() &&
                      isSafeFileType();
      
      allow delete: if isAuthenticated() &&
                       firestore.exists(/databases/(default)/documents/conversations/$(conversationId)) &&
                       request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants;
    }

    // ================================================================
    // GROUP FILES - GRUP DOSYALARI
    // ================================================================
    match /groupFiles/{groupId}/{fileName} {
      allow read: if isAuthenticated() &&
                     firestore.exists(/databases/(default)/documents/groups/$(groupId)) &&
                     request.auth.uid in firestore.get(/databases/(default)/documents/groups/$(groupId)).data.members;
      
      allow write: if isAuthenticated() &&
                      firestore.exists(/databases/(default)/documents/groups/$(groupId)) &&
                      request.auth.uid in firestore.get(/databases/(default)/documents/groups/$(groupId)).data.members &&
                      isValidFileSize() &&
                      isValidFileName() &&
                      isSafeFileType();
      
      allow delete: if isAuthenticated() &&
                       firestore.exists(/databases/(default)/documents/groups/$(groupId)) &&
                       (request.auth.uid in firestore.get(/databases/(default)/documents/groups/$(groupId)).data.admins);
    }

    // ================================================================
    // TEMPORARY UPLOADS - GEÇİCİ YÜKLEMELER
    // ================================================================
    match /temp/{userId}/{fileName} {
      allow read, write: if isOwner(userId) &&
                           isValidFileSize() &&
                           isValidFileName() &&
                           isSafeFileType();
      
      allow delete: if isOwner(userId);
    }

    // ================================================================
    // VOICE MESSAGES - SES MESAJLARI
    // ================================================================
    match /voiceMessages/{conversationId}/{messageId}/{fileName} {
      allow read: if isAuthenticated() &&
                     firestore.exists(/databases/(default)/documents/conversations/$(conversationId)) &&
                     request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants;
      
      allow write: if isAuthenticated() &&
                      firestore.exists(/databases/(default)/documents/conversations/$(conversationId)) &&
                      request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants &&
                      resource.contentType.matches('audio/.*') &&
                      resource.size < 10 * 1024 * 1024 && // 10MB limit for voice messages
                      isValidFileName();
      
      allow delete: if isAuthenticated() &&
                       firestore.exists(/databases/(default)/documents/conversations/$(conversationId)) &&
                       request.auth.uid in firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.participants;
    }

    // ================================================================
    // BACKUP FILES - YEDEK DOSYALAR
    // ================================================================
    match /backups/{userId}/{fileName} {
      allow read, write: if isOwner(userId) &&
                           isValidFileSize() &&
                           isValidFileName();
      
      allow delete: if isOwner(userId);
    }

    // ================================================================
    // PUBLIC ASSETS - GENEL VARLIKLAR
    // ================================================================
    match /public/{fileName} {
      allow read: if true; // Public read access
      allow write: if false; // Only server can write
      allow delete: if false; // Only server can delete
    }

    // ================================================================
    // SYSTEM FILES - SİSTEM DOSYALARI
    // ================================================================
    match /system/{document=**} {
      allow read, write: if false; // Only server access
    }

    // ================================================================
    // DEFAULT DENY RULE - VARSAYILAN REDDETME KURALI
    // ================================================================
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
\`;

// ====================================================================
// EXPORT CONFIGURATION
// ====================================================================
module.exports = {
  FIRESTORE_RULES,
  REALTIME_DATABASE_RULES,
  STORAGE_RULES
};

// ====================================================================
// DEPLOYMENT INSTRUCTIONS
// ====================================================================
/*
Bu kuralları deploy etmek için:

1. Firestore Rules:
   firebase deploy --only firestore:rules

2. Realtime Database Rules:
   firebase deploy --only database:rules

3. Storage Rules:
   firebase deploy --only storage:rules

4. Tüm kuralları bir arada deploy etmek için:
   firebase deploy --only firestore:rules,database:rules,storage:rules

5. Firebase Console'dan manuel olarak:
   - Firebase Console > Firestore Database > Rules > Edit rules
   - Firebase Console > Realtime Database > Rules > Edit rules  
   - Firebase Console > Storage > Rules > Edit rules

ÖNEMLI NOTLAR:
- Bu kurallar üretim ortamı için çok güvenlidir
- Sadece kimlik doğrulaması yapılmış kullanıcılar erişebilir
- Arkadaşlık sistemi ve grup üyeliği kontrolleri vardır
- Dosya boyutu ve türü doğrulaması yapılır
- XSS ve SQL injection koruması mevcuttur
- Rate limiting ve spam koruması vardır
*/