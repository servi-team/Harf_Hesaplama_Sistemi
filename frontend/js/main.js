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
        <div class="semester-header" onclick="toggleSemester('${semester.id}')">
            <span class="toggle-icon">▶</span>
            <span class="semester-name">${semester.semesterName}</span>
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
    const deptId = localStorage.getItem('selectedDepartment');
    const isLoggedIn = MOCK_DATA.mockCurrentUser !== null;

    return `
        <div class="course-item" 
             draggable="true" 
             data-course-id="${course.id}"
             onclick="selectCourse('${course.id}')">
            <span class="course-drag-handle">⋮⋮</span>
            <div class="course-info">
                <div class="course-code">${course.courseCode}</div>
                <div class="course-name">${course.courseName}</div>
                <div class="course-credits">${course.credit} Kredi • ${course.ects} AKTS</div>
            </div>
            ${isLoggedIn ? `
            <div class="course-actions" onclick="event.stopPropagation()">
                <button class="btn-action-sm btn-edit-sm" onclick="openEditModal('COURSE','${course.id}','${deptId}')" title="Düzenle">✏️</button>
                <button class="btn-action-sm btn-delete-sm" onclick="openDeleteModal('COURSE','${course.id}','${deptId}')" title="Sil">🗑️</button>
            </div>
            ` : ''}
            <select class="grade-select" onclick="event.stopPropagation()" 
                    onchange="onGradeChange('${course.id}', this.value); highlightGradeRow(this.value);">
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

    document.getElementById('course-count').textContent = `${totalCourses} ders`;
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

    // Tüm seçili notları topla
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

    // Ortalamayı hesapla
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '-';
    document.getElementById('overall-gpa').textContent = gpa;
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
    container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
            <p>Bu bölüm için henüz ders bilgisi eklenmemiş.</p>
        </div>
    `;
}

function updateGradeScale(courseId) {
    const container = document.getElementById('grade-scale-content');
    if (!container) return;

    // Yeni veri yapısından skaları al
    const scaleList = MOCK_DATA.gradeScales[courseId] || [];

    if (scaleList.length > 0) {
        // İlk skalayı yükle (kullanıcı orta panelden değiştirebilir)
        loadScaleToRightPanel(scaleList[0]);
    } else {
        // Varsayılan skalayı göster
        loadScaleToRightPanel({
            label: 'Varsayılan',
            scale: MOCK_DATA.defaultGradeScale,
            totalStudents: null
        });
    }
}

/**
 * Harf aralıklarını sıfırlar (ders kapatıldığında)
 */
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
