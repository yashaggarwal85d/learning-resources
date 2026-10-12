import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, fmt, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Bar, C, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: the hollowed struct. A struct is a row of field cells inside a frame. Moving a field out leaves a
// dashed hole; at the closing brace only filled cells get drop badges. A type with Drop has a sealed frame that refuses
// extraction (cherry, E0509) until `take` swaps a None into the cell and the Buf slides out to the pool. A pattern is a
// set of edges from new bindings to cells: a solid caramel arrow is a move (the cell becomes a hole), a ghost copy is a
// copy (the cell stays), a dashed edge with an open dot is a borrow (the cell stays).
// Every snippet shown here is an exact line of examples/*.rs (examples.py checks it) and every number is asserted there.

/** Opacity ramp: 0 before `a`, 1 after `a + d`. */
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
/** CSS-driven reveal for predict steps (the clock stops at `duration`, so the reveal is a still frame). Short on purpose. */
const rv = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transition: 'opacity .15s', transitionDelay: on ? `${Math.min(delay, 0.1)}s` : '0s' });
/** Code in SVG text: leading spaces become no-break spaces, which SVG keeps. */
const nb = (s: string) => s.replace(/^ +/, (m) => ' '.repeat(m.length));
/** Where the timeline sits in a drawing of height h. */
const TLY = (h: number) => h - 46;
/** How far a refused cell's contents slide toward the exit (0..18..0) at time t, for a refusal starting at `a`. */
const refuse = (t: number, a: number) => 18 * easeOut(seg(t, a, a + 0.25)) * (1 - easeOutBack(seg(t, a + 0.25, a + 0.55)));
/** The cherry tint that stays after a refusal. */
const tint = (t: number, a: number) => 0.25 * easeOut(seg(t, a + 0.25, a + 0.55));

// ── shared glyphs: the hollowed struct ──────────────────────────────────────────────────────────────────────────────

type CellState = 'full' | 'moved' | 'dropped';

/** A field cell: name, type, and a state. `dx`/`dy` slide the contents (a refusal or a crossing); `bad` tints it cherry. */
function Cell({ x, y, w = 150, h = 56, name, type, state = 'full', look = false, bad = 0, o = 1, dx = 0, dy = 0, children }: { x: number; y: number; w?: number; h?: number; name: string; type?: string; state?: CellState; look?: boolean; bad?: number; o?: number; dx?: number; dy?: number; children?: ReactNode }) {
  const full = state === 'full';
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={bad > 0 ? C.cherry : full ? C.cocoa : 'none'} fillOpacity={bad > 0 ? bad : 1} stroke={full ? (look ? C.caramel : C.mocha) : C.taupe} strokeWidth={full && look ? 2.5 : 1.5} strokeDasharray={full ? undefined : '6 5'} />
      <g transform={`translate(${dx} ${dy})`}>
        <T x={x + 10} y={y + 22} s={15} f={full ? C.crema : C.latte} w={600}>{name}</T>
        {full && type && <T x={x + 10} y={y + 42} s={13} f={C.latte}>{type}</T>}
        {full && children}
      </g>
      {!full && <T x={x + 10} y={y + 42} s={13} f={C.latte}>{state === 'moved' ? 'moved' : 'dropped'}</T>}
    </g>
  );
}

/** The frame of a struct value: title top-left, optional Seal (a type that implements Drop). Cells sit 32 units under its top. */
function Frame({ x, y, w, h = 100, title, seal = false, pill = true, bad = 0, look = false, o = 1, lines = [], sealO = 1 }: { pill?: boolean; x: number; y: number; w: number; h?: number; title?: string; seal?: boolean; bad?: number; look?: boolean; o?: number; lines?: { cx: number; c?: string; o?: number }[]; sealO?: number }) {
  const pillW = 110;
  const pillX = x + w - pillW - 8;
  return (
    <g opacity={o}>
      {bad > 0 && <rect x={x} y={y} width={w} height={h} rx={10} fill={C.cherry} fillOpacity={bad} />}
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={look ? C.caramel : C.mocha} strokeWidth={look ? 2.5 : 1.5} />
      {title && <T x={x + 14} y={y + 20} s={15} f={C.crema} w={600}>{title}</T>}
      {seal && (
        <g opacity={sealO}>
          <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} rx={14} fill="none" stroke={C.latte} strokeWidth={1.5} />
          {lines.map((l, i) => {
            const px = Math.min(pillX + pillW - 10, Math.max(pillX + 10, l.cx));
            return <line key={i} x1={px} y1={y + 11} x2={l.cx} y2={y + 32} stroke={l.c ?? C.taupe} strokeWidth={1} strokeDasharray="3 4" opacity={l.o ?? 1} />;
          })}
          {pill && <rect x={pillX} y={y - 11} width={pillW} height={22} rx={11} fill={C.roast} stroke={C.mocha} strokeWidth={1.5} />}
          {pill && <T x={pillX + pillW / 2} y={y + 4} s={13} a="middle" f={C.latte}>impl Drop</T>}
        </g>
      )}
    </g>
  );
}

/** A new owner: a binding name and type in a rounded slot; `ghost` draws the empty placeholder before it is filled. */
function Slot({ x, y, name, type, w = 170, h = 38, ghost = false, look = false, o = 1, k = 1 }: { x: number; y: number; name: string; type?: string; w?: number; h?: number; ghost?: boolean; look?: boolean; o?: number; k?: number }) {
  if (k <= 0.001 || o <= 0.001) return null;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g opacity={o} transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={ghost ? 'none' : C.cocoa} stroke={ghost ? C.taupe : look ? C.caramel : C.mocha} strokeWidth={look && !ghost ? 2.5 : 1.5} strokeDasharray={ghost ? '6 5' : undefined} />
      <T x={x + 12} y={y + h / 2 + 5} s={15} f={ghost ? C.latte : C.crema} w={600}>{name}</T>
      {type && <T x={x + w - 12} y={y + h / 2 + 5} s={13} a="end" f={C.latte}>{type}</T>}
    </g>
  );
}

/** Exactly one owner edge per payload: solid caramel with an arrowhead. */
function Owner({ x1, y1, x2, y2, o = 1, c = C.caramel }: { x1: number; y1: number; x2: number; y2: number; o?: number; c?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (r: number) => `${x2 - 9 * Math.cos(a - r)},${y2 - 9 * Math.sin(a - r)}`;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2 - 6 * Math.cos(a)} y2={y2 - 6 * Math.sin(a)} stroke={c} strokeWidth={2} />
      <polygon points={`${x2},${y2} ${p(0.45)} ${p(-0.45)}`} fill={c} />
    </g>
  );
}

/** A borrow edge: dashed, ending in an open dot (never an arrowhead). Shared is latte, exclusive is cinnamon. */
function Borrow({ x1, y1, x2, y2, o = 1, c = C.latte }: { x1: number; y1: number; x2: number; y2: number; o?: number; c?: string }) {
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={2} strokeDasharray="6 5" />
      <circle cx={x2} cy={y2} r={4} fill="none" stroke={c} strokeWidth={1.5} />
    </g>
  );
}

/** A heap payload: a latte bar (the 64 KiB buffer) with its size label above its left end. `freed` leaves a dashed outline. */
function Heap({ x, y, w = 286, h = 16, label = '64 KiB', freed = false, k = 1, o = 1 }: { x: number; y: number; w?: number; h?: number; label?: string | null; freed?: boolean; k?: number; o?: number }) {
  return (
    <g opacity={o}>
      {label && <T x={x} y={y - 6} s={13} f={C.latte}>{label}</T>}
      {freed ? (
        <g>
          <rect x={x} y={y} width={w} height={h} rx={7} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={x + w / 2} y={y + h - 3} s={13} a="middle" f={C.latte}>freed</T>
        </g>
      ) : (
        <Bar x={x} y={y} w={w * k} full={w * k} h={h} fill={C.latte} />
      )}
    </g>
  );
}

/** The pool: a labelled tray holding up to four free buffers as small bars; `free N` under its right end where the count matters. */
function PoolTray({ x, y, w = 190, bars = 0, free, o = 1, ring = false, label = true, dashed = false }: { x: number; y: number; w?: number; bars?: number; free?: string; o?: number; ring?: boolean; label?: boolean; dashed?: boolean }) {
  return (
    <g opacity={o}>
      {label && <T x={x} y={y - 8} s={13} f={C.taupe}>POOL</T>}
      <rect x={x} y={y} width={w} height={46} rx={8} fill="none" stroke={ring ? C.caramel : C.mocha} strokeWidth={ring ? 2.5 : 1.5} />
      {Array.from({ length: Math.min(4, bars) }, (_, i) => (
        <rect key={i} x={x + 12 + i * 42} y={y + 17} width={34} height={12} rx={4} fill={dashed ? 'none' : C.latte} stroke={dashed ? C.taupe : 'none'} strokeDasharray={dashed ? '4 3' : undefined} />
      ))}
      {free && <T x={x + w} y={y + 64} s={13} a="end" f={C.latte}>{free}</T>}
    </g>
  );
}

/** Tokens: things that move in and out of cells. */
function Token({ x, y, kind = 'buf', w = 120, h = 30, o = 1, label }: { x: number; y: number; kind?: 'buf' | 'none' | 'empty'; w?: number; h?: number; o?: number; label?: string }) {
  const text = label ?? (kind === 'buf' ? 'Buf' : kind === 'none' ? 'None' : 'Buf · cap 0');
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={kind === 'buf' ? C.cocoa : 'none'} stroke={kind === 'buf' ? C.caramel : C.taupe} strokeWidth={kind === 'buf' ? 2 : 1.5} strokeDasharray={kind === 'buf' ? undefined : '5 4'} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={kind === 'buf' ? 15 : 13} a="middle" f={kind === 'buf' ? C.crema : C.latte}>{text}</T>
    </g>
  );
}

/** A pill: the default binding mode of a pattern, or any short tag. */
function Chip({ x, y, text, w, o = 1, f = C.latte, stroke = C.mocha }: { x: number; y: number; text: string; w?: number; o?: number; f?: string; stroke?: string }) {
  const width = w ?? text.length * 8.2 + 22;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={width} height={24} rx={12} fill="none" stroke={stroke} strokeWidth={1.5} />
      <T x={x + width / 2} y={y + 17} s={13} a="middle" f={f}>{text}</T>
    </g>
  );
}

/** The allocation counter: the step's one serif number. */
function Counter({ x = 556, y = 28, label = 'ALLOCS', v, text, t, a, d = 0.6, bad = false }: { x?: number; y?: number; label?: string; v?: number; text?: string; t: number; a: number; d?: number; bad?: boolean }) {
  const shown = text ?? fmt((v ?? 0) * easeOut(seg(t, a, a + d)));
  return (
    <g opacity={fa(t, a - 0.2, 0.2)}>
      <T x={x} y={y} s={13} a="end" f={C.taupe}>{label}</T>
      <T x={x} y={y + 26} s={20} a="end" f={bad ? C.cherryText : C.crema} serif w={700}>{shown}</T>
    </g>
  );
}

/** A numbered badge on the drop timeline; its name sits 30 units below. */
function Badge({ x, y, n, name, t = 99, a = 0, hi = false }: { x: number; y: number; n: number; name?: string; t?: number; a?: number; hi?: boolean }) {
  const k = t >= 90 ? 1 : easeOutBack(seg(t, a, a + 0.35));
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
      <circle cx={x} cy={y} r={12} fill={C.mocha} stroke={hi ? C.caramel : C.crema} strokeWidth={hi ? 2.5 : 1.5} />
      <T x={x} y={y + 5} s={14} a="middle" f={C.crema} w={600}>{String(n)}</T>
      {name && <T x={x} y={y + 32} s={13} a="middle" f={C.latte}>{name}</T>}
    </g>
  );
}

function Timeline({ h, o = 1 }: { h: number; o?: number }) {
  const y = TLY(h);
  return (
    <g opacity={o}>
      <line x1={40} y1={y} x2={540} y2={y} stroke={C.taupe} strokeWidth={1.5} />
      <T x={40} y={y - 14} s={13} f={C.taupe}>DROP ORDER</T>
    </g>
  );
}

/** Code as SVG text (the predict steps draw their code inside the picture). */
function CodeLines({ x, y, lines, s = 15, step = 26, f = C.crema, o = 1 }: { x: number; y: number; lines: string[]; s?: number; step?: number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      {lines.map((l, i) => (
        <T key={i} x={x} y={y + i * step} s={s} f={f}>{nb(l)}</T>
      ))}
    </g>
  );
}

/** A rejected line keeps its text; its error code sits beside it in cherry text (never struck through). */
const Err = ({ x, y, code, o = 1, s = 15 }: { x: number; y: number; code: string; o?: number; s?: number }) => (
  <T x={x} y={y} s={s} f={C.cherryText} w={600} o={o}>{code}</T>
);

// ── 1 · The guard that will not give the buffer back ─────────────────────────────────────────────────────────────────
const GUARD_LINES = [`struct NaiveGuard<'p> { buf: Buf,`, `    pool: &'p mut Pool }`, `impl Drop for NaiveGuard<'_> {`, `    fn drop(&mut self) {`, `        self.pool.put(self.buf);`, `    }`, `}`];

export function Problem({ t, portrait }: StepCtx) {
  const H = 304;
  const sh = refuse(t, 2.2);
  const bad = tint(t, 2.2);
  const grow = easeOut(seg(t, 3.3, 4.3));
  const slide = easeInOutLocal(seg(t, 4.3, 4.7));
  const cloneW = lerp(286 * grow, 34, slide);
  const cx = lerp(44, 378, slide);
  const cy = lerp(190, 231, slide);
  const cloneH = lerp(16, 12, slide);
  const freed = t >= 4.9;
  const origK = 1 - easeOut(seg(t, 4.5, 4.9));
  return (
    <Stack>
      {(!portrait || t < 1.6) && <Code title="guard.rs" t={t} end={1.4} lines={GUARD_LINES} highlight={t > 1.4 ? [4] : []} />}
      <Svg label="The guard cannot move its buffer out inside drop (E0507); rustc suggests a clone, which compiles but costs 1,001 allocations for 1,000 messages instead of one" h={H} fill>
        <g opacity={fa(t, 1.6)}>
          <Frame x={30} y={16} w={320} title="guard: NaiveGuard" seal bad={bad} lines={[{ cx: 114 }, { cx: 266 }]} />
          <Cell x={44} y={48} w={140} name="buf" type="Buf" dx={sh * 0.5} dy={sh * 0.5} />
          <Cell x={196} y={48} w={140} name="pool" type="&mut Pool" />
          <Owner x1={114} y1={104} x2={114} y2={150} o={origK} />
          <Borrow x1={266} y1={104} x2={440} y2={214} c={C.cinnamon} />
          <PoolTray x={366} y={214} w={190} bars={t >= 4.7 ? 1 : 0} />
        </g>
        {!freed && <Heap x={44} y={150} k={Math.max(0.02, origK)} o={fa(t, 1.6)} />}
        {freed && <Heap x={44} y={150} freed label="64 KiB" />}
        <Err x={366} y={76} code="E0507" o={fa(t, 2.75, 0.3)} />
        <T x={366} y={98} s={13} f={C.latte} o={fa(t, 2.75, 0.3)}>behind &mut self</T>
        <g opacity={fa(t, 3.1, 0.3)}>
          <rect x={366} y={114} width={92} height={24} rx={12} fill="none" stroke={C.caramel} strokeWidth={1.5} />
          <T x={412} y={131} s={13} a="middle" f={C.caramel}>.clone()</T>
        </g>
        {t >= 3.3 && t < 4.7 && <T x={44} y={184} s={13} f={C.latte}>clone</T>}
        {t >= 3.3 && (
          <Bar x={cx} y={cy} w={Math.max(cloneW, 3)} full={Math.max(cloneW, 3)} h={cloneH} fill={C.latte} o={t >= 4.7 ? 0 : 1} />
        )}
        <Counter t={t} a={1.6} text={fmt(1 + 1000 * easeOut(seg(t, 3.3, 5.0)))} />
        <T x={40} y={264} s={15} f={C.crema} o={fa(t, 5.0, 0.4)}>1,000 messages: 1,001 allocations</T>
        <T x={40} y={284} s={13} f={C.caramel} o={fa(t, 5.1, 0.4)}>goal: 1</T>
      </Svg>
    </Stack>
  );
}
const easeInOutLocal = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// ── 2 · One pool, one allocation ─────────────────────────────────────────────────────────────────────────────────────
const LOOP_LINES = [`let mut buf = pool.get();`, `fill(&mut buf, &msg);`, `let h = inspect(&buf);`, `let buf = consume(buf);`, `pool.put(buf);`];
const NODES = [
  { n: 'fill', c: '&mut Buf', x: 40 },
  { n: 'inspect', c: '&Buf', x: 170 },
  { n: 'consume', c: 'Buf → Buf', x: 300 },
  { n: 'put', c: 'Buf', x: 430 },
];

export function Pipeline({ t }: StepCtx) {
  const H = 284;
  // the token's lap: pool, then under each stage, then the pool again (0.4 s per hop from 1.6 s)
  const way = [[100, 232], ...NODES.map((n) => [n.x + 55, 144]), [100, 232]];
  const hop = Math.min(5, Math.max(0, (t - 1.6) / 0.4));
  const i = Math.min(4, Math.floor(hop));
  const f = easeOut(hop - i);
  const px = t < 1.6 ? 100 : t >= 3.6 ? 100 : lerp(way[i][0], way[i + 1][0], f);
  const py = t < 1.6 ? 232 : t >= 3.6 ? 232 : lerp(way[i][1], way[i + 1][1], f);
  const away = t >= 1.6 && t < 3.6;
  const lit = (k: number) => fa(t, 1.6 + 0.4 * (k + 1) - 0.1, 0.2);
  const pulse = (k: number) => (t < 3.6 ? 1 : 1 - 0.35 * Math.sin(Math.PI * seg(t, 3.6 + k * 0.25, 3.6 + k * 0.25 + 0.25)));
  return (
    <Stack>
      <Code title="stage.rs" t={t} end={1.0} lines={LOOP_LINES} />
      <Svg label="The chapter's pipeline: one buffer leaves the pool, is filled with an exclusive borrow, inspected with a shared borrow, consumed and handed back by value, and put back in the pool. A thousand messages cost one allocation." h={H} fill>
        {NODES.map((n, k) => (
          <g key={n.n} opacity={fa(t, 1.2) * pulse(k)}>
            <rect x={n.x} y={64} width={110} height={52} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
            <T x={n.x + 55} y={86} s={15} a="middle" f={C.crema} w={600}>{n.n}</T>
            <T x={n.x + 55} y={106} s={13} a="middle" f={C.latte}>{n.c}</T>
          </g>
        ))}
        {/* each stage's edge lights as the token arrives: loans are dashed, handovers are solid */}
        <Borrow x1={95} y1={133} x2={95} y2={116} c={C.cinnamon} o={lit(0)} />
        <Borrow x1={225} y1={133} x2={225} y2={116} c={C.latte} o={lit(1)} />
        <Owner x1={355} y1={133} x2={355} y2={118} o={lit(2)} />
        <Owner x1={485} y1={133} x2={485} y2={118} o={lit(3)} />
        <PoolTray x={40} y={216} w={190} bars={away ? 0 : 1} o={fa(t, 1.2)} />
        {t >= 1.2 && <Token x={px - 35} y={py - 11} w={70} h={22} kind="buf" label="Buf" o={away ? 1 : 0} />}
        <g opacity={fa(t, 2.4, 0.3)}>
          <T x={170} y={192} s={13} f={C.latte}>Header {'{ kind: 7, len: 256 }'}</T>
        </g>
        <Counter t={t} a={1.2} text="1" />
        <T x={512} y={54} s={13} a="end" f={C.latte} o={fa(t, 3.6, 0.2)}>{`msgs ${fmt(1000 * easeOut(seg(t, 3.6, 4.6)))}`}</T>
        <T x={260} y={252} s={13} f={C.latte} o={fa(t, 4.6, 0.5)}>Buf handle: 32 bytes · Header: 8</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · Move one field out ───────────────────────────────────────────────────────────────────────────────────────────
const FRAME_LINES = [`let payload = frame.payload; // move`, `let h = frame.header;        // copy`, `send(frame);                 // E0382`];

export function MoveOne({ t }: StepCtx) {
  const H = 300;
  const mv = easeOutBack(seg(t, 1.8, 2.4));
  const tokX = lerp(235, 245, mv);
  const tokY = lerp(58, 200, mv);
  const cp = easeOut(seg(t, 2.8, 3.3));
  const nudge = refuse(t, 3.6) * (2 / 3);
  const bad = tint(t, 3.6);
  const moved = t >= 2.4;
  return (
    <Stack>
      <Code title="frame.rs" t={t} end={1.0} lines={FRAME_LINES} highlight={t >= 3.6 ? [2] : t >= 2.8 ? [1] : t >= 1.8 ? [0] : []} />
      <Svg label="Moving frame.payload out leaves a hole in frame and gives the buffer a new owner; the Copy header is copied, so frame is still partly usable; using frame as a whole is E0382, partially moved" h={H} fill>
        <g transform={`translate(${nudge} 0)`} opacity={fa(t, 1.2)}>
          <Frame x={40} y={16} w={350} h={96} title="frame: Frame" bad={bad} />
          <Cell x={56} y={46} name="header" type="Header" />
          <Cell x={220} y={46} name="payload" type="Buf" state={moved ? 'moved' : 'full'} />
        </g>
        <Heap x={220} y={150} w={320} o={fa(t, 1.2)} />
        {!moved && <Owner x1={295} y1={102} x2={295} y2={150} o={fa(t, 1.2)} />}
        {moved && <Owner x1={305} y1={200} x2={305} y2={166} o={fa(t, 2.2, 0.3)} />}
        <Slot x={40} y={200} name="h" type="Header" ghost={t < 2.8} o={t < 2.8 ? 0 : cp} />
        <Slot x={220} y={200} name="payload" type="Buf" ghost={!moved} o={fa(t, 1.8, 0.3)} />
        {t >= 1.8 && t < 2.4 + 0.2 && <Token x={tokX} y={tokY} w={120} h={30} kind="buf" o={1 - seg(t, 2.4, 2.6)} />}
        {t >= 2.8 && t < 3.3 && <Cell x={56} y={lerp(46, 200, easeOut(seg(t, 2.8, 3.3)))} name="header" type="Header" o={0.6 * (1 - seg(t, 3.2, 3.3))} />}
        <T x={48} y={254} s={13} f={C.latte} o={fa(t, 3.0, 0.3)}>copy</T>
        <T x={228} y={254} s={13} f={C.latte} o={fa(t, 2.2, 0.3)}>move</T>
        <g opacity={fa(t, 3.4, 0.3)}>
          <rect x={410} y={200} width={146} height={60} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={424} y={226} s={13} f={C.taupe}>send</T>
        </g>
        <Err x={410} y={60} code="E0382" o={fa(t, 4.0, 0.3)} />
        <T x={410} y={82} s={13} f={C.latte} o={fa(t, 4.0, 0.3)}>partially moved</T>
      </Svg>
    </Stack>
  );
}

// ── 4 · What does the closing brace drop? (predict) ─────────────────────────────────────────────────────────────────
export function BraceDrops({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 240 : 384;
  const y = TLY(H);
  const fy = pt ? 14 : 20;
  const slide = easeOutBack(seg(t, 1.0, 1.4));
  return (
    <Svg label="One field of three trace probes is moved out. At the closing brace the moved field dies first, with its new owner; then the struct drops head and tail in order; the hole drops nothing." h={H}>
      <g opacity={fa(t, 0, 0.5)}>
        <Frame x={40} y={fy} w={520} title="p: Parts" />
        <Cell x={56} y={fy + 32} name="head" type="Trace" state={ans ? 'dropped' : 'full'} />
        <Cell x={220} y={fy + 32} name="body" type="Trace" state={t >= 1.4 || ans ? 'moved' : 'full'} dx={0} />
        <Cell x={384} y={fy + 32} name="tail" type="Trace" state={ans ? 'dropped' : 'full'} />
      </g>
      {!pt && (
        <g>
          <T x={40} y={160} s={15} f={C.crema} o={fa(t, 0.6, 0.4)}>{'let body = p.body;'}</T>
          <T x={40} y={186} s={20} f={C.latte} w={600} o={fa(t, 0.6, 0.4)}>{'}'}</T>
          <T x={40} y={216} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>Trace logs its name when dropped</T>
        </g>
      )}
      {!ans && t >= 1.0 && <Token x={lerp(235, 310, slide)} y={lerp(fy + 40, 140, slide)} w={110} h={30} kind="buf" label="Trace" o={1 - seg(t, 1.4, 1.5)} />}
      <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
        <Slot x={300} y={140} name="body" type="Trace" ghost={t < 1.4} o={t < 0.6 ? 0 : 1} />
      </g>
      <T x={232} y={fy + 114} s={13} f={C.latte} o={ans ? 1 : 0} >no badge</T>
      <Timeline h={H} o={ans ? 1 : fa(t, 0.4)} />
      <g style={rv(ans, 0.05)}>
        <Badge x={170} y={y} n={1} name="body" hi />
        <Badge x={290} y={y} n={2} name="head" />
        <Badge x={410} y={y} n={3} name="tail" />
      </g>
    </Svg>
  );
}

// ── 5 · Refill the hole, or move it only sometimes ──────────────────────────────────────────────────────────────────
export function RefillFlag({ t }: StepCtx) {
  const H = 424;
  const fill = easeOutBack(seg(t, 1.2, 1.8));
  const refilled = t >= 1.8;
  const renamed = t >= 2.15;
  const flagOut = t >= 3.4;
  const slideOut = easeOut(seg(t, 3.4, 4.2));
  const flag0 = t >= 3.8;
  return (
    <Svg label="A hole can be filled again, and the struct is whole; a field moved on only one path gets its own drop flag, flipped from one to zero on the moved path and checked at the closing brace" h={H}>
      <g opacity={fa(t, 0.3, 0.7)}>
        <T x={40} y={14} s={13} f={C.taupe}>REFILL</T>
        <T x={40} y={40} s={15} f={C.crema}>p.body = Trace("body2");</T>
        <T x={40} y={64} s={15} f={C.crema} o={fa(t, 2.0, 0.3)}>let whole = p;</T>
        <Frame x={40} y={80} w={520} title={renamed ? 'whole: Parts' : 'p: Parts'} look={refilled} />
        <Cell x={56} y={112} name="head" type="Trace" />
        <Cell x={220} y={112} name="body" type="Trace" state={refilled ? 'full' : 'moved'} look={refilled} dy={(1 - fill) * -14} o={refilled ? Math.min(1, fill + 0.2) : 1} />
        <Cell x={384} y={112} name="tail" type="Trace" />
        {t >= 1.2 && t < 1.8 && <Token x={lerp(230, 235, fill)} y={lerp(60, 120, fill)} w={120} h={26} kind="buf" label="Trace body2" o={1 - seg(t, 1.7, 1.8)} />}
      </g>
      <g opacity={fa(t, 2.6, 0.6)}>
        <T x={40} y={222} s={13} f={C.taupe}>SOMETIMES</T>
        <T x={40} y={248} s={15} f={C.crema}>{'if c { let b = p.body; }'}</T>
        <Frame x={40} y={256} w={520} title="p: Parts" />
        <Cell x={56} y={288} name="head" type="Trace" />
        <Cell x={220} y={288} name="body" type="Trace" state={flag0 ? 'moved' : 'full'} dy={0} />
        {flagOut && !flag0 && <Cell x={220} y={288 + slideOut * 40} name="body" type="Trace" o={1 - slideOut} />}
        <Cell x={384} y={288} name="tail" type="Trace" />
        <rect x={346} y={266} width={22} height={22} rx={4} fill={C.espresso} stroke={flag0 ? C.caramel : C.mocha} strokeWidth={1.5} />
        <T x={357} y={282} s={14} a="middle" f={C.crema} w={600}>{flag0 ? '0' : '1'}</T>
        <T x={374} y={282} s={13} f={C.latte}>flag</T>
      </g>
      <T x={40} y={386} s={13} f={C.latte} o={fa(t, 4.4, 0.5)}>c = true: body dies in the if</T>
      <T x={40} y={406} s={13} f={C.latte} o={fa(t, 4.6, 0.5)}>c = false: body dies at the brace</T>
    </Svg>
  );
}

// ── 6 · Which of these moves compiles? (predict) ────────────────────────────────────────────────────────────────────
const MOVES = [
  { code: 'let a = v[0];', owner: 'v: Vec<Buf>' },
  { code: 'let b = *shared;', owner: 'shared: Rc<Buf>' },
  { code: 'let c = *boxed;', owner: 'boxed: Box<Buf>' },
  { code: 'let d = r.payload;', owner: 'r: &Frame' },
];

export function WhichMoves({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 250 : 340;
  const y0 = pt ? 40 : 50;
  const dy = pt ? 46 : 50;
  const glyph = (k: number, gy: number) => {
    const gx = 410;
    const body = <rect x={gx} y={gy} width={120} height={30} rx={6} fill={C.cocoa} stroke={k === 2 ? C.caramel : C.mocha} strokeWidth={k === 2 ? 2 : 1.5} />;
    if (k === 0)
      return (
        <g>
          {body}
          {[0, 1, 2].map((i) => <rect key={i} x={gx + 8 + i * 36} y={gy + 7} width={30} height={16} rx={3} fill="none" stroke={C.latte} strokeWidth={1.5} />)}
        </g>
      );
    if (k === 1)
      return (
        <g>
          {body}
          <Borrow x1={gx - 20} y1={gy - 10} x2={gx + 30} y2={gy + 15} />
          <Borrow x1={gx - 20} y1={gy + 40} x2={gx + 30} y2={gy + 15} />
        </g>
      );
    if (k === 2)
      return (
        <g>
          {body}
          <Owner x1={gx - 30} y1={gy + 15} x2={gx} y2={gy + 15} />
        </g>
      );
    return (
      <g>
        {body}
        <Borrow x1={gx - 30} y1={gy + 15} x2={gx} y2={gy + 15} />
      </g>
    );
  };
  return (
    <Svg label="Four ways to take a buffer out of something that owns it: a Vec index, an Rc deref and a field behind a reference are refused (E0507); only the Box deref moves" h={H}>
      {MOVES.map((m, k) => {
        const y = y0 + k * dy;
        return (
          <g key={m.code}>
            <g opacity={fa(t, 0.2 * k, 0.2)}>
              <T x={40} y={y} s={15} f={C.crema}>{m.code}</T>
              <T x={40} y={y + 20} s={13} f={C.latte}>{m.owner}</T>
            </g>
            {!pt && <g opacity={fa(t, 0.8, 0.4)}>{glyph(k, y - 14)}</g>}
            <g style={rv(ans)}>
              {k === 2 ? <T x={300} y={y} s={15} f={C.caramel} w={600}>moves</T> : <Err x={300} y={y} code="E0507" />}
            </g>
          </g>
        );
      })}
      {!pt && (
        <g style={rv(ans)}>
          <Slot x={340} y={y0 + 2 * dy + 28} name="c" type="Buf" w={100} h={30} />
        </g>
      )}
    </Svg>
  );
}

// ── 7 · A type with Drop is sealed ───────────────────────────────────────────────────────────────────────────────────
export function Sealed({ t }: StepCtx) {
  const H = 300;
  const sh = refuse(t, 2.2);
  const bad = tint(t, 2.2);
  const ghost = seg(t, 3.4, 3.6) * (1 - seg(t, 4.4, 4.8));
  return (
    <Stack>
      <Code title="pooled.rs" t={t} end={0.6} lines={[`let PooledBuf { buf, pool } = guard;`]} highlight={t > 0.6 ? [0] : []} />
      <Svg label="PooledBuf implements Drop, so its destructor may read every field: destructuring it is refused, E0509, because a field moved out early would leave the destructor a hole" h={H} fill>
        <g opacity={fa(t, 0.8)}>
          <Frame x={40} y={30} w={360} title="guard: PooledBuf" seal bad={bad} sealO={1} lines={[{ cx: 136, o: fa(t, 1.4, 0.4) }, { cx: 310, o: fa(t, 1.4, 0.4) }, ...(ghost > 0 ? [] : [])]} />
          <Cell x={56} y={62} w={160} name="buf" type="Option<Buf>" dx={sh * 0.6} dy={sh * 0.6} />
          <Cell x={230} y={62} w={160} name="pool" type="&mut Pool" dx={sh * 0.6} dy={sh * 0.6} />
          <PoolTray x={420} y={200} w={136} />
          <Borrow x1={310} y1={118} x2={488} y2={200} c={C.cinnamon} />
        </g>
        {ghost > 0 && (
          <g opacity={ghost}>
            <rect x={56} y={62} width={160} height={56} rx={8} fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="6 5" />
            <T x={136} y={98} s={20} a="middle" f={C.cherryText} w={700}>?</T>
          </g>
        )}
        <Slot x={56} y={200} name="buf" ghost o={Math.min(1, sh / 6) * fa(t, 2.2, 0.2)} w={170} />
        <Slot x={240} y={200} name="pool" ghost o={Math.min(1, sh / 6) * fa(t, 2.2, 0.2)} w={170} />
        <T x={40} y={152} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>drop(&mut self) reads every field</T>
        <Err x={420} y={60} code="E0509" o={fa(t, 2.75, 0.3)} />
        <T x={40} y={174} s={13} f={C.latte} o={fa(t, 2.75, 0.3)}>cannot move out of a Drop type</T>
        <T x={40} y={270} s={13} f={C.latte} o={fa(t, 5.0, 0.5)}>Copy fields can still be read: a copy moves nothing</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · Does the ref fix rescue into_inner? (predict, debug-this) ───────────────────────────────────────────────────
export function RefFix({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 240 : 356;
  const ry = pt ? 20 : 180;
  const lines = [`fn into_inner(self) -> Buf {`, `    let PooledBuf { buf, .. } = self;`, `    buf.expect("present")`, `}`];
  return (
    <Svg label="rustc's help for E0509 says to bind ref buf. A ref binding only borrows, so buf is a shared reference to the option and expect, which needs to own it, is E0507: the guard still cannot give the buffer out." h={H}>
      {!pt && <CodeLines x={40} y={40} lines={lines} o={fa(t, 0, 0.7)} />}
      {!pt && <T x={40} y={150} s={13} f={C.latte} o={fa(t, 0.8, 0.4)}>E0509 help: let PooledBuf {'{ ref buf, .. }'}</T>}
      <g opacity={fa(t, 0.8, 0.5)}>
        <Frame x={40} y={ry} w={360} title="self: PooledBuf" seal lines={[{ cx: 136 }, { cx: 310 }]} />
        <Cell x={56} y={ry + 32} w={160} name="buf" type="Option<Buf>" />
        <Cell x={230} y={ry + 32} w={160} name="pool" type="&mut Pool" />
      </g>
      <g style={rv(ans)}>
        <Slot x={56} y={ry + 124} name="buf" type="&Option<Buf>" w={200} h={34} />
        <Borrow x1={136} y1={ry + 124} x2={136} y2={ry + 88} />
        <Err x={pt ? 280 : 300} y={pt ? ry + 146 : 94} code="E0507" />
        {!pt && <T x={300} y={116} s={13} f={C.latte}>expect needs to own it</T>}
      </g>
    </Svg>
  );
}

// ── 9 · Behind a reference, no holes ─────────────────────────────────────────────────────────────────────────────────
const SWAP_LINES = [`fn swap_payload(frame: &mut Frame,`, `                fresh: Buf) -> Buf {`, `    let old = frame.payload; // E0507`, `    frame.payload = fresh;`, `    old`, `}`];

export function BehindRef({ t }: StepCtx) {
  const H = 280;
  const sh = refuse(t, 2.0);
  const bad = tint(t, 2.0);
  return (
    <Stack>
      <Code title="swap.rs" t={t} end={1.2} lines={SWAP_LINES} highlight={t >= 3.0 ? [3] : t >= 2.0 ? [2] : []} />
      <Svg label="A function that borrows a frame exclusively may not move a field out of it, even if the next line refills it, because the owner gets the frame back and must never see a hole: E0507" h={H} fill>
        <g opacity={fa(t, 1.4)}>
          <rect x={30} y={16} width={300} height={134} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={42} y={36} s={13} f={C.taupe}>main</T>
          <Cell x={44} y={50} w={130} name="header" type="Header" />
          <Cell x={186} y={50} w={130} name="payload" type="Buf" bad={bad} dx={sh * 0.5} dy={sh * 0.5} />
          <T x={44} y={134} s={13} f={C.latte}>frame: Frame</T>
          <rect x={360} y={16} width={196} height={134} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={372} y={36} s={13} f={C.taupe}>swap_payload</T>
          <rect x={372} y={50} width={130} height={30} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={384} y={70} s={13} f={C.crema}>frame: &mut</T>
          <Borrow x1={372} y1={65} x2={316} y2={96} c={C.cinnamon} />
          <Slot x={372} y={106} name="old" w={130} h={30} ghost />
        </g>
        <Err x={372} y={186} code="E0507" o={fa(t, 2.5, 0.3)} />
        <T x={372} y={206} s={13} f={C.latte} o={fa(t, 2.5, 0.3)}>behind &mut Frame</T>
        {t >= 3.0 && t < 3.8 && <Token x={196} y={lerp(104, 112, fa(t, 3.0))} w={110} h={26} kind="buf" label="fresh" o={0.5 * (1 - seg(t, 3.4, 3.8))} />}
        <T x={30} y={186} s={13} f={C.latte} o={fa(t, 3.8, 0.5)}>the owner gets frame back,</T>
        <T x={30} y={206} s={13} f={C.latte} o={fa(t, 4.1, 0.5)}>so it must never see a hole</T>
      </Svg>
    </Stack>
  );
}

// ── 10 · take, replace, swap: never leave a hole ─────────────────────────────────────────────────────────────────────
const IDIOMS = [
  { code: 'slot.take()', out: 'Buf', inn: 'None', left: 'leaves None', outKind: 'buf' as const, inKind: 'none' as const },
  { code: 'mem::take(&mut v)', out: 'Vec · 64 KiB', inn: 'Vec::new()', left: 'leaves Vec::new()', outKind: 'buf' as const, inKind: 'empty' as const },
  { code: 'mem::replace(&mut x, y)', out: 'old x', inn: 'y', left: 'leaves y', outKind: 'buf' as const, inKind: 'buf' as const },
  { code: 'mem::swap(&mut a, &mut b)', out: 'x', inn: 'y', left: 'a and b trade', outKind: 'buf' as const, inKind: 'buf' as const },
];

export function Idioms({ t }: StepCtx) {
  const H = 440;
  return (
    <Svg label="Four idioms move a value out through a mutable reference by putting a valid one back in the same step: Option take leaves None, mem take leaves the default, mem replace leaves what you pass, mem swap trades two places; none allocates" h={H}>
      {IDIOMS.map((r, k) => {
        const row = 30 + k * 100;
        const a = 0.4 + k * 1.0;
        const p = easeOut(seg(t, a + 0.2, a + 0.7));
        const p2 = easeOut(seg(t, a + 0.35, a + 0.85));
        const swap = k === 3;
        return (
          <g key={r.code}>
            <g opacity={fa(t, a, 0.2)}>
              <T x={40} y={row + 16} s={15} f={C.crema}>{r.code}</T>
              <Borrow x1={20} y1={row + 56} x2={40} y2={row + 56} c={C.cinnamon} />
              <rect x={40} y={row + 34} width={130} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
              {swap && <rect x={190} y={row + 34} width={130} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />}
            </g>
            {!swap && (
              <g opacity={fa(t, a, 0.2)}>
                <Token x={lerp(50, 230, p)} y={row + 41} w={r.out.length > 8 ? 130 : 110} h={30} kind={r.outKind} label={r.out} o={1} />
                <Token x={50} y={lerp(row - 4, row + 41, p2)} w={110} h={30} kind={r.inKind} label={r.inn} o={p2} />
              </g>
            )}
            {swap && (
              <g opacity={fa(t, a, 0.2)}>
                <Token x={lerp(50, 200, p)} y={row + 41 - 20 * Math.sin(Math.PI * p)} w={100} h={30} kind="buf" label="x" />
                <Token x={lerp(200, 50, p)} y={row + 41 + 0 * p} w={100} h={30} kind="buf" label="y" />
              </g>
            )}
            <T x={372} y={row + 62} s={13} f={C.latte} o={fa(t, a + 0.7, 0.2)}>{r.left}</T>
            <T x={556} y={row + 16} s={13} a="end" f={C.caramel} o={fa(t, a + 0.7, 0.2)}>+0 allocs</T>
          </g>
        );
      })}
      <T x={40} y={424} s={13} f={C.latte} o={fa(t, 4.6, 0.5)}>owning removals: pop · swap_remove · drain</T>
    </Svg>
  );
}

// ── 11 · What does mem::take leave in the pool? (predict) ───────────────────────────────────────────────────────────
const TRAP_LINES = [`let mut buf = pool.get();`, `fill(&mut buf, &msg);`, `let bytes = mem::take(&mut buf.bytes);`, `drop(bytes); // written elsewhere`, `pool.put(buf);`];

export function TakeTrap({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 230 : 360;
  const ty = pt ? 120 : 224;
  return (
    <Svg label="A stage takes the bytes out of a pooled buffer with mem take and returns the buffer to the pool. The pool now holds a buffer with capacity zero, so every message allocates again: 1,000 allocations, not one." h={H}>
      {!pt && <CodeLines x={40} y={40} lines={TRAP_LINES} o={fa(t, 0, 0.8)} />}
      {!pt && <T x={40} y={180} s={13} f={C.latte} o={fa(t, 0.8, 0.3)}>1,000 messages of 261 bytes</T>}
      <g opacity={fa(t, 1.0, 0.4)}>
        <PoolTray x={40} y={ty} w={190} bars={ans ? 0 : 1} />
        {!ans && <T x={106} y={ty + 64} s={13} f={C.latte}>64 KiB</T>}
      </g>
      <g style={rv(ans)}>
        <Token x={56} y={ty + 8} w={118} h={30} kind="empty" />
        <T x={260} y={ty + 28} s={13} f={C.latte}>326,275 bytes</T>
      </g>
      <g opacity={fa(t, 1.0, 0.4)}>
        <T x={556} y={28} s={13} a="end" f={C.taupe}>ALLOCS</T>
        <T x={556} y={54} s={20} a="end" f={ans ? C.crema : C.caramel} serif w={700}>{ans ? '1,000' : '?'}</T>
      </g>
    </Svg>
  );
}

// ── 12 · PooledBuf: an Option makes the hole legal ───────────────────────────────────────────────────────────────────
const POOLED_LINES = [`impl Drop for PooledBuf<'_> {`, `  fn drop(&mut self) {`, `    if let Some(b) = self.buf.take() {`, `      self.pool.put(b);`, `    }`, `  }`, `}`];

export function OptionHole({ t, portrait }: StepCtx) {
  const H = 290;
  const brace = t >= 2.0;
  const k = easeOut(seg(t, 2.2, 2.7));
  const land = easeOutBack(seg(t, 3.0, 3.4));
  const pulse = t >= 3.4 && t < 4.6 ? 0.5 + 0.5 * Math.cos(2 * Math.PI * (t - 3.4) * 1.2) : 1;
  const msgs = fmt(1000 * easeOut(seg(t, 3.4, 4.6)));
  const landed = t >= 3.0;
  return (
    <Stack>
      {(!portrait || t < 3.4) && <Code title="pooled.rs" t={t} end={1.2} lines={POOLED_LINES} highlight={t >= 3.0 ? [3] : t >= 2.2 ? [2] : []} />}
      <Svg label="PooledBuf stores its buffer in an Option: at the guard's closing brace, take moves the buffer to the pool and leaves None, so no field is ever missing and the sealed guard is never broken; 1,000 messages cost one allocation" h={H} fill>
        <g opacity={fa(t, 1.4)}>
          <Frame x={40} y={30} w={360} title="g: PooledBuf" seal lines={[{ cx: 136 }, { cx: 310 }]} />
          <Cell x={56} y={62} w={160} name="buf" />
          <Cell x={230} y={62} w={160} name="pool" type="&mut Pool" />
          <PoolTray x={40} y={214} w={190} bars={landed ? 1 : 0} />
        </g>
        {t < 2.2 && <Token x={66} y={90} w={100} h={22} kind="buf" label="Some(Buf)" o={fa(t, 1.4)} />}
        {t >= 2.2 && t < 3.4 && <Token x={66} y={lerp(90, 216, Math.min(1, k + 0.2 * land))} w={100} h={22} kind="buf" label="Some(Buf)" o={landed ? 1 - seg(t, 3.0, 3.4) : 1} />}
        {t >= 2.2 && <Token x={66} y={lerp(44, 90, k)} w={100} h={22} kind="none" label="None" o={k} />}
        <T x={430} y={125} s={20} f={brace ? C.caramel : C.latte} w={600} o={fa(t, 1.4)}>{'}'}</T>
        <g opacity={pulse}>
          <Counter t={t} a={1.4} text="1" />
          <T x={556} y={74} s={13} a="end" f={C.latte} o={fa(t, 3.4, 0.2)}>{`msgs ${msgs}`}</T>
        </g>
        <T x={260} y={226} s={13} f={C.latte} o={0.7 * fa(t, 4.6, 0.5)}>with clone: 1,001</T>
        <T x={260} y={252} s={13} f={C.latte} o={fa(t, 4.8, 0.5)}>Option&lt;Buf&gt;: 32 bytes, as Buf</T>
      </Svg>
    </Stack>
  );
}

// ── 13 · After into_inner, what does drop find? (predict) ────────────────────────────────────────────────────────────
export function IntoInner({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 232 : 332;
  const ry = pt ? 14 : 130;
  const lines = [`pub fn into_inner(mut self) -> Buf {`, `    self.buf.take().expect("present")`, `}   // self drops here`];
  return (
    <Svg label="into_inner takes the buffer out with take and returns it; when self drops at the closing brace the guard's drop finds None and does nothing, because the caller owns the buffer now" h={H}>
      {!pt && <CodeLines x={40} y={40} lines={lines} o={fa(t, 0, 0.7)} />}
      <g opacity={fa(t, 0.8, 0.4)}>
        <Frame x={40} y={ry} w={360} title="self: PooledBuf" seal lines={[{ cx: 136 }, { cx: 310 }]} />
        <Cell x={56} y={ry + 32} w={160} name="buf">
          <Token x={66} y={ry + 70} w={ans ? 80 : 100} h={22} kind={ans ? 'none' : 'buf'} label={ans ? 'None' : 'Some(Buf)'} />
        </Cell>
        <Cell x={230} y={ry + 32} w={160} name="pool" type="&mut Pool" />
        <Slot x={420} y={pt ? 40 : ry + 10} name="caller" w={136} ghost={!ans} />
      </g>
      <g style={rv(ans)}>
        <Token x={440} y={(pt ? 40 : ry + 10) + 50} w={72} h={30} kind="buf" label="Buf" />
        <Badge x={140} y={ry + (pt ? 150 : 146)} n={1} name="g" hi />
        <T x={190} y={ry + (pt ? 155 : 151)} s={13} f={C.latte}>drop: None</T>
      </g>
    </Svg>
  );
}

// ── 14 · The error path, with and without the guard ──────────────────────────────────────────────────────────────────
const ERR_LINES = [`let mut buf = pool.get();`, `fill(&mut buf, src);`, `let h = check(&buf)?; // Err: buf dropped`, `pool.put(consume(buf));`];

export function ErrorPath({ t }: StepCtx) {
  const H = 312;
  const exit = t >= 1.8;
  const fall = easeOut(seg(t, 2.2, 2.8));
  const slide = easeOutBack(seg(t, 2.2, 2.8));
  const count = easeOut(seg(t, 3.0, 4.8));
  const lane = (L: number, label: string, guarded: boolean) => (
    <g>
      <T x={40} y={L + 14} s={13} f={C.taupe}>{label}</T>
      <g opacity={fa(t, 1.2)}>
        <rect x={40} y={L + 26} width={290} height={84} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={52} y={L + 46} s={13} f={C.taupe}>stage</T>
        <T x={338} y={L + 74} s={20} f={C.latte} w={600}>?</T>
        {exit && <Owner x1={354} y1={L + 68} x2={366} y2={L + 68} c={C.cherry} />}
        <PoolTray x={370} y={L + 70} w={186} bars={guarded && t >= 2.8 ? 1 : 0} />
      </g>
      {guarded ? (
        <g opacity={fa(t, 1.2) * (t >= 2.2 ? 1 - easeOut(seg(t, 2.2, 2.7)) : 1)}>
          <Frame x={56} y={L + 56} w={150} h={40} title="g" seal />
        </g>
      ) : (
        <g opacity={t >= 2.2 ? 1 - seg(t, 2.5, 2.9) : fa(t, 1.2)}>
          <Slot x={56} y={L + 58} name="buf" type="Buf" w={150} h={36} />
        </g>
      )}
      {t >= 3.0 && <Slot x={56} y={L + 58} name={guarded ? 'g' : 'buf'} w={150} h={36} ghost o={fa(t, 3.0, 0.4)} />}
      {!guarded && t >= 2.2 && (
        <g>
          <rect x={64} y={L + 72 + 38 * fall} width={110} height={26} rx={6} fill={C.cherry} fillOpacity={0.3 * (1 - seg(t, 2.6, 3.0))} stroke={C.cherry} strokeWidth={1.5} opacity={1 - seg(t, 2.6, 3.0)} />
          <T x={190} y={L + 130} s={13} f={C.latte} o={fa(t, 2.8, 0.3)}>freed</T>
        </g>
      )}
      {guarded && t >= 2.2 && <Token x={lerp(64, 376, slide)} y={lerp(L + 72, L + 78, slide)} w={lerp(110, 60, slide)} h={22} kind="buf" label="Buf" o={t >= 2.8 ? 1 - seg(t, 2.8, 2.9) : 1} />}
    </g>
  );
  return (
    <Stack>
      <Code title="stage.rs" t={t} end={1.0} lines={ERR_LINES} highlight={t >= 1.8 ? [2] : []} />
      <Svg label="The same stage on a malformed message: by hand, the early return drops the buffer, so 100 bad messages cost 100 allocations; with the guard, the early return drops the guard, which puts the buffer back: 1 allocation" h={H} fill>
        {lane(8, 'BY HAND', false)}
        {lane(162, 'GUARDED', true)}
        <g opacity={fa(t, 3.0, 0.3)}>
          <T x={556} y={22} s={13} a="end" f={C.taupe}>ALLOCS</T>
          <T x={556} y={52} s={20} a="end" f={C.cherryText} serif w={700}>{fmt(100 * count)}</T>
          <T x={556} y={176} s={13} a="end" f={C.taupe}>ALLOCS</T>
          <T x={556} y={206} s={20} a="end" f={C.crema} w={700}>{fmt(Math.max(1, count))}</T>
        </g>
        <T x={556} y={146} s={13} a="end" f={C.latte} o={fa(t, 4.4, 0.4)}>100 errors · 6,553,600 bytes</T>
        <T x={556} y={300} s={13} a="end" f={C.latte} o={fa(t, 4.4, 0.4)}>100 errors · 65,536 bytes</T>
      </Svg>
    </Stack>
  );
}

// ── 15 · A pattern is a transfer point ───────────────────────────────────────────────────────────────────────────────
export function PatternTransfer({ t }: StepCtx) {
  const H = 440;
  const cp = easeOut(seg(t, 1.0, 1.5));
  const mv = easeOutBack(seg(t, 1.6, 2.2));
  const moved = t >= 2.2;
  return (
    <Svg label="A pattern lists a transfer per binding: destructuring a Frame by value copies the header and moves the payload, leaving frame partially moved; the same pattern with ref payload only borrows, and frame stays whole" h={H}>
      <g opacity={fa(t, 0.4)}>
        <T x={40} y={34} s={15} f={C.crema}>{'let Frame { header, payload } = frame;'}</T>
        <Frame x={40} y={50} w={350} h={100} title="frame" />
        <Cell x={56} y={82} name="header" type="Header" />
        <Cell x={220} y={82} name="payload" type="Buf" state={moved ? 'moved' : 'full'} />
        <Slot x={40} y={170} name="header" type="Header" ghost={t < 1.5} o={t < 1.0 ? 0 : 1} w={170} />
        <Slot x={220} y={170} name="payload" type="Buf" ghost={!moved} o={t < 1.6 ? 0 : 1} w={170} />
      </g>
      {t >= 1.0 && t < 1.5 && <Cell x={56} y={lerp(82, 170, cp)} w={150} h={56} name="header" type="Header" o={0.6 * (1 - seg(t, 1.4, 1.5))} />}
      {t >= 1.6 && t < 2.2 && <Token x={235} y={lerp(90, 176, mv)} w={110} h={26} kind="buf" label="Buf" o={1 - seg(t, 2.1, 2.2)} />}
      <Owner x1={305} y1={150} x2={305} y2={170} o={fa(t, 1.6, 0.3)} />
      <T x={48} y={226} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>copy</T>
      <T x={40} y={226} s={13} f={C.latte} o={0}>.</T>
      <T x={228} y={226} s={13} f={C.latte} o={fa(t, 2.2, 0.3)}>partially moved</T>
      <T x={400} y={70} s={13} f={C.latte} o={fa(t, 2.6, 0.4)}>arrow: move</T>
      <T x={400} y={92} s={13} f={C.latte} o={fa(t, 2.8, 0.4)}>ghost: copy</T>
      <g opacity={fa(t, 3.0, 0.5)}>
        <T x={40} y={254} s={15} f={C.crema}>{'let Frame { ref payload, .. } = frame;'}</T>
        <Frame x={40} y={270} w={350} h={100} title="frame" />
        <Cell x={56} y={302} name="header" type="Header" />
        <Cell x={220} y={302} name="payload" type="Buf" />
        <Slot x={220} y={386} name="payload" type="&Buf" w={170} />
      </g>
      <Borrow x1={305} y1={386} x2={305} y2={358} o={fa(t, 3.6, 0.5)} />
      <T x={40} y={432} s={13} f={C.caramel} o={fa(t, 3.8, 0.4)}>frame still whole</T>
      <T x={400} y={300} s={13} f={C.latte} o={fa(t, 4.4, 0.4)}>dot: borrow</T>
      <T x={400} y={322} s={13} f={C.latte} o={fa(t, 4.6, 0.4)}>_ : touches nothing</T>
    </Svg>
  );
}

// ── 16 · Some(_) or Some(_b)? (predict) ──────────────────────────────────────────────────────────────────────────────
export function UnderscoreBind({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 220 : 320;
  const cy = pt ? 24 : 150;
  const lines = [`let slot = Some(pool.get());`, `if let Some(_) = slot {}`, `if let Some(_b) = slot {}`];
  return (
    <Svg label="Some underscore binds nothing, so slot stays whole; Some underscore-b is an ordinary name that moves the buffer out, so slot is partially moved: E0382" h={H}>
      {!pt && <CodeLines x={40} y={40} lines={lines} o={fa(t, 0, 0.8)} />}
      {!pt && <T x={40} y={124} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>which leaves slot usable?</T>}
      <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
        <g opacity={fa(t, 0.8, 0.4)}>
          <Cell x={40} y={cy} w={180} name="slot" type="Option<Buf>" />
          <Token x={50} y={cy + 28} w={0.01} h={0.01} kind="buf" label="" o={0} />
        </g>
      </g>
      <g style={rv(ans)}>
        <Cell x={40} y={cy} w={230} name="Some(_)" type="slot: Option<Buf>" />
        <T x={40} y={cy + 82} s={13} f={C.caramel} w={600}>still Some</T>
        <Cell x={310} y={cy} w={230} name="Some(_b)" state="moved" />
        <Err x={310} y={cy + 84} code="E0382" />
      </g>
    </Svg>
  );
}

// ── 17 · Matching on a reference borrows instead ─────────────────────────────────────────────────────────────────────
const MODE_ROWS = [
  { scrut: 'match frame', mode: 'mode: move', types: 'Header · Buf (moved)', c: C.caramel },
  { scrut: 'match &frame', mode: 'mode: ref', types: '&Header · &Buf', c: C.latte },
  { scrut: 'match &mut frame', mode: 'mode: ref mut', types: '&mut Header · &mut Buf', c: C.cinnamon },
];

export function DefaultMode({ t }: StepCtx) {
  const H = 462;
  const starts = [0.4, 1.8, 3.4];
  return (
    <Svg label="Matching a reference with a non-reference pattern switches the default binding mode from move to ref, or ref mut, so the bindings become references and nothing is moved out; there is no way back from ref" h={H}>
      {MODE_ROWS.map((r, k) => {
        const row = 20 + k * 140;
        const a = starts[k];
        const hole = k === 0 && t >= 1.0;
        const edge = fa(t, k === 0 ? 1.0 : a + 0.6, 0.4);
        // the chip flips at the moment the lens passes the &
        const chipText = k === 0 ? r.mode : t < a + 0.4 ? 'mode: move' : r.mode;
        return (
          <g key={r.scrut}>
            <g opacity={fa(t, a, 0.3)}>
              <T x={40} y={row + 20} s={15} f={C.crema}>{r.scrut}</T>
              <Chip x={40} y={row + 34} text={chipText} w={132} f={k === 2 ? C.cinnamon : C.latte} />
              <Frame x={200} y={row + 8} w={330} h={82} />
              <Cell x={212} y={row + 20} w={150} name="header" type="Header" />
              <Cell x={372} y={row + 20} w={146} name="payload" type="Buf" state={hole ? 'moved' : 'full'} />
            </g>
            {k === 0 && <Owner x1={445} y1={row + 90} x2={445} y2={row + 106} o={edge} />}
            {k === 1 && (
              <g>
                <Borrow x1={287} y1={row + 104} x2={287} y2={row + 76} o={edge} />
                <Borrow x1={445} y1={row + 104} x2={445} y2={row + 76} o={edge} />
              </g>
            )}
            {k === 2 && (
              <g>
                <Borrow x1={287} y1={row + 104} x2={287} y2={row + 76} c={C.cinnamon} o={edge} />
                <Borrow x1={445} y1={row + 104} x2={445} y2={row + 76} c={C.cinnamon} o={edge} />
              </g>
            )}
            <T x={200} y={row + 122} s={13} f={r.c === C.caramel ? C.latte : C.latte} o={edge}>{r.types}</T>
          </g>
        );
      })}
      <T x={40} y={448} s={13} f={C.latte} o={fa(t, 4.6, 0.5)}>Option&lt;Buf&gt;: &amp;slot, as_ref(), as_mut() borrow</T>
    </Svg>
  );
}

// ── 18 · One mut, two editions (predict) ─────────────────────────────────────────────────────────────────────────────
export function MutTwoEditions({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 250 : 320;
  const lines = [`let Frame { mut header, .. } = &frame;`, `header.len = 99;`];
  return (
    <Svg label="mut on a binding under an implicit borrow: before Rust 2024 it reset the mode to move and edited a copy, leaving frame.header.len at 0; Rust 2024 rejects it, so write &mut frame to edit in place" h={H}>
      <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
        <CodeLines x={40} y={40} lines={lines} o={fa(t, 0, 0.8)} />
        <T x={40} y={100} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>what happens to frame.header.len?</T>
        <g opacity={fa(t, 0.8, 0.6)}>
          <Frame x={40} y={130} w={350} h={100} title="frame" />
          <Cell x={56} y={162} name="header" type="len 0" />
          <Cell x={220} y={162} name="payload" type="Buf" />
        </g>
      </g>
      <g style={rv(ans)}>
        <T x={40} y={26} s={13} f={C.taupe}>2021</T>
        <Cell x={120} y={34} w={140} name="header" type="len 0" />
        <Cell x={290} y={34} w={200} name="header (copy)" type="len 99" o={0.6} />
        <T x={40} y={146} s={13} f={C.taupe}>2024</T>
        <T x={40} y={176} s={15} f={C.crema}>{'let Frame { mut header, .. } = &frame;'}</T>
        <rect x={113} y={181} width={29} height={2.5} fill={C.cherry} />
        <Err x={40} y={208} code="error" />
        <T x={110} y={208} s={13} f={C.latte}>cannot mutably bind by value</T>
      </g>
    </Svg>
  );
}

// ── 19 · Rust 2024 reserves three spellings ──────────────────────────────────────────────────────────────────────────
const RESERVED = [
  { bad: 'let Frame { mut header, .. } = &frame;', col: 12, len: 3, msg: 'cannot mutably bind by value', fix: 'let &Frame { mut header, .. } = &frame;', chip: true },
  { bad: 'let Frame { ref payload, .. } = &frame;', col: 12, len: 3, msg: 'cannot explicitly borrow', fix: 'let Frame { payload, .. } = &frame;', chip: false },
  { bad: 'let [&x] = &[&1u8];', col: 5, len: 1, msg: 'cannot explicitly dereference', fix: 'let &[&x] = &[&1u8];', chip: true },
];

export function ThreeReservations({ t }: StepCtx) {
  const H = 452;
  const CW = 9.45;
  return (
    <Svg label="Rust 2024 reserves three spellings inside a pattern that is already borrowing implicitly: mut on a binding, an explicit ref, and an ampersand pattern; each is an error, and the fully explicit rewrite keeps the old meaning" h={H}>
      {RESERVED.map((r, k) => {
        const row = 30 + k * 140;
        const a = [0.4, 1.6, 2.8][k];
        const b = [3.6, 4.0, 4.4][k];
        return (
          <g key={r.bad}>
            <g opacity={fa(t, a, 0.4)}>
              <T x={40} y={row} s={15} f={C.crema}>{r.bad}</T>
              <rect x={40 + r.col * CW} y={row + 5} width={r.len * CW} height={2.5} fill={C.cherry} />
              <Chip x={40} y={row + 20} text="mode: ref" w={100} />
              <T x={180} y={row + 37} s={13} f={C.latte}>{r.msg}</T>
            </g>
            <g opacity={fa(t, b, 0.4)}>
              <T x={40} y={row + 76} s={15} f={C.caramel}>{r.fix}</T>
              {r.chip && <Chip x={40} y={row + 88} text="mode: move" w={112} f={C.caramel} />}
            </g>
          </g>
        );
      })}
      <T x={40} y={438} s={13} f={C.latte} o={fa(t, 4.6, 0.4)}>cargo fix --edition: rust_2024_incompatible_pat</T>
    </Svg>
  );
}

// ── 20 · Prove it · 1 of 3 (predict) ─────────────────────────────────────────────────────────────────────────────────
export function Prove1({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 232 : 340;
  const fy = pt ? 14 : 20;
  const y = TLY(H);
  return (
    <Svg label="A pattern takes tail, then head is passed to drop: head drops at once, then at the closing brace the tail binding, then the struct with only body left" h={H}>
      <g opacity={fa(t, 0, 0.6)}>
        <Frame x={40} y={fy} w={520} title="p: Parts" />
        <Cell x={56} y={fy + 32} name="head" type="Trace" state={ans ? 'dropped' : 'full'} />
        <Cell x={220} y={fy + 32} name="body" type="Trace" state={ans ? 'dropped' : 'full'} />
        <Cell x={384} y={fy + 32} name="tail" type="Trace" state={ans ? 'dropped' : 'full'} />
      </g>
      {!pt && (
        <g opacity={fa(t, 0.5, 0.5)}>
          <T x={40} y={150} s={15} f={C.crema}>{'let Parts { tail, .. } = p;'}</T>
          <T x={40} y={176} s={15} f={C.crema}>drop(p.head);</T>
          <T x={40} y={202} s={20} f={C.latte} w={600}>{'}'}</T>
        </g>
      )}
      <Timeline h={H} o={ans ? 1 : fa(t, 0.4)} />
      <g style={rv(ans, 0.05)}>
        <T x={196} y={fy + 54} s={13} a="end" f={C.latte}>1</T>
        <T x={540 - 150 + 30 - 38} y={fy + 54} s={13} a="end" f={C.latte}>3</T>
        <T x={534} y={fy + 54} s={13} a="end" f={C.latte}>2</T>
        <Badge x={170} y={y} n={1} name="head" hi />
        <Badge x={290} y={y} n={2} name="tail" />
        <Badge x={410} y={y} n={3} name="body" />
      </g>
    </Svg>
  );
}

// ── 21 · Prove it · 2 of 3 (predict, debug-this) ─────────────────────────────────────────────────────────────────────
export function Prove2({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 232 : 324;
  const ry = pt ? 14 : 184;
  const lines = [`struct Sink { buf: Buf, written: usize }`, `fn finish(&mut self) -> Buf {`, `    self.buf // E0507`, `}`];
  return (
    <Svg label="finish hands the buffer out through a mutable reference and is E0507. Of four fixes, mem replace with an empty buffer allocates nothing; clone allocates, mem take needs a default, and destructuring through the reference is the same error" h={H}>
      {!pt && <CodeLines x={40} y={40} lines={lines} o={fa(t, 0, 0.8)} />}
      {!pt && <T x={40} y={150} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>which fix allocates nothing?</T>}
      <g opacity={fa(t, 0.8, 0.4)}>
        <Borrow x1={20} y1={ry + 62} x2={40} y2={ry + 62} c={C.cinnamon} />
        <Frame x={40} y={ry} w={360} title="self: &mut Sink" />
        <Cell x={56} y={ry + 32} w={160} name="buf" type={ans ? undefined : 'Buf'}>
          {ans && <Token x={64} y={ry + 56} w={140} h={22} kind="empty" />}
        </Cell>
        <Cell x={230} y={ry + 32} w={160} name="written" type="usize" />
      </g>
      <g style={rv(ans)}>
        <Slot x={420} y={ry + 8} name="finish()" w={136} />
        <Owner x1={216} y1={ry + 70} x2={420} y2={ry + 27} c={C.caramel} />
        <T x={420} y={ry + 70} s={13} f={C.caramel}>+0 allocs</T>
      </g>
    </Svg>
  );
}

// ── 22 · Prove it · 3 of 3 (predict, defend-a-design) ────────────────────────────────────────────────────────────────
const DESIGNS = [
  { field: 'Option<Buf>', how: 'take()', free: 'free 1' },
  { field: 'Buf', how: 'mem::replace', free: 'free 1,001' },
  { field: 'ManuallyDrop<Buf>', how: 'unsafe take', free: '' },
];

export function Prove3({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const pt = portrait && ans;
  const H = pt ? 280 : 340;
  const gap = pt ? 84 : 100;
  return (
    <Svg label="Three ways to build the guard's buffer field: an Option with take, a placeholder Buf with mem replace, ManuallyDrop with unsafe take. Only the Option can tell drop that the buffer is already gone: the placeholder fills the pool with 1,000 empty buffers." h={H}>
      {DESIGNS.map((d, k) => {
        const y = 24 + k * gap;
        return (
          <g key={d.field}>
            <g opacity={fa(t, 0.2 + k * 0.25, 0.4)}>
              <Frame x={40} y={y} w={360} h={pt ? 68 : 72} seal={true} look={ans && k === 0} />
              <Cell x={56} y={y + 8} w={250} h={pt ? 50 : 54} name={d.field} />
            </g>
            <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
              <T x={420} y={y + 40} s={13} f={C.latte} o={fa(t, 0.6 + k * 0.2, 0.3)}>{d.how}</T>
            </g>
            <g style={rv(ans)}>
              {k === 0 && <PoolTray x={420} y={y + 8} w={136} bars={1} label={false} free={d.free} ring />}
              {k === 1 && <PoolTray x={420} y={y + 8} w={136} bars={4} dashed label={false} free={d.free} />}
              {k === 2 && <Err x={420} y={y + 40} code="unsafe" />}
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 23 · In one breath ───────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const H = 476;
  const glyph = (k: number, y: number): ReactNode => {
    const g = { x: 40, y: y - 22, w: 40, h: 30 };
    switch (k) {
      case 0:
        return <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="6 5" />;
      case 1:
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
            <rect x={g.x - 4} y={g.y - 4} width={g.w + 8} height={g.h + 8} rx={9} fill="none" stroke={C.latte} strokeWidth={1.5} />
          </g>
        );
      case 2:
        return <Borrow x1={g.x} y1={g.y + 15} x2={g.x + g.w} y2={g.y + 15} />;
      case 3:
        return (
          <g>
            <rect x={g.x} y={g.y} width={18} height={12} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
            <rect x={g.x + 22} y={g.y + 18} width={18} height={12} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="3 3" />
          </g>
        );
      case 4:
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="5 4" />
            <T x={g.x + 20} y={g.y + 20} s={13} a="middle" f={C.latte}>None</T>
          </g>
        );
      default:
        return (
          <g>
            <circle cx={g.x + 16} cy={g.y + 14} r={11} fill="none" stroke={C.caramel} strokeWidth={2} />
            <line x1={g.x + 24} y1={g.y + 22} x2={g.x + 36} y2={g.y + 30} stroke={C.caramel} strokeWidth={2.5} />
          </g>
        );
    }
  };
  const rows = ['Move a field out; the rest drops', 'Drop types are sealed: E0509', 'Behind & or &mut: no holes, E0507', 'take, replace, swap: put one back', 'Guard field: Option + take', 'Patterns move, copy or borrow'];
  return (
    <Svg label="Six things to keep: moving a field out leaves a hole and the rest still drops; a Drop type is sealed, E0509; behind a reference you may never leave a hole, E0507, so take, replace and swap put one back; a guard's field is an Option; patterns move, copy or borrow. Next: two guards cannot share one pool, E0499" h={H}>
      {rows.map((r, i) => {
        const y = 36 + 52 * i;
        return (
          <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.35)}>
            {glyph(i, y)}
            <T x={100} y={y} s={15} f={C.crema}>{r}</T>
          </g>
        );
      })}
      <g opacity={fa(t, 2.2, 0.5)}>
        <Frame x={40} y={352} w={90} h={30} seal pill={false} />
        <T x={52} y={372} s={15} f={C.crema} w={600}>g1</T>
        <Frame x={40} y={394} w={90} h={30} seal pill={false} />
        <T x={52} y={414} s={15} f={C.crema} w={600}>g2</T>
        <PoolTray x={300} y={358} w={190} bars={1} />
        <Borrow x1={135} y1={367} x2={300} y2={372} c={C.cinnamon} />
        <Borrow x1={135} y1={409} x2={300} y2={392} c={C.cherry} />
        <Err x={502} y={396} code="E0499" />
        <T x={40} y={458} s={15} f={C.caramel}>Next: one guard at a time</T>
      </g>
    </Svg>
  );
}
