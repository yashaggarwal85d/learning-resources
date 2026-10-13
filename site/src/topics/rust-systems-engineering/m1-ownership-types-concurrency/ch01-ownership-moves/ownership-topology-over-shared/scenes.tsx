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

/** A channel: a thin double line; with `head` it ends in an arrowhead (the direction messages travel). */
function Chan({ a, b, o = 1, head = false }: { a: Pt; b: Pt; o?: number; head?: boolean }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n = Math.hypot(dx, dy) || 1;
  const ux = dx / n;
  const uy = dy / n;
  const ox = -uy * 2.5;
  const oy = ux * 2.5;
  const e: Pt = head ? [b[0] - ux * 8, b[1] - uy * 8] : b;
  return (
    <g opacity={o}>
      <g stroke={C.mocha} strokeWidth={1.5}>
        <line x1={a[0] + ox} y1={a[1] + oy} x2={e[0] + ox} y2={e[1] + oy} />
        <line x1={a[0] - ox} y1={a[1] - oy} x2={e[0] - ox} y2={e[1] - oy} />
      </g>
      {head && <polygon points={`${b[0]},${b[1]} ${e[0] + uy * 5},${e[1] - ux * 5} ${e[0] - uy * 5},${e[1] + ux * 5}`} fill={C.latte} />}
    </g>
  );
}

/** A map node: name inside (or above the box with `above`), caramel stroke when it is the one to look at. */
function Box({ x, y, w = 160, h = 48, name, look = false, o = 1, grey = false, stroke, above = false, top = false, dashed = false, cherry = false, fs = 15 }: { x: number; y: number; w?: number; h?: number; name: string; look?: boolean; o?: number; grey?: boolean; stroke?: string; above?: boolean; top?: boolean; dashed?: boolean; cherry?: boolean; fs?: number }) {
  if (o <= 0.01) return null;
  return (
    <g opacity={o * (grey ? 0.6 : 1)}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={dashed ? 'none' : cherry ? C.cherry : C.cocoa} fillOpacity={cherry ? 0.25 : 1} stroke={stroke ?? (cherry ? C.cherry : look ? C.caramel : C.mocha)} strokeWidth={look && !stroke ? 2.5 : 1.5} strokeDasharray={dashed ? '6 5' : undefined} />
      {above ? <T x={x} y={y - 8} s={fs} f={C.crema} w={600}>{name}</T> : top ? <T x={x + 12} y={y + 22} s={fs} f={C.crema} w={600}>{name}</T> : <T x={x + 12} y={y + h / 2 + 5} s={fs} f={C.crema} w={600}>{name}</T>}
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
// ── 1 · Three stages, one guard at a time ───────────────────────────────────────────────────────────────────────
export function Problem({ t, portrait }: StepCtx) {
  const H = 320;
  // portrait: the code first, then the map in its place (a phone has room for one of them)
  const showCode = !portrait || t < 1.6;
  const showMap = !portrait || t >= 1.6;
  const k1 = easeOut(seg(t, 2.4, 3.2));
  const k2 = easeOut(seg(t, 3.8, 4.6));
  const bad = t >= 4.6;
  const pop = easeOutBack(seg(t, 4.6, 4.9));
  return (
    <Stack>
      {showCode && <Code title="stages.rs" t={t} end={1.0} highlight={t >= 3.8 ? [2] : []} lines={[`let mut pool = Pool::new();`, `let a = PooledBuf::new(&mut pool);`, `let b = PooledBuf::new(&mut pool);`, `drop(b);`, `drop(a);`]} />}
      {showMap && <Svg label="Two stages each want a buffer from one pool: the second exclusive borrow is E0499, and the pull request's fix, Arc<Mutex<Pool>>, is the dashed box at the bottom" h={H} fill>
        <MapTitle y={24}>MAP · SHARED</MapTitle>
        <g opacity={fa(t, portrait ? 1.7 : 1.2)}>
          <Box x={40} y={60} name="pool" />
          <Box x={360} y={60} name="fill" />
          <Box x={360} y={190} name="inspect" />
        </g>
        <Excl pts={[[360, 72], [200, 72]]} k={k1} />
        <Excl pts={[[360, 214], [300, 214], [300, 100], [200, 100]]} k={k2} c={bad ? C.cherry : C.cinnamon} />
        {bad && (
          <g>
            <T x={312} y={150} s={15} f={C.cherryText} w={600} o={pop}>E0499</T>
            <T x={312} y={174} s={13} f={C.latte} o={fa(t, 4.9, 0.3)}>second &amp;mut</T>
          </g>
        )}
        <g opacity={fa(t, 6.2, 0.7)}>
          <T x={40} y={244} s={13} f={C.taupe}>the PR</T>
          <rect x={40} y={252} width={220} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="6 5" />
          <T x={150} y={279} s={15} a="middle" f={C.latte}>Arc&lt;Mutex&lt;Pool&gt;&gt;</T>
        </g>
        <T x={280} y={279} s={13} f={C.caramel} o={fa(t, 7.6, 0.7)}>compiles. the right fix?</T>
      </Svg>}
    </Stack>
  );
}

// ── 2 · Four errors, four patches ───────────────────────────────────────────────────────────────────────────────
// Read top to bottom in the order the story goes: E0499 first, the compiling Arc<Mutex<Pool>> last.
const RUNGS = [
  { e: 'E0499', gist: 'two &mut of one pool', patch: 'give each stage a thread' },
  { e: 'E0373', gist: 'closure may outlive pool', patch: 'add move' },
  { e: 'E0382', gist: 'pool moved into thread 1', patch: 'wrap it in Arc' },
  { e: 'E0596', gist: 'no &mut through an Arc', patch: 'add a Mutex' },
];
export function Ladder({ t }: StepCtx) {
  const rung = (i: number) => 0.5 + i * 2.0;
  return (
    <Svg label="The reflex, rung by rung: four real compiler errors, each silenced by a one-token patch, end at Arc<Mutex<Pool>> compiling, and nobody asked who should own the pool" h={420}>
      <line x1={44} y1={39} x2={44} y2={lerp(39, 348, seg(t, 0.5, 8.2))} stroke={C.mocha} strokeWidth={1.5} />
      {RUNGS.map((r, i) => {
        const y = 24 + i * 78;
        const a = rung(i);
        const pop = easeOutBack(seg(t, a, a + 0.3));
        return (
          <g key={r.e}>
            <g opacity={Math.min(1, pop * 3)} transform={`translate(${108} ${y + 15}) scale(${Math.max(0.01, pop)}) translate(${-108} ${-(y + 15)})`}>
              <rect x={60} y={y} width={96} height={30} rx={7} fill={C.cherry} />
              <T x={108} y={y + 21} s={15} a="middle" f={C.crema} w={600}>{r.e}</T>
            </g>
            <T x={172} y={y + 12} s={13} f={C.latte} o={fa(t, a + 0.3, 0.25)}>{r.gist}</T>
            <T x={172} y={y + 34} s={15} f={C.caramel} o={fa(t, a + 0.9, 0.4)}>{r.patch}</T>
          </g>
        );
      })}
      <g opacity={fa(t, 8.2, 0.6)}>
        <line x1={44} y1={348} x2={150} y2={348} stroke={C.mocha} strokeWidth={1.5} />
        <rect x={150} y={330} width={340} height={36} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={320} y={353} s={15} a="middle" f={C.crema}>Arc&lt;Mutex&lt;Pool&gt;&gt; compiles</T>
      </g>
      <T x={40} y={402} s={13} f={C.latte} o={fa(t, 9.2, 0.8)}>nobody asked: who owns the pool?</T>
    </Svg>
  );
}
// ── 3 · How many locks per message? (predict) ───────────────────────────────────────────────────────────────────
const PR_LINES = [`// fill`, `let mut buf = lock(&pool).get();`, `lock(&stats).filled += 1;`, `// inspect`, `lock(&stats).inspected += 1;`, `// consume`, `lock(&stats).consumed += 1;`, `lock(&pool).put(buf);`];
/** On a phone the five lock lines alone: the stage comments cost three of eight lines and the last line would fall off the panel. */
const PR_LINES_PORTRAIT = [PR_LINES[1], PR_LINES[2], PR_LINES[4], PR_LINES[6], PR_LINES[7]];
/** A numbered mark: the n-th lock of a message, in the order of the code. */
function Tick({ cx, cy, n, o = 1 }: { cx: number; cy: number; n: number; o?: number }) {
  return (
    <g opacity={o}>
      <circle cx={cx} cy={cy} r={11} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
      <T x={cx} y={cy + 5} s={13} a="middle" f={C.crema} w={600}>{String(n)}</T>
    </g>
  );
}
export function LockCount({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pulse = Math.sin(Math.PI * seg(t, 0.8, 1.4));
  // the five acquisitions of one message, in the order of the code: [number, which box, whose lock]
  const poolTicks: [number, string][] = [[1, 'get'], [5, 'put']];
  const statsTicks: [number, string][] = [[2, 'fill'], [3, 'inspect'], [4, 'consume']];
  return (
    <Stack>
      {!(portrait && ans) && <Code title="the PR, per message" t={t} end={0.8} lines={portrait ? PR_LINES_PORTRAIT : PR_LINES} />}
      {!(portrait && !ans) && <Svg label="The reviewed design takes five locks per message: get and put lock the pool, each of the three stages locks the shared counters once, so one thousand messages make five thousand lock acquisitions" h={232} fill>
        <Counter x={300} y={18} label="LOCKS" text={ans ? '5,000' : '0'} serif anchor="middle" />
        <g style={rv(ans)}>
          <T x={300} y={78} s={15} a="middle" f={C.caramel} w={600}>5 per message</T>
        </g>
        <g opacity={fa(t, 0.2)}>
          <Hub x={40} y={96} w={210} h={44} label="Arc<Mutex<Pool>>" fs={13} lit={ans || pulse > 0.5} />
          <Hub x={330} y={96} w={210} h={44} label="Arc<Mutex<Stats>>" fs={13} lit={ans || pulse > 0.5} />
        </g>
        <g style={rv(ans)}>
          <line x1={52} y1={140} x2={52} y2={200} stroke={C.mocha} strokeWidth={1.5} />
          <line x1={342} y1={140} x2={342} y2={226} stroke={C.mocha} strokeWidth={1.5} />
          {poolTicks.map(([n, w], i) => (
            <g key={n}>
              <Tick cx={52} cy={174 + i * 26} n={n} />
              <T x={74} y={179 + i * 26} s={15} f={C.latte}>{w}</T>
            </g>
          ))}
          {statsTicks.map(([n, w], i) => (
            <g key={n}>
              <Tick cx={342} cy={174 + i * 26} n={n} />
              <T x={364} y={179 + i * 26} s={15} f={C.latte}>{w}</T>
            </g>
          ))}
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
    <Svg label="The pool has three owners and the counters four: three caramel arrows reach one locked box, so every holder can act at any time, no single place keeps the invariant, and nothing bounds how many buffers exist" h={330}>
      <MapTitle>MAP · SHARED</MapTitle>
      <Counter x={520} y={20} label="OWNERS" text={String(owners)} serif />
      <g opacity={fa(t, 0.3)}>
        <Box x={40} y={64} name="main" />
        <Box x={360} y={64} name="fill" />
        <Box x={360} y={252} name="inspect" />
        <Box x={40} y={252} name="consume" />
      </g>
      <g opacity={fa(t, 2.6, 0.5)}>
        <Poly pts={[[90, 112], [190, 222]]} c={C.latte} w={1} />
        <Poly pts={[[470, 112], [410, 222]]} c={C.latte} w={1} />
        <Poly pts={[[430, 252], [400, 236]]} c={C.latte} w={1} />
        <Poly pts={[[170, 252], [200, 236]]} c={C.latte} w={1} />
        <Hub x={190} y={208} w={220} h={28} label="Arc<Mutex<Stats>>" fs={13} stroke={C.latte} />
      </g>
      <Hub x={200} y={140} w={200} h={44} fs={15} dim={owners > 0} o={fa(t, 0.3)} />
      <Own a={[130, 112]} b={[215, 140]} k={seg(t, 1.0, 1.4)} />
      <Own a={[440, 112]} b={[385, 140]} k={seg(t, 1.5, 1.9)} />
      <Own a={[120, 252]} b={[208, 184]} k={seg(t, 2.0, 2.4)} />
    </Svg>
  );
}

// ── 5 · A lock is exclusivity checked at run time ───────────────────────────────────────────────────────────────
export function RuntimeLock({ t }: StepCtx) {
  const cycle = (i: number) => 1.8 + i * 0.5;
  const active = [0, 1, 2, 3, 4].findIndex((i) => t >= cycle(i) && t < cycle(i) + 0.4);
  const guardK = active >= 0 ? seg(t, cycle(active), cycle(active) + 0.15) * (1 - seg(t, cycle(active) + 0.2, cycle(active) + 0.4)) : 0;
  return (
    <Svg label="The same exclusive loan twice: checked by the compiler with no lock at compile time, and granted by a Mutex at run time, where one fill takes a guard and a second caller waits" h={400}>
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
        {/* the second caller: it waits behind the first, with a dashed edge to the same lock */}
        <Box x={360} y={300} name="fill" h={36} dashed />
        <T x={436} y={323} s={13} f={C.latte}>waits</T>
        <Poly pts={[[360, 318], [140, 318], [140, 273]]} c={C.taupe} w={1.5} dash="6 5" dot />
      </g>
      {active >= 0 && (
        <g opacity={guardK}>
          <Poly pts={[[360, 248], [240, 248]]} c={C.cinnamon} w={2} dash="6 5" dot />
          <rect x={250} y={278} width={104} height={26} rx={7} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={302} y={296} s={13} a="middle" f={C.latte}>MutexGuard</T>
        </g>
      )}
      <T x={40} y={384} s={15} f={C.latte} o={fa(t, 4.2, 0.6)}>Arc::clone: 0 allocations</T>
    </Svg>
  );
}

// ── 6 · Name the owner: a tree ──────────────────────────────────────────────────────────────────────────────────
export function Tree({ t }: StepCtx) {
  const H = 290;
  // where the one buffer chip is: at home in the pool cell, lent (it stays), handed to consume and back, home again
  const toC = easeOut(seg(t, 3.4, 3.9));
  const back = easeOut(seg(t, 4.0, 4.5));
  const home: Pt = [142, 120];
  const dock: Pt = [165, 194];
  const chip = lp(lp(home, dock, toC), home, back);
  const hl = t < 1.8 ? [] : t < 2.6 ? [1] : t < 3.4 ? [2] : t < 4.6 ? [3] : [4];
  const card = easeOut(seg(t, 3.0, 3.4));
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
        {/* the three edges of the tree stay at full strength: lend down (dashed), hand off and back (caramel), results up */}
        <Excl pts={[[360, 74], [200, 74]]} k={seg(t, 1.8, 2.4)} />
        <Shared pts={[[360, 194], [290, 194], [290, 90], [200, 90]]} k={seg(t, 2.6, 3.2)} />
        <Own a={[75, 136]} b={[75, 168]} k={seg(t, 3.4, 3.9)} />
        <Own a={[130, 168]} b={[130, 136]} k={seg(t, 4.0, 4.5)} />
        <Poly pts={[[360, 210], [250, 210], [250, 144]]} c={C.latte} w={2} k={seg(t, 3.0, 3.6)} head />
        {t >= 3.0 && (
          <g opacity={card}>
            <rect x={214} y={112} width={72} height={26} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={1.2} />
            <T x={250} y={130} s={13} a="middle" f={C.crema}>Header</T>
          </g>
        )}
        <Chip cx={chip[0]} cy={chip[1]} id={1} stroke={C.caramel} o={fa(t, 1.2)} />
        <g opacity={fa(t, 1.2)}>
          <Counter x={40} y={236} label="LOCKS" text="0" serif anchor="start" />
          <Counter x={190} y={236} label="BUFFERS" text="1" anchor="start" />
        </g>
      </Svg>
    </Stack>
  );
}

// ── 7 · Which of these really has many owners? (predict) ────────────────────────────────────────────────────────
// The question frame shows the four cards with no owner marks and no hint of the answer; the reveal draws one dot per owner.
const CARDS = [
  { k: 'A', l1: 'the buffer pool', l2: 'lent out, taken back', who: 'driver', owners: 1 },
  { k: 'B', l1: 'per-stage counters', l2: 'bumped every message', who: 'each stage', owners: 3 },
  { k: 'C', l1: 'a read-only config', l2: 'read, never written', who: 'Arc<Config>', owners: 8 },
  { k: 'D', l1: 'one buffer', l2: 'passed stage to stage', who: 'moved along', owners: 1 },
];
export function ManyOwners({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const pulse = 1 + 0.25 * Math.sin(Math.PI * seg(t, 1.0, 1.4));
  return (
    <Stack>
    <Svg label="Only the read-only config has many owners: eight threads read it for the whole run, so it is an Arc with no lock; the pool, the counters and a buffer each have one owner at a time" h={238} fill>
      <g style={rv(ans)}>
        <circle cx={46} cy={14} r={5} fill={C.caramel} />
        <T x={60} y={19} s={13} f={C.latte}>= one owner</T>
      </g>
      {CARDS.map((c, i) => {
        const x = 40 + (i % 2) * 260;
        const y = 30 + Math.floor(i / 2) * 106;
        const w = 240;
        const h = 94;
        const win = c.k === 'C' && ans;
        return (
          <g key={c.k} opacity={fa(t, 0.1 + i * 0.25, 0.3)}>
            <rect x={x} y={y} width={w} height={h} rx={10} fill={C.cocoa} stroke={win ? C.caramel : C.mocha} strokeWidth={win ? 3 : 1.5 * (t > 1.0 ? pulse : 1)} />
            <T x={x + 14} y={y + 26} s={15} f={C.crema} w={600}>{c.l1}</T>
            <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
              <T x={x + 14} y={y + 50} s={13} f={C.latte}>{c.l2}</T>
            </g>
            <g style={rv(ans)}>
              <T x={x + 14} y={y + 50} s={15} f={win ? C.caramel : C.latte} w={win ? 600 : 500}>{c.who}</T>
              {Array.from({ length: c.owners }).map((_, j) => (
                <circle key={j} cx={x + 20 + j * 20} cy={y + 74} r={7} fill={win ? C.caramel : C.latte} />
              ))}
            </g>
          </g>
        );
      })}
    </Svg>
    </Stack>
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
function SlotBox({ i, y, name, gen, o = 1, k = 1, look = false, showGen = true }: { i: number; y: number; name: string; gen: number; o?: number; k?: number; look?: boolean; showGen?: boolean }) {
  if (o <= 0.01 || k <= 0.01) return null;
  const x = SLOT_X[i];
  return (
    <g opacity={o} transform={`translate(${x + 55} ${y + 32}) scale(${k}) translate(${-(x + 55)} ${-(y + 32)})`}>
      <rect x={x} y={y} width={110} height={64} rx={8} fill={C.cocoa} stroke={look ? C.caramel : C.mocha} strokeWidth={look ? 2.5 : 1.5} />
      <T x={x + 10} y={y + 16} s={13} f={C.taupe}>{String(i)}</T>
      <T x={x + 10} y={y + (showGen ? 37 : 42)} s={15} f={C.crema} w={600}>{name}</T>
      {showGen && <T x={x + 10} y={y + 57} s={13} f={C.latte}>{`gen ${gen}`}</T>}
    </g>
  );
}
export function Arena({ t, portrait }: StepCtx) {
  const H = 360;
  const row = 140;
  const drop = (i: number) => easeOutBack(seg(t, 1.8 + i * 0.15, 2.3 + i * 0.15));
  const edges = [seg(t, 2.8, 3.1), seg(t, 3.0, 3.3), seg(t, 3.2, 3.5), seg(t, 3.4, 3.7)];
  const arcs: { d: string; lx: number; ly: number; l: string }[] = [
    { d: 'M95 140 Q160 98 225 140', lx: 160, ly: 106, l: '1·0' },
    { d: 'M225 140 Q290 98 355 140', lx: 290, ly: 106, l: '2·0' },
    { d: 'M355 140 Q420 98 485 140', lx: 420, ly: 106, l: '3·0' },
  ];
  return (
    <Stack>
      {(!portrait || t < 1.4) && <Code title="arena.rs" t={t} end={1.1} lines={[`pub struct Handle {`, `    index: u32,`, `    generation: u32,`, `}`, `pub struct Node {`, `    name: &'static str,`, `    outputs: Vec<Handle>,`, `}`]} />}
      <Svg label="An arena gives every node of the pipeline one owner: edges become eight-byte handles, an index plus a generation, so the cycle is just data; dropping the arena frees all four nodes at once, while the Rc ring left four allocations live" h={H} fill>
        <MapTitle y={20}>MAP · ARENA</MapTitle>
        <g opacity={fa(t, 1.3, 0.3)}>
          <rect x={40} y={36} width={496} height={30} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
          <T x={288} y={57} s={15} a="middle" f={C.crema}>Arena&lt;Node&gt;</T>
        </g>
        <Own a={[70, 66]} b={[70, row]} k={seg(t, 1.4, 1.8)} />
        {SLOT_NAMES.map((n, i) => (
          <SlotBox key={n} i={i} y={row} name={n} gen={0} showGen={false} o={Math.min(1, drop(i) * 2)} k={Math.max(0.01, drop(i))} />
        ))}
        <g>
          {arcs.map((a, i) => (
            <g key={a.l} opacity={edges[i]}>
              <path d={a.d} fill="none" stroke={C.latte} strokeWidth={1.5} />
              <T x={a.lx} y={a.ly} s={15} a="middle" f={C.caramel}>{a.l}</T>
            </g>
          ))}
          <g opacity={edges[3]}>
            <path d="M485 204 Q290 284 95 204" fill="none" stroke={C.latte} strokeWidth={1.5} />
            <T x={290} y={266} s={15} a="middle" f={C.caramel}>0·0</T>
          </g>
        </g>
        <g opacity={fa(t, 2.8, 0.4)}>
          <Counter x={520} y={304} label="HANDLE" text="8 B" />
        </g>
        <g opacity={fa(t, 4.4, 0.5)}>
          <T x={40} y={292} s={13} f={C.taupe}>live after the drop</T>
          <Counter x={40} y={314} label="ARENA" text="0" serif anchor="start" />
          <Counter x={200} y={314} label="Rc RING" text="4" bad anchor="start" />
        </g>
      </Svg>
    </Stack>
  );
}

// ── 10 · Remove a node, reuse its slot (predict) ────────────────────────────────────────────────────────────────
export function Reuse({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const row = 128;
  const pulse = 0.6 + 0.4 * Math.sin(Math.PI * seg(t, 1.0, 1.4));
  const fade = { transition: 'opacity .15s' };
  return (
    <Stack>
    <Svg label="Fill still holds the handle two dot zero, but slot two now holds audit under generation one: the generational lookup returns None, while a plain index would silently return audit" h={252} fill>
      <T x={40} y={20} s={15} f={C.crema}>g.get(stale)</T>
      <T x={40} y={42} s={13} f={C.latte}>stale = 2·0</T>
      {SLOT_NAMES.map((n, i) => (i === 2 ? null : <SlotBox key={n} i={i} y={row} name={n} gen={0} o={fa(t, 0.05 + i * 0.1, 0.3)} />))}
      {/* slot 2 before the swap (the question) and after it (the reveal) */}
      <g style={{ opacity: ans ? 0 : 1, ...fade }}>
        <SlotBox i={2} y={row} name="inspect" gen={0} o={fa(t, 0.25, 0.3)} />
      </g>
      <g style={rv(ans)}>
        <SlotBox i={2} y={row} name="audit" gen={1} look />
      </g>
      <T x={304} y={79} s={13} a="end" f={C.latte} o={fa(t, 0.3, 0.3)}>fill holds</T>
      <g opacity={fa(t, 0.3, 0.3) * (ans ? 1 : 0.6 + 0.4 * pulse)}>
        <rect x={316} y={62} width={72} height={28} rx={7} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        <T x={352} y={81} s={15} a="middle" f={C.caramel} w={600}>2·0</T>
      </g>
      <Poly pts={[[352, 90], [352, 126]]} c={ans ? C.cherry : C.latte} w={2} head o={fa(t, 0.4, 0.3)} />
      <g style={rv(ans)}>
        <T x={366} y={116} s={15} f={C.cherryText} w={600}>None</T>
        <T x={40} y={220} s={13} f={C.latte}>plain Vec index: audit (wrong)</T>
        <T x={40} y={244} s={15} f={C.caramel} w={600}>generational: None</T>
      </g>
    </Svg>
    </Stack>
  );
}

// ── 11 · The generation catches the stale handle ────────────────────────────────────────────────────────────────
export function GenCheck({ t, portrait }: StepCtx) {
  const H = 290;
  const out = easeOut(seg(t, 2.0, 2.5));
  const gen1 = t >= 2.4;
  const hasNone = t >= 2.0 && t < 3.6;
  const hasAudit = t >= 3.6;
  const name = hasAudit ? 'audit' : hasNone ? 'None' : 'inspect';
  const genPop = easeOutBack(seg(t, 2.4, 2.8));
  const back = easeOut(seg(t, 3.2, 3.6));
  const bad = t >= 5.4;
  return (
    <Stack>
      {(!portrait || t < 1.4) && <Code title="Arena::remove" t={t} end={1.2} lines={[`if slot.generation != h.generation {`, `    return None;`, `}`, `let value = slot.value.take()?;`, `slot.generation =`, `    slot.generation.wrapping_add(1);`, `self.free.push(h.index);`]} />}
      <Svg label="One slot's life: remove takes the value out and leaves None, bumps the generation from zero to one and puts the index on the free list; the next insert reuses the slot, so handle two dot one is accepted and the old two dot zero is refused with None" h={H} fill>
        <T x={330} y={30} s={13} a="middle" f={C.taupe}>index 2</T>
        <rect x={210} y={44} width={240} height={100} rx={10} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={330} y={90} s={15} a="middle" f={hasNone ? C.latte : C.crema} w={600} o={hasNone ? 0.8 : 1}>{name}</T>
        <g transform={`translate(330 122) scale(${gen1 ? Math.max(0.6, genPop) : 1}) translate(-330 -122)`}>
          <T x={330} y={130} s={20} a="middle" f={C.crema} serif w={700}>{`gen ${gen1 ? 1 : 0}`}</T>
        </g>
        {/* the three removal steps, numbered in the order they happen */}
        <g opacity={fa(t, 2.0, 0.3)}>
          <Tick cx={228} cy={80} n={1} />
          <T x={246} y={85} s={13} f={C.latte}>take</T>
        </g>
        <g opacity={fa(t, 2.4, 0.3)}>
          <Tick cx={228} cy={124} n={2} />
          <T x={246} y={129} s={13} f={C.latte}>bump</T>
        </g>
        {t >= 2.0 && t < 2.5 && (
          <g opacity={1 - out * 0.4}>
            <rect x={lerp(230, 40, out)} y={lerp(52, 160, out)} width={100} height={26} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={1.5} />
            <T x={lerp(280, 90, out)} y={lerp(70, 178, out)} s={13} a="middle" f={C.crema}>inspect</T>
          </g>
        )}
        {/* the free list: index 2 goes on it, and leaves it again when the next insert reuses the slot */}
        <T x={40} y={34} s={13} f={C.taupe}>free list</T>
        <g opacity={fa(t, 2.8, 0.3)}>
          <Tick cx={152} cy={30} n={3} />
        </g>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={40 + i * 36} y={46} width={30} height={26} rx={5} fill="none" stroke={C.latte} strokeWidth={1} opacity={0.6} />
        ))}
        {t >= 2.8 && t < 3.7 && (
          <g opacity={fa(t, 2.8, 0.3) * (1 - seg(t, 3.5, 3.7))}>
            <rect x={lerp(40, 215, back)} y={lerp(46, 70, back)} width={30} height={26} rx={5} fill={C.roast} stroke={C.latte} strokeWidth={1.5} />
            <T x={lerp(55, 230, back)} y={lerp(64, 88, back)} s={13} a="middle" f={C.crema}>2</T>
          </g>
        )}
        {/* two lookups: each handle points at the slot, and the check beside it decides */}
        <g opacity={fa(t, 4.0, 0.3)}>
          <rect x={235} y={190} width={70} height={28} rx={7} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <T x={270} y={209} s={15} a="middle" f={C.caramel} w={600}>2·1</T>
        </g>
        <Own a={[270, 190]} b={[270, 148]} k={seg(t, 4.0, 4.4)} />
        <g opacity={fa(t, 4.6, 0.3)}>
          <T x={270} y={244} s={13} a="middle" f={C.latte}>gen 1 = 1</T>
          <T x={270} y={266} s={15} a="middle" f={C.caramel} w={600}>Some</T>
        </g>
        <g opacity={fa(t, 4.8, 0.3)}>
          <rect x={355} y={190} width={70} height={28} rx={7} fill={C.roast} stroke={bad ? C.cherry : C.latte} strokeWidth={2} />
          <T x={390} y={209} s={15} a="middle" f={bad ? C.cherryText : C.latte} w={600}>2·0</T>
        </g>
        <Poly pts={[[390, 190], [390, 148]]} c={bad ? C.cherry : C.latte} w={2} head k={seg(t, 4.8, 5.2)} />
        <g opacity={fa(t, 5.4, 0.3)}>
          <T x={390} y={244} s={13} a="middle" f={C.latte}>gen 0 ≠ 1</T>
          <T x={390} y={266} s={15} a="middle" f={C.cherryText} w={600}>None</T>
        </g>
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
          <rect x={x + i * 50} y={y} width={46} height={30} rx={5} fill={C.roast} stroke={C.latte} strokeWidth={1.2} />
          <T x={x + i * 50 + 23} y={y + 20} s={13} a="middle" f={C.crema}>{l}</T>
        </g>
      ))}
    </g>
  );
}
export function SendMove({ t }: StepCtx) {
  const H = 290;
  const m = easeOut(seg(t, 1.8, 2.6));
  const moved = t >= 2.6;
  const x = lerp(42, 342, m);
  const err = t >= 3.4;
  const ownerX = moved ? 436 : 146;
  return (
    <Stack>
      <Code title="send.rs" t={t} end={0.9} highlight={t >= 3.4 ? [2] : []} lines={[`let buf = pool.get();`, `tx.send(buf).unwrap();`, `println!("sent buffer {}", buf.id);`, `// fix: let id = buf.id; first`]} />
      <Svg label="A send is a move: the 32-byte Buf, its id and the vector's pointer, capacity and length, crosses the channel to the next stage while the 64 KiB heap buffer stays where it is; the sender's buf is moved-from, so using it afterwards is E0382" h={H} fill>
        <g opacity={fa(t, 1.1, 0.4)}>
          <T x={40} y={32} s={13} f={C.taupe}>fill thread</T>
          <T x={340} y={32} s={13} f={C.taupe}>inspect thread</T>
          <rect x={40} y={40} width={200} height={54} rx={8} fill={moved ? 'none' : C.cocoa} stroke={moved ? C.taupe : C.mocha} strokeWidth={1.5} strokeDasharray={moved ? '6 5' : undefined} />
          <rect x={340} y={40} width={202} height={54} rx={8} fill={C.cocoa} stroke={moved ? C.caramel : C.mocha} strokeWidth={moved ? 2.5 : 1.5} />
          <Chan a={[244, 67]} b={[336, 67]} head />
          <T x={290} y={56} s={13} a="middle" f={C.taupe}>channel</T>
          <T x={52} y={72} s={13} f={C.latte} o={moved ? 1 : 0}>moved</T>
        </g>
        <Cells x={x} y={52} o={fa(t, 1.1, 0.4)} />
        <g opacity={fa(t, 1.1, 0.4)}>
          <T x={40} y={186} s={13} f={C.latte}>64 KiB buffer</T>
          <rect x={40} y={192} width={502} height={20} rx={7} fill={C.cocoa} />
          <rect x={40} y={192} width={502} height={20} rx={7} fill="none" stroke={C.latte} strokeWidth={1.2} />
          <Own a={[ownerX, 94]} b={[ownerX, 190]} k={1} />
        </g>
        {err && <T x={40} y={126} s={15} f={C.cherryText} w={600} o={easeOutBack(seg(t, 3.4, 3.7))}>E0382</T>}
        <g opacity={fa(t, 2.4, 0.4)}>
          <Counter x={520} y={236} label="SIZE" text="32 B" serif />
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
  const inBox = t >= 2.8;
  const dy = 50 * down;
  const boxY = lerp(80, 100, into) + dy;
  const px = lerp(40, 340, into);
  const edge = t >= 1.4 && t < 2.6;
  const bad = t >= 2.0;
  return (
    <Stack>
      {(!portrait || t < 1.2) && <Code title="spawn.rs" t={t} end={0.9} highlight={t >= 2.6 ? [1] : []} lines={[`let mut pool = Pool::new();`, `let h = thread::spawn(move || {`, `    let buf = pool.get();`, `    pool.put(buf);`, `    pool`, `});`, `let pool = h.join().unwrap();`]} />}
      <Svg label="A closure captures what it uses as lightly as its body allows: without move it borrows the pool and thread spawn refuses, E0373; with move the closure owns the pool, the thread owns it until it ends, and join hands it back" h={H} fill>
        <g opacity={fa(t, 1.1, 0.4)}>
          <rect x={24} y={44} width={230} height={100} rx={12} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={36} y={64} s={13} f={C.taupe}>MAIN</T>
          <g transform={`translate(0 ${dy})`}>
            <rect x={320} y={30} width={220} height={150} rx={12} fill="none" stroke={inBox ? C.caramel : C.latte} strokeWidth={1.5} strokeDasharray="6 5" />
            <T x={332} y={50} s={13} f={C.taupe}>closure</T>
          </g>
          <line x1={24} y1={250} x2={540} y2={250} stroke={C.mocha} strokeWidth={1.5} />
          <T x={330} y={274} s={13} a="middle" f={C.taupe}>thread</T>
          <rect x={40} y={80} width={180} height={40} rx={8} fill={inBox ? 'none' : C.cocoa} stroke={inBox ? C.taupe : C.mocha} strokeWidth={1.5} strokeDasharray={inBox ? '6 5' : undefined} />
          {inBox ? <T x={208} y={105} s={13} a="end" f={C.latte}>moved</T> : <T x={52} y={105} s={15} f={C.crema} w={600}>pool</T>}
        </g>
        {edge && <Excl pts={[[320, 100], [220, 100]]} k={seg(t, 1.4, 2.0)} c={bad ? C.cherry : C.cinnamon} />}
        {bad && t < 2.6 && <T x={330} y={22} s={15} f={C.cherryText} w={600} o={easeOutBack(seg(t, 2.0, 2.3))}>E0373</T>}
        {inBox && (
          <g>
            <rect x={px} y={boxY} width={180} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
            <T x={px + 12} y={boxY + 25} s={15} f={C.crema} w={600}>pool</T>
          </g>
        )}
        {t >= 3.6 && <Own a={[330, 248]} b={[330, 232]} k={fa(t, 3.6, 0.3)} />}
        {/* the frame the step ends on: the closure owns the pool; join() is a second line, not a return that erases the picture */}
        <T x={36} y={176} s={15} f={C.caramel} w={600} o={fa(t, 3.8, 0.4)}>the closure owns pool</T>
        <T x={36} y={200} s={13} f={C.latte} o={fa(t, 4.3, 0.4)}>until join() hands it back</T>
      </Svg>
    </Stack>
  );
}

// ── 14 · One owner, fed by messages ─────────────────────────────────────────────────────────────────────────────
type RingG = { top: number; dy: number };
const RX = [40, 360, 360, 40];
const BOXH = 72;
const CY = 48; // a buffer sits on the line through the middle of the lower part of a box, clear of the box's name
const rBox = (g: RingG, i: number): Pt => [RX[i], i < 2 ? g.top : g.top + g.dy];
const rCen = (g: RingG, i: number): Pt => [rBox(g, i)[0] + 80, rBox(g, i)[1] + CY];
/** The ring's four boxes (names inside, at the top) and four channels, each with an arrowhead in the direction buffers travel. */
function RingFrame({ g, o = 1 }: { g: RingG; o?: number }) {
  const ch: [Pt, Pt][] = [
    [[200, g.top + CY], [360, g.top + CY]],
    [[440, g.top + BOXH], [440, g.top + g.dy]],
    [[360, g.top + g.dy + CY], [200, g.top + g.dy + CY]],
    [[120, g.top + g.dy], [120, g.top + BOXH]],
  ];
  const names = ['owner', 'fill', 'inspect', 'consume'];
  return (
    <g opacity={o}>
      {ch.map((c, i) => <Chan key={i} a={c[0]} b={c[1]} head />)}
      {names.map((n, i) => <Box key={n} x={rBox(g, i)[0]} y={rBox(g, i)[1]} h={BOXH} name={n} top look={i === 0} />)}
      <PoolCell x={rBox(g, 0)[0] + 80} y={rBox(g, 0)[1] + 4} w={74} h={26} />
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
  const g: RingG = { top: 36, dy: 120 };
  const v = 4;
  // The step ends on a snapshot: buffer 1 at consume, 2 at inspect, 3 at fill (each one lap further than the next), so every
  // buffer sits inside exactly one box, and the three of them reach their places together at 5.6 s.
  const t0 = [1.85, 2.1, 2.35];
  const end = [15, 14, 13];
  const made = t0.filter((a) => t >= a).length;
  return (
    <Stack>
      {(!portrait || t < 1.4) && <Code title="owner thread" t={t} end={1.2} lines={[`pub enum Msg { Data(Buf), Stop }`, ``, `for msg in inbox {`, `    match msg {`, `        Msg::Data(buf) => owner.home(buf),`, `        Msg::Stop => break,`, `    }`, `}`]} />}
      <Svg label="The ring: one thread owns the pool and alone makes buffers, three of them; each stage thread receives a buffer, works and sends it on, and the last sends it home. Every buffer has exactly one owner at every instant. One thousand messages, three buffers, no locks in our code" h={290} fill>
        <RingFrame g={g} o={fa(t, 1.4)} />
        <T x={280} y={g.top + BOXH + 29} s={13} a="middle" f={C.latte} o={fa(t, 5.0, 0.5)}>one owner per buffer</T>
        {t0.map((a, k) => {
          if (t < a) return null;
          const p = ringAt(g, Math.min(end[k], (t - a) * v));
          return <Chip key={k} cx={p[0]} cy={p[1]} id={k + 1} stroke={C.caramel} />;
        })}
        <g opacity={fa(t, 1.6)}>
          <Counter x={40} y={248} label="BUFFERS" text={String(made)} serif anchor="start" />
          <Counter x={150} y={248} label="LOCKS" text="0" anchor="start" />
        </g>
        <g opacity={fa(t, 2.4)}>
          <Counter x={250} y={248} label="MESSAGES" text={fmt(1000 * seg(t, 2.4, 5.6))} anchor="start" />
        </g>
        <T x={520} y={280} s={13} a="end" f={C.latte} o={fa(t, 5.0, 0.5)}>ids 1 2 3 1 2 3 …</T>
      </Svg>
    </Stack>
  );
}

// ── 15 · Stage 3 stalls. How many buffers? (predict) ────────────────────────────────────────────────────────────
export function StallCompare({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const pulse = 0.5 + 0.5 * Math.sin(Math.PI * seg(t, 0.8, 1.4));
  const row = (y: number, names: [string, string, string]) =>
    names.map((n, i) => {
      const x = [40, 215, 390][i];
      const stalled = i === 2;
      return (
        <g key={n} opacity={fa(t, 0.1 + i * 0.1, 0.3)}>
          <Box x={x} y={y} w={120} h={32} name={n} grey={stalled} fs={15} />
          {stalled && <T x={x + 60} y={y + 50} s={13} a="middle" f={C.latte}>stalled</T>}
        </g>
      );
    });
  const ringX = [40, 166, 292, 418];
  return (
    <Stack>
    <Svg label="Stage three stalls: in the pull request, fill makes a new buffer for every message and its channel never pushes back, one thousand buffers, 62.5 MiB requested; in the ring only the owner makes buffers, three of them, and fill waits for one to come home" h={238} fill>
      <T x={40} y={18} s={13} f={C.taupe}>SHARED</T>
      <T x={394} y={18} s={13} a="end" f={C.taupe}>BUFFERS</T>
      <T x={520} y={20} s={20} a="end" f={ans ? C.cherryText : C.latte} serif w={700}>{ans ? '1,000' : '?'}</T>
      {row(32, ['fill', 'inspect', 'consume'])}
      <Chan a={[160, 48]} b={[215, 48]} head />
      <Chan a={[335, 48]} b={[390, 48]} head />
      <Own a={[100, 64]} b={[100, 82]} />
      <Hub x={40} y={84} w={210} h={30} fs={15} lit={!ans && pulse > 0.5} />
      <T x={262} y={104} s={13} f={C.taupe}>unbounded channels</T>
      <g style={rv(ans)}>
        <T x={520} y={126} s={15} a="end" f={C.cherryText} w={600}>62.5 MiB requested</T>
      </g>
      <line x1={40} y1={136} x2={520} y2={136} stroke={C.mocha} strokeWidth={1} />
      <T x={40} y={160} s={13} f={C.taupe}>RING</T>
      <T x={394} y={160} s={13} a="end" f={C.taupe}>BUFFERS</T>
      <T x={520} y={162} s={20} a="end" f={ans ? C.caramel : C.latte} serif w={700}>{ans ? '3' : '?'}</T>
      <g style={rv(ans)}>
        {[1, 2, 3].map((id, i) => <Chip key={id} cx={130 + i * 52} cy={155} id={id} stroke={C.caramel} />)}
      </g>
      {ringX.map((x, i) => {
        const n = ['owner', 'fill', 'inspect', 'consume'][i];
        return (
          <g key={n} opacity={fa(t, 0.3 + i * 0.1, 0.3)}>
            <Box x={x} y={176} w={96} h={32} name={n} grey={i === 3} fs={13} look={i === 0} />
            {i === 3 && <T x={x + 48} y={226} s={13} a="middle" f={C.latte}>stalled</T>}
          </g>
        );
      })}
      <g opacity={fa(t, 0.4)}>
        {[0, 1, 2].map((i) => <Chan key={i} a={[ringX[i] + 96, 192]} b={[ringX[i + 1], 192]} head />)}
      </g>
      <g style={rv(ans)}>
        <T x={214} y={226} s={13} a="middle" f={C.latte}>fill waits</T>
      </g>
    </Svg>
    </Stack>
  );
}

// ── 16 · The owner can count every buffer ───────────────────────────────────────────────────────────────────────
export function Ledger({ t, portrait }: StepCtx) {
  const g: RingG = { top: 36, dy: 118 };
  const v = 2;
  // Buffers 1 and 2 go round and come home (oldest first, as first-in, first-out says); buffer 3 is still out at inspect when
  // the step ends, so the bar finishes split: two in the pool, one out, three in all.
  const t0 = [1.0, 1.5, 2.0];
  const lap = [4, 4, 2];
  const chips = t0.map((a, k) => {
    const s = Math.min(lap[k], Math.max(0, (t - a) * v));
    const dock: Pt = [rBox(g, 0)[0] + DOCK[k], rBox(g, 0)[1] + CY];
    const out = lp(dock, ringAt(g, s), easeOut(seg(t, a, a + 0.3)));
    const homeAt = a + lap[k] / v;
    const p = lap[k] >= 4 ? lp(out, dock, seg(t, homeAt, homeAt + 0.3)) : out;
    const inPool = t < a + 0.15 || (lap[k] >= 4 && t >= homeAt + 0.15);
    return { k, p, inPool };
  });
  const inPool = chips.filter((c) => c.inPool).length;
  const out = 3 - inPool;
  const barW = 400;
  const seg1 = (barW * inPool) / 3;
  return (
    <Stack>
      {(!portrait || t < 1.2) && <Code title="Owner::home" t={t} end={1.0} lines={[`let oldest = self.out.pop_front();`, `assert_eq!(oldest, Some(buf.id));`, `let made = self.pool.next_id as usize;`, `let home = self.pool.free.len();`, `assert_eq!(home + self.out.len(), made);`]} />}
      <Svg label="One owner keeps one set of books: every channel is first in, first out, so the owner checks that the oldest buffer out is the next one home, and in the pool plus out in the ring always equals the three buffers made, at all one thousand checks" h={336} fill>
        <RingFrame g={g} o={fa(t, 0.6)} />
        <T x={280} y={g.top + BOXH + 28} s={13} a="middle" f={C.latte} o={fa(t, 1.0)}>oldest out, first home</T>
        {chips.map((c) => <Chip key={c.k} cx={c.p[0]} cy={c.p[1]} id={c.k + 1} stroke={C.caramel} />)}
        <g opacity={fa(t, 0.8)}>
          <rect x={40} y={244} width={barW} height={22} rx={7} fill={C.cocoa} />
          {inPool > 0 && <rect x={40} y={244} width={Math.max(0, seg1)} height={22} rx={7} fill={C.latte} />}
          {out > 0 && <rect x={40 + seg1} y={244} width={barW - seg1} height={22} rx={7} fill={C.caramel} />}
          <T x={40} y={290} s={13} f={C.latte}>{`${inPool} in pool`}</T>
          {out > 0 && <T x={40 + barW} y={290} s={13} a="end" f={C.caramel}>{`${out} out in the ring`}</T>}
          <T x={452} y={262} s={20} f={C.crema} serif w={700}>= 3</T>
        </g>
        <T x={40} y={326} s={15} f={C.latte} o={fa(t, 1.0)}>{`checks ${fmt(1000 * seg(t, 1.0, 5.5))}`}</T>
      </Svg>
    </Stack>
  );
}

// ── 17 · Pick the shape by the data ─────────────────────────────────────────────────────────────────────────────
// One glyph per shape, drawn on a 120 x 70 tile, and reused by the recap so a shape looks the same wherever it appears.
function Glyph({ k }: { k: number }) {
  const n = (cx: number, cy: number) => <rect x={cx - 11} y={cy - 7} width={22} height={14} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />;
  if (k === 0)
    return (
      <g>
        {n(60, 14)}{n(24, 56)}{n(60, 56)}{n(96, 56)}
        <Poly pts={[[60, 21], [24, 49]]} c={C.caramel} w={1.5} />
        <Poly pts={[[60, 21], [60, 49]]} c={C.caramel} w={1.5} />
        <Poly pts={[[60, 21], [96, 49]]} c={C.caramel} w={1.5} />
      </g>
    );
  if (k === 1)
    return (
      <g>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={10 + i * 26} y={38} width={22} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />)}
        <rect x={10} y={8} width={100} height={14} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
        <path d="M21 38 Q34 24 47 38" fill="none" stroke={C.latte} strokeWidth={1.2} />
      </g>
    );
  if (k === 2)
    return (
      <g>
        <rect x={20} y={12} width={24} height={14} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.2} />
        <rect x={78} y={12} width={24} height={14} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
        <rect x={78} y={44} width={24} height={14} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
        <rect x={20} y={44} width={24} height={14} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
        <Chan a={[44, 19]} b={[78, 19]} head />
        <Chan a={[90, 26]} b={[90, 44]} head />
        <Chan a={[78, 51]} b={[44, 51]} head />
        <Chan a={[32, 44]} b={[32, 26]} head />
      </g>
    );
  return (
    <g>
      <rect x={40} y={22} width={40} height={30} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
      <g stroke={C.latte} strokeWidth={1.2} fill={C.espresso}>
        <rect x={54} y={40} width={12} height={9} rx={2} />
        <path d="M57 40 v-3 a3 3 0 0 1 6 0 v3" fill="none" />
      </g>
      {[10, 35, 60].map((cy) => <Poly key={'l' + cy} pts={[[12, cy], [40, 37]]} c={C.latte} w={1.2} />)}
      {[10, 35, 60].map((cy) => <Poly key={'r' + cy} pts={[[108, cy], [80, 37]]} c={C.latte} w={1.2} />)}
    </g>
  );
}
function Thumb({ k, x, y, o = 1 }: { k: number; x: number; y: number; o?: number }) {
  return (
    <g opacity={o} transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={120} height={70} rx={8} fill="none" stroke={C.mocha} strokeWidth={1} />
      <Glyph k={k} />
    </g>
  );
}
const SHAPES = [
  { n: 'Tree', when: 'when: data has a natural parent', cost: 'cost: callers wait their turn', c: C.crema, cc: C.latte },
  { n: 'Arena', when: 'when: graph, cycles, removal', cost: 'cost: a check per lookup', c: C.crema, cc: C.latte },
  { n: 'Owner thread', when: 'when: many users at once', cost: 'cost: a channel hop per request', c: C.crema, cc: C.latte },
  { n: 'Arc<Mutex<T>>', when: 'when: small, short, truly shared', cost: 'cost: a lock per access', c: C.latte, cc: C.cherryText },
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
            <T x={180} y={y + 63} s={13} f={s.cc}>{s.cost}</T>
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
    <Svg label="Arc<Mutex<T>> is not wrong: read-only data shared by eight threads needs only an Arc and no lock, and small data touched in short critical sections is fine behind a mutex, with the state moved into an owner task once the work needs I/O; the anti-pattern is the reflex, not the type" h={340}>
      <g opacity={fa(t, 0.3)}>
        <T x={40} y={40} s={13} f={C.latte}>8 threads</T>
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <circle cx={50} cy={60 + i * 18} r={5} fill={C.latte} />
            <Poly pts={[[56, 60 + i * 18], [110, 128]]} c={C.latte} w={1} />
          </g>
        ))}
        <rect x={110} y={108} width={160} height={40} rx={8} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
        <T x={190} y={133} s={15} a="middle" f={C.crema} w={600}>Arc&lt;Config&gt;</T>
        <T x={40} y={224} s={13} f={C.latte}>read-only: no lock</T>
      </g>
      <g opacity={fa(t, 1.4)}>
        <Hub x={310} y={100} w={210} h={44} label="Arc<Mutex<Counts>>" fs={13} lit={lit} />
        <line x1={310} y1={186} x2={520} y2={186} stroke={C.mocha} strokeWidth={1.5} />
        <T x={310} y={224} s={13} f={C.latte}>lock held briefly</T>
      </g>
      {ticks.map((a, i) => (
        <rect key={a} x={330 + i * 62} y={176} width={4} height={20} fill={C.caramel} opacity={fa(t, a, 0.15)} />
      ))}
      <g opacity={fa(t, 3.4, 0.5)}>
        <Own a={[415, 236]} b={[415, 262]} k={seg(t, 3.4, 3.9)} />
        <rect x={310} y={264} width={210} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={415} y={289} s={15} a="middle" f={C.crema} w={600}>owner task</T>
      </g>
      <T x={40} y={330} s={13} f={C.latte} o={fa(t, 4.2, 0.7)}>the anti-pattern is the reflex, not the type</T>
    </Svg>
  );
}

// ── 19 · Prove it · 1 of 3 ──────────────────────────────────────────────────────────────────────────────────────
const VIEW_LINES = [`let mut buf = pool.get();`, `fill(&mut buf, &[1, 0, 1, 0, 0, 7]);`, `let view = &buf.bytes[..5];`, `tx.send(buf).unwrap();`, `println!("{view:?}");`];
export function ProveView({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const codeInDrawing = portrait && ans; // a phone has room for the code or the drawing, so the answer draws its three key lines itself
  const pulse = 0.55 + 0.45 * Math.sin(Math.PI * seg(t, 1.0, 1.2));
  const o = codeInDrawing ? 62 : 0;
  return (
    <Stack>
      {!codeInDrawing && <Code title="stage.rs" t={t} end={0.9} highlight={ans ? [2, 3, 4] : [2, 4]} lines={VIEW_LINES} />}
      {!(portrait && !ans) && <Svg label="Sending a buffer while a borrowed view of it is still used later is E0505, move out while borrowed; the fix that clones nothing is to take the header as a value first with inspect, then send" h={codeInDrawing ? 214 : 176} fill>
        {codeInDrawing && (
          <g>
            <T x={40} y={20} s={15} f={C.caramel}>{VIEW_LINES[2]}</T>
            <T x={40} y={42} s={15} f={C.cherryText}>{VIEW_LINES[3]}</T>
            <T x={40} y={64} s={15} f={C.caramel}>{VIEW_LINES[4]}</T>
          </g>
        )}
        <g opacity={fa(t, 0.6)}>
          <rect x={40} y={20 + o} width={140} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={52} y={48 + o} s={15} f={C.crema} w={600}>buf</T>
          <rect x={230} y={27 + o} width={90} height={30} rx={7} fill="none" stroke={C.latte} strokeWidth={1.2} />
          <T x={275} y={47 + o} s={13} a="middle" f={C.latte}>view</T>
          <Poly pts={[[230, 42 + o], [182, 42 + o]]} c={ans ? C.cherry : C.latte} w={2} dash="6 5" dot />
          <Chan a={[340, 42 + o]} b={[500, 42 + o]} head />
          <T x={420} y={26 + o} s={13} a="middle" f={C.taupe}>channel</T>
        </g>
        <g style={rv(ans)}>
          <T x={230} y={96 + o} s={15} f={C.cherryText} w={600}>E0505</T>
          <rect x={40} y={86 + o} width={80} height={24} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
          <T x={80} y={103 + o} s={13} a="middle" f={C.latte}>Header</T>
          <T x={40} y={144 + o} s={15} f={C.caramel} w={600}>let h = inspect(&amp;buf);</T>
        </g>
        <g style={{ opacity: ans ? 0 : 1 }}>
          <T x={40} y={110} s={13} f={C.latte} o={0.55 + 0.45 * pulse}>send moves buf; view is used after</T>
        </g>
      </Svg>}
    </Stack>
  );
}

// ── 20 · Prove it · 2 of 3 ──────────────────────────────────────────────────────────────────────────────────────
const BLOCK_LINES = [`for msg in rx {`, `  match msg {`, `    Msg::Data(mut buf) => {`, `      let s = &src[seen.len()];`, `      fill(&mut buf, s);`, `      seen.push(buf.id);`, `      tx.send(Msg::Data(buf)).unwrap();`];
export function ProveBlock({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  // a phone gets a four-line excerpt: the receive that blocks, then the work and the send that follow it. The question shows it as
  // code; the answer draws the same four lines with the blocking one marked (the code panel and the drawing do not both fit).
  const excerpt = [BLOCK_LINES[0], BLOCK_LINES[3], BLOCK_LINES[4], BLOCK_LINES[6]];
  const pt = portrait && ans;
  const chips = (y: number) => (
    <g opacity={fa(t, 0.6)}>
      {[1, 2, 3].map((id, i) => <Chip key={id} cx={62 + i * 52} cy={y} id={id} stroke={C.caramel} />)}
      <T x={230} y={y + 5} s={15} f={C.crema}>BUFFERS 3, all past fill</T>
    </g>
  );
  return (
    <Stack>
      {!pt && <Code title={portrait ? undefined : 'fill_stage, stage 3 stalled'} t={t} end={0.8} highlight={ans ? [0] : []} lines={portrait ? excerpt : BLOCK_LINES} />}
      {!(portrait && !ans) && (
        <Svg label="With stage three stalled, stage one blocks at the receive in its loop: it can only work on a buffer someone sends it, and only the owner sends buffers, three in all; its sends never block because the channel is unbounded" h={pt ? 150 : 110} fill>
          {pt ? (
            <g>
              {excerpt.map((l, i) => (
                <T key={i} x={40} y={22 + i * 22} s={15} f={i === 0 ? C.caramel : C.crema} w={i === 0 ? 700 : 500}>{l.trim()}</T>
              ))}
              <T x={250} y={22} s={13} f={C.caramel}>← blocks here</T>
              {chips(126)}
            </g>
          ) : (
            <g>
              <g style={rv(ans)}>
                <T x={40} y={28} s={15} f={C.caramel} w={600}>fill blocks at line 1: no buffer comes home</T>
              </g>
              {chips(72)}
            </g>
          )}
        </Svg>
      )}
    </Stack>
  );
}

// ── 21 · Prove it · 3 of 3 ──────────────────────────────────────────────────────────────────────────────────────
export function ProveArena({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const dag = { j1: [40, 52], j2: [40, 132], j3: [255, 92], j4: [470, 52], j5: [470, 132] } as Record<string, number[]>;
  const BW = 90;
  const BH = 34;
  // dependency edges run border to border, with an arrowhead at the job that depends on the other
  const edges: [string, string][] = [['j1', 'j3'], ['j2', 'j3'], ['j3', 'j4'], ['j3', 'j5']];
  const side = (k: string, right: boolean): Pt => [dag[k][0] + (right ? BW : 0), dag[k][1] + BH / 2];
  const slotX = [40, 144, 248, 352, 456];
  const names = ['j1', 'j2', 'j3', 'j4', 'j5'];
  return (
    <Stack>
      <Svg label="A job scheduler: jobs form a graph and finished jobs are removed while others still refer to them, so one arena owns every job and handles are the edges; asking for the finished job returns None, not a reused slot" h={226} fill>
        <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
          <T x={40} y={22} s={13} f={C.taupe}>one thread · jobs depend on jobs · done jobs removed</T>
          {edges.map(([a, b]) => <Poly key={a + b} pts={[side(a, true), side(b, false)]} c={C.latte} w={1.5} head o={fa(t, 0.4, 0.3)} />)}
          {Object.keys(dag).map((k, i) => (
            <g key={k} opacity={fa(t, 0.1 + i * 0.1, 0.3) * (k === 'j3' ? 0.5 : 1)}>
              <rect x={dag[k][0]} y={dag[k][1]} width={BW} height={BH} rx={7} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
              <T x={dag[k][0] + 12} y={dag[k][1] + 22} s={15} f={C.crema} w={600}>{k}</T>
            </g>
          ))}
          <T x={dag.j3[0] + BW / 2} y={dag.j3[1] + BH + 20} s={13} a="middle" f={C.latte} o={fa(t, 0.5, 0.3)}>done</T>
        </g>
        <g style={rv(ans)}>
          <T x={40} y={22} s={15} f={C.caramel} w={600}>Arena&lt;Job&gt; + Handle</T>
          {names.map((n, i) => (
            <g key={n}>
              <rect x={slotX[i]} y={148} width={96} height={64} rx={8} fill={n === 'j3' ? 'none' : C.cocoa} stroke={n === 'j3' ? C.latte : C.mocha} strokeWidth={1.5} strokeDasharray={n === 'j3' ? '5 4' : undefined} />
              <T x={slotX[i] + 8} y={166} s={13} f={C.taupe}>{String(i)}</T>
              <T x={slotX[i] + 8} y={188} s={15} f={C.crema} w={600}>{n}</T>
              <T x={slotX[i] + 8} y={206} s={13} f={C.latte}>{n === 'j3' ? 'gen 1' : 'gen 0'}</T>
            </g>
          ))}
          <Poly pts={[[400, 148], [400, 124], [312, 124], [312, 146]]} c={C.cherry} w={1.8} head />
          <Poly pts={[[504, 148], [504, 90], [280, 90], [280, 146]]} c={C.cherry} w={1.8} head />
          <T x={356} y={116} s={15} a="middle" f={C.cherryText} w={600}>None</T>
          <T x={392} y={82} s={15} a="middle" f={C.cherryText} w={600}>None</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 22 · In one breath ──────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  // The anti-pattern is quiet (latte, with a cherry cross); the three shapes that replace it are crema with their own glyph.
  const rows: { k: number; l1: string; l2: string; bad?: boolean }[] = [
    { k: 3, l1: 'Arc<Mutex<T>>: many owners, a lock', l2: 'the reflex hides who should own it', bad: true },
    { k: 0, l1: 'Tree: one owner lends down', l2: 'results come back up' },
    { k: 1, l1: 'Arena: one owner, handles as edges', l2: 'the generation catches stale ones' },
    { k: 2, l1: 'Owner thread: send owned values', l2: 'one owner per buffer, every instant' },
  ];
  return (
    <Svg label="Four shapes for one pipeline: Arc<Mutex<T>> has many owners and a lock and hides who should own the data; a tree has one owner that lends down; an arena has one owner with handles as edges; an owner thread is sent owned values. Next: the rule behind every loan, many shared borrows or one exclusive borrow, never both" h={420}>
      {rows.map((r, i) => (
        <g key={i} opacity={fa(t, 0.2 + i * 0.5, 0.4)} transform={`translate(0 ${36 + i * 78})`}>
          <g transform="translate(40 0) scale(0.8)">
            <g opacity={r.bad ? 0.7 : 1}>
              <Glyph k={r.k} />
            </g>
          </g>
          {r.bad && (
            <g stroke={C.cherryText} strokeWidth={2.5} strokeLinecap="round">
              <line x1={58} y1={8} x2={104} y2={48} />
              <line x1={104} y1={8} x2={58} y2={48} />
            </g>
          )}
          <T x={156} y={20} s={15} f={r.bad ? C.latte : C.crema}>{r.l1}</T>
          <T x={156} y={44} s={13} f={C.latte}>{r.l2}</T>
        </g>
      ))}
      <g opacity={fa(t, 2.2, 0.5)}>
        <T x={40} y={368} s={15} f={C.caramel}>Next: many &amp;T or one &amp;mut T</T>
        <T x={40} y={392} s={13} f={C.latte}>fill(&amp;mut Buf) · inspect(&amp;Buf)</T>
      </g>
    </Svg>
  );
}
