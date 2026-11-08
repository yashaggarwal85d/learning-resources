import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// A recorded hypothesis is what a real result is checked against; the
// identical real measurement, without it, is just a number with nothing
// to confirm or contradict.
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

// ── 1 · Is the hypothesis specific enough to be wrong (predict) ────────
export function HypothesisPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="written down before any code changes"
        lines={['hypothesis: replying only after storage finishes', '// adds roughly the worker\'s own delay. specific enough?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: reply-on-queue latency, a fraction of a millisecond ──
export function HypothesisReveal({ t }: StepCtx) {
  const rows = ['five requests, replying as each is queued', 'mean latency: a fraction of a millisecond'];
  // A time cursor sweeps right. Each request drops from the client lane and its reply bounces straight back up the same
  // instant, while the worker lane below is still grinding through the earlier ones, one long block each.
  const cur = lerp(100, 520, easeInOut(seg(t, 0.2, 2.0)));
  const starts = [0, 1, 2, 3, 4].map((i) => 110 + i * 40);
  return (
    <Svg label="evidence_demo, captured" h={220}>
      <T x={30} y={52} s={11} f={C.latte} o={fa(t, 0, 0.2)}>client</T>
      <T x={30} y={118} s={11} f={C.latte} o={fa(t, 0, 0.2)}>worker</T>
      <line x1={100} y1={48} x2={540} y2={48} stroke={C.mocha} opacity={fa(t, 0, 0.2)} />
      <line x1={100} y1={114} x2={540} y2={114} stroke={C.mocha} opacity={fa(t, 0, 0.2)} />
      {starts.map((x0, i) => {
        const w0 = 110 + i * 80;
        const grown = clamp(cur - w0, 0, 76);
        return (
          <g key={i}>
            <Draw pts={[[x0, 48], [x0, 82]]} t={cur} from={x0 - 6} to={x0} stroke={C.latte} w={1.5} pen={false} />
            <Draw pts={[[x0 + 7, 82], [x0 + 7, 50]]} t={cur} from={x0} to={x0 + 6} stroke={C.caramel} w={2} />
            <Draw pts={[[x0 + 3, 56], [x0 + 7, 50], [x0 + 11, 56]]} t={cur} from={x0 + 6} to={x0 + 8} stroke={C.caramel} w={2} pen={false} />
            <rect x={w0} y={104} width={Math.max(0.01, grown)} height={20} rx={3} fill={i % 2 ? C.mocha : C.latte} />
          </g>
        );
      })}
      <line x1={cur} y1={36} x2={cur} y2={132} stroke={C.caramel} strokeWidth={1} opacity={fa(t, 0.2, 0.2) * (1 - fa(t, 2.0, 0.2))} />
      <T x={104} y={99} s={11} f={C.caramel} o={fa(t, 0.5, 0.25)}>reply</T>
      <T x={510} y={146} s={11} a="end" f={C.latte} o={fa(t, 1.6, 0.3)}>work, still running</T>
      <Reticle x={114} y={64} w={24} h={34} t={t} at={2.3} />
      {rows.map((r, i) => {
        const k = fa(t, 1.2 + i * 0.4, 0.45);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={168 + i * 30} r={5} fill={C.caramel} />
            <T x={48} y={173 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 3 · Does the change move latency the way predicted (predict) ───────
export function ChangePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the one real change: wait for the worker's own signal"
        lines={['done_rx.await // before replying, not after', '// does latency move the way the hypothesis said?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: latency jumps to near the worker's own delay ─────────
export function ChangeReveal({ t }: StepCtx) {
  const rows = ["mean latency now near the worker's own delay", 'a real number, checked against a real guess'];
  // The same two lanes as before the change, but now each reply waits: the request drops, the worker's block grows,
  // and only when it ends does the reply come back up. The latency bracket on the client lane grows exactly as long.
  const cur = lerp(100, 500, easeInOut(seg(t, 0.15, 2.0)));
  const starts = [110, 250, 390];
  return (
    <Svg label="evidence_demo, captured" h={226}>
      <T x={30} y={62} s={11} f={C.latte} o={fa(t, 0, 0.2)}>client</T>
      <T x={30} y={128} s={11} f={C.latte} o={fa(t, 0, 0.2)}>worker</T>
      <line x1={100} y1={58} x2={540} y2={58} stroke={C.mocha} opacity={fa(t, 0, 0.2)} />
      <line x1={100} y1={124} x2={540} y2={124} stroke={C.mocha} opacity={fa(t, 0, 0.2)} />
      {starts.map((x0) => (
        <g key={x0}>
          <Draw pts={[[x0, 58], [x0, 112]]} t={cur} from={x0 - 6} to={x0} stroke={C.latte} w={1.5} pen={false} />
          <rect x={x0} y={114} width={Math.max(0.01, clamp(cur - x0, 0, 80))} height={20} rx={3} fill={C.latte} />
          <Draw pts={[[x0, 40], [x0 + 80, 40]]} t={cur} from={x0} to={x0 + 80} stroke={C.caramel} w={2} />
          <Draw pts={[[x0 + 80, 112], [x0 + 80, 60]]} t={cur} from={x0 + 80} to={x0 + 88} stroke={C.caramel} w={2} />
          <Draw pts={[[x0 + 76, 66], [x0 + 80, 60], [x0 + 84, 66]]} t={cur} from={x0 + 88} to={x0 + 90} stroke={C.caramel} w={2} pen={false} />
        </g>
      ))}
      <T x={150} y={30} s={11} a="middle" f={C.caramel} o={fa(t, 0.6, 0.3)}>latency</T>
      <T x={150} y={152} s={11} a="middle" f={C.latte} o={fa(t, 0.6, 0.3)}>work</T>
      <Draw pts={[[110, 40], [110, 134]]} t={t} from={2.05} to={2.3} stroke={C.second} w={1} pen={false} dash="3 3" />
      <Draw pts={[[190, 40], [190, 134]]} t={t} from={2.05} to={2.3} stroke={C.second} w={1} pen={false} dash="3 3" />
      <Reticle x={150} y={87} w={100} h={110} t={t} at={2.35} />
      {rows.map((r, i) => {
        const k = fa(t, 1.3 + i * 0.4, 0.45);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={180 + i * 30} r={5} fill={C.caramel} />
            <T x={48} y={185 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 5 · Does the match hold, or is it a coincidence (predict) ──────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the hypothesis, beside the measured result"
        lines={['predicted: roughly the worker\'s own delay', '// measured: does it actually match, or just happen to?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the match holds, confirming the hypothesis ───────────
export function CompareReveal({ t }: StepCtx) {
  const rows = ["the added wait matches the worker's own delay", 'a real result, checked against a real guess'];
  // On one latency axis: the guess drops in as a pin at the worker's own delay, with the margin it allowed drawn around
  // it; then the measured added wait slides out from zero and lands inside that margin.
  const axis = 110;
  const pin = 340;
  const drop = easeOut(seg(t, 0.2, 0.55));
  const slide = easeInOut(seg(t, 0.9, 1.7));
  const measured = 352;
  return (
    <Svg label="evidence_demo, both runs" h={220}>
      <Draw pts={[[60, axis], [540, axis]]} t={t} from={0} to={0.3} stroke={C.mocha} w={1.5} pen={false} />
      <T x={60} y={axis + 22} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>zero</T>
      <rect x={pin - 70} y={axis - 12} width={140 * easeOut(seg(t, 0.55, 0.9))} height={24} rx={4} fill={C.band} />
      <Draw pts={[[pin - 70, axis - 16], [pin - 70, axis + 16]]} t={t} from={0.55} to={0.7} stroke={C.latte} w={1.5} pen={false} />
      <Draw pts={[[pin + 70, axis - 16], [pin + 70, axis + 16]]} t={t} from={0.75} to={0.9} stroke={C.latte} w={1.5} pen={false} />
      <line x1={pin} y1={lerp(30, axis - 20, drop) - 20} x2={pin} y2={lerp(30, axis - 20, drop) + 14} stroke={C.second} strokeWidth={2} opacity={drop} />
      <circle cx={pin} cy={lerp(30, axis - 20, drop) - 20} r={5} fill="none" stroke={C.second} strokeWidth={2} opacity={drop} />
      <T x={pin} y={36} s={11} a="middle" f={C.second} o={fa(t, 0.4, 0.3)}>predicted</T>
      <circle cx={lerp(60, measured, slide)} cy={axis} r={7} fill={C.caramel} opacity={fa(t, 0.9, 0.1)} />
      <T x={measured} y={axis + 34} s={11} a="middle" f={C.caramel} o={fa(t, 1.6, 0.3)}>measured</T>
      <Reticle x={measured} y={axis} w={30} h={30} t={t} at={2.2} />
      {rows.map((r, i) => {
        const k = fa(t, 1.75 + i * 0.3, 0.4);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={174 + i * 30} r={5} fill={C.caramel} />
            <T x={48} y={179 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 7 · The SRE book's own words on the method (connecting) ────────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // The method's two halves, then the loop they make: a guess, a measurement, and a verdict.
  return (
    <Svg label="Effective Troubleshooting, its own words" h={200}>
      <Quote y={10} src="SRE book, troubleshooting" quote="hypothesize potential causes, then test them" mark="hypothesize" t={t} at={0.1} portrait={portrait} />
      <Quote y={86} src="SRE book, same chapter" quote="compare the real state against the theory" mark="against the theory" t={t} at={0.9} portrait={portrait} />
      <Decode text="guess" t={t} at={1.85} dur={0.35} x={50} y={186} s={12} f={C.crema} />
      <Draw pts={[[110, 182], [230, 182]]} t={t} from={2.05} to={2.35} stroke={C.latte} w={1.5} />
      <Decode text="measure" t={t} at={2.25} dur={0.35} x={245} y={186} s={12} f={C.crema} />
      <Tick x={340} y={181} t={t} at={2.45} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a hypothesis, written down before the change', 'a real result, measured after it', 'checked against each other, not just felt'];
  // The payoff: a pen draws the guess as an empty outline first; the measured bar then rises into it, while the identical
  // bar on the right, with no guess drawn around it, is only a number. The one with the guess gets its tick.
  const base = 276;
  const hGuess = 82;
  const rise = easeOut(seg(t, 0.95, 1.6)) * 78;
  return (
    <Svg label="recap: writing down the guess before checking it" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <line x1={150} y1={base} x2={470} y2={base} stroke={C.mocha} opacity={fa(t, 0.2, 0.2)} />
      <Draw pts={[[200, base], [200, base - hGuess], [260, base - hGuess], [260, base]]} t={t} from={0.3} to={0.85} stroke={C.caramel} w={1.5} dash="4 3" />
      <rect x={204} y={base - rise} width={52} height={Math.max(0.01, rise)} fill={C.caramel} />
      <rect x={364} y={base - rise} width={52} height={Math.max(0.01, rise)} fill={C.latte} />
      <T x={130} y={base - 40} s={11} a="end" f={C.latte} o={fa(t, 0.4, 0.3)}>guess</T>
      <T x={430} y={base - 40} s={11} f={C.latte} o={fa(t, 1.3, 0.3)}>no guess</T>
      <Tick x={230} y={base - hGuess - 14} t={t} at={1.75} />
      <Reticle x={230} y={base - hGuess} w={80} h={26} t={t} at={2.35} />
    </Svg>
  );
}
