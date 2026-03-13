// Reaction functionality
import { getCurrentUser, showToast } from './auth.js';
import { t } from './i18n.js';
import { getDb } from './forum.js';

// Toggle reaction on a comment
window.toggleReaction = async function(commentId, emoji) {
    const user = getCurrentUser();
    if (!user) {
        showToast(t('signInRequired'), 'warning');
        return;
    }
    
    const db = getDb();
    const commentRef = db.collection('comments').doc(commentId);
    
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(commentRef);
            if (!doc.exists) {
                throw new Error('Comment not found');
            }
            
            const data = doc.data();
            const reactions = data.reactions || {};
            const userReactionKey = `reaction_${user.uid}`;
            const currentReaction = data[userReactionKey];
            
            // Remove old reaction if exists
            if (currentReaction) {
                reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 0) - 1);
            }
            
            // Toggle new reaction
            if (currentReaction === emoji) {
                // Remove reaction
                transaction.update(commentRef, {
                    reactions: reactions,
                    [userReactionKey]: firebase.firestore.FieldValue.delete()
                });
            } else {
                // Add/change reaction
                reactions[emoji] = (reactions[emoji] || 0) + 1;
                transaction.update(commentRef, {
                    reactions: reactions,
                    [userReactionKey]: emoji
                });
            }
        });
    } catch (error) {
        console.error('Error toggling reaction:', error);
        showToast(t('error'), 'error');
    }
};

export { };
