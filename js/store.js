/* Donjon & Chaton — persistance locale (localStorage, 100 % hors-ligne) */

import { QUALITES, EQUIPEMENT_DEPART } from './data.js';

const KEY = 'dc.chatons.v1';
const KEY_GALERIE = 'dc.galerie.v1';

let chatons = [];
let galerie = [];
let saveTimer = null;

export function uid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function chatonVierge(nom = '') {
  const qualites = {};
  for (const q of QUALITES) qualites[q.id] = 0;
  return {
    id: uid(),
    nom,
    joueuse: '',
    classe: '',
    animal: '',
    enfance: '',
    caractere: '',
    donNaissance: '',
    qualites,
    qualitesCustom: [],           // { id, nom, valeur, imageId }
    talents: {},                  // { "Griffer": true }
    talentsCustom: [],            // { id, nom, coche, imageId }
    imagesQualites: {},           // { costaud: imageId } — illustration facultative
    imagesTalents: {},            // { "Griffer": imageId } — illustration facultative
    grimoire: [],                 // { id, nom, effet }
    sac: [],                      // { id, nom, qte, notes }
    pointsDeVie: { actuel: 0, max: 0 },
    experience: { niveau: 1, points: 0 },
    progression: [],              // { id, date, texte }
    notes: '',
    portraitId: null,             // identifiant dans images.js
    creeLe: new Date().toISOString(),
    majLe: new Date().toISOString(),
  };
}

export function equipementDepart() {
  return EQUIPEMENT_DEPART.map((nom) => ({ id: uid(), nom, qte: 1, notes: '' }));
}

/* --- Lecture / écriture --- */

export function charger() {
  try {
    const brut = localStorage.getItem(KEY);
    chatons = brut ? JSON.parse(brut) : [];
    if (!Array.isArray(chatons)) chatons = [];
  } catch (e) {
    console.error('Lecture impossible, on repart d’une liste vide', e);
    chatons = [];
  }
  chatons = chatons.map(migrer);

  try {
    galerie = JSON.parse(localStorage.getItem(KEY_GALERIE) || '[]');
    if (!Array.isArray(galerie)) galerie = [];
  } catch (e) {
    galerie = [];
  }
  return chatons;
}

/** Complète les fiches anciennes avec les champs ajoutés depuis. */
function migrer(c) {
  const base = chatonVierge();
  const fusion = { ...base, ...c };
  fusion.qualites = { ...base.qualites, ...(c.qualites || {}) };
  fusion.experience = { ...base.experience, ...(c.experience || {}) };
  fusion.pointsDeVie = { ...base.pointsDeVie, ...(c.pointsDeVie || {}) };
  for (const cle of ['qualitesCustom', 'talentsCustom', 'grimoire', 'sac', 'progression']) {
    if (!Array.isArray(fusion[cle])) fusion[cle] = [];
  }
  if (!fusion.talents || typeof fusion.talents !== 'object') fusion.talents = {};
  for (const cle of ['imagesQualites', 'imagesTalents']) {
    if (!fusion[cle] || typeof fusion[cle] !== 'object') fusion[cle] = {};
  }
  fusion.id = c.id || base.id;
  return fusion;
}

export function tous() {
  return chatons;
}

export function get(id) {
  return chatons.find((c) => c.id === id) || null;
}

export function ajouter(chaton) {
  chatons.push(chaton);
  sauver();
  return chaton;
}

export function supprimer(id) {
  const i = chatons.findIndex((c) => c.id === id);
  if (i >= 0) chatons.splice(i, 1);
  sauver();
}

export function dupliquer(id) {
  const src = get(id);
  if (!src) return null;
  const copie = JSON.parse(JSON.stringify(src));
  copie.id = uid();
  copie.nom = (src.nom || 'Chaton') + ' (copie)';
  copie.creeLe = new Date().toISOString();
  for (const cle of ['qualitesCustom', 'talentsCustom', 'grimoire', 'sac', 'progression']) {
    copie[cle] = copie[cle].map((x) => ({ ...x, id: uid() }));
  }
  chatons.push(copie);
  sauver();
  return copie;
}

/** Écriture immédiate. */
export function sauver() {
  try {
    localStorage.setItem(KEY, JSON.stringify(chatons));
    localStorage.setItem(KEY_GALERIE, JSON.stringify(galerie));
    return true;
  } catch (e) {
    console.error('Sauvegarde impossible', e);
    return false;
  }
}

/** Écriture différée (frappe au clavier). */
export function sauverBientot(chaton) {
  if (chaton) chaton.majLe = new Date().toISOString();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(sauver, 400);
}

/* --- Galerie (monstres, PNJ, décors à montrer en partie) --- */

export const CATEGORIES = [
  { id: 'monstre', nom: 'Monstres' },
  { id: 'pnj', nom: 'Personnages' },
  { id: 'lieu', nom: 'Lieux' },
  { id: 'objet', nom: 'Objets' },
];

/**
 * Ancien format : la galerie tenait les noms, IndexedDB tenait les fichiers.
 * Désormais tout vit sur l'image elle-même. Renvoie les entrées à reporter
 * dans la bibliothèque ; l'appelant les applique puis appelle galerieOubliee().
 */
export function galerieAMigrer() {
  return galerie.filter((e) => e.imageId).map((e) => ({
    imageId: e.imageId,
    nom: e.nom || '',
    categorie: e.categorie || 'monstre',
  }));
}

export function galerieOubliee() {
  galerie = [];
  try {
    localStorage.removeItem(KEY_GALERIE);
  } catch (e) { /* sans importance */ }
}

/* --- Sauvegarde / restauration manuelle --- */

/** `images` vient de images.exporterToutes() ; peut être omis. */
export function exporterJSON(images = []) {
  return JSON.stringify({
    format: 'donjon-et-chaton',
    version: 3,
    exporteLe: new Date().toISOString(),
    chatons,
    images,
  }, null, 2);
}

/**
 * Importe un fichier exporté. mode : 'fusion' (ajoute) ou 'remplacement'.
 * Renvoie { chatons, galerie, images } : les images restent à restaurer par
 * l'appelant (c'est images.js qui sait écrire en IndexedDB).
 */
export function importerJSON(texte, mode = 'fusion') {
  const data = JSON.parse(texte);
  const liste = Array.isArray(data) ? data : data.chatons;
  if (!Array.isArray(liste)) throw new Error('Fichier non reconnu');

  const importes = liste.map(migrer).map((c) => {
    if (mode === 'fusion' && chatons.some((x) => x.id === c.id)) c.id = uid();
    return c;
  });
  chatons = mode === 'remplacement' ? importes : chatons.concat(importes);
  sauver();

  /* Sauvegardes au format 2 : les noms d'images vivaient dans « galerie ». */
  const anciennes = Array.isArray(data.galerie) ? data.galerie : [];
  const noms = anciennes.filter((e) => e.imageId).map((e) => ({
    imageId: e.imageId, nom: e.nom || '', categorie: e.categorie || 'monstre',
  }));

  return {
    chatons: importes.length,
    images: Array.isArray(data.images) ? data.images : [],
    noms,
  };
}

/* --- Petits utilitaires de modèle --- */

/** Écrit une valeur dans un chemin type "qualites.malin" ou "sac.3.nom". */
export function setChemin(objet, chemin, valeur) {
  const parts = chemin.split('.');
  let cible = objet;
  for (let i = 0; i < parts.length - 1; i++) {
    const cle = parts[i];
    if (cible[cle] == null) cible[cle] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cible = cible[cle];
  }
  cible[parts[parts.length - 1]] = valeur;
}
