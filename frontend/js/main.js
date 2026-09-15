/**
 * Ana Ekran JavaScript
 * Dönem/ders listesi yönetimi ve genel ortalama hesaplama
 */

// State
let selectedUniversity = null;
let selectedDepartment = null;
let semesters = [];
let selectedGrades = {}; // {courseId: letterGrade}

/**
 * Sayfa yüklendiğinde çalışır
 */
document.addEventListener('DOMContentLoaded', () => {
    // Seçimleri kontrol et
    selectedUniversity = localStorage.getItem('selectedUniversity');
    selectedDepartment = localStorage.getItem('selectedDepartment');

    if (!selectedUniversity || !selectedDepartment) {
        // Seçim yapılmamış, giriş ekranına yönlendir
        window.location.href = 'index.html';
        return;
    }

    // Üniversite adını göster
    const university = MOCK_DATA.universities[selectedUniversity];
    if (university) {
        document.getElementById('university-name').textContent =
            `${university.name} - ${university.departments[selectedDepartment].name}`;
    }

    // Dönemleri yükle
    loadSemesters();

    // Kaydedilmiş notları yükle
    loadSavedGrades();
});

/**
 * Dönemleri ve dersleri yükler
 */
function loadSemesters() {
    const semesterData = MOCK_DATA.semesters[selectedDepartment];

    if (!semesterData || semesterData.length === 0) {
        showEmptyState();
        return;
    }

    semesters = semesterData;
    renderSemesters();
    updateCourseCount();
}

/**
 * Dönemleri render eder
 */
function renderSemesters() {
    const container = document.getElementById('semester-list');
    container.innerHTML = '';

    semesters.forEach(semester => {
        const semesterDiv = createSemesterElement(semester);
        container.appendChild(semesterDiv);
    });
}

/**
 * Tek bir dönem elementi oluşturur
 */
function createSemesterElement(semester) {
    const div = document.createElement('div');
    div.className = 'semester-accordion';
    div.dataset.semesterId = semester.id;

    const courseCount = semester.courses.length;

    div.innerHTML = `
        <div class="semester-header" onclick="toggleSemester('${escapeHtml(semester.id)}')">
            <span class="toggle-icon">▶</span>
            <span class="semester-name">${escapeHtml(semester.semesterName)}</span>
            <span class="semester-badge">${courseCount} ders</span>
        </div>
        <div class="course-list">
            ${semester.courses.map(course => createCourseElement(course)).join('')}
        </div>
    `;

    return div;
}

/**
 * Tek bir ders elementi oluşturur
 */
function createCourseElement(course) {
    const savedGrade = selectedGrades[course.id] || '';
    const grades = ['', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'];
    const deptId = localStorage.getItem('selectedDepartment') || 'bilgisayar-muh';
    const isAdmin = typeof isAdminUser === 'function' && isAdminUser();
    const uni = selectedUniversity || 'genel';
    const dept = selectedDepartment || 'genel';

    let gradeNotes = {};
    try {
        gradeNotes = JSON.parse(localStorage.getItem(`gradeNotes_${uni}_${dept}`) || '{}');
    } catch (e) {}

    const courseNote = gradeNotes[course.id];
    const tagBadge = course.tag ? `<span class="tag-badge tag-${escapeHtml(course.tag)}">${escapeHtml(course.tag.toUpperCase())}</span>` : '';
    const noteBadge = courseNote ? `<span title="Not: ${escapeHtml(courseNote)}" style="cursor: pointer; margin-left: 4px;">📝</span>` : '';

    return `
        <div class="course-item" 
             draggable="true" 
             data-course-id="${escapeHtml(course.id)}"
             onclick="selectCourse('${escapeHtml(course.id)}')">
            <span class="course-drag-handle">⋮⋮</span>
            <div class="course-info">
                <div class="course-code">${escapeHtml(course.courseCode)}${tagBadge}${noteBadge}</div>
                <div class="course-name">${escapeHtml(course.courseName)}</div>
                <div class="course-credits">${course.credit} Kredi • ${course.ects} AKTS</div>
            </div>
            ${isAdmin ? `
            <div class="course-admin-actions" onclick="event.stopPropagation()">
                <button type="button" class="btn-course-action btn-edit-course" onclick="openEditModal('COURSE','${escapeHtml(course.id)}','${escapeHtml(deptId)}')" title="Dersi Düzenle">✏️</button>
                <button type="button" class="btn-course-action btn-delete-course" onclick="openDeleteModal('COURSE','${escapeHtml(course.id)}','${escapeHtml(deptId)}')" title="Dersi Sil">🗑️</button>
            </div>
            ` : ''}
            <select class="grade-select" data-course-id="${escapeHtml(course.id)}" onclick="event.stopPropagation()" 
                    onchange="onGradeChange('${escapeHtml(course.id)}', this.value); highlightGradeRow(this.value);">
                ${grades.map(g => `<option value="${g}" ${savedGrade === g ? 'selected' : ''}>${g || '—'}</option>`).join('')}
            </select>
        </div>
    `;
}

/**
 * Dönem akordiyonunu aç/kapat
 */
function toggleSemester(semesterId) {
    const accordion = document.querySelector(`[data-semester-id="${semesterId}"]`);
    if (!accordion) return;

    accordion.classList.toggle('open');
}

/**
 * Ders seçildiğinde (tıklandığında)
 */
function selectCourse(courseId) {
    // Dersi orta panelde göster
    loadCourseDetail(courseId);
    // Sağ paneldeki harf aralıklarını güncelle
    updateGradeScale(courseId);
    // Sağ alt paneldeki yorumları yükle
    loadComments(courseId);
}

/**
 * Harf notu değiştiğinde
 */
function onGradeChange(courseId, letterGrade) {
    if (letterGrade) {
        selectedGrades[courseId] = letterGrade;
    } else {
        delete selectedGrades[courseId];
    }

    // Kaydet
    saveGrades();

    // Genel ortalamayı güncelle
    updateOverallGPA();
}

/**
 * Toplam ders sayısını günceller
 */
function updateCourseCount() {
    let totalCourses = 0;
    semesters.forEach(semester => {
        totalCourses += semester.courses.length;
    });

    const countElem = document.getElementById('course-count');
    if (countElem) countElem.textContent = `${totalCourses} ders`;
}

/**
 * Genel ortalamayı hesaplar ve gösterir
 */
function updateOverallGPA() {
    const gradePoints = {
        'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
        'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'FD': 0.5, 'FF': 0.0
    };

    let totalPoints = 0;
    let totalCredits = 0;

    Object.keys(selectedGrades).forEach(courseId => {
        const course = findCourseById(courseId);
        if (!course) return;

        const letterGrade = selectedGrades[courseId];
        const gradePoint = gradePoints[letterGrade];

        if (gradePoint !== undefined) {
            totalPoints += gradePoint * course.credit;
            totalCredits += course.credit;
        }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    
    const headerGpa = document.getElementById('overall-gpa');
    if (headerGpa) headerGpa.textContent = gpa;

    const prominentGpa = document.getElementById('prominent-agno-value');
    if (prominentGpa) prominentGpa.textContent = gpa;
}

/**
 * Ders ID'sine göre ders nesnesini bulur
 */
function findCourseById(courseId) {
    for (const semester of semesters) {
        const course = semester.courses.find(c => c.id === courseId);
        if (course) return course;
    }
    return null;
}

/**
 * Notları localStorage'a kaydeder
 */
function saveGrades() {
    const key = `grades_${selectedUniversity}_${selectedDepartment}`;
    localStorage.setItem(key, JSON.stringify(selectedGrades));
}

/**
 * Kaydedilmiş notları yükler
 */
function loadSavedGrades() {
    const key = `grades_${selectedUniversity}_${selectedDepartment}`;
    const saved = localStorage.getItem(key);

    if (saved) {
        try {
            selectedGrades = JSON.parse(saved);
            updateOverallGPA();
        } catch (e) {
            console.error('Notlar yüklenemedi:', e);
            selectedGrades = {};
        }
    }
}

/**
 * Boş durum göster
 */
function showEmptyState() {
    const container = document.getElementById('semester-list');
    if (container) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
                <p>Bu bölüm için henüz ders bilgisi eklenmemiş.</p>
            </div>
        `;
    }
}

function updateGradeScale(courseId) {
    const container = document.getElementById('grade-scale-content');
    if (!container) return;

    const scaleList = MOCK_DATA.gradeScales[courseId] || [];

    if (scaleList.length > 0) {
        loadScaleToRightPanel(scaleList[0]);
    } else {
        loadScaleToRightPanel({
            label: 'Varsayılan',
            scale: MOCK_DATA.defaultGradeScale,
            totalStudents: null
        });
    }
}

function resetGradeScale() {
    const container = document.getElementById('grade-scale-content');
    if (!container) return;

    container.innerHTML = `
        <div class="grade-scale-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"
                style="opacity: 0.3; margin-bottom: 0.5rem;">
                <path d="M4 7V4h16v3" />
                <path d="M9 20h6" />
                <path d="M12 4v16" />
            </svg>
            <p>Ders seçildiğinde harf aralıkları burada görünecek.</p>
        </div>
    `;
}

// ==================== TEMA DEĞİŞTİRME (LIGHT / DARK) ====================
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
    }
}

// Sayfa ilk yüklendiğinde temayı yükle
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }
});

// ==================== MODAL VE İSTATİSTİK YÖNETİMİ ====================
function closeModal(modalId) {
    if (!modalId) {
        const adminContainer = document.getElementById('admin-modal-container');
        if (adminContainer) adminContainer.innerHTML = '';
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        return;
    }
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

// ESC tuşu ile açık modal kapatma
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// İstatistikler Modalı Açma
function openStatsModal() {
    const body = document.getElementById('stats-modal-body');
    if (!body) return;

    const gradePoints = {
        'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
        'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'FD': 0.5, 'FF': 0.0
    };

    let semesterStats = [];
    let highCourses = [];
    let lowCourses = [];
    let retakeCourses = [];

    semesters.forEach(sem => {
        let semPoints = 0;
        let semCredits = 0;

        sem.courses.forEach(c => {
            const grade = selectedGrades[c.id];
            if (grade && gradePoints[grade] !== undefined) {
                const pt = gradePoints[grade];
                semPoints += pt * c.credit;
                semCredits += c.credit;

                if (pt >= 3.0) highCourses.push({ course: c, grade });
                else if (pt <= 1.5) lowCourses.push({ course: c, grade });
                if (['FF', 'FD', 'DC', 'DD'].includes(grade)) retakeCourses.push({ course: c, grade });
            }
        });

        const semGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '-';
        semesterStats.push({ name: sem.semesterName, gpa: semGPA, credits: semCredits });
    });

    const currentAGNO = document.getElementById('overall-gpa') ? document.getElementById('overall-gpa').textContent : '0.00';

    body.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Genel Not Ortalaması (AGNO)</span>
                <div style="font-size: 2rem; font-weight: 800; color: var(--primary-light);">${currentAGNO}</div>
            </div>
            <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Toplam Girilen Not Sayısı</span>
                <div style="font-size: 2rem; font-weight: 800; color: var(--secondary);">${Object.keys(selectedGrades).length} Ders</div>
            </div>
        </div>

        <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-primary);">📅 Dönemlik Ortalamalar (ANO)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
            ${semesterStats.map(s => `
                <div style="background: var(--bg-dark); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                    <div style="font-size: 0.8rem; font-weight: 600;">${s.name}</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-light); margin-top: 0.2rem;">${s.gpa}</div>
                </div>
            `).join('')}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
                <h3 style="font-size: 0.9rem; color: #ef4444; margin-bottom: 0.5rem;">🔻 Ortalamayı Aşağı Çeken Dersler</h3>
                <div style="background: var(--bg-dark); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border); max-height: 150px; overflow-y: auto;">
                    ${lowCourses.length > 0 ? lowCourses.map(item => `
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem;">
                            <span>${item.course.courseCode} - ${item.course.courseName}</span>
                            <span style="font-weight: 700; color: #ef4444;">${item.grade}</span>
                        </div>
                    `).join('') : '<span style="font-size: 0.75rem; color: var(--text-muted);">Yok</span>'}
                </div>
            </div>

            <div>
                <h3 style="font-size: 0.9rem; color: #10b981; margin-bottom: 0.5rem;">🔺 Yükseltilmesi / Tekrarı Önerilen Dersler</h3>
                <div style="background: var(--bg-dark); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border); max-height: 150px; overflow-y: auto;">
                    ${retakeCourses.length > 0 ? retakeCourses.map(item => `
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem;">
                            <span>${item.course.courseCode} - ${item.course.courseName}</span>
                            <span style="font-weight: 700; color: #f59e0b;">${item.grade}</span>
                        </div>
                    `).join('') : '<span style="font-size: 0.75rem; color: var(--text-muted);">Yok</span>'}
                </div>
            </div>
        </div>
    `;

    openModal('stats-modal');
}

// Profil Modalı İşlemleri
function openProfileModal() {
    const userId = MOCK_DATA.mockCurrentUser;
    const nameInput = document.getElementById('prof-name');
    const emailInput = document.getElementById('prof-email');

    if (userId && MOCK_DATA.mockUsers[userId]) {
        nameInput.value = MOCK_DATA.mockUsers[userId].userName || '';
        emailInput.value = MOCK_DATA.mockUsers[userId].email || '';
    } else {
        nameInput.value = localStorage.getItem('loggedInUserName') || 'Misafir Kullanıcı';
        emailInput.value = 'misafir@harfhesaplama.com';
    }

    // Üniversite/Bölüm listesini doldur
    populateProfUniSelect();

    openModal('profile-modal');
}

function switchProfileTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(c => c.style.display = 'none');

    if (tabName === 'info') {
        document.getElementById('tab-info').style.display = 'block';
        event.target.classList.add('active');
    } else if (tabName === 'dept') {
        document.getElementById('tab-dept').style.display = 'block';
        event.target.classList.add('active');
    } else if (tabName === 'my-comments') {
        document.getElementById('tab-my-comments').style.display = 'block';
        event.target.classList.add('active');
        loadMyComments();
    }
}

function populateProfUniSelect() {
    const uniSelect = document.getElementById('prof-uni-select');
    if (!uniSelect) return;

    uniSelect.innerHTML = Object.keys(MOCK_DATA.universities).map(id => {
        const u = MOCK_DATA.universities[id];
        return `<option value="${u.id}" ${u.id === selectedUniversity ? 'selected' : ''}>${u.name}</option>`;
    }).join('');

    onProfUniChange(uniSelect.value);
}

function onProfUniChange(uniId) {
    const deptSelect = document.getElementById('prof-dept-select');
    if (!deptSelect) return;

    const uni = MOCK_DATA.universities[uniId];
    if (!uni || !uni.departments) return;

    deptSelect.innerHTML = Object.keys(uni.departments).map(id => {
        const d = uni.departments[id];
        return `<option value="${d.id}" ${d.id === selectedDepartment ? 'selected' : ''}>${d.name}</option>`;
    }).join('');
}

function saveProfileInfo(e) {
    e.preventDefault();
    const name = document.getElementById('prof-name').value.trim();
    localStorage.setItem('loggedInUserName', name);
    
    const label = document.getElementById('user-role-label');
    if (label) label.textContent = name;

    alert('✅ Kullanıcı bilgileri güncellendi!');
    closeModal('profile-modal');
}

function saveDeptChange() {
    const newUni = document.getElementById('prof-uni-select').value;
    const newDept = document.getElementById('prof-dept-select').value;

    if (confirm('Üniversite ve bölümünüz değiştirilecek. Emin misiniz?')) {
        localStorage.setItem('selectedUniversity', newUni);
        localStorage.setItem('selectedDepartment', newDept);
        window.location.reload();
    }
}

function deleteAccount() {
    if (confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
        localStorage.clear();
        alert('Hesabınız silindi.');
        window.location.href = 'landing.html';
    }
}

function loadMyComments() {
    const container = document.getElementById('my-comments-list');
    if (!container) return;

    const currentUser = MOCK_DATA.mockCurrentUser || 'user-1';
    let myComments = [];

    Object.keys(MOCK_DATA.comments).forEach(cId => {
        const list = MOCK_DATA.comments[cId] || [];
        list.forEach(c => {
            if (c.userId === currentUser) {
                myComments.push({ courseId: cId, comment: c });
            }
        });
    });

    if (myComments.length === 0) {
        container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">Henüz bir yorum yapmadınız.</p>`;
        return;
    }

    container.innerHTML = myComments.map(item => `
        <div style="background: var(--bg-dark); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                <span>Ders ID: ${escapeHtml(item.courseId)}</span>
                <span>👍 ${item.comment.likeCount || 0}</span>
            </div>
            <p style="font-size: 0.85rem; margin-top: 0.3rem;">"${escapeHtml(item.comment.commentText)}"</p>
        </div>
    `).join('');
}

// Özel Ders / Yan Dal Ekleme
function openCustomCourseModal() {
    const semSelect = document.getElementById('custom-course-semester');
    if (!semSelect) return;

    semSelect.innerHTML = semesters.map(s => `
        <option value="${escapeHtml(s.id)}">${escapeHtml(s.semesterName)}</option>
    `).join('');

    openModal('custom-course-modal');
}

function saveCustomCourse(e) {
    e.preventDefault();
    const code = document.getElementById('custom-course-code').value.trim();
    const name = document.getElementById('custom-course-name').value.trim();
    const credit = parseInt(document.getElementById('custom-course-credit').value);
    const ects = parseInt(document.getElementById('custom-course-ects').value);
    const semId = document.getElementById('custom-course-semester').value;
    const tag = document.getElementById('custom-course-tag').value;

    const targetSem = semesters.find(s => s.id === semId);
    if (targetSem) {
        const newCourse = {
            id: 'custom-' + Date.now(),
            courseCode: code,
            courseName: name,
            credit: credit,
            ects: ects,
            tag: tag
        };
        targetSem.courses.push(newCourse);
        renderSemesters();
        updateCourseCount();

        if (tag === 'missing') {
            alert('✅ Ders eklendi ve platform yöneticilerine eksik ders olarak bildirildi!');
        } else {
            alert('✅ Özel ders başarıyla panele eklendi!');
        }

        closeModal('custom-course-modal');
    }
}

// Ders Müfredattan Kaldırıldı Bildirimi
function openReportCourseModal(courseId) {
    document.getElementById('report-course-id').value = courseId;
    document.getElementById('report-description').value = '';
    document.getElementById('report-link').value = '';
    openModal('report-course-modal');
}

function submitCourseReport(e) {
    e.preventDefault();
    const cId = document.getElementById('report-course-id').value;
    const desc = document.getElementById('report-description').value.trim();
    const link = document.getElementById('report-link').value.trim();

    alert('✅ Ders müfredattan kaldırıldı bildirimi incelenmek üzere yöneticilere iletildi. Teşekkürler!');
    closeModal('report-course-modal');
}

// Sağ Panel Alt Bölüm Açma / Kapama (Accordion)
function toggleSubPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.classList.toggle('collapsed');
}
