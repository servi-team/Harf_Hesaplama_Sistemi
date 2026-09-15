/**
 * Admin Panel & Veri Yönetim Mantığı
 * Ekleme / Düzenleme / Silme + Mesaj + Fakülte Hiyerarşisi
 */

// ==================== STATE & HELPERS ====================

const DATA_TYPES = {
    UNIVERSITY: { label: 'Üniversite', icon: '🏛️' },
    FACULTY: { label: 'Fakülte', icon: '🏫' },
    DEPARTMENT: { label: 'Bölüm', icon: '🏢' },
    COURSE: { label: 'Ders', icon: '📚' },
    CRITERIA: { label: 'Kriter Seti', icon: '📊' },
    SCALE: { label: 'Harf Skalası', icon: '🔤' },
    COMMENT: { label: 'Yorum Şikayeti', icon: '💬' }
};

const ACTION_LABELS = {
    add: { label: 'Ekleme', icon: '🟢', color: '#10b981' },
    edit: { label: 'Düzenleme', icon: '🟡', color: '#f59e0b' },
    delete: { label: 'Silme', icon: '🔴', color: '#ef4444' }
};

let criteriaRowCount = 0;
let currentModalView = 'SELECT_TYPE';
let selectedType = null;
let editingItem = null; // Düzenlenecek öğe {type, id, parentId, data}

function getCurrentUser() {
    const userId = MOCK_DATA.mockCurrentUser;
    if (!userId) return null;
    return MOCK_DATA.mockUsers[userId] || null;
}

function getNewItemStatus() {
    const user = getCurrentUser();
    if (!user) return 0;
    if (user.role === 'admin' || user.role === 'superadmin') return 2;
    return 0;
}

function isAdminUser() {
    const user = getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'superadmin');
}

function generateId(prefix) {
    return prefix + '-' + Date.now();
}

// ==================== MODAL YÖNETİMİ ====================

function openAddModal() {
    if (isGuest()) {
        redirectToRegister('Veri eklemek');
        return;
    }
    editingItem = null;
    const container = document.getElementById('admin-modal-container');
    container.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Veri Ekle</h2>
                    <button class="btn-close-modal" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body" id="modal-body-content"></div>
            </div>
        </div>
    `;
    renderTypeSelection();
}

function openEditModal(type, itemId, parentId) {
    if (isGuest()) { redirectToRegister('Veri düzenlemek'); return; }
    const itemData = findItem(type, itemId, parentId);
    if (!itemData) return alert('Veri bulunamadı');
    editingItem = { type, id: itemId, parentId, data: { ...itemData } };

    const container = document.getElementById('admin-modal-container');
    container.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Düzenle: ${DATA_TYPES[type].label}</h2>
                    <button class="btn-close-modal" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body" id="modal-body-content"></div>
            </div>
        </div>
    `;
    renderForm(type, itemData);
}

function openDeleteModal(type, itemId, parentId) {
    if (isGuest()) { redirectToRegister('Veri silmek'); return; }
    const itemData = findItem(type, itemId, parentId);
    if (!itemData) return alert('Veri bulunamadı');

    const container = document.getElementById('admin-modal-container');
    let itemName = itemData.name || itemData.courseName || itemData.label || itemId;

    container.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Sil: ${DATA_TYPES[type] ? DATA_TYPES[type].label : type}</h2>
                    <button class="btn-close-modal" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="delete-confirm">
                        <div class="delete-icon">🗑️</div>
                        <p><strong>${escapeHtml(itemName)}</strong> silinecek.</p>
                        ${!isAdminUser() ? '<p style="color:var(--text-muted);font-size:0.85rem">Silme talebi admin onayına gönderilecektir.</p>' : ''}
                        <div class="form-group" style="margin-top:1rem">
                            <label>Mesaj / Sebep (isteğe bağlı)</label>
                            <textarea id="request-message" class="form-control request-message" rows="2" placeholder="Neden silinmeli?"></textarea>
                        </div>
                        <div class="form-actions">
                            <button class="btn-cancel" onclick="closeModal()">İptal</button>
                            <button class="btn-delete" onclick="confirmDelete('${escapeHtml(type)}','${escapeHtml(itemId)}','${escapeHtml(parentId)}')">Sil</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function closeModal() {
    const container = document.getElementById('admin-modal-container');
    if (container) container.innerHTML = '';
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    currentModalView = 'SELECT_TYPE';
    selectedType = null;
    editingItem = null;
}

function renderTypeSelection() {
    const list = document.getElementById('modal-body-content');
    let html = '<div class="type-grid">';
    Object.keys(DATA_TYPES).forEach(key => {
        const type = DATA_TYPES[key];
        html += `
            <div class="type-card" onclick="selectType('${key}')">
                <div class="type-icon">${type.icon}</div>
                <div class="type-label">${type.label}</div>
            </div>
        `;
    });
    html += '</div>';
    list.innerHTML = html;
}

function selectType(typeKey) {
    selectedType = typeKey;
    currentModalView = 'FORM';
    renderForm(typeKey);
    document.querySelector('.modal-header h2').textContent = `Veri Ekle: ${DATA_TYPES[typeKey].label}`;
}

// ==================== FORM RENDERERS ====================

function renderForm(typeKey, prefill) {
    const container = document.getElementById('modal-body-content');
    let formHtml = '';
    const p = prefill || {};

    switch (typeKey) {
        case 'UNIVERSITY':
            formHtml = `
                <div class="admin-form">
                    <div class="form-group">
                        <label>Üniversite Adı</label>
                        <input type="text" id="uni-name" class="form-control" placeholder="Örn: Galatasaray Üniversitesi" value="${escapeHtml(p.name || '')}">
                    </div>
                </div>
            `;
            break;

        case 'FACULTY':
            formHtml = `
                <div class="admin-form">
                    <div class="form-group">
                        <label>Üniversite</label>
                        <select id="select-uni" class="form-control" ${editingItem ? 'disabled' : ''}>
                            <option value="">Seçiniz...</option>
                            ${getUniversityOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fakülte Adı</label>
                        <input type="text" id="faculty-name" class="form-control" placeholder="Örn: Mühendislik Fakültesi" value="${escapeHtml(p.name || '')}">
                    </div>
                </div>
            `;
            break;

        case 'DEPARTMENT':
            formHtml = `
                <div class="admin-form">
                    <div class="form-group">
                        <label>Üniversite</label>
                        <select id="select-uni" class="form-control" onchange="updateFacultyOptions()" ${editingItem ? 'disabled' : ''}>
                            <option value="">Seçiniz...</option>
                            ${getUniversityOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fakülte</label>
                        <select id="select-faculty" class="form-control" disabled ${editingItem ? 'disabled' : ''}>
                            <option value="">Önce üniversite seçin...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Bölüm Adı</label>
                        <input type="text" id="dept-name" class="form-control" placeholder="Örn: Endüstri Mühendisliği" value="${escapeHtml(p.name || '')}">
                    </div>
                </div>
            `;
            break;

        case 'COURSE':
            formHtml = `
                <div class="admin-form">
                    <div class="form-group">
                        <label>Üniversite</label>
                        <select id="select-uni" class="form-control" onchange="updateDeptOptions()" ${editingItem ? 'disabled' : ''}>
                            <option value="">Seçiniz...</option>
                            ${getUniversityOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Bölüm</label>
                        <select id="select-dept" class="form-control" disabled onchange="updateSemesterOptions()" ${editingItem ? 'disabled' : ''}>
                            <option value="">Önce üniversite seçin...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dönem</label>
                        <select id="select-semester" class="form-control" disabled ${editingItem ? 'disabled' : ''}>
                            <option value="">Önce bölüm seçin...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ders Kodu</label>
                        <input type="text" id="course-code" class="form-control" placeholder="Örn: END101" value="${escapeHtml(p.courseCode || '')}">
                    </div>
                    <div class="form-group">
                        <label>Ders Adı</label>
                        <input type="text" id="course-name" class="form-control" placeholder="Örn: Giriş" value="${escapeHtml(p.courseName || '')}">
                    </div>
                    <div class="form-group" style="display:flex; gap:1rem;">
                        <div style="flex:1">
                            <label>Kredi</label>
                            <input type="number" id="course-credit" class="form-control" value="${p.credit !== undefined ? p.credit : ''}">
                        </div>
                        <div style="flex:1">
                            <label>AKTS</label>
                            <input type="number" id="course-ects" class="form-control" value="${p.ects !== undefined ? p.ects : ''}">
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'CRITERIA':
            criteriaRowCount = 0;
            formHtml = `
                <div class="admin-form">
                    <div class="form-group">
                        <label>Üniversite</label>
                        <select id="select-uni" class="form-control" onchange="updateDeptOptions()" ${editingItem ? 'disabled' : ''}>
                            <option value="">Seçiniz...</option>
                            ${getUniversityOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Bölüm</label>
                        <select id="select-dept" class="form-control" disabled onchange="updateCourseOptions()" ${editingItem ? 'disabled' : ''}>
                            <option value="">Önce üniversite seçin...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ders</label>
                        <select id="select-course" class="form-control" disabled ${editingItem ? 'disabled' : ''}>
                            <option value="">Önce bölüm seçin...</option>
                        </select>
                    </div>
                    <div class="form-group" style="display:flex; gap:1rem;">
                        <div style="flex:1">
                            <label>Yıl</label>
                            <input type="number" id="criteria-year" class="form-control" value="${p.year || 2025}">
                        </div>
                        <div style="flex:1">
                            <label>Hoca Adı</label>
                            <input type="text" id="criteria-instructor" class="form-control" placeholder="Örn: Ahmet Yılmaz" value="${escapeHtml(p.instructorName || '')}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Kriter Satırları <button type="button" class="btn-add-row" onclick="addCriteriaRow()">+ Ekle</button></label>
                        <div id="criteria-rows"></div>
                    </div>
                </div>
            `;
            break;

        case 'SCALE':
            formHtml = `
                <div class="admin-form">
                    <div class="form-group">
                        <label>Üniversite</label>
                        <select id="select-uni" class="form-control" onchange="updateDeptOptions()" ${editingItem ? 'disabled' : ''}>
                            <option value="">Seçiniz...</option>
                            ${getUniversityOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Bölüm</label>
                        <select id="select-dept" class="form-control" disabled onchange="updateCourseOptions()" ${editingItem ? 'disabled' : ''}>
                            <option value="">Önce üniversite seçin...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ders</label>
                        <select id="select-course" class="form-control" disabled ${editingItem ? 'disabled' : ''}>
                            <option value="">Önce bölüm seçin...</option>
                        </select>
                    </div>
                    <div class="form-group" style="display:flex; gap:1rem;">
                        <div style="flex:1">
                            <label>Yıl</label>
                            <input type="number" id="scale-year" class="form-control" value="${p.year || 2025}">
                        </div>
                        <div style="flex:1">
                            <label>Hoca Adı</label>
                            <input type="text" id="scale-instructor" class="form-control" placeholder="Örn: Ahmet Yılmaz" value="${escapeHtml(p.instructorName || '')}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Toplam Öğrenci Sayısı</label>
                        <input type="number" id="scale-total" class="form-control" placeholder="Örn: 120" value="${p.totalStudents || ''}">
                    </div>
                    <div class="form-group">
                        <label>Harf Notu Aralıkları</label>
                        <div id="scale-rows">${generateScaleRows(p.scale)}</div>
                    </div>
                </div>
            `;
            break;

        default:
            formHtml = `<p>Bu veri tipi için form henüz hazırlanmadı.</p>`;
    }

    // Mesaj alanı (tüm formlara)
    formHtml += `
        <div class="form-group" style="margin-top:1rem">
            <label>Mesaj / Açıklama (isteğe bağlı)</label>
            <textarea id="request-message" class="form-control request-message" rows="2" placeholder="${editingItem ? 'Düzenleme sebebi...' : 'Ekleme hakkında not...'}"></textarea>
        </div>
        <div class="form-actions">
            <button class="btn-cancel" onclick="${editingItem ? 'closeModal()' : 'renderTypeSelection()'}">${editingItem ? 'İptal' : 'Geri Dön'}</button>
            <button class="btn-save" onclick="${editingItem ? `saveEdit('${typeKey}')` : `saveData('${typeKey}')`}">${editingItem ? 'Güncelle' : 'Kaydet'}</button>
        </div>
    `;

    container.innerHTML = formHtml;

    // Prefill: edit durumunda dropdown'ları seç
    if (editingItem && editingItem.parentId) {
        const uniSel = document.getElementById('select-uni');
        if (uniSel) {
            // parentId'den üniversiteyi bul (basit durumlarda)
            if (editingItem.type === 'FACULTY') {
                uniSel.value = editingItem.parentId;
            }
        }
    }
}

// ==================== DROPDOWN HELPERS ====================

function getUniversityOptions() {
    return Object.values(MOCK_DATA.universities)
        .filter(u => u.status === 2 || isAdminUser())
        .map(u => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.name)}</option>`)
        .join('');
}

function updateFacultyOptions() {
    const uniId = document.getElementById('select-uni').value;
    const facSelect = document.getElementById('select-faculty');
    if (!facSelect) return;

    if (!uniId) {
        facSelect.innerHTML = '<option value="">Önce üniversite seçin...</option>';
        facSelect.disabled = true;
        return;
    }

    const faculties = MOCK_DATA.faculties[uniId] || [];
    if (faculties.length > 0) {
        const options = faculties
            .filter(f => f.status === 2 || isAdminUser())
            .map(f => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`)
            .join('');
        facSelect.innerHTML = '<option value="">Seçiniz...</option>' + options;
        facSelect.disabled = false;
    } else {
        facSelect.innerHTML = '<option value="">Fakülte bulunamadı</option>';
        facSelect.disabled = true;
    }
}

function updateDeptOptions() {
    const uniId = document.getElementById('select-uni').value;
    const deptSelect = document.getElementById('select-dept');

    if (!uniId) {
        deptSelect.innerHTML = '<option value="">Önce üniversite seçin...</option>';
        deptSelect.disabled = true;
        return;
    }

    const uni = MOCK_DATA.universities[uniId];
    if (uni && uni.departments) {
        const options = Object.values(uni.departments)
            .filter(d => d.status === 2 || isAdminUser())
            .map(d => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)}</option>`)
            .join('');
        deptSelect.innerHTML = '<option value="">Seçiniz...</option>' + options;
        deptSelect.disabled = false;
    } else {
        deptSelect.innerHTML = '<option value="">Bölüm bulunamadı</option>';
        deptSelect.disabled = true;
    }
}

function updateSemesterOptions() {
    const deptId = document.getElementById('select-dept').value;
    const semSelect = document.getElementById('select-semester');

    if (!deptId) {
        semSelect.innerHTML = '<option value="">Önce bölüm seçin...</option>';
        semSelect.disabled = true;
        return;
    }

    const semesters = MOCK_DATA.semesters[deptId] || [];
    if (semesters.length > 0) {
        const options = semesters.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.semesterName)}</option>`).join('');
        semSelect.innerHTML = '<option value="">Seçiniz...</option>' + options;
        semSelect.disabled = false;
    } else {
        semSelect.innerHTML = '<option value="">Dönem bulunamadı</option>';
        semSelect.disabled = true;
    }
}

function updateCourseOptions() {
    const deptId = document.getElementById('select-dept').value;
    const courseSelect = document.getElementById('select-course');

    if (!deptId) {
        courseSelect.innerHTML = '<option value="">Önce bölüm seçin...</option>';
        courseSelect.disabled = true;
        return;
    }

    const semesters = MOCK_DATA.semesters[deptId] || [];
    let allCourses = [];
    semesters.forEach(sem => {
        if (sem.courses) {
            sem.courses.forEach(c => {
                if (c.status === 2 || isAdminUser()) allCourses.push(c);
            });
        }
    });

    if (allCourses.length > 0) {
        const options = allCourses.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.courseCode)} - ${escapeHtml(c.courseName)}</option>`).join('');
        courseSelect.innerHTML = '<option value="">Seçiniz...</option>' + options;
        courseSelect.disabled = false;
    } else {
        courseSelect.innerHTML = '<option value="">Ders bulunamadı</option>';
        courseSelect.disabled = true;
    }
}

// ==================== DİNAMİK SATIR YÖNETİMİ ====================

function addCriteriaRow(name, weight) {
    criteriaRowCount++;
    const container = document.getElementById('criteria-rows');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.id = `criteria-row-${criteriaRowCount}`;
    row.innerHTML = `
        <input type="text" class="form-control" placeholder="Kriter adı (Vize, Final...)" data-field="name" style="flex:2" value="${escapeHtml(name || '')}">
        <input type="number" class="form-control" placeholder="%" data-field="weight" style="flex:1" value="${weight || ''}">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(row);
}

const LETTER_GRADES = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'];
const DEFAULT_MINS = [90, 85, 80, 75, 70, 65, 60, 50, 0];
const DEFAULT_MAXS = [100, 89, 84, 79, 74, 69, 64, 59, 49];
const DEFAULT_GPs = [4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0.0];

function generateScaleRows(existingScale) {
    return LETTER_GRADES.map((lg, i) => {
        const s = existingScale ? existingScale[i] : null;
        return `
        <div class="dynamic-row scale-row">
            <span style="width:36px; font-weight:600; color:var(--text-primary)">${lg}</span>
            <input type="number" class="form-control" value="${s ? s.minScore : DEFAULT_MINS[i]}" data-field="min" style="flex:1" placeholder="Min">
            <span style="color:var(--text-muted)">-</span>
            <input type="number" class="form-control" value="${s ? s.maxScore : DEFAULT_MAXS[i]}" data-field="max" style="flex:1" placeholder="Max">
            <input type="number" class="form-control" value="${s ? s.gradePoint : DEFAULT_GPs[i]}" data-field="gp" step="0.5" style="flex:1" placeholder="GP">
            <input type="number" class="form-control" data-field="count" style="flex:1" placeholder="Kişi" value="${s && s.studentCount ? s.studentCount : ''}">
        </div>
    `;
    }).join('');
}

// ==================== FIND ITEM HELPER ====================

function findItem(type, itemId, parentId) {
    if (type === 'UNIVERSITY') {
        return MOCK_DATA.universities[itemId] || null;
    } else if (type === 'FACULTY') {
        const facList = MOCK_DATA.faculties[parentId] || [];
        return facList.find(f => f.id === itemId) || null;
    } else if (type === 'DEPARTMENT') {
        const uni = MOCK_DATA.universities[parentId];
        return uni && uni.departments ? uni.departments[itemId] || null : null;
    } else if (type === 'COURSE') {
        const semesters = MOCK_DATA.semesters[parentId] || [];
        for (const sem of semesters) {
            const c = sem.courses.find(co => co.id === itemId);
            if (c) return c;
        }
        return null;
    } else if (type === 'CRITERIA') {
        const list = MOCK_DATA.gradingCriteria[parentId] || [];
        return list.find(x => x.id === itemId) || null;
    } else if (type === 'SCALE') {
        const list = MOCK_DATA.gradeScales[parentId] || [];
        return list.find(x => x.id === itemId) || null;
    }
    return null;
}

// ==================== SAVE (ADD) LOGIC ====================

function saveData(type) {
    const currentUser = getCurrentUser();
    const status = getNewItemStatus();
    const message = (document.getElementById('request-message') || {}).value || '';
    let data = {};
    let parentId = null;

    if (type === 'UNIVERSITY') {
        const name = document.getElementById('uni-name').value.trim();
        if (!name || name.length > 100) return alert('Üniversite adı 1-100 karakter arasında olmalıdır.');
        const id = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        data = { id, name, departments: {} };

    } else if (type === 'FACULTY') {
        const uniId = document.getElementById('select-uni').value;
        const name = document.getElementById('faculty-name').value.trim();
        if (!uniId || !name || name.length > 100) return alert('Lütfen geçerli bir fakülte adı (maks 100 karakter) ve üniversite seçin.');
        const id = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        data = { id, name, departmentIds: [] };
        parentId = uniId;

    } else if (type === 'DEPARTMENT') {
        const uniId = document.getElementById('select-uni').value;
        const facId = document.getElementById('select-faculty') ? document.getElementById('select-faculty').value : '';
        const name = document.getElementById('dept-name').value.trim();
        if (!uniId || !name || name.length > 100) return alert('Üniversite seçilmeli ve bölüm adı 1-100 karakter arasında olmalıdır.');
        const id = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        data = { id, name, facultyId: facId || null };
        parentId = uniId;

    } else if (type === 'COURSE') {
        const deptId = document.getElementById('select-dept').value;
        const semId = document.getElementById('select-semester').value;
        const code = document.getElementById('course-code').value.trim();
        const name = document.getElementById('course-name').value.trim();
        const credit = Number(document.getElementById('course-credit').value);
        const ects = Number(document.getElementById('course-ects').value);
        if (!deptId || !semId || !code || !name) return alert('Tüm alanlar gereklidir.');
        if (code.length > 20 || name.length > 100) return alert('Ders kodu maks 20, ders adı maks 100 karakter olabilir.');
        if (isNaN(credit) || credit < 0 || credit > 30) return alert('Kredi 0 ile 30 arasında bir sayı olmalıdır.');
        if (isNaN(ects) || ects < 0 || ects > 60) return alert('AKTS 0 ile 60 arasında bir sayı olmalıdır.');

        const id = code.toLowerCase();
        data = { id, courseCode: code, courseName: name, credit, ects, semesterId: semId, departmentId: deptId };
        parentId = deptId;

    } else if (type === 'CRITERIA') {
        const courseId = document.getElementById('select-course').value;
        const yearNum = Number(document.getElementById('criteria-year').value);
        const instructor = document.getElementById('criteria-instructor').value.trim();
        if (!courseId || !instructor) return alert('Ders ve hoca adı gereklidir.');
        if (instructor.length > 100) return alert('Hoca adı maks 100 karakter olabilir.');
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) return alert('Yıl 1900-2100 arasında olmalıdır.');

        const rows = document.querySelectorAll('#criteria-rows .dynamic-row');
        if (rows.length === 0) return alert('En az bir kriter satırı ekleyin.');
        const criteria = [];
        let totalWeight = 0;
        let validRows = true;

        rows.forEach((row, i) => {
            const n = row.querySelector('[data-field="name"]').value.trim();
            const w = Number(row.querySelector('[data-field="weight"]').value);
            if (!n || n.length > 100 || isNaN(w) || w <= 0 || w > 100) {
                validRows = false;
                return;
            }
            totalWeight += w;
            criteria.push({ name: n, weight: w, order: i + 1 });
        });

        if (!validRows) return alert('Kriter adları 1-100 karakter olmalı ve ağırlıklar 1-100 arasında olmalıdır.');
        if (criteria.length === 0) return alert('Geçerli kriter satırları ekleyin.');
        if (Math.abs(totalWeight - 100) > 0.01) return alert(`Toplam ağırlık %100 olmalı (şu an: %${totalWeight})`);
        data = { id: generateId('kriter'), label: `${yearNum} - ${instructor}`, instructorName: instructor, year: yearNum, criteria };
        parentId = courseId;

    } else if (type === 'SCALE') {
        const courseId = document.getElementById('select-course').value;
        const yearNum = Number(document.getElementById('scale-year').value);
        const instructor = document.getElementById('scale-instructor').value.trim();
        const totalStud = document.getElementById('scale-total').value;
        const totalStudentsNum = totalStud !== '' ? Number(totalStud) : null;

        if (!courseId || !instructor) return alert('Ders ve hoca adı gereklidir.');
        if (instructor.length > 100) return alert('Hoca adı maks 100 karakter olabilir.');
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) return alert('Yıl 1900-2100 arasında olmalıdır.');
        if (totalStudentsNum !== null && (isNaN(totalStudentsNum) || totalStudentsNum < 1 || totalStudentsNum > 10000)) {
            return alert('Öğrenci sayısı 1 ile 10000 arasında olmalıdır.');
        }

        const rows = document.querySelectorAll('#scale-rows .scale-row');
        const scale = [];
        let scaleValid = true;

        rows.forEach((row, i) => {
            const min = Number(row.querySelector('[data-field="min"]').value);
            const max = Number(row.querySelector('[data-field="max"]').value);
            const gp = Number(row.querySelector('[data-field="gp"]').value);
            const countVal = row.querySelector('[data-field="count"]').value;
            const count = countVal !== '' ? Number(countVal) : null;

            if (isNaN(min) || min < 0 || min > 100 || isNaN(max) || max < 0 || max > 100 || min > max || isNaN(gp) || gp < 0 || gp > 4.0) {
                scaleValid = false;
            }
            scale.push({ letterGrade: LETTER_GRADES[i], minScore: min, maxScore: max, gradePoint: gp, studentCount: count });
        });

        if (!scaleValid) return alert('Skala puanları 0-100 arasında, Min <= Max ve Katsayı 0.0-4.0 arasında olmalıdır.');
        data = { id: generateId('skala'), label: `${yearNum} - ${instructor}`, instructorName: instructor, year: yearNum, totalStudents: totalStudentsNum, scale };
        parentId = courseId;

    } else {
        return alert('Bu özellik henüz aktif değil.');
    }

    data.status = status;
    data.addedBy = currentUser ? currentUser.userId : 'guest';
    data.createdAt = new Date().toISOString();

    if (status === 2) {
        addToMainSystem(type, data, parentId);
        if (typeof saveMockData === 'function') saveMockData();
        alert('Veri başarıyla eklendi ve yayınlandı. ✅');
        if (typeof loadSemesters === 'function') loadSemesters();
    } else {
        MOCK_DATA.pendingData.push({
            action: 'add',
            type,
            parentId,
            data,
            originalData: null,
            message,
            submittedBy: currentUser ? currentUser.userName : 'Misafir',
            timestamp: new Date().toISOString()
        });
        if (typeof saveMockData === 'function') saveMockData();
        alert('Veri eklendi ve onay için gönderildi. ⏳');
        updatePendingBadge();
    }
    closeModal();
}

// ==================== SAVE (EDIT) LOGIC ====================

function saveEdit(type) {
    if (!editingItem) return;
    const currentUser = getCurrentUser();
    const message = (document.getElementById('request-message') || {}).value || '';
    let updatedData = { ...editingItem.data };

    // Form'dan güncelle
    if (type === 'UNIVERSITY') {
        const name = document.getElementById('uni-name').value.trim();
        if (!name || name.length > 100) return alert('Üniversite adı 1-100 karakter arasında olmalıdır.');
        updatedData.name = name;
    } else if (type === 'FACULTY') {
        const name = document.getElementById('faculty-name').value.trim();
        if (!name || name.length > 100) return alert('Fakülte adı 1-100 karakter arasında olmalıdır.');
        updatedData.name = name;
    } else if (type === 'DEPARTMENT') {
        const name = document.getElementById('dept-name').value.trim();
        if (!name || name.length > 100) return alert('Bölüm adı 1-100 karakter arasında olmalıdır.');
        updatedData.name = name;
    } else if (type === 'COURSE') {
        const code = document.getElementById('course-code').value.trim();
        const name = document.getElementById('course-name').value.trim();
        const credit = Number(document.getElementById('course-credit').value);
        const ects = Number(document.getElementById('course-ects').value);
        
        if (!code || !name) {
            return alert('Lütfen ders kodu ve ders adını eksiksiz giriniz.');
        }
        if (code.length > 20 || name.length > 100) {
            return alert('Ders kodu maks 20, ders adı maks 100 karakter olabilir.');
        }
        if (isNaN(credit) || credit < 0 || credit > 30) {
            return alert('Kredi değeri 0 ile 30 arasında olmalıdır.');
        }
        if (isNaN(ects) || ects < 0 || ects > 60) {
            return alert('AKTS değeri 0 ile 60 arasında olmalıdır.');
        }

        updatedData.courseCode = code;
        updatedData.courseName = name;
        updatedData.credit = credit;
        updatedData.ects = ects;
    } else if (type === 'CRITERIA') {
        const yearNum = Number(document.getElementById('criteria-year').value);
        const instructor = document.getElementById('criteria-instructor').value.trim();
        if (!instructor || instructor.length > 100) return alert('Hoca adı 1-100 karakter olmalıdır.');
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) return alert('Yıl 1900-2100 arasında olmalıdır.');

        const rows = document.querySelectorAll('#criteria-rows .dynamic-row');
        const criteria = [];
        let totalWeight = 0;
        let validRows = true;

        rows.forEach((row, i) => {
            const n = row.querySelector('[data-field="name"]').value.trim();
            const w = Number(row.querySelector('[data-field="weight"]').value);
            if (!n || n.length > 100 || isNaN(w) || w <= 0 || w > 100) {
                validRows = false;
                return;
            }
            totalWeight += w;
            criteria.push({ name: n, weight: w, order: i + 1 });
        });
        if (!validRows) return alert('Kriter adları 1-100 karakter olmalı ve ağırlıklar 1-100 arasında olmalıdır.');
        if (criteria.length === 0) return alert('Geçerli kriter satırları ekleyin.');
        if (Math.abs(totalWeight - 100) > 0.01) return alert(`Toplam ağırlık %100 olmalı (şu an: %${totalWeight})`);
        updatedData.label = `${yearNum} - ${instructor}`;
        updatedData.instructorName = instructor;
        updatedData.year = yearNum;
        updatedData.criteria = criteria;
    } else if (type === 'SCALE') {
        const yearNum = Number(document.getElementById('scale-year').value);
        const instructor = document.getElementById('scale-instructor').value.trim();
        const totalStud = document.getElementById('scale-total').value;
        const totalStudentsNum = totalStud !== '' ? Number(totalStud) : null;

        if (!instructor || instructor.length > 100) return alert('Hoca adı 1-100 karakter olmalıdır.');
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) return alert('Yıl 1900-2100 arasında olmalıdır.');
        if (totalStudentsNum !== null && (isNaN(totalStudentsNum) || totalStudentsNum < 1 || totalStudentsNum > 10000)) {
            return alert('Öğrenci sayısı 1 ile 10000 arasında olmalıdır.');
        }

        const rows = document.querySelectorAll('#scale-rows .scale-row');
        const scale = [];
        let scaleValid = true;

        rows.forEach((row, i) => {
            const min = Number(row.querySelector('[data-field="min"]').value);
            const max = Number(row.querySelector('[data-field="max"]').value);
            const gp = Number(row.querySelector('[data-field="gp"]').value);
            const countVal = row.querySelector('[data-field="count"]').value;
            const count = countVal !== '' ? Number(countVal) : null;

            if (isNaN(min) || min < 0 || min > 100 || isNaN(max) || max < 0 || max > 100 || min > max || isNaN(gp) || gp < 0 || gp > 4.0) {
                scaleValid = false;
            }

            scale.push({
                letterGrade: LETTER_GRADES[i],
                minScore: min,
                maxScore: max,
                gradePoint: gp,
                studentCount: count
            });
        });

        if (!scaleValid) return alert('Skala puanları 0-100 arasında, Min <= Max ve Katsayı 0.0-4.0 arasında olmalıdır.');
        updatedData.label = `${yearNum} - ${instructor}`;
        updatedData.instructorName = instructor;
        updatedData.year = yearNum;
        updatedData.totalStudents = totalStudentsNum;
        updatedData.scale = scale;
    }

    if (isAdminUser()) {
        // Doğrudan güncelle
        applyEdit(type, editingItem.id, editingItem.parentId, updatedData);
        if (typeof saveMockData === 'function') saveMockData();
        alert('Veri güncellendi. ✅');
        if (typeof loadSemesters === 'function') loadSemesters();
    } else {
        MOCK_DATA.pendingData.push({
            action: 'edit',
            type,
            parentId: editingItem.parentId,
            data: updatedData,
            originalData: editingItem.data,
            message,
            submittedBy: currentUser ? currentUser.userName : 'Misafir',
            timestamp: new Date().toISOString()
        });
        if (typeof saveMockData === 'function') saveMockData();
        alert('Düzenleme talebi onay için gönderildi. ⏳');
        updatePendingBadge();
    }
    closeModal();
}

// ==================== DELETE LOGIC ====================

function confirmDelete(type, itemId, parentId) {
    const currentUser = getCurrentUser();
    const message = (document.getElementById('request-message') || {}).value || '';
    const itemData = findItem(type, itemId, parentId);

    if (isAdminUser()) {
        if (!confirm('Bu veriyi silmek istediğinize emin misiniz?')) return;
        removeFromSystem(type, itemId, parentId);
        if (typeof saveMockData === 'function') saveMockData();
        alert('Veri silindi. 🗑️');
        if (typeof loadSemesters === 'function') loadSemesters();
    } else {
        MOCK_DATA.pendingData.push({
            action: 'delete',
            type,
            parentId,
            data: itemData,
            originalData: itemData,
            message,
            submittedBy: currentUser ? currentUser.userName : 'Misafir',
            timestamp: new Date().toISOString()
        });
        if (typeof saveMockData === 'function') saveMockData();
        alert('Silme talebi onay için gönderildi. ⏳');
        updatePendingBadge();
    }
    closeModal();
}

// ==================== SYSTEM OPERATIONS ====================

function addToMainSystem(type, data, parentId) {
    if (type === 'UNIVERSITY') {
        MOCK_DATA.universities[data.id] = data;
    } else if (type === 'FACULTY') {
        if (!MOCK_DATA.faculties[parentId]) MOCK_DATA.faculties[parentId] = [];
        MOCK_DATA.faculties[parentId].push(data);
    } else if (type === 'DEPARTMENT') {
        if (MOCK_DATA.universities[parentId]) {
            MOCK_DATA.universities[parentId].departments[data.id] = data;
            // Fakülteye de bağla
            if (data.facultyId) {
                const facList = MOCK_DATA.faculties[parentId] || [];
                const fac = facList.find(f => f.id === data.facultyId);
                if (fac && !fac.departmentIds.includes(data.id)) {
                    fac.departmentIds.push(data.id);
                }
            }
        }
    } else if (type === 'COURSE') {
        const semesters = MOCK_DATA.semesters[parentId];
        if (semesters) {
            const sem = semesters.find(s => s.id === data.semesterId);
            if (sem) sem.courses.push(data);
        }
    } else if (type === 'CRITERIA') {
        if (!MOCK_DATA.gradingCriteria[parentId]) MOCK_DATA.gradingCriteria[parentId] = [];
        MOCK_DATA.gradingCriteria[parentId].push(data);
    } else if (type === 'SCALE') {
        if (!MOCK_DATA.gradeScales[parentId]) MOCK_DATA.gradeScales[parentId] = [];
        MOCK_DATA.gradeScales[parentId].push(data);
    }
}

function applyEdit(type, itemId, parentId, newData) {
    if (type === 'UNIVERSITY') {
        Object.assign(MOCK_DATA.universities[itemId], newData);
    } else if (type === 'FACULTY') {
        const facList = MOCK_DATA.faculties[parentId] || [];
        const idx = facList.findIndex(f => f.id === itemId);
        if (idx >= 0) Object.assign(facList[idx], newData);
    } else if (type === 'DEPARTMENT') {
        const uni = MOCK_DATA.universities[parentId];
        if (uni && uni.departments[itemId]) Object.assign(uni.departments[itemId], newData);
    } else if (type === 'COURSE') {
        const semesters = MOCK_DATA.semesters[parentId] || [];
        for (const sem of semesters) {
            const c = sem.courses.find(co => co.id === itemId);
            if (c) { Object.assign(c, newData); break; }
        }
    } else if (type === 'CRITERIA') {
        const list = MOCK_DATA.gradingCriteria[parentId] || [];
        const idx = list.findIndex(x => x.id === itemId);
        if (idx >= 0) Object.assign(list[idx], newData);
    } else if (type === 'SCALE') {
        const list = MOCK_DATA.gradeScales[parentId] || [];
        const idx = list.findIndex(x => x.id === itemId);
        if (idx >= 0) Object.assign(list[idx], newData);
    }
}

function removeFromSystem(type, itemId, parentId) {
    if (type === 'UNIVERSITY') {
        delete MOCK_DATA.universities[itemId];
        delete MOCK_DATA.faculties[itemId];
    } else if (type === 'FACULTY') {
        const facList = MOCK_DATA.faculties[parentId] || [];
        const idx = facList.findIndex(f => f.id === itemId);
        if (idx >= 0) facList.splice(idx, 1);
    } else if (type === 'DEPARTMENT') {
        const uni = MOCK_DATA.universities[parentId];
        if (uni && uni.departments[itemId]) delete uni.departments[itemId];
    } else if (type === 'COURSE') {
        const semesters = MOCK_DATA.semesters[parentId] || [];
        for (const sem of semesters) {
            const idx = sem.courses.findIndex(co => co.id === itemId);
            if (idx >= 0) { sem.courses.splice(idx, 1); break; }
        }
    } else if (type === 'CRITERIA') {
        const list = MOCK_DATA.gradingCriteria[parentId] || [];
        const idx = list.findIndex(x => x.id === itemId);
        if (idx >= 0) list.splice(idx, 1);
    } else if (type === 'SCALE') {
        const list = MOCK_DATA.gradeScales[parentId] || [];
        const idx = list.findIndex(x => x.id === itemId);
        if (idx >= 0) list.splice(idx, 1);
    } else if (type === 'COMMENT') {
        const comments = MOCK_DATA.comments[parentId] || [];
        const idx = comments.findIndex(c => c.id === itemId);
        if (idx >= 0) comments.splice(idx, 1);
    }
}

// ==================== ONAY SİSTEMİ ====================

function canViewPending() {
    return isAdminUser();
}

function updatePendingBadge() {
    const btn = document.getElementById('btn-pending-approval');
    if (!btn) return;
    if (!canViewPending()) {
        btn.style.display = 'none';
        return;
    }
    btn.style.display = 'inline-flex';
    const count = (MOCK_DATA.pendingData || []).length;
    document.getElementById('pending-count').textContent = count;
}

function openPendingModal() {
    if (!canViewPending()) return;
    const container = document.getElementById('admin-modal-container');
    container.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
            <div class="modal-content" style="max-width:700px">
                <div class="modal-header">
                    <h2>Onay Bekleyenler</h2>
                    <button class="btn-close-modal" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body" id="pending-list-body"></div>
            </div>
        </div>
    `;
    renderPendingList();
}

function renderPendingList() {
    const listBody = document.getElementById('pending-list-body');
    const list = MOCK_DATA.pendingData || [];

    if (list.length === 0) {
        listBody.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted)">Bekleyen veri yok. ✅</div>';
        return;
    }

    let html = '<div class="pending-list">';
    list.forEach((item, index) => {
        const action = ACTION_LABELS[item.action || 'add'];
        const typeObj = DATA_TYPES[item.type] || { label: item.type || 'Veri', icon: '📋' };
        let details = '';

        if (item.type === 'UNIVERSITY') details = item.data?.name || '';
        if (item.type === 'FACULTY') details = item.data?.name || '';
        if (item.type === 'DEPARTMENT') details = item.data?.name || '';
        if (item.type === 'COURSE') details = `${item.data?.courseCode || ''} - ${item.data?.courseName || ''}`;
        if (item.type === 'CRITERIA') details = `${item.data?.label || ''}`;
        if (item.type === 'SCALE') details = `${item.data?.label || ''}`;
        if (item.type === 'COMMENT') details = `💬 "${item.commentText || ''}"`;

        const submittedUser = item.reportedBy || item.submittedBy || 'Kullanıcı';

        html += `
            <div class="pending-item">
                <div class="pending-header">
                    <div style="display:flex; gap:0.5rem; align-items:center">
                        <span class="pending-action-badge" style="background:${action.color}20; color:${action.color}">${action.icon} ${escapeHtml(action.label)}</span>
                        <span class="pending-type">${escapeHtml(typeObj.label)}</span>
                    </div>
                    <span class="pending-user">${escapeHtml(submittedUser)} • ${new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="pending-details">${escapeHtml(details)}</div>
                ${item.message ? `<div class="pending-message">💬 ${escapeHtml(item.message)}</div>` : ''}
                <div class="pending-actions">
                    <button class="btn-reject" onclick="rejectItem(${index})">Reddet</button>
                    <button class="btn-approve" onclick="approveItem(${index})">Onayla</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    listBody.innerHTML = html;
}

function approveItem(index) {
    const item = MOCK_DATA.pendingData[index];
    if (!item) return;

    const action = item.action || 'add';

    if (item.type === 'COMMENT' && action === 'delete') {
        removeFromSystem('COMMENT', item.commentId, item.courseId);
    } else if (action === 'add') {
        item.data.status = 2;
        addToMainSystem(item.type, item.data, item.parentId);
    } else if (action === 'edit') {
        applyEdit(item.type, item.data.id, item.parentId, item.data);
    } else if (action === 'delete') {
        removeFromSystem(item.type, item.data.id, item.parentId);
    }

    MOCK_DATA.pendingData.splice(index, 1);
    if (typeof saveMockData === 'function') saveMockData();

    renderPendingList();
    updatePendingBadge();

    if (typeof loadSemesters === 'function') loadSemesters();
    if (typeof loadComments === 'function' && typeof currentCourseIdForComments !== 'undefined' && currentCourseIdForComments) {
        loadComments(currentCourseIdForComments);
    }
}

function rejectItem(index) {
    if (!confirm('Talebi reddetmek istediğinize emin misiniz?')) return;
    MOCK_DATA.pendingData.splice(index, 1);
    if (typeof saveMockData === 'function') saveMockData();
    renderPendingList();
    updatePendingBadge();
}

// Başlangıçta badge kontrolü
document.addEventListener('DOMContentLoaded', () => {
    updatePendingBadge();
});
