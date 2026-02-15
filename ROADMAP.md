# 🗺️ Harf Hesaplama Sistemi — Yol Haritası (Revize Edilmiş)

> **Son Güncelleme:** 15 Şubat 2026  
> **Durum:** Planlama Aşaması

---

## 🎯 Proje Vizyonu

Üniversite öğrencilerinin **not hesaplayabileceği**, dersler hakkında **yorum yapabileceği** ve hocaya özel kriterleri görebileceği; 3 farklı kullanıcı tipi (Misafir, Öğrenci, Admin) için özelleştirilmiş, modern bir web platformu.

---

## � Ders Veri Modeli

Her ders objesi içinde **iki alt koleksiyon** ve bir **yorumlar koleksiyonu** bulunur:

```
Ders (Course)
├── 📊 Değerlendirme Kriterleri (GradingCriteria)
│   └── Vize: %30, Final: %40, Lab: %30 ...
│   └── ❌ Yoksa → Kullanıcı kendi kriterlerini oluşturur
│
├── 🔤 Harf Skalası (GradeScale)
│   └── AA: 90-100, BA: 85-89, BB: 80-84 ...
│   └── ❌ Yoksa → Varsayılan skala otomatik uygulanır
│
└── 💬 Yorumlar (Comments)
    └── commentText, likeCount, dislikeCount, userGrade
    └── status: 1=görünür, 0=şikayet, 2=admin onaylı
```

| Terim | Açıklama | Kod Adı |
|-------|----------|---------|
| **Değerlendirme Kriterleri** | Vize, Final, Lab gibi not bileşenlerinin yüzdelik dağılımı | `GradingCriteria` |
| **Harf Skalası** | Çan eğrisine göre harf notlarının puan aralıkları (yıla/hocaya göre değişir) | `GradeScale` |
| **Yorumlar** | Derse ait öğrenci yorumları ve oylamaları | `Comments` |

## �🔧 Kesinleşmiş Teknik Kararlar

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Frontend | **Vanilla JS** | Hızlı, performanslı ve mevcut kodla uyumlu |
| Backend | **Java 17 + Spring Boot** | LTS, stabil, tam topluluk desteği |
| Veritabanı (İlişkisel) | **MySQL** | Fakülte/Bölüm/Ders hiyerarşisi için |
| Veritabanı (NoSQL) | **Firebase Firestore** | Yorumlar ve sosyal veriler için |
| Kimlik Doğrulama | **Firebase Auth** | Google ve E-posta/Şifre ile giriş |
| Build & Deploy | **Maven + Docker** | Standart Java build ve paketleme |

---

## 🏗️ Hedef Mimari ve Sayfa Akışı

### 1. Karşılama Ekranı (Landing)
Kullanıcı siteye girdiğinde 3 seçenekle karşılaşacak:
1.  **Misafir Girişi:** Sadece not hesaplama ve yorum okuma yetkisi.
2.  **Öğrenci Girişi:** Hesaplama, yorum yapma, like/dislike atma yetkisi.
3.  **Admin Girişi:** Üniversite, fakülte, bölüm ve ders verilerini yönetme yetkisi.

### 2. Seçim Sihirbazı (Wizard)
Sırasıyla açılan/seçilen hiyerarşik yapı:
`Üniversite Seçimi` → `Fakülte Seçimi` → `Bölüm Seçimi` → **Ana Sayfaya Yönlendirme**

### 3. Ana Sayfa (3 Sütunlu Layout)

```
┌──────────────────────────────────────────────────────────┐
│  HEADER (Logo, Genel Ort., Kullanıcı, Çıkış)          │
├─────────────────┬────────────────────┬───────────────────┤
│    SOL PANEL    │    ORTA PANEL      │    SAĞ PANEL      │
│ (Ders Listesi)  │  (Hesaplama &      │                   │
│                 │   Detaylar)        │ ┌───────────────┐ │
│ • Dönemler      │ ┌────────────────┐ │ │ HARF SKALASI  │ │
│   (Akordiyon)   │ │ DEĞERLENDİRME  │ │ │ AA: 90-100 █8│ │
│ • Ders Arama    │ │ KRİTERİ SEÇ   │ │ │ BA: 85-89 █12│ │
│ • Ders [AA▼]    │ └────────────────┘ │ │ ...           │ │
│ • Ders [—▼]     │ ┌────────────────┐ │ └───────────────┘ │
│                 │ │ HARF SKALASI  │ │ ┌───────────────┐ │
│                 │ │ SEÇ           │ │ │ YORUMLAR      │ │
│                 │ └────────────────┘ │ │ (Like-Dislike)│ │
│                 │ ┌────────────────┐ │ │ Yorum Ekle    │ │
│                 │ │  HESAPLAMA     │ │ └───────────────┘ │
│                 │ │  Ortalama: 85  │ │                   │
│                 │ │  Harf: BA      │ │                   │
│                 │ └────────────────┘ │                   │
└─────────────────┴────────────────────┴───────────────────┘
```
> **Not:** Sol panelde her dersin yanında harf notu seçimi dropdown’ı bulunur. Sağ panel ikiye bölündü: üstte **Harf Skalası** (studentCount dağılım barlarıyla), altta **Yorumlar**.
> Orta panelde **Değerlendirme Kriteri Seç** ve **Harf Skalası Seç** dropdown’ları ile yıla/hocaya göre veri yüklenir.

---

## 📅 Geliştirme Fazları

### 🔵 Faz 1 — Frontend Revizyonu ve Yeni Akış
> **Hedef:** Yeni sayfa akışını ve 3 sütunlu yapıyı oluşturmak.

- [ ] **1.1 Karşılama Ekranı:** 3 kartlı giriş tipi seçim ekranı tasarımı (`landing.html`).
- [ ] **1.2 Seçim Sihirbazı:** Üniv → Fakülte → Bölüm zincirleme seçim mantığı.
- [ ] **1.3 Ana Sayfa Layout:** 3 sütunlu Grid yapısı (`main-screen.css`).
    - **Sol:** Ders ağacı (TreeView/Accordion) + her dersin yanında harf notu dropdown’ı.
    - **Orta:** Değerlendirme Kriteri Seç + Harf Skalası Seç dropdown’ları + Hesaplama sonucu.
    - **Sağ (Üst):** Harf Skalası (studentCount dağılım barlarıyla) — ders seçildiğinde aktif.
    - **Sağ (Alt):** Yorumlar — derse ait yorum listesi.

### 🟢 Faz 2 — Java Spring Boot Backend ve MySQL
> **Hedef:** Veri hiyerarşisini ve hesaplama parametrelerini sunmak.

- [ ] **2.1 Veritabanı Şeması (MySQL):**
    - `universities` (id, name)
    - `faculties` (id, university_id, name)
    - `departments` (id, faculty_id, name)
    - `courses` (id, department_id, semester, name, credit, ects)
    - `grading_criteria` (id, course_id, name, weight, order) — Değerlendirme Kriterleri
    - `grade_scales` (id, course_id, letter_grade, min_score, max_score, grade_point) — Harf Skalası
- [ ] **2.2 API Endpoint'leri:**
    - `/api/public/universities` ... `/departments` (Seçim sihirbazı için)
    - `/api/public/courses/{id}/criteria` (Değerlendirme Kriterleri)
    - `/api/public/courses/{id}/scale` (Harf Skalası — yoksa varsayılan döner)
- [ ] **2.3 Admin API:**
    - Veri girişi için CRUD endpoint'leri (Sadece Admin yetkili).

### 🟡 Faz 3 — Yorum Sistemi ve Sıralama Algoritması
> **Hedef:** Sosyal etkileşim, moderasyon ve yorum sıralama mantığı.

- [x] **3.1 Yorum Veri Şeması:** ✅ (`mock-data.js` + `comments.js`)
    - `courses/{courseId}/comments` alt koleksiyonu:
    ```
    {
      userId,          // Kullanıcı ID
      userName,        // Görünen ad
      commentText,     // Yorum metni
      timestamp,       // Yazılma tarihi
      editedAt,        // Düzenleme tarihi (null = düzenlenmedi)
      likeCount,       // Beğeni sayısı
      dislikeCount,    // Beğenmeme sayısı
      likedBy[],       // Like atan kullanıcı ID'leri (mükerrer engeli)
      dislikedBy[],    // Dislike atan kullanıcı ID'leri (mükerrer engeli)
      status,          // 1=görünür, 0=şikayet edildi, 2=admin onayladı
      userGrade,       // Yorumcunun aldığı harf (güvenilirlik göstergesi)
      reportedBy[]     // Şikayet eden kullanıcı ID'leri
    }
    ```
- [x] **3.2 Status Moderasyon Akışı:** ✅ (Frontend'de uygulandı)
    - `status: 1` → Yorum görünür, şikayet edilebilir.
    - `status: 0` → Kullanıcı şikayet etti, admin paneline düşer. Kullanıcıya gizlenir.
    - Admin **onaylarsa** → `status: 2` (bir daha şikayet edilemez, yeşil ✓ rozeti).
    - Admin **uygunsuz bulursa** → Yorum silinir.
- [x] **3.3 Yorum Ekleme:** ✅ Yorum formu ve `submitComment` fonksiyonu.
- [x] **3.4 Yorum Düzenleme:** ✅ Kullanıcı kendi yorumunu düzenleyebilir (`editedAt` güncellenir).
- [x] **3.5 Oylama Sistemi:** ✅ Like/Dislike toggle, sayaç güncelleme, mükerrer engeli (`likedBy`/`dislikedBy`).
- [x] **3.6 Sıralama Algoritması:** ✅ Score (🔥) ve Yeni (🕐) modları arası geçiş.
    - `Score = likeCount - dislikeCount`
    - Sıralama: `ORDER BY score DESC, timestamp DESC`
- [x] **3.7 Misafir Kısıtlaması:** ✅ Misafirler yorumları okuyabilir ama like/dislike/şikayet/yorum yapmaya çalışınca kayıt sayfasına (`index.html`) yönlendirilir.
- [x] **3.8 Kullanıcı Notu Göstergesi:** ✅ `userGrade` verisi saklanır ama kullanıcı isteğiyle gizlendi (rozet gösterilmiyor).

### 🟠 Faz 4 — Admin Paneli
> **Hedef:** Sisteme yeni üniversite/bölüm/ders eklemek için arayüz.

- [x] **4.1 Admin Girişi:** ✅ Role-based kullanıcı girişi (öğrenci/admin/superadmin).
- [x] **4.2 Veri Yönetim Ekranları:** ✅ Modal tabanlı Üniversite/Fakülte/Bölüm/Ders ekleme, onay/red sistemi.
- [x] **4.3 Kriter/Skala Editörü:** ✅ Değerlendirme Kriterleri ve Harf Skalası verilerini girme (dinamik form).

### 🔴 Faz 5 — Entegrasyon ve Deploy
> **Hedef:** Sistemi canlıya alma.

- [ ] **5.1 Dockerize:** Backend ve MySQL'in container haline getirilmesi.
- [ ] **5.2 Firebase Hosting:** Frontend'in deploy edilmesi.
- [ ] **5.3 Güvenlik Testleri:** Yetkisiz erişim kontrolleri.

---

## ⏱️ Tahmini Zaman Çizelgesi

| Hafta | Odak | Yapılacaklar |
|-------|------|--------------|
| **1. Hafta** | Frontend | Yeni Landing Page, Seçim Sihirbazı, 3 Sütunlu Layout |
| **2. Hafta** | Backend | Spring Boot kurulumu, MySQL Şeması, Veri Girişi API'leri |
| **3. Hafta** | Entegrasyon | Frontend-Backend bağlantısı, Hesaplama Motoru |
| **4. Hafta** | Sosyal | Yorum sistemi, Like/Dislike, Sıralama Algoritması |
| **5. Hafta** | Admin & Auth | Admin paneli, Giriş yetkilendirmeleri |
| **6. Hafta** | Deploy | Docker, VPS/Cloud kurulumu, Testler |

---

## 🚀 Başlangıç

Onayınızla birlikte **Faz 1 (Frontend Revizyonu)** ile başlayarak şu anki yapıyı yeni akışa (Landing -> Seçim -> 3 Sütun) dönüştürebilirim.
