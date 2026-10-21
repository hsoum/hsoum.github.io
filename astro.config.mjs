// @ts-check
import { defineConfig } from 'astro/config';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const WEIGHT_TOKEN = '__PAGE_WEIGHT__';

/**
 * Measures what a visitor downloads to render each page before scrolling:
 * the HTML, its stylesheets and scripts (gzipped, as GitHub Pages serves them)
 * and the preloaded font files. Lazy-loaded screenshots are excluded.
 * The result replaces WEIGHT_TOKEN in the page, so the footer never lies.
 * @returns {import('astro').AstroIntegration}
 */
function pageWeight() {
  return {
    name: 'page-weight',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));
        for (const page of pages) {
          const file = join(root, page);
          let html = await readFile(file, 'utf8');
          if (!html.includes(WEIGHT_TOKEN)) continue;
          const assets = [...html.matchAll(/(?:href|src)="(\/_astro\/[^"]+\.(?:css|js))"/g)].map((m) => m[1]);
          const fonts = [...html.matchAll(/href="(\/_astro\/[^"]+\.woff2)"/g)].map((m) => m[1]);
          let bytes = gzipSync(html).length;
          for (const a of new Set(assets)) bytes += gzipSync(await readFile(join(root, a))).length;
          for (const f of new Set(fonts)) bytes += (await readFile(join(root, f))).length;
          const kb = Math.round(bytes / 1024);
          html = html.split(WEIGHT_TOKEN).join(String(kb));
          await writeFile(file, html);
          logger.info(`${page}: ${kb} KB before scrolling`);
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://studiofaber.me',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [pageWeight()],
});
