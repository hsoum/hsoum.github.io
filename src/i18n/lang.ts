export type Lang = 'fr' | 'en';
export type Text = Record<Lang, string>;

/** French puts a no-break space before : and a narrow one before ; ! ? » and after «. */
function frenchSpacing(s: string): string {
  return s
    .replace(/ :/g, ' :')
    .replace(/ ([;!?»])/g, ' $1')
    .replace(/« /g, '« ');
}

export function pick(text: Text, lang: Lang): string {
  return lang === 'fr' ? frenchSpacing(text.fr) : text.en;
}

export const otherLang = (lang: Lang): Lang => (lang === 'fr' ? 'en' : 'fr');
export const homePath = (lang: Lang): string => (lang === 'fr' ? '/' : '/en/');
