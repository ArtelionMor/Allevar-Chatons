/* Donjon & Chaton — données de référence du jeu (extraites de la fiche de perso) */

export const QUALITES = [
  { id: 'costaud', nom: 'Costaud' },
  { id: 'malin',   nom: 'Malin' },
  { id: 'mignon',  nom: 'Mignon' },
  { id: 'coeur',   nom: 'Cœur' },
  { id: 'amitie',  nom: 'Amitié' },
];

export const TALENTS_GAUCHE = [
  'Bouger son popotin',
  'Bricoler des trucs et des machins',
  'Connaître les lois et les légendes',
  'Connaître les pays et les peuples',
  'Convaincre et baratiner',
  'Cueillir et chasser',
  'Cuisiner',
  'Dessiner et peindre',
  'Faire de la musique',
  'Faire les poches',
  'Feuler et menacer',
  'Griffer',
];

export const TALENTS_DROITE = [
  'Herboriser',
  'Lire et écrire',
  'Lire le ciel et les étoiles',
  'Observer et fouiller',
  'Rester calme et impassible',
  "S'occuper des bêtes",
  'Se cacher dans les ombres',
  'Se déplacer en silence',
  'Séduire et charmer',
  'Soigner blessures et maladies',
  'Trouver son chemin',
  'Trouver une information',
];

export const TALENTS = [...TALENTS_GAUCHE, ...TALENTS_DROITE];

export const EQUIPEMENT_DEPART = [
  'une couverture en laine',
  'un couteau de poche',
  'une cuillère en bois',
  'un petit caquelon de fonte',
  'une grande gourde en cuir',
  'un briquet à amadou',
  'des morceaux de chandelle',
  'un morceau de savon',
  'une brosse',
  'un paquet de croquettes de route',
];

export const REGLES = [
  ['Agir', 'lancer 3d6, chaque résultat inférieur ou égal au score de la Qualité est un succès'],
  ['Seuil de difficulté', 'facile 1, moyen 2, difficile 3, légendaire 4'],
  ['Triple', 'réussi ou raté, le Chaton obtient un petit quelque chose à son action'],
  ['Talent', 'donne un Avantage. Avantage : lancer 4d6. Désavantage : lancer 2d6'],
  ['Objets', 'si utile, relancer 1d6 dont le résultat ne convient pas'],
  ['Caractère', "si positif, gagner 1 Avantage / si négatif, offrir un point d'Amitié"],
];

export const QUALITE_MAX = 6;
