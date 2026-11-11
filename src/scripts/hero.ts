/**
 * The hero has five steps: the statement, then one service per step. With a mouse it is
 * a pinned scroll; on a phone (scripts/mobile.ts) it is a swipe carousel, one slide per
 * step. Either way the step ends up in go().
 * Computers run the live 3D scene. Phones show pre-rendered stills of the same scene,
 * which glide and turn between steps, and switch to live 3D after the first touch when
 * the phone can afford it.
 */
import manifest from '../data/hero-stills.json';
import { KINDS, isPortrait, stepAt, type Kind } from './hero-poses';
import type { Live } from './hero-3d';
import { carousel, isMobile, onMobileChange } from './mobile';

interface Box {
  cx: number;
  cy: number;
  /** Height as a fraction of the stage height. */
  h: number;
  /** Width over height. */
  ar: number;
  src: string;
}
type StepBoxes = Partial<Record<Kind, Box | null>>;
type Stills = Record<'portrait' | 'landscape', Record<'dark' | 'light', StepBoxes[]>>;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLight = () => document.documentElement.dataset.theme === 'light';
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(() => fn(), { timeout: 1500 }) : setTimeout(fn, 200));

function pinProgress(pin: HTMLElement) {
  const r = pin.getBoundingClientRect();
  const total = r.height - innerHeight;
  return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
}

/** Off-screen side a device leaves to, matching the live scene. */
const leaveSide = (step: number, kind: Kind) => (kind === 'phone' && step === 4 ? -1 : 1);

function createStills(stageEl: HTMLElement, data: Stills) {
  const els = Object.fromEntries(KINDS.map((k) => [k, stageEl.querySelector<HTMLImageElement>(`.still[data-kind="${k}"]`)!])) as Record<Kind, HTMLImageElement>;
  // From here on the script picks the file, not the <picture> media query.
  for (const el of Object.values(els)) {
    const chosen = el.currentSrc;
    el.parentElement?.querySelectorAll('source').forEach((s) => s.remove());
    if (chosen) el.src = chosen;
  }
  const tokens: Record<Kind, number> = { web: 0, phone: 0 };
  let current = -1;

  const boxes = () => data[isPortrait(stageEl.clientWidth, stageEl.clientHeight) ? 'portrait' : 'landscape'][isLight() ? 'light' : 'dark'];

  function place(el: HTMLImageElement, b: Box) {
    el.style.setProperty('--cx', String(b.cx));
    el.style.setProperty('--cy', String(b.cy));
    el.style.setProperty('--h', String(b.h));
    el.style.setProperty('--ar', String(b.ar));
    if (el.getAttribute('src') !== b.src) el.src = b.src;
    el.classList.remove('gone');
  }

  async function ready(src: string) {
    const img = new Image();
    img.src = src;
    try {
      await img.decode();
    } catch {
      /* show it anyway */
    }
  }

  const spin = (from: number, to: number) => [
    { transform: `translate(-50%, -50%) perspective(1400px) rotateY(${from}deg)` },
    { transform: `translate(-50%, -50%) perspective(1400px) rotateY(${to}deg)` },
  ];

  function go(next: number, prev: number, animate: boolean) {
    current = next;
    const set = boxes();
    KINDS.forEach((kind, i) => {
      const el = els[kind];
      const token = ++tokens[kind];
      const box = set[next]?.[kind];
      const was = prev >= 0 ? set[prev]?.[kind] : null;
      el.classList.toggle('instant', !animate);
      if (!box) {
        el.style.setProperty('--cx', String(leaveSide(next, kind) > 0 ? 1.4 : -0.4));
        el.classList.add('gone');
        return;
      }
      if (!animate || REDUCED || !was) {
        place(el, box);
        return;
      }
      // A turn: the device rotates edge-on, changes screen, and comes back round at its new place.
      setTimeout(async () => {
        await ready(box.src);
        if (token !== tokens[kind]) return;
        await el.animate(spin(0, 90), { duration: 420, easing: 'cubic-bezier(.55,0,.8,.2)' }).finished.catch(() => {});
        if (token !== tokens[kind]) return;
        place(el, box);
        el.animate(spin(-90, 0), { duration: 680, easing: 'cubic-bezier(.15,.75,.2,1)' });
      }, i * 140);
    });
  }

  return {
    go,
    /** Re-places the current step without motion, after a theme or orientation change. */
    refresh() {
      if (current >= 0) go(current, -1, false);
    },
    /** Ends a turn that is under way: every device is at its place, at once. */
    settle() {
      for (const el of Object.values(els)) el.getAnimations().forEach((a) => a.cancel());
      this.refresh();
    },
  };
}

function init(stageEl: HTMLElement) {
  const pin = stageEl.closest<HTMLElement>('.pin')!;
  const steps = [...stageEl.querySelectorAll<HTMLElement>('.step')];
  const heading = stageEl.querySelector('.svc-heading');
  const ticksEl = stageEl.querySelector('.ticks');
  // One mark per step. The statement's mark only shows on phones, where the marks are dots.
  const ticks = ticksEl ? [...ticksEl.children] : [];
  const dots = ticks.map((t) => t.querySelector('button'));
  const logos = stageEl.querySelector('.logos');
  const track = stageEl.querySelector<HTMLElement>('.copy')!;

  // Whether the swipe track is moving (phones only), from its first scroll event until it
  // has snapped into place. Deliberately no touch or pointer listeners here: they make the
  // browser consult the page before a new swipe may interrupt the last one's snap.
  let moving = false;
  let stop: ReturnType<typeof setTimeout> | undefined;
  const rested = () => {
    clearTimeout(stop);
    if (!moving) return;
    moving = false;
    turn();
  };
  track.addEventListener(
    'scroll',
    () => {
      if (!isMobile()) return;
      // The devices hold still for the whole swipe: a turn under way ends here, and the next
      // one waits for the track to rest. Anything that animates or lays out while a swipe
      // settles makes the browser snap back to the slide it was leaving.
      if (!moving) stills.settle();
      moving = true;
      // Browsers without scrollend: no scroll for a moment means it stopped.
      clearTimeout(stop);
      stop = setTimeout(rested, 'onscrollend' in window ? 1000 : 150);
    },
    { passive: true },
  );
  track.addEventListener('scrollend', rested);

  const stills = createStills(stageEl, manifest as Stills);
  let live: Live | null = null;
  let step = -1;
  /** The step the devices show; it trails `step` while a swipe is under way. */
  let shown = -1;
  function turn() {
    if (moving || shown === step) return;
    if (!stageEl.classList.contains('gl-ready')) stills.go(step, shown, shown >= 0);
    live?.go(step, shown);
    shown = step;
  }

  /** Pinned, only the current step can be reached; swiped, every slide is there to read. */
  function reach() {
    const mobile = isMobile();
    steps.forEach((el, i) => (el.inert = !mobile && i !== step));
    if (mobile) ticksEl?.removeAttribute('aria-hidden');
    else ticksEl?.setAttribute('aria-hidden', 'true');
  }

  function go(next: number) {
    step = next;
    steps.forEach((el, i) => {
      el.classList.toggle('on', i === next);
      el.classList.toggle('past', i < next);
    });
    reach();
    heading?.classList.toggle('on', next > 0);
    ticksEl?.classList.toggle('on', next > 0);
    ticks.forEach((t, i) => {
      t.classList.toggle('on', i === next);
      if (i === next) dots[i]?.setAttribute('aria-current', 'true');
      else dots[i]?.removeAttribute('aria-current');
    });
    logos?.classList.toggle('off', next > 0);
    turn();
  }

  let queued = false;
  const onScroll = () => {
    if (queued || isMobile()) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (isMobile()) return;
      const s = stepAt(pinProgress(pin));
      if (s !== step) go(s);
    });
  };
  addEventListener('scroll', onScroll, { passive: true });

  // Phones: the copy is a scroll-snap track, and the slide in view is the step.
  const slides = carousel(track, steps, dots, (i) => {
    if (i !== step) go(i);
  });
  const swiped = () => {
    if (!isMobile() || track.scrollLeft < 8) return;
    stageEl.classList.add('swiped');
    track.removeEventListener('scroll', swiped);
  };
  track.addEventListener('scroll', swiped, { passive: true });

  go(isMobile() ? 0 : stepAt(pinProgress(pin)));
  onMobileChange((mobile) => {
    // Keep the step across a rotation: the track opens on it, or the pin picks it up from the scroll.
    if (mobile) slides.scrollTo(step, 'auto');
    else rested();
    const s = mobile ? step : stepAt(pinProgress(pin));
    if (s !== step) go(s);
    else reach();
  });

  let portrait = isPortrait(stageEl.clientWidth, stageEl.clientHeight);
  new ResizeObserver(() => {
    const now = isPortrait(stageEl.clientWidth, stageEl.clientHeight);
    if (now !== portrait) {
      portrait = now;
      stills.refresh();
    }
    onScroll();
  }).observe(stageEl);
  new MutationObserver(() => stills.refresh()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (!('WebGLRenderingContext' in window)) return;
  const startLive = async () => {
    if (live) return;
    try {
      const { createLive } = await import('./hero-3d');
      live = createLive(stageEl, () => step);
      live.go(step, -1);
    } catch {
      // No usable WebGL: the stills stay.
    }
  };

  if (!matchMedia('(pointer: coarse)').matches) {
    if (document.readyState === 'complete') idle(startLive);
    else addEventListener('load', () => idle(startLive), { once: true });
    return;
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const capable = !REDUCED && !nav.connection?.saveData && (nav.deviceMemory ?? 4) >= 4 && (navigator.hardwareConcurrency ?? 4) >= 6;
  if (capable) addEventListener('touchstart', () => idle(startLive), { once: true, passive: true });
}

const stageEl = document.querySelector<HTMLElement>('[data-stage]');
if (stageEl) {
  const params = new URLSearchParams(location.search);
  if (params.has('render')) void import('./render').then((m) => m.run(stageEl, params));
  else init(stageEl);
}
