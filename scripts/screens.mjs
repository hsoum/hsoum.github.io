// Builds the 3D devices' screen textures (public/screens) from the checked screenshots.
// Run: node scripts/screens.mjs
import sharp from 'sharp';
import { existsSync } from 'node:fs';

const SHOTS = new URL('../src/assets/shots/', import.meta.url).pathname;
const OUT = new URL('../public/screens/', import.meta.url).pathname;

const jobs = [
  ['web-platform.jpg', existsSync(SHOTS + 'ss2-dossier.png') ? 'ss2-dossier.png' : 'ss-dossier-detail.png'],
  ['web-aurelis.jpg', 'aurelis-home-desktop.png'],
  ['web-aurelis-product.jpg', 'aurelis-product.png'],
  // The corporate site has a sticky contact bar from y=826; keep the hero above it.
  ['web-ss-site.jpg', 'soins-sante-web-home.png', { left: 0, top: 0, width: 1440, height: 812 }],
  ['web-samira-play.jpg', 'samplus-playstore.png', { left: 0, top: 0, width: 1440, height: 900 }],
  ['web-gp-shop.jpg', 'gp-shop-fr.png'],
  ['phone-aurelis.jpg', 'aurelis-home-mobile.png'],
  ['phone-gp.jpg', 'gp-product-fr-mobile.png'],
];
// Four official store screens sit side by side in the strip; trim their rounded corners.
[66, 483, 900, 1317].forEach((x, i) =>
  jobs.push([`phone-samira-${i + 1}.jpg`, 'samplus-store-strip.png', { left: x + 6, top: 76, width: 365, height: 744 }]),
);

for (const [out, src, crop] of jobs) {
  let img = sharp(SHOTS + src);
  if (crop) img = img.extract(crop);
  await img.jpeg({ quality: 84, mozjpeg: true }).toFile(OUT + out);
  console.log(out, '<-', src);
}
