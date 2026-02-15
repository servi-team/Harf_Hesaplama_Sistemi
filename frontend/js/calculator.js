/**
 * Not Hesaplama Modülü
 * Mod A (Tanımlı Hoca) ve Mod B (Manuel) hesaplama fonksiyonları
 */

// Manuel kriterler için counter
let manualCriteriaCounter = 0;

/**
 * Hoca seçimine göre değerlendirme kriterlerini yükler (Mod A)
 */
function loadOfferingCriteria(offering, courseId) {
    const container = document.getElementById('criteria-container');
    const resultContainer = document.getElementById('result-container');

    if (!container) return;

    container.style.display = 'block';
    resultContainer.style.display = 'none';

    const criteriaHTML = offering.gradingCriteria
        .sort((a, b) => a.order - b.order)
        .map(criterion => `
            <div class="criteria-item">
                <div class="criteria-header">
                    <label>${criterion.name}</label>
                    <span class="criteria-weight">${criterion.weight}%</span>
                </div>
                <div class="criteria-input-group">
                    <input 
                        type="number" 
                        class="criteria-input" 
                        data-criterion="${criterion.name}"
                        min="0" 
                        max="100" 
                        placeholder="0-100"
                    />
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${criterion.weight}%"></div>
                    </div>
                </div>
            </div>
        `).join('');

    container.innerHTML = `
        ${criteriaHTML}
        <button class="btn-calculate" onclick="calculateOfferingGrade('${courseId}', ${JSON.stringify(offering).replace(/"/g, '&quot;')})">
            Hesapla
        </button>
    `;
}

/**
 * Tanımlı hoca için not hesaplar (Mod A)
 */
function calculateOfferingGrade(courseId, offering) {
    const inputs = document.querySelectorAll('.criteria-input');
    const scores = {};
    let allFilled = true;

    // Skorları topla
    inputs.forEach(input => {
        const criterionName = input.dataset.criterion;
        const value = parseFloat(input.value);

        if (isNaN(value) || value < 0 || value > 100) {
            allFilled = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
            scores[criterionName] = value;
        }
    });

    if (!allFilled) {
        showError('Lütfen tüm notları 0-100 arasında girin');
        return;
    }

    // Ağırlıklı ortalama hesapla
    let totalScore = 0;
    offering.gradingCriteria.forEach(criterion => {
        const score = scores[criterion.name] || 0;
        totalScore += score * (criterion.weight / 100);
    });

    // Harf notunu bul
    const letterGrade = offering.gradingScale.find(scale =>
        totalScore >= scale.minScore && totalScore <= scale.maxScore
    );

    // Sonucu göster
    displayResult(totalScore, letterGrade, courseId);
}

/**
 * Manuel kriter ekler (Mod B)
 */
function addManualCriteria() {
    const container = document.getElementById('manual-criteria-list');
    if (!container) return;

    const id = ++manualCriteriaCounter;

    const criteriaDiv = document.createElement('div');
    criteriaDiv.className = 'manual-criteria-item';
    criteriaDiv.dataset.id = id;
    criteriaDiv.innerHTML = `
        <div class="manual-criteria-inputs">
            <input 
                type="text" 
                class="criteria-name-input" 
                placeholder="Kriter adı (ör: Vize)"
                data-id="${id}"
            />
            <input 
                type="number" 
                class="criteria-weight-input" 
                placeholder="Ağırlık %"
                min="0" 
                max="100"
                data-id="${id}"
                oninput="updateManualWeights()"
            />
            <input 
                type="number" 
                class="criteria-score-input" 
                placeholder="Not (0-100)"
                min="0" 
                max="100"
                data-id="${id}"
            />
            <button class="btn-remove-criteria" onclick="removeManualCriteria(${id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    container.appendChild(criteriaDiv);
    updateManualWeights();
}

/**
 * Manuel kriter siler (Mod B)
 */
function removeManualCriteria(id) {
    const item = document.querySelector(`[data-id="${id}"]`).closest('.manual-criteria-item');
    if (item) {
        item.remove();
        updateManualWeights();
    }
}

/**
 * Manuel ağırlıkları günceller ve doğrular (Mod B)
 */
function updateManualWeights() {
    const weightInputs = document.querySelectorAll('.criteria-weight-input');
    let totalWeight = 0;

    weightInputs.forEach(input => {
        const weight = parseFloat(input.value) || 0;
        totalWeight += weight;
    });

    // Progress bar'ı güncelle
    const progressBar = document.getElementById('manual-weight-bar');
    const totalSpan = document.getElementById('manual-weight-total');
    const calculateBtn = document.getElementById('manual-calculate-btn');

    if (progressBar) {
        progressBar.style.width = `${Math.min(totalWeight, 100)}%`;

        // Renk değiştir
        if (totalWeight === 100) {
            progressBar.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        } else if (totalWeight > 100) {
            progressBar.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            progressBar.style.background = 'var(--text-muted)';
        }
    }

    if (totalSpan) {
        totalSpan.textContent = `${totalWeight.toFixed(0)}%`;
        totalSpan.style.color = totalWeight === 100 ? 'var(--primary-light)' :
            totalWeight > 100 ? '#ef4444' : 'var(--text-muted)';
    }

    // Hesapla butonunu aktif/pasif yap
    if (calculateBtn) {
        calculateBtn.disabled = totalWeight !== 100 || weightInputs.length === 0;
    }
}

/**
 * Manuel not hesaplar (Mod B)
 */
function calculateManualGrade(courseId) {
    const items = document.querySelectorAll('.manual-criteria-item');

    if (items.length === 0) {
        showError('En az bir kriter ekleyin');
        return;
    }

    let totalScore = 0;
    let totalWeight = 0;
    let allValid = true;

    items.forEach(item => {
        const id = item.dataset.id;
        const nameInput = item.querySelector('.criteria-name-input');
        const weightInput = item.querySelector('.criteria-weight-input');
        const scoreInput = item.querySelector('.criteria-score-input');

        const name = nameInput.value.trim();
        const weight = parseFloat(weightInput.value);
        const score = parseFloat(scoreInput.value);

        if (!name || isNaN(weight) || isNaN(score) || score < 0 || score > 100) {
            allValid = false;
            if (!name) nameInput.classList.add('error');
            if (isNaN(weight)) weightInput.classList.add('error');
            if (isNaN(score) || score < 0 || score > 100) scoreInput.classList.add('error');
        } else {
            nameInput.classList.remove('error');
            weightInput.classList.remove('error');
            scoreInput.classList.remove('error');

            totalScore += score * (weight / 100);
            totalWeight += weight;
        }
    });

    if (!allValid) {
        showError('Lütfen tüm alanları doğru doldurun');
        return;
    }

    if (Math.abs(totalWeight - 100) > 0.01) {
        showError('Toplam ağırlık 100 olmalı');
        return;
    }

    // Standart harf notu skalası
    const standardScale = [
        { letterGrade: 'AA', minScore: 90, maxScore: 100, gradePoint: 4.0 },
        { letterGrade: 'BA', minScore: 85, maxScore: 89, gradePoint: 3.5 },
        { letterGrade: 'BB', minScore: 80, maxScore: 84, gradePoint: 3.0 },
        { letterGrade: 'CB', minScore: 75, maxScore: 79, gradePoint: 2.5 },
        { letterGrade: 'CC', minScore: 70, maxScore: 74, gradePoint: 2.0 },
        { letterGrade: 'DC', minScore: 65, maxScore: 69, gradePoint: 1.5 },
        { letterGrade: 'DD', minScore: 60, maxScore: 64, gradePoint: 1.0 },
        { letterGrade: 'FD', minScore: 50, maxScore: 59, gradePoint: 0.5 },
        { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0 }
    ];

    const letterGrade = standardScale.find(scale =>
        totalScore >= scale.minScore && totalScore <= scale.maxScore
    );

    // Sonucu göster
    displayManualResult(totalScore, letterGrade, courseId);
}

/**
 * Hesaplama sonucunu gösterir (Mod A)
 */
function displayResult(numericGrade, letterGrade, courseId) {
    const container = document.getElementById('result-container');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <h3>Hesaplama Sonucu</h3>
            </div>
            <div class="result-grades">
                <div class="result-item">
                    <span class="result-label">Sayısal Not</span>
                    <span class="result-value numeric">${numericGrade.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Harf Notu</span>
                    <span class="result-value letter">${letterGrade.letterGrade}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Katsayı</span>
                    <span class="result-value">${letterGrade.gradePoint.toFixed(1)}</span>
                </div>
            </div>
            <button class="btn-save-grade" onclick="saveGradeToList('${courseId}', '${letterGrade.letterGrade}')">
                Notu Kaydet
            </button>
        </div>
    `;

    // Scroll to result
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Manuel hesaplama sonucunu gösterir (Mod B)
 */
function displayManualResult(numericGrade, letterGrade, courseId) {
    const container = document.getElementById('manual-result');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <h3>Hesaplama Sonucu</h3>
            </div>
            <div class="result-grades">
                <div class="result-item">
                    <span class="result-label">Sayısal Not</span>
                    <span class="result-value numeric">${numericGrade.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Harf Notu</span>
                    <span class="result-value letter">${letterGrade.letterGrade}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Katsayı</span>
                    <span class="result-value">${letterGrade.gradePoint.toFixed(1)}</span>
                </div>
            </div>
            <button class="btn-save-grade" onclick="saveGradeToList('${courseId}', '${letterGrade.letterGrade}')">
                Notu Kaydet
            </button>
        </div>
    `;

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hesaplanan notu sol paneldeki listeye kaydeder
 */
function saveGradeToList(courseId, letterGrade) {
    // Sol paneldeki select'i güncelle
    const select = document.querySelector(`.grade-select[data-course-id="${courseId}"]`);
    if (select) {
        select.value = letterGrade;
        onGradeChange(courseId, letterGrade);
    }

    // Başarı mesajı göster
    showSuccess('Not kaydedildi!');
}

/**
 * Hata mesajı gösterir
 */
function showError(message) {
    // Basit alert yerine daha güzel bir notification sistemi eklenebilir
    alert('❌ ' + message);
}

/**
 * Başarı mesajı gösterir
 */
function showSuccess(message) {
    alert('✅ ' + message);
}
