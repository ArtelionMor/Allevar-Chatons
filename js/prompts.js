/* Donjon & Chaton — bibliothèque de prompts.
 *
 * Chaque choix proposé à l'enfant est relié à un morceau de prompt en anglais
 * (Midjourney comprend mieux l'anglais). Le prompt final est l'assemblage de
 * ces morceaux.
 *
 * ⚠ Les listes ci-dessous sont des EXEMPLES pour faire tourner la mécanique.
 * Remplace-les par tes vraies listes : seuls `nom` (ce que voit l'enfant) et
 * `fragment` (ce que reçoit Midjourney) comptent.
 */

export const AXES = [
  {
    id: 'fond',
    nom: 'Fond',
    aide: 'Le décor, emprunté à un tableau',
    /* Décrire la SCÈNE uniquement, jamais la manière de peindre : le style est
       l'affaire de l'axe « Style ». Deux directives de style se contredisent. */
    options: [
      /* Fond neutre : un vrai choix, différent de « ne rien choisir ». C'est le
         parti des illustrations du jeu, personnage détouré sur aplat. */
      { id: 'aucun', nom: 'Sans décor', fragment: 'on a plain flat pastel background with no scenery' },

      /* Œuvres dont tu as l'image dans « images ref » */
      { id: 'kanagawa', nom: 'La Grande Vague de Kanagawa', fragment: 'a huge cresting ocean wave towering behind, Mount Fuji small in the distance' },
      { id: 'nuit-etoilee', nom: 'La Nuit étoilée', fragment: 'a swirling night sky full of stars above a sleeping village and a dark cypress' },
      { id: 'semeur', nom: 'Le Semeur au soleil couchant', fragment: 'a ploughed field at dusk, an enormous low sun filling the sky behind' },
      { id: 'voyageur', nom: 'Le Voyageur contemplant une mer de nuages', fragment: 'a rocky summit above an endless sea of clouds and distant peaks' },
      { id: 'rousseau', nom: 'Surpris !', fragment: 'deep in a dense jungle of broad stylised leaves, lashing rain and a flash of lightning' },
      { id: 'chihiro', nom: 'Le voyage de Chihiro', fragment: 'before a towering spirit bathhouse at dusk, red lanterns glowing along its balconies' },
      { id: 'azur', nom: 'Azur & Asmar', fragment: 'in an ornate palace courtyard of arabesque tilework, arches and fountains' },

      /* Ajouts — images à récupérer si tu veux les montrer aux enfants */
      { id: 'radeau', nom: 'Le Radeau de la Méduse', fragment: 'on a makeshift raft on a heaving stormy sea, a torn sail against dark clouds' },
      { id: 'cri', nom: 'Le Cri', fragment: 'on a wooden bridge above a fjord, the sky burning orange and red in wavy bands' },
      { id: 'liberte', nom: 'La Liberté guidant le peuple', fragment: 'atop a barricade of broken timber in drifting smoke, a city rooftop beyond' },
      { id: 'chambre-arles', nom: 'La Chambre à Arles', fragment: 'in a small bedroom with tilted perspective, a wooden bed, blue walls and yellow furniture' },
      { id: 'dejeuner', nom: 'Le Déjeuner sur l’herbe', fragment: 'in a shaded woodland clearing beside a picnic spread on the grass' },
      { id: 'ronde-nuit', nom: 'La Ronde de nuit', fragment: 'under a dark stone archway, warm lantern light picking figures out of deep shadow' },
      { id: 'menines', nom: 'Les Ménines', fragment: 'in a tall dim palace room hung with paintings, a mirror on the far wall' },
      { id: 'venus', nom: 'La Naissance de Vénus', fragment: 'on a giant scallop shell drifting on a calm sea, flowers falling through the air' },
      { id: 'babel', nom: 'La Tour de Babel', fragment: 'before a colossal spiral tower under construction, ramps and arches spiralling into cloud' },
      { id: 'chasseurs-neige', nom: 'Les Chasseurs dans la neige', fragment: 'on a snowy hilltop above a frozen village, bare black trees and distant skaters' },
      { id: 'jardin-delices', nom: 'Le Jardin des délices', fragment: 'in a fantastical garden of giant fruit, bubbles and strange pink structures' },
      { id: 'nighthawks', nom: 'Nighthawks', fragment: 'outside a late-night corner diner, green light spilling through the glass onto an empty street' },
      { id: 'baiser', nom: 'Le Baiser', fragment: 'in a meadow of small flowers, everything wrapped in golden mosaic patterns' },
      { id: 'american-gothic', nom: 'American Gothic', fragment: 'in front of a white wooden farmhouse with a pointed gothic window' },
      { id: 'soleil-levant', nom: 'Impression, soleil levant', fragment: 'in a misty harbour at dawn, an orange sun low over the water and ghostly masts' },
      { id: 'cathedrale', nom: 'La Cathédrale de Rouen', fragment: 'before the vast carved facade of a gothic cathedral dissolving in coloured light' },
      { id: 'moulin-galette', nom: 'Le Bal du moulin de la Galette', fragment: 'at an outdoor dance under trees, dappled sunlight falling through the leaves' },
      { id: 'persistance', nom: 'La Persistance de la mémoire', fragment: 'in an empty desert with distant cliffs, soft melting clocks draped over a bare branch' },
      { id: 'joueurs-cartes', nom: 'Les Joueurs de cartes', fragment: 'at a table in a dim tavern, a bottle and scattered cards, a curtain behind' },
      { id: 'nuit-rhone', nom: 'La Nuit étoilée sur le Rhône', fragment: 'on a dark riverbank at night, gaslights trailing long reflections across the water' },
      { id: 'pont-japonais', nom: 'Le Pont japonais', fragment: 'on an arched green footbridge over a pond choked with water lilies and drooping willows' },
    ],
  },
  {
    id: 'pose',
    nom: 'Pose',
    aide: 'La posture, empruntée à un tableau connu',
    options: [
      /* Aucune contrainte de posture : Midjourney fait ce qu'il veut. */
      { id: 'libre', nom: 'Pose libre', fragment: '' },

      /* Œuvres dont tu as l'image dans « images ref » */
      { id: 'perle', nom: 'La Jeune Fille à la perle', fragment: 'glancing back over one shoulder, turned toward the viewer, lips slightly parted' },
      { id: 'voyageur', nom: 'Le Voyageur contemplant une mer de nuages', fragment: 'seen from behind, one foot planted on a rock, gazing away into the distance' },
      { id: 'semeur', nom: 'Le Semeur', fragment: 'caught mid-stride, one arm sweeping wide to scatter seed' },
      { id: 'ombrelle', nom: 'La Femme à l’ombrelle', fragment: 'standing in profile on a windy slope, holding a parasol, clothes streaming sideways' },
      { id: 'rousseau', nom: 'Surpris !', fragment: 'crouched low and startled, eyes wide, ready to spring' },

      /* Ajouts — postures reconnaissables au premier coup d'œil */
      { id: 'joconde', nom: 'La Joconde', fragment: 'seated in three-quarter view, hands folded one over the other, a faint enigmatic smile' },
      { id: 'penseur', nom: 'Le Penseur', fragment: 'sitting hunched forward on a rock, chin resting on the back of one hand' },
      { id: 'liberte', nom: 'La Liberté guidant le peuple', fragment: 'striding forward over rubble, one arm raised high holding a banner' },
      { id: 'cri', nom: 'Le Cri', fragment: 'facing the viewer, both hands pressed to the cheeks, mouth open in a wail' },
      { id: 'vitruve', nom: 'L’Homme de Vitruve', fragment: 'facing forward, arms and legs stretched out symmetrically, perfectly frontal' },
      { id: 'creation', nom: 'La Création d’Adam', fragment: 'reclining and propped on one elbow, the other arm extended, one finger reaching out' },
      { id: 'david', nom: 'Le David', fragment: 'standing at ease with the weight on one leg, head turned to the side, a sling over the shoulder' },
      { id: 'napoleon', nom: 'Bonaparte franchissant le Grand-Saint-Bernard', fragment: 'riding a rearing mount, cloak flying, one arm flung up to point ahead' },
      { id: 'american-gothic', nom: 'American Gothic', fragment: 'standing stiffly face-on, solemn expression, holding a pitchfork upright' },
      { id: 'fils-homme', nom: 'Le Fils de l’homme', fragment: 'standing straight facing the viewer, arms at the sides, a green apple floating before the face' },
      { id: 'laitiere', nom: 'La Laitière', fragment: 'leaning over a table, carefully pouring from a jug held in both hands' },
      { id: 'danse', nom: 'La Danse', fragment: 'caught mid-leap, arms flung wide, body arched backwards' },
      { id: 'whistler', nom: 'Arrangement en gris et noir', fragment: 'seated in strict profile on a plain chair, hands resting quietly in the lap' },
      { id: 'saint-georges', nom: 'Saint Georges terrassant le dragon', fragment: 'standing braced with a spear pointed down at a fallen foe' },
      { id: 'discobole', nom: 'Le Discobole', fragment: 'twisted around, one arm drawn far back holding a disc, about to hurl it' },
      { id: 'samothrace', nom: 'La Victoire de Samothrace', fragment: 'leaning into the wind, chest forward, great wings spread wide behind' },
      { id: 'angelus', nom: 'L’Angélus', fragment: 'standing still with the head bowed and the hands clasped, hat held to the chest' },
      { id: 'odalisque', nom: 'La Grande Odalisque', fragment: 'lying stretched out on cushions, looking back over one shoulder at the viewer' },
      { id: 'durer', nom: 'Le Chevalier, la Mort et le Diable', fragment: 'riding steadily forward in profile, lance held upright, unflinching' },
      { id: 'ronde-nuit', nom: 'La Ronde de nuit', fragment: 'stepping forward out of shadow, one hand extended toward the viewer' },
      { id: 'dejeuner', nom: 'Le Déjeuner sur l’herbe', fragment: 'sitting on the grass, one knee drawn up, chin on hand, looking straight at the viewer' },
    ],
  },
  {
    id: 'animal',
    nom: 'Animal',
    aide: 'Qui est le personnage',
    /* L'espèce ne vit QUE dans cet axe : le socle dit « animal », pas « chaton »,
       sinon un lézard se retrouverait avec une tête de chat. */
    options: [
      { id: 'lezard', nom: 'Lézard', fragment: 'a small bright green lizard with alert round eyes and tiny clawed hands' },
      { id: 'chouette', nom: 'Chouette', fragment: 'a small owl with a round tuftless face and big dark eyes' },
      { id: 'hibou', nom: 'Hibou', fragment: 'a small horned owl with feathered ear tufts and amber eyes' },
      { id: 'corbeau', nom: 'Corbeau', fragment: 'a young raven with glossy blue-black feathers, a stout beak and bright clever eyes' },
      { id: 'serpent', nom: 'Serpent', fragment: 'a small patterned snake with smooth scales, upright and curious' },
      { id: 'lion', nom: 'Lion', fragment: 'a young lion cub with a soft budding mane' },
      { id: 'leopard', nom: 'Léopard', fragment: 'a young leopard cub with dark rosette spots' },
      { id: 'tigre', nom: 'Tigre', fragment: 'a young tiger cub with bold black stripes' },
      { id: 'chat', nom: 'Chat', fragment: 'a small kitten with a striped tabby coat' },
      { id: 'loup', nom: 'Loup', fragment: 'a young grey wolf with a thick ruff and keen amber eyes' },
      { id: 'bouc', nom: 'Bouc', fragment: 'a young billy goat with curved horns and a little pointed beard' },
      { id: 'chevre', nom: 'Chèvre', fragment: 'a young goat with soft white fur, floppy ears and small horns' },
      { id: 'crocodile', nom: 'Crocodile', fragment: 'a small crocodile with knobbly green scales and a toothy grin' },
      { id: 'lapin', nom: 'Lapin', fragment: 'a young rabbit with long ears and a round fluffy tail' },
      { id: 'marmotte', nom: 'Marmotte', fragment: 'a plump young marmot with round cheeks and small ears' },

      /* Chiens : races aux silhouettes franchement différentes, pour que le
         choix se voie sur l'image. */
      { id: 'chien-berger', nom: 'Chien — Berger allemand', fragment: 'a young German shepherd dog with tan and black markings and upright ears' },
      { id: 'chien-husky', nom: 'Chien — Husky', fragment: 'a young husky dog with pale blue eyes and a thick grey and white coat' },
      { id: 'chien-teckel', nom: 'Chien — Teckel', fragment: 'a young dachshund with a long body, short legs and floppy ears' },
      { id: 'chien-carlin', nom: 'Chien — Carlin', fragment: 'a young pug with a wrinkled flat face and a curled tail' },
      { id: 'chien-caniche', nom: 'Chien — Caniche', fragment: 'a young poodle with soft curly cream fur' },
      { id: 'chien-beagle', nom: 'Chien — Beagle', fragment: 'a young beagle with white, tan and black patches and long drooping ears' },
      { id: 'chien-saint-bernard', nom: 'Chien — Saint-Bernard', fragment: 'a young Saint Bernard with a broad head and shaggy red-brown and white fur' },
      { id: 'chien-shiba', nom: 'Chien — Shiba inu', fragment: 'a young shiba inu with a curled tail and a foxy ginger face' },
    ],
  },
  {
    id: 'classe',
    nom: 'Classe',
    aide: 'Son métier d’aventurier',
    /* Décrire le COSTUME et les accessoires, jamais l'attitude : la posture
       appartient à l'axe Pose. Chaque classe doit se reconnaître d'un coup
       d'œil — c'est un enfant qui choisit. */
    options: [
      { id: 'paladin', nom: 'Paladin', fragment: 'in shining plate armour over a tabard bearing a holy emblem, a round shield on the arm' },
      { id: 'soldat', nom: 'Soldat', fragment: 'in a padded gambeson and a simple metal helmet, a short spear and a soldier’s pack' },
      { id: 'epeiste', nom: 'Épéiste', fragment: 'in light travelling clothes with a sash at the waist and a fine slender sword' },
      { id: 'voleur', nom: 'Voleur', fragment: 'in a dark hooded cloak hung with belt pouches and lockpicks' },
      { id: 'assassin', nom: 'Assassin', fragment: 'in close-fitting dark clothes with a face scarf and slim daggers at the belt' },
      { id: 'mage', nom: 'Mage', fragment: 'in a long star-patterned robe and a pointed hat, carrying a heavy spellbook' },
      { id: 'sorcier', nom: 'Sorcier', fragment: 'in ragged robes hung with charms, feathers and little bones, holding a gnarled wooden staff' },
      { id: 'mage-combattant', nom: 'Mage Combattant', fragment: 'in light chainmail worn over a mage’s robe, a sword in one hand and glowing runes in the other' },
      { id: 'artificier', nom: 'Artificier', fragment: 'in a leather apron and brass goggles, pockets full of tools and cogs, holding a clockwork gadget' },
      { id: 'guerisseur', nom: 'Guérisseur', fragment: 'in soft linen robes with a satchel of herbs, bandages and little glass bottles' },
      { id: 'marchand', nom: 'Marchand', fragment: 'in a bright travelling coat with an enormous backpack of wares, a coin purse and small brass scales' },
    ],
  },
  {
    id: 'style',
    nom: 'Style',
    aide: 'La manière du tableau : technique, palette, trait',
    /* Décrire la FAÇON de peindre, jamais le sujet, et sous forme de groupe
       nominal : le fragment est introduit par le connecteur du dosage
       (« with the palette and brushwork of … »), il doit s'y enchaîner. */
    options: [
      /* Peintures */
      { id: 'kanagawa', nom: 'La Grande Vague de Kanagawa', fragment: 'Hokusai’s ukiyo-e woodblock print, bold black outlines, flat planes of Prussian blue and cream, stylised decorative patterns, visible paper grain' },
      { id: 'nuit-etoilee', nom: 'La Nuit étoilée', fragment: 'Van Gogh’s Starry Night, thick swirling impasto brushstrokes, vivid cobalt blue and golden yellow, restless rhythmic movement' },
      { id: 'semeur', nom: 'Le Semeur au soleil couchant', fragment: 'Van Gogh’s Sower at Sunset, thick directional brushstrokes, complementary chrome yellow and violet, a huge glowing sun' },
      { id: 'perle', nom: 'La Jeune Fille à la perle', fragment: 'Vermeer’s Dutch Golden Age painting, soft chiaroscuro against a deep dark ground, luminous skin and fabric, smooth invisible blending' },
      { id: 'ombrelle', nom: 'La Femme à l’ombrelle', fragment: 'Paul Signac’s pointillist divisionism, a mosaic of small distinct dots of pure unmixed colour, luminous vibrating light' },
      { id: 'voyageur', nom: 'Le Voyageur contemplant une mer de nuages', fragment: 'Caspar David Friedrich’s German Romantic painting, misty atmospheric perspective, muted greys and pale blues, solemn sublime scale' },
      { id: 'rousseau', nom: 'Surpris !', fragment: 'Henri Rousseau’s naïve painting, flat stylised layered foliage, dense jungle greens, dreamlike primitive perspective' },

      /* Animation et bande dessinée */
      { id: 'chihiro', nom: 'Le voyage de Chihiro', fragment: 'Studio Ghibli’s hand-painted animation, watercolour backgrounds, soft gouache textures, warm naturalistic light, gentle rounded character design' },
      { id: 'azur', nom: 'Azur & Asmar', fragment: 'Michel Ocelot’s Azur & Asmar, flat graphic 2D shapes over ornate arabesque patterns, saturated jewel tones of lapis blue and gold, crisp clean edges' },
      { id: 'roi-oiseau', nom: 'Le roi et l’oiseau', fragment: 'Paul Grimault’s hand-drawn animation, delicate ink lines, soft watercolour washes, poetic muted palette, vast airy architecture' },
      { id: 'triplettes', nom: 'Les Triplettes de Belleville', fragment: 'Sylvain Chomet’s animation, caricatural exaggerated proportions, scratchy ink linework, muted sepia and olive palette, retro 1930s feel' },
      { id: 'moebius', nom: 'Moebius', fragment: 'Moebius’ bande dessinée art, fine precise clear-line ink work, flat luminous pastel colours, airy surreal vistas' },
      { id: 'bilal', nom: 'Enki Bilal', fragment: 'Enki Bilal’s painted comics, cold desaturated blue-grey and bruised violet palette, cracked textured surfaces, dry brushwork over visible pencil lines' },
      { id: 'gorillaz', nom: 'Gorillaz', fragment: 'Jamie Hewlett’s Gorillaz artwork, bold black ink contours, flat punchy colours, graphic cel-shading, irreverent urban attitude' },
    ],
  },
];

/**
 * Socle commun : ce qui garantit un chaton lisible et mignon quel que soit le
 * tableau choisi. C'est lui qui fait la cohérence de la DA d'un portrait à
 * l'autre — le style du tableau vient par-dessus, pas à la place.
 *
 * Décrit d'après les illustrations du jeu (dossier « images ref ») : chatons
 * anthropomorphes en pied, grosse tête, gouache numérique à trait souple,
 * palette poudrée, yeux points expressifs.
 */
/* Le personnage : toujours présent, quel que soit le dosage. C'est lui qui fait
   qu'on reconnaît un chaton de Donjon & Chaton. Aucune posture ici, l'axe Pose
   s'en charge ; aucun décor non plus, c'est l'axe Fond. */
export const ANCRAGE_PERSONNAGE = "children's book illustration of an anthropomorphic animal adventurer standing on two legs, full body, slightly chibi proportions with a large head, simple expressive dot eyes";

/* La facture du jeu : technique et palette. C'est CE morceau que le curseur
   échange contre le style du tableau — sans quoi deux palettes se disputent. */
export const ANCRAGE_FACTURE = "soft gouache digital painting with visible brush texture, loose dark ink outlines, muted dusty palette of purple, sage green and warm orange";

/**
 * Le dosage du style. Sans lui, on n'a que deux extrêmes : soit le tableau est
 * ignoré, soit il écrase le chaton. « Équilibré » est l'entre-deux par défaut ;
 * « Marqué » lâche le socle et laisse le tableau gouverner.
 */
export const DOSAGES = [
  { id: 'leger', nom: 'Léger', connecteur: 'with a subtle touch of', facture: true },
  { id: 'equilibre', nom: 'Équilibré', connecteur: 'with the colour palette and brushwork of', facture: false },
  { id: 'marque', nom: 'Marqué', connecteur: 'painted in the manner of', facture: false },
];

export const DOSAGE_DEFAUT = 'equilibre';

/** Paramètres Midjourney ajoutés à la fin. */
export const PARAMETRES = '--ar 3:4';

/** Ordre d'assemblage : le sujet d'abord, Midjourney pèse plus le début. */
const ORDRE = ['animal', 'classe', 'pose', 'fond'];

function fragment(axeId, optionId) {
  const axe = AXES.find((a) => a.id === axeId);
  const option = axe && axe.options.find((o) => o.id === optionId);
  return option ? option.fragment : null;
}

/** Assemble le prompt à partir des choix { fond: 'kanagawa', dosage: 'leger', … }. */
export function composer(choix) {
  const morceaux = ORDRE.map((axe) => fragment(axe, choix[axe])).filter(Boolean);
  const style = fragment('style', choix.style);
  if (!morceaux.length && !style) return '';

  const dosage = DOSAGES.find((d) => d.id === (choix.dosage || DOSAGE_DEFAUT)) || DOSAGES[1];
  const parties = [...morceaux, ANCRAGE_PERSONNAGE];

  /* Sans style choisi, la facture du jeu s'applique ; sinon elle ne survit
     qu'au dosage léger, pour ne pas opposer deux palettes. */
  if (!style || dosage.facture) parties.push(ANCRAGE_FACTURE);
  if (style) parties.push(`${dosage.connecteur} ${style}`);

  return parties.join(', ') + ' ' + PARAMETRES;
}

/** Un choix au hasard sur chaque axe. Le dosage, lui, n'est pas tiré au sort. */
export function auHasard(dosage) {
  const choix = { dosage: dosage || DOSAGE_DEFAUT };
  for (const axe of AXES) {
    choix[axe.id] = axe.options[Math.floor(Math.random() * axe.options.length)].id;
  }
  return choix;
}

export function nomOption(axeId, optionId) {
  const axe = AXES.find((a) => a.id === axeId);
  const option = axe && axe.options.find((o) => o.id === optionId);
  return option ? option.nom : null;
}
