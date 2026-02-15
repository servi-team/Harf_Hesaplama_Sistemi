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

    return `
        <div class="course-item" 
             draggable="true" 
             data-course-id="${course.id}"
             onclick="selectCourse('${course.id}')">
            <span class="course-drag-handle">⋮⋮</span>
            <div class="course-info">
                <div class="course-code">${course.courseCode}</div>
                <div class="course-name">${course.courseName}</div>
                <div class="course-credits">${course.credit} Kredi • ${course.ects} ECTS</div>
            </div>
            <select class="grade-select" 
                    data-course-id="${course.id}"
                    onchange="onGradeChange('${course.id}', this.value)"
                    onclick="event.stopPropagation()">
                <option value="">Seç</option>
                <option value="AA" ${savedGrade === 'AA' ? 'selected' : ''}>AA</option>
                <option value="BA" ${savedGrade === 'BA' ? 'selected' : ''}>BA</option>
                <option value="BB" ${savedGrade === 'BB' ? 'selected' : ''}>BB</option>
                <option value="CB" ${savedGrade === 'CB' ? 'selected' : ''}>CB</option>
                <option value="CC" ${savedGrade === 'CC' ? 'selected' : ''}>CC</option>
                <option value="DC" ${savedGrade === 'DC' ? 'selected' : ''}>DC</option>
                <option value="DD" ${savedGrade === 'DD' ? 'selected' : ''}>DD</option>
                <option value="FD" ${savedGrade === 'FD' ? 'selected' : ''}>FD</option>
                <option value="FF" ${savedGrade === 'FF' ? 'selected' : ''}>FF</option>
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
    // Dersi sağ panelde göster
    loadCourseDetail(courseId);
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
