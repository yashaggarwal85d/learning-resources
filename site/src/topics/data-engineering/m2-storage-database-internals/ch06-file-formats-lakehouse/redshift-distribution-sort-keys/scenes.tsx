import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** A compute node at (x, y): an outlined box holding `slices` slice cells; `hot(i)` lights slice i. */
function Node({
  x,
  y,
  w = 240,
  slices = 2,
  k = 1,
  hot = () => 0,
  label = 'compute node',
}: {
  x: number;
  y: number;
  w?: number;
  slices?: number;
  k?: number;
  hot?: (i: number) => number;
  label?: string;
}) {
  const sw = (w - 20 - (slices - 1) * 8) / slices;
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={w} height={74} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} />
      <T x={x + 10} y={y + 18} s={11} f={C.latte}>
        {label}
      </T>
      {Array.from({ length: slices }, (_, i) => (
        <rect key={i} x={x + 10 + i * (sw + 8)} y={y + 28} width={sw} height={36} rx={3} fill={C.cocoa} stroke={hot(i) > 0.5 ? C.focus : C.mocha} strokeWidth={1.4} />
      ))}
    </g>
  );
}

// 1 · Hook. The last two: storage and compute apart, a network between. This one: machines where disk and compute are the same box.
export function Hook({ t }: StepCtx) {
  const s = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="two warehouses joined storage and compute over a network. a third lineage: redshift's shared-nothing mpp." h={200}>
      <g opacity={easeOut(seg(t, 0.1, 0.5)) * (1 - 0.6 * s)}>
        <Cell x={25} y={30} w={90} h={28} label="storage" />
        <line x1={117} y1={44} x2={163} y2={44} stroke={C.latte} strokeDasharray="5 4" strokeWidth={1.6} />
        <Cell x={165} y={30} w={90} h={28} label="compute" />
        <T x={25} y={86} s={11} f={C.latte}>
          the last two: apart
        </T>
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 1.8 + i * 0.25, 2.1 + i * 0.25))}>
          <rect x={320 + i * 85} y={26} width={70} height={64} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} />
          <T x={355 + i * 85} y={50} s={11} f={C.crema} a="middle">
            disk
          </T>
          <T x={355 + i * 85} y={76} s={11} f={C.crema} a="middle">
            CPU
          </T>
        </g>
      ))}
      <T x={320} y={130} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        Redshift: tied together
      </T>
    </Svg>
  );
}

// 2 · Predict. One table above four machines: a full copy on each, or split up?
export function PredictRowPlacement({ t, answer }: StepCtx) {
  return (
    <Svg label="a table's rows across the cluster: a full copy on every node, or split up somehow?" h={200}>
      <Cell x={200} y={14} w={200} h={28} label="one table" o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={300} y1={44} x2={lerp(300, 85 + i * 145, easeInOut(seg(t, 0.6, 1.2)))} y2={lerp(44, 68, easeInOut(seg(t, 0.6, 1.2)))} stroke={C.mocha} strokeWidth={1.2} />
          <rect x={40 + i * 145} y={70} width={90} height={26} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.9 + i * 0.1, 1.2 + i * 0.1))} />
          <T x={85 + i * 145} y={88} s={12} f={C.second} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
            ?
          </T>
        </g>
      ))}
      <AnswerRow y={140} label="each machine holds" answer={answer} value="part of the rows" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="split up and spread across them" />
    </Svg>
  );
}

// 3 · Leader, compute nodes, slices. Questions go to the leader; rows fly from the table to exactly one slice each.
export function RevealLeaderComputeSlices({ t }: StepCtx) {
  const r = seg(t, 2.2, 4.2);
  const targets = [0, 2, 1, 3, 0, 3, 2, 1];
  const sx = (s: number) => (s < 2 ? 45 + s * 114 : 345 + (s - 2) * 114) + 50;
  return (
    <Svg label="a leader node coordinates; each compute node splits into slices; rows land by distribution style." h={230}>
      <Req x1={25} x2={195} y={36} k={easeOut(seg(t, 0.1, 0.6))} label="every question" f={C.second} />
      <Cell x={200} y={20} w={200} h={32} label="leader node" stroke={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
      <Node x={35} y={110} k={easeOut(seg(t, 1.0, 1.4))} hot={() => 0} />
      <Node x={335} y={110} k={easeOut(seg(t, 1.2, 1.6))} hot={() => 0} />
      <T x={25} y={210} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        each node cut into slices
      </T>
      {targets.map((s, i) => {
        const q = clamp((r - i * 0.09) / 0.3);
        return <circle key={i} cx={lerp(300, sx(s), easeInOut(q))} cy={lerp(56, 156, easeInOut(q))} r={4} fill={C.focus} opacity={q > 0 ? 1 : 0} />;
      })}
      <T x={335} y={210} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        one slice per row
      </T>
    </Svg>
  );
}

// 4 · Distribution styles. Four panels: AUTO, EVEN (round robin), KEY (same key, same slice), ALL (a copy everywhere); then a mismatched
// join drags rows across the network in red.
export function RevealDistributionStyles({ t }: StepCtx) {
  const styles: [string, number[][]][] = [
    [
      'AUTO',
      [
        [0, 1],
        [2, 3],
      ],
    ],
    [
      'EVEN',
      [
        [0, 2],
        [1, 3],
      ],
    ],
    [
      'KEY',
      [
        [0, 0],
        [1, 1],
      ],
    ],
    [
      'ALL',
      [
        [0, 1, 2, 3],
        [0, 1, 2, 3],
      ],
    ],
  ];
  const mv = easeInOut(seg(t, 2.8, 3.8));
  return (
    <Svg label="auto, even, key, all -- four styles, each placing rows differently, each with a different join cost." h={230}>
      {styles.map(([n, nodes], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.4, 0.6 + i * 0.4));
        const x = 25 + i * 140;
        return (
          <g key={n} opacity={k}>
            <T x={x} y={24} s={12} f={C.crema}>
              {n}
            </T>
            {nodes.map((dots, j) => (
              <g key={j}>
                <rect x={x} y={34 + j * 40} width={120} height={32} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
                {dots.map((d, m) => (
                  <circle key={m} cx={x + 16 + m * 24} cy={50 + j * 40} r={5} fill={[C.focus, C.second, C.latte, C.cherryText][d]} />
                ))}
              </g>
            ))}
          </g>
        );
      })}
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        pick wrong: join partners on different nodes
      </T>
      <circle cx={lerp(60, 480, mv)} cy={178} r={6} fill={C.cherryText} opacity={mv > 0 && mv < 1 ? 1 : 0} />
      <line x1={60} y1={186} x2={480} y2={186} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.6, 2.9))} />
      <T x={25} y={214} s={12} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        moving it across the network: the costly part
      </T>
    </Svg>
  );
}

// 5 · Sort keys and block skipping. Blocks inside one slice, in sorted order, each with its min–max; a narrow range lights only one.
export function RevealSortKeysBlockSkip({ t }: StepCtx) {
  const sorted = easeInOut(seg(t, 0.4, 1.4));
  const q = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="a compound or interleaved sort key orders rows; the engine tracks each block's range and skips what can't match." h={230}>
      <T x={25} y={24} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        one slice, rows kept in order
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const scrambled = (i * 7) % 10;
        const pos = lerp(scrambled, i, sorted);
        return (
          <g key={i}>
            <rect x={25 + pos * 54} y={36} width={46} height={30} rx={2} fill={C.cocoa} stroke={i === 6 && q > 0.5 ? C.focus : C.mocha} strokeWidth={1.4} opacity={i === 6 ? 1 : 1 - 0.7 * q} />
            <line x1={29 + pos * 54 + i * 3.2} y1={76} x2={29 + pos * 54 + i * 3.2 + 6} y2={76} stroke={C.second} strokeWidth={3} opacity={easeOut(seg(t, 1.4, 1.8))} />
          </g>
        );
      })}
      <T x={25} y={110} s={11} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        each block's lowest and highest value, remembered
      </T>
      <T x={25} y={150} s={12} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        a narrow range asked for
      </T>
      <Row y={200} label="blocks read" value={q > 0.9 ? 'one of ten' : '…'} valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 6 · Predict. A node's CPU and disk bound together: grow one, does the other have to come along?
export function PredictStorageComputeCoupling({ t, answer }: StepCtx) {
  const g = easeInOut(seg(t, 0.8, 1.8));
  return (
    <Svg label="the last two topics split storage from compute. does scaling one here force scaling the other too?" h={200}>
      <Cell x={150} y={20} w={lerp(100, 180, g)} h={28} label="CPU" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={150} y={60} w={lerp(100, 180, g)} h={28} label="disk" o={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={140} y1={20} x2={140} y2={88} stroke={C.second} strokeWidth={3} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={360} y={58} s={11} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        grow one, both grow?
      </T>
      <AnswerRow y={140} label="growing one side" answer={answer} value="no longer forces it" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="a newer design pulls them apart" />
    </Svg>
  );
}

// 7 · RA3, then serverless. RA3: compute above, durable managed storage below, a gap opening between. Serverless: the machines fade and
// only a compute meter remains.
export function RevealRa3Serverless({ t }: StepCtx) {
  const gap = easeInOut(seg(t, 0.6, 1.4));
  const sv = easeInOut(seg(t, 2.4, 3.2));
  const m = easeInOut(seg(t, 3.2, 4.4));
  return (
    <Svg label="ra3 nodes decouple storage and compute through managed storage; serverless goes further, billing compute alone." h={230}>
      <g opacity={1 - 0.75 * sv}>
        <T x={25} y={24} s={12} f={C.crema}>
          RA3
        </T>
        {[0, 1].map((i) => (
          <Cell key={i} x={25 + i * 110} y={34} w={100} h={28} label="machine" stroke={C.focus} />
        ))}
        <Cell x={25} y={lerp(64, 96, gap)} w={210} h={28} label="managed storage" stroke={C.second} />
        <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
          durable, separate, underneath
        </T>
      </g>
      <T x={330} y={24} s={12} f={C.crema} o={easeOut(seg(t, 2.2, 2.6))}>
        Serverless
      </T>
      <rect x={330} y={40} width={230} height={18} rx={3} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 2.6, 3.0))} />
      <rect x={332} y={42} width={226 * m} height={14} fill={C.focus} opacity={0.7} />
      <T x={330} y={84} s={11} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        billed for compute alone
      </T>
      <T x={330} y={110} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        no machine count to pick
      </T>
    </Svg>
  );
}

// 8 · Automatic WLM and concurrency scaling. Running slots widen and narrow with the load; then the queue backs up and a second cluster
// appears to drain it.
export function RevealWlmConcurrencyScaling({ t }: StepCtx) {
  const slots = 2 + Math.round(2 * (0.5 + 0.5 * Math.sin(seg(t, 0.4, 2.4) * Math.PI * 2)));
  const q = Math.round(lerp(0, 6, easeInOut(seg(t, 2.0, 2.8))) - lerp(0, 6, easeOut(seg(t, 3.4, 4.4))));
  const c2 = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="automatic wlm adjusts concurrency to the workload on its own; concurrency scaling adds a second cluster when needed." h={230}>
      <rect x={300} y={20} width={260} height={60} rx={5} fill="none" stroke={C.focus} strokeWidth={1.6} />
      <T x={312} y={40} s={11} f={C.latte}>
        main cluster
      </T>
      {Array.from({ length: slots }, (_, i) => (
        <rect key={i} x={312 + i * 58} y={50} width={50} height={20} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.2} />
      ))}
      <T x={25} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        side by side: tuned on its own
      </T>
      {Array.from({ length: Math.max(0, q) }, (_, i) => (
        <rect key={i} x={250 - i * 34} y={110} width={28} height={18} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} />
      ))}
      <T x={25} y={150} s={11} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.6)) * (1 - easeOut(seg(t, 3.8, 4.2)))}>
        work backing up in a line
      </T>
      <g opacity={c2}>
        <rect x={300} y={140} width={260} height={50} rx={5} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="5 4" />
        <T x={312} y={170} s={11} f={C.second}>
          a second, temporary cluster
        </T>
      </g>
      <T x={25} y={214} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        added automatically, nobody asked
      </T>
    </Svg>
  );
}

// 9 · Spectrum and automatic table optimization. A query reaches out into S3 files where they lie; inside, the sort and distribution
// key dials set themselves.
export function RevealSpectrumAutoOptimization({ t }: StepCtx) {
  const r = easeInOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="spectrum queries files sitting in s3 directly; automatic table optimization picks sort and distribution keys itself." h={230}>
      <Cell x={25} y={30} w={150} h={30} label="Redshift" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={400 + i * 52} y={24} width={44} height={42} rx={2} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <T x={330} y={86} s={11} f={C.second} o={easeOut(seg(t, 0.2, 0.5))}>
        files in S3, never loaded
      </T>
      <Req x1={177} x2={395} y={45} k={r} label="Spectrum" f={C.second} />
      <T x={25} y={130} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        inside its own tables
      </T>
      <Row y={170} label="sort key" value={t > 3.0 ? 'chosen for you' : '…'} valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={210} label="distribution key" value={t > 3.6 ? 'chosen for you' : '…'} valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['rows', 'placed by a rule'],
    ['order', 'lets blocks be skipped'],
    ['RA3, serverless', 'pull the two apart'],
    ['tuning', 'done on its own'],
  ];
  return (
    <Svg label="a third lineage: nodes and slices, distribution styles, sort keys, ra3 and serverless, automatic tuning. next: warehouse or lakehouse." h={250}>
      {rows.map(([a, b], i) => (
        <Row key={a} y={35 + i * 55} label={a} value={b} valueColor={i === 2 ? C.focus : C.crema} k={easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8))} />
      ))}
    </Svg>
  );
}
