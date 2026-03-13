// Forum main functionality
import { currentLang } from './i18n.js';

let db = null;
let appsData = null;

// Initialize Firestore
function initFirestore() {
    db = firebase.firestore();
}

// Load apps data
async function loadAppsData() {
    try {
        const response = await fetch('data/apps.json');
        appsData = await response.json();
        return appsData;
    } catch (error) {
        console.error('Error loading apps:', error);
        return null;
    }
}

// Get app by ID
function getAppById(appId) {
    if (!appsData) return null;
    return appsData.apps.find(app => app.id === appId);
}

// Get comment count for an app
async function getCommentCount(appId) {
    try {
        const snapshot = await db.collection('comments')
            .where('appId', '==', appId)
            .where('parentId', '==', null)
            .get();
        return snapshot.size;
    } catch (error) {
        console.error('Error getting comment count:', error);
        return 0;
    }
}

// Render apps on home page
async function renderApps() {
    const data = await loadAppsData();
    if (!data) return;
    
    const container = document.getElementById('appsGrid');
    container.innerHTML = '';
    
    for (const app of data.apps) {
        const commentCount = await getCommentCount(app.id);
        
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <div class="app-icon">${app.icon}</div>
            <h3 class="app-name">${app.name}</h3>
            <p class="app-description">${app.description[currentLang]}</p>
            <div class="app-stats">
                <div class="app-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>${commentCount} <span data-i18n="comments"></span></span>
                </div>
                <div class="app-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>${app.downloads} <span data-i18n="downloads"></span></span>
                </div>
            </div>
            <a href="app.html?id=${app.id}" class="btn btn-primary" style="width: 100%;">
                <span data-i18n="viewComments"></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </a>
        `;
        
        container.appendChild(card);
    }
    
    // Update translations
    if (window.updateUI) window.updateUI();
}

// Get Firestore instance
function getDb() {
    return db;
}

export { initFirestore, loadAppsData, getAppById, getCommentCount, renderApps, getDb };
