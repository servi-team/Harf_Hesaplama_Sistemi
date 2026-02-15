/**
 * Drag & Drop fonksiyonelliği - Orta Panel Yönetimi
 * Ders seçildiğinde veya sürüklendiğinde orta paneli doldurur.
 * 
 * Yeni yapıda offerings yerine ayrı:
 *   - gradingCriteria (Değerlendirme Kriterleri)
 *   - gradeScales (Harf Skalası)
 * koleksiyonları kullanılır.
 */

/**
 * Drag & Drop event'lerini başlatır
 */
function initDragDrop() {
    const dropZone = document.getElementById('drop-zone');
    if (!dropZone) return;

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
}

// ==================== DRAG EVENTS ====================

function handleDragStart(e) {
    const courseItem = e.target.closest('.course-item');
    if (courseItem) {
        e.dataTransfer.setData('text/plain', courseItem.dataset.courseId);
        courseItem.classList.add('dragging');
    }
}

function handleDragEnd(e) {
    const courseItem = e.target.closest('.course-item');
    if (courseItem) {
        courseItem.classList.remove('dragging');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.getElementById('drop-zone').classList.add('drag-over');
}

function handleDragLeave(e) {
    const dropZone = document.getElementById('drop-zone');
    if (e.target === dropZone) {
        dropZone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
    const courseId = e.dataTransfer.getData('text/plain');
    if (courseId) {
        loadCourseDetail(courseId);
        // Sağ paneldeki harf skalasını da güncelle
        if (typeof updateGradeScale === 'function') {
            updateGradeScale(courseId);
        }
    }
}

// ==================== DERS DETAY YÜKLEME ====================

/**
 * Ders detaylarını orta panelde gösterir
 */
function loadCourseDetail(courseId) {
    const course = findCourseById(courseId);
    if (!course) {
        console.error('Ders bulunamadı:', courseId);
        return;
    }

    document.getElementById('drop-placeholder').style.display = 'none';
    const detailDiv = document.getElementById('course-detail');
    detailDiv.style.display = 'block';

    // Ders için verileri al
    const criteriaList = MOCK_DATA.gradingCriteria[courseId] || [];
    const scaleList = MOCK_DATA.gradeScales[courseId] || [];

    // Detay içeriğini oluştur
    detailDiv.innerHTML = createCourseDetailHTML(course, criteriaList, scaleList);

    // Event listener'ları ekle
    setupCourseDetailEvents(courseId, criteriaList, scaleList);
}

/**
 * Kurs ID'sine göre ders objesi bulur
 */
function findCourseById(courseId) {
    const departmentId = localStorage.getItem('selectedDepartment');
    if (!departmentId) return null;

    const semesters = MOCK_DATA.semesters[departmentId] || [];
    for (const semester of semesters) {
        const course = semester.courses.find(c => c.id === courseId);
        if (course) return course;
    }
    return null;
}

// ==================== DETAY HTML OLUŞTURMA ====================

/**
 * Ders detay HTML'ini oluşturur
 */
function createCourseDetailHTML(course, criteriaList, scaleList) {
    const hasCriteria = criteriaList.length > 0;
    const hasScales = scaleList.length > 0;

    return `
        <div class="detail-header">
            <div class="detail-header-content">
                <div class="detail-course-code">${course.courseCode}</div>
                <h2 class="detail-course-name">${course.courseName}</h2>
                <div class="detail-course-meta">
                    ${course.credit} Kredi • ${course.ects} AKTS
                </div>
            </div>
            <button class="btn-close" onclick="closeCourseDetail()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        
        <div class="detail-body">
            <!-- Değerlendirme Kriteri ve Harf Skalası Seçiciler -->
            <div class="selector-row">
                <div class="selector-group">
                    <label>📊 Değerlendirme Kriteri</label>
                    <select id="criteria-select" class="custom-select">
                        ${hasCriteria
            ? `<option value="">Seçin...</option>
                               ${criteriaList.map((c, i) => `<option value="${i}">${c.label}</option>`).join('')}`
            : `<option value="manual">Kriter Tanımlı Değil — Manuel Giriş</option>`
        }
                    </select>
                </div>
                <div class="selector-group">
                    <label>🔤 Harf Skalası</label>
                    <select id="scale-select" class="custom-select">
                        ${hasScales
            ? `<option value="">Seçin...</option>
                               ${scaleList.map((s, i) => `<option value="${i}">${s.label}</option>`).join('')}`
            : `<option value="default">Varsayılan Skala</option>`
        }
                    </select>
                </div>
            </div>

            <!-- Kriter İçeriği -->
            <div id="criteria-container">
                <!-- Seçim yapıldığında doldurulacak -->
            </div>

            <!-- Manuel Hesaplama (kriter yoksa) -->
            ${!hasCriteria ? createManualCriteriaHTML(course) : ''}

            <!-- Sonuç -->
            <div id="result-container" style="display: none;">
            </div>
        </div>
    `;
}

/**
 * Manuel kriter giriş HTML'i
 */
function createManualCriteriaHTML(course) {
    return `
        <div class="manual-mode">
            <p class="mode-description">Kendi değerlendirme kriterlerinizi oluşturun</p>
            
            <div id="manual-criteria-list">
            </div>
            
            <button class="btn-add-criteria" onclick="addManualCriteria()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Kriter Ekle
            </button>
            
            <div class="weight-validation">
                <div class="weight-progress">
                    <div class="weight-progress-bar" id="manual-weight-bar" style="width: 0%"></div>
                </div>
                <div class="weight-info">
                    <span>Toplam Ağırlık:</span>
                    <span id="manual-weight-total" class="weight-value">0%</span>
                </div>
            </div>
            
            <button class="btn-calculate" onclick="calculateManualGrade('${course.id}')" disabled id="manual-calculate-btn">
                Hesapla
            </button>
            
            <div id="manual-result" style="display: none;">
            </div>
        </div>
    `;
}

// ==================== EVENT LISTENER'LAR ====================

/**
 * Ders detay event listener'larını kurar
 */
function setupCourseDetailEvents(courseId, criteriaList, scaleList) {
    // Değerlendirme Kriteri seçici
    const criteriaSelect = document.getElementById('criteria-select');
    if (criteriaSelect) {
        criteriaSelect.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (!isNaN(index) && criteriaList[index]) {
                loadCriteriaContent(criteriaList[index], courseId);
            }
        });
    }

    // Harf Skalası seçici
    const scaleSelect = document.getElementById('scale-select');
    if (scaleSelect) {
        scaleSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'default') {
                // Varsayılan skala
                loadScaleToRightPanel({
                    label: 'Varsayılan',
                    scale: MOCK_DATA.defaultGradeScale,
                    totalStudents: null
                });
            } else {
                const index = parseInt(value);
                if (!isNaN(index) && scaleList[index]) {
                    loadScaleToRightPanel(scaleList[index]);
                }
            }
        });
    }
}

/**
 * Değerlendirme kriterlerini yükler
 */
function loadCriteriaContent(criteriaData, courseId) {
    const container = document.getElementById('criteria-container');
    if (!container) return;

    container.innerHTML = `
        <div class="criteria-section">
            <div class="criteria-header-info">
                <span class="criteria-instructor">${criteriaData.instructorName}</span>
                <span class="criteria-year">${criteriaData.year}</span>
            </div>
            <div class="criteria-list">
                ${criteriaData.criteria.map(c => `
                    <div class="criteria-item">
                        <div class="criteria-name">${c.name}</div>
                        <div class="criteria-weight">
                            <div class="criteria-weight-bar" style="width: ${c.weight}%"></div>
                            <span class="criteria-weight-text">%${c.weight}</span>
                        </div>
                        <input type="number" class="criteria-score" placeholder="Not" min="0" max="100" 
                               data-weight="${c.weight}" oninput="recalculateGrade('${courseId}')">
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Sonuç container'ı göster
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('result-container').innerHTML = `
        <div class="result-card">
            <div class="result-label">Hesaplanan Ortalama</div>
            <div class="result-value" id="calculated-avg">—</div>
        </div>
    `;
}

/**
 * Harf skalasını sağ panele yükler (studentCount ile birlikte)
 */
function loadScaleToRightPanel(scaleData) {
    const container = document.getElementById('grade-scale-content');
    if (!container) return;

    const maxCount = Math.max(...scaleData.scale.map(g => g.studentCount || 0));

    container.innerHTML = `
        <div class="grade-scale-info" style="font-size: 0.65rem; color: var(--text-muted); padding: 0.25rem 0.5rem; margin-bottom: 0.25rem;">
            ${scaleData.label}${scaleData.totalStudents ? ` • ${scaleData.totalStudents} öğrenci` : ''}
        </div>
        <div class="grade-scale-table">
            ${scaleData.scale.map(g => `
                <div class="grade-row" data-letter="${g.letterGrade}">
                    <span class="grade-letter">${g.letterGrade}</span>
                    <span class="grade-range">${g.minScore} – ${g.maxScore}</span>
                    ${g.studentCount !== null ? `
                        <span class="grade-student-bar">
                            <span class="grade-bar-fill" style="width: ${maxCount > 0 ? (g.studentCount / maxCount * 100) : 0}%"></span>
                        </span>
                        <span class="grade-student-count">${g.studentCount}</span>
                    ` : ''}
                    <span class="grade-gpa">${g.gradePoint.toFixed(1)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Notları girildikçe otomatik hesaplar
 */
function recalculateGrade(courseId) {
    const inputs = document.querySelectorAll('.criteria-score');
    let totalWeight = 0;
    let weightedSum = 0;
    let allFilled = true;

    inputs.forEach(input => {
        const weight = parseFloat(input.dataset.weight);
        const score = parseFloat(input.value);
        if (!isNaN(score) && score >= 0) {
            weightedSum += score * (weight / 100);
            totalWeight += weight;
        } else {
            allFilled = false;
        }
    });

    const avgEl = document.getElementById('calculated-avg');
    if (avgEl) {
        if (totalWeight > 0) {
            const avg = weightedSum / (totalWeight / 100);
            avgEl.textContent = avg.toFixed(1);
        } else {
            avgEl.textContent = '—';
        }
    }
}

// ==================== PANEL KONTROL ====================

function closeCourseDetail() {
    document.getElementById('drop-placeholder').style.display = 'flex';
    document.getElementById('course-detail').style.display = 'none';
    if (typeof resetGradeScale === 'function') {
        resetGradeScale();
    }
    if (typeof resetComments === 'function') {
        resetComments();
    }
}

/**
 * Orta paneldeki harf notu buton seçimi
 */
function onCenterGradeSelect(courseId, grade, btnElement) {
    document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    if (typeof onGradeChange === 'function') {
        onGradeChange(courseId, grade);
    }
    highlightGradeRow(grade);
}

/**
 * Sağ paneldeki harf skalasında seçili harfi vurgular
 */
function highlightGradeRow(letter) {
    document.querySelectorAll('.grade-row').forEach(row => {
        row.classList.toggle('active', row.dataset.letter === letter);
    });
}
