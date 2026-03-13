# HyperCube Studio Forum

Mobil uygulama ve oyunlarımızı kullanan kişilerle interaktif iletişim platformu.

## 🌐 Forum Adresi
https://hypercube-studio.github.io/forum

## ✨ Özellikler

### V1 (Mevcut)
- ✅ Google Authentication (Firebase)
- ✅ Gerçek zamanlı yorumlar
- ✅ Emoji reaksiyonlar (👍 👎 ❤️ 😂 🎮)
- ✅ Reply sistemi (nested comments)
- ✅ Markdown desteği
- ✅ Arama ve sıralama
- ✅ Admin paneli (yorum yönetimi)
- ✅ Dark mode
- ✅ TR/EN dil desteği
- ✅ Responsive tasarım

### V2 (Planlanan)
- 🔜 Azure OpenAI entegrasyonu
- 🔜 Otomatik yorum özeti
- 🔜 Sentiment analizi
- 🔜 Email bildirimleri

## 🛠️ Teknolojiler
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Firebase (Firestore + Auth)
- **Hosting**: GitHub Pages
- **AI (V2)**: Azure OpenAI

## 🚀 Kurulum

### 1. Firebase Projesi Oluştur
1. [Firebase Console](https://console.firebase.google.com/) → Create Project
2. Proje adı: "HyperCube Forum"
3. Google Analytics: İsteğe bağlı

### 2. Authentication Ayarları
1. Authentication → Get Started
2. Sign-in method → Google → Enable
3. Authorized domains → `hypercube-studio.github.io` ekle

### 3. Firestore Database
1. Firestore Database → Create Database
2. Test mode ile başlat
3. Location: europe-west3 (Frankfurt)

### 4. Web App Kaydı
1. Project Settings (⚙️) → Add app → Web
2. App nickname: "Forum Web"
3. Firebase Hosting: Hayır
4. Config bilgilerini kopyala

### 5. Config Dosyası
`js/config.js` dosyasındaki Firebase config'i güncelle:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 6. Firestore Güvenlik Kuralları
Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Comments collection
    match /comments/{comment} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated users can create
      allow create: if request.auth != null;
      
      // Only owner or admin can update/delete
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'studio@hypercube.tr');
    }
  }
}
```

### 7. GitHub Pages
1. Push to GitHub
2. Settings → Pages
3. Source: Deploy from branch
4. Branch: main, folder: / (root)
5. Save

## 📁 Proje Yapısı

```
HyperCubeForum/
├── index.html              # Ana sayfa (uygulama listesi)
├── app.html                # Uygulama detay (yorumlar)
├── admin.html              # Admin paneli
├── css/
│   ├── style.css          # Ana stiller
│   └── dark-mode.css      # Dark mode
├── js/
│   ├── config.js          # Firebase config
│   ├── auth.js            # Authentication
│   ├── forum.js           # Forum işlemleri
│   ├── comments.js        # Yorum CRUD
│   ├── reactions.js       # Emoji reaksiyonlar
│   ├── admin.js           # Admin özellikleri
│   └── i18n.js            # Çok dil desteği
├── data/
│   └── apps.json          # Uygulama bilgileri
└── assets/
    └── logo.svg           # Logo
```

## 👤 Admin Erişimi
Admin paneli sadece `studio@hypercube.tr` email adresine açıktır.

**Admin Özellikleri:**
- Tüm yorumları görme
- Yorum sabitleme/kaldırma
- Yorum silme
- İstatistikler

## 🎮 Uygulamalar
- **Gravon**: Yerçekimi kontrollü uzay pilotluk oyunu
- **DigiMind**: Dijital hafıza ve düşünce organizasyonu
- **Periodic**: İnteraktif periyodik tablo uygulaması

## 📝 Geliştirme Notları

### Yeni Uygulama Ekleme
`data/apps.json` dosyasına yeni uygulama ekle:

```json
{
  "id": "app-id",
  "name": "App Name",
  "icon": "🎮",
  "description": {
    "tr": "Türkçe açıklama",
    "en": "English description"
  },
  "detailedDescription": {
    "tr": "Detaylı açıklama",
    "en": "Detailed description"
  },
  "downloads": 0,
  "storeLinks": {
    "playStore": "https://play.google.com/...",
    "appStore": "https://apps.apple.com/..."
  }
}
```

## 📄 Lisans
© 2026 HyperCube Studio - Tüm Hakları Saklıdır

---

**Geliştirici:** HyperCube Studio  
**İletişim:** studio@hypercube.tr
