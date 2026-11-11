/**
 * "Mobile" means a narrow screen driven by touch. There the page swipes instead of
 * pinning and stacking. The query is evaluated in one place, the inline script in
 * layouts/Base.astro, which mirrors the answer as html[data-mobile]: CSS keys off that
 * attribute and scripts read it here, so the two always agree.
 */
export const MOBILE_QUERY = '(max-width: 52rem) and (pointer: coarse)';

/** Fired on <html> each time the answer changes (resize, rotation, a mouse plugged in). */
export const MOBILE_EVENT = 'mobilechange';

export const isMobile = () => document.documentElement.hasAttribute('data-mobile');

export const onMobileChange = (fn: (mobile: boolean) => void) => document.documentElement.addEventListener(MOBILE_EVENT, () => fn(isMobile()));

/** Scripted scrolls glide, unless the visitor asked for less motion. */
const glide = (): ScrollBehavior => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

/**
 * Pagination for a native scroll-snap track. The browser does the swiping; this reports
 * which slide is in view, moves to a slide when its dot is tapped, and keeps a swipe from
 * ending as a tap on a link. It does nothing while the page is not in mobile mode.
 */
export function carousel(track: HTMLElement, slides: HTMLElement[], dots: (HTMLElement | null | undefined)[], onChange: (index: number) => void) {
  const scrollTo = (i: number, behavior: ScrollBehavior = glide()) => {
    const slide = slides[i];
    if (!slide) return;
    const left = slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left: left - (track.clientWidth - slide.offsetWidth) / 2, behavior });
  };

  const seen = new IntersectionObserver(
    (entries) => {
      if (!isMobile()) return;
      for (const e of entries) if (e.isIntersecting) onChange(slides.indexOf(e.target as HTMLElement));
    },
    { root: track, threshold: 0.6 },
  );
  slides.forEach((s) => seen.observe(s));

  dots.forEach((dot, i) => dot?.addEventListener('click', () => isMobile() && scrollTo(i)));

  // Browsers already cancel the click when a touch becomes a scroll; this covers the rest
  // (a drag that ends where it began, a pen, a late synthetic click).
  let from = 0;
  track.addEventListener('pointerdown', () => (from = track.scrollLeft), { passive: true });
  track.addEventListener(
    'click',
    (e) => {
      if (!isMobile() || Math.abs(track.scrollLeft - from) < 8) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );

  return { scrollTo };
}
