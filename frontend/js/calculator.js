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
                    <label>${escapeHtml(criterion.name)}</label>
                    <span class="criteria-weight">${Number(criterion.weight).toFixed(2)}%</span>
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
                        <div class="progress-fill" style="width: ${Math.min(100, Math.max(0, Number(criterion.weight) || 0))}%"></div>
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

        if (!Number.isFinite(value) || value < 0 || value > 100) {
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

    // Ağırlıklı ortalama & Baraj kontrolü
    let totalScore = 0;
    let failedMinScore = false;
    let failedMinInfo = '';

    offering.gradingCriteria.forEach(criterion => {
        const score = scores[criterion.name] || 0;
        totalScore += score * (criterion.weight / 100);

        if (Number.isFinite(Number(criterion.minRequiredScore)) && score < Number(criterion.minRequiredScore)) {
            failedMinScore = true;
            failedMinInfo = `${escapeHtml(criterion.name)} baraj notunu (${Number(criterion.minRequiredScore).toFixed(2)}) geçemediniz!`;
        }
    });

    totalScore = Math.min(100.0, Math.max(0.0, totalScore));

    let letterGradeObj;
    if (failedMinScore) {
        letterGradeObj = { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0, warning: failedMinInfo };
    } else {
        letterGradeObj = offering.gradingScale.find(scale =>
            totalScore >= scale.minScore && totalScore <= scale.maxScore
        ) || { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0 };
    }

    // Sonucu göster
    displayResult(totalScore, letterGradeObj, courseId);
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
        <div class="manual-criteria-inputs" style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.5rem;">
            <input 
                type="text" 
                class="criteria-name-input custom-input" 
                placeholder="Kriter (ör: Final)"
                data-id="${id}"
                style="flex: 2;"
            />
            <input 
                type="number" 
                class="criteria-weight-input custom-input" 
                placeholder="Ağırlık %"
                min="0" 
                max="100"
                data-id="${id}"
                oninput="updateManualWeights()"
                style="flex: 1;"
            />
            <input 
                type="number" 
                class="criteria-score-input custom-input" 
                placeholder="Not (0-100)"
                min="0" 
                max="100"
                data-id="${id}"
                style="flex: 1;"
            />
            <input 
                type="number" 
                class="criteria-min-input custom-input" 
                placeholder="Min Baraj"
                min="0" 
                max="100"
                data-id="${id}"
                title="Sınavdan alınması gereken min baraj notu (Opsiyonel)"
                style="flex: 1;"
            />
            <button class="btn-remove-criteria" onclick="removeManualCriteria(${id})" style="background: none; border: none; color: #ef4444; cursor: pointer;">
                ❌
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
    const item = document.querySelector(`[data-id="${id}"]`) ? document.querySelector(`[data-id="${id}"]`).closest('.manual-criteria-item') : null;
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

    const progressBar = document.getElementById('manual-weight-bar');
    const totalSpan = document.getElementById('manual-weight-total');
    const calculateBtn = document.getElementById('manual-calculate-btn');

    if (progressBar) {
        progressBar.style.width = `${Math.min(totalWeight, 100)}%`;
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
    let failedMinScore = false;
    let failedMinInfo = '';

    items.forEach(item => {
        const nameInput = item.querySelector('.criteria-name-input');
        const weightInput = item.querySelector('.criteria-weight-input');
        const scoreInput = item.querySelector('.criteria-score-input');
        const minInput = item.querySelector('.criteria-min-input');

        const name = nameInput.value.trim();
        const weight = parseFloat(weightInput.value);
        const score = parseFloat(scoreInput.value);
        const minVal = minInput && minInput.value !== '' ? parseFloat(minInput.value) : NaN;

        const isWeightInvalid = !Number.isFinite(weight) || weight <= 0 || weight > 100;
        const isScoreInvalid = !Number.isFinite(score) || score < 0 || score > 100;
        const isMinInvalid = !Number.isNaN(minVal) && (!Number.isFinite(minVal) || minVal < 0 || minVal > 100);
        const isNameInvalid = !name || name.length > 100 || /[<>]/.test(name);

        if (isNameInvalid || isWeightInvalid || isScoreInvalid || isMinInvalid) {
            allValid = false;
            if (isNameInvalid) nameInput.classList.add('error');
            if (isWeightInvalid) weightInput.classList.add('error');
            if (isScoreInvalid) scoreInput.classList.add('error');
            if (isMinInvalid && minInput) minInput.classList.add('error');
        } else {
            nameInput.classList.remove('error');
            weightInput.classList.remove('error');
            scoreInput.classList.remove('error');
            if (minInput) minInput.classList.remove('error');

            totalScore += score * (weight / 100);
            totalWeight += weight;

            if (Number.isFinite(minVal) && score < minVal) {
                failedMinScore = true;
                failedMinInfo = `${name} baraj notunu (${minVal}) geçemediniz!`;
            }
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

    totalScore = Math.min(100.0, Math.max(0.0, totalScore));

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

    let letterGradeObj;
    if (failedMinScore) {
        letterGradeObj = { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0, warning: failedMinInfo };
    } else {
        letterGradeObj = standardScale.find(scale =>
            totalScore >= scale.minScore && totalScore <= scale.maxScore
        ) || { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0 };
    }

    // Sonucu göster
    displayManualResult(totalScore, letterGradeObj, courseId);
}

/**
 * Hesaplama sonucunu gösterir (Mod A)
 */
function displayResult(numericGrade, letterGrade, courseId) {
    const container = document.getElementById('result-container');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
        <div class="result-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-top: 1rem;">
            <div class="result-header" style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary-light);">
                <h3>Hesaplama Sonucu</h3>
            </div>
            ${letterGrade.warning ? `
                <div class="warning-banner" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; margin: 0.5rem 0; font-weight: 600;">
                    ⚠️ ${letterGrade.warning}
                </div>
            ` : ''}
            <div class="result-grades" style="display: flex; justify-content: space-around; margin: 1rem 0; text-align: center;">
                <div class="result-item">
                    <span class="result-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Sayısal Not</span>
                    <span class="result-value numeric" style="font-size: 1.25rem; font-weight: 700;">${numericGrade.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Harf Notu</span>
                    <span class="result-value letter" style="font-size: 1.5rem; font-weight: 800; color: var(--primary-light);">${letterGrade.letterGrade}</span>
                </div>
                <div class="result-item">
                    <span class="result-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Katsayı</span>
                    <span class="result-value" style="font-size: 1.25rem; font-weight: 700;">${letterGrade.gradePoint.toFixed(1)}</span>
                </div>
            </div>
            
            <div class="result-note-section" style="margin-top: 1rem; padding: 0.85rem 1rem 0.5rem 1.25rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.55rem; width: 100%; box-sizing: border-box; clear: both; position: relative; z-index: 5;">
                <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem; width: 100%;">
                    <span>📝 Derse Özel Not / Açıklama</span>
                    <span style="font-size: 0.68rem; font-weight: 400; color: var(--text-muted);">(İsteğe bağlı)</span>
                </label>
                <input type="text" id="result-grade-note-${courseId}" class="custom-input" placeholder="Örn: Bu ders için MAT101 saydırıldı" style="width: 100%; padding: 0.6rem 0.8rem; font-size: 0.82rem; border-radius: var(--radius-md); background: var(--bg-dark); border: 1px solid var(--border); box-sizing: border-box;">
                <button type="button" class="btn-primary" style="width: 100%; margin-top: 0.3rem; padding: 0.65rem; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: var(--radius-md);" onclick="saveGradeToList('${courseId}', '${letterGrade.letterGrade}')">
                    <span>💾 Notu Kaydet</span>
                </button>
            </div>
        </div>
    `;

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
        <div class="result-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-top: 1rem;">
            <div class="result-header" style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary-light);">
                <h3>Hesaplama Sonucu (Manuel)</h3>
            </div>
            ${letterGrade.warning ? `
                <div class="warning-banner" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; margin: 0.5rem 0; font-weight: 600;">
                    ⚠️ ${letterGrade.warning}
                </div>
            ` : ''}
            <div class="result-grades" style="display: flex; justify-content: space-around; margin: 1rem 0; text-align: center;">
                <div class="result-item">
                    <span class="result-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Sayısal Not</span>
                    <span class="result-value numeric" style="font-size: 1.25rem; font-weight: 700;">${numericGrade.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Harf Notu</span>
                    <span class="result-value letter" style="font-size: 1.5rem; font-weight: 800; color: var(--primary-light);">${letterGrade.letterGrade}</span>
                </div>
                <div class="result-item">
                    <span class="result-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Katsayı</span>
                    <span class="result-value" style="font-size: 1.25rem; font-weight: 700;">${letterGrade.gradePoint.toFixed(1)}</span>
                </div>
            </div>

            <div class="result-note-section" style="margin-top: 1rem; padding: 0.85rem 1rem 0.5rem 1.25rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.55rem; width: 100%; box-sizing: border-box; clear: both; position: relative; z-index: 5;">
                <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem; width: 100%;">
                    <span>📝 Derse Özel Not / Açıklama</span>
                    <span style="font-size: 0.68rem; font-weight: 400; color: var(--text-muted);">(İsteğe bağlı)</span>
                </label>
                <input type="text" id="result-grade-note-${courseId}" class="custom-input" placeholder="Örn: Bu ders için MAT101 saydırıldı" style="width: 100%; padding: 0.6rem 0.8rem; font-size: 0.82rem; border-radius: var(--radius-md); background: var(--bg-dark); border: 1px solid var(--border); box-sizing: border-box;">
                <button type="button" class="btn-primary" style="width: 100%; margin-top: 0.3rem; padding: 0.65rem; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: var(--radius-md);" onclick="saveGradeToList('${courseId}', '${letterGrade.letterGrade}')">
                    <span>💾 Notu Kaydet</span>
                </button>
            </div>
        </div>
    `;

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hesaplanan notu sol paneldeki listeye kaydeder
 */
function saveGradeToList(courseId, letterGrade) {
    const noteInput = document.getElementById(`result-grade-note-${courseId}`);
    if (noteInput && noteInput.value.trim() !== '') {
        const noteText = noteInput.value.trim().substring(0, 250);
        const uni = localStorage.getItem('selectedUniversity') || 'genel';
        const dept = localStorage.getItem('selectedDepartment') || 'genel';
        const prefix = typeof getStorageUserPrefix === 'function' ? getStorageUserPrefix() : 'guest';
        const key = `gradeNotes_${prefix}_${uni}_${dept}`;
        let gradeNotes = {};
        try {
            gradeNotes = JSON.parse(localStorage.getItem(key) || '{}');
        } catch(e) {}
        gradeNotes[courseId] = noteText;
        localStorage.setItem(key, JSON.stringify(gradeNotes));
        if (prefix === 'guest') {
            localStorage.setItem(`gradeNotes_${uni}_${dept}`, JSON.stringify(gradeNotes));
        }
    }

    // Sol paneldeki select elementini güncelle
    const select = document.querySelector(`.grade-select[data-course-id="${courseId}"]`);
    if (select) {
        select.value = letterGrade;
    }
    
    // onGradeChange fonksiyonunu çağır
    if (typeof onGradeChange === 'function') {
        onGradeChange(courseId, letterGrade);
    }

    showSuccess(`Not (${letterGrade}) başarıyla kaydedildi!`);
}

/**
 * Hata mesajı gösterir
 */
function showError(message) {
    alert('❌ ' + message);
}

/**
 * Başarı mesajı gösterir
 */
function showSuccess(message) {
    alert('✅ ' + message);
}
