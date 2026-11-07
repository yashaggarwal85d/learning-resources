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
/** One transaction's timeline: its name on the left and a thin line running right; events sit on it as cells. */
function Lane({ y, name, o = 1 }: { y: number; name: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 5} s={13} f={C.latte}>
        {name}
      </T>
      <line x1={60} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane, centred on the lane's line. */
function Ev({ x, y, w = 110, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return <Cell x={x} y={y - 13} w={w} h={26} label={label} o={o} stroke={stroke} f={f} />;
}

/** A session: a circle with its name inside, `f` colouring its edge. */
function Node({ x, y, label, o = 1, f = C.latte, r = 24 }: { x: number; y: number; label: string; o?: number; f?: string; r?: number }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={C.cocoa} stroke={f} strokeWidth={2} />
      <T x={x} y={y + 4.5} s={12} f={C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}

// 1 · Hook. S1 holds row 1, S2 holds row 2; each then reaches with a dashed red line for the other's row, closing a cycle.
export function Hook({ t }: StepCtx) {
  const w1 = easeOut(seg(t, 1.8, 2.3));
  const w2 = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="two sessions, each holding what the other wants." h={230}>
      <Node x={100} y={110} label="S1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Node x={500} y={110} label="S2" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={240} y={40} w={120} label="row 1" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={240} y={152} w={120} label="row 2" o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={122} y1={98} x2={240} y2={58} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, 0.7, 1.0))} />
      <line x1={478} y1={122} x2={360} y2={166} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, 1.1, 1.4))} />
      <line x1={122} y1={122} x2={122 + 118 * w1} y2={122 + 44 * w1} stroke={C.cherryText} strokeWidth={2} strokeDasharray="6 4" />
      <line x1={478} y1={98} x2={478 - 118 * w2} y2={98 - 40 * w2} stroke={C.cherryText} strokeWidth={2} strokeDasharray="6 4" />
      <T x={300} y={115} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        solid: holds · dashed: wants
      </T>
      <T x={300} y={218} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        neither moves, no error yet
      </T>
    </Svg>
  );
}

// 2 · Lock modes. Bars rise left to right, one per real table-lock mode; the tallest, ACCESS EXCLUSIVE, turns red.
export function RevealLockModes({ t }: StepCtx) {
  return (
    <Svg label="from blocking one write, to blocking every read." h={220}>
      {Array.from({ length: 8 }, (_, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.25, 0.7 + i * 0.25));
        const h = (20 + i * 14) * k;
        return <rect key={i} x={60 + i * 62} y={170 - h} width={44} height={h} rx={3} fill={i === 7 ? C.cherryText : C.cocoa} stroke={i === 7 ? C.cherryText : C.latte} strokeWidth={1.5} />;
      })}
      <T x={575} y={36} s={12} f={C.cherryText} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        ACCESS EXCLUSIVE
      </T>
      <T x={25} y={198} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        blocks only a write
      </T>
      <T x={575} y={198} s={12} f={C.cherryText} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        blocks even a read
      </T>
    </Svg>
  );
}

// 3 · Intention locks. T1 marks intent on the table's header first, then locks one row; a table-lock request checks only the header.
export function RevealIntentionLocks({ t }: StepCtx) {
  const hdr = easeOut(seg(t, 0.9, 1.2));
  const row = easeOut(seg(t, 1.6, 1.9));
  const chk = easeOut(seg(t, 2.6, 2.9));
  return (
    <Svg label="intent, marked at the table level first." h={240}>
      <Cell x={25} y={50} w={90} label="T1" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={150} y={50} w={300} label="the table's intent flag" stroke={hdr > 0.5 ? C.focus : C.mocha} f={hdr > 0.5 ? C.focus : C.crema} o={easeOut(seg(t, 0.3, 0.6))} />
      {Array.from({ length: 18 }, (_, i) => (
        <rect
          key={i}
          x={150 + (i % 6) * 51}
          y={92 + Math.floor(i / 6) * 24}
          width={45}
          height={18}
          rx={2}
          fill={i === 7 && row > 0.5 ? C.focus : C.cocoa}
          stroke={C.mocha}
          strokeWidth={1}
          opacity={easeOut(seg(t, 0.4, 0.7))}
        />
      ))}
      <Cell x={470} y={50} w={105} label="table lock?" stroke={C.second} o={easeOut(seg(t, 2.2, 2.5))} />
      <path d="M470 64 h-14" stroke={C.second} strokeWidth={2} opacity={chk} />
      <MiniTick x={515} y={98} k={chk} f={C.second} />
      <Row y={210} label="checked" value="one flag, no row scan" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 4 · Predict. A field of tiny row locks fills in; the answer: no, past a point they force escalation.
export function PredictFinerAlwaysBetter({ t, answer }: StepCtx) {
  return (
    <Svg label="finest granularity, most concurrency. Always the right call?" h={200}>
      <Row y={40} label="row locks" value="most concurrency" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 40 }, (_, i) => (
        <rect
          key={i}
          x={25 + (i % 20) * 28}
          y={64 + Math.floor(i / 20) * 18}
          width={22}
          height={12}
          rx={2}
          fill={C.cocoa}
          stroke={answer !== null ? C.cherryText : C.latte}
          strokeWidth={1}
          opacity={easeOut(seg(t, 0.4 + i * 0.02, 0.6 + i * 0.02))}
        />
      ))}
      <AnswerRow y={140} label="always better?" answer={answer} value="no, a trade-off" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} text="a pile of tiny locks forces escalation" />
    </Svg>
  );
}

// 5 · The real deadlock. Each session locks its row, then waits on the other's; the monitor crosses S2 and S1 commits.
export function RevealDeadlockForReal({ t }: StepCtx) {
  const w = easeInOut(seg(t, 1.4, 2.4));
  const x = easeOut(seg(t, 2.5, 2.8));
  return (
    <Svg label="the hook's own two sessions, reproduced for real." h={240}>
      <Lane y={55} name="S1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={120} name="S2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={65} y={55} w={100} label="row 1" o={easeOut(seg(t, 0.3, 0.6))} />
      <Ev x={65} y={120} w={100} label="row 2" o={easeOut(seg(t, 0.5, 0.8))} />
      <Ev x={180} y={55} w={110} label="wants row 2" o={easeOut(seg(t, 0.9, 1.2))} />
      <Ev x={180} y={120} w={110} label="wants row 1" o={easeOut(seg(t, 1.1, 1.4))} />
      <line x1={295} y1={55} x2={295 + 135 * w} y2={55} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <line x1={295} y1={120} x2={295 + 135 * w} y2={120} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <Cross x={445} y={120} k={x} />
      <T x={445} y={156} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.7, 3.0))}>
        deadlock detected
      </T>
      <Ev x={440} y={55} w={110} label="commits" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))} />
      <Row y={210} label="caught after" value="at least 0.8 s" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 6 · Two philosophies. Left: a cycle forms, a wait bar fills, then one node is crossed. Right: priority decides at once.
export function RevealDetectionVsPrevention({ t }: StepCtx) {
  const c = easeOut(seg(t, 0.6, 1.3));
  const wb = easeInOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="wait and check, or decide from priority first." h={210}>
      <T x={25} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        detection
      </T>
      <Node x={70} y={100} label="A" o={easeOut(seg(t, 0.3, 0.6))} r={20} />
      <Node x={230} y={100} label="B" o={easeOut(seg(t, 0.3, 0.6))} r={20} />
      <path d="M90 92 Q150 66 210 92 M210 108 Q150 134 90 108" fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="160" strokeDashoffset={160 * (1 - c)} />
      <rect x={50} y={142} width={200 * wb} height={10} rx={3} fill={C.second} />
      <Cross x={230} y={100} k={easeOut(seg(t, 2.3, 2.6))} />
      <T x={25} y={185} s={12} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        waits, then checks
      </T>
      <T x={325} y={40} s={13} f={C.crema} o={easeOut(seg(t, 2.8, 3.1))}>
        prevention
      </T>
      <Node x={370} y={100} label="high" o={easeOut(seg(t, 2.9, 3.2))} r={20} f={C.focus} />
      <Node x={530} y={100} label="low" o={easeOut(seg(t, 2.9, 3.2))} r={20} />
      <Cross x={530} y={100} k={easeOut(seg(t, 3.4, 3.7))} />
      <T x={325} y={185} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
        decides before a cycle
      </T>
    </Svg>
  );
}

// 7 · Consistent order. Both sessions take row 1 then row 2; S2 waits its turn instead of deadlocking; five rounds, zero deadlocks.
export function RevealConsistentOrder({ t }: StepCtx) {
  const w = easeInOut(seg(t, 1.0, 1.8));
  return (
    <Svg label="same contention, same order every time." h={240}>
      <Lane y={55} name="S1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={115} name="S2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={65} y={55} w={90} label="row 1" o={easeOut(seg(t, 0.3, 0.6))} />
      <Ev x={165} y={55} w={90} label="row 2" o={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={65} y1={115} x2={65 + 195 * w} y2={115} stroke={C.second} strokeWidth={3} strokeDasharray="6 4" />
      <Ev x={265} y={115} w={90} label="row 1" stroke={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
      <Ev x={365} y={115} w={90} label="row 2" stroke={C.focus} o={easeOut(seg(t, 2.0, 2.3))} />
      <Row y={175} label="rounds, same order" value="5" k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={220} label="deadlocks" value="0" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 8 · Lock escalation. Row locks stream in by the dozen, then collapse into one coarse lock on the whole table.
export function RevealLockEscalation({ t }: StepCtx) {
  const c = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="thousands of fine-grained locks, traded for one." h={230}>
      <T x={25} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        one statement, thousands of row locks
      </T>
      {Array.from({ length: 72 }, (_, i) => {
        const x0 = 25 + (i % 24) * 23;
        const y0 = 60 + Math.floor(i / 24) * 20;
        return (
          <rect
            key={i}
            x={lerp(x0, 290, c)}
            y={lerp(y0, 95, c)}
            width={17}
            height={12}
            rx={2}
            fill={C.cocoa}
            stroke={C.latte}
            strokeWidth={1}
            opacity={easeOut(seg(t, 0.4 + i * 0.022, 0.6 + i * 0.022)) * (1 - c)}
          />
        );
      })}
      <Cell x={150} y={78} w={300} h={34} label="one lock, the whole table" stroke={C.cherryText} f={C.cherryText} o={c} />
      <Row y={200} label="SQL Server and Db2" value="both escalate" valueColor={C.cherryText} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · The migration hazard. The DDL session holds ACCESS EXCLUSIVE; a plain SELECT waits on a dashed line the whole time.
export function RevealMigrationHazard({ t }: StepCtx) {
  const h = easeInOut(seg(t, 0.6, 2.2));
  return (
    <Svg label="the DDL lock level, held briefly. A read, blocked that whole time." h={240}>
      <Lane y={55} name="DDL" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={120} name="read" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={70} y={55} w={170} label="ACCESS EXCLUSIVE" stroke={C.cherryText} o={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={245} y={49} width={155 * h} height={12} rx={3} fill={C.cherryText} opacity={h > 0 ? 0.85 : 0} />
      <Ev x={405} y={55} w={80} label="done" o={easeOut(seg(t, 2.2, 2.5))} />
      <Ev x={150} y={120} w={90} label="SELECT" o={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={245} y1={120} x2={245 + 160 * h} y2={120} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <Ev x={420} y={120} w={80} label="runs" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))} />
      <Row y={200} label="the read blocked" value="at least 0.25 s" valueColor={C.cherryText} k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 10 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="lock modes, a deadlock caught, one avoided, one hazard measured." h={260}>
      <Row y={40} label="lock modes" value="a write, up to everything" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="a deadlock" value="caught by the monitor" k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={140} label="same order" value="zero deadlocks" valueColor={C.focus} k={easeOut(seg(t, 1.9, 2.4))} />
      <Row y={190} label="two philosophies" value="detect, or prevent" k={easeOut(seg(t, 2.7, 3.2))} />
      <Row y={240} label="ACCESS EXCLUSIVE" value="stalls every read" valueColor={C.cherryText} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 11 · Prove. The ALTER's lock bar stretches long under an expensive default; after the answer, reads and writes are both crossed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="an ALTER TABLE, an expensive default, a busy table." h={220}>
      <Row y={40} label="ALTER TABLE" value="an expensive default" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="blocked" answer={answer} value="every read and write" k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={118} width={330 * easeOut(seg(t, 0.8, 1.8))} height={14} rx={3} fill={C.cherryText} />
      <Cell x={375} y={112} w={90} h={26} label="reads" o={easeOut(seg(t, 1.0, 1.3))} stroke={a > 0.5 ? C.cherryText : C.mocha} />
      <Cell x={485} y={112} w={90} h={26} label="writes" o={easeOut(seg(t, 1.1, 1.4))} stroke={a > 0.5 ? C.cherryText : C.mocha} />
      <Cross x={420} y={152} k={a} />
      <Cross x={530} y={152} k={a} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            for the whole statement, slow part too
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
