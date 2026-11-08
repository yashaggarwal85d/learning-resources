import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// A shrunk counterexample catches a real bug a hand-picked example
// test, checking only the cases its author thought of, would never
// have been written to find.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// A fixed pseudo-random value in [0, 1) for case n: the same frame every time, for the random cases flying past.
const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
};

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

// ── 1 · Does a random search find the bug (predict) ────────────────────
export function BugPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a slot allocator, checked only against one example"
        lines={['naive_insert(len) // never checks where it starts', '// does a random search find the bug anyway?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the random search finds a failing sequence ───────────
export function BugReveal({ t }: StepCtx) {
  const rows = ['hundreds of random sequences, tried in turn', 'one of them genuinely breaks the bounds check'];
  // Random sequences are tried one after another, each dot above one case; below, the current case's inserts stack
  // into the page. Every one stops short of the end, until one runs past it, turns red, and the search stops there.
  const cols = 40;
  const fail = 131;
  const n = Math.floor(easeInOut(seg(t, 0.1, 1.4)) * fail);
  const failed = n >= fail;
  const wall = 450;
  const total = failed ? 480 : 420 * (0.45 + 0.5 * rnd(n));
  const parts = 3 + Math.floor(rnd(n + 999) * 4);
  const w = [...Array(parts)].map((_, j) => 0.4 + rnd(n * 7 + j));
  const sum = w.reduce((a, b) => a + b, 0);
  let x = 30;
  return (
    <Svg label="proptest, captured" h={206}>
      {[...Array(fail + 1)].map((_, i) =>
        i <= n ? (
          <circle key={i} cx={36 + (i % cols) * 13.5} cy={26 + Math.floor(i / cols) * 11} r={i === fail ? 4 : 2.2} fill={i === fail ? C.cherryText : C.latte} />
        ) : null,
      )}
      <line x1={wall} y1={86} x2={wall} y2={124} stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0, 0.2)} />
      <T x={wall - 6} y={84} s={11} a="end" f={C.latte} o={fa(t, 0, 0.2)}>page end</T>
      <rect x={30} y={96} width={420} height={18} rx={3} fill="none" stroke={C.mocha} opacity={fa(t, 0, 0.2)} />
      {w.map((wj, j) => {
        const len = (wj / sum) * total;
        const x0 = x;
        x += len;
        const over = failed && x > wall;
        return <rect key={j} x={x0 + 1} y={98} width={Math.max(0.01, len - 2)} height={14} rx={2} fill={over ? C.cherryText : j % 2 ? C.latte : C.crema} opacity={fa(t, 0.1, 0.1)} />;
      })}
      <Reticle x={wall + 15} y={105} w={44} h={36} t={t} at={2.2} color={C.cherryText} />
      {rows.map((r, i) => {
        const k = fa(t, 1.5 + i * 0.35, 0.45);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={155 + i * 30} r={5} fill={i ? 'none' : C.caramel} stroke={C.cherryText} strokeWidth={i ? 2 : 0} />
            <T x={48} y={160 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 3 · Does the failing case stay long, or shrink (predict) ───────────
export function ShrinkPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a long, random sequence that triggers the bug"
        lines={['up to thirty real inserts in the sequence', '// does the reported case stay that long?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the case shrinks to a minimal cause ───────────────────
export function ShrinkReveal({ t }: StepCtx) {
  const longIds = Array.from({ length: 12 }, (_, i) => i);
  const shrink = easeOut(seg(t, 0.55, 0.85));
  return (
    <Svg label="proptest, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the real failure, shrunk down</T>
      {longIds.map((i) => {
        const start = 0.1 + i * 0.025;
        const fadeOut = i >= 4 ? easeOut(seg(t, 0.55 + i * 0.015, 0.7 + i * 0.015)) : 0;
        return (
          <circle
            key={i}
            cx={30 + i * 26}
            cy={55}
            r={5}
            fill={i < 4 ? C.caramel : C.cherry}
            opacity={fa(t, start, 0.15) * (1 - fadeOut)}
          />
        );
      })}
      <Draw pts={[[30, 75], [30 + 3 * 26, 75]]} t={t} from={0.85} to={1.0} stroke={C.caramel} w={2} pen />
      <g opacity={fa(t, 0.95, 0.3)}>
        <rect x={60} y={95} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={117} s={12} a="middle" f={C.mocha}>a handful of inserts, barely over capacity</T>
      </g>
      <T x={60} y={150} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>the smallest real cause, not a lucky guess</T>
    </Svg>
  );
}

// ── 5 · Does the checked version pass by luck (predict) ─────────────────
export function CheckedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the checked insert, the identical real test"
        lines={['checked_insert(len) // checks start plus len', '// does it only pass by picking easy cases?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: it passes every one of the random cases ──────────────
export function CheckedReveal({ t }: StepCtx) {
  const ids = [0, 1, 2, 3, 4, 5, 6];
  return (
    <Svg label="proptest, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical check, the checked insert</T>
      {ids.map((i) => {
        const start = 0.15 + i * 0.07;
        const travel = easeOut(seg(t, start, start + 0.3));
        return (
          <g key={i}>
            <Draw pts={[[40 + i * 44, 50], [40 + i * 44, 95]]} t={t} from={start} to={start + 0.3} stroke={C.caramel} w={2} pen />
            <circle cx={40 + i * 44} cy={50 + travel * 45} r={5} fill={C.caramel} opacity={fa(t, start, 0.15)} />
          </g>
        );
      })}
      <g opacity={fa(t, 1.0, 0.3)}>
        <rect x={60} y={110} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={132} s={12} a="middle" f={C.mocha}>every random case, genuinely passed</T>
      </g>
      <T x={60} y={165} s={12} f={C.latte} o={fa(t, 1.4, 0.3)}>confidence from many cases, not one</T>
    </Svg>
  );
}

// ── 7 · proptest's own words on properties and shrinking ────────────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // The two halves of the job, then the second one acted out: a long failing case collapses to its smallest cause.
  const shrink = easeInOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="proptest, its own words" h={196}>
      <Quote y={8} src="proptest README" quote="properties hold for arbitrary inputs" mark="arbitrary inputs" t={t} at={0.1} portrait={portrait} />
      <Quote y={84} src="proptest README" quote="finds the minimal test case" mark="minimal" t={t} at={0.9} portrait={portrait} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const keep = i < 3;
        const cx = keep ? 60 + i * 22 : lerp(60 + i * 22, 104, shrink);
        return <circle key={i} cx={cx} cy={178} r={5} fill={keep ? C.caramel : C.cherryText} opacity={fa(t, 1.8, 0.2) * (keep ? 1 : 1 - shrink)} />;
      })}
      <Decode text="minimal" t={t} at={2.35} dur={0.4} x={140} y={182} s={12} f={C.caramel} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['far more cases than anyone writes by hand', 'shrunk down to the smallest real cause', 'a simpler model, checked against reality'];
  // The payoff, one beat per point: a strip of cases fills and one turns red; that red case's long sequence collapses to
  // its few real inserts; then the real allocator and a simpler model take the same operations side by side, agreeing.
  const n = Math.floor(easeOut(seg(t, 0.2, 0.75)) * 40);
  const shrink = easeInOut(seg(t, 0.95, 1.4));
  return (
    <Svg label="recap: trying a great many real cases" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      {[...Array(40)].map((_, i) =>
        i < n ? <circle key={i} cx={36 + i * 13.5} cy={168} r={i === 27 ? 4 : 2.2} fill={i === 27 ? C.cherryText : C.latte} /> : null,
      )}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const keep = i < 3;
        const w = keep ? 40 : 40 * (1 - shrink);
        const x = 30 + (keep ? i * 44 : 3 * 44 + (i - 3) * 44 * (1 - shrink));
        return <rect key={i} x={x} y={190} width={Math.max(0.01, w)} height={14} rx={2} fill={C.cherryText} opacity={fa(t, 0.8, 0.2) * (keep ? 1 : 1 - shrink * 0.6)} />;
      })}
      <g opacity={fa(t, 1.45, 0.25)}>
        <T x={30} y={242} s={11} f={C.latte}>real</T>
        <T x={30} y={280} s={11} f={C.latte}>model</T>
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const at = 1.55 + i * 0.12;
        const k = easeOut(seg(t, at, at + 0.25));
        const x = 110 + i * 60;
        return (
          <g key={i}>
            <rect x={x} y={228 - (1 - k) * 10} width={36} height={18} rx={3} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={k} />
            <rect x={x} y={266 + (1 - k) * 10} width={36} height={18} rx={3} fill="none" stroke={C.second} strokeWidth={1.2} opacity={k} />
            <Draw pts={[[x + 18, 247], [x + 18, 265]]} t={t} from={at + 0.2} to={at + 0.35} stroke={C.caramel} w={1.5} pen={false} />
          </g>
        );
      })}
      <Reticle x={278} y={256} w={372} h={66} t={t} at={2.4} />
    </Svg>
  );
}
