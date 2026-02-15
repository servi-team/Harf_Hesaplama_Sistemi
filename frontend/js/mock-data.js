/**
 * Mock Data - Firebase entegrasyonu yapılana kadar kullanılacak örnek veriler
 * Gerçek Firebase bağlantısı yapıldığında bu dosya kaldırılacak
 * 
 * Yapı:
 *   universities → semesters → courses
 *   Her ders (course) için:
 *     - gradingCriteria[] → Değerlendirme Kriterleri (Vize/Final/Lab yüzdeleri)
 *     - gradeScales[]     → Harf Skalası (çan eğrisine göre değişen aralıklar + studentCount)
 *     - comments[]        → Yorumlar
 */

const MOCK_DATA = {
    universities: {
        'ytu': {
            id: 'ytu',
            name: 'Yıldız Teknik Üniversitesi',
            departments: {
                'bilgisayar-muhendisligi': {
                    id: 'bilgisayar-muhendisligi',
                    name: 'Bilgisayar Mühendisliği',
                    faculty: 'Elektrik-Elektronik Fakültesi'
                }
            }
        },
        'itu': {
            id: 'itu',
            name: 'İstanbul Teknik Üniversitesi',
            departments: {
                'bilgisayar-muhendisligi': {
                    id: 'bilgisayar-muhendisligi',
                    name: 'Bilgisayar Mühendisliği',
                    faculty: 'Bilgisayar ve Bilişim Fakültesi'
                },
                'elektrik-elektronik': {
                    id: 'elektrik-elektronik',
                    name: 'Elektrik-Elektronik Mühendisliği',
                    faculty: 'Elektrik-Elektronik Fakültesi'
                }
            }
        },
        'boun': {
            id: 'boun',
            name: 'Boğaziçi Üniversitesi',
            departments: {
                'bilgisayar-muhendisligi': {
                    id: 'bilgisayar-muhendisligi',
                    name: 'Bilgisayar Mühendisliği',
                    faculty: 'Mühendislik Fakültesi'
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
                        id: 'matematik-1',
                        courseCode: 'MAT101',
                        courseName: 'Matematik I',
                        credit: 4,
                        ects: 7
                    },
                    {
                        id: 'fizik-1',
                        courseCode: 'FIZ101',
                        courseName: 'Fizik I',
                        credit: 4,
                        ects: 6
                    },
                    {
                        id: 'istatistik',
                        courseCode: 'MAT102',
                        courseName: 'İstatistik',
                        credit: 3,
                        ects: 5
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

    // ==================== DEĞERLENDİRME KRİTERLERİ (GradingCriteria) ====================
    // Her ders için birden fazla kriter seti olabilir (farklı yıllar/hocalar)
    gradingCriteria: {
        'yapisal-programlama': [
            {
                id: 'yp-kriter-2025-cakmaktas',
                label: '2025 - Furkan Çakmaktaş',
                instructorName: 'Furkan Çakmaktaş',
                year: 2025,
                criteria: [
                    { name: 'Vize 1', weight: 20, order: 1 },
                    { name: 'Vize 2', weight: 20, order: 2 },
                    { name: 'Lab', weight: 20, order: 3 },
                    { name: 'Final', weight: 40, order: 4 }
                ]
            },
            {
                id: 'yp-kriter-2024-yilmaz',
                label: '2024 - Ahmet Yılmaz',
                instructorName: 'Ahmet Yılmaz',
                year: 2024,
                criteria: [
                    { name: 'Vize', weight: 30, order: 1 },
                    { name: 'Ödev', weight: 10, order: 2 },
                    { name: 'Final', weight: 60, order: 3 }
                ]
            },
            {
                id: 'yp-kriter-2023-cakmaktas',
                label: '2023 - Furkan Çakmaktaş',
                instructorName: 'Furkan Çakmaktaş',
                year: 2023,
                criteria: [
                    { name: 'Vize', weight: 30, order: 1 },
                    { name: 'Lab', weight: 30, order: 2 },
                    { name: 'Final', weight: 40, order: 3 }
                ]
            }
        ],
        'istatistik': [
            {
                id: 'ist-kriter-2025',
                label: '2025 - Mehmet Kaya',
                instructorName: 'Mehmet Kaya',
                year: 2025,
                criteria: [
                    { name: 'Vize', weight: 40, order: 1 },
                    { name: 'Final', weight: 60, order: 2 }
                ]
            }
        ],
        'nesne-tabanli-programlama': [
            {
                id: 'ntp-kriter-2025',
                label: '2025 - Mehmet Kaya',
                instructorName: 'Mehmet Kaya',
                year: 2025,
                criteria: [
                    { name: 'Vize', weight: 30, order: 1 },
                    { name: 'Proje', weight: 30, order: 2 },
                    { name: 'Final', weight: 40, order: 3 }
                ]
            }
        ]
    },

    // ==================== HARF SKALASI (GradeScale) ====================
    // Her ders için birden fazla skala olabilir (çan eğrisi yıla göre değişir)
    // studentCount: o notu kaç kişinin aldığını gösterir
    gradeScales: {
        'yapisal-programlama': [
            {
                id: 'yp-skala-2025-cakmaktas',
                label: '2025 - Furkan Çakmaktaş',
                instructorName: 'Furkan Çakmaktaş',
                year: 2025,
                totalStudents: 120,
                scale: [
                    { letterGrade: 'AA', minScore: 90, maxScore: 100, gradePoint: 4.0, studentCount: 8 },
                    { letterGrade: 'BA', minScore: 85, maxScore: 89, gradePoint: 3.5, studentCount: 12 },
                    { letterGrade: 'BB', minScore: 80, maxScore: 84, gradePoint: 3.0, studentCount: 18 },
                    { letterGrade: 'CB', minScore: 75, maxScore: 79, gradePoint: 2.5, studentCount: 22 },
                    { letterGrade: 'CC', minScore: 70, maxScore: 74, gradePoint: 2.0, studentCount: 20 },
                    { letterGrade: 'DC', minScore: 65, maxScore: 69, gradePoint: 1.5, studentCount: 15 },
                    { letterGrade: 'DD', minScore: 60, maxScore: 64, gradePoint: 1.0, studentCount: 10 },
                    { letterGrade: 'FD', minScore: 50, maxScore: 59, gradePoint: 0.5, studentCount: 8 },
                    { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0, studentCount: 7 }
                ]
            },
            {
                id: 'yp-skala-2024-yilmaz',
                label: '2024 - Ahmet Yılmaz',
                instructorName: 'Ahmet Yılmaz',
                year: 2024,
                totalStudents: 95,
                scale: [
                    { letterGrade: 'AA', minScore: 92, maxScore: 100, gradePoint: 4.0, studentCount: 5 },
                    { letterGrade: 'BA', minScore: 86, maxScore: 91, gradePoint: 3.5, studentCount: 8 },
                    { letterGrade: 'BB', minScore: 78, maxScore: 85, gradePoint: 3.0, studentCount: 14 },
                    { letterGrade: 'CB', minScore: 72, maxScore: 77, gradePoint: 2.5, studentCount: 18 },
                    { letterGrade: 'CC', minScore: 65, maxScore: 71, gradePoint: 2.0, studentCount: 20 },
                    { letterGrade: 'DC', minScore: 58, maxScore: 64, gradePoint: 1.5, studentCount: 12 },
                    { letterGrade: 'DD', minScore: 50, maxScore: 57, gradePoint: 1.0, studentCount: 8 },
                    { letterGrade: 'FD', minScore: 40, maxScore: 49, gradePoint: 0.5, studentCount: 5 },
                    { letterGrade: 'FF', minScore: 0, maxScore: 39, gradePoint: 0.0, studentCount: 5 }
                ]
            },
            {
                id: 'yp-skala-2023-cakmaktas',
                label: '2023 - Furkan Çakmaktaş',
                instructorName: 'Furkan Çakmaktaş',
                year: 2023,
                totalStudents: 110,
                scale: [
                    { letterGrade: 'AA', minScore: 88, maxScore: 100, gradePoint: 4.0, studentCount: 10 },
                    { letterGrade: 'BA', minScore: 82, maxScore: 87, gradePoint: 3.5, studentCount: 14 },
                    { letterGrade: 'BB', minScore: 76, maxScore: 81, gradePoint: 3.0, studentCount: 20 },
                    { letterGrade: 'CB', minScore: 70, maxScore: 75, gradePoint: 2.5, studentCount: 22 },
                    { letterGrade: 'CC', minScore: 64, maxScore: 69, gradePoint: 2.0, studentCount: 18 },
                    { letterGrade: 'DC', minScore: 58, maxScore: 63, gradePoint: 1.5, studentCount: 12 },
                    { letterGrade: 'DD', minScore: 52, maxScore: 57, gradePoint: 1.0, studentCount: 7 },
                    { letterGrade: 'FD', minScore: 40, maxScore: 51, gradePoint: 0.5, studentCount: 4 },
                    { letterGrade: 'FF', minScore: 0, maxScore: 39, gradePoint: 0.0, studentCount: 3 }
                ]
            }
        ],
        'istatistik': [
            {
                id: 'ist-skala-2025',
                label: '2025 - Mehmet Kaya',
                instructorName: 'Mehmet Kaya',
                year: 2025,
                totalStudents: 80,
                scale: [
                    { letterGrade: 'AA', minScore: 90, maxScore: 100, gradePoint: 4.0, studentCount: 6 },
                    { letterGrade: 'BA', minScore: 85, maxScore: 89, gradePoint: 3.5, studentCount: 9 },
                    { letterGrade: 'BB', minScore: 75, maxScore: 84, gradePoint: 3.0, studentCount: 14 },
                    { letterGrade: 'CB', minScore: 70, maxScore: 74, gradePoint: 2.5, studentCount: 16 },
                    { letterGrade: 'CC', minScore: 60, maxScore: 69, gradePoint: 2.0, studentCount: 15 },
                    { letterGrade: 'DC', minScore: 55, maxScore: 59, gradePoint: 1.5, studentCount: 8 },
                    { letterGrade: 'DD', minScore: 50, maxScore: 54, gradePoint: 1.0, studentCount: 5 },
                    { letterGrade: 'FD', minScore: 40, maxScore: 49, gradePoint: 0.5, studentCount: 4 },
                    { letterGrade: 'FF', minScore: 0, maxScore: 39, gradePoint: 0.0, studentCount: 3 }
                ]
            }
        ]
    },

    // ==================== YORUMLAR (Comments) ====================
    // status: 1 = görünür, 0 = şikayet edildi (admin incelecek), 2 = admin onayladı (bir daha şikayet edilemez)
    // likedBy / dislikedBy: mükerrer oylama engeli için kullanıcı ID listesi
    comments: {
        'yapisal-programlama': [
            {
                id: 'c1',
                userId: 'user-001',
                commentText: 'Furkan hocanın labları çok öğretici. Özellikle pointer konusundaki örnekler harika.',
                timestamp: '2025-01-15T14:30:00Z',
                editedAt: null,
                likeCount: 3,
                dislikeCount: 0,
                likedBy: ['user-002', 'user-003', 'user-004'],
                dislikedBy: [],
                status: 1,
                userGrade: 'BB',
                reportedBy: []
            },
            {
                id: 'c2',
                userId: 'user-002',
                commentText: 'Final sınavı çok zor olabiliyor, eski sınavlara mutlaka çalışın. Özellikle 2023 ve 2024 finallerini çözmenizi tavsiye ederim.',
                timestamp: '2025-01-20T09:15:00Z',
                editedAt: null,
                likeCount: 5,
                dislikeCount: 1,
                likedBy: ['user-001', 'user-003', 'user-004', 'user-005', 'user-006'],
                dislikedBy: ['user-007'],
                status: 2,
                userGrade: 'BA',
                reportedBy: []
            },
            {
                id: 'c3',
                userId: 'user-003',
                commentText: 'Vize 2 genelde Vize 1\'den daha kolay oluyor. Lab notları da ortalamayı kurtarıyor.',
                timestamp: '2025-02-01T16:45:00Z',
                editedAt: '2025-02-02T10:00:00Z',
                likeCount: 2,
                dislikeCount: 1,
                likedBy: ['user-001', 'user-004'],
                dislikedBy: ['user-005'],
                status: 1,
                userGrade: 'CB',
                reportedBy: []
            },
            {
                id: 'c4',
                userId: 'user-004',
                commentText: 'Çan eğrisi her yıl farklı olabiliyor, 2024\'te daha geniş aralıklar vardı.',
                timestamp: '2025-02-10T11:20:00Z',
                editedAt: null,
                likeCount: 1,
                dislikeCount: 0,
                likedBy: ['user-002'],
                dislikedBy: [],
                status: 1,
                userGrade: null,
                reportedBy: []
            },
            {
                id: 'c5',
                userId: 'user-005',
                commentText: 'Bu dersi asla almayın çok kötü!',
                timestamp: '2025-02-12T08:30:00Z',
                editedAt: null,
                likeCount: 0,
                dislikeCount: 3,
                likedBy: [],
                dislikedBy: ['user-001', 'user-002', 'user-003'],
                status: 0,
                userGrade: 'FF',
                reportedBy: ['user-001', 'user-002']
            },
            {
                id: 'c6',
                userId: 'user-006',
                commentText: 'Dersin projesi çok eğlenceli. C ile linked list yazıyorsunuz, çok şey öğreniyorsunuz.',
                timestamp: '2025-02-14T19:00:00Z',
                editedAt: null,
                likeCount: 4,
                dislikeCount: 0,
                likedBy: ['user-001', 'user-002', 'user-003', 'user-004'],
                dislikedBy: [],
                status: 1,
                userGrade: 'AA',
                reportedBy: []
            }
        ]
    },

    // ==================== KULLANICILAR (Mock Auth) ====================
    // Geçici kullanıcı veritabanı — backend olmadan test için
    mockUsers: {
        'superadmin-001': {
            userId: 'superadmin-001',
            userName: 'Sistem Yöneticisi',
            email: 'superadmin@harf.edu.tr',
            password: 'super123',
            role: 'superadmin',   // Tüm yetkilere sahip
            registeredAt: '2024-01-01T00:00:00Z'
        },
        'admin-001': {
            userId: 'admin-001',
            userName: 'Dr. Emre K.',
            email: 'admin@ytu.edu.tr',
            password: 'admin123',
            role: 'admin',        // Yorum moderasyonu, veri girişi
            registeredAt: '2024-06-15T10:00:00Z'
        },
        'user-001': {
            userId: 'user-001',
            userName: 'Ali K.',
            email: 'ali@std.ytu.edu.tr',
            password: '123456',
            role: 'student',
            registeredAt: '2024-09-01T08:00:00Z'
        },
        'user-002': {
            userId: 'user-002',
            userName: 'Zeynep A.',
            email: 'zeynep@std.ytu.edu.tr',
            password: '123456',
            role: 'student',
            registeredAt: '2024-09-01T08:30:00Z'
        },
        'user-003': {
            userId: 'user-003',
            userName: 'Mehmet D.',
            email: 'mehmet@std.ytu.edu.tr',
            password: '123456',
            role: 'student',
            registeredAt: '2024-09-02T09:00:00Z'
        }
    },

    // Şu an oturum açmış kullanıcı (localStorage'dan okunacak, yoksa misafir)
    // Test için: 'user-001', 'admin-001', 'superadmin-001' veya null (misafir)
    mockCurrentUser: null,  // null = misafir

    // Varsayılan harf skalası (hiçbir skala tanımlı değilse otomatik uygulanır)
    defaultGradeScale: [
        { letterGrade: 'AA', minScore: 90, maxScore: 100, gradePoint: 4.0, studentCount: null },
        { letterGrade: 'BA', minScore: 85, maxScore: 89, gradePoint: 3.5, studentCount: null },
        { letterGrade: 'BB', minScore: 80, maxScore: 84, gradePoint: 3.0, studentCount: null },
        { letterGrade: 'CB', minScore: 75, maxScore: 79, gradePoint: 2.5, studentCount: null },
        { letterGrade: 'CC', minScore: 70, maxScore: 74, gradePoint: 2.0, studentCount: null },
        { letterGrade: 'DC', minScore: 65, maxScore: 69, gradePoint: 1.5, studentCount: null },
        { letterGrade: 'DD', minScore: 60, maxScore: 64, gradePoint: 1.0, studentCount: null },
        { letterGrade: 'FD', minScore: 50, maxScore: 59, gradePoint: 0.5, studentCount: null },
        { letterGrade: 'FF', minScore: 0, maxScore: 49, gradePoint: 0.0, studentCount: null }
    ]
};
