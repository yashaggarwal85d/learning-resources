import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, fmt, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// A bounded pipeline that moves each batch forward keeps its own
// memory capped under a slow sink; an unbounded, cloning pipeline
// does not, however identically slow that sink stays underneath it.
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

// ── 1 · Does bounded memory keep growing (predict) ──────────────────────
export function BoundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a bounded pipeline, moved batches, slow sink"
        lines={['channel capacity: 4 batches, moved forward', '// does memory keep growing ahead of the sink?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: bounded memory stays capped ───────────────────────────
export function BoundedReveal({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.2, 0.6));
  return (
    <Svg label="pipeline_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>fifty batches, a slow sink underneath</T>
      <Draw pts={[[60, 50], [60, 115]]} t={t} from={0.1} to={0.2} stroke={C.latte} w={1.5} />
      <rect x={60} y={115 - grow * 14} width={40} height={grow * 14} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={110} y={112} s={10} f={C.latte}>capped, a few batches' worth</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={135} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={157} s={12} a="middle" f={C.mocha}>peak held: 6,000 bytes</T>
      </g>
      <T x={60} y={190} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>a few batches' worth, the whole run</T>
    </Svg>
  );
}

// ── 3 · Does unbounded memory stay close (predict) ──────────────────────
export function UnboundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an unbounded pipeline, cloned batches"
        lines={['channel capacity: none, each batch cloned', '// does peak memory stay close to bounded?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: unbounded memory grows toward the full run ───────────
export function UnboundedReveal({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.2, 0.65));
  return (
    <Svg label="pipeline_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical producer, the identical sink</T>
      <rect x={60} y={115 - grow * 14} width={14} height={grow * 14} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, 0.1, 0.15)} />
      <rect x={85} y={115 - grow * 95} width={40} height={grow * 95} fill={C.cherry} opacity={fa(t, 0.2, 0.2)} />
      <T x={140} y={55} s={10} f={C.latte} o={fa(t, 0.55, 0.2)}>almost the entire run's own bytes</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={135} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={157} s={12} a="middle" f={C.mocha}>peak held: 51,000 bytes</T>
      </g>
    </Svg>
  );
}

// ── 5 · Is the gap small or structural (predict) ────────────────────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="6,000 bytes against 51,000 bytes"
        lines={['the identical fifty batches, either way', '// incidental, or a structural gap?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the gap holds, over eight times larger ───────────────
export function CompareReveal({ t }: StepCtx) {
  // A race on one axis: the bounded peak grows and hits its cap almost at once; the unbounded one keeps going.
  // Then the bounded bar's own length is ticked off along the unbounded one, again and again, to show the gap.
  const full = 480;
  const unit = (6000 / 51000) * full;
  const b = easeOut(seg(t, 0.2, 0.55));
  const u = easeInOut(seg(t, 0.25, 1.45));
  return (
    <Svg label="pipeline_demo, captured" h={190}>
      <g opacity={fa(t, 0, 0.2)}>
        <T x={40} y={46} s={11} f={C.latte}>bounded peak</T>
        <T x={40} y={110} s={11} f={C.latte}>unbounded peak</T>
        <rect x={40} y={54} width={full} height={18} rx={3} fill={C.cocoa} />
        <rect x={40} y={118} width={full} height={18} rx={3} fill={C.cocoa} />
      </g>
      <rect x={40} y={54} width={Math.max(0.01, b * unit)} height={18} rx={3} fill={C.caramel} />
      <rect x={40} y={118} width={Math.max(0.01, u * full)} height={18} rx={3} fill={C.cherry} />
      <T x={560} y={46} s={13} a="end" f={C.crema}>{`${fmt(lerp(0, 6000, b))} bytes`}</T>
      <T x={560} y={110} s={13} a="end" f={C.cherryText}>{`${fmt(lerp(0, 51000, u))} bytes`}</T>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
        <Draw key={k} pts={[[40 + k * unit, 140], [40 + k * unit, 150]]} t={t} from={1.55 + k * 0.07} to={1.65 + k * 0.07} stroke={C.caramel} w={1.5} pen={false} />
      ))}
      <Decode text="over eight times" t={t} at={2.2} dur={0.45} x={40} y={176} s={13} f={C.caramel} />
      <Reticle x={40 + full} y={127} w={26} h={34} t={t} at={2.4} color={C.cherryText} />
    </Svg>
  );
}

// ── 7 · tokio's own words on backpressure ───────────────────────────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // Each channel's own line, then this topic's two peaks beside them: one held at its cap, one with nothing to stop it.
  const capped = easeOut(seg(t, 1.9, 2.3));
  const climb = easeOut(seg(t, 2.0, 2.7));
  return (
    <Svg label="tokio::sync::mpsc, its own words" h={180}>
      <Quote y={14} src="mpsc::channel" quote="rejected until capacity frees" mark="until capacity frees" t={t} at={0.1} portrait={portrait} />
      <Quote y={98} src="mpsc::unbounded_channel" quote="a send always completes at once" mark="always completes" t={t} at={0.9} portrait={portrait} />
      <g opacity={fa(t, 1.8, 0.2)}>
        <rect x={440} y={50} width={140} height={10} rx={3} fill={C.cocoa} />
        <rect x={440} y={134} width={140} height={10} rx={3} fill={C.cocoa} />
      </g>
      <T x={440} y={40} s={11} f={C.latte} o={fa(t, 1.8, 0.2)}>capped</T>
      <T x={440} y={124} s={11} f={C.cherryText} o={fa(t, 1.8, 0.2)}>climbing</T>
      <rect x={440} y={50} width={Math.max(0.01, capped * 16)} height={10} rx={3} fill={C.caramel} />
      <Draw pts={[[457, 42], [457, 68]]} t={t} from={1.85} to={2.05} stroke={C.caramel} w={2} pen={false} />
      <rect x={440} y={134} width={Math.max(0.01, climb * 138)} height={10} rx={3} fill={C.cherryText} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['moved batches, a channel that can say no', 'cloned batches, a channel that never does', 'the identical sink, a structural gap'];
  // The payoff: in the top pipeline each batch moves into one of four slots, and the fifth waits at a door that says no;
  // in the bottom one each batch is copied in and nothing ever stops the pile. Both drain into the identical slow sink.
  const top = 194;
  const bot = 254;
  const wait = t > 1.0 ? Math.sin(t * 9) * 2 : 0;
  return (
    <Svg label="recap: a limit that is actually enforced" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <g opacity={fa(t, 0.2, 0.25)}>
        <T x={30} y={top - 18} s={11} f={C.latte}>moved</T>
        <T x={30} y={bot - 18} s={11} f={C.latte}>cloned</T>
        <rect x={140} y={top - 14} width={168} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <line x1={140} y1={bot + 14} x2={420} y2={bot + 14} stroke={C.mocha} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => {
        const at = 0.3 + i * 0.12;
        const k = easeInOut(seg(t, at, at + 0.4));
        const x = i < 4 ? lerp(40, 146 + i * 40, k) : lerp(40, 108, k);
        return <rect key={i} x={x} y={top - 9 + (i === 4 ? wait : 0)} width={32} height={18} rx={2} fill={C.caramel} />;
      })}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const at = 0.95 + i * 0.07;
        const k = easeInOut(seg(t, at, at + 0.4));
        return (
          <g key={i}>
            <rect x={40} y={bot - 9} width={32} height={18} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1} opacity={k > 0 && k < 1 ? 1 : 0} />
            <rect x={lerp(40, 146 + i * 30, k)} y={bot - 9} width={26} height={18} rx={2} fill={C.cherry} stroke={C.cherryText} strokeWidth={1} opacity={k > 0 ? 1 : 0} />
          </g>
        );
      })}
      <g opacity={fa(t, 1.55, 0.3)}>
        <rect x={470} y={top - 20} width={90} height={100} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={515} y={top + 34} s={11} a="middle" f={C.latte}>slow sink</T>
      </g>
      <Draw pts={[[312, top], [470, top]]} t={t} from={1.6} to={1.9} stroke={C.latte} w={1.5} />
      <Draw pts={[[420, bot], [470, bot]]} t={t} from={1.7} to={1.95} stroke={C.latte} w={1.5} />
      <Reticle x={280} y={bot} w={290} h={34} t={t} at={2.35} color={C.cherryText} />
    </Svg>
  );
}
