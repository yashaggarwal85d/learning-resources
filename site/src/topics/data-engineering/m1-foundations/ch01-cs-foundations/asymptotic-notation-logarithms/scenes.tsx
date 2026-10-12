import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, SERIF, Svg, T } from '../../../../../reels/kit';
import { RefresherList } from '../refreshers';

// Every number drawn here is computed or asserted in examples.py. Each scene is a pure function of time.
// Staging: things arrive in the order the narration says them (DESIGN.md "steady beat"); `duration` in reel.tsx ends on the last one.
const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));
const commas = (n: number) => Math.round(n).toLocaleString('en-US');

// The notation glyphs are always the serif ones (the mono font has no Θ), and a logarithm's base is a real subscript.
const Th = <tspan fontFamily={SERIF}>Θ</tspan>;
const Big = <tspan fontFamily={SERIF}>O</tspan>;
const Om = <tspan fontFamily={SERIF}>Ω</tspan>;
const LogB = ({ rest }: { rest: string }) => (
  <>
    log
    <tspan fontSize="0.8em" dy="0.28em">
      b
    </tspan>
    <tspan dy="-0.28em">{' ' + rest}</tspan>
  </>
);

// 1 · Where we are: the last of the five refreshers.
export const Opening = (c: StepCtx) => <RefresherList {...c} current={4} />;

// 2 · O is a ceiling, Ω a floor, Θ both: the cost divided by n·log₂n, g(n) = 3·n·log₂n + 8n.
// Beats: the ceiling line, the floor line, the ratio curve settling between them, then the Θ label.
export function RatioBand({ t, portrait }: StepCtx) {
  const H = portrait ? 420 : 340;
  const top = portrait ? 100 : 86;
  const bot = portrait ? 360 : 290;
  const X0 = 60;
  const W = 500;
  const L = Math.log2(100_000_000); // 26.575
  const xs = (lg: number) => X0 + ((lg - 1) / (L - 1)) * W;
  const ys = (r: number) => bot - (r / 12) * (bot - top);
  const p = easeInOut(seg(t, 2.6, 4.6));
  const lgTip = 1 + p * (L - 1);
  const nTip = 2 ** lgTip;
  const rTip = 3 + 8 / lgTip;
  const crossed = lgTip >= 8;
  const pts: string[] = [];
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const lg = 1 + (lgTip - 1) * (i / steps);
    pts.push(`${xs(lg).toFixed(1)},${ys(3 + 8 / lg).toFixed(1)}`);
  }
  const axes = fade(t, 0.2, 0.6);
  const ceil = fade(t, 0.6, 1.1);
  const floor = fade(t, 1.6, 2.1);
  const curve = fade(t, 2.4, 2.7);
  const x256 = xs(8);
  const band = fade(t, 4.8, 5.3);
  return (
    <Svg label="The job's cost divided by n log n falls and stays between the ceiling 4 and the floor 3 from n = 256 on" h={H}>
      <g opacity={curve}>
        <T x={X0} y={portrait ? 40 : 30} s={15} f={C.latte}>
          {crossed ? 'from n₀ = 256 on: 3 ≤ ratio ≤ 4' : 'below n₀ the ceiling is crossed'}
        </T>
        <T x={X0} y={portrait ? 68 : 56} s={15} f={C.crema}>
          {`cost ÷ n·log₂n = ${rTip.toFixed(2)} at n = ${commas(nTip)}`}
        </T>
      </g>
      <g opacity={axes}>
        <line x1={X0} y1={bot} x2={X0 + W} y2={bot} stroke={C.taupe} />
        <T x={X0} y={bot + 20} s={13} f={C.taupe}>2</T>
        <T x={xs(16)} y={bot + 20} s={13} f={C.taupe} a="middle">65,536</T>
        <T x={X0 + W} y={bot + 20} s={13} f={C.taupe} a="end">100 M</T>
        <T x={X0 + W / 2} y={bot + 42} s={13} f={C.taupe} a="middle">n (log scale)</T>
      </g>
      <g opacity={ceil}>
        <line x1={X0} y1={ys(4)} x2={X0 + W} y2={ys(4)} stroke={C.caramel} strokeDasharray="6 5" />
        <T x={X0 - 8} y={ys(4) + 5} s={13} f={C.caramel} a="end">4</T>
        <T x={x256 + 8} y={ys(4) - 8} s={13} f={C.caramel}>{Big}: ceiling c = 4</T>
      </g>
      <g opacity={floor}>
        <line x1={X0} y1={ys(3)} x2={X0 + W} y2={ys(3)} stroke={C.latte} strokeDasharray="6 5" />
        <T x={X0 - 8} y={ys(3) + 5} s={13} f={C.latte} a="end">3</T>
        <T x={x256 + 8} y={ys(3) + 18} s={13} f={C.latte}>{Om}: floor c = 3</T>
      </g>
      <g opacity={curve}>
        <line x1={x256} y1={top} x2={x256} y2={bot} stroke={crossed ? C.caramel : C.taupe} strokeDasharray="2 5" strokeWidth={crossed ? 2 : 1} />
        <T x={x256 + 8} y={top + 12} s={13} f={crossed ? C.caramel : C.taupe}>n₀ = 256</T>
        <polyline points={pts.join(' ')} fill="none" stroke={C.crema} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={xs(lgTip)} cy={ys(rTip)} r={6} fill={C.crema} />
      </g>
      <rect x={x256} y={ys(4)} width={X0 + W - x256} height={ys(3) - ys(4)} fill={C.caramel} opacity={0.18 * band} />
      <T x={X0 + W - 24} y={ys(4) - 22} s={20} f={C.caramel} a="end" serif o={band}>Θ(n log n)</T>
    </Svg>
  );
}

// 3 · Is it also O(n²)? A predict step; the answer frame is a complete still.
export function LooseCeiling({ t, answer, portrait }: StepCtx) {
  const H = portrait ? 340 : 320;
  if (answer === null) {
    const a = fade(t, 0.2, 0.6);
    const b = fade(t, 0.6, 1.0);
    return (
      <Svg label="A job of 3 n log n plus 8 n steps, and the candidate ceiling O of n squared" h={H}>
        {portrait ? (
          <>
            <rect x={50} y={60} width={500} height={70} rx={14} fill="none" stroke={C.mocha} opacity={a} />
            <T x={300} y={103} s={17} f={C.crema} a="middle" o={a}>job: 3·n·log₂n + 8n steps</T>
            <rect x={150} y={160} width={300} height={80} rx={14} fill="none" stroke={C.caramel} strokeWidth={2} opacity={b} />
            <T x={300} y={209} s={22} f={C.caramel} a="middle" o={b}>{Big}(n²) ?</T>
            <T x={300} y={290} s={13} f={C.taupe} a="middle" o={b}>{Th}(n log n), from the last step</T>
          </>
        ) : (
          <>
            <rect x={24} y={60} width={290} height={70} rx={14} fill="none" stroke={C.mocha} opacity={a} />
            <T x={169} y={103} s={15} f={C.crema} a="middle" o={a}>job: 3·n·log₂n + 8n steps</T>
            <rect x={334} y={60} width={196} height={70} rx={14} fill="none" stroke={C.caramel} strokeWidth={2} opacity={b} />
            <T x={432} y={105} s={22} f={C.caramel} a="middle" o={b}>{Big}(n²) ?</T>
            <T x={277} y={190} s={13} f={C.taupe} a="middle" o={b}>{Th}(n log n), from the last step</T>
          </>
        )}
      </Svg>
    );
  }
  // Answer frame: two bars at n = 100,000,000 on a log₁₀ axis from 1 billion to 10 quadrillion.
  const jobW = (((Math.log10(8_772_627_428) - 9) / 7) * 500);
  const r0 = portrait ? 40 : 40;
  const gap = portrait ? 78 : 78;
  return (
    <Svg label="At 100 million rows the job needs about 9 billion steps; n squared is 10 quadrillion, 1,139,909 times more" h={H}>
      <T x={40} y={r0} s={15} f={C.crema}>job: 8,772,627,428 steps</T>
      <rect x={40} y={r0 + 12} width={500} height={26} rx={7} fill={C.cocoa} />
      <rect x={40} y={r0 + 12} width={jobW} height={26} rx={7} fill={C.crema} />
      <T x={40} y={r0 + gap} s={15} f={C.crema}>n²: 10,000,000,000,000,000 steps</T>
      <rect x={40} y={r0 + gap + 12} width={500} height={26} rx={7} fill={C.cinnamon} />
      <T x={536} y={r0 + gap + 60} s={13} f={C.cinnamon} a="end">10 quadrillion</T>
      <T x={40} y={r0 + gap + 60} s={13} f={C.taupe}>log scale from 1 billion</T>
      <T x={300} y={r0 + gap + 100} s={15} f={C.crema} a="middle">true: a ceiling, 1,139,909× too high</T>
      <T x={300} y={r0 + gap + 126} s={13} f={C.taupe} a="middle">c = 11 works from n = 1</T>
    </Svg>
  );
}

// 4 · Double the data: n, n·log₂n and n² at 1,000, 1,000,000 and 100,000,000 rows, then at 200,000,000.
const LANES = [
  { name: 'n', secs: [1e-6, 1e-3, 0.1], text: ['1 µs', '1 ms', '0.1 s'], mult: 2, grow: '×2' },
  { name: 'n·log₂n', secs: [1e-5, 0.02, 2.7], text: ['10 µs', '20 ms', '2.7 s'], mult: 2.0752, grow: '×2.08' },
  { name: 'n²', secs: [1e-3, 1000, 1e7], text: ['1 ms', '17 min', '116 days'], mult: 4, grow: '×4' },
];
const COUNT = ['n = 1,000 orders', 'n = 1,000,000 orders', 'n = 100,000,000 orders', 'double it: 200,000,000 orders'];
// A log axis from 100 ns (10^-7 s) to 100,000,000 s (10^8 s): 15 decades, with named ticks up to 1 year. See examples.py.
const logFrac = (s: number) => clamp((Math.log10(s) + 7) / 15);
const TICKS = [
  { s: 1e-6, label: '1 µs' },
  { s: 1e-3, label: '1 ms' },
  { s: 1, label: '1 s' },
  { s: 1e3, label: '1000 s' },
  { s: 86_400, label: '1 day' },
  { s: 365 * 86_400, label: '1 year' },
];
export function Race({ t, portrait }: StepCtx) {
  const H = portrait ? 440 : 360;
  const starts = [0.6, 1.8, 3.0, 5.2];
  const stage = t < starts[1] ? 0 : t < starts[2] ? 1 : t < starts[3] ? 2 : 3;
  const lanesIn = fade(t, 0.2, 0.6);
  const ys = portrait ? [150, 230, 310] : [118, 188, 258];
  const axisY = ys[2] + 44;
  return (
    <Svg label="n, n log n and n squared at a thousand, a million and 100 million orders, then at double that" h={H}>
      <T x={300} y={portrait ? 44 : 36} s={24} f={C.crema} a="middle" serif>{COUNT[stage]}</T>
      <T x={300} y={portrait ? 72 : 60} s={13} f={C.taupe} a="middle">at 1,000,000,000 steps per second (a round assumption)</T>
      {LANES.map((lane, i) => {
        const y = ys[i];
        const s2 = Math.min(stage, 2);
        const from = s2 === 0 ? 0 : logFrac(lane.secs[s2 - 1]);
        const to = logFrac(lane.secs[s2]);
        const k = easeInOut(seg(t, starts[s2], starts[s2] + 0.6));
        const frac = t < 0.6 ? 0 : lerp(from, to, k);
        const over = stage >= 2 && i === 2 && t >= starts[2];
        const shown = t >= 0.6;
        const endF = logFrac(lane.secs[2]);
        const tail = logFrac(lane.secs[2] * lane.mult) - endF;
        const tk = easeInOut(seg(t, starts[3], starts[3] + 0.9));
        return (
          <g key={lane.name} opacity={lanesIn}>
            <T x={40} y={y - 6} s={15} f={C.latte}>{lane.name}</T>
            {shown && (
              <T x={540} y={y - 6} s={17} f={stage === 3 ? (i === 2 ? C.cherryText : C.crema) : over ? C.cherryText : C.crema} a="end" w={700}>
                {stage === 3 ? lane.grow : lane.text[stage]}
              </T>
            )}
            <rect x={40} y={y} width={500} height={26} rx={7} fill={C.cocoa} />
            <rect x={40} y={y} width={Math.max(3, 500 * frac)} height={26} rx={7} fill={over ? C.cherry : C.caramel} />
            {stage === 3 && <rect x={40 + 500 * endF} y={y} width={Math.max(0, 500 * tail * tk)} height={26} rx={2} fill={i === 2 ? C.cherryText : C.crema} />}
          </g>
        );
      })}
      <g opacity={lanesIn}>
        {ys.map((y) =>
          TICKS.map((k) => (
            <line key={`${y}${k.label}`} x1={40 + 500 * logFrac(k.s)} y1={y} x2={40 + 500 * logFrac(k.s)} y2={y + 26} stroke={C.taupe} strokeWidth={1.5} opacity={0.7} />
          )),
        )}
        {TICKS.map((k) => (
          <line key={k.label} x1={40 + 500 * logFrac(k.s)} y1={axisY - 6} x2={40 + 500 * logFrac(k.s)} y2={axisY + 4} stroke={C.taupe} />
        ))}
        <line x1={40} y1={axisY} x2={540} y2={axisY} stroke={C.taupe} />
        {TICKS.map((k) => (
          <T key={k.label} x={40 + 500 * logFrac(k.s)} y={axisY + 22} s={13} f={C.taupe} a="middle">{k.label}</T>
        ))}
        <T x={290} y={axisY + 48} s={15} f={C.taupe} a="middle">log scale: 1 µs to 1 year</T>
      </g>
    </Svg>
  );
}

// A tower is a stack of equal-height blocks; its height is the number of divisions (the logarithm).
function Tower({ cx, base, unit, width, blocks, sliver, fill, builtAt, gapT, t, o = 1 }: { cx: number; base: number; unit: number; width: number; blocks: number; sliver: number; fill: string; builtAt: number; gapT: number; t: number; o?: number }) {
  const parts = [];
  for (let i = 0; i < blocks; i++) {
    const k = fade(t, builtAt + i * gapT, builtAt + i * gapT + 0.2);
    parts.push(<rect key={i} x={cx - width / 2} y={base - (i + 1) * unit + 1} width={width} height={unit - 1.5} rx={2} fill={fill} opacity={k * o} />);
  }
  if (sliver > 0) {
    const k = fade(t, builtAt + blocks * gapT, builtAt + blocks * gapT + 0.2);
    parts.push(<rect key="s" x={cx - width / 2} y={base - blocks * unit - sliver * unit + 1} width={width} height={Math.max(2, sliver * unit - 1.5)} rx={2} fill={fill} opacity={k * o} />);
  }
  return <>{parts}</>;
}

// 5 · Bisect, at a billion: a logarithm counts divisions. A predict step.
export function Halvings({ t, answer, portrait }: StepCtx) {
  const H = portrait ? 330 : 360;
  const base = portrait ? 236 : 290;
  const dy = portrait ? 6.5 : 7;
  const a = fade(t, 0.2, 0.6);
  const b = fade(t, 0.6, 1.0);
  const lx = portrait ? 100 : 110;
  const rx = 250;
  const topY = base - 30 * dy;
  return (
    <Svg label="A staircase of 10 halvings for 1,000 commits, and a taller one for a billion; each slab is one halving" h={H}>
      <Tower cx={lx} base={base} unit={dy} width={40} blocks={10} sliver={0} fill={C.caramel} builtAt={0.2} gapT={0.03} t={t} />
      <T x={lx} y={base - 10 * dy - 66} s={15} f={C.latte} a="middle" o={a}>1,000 commits</T>
      <T x={lx} y={base - 10 * dy - 40} s={15} f={C.latte} a="middle" o={a}>10 tests</T>
      <T x={lx} y={base - 10 * dy - 14} s={15} f={C.latte} a="middle" o={a}>(Git refresher)</T>
      <T x={rx} y={base + 22} s={17} f={C.crema} a="middle" o={b}>1,000,000,000</T>
      <T x={rx} y={base + 44} s={13} f={C.taupe} a="middle" o={b}>1 slab = 1 halving</T>
      {answer === null ? (
        <>
          <rect x={rx - 22} y={topY} width={44} height={30 * dy} rx={4} fill="none" stroke={C.taupe} strokeDasharray="5 6" opacity={b} />
          <T x={rx} y={topY - 12} s={20} f={C.caramel} a="middle" o={b}>?</T>
        </>
      ) : (
        <>
          <Tower cx={rx} base={base} unit={dy} width={40} blocks={30} sliver={0} fill={C.caramel} builtAt={0} gapT={0} t={9} />
          <T x={rx} y={topY - 16} s={28} f={C.caramel} a="middle" serif>30</T>
          {[
            [10, 'after 10: 976,563'],
            [20, 'after 20: 954'],
            [30, 'after 30: under 1'],
          ].map(([k, label]) => (
            <g key={String(k)}>
              <line x1={rx + 24} y1={base - Number(k) * dy + dy / 2} x2={rx + 36} y2={base - Number(k) * dy + dy / 2} stroke={C.taupe} />
              <T x={rx + 42} y={base - Number(k) * dy + dy / 2 + 5} s={15} f={C.crema}>{String(label)}</T>
              <T x={rx + 42} y={base - (Number(k) - 5) * dy + 4} s={13} f={C.taupe}>÷ 1,024</T>
            </g>
          ))}
          <T x={rx} y={base + 66} s={15} f={C.taupe} a="middle">log₂ of a billion = 29.9</T>
        </>
      )}
    </Svg>
  );
}

// 6 · Any base, one formula: one length, three rulers. One ruler per spoken beat, then the 3.32.
export function Rulers({ t, portrait }: StepCtx) {
  const H = portrait ? 380 : 340;
  const ys = portrait ? [130, 225, 320] : [120, 198, 276];
  const total = Math.log(1e9);
  const rows = [
    { label: 'base 2', sub: '÷ ln 2 = 0.693', step: Math.log(2), count: '29.9 halvings', t0: 1.0 },
    { label: 'base 10', sub: '÷ ln 10 = 2.303', step: Math.log(10), count: '9 divisions', t0: 2.8 },
    { label: 'base 1,000', sub: '÷ ln 1,000 = 6.908', step: Math.log(1000), count: '3 divisions', t0: 4.6 },
  ];
  const intro = fade(t, 0.2, 0.6);
  const bh = portrait ? 28 : 24;
  return (
    <Svg label="ln of a billion is 20.72; cut into pieces of ln 2, ln 10 and ln 1,000 it gives 29.9, 9 and 3 pieces; 29.9 over 9 is 3.32" h={H}>
      <T x={40} y={portrait ? 36 : 30} s={20} f={C.crema} serif o={intro}>
        <LogB rest="x = ln x / ln b" />
      </T>
      <T x={40} y={portrait ? 66 : 56} s={15} f={C.crema} o={intro}>ln(1,000,000,000) = 20.72</T>
      {rows.map((r, i) => {
        const y = ys[i];
        const sweep = seg(t, r.t0, r.t0 + 0.9);
        const appear = fade(t, r.t0 - 0.2, r.t0 + 0.1);
        const ticks: number[] = [];
        for (let j = 1; j * r.step < total - 1e-6; j++) ticks.push(j);
        return (
          <g key={r.label}>
            <T x={40} y={y - 6} s={15} f={C.latte} o={appear}>{r.label}</T>
            <T x={540} y={y - 6} s={17} f={C.caramel} a="end" w={700} o={fade(t, r.t0 + 0.9, r.t0 + 1.3)}>{r.count}</T>
            <rect x={40} y={y} width={500} height={bh} rx={7} fill={C.mocha} opacity={appear} />
            {ticks.map((j) => {
              const x = 40 + (j * r.step * 500) / total;
              return <line key={j} x1={x} y1={y} x2={x} y2={y + bh} stroke={C.latte} strokeWidth={2.5} opacity={x - 40 <= sweep * 500 ? 1 : 0} />;
            })}
            <T x={40} y={y + bh + 18} s={13} f={C.taupe} o={appear}>{r.sub}</T>
          </g>
        );
      })}
      <T x={540} y={ys[1] + bh + 18} s={13} f={C.latte} a="end" o={fade(t, 6.0, 6.4)}>29.9 ÷ 9 = 3.32</T>
    </Svg>
  );
}

// 7 · A large base means fewer divisions: a billion divided by 2, by 1,000 and by 16,384.
// Each row is the same billion cut into cells, one cell per division, so the count of cells is the logarithm.
export function Divisions({ t }: StepCtx) {
  const H = 320;
  const ys = [78, 164, 250];
  const cellH = 32;
  const rows = [
    { label: '÷ 2', count: '29.9', n: 29.9, fill: C.cinnamon, t0: 0.4, gap: 0.06 },
    { label: '÷ 1,000', count: '3', n: 3, fill: C.caramel, t0: 2.6, gap: 0.35 },
    { label: '÷ 16,384', count: '2.14', n: 2.14, fill: C.caramel, t0: 4.2, gap: 0.4 },
  ];
  return (
    <Svg label="A billion divided by 2 takes 29.9 divisions; by 1,000, 3 divisions; by 16,384, 2.14 divisions" h={H}>
      {rows.map((r, i) => {
        const y = ys[i];
        const w = 500 / r.n;
        const whole = Math.floor(r.n + 1e-9);
        const frac = r.n - whole;
        const done = r.t0 + (whole + 1) * r.gap + 0.2;
        return (
          <g key={r.label}>
            <T x={40} y={y - 8} s={15} f={C.latte} o={fade(t, r.t0 - 0.2, r.t0)}>{r.label}</T>
            {Array.from({ length: whole }, (_, j) => (
              <rect key={j} x={40 + j * w + 1} y={y} width={w - 2} height={cellH} rx={3} fill={r.fill} opacity={fade(t, r.t0 + j * r.gap, r.t0 + j * r.gap + 0.2)} />
            ))}
            {frac > 0.01 && <rect x={40 + whole * w + 1} y={y} width={frac * w - 2} height={cellH} rx={3} fill={r.fill} opacity={fade(t, r.t0 + whole * r.gap, r.t0 + whole * r.gap + 0.2)} />}
            <T x={540} y={y - 8} s={22} f={C.crema} a="end" serif o={fade(t, done, done + 0.4)}>{r.count}</T>
          </g>
        );
      })}
      <T x={300} y={ys[2] + cellH + 32} s={13} f={C.taupe} a="middle" o={fade(t, 5.4, 5.8)}>a bigger base needs fewer divisions</T>
    </Svg>
  );
}

// 8 · How tall is the orders index? A predict step.
export function IndexLevels({ t, answer }: StepCtx) {
  const H = 350;
  if (answer === null) {
    const a = fade(t, 0.2, 0.6);
    const b = fade(t, 0.6, 1.0);
    const c = fade(t, 1.0, 1.2);
    const bandY = 280;
    const topY = 90;
    const botY = bandY - 10;
    const apexW = 40;
    return (
      <Svg label="100 million order ids at the bottom, a tree of pages above, and a question mark for the number of levels" h={H}>
        <rect x={40} y={bandY} width={500} height={34} rx={8} fill={C.crema} opacity={0.9 * a} />
        <T x={290} y={bandY + 23} s={15} f={C.espresso} a="middle" w={600} o={a}>100,000,000 order ids</T>
        <rect x={40} y={40} width={22} height={28} rx={4} fill="none" stroke={C.latte} opacity={b} />
        <T x={74} y={60} s={13} f={C.latte} o={b}>1 page: 8 KB, about 400 entries</T>
        <path d={`M ${290 - apexW / 2} ${topY} L ${290 + apexW / 2} ${topY} L 540 ${botY} L 40 ${botY} Z`} fill="none" stroke={C.taupe} strokeDasharray="5 6" opacity={b} />
        <T x={290} y={(topY + botY) / 2 + 20} s={20} f={C.caramel} a="middle" o={c}>? levels</T>
        <T x={290} y={(topY + botY) / 2 + 46} s={13} f={C.taupe} a="middle" o={c}>each level × 400</T>
      </Svg>
    );
  }
  // Answer: the reach after each level on a log₁₀ axis, against the 100,000,000 target from the question.
  const y0 = 80;
  const pitch = 62;
  const barH = 16;
  const scale = 500 / 10.5; // units per decade
  const rows = [
    { reach: 400, text: '1 level: 400', fill: C.mocha, ink: C.crema },
    { reach: 160_000, text: '2 levels: 160,000', fill: C.mocha, ink: C.crema },
    { reach: 64_000_000, text: '3 levels: 64,000,000 · short', fill: C.cherry, ink: C.cherryText },
    { reach: 25_600_000_000, text: '4 levels: 25,600,000,000', fill: C.caramel, ink: C.caramel },
  ];
  const tx = 40 + Math.log10(100_000_000) * scale;
  const lastBar = y0 + 3 * pitch + 8 + barH;
  return (
    <Svg label="Three levels of 400 reach only 64 million keys, short of the 100 million orders; four levels reach 25.6 billion: the index has 4 levels" h={H}>
      <T x={40} y={44} s={28} f={C.caramel} serif>4</T>
      <T x={tx} y={44} s={13} f={C.caramel} a="middle">target: 100,000,000</T>
      <line x1={tx} y1={y0 - 18} x2={tx} y2={lastBar + 8} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" />
      {rows.map((r, i) => (
        <g key={r.text}>
          <T x={40} y={y0 + i * pitch} s={15} f={r.ink} w={600}>{r.text}</T>
          <rect x={40} y={y0 + i * pitch + 8} width={Math.log10(r.reach) * scale} height={barH} rx={5} fill={r.fill} />
          {i < 3 && (
            <T x={540} y={y0 + i * pitch + 8 + barH + 18} s={13} f={C.taupe} a="end">× 400</T>
          )}
        </g>
      ))}
      <T x={40} y={lastBar + 30} s={13} f={C.taupe}>bar length: log scale</T>
      <T x={540} y={lastBar + 30} s={15} f={C.cinnamon} a="end">binary tree: 27 levels</T>
    </Svg>
  );
}

// 9 · Sort passes are a logarithm too: 1 TiB, 16 GiB of memory, 1 MiB blocks.
// Every bar is one pass over the whole 1 TiB: pass 1 is 64 runs, pass 2 merges them, and merging two at a time would need seven.
export function SortPasses({ t }: StepCtx) {
  const H = 390;
  const a = fade(t, 0.2, 0.6);
  const cellW = 500 / 64;
  const p2 = easeOut(seg(t, 3.0, 3.8));
  const fin = fade(t, 4.0, 4.4);
  return (
    <Svg label="Sorting 1 TiB with 16 GiB of memory takes 2 whole passes, each reading and writing the whole terabyte; merging two at a time would take 7" h={H}>
      <T x={40} y={24} s={15} f={C.crema} o={a}>1,048,576 blocks (1 TiB ÷ 1 MiB)</T>
      <T x={40} y={46} s={13} f={C.taupe} o={a}>memory holds 16,384 blocks (16 GiB ÷ 1 MiB)</T>
      <T x={40} y={86} s={15} f={C.crema} o={fade(t, 0.8, 1.1)}>pass 1: 1 TiB → 64 runs</T>
      {Array.from({ length: 64 }, (_, i) => (
        <rect key={i} x={40 + i * cellW} y={94} width={cellW - 1.5} height={16} rx={1.5} fill={C.caramel} opacity={fade(t, 1.0 + i * 0.02, 1.0 + i * 0.02 + 0.2)} />
      ))}
      <T x={40} y={142} s={15} f={C.crema} o={fade(t, 2.8, 3.1)}>pass 2: 64 runs → 1 file</T>
      <rect x={40} y={150} width={500 * p2} height={16} rx={3} fill={C.caramel} />
      <T x={40} y={202} s={24} f={C.caramel} serif o={fin}>2 passes</T>
      <T x={540} y={200} s={17} f={C.crema} a="end" w={600} o={fin}>4 TiB of I/O</T>
      <T x={40} y={222} s={13} f={C.taupe} o={fin}>each pass reads and writes the whole 1 TiB</T>
      <T x={40} y={262} s={15} f={C.cinnamon} w={600} o={fade(t, 4.8, 5.1)}>two at a time: 7 passes</T>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={40} y={270 + i * 16} width={500} height={12} rx={3} fill={C.cinnamon} opacity={fade(t, 5.0 + i * 0.2, 5.0 + i * 0.2 + 0.2)} />
      ))}
    </Svg>
  );
}

// 10 · Big-O is not a stopwatch: same step count, same Theta, a different price per step.
export function SameSteps({ t }: StepCtx) {
  const H = 340;
  const yA = 88;
  const yB = 192;
  const labels = fade(t, 0.2, 0.6);
  const timeA = t >= 1.9;
  const timeB = t >= 4.4;
  return (
    <Svg label="Two scans of the same 100,000,000 rows: same step count, same Theta of n; scan A finds its data in cache and takes about 0.1 seconds, scan B waits on disk and takes about 2.8 hours" h={H}>
      <T x={40} y={yA - 8} s={15} f={C.latte} o={labels}>scan A: 100,000,000 steps</T>
      <T x={540} y={yA - 8} s={17} f={C.crema} a="end" w={700} o={labels}>{timeA ? '0.1 s' : 'time: ?'}</T>
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={40 + i * 6.8} y={yA} width={4} height={26} rx={1} fill={C.caramel} opacity={t > 0.6 + (i / 24) ? 1 : 0} />
      ))}
      <T x={40} y={yA + 48} s={13} f={C.taupe} o={fade(t, 1.4, 1.8)}>data in cache: about 1 ns a step</T>
      <T x={40} y={yB - 8} s={15} f={C.latte} o={labels}>scan B: 100,000,000 steps</T>
      <T x={540} y={yB - 8} s={17} f={C.crema} a="end" w={700} o={labels}>{timeB ? '2.8 hours' : 'time: ?'}</T>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 40 + i * 83;
        const t0 = 2.4 + i * 0.3;
        return (
          <g key={i}>
            <rect x={x} y={yB} width={4} height={26} rx={1} fill={C.caramel} opacity={t > t0 ? 1 : 0} />
            <rect x={x + 8} y={yB + 8} width={64 * seg(t, t0, t0 + 0.3)} height={10} rx={3} fill={C.taupe} />
          </g>
        );
      })}
      <T x={40} y={yB + 48} s={13} f={C.taupe} o={fade(t, 2.4, 2.8)}>data on disk: each step waits, about 100 µs</T>
      <g opacity={fade(t, 4.6, 5.0)}>
        <T x={300} y={yB + 98} s={17} f={C.crema} a="middle">same count, same {Th}(n):</T>
        <T x={300} y={yB + 124} s={17} f={C.crema} a="middle">the price of a step isn't in the {Big}</T>
      </g>
    </Svg>
  );
}

// 11 · In one breath: each bullet gets a small icon taken from its step.
function Icon({ kind, cy, o }: { kind: number; cy: number; o: number }) {
  const x = 30;
  return (
    <g opacity={o}>
      {kind === 0 && (
        <>
          <rect x={x} y={cy - 9} width={38} height={18} fill={C.caramel} opacity={0.25} />
          <line x1={x} y1={cy - 9} x2={x + 38} y2={cy - 9} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 3" />
          <line x1={x} y1={cy + 9} x2={x + 38} y2={cy + 9} stroke={C.latte} strokeWidth={2} strokeDasharray="5 3" />
          <polyline points={`${x},${cy - 12} ${x + 10},${cy - 3} ${x + 38},${cy}`} fill="none" stroke={C.crema} strokeWidth={2} />
        </>
      )}
      {kind === 1 && [0, 1, 2].map((i) => <rect key={i} x={x + 10} y={cy + 9 - (i + 1) * 8} width={18} height={6} rx={1.5} fill={C.caramel} />)}
      {kind === 2 && [0, 1, 2].map((i) => <rect key={i} x={x} y={cy - 11 + i * 9} width={38} height={5} rx={2} fill={C.mocha} />)}
      {kind === 3 && (
        <>
          <rect x={x + 2} y={cy - 12} width={6} height={24} rx={1.5} fill={C.cinnamon} />
          <rect x={x + 14} y={cy + 1} width={24} height={9} rx={1.5} fill={C.caramel} />
          <rect x={x + 14} y={cy - 10} width={24} height={9} rx={1.5} fill={C.caramel} />
        </>
      )}
      {kind === 4 && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={x + i * 8} y={cy - 9} width={3} height={18} rx={1} fill={i < 2 ? C.caramel : C.taupe} />)}
    </g>
  );
}

export function Recap({ t, portrait }: StepCtx) {
  const H = portrait ? 400 : 340;
  const rows: ReactNode[] = [
    <>
      {Big} ceiling · {Om} floor · {Th} both
    </>,
    <>
      <LogB rest="x = divisions by b down to 1" />
    </>,
    <>
      <LogB rest="x = ln x / ln b" />
    </>,
    'big base, tiny log: 4 levels, 2 passes',
    <>Big-O counts steps, not seconds</>,
  ];
  const y0 = portrait ? 60 : 44;
  const pitch = portrait ? 76 : 62;
  return (
    <Svg label="Five things to keep: ceiling, floor and both; logarithm as divisions; change of base; big bases give tiny logs; Big-O counts steps" h={H}>
      {rows.map((r, i) => {
        const k = fade(t, 0.2 + i * 0.3, 0.5 + i * 0.3);
        return (
          <g key={i}>
            <Icon kind={i} cy={y0 + i * pitch - 5} o={k} />
            <g opacity={k}>
              <T x={84} y={y0 + i * pitch} s={16} f={C.crema}>{r}</T>
            </g>
          </g>
        );
      })}
    </Svg>
  );
}
