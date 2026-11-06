import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Bandwidth, latency and data locality. Numbers from examples.py: β = 1.25 GB/s; BDP 610 KiB (0.5 ms) and 71.5 MiB
// (60 ms); a 16-bit window, 65,535 B; 1.0 MiB/s cross-region; shift 14 → 1 GiB; 10 × 7.2 MiB; 990 GB vs 9.9 GB on
// 100 machines, 8 s vs 0.08 s; $20 vs $0.20. The block grid in DataLocality and the lane counts are illustrative.

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

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** A pipe drawn on its side: a rounded band with an outline. */
const Pipe = ({ x, y, w, h, c = C.line, o = 1 }: { x: number; y: number; w: number; h: number; c?: string; o?: number }) =>
  o <= 0 || w <= 0 ? null : <rect x={x} y={y} width={w} height={h} rx={Math.min(h / 2, w / 2, 14)} fill={C.band} stroke={c} strokeWidth={1.6} opacity={Math.min(1, o)} />;

/** A machine: a small square with a label under it. */
const Machine = ({ x, y, label, c = C.secondary, o = 1 }: { x: number; y: number; label: string; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x - 18} y={y - 18} width={36} height={36} rx={5} fill={C.panel} stroke={c} strokeWidth={1.4} />
      <T x={x} y={y + 38} s={13} f={C.secondary} a="middle">
        {label}
      </T>
    </g>
  );

// 1 · The path between two machines drawn as a pipe: it grows out to its length (the round trip), its width is marked
// (the bandwidth), then packets pour in until the whole volume is full.
export function Problem({ t }: StepCtx) {
  const len = easeInOut(seg(t, 0.3, 1.3));
  const wid = fade(t, 1.0, 1.5);
  const fill = seg(t, 2.0, 3.2);
  const X0 = 90;
  const X1 = 510;
  const xe = lerp(X0, X1, len);
  return (
    <Svg label="A network path as a pipe: its width is the bandwidth, its length is the round-trip time, and its volume is the data that must be in flight" h={300}>
      <Machine x={50} y={130} label="A" />
      <Machine x={550} y={130} label="B" o={fade(t, 1.1, 1.4)} />
      <Pipe x={X0} y={100} w={xe - X0} h={60} c={C.secondary} />
      {Array.from({ length: 12 }, (_, i) => {
        const k = seg(fill * 12, i, i + 1);
        if (k <= 0) return null;
        const x = lerp(X0 + 14, X1 - 14 - i * 34, easeOut(k));
        return <circle key={i} cx={x} cy={130} r={9} fill={C.focus} />;
      })}
      <g opacity={wid}>
        <path d="M 74 102 L 74 158 M 69 108 L 74 102 L 79 108 M 69 152 L 74 158 L 79 152" stroke={C.secondary} strokeWidth={1.4} fill="none" />
        <T x={90} y={84} s={13} f={C.secondary}>
          width = bandwidth β
        </T>
      </g>
      <g opacity={fade(t, 1.3, 1.7)}>
        <line x1={X0} y1={190} x2={X1} y2={190} stroke={C.secondary} strokeWidth={1.2} />
        <path d={`M ${X0 + 6} 185 L ${X0} 190 L ${X0 + 6} 195 M ${X1 - 6} 185 L ${X1} 190 L ${X1 - 6} 195`} stroke={C.secondary} strokeWidth={1.2} fill="none" />
        <T x={300} y={214} s={13} f={C.secondary} a="middle">
          length = round-trip time
        </T>
      </g>
      <T x={300} y={268} s={15} f={C.focus} a="middle" o={fade(t, 2.6, 3.0)}>
        volume = data in flight
      </T>
    </Svg>
  );
}

// 2 · The bandwidth-delay product: one formula, then the same link drawn twice at true scale. The same-zone pipe is a
// stub (0.5 ms), the cross-region pipe 120 times longer (60 ms); each fills and counts its volume. Then the receive
// window appears as a gate at the sender.
export function BdpPipe({ t }: StepCtx) {
  const a = seg(t, 1.6, 2.2);
  const b = seg(t, 2.2, 3.0);
  const gate = fade(t, 3.1, 3.5);
  const LONG = 480;
  const SHORT = LONG / 120;
  return (
    <Svg label="BDP equals bandwidth times round-trip time: about six hundred ten kibibytes in the same zone, about seventy one and a half mebibytes cross-region, on the same link" h={320}>
      <T x={300} y={40} s={18} f={C.focus} a="middle" o={fade(t, 0.2, 0.6)}>
        BDP = β × RTT
      </T>
      <T x={300} y={66} s={13} f={C.secondary} a="middle" o={fade(t, 0.8, 1.2)}>
        twin of latency × bandwidth
      </T>
      <T x={30} y={110} s={13} f={C.secondary} o={fade(t, 1.5, 1.8)}>
        same zone, 0.5 ms
      </T>
      <g opacity={fade(t, 1.5, 1.8)}>
        <rect x={60} y={122} width={SHORT} height={28} fill={C.band} stroke={C.secondary} strokeWidth={1.2} />
        <rect x={60} y={122} width={SHORT * a} height={28} fill={C.focus} />
      </g>
      <T x={80} y={142} s={14} f={C.focus} o={a > 0 ? 1 : 0}>
        {fmt(610 * easeOut(a))} KiB
      </T>
      <T x={30} y={196} s={13} f={C.secondary} o={fade(t, 2.1, 2.4)}>
        cross-region, 60 ms
      </T>
      <g opacity={fade(t, 2.1, 2.4)}>
        <rect x={60} y={208} width={LONG} height={28} rx={4} fill={C.band} stroke={C.secondary} strokeWidth={1.2} />
        <rect x={60} y={208} width={LONG * easeInOut(b)} height={28} rx={4} fill={C.focus} />
      </g>
      <T x={540} y={262} s={14} f={C.focus} a="end" o={b > 0 ? 1 : 0}>
        {(71.5 * easeOut(b)).toFixed(1)} MiB in flight
      </T>
      <g opacity={gate}>
        <line x1={56} y1={lerp(222, 204, gate)} x2={56} y2={240} stroke={C.badText} strokeWidth={3} />
        <T x={30} y={300} s={13} f={C.badText}>
          receive window: caps unacked bytes
        </T>
      </g>
    </Svg>
  );
}

// 3 · Predict: a window smaller than the pipe. Before the answer, a window-sized burst leaves the sender. After it,
// the burst crosses, the acknowledgement comes back, and the sender sits idle a whole round trip each cycle.
export function WindowCapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X0 = 80;
  const X1 = 520;
  const W = 130;
  const q = answered ? (s % 2.4) / 2.4 : (t % 1.6) / 1.6;
  const burstX = answered ? lerp(X0, X1 - W, easeInOut(seg(q, 0, 0.5))) : lerp(X0, X0 + 120, easeOut(q));
  const ackX = lerp(X1, X0, easeInOut(seg(q, 0.5, 1)));
  const idle = answered && q > 0.5;
  return (
    <Svg label="A window smaller than the pipe fills, then stalls a whole round trip waiting for an acknowledgement, leaving the pipe part empty" h={300}>
      <Machine x={45} y={110} label="send" c={idle ? C.badText : C.secondary} />
      <Machine x={555} y={110} label="recv" />
      <Pipe x={X0} y={86} w={X1 - X0} h={48} />
      <rect x={burstX} y={92} width={W} height={36} rx={8} fill={C.focus} opacity={answered && q > 0.5 ? 0.25 : 1} />
      <T x={burstX + W / 2} y={115} s={13} f={C.ink} a="middle" o={answered && q > 0.5 ? 0 : 1}>
        window
      </T>
      {answered && q > 0.5 && <circle cx={ackX} cy={160} r={6} fill={C.focus} />}
      {answered && q > 0.5 && (
        <T x={ackX} y={186} s={13} f={C.secondary} a="middle">
          ack
        </T>
      )}
      {!answered && (
        <T x={300} y={230} s={36} f={C.focus} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <g opacity={answered ? fade(s, 0.2, 0.7) : 0}>
        <T x={300} y={236} s={16} f={C.badText} a="middle">
          throughput ≤ window ÷ RTT
        </T>
        <T x={300} y={264} s={13} f={C.secondary} a="middle">
          {idle ? 'sender idle: waiting a round trip' : 'a window’s worth sent'}
        </T>
      </g>
    </Svg>
  );
}

// 4 · The sixteen-bit field: its bits light one at a time while the maximum counts to 65,535, then the cross-region
// ceiling shows as a sliver of the link. Window scaling then shifts the field left by 14 and the ceiling climbs.
export function WindowField({ t }: StepCtx) {
  const N = 16;
  const bits = seg(t, 0.3, 1.4);
  const lit = Math.floor(bits * N + 0.0001);
  const cap = fade(t, 1.5, 2.2);
  const shift = easeInOut(seg(t, 2.8, 3.6));
  const BW = 18;
  const x0 = lerp(156, 30, shift);
  const max = Math.pow(2, lit) - 1;
  return (
    <Svg
      label="A sixteen-bit field tops out at sixty five thousand five hundred thirty five bytes, sixty four kibibytes, which caps a cross-region ten gigabit link at under a tenth of a percent; window scaling lifts the ceiling to one gibibyte"
      h={330}
    >
      <T x={30} y={30} s={13} f={C.secondary}>
        receive window field, 16 bits
      </T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={x0 + i * BW} y={44} width={BW - 4} height={26} rx={3} fill={i < lit ? C.focus : C.band} stroke={C.line} />
      ))}
      {shift > 0 && Array.from({ length: 14 }, (_, i) => <rect key={'z' + i} x={x0 + (N + i) * BW} y={44} width={BW - 4} height={26} rx={3} fill={C.second} opacity={shift} />)}
      <T x={300} y={104} s={18} f={C.focus} a="middle" o={bits > 0 ? 1 - shift : 0}>
        max {fmt(max)} B{lit === N ? ' = 64 KiB' : ''}
      </T>
      <T x={300} y={104} s={18} f={C.second} a="middle" o={shift}>
        shift 14: ceiling 1 GiB
      </T>
      <g opacity={cap}>
        <T x={30} y={150} s={13} f={C.secondary}>
          cross-region, 10 Gbit link
        </T>
        <rect x={30} y={162} width={540} height={24} rx={4} fill={C.band} stroke={C.line} />
        <rect x={30} y={162} width={lerp(540, 3, easeOut(seg(t, 1.8, 2.5)))} height={24} rx={4} fill={C.badText} />
        <T x={30} y={212} s={14} f={C.badText} o={fade(t, 2.3, 2.6)}>
          64 KiB ÷ 60 ms ≈ 1.0 MiB/s, under 0.1%
        </T>
      </g>
      <g opacity={fade(t, 3.4, 3.8)}>
        <T x={30} y={262} s={13} f={C.secondary}>
          negotiated once, at the handshake
        </T>
        <T x={30} y={290} s={13} f={C.secondary}>
          kernel sizes buffers up to your limit
        </T>
      </g>
    </Svg>
  );
}

// 5 · Two axes. One packet crosses a fixed path in the same time however many lanes there are (latency); lanes are
// added and the finished count per second climbs (throughput). Then Little's law ties them.
export function LatencyThroughputAxes({ t }: StepCtx) {
  const lanes = 1 + Math.min(3, Math.floor(seg(t, 1.0, 2.0) * 4));
  const X0 = 40;
  const X1 = 400;
  const ph = (t * 0.8) % 1;
  const law = fade(t, 2.1, 2.5);
  const read = fade(t, 3.0, 3.4);
  return (
    <Svg
      label="Latency is how long one trip takes and distance fixes it; throughput is how much finishes per second and grows with more at once; Little's law: in flight equals throughput times latency"
      h={320}
    >
      {Array.from({ length: lanes }, (_, i) => {
        const y = 40 + i * 34;
        const o = i === 0 ? fade(t, 0.1, 0.4) : fade(t, 1.0 + (i - 1) * 0.25 + 0.25, 1.25 + i * 0.25);
        return (
          <g key={i} opacity={o}>
            <rect x={X0} y={y} width={X1 - X0} height={22} rx={11} fill={C.band} stroke={C.line} />
            <circle cx={lerp(X0 + 11, X1 - 11, ph)} cy={y + 11} r={7} fill={C.focus} />
          </g>
        );
      })}
      <T x={420} y={56} s={13} f={C.secondary} o={fade(t, 0.2, 0.5)}>
        one trip: fixed
      </T>
      <T x={420} y={82} s={13} f={C.secondary} o={fade(t, 1.0, 1.3)}>
        lanes: {lanes}
      </T>
      <T x={420} y={108} s={13} f={C.focus} o={fade(t, 1.0, 1.3)}>
        done/s ×{lanes}
      </T>
      <g opacity={law}>
        <T x={300} y={210} s={17} f={C.focus} a="middle">
          in flight = throughput × latency
        </T>
        <T x={300} y={236} s={13} f={C.secondary} a="middle">
          Little’s law
        </T>
      </g>
      <g opacity={read}>
        <T x={30} y={280} s={13} f={C.secondary}>
          one way: the bandwidth-delay product
        </T>
        <T x={30} y={306} s={13} f={C.second}>
          the other: concurrency a target needs
        </T>
      </g>
    </Svg>
  );
}

// 6 · Predict: the 71.5 MiB pipe with one default stream's sliver in it. After the answer, ten 7.2 MiB windows slide
// in one after another and fill the pipe between them, while the single stream stays a sliver.
export function StreamsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X0 = 30;
  const L = 540;
  const seg10 = L / 10;
  return (
    <Svg label="One default stream has far too little in flight to fill a seventy one mebibyte pipe; ten streams each with about seven mebibytes in flight fill it between them" h={300}>
      <T x={30} y={34} s={13} f={C.secondary}>
        pipe to fill: 71.5 MiB
      </T>
      <T x={30} y={70} s={13} f={C.secondary}>
        one default stream
      </T>
      <rect x={X0} y={82} width={L} height={26} rx={4} fill={C.band} stroke={C.line} />
      <rect x={X0} y={82} width={answered ? 2 : 2 + 2 * Math.abs(Math.sin(t * 2))} height={26} fill={C.badText} />
      <T x={30} y={150} s={13} f={C.secondary}>
        ten streams
      </T>
      <rect x={X0} y={162} width={L} height={26} rx={4} fill={C.band} stroke={C.line} />
      {Array.from({ length: 10 }, (_, i) => {
        const k = answered ? easeOutBack(seg(s, 0.1 + i * 0.12, 0.45 + i * 0.12)) : 0;
        if (k <= 0) return null;
        return <rect key={i} x={lerp(X0 + L + 20, X0 + i * seg10, Math.min(1, k)) + 1} y={164} width={seg10 - 2} height={22} rx={3} fill={C.focus} opacity={Math.min(1, k)} />;
      })}
      {!answered && (
        <T x={300} y={250} s={36} f={C.focus} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <g opacity={answered ? fade(s, 1.4, 1.8) : 0}>
        <T x={300} y={228} s={13} f={C.secondary} a="middle">
          10 × 7.2 MiB ≈ the whole pipe
        </T>
        <T x={300} y={262} s={16} f={C.focus} a="middle">
          ten streams, easily
        </T>
      </g>
    </Svg>
  );
}

// 7 · Data locality. A big block starts to cross toward the job and is stopped; the small job travels to the data
// instead. Then pushdown: unneeded columns and blocks whose stats rule them out drop away, and n shrinks.
export function DataLocality({ t }: StepCtx) {
  const tryMove = seg(t, 0.3, 0.9);
  const back = seg(t, 0.9, 1.1);
  const job = easeInOut(seg(t, 1.2, 1.9));
  const cols = fade(t, 2.0, 2.5);
  const blocks = fade(t, 2.5, 3.0);
  const nk = fade(t, 3.0, 3.6);
  const dataX = 60 + 60 * Math.sin(Math.PI * tryMove) * (1 - back);
  // a 5 × 4 grid of blocks: columns 1 and 3 are not needed, rows 0 and 2 are ruled out by their min/max stats.
  const needCol = [true, false, true, false, true];
  const keepRow = [false, true, false, true];
  return (
    <Svg
      label="Sending the computation to the machine holding the data beats sending the data; pushdown reads only the needed columns and skips blocks whose statistics rule them out, shrinking n before any transfer"
      h={330}
    >
      <rect x={dataX} y={50} width={130} height={92} rx={6} fill={C.panel} stroke={C.secondary} />
      {Array.from({ length: 20 }, (_, i) => {
        const c = i % 5;
        const r = Math.floor(i / 5);
        const gone = Math.max(needCol[c] ? 0 : cols, keepRow[r] ? 0 : blocks);
        return <rect key={i} x={dataX + 10 + c * 23} y={60 + r * 19} width={19} height={15} rx={2} fill={C.primary} opacity={1 - 0.85 * gone} />;
      })}
      <T x={125} y={168} s={13} f={C.secondary} a="middle">
        data, on its machine
      </T>
      {tryMove > 0 && back < 1 && <path d={`M ${dataX + 140} 96 L ${dataX + 200} 96`} stroke={C.badText} strokeWidth={2} strokeDasharray="5 4" />}
      <circle cx={lerp(470, 205, job)} cy={lerp(96, 70, job)} r={14} fill={C.focus} />
      <T x={lerp(470, 205, job)} y={lerp(96, 70, job) + 5} s={13} f={C.ink} a="middle">
        job
      </T>
      <T x={470} y={140} s={13} f={C.secondary} a="middle" o={1 - job}>
        scheduler
      </T>
      <T x={430} y={60} s={13} f={C.focus} a="middle" o={fade(t, 1.8, 2.1)}>
        compute moves
      </T>
      <g opacity={cols}>
        <T x={300} y={210} s={13} f={C.secondary} a="middle">
          read only the needed columns
        </T>
      </g>
      <g opacity={blocks}>
        <T x={300} y={236} s={13} f={C.secondary} a="middle">
          skip blocks the stats rule out
        </T>
      </g>
      <g opacity={nk}>
        <T x={30} y={290} s={17} f={C.focus}>
          time ≈ n ÷ β
        </T>
        <rect x={200} y={276} width={lerp(360, 360 * 0.24, nk)} height={18} rx={4} fill={C.focus} />
        <T x={30} y={318} s={13} f={C.secondary}>
          n shrinks before a byte is sent
        </T>
      </g>
    </Svg>
  );
}

// 8 · The join on 100 machines. Shuffle: every machine sends to every other and the 990 GB bar grows with its time.
// Broadcast: the small customers table lands on each machine, a bar one hundredth as long.
export function JoinReprice({ t }: StepCtx) {
  const intro = fade(t, 0.1, 0.5);
  const sh = easeInOut(seg(t, 1.0, 2.0));
  const bc = seg(t, 2.1, 3.0);
  const end = fade(t, 3.1, 3.5);
  // 100 machines as a 20 × 5 grid of small squares.
  const GX = 30;
  const GY = 40;
  return (
    <Svg
      label="Shuffling both tables sends about nine hundred ninety gigabytes, about eight seconds per machine; broadcasting the small table sends about nine point nine gigabytes, about eight hundredths of a second"
      h={340}
    >
      <g opacity={intro}>
        {Array.from({ length: 100 }, (_, i) => {
          const c = i % 20;
          const r = Math.floor(i / 20);
          const hit = bc > 0 && i < bc * 100;
          const busy = sh > 0 && sh < 1 && (i * 7 + Math.floor(t * 12)) % 3 === 0;
          return <rect key={i} x={GX + c * 27} y={GY + r * 14} width={22} height={10} rx={2} fill={hit ? C.focus : busy ? C.badText : C.band} stroke={C.line} strokeWidth={0.6} />;
        })}
        <T x={30} y={28} s={13} f={C.secondary}>
          100 machines
        </T>
      </g>
      <T x={30} y={138} s={13} f={C.secondary} o={fade(t, 0.9, 1.1)}>
        shuffle both tables by key
      </T>
      <rect x={30} y={150} width={540 * sh} height={24} rx={4} fill={C.badText} />
      <T x={30} y={198} s={14} f={C.badText} o={sh > 0 ? 1 : 0}>
        {fmt(990 * sh)} GB · {(8 * sh).toFixed(0)} s per machine
      </T>
      <T x={30} y={240} s={13} f={C.secondary} o={fade(t, 2.0, 2.2)}>
        broadcast customers
      </T>
      <rect x={30} y={252} width={Math.max(bc > 0 ? 2 : 0, 5.4 * easeOut(bc))} height={24} rx={2} fill={C.focus} />
      <T x={52} y={270} s={14} f={C.focus} o={bc > 0 ? 1 : 0}>
        {(9.9 * easeOut(bc)).toFixed(1)} GB · 0.08 s
      </T>
      <T x={300} y={326} s={15} f={C.focus} a="middle" o={end}>
        same answer, 100× less traffic
      </T>
    </Svg>
  );
}

// 9 · Predict: two meters, both spinning before the answer. After it they count up to $20 and $0.20 and two bars
// show the hundred-to-one ratio.
export function DollarPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = easeOut(seg(s, 0.2, 1.6));
  const spin = (n: number) => (Math.floor(t * 9 + n) % 10).toString();
  return (
    <Svg label="At a cent per gigabyte each direction, the shuffle costs about twenty dollars and the broadcast about twenty cents, a hundred to one, the ratio of the bytes" h={300}>
      <T x={30} y={40} s={13} f={C.secondary}>
        cross-zone: $0.01 per GB, each direction
      </T>
      <Box x={60} y={70} w={200} h={60} label="" />
      <Box x={340} y={70} w={200} h={60} label="" />
      <T x={160} y={112} s={24} f={answered ? C.badText : C.secondary} a="middle">
        {answered ? `$${(20 * k).toFixed(2)}` : `$${spin(0)}${spin(3)}.${spin(5)}${spin(7)}`}
      </T>
      <T x={440} y={112} s={24} f={answered ? C.focus : C.secondary} a="middle">
        {answered ? `$${(0.2 * k).toFixed(2)}` : `$0.${spin(2)}${spin(6)}`}
      </T>
      <T x={160} y={156} s={13} f={C.secondary} a="middle">
        shuffle
      </T>
      <T x={440} y={156} s={13} f={C.secondary} a="middle">
        broadcast
      </T>
      <g opacity={answered ? fade(s, 1.4, 1.8) : 0}>
        <rect x={30} y={190} width={540 * k} height={18} rx={3} fill={C.badText} />
        <rect x={30} y={218} width={Math.max(2, 5.4 * k)} height={18} rx={2} fill={C.focus} />
        <T x={300} y={270} s={15} f={C.focus} a="middle">
          100 to 1, the ratio of the bytes
        </T>
      </g>
    </Svg>
  );
}

// 10 · The meter. Two zones and the internet: packets inside a zone pass free, packets across zones tick the meter
// both ways, packets out to the internet tick it one way. Then compute is pulled in next to its storage.
export function Verdict({ t }: StepCtx) {
  const r1 = fade(t, 0.5, 0.9);
  const r2 = fade(t, 1.0, 1.4);
  const r3 = fade(t, 1.5, 1.9);
  const grav = easeInOut(seg(t, 2.2, 3.0));
  const p = (t * 0.9) % 1;
  return (
    <Svg label="Traffic inside one zone is free, across zones is metered each direction, out to the internet is metered one way: data gravity pins compute next to its storage" h={330}>
      <rect x={30} y={30} width={240} height={150} rx={8} fill="none" stroke={C.line} strokeDasharray="6 4" />
      <T x={40} y={50} s={13} f={C.secondary}>
        zone A
      </T>
      <rect x={330} y={30} width={240} height={150} rx={8} fill="none" stroke={C.line} strokeDasharray="6 4" />
      <T x={340} y={50} s={13} f={C.secondary}>
        zone B
      </T>
      <Box x={50} y={70} w={70} h={30} label="data" />
      <Box x={lerp(400, 160, grav)} y={70} w={90} h={30} label="compute" lit={grav >= 1} />
      <g opacity={r1}>
        <line x1={120} y1={140} x2={250} y2={140} stroke={C.line} />
        <circle cx={lerp(124, 246, p)} cy={140} r={5} fill={C.focus} />
        <T x={185} y={166} s={13} f={C.focus} a="middle">
          free
        </T>
      </g>
      <g opacity={r2}>
        <line x1={250} y1={120} x2={350} y2={120} stroke={C.second} />
        <circle cx={lerp(254, 346, p)} cy={116} r={4} fill={C.second} />
        <circle cx={lerp(346, 254, p)} cy={124} r={4} fill={C.second} />
        <T x={300} y={208} s={13} f={C.second} a="middle">
          across zones: metered both ways
        </T>
      </g>
      <g opacity={r3}>
        <line x1={150} y1={180} x2={150} y2={260} stroke={C.badText} />
        <circle cx={150} cy={lerp(184, 256, p)} r={4} fill={C.badText} />
        <T x={164} y={262} s={13} f={C.badText}>
          internet: metered, one way
        </T>
      </g>
      <T x={300} y={312} s={16} f={C.focus} a="middle" o={fade(t, 2.8, 3.2)}>
        data gravity: compute by storage
      </T>
    </Svg>
  );
}
