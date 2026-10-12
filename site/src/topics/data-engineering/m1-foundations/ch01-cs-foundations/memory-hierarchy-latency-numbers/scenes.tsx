import { useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, SERIF, Svg, T } from '../../../../../reels/kit';

// Every number drawn here is computed from the constants below or asserted in examples.py, and every scene is a pure function of time.
// The chapter's colour grammar: crema values, latte labels, taupe axes and WAITING (the α part of every bar), caramel the cost being
// counted and the answer, cinnamon the alternative compared, cherry (text: cherryText) a bad outcome only.
// Every latency axis is logarithmic and says so; the two linear axes (steps 9 and 11) say "linear".
const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));
const commas = (n: number) => Math.round(n).toLocaleString('en-US');
const L10 = Math.log10;
/** Position of v on a log axis from lo to hi, drawn from x0 to x1. */
const lgx = (v: number, lo: number, hi: number, x0: number, x1: number) => x0 + ((L10(v) - L10(lo)) / (L10(hi) - L10(lo))) * (x1 - x0);

const KiB = 1024;
const MiB = KiB * KiB;
const TiB = 2 ** 40;
const NVME_ALPHA = 80e-6; // s, Samsung PM9A3 random 4 KB read, queue depth 1
const NVME_BW = 6.8e9; // bytes/s, Samsung PM9A3 sequential read
const HDD_ALPHA = 1 / 168; // s, Seagate Exos X24: 168 random 4K reads a second with 16 queued
const HDD_BW = 285e6; // bytes/s, Seagate Exos X24 outer diameter
const OBJ_ALPHA = 0.1; // s, low end of AWS's "roughly 100-200 milliseconds" to the first byte
const FLOW_BW = 625e6; // bytes/s, 5 Gbit/s: one flow's cap between EC2 instances
const NIC_BW = 12.5e9; // bytes/s, 100 Gbit/s
const ORDERS = 1_000_000 * 8192;
// The RAM lab's reference run (examples.py #6): ns per 8-byte read, in order / random / dependent, and one core's GB/s.
const REF = { seq: 0.7, rand: 14, chase: 158, gbs: 12 };
const SOCKET_BW = 460.8e9; // bytes/s, peak: AMD EPYC 9654, 12 channels x 4,800 MT/s x 8 bytes (examples.py, SOURCES.md)

/** A log axis with a tick at every decade and a label on the named ones. */
function LogAxis({ x0, x1, y, lo, hi, named, o = 1, labelY = 28 }: { x0: number; x1: number; y: number; lo: number; hi: number; named: [number, string][]; o?: number; labelY?: number }) {
  const ticks: number[] = [];
  for (let e = Math.ceil(L10(lo) - 1e-9); e <= Math.floor(L10(hi) + 1e-9); e++) ticks.push(e);
  return (
    <g opacity={o}>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.taupe} strokeWidth={2} />
      {ticks.map((e) => (
        <line key={e} x1={lgx(10 ** e, lo, hi, x0, x1)} y1={y - 5} x2={lgx(10 ** e, lo, hi, x0, x1)} y2={y + 5} stroke={C.taupe} strokeWidth={2} />
      ))}
      {named.map(([v, s]) => (
        <T key={s} x={lgx(v, lo, hi, x0, x1)} y={y + labelY} s={13} f={C.taupe} a="middle">
          {s}
        </T>
      ))}
    </g>
  );
}

/** A point travelling along a polyline, `f` in 0..1 of its length. */
function onPath(pts: [number, number][], f: number): [number, number] {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = clamp(f) * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const u = lens[i] === 0 ? 0 : d / lens[i];
      return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)];
    }
    d -= lens[i];
  }
  return pts[0];
}

// ── 1 · The problem ───────────────────────────────────────────────────────────────────────────────────────────────────────
function Stopwatch({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={clamp(s)}>
      <circle r={22} fill="none" stroke={C.taupe} strokeWidth={3} />
      <rect x={-5} y={-31} width={10} height={6} rx={2} fill={C.taupe} />
      <line x1={0} y1={0} x2={0} y2={-14} stroke={C.crema} strokeWidth={3} strokeLinecap="round" />
      <line x1={0} y1={0} x2={9} y2={5} stroke={C.crema} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

export function Problem({ t, portrait }: StepCtx) {
  const H = portrait ? 350 : 300;
  const rows = portrait ? [150, 262] : [136, 218];
  const block = fade(t, 0.2, 0.6);
  const names = ['local NVMe drive', 'object storage'];
  const starts = [0.8, 1.4];
  return (
    <Svg label="The same 1 TiB can be read from a local NVMe drive or from object storage; how long does each take at least?" h={H}>
      <g opacity={block}>
        <rect x={30} y={22} width={330} height={48} rx={12} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={46} y={53} s={17} f={C.crema}>order_events · 1 TiB</T>
        <T x={30} y={portrait ? 106 : 100} s={13} f={C.taupe}>can be read from:</T>
      </g>
      {rows.map((y, i) => {
        const card = fade(t, starts[i], starts[i] + 0.4);
        const pipe = fade(t, starts[i] + 0.3, starts[i] + 0.8);
        const watch = easeOutBack(seg(t, 2.0 + i * 0.15, 2.5 + i * 0.15));
        return (
          <g key={i}>
            <g opacity={card}>
              <rect x={30} y={y - 28} width={230} height={56} rx={14} fill={C.roast} stroke={C.mocha} strokeWidth={1.5} />
              <T x={46} y={y + 5} s={15} f={C.latte}>{names[i]}</T>
            </g>
            <line x1={262} y1={y} x2={lerp(262, 362, pipe)} y2={y} stroke={C.taupe} strokeWidth={6} strokeLinecap="round" />
            <Stopwatch cx={395} cy={y} s={watch} />
            <T x={434} y={y + 7} s={20} f={C.crema} o={clamp(watch)}>≥ ? s</T>
          </g>
        );
      })}
      <T x={30} y={H - 18} s={13} f={C.taupe} o={fade(t, 2.6, 3.0)}>the floor: the least time it could take</T>
    </Svg>
  );
}

// ── 2 · One RAM read against one object-storage wait (predict) ───────────────────────────────────────────────────────────
export function TwoDots({ t, answer }: StepCtx) {
  const H = 246;
  const y = 120;
  if (answer === null) {
    const a = fade(t, 0.2, 0.6);
    const b = fade(t, 0.6, 1.0);
    const c = fade(t, 1.0, 1.4);
    return (
      <Svg label="A bare line with one RAM read at the left end and the first byte from object storage at the right end" h={H}>
        <line x1={40} y1={y} x2={560} y2={y} stroke={C.taupe} strokeWidth={2} />
        <g opacity={a}>
          <circle cx={80} cy={y} r={8} fill={C.crema} />
          <T x={40} y={y - 52} s={15} f={C.latte}>one RAM read</T>
          <T x={40} y={y - 28} s={17} f={C.crema}>≈ 100 ns</T>
        </g>
        <g opacity={b}>
          <circle cx={520} cy={y} r={8} fill={C.roast} stroke={C.caramel} strokeWidth={3} />
          <T x={560} y={y - 76} s={15} f={C.latte} a="end">first byte from</T>
          <T x={560} y={y - 52} s={15} f={C.latte} a="end">object storage</T>
          <T x={560} y={y - 28} s={17} f={C.crema} a="end">≈ 100 ms</T>
        </g>
        <T x={300} y={y + 80} s={20} f={C.crema} a="middle" o={c}>? RAM reads per wait</T>
      </Svg>
    );
  }
  const x0 = 60;
  const x1 = 540;
  const xl = lgx(100, 1, 1e9, x0, x1);
  const xr = lgx(1e8, 1, 1e9, x0, x1);
  const by = y - 52;
  return (
    <Svg label="On a log axis from 1 ns to 1 s, a RAM read at 100 ns and an object-storage wait at 100 ms are six decades apart: a factor of 1,000,000" h={H}>
      <LogAxis x0={x0} x1={x1} y={y} lo={1} hi={1e9} named={[[1, '1 ns'], [1e3, '1 µs'], [1e6, '1 ms'], [1e9, '1 s']]} />
      <circle cx={xl} cy={y} r={8} fill={C.crema} />
      <circle cx={xr} cy={y} r={8} fill={C.roast} stroke={C.caramel} strokeWidth={3} />
      <path d={`M${xl} ${by + 10} V${by} H${xr} V${by + 10}`} fill="none" stroke={C.caramel} strokeWidth={3} strokeLinejoin="round" />
      <T x={(xl + xr) / 2} y={by - 14} s={20} f={C.crema} a="middle" serif>× 1,000,000</T>
      <T x={(xl + xr) / 2} y={by + 26} s={15} f={C.latte} a="middle">six decades</T>
      <T x={xl} y={y + 62} s={15} f={C.crema} a="middle">100 ns</T>
      <T x={xl} y={y + 82} s={13} f={C.latte} a="middle">RAM read</T>
      <T x={xr} y={y + 62} s={15} f={C.crema} a="middle">100 ms</T>
      <T x={xr} y={y + 82} s={13} f={C.latte} a="middle">first byte</T>
      <T x={40} y={H - 12} s={13} f={C.taupe}>log scale: each tick ×10</T>
    </Svg>
  );
}

// ── 3 · Registers to RAM, in cycles ────────────────────────────────────────────────────────────────────────────────────────
// cycles [low, high] from Intel (L1-L3) and Drepper (registers, DRAM); ns = cycles × 0.5 at the stated 2 GHz.
const NS_PER_CYCLE = 0.5;
const ON_CHIP: { name: string; cyc: string; c: [number, number]; ns: string }[] = [
  { name: 'registers', cyc: '≤ 1 cycle', c: [1, 1], ns: '≤ 0.5 ns' },
  { name: 'L1', cyc: '4–6 cycles', c: [4, 6], ns: '2–3 ns' },
  { name: 'L2', cyc: '14 cycles', c: [14, 14], ns: '7 ns' },
  { name: 'L3', cyc: '50–70 cycles', c: [50, 70], ns: '25–35 ns' },
  { name: 'DRAM', cyc: '200+ cycles', c: [200, 200], ns: '100+ ns' },
];
const AX3 = { x0: 230, x1: 540, lo: 0.1, hi: 1000 };

export function OnChip({ t, portrait }: StepCtx) {
  const H = portrait ? 492 : 420;
  const y0 = portrait ? 100 : 92;
  const pitch = portrait ? 68 : 56;
  const bh = portrait ? 60 : 50;
  const l1 = portrait ? 22 : 20;
  const l2 = portrait ? 48 : 42;
  const hdr = fade(t, 0.2, 0.6);
  return (
    <Svg label="Five rungs from registers to DRAM, each with its latency in clock cycles and in nanoseconds at 2 GHz, on a log axis" h={H}>
      <g opacity={hdr}>
        <T x={24} y={24} s={13} f={C.taupe}>at 2 GHz: 1 cycle = 0.5 ns</T>
        <T x={24} y={46} s={13} f={C.taupe}>log scale: each tick ×10</T>
        <LogAxis x0={AX3.x0} x1={AX3.x1} y={portrait ? 80 : 72} lo={AX3.lo} hi={AX3.hi} named={[[1, '1 ns'], [10, '10 ns'], [100, '100 ns'], [1000, '1 µs']]} labelY={-12} />
      </g>
      {ON_CHIP.map((r, i) => {
        const t0 = 0.6 + i * 0.5;
        const band = fade(t, t0, t0 + 0.25);
        const e = easeOut(seg(t, t0 + 0.1, t0 + 0.5));
        const lo = r.c[0] * NS_PER_CYCLE;
        const hi = r.c[1] * NS_PER_CYCLE;
        const xlo = lgx(lo, AX3.lo, AX3.hi, AX3.x0, AX3.x1);
        const xhi = lgx(hi, AX3.lo, AX3.hi, AX3.x0, AX3.x1);
        const y = y0 + i * pitch;
        const cy = y + bh / 2;
        const range = r.c[0] !== r.c[1];
        const a = lerp(AX3.x0, xlo, e);
        const b = lerp(AX3.x0, xhi, e);
        return (
          <g key={r.name}>
            <rect x={24} y={y} width={552} height={bh} rx={12} fill={C.cocoa} opacity={0.5 * band} />
            <g opacity={band}>
              <T x={36} y={y + l1} s={15} f={C.latte}>{r.name}</T>
              <T x={36} y={y + l2} s={15} f={C.crema}>{r.cyc}</T>
            </g>
            {range ? <rect x={a} y={cy - 5} width={Math.max(10, b - a)} height={10} rx={5} fill={C.caramel} opacity={band} /> : <circle cx={a} cy={cy} r={7} fill={C.caramel} opacity={band} />}
            <T x={b + 16} y={cy + 5} s={15} f={C.crema} o={fade(t, t0 + 0.3, t0 + 0.6)}>{r.ns}</T>
          </g>
        );
      })}
      <g opacity={fade(t, 3.2, 3.6)}>
        <T x={24} y={H - 34} s={13} f={C.taupe}>L1–L3: Skylake server, Intel manual (Oct 2026)</T>
        <T x={24} y={H - 12} s={13} f={C.taupe}>registers, DRAM: Drepper 2007</T>
      </g>
    </Svg>
  );
}

// ── 4 · Below RAM: drives and network ───────────────────────────────────────────────────────────────────────────────────────
export function OffChip({ t }: StepCtx) {
  const H = 494;
  const X0 = 200;
  const X1 = 560;
  const u = easeInOut(seg(t, 0.2, 1.2));
  const llo = lerp(-1, 0, u); // log10 of the axis's left end, ns
  const lhi = lerp(3, 9, u);
  const px = (v: number) => X0 + ((L10(v) - llo) / (lhi - llo)) * (X1 - X0);
  const ys = [64, 128, 192, 256, 346];
  const hs = [56, 56, 56, 82, 82];
  const tickDefs: [number, string][] = [[1, '1 ns'], [1e3, '1 µs'], [1e6, '1 ms'], [1e9, '1 s']];
  const chip = ON_CHIP.map((r) => (r.c[0] === r.c[1] ? r.c[0] : (r.c[0] + r.c[1]) / 2) * NS_PER_CYCLE);
  const cx0 = px(0.5);
  const cx1 = px(100);
  const lower = [
    { name: ['NVMe read'], ns: 80e3, lab: '80 µs', note: ['Samsung PM9A3, 4 KB, QD1'], range: null as number | null },
    { name: ['round trip in', 'one datacenter'], ns: 500e3, lab: '500 µs', note: ['2009 figure · AWS shows live medians'], range: null },
    { name: ['HDD random', 'read'], ns: 6e6, lab: '≥ 6 ms', note: ['1/168 s: Seagate measured 168 a second', 'with 16 queued; one at a time is slower'], range: null },
    { name: ['object storage,', 'first byte'], ns: 100e6, lab: '100–200 ms', note: ['AWS S3 documentation', 'medians, small requests: tens of ms'], range: 200e6 },
  ];
  return (
    <Svg label="On a log axis from 1 ns to 1 s: everything on the chip plus DRAM is squeezed into the first two decades; NVMe, a datacenter round trip, a hard disk and object storage sit far to the right" h={H}>
      <T x={24} y={14} s={13} f={C.taupe}>log scale: each tick ×1,000</T>
      <line x1={X0} y1={50} x2={X1} y2={50} stroke={C.taupe} strokeWidth={2} />
      {tickDefs.map(([v, s]) => {
        const x = px(v);
        return x <= X1 + 1 && x >= X0 - 1 ? (
          <g key={s}>
            <line x1={x} y1={45} x2={x} y2={55} stroke={C.taupe} strokeWidth={2} />
            <T x={x} y={38} s={13} f={C.taupe} a="middle">{s}</T>
          </g>
        ) : null;
      })}
      {/* top band: the whole on-chip ladder plus DRAM, as the first decades */}
      <rect x={24} y={ys[0]} width={552} height={hs[0]} rx={12} fill={C.cocoa} opacity={0.5} />
      <T x={36} y={ys[0] + 33} s={15} f={C.latte}>chip + DRAM</T>
      <rect x={cx0} y={ys[0] + 22} width={Math.max(6, cx1 - cx0)} height={12} rx={6} fill={C.caramel} opacity={u} />
      {chip.map((v, i) => (
        <circle key={i} cx={px(v)} cy={ys[0] + 28} r={6} fill={C.caramel} opacity={1 - u} />
      ))}
      <T x={cx1 + 14} y={ys[0] + 33} s={15} f={C.crema} o={u}>0.5–100 ns</T>
      {lower.map((r, i) => {
        const t0 = 1.4 + i * 0.5;
        const a = fade(t, t0, t0 + 0.4);
        const y = ys[i + 1] + (1 - a) * 12;
        const x = px(r.ns);
        const cy = y + 20;
        return (
          <g key={r.lab} opacity={a}>
            <rect x={24} y={y} width={552} height={hs[i + 1]} rx={12} fill={C.cocoa} opacity={0.5} />
            {r.name.map((s, k) => (
              <T key={s} x={36} y={y + (r.name.length === 1 ? 26 : 22) + k * 26} s={15} f={C.latte}>{s}</T>
            ))}
            {r.range ? <rect x={x} y={cy - 6} width={Math.max(10, px(r.range) - x)} height={12} rx={6} fill={C.caramel} /> : <circle cx={x} cy={cy} r={7} fill={C.caramel} />}
            {r.range ? (
              <T x={x - 14} y={cy + 5} s={15} f={C.crema} a="end">{r.lab}</T>
            ) : (
              <T x={x + 16} y={cy + 5} s={15} f={C.crema}>{r.lab}</T>
            )}
            {r.note.map((s, k) => (
              <T key={s} x={214} y={y + 50 + k * 22} s={13} f={C.taupe}>{s}</T>
            ))}
          </g>
        );
      })}
      <g opacity={fade(t, 3.4, 3.8)}>
        <path d={`M${px(100)} ${ys[4] + 96} V${ys[4] + 106} H${px(100e6)} V${ys[4] + 96}`} fill="none" stroke={C.taupe} strokeWidth={2} />
        <T x={(px(100) + px(100e6)) / 2} y={ys[4] + 132} s={17} f={C.crema} a="middle">× 1,000,000</T>
      </g>
    </Svg>
  );
}

// ── 5 · The same RAM, one socket away ─────────────────────────────────────────────────────────────────────────────────────────
const NODE_Y = [34, 234];
const MID = [82, 282];
export function Numa({ t }: StepCtx) {
  const H = 456;
  const local: [number, number][] = [[152, MID[0]], [334, MID[0]]];
  const remote: [number, number][] = [[130, MID[0] + 28], [130, MID[1]], [334, MID[1]]];
  const trip = (a: number, b: number, pts: [number, number][]) => {
    const q = seg(t, a, b);
    if (q <= 0 || q >= 1) return null;
    const f = q < 0.5 ? easeInOut(q * 2) : easeInOut((1 - q) * 2);
    const [x, y] = onPath(pts, f);
    return <rect x={x - 7} y={y - 7} width={14} height={14} rx={3} fill={C.caramel} />;
  };
  const line = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  const nodes = [0, 1];
  return (
    <Svg label="A two-socket server: each CPU has its own RAM bank; reading the other node's bank crosses the interconnect and takes about 20% longer" h={H}>
      {nodes.map((n) => {
        const a = fade(t, 0.2 + n * 0.1, 0.6 + n * 0.1);
        return (
          <g key={n} opacity={a}>
            <rect x={20} y={NODE_Y[n]} width={560} height={96} rx={14} fill="none" stroke={C.mocha} strokeWidth={2} strokeDasharray="6 5" />
            <T x={34} y={NODE_Y[n] + 17} s={13} f={C.taupe}>node {n}</T>
            <rect x={40} y={MID[n] - 28} width={112} height={56} rx={10} fill={C.roast} stroke={C.latte} strokeWidth={2} />
            <T x={96} y={MID[n] + 6} s={15} f={C.crema} a="middle">CPU {n}</T>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={340} y={MID[n] - 30 + k * 14} width={200} height={9} rx={3} fill={C.crema} opacity={0.85} />
            ))}
            <T x={440} y={NODE_Y[n] + 90} s={13} f={C.taupe} a="middle">RAM, node {n}</T>
          </g>
        );
      })}
      <g opacity={fade(t, 0.6, 1.0)}>
        <line x1={130} y1={MID[0] + 28} x2={130} y2={MID[1] - 28} stroke={C.taupe} strokeWidth={8} strokeLinecap="round" />
        <T x={148} y={(MID[0] + MID[1]) / 2 + 5} s={13} f={C.taupe}>interconnect</T>
      </g>
      {/* both trips stay drawn as faint paths once they have run */}
      <path d={line(local)} fill="none" stroke={C.caramel} strokeWidth={3} opacity={0.35 * fade(t, 1.0, 1.2)} strokeLinecap="round" />
      <path d={line(remote)} fill="none" stroke={C.caramel} strokeWidth={3} opacity={0.35 * fade(t, 2.0, 2.2)} strokeLinecap="round" strokeLinejoin="round" />
      {trip(1.0, 1.8, local)}
      {trip(2.0, 2.96, remote)}
      <T x={30} y={366} s={17} f={C.crema} o={fade(t, 1.7, 2.0)}>local: 1×</T>
      <g opacity={fade(t, 2.8, 3.1)}>
        <T x={30} y={392} s={15} f={C.crema}>remote: reads ≈ 20% slower</T>
        <T x={30} y={412} s={13} f={C.taupe}>AMD Opterons, measured 2007</T>
      </g>
      <T x={30} y={H - 12} s={13} f={C.taupe} o={fade(t, 3.3, 3.6)}>yours: numactl --cpunodebind=0 --membind=1</T>
    </Svg>
  );
}

// ── 6 · Latency is not bandwidth ───────────────────────────────────────────────────────────────────────────────────────────────
export function TwoAxes({ t }: StepCtx) {
  const H = 470;
  const PX0 = 90;
  const PX1 = 560;
  const PY0 = 50; // bandwidth 1,000 GB/s
  const PY1 = 350; // bandwidth 100 MB/s
  const x = (ns: number) => lgx(ns, 1, 1e9, PX0, PX1);
  const y = (bps: number) => lgx(bps, 1e8, 1e12, PY1, PY0);
  const pts = [
    { k: 'L1', ns: 2.5, bw: 133 * 2e9, label: 'L1', dx: 14, dy: 5 },
    { k: 'RAM', ns: 100, bw: REF.gbs * 1e9, bw2: SOCKET_BW, label: 'RAM: 1 core to 1 socket', dx: 14, dy: 0, top: true },
    { k: 'NVMe', ns: 80e3, bw: NVME_BW, label: 'NVMe', dx: -14, dy: 5, end: true },
    { k: 'net', ns: 500e3, bw: 1.25e9, bw2: NIC_BW, label: 'network', dx: -12, dy: 0, end: true },
    { k: 'HDD', ns: 6e6, bw: HDD_BW, label: 'HDD (≥ 6 ms)', dx: 14, dy: 5 },
    { k: 'obj', ns: 100e6, bw: NIC_BW, label: 'object storage', dx: 14, dy: -22, end: true },
  ];
  return (
    <Svg label="Tiers on two log axes, latency across and bandwidth up: L1 is fast and wide, RAM runs from 12 GB/s on one core to a 460.8 GB/s peak on one 12-channel socket, a hard disk is slow and narrow, object storage has the highest latency but up to 12.5 GB/s per instance" h={H}>
      <g opacity={fade(t, 0.2, 0.6)}>
        <T x={24} y={24} s={13} f={C.taupe}>bandwidth (log) ↑</T>
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.taupe} strokeWidth={2} />
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.taupe} strokeWidth={2} />
        {([['100 MB/s', 1e8], ['1 GB/s', 1e9], ['10 GB/s', 1e10], ['100 GB/s', 1e11]] as [string, number][]).map(([s, v]) => (
          <g key={s}>
            <line x1={PX0 - 5} y1={y(v)} x2={PX0 + 5} y2={y(v)} stroke={C.taupe} strokeWidth={2} />
            <line x1={PX0 + 5} y1={y(v)} x2={PX1} y2={y(v)} stroke={C.taupe} strokeWidth={1} opacity={0.18} />
            <T x={PX0 - 10} y={y(v) + 5} s={13} f={C.taupe} a="end">{s}</T>
          </g>
        ))}
        {([['1 ns', 1], ['1 µs', 1e3], ['1 ms', 1e6], ['1 s', 1e9]] as [string, number][]).map(([s, v]) => (
          <g key={s}>
            <line x1={x(v)} y1={PY1 - 5} x2={x(v)} y2={PY1 + 5} stroke={C.taupe} strokeWidth={2} />
            <T x={x(v)} y={PY1 + 26} s={13} f={C.taupe} a="middle">{s}</T>
          </g>
        ))}
        <T x={PX1} y={PY1 + 48} s={13} f={C.taupe} a="end">latency (log) →</T>
      </g>
      {pts.map((p, i) => {
        const a = easeOutBack(seg(t, 0.6 + i * 0.4, 1.0 + i * 0.4));
        const obj = p.k === 'obj';
        return (
          <g key={p.k} opacity={clamp(a)}>
            {p.bw2 && <line x1={x(p.ns)} y1={y(p.bw)} x2={x(p.ns)} y2={y(p.bw2)} stroke={C.crema} strokeWidth={5} strokeLinecap="round" />}
            {p.bw2 && <circle cx={x(p.ns)} cy={y(p.bw)} r={5 * clamp(a)} fill={C.crema} />}
            <circle cx={x(p.ns)} cy={y(p.bw2 ? p.bw2 : p.bw)} r={7 * clamp(a)} fill={obj ? C.caramel : C.crema} />
            <T x={x(p.ns) + p.dx} y={p.top ? y(p.bw2) + 5 : p.bw2 ? y(p.bw) + 0 : y(p.bw) + p.dy} s={15} f={obj ? C.caramel : C.latte} a={p.end ? 'end' : 'start'}>{p.label}</T>
          </g>
        );
      })}
      <g opacity={fade(t, 3.2, 3.6)}>
        <circle cx={x(100e6)} cy={y(NIC_BW)} r={14} fill="none" stroke={C.caramel} strokeWidth={3} />
        <T x={x(100e6) + 62} y={y(NIC_BW) + 36} s={15} f={C.crema} a="end">up to 12.5 GB/s</T>
      </g>
      <g opacity={fade(t, 3.6, 4.0)}>
        <T x={24} y={H - 52} s={13} f={C.taupe}>RAM: 1 core measured here; 1 socket: AMD spec peak</T>
        <T x={24} y={H - 32} s={13} f={C.taupe}>network: 2009 latency · HDD: at least 6 ms</T>
        <T x={24} y={H - 12} s={13} f={C.taupe}>network, object storage: per instance at 100 Gbit/s</T>
      </g>
    </Svg>
  );
}

// ── 7 · One transfer: α + n/β ─────────────────────────────────────────────────────────────────────────────────────────────────
// HDD's alpha is a floor value (1/168 s was measured with 16 queued), so its share and time are "at least".
const SPLIT_ROWS = [
  { name: 'NVMe', a: NVME_ALPHA, bw: NVME_BW, atLeast: false },
  { name: 'HDD', a: HDD_ALPHA, bw: HDD_BW, atLeast: true },
  { name: 'object storage', a: OBJ_ALPHA, bw: FLOW_BW, atLeast: false },
];
const fmtTime = (s: number) => (s < 1e-3 ? `${Math.round(s * 1e6)} µs` : s < 0.01 ? `${(s * 1e3).toFixed(1)} ms` : `${Math.round(s * 1e3)} ms`);
export function Split({ t, portrait }: StepCtx) {
  const H = portrait ? 430 : 400;
  const pitch = portrait ? 84 : 76;
  const top = portrait ? 112 : 108;
  const BAR = 480;
  return (
    <Svg label="One 1 MiB read on three tiers, each bar split into the wait (taupe) and the transfer (caramel): 34% waiting on NVMe, at least 62% on a hard disk, 98% on object storage (at an assumed 625 MB/s per request)" h={H}>
      <g opacity={fade(t, 0.2, 0.6)}>
        <T x={300} y={44} s={20} f={C.crema} a="middle">
          T(n) = <tspan fontFamily={SERIF}>α</tspan> + n/<tspan fontFamily={SERIF}>β</tspan>
        </T>
        <T x={300} y={68} s={13} f={C.taupe} a="middle">α: wait per request · β: bandwidth</T>
      </g>
      {SPLIT_ROWS.map((r, i) => {
        const total = r.a + MiB / r.bw;
        const share = r.a / total;
        const y = top + i * pitch;
        const t0 = 0.8 + i * 0.8;
        const wA = seg(t, t0, t0 + 0.3);
        const wB = seg(t, t0 + 0.3, t0 + 0.6);
        const waitW = BAR * share * easeOut(wA);
        const xferW = BAR * (1 - share) * easeOut(wB);
        const lab = fade(t, t0 + 0.6, t0 + 0.9);
        return (
          <g key={r.name}>
            <T x={40} y={y} s={15} f={C.latte} o={fade(t, t0 - 0.1, t0 + 0.2)}>{r.name}</T>
            <rect x={40} y={y + 10} width={waitW} height={30} rx={0} fill={C.taupe} />
            <rect x={40 + BAR * share} y={y + 10} width={xferW} height={30} fill={C.caramel} />
            <T x={48} y={y + 31} s={15} f={C.espresso} o={lab} w={700}>{r.atLeast ? '≥ ' : ''}{Math.round(share * 100)}% wait</T>
            <T x={40 + BAR} y={y + 62} s={15} f={C.crema} a="end" o={lab}>{r.atLeast ? '≥ ' : ''}{fmtTime(total)}</T>
            {i === 2 && (
              <T x={40} y={y + 62} s={13} f={C.taupe} o={lab}>at an assumed 625 MB/s per request</T>
            )}
          </g>
        );
      })}
      <g opacity={fade(t, 3.4, 3.8)}>
        <T x={40} y={H - 34} s={13} f={C.taupe}>one read of 1 MiB</T>
        <T x={40} y={H - 14} s={13} f={C.taupe}>each bar is 100% of its own time</T>
      </g>
    </Svg>
  );
}

// ── 8 · In order or at random, in RAM (predict, the lab) ──────────────────────────────────────────────────────────────────────
const CELLS = 48;
const RND = (() => {
  const r = rng(7);
  return Array.from({ length: 400 }, () => Math.floor(r() * CELLS));
})();
export function RamWalk({ t, answer }: StepCtx) {
  if (answer === null) {
    const H = 262;
    const y = 62;
    const cw = 500 / CELLS;
    const seqI = Math.floor(Math.max(0, t - 0.2) * 6) % CELLS;
    const rndI = RND[Math.floor(Math.max(0, t - 0.2) * 3) % RND.length];
    const a = fade(t, 0.2, 0.6);
    return (
      <Svg label="A strip of cells: one walker reads them in order, the other jumps to random cells; how much slower is the random walker per read?" h={H}>
        <T x={50} y={y - 36} s={15} f={C.latte} o={a}>1 GiB array of 8-byte numbers</T>
        <g opacity={a}>
          {Array.from({ length: CELLS }, (_, i) => (
            <rect key={i} x={50 + i * cw} y={y} width={cw - 1.6} height={28} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={0.7} />
          ))}
        </g>
        <g opacity={a}>
          <rect x={50 + seqI * cw - 1} y={y - 12} width={cw + 0.4} height={12} rx={2} fill={C.caramel} />
          <rect x={50 + rndI * cw - 1} y={y + 30} width={cw + 0.4} height={12} rx={2} fill={C.cinnamon} />
        </g>
        <g opacity={a}>
          <rect x={50} y={y + 66} width={14} height={14} rx={3} fill={C.caramel} />
          <T x={74} y={y + 78} s={15} f={C.latte}>in order</T>
          <rect x={250} y={y + 66} width={14} height={14} rx={3} fill={C.cinnamon} />
          <T x={274} y={y + 78} s={15} f={C.latte}>at random</T>
        </g>
        <T x={50} y={y + 112} s={15} f={C.latte} o={a}>same 134,217,728 reads</T>
        <T x={50} y={y + 138} s={15} f={C.latte} o={a}>same tier · both Θ(n)</T>
        <T x={300} y={y + 192} s={20} f={C.crema} a="middle" o={fade(t, 0.8, 1.2)}>? × slower at random</T>
      </Svg>
    );
  }
  // The answer: the lab's measured result, three bars on a log axis of ns per read (examples.py, reference run).
  const H = 318;
  const AX = { x0: 30, x1: 560, lo: 0.1, hi: 1000 };
  const bars = [
    { label: 'in order', v: REF.seq, fill: C.caramel, txt: `${REF.seq} ns` },
    { label: 'at random', v: REF.rand, fill: C.cinnamon, txt: `${REF.rand} ns` },
    { label: 'each address from the last read', v: REF.chase, fill: C.taupe, txt: `${REF.chase} ns` },
  ];
  return (
    <Svg label="Measured time per 8-byte read from a 1 GiB array on a log axis: 0.7 ns in order, 14 ns at random, 158 ns when each address comes from the last read" h={H}>
      <T x={30} y={22} s={13} f={C.taupe}>log scale: each tick ×10</T>
      <LogAxis x0={AX.x0} x1={AX.x1} y={64} lo={AX.lo} hi={AX.hi} named={[[1, '1 ns'], [10, '10 ns'], [100, '100 ns'], [1000, '1 µs']]} labelY={-12} />
      {bars.map((b, i) => {
        const y = 106 + i * 58;
        const w = lgx(b.v, AX.lo, AX.hi, AX.x0, AX.x1) - AX.x0;
        return (
          <g key={b.label}>
            <T x={30} y={y} s={15} f={C.latte}>{b.label}</T>
            <rect x={30} y={y + 8} width={w} height={24} rx={4} fill={b.fill} />
            <T x={30 + w + 10} y={y + 28} s={17} f={C.crema}>{b.txt}</T>
          </g>
        );
      })}
      <T x={30} y={H - 44} s={17} f={C.crema}>{Math.round(REF.rand / REF.seq)}× slower at random</T>
      <T x={30} y={H - 16} s={13} f={C.taupe}>one run on this machine, 12 Oct 2026</T>
    </Svg>
  );
}

// ── 9 · Many requests in flight ────────────────────────────────────────────────────────────────────────────────────────────────
function Waterfall({ t, x0, w, y0, rowH, stagger, tStart, step }: { t: number; x0: number; w: number; y0: number; rowH: number; stagger: boolean; tStart: number; step: number }) {
  const W80 = (w * 80) / 640; // 80 µs on a 640 µs axis
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => {
        const st = stagger ? tStart + i * step : tStart;
        const grow = easeOut(seg(t, st, st + (stagger ? step : 0.4)));
        const xs = x0 + (stagger ? i * W80 : 0);
        return (
          <g key={i} opacity={clamp(grow * 2)}>
            <rect x={xs} y={y0 + i * (rowH + 4)} width={W80 * grow} height={rowH} fill={C.taupe} />
            <rect x={xs + W80 * grow} y={y0 + i * (rowH + 4)} width={grow >= 1 ? 3 : 0} height={rowH} fill={C.caramel} />
          </g>
        );
      })}
    </g>
  );
}
export function InFlight({ t, portrait }: StepCtx) {
  const H = portrait ? 470 : 340;
  const axis = (x0: number, w: number, y: number, o: number) => (
    <g opacity={o}>
      <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke={C.taupe} strokeWidth={2} />
      {([['0', 0], ['320 µs', 0.5], ['640 µs', 1]] as [string, number][]).map(([s, f]) => (
        <g key={s}>
          <line x1={x0 + f * w} y1={y - 4} x2={x0 + f * w} y2={y + 4} stroke={C.taupe} strokeWidth={2} />
          <T x={Math.min(x0 + f * w, 560)} y={y - 10} s={13} f={C.taupe} a={f === 1 ? 'end' : f === 0 ? 'start' : 'middle'}>{s}</T>
        </g>
      ))}
    </g>
  );
  const ax = fade(t, 0.2, 0.6);
  const read = fade(t, 3.0, 3.4);
  const foot = fade(t, 3.4, 3.8);
  if (portrait) {
    return (
      <Svg label="Eight 80 µs NVMe reads one after another take 640 µs, 12,500 reads a second; issued together they overlap and finish in 80 µs, 100,000 reads a second" h={H}>
        <g opacity={ax}>
          <T x={40} y={26} s={15} f={C.latte}>1 in flight</T>
          <T x={560} y={26} s={17} f={C.crema} a="end" o={read}>12,500 reads/s</T>
        </g>
        {axis(40, 520, 56, ax)}
        <Waterfall t={t} x0={40} w={520} y0={68} rowH={10} stagger tStart={0.6} step={0.2} />
        <g opacity={ax}>
          <T x={40} y={232} s={15} f={C.latte}>8 in flight</T>
          <T x={560} y={232} s={17} f={C.crema} a="end" o={read}>100,000 reads/s</T>
        </g>
        {axis(40, 520, 262, ax)}
        <Waterfall t={t} x0={40} w={520} y0={274} rowH={10} stagger={false} tStart={2.4} step={0} />
        <g opacity={foot}>
          <T x={40} y={H - 54} s={13} f={C.taupe}>time axis: linear</T>
          <T x={40} y={H - 34} s={13} f={C.taupe}>drive rating 1,000,000 reads/s: at least 80 in flight</T>
          <T x={40} y={H - 14} s={13} f={C.taupe}>Samsung measured it with 32 × 4 = 128</T>
        </g>
      </Svg>
    );
  }
  return (
    <Svg label="Eight 80 µs NVMe reads one after another take 640 µs, 12,500 reads a second; issued together they overlap and finish in 80 µs, 100,000 reads a second" h={H}>
      <g opacity={ax}>
        <T x={30} y={26} s={15} f={C.latte}>1 in flight</T>
        <T x={310} y={26} s={15} f={C.latte}>8 in flight</T>
      </g>
      <T x={30} y={52} s={17} f={C.crema} o={read}>12,500 reads/s</T>
      <T x={310} y={52} s={17} f={C.crema} o={read}>100,000 reads/s</T>
      {axis(30, 260, 88, ax)}
      {axis(310, 260, 88, ax)}
      <Waterfall t={t} x0={30} w={260} y0={102} rowH={12} stagger tStart={0.6} step={0.2} />
      <Waterfall t={t} x0={310} w={260} y0={102} rowH={12} stagger={false} tStart={2.4} step={0} />
      <g opacity={foot}>
        <T x={30} y={H - 56} s={13} f={C.taupe}>time axis: linear</T>
        <T x={30} y={H - 36} s={13} f={C.taupe}>drive rating 1,000,000 reads/s: at least 80 in flight</T>
        <T x={30} y={H - 16} s={13} f={C.taupe}>Samsung measured it with 32 × 4 = 128</T>
      </g>
    </Svg>
  );
}

// ── 10 · The floor is the larger term ─────────────────────────────────────────────────────────────────────────────────────────
const FLOOR_A = { bytes: TiB / NVME_BW, waits: ((TiB / (128 * KiB)) * 20e-6) / 32 };
const FLOOR_B = { bytes: ORDERS / HDD_BW, waits: 1_000_000 * HDD_ALPHA };
export function Floor({ t }: StepCtx) {
  const H = 470;
  const X0 = 50;
  const X1 = 520;
  const fx = (s: number) => lgx(s, 1, 1e4, X0, X1);
  const cases = [
    { y: 130, l1: '1 TiB from NVMe, 128 KiB reads,', l2: '32 in flight, α = 20 µs (sequential, QD1)', d: FLOOR_A, t0: 0.8, verdict: 'bandwidth-bound', vc: C.caramel },
    { y: 292, l1: 'orders, 8 KB pages at random,', l2: 'HDD, one at a time, α ≥ 6 ms (a floor value)', d: FLOOR_B, t0: 2.2, verdict: 'latency-bound', vc: C.crema },
  ];
  return (
    <Svg label="Floor = max(bytes/β, requests × α / k) for two jobs: reading 1 TiB from NVMe is bandwidth-bound at 162 s; reading orders at random from a hard disk is latency-bound at 5,952 s" h={H}>
      <g opacity={fade(t, 0.2, 0.6)}>
        <T x={24} y={22} s={17} f={C.crema}>floor = max(</T>
        <T x={24} y={48} s={15} f={C.crema}>bytes / <tspan fontFamily={SERIF}>β</tspan> ,  requests × <tspan fontFamily={SERIF}>α</tspan> / k )</T>
        <LogAxis x0={X0} x1={X1} y={92} lo={1} hi={1e4} named={[[1, '1 s'], [10, '10 s'], [100, '100 s'], [1000, '1,000 s'], [1e4, '10,000 s']]} labelY={-12} />
        <T x={576} y={22} s={13} f={C.taupe} a="end">log scale: ×10 a tick</T>
      </g>
      {cases.map((c) => {
        const gb = easeOut(seg(t, c.t0, c.t0 + 0.6));
        const floor = Math.max(c.d.bytes, c.d.waits);
        const lineO = fade(t, c.t0 + 0.8, c.t0 + 1.2);
        const bytesEnd = X0 + Math.max(3, fx(c.d.bytes) - X0) * gb;
        const waitsEnd = X0 + Math.max(3, fx(c.d.waits) - X0) * gb;
        const bytesLabel = `bytes: ${commas(c.d.bytes)} s`;
        const waitsLabel = `waits: ${commas(c.d.waits)} s`;
        const bytesWins = c.d.bytes >= c.d.waits;
        return (
          <g key={c.l1}>
            <g opacity={fade(t, c.t0 - 0.1, c.t0 + 0.2)}>
              <T x={24} y={c.y} s={15} f={C.latte}>{c.l1}</T>
              <T x={24} y={c.y + 26} s={15} f={C.latte}>{c.l2}</T>
            </g>
            <rect x={X0} y={c.y + 40} width={Math.max(0, bytesEnd - X0)} height={20} rx={3} fill={C.caramel} />
            <rect x={X0} y={c.y + 64} width={Math.max(0, waitsEnd - X0)} height={20} rx={3} fill={C.taupe} />
            <g opacity={lineO}>
              <line x1={fx(floor)} y1={c.y + 34} x2={fx(floor)} y2={c.y + 90} stroke={C.crema} strokeWidth={3} />
              {bytesWins ? (
                <>
                  <T x={fx(floor) + 8} y={c.y + 56} s={15} f={C.crema}>{bytesLabel}</T>
                  <T x={fx(c.d.waits) + 8} y={c.y + 80} s={15} f={C.latte}>{waitsLabel}</T>
                  <T x={fx(floor) + 8} y={c.y + 112} s={15} f={c.vc}>{c.verdict}</T>
                </>
              ) : (
                <>
                  <T x={fx(c.d.bytes) + 8} y={c.y + 56} s={15} f={C.latte}>{bytesLabel}</T>
                  <T x={fx(floor) - 8} y={c.y + 112} s={15} f={C.crema} a="end">{waitsLabel}</T>
                  <T x={fx(floor) - 8} y={c.y + 138} s={15} f={c.vc} a="end">{c.verdict}</T>
                </>
              )}
            </g>
          </g>
        );
      })}
      <T x={24} y={H - 14} s={13} f={C.taupe} o={fade(t, 3.4, 3.8)}>with nothing in flight together, the two add up</T>
    </Svg>
  );
}

// ── 11 · Scanning orders, three ways ───────────────────────────────────────────────────────────────────────────────────────────
export function OrdersRace({ t, portrait }: StepCtx) {
  const H = portrait ? 400 : 350;
  const X0 = 50;
  const X1 = 540;
  const lanes = [
    { name: 'RAM, one core (measured here)', s: ORDERS / (REF.gbs * 1e9) },
    { name: 'NVMe, one drive', s: ORDERS / NVME_BW },
    { name: 'HDD, one drive', s: ORDERS / HDD_BW },
  ];
  const END = lanes[2].s;
  const clockAt = (tt: number) => END * easeInOut(seg(tt, 0.6, 3.4));
  const clock = clockAt(t);
  // The moment the clock reaches a lane's finish time (bisection on the pure clock function).
  const doneAt = (s: number) => {
    let a = 0.6;
    let b = 3.4;
    for (let i = 0; i < 30; i++) {
      const m = (a + b) / 2;
      if (clockAt(m) >= s) b = m;
      else a = m;
    }
    return b;
  };
  const sx = (s: number) => X0 + (s / 30) * (X1 - X0);
  const top = portrait ? 188 : 164;
  const pitch = portrait ? 76 : 64;
  return (
    <Svg label="Scanning orders, 8.2 GB, takes at least 0.7 s from RAM on one core, 1.2 s from one NVMe drive and 28.7 s from one hard disk" h={H}>
      <g opacity={fade(t, 0.2, 0.6)}>
        <T x={24} y={26} s={15} f={C.latte}>orders: 1,000,000 pages × 8 KB</T>
        <T x={24} y={48} s={15} f={C.latte}>= 8.2 GB (7.6 GiB)</T>
        <T x={560} y={44} s={20} f={C.crema} a="end" serif>{clock.toFixed(1)} s</T>
        <line x1={X0} y1={portrait ? 128 : 116} x2={X1} y2={portrait ? 128 : 116} stroke={C.taupe} strokeWidth={2} />
        {([['0', 0], ['10 s', 10], ['20 s', 20], ['30 s', 30]] as [string, number][]).map(([s, v]) => (
          <g key={s}>
            <line x1={sx(v)} y1={(portrait ? 128 : 116) - 4} x2={sx(v)} y2={(portrait ? 128 : 116) + 4} stroke={C.taupe} strokeWidth={2} />
            <T x={sx(v)} y={(portrait ? 128 : 116) - 10} s={13} f={C.taupe} a="middle">{s}</T>
          </g>
        ))}
        <T x={24} y={portrait ? 150 : 138} s={13} f={C.taupe}>time axis: linear</T>
      </g>
      {lanes.map((l, i) => {
        const y = top + i * pitch;
        const done = clock >= l.s - 1e-9;
        const w = sx(Math.min(clock, l.s)) - X0;
        const pop = easeOutBack(seg(t, doneAt(l.s), doneAt(l.s) + 0.4));
        return (
          <g key={l.name}>
            <T x={24} y={y} s={15} f={C.latte}>{l.name}</T>
            <rect x={X0} y={y + 8} width={Math.max(3, w)} height={22} rx={4} fill={C.caramel} />
            {done && (
              <g transform={`translate(560 ${y}) scale(${clamp(pop, 0, 1.2)})`} opacity={clamp(pop)}>
                <text x={0} y={0} textAnchor="end" fill={C.crema} fontFamily="JetBrains Mono, monospace" fontWeight={500} style={{ fontSize: 'calc(17px * var(--svg-text-scale, 1))' }}>
                  {l.s.toFixed(1)} s
                </text>
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// ── 12 · Back to the problem (interactive) ──────────────────────────────────────────────────────────────────────────────────────
const REQS = TiB / (16 * MiB);
const WAITS1 = REQS * OBJ_ALPHA;
const NVME_S = TiB / NVME_BW;
const NIC_S = TiB / NIC_BW;
const KSEQ = [1, 2, 4, 8, 16, 32, 41];
export function Verdict({ t }: StepCtx) {
  const [kUser, setK] = useState<number | null>(null);
  const X0 = 60;
  const X1 = 540;
  const vx = (s: number) => lgx(s, 10, 1e4, X0, X1);
  // k steps up on a beat (each beat sets the next k and the bar eases to it on the log scale).
  const q = (t - 1.4) / 0.35;
  const j = clamp(Math.floor(q), 0, KSEQ.length - 2);
  const kDraw0 = q < 0 ? 1 : q >= KSEQ.length - 1 ? 41 : Math.exp(lerp(Math.log(KSEQ[j]), Math.log(KSEQ[j + 1]), easeOut(clamp((q - j) / 0.7))));
  const kShownAnim = q < 0 ? 1 : q >= KSEQ.length - 1 ? 41 : KSEQ[j + 1];
  const kShown = kUser ?? kShownAnim;
  const kDraw = kUser ?? kDraw0;
  const waits = WAITS1 / kDraw;
  const meets = kDraw >= 41 - 1e-6;
  const pulse = kUser === null ? seg(t, 3.5, 4.1) : 0;
  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <Svg label="Reading 1 TiB from object storage in 16 MiB ranges: the waits take 6,554 seconds divided by k, and at k = 41 the floor matches the local NVMe drive's 162 seconds" h={354}>
          <g opacity={fade(t, 0.2, 0.6)}>
            <T x={24} y={22} s={15} f={C.latte}>1 TiB · 16 MiB ranges = 65,536 requests</T>
            <T x={24} y={42} s={13} f={C.taupe}>each waits α = 100 ms · log scale: each tick ×10</T>
            <LogAxis x0={X0} x1={X1} y={96} lo={10} hi={1e4} named={[[10, '10 s'], [100, '100 s'], [1000, '1,000 s'], [1e4, '10,000 s']]} labelY={-12} />
            <T x={560} y={140} s={20} f={C.crema} a="end" serif>k = {kShown}</T>
            {/* lane 1: the local NVMe drive */}
            <T x={24} y={140} s={15} f={C.latte}>local NVMe</T>
            <rect x={X0} y={150} width={vx(NVME_S) - X0} height={22} rx={4} fill={C.caramel} />
            <T x={X1} y={198} s={15} f={C.crema} a="end">162 s · bandwidth-bound</T>
          </g>
          {/* the target line, through both lanes */}
          <line x1={vx(NVME_S)} y1={112} x2={vx(NVME_S)} y2={296} stroke={C.crema} strokeWidth={2} strokeDasharray="5 5" opacity={0.7 * fade(t, 0.4, 0.8)} />
          {/* lane 2: object storage */}
          <g opacity={fade(t, 0.8, 1.2)}>
            <T x={24} y={246} s={15} f={C.latte}>object storage</T>
            <rect x={X0} y={256} width={Math.max(3, vx(waits) - X0)} height={22} rx={4} fill={C.taupe} />
            <rect x={vx(NIC_S) - 2} y={250} width={4} height={34} rx={2} fill={C.caramel} />
            <T x={X1} y={310} s={13} f={C.taupe} a="end">caramel tick: bytes at 100 Gbit/s, 88 s</T>
            <T x={X1} y={340} s={15} f={C.crema} a="end">waits: {commas(waits)} s{kUser === null && kDraw < 1.5 ? ' ÷ k' : ''}</T>
            {kDraw < 1.5 && kUser === null && (
              <T x={X1} y={246} s={17} f={C.cherryText} a="end">1.8 hours</T>
            )}
          </g>
          {meets && kUser === null && (
            <circle cx={vx(waits)} cy={267} r={12 + 14 * pulse} fill="none" stroke={C.crema} strokeWidth={3} opacity={1 - pulse} />
          )}
        </Svg>
      </div>
      <div data-interactive className="mx-auto w-full max-w-[34rem] cursor-auto px-2 pb-1" style={{ opacity: fade(t, 3.8, 4.2) }}>
        <p className="text-center font-mono text-[0.72rem] uppercase tracking-[0.1em] text-latte">
          k = <span className="text-crema">{kUser ?? 41}</span>
        </p>
        <p className="text-center font-mono text-[0.68rem] uppercase tracking-[0.06em] text-latte">
          waits <span className="text-crema">{commas(WAITS1 / (kUser ?? 41))} s</span> · bytes <span className="text-caramel">{commas(NIC_S)} s</span> → floor{' '}
          <span className="text-crema">{commas(Math.max(WAITS1 / (kUser ?? 41), NIC_S))} s</span>
        </p>
        <p className="mt-1 text-center font-mono text-[0.64rem] tracking-[0.04em] text-taupe">
          a floor, so a real run needs more: k ≈ 52 at 625 MB/s per request,
          <br />k ≈ 82 at 166 MB/s (the drive's rate ÷ 41)
        </p>
        <label className="mt-2 flex items-center gap-3">
          <span className="sr-only">Requests in flight, k</span>
          <input type="range" min={1} max={128} step={1} value={kUser ?? 41} onChange={(e) => setK(Number(e.target.value))} className="reel-range w-full" />
        </label>
      </div>
    </div>
  );
}

// ── 13-15 · Prove it ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function Quiz({ t, answer, chips, work, portrait }: StepCtx & { chips: string[]; work: string[] }) {
  const chipH = 30;
  const pitch = 36;
  const y0 = 92;
  const lastChip = y0 + (chips.length - 1) * pitch;
  const H = lastChip + chipH / 2 + 22 + work.length * 26 + 6;
  return (
    <Svg label="A question with its numbers" h={H}>
      <T x={300} y={64} s={48} f={C.caramel} a="middle" serif o={answer === null ? 0.9 : 0.25}>?</T>
      {chips.map((c, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.18, 0.7 + i * 0.18));
        const w = Math.max(200, c.length * 15 * 0.63 * (portrait ? 1.22 : 1) + 44);
        return (
          <g key={c} transform={`translate(300 ${y0 + i * pitch}) scale(${a})`} opacity={clamp(a)}>
            <rect x={-w / 2} y={-chipH / 2} width={w} height={chipH} rx={chipH / 2} fill={C.roast} stroke={C.mocha} />
            <T x={0} y={5} s={15} f={C.crema} a="middle" w={600}>{c}</T>
          </g>
        );
      })}
      {answer !== null &&
        work.map((w, i) => (
          <T key={w} x={300} y={lastChip + chipH / 2 + 28 + i * 26} s={15} f={C.caramel} a="middle" w={600}>
            {w}
          </T>
        ))}
    </Svg>
  );
}
