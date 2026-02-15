/**
 * Giriş Ekranı (Landing) Mantığı
 * Birleşik giriş formu — rol e-posta/şifreden otomatik belirlenir
 */

// ==================== KART SEÇİMİ ====================

function selectUserType(type) {
    localStorage.setItem('userType', type);
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInUserName');
    window.location.href = 'wizard.html';
}

function showLoginForm() {
    document.getElementById('cards-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'flex';

    showDemoCredentials();
    hideLoginError();

    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    setTimeout(() => document.getElementById('login-email').focus(), 300);
}

function backToCards() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('cards-view').style.display = 'grid';
    hideLoginError();
}

// ==================== GİRİŞ DOĞRULAMA ====================

function attemptLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showLoginError('Lütfen e-posta ve şifrenizi girin.');
        return;
    }

    const users = MOCK_DATA.mockUsers;
    let matchedUser = null;

    for (const userId in users) {
        const user = users[userId];
        if (user.email === email && user.password === password) {
            matchedUser = user;
            break;
        }
    }

    if (!matchedUser) {
        showLoginError('E-posta veya şifre hatalı.');
        shakeForm();
        return;
    }

    // Başarılı giriş — rol otomatik belirlenir
    localStorage.setItem('userType', matchedUser.role);
    localStorage.setItem('loggedInUserId', matchedUser.userId);
    localStorage.setItem('loggedInUserName', matchedUser.userName);

    window.location.href = 'wizard.html';
}

// ==================== DEMO BİLGİLERİ ====================

function showDemoCredentials() {
    const container = document.getElementById('demo-credentials');
    const users = MOCK_DATA.mockUsers;

    const roleLabels = {
        superadmin: '🔴 Süper Admin',
        admin: '🟠 Yönetici',
        student: '🟢 Öğrenci'
    };

    let html = `
        <div class="demo-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Demo Hesapları (tıkla → otomatik doldur)</span>
        </div>
    `;

    for (const userId in users) {
        const u = users[userId];
        html += `
            <div class="demo-user" onclick="fillCredentials('${u.email}', '${u.password}')">
                <span class="demo-name">${u.userName}</span>
                <span class="demo-email">${u.email}</span>
                <span class="demo-badge">${roleLabels[u.role] || u.role}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

function fillCredentials(email, password) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
    hideLoginError();
}

// ==================== HATA ====================

function showLoginError(msg) {
    const el = document.getElementById('login-error');
    document.getElementById('login-error-text').textContent = msg;
    el.style.display = 'flex';
}

function hideLoginError() {
    document.getElementById('login-error').style.display = 'none';
}

function shakeForm() {
    const card = document.querySelector('.login-card-form');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 500);
}

// ==================== KLAVYE ====================

document.addEventListener('keydown', (e) => {
    const loginView = document.getElementById('login-view');
    if (loginView && loginView.style.display !== 'none') {
        if (e.key === 'Enter') attemptLogin();
        if (e.key === 'Escape') backToCards();
    }
});
