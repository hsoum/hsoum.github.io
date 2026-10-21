import type { Text } from '../i18n/lang';

export interface Testimonial {
  quote: Text;
  /** "Role, Company", no personal name. */
  signature: Text;
  project: string;
}

/**
 * Only quotes the client has approved in writing, word for word, in both languages.
 * Drafts and the approval messages live outside this repository. While this list
 * is empty, the section does not render.
 */
export const testimonials: Testimonial[] = [];
