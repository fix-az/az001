const CACHE_NAME = 'poker-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', // 替换成你的CSS文件名
  '/script.js', // 替换成你的JS文件名
  '/icon-192.png',
  '/icon-512.png'
];

// 安装时缓存所有资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 拦截请求，优先使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
