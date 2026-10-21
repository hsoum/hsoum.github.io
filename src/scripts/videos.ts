/**
 * Recordings load only when they come near the screen, and play only while visible.
 * With reduced motion they stay on their poster.
 */
export function lazyVideos(root: ParentNode = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const v = e.target as HTMLVideoElement;
        if (v.dataset.poster) v.poster = v.dataset.poster;
        near.unobserve(v);
      }
    },
    { rootMargin: '800px 0px' },
  );
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      }
    },
    { threshold: 0.35 },
  );
  root.querySelectorAll<HTMLVideoElement>('[data-lazy-video]').forEach((v) => {
    near.observe(v);
    if (!reduced) seen.observe(v);
  });
}
