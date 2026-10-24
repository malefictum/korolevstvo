// Сервис-воркер игры. Генерируется build.py из store/sw.template.js — правьте шаблон.
// Сборка 24101934. Новая сборка = новое имя кэша, старый удаляется.
var CACHE = 'korolevstvo-24101934';
var CORE = ["./","index.html","manifest.webmanifest","img/fonts/alegreya-italic.woff2","img/fonts/alegreya-sc-bold.woff2","img/fonts/alegreya-sc.woff2","img/fonts/alegreya.woff2","img/fonts/ruslan.woff2","img/ui/bg_menu.webp","img/ui/corner.webp","img/ui/cover.webp","img/ui/econ_mine_summer.webp","img/ui/econ_mine_winter.webp","img/ui/econ_quarry_summer.webp","img/ui/econ_quarry_winter.webp","img/ui/iron.webp","img/ui/leather.webp","img/ui/oak.webp","img/ui/parchment.webp","img/ui/scene_church.webp","img/ui/scene_find.webp","img/ui/scene_harbor.webp","img/ui/scene_merchants.webp","img/ui/scene_prayer.webp","img/ui/scene_procession.webp","img/ui/scene_trade.webp","img/ui/sea_bg.webp","img/ui/seal.webp","img/ui/terem_1.webp","img/ui/terem_2.webp","img/ui/terem_3.webp","img/ui/terem_4.webp","img/appicons/icon-150.png","img/appicons/icon-180.png","img/appicons/icon-192.png","img/appicons/icon-32.png","img/appicons/icon-44.png","img/appicons/icon-512.png","img/appicons/maskable-512.png","img/appicons/splash-620x300.png","img/appicons/wide-310x150.png"];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('korolevstvo-') === 0 && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return; // PeerJS, cdn — мимо
  // Страница — сперва из сети (чтобы не застревать на старой сборке), без сети — из кэша.
  if (r.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(r.url).pathname)) {
    e.respondWith(fetch(r).then(function (res) {
      var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); return res;
    }).catch(function () { return caches.match(r).then(function (m) { return m || caches.match('index.html'); }); }));
    return;
  }
  // Картинки и звуки — из кэша, недостающее (портреты, столы) докладывается по мере игры.
  e.respondWith(caches.match(r).then(function (m) {
    return m || fetch(r).then(function (res) {
      if (res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); }
      return res;
    });
  }));
});
