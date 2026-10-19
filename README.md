# FOX FILE STUDIO

Dosya formatı dönüştürme ve PDF düzenleme araçlarını tek bir responsive web arayüzünde birleştiren başlangıç projesi.

## Çalıştırma
1. ZIP dosyasını çıkar.
2. `index.html` dosyasını Chrome veya Edge ile aç. Daha iyi uyumluluk için klasörde `python -m http.server 8000` çalıştırıp `http://localhost:8000` adresine gidebilirsin.
3. İlk kullanımda CDN kütüphaneleri için internet gerekir.

## Desteklenen temel işlemler
- JPG/PNG görsellerini PDF'e dönüştürme
- PDF'in ilk sayfasını PNG/JPG/WEBP olarak dışa aktarma
- JPG/PNG/WEBP görselleri arasında dönüştürme
- TXT ↔ HTML ve TXT/HTML → PDF dönüşümleri
- PDF metinlerini TXT olarak çıkarma (metin katmanı bulunan PDF'lerde)
- PDF görüntüleme, sayfa gezinme, yakınlaştırma
- PDF üzerine metin, çizim ve vurgulama ekleyip yeni PDF indirme
- Koyu/açık tema ve mobil uyum

## Sınırlar
- Bu demo tüm dosya formatlarını birbirine dönüştüren evrensel bir motor değildir.
- PDF → PNG/JPG/WEBP dönüşümü ilk sayfayı dışa aktarır.
- PDF → TXT metin katmanı olan belgelerde çalışır; taranmış belgeler için OCR eklenmelidir.
- DOCX → PDF, PDF → DOCX, XLSX ve PPTX dönüşümleri bu sürümde desteklenmez.
- PDF düzenleyici mevcut metni doğrudan yeniden yazmaz; yeni metin/işaretler ekler.
- Dosyalar uygulama tarafından sunucuya yüklenmez; tarayıcıda işlenir. Harici CDN kütüphaneleri internet bağlantısı ister.
