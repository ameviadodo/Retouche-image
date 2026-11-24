import { CommandDef } from '../types';

export const COMMAND_CATEGORIES = [
  { id: 'all', label: 'Toutes les commandes', icon: 'Sparkles' },
  { id: 'resolution', label: '🌟 Résolution & Netteté', icon: 'Maximize' },
  { id: 'restore', label: '🎨 Restauration & Réparation', icon: 'History' },
  { id: 'lighting', label: '💡 Éclairage & Couleur', icon: 'Sun' },
  { id: 'portrait', label: '👤 Portraits & Beauté', icon: 'User' },
  { id: 'style', label: '🛍️ Commerce, Style & Réseaux', icon: 'ShoppingBag' },
  { id: 'composition', label: '✂️ Composition & Arrière-plan', icon: 'Scissors' },
] as const;

export const COMMANDS: CommandDef[] = [
  // 🌟 Résolution & Netteté
  {
    key: '/upscale4k',
    name: 'Super-Résolution 4K Ultra Net',
    category: 'resolution',
    description: 'Redimensionner et rendre l\'image ultra nette en 4K UHD (3840px).',
    technicalDetails: 'Interpolation polynomiale Lanczos4 + renforcement des micro-contrastes CLAHE et filtre Unsharp Mask.',
    iconName: 'Maximize2',
    badge: '4K UHD',
    params: [
      { name: 'unsharp', label: 'Force des micro-contrastes', type: 'slider', min: 0.1, max: 1.5, step: 0.1, default: 0.7 },
    ]
  },
  {
    key: '/4k',
    name: 'Agrandissement 4K Haute Fidélité',
    category: 'resolution',
    description: 'Augmenter la résolution et extraire les détails fins sans artefacts.',
    technicalDetails: 'Sur-échantillonnage Lanczos sous-pixel avec préservation des arêtes.',
    iconName: 'Tv',
    badge: '4K',
  },
  {
    key: '/8k',
    name: 'Rendu 8K Cinéma Master',
    category: 'resolution',
    description: 'Produire un rendu très haute définition optimisé 8K (7680px).',
    technicalDetails: 'Multi-échelle Lanczos et synthèse de piqué haute fréquence pour affichage géant.',
    iconName: 'MonitorPlay',
    badge: '8K',
  },
  {
    key: '/sharpen',
    name: 'Accentuation de Netteté',
    category: 'resolution',
    description: 'Accentuer la netteté et le piqué des textures.',
    technicalDetails: 'Masque de netteté Unsharp Mask avec seuillage anti-bruit adaptatif.',
    iconName: 'Focus',
    params: [
      { name: 'strength', label: 'Intensité du filtre', type: 'slider', min: 0.2, max: 2.5, step: 0.1, default: 1.4 },
    ]
  },
  {
    key: '/unblur',
    name: 'Défloutage & Déconvolution',
    category: 'resolution',
    description: 'Récupérer les détails d\'une photo floue ou bougée.',
    technicalDetails: 'Déconvolution fréquentielle inverse type filtre de Wiener et filtrage bilatéral anti-ringing.',
    iconName: 'Eye',
  },
  {
    key: '/denoise',
    name: 'Débruitage Numérique',
    category: 'resolution',
    description: 'Supprimer le bruit numérique de capteur et le grain indésirable.',
    technicalDetails: 'Filtre Non-Local Means (cv2.fastNlMeansDenoisingColored) et préservation des arêtes.',
    iconName: 'ShieldAlert',
    params: [
      { name: 'strength', label: 'Force de lissage', type: 'slider', min: 3, max: 25, step: 1, default: 10 },
    ]
  },

  // 🎨 Restauration & Réparation
  {
    key: '/restore',
    name: 'Restauration Vieille Photo',
    category: 'restore',
    description: 'Restaurer une vieille image dégradée (rayures, grain, décoloration).',
    technicalDetails: 'Correction des niveaux, réduction du grain, égalisation LAB et inpainting de micro-rayures.',
    iconName: 'History',
    badge: 'Patrimoine',
  },
  {
    key: '/scratchrepair',
    name: 'Réparation Rayures & Fissures',
    category: 'restore',
    description: 'Réparer les rayures, pliures et déchirures du papier.',
    technicalDetails: 'Morphologie mathématique Black-Hat + Inpainting Navier-Stokes et méthode Telea.',
    iconName: 'PenTool',
  },
  {
    key: '/dustremove',
    name: 'Suppression Poussières & Taches',
    category: 'restore',
    description: 'Retirer les poussières de scanner et les taches de surface.',
    technicalDetails: 'Filtres résiduels Top-Hat/Black-Hat combinés et comblement ponctuel.',
    iconName: 'Sparkle',
  },
  {
    key: '/colorize',
    name: 'Colorisation Noir & Blanc',
    category: 'restore',
    description: 'Coloriser une photo en noir et blanc de manière photoréaliste.',
    technicalDetails: 'Guidage chromatique dans l\'espace CIE-LAB selon distribution spatiale et luminance.',
    iconName: 'Palette',
    params: [
      {
        name: 'theme',
        label: 'Palette chromatique',
        type: 'select',
        default: 'natural',
        options: [
          { label: 'Naturel / Équilibré', value: 'natural' },
          { label: 'Portrait & Teint Chair', value: 'portrait' },
          { label: 'Sépia / Vintage Doré', value: 'vintage' },
        ]
      }
    ]
  },

  // 💡 Éclairage & Couleur
  {
    key: '/relight',
    name: 'Rééclairage Studio',
    category: 'lighting',
    description: 'Améliorer ou modifier l\'éclairage en débouchant les ombres.',
    technicalDetails: 'Décomposition HSV, ajustement des courbes gamma non-linéaires et protection des hautes lumières.',
    iconName: 'SunMedium',
  },
  {
    key: '/colorcorrect',
    name: 'Étalonnage & Balance des Blancs',
    category: 'lighting',
    description: 'Corriger les dérives de couleurs et températures indésirables.',
    technicalDetails: 'Algorithme Gray World + Perfect Reflector et alignement des axes a* et b*.',
    iconName: 'Pipette',
  },
  {
    key: '/exposure',
    name: 'Correction d\'Exposition CLAHE',
    category: 'lighting',
    description: 'Réguler l\'exposition et révéler les détails cachés dans les ombres.',
    technicalDetails: 'Contrast Limited Adaptive Histogram Equalization (CLAHE) sur tuiles 8x8 en LAB.',
    iconName: 'Gauge',
    params: [
      { name: 'clipLimit', label: 'Limite d\'accentuation CLAHE', type: 'slider', min: 1.0, max: 4.5, step: 0.2, default: 2.6 },
    ]
  },
  {
    key: '/contrast',
    name: 'Contraste Dynamique Sigmoïde',
    category: 'lighting',
    description: 'Améliorer le contraste dynamique sans saturer les extrémités.',
    technicalDetails: 'Courbe en S sigmoïdale préservant les tons moyens et les dégradés subtils.',
    iconName: 'Sliders',
    params: [
      { name: 'gain', label: 'Pente de la courbe en S', type: 'slider', min: 3.0, max: 10.0, step: 0.5, default: 6.5 },
    ]
  },
  {
    key: '/hdr',
    name: 'Rendu Ultra HDR',
    category: 'lighting',
    description: 'Donner un rendu High Dynamic Range percutant.',
    technicalDetails: 'Fusion d\'expositions synthétiques bracketées (-1.5EV, 0EV, +1.5EV) via méthode Mertens.',
    iconName: 'Aperture',
    badge: 'HDR',
  },

  // 👤 Portraits & Beauté
  {
    key: '/faceenhance',
    name: 'Sublimation Visage & Portrait',
    category: 'portrait',
    description: 'Améliorer les visages : lissage de peau tout en préservant la texture des pores.',
    technicalDetails: 'Segmentation YCrCb/HSV + filtrage bilatéral guidé par masque laplacien des traits fins.',
    iconName: 'Smile',
    badge: 'Beauté',
  },
  {
    key: '/skin',
    name: 'Lissage de Peau Naturel',
    category: 'portrait',
    description: 'Atténuer les rougeurs et irrégularités sans effet plastique.',
    technicalDetails: 'Filtrage bilatéral ciblé sur la composante chromatique épidermique.',
    iconName: 'Sparkles',
  },
  {
    key: '/eyes',
    name: 'Éclat du Regard & Iris',
    category: 'portrait',
    description: 'Rehausser la netteté et le contraste de l\'iris et illuminer le regard.',
    technicalDetails: 'Accentuation des contrastes locaux circulaires et éclaircissement doux de la sclère.',
    iconName: 'Eye',
  },
  {
    key: '/teeth',
    name: 'Blanchiment Dentaire',
    category: 'portrait',
    description: 'Éclaircir les dents et neutraliser les reflets jaunes.',
    technicalDetails: 'Masquage seuillé en teinte HSV et désaturation de l\'axe jaune b* dans l\'espace LAB.',
    iconName: 'Sparkles',
  },
  {
    key: '/professionalheadshot',
    name: 'Portrait Professionnel Studio',
    category: 'portrait',
    description: 'Transformer en photo de profil corporate (fond flou bokeh, éclairage studio).',
    technicalDetails: 'Découpage du sujet, synthèse de flou d\'ouverture optique f/1.4 et vignettage doux.',
    iconName: 'Briefcase',
  },
  {
    key: '/passport',
    name: 'Photo d\'Identité Officielle',
    category: 'portrait',
    description: 'Adapter au format officiel normalisé biométrique (ratio 35x45mm).',
    technicalDetails: 'Recadrage centré géométrique 7:9 et harmonisation d\'exposition frontale.',
    iconName: 'IdCard',
  },

  // 🛍️ Commerce, Style & Réseaux Sociaux
  {
    key: '/productphoto',
    name: 'Packshot Produit E-Commerce',
    category: 'style',
    description: 'Sublimer une photo de produit pour boutique en ligne et publicité.',
    technicalDetails: 'Détourage net, accentuation des textures de surface et fond studio pur.',
    iconName: 'ShoppingBag',
  },
  {
    key: '/fashion',
    name: 'Éditorial Mode & Haute Couture',
    category: 'style',
    description: 'Étalonnage colorimétrique chic et dynamique des tissus et teintes.',
    technicalDetails: 'Rehaussement de la dynamique des textiles, noirs denses et chrominance riche.',
    iconName: 'Camera',
  },
  {
    key: '/cinematic',
    name: 'Cinéma Teal & Orange',
    category: 'style',
    description: 'Donner le rendu cinématographique culte hollywoodien.',
    technicalDetails: 'Grading chromatique croisé (ombres cyan / hautes lumières ambrées) et courbe 35mm.',
    iconName: 'Film',
    badge: 'Film',
  },
  {
    key: '/professional',
    name: 'Éclairage Studio 3 Points',
    category: 'style',
    description: 'Émuler un éclairage photographique professionnel en studio.',
    technicalDetails: 'Simulation des projecteurs Key Light, Fill Light et Rim Light.',
    iconName: 'Lightbulb',
  },
  {
    key: '/vintage',
    name: 'Argentique Vintage Kodak',
    category: 'style',
    description: 'Donner un charme rétro avec grain argentique et tons mats.',
    technicalDetails: 'Génération de grain gaussien 35mm, ombres décollées et dominante chaude.',
    iconName: 'Clock',
  },
  {
    key: '/photorealistic',
    name: 'Ultra Réalisme & Piqué Sub-Pixel',
    category: 'style',
    description: 'Renforcer le réalisme photographique et le croustillant des détails.',
    technicalDetails: 'Accentuation des micro-textures sans artéfacts de sur-netteté.',
    iconName: 'Layers',
  },
  {
    key: '/instagram',
    name: 'Optimisé Instagram (1:1 / Couleurs Pop)',
    category: 'style',
    description: 'Recadrer au format carré avec saturation et contraste percutants.',
    technicalDetails: 'Cadrage 1:1, dynamisation de la saturation HSV (+25%) et contraste fort.',
    iconName: 'Instagram',
  },
  {
    key: '/youtube',
    name: 'Miniature YouTube 16:9 Maximale',
    category: 'style',
    description: 'Optimiser pour une miniature YouTube ultra-lisible et contrastée.',
    technicalDetails: 'Format 16:9 panoramique, saturation poussée (+35%) et netteté renforcée.',
    iconName: 'PlaySquare',
  },

  // ✂️ Composition & Arrière-plan
  {
    key: '/removebg',
    name: 'Détourage Fond Transparent',
    category: 'composition',
    description: 'Supprimer l\'arrière-plan et isoler le sujet avec masque alpha.',
    technicalDetails: 'Algorithme GrabCut (Graph-Cut segmentation) avec lissage des contours sub-pixel.',
    iconName: 'Scissors',
    badge: 'Alpha PNG',
  },
  {
    key: '/background',
    name: 'Changement d\'Arrière-Plan',
    category: 'composition',
    description: 'Remplacer l\'arrière-plan par un fond studio, bokeh ou dégradé.',
    technicalDetails: 'Incrustation du sujet avec compensation d\'ambiance lumineuse.',
    iconName: 'Image',
    params: [
      {
        name: 'bgType',
        label: 'Style du fond',
        type: 'select',
        default: 'dark_studio',
        options: [
          { label: 'Studio Sombre Dégradé', value: 'dark_studio' },
          { label: 'Flou Bokeh Artistique', value: 'bokeh' },
          { label: 'Blanc Épuré Packshot', value: 'white' },
        ]
      }
    ]
  },
  {
    key: '/removeobject',
    name: 'Suppression d\'Objet Indésirable',
    category: 'composition',
    description: 'Supprimer un élément gênant grâce au pinceau de masque.',
    technicalDetails: 'Inpainting Navier-Stokes et méthode Telea avec préservation des motifs.',
    iconName: 'Eraser',
  },
  {
    key: '/inpaint',
    name: 'Pinceau Retouche Ciblée (Inpaint)',
    category: 'composition',
    description: 'Repeindre ou corriger précisément une zone peinte au pinceau.',
    technicalDetails: 'Interpolation locale et propagation de gradient continu.',
    iconName: 'Brush',
  },
  {
    key: '/outpaint',
    name: 'Extension de Canevas (Outpaint)',
    category: 'composition',
    description: 'Agrandir l\'image au-delà de ses bordures de manière continue.',
    technicalDetails: 'Extrapolation géométrique avec réplication miroir et fondu bilatéral.',
    iconName: 'Maximize',
    params: [
      { name: 'pad', label: 'Expansion des bordures', type: 'slider', min: 0.1, max: 0.5, step: 0.05, default: 0.25 },
    ]
  },
  {
    key: '/enhance',
    name: 'Super-Amélioration Automatique',
    category: 'composition',
    description: 'Amélioration globale tout-en-un (luminosité, balance, netteté, bruit).',
    technicalDetails: 'Pipeline séquentiel 4 étapes : CLAHE + Auto White Balance + Bilateral Denoise + Unsharp Mask.',
    iconName: 'Wand2',
    badge: 'Auto Pro',
  },
];
