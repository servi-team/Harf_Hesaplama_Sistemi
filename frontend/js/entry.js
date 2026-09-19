/**
 * Giriş Ekranı (Landing) Mantığı
 * Birleşik giriş formu — rol e-posta/şifreden otomatik belirlenir
 */

// ==================== KART SEÇİMİ ====================

function selectUserType(type) {
    localStorage.setItem('userType', type);
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInUserName');

    if (type === 'guest') {
        // Misafir modunda kalıcı not saklanmaz — eski misafir anahtarlarını temizle
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('grades_guest_') || key.startsWith('savedScores_guest_') || key.startsWith('gradeNotes_guest_') || key.startsWith('grades_genel_')) {
                localStorage.removeItem(key);
            }
        });
    }

    const savedUni = localStorage.getItem('selectedUniversity') || 'itu';
    const savedDept = localStorage.getItem('selectedDepartment') || 'bilgisayar-muhendisligi';
    localStorage.setItem('selectedUniversity', savedUni);
    localStorage.setItem('selectedDepartment', savedDept);

    window.location.href = 'main.html';
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

// ==================== SEKME YÖNETİMİ (GİRİŞ YAP / KAYDOL) ====================

function switchAuthTab(tabName) {
    hideLoginError();
    const loginTabBtn = document.getElementById('tab-login-btn');
    const registerTabBtn = document.getElementById('tab-register-btn');

    const headerTitle = document.getElementById('login-form-header-title');
    const headerSubtitle = document.getElementById('login-form-header-subtitle');

    const loginFields = document.getElementById('login-fields');
    const registerFields = document.getElementById('register-fields');
    const demoCredentials = document.getElementById('demo-credentials');

    if (tabName === 'register') {
        if (loginTabBtn) loginTabBtn.classList.remove('active');
        if (registerTabBtn) registerTabBtn.classList.add('active');

        if (headerTitle) headerTitle.textContent = 'Öğrenci Kaydı';
        if (headerSubtitle) headerSubtitle.textContent = 'Yalnızca üniversite öğrenci e-postası (.edu.tr) ile kaydolabilirsiniz';

        if (loginFields) loginFields.style.display = 'none';
        if (registerFields) registerFields.style.display = 'block';
        if (demoCredentials) demoCredentials.style.display = 'none';

        setTimeout(() => {
            const nameIn = document.getElementById('reg-fullname');
            if (nameIn) nameIn.focus();
        }, 150);
    } else {
        if (registerTabBtn) registerTabBtn.classList.remove('active');
        if (loginTabBtn) loginTabBtn.classList.add('active');

        if (headerTitle) headerTitle.textContent = 'Giriş Yap';
        if (headerSubtitle) headerSubtitle.textContent = 'E-posta ve şifrenizi girin — rolünüz otomatik belirlenir';

        if (registerFields) registerFields.style.display = 'none';
        if (loginFields) loginFields.style.display = 'block';
        if (demoCredentials) demoCredentials.style.display = 'block';

        setTimeout(() => {
            const emailIn = document.getElementById('login-email');
            if (emailIn) emailIn.focus();
        }, 150);
    }
}

// ==================== ÜNİVERSİTE ALGISI ====================

/**
 * E-posta uzantısından üniversite kimliğini (ytu, itu, boun, odtu) otomatik tespit eder
 */
function detectUniversityFromEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const parts = cleanEmail.split('@');
    if (parts.length < 2) return null;
    const domain = parts[1];

    if (domain.includes('yildiz.edu.tr') || domain.includes('ytu.edu.tr')) return 'ytu';
    if (domain.includes('itu.edu.tr')) return 'itu';
    if (domain.includes('boun.edu.tr') || domain.includes('bogazici.edu.tr')) return 'boun';
    if (domain.includes('metu.edu.tr') || domain.includes('odtu.edu.tr')) return 'odtu';

    return null;
}

// ==================== ÖĞRENCİ KAYDI ====================

async function attemptRegister() {
    const fullName = document.getElementById('reg-fullname') ? document.getElementById('reg-fullname').value.trim() : '';
    const email = document.getElementById('reg-email') ? document.getElementById('reg-email').value.trim().toLowerCase() : '';
    const password = document.getElementById('reg-password') ? document.getElementById('reg-password').value : '';
    const passwordConfirm = document.getElementById('reg-password-confirm') ? document.getElementById('reg-password-confirm').value : '';

    hideLoginError();

    if (!fullName || !email || !password || !passwordConfirm) {
        showLoginError('Lütfen tüm kayıt alanlarını doldurun.');
        shakeForm();
        return;
    }

    if (fullName.length < 2 || fullName.length > 100 || /[<>]/.test(fullName)) {
        showLoginError('Ad Soyad 2-100 karakter arasında olmalıdır.');
        shakeForm();
        return;
    }

    // Öğrenci Maili Doğrulaması: Sadece .edu.tr uzantılı üniversite maili kabul edilir (örn: kullanici@std.yildiz.edu.tr)
    const studentEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.tr$/i;
    if (!studentEmailRegex.test(email)) {
        showLoginError('Yalnızca geçerli bir üniversite öğrenci e-postası ile kaydolabilirsiniz (Örn: kullanici@std.yildiz.edu.tr veya .edu.tr)');
        shakeForm();
        return;
    }

    if (password.length < 6) {
        showLoginError('Şifre en az 6 karakter olmalıdır.');
        shakeForm();
        return;
    }

    if (password !== passwordConfirm) {
        showLoginError('Şifreler eşleşmiyor.');
        shakeForm();
        return;
    }

    // E-posta mükerrerlik kontrolü
    for (const uId in MOCK_DATA.mockUsers) {
        if (MOCK_DATA.mockUsers[uId].email && MOCK_DATA.mockUsers[uId].email.toLowerCase() === email) {
            showLoginError('Bu e-posta adresi ile zaten bir hesap kayıtlı. Lütfen giriş yapın.');
            shakeForm();
            return;
        }
    }

    // Başarılı Kayıt — Yeni Öğrenci Hesabı Oluştur
    const userId = 'user-std-' + Date.now();
    const passwordHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashedPassword = Array.from(new Uint8Array(passwordHashBuffer), byte => byte.toString(16).padStart(2, '0')).join('');

    const detectedUni = detectUniversityFromEmail(email);
    const userUni = detectedUni || localStorage.getItem('selectedUniversity') || 'ytu';
    const userDept = localStorage.getItem('selectedDepartment') || 'bilgisayar-muhendisligi';

    const newUser = {
        userId: userId,
        userName: fullName,
        email: email,
        passwordHash: hashedPassword,
        role: 'student',
        universityId: userUni,
        departmentId: userDept
    };

    MOCK_DATA.mockUsers[userId] = newUser;
    MOCK_DATA.mockCurrentUser = userId;

    if (typeof saveMockData === 'function') {
        saveMockData();
    }

    localStorage.setItem('userType', 'student');
    localStorage.setItem('loggedInUserId', userId);
    localStorage.setItem('loggedInUserName', fullName);
    localStorage.setItem('selectedUniversity', userUni);

    // Misafir modunda girilmiş notlar varsa yeni kullanıcıya aktar
    syncGuestGradesToUser(userId, userUni, userDept);

    alert(`✅ Kaydınız başarıyla tamamlandı!\nHoş geldiniz, ${fullName}.`);
    window.location.href = 'wizard.html?autoUni=true';
}

// ==================== GİRİŞ DOĞRULAMA ====================

async function attemptLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showLoginError('Lütfen e-posta ve şifrenizi girin.');
        return;
    }

    if (email.length > 150 || password.length > 100) {
        showLoginError('Girdi uzunluk sınırları aşıldı.');
        return;
    }

    const passwordHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashedPassword = Array.from(new Uint8Array(passwordHash), byte => byte.toString(16).padStart(2, '0')).join('');
    const users = MOCK_DATA.mockUsers;
    let matchedUser = null;

    for (const userId in users) {
        const user = users[userId];
        if (user.email === email && user.passwordHash === hashedPassword) {
            matchedUser = user;
            break;
        }
    }

    if (!matchedUser) {
        showLoginError('E-posta veya şifre hatalı.');
        shakeForm();
        return;
    }

    // Başarılı giriş — rol otomatik belirlenir ve e-postaya göre üniversite güncellenir
    const detectedUni = detectUniversityFromEmail(email) || matchedUser.universityId;
    const userUni = detectedUni || localStorage.getItem('selectedUniversity') || 'ytu';
    const userDept = matchedUser.departmentId || localStorage.getItem('selectedDepartment') || 'bilgisayar-muhendisligi';

    matchedUser.universityId = userUni;

    localStorage.setItem('userType', matchedUser.role);
    localStorage.setItem('loggedInUserId', matchedUser.userId);
    localStorage.setItem('loggedInUserName', matchedUser.userName);
    localStorage.setItem('selectedUniversity', userUni);
    localStorage.setItem('selectedDepartment', userDept);

    if (typeof saveMockData === 'function') {
        saveMockData();
    }

    // Misafir modunda hesaplanan notları oturum açan hesabın kaydedilmiş verilerine aktar
    syncGuestGradesToUser(matchedUser.userId, userUni, userDept);

    window.location.href = 'wizard.html?autoUni=true';
}

/**
 * Misafir modunda hesaplanan notları ve ders bilgilerini oturum açan hesaba aktarır
 */
function syncGuestGradesToUser(userId, uni, dept) {
    if (!userId) return;
    const currentUni = uni || localStorage.getItem('selectedUniversity') || 'itu';
    const currentDept = dept || localStorage.getItem('selectedDepartment') || 'bilgisayar-muhendisligi';

    const guestKey = `grades_guest_${currentUni}_${currentDept}`;
    const legacyKey = `grades_${currentUni}_${currentDept}`;
    const userKey = `grades_user_${userId}_${currentUni}_${currentDept}`;

    const guestGrades = localStorage.getItem(guestKey) || localStorage.getItem(legacyKey);
    const userGrades = localStorage.getItem(userKey);

    if (guestGrades) {
        if (!userGrades) {
            localStorage.setItem(userKey, guestGrades);
        } else {
            try {
                const parsedGuest = JSON.parse(guestGrades);
                const parsedUser = JSON.parse(userGrades);
                const merged = { ...parsedGuest, ...parsedUser };
                localStorage.setItem(userKey, JSON.stringify(merged));
            } catch (e) {}
        }
    }
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
            <div class="demo-user" onclick="fillCredentials('${escapeHtml(u.email)}')">
                <span class="demo-name">${escapeHtml(u.userName)}</span>
                <span class="demo-email">${escapeHtml(u.email)}</span>
                <span class="demo-badge">${roleLabels[u.role] || escapeHtml(u.role)}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

function fillCredentials(email) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = '';
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
        if (e.key === 'Enter') {
            const registerFields = document.getElementById('register-fields');
            if (registerFields && registerFields.style.display !== 'none') {
                attemptRegister();
            } else {
                attemptLogin();
            }
        }
        if (e.key === 'Escape') backToCards();
    }
});
