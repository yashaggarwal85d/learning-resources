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

/** Ten partitions in a row at `y`; `hl` picks one to outline in `hf`. */
function Parts({ y, o = 1, hl = -1, hf = C.cherryText, n = 10, w = 46, gap = 55 }: { y: number; o?: number; hl?: number; hf?: string; n?: number; w?: number; gap?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * gap} y={y} width={w} height={26} rx={3} fill={C.cocoa} stroke={i === hl ? hf : C.mocha} strokeWidth={i === hl ? 2.5 : 1.5} />
      ))}
    </g>
  );
}

/** Write dots dropping from `y0` into partitions: dot k lands in partition `to(k)`. */
function Drops({ t, start, y0, y1, to, n = 10, beat = 0.22 }: { t: number; start: number; y0: number; y1: number; to: (k: number) => number; n?: number; beat?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, k) => {
        const q = clamp((t - start - k * beat) / 0.4);
        return <circle key={k} cx={25 + to(k) * 55 + 23} cy={lerp(y0, y1, q)} r={4} fill={C.focus} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
    </g>
  );
}

// 1 · Hook. The same stream into the same ten nodes, twice: top row, every write drops onto one node; bottom row, they scatter.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="same events, same nodes. One way overloads one; one doesn't." h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        split one way
      </T>
      <Parts y={62} o={easeOut(seg(t, 0.2, 0.5))} hl={t > 1.4 ? 9 : -1} />
      <Drops t={t} start={0.6} y0={44} y1={62} to={() => 9} />
      <T x={25} y={130} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        split another way
      </T>
      <Parts y={152} o={easeOut(seg(t, 2.4, 2.7))} />
      <Drops t={t} start={2.7} y0={134} y1={152} to={(k) => (k * 3 + 1) % 10} beat={0.15} />
      <Row y={220} label="one node" value="almost all the work" valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
    </Svg>
  );
}

// 2 · Predict. Ten sorted partitions, oldest keys left, newest right; the newest event waits above. The answer: the tail.
export function PredictNewestWriteUnderRange({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const d = answer !== null ? easeInOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="events arrive in order. Where does the newest one land?" h={200}>
      <Parts y={60} o={easeOut(seg(t, 0.1, 0.4))} hl={d >= 1 ? 9 : -1} hf={C.focus} />
      <T x={25} y={106} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        oldest keys
      </T>
      <T x={575} y={106} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        newest keys
      </T>
      <circle cx={lerp(300, 543, d)} cy={lerp(40, 73, d)} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.8, 1.1)) * (d >= 1 ? 0 : 1)} />
      <AnswerRow y={140} label="the newest lands on" answer={answer} value="the tail, always" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="the highest key has one home" />
    </Svg>
  );
}

// 3 · Range partitioning. A scan sweeps three neighbours in one pass; then every new write drops onto the tail.
export function RevealRangePartitioning({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="ordered scans in one sweep. Every new write hits the tail." h={240}>
      <Parts y={80} o={easeOut(seg(t, 0.1, 0.4))} hl={t > 2.6 ? 9 : -1} />
      <rect x={135} y={74} width={165 * sw} height={38} rx={4} fill="none" stroke={C.second} strokeWidth={2} />
      <T x={135} y={134} s={11} f={C.second} o={easeOut(seg(t, 1.4, 1.7))}>
        a range scan: one sweep
      </T>
      <Drops t={t} start={2.2} y0={50} y1={80} to={() => 9} n={6} />
      <Row y={210} label="every new write" value="the tail partition" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · The hot tail, measured. 10,000 writes over 10 partitions; the most recent 500 all drop onto one.
export function RevealHotTailMeasured({ t }: StepCtx) {
  return (
    <Svg label="the last five hundred writes: one partition, every time." h={240}>
      <Row y={40} label="10,000 writes" value="10 partitions" k={easeOut(seg(t, 0.2, 0.7))} />
      <Parts y={90} o={easeOut(seg(t, 0.4, 0.7))} hl={t > 1.4 ? 9 : -1} />
      <Drops t={t} start={1.0} y0={62} y1={90} to={() => 9} n={10} beat={0.18} />
      <Row y={170} label="the most recent 500" value="all on 1 partition" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 5 · Hash partitioning. The same recent writes, hashed first, scatter across the row.
export function RevealHashPartitioning({ t }: StepCtx) {
  return (
    <Svg label="no order left, but the same recent writes spread out." h={240}>
      <Row y={40} label="hash each key first" value="order: gone" k={easeOut(seg(t, 0.2, 0.7))} />
      <Parts y={90} o={easeOut(seg(t, 0.4, 0.7))} />
      <Drops t={t} start={1.0} y0={62} y1={90} to={(k) => (k * 7 + 2) % 10} n={12} beat={0.15} />
      <Row y={170} label="recent writes" value="more than 7 of 10 touched" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 6 · Predict #2. Ten nodes become eleven under key mod n; after the answer the moved-keys bar runs past the 85% mark.
export function PredictNaiveResizeCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const f = answer !== null ? easeOut(seg(s, 0.2, 1.0)) : 0;
  return (
    <Svg label="one node joins a ten-node cluster. How much data moves?" h={200}>
      <Row y={40} label="10 nodes, then 11" value="hash mod n" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={66} width={550} height={18} rx={3} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={25} y={66} width={470 * f} height={18} rx={3} fill={C.cherryText} />
      <line x1={492} y1={60} x2={492} y2={90} stroke={C.crema} strokeWidth={1.5} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={492} y={106} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        85%
      </T>
      <AnswerRow y={140} label="keys that move" answer={answer} value="over 85%" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="n is in every key's formula" />
    </Svg>
  );
}

// 7 · Consistent and rendezvous. Three bars of keys moved: modulo past 85%, the ring and rendezvous both stopping under 20%.
export function RevealConsistentAndRendezvous({ t }: StepCtx) {
  const sc = 340;
  const rows: [string, number, string, string, number][] = [
    ['plain modulo', 0.85, 'over 85%', C.cherryText, 0.6],
    ['consistent ring', 0.2, 'under 20%', C.focus, 2.0],
    ['rendezvous', 0.2, 'under 20%', C.focus, 3.0],
  ];
  return (
    <Svg label="naive remaps almost all. Ring and HRW move a fair share." h={240}>
      {rows.map(([l, v, txt, f, a], i) => {
        const k = easeOut(seg(t, a, a + 0.8));
        const y = 52 + i * 50;
        return (
          <g key={l}>
            <T x={25} y={y + 14} s={13} f={C.crema} o={easeOut(seg(t, a - 0.2, a + 0.1))}>
              {l}
            </T>
            <rect x={170} y={y} width={v * sc * k} height={18} rx={3} fill={f} />
            <line x1={170 + v * sc} y1={y - 4} x2={170 + v * sc} y2={y + 22} stroke={C.crema} strokeWidth={1.5} strokeDasharray="3 3" opacity={seg(k, 0.6, 1)} />
            <T x={180 + v * sc} y={y + 14} s={12} f={f} o={seg(k, 0.7, 1)}>
              {txt}
            </T>
          </g>
        );
      })}
      <Row y={215} label="moves only" value="the new node's fair share" valueColor={C.focus} k={easeOut(seg(t, 4.2, 4.7))} />
    </Svg>
  );
}

// 8 · Routing and the independent axis. A request reaches the owning node by one of three routes; below it, its replicas sit apart.
export function RevealRoutingAndIndependentAxis({ t }: StepCtx) {
  const routes = ['the client itself', 'a proxy', 'a coordinator'];
  return (
    <Svg label="client, proxy, or coordinator routes it. Replicas: separate." h={240}>
      <Cell x={25} y={86} w={110} label="request" o={easeOut(seg(t, 0.1, 0.4))} />
      {routes.map((r, i) => (
        <g key={r}>
          <line x1={135} y1={100} x2={180} y2={52 + i * 48} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6 + i * 0.4, 0.9 + i * 0.4))} />
          <Cell x={180} y={38 + i * 48} w={170} label={r} stroke={C.second} o={easeOut(seg(t, 0.7 + i * 0.4, 1.0 + i * 0.4))} />
          <line x1={350} y1={52 + i * 48} x2={400} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8 + i * 0.4, 1.1 + i * 0.4))} />
        </g>
      ))}
      <Cell x={400} y={86} w={175} label="the owning node" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))} />
      {[0, 1].map((i) => (
        <rect key={i} x={420 + i * 12} y={138 + i * 10} width={135} height={22} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 2.8 + i * 0.2, 3.1 + i * 0.2))} />
      ))}
      <T x={575} y={200} s={11} f={C.latte} a="end" o={easeOut(seg(t, 3.2, 3.5))}>
        its replicas
      </T>
      <T x={25} y={228} s={12} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        routing and replication: separate questions
      </T>
    </Svg>
  );
}

// 9 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="range orders, hash spreads. Naive breaks on resize." h={260}>
      <Row y={40} label="range" value="fast scans, a hot tail" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="hash" value="even spread, no order" k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={140} label="naive hashing" value="breaks on resize" valueColor={C.cherryText} k={easeOut(seg(t, 1.9, 2.4))} />
      <Row y={190} label="ring, rendezvous" value="built not to" valueColor={C.focus} k={easeOut(seg(t, 2.7, 3.2))} />
      <Row y={240} label="partition, replicate" value="two decisions" k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 10 · Prove. The tail partition stays red; after the answer more partitions join on the right, and the tail is still the only hot one.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="range-partitioned order IDs, heavy traffic. Then what?" h={220}>
      <Row y={40} label="range by order ID" value="100× the writes" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="add more nodes?" answer={answer} value="no, same one tail" k={easeOut(seg(t, 0.4, 0.9))} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 39}
          y={118}
          width={34}
          height={24}
          rx={3}
          fill={C.cocoa}
          stroke={i === 13 ? C.cherryText : C.mocha}
          strokeWidth={i === 13 ? 2.5 : 1.5}
          strokeDasharray={i >= 9 && i < 13 ? '4 3' : undefined}
          opacity={i >= 9 && i < 13 ? a : easeOut(seg(t, 0.8, 1.1))}
        />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            the newest key still has one home
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
