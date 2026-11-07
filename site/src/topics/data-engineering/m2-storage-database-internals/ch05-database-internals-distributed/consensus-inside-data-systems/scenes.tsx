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

/** Five members of one consensus group in a row; `dark` lists the unreachable ones, crossed in by `dk`. */
function Five({ y, dark, dk, o = 1, x0 = 100, gap = 100, r = 20 }: { y: number; dark: number[]; dk: number; o?: number; x0?: number; gap?: number; r?: number }) {
  return (
    <g opacity={o}>
      {[0, 1, 2, 3, 4].map((i) => {
        const d = dark.includes(i);
        return (
          <g key={i}>
            <circle cx={x0 + i * gap} cy={y} r={r} fill={C.cocoa} stroke={d && dk > 0.5 ? C.mocha : C.focus} strokeWidth={2} opacity={d ? 1 - 0.6 * dk : 1} />
            {d && <Cross x={x0 + i * gap} y={y} k={dk} />}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. Five copies; two go dark; write dots still reach the other three, each ticking.
export function Hook({ t }: StepCtx) {
  const w = clamp(seg(t, 1.6, 2.3));
  return (
    <Svg label="five nodes, two go dark. The other three keep writing." h={230}>
      <Five y={100} dark={[1, 3]} dk={easeOut(seg(t, 0.8, 1.2))} o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 2, 4].map((i, j) => (
        <g key={i}>
          <circle cx={100 + i * 100} cy={lerp(40, 78, w)} r={4} fill={C.focus} opacity={w > 0 && w < 1 ? 1 : 0} />
          <MiniTick x={94 + i * 100} y={140} k={easeOut(seg(t, 2.3 + j * 0.15, 2.6 + j * 0.15))} />
        </g>
      ))}
      <Row y={195} label="three of five" value="still writing, not guessing" valueColor={C.focus} k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 2 · Predict. Two of five crossed out; the answer: a majority is enough.
export function PredictMajorityVsUnanimity({ t, answer }: StepCtx) {
  return (
    <Svg label="two of five unreachable. Does the write need everyone?" h={200}>
      <Five y={70} dark={[1, 3]} dk={easeOut(seg(t, 0.5, 0.9))} o={easeOut(seg(t, 0.1, 0.4))} r={18} />
      <AnswerRow y={140} label="needs every node?" answer={answer} value="no, a majority" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="any two majorities share a member" />
    </Svg>
  );
}

// 3 · Majority vs unanimity. Three reachable ticks clear the bar of three; majority commits; unanimity refuses.
export function RevealMajorityMeasured({ t }: StepCtx) {
  return (
    <Svg label="three of five: majority commits. Unanimity already refused." h={240}>
      <Row y={40} label="a majority of 5" value="3" k={easeOut(seg(t, 0.2, 0.7))} />
      <Five y={95} dark={[1, 3]} dk={easeOut(seg(t, 0.6, 1.0))} o={easeOut(seg(t, 0.3, 0.6))} />
      {[0, 2, 4].map((i, j) => (
        <MiniTick key={i} x={94 + i * 100} y={134} k={easeOut(seg(t, 1.2 + j * 0.15, 1.5 + j * 0.15))} />
      ))}
      <Row y={170} label="the majority rule" value="commits" valueColor={C.focus} k={easeOut(seg(t, 1.9, 2.4))} />
      <Row y={215} label="the unanimity rule" value="refused" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 4 · Losing quorum. A third node goes dark; only two are reachable, under the bar of three; the incoming write is crossed.
export function RevealLosingQuorum({ t }: StepCtx) {
  const w = clamp(seg(t, 1.4, 2.0));
  return (
    <Svg label="below a majority, the group refuses. It doesn't guess." h={240}>
      <Five y={80} dark={[1, 2, 3]} dk={easeOut(seg(t, 0.4, 0.9))} o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={200 + i * 70} y={130} width={60} height={14} rx={3} fill={i < 2 ? C.latte : C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.9, 1.2))} />
      ))}
      <T x={420} y={142} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        2 of the 3 needed
      </T>
      <circle cx={lerp(25, 180, w)} cy={137} r={5} fill={C.focus} opacity={w > 0 ? 1 - easeOut(seg(t, 2.1, 2.4)) : 0} />
      <Cross x={182} y={137} k={easeOut(seg(t, 2.0, 2.3))} />
      <Row y={200} label="below majority" value="refuses, never guesses" valueColor={C.cherryText} k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 5 · One group vs many. One group over 1,000 keys loses quorum and goes red; then ten per-range groups, only range 3 halts.
export function RevealGlobalVsPerRange({ t }: StepCtx) {
  const g = easeOut(seg(t, 1.2, 1.6));
  const r = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="one group: everything halts. Many groups: one range does." h={250}>
      <T x={25} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        one group, 1,000 keys
      </T>
      <rect x={25} y={52} width={550} height={30} rx={4} fill={C.cocoa} stroke={g > 0.5 ? C.cherryText : C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={300} y={71} s={12} f={g > 0.5 ? C.cherryText : C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        every key
      </T>
      <T x={300} y={106} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>
        quorum lost: no key is writable
      </T>
      <T x={25} y={140} s={13} f={C.crema} o={easeOut(seg(t, 2.4, 2.7))}>
        10 groups, one per range
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 55}
          y={152}
          width={48}
          height={30}
          rx={4}
          fill={C.cocoa}
          stroke={i === 3 && r > 0.5 ? C.cherryText : r > 0.5 ? C.focus : C.second}
          strokeWidth={2}
          opacity={easeOut(seg(t, 2.5 + i * 0.04, 2.8 + i * 0.04))}
        />
      ))}
      <Cross x={74 + 3 * 55 - 25} y={167} k={r} />
      <Row y={230} label="writable after" value="9 of 10 ranges" valueColor={C.focus} k={easeOut(seg(t, 4.0, 4.5))} />
    </Svg>
  );
}

// 6 · Predict #2. Two groups side by side; a single-group write is one arc. After the answer, prepare and commit arcs link both.
export function PredictCrossRangeCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="one group: one round trip. Two groups, same cost?" h={200}>
      <Cell x={25} y={70} w={220} label="group A" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={355} y={70} w={220} label="group B" stroke={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <path d="M90 70 Q135 40 180 70" fill="none" stroke={C.focus} strokeWidth={2} strokeDasharray="120" strokeDashoffset={120 * (1 - easeOut(seg(t, 0.6, 1.1)))} />
      <path d="M245 84 Q300 60 355 84" fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={a} />
      <path d="M245 90 Q300 114 355 90" fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={a} />
      <AnswerRow y={150} label="across two groups" answer={answer} value="more round trips" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="prepare, then commit, on top" y={190} />
    </Svg>
  );
}

// 7 · The round-trip cost. One group: one arc. Two groups: prepare and commit to each leader, four arcs, counted.
export function RevealRoundTripCost({ t }: StepCtx) {
  const arc = (x: number, k: number, f: string) => (
    <path key={x} d={`M${x} 150 Q${x + 25} 112 ${x + 50} 150`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="90" strokeDashoffset={90 * (1 - k)} />
  );
  return (
    <Svg label="one round trip, single group. Several, across two." h={240}>
      <Row y={40} label="one group" value="1 round trip" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="two groups" value="4 round trips" valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      {arc(25, easeOut(seg(t, 0.6, 1.1)), C.focus)}
      <T x={50} y={172} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        one
      </T>
      {['prepare A', 'prepare B', 'commit A', 'commit B'].map((l, i) => (
        <g key={l}>
          {arc(150 + i * 110, easeOut(seg(t, 2.0 + i * 0.4, 2.4 + i * 0.4)), C.cherryText)}
          <T x={175 + i * 110} y={172} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.2 + i * 0.4, 2.5 + i * 0.4))}>
            {l}
          </T>
        </g>
      ))}
      <Row y={215} label="crossing groups" value="several times the cost" valueColor={C.cherryText} k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 8 · Real systems. Kafka's small controller quorum; etcd's one group over everything; CockroachDB and TiKV, a group per range.
export function RevealRealSystems({ t }: StepCtx) {
  return (
    <Svg label="Kafka's controllers, etcd's one group, per-range groups." h={240}>
      <T x={25} y={64} s={13} f={C.crema} o={easeOut(seg(t, 0.3, 0.6))}>
        Kafka
      </T>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={225 + i * 40} cy={60} r={12} fill={C.cocoa} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.5 + i * 0.15, 0.8 + i * 0.15))} />
      ))}
      <T x={360} y={64} s={11} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        the metadata quorum
      </T>
      <T x={25} y={130} s={13} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
        etcd
      </T>
      <rect x={200} y={112} width={375 * easeOut(seg(t, 2.0, 2.6))} height={28} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} />
      <T x={387} y={131} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.5, 2.8))}>
        one group, the whole keyspace
      </T>
      <T x={25} y={196} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.5))}>
        CockroachDB, TiKV
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={200 + i * 47} y={178} width={40} height={28} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 3.4 + i * 0.08, 3.7 + i * 0.08))} />
      ))}
      <T x={200} y={228} s={11} f={C.second} o={easeOut(seg(t, 4.2, 4.5))}>
        each range, its own group
      </T>
    </Svg>
  );
}

// 9 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="majority commits. Losing quorum refuses. Boundaries cost trips." h={260}>
      <Row y={40} label="to commit" value="a majority, not all" valueColor={C.focus} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="losing quorum" value="refuse, never guess" k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={140} label="one group" value="a global outage" valueColor={C.cherryText} k={easeOut(seg(t, 1.9, 2.4))} />
      <Row y={190} label="many groups" value="a local one" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={240} label="crossing groups" value="extra round trips" valueColor={C.second} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 10 · Prove. One of the ten affected groups: one member crossed; after the answer the other four tick, above the bar of three.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="one hundred groups. A rack failure touches ten." h={220}>
      <Row y={40} label="a rack down" value="1 node in 10 groups" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="cluster stops?" answer={answer} value="no, 4 of 5 remain" k={easeOut(seg(t, 0.4, 0.9))} />
      <Five y={132} dark={[2]} dk={easeOut(seg(t, 0.9, 1.3))} o={easeOut(seg(t, 0.7, 1.0))} x0={150} gap={75} r={14} />
      {[0, 1, 3, 4].map((i) => (
        <MiniTick key={i} x={168 + i * 75} y={120} k={a} />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            no group loses its majority of 3
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
