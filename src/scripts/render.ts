/**
 * Render mode (?render=…), used only by scripts/render.mjs: draws one set of devices
 * on a transparent canvas and hands the PNG back to Playwright. Visitors never load it.
 */
import { Stage, type Kind, type Pose, type ScreenKey } from './stage';
import { onScreen, poses, screenAt } from './hero-poses';

interface Placed {
  kind: Kind;
  screen: ScreenKey;
  pose: Pose;
}

const P = (x: number, y: number, h: number, z = 0, ry = 0, rx = 0, rz = 0): Pose => ({ x, y, h, z, rx, ry, rz });

/** Compositions for the project covers and case pages; h is a fraction of the stage height. */
const LAYOUTS: Record<string, (H: number) => Placed[]> = {
  'samira-cover': (H) => [
    { kind: 'phone', screen: 'phone-samira-3', pose: P(0.3, 0.53, 0.7 * H, -0.5, 0.42, 0.02) },
    { kind: 'phone', screen: 'phone-samira-4', pose: P(0.7, 0.53, 0.7 * H, -0.5, -0.42, 0.02) },
    { kind: 'phone', screen: 'phone-samira-1', pose: P(0.5, 0.5, 0.82 * H, 0.6, -0.1, -0.02) },
  ],
  'samira-phones': (H) =>
    (['phone-samira-1', 'phone-samira-2', 'phone-samira-3', 'phone-samira-4'] as const).map((screen, i) => ({
      kind: 'phone' as const,
      screen,
      pose: P(0.14 + i * 0.24, 0.5, 0.8 * H, 0, [0.26, 0.09, -0.09, -0.26][i], 0.02),
    })),
  'ss-cover': (H) => [
    { kind: 'web', screen: 'web-ss-site', pose: P(0.36, 0.4, 0.5 * H, -1.2, 0.32, 0.03) },
    { kind: 'web', screen: 'web-platform', pose: P(0.57, 0.57, 0.62 * H, 0.4, -0.26, 0.02) },
  ],
  'aurelis-cover': (H) => [
    { kind: 'web', screen: 'web-aurelis', pose: P(0.42, 0.47, 0.66 * H, 0, 0.3, 0.03) },
    { kind: 'phone', screen: 'phone-aurelis', pose: P(0.75, 0.56, 0.74 * H, 0.8, -0.32, -0.02, 0.02) },
  ],
  'gracepaws-cover': (H) => [
    { kind: 'web', screen: 'web-gp-shop', pose: P(0.58, 0.47, 0.66 * H, 0, -0.3, 0.03) },
    { kind: 'phone', screen: 'phone-gp', pose: P(0.25, 0.56, 0.74 * H, 0.8, 0.32, -0.02, -0.02) },
  ],
};

export async function run(stageEl: HTMLElement, params: URLSearchParams) {
  const root = document.documentElement;
  root.dataset.theme = params.get('theme') === 'light' ? 'light' : 'dark';
  root.classList.add('rendering');
  const stage = new Stage(stageEl, { still: true, pixelRatio: Number(params.get('dpr') ?? 2) });
  const name = params.get('render') ?? '';
  let items: Placed[];
  if (name === 'hero') {
    const step = Number(params.get('step'));
    const kind = params.get('kind') === 'phone' ? 'phone' : 'web';
    const pose = poses(stage.w, stage.h)[step][kind === 'web' ? 0 : 1];
    items = onScreen(pose) ? [{ kind, screen: screenAt(step, kind), pose }] : [];
  } else {
    items = LAYOUTS[name](stage.h);
  }
  const shown = items.map((it) => {
    const d = stage.add(it.kind);
    d.calm = 0;
    d.set(it.pose);
    return d.show(it.screen, { instant: true });
  });
  await Promise.all(shown);
  stage.renderOnce();
  // An empty string tells the renderer this device is off screen at this step.
  (window as unknown as { __png: string }).__png = items.length ? stage.canvas.toDataURL('image/png') : '';
  root.dataset.rendered = name;
}
