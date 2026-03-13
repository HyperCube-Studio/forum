// Translations
const translations = {
    tr: {
        // Header
        siteTitle: "HyperCube Studio",
        siteSubtitle: "Mobil Oyun ve Uygulama Forumu",
        signIn: "Google ile Giriş",
        signOut: "Çıkış Yap",
        
        // Apps
        viewComments: "Yorumları Gör",
        comments: "Yorum",
        downloads: "İndirme",
        
        // App Detail
        backToHome: "Ana Sayfaya Dön",
        downloadOn: "İndir",
        playStore: "Play Store",
        appStore: "App Store",
        
        // Comments
        commentsTitle: "Yorumlar",
        searchPlaceholder: "Yorumlarda ara...",
        sortNewest: "En Yeni",
        sortPopular: "En Popüler",
        writeComment: "Yorumunuzu yazın...",
        preview: "Önizleme",
        send: "Gönder",
        cancel: "İptal",
        characters: "karakter",
        charactersLeft: "karakter kaldı",
        
        // Comment Actions
        reply: "Yanıtla",
        pin: "Sabitle",
        unpin: "Sabitlemeyi Kaldır",
        delete: "Sil",
        pinned: "Sabitlendi",
        admin: "Admin",
        
        // Auth
        signInRequired: "Yorum yazmak için giriş yapmalısınız",
        signInSuccess: "Başarıyla giriş yaptınız",
        signOutSuccess: "Çıkış yaptınız",
        
        // Messages
        commentAdded: "Yorumunuz eklendi",
        commentDeleted: "Yorum silindi",
        commentPinned: "Yorum sabitlendi",
        commentUnpinned: "Sabitleme kaldırıldı",
        error: "Bir hata oluştu",
        loading: "Yükleniyor...",
        noComments: "Henüz yorum yok",
        beFirst: "İlk yorumu siz yapın!",
        
        // Validation
        commentTooLong: "Yorum çok uzun (maksimum 2000 karakter)",
        commentEmpty: "Yorum boş olamaz",
        
        // Admin
        adminPanel: "Admin Paneli",
        totalComments: "Toplam Yorum",
        appBreakdown: "Uygulama Dağılımı",
        moderateComments: "Yorumları Yönet",
        
        // Apps
        gravon: {
            name: "Gravon",
            description: "Yerçekimini kontrol et, uzay aracını yönet! Zorlu parkurları geç ve en iyi pilotu kanıtla."
        },
        digimind: {
            name: "DigiMind",
            description: "Dijital hafıza ve düşünce organizasyon uygulaması. Fikirlerinizi düzenleyin, notlarınızı yönetin."
        },
        periodic: {
            name: "Periodic",
            description: "Periyodik tablo uygulaması. Elementleri keşfet, kimyasal özellikleri öğren."
        }
    },
    en: {
        // Header
        siteTitle: "HyperCube Studio",
        siteSubtitle: "Mobile Games & Apps Forum",
        signIn: "Sign in with Google",
        signOut: "Sign Out",
        
        // Apps
        viewComments: "View Comments",
        comments: "Comments",
        downloads: "Downloads",
        
        // App Detail
        backToHome: "Back to Home",
        downloadOn: "Download on",
        playStore: "Play Store",
        appStore: "App Store",
        
        // Comments
        commentsTitle: "Comments",
        searchPlaceholder: "Search in comments...",
        sortNewest: "Newest",
        sortPopular: "Most Popular",
        writeComment: "Write your comment...",
        preview: "Preview",
        send: "Send",
        cancel: "Cancel",
        characters: "characters",
        charactersLeft: "characters left",
        
        // Comment Actions
        reply: "Reply",
        pin: "Pin",
        unpin: "Unpin",
        delete: "Delete",
        pinned: "Pinned",
        admin: "Admin",
        
        // Auth
        signInRequired: "Please sign in to write a comment",
        signInSuccess: "Successfully signed in",
        signOutSuccess: "Signed out",
        
        // Messages
        commentAdded: "Your comment has been added",
        commentDeleted: "Comment deleted",
        commentPinned: "Comment pinned",
        commentUnpinned: "Comment unpinned",
        error: "An error occurred",
        loading: "Loading...",
        noComments: "No comments yet",
        beFirst: "Be the first to comment!",
        
        // Validation
        commentTooLong: "Comment is too long (max 2000 characters)",
        commentEmpty: "Comment cannot be empty",
        
        // Admin
        adminPanel: "Admin Panel",
        totalComments: "Total Comments",
        appBreakdown: "App Breakdown",
        moderateComments: "Moderate Comments",
        
        // Apps
        gravon: {
            name: "Gravon",
            description: "Control gravity, pilot your spacecraft! Complete challenging courses and prove you're the best pilot."
        },
        digimind: {
            name: "DigiMind",
            description: "Digital memory and thought organization app. Organize your ideas, manage your notes."
        },
        periodic: {
            name: "Periodic",
            description: "Periodic table app. Discover elements, learn chemical properties."
        }
    }
};

// Current language
let currentLang = localStorage.getItem('lang') || 'tr';

// Get translation
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    
    for (const k of keys) {
        value = value[k];
        if (!value) return key;
    }
    
    return value;
}

// Change language
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateUI();
}

// Update all translatable elements
function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

// Initialize i18n
function initI18n() {
    // Set up language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
    
    // Initial UI update
    updateUI();
}

export { t, setLanguage, currentLang, initI18n };
