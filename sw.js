/* Donjon & Chaton — service worker : l’app fonctionne entièrement hors-ligne.
   Pense à incrémenter CACHE à chaque modification des fichiers listés. */

const CACHE = 'donjon-chaton-v3';

/* Uniquement la coquille de l'application : quelques dizaines de Ko.
   Les images de jeu ne sont PAS ici — elles vivent en IndexedDB (voir js/images.js),
   ce qui les met à l'abri du nettoyage de cache et des coupures de réseau. */
const FICHIERS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/data.js',
  './js/store.js',
  './js/images.js',
  './manifest.webmanifest',
  './icons/icone.svg',
  './icons/icone-192.png',
  './icons/icone-512.png',
  './icons/icone-masquable-192.png',
  './icons/icone-masquable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache d’abord : instantané et hors-ligne. Le réseau ne sert qu’au premier chargement
   et à rafraîchir le cache en arrière-plan. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((enCache) => {
      const reseau = fetch(e.request).then((rep) => {
        if (rep && rep.ok && new URL(e.request.url).origin === location.origin) {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copie));
        }
        return rep;
      }).catch(() => enCache);
      return enCache || reseau;
    })
  );
});
