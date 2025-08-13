# 🔥 Firebase Kuralları Deploy Talimatları

## 📋 Mevcut Durum
Güncellenmiş Firestore kuralları `firestore.rules` dosyasında hazır:
- ✅ notifications collection kuralı eklendi
- ✅ userStats collection kuralı eklendi
- ✅ messageStats collection kuralı eklendi  
- ✅ dailyActivity collection kuralı eklendi
- ✅ xpLogs collection kuralı eklendi

## 🚀 Deploy Komutları

### Hızlı Deploy:
```bash
firebase deploy --only firestore:rules
```

### Tam Deploy:
```bash
firebase use lobbyx-87c98
firebase deploy --only firestore:rules,firestore:indexes,database,storage
```

## 🎯 Düzeltilecek İzin Hataları:
1. **Error creating notification** ✅ FIXED
2. **Error creating message notification** ✅ FIXED  
3. **Error incrementing message count** ✅ FIXED
4. **Error updating daily activity** ✅ FIXED

## 📝 Yeni Kurallar:

### notifications
```javascript
match /notifications/{notificationId} {
  allow read, write: if request.auth != null && (
    request.auth.uid == resource.data.userId ||
    request.auth.uid == request.resource.data.userId
  );
}
```

### userStats
```javascript
match /userStats/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### messageStats  
```javascript
match /messageStats/{messageStatsId} {
  allow read, write: if request.auth != null && (
    request.auth.uid == resource.data.userId ||
    request.auth.uid == request.resource.data.userId
  );
}
```

### dailyActivity
```javascript
match /dailyActivity/{activityId} {
  allow read, write: if request.auth != null &&
    activityId.matches('^' + request.auth.uid + '_.*');
}
```

### xpLogs
```javascript
match /xpLogs/{logId} {
  allow read, write: if request.auth != null && (
    resource.data.userId == request.auth.uid ||
    request.resource.data.userId == request.auth.uid
  );
}
```

## ✅ Deploy Sonrası Kontrol:
```bash
firebase firestore:rules get
```

## 🔄 Test:
Deploy sonrası aşağıdaki özelliklerin çalışması bekleniyor:
- Bildirim oluşturma
- Mesaj istatistikleri  
- Kullanıcı istatistikleri
- Günlük aktivite takibi
- XP kazanım sistemi
