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
/** A node's timeline: its name on the left and a line from x 110 rightwards; events sit on it as cells. */
function NLane({ y, name, o = 1 }: { y: number; name: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 5} s={13} f={C.latte}>
        {name}
      </T>
      <line x1={110} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane, centred on the lane's line. */
function Ev({ x, y, w = 110, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return <Cell x={x} y={y - 13} w={w} h={26} label={label} o={o} stroke={stroke} f={f} />;
}

// 1 · Hook. A stream of commands of every kind runs through one single lane, one after another, continuously.
export function Hook({ t }: StepCtx) {
  const cmds = ['GET', 'SET', 'LPUSH', 'SADD', 'HSET', 'GET', 'SET', 'SADD'];
  const run = t > 0.6 ? t - 0.6 : 0;
  return (
    <Svg label="a real Redis instance runs every command on a single thread, yet handles tens of thousands a second" h={230}>
      <T x={25} y={60} s={13} f={C.focus} o={easeOut(seg(t, 0.2, 0.5))}>
        one thread
      </T>
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {cmds.map((c, i) => {
        const q = (run * 0.45 + i / cmds.length) % 1;
        return <Cell key={i} x={lerp(-50, 560, q)} y={87} w={64} h={26} label={c} stroke={C.second} o={run > 0 ? clamp(q * 8) * clamp((1 - q) * 8) : 0} />;
      })}
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        keys, lists, sets, hashes — all on it
      </T>
      <Row y={205} label="its throughput" value="tens of thousands a second" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 2 · Predict. "Despite it" beside "because of it"; after the answer the first is crossed and the second lit.
export function PredictSpeedCause({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="is Redis fast despite being single-threaded, or because of it?" h={200}>
      <Cell x={25} y={60} w={250} h={28} label="fast despite it" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cross x={255} y={74} k={a} />
      <Cell x={325} y={60} w={250} h={28} label="fast because of it" stroke={a > 0.5 ? C.focus : C.mocha} f={a > 0.5 ? C.focus : C.crema} o={easeOut(seg(t, 0.5, 0.8))} />
      <AnswerRow y={140} label="the single thread" answer={answer} value="is the reason" k={easeOut(seg(t, 1.0, 1.5))} />
      <Verdict answer={answer} text="no locks, no cross-core waiting" />
    </Svg>
  );
}

// 3 · The event loop. A dot circles one loop that runs every command; to the right, dashed I/O threads handle only sockets, off by default.
export function RevealEventLoop({ t }: StepCtx) {
  const ang = (t > 0.4 ? t - 0.4 : 0) * 2.4;
  return (
    <Svg label="commands always run on one thread; I/O threads are an opt-in extra for sockets only" h={240}>
      <circle cx={170} cy={110} r={60} fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <circle cx={170 + 60 * Math.cos(ang)} cy={110 + 60 * Math.sin(ang)} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.6))} />
      <T x={170} y={115} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        every command
      </T>
      <T x={170} y={200} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        one thread, always
      </T>
      {[0, 1].map((i) => (
        <g key={i} opacity={0.55 * easeOut(seg(t, 2.2 + i * 0.3, 2.5 + i * 0.3))}>
          <rect x={330} y={56 + i * 44} width={245} height={30} rx={4} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={452} y={76 + i * 44} s={12} f={C.second} a="middle">
            I/O thread: sockets only
          </T>
        </g>
      ))}
      <T x={330} y={165} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        opt-in, off by default
      </T>
      <T x={330} y={200} s={11} f={C.second} o={easeOut(seg(t, 4.2, 4.5))}>
        an asyncio-style loop
      </T>
    </Svg>
  );
}

// 4 · RDB vs AOF. Writes stream along a line with two snapshot markers; a crash loses everything after the last one. Then every write logged: nothing lost.
export function RevealRdbVsAof({ t }: StepCtx) {
  const pips = Array.from({ length: 12 }, (_, i) => 100 + i * 38);
  const crash1 = easeOut(seg(t, 2.6, 2.9));
  const crash2 = easeOut(seg(t, 4.2, 4.5));
  return (
    <Svg label="RDB snapshots periodically and can lose recent writes; AOF logs every write instead" h={240}>
      <T x={25} y={85} s={13} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        RDB
      </T>
      <line x1={80} y1={80} x2={575} y2={80} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      {pips.map((x, i) => (
        <circle key={i} cx={x} cy={80} r={5} fill={i > 7 && crash1 > 0.5 ? C.cherryText : C.latte} opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.5 + i * 0.1))} />
      ))}
      {[3, 7].map((i, j) => (
        <g key={i} opacity={easeOut(seg(t, 0.8 + j * 0.6, 1.1 + j * 0.6))}>
          <rect x={pips[i] + 15} y={62} width={4} height={36} fill={C.second} />
        </g>
      ))}
      <T x={pips[7] + 17} y={56} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        last snapshot
      </T>
      <Cross x={565} y={80} k={crash1} />
      <T x={480} y={116} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
        lost since then
      </T>
      <T x={25} y={165} s={13} f={C.crema} o={easeOut(seg(t, 3.3, 3.6))}>
        AOF
      </T>
      <line x1={80} y1={160} x2={575} y2={160} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 3.3, 3.6))} />
      {pips.map((x, i) => (
        <g key={i} opacity={easeOut(seg(t, 3.4 + i * 0.05, 3.6 + i * 0.05))}>
          <circle cx={x} cy={160} r={5} fill={C.focus} />
          <rect x={x - 4} y={170} width={8} height={4} fill={C.focus} />
        </g>
      ))}
      <Cross x={565} y={160} k={crash2} />
      <T x={300} y={210} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 4.6, 5.0))}>
        replay the log: nothing missing
      </T>
    </Svg>
  );
}

// 5 · Async replication. The master's burst is acknowledged; the replica's copies trail behind; for a moment the last acked writes exist only on the master.
export function RevealReplicationLoss({ t }: StepCtx) {
  const km = clamp(seg(t, 0.4, 1.6));
  const kr = clamp(seg(t, 0.8, 3.8));
  const gap = easeOut(seg(t, 2.0, 2.3)) * (1 - easeOut(seg(t, 3.6, 3.9)));
  return (
    <Svg label="a real write, acknowledged by the master, measured still missing from a real frozen replica" h={240}>
      <NLane y={60} name="master" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={130} name="replica" o={easeOut(seg(t, 0.1, 0.4))} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <circle cx={130 + i * 42} cy={60} r={5} fill={C.focus} opacity={km * 10 > i ? 1 : 0} />
          <circle cx={130 + i * 42} cy={130} r={5} fill={C.second} opacity={kr * 10 > i ? 1 : 0} />
        </g>
      ))}
      <T x={575} y={40} s={11} f={C.focus} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        acknowledged
      </T>
      <rect x={330} y={116} width={245} height={28} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={gap} />
      <T x={452} y={166} s={11} f={C.cherryText} a="middle" o={gap}>
        acknowledged, not yet applied
      </T>
      <T x={25} y={200} s={12} f={C.cherryText} o={easeOut(seg(t, 2.6, 2.9))}>
        if the master failed in that gap: gone
      </T>
      <T x={25} y={228} s={12} f={C.latte} o={easeOut(seg(t, 4.0, 4.3))}>
        they do arrive — asynchronously
      </T>
    </Svg>
  );
}

// 6 · Cluster slots. A strip of slots, each range owned by one node; a key hashes to one slot, which points to its one owner.
export function RevealClusterSlots({ t }: StepCtx) {
  const owner = (i: number) => (i < 20 ? 0 : i < 40 ? 1 : 2);
  const cols = [C.second, C.focus, C.latte];
  const kk = clamp(seg(t, 3.0, 3.6));
  const nn = clamp(seg(t, 3.8, 4.4));
  return (
    <Svg label="Redis Cluster's own key space, split into one fixed set of owned slots" h={240}>
      <Cell x={25} y={30} w={90} h={24} label="a key" o={easeOut(seg(t, 2.8, 3.1))} />
      {Array.from({ length: 60 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 9.17}
          y={70}
          width={7}
          height={26}
          fill={C.cocoa}
          stroke={i === 27 && kk >= 1 ? C.crema : cols[owner(i)]}
          strokeWidth={i === 27 && kk >= 1 ? 2.5 : 1}
          opacity={easeOut(seg(t, 0.2 + i * 0.012, 0.4 + i * 0.012))}
        />
      ))}
      {['node A', 'node B', 'node C'].map((n, i) => (
        <g key={n}>
          <Cell x={25 + i * 190} y={140} w={170} label={n} stroke={cols[i]} o={easeOut(seg(t, 1.2 + i * 0.3, 1.5 + i * 0.3))} />
          <line x1={25 + i * 183 + 91} y1={98} x2={110 + i * 190} y2={140} stroke={cols[i]} strokeWidth={1.2} opacity={easeOut(seg(t, 1.4 + i * 0.3, 1.7 + i * 0.3))} />
        </g>
      ))}
      <circle cx={lerp(115, 25 + 27 * 9.17 + 3.5, kk)} cy={lerp(42, 66, kk)} r={4} fill={C.crema} opacity={kk > 0 && kk < 1 ? 1 : 0} />
      <circle cx={lerp(25 + 27 * 9.17 + 3.5, 300, nn)} cy={lerp(98, 138, nn)} r={4} fill={C.focus} opacity={nn > 0 && nn < 1 ? 1 : 0} />
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 4.5, 4.9))}>
        one fixed set of slots, each owned by one node
      </T>
    </Svg>
  );
}

// 7 · Licensing. One line: BSD, then RSAL and SSPL, then AGPL added; at the switch a fork branches off as BSD-licensed Valkey.
export function RevealLicensing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const f = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="BSD, until a licensing move spun off a BSD-licensed fork, then a later release added AGPLv3" h={230}>
      <line x1={25} y1={90} x2={25 + 550 * a} y2={90} stroke={C.latte} strokeWidth={2} />
      <T x={120} y={74} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        BSD
      </T>
      <circle cx={230} cy={90} r={6} fill={C.cherryText} opacity={easeOut(seg(t, 1.4, 1.7))} />
      <T x={330} y={74} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>
        RSAL and SSPL
      </T>
      <path d={`M230 96 Q230 150 ${lerp(230, 330, f)} 150 H${lerp(330, 575, f)}`} fill="none" stroke={C.focus} strokeWidth={2} opacity={f > 0 ? 1 : 0} />
      <T x={260} y={178} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        Valkey: BSD, Linux Foundation
      </T>
      <circle cx={450} cy={90} r={6} fill={C.second} opacity={easeOut(seg(t, 3.9, 4.2))} />
      <T x={512} y={74} s={12} f={C.second} a="middle" o={easeOut(seg(t, 4.0, 4.3))}>
        + AGPL
      </T>
      <T x={25} y={218} s={12} f={C.latte} o={easeOut(seg(t, 4.8, 5.2))}>
        licensing is now part of the choice
      </T>
    </Svg>
  );
}

// 8 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one thread for speed, RDB vs AOF, replication's own loss window, fixed hash slots, a real licensing split" h={260}>
      <Row y={40} label="one thread" value="the speed itself" valueColor={C.focus} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="AOF" value="no snapshot gap" k={easeOut(seg(t, 1.3, 1.8))} />
      <Row y={140} label="async replication" value="can lose an ack" valueColor={C.cherryText} k={easeOut(seg(t, 2.3, 2.8))} />
      <Row y={190} label="Cluster" value="fixed, owned slots" k={easeOut(seg(t, 3.3, 3.8))} />
      <Row y={240} label="licensing" value="part of the choice" valueColor={C.second} k={easeOut(seg(t, 4.3, 4.8))} />
    </Svg>
  );
}

// 9 · Prove. RDB alone beside AOF with aggressive fsync; after the answer RDB is crossed and AOF lit.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a cache that must never lose an acknowledged write, even across a crash — change what?" h={220}>
      <Row y={40} label="never lose an ack" value="even on a crash" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="switch to" answer={answer} value="AOF, fsync aggressively" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={250} h={28} label="RDB snapshots alone" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cross x={255} y={132} k={a} />
      <Cell x={325} y={118} w={250} h={28} label="AOF, aggressive fsync" stroke={a > 0.5 ? C.focus : C.mocha} f={a > 0.5 ? C.focus : C.crema} o={easeOut(seg(t, 1.0, 1.3))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            slower, but nothing acknowledged is lost
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
