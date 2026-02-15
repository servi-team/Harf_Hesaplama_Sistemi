/**
 * Seçim Sihirbazı (Wizard) Mantığı
 * Üniversite -> Fakülte -> Bölüm
 * Fakülte verisi MOCK_DATA.faculties'den okunur
 */

let currentStep = 1;
let selectedUniversity = null;
let selectedFaculty = null;
let selectedDepartment = null;


document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateUI();
});

function setupEventListeners() {
    // Üniversite seçimi
    document.getElementById('university-select').addEventListener('change', (e) => {
        selectedUniversity = e.target.value;
        selectedFaculty = null;
        selectedDepartment = null;

        if (selectedUniversity) {
            loadFaculties(selectedUniversity);
            goToStep(2);
        }
    });

    // Fakülte seçimi
    document.getElementById('faculty-select').addEventListener('change', (e) => {
        selectedFaculty = e.target.value;
        selectedDepartment = null;

        if (selectedFaculty) {
            loadDepartments(selectedUniversity, selectedFaculty);
            goToStep(3);
        }
    });

    // Bölüm seçimi
    document.getElementById('department-select').addEventListener('change', (e) => {
        selectedDepartment = e.target.value;
        document.getElementById('next-btn').disabled = !selectedDepartment;
    });

    // Devam Et butonu
    document.getElementById('next-btn').addEventListener('click', () => {
        if (selectedUniversity && selectedDepartment) {
            // Seçimleri kaydet
            localStorage.setItem('selectedUniversity', selectedUniversity);
            localStorage.setItem('selectedDepartment', selectedDepartment);

            // Ana sayfaya yönlendir
            window.location.href = 'main.html';
        }
    });
}

function loadFaculties(uniId) {
    const facultySelect = document.getElementById('faculty-select');
    facultySelect.innerHTML = '<option value="">Fakülte Seçiniz...</option>';

    const faculties = MOCK_DATA.faculties[uniId] || [];
    faculties.forEach(fac => {
        const option = document.createElement('option');
        option.value = fac.id;
        option.textContent = fac.name;
        facultySelect.appendChild(option);
    });
}

function loadDepartments(uniId, facultyId) {
    const deptSelect = document.getElementById('department-select');
    deptSelect.innerHTML = '<option value="">Bölüm Seçiniz...</option>';

    const faculties = MOCK_DATA.faculties[uniId] || [];
    const faculty = faculties.find(f => f.id === facultyId);

    if (faculty && MOCK_DATA.universities[uniId]) {
        const uniDepts = MOCK_DATA.universities[uniId].departments;

        (faculty.departmentIds || []).forEach(deptId => {
            const deptInfo = uniDepts[deptId];
            if (deptInfo) {
                const option = document.createElement('option');
                option.value = deptId;
                option.textContent = deptInfo.name;
                deptSelect.appendChild(option);
            }
        });
    }
}

function goToStep(step) {
    currentStep = step;
    updateUI();
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
}

function updateUI() {
    // Step Indicators
    for (let i = 1; i <= 3; i++) {
        const el = document.getElementById(`step-indicator-${i}`);
        if (i === currentStep) {
            el.className = 'step active';
        } else if (i < currentStep) {
            el.className = 'step completed';
            el.innerHTML = '✓';
        } else {
            el.className = 'step';
            el.innerHTML = i;
        }
    }

    // Step Contents
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${currentStep}`).classList.add('active');

    // Başlık güncelleme
    const titles = [
        "Lütfen üniversitenizi seçin",
        "Fakültenizi seçin",
        "Bölümünüzü seçin"
    ];
    document.getElementById('step-title').textContent = titles[currentStep - 1];

    // Geri butonları
    const backBtns = document.querySelectorAll('.btn-back-step');
    backBtns.forEach(btn => btn.style.display = 'block'); // Basitlik için görünür yapıyoruz, CSS ile gizlenebilir
}

// Global scope'a ekle (HTML'den çağrılabilmesi için)
window.prevStep = prevStep;
