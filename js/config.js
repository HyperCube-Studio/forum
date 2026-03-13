// Firebase Configuration
// Firebase Console'dan aldığın bilgileri buraya yapıştıracaksın

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Admin email
const ADMIN_EMAIL = "studio@hypercube.tr";

// Initialize Firebase (bu kod auth.js çalıştığında aktif olacak)
// firebase.initializeApp(firebaseConfig);

export { firebaseConfig, ADMIN_EMAIL };
