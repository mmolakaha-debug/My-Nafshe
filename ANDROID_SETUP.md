# ساخت اپ اندروید گام

این شاخه `android-app` برای تبدیل نسخه فعلی گام به اپ اندروید با Capacitor آماده شده است.

## کاری که آماده شده

- رابط فعلی سایت بدون بازنویسی از صفر وارد اپ می‌شود.
- LocalStorage فعلی حفظ می‌شود؛ بنابراین اطلاعات و تیک‌ها روی همان دستگاه باقی می‌مانند.
- نسخه وب/PWA فعلی هم حفظ می‌شود.
- شناسه اپ: `com.mynafshe.gam`
- نام اپ: `گام`
- برای ساخت APK نیازی به اجرای Android Studio روی کامپیوتر شخصی نیست.

## ساخت APK با GitHub Actions

فایل زیر اضافه شده است:

`.github/workflows/android-apk.yml`

این Workflow روی سرور GitHub:

1. کد پروژه را دریافت می‌کند.
2. Node و Java را آماده می‌کند.
3. وابستگی‌های Capacitor را نصب می‌کند.
4. فایل‌های وب را برای نسخه Android آماده می‌کند.
5. پروژه Android را با Capacitor می‌سازد.
6. APK آزمایشی را با Gradle تولید می‌کند.
7. فایل APK را به عنوان Artifact در همان اجرای Workflow قرار می‌دهد.

GitHub Actions برای Workflowها از فایل‌های داخل `.github/workflows` استفاده می‌کند و می‌تواند پروژه‌های Gradle را Build و Artifact تولید کند.

## روی GitHub چه کار کنی

1. وارد مخزن شو.
2. شاخه `android-app` را انتخاب کن.
3. از بخش **Actions** Workflow با نام **Build Android APK** را باز کن.
4. اگر دکمه **Run workflow** را دیدی، آن را اجرا کن.
5. بعد از اتمام موفق، از صفحه همان اجرای Workflow بخش **Artifacts**، فایل `gam-debug-apk` را دریافت کن.

اگر Actions برای مخزن فعال نباشد، اجرای Workflow شروع نمی‌شود؛ در این حالت ابتدا باید Actions را برای مخزن فعال کنی.

## راه‌اندازی محلی (اختیاری)

اگر بعداً خواستی روی کامپیوتر دیگری که Android Studio دارد کار کنی:

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

## بعد از هر تغییر در سایت

برای Build ابری، تغییرات را روی شاخه `android-app` Push کن تا Workflow اجرا شود.

برای Build محلی:

```bash
npx cap sync android
```

## وضعیت Sync بین گوشی و PC

نسخه فعلی دارای رابط Sync و فایل `sync.js` است، اما Sync ابری وابسته به تنظیمات backend است. LocalStorage به‌تنهایی بین دو دستگاه مشترک نیست.

مرحله بعدی پروژه این است که Sync را به‌صورت امن و پایدار تکمیل کنیم تا تغییرات گوشی و PC با اینترنت به یک منبع مشترک منتقل شوند.

## نکته

پوشه `android` عمداً داخل Git ذخیره نشده است؛ GitHub Actions آن را در زمان Build با Capacitor تولید می‌کند.
