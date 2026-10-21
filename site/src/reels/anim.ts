// Small, pure animation helpers: every visual is a function of time.
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/** 0..1 progress of `t` through the window [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInOut = (x: number) => {
  const c = clamp(x);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
export const easeOutBack = (x: number) => {
  const c = clamp(x);
  const k = 1.70158;
  return 1 + (k + 1) * Math.pow(c - 1, 3) + k * Math.pow(c - 1, 2);
};
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
/** Seeded random, so every reel plays identically. */
export const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
/** The house entrance curve (ease-brief): fast out, long settle, no overshoot. */
export const easeOutExpo = (x: number) => {
  const c = clamp(x);
  return c >= 1 ? 1 : 1 - Math.pow(2, -10 * c);
};
