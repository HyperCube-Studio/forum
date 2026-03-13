// Admin panel functionality
import { isAdmin, showToast } from './auth.js';
import { t } from './i18n.js';
import { getDb } from './forum.js';

// Check admin access
function checkAdminAccess() {
    if (!isAdmin()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Load admin stats
async function loadAdminStats() {
    if (!checkAdminAccess()) return;
    
    const db = getDb();
    
    try {
        // Total comments
        const commentsSnapshot = await db.collection('comments').get();
        const totalComments = commentsSnapshot.size;
        
        // Comments by app
        const commentsByApp = {};
        commentsSnapshot.forEach(doc => {
            const data = doc.data();
            commentsByApp[data.appId] = (commentsByApp[data.appId] || 0) + 1;
        });
        
        // Update UI
        document.getElementById('totalComments').textContent = totalComments;
        
        const breakdownContainer = document.getElementById('appBreakdown');
        breakdownContainer.innerHTML = '';
        
        for (const [appId, count] of Object.entries(commentsByApp)) {
            const div = document.createElement('div');
            div.className = 'stat-item';
            div.innerHTML = `
                <span class="stat-label">${appId}</span>
                <span class="stat-value">${count}</span>
            `;
            breakdownContainer.appendChild(div);
        }
        
        // Load all comments for moderation
        loadAllComments();
    } catch (error) {
        console.error('Error loading admin stats:', error);
        showToast(t('error'), 'error');
    }
}

// Load all comments for moderation
async function loadAllComments() {
    const db = getDb();
    
    try {
        const snapshot = await db.collection('comments')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const container = document.getElementById('allCommentsList');
        container.innerHTML = '';
        
        snapshot.forEach(doc => {
            const comment = { id: doc.id, ...doc.data() };
            const date = comment.createdAt?.toDate?.() || new Date();
            
            const div = document.createElement('div');
            div.className = 'admin-comment-item';
            div.innerHTML = `
                <div class="comment-meta">
                    <img src="${comment.userPhoto || 'assets/logo.svg'}" alt="${comment.userName}" class="comment-avatar">
                    <div>
                        <strong>${comment.userName}</strong>
                        <span class="comment-app-tag">${comment.appId}</span>
                        <div class="comment-date">${date.toLocaleString('tr-TR')}</div>
                    </div>
                </div>
                <div class="comment-text">${comment.text.substring(0, 200)}${comment.text.length > 200 ? '...' : ''}</div>
                <div class="admin-actions">
                    <button class="btn btn-secondary btn-sm" onclick="adminTogglePin('${doc.id}', ${!comment.isPinned})">
                        ${comment.isPinned ? '📌 Sabitlemeyi Kaldır' : '📌 Sabitle'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminDeleteComment('${doc.id}')">
                        🗑️ Sil
                    </button>
                </div>
            `;
            
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        showToast(t('error'), 'error');
    }
}

// Admin toggle pin
window.adminTogglePin = async function(commentId, pinned) {
    const db = getDb();
    
    try {
        await db.collection('comments').doc(commentId).update({
            isPinned: pinned
        });
        
        showToast(pinned ? t('commentPinned') : t('commentUnpinned'), 'success');
        loadAllComments();
    } catch (error) {
        console.error('Error toggling pin:', error);
        showToast(t('error'), 'error');
    }
};

// Admin delete comment
window.adminDeleteComment = async function(commentId) {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    
    const db = getDb();
    
    try {
        await db.collection('comments').doc(commentId).delete();
        
        // Delete replies
        const replies = await db.collection('comments')
            .where('parentId', '==', commentId)
            .get();
        
        const batch = db.batch();
        replies.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        showToast(t('commentDeleted'), 'success');
        loadAdminStats();
    } catch (error) {
        console.error('Error deleting comment:', error);
        showToast(t('error'), 'error');
    }
};

export { checkAdminAccess, loadAdminStats };
