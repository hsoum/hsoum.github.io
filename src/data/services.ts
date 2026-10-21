import type { Text } from '../i18n/lang';

export interface Service {
  title: Text;
  line: Text;
  promise: Text;
  proof: { label: Text; project: string; anchor?: string };
}

/** In the order the hero steps through them; each step's devices show the proof. */
export const services: Service[] = [
  {
    title: { fr: 'Applications web et SaaS', en: 'Web apps and SaaS' },
    line: {
      fr: 'Des outils internes et des SaaS qui remplacent les tableurs devenus trop petits pour votre équipe.',
      en: 'Internal tools and SaaS that replace the spreadsheets your team outgrew.',
    },
    promise: { fr: 'Première version en 6 à 8 semaines', en: 'First version in 6–8 weeks' },
    proof: { label: { fr: 'Voir la plateforme Soins et Santé', en: 'See the Soins et Santé platform' }, project: 'soins-et-sante' },
  },
  {
    title: { fr: 'Boutiques en ligne', en: 'Online stores' },
    line: {
      fr: 'Des boutiques qui prennent la commande, la confirment et la suivent jusqu’à la porte.',
      en: 'Stores that take the order, confirm it and track it to the door.',
    },
    promise: { fr: 'En ligne en 3 à 5 semaines', en: 'Live in 3–5 weeks' },
    proof: { label: { fr: 'Voir Aurelis', en: 'See Aurelis' }, project: 'aurelis' },
  },
  {
    title: { fr: 'Applications mobiles', en: 'Mobile apps' },
    line: {
      fr: 'Des applications iOS et Android, publiées sur les deux stores et maintenues.',
      en: 'iOS and Android apps, published on both stores and kept there.',
    },
    promise: { fr: 'Sur les deux stores en 8 à 12 semaines', en: 'On both stores in 8–12 weeks' },
    proof: {
      label: { fr: 'Voir Samira Plus, plus de 10 000 téléchargements', en: 'See Samira Plus, 10K+ downloads' },
      project: 'samira-plus',
    },
  },
  {
    title: { fr: 'Sites de marque', en: 'Brand sites' },
    line: {
      fr: 'Des sites rapides qui donnent à une entreprise l’allure sérieuse qu’elle mérite.',
      en: 'Fast sites that make a company look as serious as it is.',
    },
    promise: { fr: 'En ligne en 2 à 3 semaines', en: 'Online in 2–3 weeks' },
    proof: {
      label: { fr: 'Voir le site Soins et Santé', en: 'See the Soins et Santé website' },
      project: 'soins-et-sante',
      anchor: 'site',
    },
  },
];
