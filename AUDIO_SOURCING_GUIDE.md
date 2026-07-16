# PrimeMix Ses Edinme ve Lisans Rehberi

PrimeMix'in resmî dağıtımlarına yalnızca yeniden dağıtım hakkı açıkça doğrulanmış sesler eklenmelidir. Bir içeriğin ücretsiz, telifsiz veya royalty-free olarak tanıtılması tek başına uygulama içinde ham dosya olarak dağıtılabileceği anlamına gelmez.

## Kabul edilen içerikler

Başlangıç aşamasında yalnızca aşağıdaki içerikleri kabul edin:

1. Maximus Prime tarafından kaydedilmiş veya tamamen üretilmiş özgün sesler.
2. Açıkça `CC0 1.0` olarak lisanslanmış sesler.
3. Hak sahibinden uygulama içinde ticari kullanım ve yeniden dağıtım için yazılı izin alınmış sesler.

## Şimdilik kabul edilmeyen içerikler

- Kaynağı veya lisansı bulunamayan dosyalar
- Yalnızca “free”, “no copyright” veya “royalty-free” olarak tanıtılan içerikler
- CC BY-NC, CC BY-NC-SA ve CC BY-NC-ND içerikleri
- Pixabay, Mixkit veya benzeri özel lisanslı sitelerden alınan ve ham dosya olarak yeniden dağıtım izni kesinleşmemiş sesler
- YouTube videolarından veya MP3 indirme sitelerinden alınan sesler
- Ticari şarkı, film, oyun, televizyon veya uygulamalardan çıkarılmış sesler
- Lisans durumu kesinleşmemiş AI üretimi sesler

## Önerilen kaynaklar

### Kendi kayıtlarınız

En güvenli yöntem kendi ortam kayıtlarınızı oluşturmaktır:

- Yağmur, rüzgâr, dere ve deniz
- Kuşlar ve orman ortamı
- Klavye, kitap sayfası ve ev ortamları
- Fan, beyaz gürültü ve cihaz sesleri
- Kafe veya ofis ortamı

Kayıtta telifli müzik, televizyon sesi veya izinsiz tanınabilir insan konuşması bulunmamalıdır.

### Freesound

Adres: https://freesound.org/

Arama sırasında lisans filtresini yalnızca `Creative Commons 0` olarak ayarlayın. Her sesin kendi sayfasındaki lisansı ayrıca kontrol edin.

Lisans açıklaması: https://freesound.org/help/faq/

### OpenGameArt

Adres: https://opengameart.org/

Yalnızca açıkça `CC0` olarak işaretlenmiş sesleri değerlendirin. CC BY, CC BY-SA, GPL ve OGA-BY içeriklerini atıf sistemi tamamlanana kadar uygulamaya eklemeyin.

## Her ses için zorunlu kayıtlar

Bir ses indirildiğinde aşağıdakileri saklayın:

- Özgün dosya adı
- PrimeMix içindeki dosya adı
- Eser veya ses başlığı
- Üretici/yükleyen kullanıcı
- Kaynak sitesi
- Özgün içerik sayfasının bağlantısı
- Lisans adı ve sürümü
- Lisans bağlantısı
- İndirme tarihi
- Yapılan düzenlemeler
- Dosyanın SHA-256 özeti
- Kaynak sayfasının PDF veya ekran görüntüsü
- Gerekliyse hak sahibinden alınan yazılı izin

## Kabul süreci

1. Ses dosyasını doğrudan `PrimeMixSound` klasörüne koymayın.
2. Dosyayı geçici inceleme klasörüne indirin.
3. Kaynak sayfasını ve lisansı doğrulayın.
4. Lisans kanıtını `licenses/evidence/` klasörüne kaydedin.
5. `licenses/audio-licenses.json` dosyasına kayıt ekleyin.
6. Dosyanın SHA-256 özetini hesaplayıp kayda yazın.
7. Ses seviyesini normalleştirme veya kırpma gibi değişiklikleri kaydedin.
8. Yalnızca bütün alanlar tamamlandıktan sonra sesi `PrimeMixSound` klasörüne taşıyın.
9. Dağıtım oluşturmadan önce lisans envanteri ile ses klasörünü karşılaştırın.

## SHA-256 hesaplama

PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 ".\dosya-adi.ogg"
```

## Önerilen başlangıç hedefi

İlk resmî sesli sürüm için yüzlerce belirsiz dosya yerine 30–50 kaliteli ve eksiksiz belgelenmiş CC0 veya özgün kayıt kullanın.

## Önemli not

Bu belge çalışma ve risk azaltma rehberidir; hukuki görüş değildir. Lisansı açık olmayan bir içeriği yayınlamayın. Şüpheli durumlarda hak sahibinden açık yazılı izin alın veya içeriği dağıtımdan çıkarın.
