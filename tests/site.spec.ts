import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const PAGES = ['/', '/en/', '/projets/samira-plus/', '/en/work/soins-et-sante/', '/projets/aurelis/', '/en/work/gracepaws/', '/mentions-legales/', '/en/privacy/'];

/** Every page of the site itself; the concept exports under /lab are separate sites. */
const builtPages = () =>
  readdirSync(DIST, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.html') && !f.startsWith('lab'))
    .map((f) => ({ file: f, html: readFileSync(join(DIST, f), 'utf8') }));

/** Visible text only: no tags, scripts or styles. */
const text = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

const scrollPin = (page: Page, f: number) =>
  page.evaluate((f) => {
    const pin = document.querySelector<HTMLElement>('.pin')!;
    scrollTo(0, pin.offsetTop + (pin.offsetHeight - innerHeight) * f);
  }, f);

test.describe('content rules', () => {
  test('the word "wilaya" appears nowhere', () => {
    for (const { file, html } of builtPages()) expect(html.toLowerCase(), file).not.toContain('wilaya');
  });

  test('the site’s own text has no Arabic script', () => {
    for (const { file, html } of builtPages()) expect(text(html), file).not.toMatch(/[؀-ۿ]/);
  });

  test('the copy talks about results, not tooling', () => {
    for (const { file, html } of builtPages()) expect(text(html), file).not.toMatch(/\b(AI|IA|ChatGPT|LLM)\b/);
  });

  test('Devinci Junior appears only in the legal notice', () => {
    for (const { file, html } of builtPages()) {
      if (/mentions-legales|legal-notice/.test(file)) continue;
      expect(text(html), file).not.toContain('Devinci');
    }
  });
});

test.describe('pages', () => {
  for (const path of PAGES) {
    test(`${path} renders with its alternates and nothing missing`, async ({ page }) => {
      const broken: string[] = [];
      page.on('response', (r) => r.status() >= 400 && broken.push(`${r.status()} ${r.url()}`));
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      expect(broken).toEqual([]);
    });
  }

  test('the 404 page exists', async ({ page }) => {
    const res = await page.goto('/nowhere/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('every project card opens its case study', async ({ page }) => {
    await page.goto('/en/');
    const hrefs = await page.locator('.card-link').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual(['/en/work/samira-plus/', '/en/work/soins-et-sante/', '/en/work/aurelis/', '/en/work/gracepaws/']);
    for (const href of hrefs) {
      const res = await page.goto(href!);
      expect(res?.status()).toBe(200);
      await expect(page.locator('.case-cover img')).toBeVisible();
    }
  });

  test('the site loads nothing from other servers', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (r) => !r.url().startsWith('http://127.0.0.1') && !r.url().startsWith('data:') && foreign.push(r.url()));
    for (const path of ['/', '/en/work/samira-plus/']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    expect(foreign).toEqual([]);
  });

  test('nothing scrolls sideways on a small phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    for (const path of ['/', '/en/work/soins-et-sante/', '/confidentialite/']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('language', () => {
  test.describe('an English browser', () => {
    test.use({ locale: 'en-GB' });

    test('is sent from / to /en/', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/en\/$/);
    });

    test('stays in French once French was chosen', async ({ page }) => {
      await page.goto('/en/');
      await page.locator('.nav-lang').click();
      await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    });
  });

  test.describe('a French browser', () => {
    test.use({ locale: 'fr-FR' });

    test('stays on /', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    });
  });

  test('the switch leads to the same page in the other language', async ({ page }) => {
    await page.goto('/projets/aurelis/');
    await expect(page.locator('.nav-lang')).toHaveAttribute('href', '/en/work/aurelis/');
  });
});

test.describe('theme', () => {
  test('dark by default, and the choice persists', async ({ page }) => {
    await page.goto('/en/');
    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await page.locator('.nav-theme').click();
    await expect(root).toHaveAttribute('data-theme', 'light');
    await page.goto('/en/work/aurelis/');
    await expect(root).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('hero', () => {
  test('scrolling steps through the four services', async ({ page }) => {
    // The steps don't depend on the live 3D, and compiling it without a GPU (CI) stalls the page for seconds.
    await page.route(/hero-3d|stage\./, (r) => r.abort());
    await page.goto('/en/');
    const on = page.locator('.step.on');
    await expect(on.locator('h1')).toBeVisible();
    for (const [f, title] of [
      [0.22, 'Web apps and SaaS'],
      [0.42, 'Online stores'],
      [0.62, 'Mobile apps'],
      [0.85, 'Brand sites'],
    ] as const) {
      await scrollPin(page, f);
      await expect(on.locator('h3')).toHaveText(title);
    }
    await expect(page.locator('.step:not(.on)').first()).toHaveAttribute('inert', '');
  });
});

test.describe('consent', () => {
  test('without a measurement ID there is no banner and no analytics', async ({ page }) => {
    const ga: string[] = [];
    page.on('request', (r) => /google-analytics|googletagmanager/.test(r.url()) && ga.push(r.url()));
    await page.goto('/');
    await expect(page.locator('[data-consent]')).toHaveCount(0);
    expect(ga).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('recordings stay still', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#lab').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const playing = await page.locator('video').evaluateAll((vs) => vs.filter((v) => !(v as HTMLVideoElement).paused).length);
    expect(playing).toBe(0);
  });
});

test.describe('accessibility', () => {
  for (const theme of ['dark', 'light']) {
    for (const path of ['/', '/en/', '/en/work/samira-plus/', '/mentions-legales/']) {
      test(`${path} in ${theme} mode has no serious violations`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('hs-theme', t), theme);
        await page.goto(path);
        const results = await new AxeBuilder({ page }).analyze();
        const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
      });
    }
  }
});
