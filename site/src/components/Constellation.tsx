import { useEffect, useRef } from 'react';

/**
 * The whole curriculum as a night sky: every topic is a point of light, every
 * domain a galaxy, every milestone an orbit and every chapter a brighter star.
 * On load the points bloom out from the centre like coffee and settle into
 * their galaxies; then they drift, twinkle and lean away from the cursor.
 */
export type SkyDomain = { id: string; title: string; topics: number; milestones: number[][]; live?: [number, number, number][] };

type Star = {
  d: number; // domain index
  ring: number;
  angle: number;
  radius: number; // 0..1 of the galaxy radius
  size: number;
  chapter: boolean;
  live: boolean; // a topic with a reel: shines and pulses
  phase: number;
  delay: number;
  ox: number; // pointer offset, smoothed
  oy: number;
};

const COLORS: [number, number, number][] = [
  [212, 154, 87], // caramel: Data Engineering
  [196, 108, 58], // cinnamon: Rust
  [233, 217, 191], // crema: DSA
];

// Galaxy centres as fractions of the canvas, for wide and tall screens.
const WIDE = [
  [0.74, 0.36],
  [0.88, 0.66],
  [0.58, 0.72],
  [0.9, 0.17],
];
const TALL = [
  [0.5, 0.62],
  [0.22, 0.86],
  [0.8, 0.86],
  [0.78, 0.2],
];

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

export default function Constellation({ domains }: { domains: SkyDomain[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.25 : 1.75);

    // Build the stars once.
    const stars: Star[] = [];
    let seed = 1;
    domains.forEach((dom, d) => {
      const M = dom.milestones.length;
      dom.milestones.forEach((chapters, ring) => {
        const total = chapters.reduce((a, b) => a + b, 0);
        const r = 0.22 + (0.78 * (ring + 0.6)) / (M + 0.2);
        let k = 0;
        const turn = rand(seed++) * Math.PI * 2;
        chapters.forEach((n, ci) => {
          const start = (k / Math.max(1, total)) * Math.PI * 2 + turn;
          const span = (n / Math.max(1, total)) * Math.PI * 2;
          stars.push({ d, ring, angle: start + span / 2, radius: r, size: 2.1, chapter: true, live: false, phase: rand(seed++) * 6.28, delay: 0.15 + d * 0.12 + ring * 0.05, ox: 0, oy: 0 });
          for (let i = 0; i < n; i++) {
            const jitter = (rand(seed++) - 0.5) * 0.07;
            stars.push({
              d,
              ring,
              angle: start + span * ((i + 0.5) / n) + (rand(seed++) - 0.5) * 0.05,
              radius: r + jitter,
              size: 1.1 + rand(seed++) * 1.1,
              chapter: false,
              live: !!dom.live?.some(([lr, lc, lt]) => lr === ring && lc === ci && lt === i),
              phase: rand(seed++) * 6.28,
              delay: 0.2 + d * 0.12 + ring * 0.05 + rand(seed++) * 0.35,
              ox: 0,
              oy: 0,
            });
          }
          k += n;
        });
      });
    });
    const maxTopics = Math.max(...domains.map((d) => d.topics));

    let W = 0;
    let H = 0;
    let centres: { x: number; y: number; R: number }[] = [];
    const layout = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const tall = H > W * 1.05;
      const base = Math.min(W, H) * (tall ? 0.34 : 0.3);
      centres = domains.map((dom, i) => {
        const [fx, fy] = (tall ? TALL : WIDE)[i];
        return { x: fx * W, y: fy * H, R: base * (0.42 + 0.58 * Math.sqrt(dom.topics / maxTopics)) };
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);

    const pointer = { x: -9999, y: -9999, active: false };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    // Domain cards can light up their galaxy.
    let focus = -1;
    const onFocus = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      focus = domains.findIndex((d) => d.id === id);
    };
    window.addEventListener('constellation:focus', onFocus);

    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);

    const glow = new Map<number, number>(); // per-domain highlight, smoothed
    const t0 = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = reduce ? 10 : (now - t0) / 1000;
      const c = ctx;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);

      // Which galaxy is under the pointer?
      let hover = focus;
      if (hover < 0 && pointer.active) {
        let best = Infinity;
        centres.forEach((ce, i) => {
          const dist = Math.hypot((pointer.x - ce.x) / ce.R, ((pointer.y - ce.y) / ce.R) * 1.8);
          if (dist < 1.05 && dist < best) {
            best = dist;
            hover = i;
          }
        });
      }
      domains.forEach((_, i) => glow.set(i, (glow.get(i) ?? 0) + ((hover === i ? 1 : 0) - (glow.get(i) ?? 0)) * 0.08));

      // Orbits.
      domains.forEach((dom, i) => {
        const ce = centres[i];
        const [r, g, b] = COLORS[i];
        const g1 = glow.get(i) ?? 0;
        const appear = easeOutExpo(Math.max(0, Math.min(1, (t - 0.1 - i * 0.12) / 1.6)));
        dom.milestones.forEach((_, ring) => {
          const rr = (0.22 + (0.78 * (ring + 0.6)) / (dom.milestones.length + 0.2)) * ce.R * appear;
          c.beginPath();
          c.ellipse(ce.x, ce.y, rr, rr * 0.48, -0.32, 0, Math.PI * 2);
          c.strokeStyle = `rgba(${r},${g},${b},${0.06 + 0.1 * g1})`;
          c.lineWidth = 1;
          c.stroke();
        });
      });

      // Stars.
      for (const s of stars) {
        const ce = centres[s.d];
        const p = easeOutExpo(Math.max(0, Math.min(1, (t - s.delay) / 2.2)));
        if (p <= 0) continue;
        const dir = s.ring % 2 ? -1 : 1;
        const a = s.angle + dir * t * (0.035 / (1 + s.ring * 0.35));
        const rr = s.radius * ce.R;
        // Bloom from the galaxy's heart, swirling as it expands.
        const swirl = (1 - p) * 2.4;
        const tx = ce.x + Math.cos(a + swirl) * rr * p;
        const ty = ce.y + Math.sin(a + swirl) * rr * 0.48 * p;
        // Tilt the disc.
        const cx = ce.x + (tx - ce.x) * Math.cos(-0.32) - (ty - ce.y) * Math.sin(-0.32);
        const cy = ce.y + (tx - ce.x) * Math.sin(-0.32) + (ty - ce.y) * Math.cos(-0.32);
        // Lean away from the pointer.
        let px = 0;
        let py = 0;
        if (pointer.active && !reduce) {
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110 && dist > 0.1) {
            const f = Math.pow(1 - dist / 110, 2) * 22;
            px = (dx / dist) * f;
            py = (dy / dist) * f;
          }
        }
        s.ox += (px - s.ox) * 0.12;
        s.oy += (py - s.oy) * 0.12;
        const x = cx + s.ox;
        const y = cy + s.oy;
        const g1 = glow.get(s.d) ?? 0;
        const tw = 0.7 + 0.3 * Math.sin(t * (s.chapter ? 1.1 : 2.3) + s.phase);
        const alpha = Math.min(1, p * tw * (s.chapter ? 0.95 : 0.8) * (1 + g1 * 0.8));
        const [r, g, b] = COLORS[s.d];
        if (s.live) {
          // A live reel: a bright star with a slow, breathing halo.
          const beat = (Math.sin(t * 2.4) + 1) / 2;
          const halo = c.createRadialGradient(x, y, 0, x, y, 22 + beat * 10);
          halo.addColorStop(0, `rgba(251,247,239,${0.5 * p})`);
          halo.addColorStop(0.35, `rgba(212,154,87,${0.28 * p})`);
          halo.addColorStop(1, 'rgba(212,154,87,0)');
          c.fillStyle = halo;
          c.fillRect(x - 34, y - 34, 68, 68);
          c.strokeStyle = `rgba(233,217,191,${(1 - beat) * 0.6 * p})`;
          c.lineWidth = 1.2;
          c.beginPath();
          c.arc(x, y, 6 + beat * 16, 0, Math.PI * 2);
          c.stroke();
          c.fillStyle = `rgba(251,247,239,${p})`;
          c.beginPath();
          c.arc(x, y, 3.2, 0, Math.PI * 2);
          c.fill();
        } else if (s.chapter) {
          const rad = s.size * (1 + 0.35 * g1);
          const grd = c.createRadialGradient(x, y, 0, x, y, rad * 5);
          grd.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.55})`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
          c.fillStyle = grd;
          c.fillRect(x - rad * 5, y - rad * 5, rad * 10, rad * 10);
          c.fillStyle = `rgba(251,247,239,${alpha})`;
          c.beginPath();
          c.arc(x, y, rad * 0.75, 0, Math.PI * 2);
          c.fill();
        } else {
          c.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          c.fillRect(x - s.size / 2, y - s.size / 2, s.size, s.size);
        }
      }

      // Labels, fading in after the bloom. Phones skip them: the hero text
      // covers the sky there, and the domain cards below carry the names.
      if (W >= 640) domains.forEach((dom, i) => {
        const ce = centres[i];
        const g1 = glow.get(i) ?? 0;
        const a = Math.max(0, Math.min(1, (t - 1.6 - i * 0.15) / 0.8)) * (0.75 + 0.25 * g1);
        if (a <= 0) return;
        const [r, g, b] = COLORS[i];
        c.textAlign = 'center';
        c.font = `600 11px "JetBrains Mono", ui-monospace, monospace`;
        c.fillStyle = `rgba(${r},${g},${b},${a})`;
        const label = dom.title.toUpperCase().split('').join(' ');
        // Keep the label inside the canvas.
        const half = c.measureText(label).width / 2 + 16;
        const lx = Math.max(half, Math.min(W - half, ce.x));
        const ly = Math.min(H - 40, ce.y + ce.R * 0.62 + 18);
        c.fillText(label, lx, ly);
        c.font = `500 10px "JetBrains Mono", ui-monospace, monospace`;
        c.fillStyle = `rgba(200,172,140,${a * 0.85})`;
        c.fillText(`${dom.topics} topics`, lx, ly + 14);
      });
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      draw(now);
    };
    if (reduce) {
      // One still frame, redrawn on resize.
      const still = () => draw(performance.now());
      still();
      ro.disconnect();
      const ro2 = new ResizeObserver(() => {
        layout();
        still();
      });
      ro2.observe(canvas);
      return () => {
        ro2.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('constellation:focus', onFocus);
      };
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('constellation:focus', onFocus);
    };
  }, [domains]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
