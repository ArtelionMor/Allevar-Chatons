# Donjon & Chaton — application de fiches

Application web installable (PWA) pour créer, suivre et imprimer les fiches de
personnage de *Donjon & Chaton*. Tout est stocké **sur l'appareil** : aucune
connexion n'est nécessaire une fois la page chargée une première fois.

## Lancer en local

```bash
python3 -m http.server 8793 --directory "/Users/teliausimontroalen/Donjon & Chaton/app"
```

Puis ouvrir http://localhost:8793. En local le service worker est désactivé,
pour que les modifications apparaissent immédiatement.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Coquille de l'application |
| `css/styles.css` | Styles écran (mobile d'abord) **et** styles d'impression |
| `js/data.js` | Données de référence du jeu : qualités, talents, règles, équipement |
| `js/store.js` | Modèle de fiche + galerie, persistance `localStorage`, import/export |
| `js/images.js` | Images : réduction à l'import, stockage IndexedDB, sauvegarde |
| `js/app.js` | Vues (liste, fiche, galerie, visionneuse, impression) et interactions |
| `sw.js` | Service worker : fonctionnement hors-ligne |
| `manifest.webmanifest` | Installation sur l'écran d'accueil |

## Ce que contient une fiche

- **Le Chaton** : nom, joueuse/joueur, enfance, caractère, don de naissance
- **Qualités** : Costaud, Malin, Mignon, Cœur, Amitié (0–6) + qualités personnalisées
- **Talents** : les 24 talents du livre + talents personnalisés
- **Grimoire** : sorts connus (nom + effet)
- **Sac de voyage** : objets, quantité, note ; bouton « équipement de départ »
- **Expérience** : niveau, points, journal de progression daté
- **Notes libres**
- **Règles** en pense-bête repliable

## Vues

- `#/` — liste des chatons (imprimer, dupliquer, supprimer, export/import JSON)
- `#/fiche/<id>` — édition, sauvegarde automatique
- `#/imprimer/<id>` — mise en page propre pour l'impression papier
- `#/galerie` — images de partie, filtrables par catégorie
- `#/montrer/<id>` — plein écran, à montrer aux enfants (flèches ou clavier ← → Échap)

## Les images et le mode hors-ligne

Point d'architecture important : **les images ne passent pas par le service worker.**

Un service worker met en cache des fichiers *livrés avec le site*. Une image
n'y atterrit que si elle a été téléchargée au moins une fois en ligne, et le
navigateur a le droit de vider ce cache quand il veut. C'est exactement ainsi
qu'un jeu perd ses sprites en mode avion.

Ici les images sont **tes données** :

1. tu les importes depuis le téléphone (« + Images », ou le portrait sur la fiche) ;
2. elles sont réduites à 1600 px et ré-encodées en JPEG (une image Midjourney de
   plusieurs Mo tombe à ~300 Ko) ;
3. elles sont rangées en **IndexedDB** sous forme de Blob et affichées via des
   URL `blob:` — aucune requête réseau, jamais ;
4. `navigator.storage.persist()` est demandé au premier import pour que le
   navigateur ne les évince pas ;
5. elles partent dans l'export `.json` (en base64), donc une sauvegarde restaure
   fiches **et** images sur un autre appareil.

Le service worker ne garde que la coquille : 6 fichiers, quelques dizaines de Ko.

Pour que le stockage soit durable sur iOS, installer l'app sur l'écran d'accueil
plutôt que de la laisser dans un onglet Safari.

## Mise en ligne

En ligne ici : **https://artelionmor.github.io/Allevar-Chatons/**

Ce dossier est la racine du dépôt `ArtelionMor/Allevar-Chatons`, publié par
GitHub Pages depuis la branche `main`. Déployer = pousser :

```bash
git push
```

Le site est reconstruit en une à deux minutes.

**À chaque modification d'un fichier de la coquille, incrémenter `CACHE` dans
`sw.js`.** Sans ça, les appareils qui ont déjà installé l'app continuent
d'afficher l'ancienne version depuis leur cache.

### Installer sur le téléphone

Ouvrir l'URL **dans Safari** (iOS ne laisse que Safari installer une PWA),
bouton Partager → *Sur l'écran d'accueil*. C'est cette étape qui rend le
stockage durable : dans un simple onglet, iOS s'autorise à faire le ménage
dans les données au bout de quelques jours d'inactivité.

## À venir

- Réordonner les entrées de la galerie (glisser-déposer)
- Notes de MJ attachées à une image (à ne pas montrer aux enfants)
- Lien entre une fiche et les images d'une partie
