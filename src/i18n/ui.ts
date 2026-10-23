import type { Lang } from './lang';

export const casePath = (lang: Lang, id: string) => (lang === 'fr' ? `/projets/${id}/` : `/en/work/${id}/`);
export const legalPath = (lang: Lang) => (lang === 'fr' ? '/mentions-legales/' : '/en/legal-notice/');
export const privacyPath = (lang: Lang) => (lang === 'fr' ? '/confidentialite/' : '/en/privacy/');

export const ui = {
  meta: {
    title: {
      fr: 'Studio Faber | Hichem Soumati, développeur freelance web et mobile',
      en: 'Studio Faber | Hichem Soumati, freelance web and mobile developer',
    },
    description: {
      fr: 'Applications web, boutiques en ligne, applications mobiles et sites de marque, pour les startups et les entreprises. Développeur freelance, web et mobile.',
      en: 'Web apps, online stores, mobile apps and brand sites for startups and businesses. Freelance developer, web and mobile.',
    },
  },
  skip: { fr: 'Aller au contenu', en: 'Skip to content' },
  nav: {
    label: { fr: 'Principale', en: 'Main' },
    work: { fr: 'Réalisations', en: 'Work' },
    contact: { fr: 'Contact', en: 'Contact' },
    other: { fr: 'English', en: 'Français' },
    otherShort: { fr: 'EN', en: 'FR' },
    toLight: { fr: 'Passer en mode clair', en: 'Switch to light mode' },
    toDark: { fr: 'Passer en mode sombre', en: 'Switch to dark mode' },
  },
  book: { fr: 'Réserver un appel', en: 'Book a call' },
  bookSubject: { fr: 'Demande d’appel', en: 'Call request' },
  hero: {
    label: { fr: 'Présentation et services', en: 'Introduction and services' },
    statement: { fr: ['Livré vite.', 'Fait pour durer.'], en: ['Built to ship.', 'Built to last.'] },
    statementText: { fr: 'Livré vite. Fait pour durer.', en: 'Built to ship. Built to last.' },
    who: { fr: 'Hichem Soumati, développeur freelance, web et mobile.', en: 'Hichem Soumati, freelance developer, web and mobile.' },
    what: {
      fr: 'Applications, boutiques en ligne et sites pour les startups et les entreprises.',
      en: 'Apps, online stores and websites for startups and businesses.',
    },
    seeWork: { fr: 'Voir les réalisations', en: 'See the work' },
    services: { fr: 'Ce que je construis', en: 'What I build' },
    clients: { fr: 'Clients', en: 'Clients' },
  },
  work: {
    title: { fr: 'Réalisations', en: 'Selected work' },
    view: { fr: 'Voir', en: 'View' },
    open: { fr: 'Voir le projet', en: 'View the project' },
  },
  lab: {
    title: { fr: 'Explorations', en: 'Design explorations' },
    intro: {
      fr: 'Des sites pour des entreprises imaginaires, chacun pensé pour son marché. Ils sont en ligne : ouvrez-les.',
      en: 'Sites for imaginary businesses, each designed for its market. They are live: open them.',
    },
    open: { fr: 'Ouvrir le concept', en: 'Open the concept' },
    goal: { fr: 'Objectif', en: 'Goal' },
  },
  testimonials: { title: { fr: 'Ils en parlent', en: 'In their words' } },
  numbers: { title: { fr: 'En chiffres', en: 'In numbers' } },
  contact: {
    title: { fr: 'Construisons le vôtre.', en: 'Let’s build yours.' },
    body: {
      fr: 'Racontez-moi votre projet pendant un appel de 30 minutes. Vous recevez ensuite une proposition écrite.',
      en: 'Tell me about your project in a 30-minute call. You get a written proposal afterwards.',
    },
    reply: { fr: 'Réponse sous 24 heures', en: 'Reply within 24 hours' },
    or: { fr: 'Ou écrivez-moi', en: 'Or write to me' },
  },
  case: {
    back: { fr: 'Toutes les réalisations', en: 'All work' },
    need: { fr: 'Le besoin', en: 'The need' },
    built: { fr: 'Ce que j’ai construit', en: 'What I built' },
    numbers: { fr: 'En chiffres', en: 'In numbers' },
    holds: { fr: 'Pourquoi ça tient', en: 'Why it holds' },
    next: { fr: 'Projet suivant', en: 'Next project' },
    cta: { fr: 'Un projet du même genre ?', en: 'A project like this one?' },
  },
  footer: {
    credit: { fr: 'Conçu et développé par Hichem Soumati', en: 'Designed and built by Hichem Soumati' },
    legal: { fr: 'Mentions légales', en: 'Legal notice' },
    privacy: { fr: 'Confidentialité', en: 'Privacy' },
    cookies: { fr: 'Gérer les cookies', en: 'Manage cookies' },
  },
  consent: {
    text: {
      fr: 'Puis-je mesurer les visites avec Google Analytics ? Rien n’est chargé sans votre accord.',
      en: 'May I measure visits with Google Analytics? Nothing loads unless you agree.',
    },
    accept: { fr: 'Accepter', en: 'Accept' },
    reject: { fr: 'Refuser', en: 'Reject' },
    more: { fr: 'En savoir plus', en: 'Learn more' },
  },
  notFound: {
    title: { fr: 'Cette page n’existe pas.', en: 'This page doesn’t exist.' },
    body: { fr: 'Le lien est peut-être ancien. Tout le reste est sur l’accueil.', en: 'The link may be old. Everything else is on the home page.' },
    home: { fr: 'Retour à l’accueil', en: 'Back to the home page' },
  },
};
