import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// Leaving a backpressure point implicit does not avoid the decision; it
// genuinely defaults to an unbounded queue, measurably different from a
// real, explicit, bounded one under the identical real overload.
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

// ── 1 · Does the bounded queue stay capped (predict) ────────────────────
export function BoundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a stated backpressure point, capacity two"
        lines={['tx.try_send(job) // eight real requests, fast', '// does the queue stay capped at two?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: three admitted, five rejected, queue capped ──────────
export function BoundedReveal({ t }: StepCtx) {
  const rows = ['admitted: three. rejected: five', 'queue length at the checkpoint: two'];
  // Eight requests arrive one after another: the first reaches the worker, the next two take the queue's only two slots,
  // and every later one bounces off the full door and drops to the rejected pile. The queue never holds more than two.
  const lane = 66;
  const door = 300;
  return (
    <Svg label="worksheet_demo, captured" h={210}>
      <Draw pts={[[30, lane], [door, lane]]} t={t} from={0} to={0.25} stroke={C.mocha} w={1} pen={false} />
      <rect x={door} y={lane - 30} width={5} height={60} fill={C.caramel} opacity={fa(t, 0, 0.2)} />
      <rect x={312} y={lane - 18} width={92} height={36} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, 0, 0.2)} />
      <line x1={358} y1={lane - 18} x2={358} y2={lane + 18} stroke={C.mocha} opacity={fa(t, 0, 0.2)} />
      <T x={358} y={lane - 26} s={11} a="middle" f={C.latte} o={fa(t, 0, 0.2)}>queue</T>
      <rect x={430} y={lane - 18} width={80} height={36} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, 0, 0.2)} />
      <T x={470} y={lane - 26} s={11} a="middle" f={C.latte} o={fa(t, 0, 0.2)}>worker</T>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const at = 0.1 + i * 0.12;
        const k = easeInOut(seg(t, at, at + 0.5));
        if (i < 3) {
          const x = lerp(30, [470, 381, 335][i], k);
          return <circle key={i} cx={x} cy={lane} r={6} fill={C.caramel} opacity={fa(t, at, 0.1)} />;
        }
        const back = easeOut(seg(t, at + 0.5, at + 0.8));
        const fall = easeInOut(seg(t, at + 0.75, at + 1.1));
        const j = i - 3;
        const x = lerp(lerp(30, door - 7, k), 150 + j * 26, back);
        const y = lerp(lane, 118, fall);
        return <circle key={i} cx={x} cy={y} r={6} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={fa(t, at, 0.1)} />;
      })}
      <Reticle x={358} y={lane} w={110} h={52} t={t} at={2.3} />
      {rows.map((r, i) => {
        const k = fa(t, 1.5 + i * 0.35, 0.45);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={160 + i * 30} r={5} fill={C.caramel} />
            <T x={48} y={165 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 3 · Does leaving it implicit change anything (predict) ─────────────
export function UnboundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a second service, no stated backpressure point"
        lines={['mpsc::unbounded_channel() // identical burst', '// does leaving it implicit change anything?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: all eight admitted, queue grows to seven ─────────────
export function UnboundedReveal({ t }: StepCtx) {
  const ids = [0, 1, 2, 3, 4, 5, 6, 7];
  const grow = easeOut(seg(t, 0.9, 1.15));
  return (
    <Svg label="worksheet_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical burst, no stated boundary</T>
      {ids.map((i) => {
        const start = 0.15 + i * 0.07;
        const travel = easeOut(seg(t, start, start + 0.25));
        return <circle key={i} cx={30 + i * 42} cy={40 + travel * 45} r={5} fill={C.caramel} opacity={fa(t, start, 0.15)} />;
      })}
      <rect x={30} y={120 - grow * 55} width={310} height={grow * 55} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.9, 0.2)} />
      <T x={185} y={135} s={11} a="middle" f={C.latte} o={fa(t, 1.0, 0.2)}>queue length at the checkpoint: seven</T>
      <g opacity={fa(t, 1.3, 0.3)}>
        <rect x={60} y={155} width={290} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={205} y={177} s={12} a="middle" f={C.mocha}>admitted: all eight. rejected: none</T>
      </g>
    </Svg>
  );
}

// ── 5 · Which design actually protects the service (predict) ───────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="side by side, under the identical burst"
        lines={['bounded: queue stays at two', 'unbounded: queue climbs to seven. which protects it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: capped at two vs. climbing to seven (takeaway) ───────
export function CompareReveal({ t }: StepCtx) {
  const bounded = easeOut(seg(t, 0.2, 0.45));
  const unbounded = easeOut(seg(t, 0.45, 0.8));
  return (
    <Svg label="worksheet_demo, both instances" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical burst, two real designs</T>
      <rect x={60} y={120 - bounded * 14} width={40} height={bounded * 14} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={80} y={140} s={10} a="middle" f={C.latte}>bounded</T>
      <rect x={160} y={120 - unbounded * 49} width={40} height={unbounded * 49} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <T x={180} y={140} s={10} a="middle" f={C.latte}>unbounded</T>
      <g opacity={fa(t, 0.95, 0.3)}>
        <rect x={60} y={155} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={177} s={12} a="middle" f={C.mocha}>bounded: capped at two. unbounded: at seven</T>
      </g>
      <T x={60} y={200} s={12} f={C.latte} o={fa(t, 1.5, 0.3)}>a default is still a real decision</T>
    </Svg>
  );
}

// ── 7 · mpsc's own words on both variants (connecting) ──────────────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // Each mode's own line, then the topic's two measured queues beside them: one stops at its cap, one keeps climbing.
  const capped = easeOut(seg(t, 1.9, 2.3));
  const climb = easeOut(seg(t, 2.0, 2.7));
  return (
    <Svg label="tokio::sync::mpsc, its own docs" h={180}>
      <Quote y={14} src="mpsc::channel" quote="communicating with backpressure" mark="with backpressure" t={t} at={0.1} portrait={portrait} />
      <Quote y={98} src="mpsc::unbounded_channel" quote="communicating without backpressure" mark="without" t={t} at={0.9} portrait={portrait} />
      <g opacity={fa(t, 1.8, 0.2)}>
        <rect x={440} y={50} width={140} height={10} rx={3} fill={C.cocoa} />
        <rect x={440} y={134} width={140} height={10} rx={3} fill={C.cocoa} />
      </g>
      <T x={440} y={40} s={11} f={C.latte} o={fa(t, 1.8, 0.2)}>capped</T>
      <T x={440} y={124} s={11} f={C.cherryText} o={fa(t, 1.8, 0.2)}>climbing</T>
      <rect x={440} y={50} width={Math.max(0.01, capped * 35)} height={10} rx={3} fill={C.caramel} />
      <Draw pts={[[476, 42], [476, 68]]} t={t} from={1.85} to={2.05} stroke={C.caramel} w={2} pen={false} />
      <rect x={440} y={134} width={Math.max(0.01, climb * 122)} height={10} rx={3} fill={C.cherryText} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a stated boundary sheds load on purpose', 'it still answers, just not one anyone chose', 'the worksheet is checked before the code is'];
  // The payoff: the stated queue rises to the cap drawn ahead of time and stops; the unstated one climbs until its
  // answer is found only afterwards; then the worksheet line where that cap was chosen gets its tick.
  const base = 268;
  const cell = 12;
  const stated = easeOut(seg(t, 0.4, 0.9)) * 2 * cell;
  const unstated = easeOut(seg(t, 1.0, 1.7)) * 7 * cell;
  const card = easeOut(seg(t, 1.45, 1.9));
  return (
    <Svg label="recap: a question nobody actually answered" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <g transform={`translate(${((1 - card) * -40).toFixed(1)} 0)`} opacity={card}>
        <rect x={30} y={190} width={170} height={70} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={44} y={212} s={11} f={C.latte}>worksheet</T>
        <T x={44} y={242} s={12} f={C.crema}>capacity: two</T>
      </g>
      <Tick x={180} y={237} t={t} at={1.9} />
      <line x1={250} y1={base} x2={460} y2={base} stroke={C.mocha} opacity={fa(t, 0.2, 0.2)} />
      <rect x={270} y={base - stated} width={44} height={Math.max(0.01, stated)} fill={C.caramel} />
      <Draw pts={[[262, base - 2 * cell], [322, base - 2 * cell]]} t={t} from={0.2} to={0.45} stroke={C.caramel} w={2} pen={false} />
      <rect x={390} y={base - unstated} width={44} height={Math.max(0.01, unstated)} fill={C.cherry} />
      <Draw pts={[[382, base - 7 * cell], [442, base - 7 * cell]]} t={t} from={1.7} to={1.95} stroke={C.cherryText} w={2} pen={false} />
      <T x={292} y={288} s={11} a="middle" f={C.latte} o={fa(t, 0.3, 0.3)}>stated</T>
      <T x={412} y={288} s={11} a="middle" f={C.latte} o={fa(t, 1.0, 0.3)}>unstated</T>
      <Reticle x={115} y={237} w={180} h={30} t={t} at={2.35} />
    </Svg>
  );
}
