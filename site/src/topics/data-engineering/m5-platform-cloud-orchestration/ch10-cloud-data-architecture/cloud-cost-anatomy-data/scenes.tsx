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

function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

/** A small coin at (x, y), drawn in by `k`. */
function Coin({ x, y, k, f = C.caramel }: { x: number; y: number; k: number; f?: string }) {
  return <circle cx={x} cy={y} r={5 * k} fill="none" stroke={f} strokeWidth={2} opacity={k} />;
}

// 0 · One file per row. A grid of tiny files fills in; then the two meters: storage creeps a sliver, requests swell
// past everything, in red.
export function LooksFree({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fill = clamp(seg(t, 0.2, 1.6));
  const st = easeOut(seg(t, 1.8, 2.4));
  const rq = easeInOut(seg(t, 2.6, 3.8));
  return (
    <Svg label="Two bars for the same ten gigabytes: storage stays flat, requests balloons once the bytes are split into a million tiny files" h={250}>
      <T x={25} y={26} s={12} f={C.latte} o={k(0)}>
        10 GB, written as 1,000,000 files
      </T>
      {Array.from({ length: 64 }, (_, i) => (
        <rect key={i} x={25 + (i % 32) * 17} y={38 + Math.floor(i / 32) * 17} width={12} height={12} rx={2} fill={C.second} opacity={i / 64 < fill ? 0.8 : 0.12} />
      ))}
      <T x={25} y={114} s={12} f={C.crema} o={k(1.6)}>
        storage
      </T>
      <rect x={130} y={102} width={Math.max(3, 30 * st)} height={16} rx={3} fill={C.latte} opacity={k(1.6)} />
      {st >= 1 && (
        <T x={172} y={114} s={11} f={C.latte}>
          barely moves
        </T>
      )}
      <T x={25} y={164} s={12} f={C.crema} o={k(2.4)}>
        requests
      </T>
      <rect x={130} y={152} width={Math.max(3, 440 * rq)} height={16} rx={3} fill={C.cherryText} opacity={k(2.4)} />
      {t > 3.8 && (
        <T x={300} y={220} s={12} f={C.cherryText} a="middle" o={k(3.8)}>
          the line nobody checked
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Four bill lines; the storage line is ticked as unchanged. Once answered, the requests line swells and
// lights; the others stay where they were.
export function WhichLineIsDriving({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const lines = ['storage', 'compute', 'requests', 'network'];
  return (
    <Svg label="Four candidate bill lines, with requests highlighted once the answer is revealed" h={250}>
      {lines.map((l, i) => {
        const y = 40 + i * 38;
        const isR = l === 'requests';
        return (
          <g key={l} opacity={k(i * 0.15)}>
            <T x={25} y={y + 12} s={12} f={isR && v > 0.5 ? C.cherryText : C.crema}>
              {l}
            </T>
            <rect x={130} y={y} width={60 + (isR ? 340 * v : 0)} height={16} rx={3} fill={isR && v > 0 ? C.cherryText : C.latte} opacity={0.75} />
          </g>
        );
      })}
      <MiniTick x={200} y={46} k={k(0.7)} />
      <T x={220} y={52} s={11} f={C.latte} o={k(0.7)}>
        same bytes, unchanged
      </T>
      <Verdict answer={answer} text="billed per call, not per byte" y={215} />
    </Svg>
  );
}

// 2 · Two meters. A tiny object and a huge object each make one PUT into the bucket. The bytes meter jumps a little,
// then a lot; the operations meter clicks exactly one notch for each.
export function StorageTwice({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const p1 = easeInOut(seg(t, 0.6, 1.1));
  const p2 = easeInOut(seg(t, 1.8, 2.3));
  return (
    <Svg label="One box for bytes held per month, a second box for every operation performed against them" h={250}>
      <rect x={25} y={30} width={260} height={74} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={37} y={50} s={12} f={C.crema} o={k(0)}>
        bytes held
      </T>
      <T x={37} y={68} s={11} f={C.caramel} o={k(0)}>
        $0.023 per GB-month
      </T>
      <rect x={37} y={80} width={Math.max(2, 8 * (p1 >= 1 ? 1 : 0) + 220 * (p2 >= 1 ? easeOut(seg(t, 2.3, 2.8)) : 0))} height={12} rx={2} fill={C.second} opacity={k(0)} />
      <rect x={315} y={30} width={260} height={74} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      <T x={327} y={50} s={12} f={C.crema} o={k(0.2)}>
        operations
      </T>
      <T x={327} y={68} s={11} f={C.caramel} o={k(0.2)}>
        $0.005 per 1,000 PUTs
      </T>
      <Pip x={335} y={86} s={10} f={C.focus} o={p1 >= 1 ? 1 : 0} />
      <Pip x={351} y={86} s={10} f={C.focus} o={p2 >= 1 ? 1 : 0} />
      <Cell x={25} y={140} w={130} label="tiny object" o={k(0.3)} />
      <rect x={25} y={184} width={130} height={44} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={k(1.5)} />
      <T x={90} y={211} s={12} f={C.crema} a="middle" o={k(1.5)}>
        huge object
      </T>
      <Req x1={160} x2={325} y={154} k={p1} label="PUT" />
      <Req x1={160} x2={325} y={206} k={p2} label="PUT" />
      <rect x={330} y={136} width={245} height={96} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.3)} />
      <T x={452} y={190} s={12} f={C.crema} a="middle" o={k(0.3)}>
        bucket
      </T>
      {t > 3.0 && (
        <T x={300} y={124} s={11} f={C.focus} a="middle" o={k(3.0)}>
          one operation costs the same at any size
        </T>
      )}
    </Svg>
  );
}

// 3 · Reserved against consumed. A cursor runs along the hours: the reserved row fills solid the whole way, the consumed
// row only where jobs ran, and the gap between them collects underneath as idle, still billed.
export function ReservedVsConsumed({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const cx = lerp(130, 575, easeInOut(seg(t, 0.3, 3.0)));
  const jobs: [number, number][] = [
    [160, 240],
    [300, 340],
    [440, 520],
  ];
  const idle: [number, number][] = [
    [130, 160],
    [240, 300],
    [340, 440],
    [520, 575],
  ];
  const seen = (a: number, b: number) => Math.max(0, Math.min(cx, b) - a);
  return (
    <Svg label="A reserved-capacity bar filled fully, with a consumed-capacity bar growing to fill only part of it" h={250}>
      {['reserved', 'consumed', 'idle, billed'].map((l, i) => (
        <T key={l} x={25} y={62 + i * 50} s={12} f={i === 2 ? C.cherryText : C.crema} o={k(i * 0.2)}>
          {l}
        </T>
      ))}
      <rect x={130} y={50} width={cx - 130} height={16} rx={3} fill={C.second} opacity={0.8} />
      {jobs.map(([a, b]) => (
        <rect key={a} x={a} y={100} width={seen(a, b)} height={16} rx={3} fill={C.focus} opacity={0.85} />
      ))}
      {idle.map(([a, b]) => (
        <rect key={a} x={a} y={150} width={seen(a, b)} height={16} rx={3} fill={C.cherryText} opacity={0.7} />
      ))}
      <line x1={cx} y1={40} x2={cx} y2={176} stroke={C.latte} strokeWidth={1.2} />
      {t > 3.2 && (
        <T x={300} y={222} s={12} f={C.latte} a="middle" o={k(3.2)}>
          reserved bills for existing, not for running
        </T>
      )}
    </Svg>
  );
}

// 4 · One byte's journey. It stays in its zone for free, crosses to another zone, another region, out to the internet,
// each boundary lighting its own price; then the NAT gateway charges the same bytes again.
export function EveryBoundary({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const stages: [string, string][] = [
    ['same zone', 'free'],
    ['other AZ', '$0.01/GB'],
    ['other region', 'priced'],
    ['internet', '$0.09/GB'],
    ['NAT gateway', '+$0.045/GB'],
  ];
  const p = clamp(seg(t, 0.3, 3.8));
  const at = p * 4;
  const px = 75 + at * 112;
  return (
    <Svg label="Five boundaries a byte can cross, each lit in turn with its own price tag" h={250}>
      {stages.map(([name, price], i) => {
        const on = at >= i - 0.02;
        return (
          <g key={name} opacity={k(0)}>
            <Cell x={25 + i * 112} y={30} w={100} label={name} stroke={on ? (i === 0 ? C.focus : C.caramel) : C.mocha} />
            <T x={75 + i * 112} y={84} s={11} f={on ? (i === 0 ? C.focus : C.caramel) : C.latte} a="middle" o={on ? 1 : 0.35}>
              {price}
            </T>
            {i > 0 && <Coin x={75 + i * 112} y={164} k={on ? 1 : 0} />}
          </g>
        );
      })}
      <line x1={75} y1={124} x2={523} y2={124} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 4" opacity={k(0)} />
      <Pip x={px} y={124} s={12} f={C.second} />
      {at >= 3.98 && <Coin x={523} y={180} k={k(3.9)} />}
      {t > 4.0 && (
        <T x={300} y={226} s={12} f={C.caramel} a="middle" o={k(4.0)}>
          the NAT fee lands on the same bytes again
        </T>
      )}
    </Svg>
  );
}

// 5 · The premium. The managed bar runs longer than the self-hosted one; the patching, scaling and failing-over chips then
// slide from your team's column across to the provider's, filling the gap's meaning.
export function ManagedPremium({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mv = (i: number) => easeInOut(seg(t, 1.6 + i * 0.4, 2.3 + i * 0.4));
  return (
    <Svg label="A self-hosted bar and a taller managed-service bar, with the gap between them labeled as moved operational burden" h={250}>
      <T x={25} y={28} s={12} f={C.crema} o={k(0)}>
        self-hosted
      </T>
      <T x={325} y={28} s={12} f={C.crema} o={k(0)}>
        managed
      </T>
      <rect x={25} y={40} width={150 * k(0.2)} height={18} rx={3} fill={C.latte} opacity={0.75} />
      <rect x={325} y={40} width={150 * k(0.4)} height={18} rx={3} fill={C.latte} opacity={0.75} />
      <rect x={475} y={40} width={80 * k(0.9)} height={18} rx={3} fill={C.caramel} opacity={0.85} />
      <T x={555} y={78} s={11} f={C.caramel} a="end" o={k(1.1)}>
        the premium
      </T>
      {['patching', 'scaling', 'failing over'].map((c, i) => (
        <Cell key={c} x={lerp(40, 340, mv(i))} y={100 + i * 36} w={150} label={c} o={k(0.6)} stroke={mv(i) >= 1 ? C.caramel : C.mocha} />
      ))}
      <T x={40} y={226} s={11} f={C.latte} o={k(0.6)}>
        your team
      </T>
      <T x={340} y={226} s={11} f={C.caramel} o={k(2.8)}>
        their team, via the premium
      </T>
    </Svg>
  );
}

// 6 · One Spark job, line by line. Storage, requests, network and the NAT gateway each land with the job's own inputs and
// a bar to scale; the four bars together are the whole bill.
export function SparkTeardown({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows: [string, string, number][] = [
    ['storage', '500 GB at $0.023', 200],
    ['requests', '2,000 PUTs + 50,000 GETs', 3],
    ['network', '120 GB cross-AZ + 5 GB out', 29],
    ['NAT', '2 hours + 5 GB', 6],
  ];
  return (
    <Svg label="A four-slice pie for one Spark job's bill, built from storage, network, NAT and request charges" h={250}>
      {rows.map(([name, detail, w], i) => {
        const d = 0.3 + i * 0.9;
        const y = 36 + i * 42;
        return (
          <g key={name} opacity={k(d)}>
            <T x={25} y={y + 12} s={12} f={C.crema}>
              {name}
            </T>
            <T x={115} y={y + 12} s={11} f={C.latte}>
              {detail}
            </T>
            <rect x={370} y={y} width={Math.max(3, w * easeOut(seg(t, d + 0.2, d + 0.8)))} height={16} rx={3} fill={i === 0 ? C.second : C.caramel} opacity={0.85} />
          </g>
        );
      })}
      {t > 4.0 && (
        <T x={300} y={226} s={12} f={C.focus} a="middle" o={k(4.0)}>
          four lines, not one dollar unlabeled
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap: four meters, each beside a small moving picture of its idea, then what comes next.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.55, 0.5 + i * 0.55));
  const items = ['storage: bytes + operations', 'compute: reserved vs used', 'network: every boundary', 'premium: buys moved burden'];
  return (
    <Svg label="The four dimensions recapped as a stacked list" h={250}>
      {items.map((l, i) => (
        <T key={l} x={110} y={44 + i * 48} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        <rect x={25} y={32} width={26} height={12} rx={2} fill={C.second} />
        <Pip x={66} y={38} s={8} f={C.focus} />
        <Pip x={78} y={38} s={8} f={C.focus} o={k(0.6)} />
      </g>
      <g opacity={k(1)}>
        <rect x={25} y={80} width={60} height={12} rx={2} fill="none" stroke={C.second} />
        <rect x={25} y={80} width={60 * clamp(seg(t, 0.7, 1.6))} height={12} rx={2} fill={C.second} opacity={0.6} />
      </g>
      <g opacity={k(2)}>
        {[0, 1, 2].map((j) => (
          <line key={j} x1={35 + j * 22} y1={124} x2={35 + j * 22} y2={140} stroke={C.mocha} strokeWidth={1.5} />
        ))}
        <Pip x={lerp(25, 90, easeInOut(seg(t, 1.3, 2.3)))} y={132} s={7} f={C.caramel} />
      </g>
      <g opacity={k(3)}>
        <rect x={25} y={176} width={30} height={12} rx={2} fill={C.latte} />
        <rect x={55} y={176} width={18} height={12} rx={2} fill={C.caramel} />
      </g>
      {t > 2.6 && (
        <T x={300} y={240} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          next: three vendors' names for these four
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. Twenty writers on each side. The naive side's writers all land at once and nineteen vanish; the safe
// side's bounce, retry and all land. Once answered, each side's request bar appears, the safe one longer.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const go = easeInOut(seg(t, 0.3, 1.0));
  const lost = easeOut(seg(t, 1.0, 1.5));
  const Writers = ({ x0, safe }: { x0: number; safe: boolean }) => (
    <g>
      {Array.from({ length: 20 }, (_, i) => {
        const hx = x0 + (i % 10) * 24;
        const hy = 40 + Math.floor(i / 10) * 18;
        const d = safe ? clamp(seg(t, 0.3 + i * 0.1, 0.8 + i * 0.1)) : go;
        const bounce = safe ? Math.sin(Math.PI * clamp(seg(t, 0.3 + i * 0.1, 0.55 + i * 0.1))) * 0.5 : 0;
        const y = lerp(hy, 104, safe ? Math.max(0, easeInOut(d) - bounce) : d);
        const gone = !safe && i > 0 && lost > 0;
        return <Pip key={i} x={hx} y={y} s={8} f={gone ? C.cherryText : safe ? C.focus : C.second} o={gone ? 1 - lost : 1} />;
      })}
    </g>
  );
  return (
    <Svg label="Two request-cost bars for the lab's own naive and conditional races, the conditional one taller once revealed" h={250}>
      <Writers x0={37} safe={false} />
      <Writers x0={327} safe />
      <Cell x={25} y={112} w={250} label="naive-ledger" />
      <Cell x={315} y={112} w={250} label="cas-counter" />
      <T x={25} y={162} s={12} f={C.cherryText} o={lost}>
        19 of 20 lost
      </T>
      <T x={315} y={162} s={12} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        20 of 20 landed
      </T>
      <rect x={25} y={176} width={70 * v} height={12} rx={3} fill={C.second} />
      <rect x={315} y={176} width={230 * v} height={12} rx={3} fill={C.caramel} />
      <Verdict answer={answer} text="the safe one: every retry is a request" y={228} />
    </Svg>
  );
}
