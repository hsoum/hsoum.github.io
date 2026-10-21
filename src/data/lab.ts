import type { Text } from '../i18n/lang';

export interface Concept {
  slug: string;
  name: string;
  market: Text;
  goal: Text;
}

/** Static exports live in public/lab/<slug>/, recordings in public/media/lab-<slug>.mp4. */
export const concepts: Concept[] = [
  {
    slug: 'comptoir',
    name: 'Le Comptoir d’Émile',
    market: { fr: 'Bistrot français à Brooklyn', en: 'French bistro in Brooklyn' },
    goal: { fr: 'Remplir les tables et les soirées privées', en: 'Fill tables and private evenings' },
  },
  {
    slug: 'clarity',
    name: 'Clarity Growth Co.',
    market: { fr: 'Coach pour fondateurs à Austin', en: 'Founder coach in Austin' },
    goal: { fr: 'Obtenir des appels découverte', en: 'Get discovery calls booked' },
  },
  {
    slug: 'meridian',
    name: 'Meridian Realty Group',
    market: { fr: 'Agence immobilière à Denver', en: 'Real estate agency in Denver' },
    goal: { fr: 'Convaincre les vendeurs de confier leur bien', en: 'Win sellers’ listings' },
  },
  {
    slug: 'brightline',
    name: 'Brightline Electric',
    market: { fr: 'Électricien à Portland', en: 'Electrician in Portland' },
    goal: { fr: 'Faire sonner le téléphone', en: 'Make the phone ring' },
  },
];
