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

let currentSelectedCourseId = null;

// ==================== DERS DETAY YÜKLEME ====================

/**
 * Ders detaylarını orta panelde gösterir
 */
function loadCourseDetail(courseId) {
    currentSelectedCourseId = courseId;
    const course = findCourseById(courseId);
    if (!course) {
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

    // Tanımlı kriter varsa ilk kriteri otomatik yükle
    if (criteriaList.length > 0) {
        const criteriaSelect = document.getElementById('criteria-select');
        if (criteriaSelect) criteriaSelect.value = '0';
        loadCriteriaContent(criteriaList[0], courseId);
    }
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
    const deptId = localStorage.getItem('selectedDepartment');
    const isLoggedIn = MOCK_DATA.mockCurrentUser !== null;

    return `
        <div class="detail-header">
            <div class="detail-header-content">
                <div class="detail-course-code">${escapeHtml(course.courseCode)}</div>
                <h2 class="detail-course-name">${escapeHtml(course.courseName)}</h2>
                <div class="detail-course-meta">
                    ${course.credit} Kredi • ${course.ects} AKTS
                    <button class="btn-action-sm" onclick="openReportCourseModal('${escapeHtml(course.id)}')" title="Ders Müfredattan Kaldırıldı Bildir" style="margin-left: 0.5rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px; padding: 0.15rem 0.4rem; font-size: 0.7rem; cursor: pointer;">⚠️ Kaldırıldı Bildir</button>
                    ${isLoggedIn ? `
                    <span class="detail-admin-actions">
                        <button class="btn-action-sm btn-edit-sm" onclick="openEditModal('COURSE','${escapeHtml(course.id)}','${escapeHtml(deptId || '')}')" title="Dersi Düzenle">✏️</button>
                        <button class="btn-action-sm btn-delete-sm" onclick="openDeleteModal('COURSE','${escapeHtml(course.id)}','${escapeHtml(deptId || '')}')" title="Dersi Sil">🗑️</button>
                    </span>
                    ` : ''}
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
                    <label>📊 Değerlendirme Kriteri
                        ${isLoggedIn && hasCriteria ? `
                        <span class="selector-actions">
                            <button class="btn-action-xs" onclick="editSelectedCriteria('${escapeHtml(course.id)}')" title="Düzenle">✏️</button>
                            <button class="btn-action-xs" onclick="deleteSelectedCriteria('${escapeHtml(course.id)}')" title="Sil">🗑️</button>
                        </span>` : ''}
                    </label>
                    <select id="criteria-select" class="custom-select">
                        <option value="">Seçin...</option>
                        ${criteriaList.map((c, i) => `<option value="${i}">${escapeHtml(c.label)}</option>`).join('')}
                        <option value="custom">✨ Özel - Elle Gir</option>
                    </select>
                </div>
                <div class="selector-group">
                    <label>🔤 Harf Skalası
                        ${isLoggedIn && hasScales ? `
                        <span class="selector-actions">
                            <button class="btn-action-xs" onclick="editSelectedScale('${escapeHtml(course.id)}')" title="Düzenle">✏️</button>
                            <button class="btn-action-xs" onclick="deleteSelectedScale('${escapeHtml(course.id)}')" title="Sil">🗑️</button>
                        </span>` : ''}
                    </label>
                    <select id="scale-select" class="custom-select">
                        <option value="default">Varsayılan Skala</option>
                        ${scaleList.map((s, i) => `<option value="${i}">${escapeHtml(s.label)}</option>`).join('')}
                        <option value="custom">✨ Özel - Elle Gir</option>
                    </select>
                </div>
            </div>

            <!-- Kriter İçeriği -->
            <div id="criteria-container">
                <!-- Seçim yapıldığında doldurulacak -->
            </div>

            <!-- Manuel Hesaplama Kapsayıcısı -->
            <div id="manual-mode-wrapper">
                ${!hasCriteria ? createManualCriteriaHTML(course) : ''}
            </div>

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
    const course = findCourseById(courseId);
    // Değerlendirme Kriteri seçici
    const criteriaSelect = document.getElementById('criteria-select');
    if (criteriaSelect) {
        criteriaSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            const container = document.getElementById('criteria-container');
            const manualWrapper = document.getElementById('manual-mode-wrapper');

            if (value === 'custom') {
                if (container) container.innerHTML = '';
                if (manualWrapper) manualWrapper.innerHTML = createManualCriteriaHTML(course);
            } else {
                const index = parseInt(value);
                if (!isNaN(index) && criteriaList[index]) {
                    if (manualWrapper) manualWrapper.innerHTML = '';
                    loadCriteriaContent(criteriaList[index], courseId);
                }
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
            } else if (value === 'custom') {
                if (typeof openAddModal === 'function' && currentSelectedCourseId) {
                    openAddModal('SCALE', currentSelectedCourseId);
                } else {
                    loadScaleToRightPanel({
                        label: 'Özel Skala',
                        scale: MOCK_DATA.defaultGradeScale,
                        totalStudents: null
                    });
                }
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

    const uni = localStorage.getItem('selectedUniversity') || 'genel';
    const dept = localStorage.getItem('selectedDepartment') || 'genel';
    let savedScores = {};
    try {
     container.innerHTML = `
        <div class="criteria-section">
            <div class="criteria-header-info">
                <span class="criteria-instructor">${escapeHtml(criteriaData.instructorName)}</span>
                <span class="criteria-year">${criteriaData.year}</span>
            </div>
            <div class="criteria-list">
                ${criteriaData.criteria.map((c, idx) => `
                    <div class="criteria-item">
                        <div class="criteria-name">${escapeHtml(c.name)}</div>
                        <div class="criteria-weight">
                            <div class="criteria-weight-bar" style="width: ${c.weight}%"></div>
                            <span class="criteria-weight-text">%${c.weight}</span>
                        </div>
                        <input type="number" class="criteria-score" placeholder="Not" min="0" max="100" 
                               data-weight="${c.weight}" data-criterion-idx="${idx}"
                               value="${savedScores[idx] !== undefined ? savedScores[idx] : ''}"
                               oninput="recalculateGrade('${escapeHtml(courseId)}')">
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Sonuç container'ı göster ve "Notu Kaydet" butonunu yanına ekle
    const resultBox = document.getElementById('result-container');
    if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
            <div class="calculated-result-wrapper" style="display: flex; gap: 0.75rem; align-items: stretch; width: 100%; margin-top: 1rem;">
                <div class="result-card" style="flex: 1; margin: 0; padding: 1.1rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
                    <div class="result-label" style="margin: 0; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase;">HESAPLANAN ORTALAMA</div>
                    <div class="result-value" id="calculated-avg" style="margin: 0; font-size: 1.8rem; font-weight: 800; color: var(--text-primary); line-height: 1;">—</div>
                </div>
                <button type="button" class="btn-primary btn-save-calculated" onclick="saveCalculatedGradeToGPA('${escapeHtml(courseId)}')" style="min-width: 170px; padding: 0 1.25rem; font-size: 0.88rem; font-weight: 600; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-md); border: none; cursor: pointer; transition: all var(--transition-fast); align-self: stretch;">
                    <span>💾 Notu Kaydet</span>
                </button>
            </div>
        `;
    }

    // Kayıtlı notlar varsa ortalamayı hemen hesapla
    setTimeout(() => recalculateGrade(courseId), 50);
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
            ${escapeHtml(scaleData.label)}${scaleData.totalStudents ? ` • ${scaleData.totalStudents} öğrenci` : ''}
        </div>`gin-bottom: 0.25rem;">
            ${scaleData.label}${scaleData.totalStudents ? ` • ${scaleData.totalStudents} öğrenci` : ''}
        </div>
        <div class="grade-scale-table">
            ${scaleData.scale.map(g => `
                <div class="grade-row" data-letter="${g.letterGrade}" data-min="${g.minScore}" data-max="${g.maxScore}">
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

function onScaleYearChange(year) {
    if (!currentSelectedCourseId) return;
    const scaleList = MOCK_DATA.gradeScales[currentSelectedCourseId] || [];
    if (year === 'current') {
        updateGradeScale(currentSelectedCourseId);
    } else if (scaleList.length > 1) {
        loadScaleToRightPanel(scaleList[1] || scaleList[0]);
    } else {
        loadScaleToRightPanel({
            label: `${year} Dönemi (Ahmet Hoca)`,
            scale: [
                { letterGrade: 'AA', minScore: 88, maxScore: 100, gradePoint: 4.0, studentCount: 12 },
                { letterGrade: 'BA', minScore: 82, maxScore: 87, gradePoint: 3.5, studentCount: 18 },
                { letterGrade: 'BB', minScore: 75, maxScore: 81, gradePoint: 3.0, studentCount: 25 },
                { letterGrade: 'CB', minScore: 68, maxScore: 74, gradePoint: 2.5, studentCount: 30 },
                { letterGrade: 'CC', minScore: 60, maxScore: 67, gradePoint: 2.0, studentCount: 22 },
                { letterGrade: 'DC', minScore: 55, maxScore: 59, gradePoint: 1.5, studentCount: 14 },
                { letterGrade: 'DD', minScore: 50, maxScore: 54, gradePoint: 1.0, studentCount: 8 },
                { letterGrade: 'FD', minScore: 40, maxScore: 49, gradePoint: 0.5, studentCount: 5 },
                { letterGrade: 'FF', minScore: 0, maxScore: 39, gradePoint: 0.0, studentCount: 3 }
            ],
            totalStudents: 137
        });
    }
}

/**
 * Notları girildikçe otomatik hesaplar
 */
function recalculateGrade(courseId) {
    const inputs = document.querySelectorAll('.criteria-score');
    let totalWeight = 0;
    let weightedSum = 0;
    let scoresToSave = {};

    inputs.forEach(input => {
        const weight = parseFloat(input.dataset.weight);
        let score = parseFloat(input.value);
        const idx = input.dataset.criterionIdx;
        
        // Girdi doğrulama: 0 ile 100 arasında sınırlandır
        if (!isNaN(score)) {
            if (score < 0) {
                score = 0;
                input.value = 0;
            } else if (score > 100) {
                score = 100;
                input.value = 100;
            }
            weightedSum += score * (weight / 100);
            totalWeight += weight;
            if (idx !== undefined) {
                scoresToSave[idx] = score;
            }
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

    // Girilen notları ders özelinde localStorage'a kaydet
    if (Object.keys(scoresToSave).length > 0) {
        try {
            const uni = localStorage.getItem('selectedUniversity') || 'genel';
            const dept = localStorage.getItem('selectedDepartment') || 'genel';
            localStorage.setItem(`savedScores_${uni}_${dept}_${courseId}`, JSON.stringify(scoresToSave));
        } catch(e) {}
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

// ==================== ADMIN EDIT/DELETE HELPERS ====================

function editSelectedCriteria(courseId) {
    const sel = document.getElementById('criteria-select');
    const idx = sel ? sel.value : '';
    if (idx === '' || idx === 'manual') return alert('Önce bir kriter seti seçin');
    const list = MOCK_DATA.gradingCriteria[courseId] || [];
    const item = list[Number(idx)];
    if (item && typeof openEditModal === 'function') openEditModal('CRITERIA', item.id, courseId);
}

function deleteSelectedCriteria(courseId) {
    const sel = document.getElementById('criteria-select');
    const idx = sel ? sel.value : '';
    if (idx === '' || idx === 'manual') return alert('Önce bir kriter seti seçin');
    const list = MOCK_DATA.gradingCriteria[courseId] || [];
    const item = list[Number(idx)];
    if (item && typeof openDeleteModal === 'function') openDeleteModal('CRITERIA', item.id, courseId);
}

function editSelectedScale(courseId) {
    const sel = document.getElementById('scale-select');
    const idx = sel ? sel.value : '';
    if (idx === '' || idx === 'default') return alert('Önce bir harf skalası seçin');
    const list = MOCK_DATA.gradeScales[courseId] || [];
    const item = list[Number(idx)];
    if (item && typeof openEditModal === 'function') openEditModal('SCALE', item.id, courseId);
}

function deleteSelectedScale(courseId) {
    const sel = document.getElementById('scale-select');
    const idx = sel ? sel.value : '';
    if (idx === '' || idx === 'default') return alert('Önce bir harf skalası seçin');
    const list = MOCK_DATA.gradeScales[courseId] || [];
    const item = list[Number(idx)];
    if (item && typeof openDeleteModal === 'function') openDeleteModal('SCALE', item.id, courseId);
}

// ==================== SAVE CALCULATED GRADE TO GPA ====================

/**
 * Hesaplanan ortalamayı sağ paneldeki harf skalasına göre harf notuna dönüştürür,
 * ders notunu ve sol alttaki genel ortalamayı (AGNO) günceller ve kaydeder.
 */
function saveCalculatedGradeToGPA(courseId) {
    const avgEl = document.getElementById('calculated-avg');
    if (!avgEl || avgEl.textContent === '—') {
        alert('Lütfen önce sınav notlarınızı giriniz.');
        return;
    }

    const numericGrade = parseFloat(avgEl.textContent);
    if (isNaN(numericGrade)) {
        alert('Geçerli bir ortalama bulunamadı.');
        return;
    }

    // Sağ panelde ekranda görünen aktif Harf Skalası satırlarını oku
    let letterGrade = null;
    const gradeRows = document.querySelectorAll('#grade-scale-content .grade-row');

    if (gradeRows.length > 0) {
        for (const row of gradeRows) {
            const minScore = parseFloat(row.dataset.min);
            const maxScore = parseFloat(row.dataset.max);
            const letter = row.dataset.letter;
            if (!isNaN(minScore) && !isNaN(maxScore) && numericGrade >= minScore && numericGrade <= maxScore) {
                letterGrade = letter;
                break;
            }
        }
    }

    // Fallback: MOCK_DATA skalası
    if (!letterGrade) {
        let scale = MOCK_DATA.defaultGradeScale;
        const scaleList = MOCK_DATA.gradeScales[courseId] || [];
        if (scaleList.length > 0 && scaleList[0].scale) {
            scale = scaleList[0].scale;
        }
        for (const item of scale) {
            if (numericGrade >= item.minScore && numericGrade <= item.maxScore) {
                letterGrade = item.letterGrade;
                break;
            }
        }
    }

    if (!letterGrade) letterGrade = 'FF';

    // Sol paneldeki harf notunu güncelle ve kaydet
    if (typeof onGradeChange === 'function') {
        onGradeChange(courseId, letterGrade);
    }

    // Sol paneldeki select öğesini güncelle
    const select = document.querySelector(`.grade-select[data-course-id="${courseId}"]`);
    if (select) {
        select.value = letterGrade;
    }

    // Harf skalasında ilgili satırı vurgula
    if (typeof highlightGradeRow === 'function') {
        highlightGradeRow(letterGrade);
    }

    // Bildirim ver
    const course = findCourseById(courseId);
    const codeName = course ? `${course.courseCode} (${course.courseName})` : courseId;
    alert(`✅ ${codeName}\nOrtalama: ${numericGrade.toFixed(1)} → Harf Notu: ${letterGrade}\nSağdaki harf skalasına göre eşleştirildi ve genel AGNO ortalamanıza başarıyla kaydedildi!`);
}
