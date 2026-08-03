/* Donjon & Chaton — application principale (vues + interactions) */

import {
  QUALITES, TALENTS_GAUCHE, TALENTS_DROITE, REGLES, QUALITE_MAX,
} from './data.js';
import * as Store from './store.js';
import * as Images from './images.js';

const app = document.getElementById('app');

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
    vueGalerie();
  } else if (vue === 'montrer' && Store.galerieGet(id)) {
    chatonCourant = null;
    vueVisionneuse(id);
  } else {
    chatonCourant = null;
    vueListe();
  }
  if (vue !== 'montrer') window.scrollTo(0, 0);
}

function onglets(actif) {
  const lien = (href, cle, texte) =>
    `<a class="onglet ${actif === cle ? 'actif' : ''}" href="${href}">${texte}</a>`;
  return `<nav class="onglets">${lien('#/', 'fiches', 'Fiches')}${lien('#/galerie', 'galerie', 'Galerie')}</nav>`;
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
      <p class="aide" id="espace-disque"></p>
      <div class="rangee-boutons">
        <button class="btn" data-action="exporter">Exporter (.json)</button>
        <button class="btn" data-action="importer">Importer…</button>
      </div>
      <input type="file" id="fichier-import" accept="application/json,.json" hidden>
    </section>
  `;
  afficherEspace();
}

/** Affiche l'espace occupé et si le stockage est protégé de l'effacement. */
function afficherEspace() {
  const cible = $('#espace-disque');
  if (!cible) return;
  Promise.all([Images.estimerEspace(), Images.lister()]).then(([espace, images]) => {
    if (!$('#espace-disque')) return;
    const bouts = [];
    if (images.length) {
      const poids = images.reduce((somme, i) => somme + (i.taille || 0), 0);
      bouts.push(`${images.length} image${images.length > 1 ? 's' : ''} (${Images.formaterOctets(poids)})`);
    }
    if (espace && espace.quota) {
      bouts.push(`${Images.formaterOctets(espace.utilise)} utilisés sur ${Images.formaterOctets(espace.quota)} disponibles`);
    }
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
      ${sectionRegles()}
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
      ${champ('Enfance', 'enfance', c.enfance, { multi: true, placeholder: 'Où et comment a-t-il grandi ?' })}
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
             <button type="button" class="btn-icone" data-action="choisir-portrait" title="Remplacer">↺</button>
             <button type="button" class="btn-icone danger" data-action="retirer-portrait" title="Retirer">✕</button>
           </div>`
        : `<button type="button" class="portrait-ajout" data-action="choisir-portrait">
             <span class="portrait-icone">🐾</span>
             <span>Ajouter un portrait</span>
           </button>`}
    </div>
    <input type="file" id="fichier-portrait" accept="image/*" hidden>
  `;
}

/* --- Qualités --- */

function sectionQualites(c) {
  return `
    <section class="bloc">
      <h2>Qualités</h2>
      <p class="aide">Score de 0 à ${QUALITE_MAX}. On lance 3d6 : chaque dé ≤ au score est un succès.</p>
      <ul class="qualites">
        ${QUALITES.map((q) => ligneQualite(q.nom, c.qualites[q.id] || 0, `qualites.${q.id}`)).join('')}
        ${c.qualitesCustom.map((q, i) => ligneQualite(q.nom, q.valeur || 0, `qualitesCustom.${i}.valeur`, {
          nomChemin: `qualitesCustom.${i}.nom`, index: i,
        })).join('')}
      </ul>
      <button class="btn btn-ajout" data-action="ajouter-qualite">+ Qualité personnalisée</button>
    </section>
  `;
}

function ligneQualite(nom, valeur, chemin, opts = {}) {
  const editable = !!opts.nomChemin;
  return `
    <li class="qualite">
      ${editable
        ? `<input class="qualite-nom modifiable" type="text" data-champ="${opts.nomChemin}" value="${esc(nom)}" placeholder="Nom de la qualité">`
        : `<span class="qualite-nom">${esc(nom)}</span>`}
      <span class="stepper">
        <button type="button" class="btn-step" data-action="qualite-moins" data-chemin="${chemin}" aria-label="Diminuer">−</button>
        <span class="stepper-valeur" data-valeur="${chemin}">${valeur}</span>
        <button type="button" class="btn-step" data-action="qualite-plus" data-chemin="${chemin}" aria-label="Augmenter">+</button>
      </span>
      ${editable ? `<button type="button" class="btn-icone danger" data-action="retirer-qualite" data-index="${opts.index}" title="Retirer">✕</button>` : ''}
    </li>
  `;
}

/* --- Talents --- */

function sectionTalents(c) {
  const colonne = (liste) => `
    <ul class="talents">
      ${liste.map((t) => `
        <li>
          <label class="case">
            <input type="checkbox" data-talent="${esc(t)}" ${c.talents[t] ? 'checked' : ''}>
            <span>${esc(t)}</span>
          </label>
        </li>`).join('')}
    </ul>`;

  return `
    <section class="bloc">
      <h2>Talents</h2>
      <p class="aide">Un talent adapté donne un Avantage (4d6).</p>
      <div class="talents-colonnes">
        ${colonne(TALENTS_GAUCHE)}
        ${colonne(TALENTS_DROITE)}
      </div>

      ${c.talentsCustom.length ? `
        <h3>Talents personnalisés</h3>
        <ul class="talents talents-perso">
          ${c.talentsCustom.map((t, i) => `
            <li>
              <label class="case">
                <input type="checkbox" data-champ-case="talentsCustom.${i}.coche" ${t.coche ? 'checked' : ''}>
              </label>
              <input class="modifiable" type="text" data-champ="talentsCustom.${i}.nom" value="${esc(t.nom)}" placeholder="Nouveau talent">
              <button type="button" class="btn-icone danger" data-action="retirer-talent" data-index="${i}" title="Retirer">✕</button>
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
      <p class="aide">Les sorts que le Chaton connaît.</p>
      ${c.grimoire.length === 0 ? '<p class="vide-mini">Aucun sort pour l’instant.</p>' : `
        <ul class="cartes-lignes">
          ${c.grimoire.map((s, i) => `
            <li class="ligne">
              <div class="ligne-corps">
                <input class="ligne-titre" type="text" data-champ="grimoire.${i}.nom" value="${esc(s.nom)}" placeholder="Nom du sort">
                <textarea rows="2" data-champ="grimoire.${i}.effet" placeholder="Effet, coût, limites…">${esc(s.effet)}</textarea>
              </div>
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
      <p class="aide">Un objet utile permet de relancer 1d6 qui ne convient pas.</p>
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

function sectionRegles() {
  return `
    <details class="bloc bloc-regles">
      <summary><h2>Règles du jeu</h2></summary>
      <dl class="regles">
        ${REGLES.map(([titre, texte]) => `<dt>${esc(titre)}</dt><dd>${esc(texte)}</dd>`).join('')}
      </dl>
    </details>
  `;
}

/* ------------------------------------------------------------------ */
/* Vue : galerie (ce qu'on montre aux enfants pendant la partie)       */
/* ------------------------------------------------------------------ */

function entreesFiltrees() {
  const tous = Store.galerieTous();
  return filtreGalerie === 'tout' ? tous : tous.filter((e) => e.categorie === filtreGalerie);
}

function vueGalerie() {
  const entrees = entreesFiltrees();
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
          ? Store.galerieTous().length
          : Store.galerieTous().filter((e) => e.categorie === id).length;
        return `<button class="puce ${filtreGalerie === id ? 'actif' : ''}" data-action="filtrer" data-filtre="${id}">${nom}${n ? ` <span class="puce-n">${n}</span>` : ''}</button>`;
      }).join('')}
    </div>

    ${entrees.length === 0 ? `
      <p class="vide">
        ${Store.galerieTous().length === 0
          ? 'Rien dans la galerie.<br>Ajoute les images préparées pour ta partie&nbsp;: elles resteront disponibles sans connexion.'
          : 'Rien dans cette catégorie.'}
      </p>
    ` : `
      <ul class="grille">
        ${entrees.map((e) => `
          <li class="vignette" data-entree="${e.id}">
            <button type="button" class="vignette-image" data-action="montrer" data-id="${e.id}">
              ${e.imageId
                ? `<img data-image="${esc(e.imageId)}" alt="${esc(e.nom || 'Image')}">`
                : '<span class="vignette-absente">image manquante</span>'}
            </button>
            <div class="vignette-infos">
              <input class="modifiable" type="text" data-galerie="${e.id}.nom" value="${esc(e.nom)}" placeholder="Nom">
              <div class="vignette-bas">
                <select data-galerie="${e.id}.categorie">
                  ${Store.CATEGORIES.map((c) => `<option value="${c.id}" ${e.categorie === c.id ? 'selected' : ''}>${c.nom}</option>`).join('')}
                </select>
                <button type="button" class="btn-icone danger" data-action="supprimer-entree" data-id="${e.id}" title="Supprimer">✕</button>
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
  const liste = entreesFiltrees();
  const i = liste.findIndex((e) => e.id === id);
  const entree = liste[i] || Store.galerieGet(id);
  const precedent = i > 0 ? liste[i - 1] : null;
  const suivant = i >= 0 && i < liste.length - 1 ? liste[i + 1] : null;

  app.innerHTML = `
    <div class="visionneuse">
      <button class="visionneuse-fermer" data-action="fermer-visionneuse" aria-label="Fermer">✕</button>
      ${precedent ? `<a class="visionneuse-nav gauche" href="#/montrer/${precedent.id}" aria-label="Précédent">‹</a>` : ''}
      ${suivant ? `<a class="visionneuse-nav droite" href="#/montrer/${suivant.id}" aria-label="Suivant">›</a>` : ''}
      ${entree.imageId
        ? `<img data-image="${esc(entree.imageId)}" alt="${esc(entree.nom || 'Image')}">`
        : '<p class="vide">Image manquante.</p>'}
      ${entree.nom ? `<p class="visionneuse-nom">${esc(entree.nom)}</p>` : ''}
    </div>
  `;
  peindreImages();
}

/* ------------------------------------------------------------------ */
/* Vue : impression                                                    */
/* ------------------------------------------------------------------ */

function vueImpression(c) {
  const talentsCoches = [
    ...[...TALENTS_GAUCHE, ...TALENTS_DROITE].filter((t) => c.talents[t]),
    ...c.talentsCustom.filter((t) => t.coche).map((t) => t.nom),
  ];
  const ligne = (label, valeur) => valeur
    ? `<p class="pr-champ"><span class="pr-label">${esc(label)}</span> ${esc(valeur)}</p>` : '';

  app.innerHTML = `
    <header class="barre sans-impression">
      <a class="btn-retour" href="#/fiche/${c.id}">‹ Retour</a>
      <button class="btn btn-principal" data-action="lancer-impression">🖨 Imprimer</button>
    </header>

    <article class="feuille">
      <div class="pr-entete">
        ${c.portraitId ? `<img class="pr-portrait" data-image="${esc(c.portraitId)}" alt="">` : ''}
        <div>
          <h1 class="pr-nom">${esc(c.nom || 'Chaton sans nom')}</h1>
          <p class="pr-sous">Niveau ${c.experience.niveau || 1}${c.joueuse ? ' · ' + esc(c.joueuse) : ''}</p>
        </div>
      </div>

      <div class="pr-colonnes">
        <section class="pr-bloc">
          <h2>Le Chaton</h2>
          ${ligne('Enfance :', c.enfance)}
          ${ligne('Caractère :', c.caractere)}
          ${ligne('Don de naissance :', c.donNaissance)}
        </section>

        <section class="pr-bloc">
          <h2>Qualités</h2>
          <ul class="pr-qualites">
            ${QUALITES.map((q) => `<li><span>${esc(q.nom)}</span><b>${c.qualites[q.id] || 0}</b></li>`).join('')}
            ${c.qualitesCustom.map((q) => `<li><span>${esc(q.nom)}</span><b>${q.valeur || 0}</b></li>`).join('')}
          </ul>
        </section>
      </div>

      <section class="pr-bloc">
        <h2>Talents</h2>
        ${talentsCoches.length
          ? `<ul class="pr-talents">${talentsCoches.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
          : '<p class="pr-vide">Aucun talent coché.</p>'}
      </section>

      ${c.grimoire.length ? `
        <section class="pr-bloc">
          <h2>Grimoire</h2>
          <ul class="pr-liste">
            ${c.grimoire.map((s) => `<li><b>${esc(s.nom)}</b>${s.effet ? ' — ' + esc(s.effet) : ''}</li>`).join('')}
          </ul>
        </section>` : ''}

      ${c.sac.length ? `
        <section class="pr-bloc">
          <h2>Sac de voyage</h2>
          <ul class="pr-liste">
            ${c.sac.map((o) => `<li>${(o.qte || 1) > 1 ? esc(o.qte) + ' × ' : ''}${esc(o.nom)}${o.notes ? ' (' + esc(o.notes) + ')' : ''}</li>`).join('')}
          </ul>
        </section>` : ''}

      ${c.progression.length ? `
        <section class="pr-bloc">
          <h2>Progression</h2>
          <ul class="pr-liste">
            ${c.progression.map((p) => `<li>${p.date ? '<b>' + esc(dateFR(p.date)) + '</b> — ' : ''}${esc(p.texte)}</li>`).join('')}
          </ul>
        </section>` : ''}

      ${c.notes ? `<section class="pr-bloc"><h2>Notes</h2><p>${esc(c.notes)}</p></section>` : ''}

      <section class="pr-bloc pr-regles">
        <h2>Règles</h2>
        <dl>${REGLES.map(([t, x]) => `<dt>${esc(t)}</dt><dd>${esc(x)}</dd>`).join('')}</dl>
      </section>
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
  } else if (el.id === 'fichier-portrait') {
    importerPortrait(el.files[0]);
    el.value = '';
  } else if (el.id === 'fichier-galerie') {
    importerDansGalerie(Array.from(el.files));
    el.value = '';
  } else if (el.dataset.galerie) {
    const [id, cle] = el.dataset.galerie.split('.');
    const entree = Store.galerieGet(id);
    if (entree) { entree[cle] = el.value; Store.sauver(); }
  }
});

/* Le nom d'une entrée de galerie se tape : on enregistre sans re-rendre. */
app.addEventListener('input', (e) => {
  const el = e.target;
  if (!el.dataset.galerie) return;
  const [id, cle] = el.dataset.galerie.split('.');
  const entree = Store.galerieGet(id);
  if (entree) { entree[cle] = el.value; Store.sauverBientot(null); }
});

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
    case 'choisir-portrait':
      $('#fichier-portrait').click();
      break;
    case 'retirer-portrait': {
      const ancien = c.portraitId;
      c.portraitId = null;
      Store.sauver();
      rafraichir('portrait');
      if (ancien) Images.supprimer(ancien);
      break;
    }
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
    case 'supprimer-entree': {
      const entree = Store.galerieGet(btn.dataset.id);
      if (entree && confirm(`Retirer « ${entree.nom || 'cette image'} » de la galerie ?`)) {
        Store.galerieSupprimer(entree.id);
        if (entree.imageId) Images.supprimer(entree.imageId);
        vueGalerie();
      }
      break;
    }

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
    Promise.all(resultat.images.map((i) => Images.restaurer(i).catch(() => null))).then(() => {
      const bouts = [`${resultat.chatons} fiche${resultat.chatons > 1 ? 's' : ''}`];
      if (resultat.galerie) bouts.push(`${resultat.galerie} image${resultat.galerie > 1 ? 's' : ''} de galerie`);
      alert('Importé : ' + bouts.join(', ') + '.');
      vueListe();
    });
  };
  lecteur.readAsText(fichier);
}

/* --- Import d'images --- */

function importerPortrait(fichier) {
  const c = chatonCourant;
  if (!fichier || !c) return;
  const ancien = c.portraitId;
  Images.importer(fichier).then((image) => {
    c.portraitId = image.id;
    Store.sauver();
    rafraichir('portrait');
    if (ancien) Images.supprimer(ancien);
  }).catch((err) => alert('Image impossible à charger : ' + err.message));
}

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
      return Images.importer(fichier).then((image) => {
        Store.galerieAjouter({
          nom: (fichier.name || '').replace(/\.[^.]+$/, ''),
          categorie: filtreGalerie === 'tout' ? 'monstre' : filtreGalerie,
          imageId: image.id,
        });
      }).catch(() => null);
    });
  });
  chaine.then(() => vueGalerie());
}

/* ------------------------------------------------------------------ */
/* Démarrage                                                           */
/* ------------------------------------------------------------------ */

Store.charger();
window.addEventListener('hashchange', router);
router();

/* Mode hors-ligne. Désactivé en local (localhost) : le cache y masquerait
   les modifications en cours de développement. */
const enLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && !enLocal) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  if (window.caches) caches.keys().then((cles) => cles.forEach((c) => caches.delete(c)));
}

/* Accès aux modules depuis la console, en développement seulement. */
if (enLocal) window.DC = { Store, Images };
