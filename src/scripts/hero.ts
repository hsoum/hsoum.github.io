/**
 * The hero is a pinned scroll in five steps: the statement, then one service per step.
 * Computers run the live 3D scene. Phones show pre-rendered stills of the same scene,
 * which glide and turn between steps, and switch to live 3D after the first touch when
 * the phone can afford it.
 */
import manifest from '../data/hero-stills.json';
import { KINDS, isPortrait, stepAt, type Kind } from './hero-poses';
import type { Live } from './hero-3d';

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
  };
}

function init(stageEl: HTMLElement) {
  const pin = stageEl.closest<HTMLElement>('.pin')!;
  const steps = [...stageEl.querySelectorAll<HTMLElement>('.step')];
  const heading = stageEl.querySelector('.svc-heading');
  const ticksEl = stageEl.querySelector('.ticks');
  const ticks = ticksEl ? [...ticksEl.children] : [];
  const logos = stageEl.querySelector('.logos');
  const stills = createStills(stageEl, manifest as Stills);
  let live: Live | null = null;
  let step = -1;

  function go(next: number) {
    const prev = step;
    step = next;
    steps.forEach((el, i) => {
      el.classList.toggle('on', i === next);
      el.classList.toggle('past', i < next);
      el.inert = i !== next;
    });
    heading?.classList.toggle('on', next > 0);
    ticksEl?.classList.toggle('on', next > 0);
    ticks.forEach((t, i) => t.classList.toggle('on', i === next - 1));
    logos?.classList.toggle('off', next > 0);
    if (!stageEl.classList.contains('gl-ready')) stills.go(next, prev, prev >= 0);
    live?.go(next, prev);
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const s = stepAt(pinProgress(pin));
      if (s !== step) go(s);
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  go(stepAt(pinProgress(pin)));

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
