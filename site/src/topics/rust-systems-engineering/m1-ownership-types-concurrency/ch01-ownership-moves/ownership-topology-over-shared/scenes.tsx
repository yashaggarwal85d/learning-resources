import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, fmt, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: four maps of one pipeline. The same four places (owner, fill, inspect, consume) are drawn in every
// map; only the edges change, and the edges are the chapter's marks, so a map is an owns-graph: three caramel arrows into
// one locked box (many owners), arrows leaving one node (a tree), numbered slots and index.generation labels (an arena),
// three chips each with exactly one caramel arrow (a ring). Every snippet shown here is an exact line of examples/*.rs
// (examples.py checks it) and every number is asserted there. Everything is a pure function of time.

/** Opacity ramp: 0 before `a`, 1 after `a + d`. */
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
/** CSS-driven reveal for predict steps (the clock stops at `duration`, so the reveal is a still frame). Short on purpose. */
const rv = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transition: 'opacity .15s', transitionDelay: on ? `${Math.min(delay, 0.1)}s` : '0s' });
/** Source lines keep their indentation: SVG text would collapse runs of spaces. */
const nb = (s: string) => s.replace(/ {2,}/g, (m) => ' '.repeat(m.length));

type Pt = [number, number];
const lp = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ── shared glyphs ───────────────────────────────────────────────────────────────────────────────────────────────

/** A polyline drawn up to fraction `k` of its length; with `head` it ends in an arrowhead, with `dot` in an open dot. */
function Poly({ pts, k = 1, c = C.caramel, w = 2.5, dash, head = false, dot = false, o = 1 }: { pts: Pt[]; k?: number; c?: string; w?: number; dash?: string; head?: boolean; dot?: boolean; o?: number }) {
  if (k <= 0.01) return null;
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let left = total * Math.min(1, k);
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < lens.length; i++) {
    if (left >= lens[i]) {
      out.push(pts[i + 1]);
      left -= lens[i];
    } else {
      out.push(lp(pts[i], pts[i + 1], left / lens[i]));
      break;
    }
  }
  const e = out[out.length - 1];
  const p = out[out.length - 2] ?? out[0];
  const ang = Math.atan2(e[1] - p[1], e[0] - p[0]);
  const pull = head ? 7 : dot ? 4 : 0;
  const end: Pt = [e[0] - pull * Math.cos(ang), e[1] - pull * Math.sin(ang)];
  const d = out.slice(0, -1).map((q) => `${q[0]},${q[1]}`).join(' ') + ` ${end[0]},${end[1]}`;
  const hp = (r: number) => `${e[0] - 10 * Math.cos(ang - r)},${e[1] - 10 * Math.sin(ang - r)}`;
  return (
    <g opacity={o}>
      <polyline points={d} fill="none" stroke={c} strokeWidth={w} strokeDasharray={dash} strokeLinejoin="round" />
      {head && <polygon points={`${e[0]},${e[1]} ${hp(0.45)} ${hp(-0.45)}`} fill={c} />}
      {dot && <circle cx={e[0]} cy={e[1]} r={4} fill="none" stroke={c} strokeWidth={1.5} />}
    </g>
  );
}
/** Owner edge: solid caramel with an arrowhead at what it owns; exactly one per value. */
const Own = (p: { a: Pt; b: Pt; k?: number; c?: string; o?: number; w?: number }) => <Poly pts={[p.a, p.b]} k={p.k} c={p.c ?? C.caramel} o={p.o} w={p.w ?? 2.5} head />;
/** Shared borrow: dashed latte with an open dot at the borrowed value (no arrowhead). Exclusive borrow: the same in cinnamon. */
const Shared = (p: { pts: Pt[]; k?: number; o?: number }) => <Poly pts={p.pts} k={p.k} c={C.latte} w={2} dash="6 5" dot o={p.o} />;
const Excl = (p: { pts: Pt[]; k?: number; o?: number; c?: string }) => <Poly pts={p.pts} k={p.k} c={p.c ?? C.cinnamon} w={2} dash="6 5" dot o={p.o} />;

/** A channel: a thin double line. */
function Chan({ a, b, o = 1 }: { a: Pt; b: Pt; o?: number }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n = Math.hypot(dx, dy) || 1;
  const ox = (-dy / n) * 2.5;
  const oy = (dx / n) * 2.5;
  return (
    <g opacity={o} stroke={C.mocha} strokeWidth={1.5}>
      <line x1={a[0] + ox} y1={a[1] + oy} x2={b[0] + ox} y2={b[1] + oy} />
      <line x1={a[0] - ox} y1={a[1] - oy} x2={b[0] - ox} y2={b[1] - oy} />
    </g>
  );
}

/** A map node: name inside (or above the box with `above`), caramel stroke when it is the one to look at. */
function Box({ x, y, w = 160, h = 48, name, look = false, o = 1, grey = false, stroke, above = false, dashed = false, cherry = false, fs = 15 }: { x: number; y: number; w?: number; h?: number; name: string; look?: boolean; o?: number; grey?: boolean; stroke?: string; above?: boolean; dashed?: boolean; cherry?: boolean; fs?: number }) {
  if (o <= 0.01) return null;
  return (
    <g opacity={o * (grey ? 0.45 : 1)}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={dashed ? 'none' : cherry ? C.cherry : C.cocoa} fillOpacity={cherry ? 0.25 : 1} stroke={stroke ?? (cherry ? C.cherry : look ? C.caramel : C.mocha)} strokeWidth={look && !stroke ? 2.5 : 1.5} strokeDasharray={dashed ? '6 5' : undefined} />
      {above ? <T x={x} y={y - 8} s={fs} f={C.crema} w={600}>{name}</T> : <T x={x + 12} y={y + h / 2 + 5} s={fs} f={C.crema} w={600}>{name}</T>}
    </g>
  );
}
/** The Pool cell a node can hold. */
function PoolCell({ x, y, w = 90, h = 22, o = 1 }: { x: number; y: number; w?: number; h?: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill="none" stroke={C.latte} strokeWidth={1} />
      <T x={x + 8} y={y + h - 6} s={13} f={C.latte}>Pool</T>
    </g>
  );
}
/** The locked box in the middle of the shared map; the padlock sits on its top border and flashes caramel when `lit`. */
function Hub({ x, y, w = 200, h = 56, label = 'Arc<Mutex<Pool>>', lit = false, dim = false, o = 1, fs = 15, stroke }: { x: number; y: number; w?: number; h?: number; label?: string; lit?: boolean; dim?: boolean; o?: number; fs?: number; stroke?: string }) {
  if (o <= 0.01) return null;
  const px = x + w - 30;
  const py = y - 7;
  const lc = lit ? C.caramel : C.latte;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={C.cocoa} stroke={stroke ?? (dim ? C.mocha : C.caramel)} strokeWidth={2} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={fs} a="middle" f={C.crema} w={600}>{label}</T>
      <g stroke={lc} strokeWidth={1.5} fill={lit ? C.caramel : C.espresso} fillOpacity={lit ? 0.35 : 1}>
        <rect x={px} y={py} width={14} height={11} rx={2} />
        <path d={`M${px + 3} ${py} v-3 a4 4 0 0 1 8 0 v3`} fill="none" />
      </g>
    </g>
  );
}
/** A counter: label in 13-unit caps, the value below it in 20 units (serif for the one that matters). */
function Counter({ x, y, label, v, text, t = 99, a = 0, d = 0.6, serif = false, bad = false, anchor = 'end', color }: { x: number; y: number; label: string; v?: number; text?: string; t?: number; a?: number; d?: number; serif?: boolean; bad?: boolean; anchor?: 'start' | 'middle' | 'end'; color?: string }) {
  const shown = text ?? fmt((v ?? 0) * easeOut(seg(t, a, a + d)));
  return (
    <g>
      <T x={x} y={y} s={13} a={anchor} f={C.taupe}>{label}</T>
      <T x={x} y={y + 32} s={20} a={anchor} f={color ?? (bad ? C.cherryText : serif ? C.crema : C.latte)} serif={serif} w={serif ? 700 : 500}>{shown}</T>
    </g>
  );
}
const MapTitle = ({ children, x = 40, y = 34 }: { children: string; x?: number; y?: number }) => (
  <T x={x} y={y} s={13} f={C.taupe}>{children}</T>
);
/** A chip: a Buf, with its id. */
function Chip({ cx, cy, id, o = 1, bad = false, stroke }: { cx: number; cy: number; id: number | string; o?: number; bad?: boolean; stroke?: string }) {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={cx - 22} y={cy - 12} width={44} height={24} rx={6} fill={C.roast} stroke={bad ? C.cherryText : (stroke ?? C.latte)} strokeWidth={1.5} />
      <T x={cx} y={cy + 5} s={15} a="middle" f={C.crema} w={600}>{String(id)}</T>
    </g>
  );
}
/** Code as SVG text (the predict steps draw their code inside the picture). */
function CodeLines({ x, y, lines, s = 15, step = 26, f = C.crema, o = 1, hl = [] }: { x: number; y: number; lines: string[]; s?: number; step?: number; f?: string; o?: number; hl?: number[] }) {
  return (
    <g opacity={o}>
      {lines.map((l, i) => (
        <T key={i} x={x} y={y + i * step} s={s} f={hl.includes(i) ? C.caramel : f}>{nb(l)}</T>
      ))}
    </g>
  );
}

// ── 1 · Three stages, one guard at a time ───────────────────────────────────────────────────────────────────────
export function Problem({ t }: StepCtx) {
  const H = 320;
  const k1 = easeOut(seg(t, 1.8, 2.4));
  const k2 = easeOut(seg(t, 2.8, 3.4));
  const bad = t >= 3.4;
  const pop = easeOutBack(seg(t, 3.4, 3.7));
  return (
    <Stack>
      <Code title="stages.rs" t={t} end={1.0} highlight={[2]} lines={[`let mut pool = Pool::new();`, `let a = PooledBuf::new(&mut pool);`, `let b = PooledBuf::new(&mut pool);`, `drop(b);`, `drop(a);`]} />
      <Svg label="Two stages each want a buffer from one pool: the second exclusive borrow is E0499, and the pull request's fix, Arc<Mutex<Pool>>, is the unlit box at the bottom" h={H} fill>
        <MapTitle y={24}>MAP · SHARED</MapTitle>
        <g opacity={fa(t, 1.2)}>
          <Box x={40} y={60} name="pool" />
          <Box x={360} y={60} name="fill" />
          <Box x={360} y={190} name="inspect" />
        </g>
        <Excl pts={[[360, 72], [200, 72]]} k={k1} />
        <Excl pts={[[360, 214], [300, 214], [300, 100], [200, 100]]} k={k2} c={bad ? C.cherry : C.cinnamon} />
        {bad && (
          <g>
            <T x={312} y={150} s={15} f={C.cherryText} w={600} o={pop}>E0499</T>
            <T x={312} y={174} s={13} f={C.latte} o={fa(t, 3.7, 0.3)}>second &amp;mut</T>
          </g>
        )}
        <g opacity={fa(t, 4.2, 0.6)}>
          <T x={40} y={244} s={13} f={C.taupe}>the PR</T>
          <rect x={40} y={252} width={220} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="6 5" />
          <T x={150} y={279} s={15} a="middle" f={C.latte}>Arc&lt;Mutex&lt;Pool&gt;&gt;</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 2 · Four errors, four patches ───────────────────────────────────────────────────────────────────────────────
const RUNGS = [
  { e: 'E0499', gist: 'two &mut of one pool', patch: 'give each stage a thread' },
  { e: 'E0373', gist: 'closure may outlive pool', patch: 'add move' },
  { e: 'E0382', gist: 'pool moved into thread 1', patch: 'wrap it in Arc' },
  { e: 'E0596', gist: 'no &mut through an Arc', patch: 'add a Mutex' },
];
export function Ladder({ t }: StepCtx) {
  return (
    <Svg label="The reflex, rung by rung: four real compiler errors, each silenced by a one-token patch, end at Arc<Mutex<Pool>> compiling, and nobody asked who should own the pool" h={420}>
      <line x1={44} y1={354} x2={44} y2={60} stroke={C.mocha} strokeWidth={1.5} />
      {RUNGS.map((r, i) => {
        const y = 330 - i * 80;
        const a = 0.3 + i * 0.9;
        const pop = easeOutBack(seg(t, a, a + 0.3));
        return (
          <g key={r.e}>
            <g opacity={Math.min(1, pop * 3)} transform={`translate(${108} ${y + 15}) scale(${Math.max(0.01, pop)}) translate(${-108} ${-(y + 15)})`}>
              <rect x={60} y={y} width={96} height={30} rx={7} fill={C.cherry} />
              <T x={108} y={y + 21} s={15} a="middle" f={C.crema} w={600}>{r.e}</T>
            </g>
            <T x={172} y={y + 12} s={13} f={C.latte} o={fa(t, a + 0.3, 0.25)}>{r.gist}</T>
            <T x={172} y={y + 34} s={15} f={C.caramel} o={fa(t, a + 0.45, 0.25)}>{r.patch}</T>
          </g>
        );
      })}
      <g opacity={fa(t, 4.0, 0.6)}>
        <rect x={150} y={20} width={340} height={36} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={320} y={43} s={15} a="middle" f={C.crema}>Arc&lt;Mutex&lt;Pool&gt;&gt; compiles</T>
        <line x1={44} y1={60} x2={44} y2={38} stroke={C.mocha} strokeWidth={1.5} />
        <line x1={44} y1={38} x2={150} y2={38} stroke={C.mocha} strokeWidth={1.5} />
      </g>
      <T x={40} y={398} s={13} f={C.taupe} o={fa(t, 4.8, 0.8)}>nobody asked: who owns the pool?</T>
    </Svg>
  );
}

// ── 3 · How many locks per message? (predict) ───────────────────────────────────────────────────────────────────
const PR_LINES = [`// fill`, `let mut buf = lock(&pool).get();`, `lock(&stats).filled += 1;`, `// inspect`, `lock(&stats).inspected += 1;`, `// consume`, `lock(&stats).consumed += 1;`, `lock(&pool).put(buf);`];
export function LockCount({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pulse = Math.sin(Math.PI * seg(t, 0.8, 1.4));
  return (
    <Stack>
      {!(portrait && ans) && <Code title="the PR, per message" t={t} end={0.8} lines={PR_LINES} />}
      {!(portrait && !ans) && <Svg label="The reviewed design takes five locks per message: get and put lock the pool, each of the three stages locks the shared counters once, so one thousand messages make five thousand lock acquisitions" h={240} fill>
        <Counter x={300} y={34} label="LOCKS" text={ans ? '5,000' : '0'} serif anchor="middle" />
        <g opacity={fa(t, 0.2)}>
          <Box x={40} y={24} w={120} h={40} name="main" />
          <Box x={400} y={24} w={120} h={40} name="fill" />
          <Box x={40} y={176} w={120} h={40} name="consume" />
          <Box x={400} y={176} w={120} h={40} name="inspect" />
          <Own a={[130, 64]} b={[200, 100]} />
          <Own a={[430, 64]} b={[400, 100]} />
          <Own a={[100, 176]} b={[220, 144]} />
        </g>
        <Hub x={180} y={100} w={240} h={44} fs={15} lit={ans || pulse > 0.5} />
        <g style={rv(ans)}>
          <T x={300} y={174} s={15} a="middle" f={C.caramel} w={600}>5 per message</T>
        </g>
      </Svg>}
    </Stack>
  );
}

// ── 4 · Everyone owns it, so no one does ────────────────────────────────────────────────────────────────────────
export function Owners({ t }: StepCtx) {
  const n = 1 + Math.floor(seg(t, 0.95, 2.1) * 2.999);
  const owners = t < 1.0 ? 0 : Math.min(3, n);
  return (
    <Svg label="The pool has three owners and the counters four: three caramel arrows reach one locked box, so every holder can act at any time, no single place keeps the invariant, and nothing bounds how many buffers exist" h={420}>
      <MapTitle>MAP · SHARED</MapTitle>
      <Counter x={520} y={30} label="OWNERS" text={String(owners)} serif />
      <Counter x={520} y={340} label="LOCKS" text="5,000" />
      <g opacity={fa(t, 0.3)}>
        <Box x={40} y={96} name="main" />
        <Box x={360} y={96} name="fill" />
        <Box x={360} y={276} name="inspect" />
        <Box x={40} y={276} name="consume" />
      </g>
      <g opacity={fa(t, 2.6, 0.5)}>
        <Poly pts={[[100, 144], [215, 244]]} c={C.latte} w={1} />
        <Poly pts={[[460, 144], [385, 244]]} c={C.latte} w={1} />
        <Poly pts={[[440, 276], [385, 262]]} c={C.latte} w={1} />
        <Poly pts={[[80, 276], [215, 262]]} c={C.latte} w={1} />
        <Hub x={215} y={234} w={170} h={28} label="Arc<Mutex<Stats>>" fs={13} stroke={C.latte} />
      </g>
      <Hub x={200} y={166} w={200} h={44} fs={15} dim={owners > 0} o={fa(t, 0.3)} />
      <Own a={[130, 144]} b={[215, 166]} k={seg(t, 1.0, 1.4)} />
      <Own a={[440, 144]} b={[385, 166]} k={seg(t, 1.5, 1.9)} />
      <Own a={[160, 276]} b={[225, 210]} k={seg(t, 2.0, 2.4)} />
      <T x={40} y={348} s={13} f={C.latte} o={fa(t, 3.4, 0.5)}>invariants: in every lock holder</T>
      <T x={40} y={374} s={13} f={C.latte} o={fa(t, 4.2, 0.5)}>buffer count: bounded by nobody</T>
    </Svg>
  );
}

// ── 5 · A lock is exclusivity checked at run time ───────────────────────────────────────────────────────────────
export function RuntimeLock({ t }: StepCtx) {
  const cycle = (i: number) => 1.8 + i * 0.5;
  const locks = [0, 1, 2, 3, 4].filter((i) => t >= cycle(i)).length;
  const active = [0, 1, 2, 3, 4].findIndex((i) => t >= cycle(i) && t < cycle(i) + 0.4);
  const guardK = active >= 0 ? seg(t, cycle(active), cycle(active) + 0.15) * (1 - seg(t, cycle(active) + 0.2, cycle(active) + 0.4)) : 0;
  return (
    <Svg label="The same exclusive loan twice: checked by the compiler with no lock at compile time, and granted by a Mutex at run time, where each of the five locks of one message takes a guard that is dropped at once" h={400}>
      <T x={40} y={24} s={13} f={C.taupe}>STATIC</T>
      <g opacity={fa(t, 0.2)}>
        <Box x={40} y={40} name="pool" />
        <Box x={360} y={40} name="fill" />
      </g>
      <Excl pts={[[360, 64], [200, 64]]} k={seg(t, 0.3, 0.8)} />
      <T x={280} y={52} s={13} a="middle" f={C.latte} o={fa(t, 0.8, 0.3)}>&amp;mut Pool</T>
      <T x={300} y={122} s={15} a="middle" f={C.latte} o={fa(t, 0.9, 0.4)}>checked by the compiler</T>
      <T x={300} y={148} s={15} a="middle" f={C.crema} w={600} o={fa(t, 1.0, 0.4)}>0 locks</T>
      <line x1={40} y1={176} x2={520} y2={176} stroke={C.mocha} strokeWidth={1} opacity={fa(t, 1.2)} />
      <g opacity={fa(t, 1.4)}>
        <T x={40} y={204} s={13} f={C.taupe}>RUN TIME</T>
        <Hub x={40} y={226} w={200} h={44} lit={active >= 0} />
        <Box x={360} y={226} name="fill" h={44} />
      </g>
      {active >= 0 && (
        <g opacity={guardK}>
          <rect x={360} y={286} width={160} height={28} rx={7} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={440} y={305} s={13} a="middle" f={C.latte}>MutexGuard</T>
          <Poly pts={[[360, 300], [240, 262]]} c={C.cinnamon} w={2} dash="6 5" dot />
        </g>
      )}
      <Counter x={40} y={338} label="LOCKS" text={String(locks)} serif anchor="start" />
      <T x={40} y={392} s={13} f={C.taupe} o={fa(t, 4.2, 0.6)}>Arc::clone: 0 allocations, a pointer and a count</T>
    </Svg>
  );
}

// ── 6 · Name the owner: a tree ──────────────────────────────────────────────────────────────────────────────────
export function Tree({ t }: StepCtx) {
  const H = 300;
  // where the one buffer chip is: at home in the pool cell, lent (it stays), handed to consume and back, home again
  const toC = easeOut(seg(t, 3.4, 3.9));
  const back = easeOut(seg(t, 4.0, 4.5));
  const home: Pt = [142, 120];
  const dock: Pt = [165, 194];
  const chip = lp(lp(home, dock, toC), home, back);
  const hl = t < 1.8 ? [] : t < 2.6 ? [1] : t < 3.4 ? [2] : t < 4.6 ? [3] : [4];
  const card = easeOut(seg(t, 3.0, 3.4));
  const faint = seg(t, 4.6, 5.2);
  return (
    <Stack>
      <Code title="pipeline.rs" t={t} end={1.0} highlight={hl} lines={[`let mut buf = self.pool.get();`, `fill(&mut buf, src);`, `let h = inspect(&buf);`, `let buf = consume(buf);`, `self.pool.put(buf);`]} />
      <Svg label="A tree: the driver owns the pool and lends the one buffer down, exclusively to fill and shared to inspect, hands it to consume and gets it back, and results come up as values; one thousand messages, one allocation, zero locks" h={H} fill>
        <g opacity={fa(t, 1.2)}>
          <Box x={40} y={50} name="driver" look />
          <Box x={360} y={50} name="fill" />
          <Box x={360} y={170} name="inspect" />
          <Box x={40} y={170} name="consume" />
          <PoolCell x={60} y={106} w={110} h={28} />
        </g>
        <Excl pts={[[360, 74], [200, 74]]} k={seg(t, 1.8, 2.4)} o={t < 2.6 ? 1 : 0.35 * faint} />
        <Shared pts={[[360, 194], [290, 194], [290, 90], [200, 90]]} k={seg(t, 2.6, 3.2)} o={t < 3.4 ? 1 : 0.35 * faint} />
        {t >= 3.0 && (
          <g opacity={t < 3.4 ? 1 : 0.6}>
            <rect x={lerp(250, 236, card) - 40} y={lerp(180, 118, card) - 12} width={80} height={24} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
            <T x={lerp(250, 236, card)} y={lerp(180, 118, card) + 5} s={13} a="middle" f={C.latte}>Header</T>
          </g>
        )}
        <Chip cx={chip[0]} cy={chip[1]} id={1} stroke={C.caramel} o={fa(t, 1.2)} />
        <g opacity={fa(t, 1.2)}>
          <Counter x={40} y={248} label="LOCKS" text="0" serif anchor="start" />
          <Counter x={190} y={248} label="BUFFERS" text="1" anchor="start" />
        </g>
      </Svg>
    </Stack>
  );
}

// ── 7 · Which of these really has many owners? (predict) ────────────────────────────────────────────────────────
const CARDS = [
  { k: 'A', l1: 'the buffer pool', l2: 'stages run in turn', who: 'driver' },
  { k: 'B', l1: 'per-stage counters', l2: 'each stage counts its own', who: 'each stage' },
  { k: 'C', l1: 'a read-only config', l2: '8 threads, whole run', who: 'Arc<Config>' },
  { k: 'D', l1: 'one buffer', l2: 'stage to stage', who: 'moved along' },
];
export function ManyOwners({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pulse = 1 + 0.25 * Math.sin(Math.PI * seg(t, 1.0, 1.4));
  return (
    <Svg label="Only the read-only config has many owners: eight threads read it for the whole run, so it is an Arc with no lock; the pool, the counters and a buffer each have one owner at a time" h={portrait ? 400 : 360}>
      {CARDS.map((c, i) => {
        const x = portrait ? 40 : 40 + (i % 2) * 255;
        const y = portrait ? 40 + i * 92 : 60 + Math.floor(i / 2) * 120;
        const w = portrait ? 480 : 235;
        const h = portrait ? 76 : 90;
        const win = c.k === 'C' && ans;
        return (
          <g key={c.k} opacity={fa(t, 0.1 + i * 0.25, 0.3)}>
            <rect x={x} y={y} width={w} height={h} rx={10} fill={C.cocoa} stroke={win ? C.caramel : C.mocha} strokeWidth={win ? 3 : 1.5 * (t > 1.0 ? pulse : 1)} />
            <T x={x + 14} y={y + h / 2 - 6} s={15} f={C.crema} w={600}>{c.l1}</T>
            <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
              <T x={x + 14} y={y + h / 2 + 18} s={13} f={C.latte}>{c.l2}</T>
            </g>
            <g style={rv(ans)}>
              <T x={x + 14} y={y + h / 2 + 18} s={15} f={win ? C.caramel : C.latte} w={win ? 600 : 500}>{c.who}</T>
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 8 · A cycle has no owner at the top ─────────────────────────────────────────────────────────────────────────
export function RcCycle({ t }: StepCtx) {
  const nodes: { x: number; y: number; n: string }[] = [
    { x: 40, y: 96, n: 'pool' },
    { x: 360, y: 96, n: 'fill' },
    { x: 360, y: 276, n: 'inspect' },
    { x: 40, y: 276, n: 'consume' },
  ];
  const appear = (i: number) => fa(t, 0.3 + i * 0.2, 0.25);
  const live = Math.min(4, Math.floor((t - 0.3) / 0.2 + 0.001) + 1);
  const gone = t >= 3.0;
  const bad = t >= 3.6;
  const ring = (i: number) => seg(t, 1.4 + i * 0.3, 1.7 + i * 0.3);
  const outside = gone ? 0 : t < 0.3 ? 0 : 4;
  return (
    <Svg label="The pipeline is a cycle. If each node owns the next through an Rc, the ring keeps itself alive: after the program drops its own handles, every count falls to one, never to zero, and four allocations stay live" h={400}>
      <MapTitle>GRAPH · RC</MapTitle>
      <Counter x={520} y={30} label="LIVE" text={String(t < 0.3 ? 0 : live)} serif />
      {nodes.map((n, i) => (
        <g key={n.n}>
          <Box x={n.x} y={n.y} name={n.n} o={appear(i)} cherry={bad} look={i === 0 && !bad} />
          {!gone && <circle cx={n.x + 144} cy={n.y + 14} r={5} fill={C.latte} opacity={appear(i)} />}
        </g>
      ))}
      <Own a={[200, 120]} b={[360, 120]} k={ring(0)} />
      <Own a={[440, 144]} b={[440, 276]} k={ring(1)} />
      <Own a={[360, 300]} b={[200, 300]} k={ring(2)} />
      <Own a={[120, 276]} b={[120, 144]} k={ring(3)} />
      <g opacity={fa(t, 1.6, 0.3)}>
        <T x={280} y={108} s={13} a="middle" f={C.latte}>Rc</T>
        <T x={456} y={214} s={13} f={C.latte}>Rc</T>
        <T x={280} y={288} s={13} a="middle" f={C.latte}>Rc</T>
        <T x={132} y={214} s={13} f={C.latte}>Rc</T>
      </g>
      {bad && <T x={300} y={217} s={15} a="middle" f={C.cherryText} w={600} o={fa(t, 3.6, 0.3)}>leaked: 4</T>}
      <T x={40} y={364} s={13} f={C.latte} o={fa(t, 0.6, 0.3)}>{`outside handles: ${outside}`}</T>
      <T x={40} y={388} s={13} f={C.latte} o={fa(t, 4.2, 0.6)}>each count falls to 1, never to 0</T>
    </Svg>
  );
}

// ── 9 · One owner for every node: an arena ──────────────────────────────────────────────────────────────────────
const SLOT_X = [40, 170, 300, 430];
const SLOT_NAMES = ['pool', 'fill', 'inspect', 'consume'];
function SlotBox({ i, y, name, gen, o = 1, k = 1, look = false, ghost = false }: { i: number; y: number; name: string; gen: number; o?: number; k?: number; look?: boolean; ghost?: boolean }) {
  if (o <= 0.01 || k <= 0.01) return null;
  const x = SLOT_X[i];
  return (
    <g opacity={o} transform={`translate(${x + 55} ${y + 32}) scale(${k}) translate(${-(x + 55)} ${-(y + 32)})`}>
      <rect x={x} y={y} width={110} height={64} rx={8} fill={ghost ? 'none' : C.cocoa} stroke={look ? C.caramel : ghost ? C.taupe : C.mocha} strokeWidth={look ? 2.5 : 1.5} strokeDasharray={ghost ? '5 4' : undefined} />
      <T x={x + 10} y={y + 16} s={13} f={C.taupe}>{String(i)}</T>
      <T x={x + 10} y={y + 37} s={15} f={C.crema} w={600}>{name}</T>
      <T x={x + 10} y={y + 57} s={13} f={C.latte}>{`gen ${gen}`}</T>
    </g>
  );
}
export function Arena({ t, portrait }: StepCtx) {
  const H = 340;
  const row = 140;
  const drop = (i: number) => easeOutBack(seg(t, 1.8 + i * 0.15, 2.3 + i * 0.15));
  const collapse = 1 - easeOut(seg(t, 4.4, 4.8));
  const edges = [seg(t, 2.8, 3.1), seg(t, 3.0, 3.3), seg(t, 3.2, 3.5), seg(t, 3.4, 3.7)];
  const arcs: { d: string; lx: number; ly: number; l: string }[] = [
    { d: 'M95 140 Q160 98 225 140', lx: 160, ly: 106, l: '1·0' },
    { d: 'M225 140 Q290 98 355 140', lx: 290, ly: 106, l: '2·0' },
    { d: 'M355 140 Q420 98 485 140', lx: 420, ly: 106, l: '3·0' },
  ];
  const labelsO = fa(t, 2.8, 0.5) * (0.35 + 0.65 * collapse);
  return (
    <Stack>
      {(!portrait || t < 1.4) && <Code title="arena.rs" t={t} end={1.1} lines={[`pub struct Handle {`, `    index: u32,`, `    generation: u32,`, `}`, `pub struct Node {`, `    name: &'static str,`, `    outputs: Vec<Handle>,`, `}`]} />}
      <Svg label="An arena gives every node of the pipeline one owner: edges become eight-byte handles, an index plus a generation, so the cycle is just data; dropping the arena frees all four nodes at once, while the Rc ring left four allocations live" h={H} fill>
        <MapTitle y={20}>MAP · ARENA</MapTitle>
        <g opacity={fa(t, 1.3, 0.3) * collapse} transform={`translate(300 51) scale(1 ${Math.max(0.01, collapse)}) translate(-300 -51)`}>
          <rect x={40} y={36} width={496} height={30} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
          <T x={288} y={57} s={15} a="middle" f={C.crema}>Arena&lt;Node&gt;</T>
        </g>
        <Own a={[70, 66]} b={[70, row]} k={seg(t, 1.4, 1.8)} o={collapse} />
        {SLOT_NAMES.map((n, i) => (
          <g key={n}>
            <SlotBox i={i} y={row} name={n} gen={0} o={Math.min(1, drop(i) * 2)} k={t < 4.4 ? Math.max(0.01, drop(i)) : Math.max(0.01, collapse)} />
            {t >= 4.8 && <SlotBox i={i} y={row} name={n} gen={0} ghost o={0.4 * fa(t, 4.8, 0.4)} />}
          </g>
        ))}
        <g opacity={labelsO}>
          {arcs.map((a, i) => (
            <g key={a.l} opacity={edges[i]}>
              <path d={a.d} fill="none" stroke={C.latte} strokeWidth={1.5} />
              <T x={a.lx} y={a.ly} s={15} a="middle" f={C.caramel}>{a.l}</T>
            </g>
          ))}
          <g opacity={edges[3]}>
            <path d="M485 204 Q290 284 95 204" fill="none" stroke={C.latte} strokeWidth={1.5} />
            <T x={290} y={262} s={15} a="middle" f={C.caramel}>0·0</T>
          </g>
        </g>
        <T x={40} y={84} s={13} f={C.latte} o={fa(t, 4.8, 0.4)}>arena dropped: all four slots freed at once</T>
        <g opacity={fa(t, 2.8, 0.4)}>
          <Counter x={210} y={290} label="SIZE" text="8 B" anchor="start" />
        </g>
        <g opacity={fa(t, 4.8, 0.4)}>
          <Counter x={40} y={290} label="LIVE" text="0" serif anchor="start" />
          <T x={380} y={322} s={13} f={C.latte}>Rc ring: 4</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 10 · Remove a node, reuse its slot (predict) ────────────────────────────────────────────────────────────────
export function Reuse({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const flip = seg(t, 0.6, 1.0);
  const row = 160;
  const pulse = 0.6 + 0.4 * Math.sin(Math.PI * seg(t, 1.0, 1.4));
  return (
    <Svg label="Fill still holds the handle two dot zero, but slot two now holds audit under generation one: the generational lookup returns None, while a plain index would silently return audit" h={360}>
      <T x={40} y={56} s={15} f={C.crema}>g.get(stale)</T>
      <T x={40} y={82} s={13} f={C.latte}>stale = 2·0, slot 2 now holds audit</T>
      {SLOT_NAMES.map((n, i) => {
        const swapped = i === 2 && flip > 0.5;
        const k = i === 2 ? (flip < 0.5 ? 1 - flip * 2 * 0.5 : 0.5 + (flip - 0.5)) : 1;
        return <SlotBox key={n} i={i} y={row} name={swapped ? 'audit' : n} gen={swapped ? 1 : 0} o={fa(t, 0.05 + i * 0.1, 0.3)} k={Math.max(0.5, k)} look={i === 2 && ans} />;
      })}
      <T x={170} y={142} s={15} f={C.caramel} o={fa(t, 0.3, 0.3) * (ans ? 1 : 0.6 + 0.4 * pulse)}>outputs: [2·0]</T>
      <path d="M326 148 Q345 150 355 158" fill="none" stroke={ans ? C.cherry : C.latte} strokeWidth={1.8} opacity={fa(t, 0.4, 0.3)} />
      <g style={rv(ans)}>
        <T x={380} y={140} s={15} f={C.cherryText} w={600}>None</T>
        <T x={40} y={262} s={13} f={C.latte}>plain Vec index: audit (wrong)</T>
        <T x={40} y={290} s={15} f={C.caramel} w={600}>generational: None</T>
      </g>
    </Svg>
  );
}

// ── 11 · The generation catches the stale handle ────────────────────────────────────────────────────────────────
export function GenCheck({ t, portrait }: StepCtx) {
  const H = 280;
  const out = easeOut(seg(t, 2.0, 2.5));
  const gen1 = t >= 2.4;
  const hasNone = t >= 2.0 && t < 3.4;
  const hasAudit = t >= 3.4;
  const name = hasAudit ? 'audit' : hasNone ? 'None' : 'inspect';
  const genPop = easeOutBack(seg(t, 2.4, 2.8));
  const slide = (a: number, b: number, from: number, to: number) => lerp(from, to, easeOut(seg(t, a, b)));
  const tagA = t < 4.6 ? slide(4.0, 4.6, 224, 140) : 140;
  const tagB = t < 4.6 ? 224 : t < 5.0 ? slide(4.6, 5.0, 224, 140) : slide(5.0, 5.4, 140, 224);
  const aOn = t >= 4.0;
  const bOn = t >= 4.6;
  return (
    <Stack>
      {(!portrait || t < 1.4) && <Code title="Arena::remove" t={t} end={1.2} lines={[`if slot.generation != h.generation {`, `    return None;`, `}`, `let value = slot.value.take()?;`, `slot.generation =`, `    slot.generation.wrapping_add(1);`, `self.free.push(h.index);`]} />}
      <Svg label="One slot's life: remove takes the value out and leaves None, bumps the generation from zero to one and puts the index on the free list; the next insert reuses the slot, so handle two dot one is accepted and the old two dot zero is refused with None" h={H} fill>
        <T x={300} y={30} s={13} a="middle" f={C.taupe}>index 2</T>
        <rect x={200} y={40} width={200} height={90} rx={10} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={78} s={15} a="middle" f={hasNone ? C.latte : C.crema} w={600} o={hasNone ? 0.8 : 1}>{name}</T>
        <g transform={`translate(300 112) scale(${gen1 ? Math.max(0.6, genPop) : 1}) translate(-300 -112)`}>
          <T x={300} y={118} s={20} a="middle" f={C.crema} serif w={700}>{`gen ${gen1 ? 1 : 0}`}</T>
        </g>
        {t >= 2.0 && t < 2.5 && (
          <g opacity={1 - out * 0.4}>
            <rect x={lerp(220, 40, out)} y={lerp(46, 150, out)} width={100} height={26} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={1.5} />
            <T x={lerp(270, 90, out)} y={lerp(64, 168, out)} s={13} a="middle" f={C.crema}>inspect</T>
          </g>
        )}
        <T x={40} y={56} s={13} f={C.taupe}>free</T>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={40 + i * 36} y={64} width={30} height={26} rx={5} fill="none" stroke={C.latte} strokeWidth={1} opacity={0.6} />
        ))}
        {t >= 2.8 && t < 3.4 && (
          <g opacity={fa(t, 2.8, 0.3)}>
            <rect x={40} y={64} width={30} height={26} rx={5} fill={C.roast} stroke={C.latte} strokeWidth={1.5} />
            <T x={55} y={82} s={13} a="middle" f={C.crema}>2</T>
          </g>
        )}
        {aOn && (
          <g>
            <rect x={210} y={tagA} width={70} height={28} rx={7} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
            <T x={245} y={tagA + 19} s={15} a="middle" f={C.caramel} w={600}>2·1</T>
            {t >= 4.6 && <T x={288} y={tagA + 19} s={13} f={C.crema}>Some</T>}
          </g>
        )}
        {bOn && (
          <g>
            <rect x={320} y={tagB} width={70} height={28} rx={7} fill={C.roast} stroke={t >= 5.0 ? C.cherry : C.latte} strokeWidth={2} />
            <T x={355} y={tagB + 19} s={15} a="middle" f={t >= 5.0 ? C.cherryText : C.latte} w={600}>2·0</T>
            {t >= 5.0 && <T x={400} y={tagB + 19} s={13} f={C.cherryText}>None</T>}
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 12 · Sending is moving ──────────────────────────────────────────────────────────────────────────────────────
function Cells({ x, y, o = 1 }: { x: number; y: number; o?: number }) {
  return (
    <g opacity={o}>
      {['id', 'ptr', 'cap', 'len'].map((l, i) => (
        <g key={l}>
          <rect x={x + i * 42} y={y} width={38} height={30} rx={5} fill={C.roast} stroke={C.latte} strokeWidth={1.2} />
          <T x={x + i * 42 + 19} y={y + 20} s={13} a="middle" f={C.crema}>{l}</T>
        </g>
      ))}
    </g>
  );
}
export function SendMove({ t }: StepCtx) {
  const H = 310;
  const m = easeOut(seg(t, 1.8, 2.6));
  const moved = t >= 2.6;
  const x = lerp(48, 358, m);
  const err = t >= 3.4;
  const ownerX = moved ? 430 : 130;
  return (
    <Stack>
      <Code title="send.rs" t={t} end={0.9} highlight={t >= 3.4 ? [2] : []} lines={[`let buf = pool.get();`, `tx.send(buf).unwrap();`, `println!("sent buffer {}", buf.id);`]} />
      <Svg label="A send is a move: the 32-byte Buf, its id and the vector's pointer, capacity and length, crosses the channel to the next stage while the 64 KiB heap buffer stays where it is; the sender's buf is moved-from, so using it afterwards is E0382" h={H} fill>
        <g opacity={fa(t, 1.1, 0.4)}>
          <T x={40} y={32} s={13} f={C.taupe}>fill thread</T>
          <T x={350} y={32} s={13} f={C.taupe}>inspect thread</T>
          <rect x={40} y={40} width={176} height={54} rx={8} fill={moved ? 'none' : C.cocoa} stroke={moved ? C.taupe : C.mocha} strokeWidth={1.5} strokeDasharray={moved ? '6 5' : undefined} />
          <rect x={350} y={40} width={176} height={54} rx={8} fill={C.cocoa} stroke={moved ? C.caramel : C.mocha} strokeWidth={moved ? 2.5 : 1.5} />
          <Chan a={[220, 67]} b={[346, 67]} />
          <T x={283} y={56} s={13} a="middle" f={C.taupe}>channel</T>
          <T x={52} y={72} s={13} f={C.latte} o={moved ? 1 : 0}>moved</T>
        </g>
        <Cells x={x} y={52} o={fa(t, 1.1, 0.4)} />
        <g opacity={fa(t, 1.1, 0.4)}>
          <T x={40} y={186} s={13} f={C.latte}>64 KiB buffer</T>
          <rect x={40} y={192} width={486} height={20} rx={7} fill={C.cocoa} />
          <rect x={40} y={192} width={486} height={20} rx={7} fill="none" stroke={C.latte} strokeWidth={1.2} />
          <Own a={[ownerX, 94]} b={[ownerX, 190]} k={1} />
        </g>
        {err && <T x={40} y={126} s={15} f={C.cherryText} w={600} o={easeOutBack(seg(t, 3.4, 3.7))}>E0382</T>}
        <T x={40} y={242} s={13} f={C.latte} o={fa(t, 4.2, 0.6)}>fix: let id = buf.id; before send</T>
        <g opacity={fa(t, 2.4, 0.4)}>
          <Counter x={520} y={258} label="SIZE" text="32 B" serif />
        </g>
      </Svg>
    </Stack>
  );
}

// ── 13 · move hands a thread what it owns ───────────────────────────────────────────────────────────────────────
export function MoveClosure({ t, portrait }: StepCtx) {
  const H = 300;
  const into = easeOut(seg(t, 2.8, 3.4));
  const down = easeOut(seg(t, 3.6, 4.2));
  const back = easeOut(seg(t, 4.2, 4.8));
  const inBox = t >= 2.8;
  const dy = 50 * down;
  const boxY = lerp(80, 100, into) + dy;
  const px = lerp(lerp(40, 340, into), 40, back);
  const py = lerp(boxY, 80, back);
  const edge = t >= 1.4 && t < 2.6;
  const bad = t >= 2.0;
  const home = back >= 1;
  return (
    <Stack>
      {(!portrait || t < 1.2) && <Code title="spawn.rs" t={t} end={0.9} highlight={t >= 2.6 ? [1] : []} lines={[`let mut pool = Pool::new();`, `let h = thread::spawn(move || {`, `    let buf = pool.get();`, `    pool.put(buf);`, `    pool`, `});`, `let pool = h.join().unwrap();`]} />}
      <Svg label="A closure captures what it uses as lightly as its body allows: without move it borrows the pool and thread spawn refuses, E0373; with move the closure owns the pool, the thread owns it until it ends, and join hands it back" h={H} fill>
        <g opacity={fa(t, 1.1, 0.4)}>
          <rect x={24} y={44} width={230} height={100} rx={12} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={36} y={64} s={13} f={C.taupe}>MAIN</T>
          <g transform={`translate(0 ${dy})`}>
            <rect x={320} y={30} width={220} height={150} rx={12} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="6 5" opacity={t >= 4.8 ? 0.5 : 1} />
            <T x={332} y={50} s={13} f={C.taupe}>closure</T>
          </g>
          <line x1={24} y1={250} x2={540} y2={250} stroke={C.mocha} strokeWidth={1.5} />
          <T x={330} y={274} s={13} a="middle" f={C.taupe}>thread</T>
          <rect x={40} y={80} width={180} height={40} rx={8} fill={inBox && !home ? 'none' : C.cocoa} stroke={inBox && !home ? C.taupe : C.mocha} strokeWidth={1.5} strokeDasharray={inBox && !home ? '6 5' : undefined} />
          {home ? <T x={52} y={105} s={15} f={C.crema} w={600}>pool</T> : inBox ? <T x={208} y={105} s={13} a="end" f={C.latte}>moved</T> : <T x={52} y={105} s={15} f={C.crema} w={600}>pool</T>}
        </g>
        {edge && <Excl pts={[[320, 100], [220, 100]]} k={seg(t, 1.4, 2.0)} c={bad ? C.cherry : C.cinnamon} />}
        {bad && t < 2.6 && <T x={330} y={22} s={15} f={C.cherryText} w={600} o={easeOutBack(seg(t, 2.0, 2.3))}>E0373</T>}
        {inBox && !home && (
          <g>
            <rect x={px} y={py} width={180} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
            <T x={px + 12} y={py + 25} s={15} f={C.crema} w={600}>pool</T>
          </g>
        )}
        {t >= 3.6 && !home && <Own a={[330, 248]} b={[330, 232]} k={fa(t, 3.6, 0.3)} />}
        {home && <T x={36} y={176} s={13} f={C.latte} o={fa(t, 4.8, 0.4)}>join() hands the pool back</T>}
      </Svg>
    </Stack>
  );
}

// ── 14 · One owner, fed by messages ─────────────────────────────────────────────────────────────────────────────
type RingG = { top: number; dy: number };
const RX = [40, 360, 360, 40];
const rBox = (g: RingG, i: number): Pt => [RX[i], i < 2 ? g.top : g.top + g.dy];
const rCen = (g: RingG, i: number): Pt => [rBox(g, i)[0] + 80, rBox(g, i)[1] + 40];
/** The ring's four boxes (names above) and four channels. `grey[i]` greys a stage once the Stop has passed it. */
function RingFrame({ g, o = 1, grey = [false, false, false, false], names = ['owner', 'fill', 'inspect', 'consume'], home = true }: { g: RingG; o?: number; grey?: boolean[]; names?: string[]; home?: boolean }) {
  const ch: [Pt, Pt][] = [
    [[200, g.top + 40], [360, g.top + 40]],
    [[440, g.top + 64], [440, g.top + g.dy]],
    [[360, g.top + g.dy + 40], [200, g.top + g.dy + 40]],
    [[120, g.top + g.dy], [120, g.top + 64]],
  ];
  return (
    <g opacity={o}>
      {ch.map((c, i) => <Chan key={i} a={c[0]} b={c[1]} />)}
      {names.map((n, i) => <Box key={n} x={rBox(g, i)[0]} y={rBox(g, i)[1]} h={64} name={n} above grey={grey[i]} look={i === 0} />)}
      {home && <PoolCell x={rBox(g, 0)[0] + 6} y={rBox(g, 0)[1] + 6} w={78} h={18} />}
    </g>
  );
}
/** A point on the loop owner → fill → inspect → consume → owner, for s in [0, 4]. */
function ringAt(g: RingG, s: number): Pt {
  const i = Math.floor(s) % 4;
  return lp(rCen(g, i), rCen(g, (i + 1) % 4), s - Math.floor(s));
}
const DOCK = [26, 74, 122];
export function RingRun({ t, portrait }: StepCtx) {
  const g: RingG = { top: 50, dy: 140 };
  const v = 4 / 1.2;
  const t0 = [1.8, 2.1, 2.4];
  const made = t0.filter((a) => t >= a).length;
  return (
    <Stack>
      {(!portrait || t < 1.4) && <Code title="owner thread" t={t} end={1.2} lines={[`pub enum Msg { Data(Buf), Stop }`, ``, `for msg in inbox {`, `    match msg {`, `        Msg::Data(buf) => owner.home(buf),`, `        Msg::Stop => break,`, `    }`, `}`]} />}
      <Svg label="The ring: one thread owns the pool and alone makes buffers, three of them; each stage thread receives a buffer, works and sends it on, and the last sends it home. Every buffer has exactly one owner at every instant. One thousand messages, three buffers, no locks in our code" h={300} fill>
        <RingFrame g={g} o={fa(t, 1.4)} />
        <T x={132} y={g.top + 106} s={13} f={C.taupe} o={fa(t, 1.4)}>home</T>
        <g opacity={fa(t, 1.6)}>
          <Counter x={212} y={g.top + 82} label="BUFFERS" text={String(made)} serif anchor="start" />
          <Counter x={304} y={g.top + 82} label="LOCKS" text="0" anchor="start" />
        </g>
        {t0.map((a, k) => {
          if (t < a) return null;
          const s = Math.min(8, (t - a) * v);
          const dock: Pt = [rBox(g, 0)[0] + DOCK[k], rBox(g, 0)[1] + 40];
          const p = lp(ringAt(g, s), dock, seg(t, a + 2.4, a + 2.8));
          return <Chip key={k} cx={p[0]} cy={p[1]} id={k + 1} stroke={C.caramel} />;
        })}
        <T x={40} y={286} s={15} f={C.latte} o={fa(t, 2.4)}>{`messages ${fmt(1000 * seg(t, 2.4, 5.0))}`}</T>
        <T x={520} y={286} s={13} a="end" f={C.latte} o={fa(t, 5.0, 0.5)}>ids 1 2 3 1 2 3 …</T>
      </Svg>
    </Stack>
  );
}

// ── 15 · Stage 3 stalls. How many buffers? (predict) ────────────────────────────────────────────────────────────
export function StallCompare({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pulse = 0.5 + 0.5 * Math.sin(Math.PI * seg(t, 0.8, 1.4));
  const row = (y: number, names: [string, string, string]) =>
    names.map((n, i) => {
      const x = [40, 215, 390][i];
      const stalled = i === 2;
      return (
        <g key={n} opacity={fa(t, 0.1 + i * 0.1, 0.3)}>
          <Box x={x} y={y} w={120} h={36} name={n} grey={stalled} fs={15} />
          {stalled && <T x={x + 60} y={y + 54} s={13} a="middle" f={C.latte}>stalled</T>}
        </g>
      );
    });
  const dy = 0;
  return (
    <Svg label="Stage three stalls: in the pull request, fill makes a new buffer for every message and its channel never pushes back, one thousand buffers, 62.5 MiB requested; in the ring only the owner makes buffers, three of them, and fill waits for one to come home" h={portrait ? 330 : 400}>
      <T x={40} y={24 + dy} s={13} f={C.taupe}>SHARED</T>
      <T x={394} y={24} s={13} a="end" f={C.taupe}>BUFFERS</T>
      <T x={520} y={24} s={20} a="end" f={ans ? C.cherryText : C.latte} serif w={700}>{ans ? '1,000' : '?'}</T>
      {row(52, ['fill', 'inspect', 'consume'])}
      <Chan a={[160, 70]} b={[215, 70]} />
      <Chan a={[335, 70]} b={[390, 70]} />
      <T x={187} y={118} s={13} a="middle" f={C.taupe}>unbounded</T>
      <Own a={[100, 88]} b={[100, 130]} />
      <Hub x={40} y={134} w={210} h={34} fs={15} lit={!ans && pulse > 0.5} />
      <g style={rv(ans)}>
        <T x={520} y={158} s={15} a="end" f={C.cherryText} w={600}>62.5 MiB requested</T>
      </g>
      <line x1={40} y1={196} x2={520} y2={196} stroke={C.mocha} strokeWidth={1} />
      <T x={40} y={226} s={13} f={C.taupe}>RING</T>
      <T x={394} y={226} s={13} a="end" f={C.taupe}>BUFFERS</T>
      <T x={520} y={226} s={20} a="end" f={ans ? C.caramel : C.latte} serif w={700}>{ans ? '3' : '?'}</T>
      {[0, 1, 2, 3].map((i) => {
        const x = [40, 167, 294, 421][i];
        const n = ['owner', 'fill', 'inspect', 'consume'][i];
        return (
          <g key={n} opacity={fa(t, 0.3 + i * 0.1, 0.3)}>
            <Box x={x} y={250} w={105} h={36} name={n} grey={i === 3} fs={15} look={i === 0} />
            {i === 3 && <T x={x + 52} y={250 + 54} s={13} a="middle" f={C.latte}>stalled</T>}
          </g>
        );
      })}
      <g opacity={fa(t, 0.4)}>
        {[0, 1, 2].map((i) => <Chan key={i} a={[[145, 272, 399][i], 268]} b={[[167, 294, 421][i], 268]} />)}
      </g>
      <g style={rv(ans)}>
        <T x={219} y={312} s={13} a="middle" f={C.latte}>fill waits</T>
      </g>
    </Svg>
  );
}

// ── 16 · The owner can count every buffer ───────────────────────────────────────────────────────────────────────
export function Ledger({ t, portrait }: StepCtx) {
  const g: RingG = { top: 44, dy: 130 };
  const v = 4 / 1.2;
  const t0 = [1.2, 1.5, 1.8];
  const stopS = t >= 3.3 ? Math.min(4, (t - 3.3) * v) : -1;
  const lastLap = (a: number) => Math.min(8, (t - a) * v);
  const chips = t0.map((a, k) => {
    const s = Math.max(0, lastLap(a));
    const dock: Pt = [rBox(g, 0)[0] + DOCK[k], rBox(g, 0)[1] + 40];
    const docked = seg(t, a + 2.4, a + 2.7);
    return { k, a, s, p: lp(ringAt(g, s), dock, docked), docked, atOwner: docked > 0 || s % 4 < 0.3 || s >= 8 };
  });
  const started = chips.filter((c) => t >= c.a);
  const inPool = chips.filter((c) => t < c.a || c.atOwner).length;
  const out = 3 - inPool;
  const ids = started.filter((c) => !c.atOwner).map((c) => c.k + 1);
  const grey = [stopS >= 4, stopS >= 1, stopS >= 2, stopS >= 3];
  const stop: Pt | null = stopS >= 3.99 ? [236, g.top - 20] : stopS >= 0 ? ringAt(g, stopS) : null;
  const barW = 400;
  const seg1 = (barW * inPool) / 3;
  return (
    <Stack>
      {(!portrait || t < 1.2) && <Code title="Owner::home" t={t} end={1.0} lines={[`let oldest = self.out.pop_front();`, `assert_eq!(oldest, Some(buf.id));`, `let made = self.pool.next_id as usize;`, `let home = self.pool.free.len();`, `assert_eq!(home + self.out.len(), made);`]} />}
      <Svg label="One owner keeps one set of books: every channel is first in, first out, so the owner checks that the oldest buffer out is the next one home, and in the pool plus out in the ring always equals the three buffers made, at all one thousand checks; the stop message arrives last" h={344} fill>
        <RingFrame g={g} grey={grey} o={fa(t, 0.6)} />
        <g opacity={fa(t, 0.8)}>
          <T x={150} y={g.top + 90} s={13} f={C.taupe}>out</T>
          {ids.map((id, i) => (
            <g key={id}>
              <rect x={190 + i * 34} y={g.top + 76} width={28} height={20} rx={5} fill="none" stroke={C.latte} strokeWidth={1} />
              <T x={204 + i * 34} y={g.top + 91} s={13} a="middle" f={C.caramel}>{String(id)}</T>
            </g>
          ))}
        </g>
        {chips.map((c) => t >= c.a && <Chip key={c.k} cx={c.p[0]} cy={c.p[1]} id={c.k + 1} stroke={C.caramel} />)}
        {stop && (
          <g>
            <rect x={stop[0] - 28} y={stop[1] - 12} width={56} height={24} rx={6} fill={C.roast} stroke={C.taupe} strokeWidth={1.5} />
            <T x={stop[0]} y={stop[1] + 5} s={15} a="middle" f={C.latte}>Stop</T>
          </g>
        )}
        <g opacity={fa(t, 0.8)}>
          <rect x={40} y={252} width={barW} height={22} rx={7} fill={C.cocoa} />
          <rect x={40} y={252} width={Math.max(0, seg1)} height={22} rx={7} fill={C.latte} />
          {out > 0 && <rect x={40 + seg1} y={252} width={barW - seg1} height={22} rx={7} fill={C.caramel} />}
          <T x={40} y={296} s={13} f={C.latte}>in pool</T>
          <T x={40 + barW} y={296} s={13} a="end" f={C.caramel}>out in the ring</T>
          <T x={452} y={270} s={20} f={C.crema} serif w={700}>= 3</T>
        </g>
        <T x={40} y={330} s={15} f={C.latte} o={fa(t, 1.0)}>{`checks ${fmt(1000 * seg(t, 1.2, 4.4))}`}</T>
        <T x={520} y={330} s={13} a="end" f={C.latte} o={fa(t, 4.6, 0.4)}>Stop arrives last: FIFO</T>
      </Svg>
    </Stack>
  );
}

// ── 17 · Pick the shape by the data ─────────────────────────────────────────────────────────────────────────────
function Thumb({ k, x, y, o = 1 }: { k: number; x: number; y: number; o?: number }) {
  const n = (cx: number, cy: number) => <rect x={x + cx - 11} y={y + cy - 7} width={22} height={14} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={120} height={70} rx={8} fill="none" stroke={C.mocha} strokeWidth={1} />
      {k === 0 && (
        <g>
          {n(60, 14)}{n(24, 56)}{n(60, 56)}{n(96, 56)}
          <Poly pts={[[60, 21], [24, 49]].map(([a, b]) => [x + a, y + b] as Pt)} c={C.caramel} w={1.5} />
          <Poly pts={[[60, 21], [60, 49]].map(([a, b]) => [x + a, y + b] as Pt)} c={C.caramel} w={1.5} />
          <Poly pts={[[60, 21], [96, 49]].map(([a, b]) => [x + a, y + b] as Pt)} c={C.caramel} w={1.5} />
        </g>
      )}
      {k === 1 && (
        <g>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={x + 10 + i * 26} y={y + 38} width={22} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />)}
          <rect x={x + 10} y={y + 8} width={100} height={14} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
          <path d={`M${x + 21} ${y + 38} Q${x + 34} ${y + 24} ${x + 47} ${y + 38}`} fill="none" stroke={C.latte} strokeWidth={1.2} />
        </g>
      )}
      {k === 2 && (
        <g>
          <rect x={x + 44} y={y + 22} width={32} height={26} rx={4} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
          {[12, 35, 58].map((cy) => <Poly key={cy} pts={[[x + 14, y + cy], [x + 44, y + 35]]} c={C.latte} w={1.2} />)}
          {[12, 35, 58].map((cy) => <Poly key={cy} pts={[[x + 76, y + 35], [x + 106, y + cy]]} c={C.latte} w={1.2} />)}
        </g>
      )}
      {k === 3 && (
        <g>
          <rect x={x + 40} y={y + 20} width={40} height={30} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
          {[10, 35, 60].map((cy) => <Poly key={cy} pts={[[x + 12, y + cy], [x + 40, y + 35]]} c={C.caramel} w={1.2} />)}
          {[10, 35, 60].map((cy) => <Poly key={cy} pts={[[x + 108, y + cy], [x + 80, y + 35]]} c={C.caramel} w={1.2} />)}
        </g>
      )}
    </g>
  );
}
const SHAPES = [
  { n: 'Tree', when: 'when: data has a natural parent', cost: 'cost: callers wait their turn', c: C.crema },
  { n: 'Arena', when: 'when: graph, cycles, removal', cost: 'cost: a check per lookup', c: C.crema },
  { n: 'Owner thread', when: 'when: many users at once', cost: 'cost: a channel hop per request', c: C.crema },
  { n: 'Arc<Mutex<T>>', when: 'when: small, short, truly shared', cost: 'cost: a lock per access', c: C.latte },
];
export function Choose({ t }: StepCtx) {
  return (
    <Svg label="Choose the shape by the data: a tree when the data has a natural parent, an arena for a graph with cycles or removal, an owner thread for many concurrent users, and a mutex only for small data touched briefly; first ask who should own this" h={420}>
      {SHAPES.map((s, i) => {
        const y = 16 + i * 92;
        const a = 0.3 + i * 0.8;
        return (
          <g key={s.n} opacity={fa(t, a, 0.4)}>
            <Thumb k={i} x={40} y={y} />
            <T x={180} y={y + 20} s={15} f={s.c} w={600}>{s.n}</T>
            <T x={180} y={y + 43} s={13} f={C.latte}>{s.when}</T>
            <T x={180} y={y + 63} s={13} f={C.latte}>{s.cost}</T>
          </g>
        );
      })}
      <T x={40} y={404} s={13} f={C.taupe} o={fa(t, 3.6, 1.0)}>ask first: who should own this?</T>
    </Svg>
  );
}

// ── 18 · When Arc<Mutex<T>> is the right shape ──────────────────────────────────────────────────────────────────
export function RightShape({ t }: StepCtx) {
  const ticks = [1.8, 2.4, 3.0];
  const lit = ticks.some((a) => t >= a && t < a + 0.25);
  return (
    <Svg label="Arc<Mutex<T>> is not wrong: read-only data shared by eight threads needs only an Arc and no lock, and small data touched in short critical sections is fine behind a mutex; the anti-pattern is the reflex, not the type" h={400}>
      <g opacity={fa(t, 0.3)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <circle cx={50} cy={64 + i * 20} r={5} fill={C.latte} />
            <Poly pts={[[56, 64 + i * 20], [110, 140]]} c={C.latte} w={1} />
          </g>
        ))}
        <rect x={110} y={120} width={160} height={40} rx={8} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
        <T x={190} y={145} s={15} a="middle" f={C.crema} w={600}>Arc&lt;Config&gt;</T>
        <T x={40} y={250} s={13} f={C.latte}>read-only: no lock</T>
      </g>
      <g opacity={fa(t, 1.4)}>
        <Hub x={310} y={120} w={210} h={44} label="Arc<Mutex<Counts>>" fs={13} lit={lit} />
        <line x1={310} y1={230} x2={520} y2={230} stroke={C.mocha} strokeWidth={1.5} />
        <T x={310} y={278} s={13} f={C.latte}>short critical sections</T>
      </g>
      {ticks.map((a, i) => (
        <rect key={a} x={330 + i * 62} y={220} width={4} height={20} fill={C.caramel} opacity={fa(t, a, 0.15)} />
      ))}
      {ticks.map((a, i) => t >= a && t < a + 0.3 && (
        <g key={a} opacity={1 - seg(t, a + 0.1, a + 0.3)}>
          <rect x={330 + i * 62 - 20} y={180} width={44} height={22} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
        </g>
      ))}
      <T x={40} y={380} s={13} f={C.taupe} o={fa(t, 3.8, 0.7)}>the anti-pattern is the reflex, not the type</T>
    </Svg>
  );
}

// ── 19 · Prove it · 1 of 3 ──────────────────────────────────────────────────────────────────────────────────────
export function ProveView({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const o = pt ? -118 : 0;
  const pulse = 0.55 + 0.45 * Math.sin(Math.PI * seg(t, 1.0, 1.2));
  const lines = [`let mut buf = pool.get();`, `fill(&mut buf, &[1, 0, 1, 0, 0, 7]);`, `let view = &buf.bytes[..5];`, `tx.send(buf).unwrap();`, `println!("{view:?}");`];
  return (
    <Svg label="Sending a buffer while a borrowed view of it is still used later is E0505, move out while borrowed; the fix that clones nothing is to take the header as a value first with inspect, then send" h={pt ? 250 : 360}>
      {lines.map((l, i) => (!pt || i === 3) && <T key={i} x={40} y={(pt ? 36 : 40 + i * 26)} s={15} f={i === 3 ? (ans ? C.crema : C.caramel) : C.crema} o={fa(t, 0.1 + i * 0.1, 0.3) * (i === 3 && !ans ? 0.55 + 0.45 * pulse : 1)}>{nb(l)}</T>)}
      <g opacity={fa(t, 0.6)}>
        <rect x={40} y={190 + o} width={140} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={52} y={218 + o} s={15} f={C.crema} w={600}>buf</T>
        <rect x={230} y={190 + o} width={90} height={30} rx={7} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={275} y={210 + o} s={13} a="middle" f={C.latte}>view</T>
        <Poly pts={[[230, 205 + o], [182, 205 + o]]} c={ans ? C.cherry : C.latte} w={2} dash="6 5" dot />
        <Chan a={[340, 212 + o]} b={[500, 212 + o]} />
        <T x={420} y={198 + o} s={13} a="middle" f={C.taupe}>channel</T>
      </g>
      <g style={rv(ans)}>
        <T x={230} y={254 + o} s={15} f={C.cherryText} w={600}>E0505</T>
        <rect x={40} y={252 + o} width={80} height={24} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={80} y={269 + o} s={13} a="middle" f={C.latte}>Header</T>
        <T x={40} y={308 + o} s={15} f={C.caramel} w={600}>let h = inspect(&amp;buf);</T>
      </g>
    </Svg>
  );
}

// ── 20 · Prove it · 2 of 3 ──────────────────────────────────────────────────────────────────────────────────────
export function ProveBlock({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const lines = [`for msg in rx {`, `  match msg {`, `    Msg::Data(mut buf) => {`, `      let s = &src[seen.len()];`, `      fill(&mut buf, s);`, `      seen.push(buf.id);`, `      tx.send(Msg::Data(buf)).unwrap();`];
  const pulse = 0.55 + 0.45 * Math.sin(Math.PI * seg(t, 0.8, 1.2));
  const cell = (x: number, y: number, grey = false) => <rect x={x} y={y} width={48} height={24} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={grey ? 0.4 : 1} />;
  return (
    <Svg label="With stage three stalled, stage one blocks at the receive in its loop: it can only work on a buffer someone sends it, and only the owner sends buffers, three in all; its sends never block because the channel is unbounded" h={380}>
      <T x={40} y={22} s={13} f={C.taupe}>fill_stage, stage 3 stalled</T>
      {lines.map((l, i) => (
        <T key={i} x={40} y={56 + i * 26} s={15} f={ans && i === 0 ? C.caramel : C.crema} w={ans && i === 0 ? 700 : 500} o={fa(t, 0.1 + i * 0.1, 0.3) * (!ans && i === 0 ? 0.6 + 0.4 * pulse : 1)}>{nb(l)}</T>
      ))}
      <g style={rv(ans)}>
        <T x={250} y={56} s={13} f={C.crema}>blocks here</T>
        <T x={40} y={290} s={15} f={C.crema}>BUFFERS 3</T>
      </g>
      <g opacity={fa(t, 0.6)}>
        {cell(380, 250)}
        {cell(452, 250)}
        {cell(452, 296)}
        {cell(380, 296, true)}
      </g>
    </Svg>
  );
}

// ── 21 · Prove it · 3 of 3 ──────────────────────────────────────────────────────────────────────────────────────
export function ProveArena({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const dag = { j1: [40, 100], j2: [40, 190], j3: [240, 145], j4: [440, 100], j5: [440, 190] } as Record<string, number[]>;
  const edges: [string, string][] = [['j1', 'j3'], ['j2', 'j3'], ['j3', 'j4'], ['j3', 'j5']];
  const c = (k: string): Pt => [dag[k][0] + 45, dag[k][1] + 17];
  const slotX = [40, 136, 232, 328, 424];
  const names = ['j1', 'j2', 'j3', 'j4', 'j5'];
  return (
    <Svg label="A job scheduler: jobs form a graph and finished jobs are removed while others still refer to them, so one arena owns every job and handles are the edges; asking for the finished job returns None, not a reused slot" h={360}>
      <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
        <T x={40} y={36} s={13} f={C.taupe}>one thread · jobs depend on jobs · done jobs removed</T>
        {edges.map(([a, b]) => <Poly key={a + b} pts={[c(a), c(b)]} c={C.latte} w={1.5} o={fa(t, 0.4, 0.3)} />)}
        {Object.keys(dag).map((k, i) => (
          <g key={k} opacity={fa(t, 0.1 + i * 0.1, 0.3) * (k === 'j3' ? 0.5 : 1)}>
            <rect x={dag[k][0]} y={dag[k][1]} width={90} height={34} rx={7} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
            <T x={dag[k][0] + 12} y={dag[k][1] + 22} s={15} f={C.crema} w={600}>{k}</T>
            {k === 'j3' && <T x={dag[k][0] + 45} y={dag[k][1] + 52} s={13} a="middle" f={C.latte}>done</T>}
          </g>
        ))}
      </g>
      <g style={rv(ans)}>
        <T x={40} y={36} s={15} f={C.caramel} w={600}>Arena&lt;Job&gt; + Handle</T>
        {names.map((n, i) => (
          <g key={n}>
            <rect x={slotX[i]} y={190} width={88} height={64} rx={8} fill={n === 'j3' ? 'none' : C.cocoa} stroke={n === 'j3' ? C.latte : C.mocha} strokeWidth={1.5} strokeDasharray={n === 'j3' ? '5 4' : undefined} />
            <T x={slotX[i] + 8} y={208} s={13} f={C.taupe}>{String(i)}</T>
            <T x={slotX[i] + 8} y={230} s={15} f={C.crema} w={600}>{n}</T>
            <T x={slotX[i] + 8} y={248} s={13} f={C.latte}>{n === 'j3' ? 'gen 1' : 'gen 0'}</T>
          </g>
        ))}
        <Poly pts={[[372, 190], [372, 165], [280, 165], [280, 188]]} c={C.cherry} w={1.8} head />
        <Poly pts={[[468, 190], [468, 130], [300, 130], [300, 188]]} c={C.cherry} w={1.8} head />
        <T x={372} y={153} s={15} a="middle" f={C.cherryText} w={600}>None</T>
        <T x={468} y={118} s={15} a="middle" f={C.cherryText} w={600}>None</T>
      </g>
    </Svg>
  );
}

// ── 22 · In one breath ──────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows: { glyph: ReactNode; l1: string; l2: string }[] = [
    {
      glyph: (
        <g>
          <rect x={64} y={14} width={40} height={20} rx={4} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
          <Poly pts={[[44, 6], [64, 18]]} c={C.caramel} w={1.5} />
          <Poly pts={[[44, 30], [64, 26]]} c={C.caramel} w={1.5} />
          <Poly pts={[[44, 38], [64, 32]]} c={C.caramel} w={1.5} />
        </g>
      ),
      l1: 'Arc<Mutex<T>>: many owners, a lock',
      l2: 'the reflex hides who should own it',
    },
    {
      glyph: (
        <g>
          <rect x={64} y={4} width={22} height={12} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
          {[44, 64, 84].map((x) => <rect key={x} x={x} y={26} width={22} height={12} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />)}
          {[55, 75, 95].map((x) => <Poly key={x} pts={[[75, 16], [x, 26]]} c={C.caramel} w={1.2} />)}
        </g>
      ),
      l1: 'Tree: one owner lends down',
      l2: 'results come back up',
    },
    {
      glyph: (
        <g>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={44 + i * 16} y={14} width={14} height={20} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />)}
          <rect x={44} y={2} width={62} height={7} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.2} />
        </g>
      ),
      l1: 'Arena: one owner, handles as edges',
      l2: 'the generation catches stale ones',
    },
    {
      glyph: (
        <g>
          <rect x={46} y={4} width={22} height={12} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.2} />
          <rect x={82} y={4} width={22} height={12} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
          <rect x={82} y={26} width={22} height={12} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
          <rect x={46} y={26} width={22} height={12} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
          <Chan a={[68, 10]} b={[82, 10]} />
          <Chan a={[93, 16]} b={[93, 26]} />
          <Chan a={[82, 32]} b={[68, 32]} />
          <Chan a={[57, 26]} b={[57, 16]} />
        </g>
      ),
      l1: 'Owner thread: send owned values',
      l2: 'one owner per buffer, every instant',
    },
  ];
  return (
    <Svg label="Four shapes for one pipeline: Arc<Mutex<T>> has many owners and a lock and hides who should own the data; a tree has one owner that lends down; an arena has one owner with handles as edges; an owner thread is sent owned values. Next: the rule behind every loan, many shared borrows or one exclusive borrow, never both" h={420}>
      {rows.map((r, i) => (
        <g key={i} opacity={fa(t, 0.2 + i * 0.5, 0.4)} transform={`translate(0 ${50 + i * 70 - 14})`}>
          {r.glyph}
          <T x={124} y={14} s={15} f={C.crema}>{r.l1}</T>
          <T x={124} y={36} s={13} f={C.latte}>{r.l2}</T>
        </g>
      ))}
      <g opacity={fa(t, 2.2, 0.5)}>
        <T x={40} y={368} s={15} f={C.caramel}>Next: many &amp;T or one &amp;mut T</T>
        <T x={40} y={392} s={13} f={C.latte}>fill(&amp;mut Buf) · inspect(&amp;Buf)</T>
      </g>
    </Svg>
  );
}
