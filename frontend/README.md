# 🎓 Üniversite Not Hesaplama Sistemi

Modern ve kullanıcı dostu bir web uygulaması ile üniversite not ortalamalarınızı kolayca hesaplayın!

## ✨ Özellikler

### ✅ Tamamlanan Özellikler

- **🏛️ Üniversite ve Bölüm Seçimi**
  - Dinamik bölüm yükleme
  - localStorage ile seçim hatırlama
  - Modern ve şık arayüz

- **📚 Dönem Bazlı Ders Listesi**
  - Akordiyon (toggle) yapısı
  - Tüm dönemler organize edilmiş
  - Hızlı harf notu seçimi

- **🎯 Sürükle-Bırak Sistemi**
  - Dersleri sağ panele sürükleyin
  - Veya tıklayarak seçin
  - Akıcı animasyonlar

- **📊 İki Hesaplama Modu**
  - **Mod A - Tanımlı Hoca:** Hocanın belirlediği kriterlere göre hesaplama
  - **Mod B - Manuel:** Kendi kriterlerinizi oluşturun

- **🔢 Otomatik GPA Hesaplama**
  - Gerçek zamanlı ortalama güncelleme
  - Tüm seçili dersler dahil
  - 4.0 skalasında hesaplama

## 🚀 Kullanım

### Başlangıç

1. `index.html` dosyasını tarayıcınızda açın
2. Üniversitenizi seçin
3. Bölümünüzü seçin
4. **Devam Et** butonuna tıklayın

### Ders Notu Hesaplama

#### Yöntem 1: Hızlı Harf Notu Seçimi
- Sol panelde her dersin yanındaki dropdown'dan harf notunu seçin
- Genel ortalamanız otomatik güncellenir

#### Yöntem 2: Detaylı Hesaplama (Mod A - Tanımlı Hoca)
1. Bir dersi sağ panele sürükleyin veya tıklayın
2. Hoca ve yıl seçin
3. Vize, final vb. notlarınızı girin
4. **Hesapla** butonuna tıklayın
5. Sonucu görün ve kaydedin

#### Yöntem 3: Manuel Hesaplama (Mod B)
1. Bir dersi sağ panele sürükleyin
2. **Manuel Hesaplama** sekmesine geçin
3. **+ Kriter Ekle** ile değerlendirme kriterleri oluşturun
4. Her kriter için ad, ağırlık (%) ve not girin
5. Toplam ağırlığın 100% olduğundan emin olun
6. **Hesapla** butonuna tıklayın

## 📁 Proje Yapısı

```
frontend/
├── index.html              # Giriş ekranı
├── main.html               # Ana ekran (ders listesi + hesaplama)
├── css/
│   ├── main.css           # Temel stiller ve değişkenler
│   ├── main-screen.css    # Ana ekran düzeni
│   └── detail-panel.css   # Sağ panel detay stilleri
└── js/
    ├── mock-data.js       # Örnek veriler (Firebase öncesi)
    ├── index.js           # Giriş ekranı mantığı
    ├── main.js            # Ana ekran ve GPA hesaplama
    ├── dragdrop.js        # Sürükle-bırak sistemi
    └── calculator.js      # Not hesaplama modülleri
```

## 🎨 Tasarım Özellikleri

- **Modern Dark Theme** - Göz yormayan koyu tema
- **Gradient Renkler** - Canlı ve profesyonel görünüm
- **Smooth Animasyonlar** - Akıcı geçişler ve hover efektleri
- **Responsive Tasarım** - Mobil, tablet ve desktop uyumlu
- **Inter Font** - Modern ve okunabilir tipografi

## 🔮 Gelecek Özellikler

- [ ] Firebase Firestore entegrasyonu
- [ ] Kullanıcı girişi (Firebase Authentication)
- [ ] Gerçek zamanlı veri senkronizasyonu
- [ ] Transkript PDF çıktısı
- [ ] Ders bazlı istatistikler
- [ ] Dönem karşılaştırma grafikleri

## 🛠️ Teknolojiler

- **HTML5** - Semantik yapı
- **CSS3** - Modern stiller, Grid, Flexbox
- **Vanilla JavaScript** - Framework'siz, saf JS
- **Google Fonts (Inter)** - Premium tipografi

## 📝 Notlar

- Veriler şu an localStorage'da saklanıyor
- Firebase entegrasyonu sonradan eklenecek
- Mock data kullanılıyor (gerçek veritabanı bekleniyor)

## 🎯 Harf Notu Skalası

| Harf | Puan Aralığı | Katsayı |
|------|--------------|---------|
| AA   | 90-100       | 4.0     |
| BA   | 85-89        | 3.5     |
| BB   | 80-84        | 3.0     |
| CB   | 75-79        | 2.5     |
| CC   | 70-74        | 2.0     |
| DC   | 65-69        | 1.5     |
| DD   | 60-64        | 1.0     |
| FD   | 50-59        | 0.5     |
| FF   | 0-49         | 0.0     |

## 💡 İpuçları

- Dönemleri açmak için dönem başlığına tıklayın
- Dersleri sürüklemek için ⋮⋮ işaretini kullanın
- Manuel modda ağırlıkların toplamı mutlaka 100 olmalı
- Hesaplanan notları "Notu Kaydet" ile listeye ekleyin

## 🚀 Canlı Demo

Projeyi kullanmak için `index.html` dosyasını tarayıcınızda açmanız yeterli!

---

**Geliştirici Notu:** Bu proje Firebase entegrasyonu için hazır. Backend bağlantısı yapıldığında `mock-data.js` dosyası kaldırılacak ve gerçek veritabanı kullanılacak.
