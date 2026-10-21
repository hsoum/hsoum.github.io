/**
 * Live 3D for the hero: one pose per scroll step. A device that stays on screen
 * between two steps turns a full turn and comes back showing the next proof.
 */
import { REDUCED, Stage, type Device, type ScreenKey } from './stage';
import { HERO_SCREENS, STEP_SCREENS, onScreen, poses } from './hero-poses';

/** Cycles the statement's screens on a device until stopped. */
function rotation(device: Device, keys: ScreenKey[], every: number, offset = 0) {
  let i = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    start() {
      void device.show(keys[i]);
      if (timer || REDUCED) return;
      const loop = () => {
        i = (i + 1) % keys.length;
        void device.show(keys[i]);
        timer = setTimeout(loop, every);
      };
      timer = setTimeout(loop, every + offset);
    },
    stop() {
      clearTimeout(timer);
      timer = undefined;
    },
  };
}

export interface Live {
  go(next: number, prev: number): void;
}

export function createLive(stageEl: HTMLElement, getStep: () => number): Live {
  let first = true;
  const stage = new Stage(stageEl, {
    onFrame: () => {
      const [w, p] = poses(stage.w, stage.h)[Math.max(0, getStep())];
      web.set(w);
      phone.set(p);
      if (first) {
        web.snap();
        phone.snap();
        first = false;
      }
    },
  });
  const web = stage.add('web');
  const phone = stage.add('phone');
  web.stiffness = phone.stiffness = 4.2;
  const heroWeb = rotation(web, HERO_SCREENS.web, 5200);
  const heroPhone = rotation(phone, HERO_SCREENS.phone, 5200, 2600);

  return {
    go(next, prev) {
      if (next === 0) {
        heroWeb.start();
        heroPhone.start();
        return;
      }
      heroWeb.stop();
      heroPhone.stop();
      const all = poses(stage.w, stage.h);
      ([web, phone] as const).forEach((d, i) => {
        const key = STEP_SCREENS[next]?.[d.kind];
        if (!key) return;
        if (prev >= 0 && onScreen(all[prev][i]) && onScreen(all[next][i])) d.turn(key, i * 140);
        else void d.show(key, { instant: true });
      });
    },
  };
}
