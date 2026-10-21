export const NAME = 'Hichem Soumati';
export const EMAIL = 'hello@studiofaber.me';
export const SITE_URL = 'https://studiofaber.me';

/**
 * Booking page. Empty until the Cal.com page exists: the "Book a call"
 * buttons then fall back to an email with a prefilled subject.
 */
export const BOOKING_URL = '';

/** Empty hides the LinkedIn link everywhere. */
export const LINKEDIN_URL = '';

/** Google Analytics 4 measurement ID (G-XXXXXXX). Empty: no banner, no analytics. */
export const GA_ID = '';

export function bookingHref(subject: string): string {
  return BOOKING_URL || `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}
