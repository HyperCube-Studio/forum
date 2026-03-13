// Authentication with Firebase
import { ADMIN_EMAIL } from './config.js';
import { t } from './i18n.js';

let currentUser = null;
let auth = null;
let provider = null;

// Initialize auth
function initAuth() {
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
    
    // Auth state observer
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateAuthUI();
        
        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    });
}

// Sign in with Google
async function signIn() {
    try {
        await auth.signInWithPopup(provider);
        showToast(t('signInSuccess'), 'success');
    } catch (error) {
        console.error('Sign in error:', error);
        showToast(t('error'), 'error');
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        showToast(t('signOutSuccess'), 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showToast(t('error'), 'error');
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const signInBtn = document.getElementById('signInBtn');
    const userProfile = document.getElementById('userProfile');
    const commentForm = document.getElementById('commentForm');
    const signInRequired = document.getElementById('signInRequired');
    
    if (currentUser) {
        // User is signed in
        if (signInBtn) signInBtn.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            document.getElementById('userName').textContent = currentUser.displayName;
            document.getElementById('userAvatar').src = currentUser.photoURL;
        }
        if (commentForm) commentForm.style.display = 'block';
        if (signInRequired) signInRequired.style.display = 'none';
    } else {
        // User is signed out
        if (signInBtn) signInBtn.style.display = 'inline-flex';
        if (userProfile) userProfile.style.display = 'none';
        if (commentForm) commentForm.style.display = 'none';
        if (signInRequired) signInRequired.style.display = 'block';
    }
}

// Check if current user is admin
function isAdmin() {
    return currentUser && currentUser.email === ADMIN_EMAIL;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Set up event listeners
function setupAuthListeners() {
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (signInBtn) {
        signInBtn.addEventListener('click', signIn);
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }
}

export { initAuth, signIn, signOut, isAdmin, getCurrentUser, setupAuthListeners, showToast };
