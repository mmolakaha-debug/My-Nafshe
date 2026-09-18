/* Service Worker — برنامه را آفلاین قابل استفاده می‌کند.
   هر بار که فایل‌ها را عوض کردی، فقط شماره CACHE را یکی زیاد کن
   تا نسخه جدید برای کاربر لود شود. */

const CACHE = "roadmap-v2";

const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./images/icon-192.png",
  "./images/icon-512.png",
  "./images/icon-maskable-512.png"
];

// مرحله نصب: فایل‌های اصلی در حافظه ذخیره می‌شوند
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// مرحله فعال‌سازی: کش‌های قدیمی پاک می‌شوند
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// درخواست‌ها: اول از کش، اگر نبود از اینترنت
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => {
            try { cache.put(event.request, copy); } catch (e) { /* نادیده */ }
          });
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
