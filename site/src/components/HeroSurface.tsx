import { useEffect, useRef } from 'react';

/**
 * The hub hero: a wireframe saddle, z = x² − y², turning slowly on a canvas, with its saddle point in red and one point
 * riding the rim. The rings arrive outward on load; the pointer tilts the camera a little. Reduced motion: one still frame.
 */
export default function HeroSurface() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, visible = true, raf = 0, last = still ? 4000 : 0;
    let tx = 0, ty = 0, mx = 0, my = 0;
    const t0 = performance.now();
    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
    const Z = (x: number, y: number) => (x * x - y * y) * 0.78;
    const RINGS = 13, SPOKES = 48, RS = 120, SS = 18;

    const draw = (time: number) => {
      if (!W) return;
      const s = time / 1000;
      const a = 0.62 + (still ? 0 : s * 0.07) + mx * 0.5;
      const e = 0.5 + my * 0.16;
      const ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e);
      const R = Math.min(W, H) * 0.36, cx = W * 0.5, cy = H * 0.52;
      const P = (x: number, y: number, z: number): [number, number, number] => {
        const X = x * ca - y * sa, Y = x * sa + y * ca;
        const up = z * ce + Y * se, d = Y * ce - z * se;
        const k = 3.4 / (3.4 + d);
        return [cx + X * k * R, cy - up * k * R, d];
      };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(cx, cy + R * 0.2, 0, cx, cy + R * 0.2, R * 1.15);
      glow.addColorStop(0, 'rgba(255,255,255,0.05)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const boot = still ? 1 : easeOut(s / 1.8);
      const buckets: number[][] = [[], [], [], []];
      const push = (p: [number, number, number], q: [number, number, number]) => {
        const d = (p[2] + q[2]) / 2;
        buckets[d < -0.45 ? 0 : d < 0 ? 1 : d < 0.45 ? 2 : 3].push(p[0], p[1], q[0], q[1]);
      };
      const rMax = Math.max(0.0001, boot);
      for (let i = 1; i <= RINGS; i++) {
        const r = i / RINGS;
        if (r > rMax + 1e-6) break;
        let prev: [number, number, number] | null = null;
        for (let j = 0; j <= RS; j++) {
          const th = (j / RS) * Math.PI * 2;
          const x = r * Math.cos(th), y = r * Math.sin(th);
          const q = P(x, y, Z(x, y));
          if (prev) push(prev, q);
          prev = q;
        }
      }
      for (let j = 0; j < SPOKES; j++) {
        const th = (j / SPOKES) * Math.PI * 2;
        let prev: [number, number, number] | null = null;
        for (let i = 0; i <= SS; i++) {
          const r = (i / SS) * rMax;
          const x = r * Math.cos(th), y = r * Math.sin(th);
          const q = P(x, y, Z(x, y));
          if (prev) push(prev, q);
          prev = q;
        }
      }
      const alpha = [0.62, 0.4, 0.22, 0.12];
      ctx.lineWidth = 0.75;
      for (let b = 3; b >= 0; b--) {
        const L = buckets[b];
        if (!L.length) continue;
        ctx.strokeStyle = `rgba(240,240,240,${alpha[b]})`;
        ctx.beginPath();
        for (let k = 0; k < L.length; k += 4) {
          ctx.moveTo(L[k], L[k + 1]);
          ctx.lineTo(L[k + 2], L[k + 3]);
        }
        ctx.stroke();
      }
      // Axes, labelled in the serif italic like typeset maths.
      ctx.globalAlpha = boot;
      ctx.strokeStyle = 'rgba(176,176,176,0.7)';
      ctx.fillStyle = 'rgba(200,200,200,0.9)';
      ctx.lineWidth = 1;
      ctx.font = 'italic 400 18px "Source Serif 4", Georgia, serif';
      const axis = (p1: [number, number, number], p2: [number, number, number], label: string) => {
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
        const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        ctx.beginPath();
        ctx.moveTo(p2[0], p2[1]);
        ctx.lineTo(p2[0] - 7 * Math.cos(ang - 0.4), p2[1] - 7 * Math.sin(ang - 0.4));
        ctx.lineTo(p2[0] - 7 * Math.cos(ang + 0.4), p2[1] - 7 * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fill();
        ctx.fillText(label, p2[0] + 10 * Math.cos(ang) - 4, p2[1] + 10 * Math.sin(ang) + 5);
      };
      axis(P(-1.3, 0, 0), P(1.38, 0, 0), 'x');
      axis(P(0, -1.3, 0), P(0, 1.38, 0), 'y');
      axis(P(0, 0, -0.9), P(0, 0, 1.25), 'z');
      // A point riding the rim, and the saddle point.
      const ph = s * 0.32;
      const rim = P(Math.cos(ph), Math.sin(ph), Z(Math.cos(ph), Math.sin(ph)));
      const rg = ctx.createRadialGradient(rim[0], rim[1], 0, rim[0], rim[1], 14);
      rg.addColorStop(0, 'rgba(255,255,255,0.45)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(rim[0], rim[1], 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(rim[0], rim[1], 2.6, 0, Math.PI * 2);
      ctx.fill();
      const o = P(0, 0, 0);
      const pulse = still ? 0 : (s % 2.6) / 2.6;
      ctx.strokeStyle = `rgba(255,107,94,${0.6 * (1 - pulse)})`;
      ctx.beginPath();
      ctx.arc(o[0], o[1], 4 + pulse * 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ff6b5e';
      ctx.beginPath();
      ctx.arc(o[0], o[1], 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      cancelAnimationFrame(raf);
      const step = (now: number) => {
        last = now - t0;
        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;
        draw(last);
        if (visible && !still && !document.hidden) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      draw(last);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      if (visible && !still) loop();
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    const onLeave = () => ((tx = 0), (ty = 0));
    const onVis = () => !document.hidden && visible && !still && loop();
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    document.fonts?.ready.then(() => draw(last));
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
