// Fetches the display face, Zodiak, from Fontshare into src/assets/fonts/.
// Its licence (ITF Free Font License) allows self-hosting on this site but not
// redistributing the files, so they stay out of git and are fetched before each build.
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

const dir = new URL('../src/assets/fonts/', import.meta.url);
const weights = [100, 300];
const missing = weights.filter((w) => !existsSync(new URL(`zodiak-${w}.woff2`, dir)));

if (missing.length) {
  const css = await (await fetch(`https://api.fontshare.com/v2/css?f[]=zodiak@${missing.join(',')}&display=swap`)).text();
  await mkdir(dir, { recursive: true });
  for (const face of css.match(/@font-face\s*{[^}]*}/g) ?? []) {
    const url = face.match(/url\('([^']+\.woff2)'\)/)?.[1];
    const weight = Number(face.match(/font-weight:\s*(\d+)/)?.[1]);
    if (!url || !missing.includes(weight)) continue;
    const res = await fetch(url.startsWith('//') ? `https:${url}` : url);
    if (!res.ok) throw new Error(`Zodiak ${weight}: HTTP ${res.status}`);
    await writeFile(new URL(`zodiak-${weight}.woff2`, dir), Buffer.from(await res.arrayBuffer()));
    console.log(`fonts: fetched Zodiak ${weight}`);
  }
  const still = weights.filter((w) => !existsSync(new URL(`zodiak-${w}.woff2`, dir)));
  if (still.length) throw new Error(`fonts: could not fetch Zodiak ${still.join(', ')} from Fontshare`);
}
