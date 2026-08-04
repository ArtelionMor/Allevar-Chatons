/* Donjon & Chaton — sélecteur d'image.
 *
 * Une seule bibliothèque pour toute l'app : les images importées pour la
 * galerie sont réutilisables sur un talent, une qualité ou un portrait sans
 * avoir à les réimporter. D'où ce sélecteur commun.
 */

import * as Images from './images.js';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Ouvre le sélecteur. Résout avec :
 *   - un identifiant d'image si l'utilisateur en choisit une
 *   - null s'il choisit « aucune image »
 *   - false s'il annule
 */
export function choisir({ titre = 'Choisir une image', actuel = null } = {}) {
  return Images.lister().then((images) => new Promise((resolve) => {
    const fond = document.createElement('div');
    fond.className = 'modale';
    fond.innerHTML = `
      <div class="modale-boite" role="dialog" aria-modal="true" aria-label="${esc(titre)}">
        <header class="modale-tete">
          <h2>${esc(titre)}</h2>
          <button type="button" class="btn-icone" data-fermer aria-label="Fermer">✕</button>
        </header>

        <div class="modale-outils">
          <input type="search" class="modale-recherche" placeholder="Rechercher…" aria-label="Rechercher une image">
          <button type="button" class="btn btn-principal" data-importer>+ Importer</button>
        </div>

        <div class="modale-corps">
          ${actuel ? '<button type="button" class="btn btn-ajout" data-retirer>Retirer l’image</button>' : ''}
          <ul class="grille grille-choix"></ul>
          <p class="vide-mini" data-aucune hidden>Aucune image dans la bibliothèque.
            Importe-en une, elle restera disponible partout dans l’app.</p>
        </div>
      </div>
      <input type="file" accept="image/*" multiple hidden data-fichier>
    `;
    document.body.appendChild(fond);
    document.body.classList.add('modale-ouverte');

    const liste = fond.querySelector('.grille-choix');
    const recherche = fond.querySelector('.modale-recherche');
    const fichier = fond.querySelector('[data-fichier]');
    let disponibles = images;

    function peindre() {
      const q = recherche.value.trim().toLowerCase();
      const vues = q
        ? disponibles.filter((i) => (i.nom || '').toLowerCase().includes(q))
        : disponibles;

      fond.querySelector('[data-aucune]').hidden = disponibles.length > 0;
      liste.innerHTML = vues.map((i) => `
        <li class="vignette ${i.id === actuel ? 'vignette-active' : ''}">
          <button type="button" class="vignette-image" data-choix="${esc(i.id)}">
            <img data-image="${esc(i.id)}" alt="${esc(i.nom || 'Image')}">
          </button>
          <p class="vignette-nom">${esc(i.nom || 'Sans nom')}</p>
        </li>`).join('');

      liste.querySelectorAll('[data-image]').forEach((el) => {
        Images.url(el.dataset.image).then((u) => { if (u) el.src = u; });
      });
    }

    function fermer(valeur) {
      document.body.classList.remove('modale-ouverte');
      fond.remove();
      document.removeEventListener('keydown', surTouche);
      resolve(valeur);
    }

    function surTouche(e) { if (e.key === 'Escape') fermer(false); }

    fond.addEventListener('click', (e) => {
      if (e.target === fond || e.target.closest('[data-fermer]')) return fermer(false);
      if (e.target.closest('[data-retirer]')) return fermer(null);
      if (e.target.closest('[data-importer]')) return fichier.click();
      const choix = e.target.closest('[data-choix]');
      if (choix) fermer(choix.dataset.choix);
    });

    fichier.addEventListener('change', () => {
      const fichiers = Array.from(fichier.files);
      fichier.value = '';
      if (!fichiers.length) return;
      /* Un par un : plus doux pour la mémoire du téléphone. */
      let chaine = Promise.resolve();
      let dernier = null;
      fichiers.forEach((f) => {
        chaine = chaine.then(() => Images.importer(f).then((img) => { dernier = img.id; }).catch(() => null));
      });
      chaine.then(() => Images.lister()).then((maj) => {
        disponibles = maj;
        /* Un import unique vaut choix : c'est ce que l'utilisateur voulait. */
        if (fichiers.length === 1 && dernier) return fermer(dernier);
        peindre();
      });
    });

    recherche.addEventListener('input', peindre);
    document.addEventListener('keydown', surTouche);
    peindre();
  }));
}
