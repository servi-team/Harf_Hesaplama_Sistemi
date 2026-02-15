/**
 * Giriş Ekranı JavaScript
 * Üniversite ve bölüm seçimi mantığı
 */

// DOM Elements
const universitySelect = document.getElementById('university-select');
const departmentSelect = document.getElementById('department-select');
const continueBtn = document.getElementById('continue-btn');

// State
let selectedUniversity = null;
let selectedDepartment = null;

/**
 * Üniversite seçildiğinde çalışır
 */
universitySelect.addEventListener('change', (e) => {
    const universityId = e.target.value;

    if (!universityId) {
        // Seçim temizlendi
        resetDepartmentSelect();
        return;
    }

    selectedUniversity = universityId;
    loadDepartments(universityId);
});

/**
 * Bölüm seçildiğinde çalışır
 */
departmentSelect.addEventListener('change', (e) => {
    const departmentId = e.target.value;

    if (!departmentId) {
        selectedDepartment = null;
        continueBtn.disabled = true;
        return;
    }

    selectedDepartment = departmentId;
    continueBtn.disabled = false;
});

/**
 * Devam Et butonuna tıklandığında
 */
continueBtn.addEventListener('click', () => {
    if (!selectedUniversity || !selectedDepartment) {
        return;
    }

    // Seçimleri localStorage'a kaydet
    localStorage.setItem('selectedUniversity', selectedUniversity);
    localStorage.setItem('selectedDepartment', selectedDepartment);

    // Ana ekrana yönlendir
    window.location.href = 'main.html';
});

/**
 * Seçilen üniversiteye göre bölümleri yükler
 */
function loadDepartments(universityId) {
    const university = MOCK_DATA.universities[universityId];

    if (!university || !university.departments) {
        resetDepartmentSelect();
        return;
    }

    // Bölüm select'ini temizle ve aktif et
    departmentSelect.innerHTML = '<option value="">Bölüm seçin...</option>';
    departmentSelect.disabled = false;

    // Bölümleri ekle
    Object.values(university.departments).forEach(department => {
        const option = document.createElement('option');
        option.value = department.id;
        option.textContent = department.name;
        departmentSelect.appendChild(option);
    });

    // Animasyon efekti
    departmentSelect.classList.add('loading');
    setTimeout(() => {
        departmentSelect.classList.remove('loading');
    }, 300);
}

/**
 * Bölüm seçimini sıfırlar
 */
function resetDepartmentSelect() {
    departmentSelect.innerHTML = '<option value="">Önce üniversite seçin...</option>';
    departmentSelect.disabled = true;
    selectedDepartment = null;
    continueBtn.disabled = true;
}

/**
 * Sayfa yüklendiğinde çalışır
 */
document.addEventListener('DOMContentLoaded', () => {
    // Önceki seçimleri kontrol et
    const savedUniversity = localStorage.getItem('selectedUniversity');
    const savedDepartment = localStorage.getItem('selectedDepartment');

    if (savedUniversity && MOCK_DATA.universities[savedUniversity]) {
        universitySelect.value = savedUniversity;
        selectedUniversity = savedUniversity;
        loadDepartments(savedUniversity);

        if (savedDepartment) {
            // Bölümlerin yüklenmesini bekle
            setTimeout(() => {
                departmentSelect.value = savedDepartment;
                selectedDepartment = savedDepartment;
                continueBtn.disabled = false;
            }, 100);
        }
    }
});

/**
 * Enter tuşu ile form gönderimi
 */
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !continueBtn.disabled) {
        continueBtn.click();
    }
});
