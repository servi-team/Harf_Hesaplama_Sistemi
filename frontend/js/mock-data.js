/**
 * Mock Data - Firebase entegrasyonu yapılana kadar kullanılacak örnek veriler
 * Gerçek Firebase bağlantısı yapıldığında bu dosya kaldırılacak
 */

const MOCK_DATA = {
    universities: {
        'itu': {
            id: 'itu',
            name: 'İstanbul Teknik Üniversitesi',
            departments: {
                'bilgisayar-muhendisligi': {
                    id: 'bilgisayar-muhendisligi',
                    name: 'Bilgisayar Mühendisliği'
                },
                'elektrik-elektronik': {
                    id: 'elektrik-elektronik',
                    name: 'Elektrik-Elektronik Mühendisliği'
                },
                'makine-muhendisligi': {
                    id: 'makine-muhendisligi',
                    name: 'Makine Mühendisliği'
                }
            }
        },
        'boun': {
            id: 'boun',
            name: 'Boğaziçi Üniversitesi',
            departments: {
                'bilgisayar-muhendisligi': {
                    id: 'bilgisayar-muhendisligi',
                    name: 'Bilgisayar Mühendisliği'
                },
                'endustri-muhendisligi': {
                    id: 'endustri-muhendisligi',
                    name: 'Endüstri Mühendisliği'
                }
            }
        },
        'odtu': {
            id: 'odtu',
            name: 'Orta Doğu Teknik Üniversitesi',
            departments: {
                'bilgisayar-muhendisligi': {
                    id: 'bilgisayar-muhendisligi',
                    name: 'Bilgisayar Mühendisliği'
                },
                'yazilim-muhendisligi': {
                    id: 'yazilim-muhendisligi',
                    name: 'Yazılım Mühendisliği'
                }
            }
        },
        'itu-kuzey': {
            id: 'itu-kuzey',
            name: 'İTÜ Kuzey Kıbrıs',
            departments: {
                'bilgisayar-muhendisligi': {
                    id: 'bilgisayar-muhendisligi',
                    name: 'Bilgisayar Mühendisliği'
                }
            }
        }
    },
    
    semesters: {
        'bilgisayar-muhendisligi': [
            {
                id: 'semester-1',
                semesterNumber: 1,
                semesterName: '1. Sınıf 1. Dönem',
                courses: [
                    {
                        id: 'yapisal-programlama',
                        courseCode: 'BLG101',
                        courseName: 'Yapısal Programlama',
                        credit: 4,
                        ects: 6
                    },
                    {
                        id: 'istatistik',
                        courseCode: 'MAT102',
                        courseName: 'İstatistik',
                        credit: 3,
                        ects: 5
                    },
                    {
                        id: 'fizik-1',
                        courseCode: 'FIZ101',
                        courseName: 'Fizik I',
                        credit: 4,
                        ects: 6
                    },
                    {
                        id: 'matematik-1',
                        courseCode: 'MAT101',
                        courseName: 'Matematik I',
                        credit: 4,
                        ects: 7
                    }
                ]
            },
            {
                id: 'semester-2',
                semesterNumber: 2,
                semesterName: '1. Sınıf 2. Dönem',
                courses: [
                    {
                        id: 'nesne-tabanli-programlama',
                        courseCode: 'BLG102',
                        courseName: 'Nesne Tabanlı Programlama',
                        credit: 4,
                        ects: 6
                    },
                    {
                        id: 'veri-yapilari',
                        courseCode: 'BLG103',
                        courseName: 'Veri Yapıları',
                        credit: 4,
                        ects: 6
                    },
                    {
                        id: 'matematik-2',
                        courseCode: 'MAT103',
                        courseName: 'Matematik II',
                        credit: 4,
                        ects: 7
                    }
                ]
            },
            {
                id: 'semester-3',
                semesterNumber: 3,
                semesterName: '2. Sınıf 1. Dönem',
                courses: [
                    {
                        id: 'algoritmalar',
                        courseCode: 'BLG201',
                        courseName: 'Algoritmalar',
                        credit: 4,
                        ects: 6
                    },
                    {
                        id: 'veritabani-sistemleri',
                        courseCode: 'BLG202',
                        courseName: 'Veritabanı Sistemleri',
                        credit: 3,
                        ects: 5
                    }
                ]
            }
        ]
    },
    
    offerings: {
        'yapisal-programlama': [
            {
                id: '2025-furkan-cakmaktas',
                instructorName: 'Furkan Çakmaktaş',
                year: 2025,
                isActive: true,
                gradingCriteria: [
                    { name: 'Vize 1', weight: 20, order: 1 },
                    { name: 'Vize 2', weight: 20, order: 2 },
                    { name: 'Lab', weight: 20, order: 3 },
                    { name: 'Final', weight: 40, order: 4 }
                ],
                gradingScale: [
                    { letterGrade: 'AA', minScore: 90, maxScore: 100, gradePoint: 4.0 },
                    { letterGrade: 'BA', minScore: 85, maxScore: 89, gradePoint: 3.5 },
                    { letterGrade: 'BB', minScore: 80, maxScore: 84, gradePoint: 3.0 },
                    { letterGrade: 'CB', minScore: 75, maxScore: 79, gradePoint: 2.5 },
                    { letterGrade: 'CC', minScore: 70, maxScore: 74, gradePoint: 2.0 },
                    { letterGrade: 'DC', minScore: 65, maxScore: 69, gradePoint: 1.5 },
                    { letterGrade: 'DD', minScore: 60, maxScore: 64, gradePoint: 1.0 },
                    { letterGrade: 'FD', minScore: 50, maxScore: 59, gradePoint: 0.5 },
                    { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0 }
                ]
            }
        ],
        'istatistik': [
            {
                id: '2025-ahmet-yilmaz',
                instructorName: 'Ahmet Yılmaz',
                year: 2025,
                isActive: true,
                gradingCriteria: [
                    { name: 'Vize', weight: 40, order: 1 },
                    { name: 'Final', weight: 60, order: 2 }
                ],
                gradingScale: [
                    { letterGrade: 'AA', minScore: 90, maxScore: 100, gradePoint: 4.0 },
                    { letterGrade: 'BA', minScore: 85, maxScore: 89, gradePoint: 3.5 },
                    { letterGrade: 'BB', minScore: 75, maxScore: 84, gradePoint: 3.0 },
                    { letterGrade: 'CB', minScore: 70, maxScore: 74, gradePoint: 2.5 },
                    { letterGrade: 'CC', minScore: 60, maxScore: 69, gradePoint: 2.0 },
                    { letterGrade: 'DC', minScore: 55, maxScore: 59, gradePoint: 1.5 },
                    { letterGrade: 'DD', minScore: 50, maxScore: 54, gradePoint: 1.0 },
                    { letterGrade: 'FD', minScore: 40, maxScore: 49, gradePoint: 0.5 },
                    { letterGrade: 'FF', minScore: 0, maxScore: 39, gradePoint: 0.0 }
                ]
            }
        ],
        'nesne-tabanli-programlama': [
            {
                id: '2025-mehmet-kaya',
                instructorName: 'Mehmet Kaya',
                year: 2025,
                isActive: true,
                gradingCriteria: [
                    { name: 'Vize', weight: 30, order: 1 },
                    { name: 'Proje', weight: 30, order: 2 },
                    { name: 'Final', weight: 40, order: 3 }
                ],
                gradingScale: [
                    { letterGrade: 'AA', minScore: 90, maxScore: 100, gradePoint: 4.0 },
                    { letterGrade: 'BA', minScore: 85, maxScore: 89, gradePoint: 3.5 },
                    { letterGrade: 'BB', minScore: 80, maxScore: 84, gradePoint: 3.0 },
                    { letterGrade: 'CB', minScore: 75, maxScore: 79, gradePoint: 2.5 },
                    { letterGrade: 'CC', minScore: 70, maxScore: 74, gradePoint: 2.0 },
                    { letterGrade: 'DC', minScore: 65, maxScore: 69, gradePoint: 1.5 },
                    { letterGrade: 'DD', minScore: 60, maxScore: 64, gradePoint: 1.0 },
                    { letterGrade: 'FD', minScore: 50, maxScore: 59, gradePoint: 0.5 },
                    { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0 }
                ]
            }
        ]
    }
};
