import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// A length read from untrusted input is a real security boundary
// whether or not anyone decided to treat it as one; checking it first
// is what makes the difference measurable rather than theoretical.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Starts slow and accelerates: for something running away, like a slice past the end or a sum to its limit.
const easeIn = (x: number) => x * x * x;

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

// ── 1 · Does the unchecked slice survive an oversized claim (predict) ──
export function BoundsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a naive parser, slicing with the claimed length"
        lines={['&buf[start..start + len] // len claims far more', '// than the buffer holds. what happens?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the naive slice panics, the checked parser rejects ──
export function BoundsReveal({ t }: StepCtx) {
  const rows = ['naive parser: genuinely panics', 'checked parser: rejected cleanly, no panic'];
  // Both parsers read the same claimed length, which runs far past the buffer's real end. The naive one slices straight
  // into it and crashes past the last byte; the checked one measures what is really left first and stops at the edge.
  const cells = [0, 1, 2, 3, 4, 5, 6, 7];
  const end = 390;
  const slice = lerp(110, 440, easeIn(seg(t, 0.35, 1.1)));
  const shake = t > 1.1 && t < 1.45 ? Math.sin(t * 90) * 4 * (1.45 - t) / 0.35 : 0;
  const gate = easeOut(seg(t, 1.25, 1.5));
  const buffer = (y: number) =>
    cells.map((i) => <rect key={i} x={110 + i * 35} y={y - 12} width={33} height={24} rx={2} fill="none" stroke={C.latte} strokeWidth={1} />);
  return (
    <Svg label="parser_demo, captured" h={226}>
      <g opacity={fa(t, 0, 0.2)}>
        <T x={30} y={48} s={11} f={C.latte}>naive</T>
        <T x={30} y={118} s={11} f={C.latte}>checked</T>
      </g>
      <g transform={`translate(${shake.toFixed(2)} 0)`}>
        <g opacity={fa(t, 0, 0.2)}>{buffer(44)}</g>
        <Draw pts={[[110, 66], [560, 66]]} t={t} from={0.1} to={0.4} stroke={C.latte} w={1.5} pen={false} dash="4 4" />
        <rect x={110} y={32} width={Math.max(0.01, Math.min(slice, end) - 110)} height={24} fill={C.caramel} opacity={0.35} />
        <rect x={end} y={32} width={Math.max(0.01, slice - end)} height={24} fill={C.cherry} />
        <Draw pts={[[432, 34], [448, 54]]} t={t} from={1.1} to={1.2} stroke={C.cherryText} w={2.5} pen={false} />
        <Draw pts={[[448, 34], [432, 54]]} t={t} from={1.15} to={1.25} stroke={C.cherryText} w={2.5} pen={false} />
        <Decode text="panic" t={t} at={1.2} dur={0.35} x={470} y={49} s={12} f={C.cherryText} />
      </g>
      <g opacity={fa(t, 0, 0.2)}>{buffer(114)}</g>
      <Draw pts={[[110, 136], [560, 136]]} t={t} from={0.5} to={0.8} stroke={C.latte} w={1.5} pen={false} dash="4 4" />
      <Draw pts={[[110, 144], [end, 144]]} t={t} from={0.8} to={1.15} stroke={C.caramel} w={2} />
      <rect x={end - 1} y={114 - 18 * gate} width={4} height={36 * gate} fill={C.caramel} />
      <Decode text="rejected" t={t} at={1.45} dur={0.4} x={410} y={119} s={12} f={C.caramel} />
      <Reticle x={end + 1} y={114} w={26} h={44} t={t} at={2.3} />
      {rows.map((r, i) => {
        const k = fa(t, 1.55 + i * 0.35, 0.45);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={180 + i * 30} r={5} fill={i ? C.caramel : 'none'} stroke={C.cherryText} strokeWidth={i ? 0 : 2} />
            <T x={48} y={185 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 3 · Does the naive parser catch an over-policy length (predict) ────
export function PolicyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a length that fits the buffer, but not the policy"
        lines={['len <= buf.len() // fits. but over the max size?', '// does the naive parser catch this one too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: naive accepts it, checked rejects it (takeaway) ──────
export function PolicyReveal({ t }: StepCtx) {
  const naive = easeOut(seg(t, 0.2, 0.55));
  const checked = easeOut(seg(t, 0.35, 0.6));
  return (
    <Svg label="parser_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>a length that fits, but breaks the policy</T>
      <Draw pts={[[40, 55], [320, 55]]} t={t} from={0.2} to={0.55} stroke={C.caramel} w={2} pen />
      <circle cx={40 + naive * 280} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <T x={330} y={58} s={10} f={C.latte}>naive</T>
      <Draw pts={[[40, 90], [200, 90]]} t={t} from={0.35} to={0.6} stroke={C.latte} w={2} pen />
      <circle cx={40 + checked * 160} cy={90} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.35, 0.15)} />
      <rect x={200} y={75} width={2} height={30} fill={C.cherry} opacity={fa(t, 0.6, 0.15)} />
      <T x={210} y={100} s={10} f={C.latte}>checked: policy limit</T>
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={60} y={125} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={147} s={12} a="middle" f={C.mocha}>naive: accepted. checked: rejected</T>
      </g>
      <T x={60} y={175} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>fitting the buffer is not the same as safe</T>
    </Svg>
  );
}

// ── 5 · Does overflow look obviously wrong (predict) ───────────────────
export function OverflowPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two lengths, added with plain arithmetic"
        lines={['header_len + payload_len // release build', '// does a real overflow look obviously wrong?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the sum wraps silently to a small number ─────────────
export function OverflowReveal({ t }: StepCtx) {
  const sumUp = easeOut(seg(t, 0.2, 0.45));
  const wrap = easeOut(seg(t, 0.5, 0.7));
  const naiveH = sumUp * 55 * (1 - wrap) + wrap * 6;
  return (
    <Svg label="parser_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>a real overflow, in a real release build</T>
      <T x={30} y={45} s={10} f={C.latte} o={fa(t, 0.1, 0.2)}>header_len + payload_len, both large</T>
      <rect x={60} y={95 - naiveH} width={40} height={naiveH} fill={naiveH < 10 ? C.cherry : C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <T x={80} y={110} s={10} a="middle" f={C.latte}>naive: wraps small</T>
      <circle cx={210} cy={70} r={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.6, 0.15)} />
      <T x={225} y={74} s={10} f={C.latte}>checked: catches it</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={125} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={147} s={12} a="middle" f={C.mocha}>naive: wraps small. checked: catches it</T>
      </g>
      <T x={60} y={175} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>silent wraparound looks perfectly safe</T>
    </Svg>
  );
}

// ── 7 · checked_add and overflow-checks' own words (connecting) ────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // Then why it matters: a plain sum climbs to the top of its range and silently wraps to a small number, while
  // checked_add answers None.
  const climb = easeIn(seg(t, 1.85, 2.3));
  const wrapped = t >= 2.3;
  return (
    <Svg label="checked_add and overflow-checks, their own docs" h={200}>
      <Quote y={8} src="u32::checked_add" quote="returning None if overflow occurred" mark="None" t={t} at={0.1} portrait={portrait} />
      <Quote y={82} src="Cargo profiles" quote="release skips overflow checks by default" mark="by default" t={t} at={0.9} portrait={portrait} />
      <T x={30} y={186} s={11} f={C.latte} o={fa(t, 1.8, 0.2)}>plain +</T>
      <rect x={110} y={176} width={200} height={10} rx={3} fill={C.cocoa} opacity={fa(t, 1.8, 0.2)} />
      <rect x={110} y={176} width={Math.max(0.01, wrapped ? 12 : climb * 200)} height={10} rx={3} fill={wrapped ? C.cherryText : C.caramel} />
      <Decode text="checked: None" t={t} at={2.35} dur={0.4} x={340} y={186} s={12} f={C.caramel} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a length that fits still needs its own policy', 'a small sum may have just overflowed', 'checking both is what makes a boundary real'];
  // The payoff: a length grows inside the buffer and sails past the policy line drawn across it; a sum climbs to the
  // top of its range and snaps back small; then both get the check they needed.
  const len = easeOut(seg(t, 0.3, 0.85)) * 330;
  const climb = easeIn(seg(t, 1.0, 1.45));
  const wrapped = t >= 1.45;
  return (
    <Svg label="recap: a length nobody checked before trusting it" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <g opacity={fa(t, 0.2, 0.2)}>
        <T x={30} y={202} s={11} f={C.latte}>length</T>
        <rect x={110} y={186} width={360} height={20} rx={3} fill="none" stroke={C.latte} strokeWidth={1} />
        <T x={30} y={252} s={11} f={C.latte}>sum</T>
        <rect x={110} y={240} width={360} height={14} rx={3} fill={C.cocoa} />
      </g>
      <rect x={112} y={189} width={Math.max(0.01, Math.min(len, 218))} height={14} rx={2} fill={C.caramel} />
      <rect x={330} y={189} width={Math.max(0.01, len - 218)} height={14} rx={2} fill={C.cherryText} />
      <Draw pts={[[330, 176], [330, 216]]} t={t} from={0.55} to={0.75} stroke={C.cherryText} w={2} pen={false} />
      <T x={330} y={172} s={11} a="middle" f={C.cherryText} o={fa(t, 0.6, 0.2)}>policy</T>
      <rect x={110} y={240} width={Math.max(0.01, wrapped ? 18 : climb * 360)} height={14} rx={3} fill={wrapped ? C.cherryText : C.caramel} />
      <Tick x={500} y={196} t={t} at={1.75} />
      <Tick x={500} y={247} t={t} at={1.95} />
      <Reticle x={502} y={222} w={40} h={84} t={t} at={2.35} />
    </Svg>
  );
}
