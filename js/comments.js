// Comments functionality
import { getCurrentUser, isAdmin, showToast } from './auth.js';
import { t, currentLang } from './i18n.js';
import { getDb } from './forum.js';

let currentAppId = null;
let commentsListener = null;
let sortBy = 'newest';
let searchQuery = '';

// Initialize comments for an app
function initComments(appId) {
    currentAppId = appId;
    loadComments();
    setupCommentForm();
    setupSearch();
    setupSort();
}

// Load comments with real-time updates
function loadComments() {
    const db = getDb();
    if (!db || !currentAppId) return;
    
    // Remove previous listener
    if (commentsListener) {
        commentsListener();
    }
    
    // Set up real-time listener
    let query = db.collection('comments')
        .where('appId', '==', currentAppId)
        .where('parentId', '==', null);
    
    // Apply sorting
    if (sortBy === 'newest') {
        query = query.orderBy('createdAt', 'desc');
    }
    
    commentsListener = query.onSnapshot((snapshot) => {
        const comments = [];
        snapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        
        // Apply search filter
        let filtered = comments;
        if (searchQuery) {
            filtered = comments.filter(comment => 
                comment.text.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Sort by popularity if needed
        if (sortBy === 'popular') {
            filtered.sort((a, b) => {
                const aCount = Object.values(a.reactions || {}).reduce((sum, val) => sum + val, 0);
                const bCount = Object.values(b.reactions || {}).reduce((sum, val) => sum + val, 0);
                return bCount - aCount;
            });
        }
        
        renderComments(filtered);
    });
}

// Render comments
async function renderComments(comments) {
    const container = document.getElementById('commentsList');
    if (!container) return;
    
    if (comments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <p data-i18n="noComments"></p>
                <p data-i18n="beFirst"></p>
            </div>
        `;
        if (window.updateUI) window.updateUI();
        return;
    }
    
    container.innerHTML = '';
    
    for (const comment of comments) {
        const commentEl = await createCommentElement(comment);
        container.appendChild(commentEl);
        
        // Load replies
        const replies = await loadReplies(comment.id);
        if (replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'comment-replies';
            for (const reply of replies) {
                const replyEl = await createCommentElement(reply, true);
                repliesContainer.appendChild(replyEl);
            }
            commentEl.appendChild(repliesContainer);
        }
    }
}

// Create comment element
async function createCommentElement(comment, isReply = false) {
    const div = document.createElement('div');
    div.className = `comment ${comment.isPinned ? 'pinned' : ''}`;
    div.dataset.commentId = comment.id;
    
    const user = getCurrentUser();
    const canModerate = isAdmin();
    const isOwner = user && user.uid === comment.userId;
    
    // Format date
    const date = comment.createdAt?.toDate?.() || new Date();
    const timeAgo = formatTimeAgo(date);
    
    // Render reactions
    const reactionsHtml = renderReactions(comment);
    
    // Parse markdown
    const contentHtml = renderMarkdown(comment.text);
    
    div.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">
                <img src="${comment.userPhoto || 'assets/logo.svg'}" alt="${comment.userName}" class="comment-avatar">
                <div class="comment-author-info">
                    <div>
                        <span class="comment-author-name">${comment.userName}</span>
                        ${canModerate && comment.userId === user?.uid ? '<span class="admin-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg> <span data-i18n="admin"></span></span>' : ''}
                    </div>
                    <span class="comment-date">${timeAgo}</span>
                </div>
            </div>
            <div class="comment-actions">
                ${comment.isPinned ? '<span class="pinned-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/></svg> <span data-i18n="pinned"></span></span>' : ''}
                ${canModerate ? `
                    <button class="icon-btn" onclick="togglePin('${comment.id}', ${!comment.isPinned})" title="${comment.isPinned ? t('unpin') : t('pin')}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/>
                        </svg>
                    </button>
                ` : ''}
                ${canModerate || isOwner ? `
                    <button class="icon-btn" onclick="deleteComment('${comment.id}')" title="${t('delete')}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
        </div>
        <div class="comment-content">${contentHtml}</div>
        ${reactionsHtml}
        ${!isReply && user ? `
            <button class="btn btn-ghost" onclick="toggleReplyForm('${comment.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 14 4 9 9 4"></polyline>
                    <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                </svg>
                <span data-i18n="reply"></span>
            </button>
            <div id="replyForm${comment.id}" class="reply-form" style="display: none;">
                <textarea id="replyText${comment.id}" class="reply-textarea" placeholder="${t('writeComment')}" maxlength="2000"></textarea>
                <div class="form-buttons" style="margin-top: 0.5rem;">
                    <button class="btn btn-success" onclick="submitReply('${comment.id}')">
                        <span data-i18n="send"></span>
                    </button>
                    <button class="btn btn-secondary" onclick="closeReplyForm('${comment.id}')">
                        <span data-i18n="cancel"></span>
                    </button>
                </div>
            </div>
        ` : ''}
    `;
    
    return div;
}

// Render reactions
function renderReactions(comment) {
    const reactions = comment.reactions || {};
    const emojis = ['👍', '👎', '❤️', '😂', '🎮'];
    const user = getCurrentUser();
    
    let html = '<div class="comment-reactions">';
    
    for (const emoji of emojis) {
        const count = reactions[emoji] || 0;
        const userReaction = user ? comment[`reaction_${user.uid}`] : null;
        const isActive = userReaction === emoji;
        
        html += `
            <button class="reaction-btn ${isActive ? 'active' : ''}" 
                    onclick="toggleReaction('${comment.id}', '${emoji}')"
                    ${!user ? 'disabled' : ''}>
                <span class="reaction-emoji">${emoji}</span>
                ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
            </button>
        `;
    }
    
    html += '</div>';
    return html;
}

// Load replies for a comment
async function loadReplies(parentId) {
    const db = getDb();
    const snapshot = await db.collection('comments')
        .where('parentId', '==', parentId)
        .orderBy('createdAt', 'asc')
        .get();
    
    const replies = [];
    snapshot.forEach((doc) => {
        replies.push({ id: doc.id, ...doc.data() });
    });
    
    return replies;
}

// Setup comment form
function setupCommentForm() {
    const textarea = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');
    const sendBtn = document.getElementById('sendCommentBtn');
    
    if (!textarea) return;
    
    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        const remaining = 2000 - length;
        charCount.textContent = `${remaining} ${t('charactersLeft')}`;
        
        if (remaining < 100) {
            charCount.className = 'char-count warning';
        } else if (remaining < 0) {
            charCount.className = 'char-count danger';
            sendBtn.disabled = true;
        } else {
            charCount.className = 'char-count';
            sendBtn.disabled = false;
        }
    });
    
    sendBtn.addEventListener('click', submitComment);
}

// Submit comment
async function submitComment() {
    const textarea = document.getElementById('commentText');
    const text = textarea.value.trim();
    
    if (!text) {
        showToast(t('commentEmpty'), 'warning');
        return;
    }
    
    if (text.length > 2000) {
        showToast(t('commentTooLong'), 'error');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showToast(t('signInRequired'), 'warning');
        return;
    }
    
    const db = getDb();
    
    try {
        await db.collection('comments').add({
            appId: currentAppId,
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            reactions: {},
            isPinned: false,
            parentId: null
        });
        
        textarea.value = '';
        showToast(t('commentAdded'), 'success');
    } catch (error) {
        console.error('Error adding comment:', error);
        showToast(t('error'), 'error');
    }
}

// Submit reply
window.submitReply = async function(parentId) {
    const textarea = document.getElementById(`replyText${parentId}`);
    const text = textarea.value.trim();
    
    if (!text) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    const db = getDb();
    
    try {
        await db.collection('comments').add({
            appId: currentAppId,
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            reactions: {},
            isPinned: false,
            parentId: parentId
        });
        
        textarea.value = '';
        closeReplyForm(parentId);
        showToast(t('commentAdded'), 'success');
    } catch (error) {
        console.error('Error adding reply:', error);
        showToast(t('error'), 'error');
    }
};

// Toggle reply form
window.toggleReplyForm = function(commentId) {
    const form = document.getElementById(`replyForm${commentId}`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

// Close reply form
window.closeReplyForm = function(commentId) {
    const form = document.getElementById(`replyForm${commentId}`);
    form.style.display = 'none';
};

// Delete comment
window.deleteComment = async function(commentId) {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    
    const db = getDb();
    
    try {
        // Delete comment
        await db.collection('comments').doc(commentId).delete();
        
        // Delete all replies
        const replies = await db.collection('comments')
            .where('parentId', '==', commentId)
            .get();
        
        const batch = db.batch();
        replies.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        showToast(t('commentDeleted'), 'success');
    } catch (error) {
        console.error('Error deleting comment:', error);
        showToast(t('error'), 'error');
    }
};

// Toggle pin
window.togglePin = async function(commentId, pinned) {
    const db = getDb();
    
    try {
        await db.collection('comments').doc(commentId).update({
            isPinned: pinned
        });
        
        showToast(pinned ? t('commentPinned') : t('commentUnpinned'), 'success');
    } catch (error) {
        console.error('Error toggling pin:', error);
        showToast(t('error'), 'error');
    }
};

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('searchComments');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        loadComments();
    });
}

// Setup sort
function setupSort() {
    const sortSelect = document.getElementById('sortComments');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        loadComments();
    });
}

// Format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        yıl: 31536000,
        ay: 2592000,
        hafta: 604800,
        gün: 86400,
        saat: 3600,
        dakika: 60,
        saniye: 1
    };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return `${interval} ${name} önce`;
        }
    }
    
    return 'Az önce';
}

// Simple markdown renderer
function renderMarkdown(text) {
    // Sanitize first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code inline
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

export { initComments };
