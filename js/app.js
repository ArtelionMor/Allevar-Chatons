/* Donjon & Chaton — application principale (vues + interactions) */

import {
  QUALITES, TALENTS_GAUCHE, TALENTS_DROITE, QUALITE_MAX,
} from './data.js';
import * as Store from './store.js';
import * as Images from './images.js';
import * as Bibliotheque from './bibliotheque.js';
import * as Prompts from './prompts.js';

const app = document.getElementById('app');

/* En local le service worker est désactivé : son cache masquerait les
   modifications en cours de développement. */
const enLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const $ = (sel, racine = document) => racine.querySelector(sel);
const $$ = (sel, racine = document) => Array.from(racine.querySelectorAll(sel));

function aller(hash) { location.hash = hash; }

/** "2026-07-20" → "20/07/2026" */
function dateFR(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso || '');
}

function autoTaille(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

/** Résout les <img data-image="id"> : le Blob est lu en IndexedDB, pas sur le réseau. */
function peindreImages(racine = app) {
  $$('[data-image]', racine).forEach((el) => {
    Images.url(el.dataset.image).then((u) => {
      if (u) el.src = u;
      else el.closest('.vignette, .portrait')?.classList.add('image-absente');
    });
  });
}

/* ------------------------------------------------------------------ */
/* Routage                                                             */
/* ------------------------------------------------------------------ */

let chatonCourant = null;
let filtreGalerie = 'tout';
let bibliotheque = [];            // métadonnées des images, source unique de l'app
let choixPortrait = {};           // générateur de prompt

function rafraichirBibliotheque() {
  return Images.lister().then((liste) => { bibliotheque = liste; return liste; });
}

function imageMeta(id) {
  return bibliotheque.find((i) => i.id === id) || null;
}

function router() {
  const h = location.hash.replace(/^#\/?/, '');
  const [vue, id] = h.split('/');
  document.body.classList.toggle('mode-impression', vue === 'imprimer');

  if (vue === 'fiche' && Store.get(id)) {
    chatonCourant = Store.get(id);
    vueFiche(chatonCourant);
  } else if (vue === 'imprimer' && Store.get(id)) {
    chatonCourant = Store.get(id);
    vueImpression(chatonCourant);
  } else if (vue === 'galerie') {
    chatonCourant = null;
    rafraichirBibliotheque().then(vueGalerie);
  } else if (vue === 'montrer') {
    chatonCourant = null;
    rafraichirBibliotheque().then(() => vueVisionneuse(id));
  } else if (vue === 'portraits') {
    chatonCourant = null;
    vuePortraits();
  } else {
    chatonCourant = null;
    vueListe();
  }
  if (vue !== 'montrer') window.scrollTo(0, 0);
}

function onglets(actif) {
  const lien = (href, cle, texte) =>
    `<a class="onglet ${actif === cle ? 'actif' : ''}" href="${href}">${texte}</a>`;
  return `<nav class="onglets">
    ${lien('#/', 'fiches', 'Fiches')}
    ${lien('#/galerie', 'galerie', 'Galerie')}
    ${lien('#/portraits', 'portraits', 'Portraits')}
  </nav>`;
}

/* ------------------------------------------------------------------ */
/* Vue : liste des chatons                                             */
/* ------------------------------------------------------------------ */

function vueListe() {
  const chatons = Store.tous();
  app.innerHTML = `
    <header class="barre">
      <h1 class="titre-app">Donjon <span>&amp;</span> Chaton</h1>
      <button class="btn btn-principal" data-action="nouveau">+ Nouveau chaton</button>
    </header>

    ${onglets('fiches')}

    ${chatons.length === 0 ? `
      <p class="vide">
        Aucune fiche pour l’instant.<br>
        Crée un chaton pour commencer la partie&nbsp;!
      </p>
    ` : `
      <ul class="liste-chatons">
        ${chatons.map((c) => carteChaton(c)).join('')}
      </ul>
    `}

    <section class="bloc-outils">
      <h2>Sauvegarde</h2>
      <p class="aide">
        Tout est stocké sur cet appareil, images comprises. Exporte de temps en temps
        pour ne rien perdre.
      </p>
      <p class="aide etat" id="etat-hors-ligne"></p>
      <p class="aide" id="espace-disque"></p>
      <div class="rangee-boutons">
        <button class="btn" data-action="exporter">Exporter (.json)</button>
        <button class="btn" data-action="importer">Importer…</button>
      </div>
      <input type="file" id="fichier-import" accept="application/json,.json" hidden>
    </section>
  `;
  afficherEtatHorsLigne();
  afficherEspace();
}

/* --- Mode hors connexion : état visible, vérifié à chaque lancement --- */

let etatHorsLigne = null;   // { total, manquants } renvoyé par le service worker

function afficherEtatHorsLigne() {
  const cible = $('#etat-hors-ligne');
  if (!cible) return;

  if (enLocal || !('serviceWorker' in navigator)) {
    cible.textContent = 'Mode développement : hors connexion désactivé en local.';
    return;
  }
  if (!etatHorsLigne) {
    cible.textContent = 'Vérification du mode hors connexion…';
    return;
  }
  if (etatHorsLigne.manquants.length === 0) {
    cible.classList.add('etat-ok');
    cible.classList.remove('etat-alerte');
    cible.textContent = `Prêt hors connexion — ${etatHorsLigne.total} fichiers en réserve sur l’appareil.`;
  } else {
    cible.classList.add('etat-alerte');
    cible.classList.remove('etat-ok');
    cible.textContent = navigator.onLine
      ? `Mise en réserve incomplète (${etatHorsLigne.manquants.length} fichier(s)). Nouvelle tentative au prochain lancement.`
      : `Mise en réserve incomplète (${etatHorsLigne.manquants.length} fichier(s)). Reconnecte-toi et rouvre l’application.`;
  }
}

/** Interroge le service worker : ce qui manque est rattrapé s'il y a du réseau. */
function surveillerHorsLigne() {
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'etat-cache') {
      etatHorsLigne = e.data;
      afficherEtatHorsLigne();
    }
  });
  navigator.serviceWorker.ready.then((reg) => {
    const demander = () => reg.active && reg.active.postMessage({ type: 'verifier-cache' });
    demander();
    window.addEventListener('online', demander);
  });
}

/** Affiche l'espace occupé et si le stockage est protégé de l'effacement. */
function afficherEspace() {
  const cible = $('#espace-disque');
  if (!cible) return;
  Promise.all([Images.estimerEspace(), Images.lister(), Images.persistanceAccordee()])
    .then(([espace, images, protege]) => {
      if (!$('#espace-disque')) return;
      const bouts = [];
      if (images.length) {
        const poids = images.reduce((somme, i) => somme + (i.taille || 0), 0);
        bouts.push(`${images.length} image${images.length > 1 ? 's' : ''} (${Images.formaterOctets(poids)})`);
      }
      if (espace && espace.quota) {
        bouts.push(`${Images.formaterOctets(espace.utilise)} sur ${Images.formaterOctets(espace.quota)} disponibles`);
      }
      if (protege === true) bouts.push('stockage protégé de l’effacement');
      $('#espace-disque').textContent = bouts.join(' · ');
    });
}

function carteChaton(c) {
  const talentsCoches = Object.values(c.talents).filter(Boolean).length + c.talentsCustom.filter((t) => t.coche).length;
  return `
    <li class="carte" data-id="${c.id}">
      <a class="carte-lien" href="#/fiche/${c.id}">
        <span class="carte-nom">${esc(c.nom || 'Chaton sans nom')}</span>
        <span class="carte-meta">
          ${c.joueuse ? esc(c.joueuse) + ' · ' : ''}Niveau ${c.experience.niveau || 1}
          · ${talentsCoches} talent${talentsCoches > 1 ? 's' : ''}
        </span>
      </a>
      <div class="carte-actions">
        <button class="btn-icone" data-action="imprimer" data-id="${c.id}" title="Imprimer">🖨</button>
        <button class="btn-icone" data-action="dupliquer" data-id="${c.id}" title="Dupliquer">⧉</button>
        <button class="btn-icone danger" data-action="supprimer" data-id="${c.id}" title="Supprimer">✕</button>
      </div>
    </li>
  `;
}

/* ------------------------------------------------------------------ */
/* Vue : fiche de personnage                                           */
/* ------------------------------------------------------------------ */

function vueFiche(c) {
  app.innerHTML = `
    <header class="barre">
      <a class="btn-retour" href="#/">‹ Fiches</a>
      <button class="btn" data-action="imprimer" data-id="${c.id}">🖨 Imprimer</button>
    </header>

    <form class="fiche" autocomplete="off" onsubmit="return false">
      ${sectionIdentite(c)}
      <div id="sec-qualites">${sectionQualites(c)}</div>
      <div id="sec-talents">${sectionTalents(c)}</div>
      <div id="sec-grimoire">${sectionGrimoire(c)}</div>
      <div id="sec-sac">${sectionSac(c)}</div>
      <div id="sec-experience">${sectionExperience(c)}</div>
      ${sectionNotes(c)}
    </form>

    <p class="sauvegarde-info">Sauvegarde automatique sur cet appareil.</p>
  `;
  $$('textarea', app).forEach(autoTaille);
  peindreImages();
}

function champ(label, chemin, valeur, { multi = false, placeholder = '' } = {}) {
  const id = 'f-' + chemin.replace(/\./g, '-');
  return `
    <p class="champ">
      <label for="${id}">${esc(label)}</label>
      ${multi
        ? `<textarea id="${id}" data-champ="${chemin}" rows="2" placeholder="${esc(placeholder)}">${esc(valeur)}</textarea>`
        : `<input id="${id}" type="text" data-champ="${chemin}" value="${esc(valeur)}" placeholder="${esc(placeholder)}">`}
    </p>
  `;
}

function sectionIdentite(c) {
  return `
    <section class="bloc">
      <h2>Le Chaton</h2>
      <div id="sec-portrait">${sectionPortrait(c)}</div>
      ${champ('Nom du Chaton', 'nom', c.nom, { placeholder: 'Moustache de Velours…' })}
      ${champ('Joueuse / Joueur', 'joueuse', c.joueuse)}
      ${champ('Classe', 'classe', c.classe, { multi: true, placeholder: 'Paladin, Alchimiste…' })}
      ${champ('Animal', 'animal', c.animal, { multi: true, placeholder: 'Chèvre, Husky, Lézard…' })}
      ${champ('Histoire', 'enfance', c.enfance, { multi: true, placeholder: 'D’où vient-il, ce qu’il a vécu…' })}
      ${champ('Caractère', 'caractere', c.caractere, { multi: true, placeholder: 'Curieux, grognon, trouillard…' })}
      ${champ('Don de naissance', 'donNaissance', c.donNaissance, { multi: true })}
    </section>
  `;
}

function sectionPortrait(c) {
  return `
    <div class="portrait ${c.portraitId ? '' : 'portrait-vide'}">
      ${c.portraitId
        ? `<img data-image="${esc(c.portraitId)}" alt="Portrait de ${esc(c.nom || 'ce chaton')}">
           <div class="portrait-actions">
             <button type="button" class="btn-icone" data-action="illustrer" data-cible="portrait" title="Changer">✎</button>
             <button type="button" class="btn-icone danger" data-action="retirer-portrait" title="Retirer">✕</button>
           </div>`
        : `<button type="button" class="portrait-ajout" data-action="illustrer" data-cible="portrait">
             <span class="portrait-icone">🐾</span>
             <span>Ajouter un portrait</span>
           </button>`}
    </div>
  `;
}

/* --- Lien entre une cible illustrable et son image --- */

function imageDe(c, cible, cle, index) {
  switch (cible) {
    case 'portrait': return c.portraitId || null;
    case 'talent': return c.imagesTalents[cle] || null;
    case 'talent-custom': return (c.talentsCustom[index] || {}).imageId || null;
    case 'qualite': return c.imagesQualites[cle] || null;
    case 'qualite-custom': return (c.qualitesCustom[index] || {}).imageId || null;
    case 'sort': return (c.grimoire[index] || {}).imageId || null;
    case 'objet': return (c.sac[index] || {}).imageId || null;
    default: return null;
  }
}

function definirImage(c, cible, cle, index, imageId) {
  switch (cible) {
    case 'portrait': c.portraitId = imageId; break;
    case 'talent':
      if (imageId) c.imagesTalents[cle] = imageId;
      else delete c.imagesTalents[cle];
      break;
    case 'talent-custom':
      if (c.talentsCustom[index]) c.talentsCustom[index].imageId = imageId;
      break;
    case 'qualite':
      if (imageId) c.imagesQualites[cle] = imageId;
      else delete c.imagesQualites[cle];
      break;
    case 'qualite-custom':
      if (c.qualitesCustom[index]) c.qualitesCustom[index].imageId = imageId;
      break;
    case 'sort':
      if (c.grimoire[index]) c.grimoire[index].imageId = imageId;
      break;
    case 'objet':
      if (c.sac[index]) c.sac[index].imageId = imageId;
      break;
  }
}

/** Quelle section redessiner après avoir changé une image. */
function sectionDe(cible) {
  if (cible === 'portrait') return 'portrait';
  if (cible === 'sort') return 'grimoire';
  if (cible === 'objet') return 'sac';
  return cible.startsWith('qualite') ? 'qualites' : 'talents';
}

/* --- Qualités --- */

function sectionQualites(c) {
  const lignes = [
    ...QUALITES.map((q) => ligneQualite(q.nom, c.qualites[q.id] || 0, `qualites.${q.id}`, {
      imageId: c.imagesQualites[q.id] || null,
      cible: 'qualite', cle: q.id,
    })),
    ...c.qualitesCustom.map((q, i) => ligneQualite(q.nom, q.valeur || 0, `qualitesCustom.${i}.valeur`, {
      nomChemin: `qualitesCustom.${i}.nom`, index: i,
      imageId: q.imageId || null,
      cible: 'qualite-custom',
    })),
  ];
  return `
    <section class="bloc">
      <h2>Qualités</h2>
      <ul class="qualites">${lignes.join('')}</ul>
      <button class="btn btn-ajout" data-action="ajouter-qualite">+ Qualité personnalisée</button>
    </section>
  `;
}

/** Une qualité illustrée devient une carte ; sans image, elle reste une ligne. */
function ligneQualite(nom, valeur, chemin, opts = {}) {
  const editable = !!opts.nomChemin;
  const illustree = !!opts.imageId;
  const illustrable = !!opts.cible;

  const titre = editable
    ? `<input class="qualite-nom modifiable" type="text" data-champ="${opts.nomChemin}" value="${esc(nom)}" placeholder="Nom de la qualité">`
    : `<span class="qualite-nom">${esc(nom)}</span>`;

  const stepper = `
    <span class="stepper">
      <button type="button" class="btn-step" data-action="qualite-moins" data-chemin="${chemin}" aria-label="Diminuer">−</button>
      <span class="stepper-valeur" data-valeur="${chemin}">${valeur}</span>
      <button type="button" class="btn-step" data-action="qualite-plus" data-chemin="${chemin}" aria-label="Augmenter">+</button>
    </span>`;

  const retirer = editable
    ? `<button type="button" class="btn-icone danger" data-action="retirer-qualite" data-index="${opts.index}" title="Retirer">✕</button>`
    : '';

  if (!illustree) {
    return `
      <li class="qualite">
        ${titre}
        ${illustrable ? boutonIllustrer(opts) : ''}
        ${stepper}
        ${retirer}
      </li>`;
  }

  return `
    <li class="qualite qualite-illustree">
      <button type="button" class="illustration" data-action="montrer" data-id="${esc(opts.imageId)}" title="Montrer en grand">
        <img data-image="${esc(opts.imageId)}" alt="">
      </button>
      <div class="qualite-corps">
        <div class="qualite-haut">${titre}${retirer}</div>
        <div class="qualite-bas">${stepper}${boutonIllustrer(opts, true)}</div>
      </div>
    </li>`;
}

/** Vignette d'une ligne de liste : l'image si elle existe, sinon le bouton. */
function vignetteLigne(imageId, cible, index) {
  if (!imageId) return boutonIllustrer({ cible, index });
  return `<button type="button" class="illustration illustration-ligne"
    data-action="illustrer" data-cible="${esc(cible)}" data-index="${index}" title="Changer l’image">
    <img data-image="${esc(imageId)}" alt="">
  </button>`;
}

/** Bouton d'attache d'image, discret tant qu'il n'y a rien à montrer. */
function boutonIllustrer(opts, remplacer = false) {
  const index = opts.index === undefined ? '' : ` data-index="${opts.index}"`;
  const cle = opts.cle === undefined ? '' : ` data-cle="${esc(opts.cle)}"`;
  return `<button type="button" class="btn-illustrer${remplacer ? ' discret' : ''}"
    data-action="illustrer" data-cible="${esc(opts.cible)}"${cle}${index}
    title="${remplacer ? 'Changer l’image' : 'Illustrer'}">${remplacer ? '✎' : '＋'}</button>`;
}

/* --- Talents --- */

function sectionTalents(c) {
  const standard = [...TALENTS_GAUCHE, ...TALENTS_DROITE];

  /* Les talents illustrés remontent en tête, en grand : c'est ce qu'on montre
     aux enfants. Sans image, la liste compacte d'origine ne bouge pas. */
  const illustres = [
    ...standard
      .filter((t) => c.imagesTalents[t])
      .map((t) => ({ nom: t, imageId: c.imagesTalents[t], coche: !!c.talents[t], cible: 'talent', cle: t })),
    ...c.talentsCustom
      .map((t, i) => ({
        nom: t.nom, description: t.description || '', imageId: t.imageId,
        coche: !!t.coche, cible: 'talent-custom', index: i,
      }))
      .filter((t) => t.imageId),
  ];

  const restants = standard.filter((t) => !c.imagesTalents[t]);
  const milieu = Math.ceil(restants.length / 2);
  const customRestants = c.talentsCustom
    .map((t, i) => ({ ...t, index: i }))
    .filter((t) => !t.imageId);

  const colonne = (liste) => `
    <ul class="talents">
      ${liste.map((t) => `
        <li>
          <label class="case">
            <input type="checkbox" data-talent="${esc(t)}" ${c.talents[t] ? 'checked' : ''}>
            <span>${esc(t)}</span>
          </label>
          ${boutonIllustrer({ cible: 'talent', cle: t })}
        </li>`).join('')}
    </ul>`;

  const carte = (t) => `
    <li class="carte-talent ${t.coche ? 'coche' : ''}">
      <button type="button" class="illustration" data-action="montrer" data-id="${esc(t.imageId)}" title="Montrer en grand">
        <img data-image="${esc(t.imageId)}" alt="">
      </button>
      <div class="carte-talent-bas">
        <label class="case">
          <input type="checkbox"
            ${t.cible === 'talent'
              ? `data-talent="${esc(t.cle)}"`
              : `data-champ-case="talentsCustom.${t.index}.coche"`}
            ${t.coche ? 'checked' : ''}>
          ${t.cible === 'talent'
            ? `<span>${esc(t.nom)}</span>`
            : `<input class="modifiable" type="text" data-champ="talentsCustom.${t.index}.nom" value="${esc(t.nom)}" placeholder="Nouveau talent">`}
        </label>
        ${boutonIllustrer(t, true)}
      </div>
      ${t.cible === 'talent-custom'
        ? `<textarea class="carte-talent-desc" rows="1" data-champ="talentsCustom.${t.index}.description"
             placeholder="Ce que fait ce talent…">${esc(t.description || '')}</textarea>`
        : ''}
    </li>`;

  return `
    <section class="bloc">
      <h2>Talents</h2>

      ${illustres.length ? `<ul class="grille grille-talents">${illustres.map(carte).join('')}</ul>` : ''}

      <div class="talents-colonnes">
        ${colonne(restants.slice(0, milieu))}
        ${colonne(restants.slice(milieu))}
      </div>

      ${customRestants.length ? `
        <h3>Talents personnalisés</h3>
        <ul class="talents talents-perso">
          ${customRestants.map((t) => `
            <li>
              <label class="case">
                <input type="checkbox" data-champ-case="talentsCustom.${t.index}.coche" ${t.coche ? 'checked' : ''}>
              </label>
              <div class="talent-corps">
                <input class="modifiable" type="text" data-champ="talentsCustom.${t.index}.nom" value="${esc(t.nom)}" placeholder="Nouveau talent">
                <textarea rows="1" data-champ="talentsCustom.${t.index}.description" placeholder="Ce que fait ce talent…">${esc(t.description || '')}</textarea>
              </div>
              ${boutonIllustrer({ cible: 'talent-custom', index: t.index })}
              <button type="button" class="btn-icone danger" data-action="retirer-talent" data-index="${t.index}" title="Retirer">✕</button>
            </li>`).join('')}
        </ul>` : ''}

      <button class="btn btn-ajout" data-action="ajouter-talent">+ Talent personnalisé</button>
    </section>
  `;
}

/* --- Grimoire --- */

function sectionGrimoire(c) {
  return `
    <section class="bloc">
      <h2>Grimoire</h2>
      ${c.grimoire.length === 0 ? '<p class="vide-mini">Aucun sort pour l’instant.</p>' : `
        <ul class="cartes-lignes">
          ${c.grimoire.map((s, i) => `
            <li class="ligne">
              <div class="ligne-corps">
                <input class="ligne-titre" type="text" data-champ="grimoire.${i}.nom" value="${esc(s.nom)}" placeholder="Nom du sort">
                <textarea rows="2" data-champ="grimoire.${i}.effet" placeholder="Effet, coût, limites…">${esc(s.effet)}</textarea>
              </div>
              ${vignetteLigne(s.imageId, 'sort', i)}
              <button type="button" class="btn-icone danger" data-action="retirer-sort" data-index="${i}" title="Retirer">✕</button>
            </li>`).join('')}
        </ul>`}
      <button class="btn btn-ajout" data-action="ajouter-sort">+ Ajouter un sort</button>
    </section>
  `;
}

/* --- Sac de voyage --- */

function sectionSac(c) {
  return `
    <section class="bloc">
      <h2>Sac de voyage</h2>
      ${c.sac.length === 0 ? '<p class="vide-mini">Le sac est vide.</p>' : `
        <ul class="cartes-lignes">
          ${c.sac.map((o, i) => `
            <li class="ligne">
              <div class="ligne-corps">
                <div class="ligne-haut">
                  <input class="ligne-titre" type="text" data-champ="sac.${i}.nom" value="${esc(o.nom)}" placeholder="Objet">
                  <input class="qte" type="number" min="1" step="1" data-champ-nombre="sac.${i}.qte" value="${o.qte || 1}" aria-label="Quantité">
                </div>
                <input class="ligne-note" type="text" data-champ="sac.${i}.notes" value="${esc(o.notes)}" placeholder="Note (facultatif)">
              </div>
              ${vignetteLigne(o.imageId, 'objet', i)}
              <button type="button" class="btn-icone danger" data-action="retirer-objet" data-index="${i}" title="Retirer">✕</button>
            </li>`).join('')}
        </ul>`}
      <div class="rangee-boutons">
        <button class="btn btn-ajout" data-action="ajouter-objet">+ Ajouter un objet</button>
        <button class="btn btn-ajout" data-action="equipement-depart">Équipement de départ</button>
      </div>
    </section>
  `;
}

/* --- Expérience --- */

function sectionExperience(c) {
  return `
    <section class="bloc">
      <h2>Expérience</h2>
      <ul class="qualites">
        ${ligneQualite('Niveau', c.experience.niveau || 1, 'experience.niveau')}
        ${ligneQualite('Points d’expérience', c.experience.points || 0, 'experience.points')}
      </ul>

      <h3>Journal de progression</h3>
      ${c.progression.length === 0 ? '<p class="vide-mini">Rien de noté pour l’instant.</p>' : `
        <ul class="cartes-lignes">
          ${c.progression.map((p, i) => `
            <li class="ligne">
              <div class="ligne-corps">
                <input class="ligne-date" type="date" data-champ="progression.${i}.date" value="${esc(p.date)}">
                <textarea rows="2" data-champ="progression.${i}.texte" placeholder="Ce que le Chaton a appris, gagné, vécu…">${esc(p.texte)}</textarea>
              </div>
              <button type="button" class="btn-icone danger" data-action="retirer-progres" data-index="${i}" title="Retirer">✕</button>
            </li>`).join('')}
        </ul>`}
      <button class="btn btn-ajout" data-action="ajouter-progres">+ Nouvelle étape</button>
    </section>
  `;
}

function sectionNotes(c) {
  return `
    <section class="bloc">
      <h2>Notes libres</h2>
      <textarea rows="3" data-champ="notes" placeholder="Alliés, secrets, promesses…">${esc(c.notes)}</textarea>
    </section>
  `;
}


/* ------------------------------------------------------------------ */
/* Vue : galerie (ce qu'on montre aux enfants pendant la partie)       */
/* ------------------------------------------------------------------ */

function imagesFiltrees() {
  return filtreGalerie === 'tout'
    ? bibliotheque
    : bibliotheque.filter((i) => (i.categorie || 'monstre') === filtreGalerie);
}

function vueGalerie() {
  const images = imagesFiltrees();
  app.innerHTML = `
    <header class="barre">
      <h1 class="titre-app">Galerie</h1>
      <button class="btn btn-principal" data-action="choisir-images">+ Images</button>
    </header>

    ${onglets('galerie')}

    <div class="filtres">
      ${['tout', ...Store.CATEGORIES.map((c) => c.id)].map((id) => {
        const nom = id === 'tout' ? 'Tout' : Store.CATEGORIES.find((c) => c.id === id).nom;
        const n = id === 'tout'
          ? bibliotheque.length
          : bibliotheque.filter((i) => (i.categorie || 'monstre') === id).length;
        return `<button class="puce ${filtreGalerie === id ? 'actif' : ''}" data-action="filtrer" data-filtre="${id}">${nom}${n ? ` <span class="puce-n">${n}</span>` : ''}</button>`;
      }).join('')}
    </div>

    ${images.length === 0 ? `
      <p class="vide">
        ${bibliotheque.length === 0
          ? 'La bibliothèque est vide.<br>Ajoute les images préparées pour ta partie&nbsp;: elles resteront disponibles sans connexion, et réutilisables sur les talents et les qualités.'
          : 'Rien dans cette catégorie.'}
      </p>
    ` : `
      <ul class="grille">
        ${images.map((im) => `
          <li class="vignette">
            <button type="button" class="vignette-image" data-action="montrer" data-id="${esc(im.id)}">
              <img data-image="${esc(im.id)}" alt="${esc(im.nom || 'Image')}">
            </button>
            <div class="vignette-infos">
              <input class="modifiable" type="text" data-image-meta="${esc(im.id)}.nom" value="${esc(im.nom)}" placeholder="Nom">
              <div class="vignette-bas">
                <select data-image-meta="${esc(im.id)}.categorie">
                  ${Store.CATEGORIES.map((c) => `<option value="${c.id}" ${(im.categorie || 'monstre') === c.id ? 'selected' : ''}>${c.nom}</option>`).join('')}
                </select>
                <button type="button" class="btn-icone danger" data-action="supprimer-image" data-id="${esc(im.id)}" title="Supprimer">✕</button>
              </div>
            </div>
          </li>`).join('')}
      </ul>
    `}

    <p class="sauvegarde-info">
      Les images sont réduites puis rangées sur l’appareil. Aucune connexion n’est nécessaire pour les afficher.
    </p>
    <input type="file" id="fichier-galerie" accept="image/*" multiple hidden>
    <div class="progression-import" id="progression-import" hidden></div>
  `;
  peindreImages();
}

function vueVisionneuse(id) {
  const liste = imagesFiltrees();
  const i = liste.findIndex((im) => im.id === id);
  const image = liste[i] || imageMeta(id);

  if (!image) { aller('#/galerie'); return; }

  const precedent = i > 0 ? liste[i - 1] : null;
  const suivant = i >= 0 && i < liste.length - 1 ? liste[i + 1] : null;

  app.innerHTML = `
    <div class="visionneuse">
      <button class="visionneuse-fermer" data-action="fermer-visionneuse" aria-label="Fermer">✕</button>
      ${precedent ? `<a class="visionneuse-nav gauche" href="#/montrer/${precedent.id}" aria-label="Précédent">‹</a>` : ''}
      ${suivant ? `<a class="visionneuse-nav droite" href="#/montrer/${suivant.id}" aria-label="Suivant">›</a>` : ''}
      <img data-image="${esc(image.id)}" alt="${esc(image.nom || 'Image')}">
      ${image.nom ? `<p class="visionneuse-nom">${esc(image.nom)}</p>` : ''}
    </div>
  `;
  peindreImages();
}

/* ------------------------------------------------------------------ */
/* Vue : portraits (générateur de prompt Midjourney)                   */
/* ------------------------------------------------------------------ */

function vuePortraits() {
  const prompt = Prompts.composer(choixPortrait);
  app.innerHTML = `
    <header class="barre">
      <h1 class="titre-app">Portraits</h1>
      <button class="btn" data-action="portrait-hasard">Au hasard</button>
    </header>

    ${onglets('portraits')}

    <p class="aide">
      Fais choisir l’enfant, puis copie le prompt dans Midjourney.
      L’image obtenue s’ajoute à la bibliothèque par l’onglet Galerie.
    </p>

    ${Prompts.AXES.map((axe) => `
      <section class="bloc bloc-axe">
        <h2>${esc(axe.nom)}</h2>
        ${axe.aide ? `<p class="aide">${esc(axe.aide)}</p>` : ''}
        <div class="filtres">
          ${axe.options.map((o) => `
            <button type="button" class="puce ${choixPortrait[axe.id] === o.id ? 'actif' : ''}"
                    data-action="portrait-choix" data-axe="${esc(axe.id)}" data-option="${esc(o.id)}">
              ${esc(o.nom)}
            </button>`).join('')}
        </div>
      </section>`).join('')}

    <section class="bloc">
      <h2>Dosage du style</h2>
      <p class="aide">À quel point le tableau déteint sur l’illustration.</p>
      <div class="filtres">
        ${Prompts.DOSAGES.map((d) => `
          <button type="button" class="puce ${(choixPortrait.dosage || Prompts.DOSAGE_DEFAUT) === d.id ? 'actif' : ''}"
                  data-action="portrait-dosage" data-dosage="${esc(d.id)}">${esc(d.nom)}</button>`).join('')}
      </div>
    </section>

    <section class="bloc">
      <h2>Prompt</h2>
      ${prompt ? `
        <p class="prompt" id="prompt-resultat">${esc(prompt)}</p>
        <div class="rangee-boutons">
          <button class="btn btn-principal" data-action="copier-prompt">Copier</button>
          <button class="btn" data-action="portrait-effacer">Effacer les choix</button>
        </div>
        <p class="aide" id="prompt-retour"></p>
      ` : '<p class="vide-mini">Choisis au moins un élément ci-dessus.</p>'}
    </section>
  `;
}

/* ------------------------------------------------------------------ */
/* Vue : impression                                                    */
/* ------------------------------------------------------------------ */

function vueImpression(c) {
  const talents = [
    ...[...TALENTS_GAUCHE, ...TALENTS_DROITE]
      .filter((t) => c.talents[t])
      .map((t) => ({ nom: t, imageId: c.imagesTalents[t] || null })),
    ...c.talentsCustom
      .filter((t) => t.coche)
      .map((t) => ({ nom: t.nom, texte: t.description || '', imageId: t.imageId || null })),
  ];
  const sorts = c.grimoire.map((s) => ({ nom: s.nom, texte: s.effet, imageId: s.imageId || null }));
  const objets = c.sac.map((o) => ({
    nom: ((o.qte || 1) > 1 ? o.qte + ' × ' : '') + o.nom,
    texte: o.notes,
    imageId: o.imageId || null,
  }));

  const champ = (label, valeur) => (valeur
    ? `<p class="pr-champ"><b>${esc(label)} :</b> ${esc(valeur)}</p>` : '');

  /* La colonne d'images n'existe que si au moins une entrée en a une :
     sans illustration, la liste reste alignée à gauche. */
  const liste = (entrees) => {
    const illustree = entrees.some((e) => e.imageId);
    return `<ul class="pr-entrees ${illustree ? 'pr-entrees-illustrees' : ''}">
      ${entrees.map((e) => `
        <li>
          ${illustree
            ? (e.imageId
              ? `<img class="pr-vignette" data-image="${esc(e.imageId)}" alt="">`
              : '<span class="pr-vignette"></span>')
            : ''}
          <p><b>${esc(e.nom)}</b>${e.texte ? ' — ' + esc(e.texte) : ''}</p>
        </li>`).join('')}
    </ul>`;
  };

  const bloc = (titre, contenu) => `
    <section class="pr-bloc"><h2>${esc(titre)}</h2>${contenu}</section>`;

  app.innerHTML = `
    <header class="barre sans-impression">
      <a class="btn-retour" href="#/fiche/${c.id}">‹ Retour</a>
      <button class="btn btn-principal" data-action="lancer-impression">🖨 Imprimer</button>
    </header>

    <article class="feuille">
      <div class="pr-tete">
        ${c.portraitId
          ? `<img class="pr-portrait" data-image="${esc(c.portraitId)}" alt="">`
          : '<span class="pr-portrait pr-portrait-vide"></span>'}
        <div class="pr-identite">
          <h1 class="pr-nom">${esc(c.nom || 'Chaton sans nom')}</h1>
          <p class="pr-sous">Niveau ${c.experience.niveau || 1}${c.joueuse ? ' — ' + esc(c.joueuse) : ''}</p>
          <h2 class="pr-titre-qualites">Qualités</h2>
          <ul class="pr-qualites">
            ${QUALITES.map((q) => `<li><span>${esc(q.nom)}</span><b>${c.qualites[q.id] || 0}</b></li>`).join('')}
            ${c.qualitesCustom.filter((q) => q.nom).map((q) => `<li><span>${esc(q.nom)}</span><b>${q.valeur || 0}</b></li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="pr-details">
        ${champ('Classe', c.classe)}
        ${champ('Animal', c.animal)}
        ${champ('Histoire', c.enfance)}
        ${champ('Caractère', c.caractere)}
        ${champ('Don de naissance', c.donNaissance)}
      </div>

      ${talents.length ? bloc('Talents', liste(talents)) : ''}
      ${sorts.length ? bloc('Grimoire', liste(sorts)) : ''}
      ${objets.length ? bloc('Sac de voyage', liste(objets)) : ''}

      ${c.progression.length ? bloc('Progression', `
        <ul class="pr-liste">
          ${c.progression.map((p) => `<li>${p.date ? '<b>' + esc(dateFR(p.date)) + '</b> — ' : ''}${esc(p.texte)}</li>`).join('')}
        </ul>`) : ''}

      ${c.notes ? bloc('Notes', `<p>${esc(c.notes)}</p>`) : ''}
    </article>
  `;
  peindreImages();
}

/* ------------------------------------------------------------------ */
/* Interactions                                                        */
/* ------------------------------------------------------------------ */

function rafraichir(section) {
  const c = chatonCourant;
  if (!c) return;
  const cible = $('#sec-' + section);
  if (!cible) return;
  const rendus = {
    portrait: sectionPortrait,
    qualites: sectionQualites, talents: sectionTalents, grimoire: sectionGrimoire,
    sac: sectionSac, experience: sectionExperience,
  };
  cible.innerHTML = rendus[section](c);
  $$('textarea', cible).forEach(autoTaille);
  peindreImages(cible);
}

/* Saisie texte : on met à jour le modèle sans re-rendre (le focus reste). */
app.addEventListener('input', (e) => {
  const el = e.target;
  const c = chatonCourant;

  if (el.dataset.champ && c) {
    Store.setChemin(c, el.dataset.champ, el.value);
    if (el.tagName === 'TEXTAREA') autoTaille(el);
    Store.sauverBientot(c);
  } else if (el.dataset.champNombre && c) {
    Store.setChemin(c, el.dataset.champNombre, Math.max(1, parseInt(el.value, 10) || 1));
    Store.sauverBientot(c);
  }
});

app.addEventListener('change', (e) => {
  const el = e.target;
  const c = chatonCourant;
  if (!c) return;

  if (el.dataset.talent !== undefined) {
    c.talents[el.dataset.talent] = el.checked;
    Store.sauverBientot(c);
  } else if (el.dataset.champCase) {
    Store.setChemin(c, el.dataset.champCase, el.checked);
    Store.sauverBientot(c);
  }
});

/* Ces changements-là existent aussi hors d'une fiche ouverte. */
app.addEventListener('change', (e) => {
  const el = e.target;

  if (el.id === 'fichier-import') {
    lireFichierImport(el.files[0]);
    el.value = '';
  } else if (el.id === 'fichier-galerie') {
    importerDansGalerie(Array.from(el.files));
    el.value = '';
  } else if (el.dataset.imageMeta) {
    enregistrerMetaImage(el);
  }
});

/* Nom d'une image tapé au clavier : on enregistre sans re-rendre. */
let minuteurMeta = null;
app.addEventListener('input', (e) => {
  if (!e.target.dataset.imageMeta) return;
  clearTimeout(minuteurMeta);
  const el = e.target;
  minuteurMeta = setTimeout(() => enregistrerMetaImage(el), 400);
});

function enregistrerMetaImage(el) {
  const [id, cle] = el.dataset.imageMeta.split('.');
  Images.majMeta(id, { [cle]: el.value }).then(() => {
    const meta = imageMeta(id);
    if (meta) meta[cle] = el.value;   // garde la bibliothèque en mémoire à jour
  });
}

app.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const c = chatonCourant;
  const index = parseInt(btn.dataset.index, 10);

  switch (action) {
    /* --- liste --- */
    case 'nouveau': {
      const nouveau = Store.ajouter(Store.chatonVierge());
      aller('#/fiche/' + nouveau.id);
      break;
    }
    case 'dupliquer': {
      const copie = Store.dupliquer(btn.dataset.id);
      if (copie) vueListe();
      break;
    }
    case 'supprimer': {
      const cible = Store.get(btn.dataset.id);
      if (cible && confirm(`Supprimer définitivement « ${cible.nom || 'Chaton sans nom'} » ?`)) {
        const portrait = cible.portraitId;
        Store.supprimer(cible.id);
        if (portrait) Images.supprimer(portrait);
        vueListe();
      }
      break;
    }
    case 'imprimer':
      aller('#/imprimer/' + btn.dataset.id);
      break;
    case 'lancer-impression':
      window.print();
      break;
    case 'exporter':
      exporterFichier(btn);
      break;
    case 'importer':
      $('#fichier-import').click();
      break;

    /* --- images --- */
    case 'illustrer': {
      if (!c) break;
      const cible = btn.dataset.cible;
      const cle = btn.dataset.cle;
      const actuel = imageDe(c, cible, cle, index);
      Bibliotheque.choisir({ titre: 'Choisir une image', actuel }).then((choix) => {
        if (choix === false) return;           // annulé
        definirImage(c, cible, cle, index, choix);   // null = retirer l'image
        Store.sauver();
        rafraichirBibliotheque().then(() => rafraichir(sectionDe(cible)));
      });
      break;
    }
    case 'retirer-portrait':
      /* L'image reste dans la bibliothèque : elle peut resservir ailleurs. */
      c.portraitId = null;
      Store.sauver();
      rafraichir('portrait');
      break;
    case 'choisir-images':
      $('#fichier-galerie').click();
      break;
    case 'filtrer':
      filtreGalerie = btn.dataset.filtre;
      vueGalerie();
      break;
    case 'montrer':
      aller('#/montrer/' + btn.dataset.id);
      break;
    case 'fermer-visionneuse':
      aller('#/galerie');
      break;
    case 'supprimer-image': {
      const meta = imageMeta(btn.dataset.id);
      const utilisee = Store.tous().some((x) =>
        x.portraitId === btn.dataset.id
        || Object.values(x.imagesTalents).includes(btn.dataset.id)
        || Object.values(x.imagesQualites).includes(btn.dataset.id)
        || x.talentsCustom.some((t) => t.imageId === btn.dataset.id)
        || x.qualitesCustom.some((q) => q.imageId === btn.dataset.id));
      const avertissement = utilisee
        ? '\n\nAttention : elle est utilisée sur une fiche de personnage.' : '';
      if (confirm(`Supprimer « ${(meta && meta.nom) || 'cette image'} » de la bibliothèque ?${avertissement}`)) {
        Images.supprimer(btn.dataset.id)
          .then(rafraichirBibliotheque)
          .then(vueGalerie);
      }
      break;
    }

    /* --- générateur de portraits --- */
    case 'portrait-choix': {
      const axe = btn.dataset.axe;
      choixPortrait[axe] = choixPortrait[axe] === btn.dataset.option ? undefined : btn.dataset.option;
      vuePortraits();
      break;
    }
    case 'portrait-dosage':
      choixPortrait.dosage = btn.dataset.dosage;
      vuePortraits();
      break;
    case 'portrait-hasard':
      /* Le dosage en cours est conservé : c'est un réglage, pas un choix de jeu. */
      choixPortrait = Prompts.auHasard(choixPortrait.dosage);
      vuePortraits();
      break;
    case 'portrait-effacer':
      choixPortrait = { dosage: choixPortrait.dosage };
      vuePortraits();
      break;
    case 'copier-prompt':
      copierPrompt(Prompts.composer(choixPortrait));
      break;

    /* --- qualités --- */
    case 'qualite-plus':
    case 'qualite-moins': {
      if (!c) break;
      const chemin = btn.dataset.chemin;
      const pas = action === 'qualite-plus' ? 1 : -1;
      const parts = chemin.split('.');
      let val = parts.reduce((o, k) => (o ? o[k] : 0), c) || 0;
      const max = chemin.startsWith('experience.points') ? 9999
        : chemin.startsWith('experience.niveau') ? 20 : QUALITE_MAX;
      const min = chemin.startsWith('experience.niveau') ? 1 : 0;
      val = Math.min(max, Math.max(min, val + pas));
      Store.setChemin(c, chemin, val);
      const affichage = $(`[data-valeur="${chemin}"]`);
      if (affichage) affichage.textContent = val;
      Store.sauverBientot(c);
      break;
    }
    case 'ajouter-qualite':
      c.qualitesCustom.push({ id: Store.uid(), nom: '', valeur: 0 });
      Store.sauverBientot(c); rafraichir('qualites');
      break;
    case 'retirer-qualite':
      c.qualitesCustom.splice(index, 1);
      Store.sauverBientot(c); rafraichir('qualites');
      break;

    /* --- talents --- */
    case 'ajouter-talent':
      c.talentsCustom.push({ id: Store.uid(), nom: '', coche: true });
      Store.sauverBientot(c); rafraichir('talents');
      $$('.talents-perso input[type="text"]').pop()?.focus();
      break;
    case 'retirer-talent':
      c.talentsCustom.splice(index, 1);
      Store.sauverBientot(c); rafraichir('talents');
      break;

    /* --- grimoire --- */
    case 'ajouter-sort':
      c.grimoire.push({ id: Store.uid(), nom: '', effet: '' });
      Store.sauverBientot(c); rafraichir('grimoire');
      $('#sec-grimoire .ligne:last-child .ligne-titre')?.focus();
      break;
    case 'retirer-sort':
      c.grimoire.splice(index, 1);
      Store.sauverBientot(c); rafraichir('grimoire');
      break;

    /* --- sac --- */
    case 'ajouter-objet':
      c.sac.push({ id: Store.uid(), nom: '', qte: 1, notes: '' });
      Store.sauverBientot(c); rafraichir('sac');
      $('#sec-sac .ligne:last-child .ligne-titre')?.focus();
      break;
    case 'retirer-objet':
      c.sac.splice(index, 1);
      Store.sauverBientot(c); rafraichir('sac');
      break;
    case 'equipement-depart':
      c.sac = c.sac.concat(Store.equipementDepart());
      Store.sauverBientot(c); rafraichir('sac');
      break;

    /* --- progression --- */
    case 'ajouter-progres':
      c.progression.push({ id: Store.uid(), date: new Date().toISOString().slice(0, 10), texte: '' });
      Store.sauverBientot(c); rafraichir('experience');
      $('#sec-experience .ligne:last-child textarea')?.focus();
      break;
    case 'retirer-progres':
      c.progression.splice(index, 1);
      Store.sauverBientot(c); rafraichir('experience');
      break;
  }
});

/* Clavier dans la visionneuse (pratique quand l'app tourne sur un ordinateur). */
document.addEventListener('keydown', (e) => {
  const visionneuse = $('.visionneuse');
  if (!visionneuse) return;
  if (e.key === 'Escape') aller('#/galerie');
  if (e.key === 'ArrowLeft') $('.visionneuse-nav.gauche')?.click();
  if (e.key === 'ArrowRight') $('.visionneuse-nav.droite')?.click();
});

/* ------------------------------------------------------------------ */
/* Import / export                                                     */
/* ------------------------------------------------------------------ */

/* L'export embarque les images en base64 : une sauvegarde, c'est tout ou rien. */
function exporterFichier(bouton) {
  const libelle = bouton ? bouton.textContent : '';
  if (bouton) { bouton.disabled = true; bouton.textContent = 'Préparation…'; }
  Images.exporterToutes().then((images) => {
    const blob = new Blob([Store.exporterJSON(images)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donjon-et-chaton-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }).finally(() => {
    if (bouton) { bouton.disabled = false; bouton.textContent = libelle; }
  });
}

function lireFichierImport(fichier) {
  if (!fichier) return;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    let resultat;
    try {
      resultat = Store.importerJSON(lecteur.result, 'fusion');
    } catch (err) {
      alert('Fichier illisible : ' + err.message);
      return;
    }
    Promise.all(resultat.images.map((i) => Images.restaurer(i).catch(() => null)))
      /* Sauvegardes au format 2 : reporter les noms sur les images. */
      .then(() => Promise.all(resultat.noms.map((n) =>
        Images.majMeta(n.imageId, { nom: n.nom, categorie: n.categorie }).catch(() => null))))
      .then(rafraichirBibliotheque)
      .then(() => {
        const bouts = [`${resultat.chatons} fiche${resultat.chatons > 1 ? 's' : ''}`];
        if (resultat.images.length) {
          bouts.push(`${resultat.images.length} image${resultat.images.length > 1 ? 's' : ''}`);
        }
        alert('Importé : ' + bouts.join(', ') + '.');
        vueListe();
      });
  };
  lecteur.readAsText(fichier);
}

/* --- Prompt --- */

function copierPrompt(texte) {
  const retour = (message) => { const z = $('#prompt-retour'); if (z) z.textContent = message; };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texte)
      .then(() => retour('Prompt copié — colle-le dans Midjourney.'))
      .catch(() => retour('Copie refusée par le navigateur : sélectionne le texte à la main.'));
  } else {
    retour('Copie indisponible ici : sélectionne le texte à la main.');
  }
}

/* --- Import d'images --- */

function importerDansGalerie(fichiers) {
  if (!fichiers.length) return;
  const zone = $('#progression-import');
  const avancer = (n) => {
    if (!zone) return;
    zone.hidden = false;
    zone.textContent = `Import ${n}/${fichiers.length}…`;
  };

  /* Un fichier à la fois : plus doux pour la mémoire du téléphone. */
  let chaine = Promise.resolve();
  fichiers.forEach((fichier, n) => {
    chaine = chaine.then(() => {
      avancer(n + 1);
      /* La catégorie du filtre actif : on peut verser 20 monstres sans rien reclasser. */
      return Images.importer(fichier, {
        categorie: filtreGalerie === 'tout' ? 'monstre' : filtreGalerie,
      }).catch(() => null);
    });
  });
  chaine.then(rafraichirBibliotheque).then(vueGalerie);
}

/* ------------------------------------------------------------------ */
/* Démarrage                                                           */
/* ------------------------------------------------------------------ */

Store.charger();

/* Demandé dès le départ, et pas seulement au premier import d'image : la
   permission protège aussi le cache de la coquille, donc le démarrage
   hors connexion. */
Images.demanderPersistance();

/* Ancien format : les noms d'images vivaient dans une liste « galerie » à part.
   On les reporte sur les images elles-mêmes, puis on oublie l'ancienne liste. */
function migrerGalerie() {
  const aMigrer = Store.galerieAMigrer();
  if (!aMigrer.length) return Promise.resolve();
  return Promise.all(aMigrer.map((e) =>
    Images.majMeta(e.imageId, { nom: e.nom, categorie: e.categorie }).catch(() => null)
  )).then(() => Store.galerieOubliee());
}

migrerGalerie()
  .then(rafraichirBibliotheque)
  .then(() => { if (location.hash.startsWith('#/galerie')) vueGalerie(); });

window.addEventListener('hashchange', router);
router();

if ('serviceWorker' in navigator && !enLocal) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(surveillerHorsLigne).catch(() => {});
  });
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  if (window.caches) caches.keys().then((cles) => cles.forEach((c) => caches.delete(c)));
}

/* Accès aux modules depuis la console, en développement seulement. */
if (enLocal) window.DC = { Store, Images, Prompts, Bibliotheque };
