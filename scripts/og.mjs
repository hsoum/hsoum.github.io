// Captures the hero of each language, live 3D included, as its 1200×630 share image.
// Run against a live preview: `pnpm preview` then `node scripts/og.mjs`.
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });

for (const [path, lang] of [
  ['/', 'fr'],
  ['/en/', 'en'],
]) {
  // Reduced motion holds the screens and the light still, so the frame is never mid-transition.
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, locale: `${lang}-FR`, reducedMotion: 'reduce' });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.nav,.ctas,.hero-logos,.skip{display:none!important}' });
  await page.waitForFunction(() => document.querySelector('.gl')?.classList.contains('ready'), null, { timeout: 60_000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `public/og-${lang}.png`, timeout: 120_000 });
  console.log(`public/og-${lang}.png`);
  await page.close();
}

await browser.close();
