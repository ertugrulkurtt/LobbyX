#!/bin/bash

echo "🔥 Firebase Kuralları Deploy Edilİyor..."
echo "======================================"

# Firebase project bilgileri
PROJECT_ID="lobbyx-87c98"

echo "📋 Deploy edilecek dosyalar:"
echo "  ✓ firestore.rules - Günceli kurallar (notifications, userStats, messageStats, dailyActivity)"
echo "  ✓ firestore.indexes.json - Indexes"
echo "  ✓ database.rules.json - Realtime Database"
echo "  ✓ storage.rules - Storage"

echo ""
echo "🚀 Deploy komutu:"
echo "firebase use $PROJECT_ID"
echo "firebase deploy --only firestore:rules,firestore:indexes,database,storage"

echo ""
echo "📝 Güncellenmiş Kurallar:"
echo "========================="
echo "✅ notifications - userId ile eşleştirme"
echo "✅ userStats - kullanıcı kendi verilerine erişim"
echo "✅ messageStats - userId ile güvenli erişim"
echo "✅ dailyActivity - userId_date pattern matching"
echo "✅ xpLogs - kullanıcı XP kayıtları"

echo ""
echo "⚠️  DEPLOY SONRASI KONTROL:"
echo "firebase firestore:rules get"

echo ""
echo "💡 Manuel deploy için:"
echo "1. firebase login"
echo "2. firebase use lobbyx-87c98"
echo "3. firebase deploy --only firestore:rules"
