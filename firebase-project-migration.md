# 🔄 Firebase Project Migration - lobbyx-8be54

## ✅ **YAPILAN DEĞİŞİKLİKLER:**

### **Firebase Config Güncellendi:**
- **Eski**: lobbyx-87c98
- **Yeni**: lobbyx-8be54

### **Kaybolacak Veriler:**
- 👤 CionSan kullanıcısı 
- 👥 3 arkadaş (Ertuğrul Kurt, deneme deneme, vb.)
- 💬 12 mesaj
- 🎮 Level 1, 115 XP
- 📷 Profil fotoğrafları (Firebase Storage URL'leri)

---

## 🚀 **YENİ FIREBASE PROJESİ KURULUMU:**

### **1. Firebase CLI ile Login:**
```bash
firebase login
firebase use lobbyx-8be54
```

### **2. Firestore Rules Deploy:**
```bash
firebase deploy --only firestore:rules
```

### **3. Realtime Database Rules Deploy:**
```bash
firebase deploy --only database
```

### **4. Storage Rules Deploy (R2 kullandığımız için disable):**
```bash
firebase deploy --only storage
```

---

## 🔧 **GEREKLI ADIMLAR:**

1. **Firebase Console**: 
   - [Firebase Console](https://console.firebase.google.com/) → lobbyx-8be54 projesi
   - **Authentication** → **Sign-in methods** → **Email/Password** enable et

2. **Firestore Database**:
   - **Database oluştur** → **Test mode** (geçici) → **Production mode**

3. **Realtime Database**:
   - **Database oluştur** → **Test mode**

---

## 📊 **ŞU ANKİ DURUM:**

| Servis | Eski Proje | Yeni Proje | Durum |
|--------|------------|------------|-------|
| **Firebase Config** | lobbyx-87c98 | lobbyx-8be54 | ✅ Güncellendi |
| **Cloudflare R2** | - | Active | ✅ Çalışıyor |
| **Environment** | - | Set | ✅ Tamam |
| **Rules Deploy** | - | Pending | ⏳ Gerekli |

---

## ⚠️ **ÖNEMLİ NOTLAR:**

- **R2 veriler korunacak** (zaten yeni sistem)
- **Firebase veriler kaybolacak** (yeni proje)
- **İlk kullanıcı olarak tekrar register gerekecek**
- **Eski profil fotoğrafları görünmeyecek**

---

## 🎯 **SONRAKI ADIMLAR:**

1. Firebase Console'da yeni proje ayarları
2. Rules deploy
3. Test kullanıcısı oluşturma
4. R2 ile profil fotoğrafı test

**Temiz başlangıç için ideal!** 🚀
