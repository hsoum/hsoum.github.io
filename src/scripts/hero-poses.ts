/**
 * Where the hero's devices stand at each scroll step, and what they show.
 * Shared by the live scene, the stills and the renderer; it has no 3D code,
 * so importing it costs nothing.
 */
import type { Pose, ScreenKey } from './stage';

export type Kind = 'web' | 'phone';
export const KINDS = ['web', 'phone'] as const;

/** Step 0 is the statement; steps 1–4 are the services, in the order of data/services.ts. */
export const STEP_SCREENS: (Partial<Record<Kind, ScreenKey>> | null)[] = [
  null,
  { web: 'web-platform' },
  { web: 'web-aurelis-product', phone: 'phone-aurelis' },
  { phone: 'phone-samira-1', web: 'web-samira-play' },
  { web: 'web-ss-site' },
];

/** The statement's screens cycle through these; the first pair is the one in the stills. */
export const HERO_SCREENS: Record<Kind, ScreenKey[]> = {
  web: ['web-aurelis', 'web-platform', 'web-gp-shop', 'web-ss-site'],
  phone: ['phone-samira-1', 'phone-aurelis', 'phone-samira-3', 'phone-gp', 'phone-samira-4'],
};

export const screenAt = (step: number, kind: Kind): ScreenKey => STEP_SCREENS[step]?.[kind] ?? HERO_SCREENS[kind][0];

export const isPortrait = (w: number, h: number) => w / h < 0.9;

const off = (side: 1 | -1, H: number): Pose => ({ x: side > 0 ? 1.3 : -0.3, y: 0.7, h: 0.5 * H, z: -1, rx: 0, ry: side * 0.9, rz: 0 });

/** One [web, phone] pair per step. x and y are fractions of the stage, h is in CSS px. */
export function poses(w: number, H: number): [web: Pose, phone: Pose][] {
  return isPortrait(w, H)
    ? [
        [{ x: 0.64, y: 0.67, h: 0.18 * H, z: 0, rx: 0.04, ry: -0.42, rz: 0 }, { x: 0.36, y: 0.71, h: 0.28 * H, z: 0.9, rx: -0.03, ry: 0.34, rz: 0.03 }],
        [{ x: 0.5, y: 0.69, h: 0.21 * H, z: 0.2, rx: 0, ry: -0.16, rz: 0 }, off(1, H)],
        [{ x: 0.66, y: 0.65, h: 0.17 * H, z: -0.8, rx: 0.03, ry: -0.32, rz: 0 }, { x: 0.38, y: 0.71, h: 0.28 * H, z: 0.9, rx: 0, ry: 0.22, rz: 0.02 }],
        [off(1, H), { x: 0.5, y: 0.69, h: 0.34 * H, z: 0.6, rx: 0, ry: -0.14, rz: 0 }],
        [{ x: 0.5, y: 0.69, h: 0.21 * H, z: 0.2, rx: 0, ry: 0.16, rz: 0 }, off(-1, H)],
      ]
    : [
        [{ x: 0.74, y: 0.45, h: 0.44 * H, z: 0, rx: 0.04, ry: -0.42, rz: 0 }, { x: 0.6, y: 0.6, h: 0.52 * H, z: 0.9, rx: -0.03, ry: 0.34, rz: 0.03 }],
        [{ x: 0.69, y: 0.5, h: 0.58 * H, z: 0.2, rx: 0, ry: -0.2, rz: 0 }, off(1, H)],
        [{ x: 0.77, y: 0.42, h: 0.42 * H, z: -0.8, rx: 0.03, ry: -0.34, rz: 0 }, { x: 0.62, y: 0.58, h: 0.56 * H, z: 0.9, rx: 0, ry: 0.24, rz: 0.02 }],
        [{ x: 0.88, y: 0.38, h: 0.32 * H, z: -1.6, rx: 0.03, ry: -0.45, rz: 0 }, { x: 0.68, y: 0.52, h: 0.7 * H, z: 0.6, rx: 0, ry: -0.16, rz: 0 }],
        [{ x: 0.69, y: 0.5, h: 0.58 * H, z: 0.2, rx: 0, ry: 0.2, rz: 0 }, off(-1, H)],
      ];
}

export const onScreen = (p: Pose) => p.x > 0 && p.x < 1;

/** Scroll progress through the pin (0–1) to step. */
export const stepAt = (p: number) => (p < 0.12 ? 0 : p < 0.32 ? 1 : p < 0.52 ? 2 : p < 0.72 ? 3 : 4);
