import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, SERIF, Svg, T } from '../../../../../reels/kit';
import { RefresherList } from '../refreshers';

// Every number drawn here is computed or asserted in examples.py. Each scene is a pure function of time.
const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));
const commas = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · Where we are: the last of the five refreshers.
export const Opening = (c: StepCtx) => <RefresherList {...c} current={4} />;

// 2 · O is a ceiling, Ω a floor, Θ both: the cost divided by n·log₂n, g(n) = 3·n·log₂n + 8n.
export function RatioBand({ t, portrait }: StepCtx) {
  const H = portrait ? 420 : 340;
  const top = portrait ? 100 : 86;
  const bot = portrait ? 360 : 290;
  const X0 = 60;
  const W = 500;
  const L = Math.log2(100_000_000); // 26.575
  const xs = (lg: number) => X0 + ((lg - 1) / (L - 1)) * W;
  const ys = (r: number) => bot - (r / 12) * (bot - top);
  const p = easeInOut(seg(t, 0.6, 3.0));
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
  const x256 = xs(8);
  const band = fade(t, 3.2, 3.6);
  return (
    <Svg label="The job's cost divided by n log n falls and stays between 3 and 4 from n = 256 on" h={H}>
      <T x={X0} y={portrait ? 40 : 30} s={15} f={C.latte}>
        {crossed ? 'from n₀ = 256 on: 3 ≤ ratio ≤ 4' : 'below n₀ the ceiling is crossed'}
      </T>
      <T x={X0} y={portrait ? 68 : 56} s={15} f={C.crema}>
        {`n = ${commas(nTip)} → ratio ${rTip.toFixed(2)}`}
      </T>
      <g opacity={axes}>
        <line x1={X0} y1={bot} x2={X0 + W} y2={bot} stroke={C.taupe} />
        <line x1={X0} y1={ys(4)} x2={X0 + W} y2={ys(4)} stroke={C.caramel} strokeDasharray="6 5" />
        <line x1={X0} y1={ys(3)} x2={X0 + W} y2={ys(3)} stroke={C.latte} strokeDasharray="6 5" />
        <T x={X0} y={bot + 20} s={13} f={C.taupe}>2</T>
        <T x={xs(16)} y={bot + 20} s={13} f={C.taupe} a="middle">65,536</T>
        <T x={X0 + W} y={bot + 20} s={13} f={C.taupe} a="end">100 M</T>
        <T x={x256 + 8} y={ys(4) - 8} s={13} f={C.caramel}>ceiling c = 4</T>
        <T x={x256 + 8} y={ys(3) + 18} s={13} f={C.latte}>floor c = 3</T>
      </g>
      <line x1={x256} y1={top} x2={x256} y2={bot} stroke={crossed ? C.caramel : C.taupe} strokeDasharray="2 5" strokeWidth={crossed ? 2 : 1} opacity={axes} />
      <T x={x256 + 8} y={top + 12} s={13} f={crossed ? C.caramel : C.taupe} o={axes}>n₀ = 256</T>
      <rect x={x256} y={ys(4)} width={X0 + W - x256} height={ys(3) - ys(4)} fill={C.caramel} opacity={0.18 * band} />
      <T x={X0 + W - 24} y={ys(4) - 22} s={20} f={C.caramel} a="end" serif o={band}>Θ(n log n)</T>
      <polyline points={pts.join(' ')} fill="none" stroke={C.crema} strokeWidth={3} strokeLinejoin="round" opacity={fade(t, 0.6, 0.8)} />
      <circle cx={xs(lgTip)} cy={ys(rTip)} r={6} fill={C.crema} opacity={fade(t, 0.6, 0.8)} />
    </Svg>
  );
}

// 3 · Is it also O(n²)? A predict step; the answer frame is a complete still.
export function LooseCeiling({ t, answer, portrait }: StepCtx) {
  const H = portrait ? 380 : 320;
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
            <T x={300} y={209} s={22} f={C.caramel} a="middle" o={b}><tspan fontFamily={SERIF}>O</tspan>(n²) ?</T>
            <T x={300} y={290} s={13} f={C.taupe} a="middle" o={b}>Theta(n log n), from the last step</T>
          </>
        ) : (
          <>
            <rect x={24} y={60} width={290} height={70} rx={14} fill="none" stroke={C.mocha} opacity={a} />
            <T x={169} y={103} s={15} f={C.crema} a="middle" o={a}>job: 3·n·log₂n + 8n steps</T>
            <rect x={334} y={60} width={196} height={70} rx={14} fill="none" stroke={C.caramel} strokeWidth={2} opacity={b} />
            <T x={432} y={105} s={22} f={C.caramel} a="middle" o={b}><tspan fontFamily={SERIF}>O</tspan>(n²) ?</T>
            <T x={277} y={190} s={13} f={C.taupe} a="middle" o={b}>Theta(n log n), from the last step</T>
          </>
        )}
      </Svg>
    );
  }
  // Answer frame: two bars at n = 100,000,000 on a log₁₀ axis from 1 billion to 10 quadrillion.
  const jobW = (((Math.log10(8_772_627_428) - 9) / 7) * 500);
  const r0 = portrait ? 66 : 40;
  const gap = portrait ? 92 : 78;
  return (
    <Svg label="At 100 million rows the job needs about 9 billion steps; n squared is 10 quadrillion, over a million times more" h={H}>
      <T x={40} y={r0} s={15} f={C.crema}>job: 8,772,627,428 steps</T>
      <rect x={40} y={r0 + 12} width={500} height={26} rx={7} fill={C.cocoa} />
      <rect x={40} y={r0 + 12} width={jobW} height={26} rx={7} fill={C.crema} />
      <T x={40} y={r0 + gap} s={15} f={C.crema}>n²: 10,000,000,000,000,000 steps</T>
      <T x={536} y={r0 + gap + 60} s={13} f={C.caramel} a="end">10 quadrillion</T>
      <rect x={40} y={r0 + gap + 12} width={500} height={26} rx={7} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={40} y={r0 + gap + 60} s={13} f={C.taupe}>log scale from 1 billion</T>
      <T x={300} y={r0 + gap + 100} s={15} f={C.latte} a="middle">true: a ceiling, over a million times too high</T>
      <T x={300} y={r0 + gap + 126} s={13} f={C.taupe} a="middle">c = 11 works from n = 1</T>
    </Svg>
  );
}

// 4 · Double the data: n, n·log₂n and n² at 1,000, 1,000,000 and 100,000,000 rows.
const LANES = [
  { name: 'n', secs: [1e-6, 1e-3, 0.1], text: ['1 µs', '1 ms', '0.1 s'] },
  { name: 'n·log₂n', secs: [1e-5, 0.02, 2.7], text: ['10 µs', '20 ms', '2.7 s'] },
  { name: 'n²', secs: [1e-3, 1000, 1e7], text: ['1 ms', '17 min', '116 days'] },
];
const COUNT = ['n = 1,000 orders', 'n = 1,000,000 orders', 'n = 100,000,000 orders'];
// A log axis from 100 ns (10^-7 s) to 100,000,000 s (10^8 s): 15 decades, ticks every 3 decades (×1,000), up to 1,000 s. See examples.py.
const logFrac = (s: number) => clamp((Math.log10(s) + 7) / 15);
const TICKS = [
  { s: 1e-6, label: '1 µs' },
  { s: 1e-3, label: '1 ms' },
  { s: 1, label: '1 s' },
  { s: 1e3, label: '1,000 s' },
];
export function Race({ t, portrait }: StepCtx) {
  const H = portrait ? 440 : 360;
  const stage = t < 1.6 ? 0 : t < 2.6 ? 1 : 2;
  const starts = [0.6, 1.6, 2.6];
  const lanesIn = fade(t, 0.2, 0.6);
  const ys = portrait ? [150, 230, 310] : [118, 188, 258];
  const axisY = ys[2] + 44;
  return (
    <Svg label="n, n log n and n squared at a thousand, a million and 100 million orders" h={H}>
      <T x={300} y={portrait ? 44 : 36} s={24} f={C.crema} a="middle" serif>{COUNT[stage]}</T>
      <T x={300} y={portrait ? 72 : 60} s={13} f={C.taupe} a="middle">at 1,000,000,000 steps per second (a round assumption)</T>
      {LANES.map((lane, i) => {
        const y = ys[i];
        const from = stage === 0 ? 0 : logFrac(lane.secs[stage - 1]);
        const to = logFrac(lane.secs[stage]);
        const k = easeInOut(seg(t, starts[stage], starts[stage] + 0.6));
        const frac = t < 0.6 ? 0 : lerp(from, to, k);
        const over = stage === 2 && i === 2 && t >= starts[2];
        const shown = t >= 0.6;
        return (
          <g key={lane.name} opacity={lanesIn}>
            <T x={40} y={y - 6} s={15} f={C.latte}>{lane.name}</T>
            {shown && <T x={540} y={y - 6} s={17} f={over ? C.cherryText : C.crema} a="end" w={700}>{lane.text[stage]}</T>}
            <rect x={40} y={y} width={500} height={26} rx={7} fill={C.cocoa} />
            <rect x={40} y={y} width={Math.max(3, 500 * frac)} height={26} rx={7} fill={over ? C.cherry : C.caramel} />
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
          <T key={k.label} x={40 + 500 * logFrac(k.s)} y={axisY + 22} s={15} f={C.taupe} a="middle">{k.label}</T>
        ))}
        <T x={290} y={axisY + 48} s={15} f={C.taupe} a="middle">log scale: each tick ×1,000</T>
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
  const H = portrait ? 420 : 340;
  const base = portrait ? 370 : 290;
  const dy = portrait ? 9 : 7;
  const a = fade(t, 0.2, 0.6);
  const b = fade(t, 0.6, 1.0);
  const lx = portrait ? 110 : 120;
  const rx = portrait ? 380 : 400;
  const topY = base - 30 * dy;
  return (
    <Svg label="A staircase of 10 halvings for 1,000 commits, and a taller one for a billion" h={H}>
      <Tower cx={lx} base={base} unit={dy} width={40} blocks={10} sliver={0} fill={C.caramel} builtAt={0.2} gapT={0.03} t={t} />
      <T x={lx} y={base - 10 * dy - 58} s={15} f={C.latte} a="middle" o={a}>1,000 commits</T>
      <T x={lx} y={base - 10 * dy - 38} s={15} f={C.latte} a="middle" o={a}>10 tests</T>
      <T x={lx} y={base - 10 * dy - 18} s={15} f={C.latte} a="middle" o={a}>(Git refresher)</T>
      <T x={rx} y={base + 22} s={17} f={C.crema} a="middle" o={b}>1,000,000,000</T>
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
            [10, '976,563'],
            [20, '954'],
            [30, '0.93 · done'],
          ].map(([k, label]) => (
            <g key={String(k)}>
              <line x1={rx + 24} y1={base - Number(k) * dy + dy / 2} x2={rx + 36} y2={base - Number(k) * dy + dy / 2} stroke={C.taupe} />
              <T x={rx + 42} y={base - Number(k) * dy + dy / 2 + 5} s={15} f={C.crema}>{String(label)}</T>
            </g>
          ))}
          <T x={rx} y={base + 42} s={15} f={C.taupe} a="middle">log₂ of a billion = 29.9</T>
        </>
      )}
    </Svg>
  );
}

// 6 · Any base, one formula: one length, three rulers.
export function Rulers({ t, portrait }: StepCtx) {
  const H = portrait ? 420 : 340;
  const ys = portrait ? [150, 250, 350] : [130, 205, 280];
  const total = Math.log(1e9);
  const rows = [
    { label: '÷ ln 2 = 0.693', step: Math.log(2), count: '29.9', t0: 0.6 },
    { label: '÷ ln 10 = 2.303', step: Math.log(10), count: '9', t0: 1.4 },
    { label: '÷ ln 1,000 = 6.908', step: Math.log(1000), count: '3', t0: 2.2 },
  ];
  const intro = fade(t, 0.2, 0.6);
  return (
    <Svg label="ln of a billion is 20.72; cut into pieces of ln 2, ln 10 and ln 1,000 it gives 29.9, 9 and 3 pieces" h={H}>
      <T x={40} y={portrait ? 36 : 30} s={20} f={C.crema} serif o={intro}>log_b x = ln x / ln b</T>
      <T x={40} y={portrait ? 66 : 56} s={15} f={C.crema} o={intro}>ln(1,000,000,000) = 20.72</T>
      {rows.map((r, i) => {
        const y = ys[i];
        const n = Math.floor(total / r.step);
        const sweep = seg(t, r.t0, r.t0 + 0.7);
        return (
          <g key={r.label}>
            <T x={40} y={y - 6} s={13} f={C.latte} o={intro}>{r.label}</T>
            <T x={536} y={y - 4} s={20} f={C.caramel} a="end" w={700} o={fade(t, r.t0 + 0.7, r.t0 + 1.0)}>{r.count}</T>
            <rect x={40} y={y} width={500} height={portrait ? 28 : 24} rx={7} fill={C.cocoa} opacity={intro} />
            <rect x={40} y={y} width={500} height={portrait ? 28 : 24} rx={7} fill={C.crema} opacity={0.9 * intro} />
            {Array.from({ length: n }, (_, j) => {
              const x = 40 + ((j + 1) * r.step * 500) / total;
              return <line key={j} x1={x} y1={y} x2={x} y2={y + (portrait ? 28 : 24)} stroke={C.caramel} strokeWidth={2.5} opacity={x - 40 <= sweep * 500 ? 1 : 0} />;
            })}
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · A large base flattens the tower: a billion divided by 2, by 1,000 and by 16,384.
export function Towers({ t, portrait }: StepCtx) {
  const H = portrait ? 420 : 340;
  const base = portrait ? 380 : 300;
  const unit = portrait ? 9 : 7;
  const counts = fade(t, 2.8, 3.1);
  const cols = [
    { cx: 90, w: 40, label: '÷ 2', count: '29.9', h: 29.9 },
    { cx: 270, w: 130, label: '÷ 1,000', count: '3', h: 3 },
    { cx: 450, w: 150, label: '÷ 16,384', count: '2.14', h: 2.14 },
  ];
  return (
    <Svg label="A billion divided by 2 is a tall tower of 29.9 steps; by 1,000, 3 steps; by 16,384, 2.14 steps" h={H}>
      <line x1={30} y1={base} x2={536} y2={base} stroke={C.taupe} />
      <Tower cx={90} base={base} unit={unit} width={40} blocks={29} sliver={0.9} fill={C.cinnamon} builtAt={0.2} gapT={0} t={t} />
      <Tower cx={270} base={base} unit={unit} width={130} blocks={3} sliver={0} fill={C.caramel} builtAt={0.8} gapT={0.3} t={t} />
      <Tower cx={450} base={base} unit={unit} width={150} blocks={2} sliver={0.14} fill={C.caramel} builtAt={2.0} gapT={0.3} t={t} />
      {cols.map((c) => (
        <g key={c.label}>
          <T x={c.cx} y={base + 26} s={15} f={C.latte} a="middle">{c.label}</T>
          <T x={c.cx} y={base - c.h * unit - 12} s={17} f={C.crema} a="middle" w={700} o={counts}>{c.count}</T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · How tall is the orders index? A predict step.
export function IndexLevels({ t, answer, portrait }: StepCtx) {
  const H = portrait ? 420 : 340;
  if (answer === null) {
    const a = fade(t, 0.2, 0.6);
    const b = fade(t, 0.6, 1.0);
    const c = fade(t, 1.0, 1.2);
    const bandY = portrait ? 340 : 280;
    const topY = portrait ? 110 : 84;
    const botY = bandY - 10;
    const apexW = 40;
    return (
      <Svg label="100 million order ids at the bottom, a tree of pages above, and a question mark for the number of levels" h={H}>
        <rect x={40} y={bandY} width={500} height={34} rx={8} fill={C.crema} opacity={0.9 * a} />
        <T x={290} y={bandY + 23} s={15} f={C.espresso} a="middle" w={600} o={a}>100,000,000 order ids</T>
        <rect x={40} y={portrait ? 50 : 40} width={22} height={28} rx={4} fill="none" stroke={C.latte} opacity={b} />
        <T x={74} y={portrait ? 70 : 60} s={13} f={C.latte} o={b}>1 page = 8 KB ≈ 400 entries</T>
        <path d={`M ${290 - apexW / 2} ${topY} L ${290 + apexW / 2} ${topY} L 540 ${botY} L 40 ${botY} Z`} fill="none" stroke={C.taupe} strokeDasharray="5 6" opacity={b} />
        <T x={290} y={(topY + botY) / 2 + 20} s={20} f={C.caramel} a="middle" o={c}>? levels</T>
      </Svg>
    );
  }
  const y0 = portrait ? 100 : 62;
  const pitch = portrait ? 62 : 50;
  const rowH = portrait ? 42 : 36;
  const rows = [
    { w: 190, text: '1 level: 400', fill: C.mocha, ink: C.crema },
    { w: 260, text: '2 levels: 160,000', fill: C.mocha, ink: C.crema },
    { w: 330, text: '3 levels: 64,000,000', fill: C.cherry, ink: C.crema },
    { w: 400, text: '4 levels: 25,600,000,000', fill: C.caramel, ink: C.espresso },
  ];
  const cx = 290;
  const px = 520;
  return (
    <Svg label="Three levels of 400 reach only 64 million keys, four levels reach 25.6 billion: the index has 4 levels" h={H}>
      <line x1={px} y1={y0 + rowH / 2} x2={px} y2={y0 + 3 * pitch + rowH / 2} stroke={C.caramel} strokeWidth={2} />
      {rows.map((r, i) => (
        <g key={r.text}>
          <rect x={cx - r.w / 2} y={y0 + i * pitch} width={r.w} height={rowH} rx={8} fill={r.fill} opacity={i === 3 ? 1 : 0.9} />
          <T x={cx} y={y0 + i * pitch + rowH / 2 + 5} s={15} f={r.ink} a="middle" w={600}>{r.text}</T>
          <circle cx={px} cy={y0 + i * pitch + rowH / 2} r={6} fill={C.caramel} />
        </g>
      ))}
      <T x={cx - 330 / 2 - 10} y={y0 + 2 * pitch + rowH / 2 + 5} s={15} f={C.cherryText} a="end">short</T>
      <T x={px} y={portrait ? 62 : 34} s={28} f={C.caramel} a="middle" serif>4</T>
      <T x={290} y={y0 + 3 * pitch + rowH + 34} s={15} f={C.taupe} a="middle">binary tree: 27 levels</T>
    </Svg>
  );
}

// 9 · Sort passes are a logarithm too: 1 TiB, 16 GiB of memory, 1 MiB blocks.
// Every pass is a whole block of the same height: two caramel passes beside seven cinnamon passes, at the same unit.
export function SortPasses({ t, portrait }: StepCtx) {
  const H = portrait ? 460 : 384;
  const base = portrait ? 320 : 244;
  const unit = portrait ? 34 : 26;
  const cx = 110;
  const w = 130;
  const a = fade(t, 0.2, 0.6);
  const s1 = easeOut(seg(t, 0.8, 1.3));
  const s2 = easeOut(seg(t, 1.8, 2.3));
  const fin = fade(t, 2.6, 3.0);
  return (
    <Svg label="Sorting 1 TiB with 16 GiB of memory takes 2 whole passes, each reading and writing the whole terabyte; merging two at a time would take 7" h={H}>
      <T x={30} y={portrait ? 30 : 26} s={15} f={C.crema} o={a}>1,048,576 blocks (1 TiB ÷ 1 MiB)</T>
      <T x={30} y={portrait ? 62 : 54} s={24} f={C.caramel} serif o={fin}>2 passes</T>
      <rect x={cx - w / 2} y={base - 1 - (unit - 2) * s1} width={w} height={(unit - 2) * s1} rx={3} fill={C.caramel} />
      <rect x={cx - w / 2} y={base - unit - 1 - (unit - 2) * s2} width={w} height={(unit - 2) * s2} rx={3} fill={C.caramel} />
      <T x={cx + w / 2 + 12} y={base - unit / 2 + 5} s={15} f={C.crema} o={s1}>pass 1: 1 TiB → 64 runs</T>
      <T x={cx + w / 2 + 12} y={base - unit - unit / 2 + 5} s={15} f={C.crema} o={s2}>pass 2: 64 runs → 1 file</T>
      <g opacity={fade(t, 3.0, 3.5)}>
        <T x={470} y={base - 7 * unit - 34} s={15} f={C.cinnamon} a="middle" w={600}>two at a time:</T>
        <T x={470} y={base - 7 * unit - 10} s={15} f={C.cinnamon} a="middle" w={600}>7 passes</T>
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={450} y={base - (i + 1) * unit + 1} width={40} height={unit - 2} rx={2} fill={C.cinnamon} />
        ))}
      </g>
      <line x1={30} y1={base} x2={536} y2={base} stroke={C.taupe} />
      <T x={30} y={base + 30} s={15} f={C.latte} o={fin}>log₁₆,₃₈₄(1,048,576) = 20/14</T>
      <T x={30} y={base + 54} s={15} f={C.latte} o={fin}>= 1 + log₁₆,₃₈₄ 64 ≈ 1 + 0.43</T>
      <T x={30} y={base + 78} s={15} f={C.latte} o={fin}>passes = 1 + ⌈0.43⌉ = 2: a pass can't be partial</T>
      <T x={30} y={base + 102} s={15} f={C.crema} o={fin}>each pass reads + writes 1 TiB: 4 TiB of I/O</T>
      <T x={30} y={base + 124} s={13} f={C.taupe} o={a}>memory holds 16,384 blocks (16 GiB ÷ 1 MiB)</T>
    </Svg>
  );
}

// 10 · Big-O is not a stopwatch: same step count, same Theta, unknown price per step.
export function SameSteps({ t, portrait }: StepCtx) {
  const H = portrait ? 380 : 320;
  const yA = portrait ? 120 : 96;
  const yB = portrait ? 240 : 190;
  const labels = fade(t, 0.2, 0.6);
  return (
    <Svg label="Two scans of the same 100,000,000 rows: same step count, same Theta of n, very different durations" h={H}>
      <T x={40} y={yA - 8} s={15} f={C.latte} o={labels}>scan A: 100,000,000 steps</T>
      <T x={536} y={yA + 17} s={15} f={C.crema} a="end" o={labels}>time: ?</T>
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={40 + i * 6.8} y={yA} width={4} height={26} rx={1} fill={C.caramel} opacity={t > 0.6 + (i / 24) ? 1 : 0} />
      ))}
      <T x={40} y={yB - 8} s={15} f={C.latte} o={labels}>scan B: 100,000,000 steps</T>
      <T x={536} y={yB - 8} s={15} f={C.crema} a="end" o={labels}>time: ?</T>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 40 + i * 83;
        const t0 = 1.0 + i * 0.23;
        return (
          <g key={i}>
            <rect x={x} y={yB} width={4} height={26} rx={1} fill={C.caramel} opacity={t > t0 ? 1 : 0} />
            <rect x={x + 8} y={yB + 8} width={64 * seg(t, t0, t0 + 0.23)} height={10} rx={3} fill={C.taupe} />
          </g>
        );
      })}
      <g opacity={fade(t, 2.6, 2.8)}>
        <T x={300} y={portrait ? 318 : 268} s={13} f={C.taupe} a="middle">same count, same Theta(n):</T>
        <T x={300} y={portrait ? 340 : 288} s={13} f={C.taupe} a="middle">the price of a step isn't in the O</T>
      </g>
    </Svg>
  );
}

// 11 · In one breath.
export function Recap({ t, portrait }: StepCtx) {
  const H = portrait ? 420 : 340;
  const rows: ReactNode[] = [
    <>
      <tspan fontFamily={SERIF}>O</tspan> ceiling · <tspan fontFamily={SERIF}>Ω</tspan> floor · <tspan fontFamily={SERIF}>Θ</tspan> both
    </>,
    'log_b x = divisions by b down to 1',
    'log_b x = ln x / ln b',
    'big base, tiny log: 4 levels, 2 passes',
    'O counts steps, not seconds',
  ];
  const y0 = portrait ? 70 : 50;
  const pitch = portrait ? 70 : 56;
  return (
    <Svg label="Five things to keep: ceiling, floor and both; logarithm as divisions; change of base; big base gives tiny logs; O counts steps" h={H}>
      {rows.map((r, i) => {
        const k = fade(t, 0.2 + i * 0.3, 0.5 + i * 0.3);
        return (
          <g key={i} opacity={k}>
            <circle cx={40} cy={y0 + i * pitch - 5} r={6} fill={C.caramel} />
            <T x={62} y={y0 + i * pitch} s={16} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}
