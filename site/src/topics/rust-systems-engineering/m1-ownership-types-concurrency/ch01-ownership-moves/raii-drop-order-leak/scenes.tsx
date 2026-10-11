import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, fmt, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: the drop ledger. A scope is a column of owner slots; at the closing brace the column peels off
// from the bottom and each slot leaves a numbered badge on a timeline along the bottom of the drawing, left to right in
// the order its destructor ran. A temporary is a dashed slot with a lifetime bar; a leak is a slot that fades without a badge.
// Every snippet shown here is an exact line of examples/*.rs (examples.py checks it) and every number is asserted there.

/** Opacity ramp: 0 before `a`, 1 after `a + d`. */
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
/** CSS-driven reveal for predict steps (the clock stops at `duration`, so the reveal is a still frame). Short on purpose. */
const rv = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transition: 'opacity .15s', transitionDelay: on ? `${Math.min(delay, 0.1)}s` : '0s' });
/** Source lines keep their indentation: SVG text would collapse runs of spaces. */
const nb = (s: string) => s.replace(/ {2,}/g, (m) => ' '.repeat(m.length));
/** Where the timeline sits in a drawing of height h. */
const TLY = (h: number) => h - 54;

// ── shared glyphs ───────────────────────────────────────────────────────────────────────────────────────────────

type SlotState = 'live' | 'moved' | 'dropped' | 'forgotten';

/** An owner: a binding name (and type) in a rounded slot. `k` scales it about its centre (the collapse), `look` marks the one to look at. */
function Slot({ x, y, name, type, w = 170, h = 38, state = 'live', look = false, k = 1, o = 1, n, word = true }: { x: number; y: number; name: string; type?: string; w?: number; h?: number; state?: SlotState; look?: boolean; k?: number; o?: number; n?: number; word?: boolean }) {
  if (k <= 0.001 || o <= 0.001) return null;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const live = state === 'live';
  const faded = state === 'forgotten' ? 0.35 : 1;
  return (
    <g opacity={o} transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={live ? C.cocoa : 'none'} stroke={live ? (look ? C.caramel : C.mocha) : C.taupe} strokeWidth={live ? (look ? 2.5 : 1.5) : 1.5} strokeDasharray={live ? undefined : '6 5'} opacity={state === 'forgotten' ? 0.35 : 1} />
      <T x={x + 12} y={y + h / 2 + 5} s={15} f={live ? C.crema : C.latte} w={600} o={faded}>{name}</T>
      {live && type && <T x={x + w - 12} y={y + h / 2 + 5} s={13} a="end" f={C.latte}>{type}</T>}
      {state === 'moved' && word && <T x={x + w - 12} y={y + h / 2 + 5} s={13} a="end" f={C.latte}>moved</T>}
      {state === 'forgotten' && word && <T x={x + w - 12} y={y + h / 2 + 5} s={13} a="end" f={C.latte}>forgotten</T>}
      {state === 'dropped' && n !== undefined && <T x={x + w - 12} y={y + h / 2 + 5} s={13} a="end" f={C.latte}>{`dropped ${n}`}</T>}
    </g>
  );
}

/** The collapse of a slot at time `a`: 1 → 0 over 0.4 s with easeOut. */
const collapse = (t: number, a: number) => 1 - easeOut(seg(t, a, a + 0.4));

/** A numbered badge on the timeline; its name sits 20 units below. `t >= 90` draws it static (reveal frames). */
function Badge({ x, y, n, name, t, a = 0, hi = false, bad = false }: { x: number; y: number; n: number; name?: string; t: number; a?: number; hi?: boolean; bad?: boolean }) {
  const k = t >= 90 ? 1 : easeOutBack(seg(t, a, a + 0.35));
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
      <circle cx={x} cy={y} r={12} fill={bad ? C.cherry : C.mocha} stroke={bad ? C.cherryText : hi ? C.caramel : C.crema} strokeWidth={hi ? 2.5 : 1.5} />
      <T x={x} y={y + 5} s={14} a="middle" f={C.crema} w={600}>{String(n)}</T>
      {name && <T x={x} y={y + 32} s={13} a="middle" f={C.latte}>{name}</T>}
    </g>
  );
}

function Timeline({ h, label = true, o = 1, x1 = 40, x2 = 540 }: { h: number; label?: boolean; o?: number; x1?: number; x2?: number }) {
  const y = TLY(h);
  return (
    <g opacity={o}>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.taupe} strokeWidth={1.5} />
      {label && <T x={x1} y={y - 12} s={13} f={C.taupe}>DROP ORDER</T>}
    </g>
  );
}

/** The scope's closing brace; it lights caramel for 0.2 s at `a` (and stays lit when `keep`). */
function Brace({ x, y, t, a, keep = true }: { x: number; y: number; t: number; a: number; keep?: boolean }) {
  const lit = t >= a && (keep || t < a + 0.6);
  return (
    <T x={x} y={y} s={20} a="middle" f={lit ? C.caramel : C.latte} w={600}>{'}'}</T>
  );
}

/** A dashed unnamed slot: a temporary. */
function TempSlot({ x, y, label = 'temp', w = 110, h = 30, o = 1, bad = false }: { x: number; y: number; label?: string; w?: number; h?: number; o?: number; bad?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={bad ? C.cherry : 'none'} fillOpacity={bad ? 0.25 : 1} stroke={bad ? C.cherry : C.taupe} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} a="middle" f={C.latte}>{label}</T>
    </g>
  );
}

/** A lifetime bar: 6 units high, grows from x1 to x2 by `p` (0..1); its end turns cherry when `bad`. */
function LifeBar({ x1, x2, y, p, bad = false, color = C.caramel }: { x1: number; x2: number; y: number; p: number; bad?: boolean; color?: string }) {
  const w = (x2 - x1) * p;
  if (w <= 0.5) return null;
  return (
    <g>
      <rect x={x1} y={y} width={w} height={6} rx={3} fill={color} />
      {bad && <rect x={Math.max(x1, x1 + w - 26)} y={y} width={Math.min(26, w)} height={6} rx={3} fill={C.cherry} />}
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

/** A borrow edge: dashed, ending in an open dot (never an arrowhead). */
function Borrow({ x1, y1, x2, y2, o = 1, c = C.latte }: { x1: number; y1: number; x2: number; y2: number; o?: number; c?: string }) {
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={2} strokeDasharray="6 5" />
      <circle cx={x2} cy={y2} r={4} fill="none" stroke={c} strokeWidth={1.5} />
    </g>
  );
}

/** A heap payload: a bar; `freed` makes it a dashed outline, `bad` tints it cherry. */
function Payload({ x, y, w = 180, h = 30, label, freed = false, bad = false, o = 1 }: { x: number; y: number; w?: number; h?: number; label: string; freed?: boolean; bad?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={bad ? C.cherry : freed ? 'none' : C.cocoa} fillOpacity={bad ? 0.3 : 1} stroke={bad ? C.cherry : freed ? C.taupe : C.latte} strokeWidth={1.5} strokeDasharray={freed ? '5 4' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} a="middle" f={bad ? C.cherryText : freed ? C.latte : C.crema} o={freed ? 0.8 : 1}>{label}</T>
    </g>
  );
}

/** A file on disk: a 30 x 38 rectangle with a folded corner. `gone` makes it a dashed outline. */
function FileIcon({ x, y, gone = false, bad = false, o = 1 }: { x: number; y: number; gone?: boolean; bad?: boolean; o?: number }) {
  const col = bad ? C.cherryText : gone ? C.taupe : C.latte;
  return (
    <g opacity={o}>
      <path d={`M${x} ${y} h20 l10 10 v28 h-30 z`} fill={bad ? C.cherry : 'none'} fillOpacity={bad ? 0.3 : 1} stroke={col} strokeWidth={1.5} strokeDasharray={gone ? '5 4' : undefined} />
      {!gone && <path d={`M${x + 20} ${y} v10 h10`} fill="none" stroke={col} strokeWidth={1.5} />}
    </g>
  );
}

/** A counter: label in 13-unit caps, the value in the one serif face, counting up with easeOut. */
function Counter({ x, y, label, v, t, a, d = 0.6, bad = false, text }: { x: number; y: number; label: string; v?: number; t: number; a: number; d?: number; bad?: boolean; text?: string }) {
  const shown = text ?? fmt((v ?? 0) * easeOut(seg(t, a, a + d)));
  return (
    <g opacity={fa(t, a - 0.2, 0.2)}>
      <T x={x} y={y} s={13} f={C.taupe}>{label}</T>
      <T x={x} y={y + 28} s={20} f={bad ? C.cherryText : C.crema} serif w={700}>{shown}</T>
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

/** A frame (a stack frame or a scope) with a quiet label. */
function Frame({ x, y, w, h, label, stroke = C.mocha, sw = 1.5, o = 1 }: { x: number; y: number; w: number; h: number; label?: string; stroke?: string; sw?: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="none" stroke={stroke} strokeWidth={sw} />
      {label && <T x={x + 12} y={y + 20} s={13} f={C.taupe}>{label}</T>}
    </g>
  );
}

// ── 1 · One if let, two editions, one deadlock ──────────────────────────────────────────────────────────────────
const STAGE_LINES = [
  `if let Some(x) = *value.read().unwrap() {`,
  `    println!("value is {x}");`,
  `} else {`,
  `    let mut v = value.write().unwrap();`,
  `    *v = Some(true);`,
  `}`,
];
const STOPS = [
  { x: 60, l: 'read()' },
  { x: 200, l: 'then' },
  { x: 340, l: 'else' },
  { x: 480, l: 'write()' },
];

function Ruler({ y, o = 1 }: { y: number; o?: number }) {
  return (
    <g opacity={o}>
      <line x1={50} y1={y + 8} x2={540} y2={y + 8} stroke={C.mocha} strokeWidth={1.5} />
      {STOPS.map((s) => (
        <g key={s.l}>
          <line x1={s.x} y1={y + 3} x2={s.x} y2={y + 13} stroke={C.mocha} strokeWidth={1.5} />
          <T x={s.x} y={y - 6} s={13} a="middle" f={C.latte}>{s.l}</T>
        </g>
      ))}
    </g>
  );
}

export function Problem({ t, portrait }: StepCtx) {
  const g21 = easeOut(seg(t, 2.0, 3.0));
  const g24 = easeOut(seg(t, 3.4, 4.2));
  return (
    <Stack>
      {(!portrait || t < 1.4) && <Code title="stage.rs" t={t} end={1.2} lines={STAGE_LINES} highlight={t > 1.2 ? [0, 3] : []} />}
      <Svg label="The same six lines built twice: under edition 2021 the read guard lives into the else branch and write() waits forever; under 2024 it is dropped before else" h={272} fill>
        <T x={20} y={14} s={13} f={C.taupe} o={fa(t, 1.4)}>2021</T>
        <Ruler y={48} o={fa(t, 1.4)} />
        <T x={60} y={84} s={13} f={C.taupe} o={fa(t, 1.4)}>read guard</T>
        <LifeBar x1={60} x2={480} y={64} p={g21} bad={t >= 3.0} />
        <T x={540} y={96} s={15} a="end" f={C.cherryText} o={fa(t, 3.0, 0.3)}>write() waits forever</T>
        <T x={20} y={126} s={13} f={C.taupe} o={fa(t, 1.4)}>2024</T>
        <Ruler y={160} o={fa(t, 1.4)} />
        <T x={60} y={196} s={13} f={C.taupe} o={fa(t, 1.4)}>read guard</T>
        <LifeBar x1={60} x2={340} y={176} p={g24} />
        <T x={340} y={208} s={15} a="middle" f={C.caramel} o={fa(t, 4.0, 0.3)}>guard dropped here</T>
        <T x={300} y={246} s={13} a="middle" f={C.taupe} o={fa(t, 4.2, 0.6)}>same source · rustc --edition 2021 / 2024</T>
      </Svg>
    </Stack>
  );
}

// ── 2 · A destructor is two parts ───────────────────────────────────────────────────────────────────────────────
export function TwoParts({ t, portrait }: StepCtx) {
  const H = 260;
  const frameDim = t < 2.3 ? 1 : 0.6 - 0.6 * easeOut(seg(t, 4.3, 5.2));
  const pulse = 1 + 0.03 * Math.sin(Math.PI * seg(t, 2.3, 2.7));
  const ks = [collapse(t, 2.8), collapse(t, 3.3), collapse(t, 3.8)];
  const names = [
    { n: 'name', ty: 'Trace' },
    { n: 'input', ty: 'Trace' },
    { n: 'spill', ty: 'SpillFile' },
  ];
  return (
    <Stack>
      {(!portrait || t < 1.4) && (
        <Code
          title="stage.rs"
          t={t}
          end={1.1}
          lines={[`struct Trace(&'static str);          // logs its name in Drop`, `struct Stage {`, `    name: Trace,`, `    input: Trace,`, `    spill: SpillFile,                // closes + unlinks in Drop`, `}`, `impl Drop for Stage { /* logs "stage" */ }`]}
          highlight={t > 1.1 ? [2, 3, 4] : []}
        />
      )}
      <Svg label="A destructor is two parts: the type's own Drop::drop runs first, then the compiler's drop glue drops the fields in declaration order: stage, name, input, spill" h={H} fill>
        <g opacity={fa(t, 1.4) * frameDim} transform={`translate(185 100) scale(${pulse}) translate(-185 -100)`}>
          <Frame x={40} y={20} w={290} h={160} stroke={C.caramel} sw={2} />
          <T x={52} y={40} s={15} f={C.crema}>Stage</T>
        </g>
        {names.map((s, i) => (
          <Slot key={s.n} x={52} y={52 + i * 42} name={s.n} type={s.ty} w={180} o={fa(t, 1.4)} k={ks[i]} />
        ))}
        <Brace x={310} y={172} t={t} a={2.0} />
        <T x={360} y={52} s={13} f={C.taupe} o={fa(t, 4.3, 0.5)}>Drop::drop</T>
        <T x={360} y={72} s={13} f={C.taupe} o={fa(t, 4.3, 0.5)}>then drop glue:</T>
        <T x={360} y={92} s={13} f={C.taupe} o={fa(t, 4.3, 0.5)}>fields in order</T>
        <Timeline h={H} o={fa(t, 1.4)} />
        <Badge x={90} y={TLY(H)} n={1} name="stage" t={t} a={2.3} hi />
        <Badge x={200} y={TLY(H)} n={2} name="name" t={t} a={2.8} />
        <Badge x={310} y={TLY(H)} n={3} name="input" t={t} a={3.3} />
        <Badge x={420} y={TLY(H)} n={4} name="spill" t={t} a={3.8} />
      </Svg>
    </Stack>
  );
}

// ── 3 · Three locals, which dies first? (predict) ───────────────────────────────────────────────────────────────
export function ThreeLocals({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 400;
  const y = TLY(H);
  const lines = [`let a = Trace("a");`, `let b = Trace("b");`, `let c = Trace("c");`];
  return (
    <Svg label="Locals drop in reverse declaration order: c first, then b, then a" h={H}>
      {lines.map((l, i) => (
        <T key={i} x={40} y={50 + i * 42} s={15} f={C.crema} o={fa(t, 0.1 + i * 0.2, 0.2)}>{l}</T>
      ))}
      <T x={40} y={176} s={20} f={C.latte} w={600} o={fa(t, 0.7, 0.2)}>{'}'}</T>
      {['a', 'b', 'c'].map((n, i) => (
        <g key={n}>
          <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
            <Slot x={300} y={30 + i * 42} name={n} type="Trace" o={fa(t, 0.1 + i * 0.2, 0.2)} />
          </g>
          <g style={rv(ans)}>
            <Slot x={300} y={30 + i * 42} name={n} state="dropped" n={3 - i} />
          </g>
        </g>
      ))}
      <Brace x={385} y={176} t={t} a={0.8} keep={false} />
      <Timeline h={H} />
      <g style={rv(ans, 0.05)}>
        <Badge x={150} y={y} n={1} name="c" t={99} hi />
        <Badge x={270} y={y} n={2} name="b" t={99} />
        <Badge x={390} y={y} n={3} name="a" t={99} />
        <T x={300} y={236} s={15} a="middle" f={C.caramel} w={600}>reverse declaration order</T>
      </g>
    </Svg>
  );
}

// ── 4 · A value dies where its last owner ends ──────────────────────────────────────────────────────────────────
export function LastOwner({ t, portrait }: StepCtx) {
  const H = 250;
  const slide = easeOutBack(seg(t, 2.0, 2.6));
  const mX = lerp(45, 335, slide);
  const mY = lerp(50, 44, slide);
  const nSlide = easeOut(seg(t, 3.4, 3.8));
  const nX = lerp(45, 335, nSlide);
  const nY = lerp(96, 136, nSlide);
  return (
    <Stack>
      {(!portrait || t < 1.4) && (
        <Code
          title="main.rs"
          t={t}
          end={1.1}
          lines={[`fn consume(t: Trace) { }        // t dies here`, ``, `let m = Trace("m");`, `let n = Trace("n");`, `consume(m);                      // m moved in`, `drop(n);                         // = fn drop<T>(_x: T) {}`, `// n gone, m gone, nothing left`]}
        />
      )}
      <Svg label="A value dies where its last owner's scope ends: m dies at the end of consume, n dies inside mem::drop, and main's brace drops nothing" h={H} fill>
        <g opacity={fa(t, 1.4)}>
          <Frame x={30} y={20} w={240} h={130} label="MAIN" />
          <Frame x={320} y={20} w={216} h={80} label="consume" />
          <Brace x={520} y={99} t={t} a={2.8} />
        </g>
        <Slot x={45} y={50} name="m" state={t >= 2.6 ? 'moved' : 'live'} o={fa(t, 1.4)} w={190} />
        <Slot x={45} y={96} name="n" state={t >= 3.4 ? 'moved' : 'live'} o={fa(t, 1.4)} w={190} />
        {t >= 2.0 && <Slot x={mX} y={mY} name="m" w={190} k={t < 2.8 ? 1 : collapse(t, 2.8)} />}
        {t >= 3.4 && (
          <g opacity={fa(t, 3.4, 0.2)}>
            <Frame x={320} y={108} w={216} h={72} label="drop" />
          </g>
        )}
        {t >= 3.4 && <Slot x={nX} y={nY} name="n" w={190} k={t < 3.8 ? 1 : collapse(t, 3.8)} />}
        <T x={150} y={170} s={13} a="middle" f={C.latte} o={fa(t, 4.3, 0.4)}>nothing to drop</T>
        <Timeline h={H} o={fa(t, 1.4)} />
        <Badge x={100} y={TLY(H)} n={1} name="m" t={t} a={2.8} />
        <Badge x={200} y={TLY(H)} n={2} name="n" t={t} a={3.8} />
      </Svg>
    </Stack>
  );
}

// ── 5 · Can you call x.drop() yourself? (predict) ───────────────────────────────────────────────────────────────
export function ManualDrop({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 360;
  const pulse = 0.6 + 0.4 * Math.sin(Math.PI * seg(t, 0.8, 1.2));
  return (
    <Svg label="Calling x.drop() by hand is rejected with E0040, explicit use of destructor method; drop(x) moves x in so nothing is left to drop twice" h={H}>
      <CodeLines x={40} y={36} lines={[`impl Drop for Foo {`, `    fn drop(&mut self) { /* kaboom */ }`, `}`]} o={fa(t, 0, 0.5)} />
      <T x={40} y={130} s={15} f={C.crema} o={fa(t, 0.3, 0.4)}>let x = Foo;</T>
      <g style={{ opacity: ans ? 0.55 : 1, transition: 'opacity .15s' }}>
        <T x={40} y={158} s={15} f={C.caramel} w={600} o={fa(t, 0.4, 0.4) * (ans ? 1 : 0.55 + 0.45 * pulse)}>x.drop();</T>
      </g>
      {ans && <line x1={38} y1={153} x2={122} y2={153} stroke={C.cherry} strokeWidth={2.5} />}
      <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
        <Slot x={330} y={120} name="x" type="Foo" o={fa(t, 0.3, 0.4)} />
      </g>
      <g style={rv(ans)}>
        <Slot x={330} y={120} name="x" state="dropped" n={1} />
        <T x={140} y={158} s={15} f={C.cherryText} w={600}>E0040</T>
        <T x={40} y={192} s={15} f={C.caramel} w={600}>{'drop(x);'}</T>
        <T x={40} y={228} s={13} f={C.latte}>explicit use of destructor method</T>
      </g>
      <Timeline h={H} />
      <g style={rv(ans, 0.05)}>
        <Badge x={150} y={TLY(H)} n={1} name="x" t={99} hi />
      </g>
    </Svg>
  );
}

// ── 6 · Exactly once: why Copy and Drop never meet ──────────────────────────────────────────────────────────────
export function CopyDrop({ t }: StepCtx) {
  const H = 456;
  const yA = 184;
  const yB = 396;
  const dim = 1 - 0.4 * easeOut(seg(t, 4.0, 5.0));
  const bad = t >= 1.6;
  return (
    <Svg label="If a type with a destructor could be Copy, two owners would close the same resource twice; Rust allows one owner, a move empties the source, and Copy with Drop is rejected as E0184" h={H}>
      <g opacity={dim}>
        <T x={24} y={22} s={13} f={C.taupe} o={fa(t, 0, 0.4)}>IF Fd WERE Copy</T>
        <g opacity={fa(t, 0, 0.5)}>
          <Slot x={40} y={50} name="a" type="Fd" w={170} />
          <Slot x={40} y={96} name="b = a" w={170} />
          <Owner x1={210} y1={69} x2={380} y2={78} />
          <Owner x1={210} y1={115} x2={380} y2={92} />
          <Payload x={380} y={60} w={130} h={40} label="File (4 bytes)" bad={bad && t >= 1.6} />
          <Brace x={520} y={150} t={t} a={1.0} />
        </g>
        <T x={40} y={146} s={15} f={C.cherryText} w={600} o={fa(t, 1.6, 0.3)}>E0184</T>
        <T x={445} y={124} s={15} a="middle" f={C.cherryText} o={fa(t, 1.8, 0.3)}>closed twice</T>
        <Timeline h={yA + 54} label={false} x1={40} x2={540} />
        <Badge x={300} y={yA} n={1} name="close" t={t} a={1.0} />
        <Badge x={400} y={yA} n={2} name="close" t={t} a={1.6} bad />
      </g>
      <g opacity={fa(t, 2.6, 0.5)}>
        <T x={24} y={246} s={13} f={C.caramel}>RUST</T>
        <Slot x={40} y={262} name="a" state="moved" w={170} />
        <Slot x={40} y={308} name="b" type="Fd" w={170} look />
        <Owner x1={210} y1={327} x2={380} y2={290} />
        <Payload x={380} y={270} w={130} h={40} label="File (4 bytes)" />
        <Brace x={520} y={352} t={t} a={3.2} />
        <T x={125} y={366} s={13} a="middle" f={C.latte} o={fa(t, 3.2, 0.4)}>nothing to drop</T>
      </g>
      <Timeline h={yB + 54} label={false} o={fa(t, 2.6, 0.5)} />
      <Badge x={300} y={yB} n={1} name="close" t={t} a={3.2} hi />
    </Svg>
  );
}

// ── 7 · SpillFile: an OS resource with one owner ────────────────────────────────────────────────────────────────
export function Spill({ t, portrait }: StepCtx) {
  const H = 250;
  const fx = [30, 220, 410];
  const slotX = (i: number) => fx[i] + 10;
  const seg1 = easeOut(seg(t, 2.1, 2.5));
  const seg2 = easeOut(seg(t, 2.7, 3.1));
  const seg3 = easeOut(seg(t, 3.3, 3.7));
  let x = slotX(0);
  x = lerp(x, slotX(1), seg1);
  x = lerp(x, slotX(2), seg2);
  x = lerp(x, slotX(0), seg3);
  const closed = t >= 3.9;
  const k = t < 3.9 ? 1 : collapse(t, 3.9);
  const where = t < 2.1 ? 0 : t < 2.7 ? (seg1 > 0.5 ? 1 : 0) : t < 3.3 ? (seg2 > 0.5 ? 2 : 1) : seg3 > 0.5 ? 0 : 2;
  const visited = [0, 1, 2].map((i) => (i === 0 ? t >= 2.1 && where !== 0 : i === 1 ? t >= 2.7 && where !== 1 : t >= 3.3 && where !== 2));
  return (
    <Stack>
      {(!portrait || t < 1.5) && (
        <Code
          title="spill.rs"
          t={t}
          end={1.2}
          lines={[`struct SpillFile { path: PathBuf, file: File }`, `impl Drop for SpillFile {`, `    fn drop(&mut self) {`, `        let _ = fs::remove_file(&self.path);`, `        CLOSES.fetch_add(1, Relaxed);`, `    }   // then drop glue closes \`file\``, `}`, `fn pass(s: SpillFile) -> SpillFile { s }`, `let s = pass(pass(SpillFile::create(p)?));`]}
        />
      )}
      <Svg label="A SpillFile passed through two functions and back is closed and unlinked exactly once: the closes counter stops at 1 and the file is gone" h={H} fill>
        {['main', 'pass', 'pass'].map((l, i) => (
          <Frame key={i} x={fx[i]} y={12} w={i === 2 ? 126 : 160} h={84} label={l} o={fa(t, 1.5)} />
        ))}
        <Brace x={176} y={90} t={t} a={3.9} />
        {visited.map((v, i) => v && <Slot key={i} x={slotX(i)} y={44} w={i === 2 ? 106 : 140} name="s" state="moved" o={fa(t, 1.5)} />)}
        {closed && k < 0.05 && <Slot x={slotX(0)} y={44} w={140} name="s" state="dropped" n={1} />}
        <Slot x={x} y={44} w={where === 2 ? 106 : 140} name="s" type={where === 2 ? undefined : 'SpillFile'} k={k} o={fa(t, 1.5)} look />
        <g opacity={fa(t, 1.5)}>
          <FileIcon x={40} y={108} gone={closed} />
          <T x={80} y={132} s={13} f={closed ? C.taupe : C.latte}>/tmp/…/spill</T>
        </g>
        <Counter x={400} y={112} label="CLOSES" v={closed ? 1 : 0} t={t} a={3.9} d={0.3} text={closed ? '1' : '0'} />
        <T x={30} y={162} s={13} f={C.latte} o={fa(t, 4.5, 0.6)}>File: 4 bytes, the descriptor · SpillFile: 32 bytes</T>
        <Timeline h={H} o={fa(t, 1.5)} />
        <Badge x={120} y={TLY(H)} n={1} name="spill" t={t} a={3.9} hi />
      </Svg>
    </Stack>
  );
}

// ── 8 · Which goes first, the file or its directory? (predict) ─────────────────────────────────────────────────
export function FieldOrder({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 400;
  return (
    <Svg label="Fields drop in declaration order, so the directory field is dropped first while the file is still inside: remove_dir fails and the directory is left on disk" h={H}>
      <CodeLines x={24} y={32} s={13} step={22} lines={[`struct Spool {`, `    dir: SpillDir,     // remove_dir in Drop`, `    spill: SpillFile,  // remove_file in Drop`, `}`]} o={fa(t, 0, 0.5)} />
      <g opacity={fa(t, 0.2, 0.5)}>
        <Frame x={396} y={16} w={140} h={108} label="Spool" />
        <Slot x={406} y={46} w={120} name="dir" />
        <Slot x={406} y={86} w={120} name="spill" />
      </g>
      <g opacity={fa(t, 0.9, 0.5)}>
        <rect x={40} y={176} width={260} height={130} rx={10} fill={ans ? C.cherry : 'none'} fillOpacity={ans ? 0.2 : 1} stroke={ans ? C.cherryText : C.latte} strokeWidth={1.5} style={{ transition: 'fill .15s, stroke .15s' }} />
        <T x={52} y={196} s={13} f={C.latte}>spool/</T>
        <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
          <FileIcon x={60} y={226} />
        </g>
        <g style={rv(ans)}>
          <FileIcon x={60} y={226} gone />
        </g>
        <T x={104} y={250} s={13} f={C.latte}>spill.bin</T>
      </g>
      <g style={rv(ans)}>
        <T x={190} y={292} s={15} a="middle" f={C.cherryText} w={600}>left behind</T>
        <T x={24} y={140} s={13} f={C.caramel}>fix: declare spill before dir</T>
      </g>
      <Timeline h={H} />
      <g style={rv(ans, 0.05)}>
        <Badge x={150} y={TLY(H)} n={1} name="dir" t={99} hi />
        <Badge x={270} y={TLY(H)} n={2} name="spill" t={99} />
      </g>
    </Svg>
  );
}

// ── 9 · Temporaries die at the semicolon ────────────────────────────────────────────────────────────────────────
export function Temporaries({ t }: StepCtx) {
  const H = 392;
  const rows = [
    { y0: 20, code: [`m.lock().unwrap().push(1);`], to: 456, end: ';', label: 'guard dropped · try_lock ok', a: 1.6 },
    { y0: 146, code: [`let r = &Trace("ext");`, `}`], to: 536, end: '}', label: 'extended to the block', a: 2.8 },
    { y0: 272, code: [`match m.lock().unwrap().len() {`, `  n => { … try_lock fails … }`, `}`], to: 536, end: '}', label: 'lives to the end of the statement', a: 4.0 },
  ];
  return (
    <Svg label="A temporary dies at the semicolon, a let that borrows it extends it to the end of the block, and a match scrutinee's temporary lives to the end of the whole match statement" h={H}>
      {rows.map((r, i) => {
        const p = easeOut(seg(t, r.a, r.a + 1.0));
        const x2 = r.to;
        return (
          <g key={i}>
            <g opacity={fa(t, 0.4 + i * 0.4, 0.4)}>
              <CodeLines x={24} y={r.y0 + 14} s={13} step={22} lines={r.code} />
              <TempSlot x={320} y={r.y0} />
            </g>
            <g opacity={fa(t, 0.4 + i * 0.4, 0.4)}>
              <line x1={320} y1={r.y0 + 44} x2={536} y2={r.y0 + 44} stroke={C.mocha} strokeWidth={1} />
            </g>
            <LifeBar x1={320} x2={x2} y={r.y0 + 41} p={p} />
            {i === 2 && <LifeBar x1={420} x2={536} y={r.y0 + 41} p={easeOut(seg(t, 5.0, 5.6)) * Math.min(1, p * 1.2)} color={C.cinnamon} />}
            {p > 0.98 && <T x={x2} y={r.y0 + 38} s={15} a="middle" f={C.crema} o={fa(t, r.a + 1.0, 0.2)}>{r.end}</T>}
            {i === 2 && <line x1={420} y1={r.y0 + 34} x2={420} y2={r.y0 + 54} stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 0.8 + i * 0.4, 0.4)} />}
            {i === 2 && <T x={420} y={r.y0 + 70} s={13} a="middle" f={C.taupe} o={fa(t, 0.8 + i * 0.4, 0.4)}>arm</T>}
            <T x={24} y={r.y0 + 88} s={13} f={C.latte} o={fa(t, r.a + 1.0, 0.4)}>{r.label}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 10 · What does cargo fix --edition do to it? (predict) ─────────────────────────────────────────────────────
export function CargoFix({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const g21 = easeOut(seg(t, 0.4, 1.0));
  return (
    <Stack>
      {!(portrait && ans) && <Code title="stage.rs · 2021" t={t} end={1.0} lines={STAGE_LINES} />}
      <Svg label="cargo fix --edition rewrites the if let into a match that keeps the 2021 drop order, so the read guard still reaches write() and the deadlock stays" h={ans ? 300 : 190} fill>
        <T x={300} y={18} s={13} a="middle" f={C.caramel} o={fa(t, 1.0, 0.4)}>warning: if_let_rescope</T>
        <T x={20} y={50} s={13} f={C.taupe}>{ans ? '2024 after cargo fix' : '2021'}</T>
        <Ruler y={84} />
        <T x={60} y={118} s={13} f={C.taupe}>read guard</T>
        <LifeBar x1={60} x2={480} y={100} p={g21} bad={g21 > 0.98} />
        <T x={540} y={132} s={15} a="end" f={C.cherryText} o={fa(t, 1.0, 0.3)}>write() waits forever</T>
        <g style={rv(ans)}>
          <CodeLines x={40} y={170} s={14} step={22} lines={[`match *value.read().unwrap() {`, `    Some(x) => { … }`, `    _ => { … write() … }`, `}`]} />
          <T x={300} y={278} s={13} a="middle" f={C.latte}>preserves the 2021 drop order</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 11 · Rust 2024: two shorter temporary scopes ────────────────────────────────────────────────────────────────
function Lane({ y, year, badges, t, a, hiIdx }: { y: number; year: string; badges: [string, string?][]; t: number; a: number; hiIdx: number }) {
  const xs = badges.length === 3 ? [190, 320, 450] : [230, 400];
  return (
    <g>
      <T x={24} y={y + 5} s={13} f={C.taupe}>{year}</T>
      <line x1={80} y1={y} x2={540} y2={y} stroke={C.taupe} strokeWidth={1.5} />
      {badges.map((b, i) => (
        <Badge key={i} x={xs[i]} y={y} n={i + 1} name={b[0]} t={t} a={a + i * 0.5} hi={i === hiIdx} />
      ))}
    </g>
  );
}

export function TwoChanges({ t }: StepCtx) {
  return (
    <Svg label="Rust 2024 ends two temporaries sooner: an if let scrutinee temporary now drops before else, and a tail-expression temporary drops before the block's locals" h={478}>
      <T x={24} y={24} s={13} f={C.taupe}>{'if let … else'}</T>
      <Lane y={72} year="2021" t={t} a={0.4} hiIdx={0} badges={[['else'], ['guard'], ['after-if']]} />
      <Lane y={154} year="2024" t={t} a={1.6} hiIdx={0} badges={[['guard'], ['else'], ['after-if']]} />
      <T x={24} y={206} s={13} f={C.latte} o={fa(t, 4.6, 0.5)}>scrutinee temporaries drop before else</T>
      <line x1={24} y1={226} x2={536} y2={226} stroke={C.mocha} strokeWidth={1} />
      <T x={24} y={254} s={13} f={C.taupe}>{'{ let local; tail() }'}</T>
      <Lane y={304} year="2021" t={t} a={3.0} hiIdx={1} badges={[['local'], ['tail']]} />
      <Lane y={384} year="2024" t={t} a={3.8} hiIdx={0} badges={[['tail'], ['local']]} />
      <T x={24} y={446} s={13} f={C.latte} o={fa(t, 4.6, 0.5)}>tail temporaries drop before the locals</T>
    </Svg>
  );
}

// ── 12 · c.borrow().len() as a tail expression (predict) ───────────────────────────────────────────────────────
export function TailRefCell({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 400;
  const pulse = 0.55 + 0.45 * Math.sin(Math.PI * seg(t, 0.8, 1.4));
  const ly = [196, 330];
  return (
    <Svg label="A RefCell borrow as the tail expression compiles only under 2024: in 2021 the Ref temporary outlives the local c and rustc reports E0597; in 2024 it drops first" h={H}>
      <CodeLines x={40} y={34} lines={[`fn f() -> usize {`, `    let c = RefCell::new("..");`, `    c.borrow().len()`, `}`]} step={24} o={fa(t, 0, 0.5)} />
      <rect x={34} y={66} width={250} height={26} rx={5} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={ans ? 0 : pulse} />
      {['2021', '2024'].map((yr, i) => (
        <g key={yr} opacity={fa(t, 0.5 + i * 0.2, 0.4)}>
          <T x={24} y={ly[i] - 20} s={13} f={C.taupe}>{yr}</T>
          <line x1={60} y1={ly[i]} x2={540} y2={ly[i]} stroke={C.taupe} strokeWidth={1.5} />
        </g>
      ))}
      <g style={rv(ans)}>
        <Badge x={170} y={ly[0]} n={1} name="c" t={99} />
        <Badge x={310} y={ly[0]} n={2} name="Ref" t={99} bad />
        <T x={400} y={ly[0] + 5} s={15} f={C.cherryText} w={600}>E0597</T>
        <T x={60} y={ly[0] + 56} s={13} f={C.latte}>the temporary is part of an expression</T>
        <T x={60} y={ly[0] + 76} s={13} f={C.latte}>at the end of a block</T>
        <Badge x={170} y={ly[1]} n={1} name="Ref" t={99} hi />
        <Badge x={310} y={ly[1]} n={2} name="c" t={99} />
        <T x={400} y={ly[1] + 5} s={17} f={C.crema} w={600}>prints 2</T>
      </g>
    </Svg>
  );
}

// ── 13 · Drop flags: when only the run knows ────────────────────────────────────────────────────────────────────
export function DropFlags({ t, portrait }: StepCtx) {
  const H = 250;
  const flip = t >= 1.9;
  return (
    <Stack>
      {(!portrait || t < 1.3) && (
        <Code title="flag.rs" t={t} end={1.0} lines={[`let t = Trace("cond");`, `if flag {`, `    consume(t);          // moved on this path only`, `}`, `let z = Trace("z");`, `// } : drop z; drop t only if still here`]} />
      )}
      <Svg label="When a value is moved on only one path, the compiler keeps a one-bit drop flag on the stack and checks it at the closing brace: the MIR shows const true, const false and a switchInt" h={H} fill>
        <Slot x={30} y={20} w={160} name="t" type="Trace" look o={fa(t, 1.3)} />
        <g opacity={fa(t, 1.3)}>
          <rect x={200} y={31} width={16} height={16} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={208} y={44} s={13} a="middle" f={C.crema}>{flip ? '0' : '1'}</T>
          <T x={226} y={44} s={13} f={C.taupe}>flag</T>
        </g>
        {/* the true path */}
        <T x={30} y={84} s={13} f={C.taupe} o={fa(t, 1.9, 0.4)}>flag = true</T>
        <line x1={40} y1={104} x2={330} y2={104} stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 1.9, 0.4)} />
        <Badge x={110} y={104} n={1} name="cond" t={t} a={2.0} />
        <Badge x={230} y={104} n={2} name="z" t={t} a={3.1} />
        <T x={250} y={84} s={13} f={C.latte} o={fa(t, 3.1, 0.4)}>skipped: flag 0</T>
        {/* the false path */}
        <T x={30} y={160} s={13} f={C.taupe} o={fa(t, 2.9, 0.4)}>flag = false</T>
        <line x1={40} y1={186} x2={330} y2={186} stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 2.9, 0.4)} />
        <Badge x={110} y={186} n={1} name="z" t={t} a={3.1} />
        <Badge x={230} y={186} n={2} name="cond" t={t} a={3.6} />
        <g opacity={fa(t, 3.9, 0.7)}>
          <T x={360} y={112} s={13} f={C.taupe}>MIR</T>
          <T x={360} y={136} s={13} f={C.latte}>_5 = const true;</T>
          <T x={360} y={158} s={13} f={C.latte}>_5 = const false;</T>
          <T x={360} y={180} s={13} f={C.latte}>switchInt(copy _5)</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 14 · Unwinding drops; exit does not ─────────────────────────────────────────────────────────────────────────
export function Unwinding({ t }: StepCtx) {
  const lanes = [
    { y: 18, l: 'return', code: '0', drops: true },
    { y: 114, l: 'panic!', code: '101', drops: true },
    { y: 210, l: 'process::exit(3)', code: '3', drops: false },
    { y: 306, l: 'panic! with panic=abort', code: '134', drops: false },
  ];
  return (
    <Svg label="Destructors run on a normal return and during a panic's unwinding, but not after process::exit or with panic set to abort" h={420}>
      {lanes.map((ln, i) => {
        const a = 0.6 + i * 1.0;
        const kb = collapse(t, a + 0.3);
        const ka = collapse(t, a + 0.7);
        const gone = t >= a + 0.3;
        return (
          <g key={ln.l}>
            <g opacity={fa(t, i * 0.2, 0.4)}>
              <T x={24} y={ln.y + 14} s={13} f={C.taupe}>{ln.l}</T>
              <line x1={190} y1={ln.y + 56} x2={500} y2={ln.y + 56} stroke={C.taupe} strokeWidth={1.5} />
            </g>
            {ln.drops ? (
              <>
                <Slot x={24} y={ln.y + 30} w={64} h={32} name="a" k={ka} o={fa(t, i * 0.2, 0.4)} />
                <Slot x={100} y={ln.y + 30} w={64} h={32} name="b" k={kb} o={fa(t, i * 0.2, 0.4)} />
                <Badge x={290} y={ln.y + 56} n={1} name="b" t={t} a={a + 0.3} />
                <Badge x={400} y={ln.y + 56} n={2} name="a" t={t} a={a + 0.7} />
              </>
            ) : (
              <>
                <Slot x={24} y={ln.y + 30} w={64} h={32} name="a" word={false} state={gone ? 'forgotten' : 'live'} o={fa(t, i * 0.2, 0.4)} />
                <Slot x={100} y={ln.y + 30} w={64} h={32} name="b" word={false} state={gone ? 'forgotten' : 'live'} o={fa(t, i * 0.2, 0.4)} />
                <T x={340} y={ln.y + 40} s={13} a="middle" f={C.cherryText} o={fa(t, a + 0.5, 0.4)}>no destructor ran</T>
              </>
            )}
            <T x={536} y={ln.y + 60} s={17} a="end" f={C.crema} w={700} o={fa(t, a + 0.9, 0.3)}>{ln.code}</T>
            <T x={536} y={ln.y + 36} s={13} a="end" f={C.taupe} o={fa(t, a + 0.9, 0.3)}>exit code</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 15 · mem::forget: the destructor you skip ───────────────────────────────────────────────────────────────────
export function Forget({ t, portrait }: StepCtx) {
  const H = 250;
  const gone = easeOut(seg(t, 2.2, 2.8));
  const tint = fa(t, 3.6, 0.5);
  return (
    <Stack>
      {(!portrait || t < 1.3) && (
        <Code
          title="leak.rs"
          t={t}
          end={1.0}
          lines={[`let before = allocs() - deallocs();`, `{`, `    let s = SpillFile::create(path())?;`, `    std::mem::forget(s);     // safe. No drop.`, `}`]}
          highlight={t > 2.2 ? [3] : []}
        />
      )}
      <Svg label="mem::forget(spill) compiles in safe code: the slot fades with no destructor, the path's allocation is never freed and the file stays open and on disk" h={H} fill>
        <Frame x={24} y={14} w={300} h={78} label="main" o={fa(t, 1.3)} />
        <Slot x={40} y={40} w={200} name="s" type="SpillFile" look={t < 2.2} state={t >= 2.8 ? 'forgotten' : 'live'} o={fa(t, 1.3)} />
        <Owner x1={240} y1={59} x2={350} y2={50} o={fa(t, 1.3) * (1 - gone)} />
        <Owner x1={240} y1={59} x2={360} y2={120} o={fa(t, 1.3) * (1 - gone)} />
        <Payload x={350} y={36} w={180} label="path bytes" bad={tint > 0.5} o={fa(t, 1.3)} />
        <FileIcon x={362} y={104} bad={tint > 0.5} o={fa(t, 1.3)} />
        <T x={350} y={84} s={13} f={C.cherryText} o={tint}>1 allocation leaked</T>
        <T x={404} y={128} s={13} f={C.cherryText} o={tint}>still on disk</T>
        <Counter x={40} y={112} label="ALLOCS · FREED" text="1 · 0" t={t} a={4.4} d={0.1} bad />
        <Counter x={210} y={112} label="CLOSES" text="1" t={t} a={1.5} d={0.1} />
        <Timeline h={H} label={false} o={fa(t, 1.3)} />
        <T x={290} y={TLY(H) - 14} s={15} a="middle" f={C.cherryText} o={fa(t, 3.0, 0.3)}>no destructor ran</T>
      </Svg>
    </Stack>
  );
}

// ── 16 · Which of these needs unsafe? (predict) ─────────────────────────────────────────────────────────────────
export function WhichUnsafe({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 372;
  const rows = [`mem::forget(s);`, `Box::leak(Box::new(s));`, `let a = Rc::new(..); // in a cycle`, `process::exit(0);`];
  return (
    <Svg label="None of the four ways to skip a destructor needs unsafe: forget, Box::leak, an Rc cycle and process::exit are all safe; only ManuallyDrop::drop is unsafe" h={H}>
      {rows.map((r, i) => (
        <g key={r}>
          <T x={24} y={40 + i * 50} s={15} f={C.crema} o={fa(t, i * 0.2, 0.3)}>{r}</T>
          <g opacity={fa(t, i * 0.2, 0.3)}>
            <Slot x={396} y={18 + i * 50} w={120} h={30} name="s" state="forgotten" />
          </g>
          <g style={rv(ans, i * 0.02)}>
            <T x={388} y={40 + i * 50} s={20} a="end" f={C.caramel} w={700}>✓</T>
            <T x={530} y={64 + i * 50} s={13} a="end" f={C.latte}>safe</T>
          </g>
        </g>
      ))}
      <g style={rv(ans, 0.05)}>
        <T x={24} y={252} s={14} f={C.cherryText} w={600}>unsafe {'{'} ManuallyDrop::drop(&amp;mut m) {'}'}</T>
        <T x={24} y={276} s={13} f={C.cherryText}>the only unsafe one: it can drop twice</T>
      </g>
      <Timeline h={H} />
    </Svg>
  );
}

// ── 17 · ManuallyDrop and Box::leak, on purpose ─────────────────────────────────────────────────────────────────
export function OnPurpose({ t }: StepCtx) {
  const H = 400;
  const latchUp = easeOut(seg(t, 1.6, 2.0));
  const into = t >= 1.6;
  const k = t < 2.0 ? 1 : collapse(t, 2.0);
  const cut = fa(t, 3.2, 0.3);
  return (
    <Svg label="ManuallyDrop keeps the same bytes but never drops automatically until into_inner hands the value back; Box::leak cuts the owner and keeps the bytes for the whole program, allocated and never freed" h={H}>
      <g opacity={fa(t, 0.3, 0.5)}>
        <CodeLines x={24} y={30} s={13} step={22} lines={[`let m = ManuallyDrop::new(spill);`, `let s = ManuallyDrop::into_inner(m); drop(s);`]} />
        <Slot x={40} y={72} w={190} name={into ? 's' : 'm'} type={into ? undefined : 'ManuallyDrop'} k={k} look />
        {!into && <rect x={206} y={66} width={18} height={12} rx={3} fill={C.caramel} />}
        {into && <rect x={206} y={60 - 8 * latchUp} width={18} height={12} rx={3} fill={C.caramel} opacity={1 - latchUp} />}
        <Brace x={260} y={96} t={t} a={1.0} />
        <Counter x={400} y={56} label="CLOSES" text={t >= 2.0 ? '2' : '1'} t={t} a={0.5} d={0.1} />
        <Timeline h={190} label={false} />
        <Badge x={300} y={TLY(190)} n={1} name="spill" t={t} a={2.0} hi />
      </g>
      <line x1={24} y1={206} x2={536} y2={206} stroke={C.mocha} strokeWidth={1} opacity={fa(t, 2.6, 0.4)} />
      <g opacity={fa(t, 2.6, 0.5)}>
        <CodeLines x={24} y={236} s={13} step={22} lines={[`let r: &'static mut [u8; 64] =`, `    Box::leak(Box::new([7u8; 64]));`]} />
        <Slot x={40} y={284} w={160} name="r" type="&mut" />
        <Borrow x1={200} y1={303} x2={318} y2={303} c={C.cinnamon} />
        <Payload x={322} y={288} w={200} label={`'static · 64 bytes`} />
        <path d={`M300 297 l12 12 m0 -12 l-12 12`} stroke={C.cherryText} strokeWidth={2} fill="none" opacity={cut} />
        <Counter x={40} y={330} label="ALLOCS · FREED" text="1 · 0" t={t} a={3.4} d={0.1} />
        <T x={300} y={366} s={13} a="middle" f={C.latte} o={fa(t, 3.8, 0.5)}>freed never, by design</T>
      </g>
    </Svg>
  );
}

// ── 18 · The leakpocalypse of 2015 ──────────────────────────────────────────────────────────────────────────────
export function Leakpocalypse({ t }: StepCtx) {
  const H = 420;
  const forgot = t >= 2.0;
  const freed = t >= 2.8;
  const kd = t < 2.8 ? 1 : collapse(t, 2.8);
  const bad = t >= 3.4;
  return (
    <Svg label="In 2015 thread::scoped relied on a JoinGuard destructor to join the child; forgetting the guard in safe code let the parent's frame die while the child still borrowed from it, a use after free" h={H}>
      <T x={536} y={14} s={13} a="end" f={C.taupe}>2015</T>
      <g opacity={fa(t, 0, 0.6)}>
        <Frame x={30} y={20} w={270} h={246} label="parent" />
        <Payload x={46} y={104} w={200} h={30} label="heap: Vec<u32>" freed={freed} />
        <rect x={470} y={40} width={12} height={250} rx={4} fill={C.latte} opacity={0.7} />
        <T x={476} y={32} s={13} a="middle" f={C.latte}>child thread</T>
      </g>
      <Slot x={46} y={52} w={200} name="data" type="Vec<u32>" k={kd} o={fa(t, 0, 0.6)} />
      <Slot x={46} y={160} w={220} name="guard" type="JoinGuard" state={forgot ? 'forgotten' : 'live'} o={fa(t, 0, 0.6)} />
      <Borrow x1={470} y1={120} x2={250} y2={120} c={bad ? C.cherry : C.latte} o={fa(t, 0, 0.6)} />
      <T x={46} y={214} s={13} f={C.latte} o={fa(t, 1.2, 0.4) * (forgot ? 0.4 : 1)}>Drop joins the child</T>
      <T x={30} y={292} s={15} f={C.crema} o={fa(t, 2.0, 0.3)}>mem::forget(guard);</T>
      <Brace x={280} y={290} t={t} a={2.8} />
      <T x={385} y={212} s={15} a="middle" f={C.cherryText} w={600} o={fa(t, 3.4, 0.3)}>use after free</T>
      <T x={536} y={318} s={13} a="end" f={C.latte} o={fa(t, 4.2, 0.6)}>safe code · no unsafe anywhere</T>
      <T x={536} y={338} s={13} a="end" f={C.latte} o={fa(t, 4.4, 0.6)}>RFC 1066: destructors are never guaranteed</T>
      <Timeline h={H} />
      <Badge x={120} y={TLY(H)} n={1} name="data" t={t} a={2.8} />
    </Svg>
  );
}

// ── 19 · Leak-safe: join in a call, not in a Drop ───────────────────────────────────────────────────────────────
export function JoinInCall({ t }: StepCtx) {
  const H = 410;
  const ends = fa(t, 1.4, 0.8);
  const lenZero = t >= 3.0;
  const drainOn = t >= 3.0 && t < 3.8;
  const forgot = t >= 3.8;
  return (
    <Svg label="thread::scope joins every child before it returns, so a forgotten handle cannot break it; a Vec sets its length to zero before it hands out a Drain proxy, so a forgotten proxy only leaks" h={H}>
      <g opacity={fa(t, 0, 0.6)}>
        <Frame x={30} y={14} w={310} h={200} />
        <T x={44} y={34} s={13} f={C.taupe}>{'thread::scope(|s| { … })'}</T>
        {[100, 220].map((x, i) => (
          <g key={x}>
            <rect x={x} y={56} width={12} height={110} rx={4} fill={C.latte} opacity={0.7 - 0.45 * ends} />
            <T x={x + 6} y={188} s={13} a="middle" f={C.latte} o={ends}>joined</T>
          </g>
        ))}
        <Slot x={370} y={56} w={150} name="data" type="Vec" />
        <path d="M106 56 V44 H350 L366 64" fill="none" stroke={C.latte} strokeWidth={2} strokeDasharray="6 5" />
        <path d="M226 56 V50 H340 L366 76" fill="none" stroke={C.latte} strokeWidth={2} strokeDasharray="6 5" />
        <circle cx={366} cy={64} r={4} fill="none" stroke={C.latte} strokeWidth={1.5} />
        <circle cx={366} cy={76} r={4} fill="none" stroke={C.latte} strokeWidth={1.5} />
      </g>
      <rect x={30} y={14} width={310} height={200} rx={12} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={fa(t, 2.4, 0.4)} />
      <T x={44} y={206} s={13} f={C.caramel} o={fa(t, 2.4, 0.4)}>joins every child, then returns</T>
      <line x1={24} y1={236} x2={536} y2={236} stroke={C.mocha} strokeWidth={1} opacity={fa(t, 2.8, 0.4)} />
      <g opacity={fa(t, 2.8, 0.4)}>
        <rect x={40} y={256} width={230} height={38} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={52} y={280} s={15} f={C.crema} w={600}>v</T>
        {['ptr', 'cap 3', lenZero ? 'len 0' : 'len 3'].map((c, i) => (
          <g key={i}>
            <rect x={86 + i * 60} y={262} width={56} height={26} rx={4} fill="none" stroke={i === 2 && lenZero ? C.caramel : C.mocha} strokeWidth={i === 2 && lenZero ? 2 : 1} />
            <T x={114 + i * 60} y={280} s={13} a="middle" f={C.crema}>{c}</T>
          </g>
        ))}
      </g>
      {(drainOn || forgot) && <Slot x={310} y={256} w={150} name="Drain" state={forgot ? 'forgotten' : 'live'} o={fa(t, 3.0, 0.3)} />}
      <T x={40} y={326} s={13} f={C.latte} o={fa(t, 3.0, 0.4)}>len set to 0 before the proxy exists</T>
      <T x={40} y={350} s={13} f={C.latte} o={fa(t, 3.8, 0.4)}>3 elements leaked, nothing freed twice</T>
      <T x={40} y={380} s={15} f={C.caramel} o={fa(t, 4.4, 0.5)}>leak amplification: more leaks, never UB</T>
    </Svg>
  );
}

// ── 20 · Prove it 1 of 3 (predict) ──────────────────────────────────────────────────────────────────────────────
export function ProveParams({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 360;
  const xs = [30, 150, 270, 390];
  const names = ['a', 'b', 'c', 'd'];
  const order = { d: 1, c: 2, b: 3, a: 4 } as Record<string, number>;
  return (
    <Svg label="Locals drop first, then parameters in reverse, and inside a tuple pattern the bindings drop in reverse: d, c, b, a" h={H}>
      <CodeLines x={24} y={34} s={15} step={24} lines={[`fn params(a: Trace, (b, c): (Trace, Trace)) {`, `    let d = Trace("d");`, `}`]} o={fa(t, 0, 0.6)} />
      {names.map((n, i) => (
        <g key={n}>
          <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
            <Slot x={xs[i]} y={140} w={112} name={n} o={fa(t, 0.4 + i * 0.15, 0.3)} />
          </g>
          <g style={rv(ans)}>
            <Slot x={xs[i]} y={140} w={112} name={n} state="dropped" n={order[n]} />
          </g>
        </g>
      ))}
      <Timeline h={H} />
      <g style={rv(ans, 0.05)}>
        {['d', 'c', 'b', 'a'].map((n, i) => (
          <Badge key={n} x={110 + i * 110} y={TLY(H)} n={i + 1} name={n} t={99} hi={i === 0} />
        ))}
      </g>
    </Svg>
  );
}

// ── 21 · Prove it 2 of 3 (predict) ──────────────────────────────────────────────────────────────────────────────
export function ProveWild({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 340;
  return (
    <Svg label="let _ = lock.write().unwrap() binds nothing, so the guard is a temporary dropped at the semicolon; rustc refuses the line with the deny-by-default let_underscore_lock lint, and let _g holds the guard to the end of the block" h={H}>
      <CodeLines x={24} y={40} lines={[`let _ = lock.write().unwrap();`, `shared += 1;`]} step={26} o={fa(t, 0, 0.5)} />
      <CodeLines x={24} y={132} lines={[`let _g = lock.write().unwrap();`, `shared += 1;`]} step={26} f={C.latte} o={fa(t, 0.3, 0.5) * 0.8} />
      {ans && <line x1={22} y1={34} x2={290} y2={34} stroke={C.cherry} strokeWidth={2.5} />}
      <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
        <TempSlot x={350} y={22} o={fa(t, 0.6, 0.4)} />
        <Slot x={350} y={114} w={150} name="_g" o={fa(t, 0.8, 0.4)} />
      </g>
      <g style={rv(ans)}>
        <TempSlot x={350} y={22} />
        <Slot x={350} y={114} w={150} name="_g" look />
        <T x={24} y={92} s={15} f={C.cherryText} w={600}>let_underscore_lock</T>
        <T x={350} y={74} s={13} f={C.latte}>try_read ok</T>
        <T x={350} y={170} s={13} f={C.latte}>try_read blocked</T>
      </g>
      <Timeline h={H} />
      <g style={rv(ans, 0.05)}>
        <Badge x={150} y={TLY(H)} n={1} name="temp" t={99} hi />
        <Badge x={330} y={TLY(H)} n={2} name="_g" t={99} />
      </g>
    </Svg>
  );
}

// ── 22 · Prove it 3 of 3 (predict) ──────────────────────────────────────────────────────────────────────────────
export function ProveDesign({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const H = 340;
  return (
    <Svg label="A guard that must be dropped for memory safety is unsound: a safe caller can forget it, the buffer is freed and the device keeps writing; the sound design runs a closure and stops the device before it returns" h={H}>
      <CodeLines x={24} y={30} s={14} step={22} lines={[`/// Safety: the returned guard MUST be dropped`, `fn borrow_for_dma(buf: &mut [u8]) -> DmaGuard<'_>`, `impl Drop for DmaGuard<'_> { /* stop the device */ }`]} o={fa(t, 0, 0.6)} />
      <g opacity={fa(t, 0.4, 0.5)}>
        <g style={{ opacity: ans ? 0 : 1, transition: 'opacity .15s' }}>
          <Slot x={24} y={110} w={170} name="guard" type="DmaGuard" />
          <Borrow x1={194} y1={129} x2={300} y2={129} c={C.cinnamon} />
        </g>
        <g style={rv(ans)}>
          <Slot x={24} y={110} w={170} name="guard" state="forgotten" />
        </g>
        <Payload x={304} y={114} w={110} label="buf" freed={ans} />
        <rect x={440} y={110} width={96} height={38} rx={8} fill="none" stroke={ans ? C.cherryText : C.latte} strokeWidth={1.5} />
        <T x={488} y={134} s={13} a="middle" f={ans ? C.cherryText : C.crema}>device</T>
        <line x1={440} y1={129} x2={420} y2={129} stroke={ans ? C.cherryText : C.latte} strokeWidth={2} strokeDasharray="5 4" />
      </g>
      <g style={rv(ans)}>
        <T x={24} y={190} s={15} f={C.cherryText}>writes into freed memory</T>
        <T x={24} y={226} s={14} f={C.caramel}>fn with_dma(buf: &amp;mut [u8], f: impl FnOnce(&amp;Dma))</T>
        <T x={24} y={248} s={13} f={C.latte}>stops before it returns</T>
      </g>
      <Timeline h={H} />
    </Svg>
  );
}

// ── 23 · In one breath ──────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const H = 420;
  const rows: { y: number; glyph: ReactNode; l1: string; l2?: string }[] = [
    { y: 40, glyph: <Badge x={40} y={34} n={1} t={99} />, l1: 'Destructor = Drop::drop, then the fields' },
    {
      y: 96,
      glyph: (
        <g>
          <Badge x={22} y={90} n={1} t={99} />
          <Badge x={48} y={90} n={2} t={99} />
          <Badge x={74} y={90} n={3} t={99} />
        </g>
      ),
      l1: 'Locals reverse · fields in order',
    },
    { y: 152, glyph: <TempSlot x={20} y={134} w={56} h={26} label="" />, l1: 'Temporaries die at the ;', l2: '2024: before else, before the locals' },
    {
      y: 224,
      glyph: (
        <g>
          <Badge x={24} y={216} n={1} t={99} />
          <rect x={44} y={206} width={32} height={20} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
        </g>
      ),
      l1: 'One owner, one release: RAII',
    },
    { y: 280, glyph: <rect x={20} y={264} width={56} height={26} rx={7} fill="none" stroke={C.taupe} strokeDasharray="6 5" opacity={0.5} />, l1: 'Leaking is safe. forget, ManuallyDrop, leak' },
    { y: 336, glyph: <T x={40} y={342} s={20} a="middle" f={C.latte}>{'[ ]'}</T>, l1: 'Soundness never depends on Drop' },
  ];
  return (
    <Svg label="Six things to keep: a destructor is Drop::drop then the fields; locals reverse and fields in order; temporaries die at the semicolon; one owner means one release; leaking is safe; soundness never depends on Drop. Next: take a field out of a Drop type, E0509" h={H}>
      {rows.map((r, i) => (
        <g key={i} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          {r.glyph}
          <T x={96} y={r.y} s={15} f={C.crema}>{r.l1}</T>
          {r.l2 && <T x={96} y={r.y + 22} s={13} f={C.latte}>{r.l2}</T>}
        </g>
      ))}
      <g opacity={fa(t, 2.6, 0.4)}>
        <T x={24} y={394} s={15} f={C.caramel}>Next: take a field out of a Drop type</T>
        <T x={430} y={394} s={15} f={C.cherryText} w={600}>E0509</T>
      </g>
    </Svg>
  );
}
