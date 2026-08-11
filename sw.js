/* Donjon & Chaton — service worker.
 *
 * Exigence : l'app doit démarrer hors connexion, toujours. D'où trois règles.
 *
 * 1. Le pré-cache se fait fichier par fichier, jamais avec cache.addAll() qui
 *    est tout-ou-rien : un seul échec et le mode hors-ligne entier tombe.
 * 2. Les échecs sont retentés, et la page peut demander une vérification à
 *    chaque lancement (message « verifier-cache ») : tant qu'il y a du réseau,
 *    ce qui manque est rattrapé, et l'utilisateur est prévenu tant qu'il est
 *    encore connecté plutôt que de le découvrir en mode avion.
 * 3. Toute navigation retombe sur la page en cache, quelle que soit l'URL
 *    demandée (paramètres compris) : impossible d'atterrir sur une page blanche.
 *
 * Pense à incrémenter CACHE à chaque modification des fichiers listés.
 */

const CACHE = 'donjon-chaton-v10';
const PAGE = './index.html';

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
  './js/bibliotheque.js',
  './js/prompts.js',
  './manifest.webmanifest',
  './icons/icone.svg',
  './icons/icone-192.png',
  './icons/icone-512.png',
  './icons/icone-masquable-192.png',
  './icons/icone-masquable-512.png',
];

/** Met en cache la liste donnée. Renvoie les fichiers qui ont échoué. */
function precacher(cache, fichiers) {
  return Promise.all(fichiers.map((f) =>
    /* `reload` court-circuite le cache HTTP du navigateur, qui peut détenir une
       réponse périmée — voire un 404 d'avant le déploiement. */
    cache.add(new Request(f, { cache: 'reload' })).then(() => null, () => f)
  )).then((res) => res.filter(Boolean));
}

/** Ce qui manque encore dans le cache. */
function manquants(cache) {
  return Promise.all(FICHIERS.map((f) => cache.match(f).then((r) => (r ? null : f))))
    .then((res) => res.filter(Boolean));
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => precacher(cache, FICHIERS)
        .then((echecs) => (echecs.length ? precacher(cache, echecs) : echecs)))
      .then((echecs) => {
        if (echecs.length) console.warn('Pré-cache incomplet :', echecs);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* La page demande où en est le cache à chaque lancement ; on rattrape ce qui
   manque si le réseau est là, puis on renvoie l'état réel. */
self.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'verifier-cache') return;
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => manquants(cache).then((liste) => (
        liste.length ? precacher(cache, liste).then(() => manquants(cache)) : liste
      )))
      .then((liste) => {
        if (e.source) {
          e.source.postMessage({ type: 'etat-cache', total: FICHIERS.length, manquants: liste });
        }
      })
  );
});

self.addEventListener('fetch', (e) => {
  const requete = e.request;
  if (requete.method !== 'GET') return;
  if (new URL(requete.url).origin !== location.origin) return;

  /* Navigation : la page en cache d'abord, et surtout jamais d'échec. */
  if (requete.mode === 'navigate') {
    e.respondWith(
      caches.match(PAGE, { ignoreSearch: true }).then((enCache) => {
        const reseau = fetch(requete).then((rep) => {
          if (rep && rep.ok) {
            const copie = rep.clone();
            caches.open(CACHE).then((c) => c.put(PAGE, copie));
          }
          return rep;
        }).catch(() => enCache);
        return enCache || reseau;
      })
    );
    return;
  }

  /* Reste : cache d'abord (démarrage instantané et hors-ligne), rafraîchi en
     arrière-plan pour recevoir les mises à jour. */
  e.respondWith(
    caches.match(requete).then((enCache) => {
      const reseau = fetch(requete).then((rep) => {
        if (rep && rep.ok) {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(requete, copie));
        }
        return rep;
      }).catch(() => enCache || Response.error());
      return enCache || reseau;
    })
  );
});
