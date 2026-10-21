# portfolio-web

Studio Faber, Hichem Soumati's portfolio site, in French (`/`) and English (`/en/`). Static Astro. JavaScript runs only where the page moves or remembers something: the 3D hero (three.js), the recordings that play while visible, and the theme and language switches.

## Run it

```sh
pnpm install
pnpm dev                 # http://localhost:4321
pnpm check && pnpm build # type-check, then build to dist/
pnpm test                # Playwright: both languages, content rules, hero, theme, consent, reduced motion, axe in both themes
```

`dev`, `check` and `build` first run `scripts/fonts.mjs`, which downloads the display font if it is missing (see below). The first run needs an internet connection.

## Fonts

- **Zodiak** (titles), Thin 100 and Light 300, from [Fontshare](https://www.fontshare.com/fonts/zodiak). Its licence (ITF Free Font License) allows self-hosting it on this site, but not redistributing the files, nor subsetting or converting them. So the files are not in git (`.gitignore`): `scripts/fonts.mjs` downloads them unchanged from Fontshare into `src/assets/fonts/`. Never commit, subset or convert them.
- **Mona Sans** (text), under the SIL Open Font License (`src/assets/fonts/OFL-mona-sans.txt`). It is committed.

## Edit content

Every text has `fr` and `en`.

- Projects and their case studies: `src/data/projects.ts`.
- The four services the hero steps through (title, one line, delivery promise, proof link): `src/data/services.ts`. Their order is the order of the scroll steps.
- The numbers strip before the contact section: `src/data/numbers.ts`. Every figure must be checkable on the project it links to.
- Design explorations: `src/data/lab.ts`. Static exports go in `public/lab/<slug>/`, recordings in `public/media/lab-<slug>.mp4`.
- Testimonials: `src/data/testimonials.ts`. Add a quote only once the client has approved it in writing, word for word, in both languages. While the list is empty, the section does not render.
- Interface strings, including the hero statement: `src/i18n/ui.ts`.
- Email, booking, LinkedIn and analytics: `src/data/site.ts`.
  - While `BOOKING_URL` is empty, "Book a call" opens an email.
  - An empty `LINKEDIN_URL` hides the LinkedIn link.
  - While `GA_ID` is empty, there is no consent banner and no analytics.
- Screenshots: `src/assets/shots/`, referenced by file name.

French typography (non-breaking spaces before `: ; ! ?`) is applied automatically by `pick()` in `src/i18n/lang.ts`. Write normal spaces.

## Hero images

The devices show textures made from the screenshots, and phones start from pre-rendered stills of the same 3D scene.

- After changing a screenshot the devices show, run `node scripts/screens.mjs`. It rebuilds `public/screens/`.
- After changing where the devices stand (`src/scripts/hero-poses.ts`) or what they show, re-render the stills. With the site running (`pnpm dev`, or set `BASE` to a preview's address), run `node scripts/render.mjs hero`. It writes `public/hero/` and `src/data/hero-stills.json`. Then build again.
- `node scripts/render.mjs covers` renders the project compositions into `src/assets/renders/`.

## Share images

After a visual change to the hero, run `pnpm build && pnpm preview`, then `node scripts/og.mjs` (set `BASE_URL` if the preview is not on port 4321). This regenerates `public/og-fr.png` and `public/og-en.png`.

## Deploy

On every push to `main`, `.github/workflows/deploy.yml` installs, checks, builds and runs the desktop tests, then publishes `dist/` to GitHub Pages. The build downloads Zodiak from Fontshare, so it needs network access.

The site's address is `https://studiofaber.me`, set in both `astro.config.mjs` (`site`) and `src/data/site.ts` (`SITE_URL`). It drives the canonical, hreflang and share-image URLs. If the domain changes, change both.
