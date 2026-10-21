// Renders the 3D stills from the live scene's own code, on a transparent background:
// - hero: one image per device, step, orientation and theme (public/hero + src/data/hero-stills.json)
// - covers: the project compositions (src/assets/renders)
// The site must be running (pnpm dev). Run: node scripts/render.mjs [hero|covers|all]
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const what = process.argv[2] ?? 'all';
const ROOT = new URL('..', import.meta.url).pathname;
const POOL = Number(process.env.POOL ?? 4);

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });

/** Renders one query and returns the trimmed PNG with its box on the canvas, or null if empty. */
async function shoot(query, { w, h, dpr }) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'fr-FR', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error(query, e.message));
  await page.goto(`${BASE}/?${query}&dpr=${dpr}`);
  await page.waitForFunction(() => document.documentElement.dataset.rendered, null, { timeout: 180_000 });
  const url = await page.evaluate(() => window.__png);
  await ctx.close();
  if (!url) return null;
  const { data, info } = await sharp(Buffer.from(url.split(',')[1], 'base64'))
    .trim({ threshold: 1 })
    .png()
    .toBuffer({ resolveWithObject: true });
  const W = w * dpr;
  const H = h * dpr;
  const left = -(info.trimOffsetLeft ?? 0);
  const top = -(info.trimOffsetTop ?? 0);
  return {
    png: data,
    box: { cx: (left + info.width / 2) / W, cy: (top + info.height / 2) / H, h: info.height / H, ar: info.width / info.height },
  };
}

// Files are written at the end: a new file under src/ makes the dev server reload the pages mid-render.
const pending = [];
const webp = (png, file) => pending.push(() => sharp(png).webp({ quality: 86, alphaQuality: 90, effort: 5 }).toFile(file));
const round = (n) => Math.round(n * 10000) / 10000;

async function pool(jobs) {
  const queue = [...jobs];
  await Promise.all(
    Array.from({ length: POOL }, async () => {
      while (queue.length) await queue.shift()();
    }),
  );
}

if (what === 'hero' || what === 'all') {
  const ORIENTS = { portrait: { w: 390, h: 844, dpr: 3 }, landscape: { w: 1440, h: 900, dpr: 2 } };
  const manifest = {};
  const jobs = [];
  await mkdir(`${ROOT}public/hero`, { recursive: true });
  for (const [orient, size] of Object.entries(ORIENTS)) {
    manifest[orient] = {};
    for (const theme of ['dark', 'light']) {
      const steps = (manifest[orient][theme] = Array.from({ length: 5 }, () => ({})));
      for (let step = 0; step < 5; step++) {
        for (const kind of ['web', 'phone']) {
          jobs.push(async () => {
            const r = await shoot(`render=hero&step=${step}&kind=${kind}&theme=${theme}`, size);
            if (!r) {
              steps[step][kind] = null;
              return;
            }
            const name = `${orient[0]}${step}-${kind}-${theme}.webp`;
            webp(r.png, `${ROOT}public/hero/${name}`);
            steps[step][kind] = { cx: round(r.box.cx), cy: round(r.box.cy), h: round(r.box.h), ar: round(r.box.ar), src: `/hero/${name}` };
            console.log(name);
          });
        }
      }
    }
  }
  await pool(jobs);
  pending.push(() => writeFile(`${ROOT}src/data/hero-stills.json`, JSON.stringify(manifest, null, 1) + '\n'));
}

if (what === 'covers' || what === 'all') {
  const COVERS = {
    'samira-cover': { w: 1600, h: 1000, dpr: 2 },
    'samira-phones': { w: 1600, h: 900, dpr: 2 },
    'ss-cover': { w: 1600, h: 1000, dpr: 2 },
    'aurelis-cover': { w: 1600, h: 1000, dpr: 2 },
    'gracepaws-cover': { w: 1600, h: 1000, dpr: 2 },
  };
  await mkdir(`${ROOT}src/assets/renders`, { recursive: true });
  await pool(
    Object.entries(COVERS).map(([name, size]) => async () => {
      const r = await shoot(`render=${name}&theme=dark`, size);
      webp(r.png, `${ROOT}src/assets/renders/${name}.webp`);
      console.log(name);
    }),
  );
}

await browser.close();
for (const write of pending) await write();
