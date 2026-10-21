import type { ImageMetadata } from 'astro';

type Mod = { default: ImageMetadata };
const shots = import.meta.glob<Mod>('../assets/shots/*.{png,jpg,webp}', { eager: true });
const renders = import.meta.glob<Mod>('../assets/renders/*.{png,webp}', { eager: true });

/** A screenshot from src/assets/shots, or undefined while it is missing. */
export const shot = (file: string) => shots[`../assets/shots/${file}`]?.default;
/** A 3D render from src/assets/renders, or undefined until scripts/render.mjs has made it. */
export const render = (file: string) => renders[`../assets/renders/${file}`]?.default;
