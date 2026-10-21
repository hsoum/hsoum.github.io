import type { Text } from '../i18n/lang';

/** A screenshot in src/assets/shots. */
export interface Shot {
  file: string;
  alt: Text;
  /** The shape of the screen it was taken on. */
  frame: 'browser' | 'phone';
}

/** A 3D render of the devices, made by scripts/render.mjs into src/assets/renders. */
export interface Render {
  file: string;
  alt: Text;
}

/** A screen recording in public/media, with a poster of the same name. */
export interface Video {
  name: string;
  alt: Text;
  frame: 'browser' | 'phone';
}

export type Media = ({ kind: 'shot' } & Shot) | ({ kind: 'video' } & Video) | ({ kind: 'render' } & Render);

export interface Link {
  href: string;
  label: Text;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  sector: Text;
  /** Deep ground of the card and case hero, with the accent that reads on it. */
  tone: string;
  accent: string;
  result: Text;
  services: Text[];
  status?: Text;
  credit?: Text;
  links?: Link[];
  title: Text;
  need: Text;
  built: Text[];
  numbers: { value: Text; label: Text }[];
  holds: { title: Text; body: Text }[];
  cover: Render;
  /** Shown one after another while the card is hovered. */
  slides: Shot[];
  media: Media[];
  /** A second project for the same client, on the same page. */
  second?: { id: string; title: Text; body: Text; built: Text[]; media: Media[] };
}

export const projects: Project[] = [
  {
    id: 'samira-plus',
    name: 'Samira Plus',
    client: 'Samira TV',
    sector: { fr: 'Chaîne de télévision', en: 'Television channel' },
    tone: '#1d1430',
    accent: '#c6b3f2',
    result: { fr: 'Plus de 10 000 téléchargements sur Google Play', en: '10K+ downloads on Google Play' },
    services: [
      { fr: 'Application mobile', en: 'Mobile app' },
      { fr: 'Vidéo en direct', en: 'Live video' },
      { fr: 'Tableau de bord', en: 'Team dashboard' },
    ],
    credit: { fr: 'Réalisé avec INPACT', en: 'Built with INPACT' },
    links: [
      { href: 'https://apps.apple.com/fr/app/samira-plus/id6761920299', label: { fr: 'Sur l’App Store', en: 'On the App Store' } },
      { href: 'https://play.google.com/store/apps/details?id=com.samplus', label: { fr: 'Sur Google Play', en: 'On Google Play' } },
    ],
    title: {
      fr: 'La chaîne en direct et en replay, dans la poche',
      en: 'The channel live and on replay, in your pocket',
    },
    need: {
      fr: 'Samira TV voulait sa propre plateforme : le direct, le replay et les votes du public en temps réel pendant les émissions, sur téléphone comme sur téléviseur.',
      en: 'Samira TV wanted its own platform: live TV, replay and real-time audience votes during shows, on phones as well as TV sets.',
    },
    built: [
      {
        fr: 'Les applications iOS, Android et Apple TV : direct, vidéo à la demande, formats courts',
        en: 'iOS, Android and Apple TV apps: live, video on demand, short formats',
      },
      { fr: 'Téléchargement hors ligne, Chromecast et AirPlay', en: 'Offline downloads, Chromecast and AirPlay' },
      { fr: 'Votes et quiz en direct pendant les émissions', en: 'Live votes and quizzes during shows' },
      { fr: 'Un tableau de bord pour l’équipe de la chaîne', en: 'A dashboard for the channel’s team' },
    ],
    numbers: [
      { value: { fr: '10 000+', en: '10K+' }, label: { fr: 'téléchargements sur Google Play', en: 'downloads on Google Play' } },
      { value: { fr: '3', en: '3' }, label: { fr: 'plateformes : iOS, Android et Apple TV', en: 'platforms: iOS, Android and Apple TV' } },
      { value: { fr: '1080p', en: '1080p' }, label: { fr: 'et jusqu’à 360p quand le réseau faiblit', en: 'stepping down to 360p on a weak connection' } },
    ],
    holds: [
      {
        title: { fr: 'Tient les pics du direct', en: 'Holds live-show peaks' },
        body: {
          fr: 'Les votes sont comptés en mémoire puis enregistrés en arrière-plan : un pic pendant l’émission ne sature rien.',
          en: 'Votes are counted in memory and saved in the background, so a spike during a show overloads nothing.',
        },
      },
      {
        title: { fr: 'Regardable même avec peu de réseau', en: 'Watchable on a weak connection' },
        body: {
          fr: 'Chaque vidéo existe en 360p, 720p et 1080p. Le lecteur choisit selon la connexion du téléphone.',
          en: 'Every video exists in 360p, 720p and 1080p. The player picks according to the phone’s connection.',
        },
      },
    ],
    cover: {
      file: 'samira-cover.webp',
      alt: { fr: 'Trois téléphones ouverts sur Samira Plus', en: 'Three phones open on Samira Plus' },
    },
    slides: [1, 2, 3, 4].map((n) => ({
      file: `samplus-screen-${n}.png`,
      frame: 'phone' as const,
      alt: { fr: `Écran ${n} de Samira Plus, tiré de sa fiche sur les stores`, en: `Samira Plus screen ${n}, from its store listing` },
    })),
    media: [
      {
        kind: 'render',
        file: 'samira-phones.webp',
        alt: {
          fr: 'Quatre écrans de Samira Plus : l’accueil, une série, le direct et un format court',
          en: 'Four Samira Plus screens: home, a series, live TV and a short format',
        },
      },
    ],
  },
  {
    id: 'soins-et-sante',
    name: 'Soins et Santé',
    client: 'Soins et Santé',
    sector: { fr: 'Fabricant de produits de santé', en: 'Healthcare manufacturer' },
    tone: '#0b2b2c',
    accent: '#93d9cb',
    result: {
      fr: 'Le coût de revient de chaque import, juste à quatre décimales',
      en: 'The landed cost of every import, right to four decimals',
    },
    services: [
      { fr: 'Application web', en: 'Web app' },
      { fr: 'Site de marque', en: 'Brand site' },
    ],
    title: {
      fr: 'Le coût de revient de chaque import, calculé et tracé',
      en: 'The landed cost of every import, calculated and traced',
    },
    need: {
      fr: 'Chaque dossier d’import passait entre cinq services, du bon de commande au dédouanement. Le prix de revient se reconstruisait à la main, dans des tableurs, en plusieurs devises. Il fallait un seul circuit où chacun sait ce qu’il a à faire, et un coût que la direction peut défendre.',
      en: 'Each import file passed through five departments, from purchase order to customs clearance. The landed cost was rebuilt by hand in spreadsheets, across several currencies. They needed one circuit where everyone knows what to do, and a cost management can stand behind.',
    },
    built: [
      {
        fr: 'Le suivi de chaque dossier en 11 étapes, chacune attribuée à un service',
        en: 'Every file tracked through 11 steps, each one owned by a department',
      },
      {
        fr: 'Le calcul du prix de revient unitaire, avec cinq façons de répartir le fret',
        en: 'Unit landed cost, with five ways to split freight',
      },
      {
        fr: 'Les dossiers PDF et la fiche d’imputation comptable, générés automatiquement',
        en: 'PDF file bundles and the accounting sheet, generated automatically',
      },
      {
        fr: 'Une application en trois langues, y compris en écriture de droite à gauche',
        en: 'An app in three languages, right-to-left included',
      },
      { fr: 'Un guide d’utilisation pour les équipes', en: 'A user guide for the teams' },
    ],
    numbers: [
      { value: { fr: '11', en: '11' }, label: { fr: 'étapes par dossier, chacune à un service', en: 'steps per file, each owned by a department' } },
      { value: { fr: '4', en: '4' }, label: { fr: 'décimales justes, vérifiées sur leurs vrais dossiers', en: 'decimal places, checked against their real files' } },
      { value: { fr: '5', en: '5' }, label: { fr: 'façons de répartir le fret', en: 'ways to split freight' } },
    ],
    holds: [
      {
        title: { fr: 'Vérifié sur leurs propres dossiers', en: 'Checked against their own files' },
        body: {
          fr: 'Le prix de revient calculé correspond à leurs vrais dossiers d’import, à quatre décimales près.',
          en: 'The calculated cost matches their real import files to four decimal places.',
        },
      },
      {
        title: { fr: 'Des chiffres qui ne bougent pas', en: 'Figures that don’t move' },
        body: {
          fr: 'Le taux de change est figé au moment de la fiche. Un coût validé ne change jamais en silence.',
          en: 'The exchange rate is fixed when the sheet is produced. A validated cost never changes silently.',
        },
      },
      {
        title: { fr: 'Un historique qu’on ne réécrit pas', en: 'A history nobody can rewrite' },
        body: {
          fr: 'Chaque action est inscrite au journal. Même un administrateur ne peut ni modifier ni effacer une ligne.',
          en: 'Every action goes into the journal. Not even an administrator can change or delete a line.',
        },
      },
      {
        title: { fr: 'Rien ne part sans contrôle', en: 'Nothing ships unchecked' },
        body: {
          fr: 'Chaque modification est vérifiée avant sa mise en ligne, et chaque semaine une sauvegarde est restaurée puis contrôlée.',
          en: 'Every change is checked before it goes live, and every week a backup is restored and verified.',
        },
      },
    ],
    cover: {
      file: 'ss-cover.webp',
      alt: {
        fr: 'La plateforme d’import et le site de Soins et Santé, sur deux écrans',
        en: 'The Soins et Santé import platform and website, on two screens',
      },
    },
    slides: [
      { file: 'ss2-dossier.png', frame: 'browser', alt: { fr: 'Un dossier d’import et ses 11 étapes', en: 'An import file and its 11 steps' } },
      { file: 'ss2-pru.png', frame: 'browser', alt: { fr: 'Le détail du prix de revient', en: 'The landed cost breakdown' } },
      { file: 'ss2-journal.png', frame: 'browser', alt: { fr: 'Le journal des actions', en: 'The action journal' } },
    ],
    media: [
      {
        kind: 'video',
        name: 'ss-workflow',
        frame: 'browser',
        alt: {
          fr: 'Un dossier passe d’une étape à la suivante, puis le prix de revient se calcule',
          en: 'A file moves from one step to the next, then the landed cost is calculated',
        },
      },
    ],
    second: {
      id: 'site',
      title: { fr: 'Puis le site de la marque', en: 'Then the brand site' },
      body: {
        fr: 'Un client qui revient. Côté public, un site qui présente la production, la qualité et les partenariats, avec un chemin direct pour les demandes des distributeurs.',
        en: 'A client who came back. On the public side, a site that presents production, quality and partnerships, with a direct path for distributor enquiries.',
      },
      built: [
        { fr: 'Le site en français et en anglais', en: 'The site in French and English' },
        { fr: 'Un formulaire de demande pour les distributeurs', en: 'An enquiry form for distributors' },
      ],
      media: [
        {
          kind: 'shot',
          file: 'soins-sante-web-home.png',
          frame: 'browser',
          alt: { fr: 'La page d’accueil du site Soins et Santé', en: 'The Soins et Santé website home page' },
        },
      ],
    },
  },
  {
    id: 'aurelis',
    name: 'Aurelis',
    client: 'Aurelis',
    sector: { fr: 'Cosmétiques', en: 'Cosmetics' },
    tone: '#2a0d15',
    accent: '#eab0bb',
    result: { fr: 'Livraison partout en Algérie, paiement à la livraison', en: 'Nationwide delivery, cash on delivery' },
    services: [
      { fr: 'Boutique en ligne', en: 'Online store' },
      { fr: 'Site de marque', en: 'Brand site' },
    ],
    links: [{ href: 'https://aurelislab.com', label: { fr: 'Visiter aurelislab.com', en: 'Visit aurelislab.com' } }],
    title: {
      fr: 'Une boutique de marque qui livre partout en Algérie',
      en: 'A brand store that delivers nationwide',
    },
    need: {
      fr: 'Une marque de cosmétiques voulait vendre en ligne, en dinars, avec paiement à la livraison et partout en Algérie, sans perdre l’allure d’une campagne de marque.',
      en: 'A cosmetics brand wanted to sell online, in dinars, cash on delivery and everywhere in Algeria, without losing the look of a brand campaign.',
    },
    built: [
      { fr: 'La commande en dinars, payée à la livraison', en: 'Ordering in dinars, paid on delivery' },
      {
        fr: 'La livraison partout en Algérie : plus de 1 500 communes proposées à la commande',
        en: 'Delivery nationwide: over 1,500 communes offered at checkout',
      },
      { fr: 'Livraison à domicile ou en point relais', en: 'Delivery to the door or a pickup point' },
      { fr: 'Un suivi de commande en cinq étapes pour les clients', en: 'Five-stage order tracking for customers' },
      { fr: 'Des fiches produits avec composition et conseils d’utilisation', en: 'Product pages with ingredients and usage advice' },
    ],
    numbers: [
      { value: { fr: '1 500+', en: '1,500+' }, label: { fr: 'communes livrées', en: 'communes delivered' } },
      { value: { fr: '5', en: '5' }, label: { fr: 'étapes de suivi pour chaque commande', en: 'tracking stages for every order' } },
    ],
    holds: [
      {
        title: { fr: 'Un stock juste', en: 'Accurate stock' },
        body: {
          fr: 'Le stock n’est réservé qu’une fois la commande confirmée par une personne.',
          en: 'Stock is only reserved once a person has confirmed the order.',
        },
      },
      {
        title: { fr: 'Des adresses valides', en: 'Valid addresses' },
        body: {
          fr: 'La commune et le numéro de téléphone sont vérifiés une seconde fois avant que la commande soit enregistrée.',
          en: 'Commune and phone number are checked a second time before the order is saved.',
        },
      },
      {
        title: { fr: 'Des statuts fidèles au terrain', en: 'Statuses that match reality' },
        body: {
          fr: 'Les statuts suivent le vrai parcours d’une commande payée à la livraison, et chaque changement est noté.',
          en: 'Statuses follow the real path of a cash-on-delivery order, and every change is recorded.',
        },
      },
    ],
    cover: {
      file: 'aurelis-cover.webp',
      alt: { fr: 'La boutique Aurelis sur ordinateur et sur téléphone', en: 'The Aurelis store on a computer and a phone' },
    },
    slides: [
      { file: 'aurelis-home-desktop.png', frame: 'browser', alt: { fr: 'L’accueil d’Aurelis', en: 'The Aurelis home page' } },
      { file: 'aurelis-category.png', frame: 'browser', alt: { fr: 'Une catégorie de produits', en: 'A product category' } },
      { file: 'aurelis-product.png', frame: 'browser', alt: { fr: 'Une fiche produit', en: 'A product page' } },
    ],
    media: [
      {
        kind: 'video',
        name: 'aurelis-desktop',
        frame: 'browser',
        alt: { fr: 'On parcourt la boutique Aurelis sur ordinateur', en: 'Browsing the Aurelis store on a computer' },
      },
      {
        kind: 'video',
        name: 'aurelis-mobile',
        frame: 'phone',
        alt: { fr: 'La boutique Aurelis sur téléphone', en: 'The Aurelis store on a phone' },
      },
    ],
  },
  {
    id: 'gracepaws',
    name: 'GracePaws',
    client: 'GracePaws',
    sector: { fr: 'Mode et soins pour animaux', en: 'Pet clothing and care' },
    tone: '#30251a',
    accent: '#ead3a8',
    status: { fr: 'Lancement prochain', en: 'Launching soon' },
    result: { fr: 'Une boutique multilingue où aucune commande ne se perd', en: 'A multilingual store where no order gets lost' },
    services: [
      { fr: 'Boutique en ligne', en: 'Online store' },
      { fr: 'Gestion des commandes', en: 'Order desk' },
    ],
    title: {
      fr: 'Une boutique pensée pour le paiement à la livraison',
      en: 'A store built around cash on delivery',
    },
    need: {
      fr: 'Les commandes arrivaient en messages Instagram et WhatsApp, et se perdaient. La marque voulait une seule boutique multilingue, avec paiement à la livraison et confirmation de chaque commande par téléphone.',
      en: 'Orders arrived as Instagram and WhatsApp messages, and got lost. The brand wanted a single multilingual store, with cash on delivery and every order confirmed by phone.',
    },
    built: [
      { fr: 'Une boutique multilingue', en: 'A multilingual store' },
      {
        fr: 'La livraison partout dans le pays, à domicile ou en point relais',
        en: 'Delivery nationwide, to the door or a pickup point',
      },
      {
        fr: 'Une file d’appels pour confirmer les commandes, avec rappels programmés',
        en: 'A call queue to confirm orders, with scheduled callbacks',
      },
      { fr: 'Les étiquettes d’expédition imprimées par lot', en: 'Shipping labels printed in batches' },
      { fr: 'Le tableau de bord du propriétaire : ventes, stock, équipe', en: 'The owner’s dashboard: sales, stock, team' },
    ],
    numbers: [
      { value: { fr: '10', en: '10' }, label: { fr: 'états de commande, aucun ne peut être sauté', en: 'order states, none can be skipped' } },
      { value: { fr: '2', en: '2' }, label: { fr: 'versions de chaque commande : passée, puis confirmée', en: 'versions of every order: as placed, as confirmed' } },
    ],
    holds: [
      {
        title: { fr: 'Aucune commande perdue', en: 'No order gets lost' },
        body: {
          fr: 'La commande d’origine et chaque modification faite au téléphone sont conservées séparément.',
          en: 'The original order and every change made on the phone are kept separately.',
        },
      },
      {
        title: { fr: 'Aucune vente refusée à tort', en: 'No sale turned away by mistake' },
        body: {
          fr: 'Une commande suspecte est signalée pour vérification, pas bloquée.',
          en: 'A suspicious order is flagged for review, not blocked.',
        },
      },
      {
        title: { fr: 'Un circuit sans raccourci', en: 'No shortcuts in the flow' },
        body: {
          fr: 'Une commande ne peut pas sauter d’étape : un passage interdit est refusé avant que quoi que ce soit ne soit enregistré.',
          en: 'An order cannot skip a step: a forbidden move is refused before anything is saved.',
        },
      },
    ],
    cover: {
      file: 'gracepaws-cover.webp',
      alt: { fr: 'La boutique GracePaws sur ordinateur et sur téléphone', en: 'The GracePaws store on a computer and a phone' },
    },
    slides: [
      { file: 'gp-shop-fr.png', frame: 'browser', alt: { fr: 'Le rayon vêtements', en: 'The clothing aisle' } },
      { file: 'gp-product-fr.png', frame: 'browser', alt: { fr: 'Une fiche produit', en: 'A product page' } },
      { file: 'gp-checkout-fr.png', frame: 'browser', alt: { fr: 'La commande, payée à la livraison', en: 'Checkout, paid on delivery' } },
    ],
    media: [
      {
        kind: 'video',
        name: 'gp-browse',
        frame: 'browser',
        alt: { fr: 'On parcourt la boutique jusqu’à la commande', en: 'Browsing the store through to checkout' },
      },
      {
        kind: 'video',
        name: 'gp-mobile',
        frame: 'phone',
        alt: { fr: 'La boutique sur téléphone', en: 'The store on a phone' },
      },
    ],
  },
];

export const projectById = (id: string) => projects.find((p) => p.id === id)!;
export const nextProject = (id: string) => projects[(projects.findIndex((p) => p.id === id) + 1) % projects.length];
