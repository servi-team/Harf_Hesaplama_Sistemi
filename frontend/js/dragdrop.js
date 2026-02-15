/**
 * Sürükle-Bırak (Drag & Drop) İşlemleri
 */

let draggedCourseId = null;

/**
 * Sayfa yüklendiğinde drag & drop event listener'ları ekle
 */
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
});

/**
 * Drag & Drop event listener'larını kurar
 */
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');

    if (!dropZone) return;

    // Drop zone events
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Ders itemlerine drag event'leri ekle (delegation kullanarak)
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
}

/**
 * Sürükleme başladığında
 */
function handleDragStart(e) {
    if (!e.target.classList.contains('course-item')) return;

    draggedCourseId = e.target.dataset.courseId;
    e.target.classList.add('dragging');

    // Drag image ayarla
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedCourseId);
}

/**
 * Sürükleme bittiğinde
 */
function handleDragEnd(e) {
    if (!e.target.classList.contains('course-item')) return;

    e.target.classList.remove('dragging');
    draggedCourseId = null;
}

/**
 * Drop zone üzerinde sürüklenirken
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const dropZone = document.getElementById('drop-zone');
    dropZone.classList.add('drag-over');
}

/**
 * Drop zone'dan ayrılırken
 */
function handleDragLeave(e) {
    const dropZone = document.getElementById('drop-zone');

    // Sadece drop zone'dan tamamen çıkıldığında class'ı kaldır
    if (e.target === dropZone) {
        dropZone.classList.remove('drag-over');
    }
}

/**
 * Drop zone'a bırakıldığında
 */
function handleDrop(e) {
    e.preventDefault();

    const dropZone = document.getElementById('drop-zone');
    dropZone.classList.remove('drag-over');

    const courseId = e.dataTransfer.getData('text/plain');

    if (courseId) {
        loadCourseDetail(courseId);
    }
}

/**
 * Ders detaylarını sağ panelde gösterir
 */
function loadCourseDetail(courseId) {
    const course = findCourseById(courseId);

    if (!course) {
        console.error('Ders bulunamadı:', courseId);
        return;
    }

    // Placeholder'ı gizle, detayı göster
    document.getElementById('drop-placeholder').style.display = 'none';
    const detailDiv = document.getElementById('course-detail');
    detailDiv.style.display = 'block';

    // Ders için offerings'leri kontrol et
    const offerings = MOCK_DATA.offerings[courseId] || [];

    // Detay içeriğini oluştur
    detailDiv.innerHTML = createCourseDetailHTML(course, offerings);

    // Event listener'ları ekle
    setupCourseDetailEvents(courseId, offerings);
}

/**
 * Ders detay HTML'ini oluşturur
 */
function createCourseDetailHTML(course, offerings) {
    const hasOfferings = offerings.length > 0;

    return `
        <div class="detail-header">
            <div class="detail-header-content">
                <div class="detail-course-code">${course.courseCode}</div>
                <h2 class="detail-course-name">${course.courseName}</h2>
                <div class="detail-course-meta">
                    ${course.credit} Kredi • ${course.ects} ECTS
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
            ${hasOfferings ? createModeAHTML(course, offerings) : createModeBHTML(course)}
        </div>
    `;
}

/**
 * Mod A: Tanımlı hoca/ders HTML'i
 */
function createModeAHTML(course, offerings) {
    return `
        <div class="mode-selector">
            <button class="mode-btn active" data-mode="a">Tanımlı Hoca</button>
            <button class="mode-btn" data-mode="b">Manuel Hesaplama</button>
        </div>
        
        <div class="mode-content mode-a active">
            <div class="form-group">
                <label>Hoca ve Yıl Seçin</label>
                <select id="offering-select" class="custom-select">
                    <option value="">Seçin...</option>
                    ${offerings.map((off, idx) => `
                        <option value="${idx}">${off.year} - ${off.instructorName}</option>
                    `).join('')}
                </select>
            </div>
            
            <div id="criteria-container" style="display: none;">
                <!-- Kriterler buraya gelecek -->
            </div>
            
            <div id="result-container" style="display: none;">
                <!-- Sonuç buraya gelecek -->
            </div>
        </div>
        
        <div class="mode-content mode-b">
            ${createModeBHTML(course)}
        </div>
    `;
}

/**
 * Mod B: Manuel hesaplama HTML'i
 */
function createModeBHTML(course) {
    return `
        <div class="manual-mode">
            <p class="mode-description">Kendi değerlendirme kriterlerinizi oluşturun</p>
            
            <div id="manual-criteria-list">
                <!-- Manuel kriterler buraya gelecek -->
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
                <!-- Manuel hesaplama sonucu -->
            </div>
        </div>
    `;
}

/**
 * Ders detay event listener'larını kurar
 */
function setupCourseDetailEvents(courseId, offerings) {
    // Mod değiştirme butonları
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Offering seçimi
    const offeringSelect = document.getElementById('offering-select');
    if (offeringSelect) {
        offeringSelect.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (!isNaN(index) && offerings[index]) {
                loadOfferingCriteria(offerings[index], courseId);
            }
        });
    }
}

/**
 * Mod değiştirir (A/B)
 */
function switchMode(mode) {
    // Butonları güncelle
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // İçerikleri göster/gizle
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.toggle('active', content.classList.contains(`mode-${mode}`));
    });
}

/**
 * Ders detayını kapatır
 */
function closeCourseDetail() {
    document.getElementById('drop-placeholder').style.display = 'flex';
    document.getElementById('course-detail').style.display = 'none';
}
