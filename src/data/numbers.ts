import type { Text } from '../i18n/lang';

/** The strip before the contact section. Every figure is verified on the project it links to. */
export const numbers: { value: Text; label: Text; project: string }[] = [
  {
    value: { fr: '10 000+', en: '10K+' },
    label: { fr: 'téléchargements pour Samira Plus sur Google Play', en: 'Samira Plus downloads on Google Play' },
    project: 'samira-plus',
  },
  {
    value: { fr: '4', en: '4' },
    label: { fr: 'décimales justes sur le coût de chaque import', en: 'decimal places right on every import’s cost' },
    project: 'soins-et-sante',
  },
  {
    value: { fr: '1 500+', en: '1,500+' },
    label: { fr: 'communes livrées par la boutique Aurelis', en: 'communes the Aurelis store delivers to' },
    project: 'aurelis',
  },
  {
    value: { fr: '3', en: '3' },
    label: { fr: 'plateformes pour une même application : iOS, Android, Apple TV', en: 'platforms for one app: iOS, Android, Apple TV' },
    project: 'samira-plus',
  },
];
