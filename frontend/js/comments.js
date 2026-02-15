/**
 * Yorum Sistemi — Sağ Alt Panel
 * 
 * Hiyerarşi: superadmin(3) > admin(2) > student(1) > guest(0)
 *   - Alt seviye yorumlarını SİLEBİLİRSİN
 *   - Eşit seviye yorumlarını ŞİKAYET EDEBİLİRSİN
 *   - Üst seviye yorumlarına dokunamazsın
 *   - Ziyaretçi: sadece okunabilir (like/dislike/report/comment yok)
 *   - Like/dislike: giriş yapmış herkes (student+) yapabilir
 */

let currentCourseIdForComments = null;
let currentSortMode = 'score';

// ==================== ROL HİYERARŞİSİ ====================

const ROLE_LEVELS = {
    guest: 0,
    student: 1,
    admin: 2,
    superadmin: 3
};

const ROLE_LABELS = {
    guest: 'Ziyaretçi',
    student: 'Öğrenci',
    admin: 'Yönetici',
    superadmin: 'Süper Admin'
};

const ROLE_COLORS = {
    student: '#10b981',
    admin: '#f59e0b',
    superadmin: '#ef4444'
};

function getRoleLevel(role) {
    return ROLE_LEVELS[role] || 0;
}

function getCommentOwnerRole(comment) {
    // Yorumcunun rolünü mockUsers'dan bul
    const user = MOCK_DATA.mockUsers[comment.userId];
    return user ? user.role : 'student';
}

// ==================== KULLANICI HELPER ====================

function getCurrentUser() {
    const userId = MOCK_DATA.mockCurrentUser;
    if (!userId) return null;
    if (typeof userId === 'object') return userId;
    return MOCK_DATA.mockUsers[userId] || null;
}

function isGuest() {
    return getCurrentUser() === null;
}

function redirectToRegister(action) {
    alert(`"${action}" yapabilmek için giriş yapmanız gerekiyor.\nGiriş sayfasına yönlendiriliyorsunuz...`);
    window.location.href = 'index.html';
}

// ==================== YORUM YÜKLEME ====================

function loadComments(courseId) {
    currentCourseIdForComments = courseId;
    const allComments = MOCK_DATA.comments[courseId] || [];

    // Kayıtlı olmayan kullanıcıların yorumlarını sil (diziden kalıcı olarak kaldır)
    for (let i = allComments.length - 1; i >= 0; i--) {
        if (!MOCK_DATA.mockUsers[allComments[i].userId]) {
            allComments.splice(i, 1);
        }
    }

    const visibleComments = allComments.filter(c => c.status === 1 || c.status === 2);
    const sorted = sortComments(visibleComments, currentSortMode);

    renderComments(sorted, courseId);
    updateCommentCount(visibleComments.length);

    if (isGuest()) {
        hideCommentForm();
    } else {
        showCommentForm();
    }
}

function resetComments() {
    currentCourseIdForComments = null;
    const list = document.getElementById('comments-list');
    if (list) {
        list.innerHTML = `
            <div class="empty-comments">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36" style="opacity: 0.3; margin-bottom: 0.5rem;">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <p>Ders seçildiğinde yorumlar burada görünecek.</p>
            </div>
        `;
    }
    hideCommentForm();
    closeProfilePopup();
    updateCommentCount(0);
}

// ==================== SIRALAMA ====================

function sortComments(comments, mode) {
    return [...comments].sort((a, b) => {
        if (mode === 'score') {
            const scoreA = a.likeCount - a.dislikeCount;
            const scoreB = b.likeCount - b.dislikeCount;
            if (scoreB !== scoreA) return scoreB - scoreA;
            return new Date(b.timestamp) - new Date(a.timestamp);
        } else {
            return new Date(b.timestamp) - new Date(a.timestamp);
        }
    });
}

function toggleSortMode() {
    currentSortMode = currentSortMode === 'score' ? 'newest' : 'score';
    const btn = document.querySelector('.btn-sort-comments');
    if (btn) {
        btn.title = currentSortMode === 'score' ? 'En Çok Beğenilen' : 'En Yeni';
        btn.textContent = currentSortMode === 'score' ? '🔥' : '🕐';
    }
    if (currentCourseIdForComments) {
        loadComments(currentCourseIdForComments);
    }
}

// ==================== RENDER ====================

function renderComments(comments, courseId) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    if (comments.length === 0) {
        list.innerHTML = `
            <div class="empty-comments">
                <p>Bu ders için henüz yorum yazılmamış.${isGuest() ? '' : ' İlk yorumu sen yaz!'}</p>
            </div>
        `;
        return;
    }

    const currentUser = getCurrentUser();
    const myLevel = currentUser ? getRoleLevel(currentUser.role) : 0;
    const myId = currentUser ? currentUser.userId : null;

    list.innerHTML = comments.map(comment => {
        const score = comment.likeCount - comment.dislikeCount;
        const hasLiked = myId ? comment.likedBy.includes(myId) : false;
        const hasDisliked = myId ? comment.dislikedBy.includes(myId) : false;
        const isOwn = myId ? comment.userId === myId : false;

        // Yorumcunun rol seviyesi
        const ownerRole = getCommentOwnerRole(comment);
        const ownerLevel = getRoleLevel(ownerRole);
        const roleColor = ROLE_COLORS[ownerRole] || '#6b7280';
        const roleLabel = ROLE_LABELS[ownerRole] || 'Kullanıcı';

        // Hiyerarşik yetki hesaplama
        const canVote = !isGuest() && !isOwn;
        const canDelete = !isGuest() && !isOwn && myLevel > ownerLevel;
        const canReport = !isGuest() && !isOwn && myLevel >= ownerLevel && comment.status === 1
            && (!myId || !comment.reportedBy.includes(myId));

        // Kullanıcı bilgisini mockUsers'ından çek
        const commentOwner = MOCK_DATA.mockUsers[comment.userId];
        const ownerName = commentOwner ? commentOwner.userName : 'Bilinmeyen';

        return `
            <div class="comment-card ${comment.status === 2 ? 'verified' : ''}" data-comment-id="${comment.id}">
                <div class="comment-top">
                    <div class="comment-user-info">
                        <span class="comment-avatar" style="background: ${roleColor}">${ownerName.charAt(0)}</span>
                        <span class="comment-username clickable" onclick="showProfilePopup('${comment.userId}', event)">${ownerName}</span>
                        <span class="comment-role-badge" style="color: ${roleColor}; border-color: ${roleColor}30; background: ${roleColor}10">${roleLabel}</span>
                        ${comment.status === 2 ? '<span class="comment-verified" title="Admin Onaylı">✓</span>' : ''}
                    </div>
                    <div class="comment-meta">
                        <span class="comment-time">${relativeTime(comment.timestamp)}</span>
                        ${comment.editedAt ? '<span class="comment-edited" title="Düzenlendi">(düzenlendi)</span>' : ''}
                    </div>
                </div>
                <p class="comment-text">${escapeHtml(comment.commentText)}</p>
                <div class="comment-actions">
                    <div class="comment-votes">
                        <button class="vote-btn like-btn ${hasLiked ? 'active' : ''}" 
                                onclick="voteComment('${courseId}', '${comment.id}', 'like')"
                                ${isOwn ? 'disabled title="Kendi yorumunuz"' : ''}>
                            <svg viewBox="0 0 24 24" fill="${hasLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                            <span>${comment.likeCount}</span>
                        </button>
                        <button class="vote-btn dislike-btn ${hasDisliked ? 'active' : ''}" 
                                onclick="voteComment('${courseId}', '${comment.id}', 'dislike')"
                                ${isOwn ? 'disabled title="Kendi yorumunuz"' : ''}>
                            <svg viewBox="0 0 24 24" fill="${hasDisliked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                            </svg>
                            <span>${comment.dislikeCount}</span>
                        </button>
                        <span class="vote-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}">${score > 0 ? '+' : ''}${score}</span>
                    </div>
                    <div class="comment-mod-actions">
                        ${canReport ? `
                            <button class="report-btn" onclick="reportComment('${courseId}', '${comment.id}')" title="Şikayet Et">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                    <line x1="4" y1="22" x2="4" y2="15"></line>
                                </svg>
                            </button>
                        ` : ''}
                        ${canDelete ? `
                            <button class="delete-btn" onclick="deleteComment('${courseId}', '${comment.id}')" title="Yorumu Sil">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== OYLAMA ====================

function voteComment(courseId, commentId, voteType) {
    if (isGuest()) {
        redirectToRegister('Oy vermek');
        return;
    }

    const comments = MOCK_DATA.comments[courseId];
    if (!comments) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const currentUser = getCurrentUser();
    const isLike = voteType === 'like';

    if (isLike) {
        if (comment.likedBy.includes(currentUser.userId)) {
            comment.likedBy = comment.likedBy.filter(id => id !== currentUser.userId);
            comment.likeCount--;
        } else {
            if (comment.dislikedBy.includes(currentUser.userId)) {
                comment.dislikedBy = comment.dislikedBy.filter(id => id !== currentUser.userId);
                comment.dislikeCount--;
            }
            comment.likedBy.push(currentUser.userId);
            comment.likeCount++;
        }
    } else {
        if (comment.dislikedBy.includes(currentUser.userId)) {
            comment.dislikedBy = comment.dislikedBy.filter(id => id !== currentUser.userId);
            comment.dislikeCount--;
        } else {
            if (comment.likedBy.includes(currentUser.userId)) {
                comment.likedBy = comment.likedBy.filter(id => id !== currentUser.userId);
                comment.likeCount--;
            }
            comment.dislikedBy.push(currentUser.userId);
            comment.dislikeCount++;
        }
    }

    loadComments(courseId);
}

// ==================== ŞİKAYET ====================

function reportComment(courseId, commentId) {
    if (isGuest()) {
        redirectToRegister('Şikayet etmek');
        return;
    }

    if (!confirm('Bu yorumu şikayet etmek istediğinizden emin misiniz?')) return;

    const comments = MOCK_DATA.comments[courseId];
    if (!comments) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const currentUser = getCurrentUser();

    if (!comment.reportedBy.includes(currentUser.userId)) {
        comment.reportedBy.push(currentUser.userId);
    }
    comment.status = 0;

    loadComments(courseId);
}

// ==================== YORUM SİLME ====================

function deleteComment(courseId, commentId) {
    if (isGuest()) return;

    const currentUser = getCurrentUser();
    const comments = MOCK_DATA.comments[courseId];
    if (!comments) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // Hiyerarşi kontrolü — sadece alt seviye yorumlar silinebilir
    const myLevel = getRoleLevel(currentUser.role);
    const ownerLevel = getRoleLevel(getCommentOwnerRole(comment));

    if (myLevel <= ownerLevel) {
        alert('Bu yorumu silmeye yetkiniz yok.');
        return;
    }

    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    // Yorumu diziden kalıcı olarak sil
    const idx = comments.findIndex(c => c.id === commentId);
    if (idx !== -1) {
        comments.splice(idx, 1);
    }

    loadComments(courseId);
}

// ==================== YORUM EKLEME ====================

function submitComment() {
    if (isGuest()) {
        redirectToRegister('Yorum yapmak');
        return;
    }

    if (!currentCourseIdForComments) return;

    const textarea = document.querySelector('.comment-input');
    if (!textarea) return;

    const text = textarea.value.trim();
    if (!text) return;

    const currentUser = getCurrentUser();

    const newComment = {
        id: 'c-' + Date.now(),
        userId: currentUser.userId,
        commentText: text,
        timestamp: new Date().toISOString(),
        editedAt: null,
        likeCount: 0,
        dislikeCount: 0,
        likedBy: [],
        dislikedBy: [],
        status: 1,
        userGrade: null,
        reportedBy: []
    };

    if (!MOCK_DATA.comments[currentCourseIdForComments]) {
        MOCK_DATA.comments[currentCourseIdForComments] = [];
    }
    MOCK_DATA.comments[currentCourseIdForComments].push(newComment);

    textarea.value = '';
    loadComments(currentCourseIdForComments);
}

// ==================== KULLANICI PROFİL POPUP ====================

function showProfilePopup(userId, event) {
    event.stopPropagation();

    const user = MOCK_DATA.mockUsers[userId];
    if (!user) return;

    // Eski popup'ı kaldır
    closeProfilePopup();

    const roleLabel = ROLE_LABELS[user.role] || 'Kullanıcı';
    const roleColor = ROLE_COLORS[user.role] || '#6b7280';
    const regDate = new Date(user.registeredAt).toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const popup = document.createElement('div');
    popup.className = 'profile-popup';
    popup.innerHTML = `
        <div class="profile-popup-content">
            <div class="profile-popup-header">
                <span class="profile-avatar" style="background: ${roleColor}">${user.userName.charAt(0)}</span>
                <div>
                    <div class="profile-name">${user.userName}</div>
                    <div class="profile-role" style="color: ${roleColor}">${roleLabel}</div>
                </div>
                <button class="profile-close" onclick="closeProfilePopup()">✕</button>
            </div>
            <div class="profile-details">
                <div class="profile-detail-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>${user.email}</span>
                </div>
                <div class="profile-detail-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Kayıt: ${regDate}</span>
                </div>
            </div>
        </div>
    `;

    // Popup'ı comments-list'e ekle (relative konumlandırma)
    const commentsList = document.getElementById('comments-list');
    if (commentsList) {
        commentsList.appendChild(popup);

        // Popup konumunu tıklanan yere göre ayarla
        const rect = event.target.getBoundingClientRect();
        const listRect = commentsList.getBoundingClientRect();
        popup.style.top = (rect.bottom - listRect.top + commentsList.scrollTop + 4) + 'px';
        popup.style.left = (rect.left - listRect.left) + 'px';
    }

    // Dışına tıklayınca kapat
    setTimeout(() => {
        document.addEventListener('click', closeProfilePopupOnOutside);
    }, 10);
}

function closeProfilePopup() {
    const existing = document.querySelector('.profile-popup');
    if (existing) existing.remove();
    document.removeEventListener('click', closeProfilePopupOnOutside);
}

function closeProfilePopupOnOutside(e) {
    if (!e.target.closest('.profile-popup') && !e.target.closest('.comment-username')) {
        closeProfilePopup();
    }
}

// ==================== YARDIMCI ====================

function relativeTime(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHr < 24) return `${diffHr} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} hafta önce`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)} ay önce`;
    return `${Math.floor(diffDay / 365)} yıl önce`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateCommentCount(count) {
    const badge = document.getElementById('comment-count');
    if (badge) {
        badge.textContent = count > 0 ? `${count} yorum` : 'Yorumlar';
    }
}

function showCommentForm() {
    const form = document.getElementById('comment-form');
    if (form) form.style.display = 'block';
}

function hideCommentForm() {
    const form = document.getElementById('comment-form');
    if (form) form.style.display = 'none';
}
