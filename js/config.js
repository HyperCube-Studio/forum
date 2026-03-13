// Firebase Configuration
// Firebase Console'dan aldığın bilgileri buraya yapıştıracaksın

const firebaseConfig = {
apiKey: "AIzaSyAfoSXVudNMGQaAqrh9NO-yg_BGcM8-HS8",
  authDomain: "hypercube-studio-forum.firebaseapp.com",
  projectId: "hypercube-studio-forum",
  storageBucket: "hypercube-studio-forum.firebasestorage.app",
  messagingSenderId: "899944886178",
  appId: "1:899944886178:web:aa8508c03b95fb169a0cfb"
};

// Admin email
const ADMIN_EMAIL = "studio@hypercube.tr";

// Initialize Firebase (bu kod auth.js çalıştığında aktif olacak)
// firebase.initializeApp(firebaseConfig);

export { firebaseConfig, ADMIN_EMAIL };
