import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// Two implementations can run at the identical real speed while one
// allocates a dramatically larger real cost underneath it, a gap
// records per second, measured alone, never once reveals.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// One mono character at s=13 in canvas units; text scales by 1.22 in portrait (global.css), so underlines follow it.
const cw13 = (portrait: boolean) => 8.2 * (portrait ? 1.22 : 1);

// A point k of the way along a polyline, by length: for a value travelling through a structure.
const along = (pts: [number, number][], k: number): [number, number] => {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const goal = clamp(k) * lens[lens.length - 1];
  for (let i = 1; i < pts.length; i++) {
    if (goal <= lens[i]) {
      const f = (goal - lens[i - 1]) / Math.max(1e-9, lens[i] - lens[i - 1]);
      return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    }
  }
  return pts[pts.length - 1];
};

// A check mark that draws itself, for a recap point landing.
const Tick = ({ x, y, t, at, color = C.caramel }: { x: number; y: number; t: number; at: number; color?: string }) => (
  <Draw pts={[[x - 6, y], [x - 1, y + 5], [x + 8, y - 7]]} t={t} from={at} to={at + 0.3} stroke={color} w={2} />
);

// A recap point: slides in from the right and its check mark draws as it lands.
const Point = ({ y, text, t, at }: { y: number; text: string; t: number; at: number }) => {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      <Tick x={30} y={y - 4} t={t} at={at + 0.25} />
      <g transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
        <T x={52} y={y} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
};

// A quoted source: the card slides in, its rule grows, the source name decodes, and a pen underlines the phrase that matters.
function Quote({ y, src, quote, mark, t, at, portrait }: { y: number; src: string; quote: string; mark: string; t: number; at: number; portrait: boolean }) {
  const k = easeOut(seg(t, at, at + 0.45));
  const cw = cw13(portrait);
  const i = Math.max(0, quote.indexOf(mark));
  const x0 = 50 + i * cw;
  const x1 = x0 + mark.length * cw;
  const lit = seg(t, at + 0.55, at + 0.95);
  return (
    <g transform={`translate(${((1 - k) * 48).toFixed(1)} 0)`} opacity={k}>
      <rect x={30} y={y} width={3} height={58 * k} fill={C.caramel} />
      <Decode text={src} t={t} at={at + 0.1} dur={0.5} x={50} y={y + 18} s={11} f={C.latte} />
      <T x={50} y={y + 42} s={13} f={C.crema}>
        {quote.slice(0, i)}
        <tspan fill={lit > 0.5 ? C.caramel : C.crema}>{mark}</tspan>
        {quote.slice(i + mark.length)}
      </T>
      <Draw pts={[[x0, y + 50], [x1, y + 50]]} t={t} from={at + 0.55} to={at + 0.95} stroke={C.caramel} w={2} />
    </g>
  );
}

// ── 1 · Does cloning show up in records per second (predict) ───────────
export function ThroughputPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="borrow each record, or clone it first"
        lines={['the identical checksum, the identical records', '// does cloning show up in records per second?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: throughput lands close either way ─────────────────────
export function ThroughputReveal({ t }: StepCtx) {
  const borrow = easeOut(seg(t, 0.2, 0.5));
  const clone = easeOut(seg(t, 0.35, 0.65));
  return (
    <Svg label="alloc_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical twenty thousand records</T>
      <rect x={60} y={120 - borrow * 70} width={40} height={borrow * 70} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={80} y={140} s={10} a="middle" f={C.latte}>borrowing</T>
      <rect x={160} y={120 - clone * 64} width={40} height={clone * 64} fill={C.caramel} opacity={fa(t, 0.35, 0.2)} />
      <T x={180} y={140} s={10} a="middle" f={C.latte}>cloning</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={155} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={177} s={12} a="middle" f={C.mocha}>millions of records per second, either way</T>
      </g>
      <T x={60} y={200} s={11} f={C.latte} o={fa(t, 1.3, 0.3)}>a modest band, not a structural gap</T>
    </Svg>
  );
}

// ── 3 · Does allocation look as close (predict) ─────────────────────────
export function AllocationPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical workload, a different question now"
        lines={['a real counting allocator, bytes per record', '// does that number look as close as speed did?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: allocation is a different story ──────────────────────
export function AllocationReveal({ t }: StepCtx) {
  const rows = ['borrowing: a handful of bytes per record', 'cloning: right around each record’s own size'];
  // Borrowing reaches into the record with a reference, and the allocator sees a sliver. Cloning copies the whole record
  // out into fresh memory, record after record, a full record's worth every time.
  const rec = 200;
  const a = 64;
  const b = 136;
  const sliver = easeOut(seg(t, 0.55, 0.8)) * 8;
  const copies = [0, 1, 2];
  return (
    <Svg label="alloc_demo, captured" h={220}>
      <g opacity={fa(t, 0, 0.25)}>
        <T x={30} y={a - 22} s={11} f={C.latte}>borrowing</T>
        <T x={30} y={b - 22} s={11} f={C.latte}>cloning</T>
        <T x={480} y={26} s={11} a="middle" f={C.latte}>allocated</T>
        <line x1={372} y1={34} x2={372} y2={160} stroke={C.mocha} strokeDasharray="3 4" />
        <rect x={140} y={a - 14} width={rec} height={28} rx={3} fill="none" stroke={C.crema} strokeWidth={1.2} />
        <rect x={140} y={b - 14} width={rec} height={28} rx={3} fill="none" stroke={C.crema} strokeWidth={1.2} />
        <T x={240} y={a + 4} s={11} a="middle" f={C.latte}>record</T>
        <T x={240} y={b + 4} s={11} a="middle" f={C.latte}>record</T>
      </g>
      <Draw pts={[[40, a], [150, a]]} t={t} from={0.2} to={0.5} stroke={C.caramel} w={2} />
      <Draw pts={[[143, a - 6], [151, a], [143, a + 6]]} t={t} from={0.5} to={0.6} stroke={C.caramel} w={2} pen={false} />
      <rect x={384} y={a - 14} width={Math.max(0.01, sliver)} height={28} rx={2} fill={C.caramel} />
      {copies.map((i) => {
        const at = 0.5 + i * 0.45;
        const k = easeInOut(seg(t, at, at + 0.4));
        const gone = i < 2 ? easeOut(seg(t, at + 0.42, at + 0.55)) : 0;
        if (k <= 0) return null;
        return <rect key={i} x={lerp(140, 384, k)} y={b - 14} width={rec * (0.92 + 0.08 * (1 - gone))} height={28} rx={3} fill={C.cherry} stroke={C.cherryText} strokeWidth={1} opacity={1 - gone} />;
      })}
      <Reticle x={484} y={b} w={212} h={40} t={t} at={2.3} color={C.cherryText} />
      {rows.map((r, i) => {
        const k = fa(t, 1.6 + i * 0.3, 0.4);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={182 + i * 28} r={5} fill={i ? C.cherryText : C.caramel} />
            <T x={48} y={187 + i * 28} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 5 · Modest difference or structural (predict) ───────────────────────
export function GapPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="eight bytes against two hundred eight bytes"
        lines={['the identical, indistinguishable throughput', '// modest, or a real structural gap?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: over twenty times larger ──────────────────────────────
export function GapReveal({ t }: StepCtx) {
  const borrow = easeOut(seg(t, 0.2, 0.45));
  const clone = easeOut(seg(t, 0.4, 0.75));
  return (
    <Svg label="alloc_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical speed, a hidden cost</T>
      <rect x={60} y={120 - borrow * 4} width={40} height={borrow * 4} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={80} y={140} s={10} a="middle" f={C.latte}>8 bytes</T>
      <rect x={220} y={120 - clone * 90} width={40} height={clone * 90} fill={C.cherry} opacity={fa(t, 0.4, 0.2)} />
      <T x={240} y={140} s={10} a="middle" f={C.latte}>208 bytes</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={155} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={177} s={12} a="middle" f={C.mocha}>over twenty times the bytes, per record</T>
      </g>
      <T x={60} y={200} s={11} f={C.latte} o={fa(t, 1.3, 0.3)}>a gap speed alone never showed</T>
    </Svg>
  );
}

// ── 7 · the standard library's own words on a global allocator ─────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // The page's two lines, then what they mean: every allocation in the program, from anywhere, funnels into one allocator.
  const srcs: [number, number][] = [[40, 160], [40, 184], [40, 208]];
  return (
    <Svg label="std::alloc::GlobalAlloc, its own words" h={220}>
      <Quote y={8} src="std::alloc::GlobalAlloc" quote="registered once, behind every allocation" mark="every allocation" t={t} at={0.1} portrait={portrait} />
      <Quote y={82} src="GlobalAlloc, same page" quote="invoked through functions, never by hand" mark="never by hand" t={t} at={0.9} portrait={portrait} />
      {srcs.map(([x, y], i) => {
        const at = 1.8 + i * 0.12;
        const pts: [number, number][] = [[x, y], [200, y], [300, 184]];
        const p = along(pts, easeInOut(seg(t, at, at + 0.55)));
        return (
          <g key={i}>
            <Draw pts={pts} t={t} from={at - 0.1} to={at + 0.3} stroke={C.mocha} w={1.2} pen={false} />
            <circle cx={p[0]} cy={p[1]} r={4} fill={C.caramel} opacity={fa(t, at, 0.1)} />
          </g>
        );
      })}
      <rect x={300} y={170} width={120} height={28} rx={5} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 1.8, 0.2)} />
      <Decode text="allocator" t={t} at={2.2} dur={0.4} x={360} y={188} s={11} a="middle" f={C.caramel} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['indistinguishable speed, two real records', 'twenty times the bytes, hidden underneath', 'one number alone never tells the whole cost'];
  // The payoff, as an iceberg: above the waterline the two speeds rise neck and neck; below it, the bytes each one
  // allocates grow down, a sliver for borrowing and a deep block for cloning. One number only sees the top.
  const water = 214;
  const up = easeOut(seg(t, 0.3, 0.8));
  const down = easeOut(seg(t, 1.0, 1.55));
  return (
    <Svg label="recap: the cost a single number hides" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <Draw pts={[[150, water], [470, water]]} t={t} from={0.15} to={0.45} stroke={C.second} w={1.5} pen={false} />
      <T x={30} y={water - 14} s={11} f={C.latte} o={fa(t, 0.3, 0.3)}>speed</T>
      <T x={30} y={water + 24} s={11} f={C.latte} o={fa(t, 1.0, 0.3)}>bytes</T>
      <rect x={220} y={water - 46 * up} width={50} height={Math.max(0.01, 46 * up)} fill={C.crema} />
      <rect x={330} y={water - 43 * up} width={50} height={Math.max(0.01, 43 * up)} fill={C.crema} />
      <rect x={220} y={water + 2} width={50} height={Math.max(0.01, 3 * down)} fill={C.caramel} />
      <rect x={330} y={water + 2} width={50} height={Math.max(0.01, 64 * down)} fill={C.cherry} stroke={C.cherryText} strokeWidth={1} />
      <T x={245} y={240} s={11} a="middle" f={C.latte} o={fa(t, 1.1, 0.3)}>borrow</T>
      <T x={430} y={260} s={11} f={C.cherryText} o={fa(t, 1.2, 0.3)}>clone</T>
      <Reticle x={355} y={water + 34} w={70} h={72} t={t} at={2.35} color={C.cherryText} />
    </Svg>
  );
}
