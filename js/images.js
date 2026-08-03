/* Donjon & Chaton — stockage des images.
 *
 * Les images (portraits, monstres, décors) sont des DONNÉES, pas des fichiers
 * livrés avec l'application : elles sont importées par l'utilisateur et rangées
 * en IndexedDB sous forme de Blob. Elles ne passent donc jamais par le réseau
 * ni par le cache du service worker, et restent disponibles en mode avion.
 */

const BASE = 'dc-images';
const MAGASIN = 'images';
const TAILLE_MAX = 1600;   // px sur le plus grand côté
const QUALITE = 0.82;      // compression JPEG

let bdd = null;
const urls = new Map();    // id -> object URL (évite de relire le Blob à chaque affichage)

function ouvrir() {
  if (bdd) return Promise.resolve(bdd);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BASE, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(MAGASIN)) db.createObjectStore(MAGASIN, { keyPath: 'id' });
    };
    req.onsuccess = () => { bdd = req.result; resolve(bdd); };
    req.onerror = () => reject(req.error);
  });
}

function transaction(mode, action) {
  return ouvrir().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(MAGASIN, mode);
    const req = action(tx.objectStore(MAGASIN));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
  }));
}

/* ------------------------------------------------------------------ */
/* Persistance                                                         */
/* ------------------------------------------------------------------ */

/** Demande au navigateur de ne jamais évincer nos données. */
export function demanderPersistance() {
  if (!navigator.storage || !navigator.storage.persist) return Promise.resolve(false);
  return navigator.storage.persisted()
    .then((deja) => (deja ? true : navigator.storage.persist()))
    .catch(() => false);
}

/** true si le navigateur s'est engagé à ne pas effacer nos données. */
export function persistanceAccordee() {
  if (!navigator.storage || !navigator.storage.persisted) return Promise.resolve(null);
  return navigator.storage.persisted().catch(() => null);
}

/** { utilise, quota } en octets, ou null si le navigateur ne le dit pas. */
export function estimerEspace() {
  if (!navigator.storage || !navigator.storage.estimate) return Promise.resolve(null);
  return navigator.storage.estimate()
    .then((e) => ({ utilise: e.usage || 0, quota: e.quota || 0 }))
    .catch(() => null);
}

export function formaterOctets(n) {
  if (n < 1024) return n + ' o';
  if (n < 1024 * 1024) return Math.round(n / 1024) + ' Ko';
  return (n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0) + ' Mo';
}

/* ------------------------------------------------------------------ */
/* Import                                                              */
/* ------------------------------------------------------------------ */

function uid() {
  return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Charge le fichier, le réduit à TAILLE_MAX et le ré-encode en JPEG. */
function reduire(fichier) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, TAILLE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const l = Math.round(img.naturalWidth * ratio);
      const h = Math.round(img.naturalHeight * ratio);
      const toile = document.createElement('canvas');
      toile.width = l;
      toile.height = h;
      const ctx = toile.getContext('2d');
      ctx.fillStyle = '#fff';           // évite un fond noir si l'image a de la transparence
      ctx.fillRect(0, 0, l, h);
      ctx.drawImage(img, 0, 0, l, h);
      URL.revokeObjectURL(url);
      toile.toBlob(
        (blob) => (blob ? resolve({ blob, largeur: l, hauteur: h }) : reject(new Error('Encodage impossible'))),
        'image/jpeg',
        QUALITE
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')); };
    img.src = url;
  });
}

/** Importe un fichier choisi par l'utilisateur. Renvoie la fiche de l'image. */
export function importer(fichier) {
  return reduire(fichier).then(({ blob, largeur, hauteur }) => {
    const fiche = {
      id: uid(),
      blob,
      largeur,
      hauteur,
      taille: blob.size,
      nomFichier: fichier.name || '',
      creeLe: new Date().toISOString(),
    };
    return transaction('readwrite', (m) => m.put(fiche))
      .then(demanderPersistance)
      .then(() => fiche);
  });
}

/** Restaure une image depuis une sauvegarde (data URL). */
export function restaurer(fiche) {
  return fetch(fiche.dataURL).then((r) => r.blob()).then((blob) => {
    const copie = { ...fiche, blob, taille: blob.size };
    delete copie.dataURL;
    return transaction('readwrite', (m) => m.put(copie)).then(() => copie);
  });
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

/** URL affichable pour un identifiant d'image (null si l'image n'existe plus). */
export function url(id) {
  if (!id) return Promise.resolve(null);
  if (urls.has(id)) return Promise.resolve(urls.get(id));
  return transaction('readonly', (m) => m.get(id)).then((fiche) => {
    if (!fiche || !fiche.blob) return null;
    const u = URL.createObjectURL(fiche.blob);
    urls.set(id, u);
    return u;
  }).catch(() => null);
}

export function supprimer(id) {
  const u = urls.get(id);
  if (u) { URL.revokeObjectURL(u); urls.delete(id); }
  return transaction('readwrite', (m) => m.delete(id));
}

/** Toutes les images, sans les Blobs (pour compter et mesurer). */
export function lister() {
  return transaction('readonly', (m) => m.getAll()).then((fiches) =>
    (fiches || []).map(({ blob, ...meta }) => meta)
  );
}

/** Toutes les images en data URL, pour l'export de sauvegarde. */
export function exporterToutes() {
  return transaction('readonly', (m) => m.getAll()).then((fiches) =>
    Promise.all((fiches || []).map((f) => new Promise((resolve) => {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        const { blob, ...meta } = f;
        resolve({ ...meta, dataURL: lecteur.result });
      };
      lecteur.onerror = () => resolve(null);
      lecteur.readAsDataURL(f.blob);
    }))).then((liste) => liste.filter(Boolean))
  );
}

/** Retire les images qui ne sont plus référencées nulle part. */
export function nettoyer(idsUtilises) {
  const gardes = new Set(idsUtilises);
  return lister().then((metas) =>
    Promise.all(metas.filter((m) => !gardes.has(m.id)).map((m) => supprimer(m.id)))
      .then((sup) => sup.length)
  );
}
