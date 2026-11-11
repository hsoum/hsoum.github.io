import { test, expect, type CDPSession, type Page } from '@playwright/test';

/**
 * Phones swipe where computers scroll: the hero and the work cards are native scroll-snap
 * carousels there (src/scripts/mobile.ts). The swipes below are real touch gestures sent
 * through the browser's input pipeline, so touch-action and scroll snapping are exercised.
 */
const HOME = '/en/';

const sessions = new WeakMap<Page, CDPSession>();

async function swipe(page: Page, selector: string, by: { x?: number; y?: number; rest?: boolean }) {
  const box = (await page.locator(selector).boundingBox())!;
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(Math.max(box.y, 0) + Math.min(box.height, 400) / 2);
  const at = (f: number) => [{ x: x + (by.x ?? 0) * f, y: y + (by.y ?? 0) * f }];
  const cdp = sessions.get(page) ?? (await page.context().newCDPSession(page));
  sessions.set(page, cdp);
  // The gesture is over at scrollend, once the snap has finished; a touch sent sooner is dropped.
  await page.locator(selector).evaluate((el) => {
    (window as { rest?: Promise<unknown> }).rest = new Promise((done) => {
      el.addEventListener('scrollend', done, { once: true });
      document.addEventListener('scrollend', done, { once: true });
      setTimeout(done, 3000);
    });
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(0) });
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(i / 10) });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  if (by.rest === false) return;
  await page.evaluate(() => (window as { rest?: Promise<unknown> }).rest);
  await page.waitForTimeout(150);
}

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const open = async (page: Page) => {
  // The steps don't depend on the live 3D, and compiling it without a GPU (CI) stalls the page.
  await page.route(/hero-3d|stage\./, (r) => r.abort());
  await page.goto(HOME);
};

test.describe('on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone profiles only');

  test('the hero is one screen tall and no longer pinned', async ({ page }) => {
    await open(page);
    await expect(page.locator('html')).toHaveAttribute('data-mobile', '');
    const hero = await page.evaluate(() => {
      const pin = document.querySelector<HTMLElement>('.pin')!;
      return { ratio: pin.offsetHeight / innerHeight, position: getComputedStyle(pin.querySelector('.stage')!).position };
    });
    expect(hero.ratio).toBeCloseTo(1, 1);
    expect(hero.position).toBe('relative');
  });

  test('swiping the hero moves through the steps', async ({ page }) => {
    await open(page);
    const on = page.locator('.step.on');
    const current = page.locator('.ticks button[aria-current]');
    await expect(on.locator('h1')).toBeVisible();
    await expect(page.locator('.swipe-hint')).toBeVisible();
    await expect(current).toHaveAccessibleName('Introduction');

    await swipe(page, '.copy', { x: -160 });
    await expect(on.locator('h3')).toHaveText('Web apps and SaaS');
    await expect(current).toHaveAccessibleName('Web apps and SaaS');
    await expect(page.locator('.swipe-hint')).toHaveCSS('opacity', '0');

    await swipe(page, '.copy', { x: -160 });
    await expect(on.locator('h3')).toHaveText('Online stores');

    await swipe(page, '.copy', { x: 160 });
    await expect(on.locator('h3')).toHaveText('Web apps and SaaS');
    // Each slide stops square on the screen.
    await expect.poll(() => page.evaluate(() => { const t = document.querySelector('.copy')!; return t.scrollLeft / t.clientWidth; })).toBeCloseTo(1, 2);
  });

  test.describe('in quick succession', () => {
    // Timing-sensitive by nature: the gestures are sent on a clock, on a shared machine.
    test.describe.configure({ retries: 2 });

    test('each swipe lands on the next slide', async ({ page }) => {
      // A swipe that starts while the last one is still snapping must not be lost: nothing
      // in the hero may animate or lay out until the track is at rest (scripts/hero.ts).
      await open(page);
      for (let i = 0; i < 3; i++) {
        await swipe(page, '.copy', { x: -160, rest: false });
        await page.waitForTimeout(300);
      }
      await expect(page.locator('.step.on h3')).toHaveText('Mobile apps');
      await expect.poll(() => page.evaluate(() => { const t = document.querySelector('.copy')!; return t.scrollLeft / t.clientWidth; })).toBeCloseTo(3, 2);
    });
  });

  test('the dots are full-size buttons that go to their slide', async ({ page }) => {
    await open(page);
    const dots = page.locator('.ticks button');
    await expect(dots).toHaveCount(5);
    for (const box of await dots.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()))) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await dots.nth(3).tap();
    await expect(page.locator('.step.on h3')).toHaveText('Mobile apps');
    await dots.nth(0).tap();
    await expect(page.locator('.step.on h1')).toBeVisible();
  });

  test('a vertical swipe over the hero scrolls the page, not the carousel', async ({ page }) => {
    await open(page);
    await swipe(page, '.copy', { y: -260 });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
    await expect(page.locator('.step.on h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.querySelector('.copy')!.scrollLeft)).toBe(0);
  });

  test('the work cards swipe, and a swipe never opens a case study', async ({ page }) => {
    await open(page);
    const current = page.locator('.work-dots button[aria-current]');
    await page.locator('.cards').scrollIntoViewIfNeeded();
    await expect(current).toHaveAccessibleName('Samira Plus');

    const card = await page.evaluate(() => {
      const c = document.querySelector<HTMLElement>('.card')!;
      const tall = [...document.querySelectorAll<HTMLElement>('.card')].every((el) => el.scrollHeight <= el.clientHeight + 1);
      return { vw: c.offsetWidth / innerWidth, fits: tall, minHeight: getComputedStyle(c).minHeight };
    });
    expect(card.vw).toBeCloseTo(0.85, 2);
    expect(card.fits).toBe(true);
    expect(card.minHeight).toBe('0px');

    await swipe(page, '.cards', { x: -150 });
    await expect(current).toHaveAccessibleName('Soins et Santé');
    await expect(page).toHaveURL(/\/en\/$/);
    // The second card rests in the middle of the screen, with its neighbours showing.
    const off = await page.evaluate(() => {
      const r = document.querySelectorAll('.slot')[1].getBoundingClientRect();
      return Math.abs(r.left + r.width / 2 - innerWidth / 2);
    });
    expect(off).toBeLessThan(2);

    await page.locator('.work-dots button').nth(3).tap();
    await expect(current).toHaveAccessibleName('GracePaws');

    await page.locator('.card').nth(3).tap();
    await expect(page).toHaveURL(/\/en\/work\/gracepaws\/$/);
  });

  test('nothing scrolls sideways, before or after swiping', async ({ page }) => {
    for (const path of ['/', HOME, '/en/work/soins-et-sante/', '/confidentialite/']) {
      await page.goto(path);
      expect(await overflow(page), path).toBeLessThanOrEqual(0);
    }
    await open(page);
    await swipe(page, '.copy', { x: -160 });
    await page.locator('.cards').scrollIntoViewIfNeeded();
    await swipe(page, '.cards', { x: -150 });
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(await page.evaluate(() => scrollX)).toBe(0);
  });

  test('turning the phone to a wide landscape brings the pinned scroll back', async ({ page }) => {
    await open(page);
    await swipe(page, '.copy', { x: -160 });
    await expect(page.locator('.step.on h3')).toHaveText('Web apps and SaaS');
    const { width, height } = page.viewportSize()!;
    await page.setViewportSize({ width: Math.max(height, 900), height: width });
    await expect(page.locator('html')).not.toHaveAttribute('data-mobile', '');
    expect(await page.evaluate(() => document.querySelector<HTMLElement>('.pin')!.offsetHeight / innerHeight)).toBeGreaterThan(5);
    await page.setViewportSize({ width, height });
    await expect(page.locator('html')).toHaveAttribute('data-mobile', '');
    await expect(page.locator('.step.on')).toHaveCount(1);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('swiping still works and the dots jump without gliding', async ({ page }) => {
      await open(page);
      await swipe(page, '.copy', { x: -160 });
      await expect(page.locator('.step.on h3')).toHaveText('Web apps and SaaS');
      const jumped = await page.evaluate(() => {
        const track = document.querySelector('.copy')!;
        document.querySelectorAll<HTMLElement>('.ticks button')[4].click();
        return track.scrollLeft / track.clientWidth;
      });
      expect(jumped).toBeCloseTo(4, 2);
      await expect(page.locator('.swipe-hint svg')).toHaveCSS('animation-name', 'none');
    });
  });
});

test.describe('on a computer', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop profile only');

  test('the hero is still pinned and the work cards still stack', async ({ page }) => {
    await open(page);
    await expect(page.locator('html')).not.toHaveAttribute('data-mobile', '');
    const layout = await page.evaluate(() => {
      const css = (sel: string) => getComputedStyle(document.querySelector(sel)!);
      return {
        pin: document.querySelector<HTMLElement>('.pin')!.offsetHeight / innerHeight,
        stage: css('.stage').position,
        track: css('.copy').overflowX,
        slot: css('.slot').position,
        cards: css('.cards').display,
        dots: css('.work-dots').display,
        hint: css('.swipe-hint').display,
        marks: [...document.querySelectorAll('.ticks li')].filter((li) => getComputedStyle(li).display !== 'none').length,
        buttons: [...document.querySelectorAll('.ticks button')].filter((b) => getComputedStyle(b).display !== 'none').length,
      };
    });
    expect(layout.pin).toBeCloseTo(5.6, 1);
    expect(layout).toMatchObject({ stage: 'sticky', track: 'visible', slot: 'sticky', cards: 'grid', dots: 'none', hint: 'none', marks: 4, buttons: 0 });
    await expect(page.locator('.ticks')).toHaveAttribute('aria-hidden', 'true');
  });

  test('a narrow window with a mouse keeps the desktop behaviour', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    await expect(page.locator('html')).not.toHaveAttribute('data-mobile', '');
    expect(await page.evaluate(() => document.querySelector<HTMLElement>('.pin')!.offsetHeight / innerHeight)).toBeGreaterThan(5);
  });
});
