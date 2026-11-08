import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// A real burst of requests past a real queue's own capacity is shed
// as a real suffix of arrival order, genuinely and reproducibly; an
// explicit, stated failure budget is what lets that exact rate be
// read as a saturated resource behaving correctly, not a bug.
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

// ── 1 · Is every real request accounted for (predict) ──────────────────
export function BurstPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real burst, six requests, one small queue"
        lines={['for id in requests { client.post(submit(id)) }', '// once it settles: is every one accounted for?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: three admitted, three shed, all accounted for ───────
export function BurstReveal({ t }: StepCtx) {
  const rows = ['admitted: three real requests', 'shed: three real requests, none left over'];
  // The burst arrives as one unordered cluster, funnels through the service, and splits into two bins; the cluster ends empty.
  const cluster: [number, number][] = [[58, 66], [82, 58], [70, 86], [96, 80], [52, 100], [84, 106]];
  const dest = (i: number): [number, number] => (i % 2 === 0 ? [420 + (i / 2) * 55, 50] : [420 + ((i - 1) / 2) * 55, 115]);
  return (
    <Svg label="overload_demo, captured" h={210}>
      <circle cx={74} cy={82} r={44} fill="none" stroke={C.mocha} strokeDasharray="3 4" opacity={fa(t, 0, 0.2)} />
      <T x={74} y={28} s={11} a="middle" f={C.latte} o={fa(t, 0, 0.2)}>burst</T>
      <Draw pts={[[130, 82], [260, 82]]} t={t} from={0.05} to={0.35} stroke={C.mocha} w={1.5} pen={false} />
      <Draw pts={[[260, 82], [390, 50]]} t={t} from={0.3} to={0.55} stroke={C.mocha} w={1.5} pen={false} />
      <Draw pts={[[260, 82], [390, 115]]} t={t} from={0.3} to={0.55} stroke={C.mocha} w={1.5} pen={false} />
      <rect x={392} y={32} width={170} height={36} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={fa(t, 0.3, 0.3)} />
      <rect x={392} y={97} width={170} height={36} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={fa(t, 0.3, 0.3)} />
      {cluster.map(([x, y], i) => {
        const at = 0.35 + [0, 3, 1, 4, 2, 5][i] * 0.08;
        const k = easeInOut(seg(t, at, at + 0.75));
        const [dx, dy] = dest(i);
        const p = along([[x, y], [260, 82], [dx, dy]], k);
        const ok = i % 2 === 0;
        return <circle key={i} cx={p[0]} cy={p[1]} r={6} fill={ok ? C.caramel : 'none'} stroke={ok ? undefined : C.cherryText} strokeWidth={ok ? 0 : 2} />;
      })}
      <Draw pts={[[572, 32], [582, 32], [582, 133], [572, 133]]} t={t} from={1.5} to={1.85} stroke={C.caramel} w={1.5} pen={false} />
      <Reticle x={477} y={83} w={196} h={116} t={t} at={2.3} />
      {rows.map((r, i) => {
        const k = fa(t, 1.3 + i * 0.35, 0.45);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={165 + i * 30} r={5} fill={i ? 'none' : C.caramel} stroke={C.cherryText} strokeWidth={i ? 2 : 0} />
            <T x={48} y={170 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 3 · Could shedding land on an arbitrary request (predict) ──────────
export function SuffixPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the three shed requests, checked against order"
        lines={['min(shed_ids) > max(admitted_ids) // real check', '// could shedding land on an earlier request too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: shedding is a real suffix of the order (takeaway) ────
export function SuffixReveal({ t }: StepCtx) {
  const ids = [0, 1, 2, 3, 4, 5];
  return (
    <Svg label="overload_demo, captured" h={200}>
      <T x={30} y={30} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>requests, in arrival order</T>
      {ids.map((i) => {
        const admitted = i < 3;
        const start = 0.2 + i * 0.1;
        const travel = easeOut(seg(t, start, start + 0.25));
        const x0 = 40 + i * 50;
        return (
          <g key={i}>
            <Draw pts={[[x0, 50], [x0, admitted ? 90 : 120]]} t={t} from={start} to={start + 0.25} stroke={admitted ? C.caramel : C.latte} w={2} pen />
            <circle
              cx={x0}
              cy={50 + travel * (admitted ? 40 : 70)}
              r={5}
              fill={admitted ? C.caramel : 'none'}
              stroke={admitted ? undefined : C.cherry}
              strokeWidth={admitted ? 0 : 1.5}
              opacity={fa(t, start, 0.2)}
            />
          </g>
        );
      })}
      <g opacity={fa(t, 1.0, 0.3)}>
        <rect x={30} y={130} width={320} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={152} s={12} a="middle" f={C.mocha}>shed requests come after admitted ones</T>
      </g>
      <T x={60} y={185} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>a real suffix, never an arbitrary pick</T>
    </Svg>
  );
}

// ── 5 · Does the identical burst reproduce the split (predict) ─────────
export function ReproduciblePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical burst, run again, fresh instance"
        lines={['run_burst(&client, 6, 2, 150) // same real inputs', '// same real split, or does timing noise change it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the identical split reproduces exactly (takeaway) ────
export function ReproducibleReveal({ t }: StepCtx) {
  const runs = [0, 1];
  return (
    <Svg label="overload_demo, captured" h={225}>
      {runs.map((run) => {
        const y0 = 35 + run * 60;
        return (
          <g key={run}>
            <T x={30} y={y0 - 5} s={11} f={C.latte} o={fa(t, 0.1 + run * 0.3, 0.2)}>{run === 0 ? 'run 1' : 'run 2, fresh instance'}</T>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const admitted = i < 3;
              const start = 0.25 + run * 0.3 + i * 0.07;
              const grow = easeOut(seg(t, start, start + 0.2));
              return (
                <circle
                  key={i}
                  cx={40 + i * 50}
                  cy={y0 + 15}
                  r={grow * 5}
                  fill={admitted ? C.caramel : 'none'}
                  stroke={admitted ? undefined : C.cherry}
                  strokeWidth={admitted ? 0 : 1.5}
                  opacity={fa(t, start, 0.15)}
                />
              );
            })}
          </g>
        );
      })}
      <g opacity={fa(t, 1.3, 0.3)}>
        <rect x={30} y={160} width={320} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={182} s={12} a="middle" f={C.mocha}>three admitted, three shed, again</T>
      </g>
      <T x={60} y={205} s={12} f={C.latte} o={fa(t, 1.9, 0.3)}>real, deterministic saturation</T>
    </Svg>
  );
}

// ── 7 · load_shed and the SRE book's own words (connecting) ────────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // Then the two ideas meet: shedding is spent against a stated budget, and stays under its limit.
  const fill = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="load_shed and the SRE book, quoted" h={200}>
      <Quote y={10} src="tower::load_shed" quote="middleware for shedding load" mark="shedding load" t={t} at={0.1} portrait={portrait} />
      <Quote y={84} src="SRE book, error budgets" quote="how unreliable is allowed" mark="allowed" t={t} at={0.9} portrait={portrait} />
      <T x={30} y={182} s={11} f={C.latte} o={fa(t, 1.9, 0.2)}>budget</T>
      <rect x={100} y={172} width={300} height={10} rx={3} fill={C.cocoa} opacity={fa(t, 1.9, 0.2)} />
      <rect x={100} y={172} width={Math.max(0.01, fill * 180)} height={10} rx={3} fill={C.caramel} />
      <Draw pts={[[340, 164], [340, 190]]} t={t} from={1.95} to={2.2} stroke={C.cherryText} w={2} pen={false} />
      <Decode text="within" t={t} at={2.4} dur={0.4} x={420} y={182} s={11} f={C.caramel} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a queue sheds a real, reproducible suffix', 'that exact rate is a measured, real fact', 'a budget turns a rate into an expected cost'];
  // The payoff: a run's tail drops away as shed, a second run lands identically on it, and that rate fills a budget bar to its mark.
  const run = (r: number) => {
    const at = 0.25 + r * 0.7;
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const k = easeOut(seg(t, at + i * 0.04, at + i * 0.04 + 0.35));
      const shed = i >= 3;
      const drop = shed ? easeOut(seg(t, at + 0.4, at + 0.7)) * 8 : 0;
      return (
        <circle key={`${r}${i}`} cx={lerp(30, 90 + i * 50, k)} cy={180 + r * 34 + drop} r={6} opacity={k}
          fill={shed ? 'none' : C.caramel} stroke={shed ? C.cherryText : undefined} strokeWidth={shed ? 2 : 0} />
      );
    });
  };
  const fill = easeOut(seg(t, 1.7, 2.3));
  return (
    <Svg label="recap: a budget that tells overload from a bug" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      {run(0)}
      {run(1)}
      <Draw pts={[[215, 166], [215, 234]]} t={t} from={1.1} to={1.4} stroke={C.latte} w={1.5} pen={false} />
      <rect x={90} y={262} width={300} height={10} rx={3} fill={C.cocoa} opacity={fa(t, 1.55, 0.2)} />
      <rect x={90} y={262} width={Math.max(0.01, fill * 150)} height={10} rx={3} fill={C.caramel} />
      <Draw pts={[[240, 254], [240, 280]]} t={t} from={1.6} to={1.85} stroke={C.cherryText} w={2} pen={false} />
      <T x={410} y={272} s={11} f={C.latte} o={fa(t, 1.6, 0.3)}>expected</T>
      <Reticle x={240} y={267} w={40} h={36} t={t} at={2.4} />
    </Svg>
  );
}
