/* Donjon & Chaton — bibliothèque de prompts.
 *
 * Chaque choix proposé à l'enfant est relié à un morceau de prompt en anglais
 * (Midjourney comprend mieux l'anglais). Le prompt final est l'assemblage de
 * ces morceaux.
 *
 * Une œuvre n'est déclarée qu'UNE fois, avec ses trois facettes :
 *   - fond  : le décor, la scène. Jamais la manière de peindre.
 *   - pose  : l'attitude du corps. Jamais le décor ni le costume.
 *   - style : la technique, la palette, le trait. Jamais le sujet.
 * Les trois axes Fond, Pose et Style sont ensuite dérivés de cette liste, si
 * bien que toutes les œuvres sont disponibles dans les trois.
 *
 * Cette séparation est la règle du fichier : deux fragments qui parlent de la
 * même chose (deux styles, deux postures, deux palettes) se contredisent dans
 * le prompt et Midjourney tranche au hasard.
 */

export const OEUVRES = [
  /* --- Œuvres dont les images sont dans « images ref » --- */
  {
    id: 'kanagawa', nom: 'La Grande Vague de Kanagawa',
    fond: 'a huge cresting ocean wave towering behind, Mount Fuji small in the distance',
    pose: 'braced low against the wind, arms clutched in as a wave rears overhead',
    style: 'Hokusai’s ukiyo-e woodblock print, bold black outlines, flat planes of Prussian blue and cream, stylised decorative patterns, visible paper grain',
  },
  {
    id: 'nuit-etoilee', nom: 'La Nuit étoilée',
    fond: 'a swirling night sky full of stars above a sleeping village and a dark cypress',
    pose: 'standing still, head tilted back, gazing up at the sky',
    style: 'Van Gogh’s Starry Night, thick swirling impasto brushstrokes, vivid cobalt blue and golden yellow, restless rhythmic movement',
  },
  {
    id: 'semeur', nom: 'Le Semeur au soleil couchant',
    fond: 'a ploughed field at dusk, an enormous low sun filling the sky behind',
    pose: 'caught mid-stride, one arm sweeping wide to scatter seed',
    style: 'Van Gogh’s Sower at Sunset, thick directional brushstrokes, complementary chrome yellow and violet, a huge glowing sun',
  },
  {
    id: 'perle', nom: 'La Jeune Fille à la perle',
    fond: 'against a plain deep black ground, a single soft light from one side',
    pose: 'glancing back over one shoulder, turned toward the viewer, lips slightly parted',
    style: 'Vermeer’s Dutch Golden Age painting, soft chiaroscuro against a deep dark ground, luminous skin and fabric, smooth invisible blending',
  },
  {
    id: 'ombrelle', nom: 'La Femme à l’ombrelle',
    fond: 'on a breezy grassy slope under a wide bright sky',
    pose: 'standing in profile on a windy slope, holding a parasol, clothes streaming sideways',
    style: 'Paul Signac’s pointillist divisionism, a mosaic of small distinct dots of pure unmixed colour, luminous vibrating light',
  },
  {
    id: 'voyageur', nom: 'Le Voyageur contemplant une mer de nuages',
    fond: 'a rocky summit above an endless sea of clouds and distant peaks',
    pose: 'seen from behind, one foot planted on a rock, gazing away into the distance',
    style: 'Caspar David Friedrich’s German Romantic painting, misty atmospheric perspective, muted greys and pale blues, solemn sublime scale',
  },
  {
    id: 'rousseau', nom: 'Surpris !',
    fond: 'deep in a dense jungle of broad stylised leaves, lashing rain and a flash of lightning',
    pose: 'crouched low and startled, eyes wide, ready to spring',
    style: 'Henri Rousseau’s naïve painting, flat stylised layered foliage, dense jungle greens, dreamlike primitive perspective',
  },
  {
    id: 'chihiro', nom: 'Le voyage de Chihiro',
    fond: 'before a towering spirit bathhouse at dusk, red lanterns glowing along its balconies',
    pose: 'standing timidly with both hands clasped in front, shoulders slightly hunched',
    style: 'Studio Ghibli’s hand-painted animation, watercolour backgrounds, soft gouache textures, warm naturalistic light, gentle rounded character design',
  },
  {
    id: 'azur', nom: 'Azur & Asmar',
    fond: 'in an ornate palace courtyard of arabesque tilework, arches and fountains',
    pose: 'standing frontal and symmetrical, hands open at the sides, formal and hieratic',
    style: 'Michel Ocelot’s Azur & Asmar, flat graphic 2D shapes over ornate arabesque patterns, saturated jewel tones of lapis blue and gold, crisp clean edges',
  },
  {
    id: 'roi-oiseau', nom: 'Le roi et l’oiseau',
    fond: 'in an immense empty palace hall of vertiginous staircases and tiny distant doors',
    pose: 'head tilted far back, looking up in wonder at something enormous',
    style: 'Paul Grimault’s hand-drawn animation, delicate ink lines, soft watercolour washes, poetic muted palette, vast airy architecture',
  },
  {
    id: 'triplettes', nom: 'Les Triplettes de Belleville',
    fond: 'on a steep street of leaning crooked houses in a smoky old city',
    pose: 'leaning forward mid-stride with exaggerated long limbs and a jutting chin',
    style: 'Sylvain Chomet’s animation, caricatural exaggerated proportions, scratchy ink linework, muted sepia and olive palette, retro 1930s feel',
  },
  {
    id: 'moebius', nom: 'Moebius',
    fond: 'in a vast desert of eroded rock arches under a pale wide sky',
    pose: 'standing motionless, arms loose at the sides, dwarfed by a huge horizon',
    style: 'Moebius’ bande dessinée art, fine precise clear-line ink work, flat luminous pastel colours, airy surreal vistas',
  },
  {
    id: 'bilal', nom: 'Enki Bilal',
    fond: 'in a decaying futuristic city of cracked concrete under a heavy grey sky',
    pose: 'standing rigid and half-turned, one shoulder forward, staring past the viewer',
    style: 'Enki Bilal’s painted comics, cold desaturated blue-grey and bruised violet palette, cracked textured surfaces, dry brushwork over visible pencil lines',
  },
  {
    id: 'gorillaz', nom: 'Gorillaz',
    fond: 'on a graffitied rooftop above a jumbled city skyline',
    pose: 'slouching with attitude, hands shoved in pockets, chin raised',
    style: 'Jamie Hewlett’s Gorillaz artwork, bold black ink contours, flat punchy colours, graphic cel-shading, irreverent urban attitude',
  },

  /* --- Ajouts : images à récupérer si tu veux les montrer aux enfants --- */
  {
    id: 'radeau', nom: 'Le Radeau de la Méduse',
    fond: 'on a makeshift raft on a heaving stormy sea, a torn sail against dark clouds',
    pose: 'stretched upward on tiptoe, one arm waving a cloth high overhead',
    style: 'Géricault’s Romantic history painting, dramatic chiaroscuro, sweeping diagonals, stormy browns and sickly greens',
  },
  {
    id: 'cri', nom: 'Le Cri',
    fond: 'on a wooden bridge above a fjord, the sky burning orange and red in wavy bands',
    pose: 'facing the viewer, both hands pressed to the cheeks, mouth open in a wail',
    style: 'Munch’s expressionist painting, undulating rippling lines, clashing orange, red and blue-green, raw anxious brushwork',
  },
  {
    id: 'liberte', nom: 'La Liberté guidant le peuple',
    fond: 'atop a barricade of broken timber in drifting smoke, city rooftops beyond',
    pose: 'striding forward over rubble, one arm raised high holding a banner',
    style: 'Delacroix’s Romantic painting, warm smoky browns pierced by bright red, white and blue, vigorous heroic brushwork',
  },
  {
    id: 'chambre-arles', nom: 'La Chambre à Arles',
    fond: 'in a small bedroom with tilted perspective, a wooden bed, blue walls and yellow furniture',
    pose: 'sitting on the edge of a bed, hands on the knees, feet dangling',
    style: 'Van Gogh’s Bedroom in Arles, flat blocks of saturated colour, thick outlines, deliberately skewed perspective',
  },
  {
    id: 'dejeuner', nom: 'Le Déjeuner sur l’herbe',
    fond: 'in a shaded woodland clearing beside a picnic spread on the grass',
    pose: 'sitting on the grass, one knee drawn up, chin on hand, looking straight at the viewer',
    style: 'Manet’s painting, flattened forms with abrupt light and shadow, cool greens against pale tones, loose confident strokes',
  },
  {
    id: 'ronde-nuit', nom: 'La Ronde de nuit',
    fond: 'under a dark stone archway, warm lantern light picking figures out of deep shadow',
    pose: 'stepping forward out of shadow, one hand extended toward the viewer',
    style: 'Rembrandt’s baroque painting, deep golden chiaroscuro, glowing highlights on a nearly black ground',
  },
  {
    id: 'menines', nom: 'Les Ménines',
    fond: 'in a tall dim palace room hung with paintings, a mirror on the far wall',
    pose: 'standing still facing the viewer, skirts spread wide, one hand held out to the side',
    style: 'Velázquez’s baroque painting, soft atmospheric greys and silvers, loose flickering brushwork',
  },
  {
    id: 'venus', nom: 'La Naissance de Vénus',
    fond: 'on a giant scallop shell drifting on a calm sea, flowers falling through the air',
    pose: 'standing balanced on one leg, hair swept to one side, arms curved inward',
    style: 'Botticelli’s early Renaissance painting, fine linear contours, pale luminous colours, delicate tempera surface',
  },
  {
    id: 'babel', nom: 'La Tour de Babel',
    fond: 'before a colossal spiral tower under construction, ramps and arches winding into cloud',
    pose: 'gesturing broadly at something vast, one arm swept outward',
    style: 'Bruegel’s Flemish painting, tiny meticulous detail, warm ochres and dusty reds, high panoramic viewpoint',
  },
  {
    id: 'chasseurs-neige', nom: 'Les Chasseurs dans la neige',
    fond: 'on a snowy hilltop above a frozen village, bare black trees and distant skaters',
    pose: 'trudging away from the viewer, shoulders hunched, seen from behind',
    style: 'Bruegel’s winter painting, muted white and grey-green, crisp black silhouettes, wide panoramic depth',
  },
  {
    id: 'jardin-delices', nom: 'Le Jardin des délices',
    fond: 'in a fantastical garden of giant fruit, bubbles and strange pink structures',
    pose: 'perched inside an enormous piece of fruit, peeking out',
    style: 'Bosch’s painting, teeming miniature detail, pale luminous ground, whimsical dreamlike invention',
  },
  {
    id: 'nighthawks', nom: 'Nighthawks',
    fond: 'outside a late-night corner diner, green light spilling through the glass onto an empty street',
    pose: 'sitting alone on a stool, elbows on the counter, seen from the side',
    style: 'Edward Hopper’s painting, broad flat planes of colour, hard electric light against deep night blue, still and quiet',
  },
  {
    id: 'baiser', nom: 'Le Baiser',
    fond: 'in a meadow of small flowers, everything wrapped in golden mosaic patterns',
    pose: 'kneeling with the head tilted and the eyes closed, hands drawn up to the chest',
    style: 'Klimt’s Vienna Secession painting, gold leaf, dense ornamental patterns, flattened decorative space',
  },
  {
    id: 'american-gothic', nom: 'American Gothic',
    fond: 'in front of a white wooden farmhouse with a pointed gothic window',
    pose: 'standing stiffly face-on, solemn expression, holding a pitchfork upright',
    style: 'Grant Wood’s regionalist painting, smooth hard-edged forms, muted browns and greens, meticulous flat finish',
  },
  {
    id: 'soleil-levant', nom: 'Impression, soleil levant',
    fond: 'in a misty harbour at dawn, an orange sun low over the water and ghostly masts',
    pose: 'sitting in a small rowing boat, one hand trailing in the water',
    style: 'Monet’s impressionism, hazy dissolving forms, blue-grey mist pierced by a single orange note, rapid broken strokes',
  },
  {
    id: 'cathedrale', nom: 'La Cathédrale de Rouen',
    fond: 'before the vast carved facade of a gothic cathedral dissolving in coloured light',
    pose: 'standing small and upright, head tilted back to take in something towering',
    style: 'Monet’s cathedral series, dissolving stone in shimmering broken colour, lilac and gold light',
  },
  {
    id: 'moulin-galette', nom: 'Le Bal du moulin de la Galette',
    fond: 'at an outdoor dance under trees, dappled sunlight falling through the leaves',
    pose: 'caught mid-turn in a dance, one arm raised, clothes swinging',
    style: 'Renoir’s impressionism, feathery warm brushwork, dappled violet shadows, glowing rosy light',
  },
  {
    id: 'persistance', nom: 'La Persistance de la mémoire',
    fond: 'in an empty desert with distant cliffs, soft melting clocks draped over a bare branch',
    pose: 'slumped and drooping as if half-melted, head resting on the ground',
    style: 'Dalí’s surrealist painting, glassy photographic precision, long shadows, sickly yellow and deep blue',
  },
  {
    id: 'joueurs-cartes', nom: 'Les Joueurs de cartes',
    fond: 'at a table in a dim tavern, a bottle and scattered cards, a curtain behind',
    pose: 'seated at a table, leaning in over a hand of cards, absorbed',
    style: 'Cézanne’s painting, blocky constructed brushstrokes, earthy ochres and blues, solid geometric forms',
  },
  {
    id: 'nuit-rhone', nom: 'La Nuit étoilée sur le Rhône',
    fond: 'on a dark riverbank at night, gaslights trailing long reflections across the water',
    pose: 'standing at the water’s edge, hands behind the back, watching the reflections',
    style: 'Van Gogh’s Starry Night Over the Rhône, deep ultramarine night, dabs of gaslight gold, calm rhythmic strokes',
  },
  {
    id: 'pont-japonais', nom: 'Le Pont japonais',
    fond: 'on an arched green footbridge over a pond choked with water lilies and drooping willows',
    pose: 'leaning on a railing, both arms folded on it, looking down at the water',
    style: 'Monet’s water lily series, dense tangled dabs of green and violet, dissolved edges, no horizon',
  },
  {
    id: 'joconde', nom: 'La Joconde',
    fond: 'before a hazy winding river valley of blue-grey hills',
    pose: 'seated in three-quarter view, hands folded one over the other, a faint enigmatic smile',
    style: 'Leonardo’s Renaissance painting, soft sfumato haze, warm amber tones, imperceptible transitions',
  },
  {
    id: 'penseur', nom: 'Le Penseur',
    fond: 'on a plain stone pedestal against an empty sky',
    pose: 'sitting hunched forward on a rock, chin resting on the back of one hand',
    style: 'Rodin’s bronze sculpture, roughly modelled surfaces, dark patinated metal catching raking light',
  },
  {
    id: 'vitruve', nom: 'L’Homme de Vitruve',
    fond: 'against aged parchment covered in handwritten notes, a circle and a square drawn around',
    pose: 'facing forward, arms and legs stretched out symmetrically, perfectly frontal',
    style: 'Leonardo’s pen and ink study, fine brown hatching on aged paper, precise anatomical draughtsmanship',
  },
  {
    id: 'creation', nom: 'La Création d’Adam',
    fond: 'against a swirling cloak of cloud on a vaulted ceiling',
    pose: 'reclining propped on one elbow, the other arm extended, one finger reaching out',
    style: 'Michelangelo’s fresco, sculptural modelled bodies, chalky pastel pinks and greens, monumental scale',
  },
  {
    id: 'david', nom: 'Le David',
    fond: 'in a bright marble gallery under a domed skylight',
    pose: 'standing at ease with the weight on one leg, head turned to the side, a sling over the shoulder',
    style: 'Michelangelo’s marble sculpture, polished white stone, precise anatomy, cool even daylight',
  },
  {
    id: 'napoleon', nom: 'Bonaparte franchissant le Grand-Saint-Bernard',
    fond: 'on a windswept alpine pass of grey rock and driving cloud',
    pose: 'riding a rearing mount, cloak flying, one arm flung up to point ahead',
    style: 'David’s neoclassical painting, crisp polished surfaces, heroic red and gold against storm grey',
  },
  {
    id: 'fils-homme', nom: 'Le Fils de l’homme',
    fond: 'before a low wall with a flat grey sea and cloudy sky beyond',
    pose: 'standing straight facing the viewer, arms at the sides, a green apple floating before the face',
    style: 'Magritte’s surrealist painting, flat matte finish, plain even light, deadpan precision',
  },
  {
    id: 'laitiere', nom: 'La Laitière',
    fond: 'in a bare whitewashed kitchen, daylight from a small window, a basket of bread on the table',
    pose: 'leaning over a table, carefully pouring from a jug held in both hands',
    style: 'Vermeer’s painting, soft daylight from the left, granular luminous surfaces, calm yellow and blue',
  },
  {
    id: 'danse', nom: 'La Danse',
    fond: 'against a plain field of deep blue above a band of green',
    pose: 'caught mid-leap, arms flung wide, body arched backwards',
    style: 'Matisse’s painting, flat unmodulated blocks of red, blue and green, bold simplified contours',
  },
  {
    id: 'whistler', nom: 'Arrangement en gris et noir',
    fond: 'in a bare grey room with a patterned curtain and a framed print on the wall',
    pose: 'seated in strict profile on a plain chair, hands resting quietly in the lap',
    style: 'Whistler’s tonal painting, a narrow harmony of greys and blacks, flat quiet balance',
  },
  {
    id: 'saint-georges', nom: 'Saint Georges terrassant le dragon',
    fond: 'on a bare rocky plain before a distant walled city',
    pose: 'standing braced with a spear pointed down at a fallen foe',
    style: 'Paolo Uccello’s early Renaissance painting, crisp storybook shapes, jewel colours, flattened perspective',
  },
  {
    id: 'discobole', nom: 'Le Discobole',
    fond: 'in a sunlit stadium of pale stone',
    pose: 'twisted around, one arm drawn far back holding a disc, about to hurl it',
    style: 'classical Greek marble sculpture, smooth white stone, idealised athletic form',
  },
  {
    id: 'samothrace', nom: 'La Victoire de Samothrace',
    fond: 'at the prow of a stone ship on a windswept sea',
    pose: 'leaning into the wind, chest forward, great wings spread wide behind',
    style: 'Hellenistic marble sculpture, deeply carved wind-whipped drapery, weathered pale stone',
  },
  {
    id: 'angelus', nom: 'L’Angélus',
    fond: 'in a flat harvested field at dusk, a distant church spire on the horizon',
    pose: 'standing still with the head bowed and the hands clasped, hat held to the chest',
    style: 'Millet’s Barbizon painting, soft earthy browns and dusty gold, humble quiet light',
  },
  {
    id: 'odalisque', nom: 'La Grande Odalisque',
    fond: 'on a heap of silk cushions behind a drawn blue curtain',
    pose: 'lying stretched out on cushions, looking back over one shoulder at the viewer',
    style: 'Ingres’s neoclassical painting, cool porcelain smoothness, elongated sinuous line, satin blues',
  },
  {
    id: 'durer', nom: 'Le Chevalier, la Mort et le Diable',
    fond: 'in a narrow rocky gorge of gnarled roots and dead trees',
    pose: 'riding steadily forward in profile, lance held upright, unflinching',
    style: 'Dürer’s engraving, dense fine cross-hatching in black ink on white, meticulous metallic detail',
  },
];

/** Les options d'un axe : le choix neutre éventuel, puis toutes les œuvres. */
function optionsOeuvres(facette, neutre) {
  const options = OEUVRES.map((o) => ({ id: o.id, nom: o.nom, fragment: o[facette] }));
  return neutre ? [neutre, ...options] : options;
}

export const AXES = [
  {
    id: 'fond',
    nom: 'Fond',
    aide: 'Le décor, emprunté à une œuvre',
    options: optionsOeuvres('fond', {
      /* Un vrai choix, différent de « ne rien choisir » : c'est le parti des
         illustrations du jeu, personnage détouré sur aplat. */
      id: 'aucun', nom: 'Sans décor',
      fragment: 'on a plain flat pastel background with no scenery',
    }),
  },
  {
    id: 'pose',
    nom: 'Pose',
    aide: 'La posture, empruntée à une œuvre',
    options: optionsOeuvres('pose', {
      /* Fragment vide : aucune contrainte de posture. */
      id: 'libre', nom: 'Pose libre', fragment: '',
    }),
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
    id: 'genre',
    nom: 'Genre',
    aide: 'Ne rien choisir laisse Midjourney décider',
    options: [
      { id: 'femme', nom: 'Femme', fragment: 'a female character, feminine face and build' },
      { id: 'homme', nom: 'Homme', fragment: 'a male character, masculine face and build' },
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
      { id: 'alchimiste', nom: 'Alchimiste', fragment: 'in a robe stained with spilled reagents, a bandolier of bubbling coloured flasks and a small copper alembic at the hip' },
      { id: 'guerisseur', nom: 'Guérisseur', fragment: 'in soft linen robes with a satchel of herbs, bandages and little glass bottles' },
      { id: 'marchand', nom: 'Marchand', fragment: 'in a bright travelling coat with an enormous backpack of wares, a coin purse and small brass scales' },
    ],
  },
  {
    id: 'style',
    nom: 'Style',
    aide: 'La manière de l’œuvre : technique, palette, trait',
    options: optionsOeuvres('style'),
  },
];

/**
 * Le personnage : toujours présent, quel que soit le dosage. C'est lui qui fait
 * qu'on reconnaît un chaton de Donjon & Chaton. Aucune posture ici, l'axe Pose
 * s'en charge ; aucun décor non plus, c'est l'axe Fond.
 *
 * Décrit d'après les illustrations du jeu (dossier « images ref »).
 */
export const ANCRAGE_PERSONNAGE = "children's book illustration of an anthropomorphic animal adventurer standing on two legs, full body, slightly chibi proportions with a large head, simple expressive dot eyes";

/* La facture du jeu : technique et palette. C'est CE morceau que le curseur
   échange contre le style de l'œuvre — sans quoi deux palettes se disputent. */
export const ANCRAGE_FACTURE = "soft gouache digital painting with visible brush texture, loose dark ink outlines, muted dusty palette of purple, sage green and warm orange";

/**
 * Le dosage du style. Sans lui, on n'a que deux extrêmes : soit l'œuvre est
 * ignorée, soit elle écrase le personnage. « Équilibré » est l'entre-deux par
 * défaut ; « Marqué » lâche la facture du jeu et laisse l'œuvre gouverner.
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
const ORDRE = ['animal', 'genre', 'classe', 'pose', 'fond'];

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
