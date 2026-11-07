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

/** A doctor: a filled circle while on call, hollow once they've gone home. */
function Doc({ x, y, off, o = 1 }: { x: number; y: number; off: number; o?: number }) {
  return <circle cx={x} cy={y} r={18} fill={off > 0.5 ? C.cocoa : C.focus} stroke={off > 0.5 ? C.cherryText : C.focus} strokeWidth={2} opacity={o} />;
}

// 1 · Hook. Two doctors on call under a one-must-stay rule; each checks, goes home with a clean commit tick; none are left.
export function Hook({ t }: StepCtx) {
  const off = [easeOut(seg(t, 1.4, 1.7)), easeOut(seg(t, 2.0, 2.3))];
  return (
    <Svg label="two doctors, one rule, two clean commits. Zero doctors left on call." h={230}>
      <Row y={40} label="the rule" value="at least one on call" k={easeOut(seg(t, 0.2, 0.7))} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Doc x={200 + i * 200} y={105} off={off[i]} o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))} />
          <T x={200 + i * 200} y={150} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))}>
            {i === 0 ? 'doctor 1' : 'doctor 2'}
          </T>
          <MiniTick x={228 + i * 200} y={105} k={easeOut(seg(t, 1.7 + i * 0.6, 2.0 + i * 0.6))} />
        </g>
      ))}
      <Row y={205} label="doctors on call" value="0" valueColor={C.cherryText} k={easeOut(seg(t, 2.9, 3.4))} />
    </Svg>
  );
}

// 2 · The mechanism. A snapshot at the start; each read reaches back to it; another writer changes the row; the commit is crossed.
export function RevealSnapshotMechanism({ t }: StepCtx) {
  const lose = easeOut(seg(t, 3.6, 3.9));
  return (
    <Svg label="one fixed snapshot per transaction, taken at its own start." h={220}>
      <Lane y={70} name="T" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={140} name="other" o={easeOut(seg(t, 2.6, 2.9))} />
      <Ev x={70} y={70} label="snapshot" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Ev x={215 + i * 100} y={70} w={70} label="read" o={easeOut(seg(t, 1.0 + i * 0.5, 1.3 + i * 0.5))} />
          <path
            d={`M${250 + i * 100} 57 Q${(250 + i * 100 + 125) / 2} ${30 - i * 8} 125 57`}
            fill="none"
            stroke={C.focus}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={easeOut(seg(t, 1.2 + i * 0.5, 1.5 + i * 0.5))}
          />
        </g>
      ))}
      <Ev x={260} y={140} w={170} label="changes your row" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.1))} />
      <Ev x={440} y={70} w={110} label="commit?" stroke={lose > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 3.1, 3.4))} />
      <Cross x={495} y={70} k={lose} />
      <T x={495} y={108} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.8, 4.1))}>
        you lose
      </T>
    </Svg>
  );
}

// 3 · Predict. The same-row case is caught with a tick; the different-rows case waits on a question mark.
export function PredictTwoDoctorsOneRule({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="one row, caught. Two different rows, caught too?" h={200}>
      <Row y={40} label="first committer wins" value="on one row" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={66} w={250} h={28} label="the same row: caught" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={325} y={66} w={250} h={28} label="two different rows" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <AnswerRow y={140} label="also caught?" answer={answer} value="no" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="the check looks at one row at a time" />
    </Svg>
  );
}

// 4 · Read skew, prevented. The last topic's timeline again, but both of T1's reads reach back to one snapshot: 50 and 50.
export function RevealPreventsReadSkew({ t }: StepCtx) {
  return (
    <Svg label="topic 11's own scenario, rerun with a real snapshot." h={250}>
      <Lane y={60} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={120} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={75} y={60} w={120} label="read x = 50" o={easeOut(seg(t, 0.5, 0.8))} />
      <Ev x={215} y={120} w={170} label="x, y := 80, commit" stroke={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <Ev x={405} y={60} w={130} label="read y = 50" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))} />
      <path d="M470 47 Q300 10 135 47" fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.3, 2.6))} />
      <Row y={185} label="T1's pair" value="x = 50, y = 50" valueColor={C.focus} k={easeOut(seg(t, 2.7, 3.2))} />
      <T x={25} y={228} s={12} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        one snapshot, one point in time
      </T>
    </Svg>
  );
}

// 5 · A write-write conflict. Both start from one snapshot; T1 commits 110; T2's write to the same row is crossed out.
export function RevealCatchesWriteWriteConflict({ t }: StepCtx) {
  const fail = easeOut(seg(t, 2.6, 2.9));
  return (
    <Svg label="same row, same snapshot, both try to write." h={250}>
      <Lane y={60} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={120} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={75} y={60} label="snapshot" o={easeOut(seg(t, 0.3, 0.6))} />
      <Ev x={75} y={120} label="snapshot" o={easeOut(seg(t, 0.4, 0.7))} />
      <Ev x={250} y={60} w={120} label="commit 110" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))} />
      <Ev x={400} y={120} w={160} label="write the same row" stroke={fail > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 1.9, 2.2))} />
      <Cross x={480} y={120} k={fail} />
      <T x={480} y={156} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>
        serialization failure
      </T>
      <Row y={205} label="the balance" value="110 stands" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 6 · Write skew survives. Each doctor's write drops into its own row; each commit check passes; none are left on call.
export function RevealWriteSkewSurvives({ t }: StepCtx) {
  const w = [easeInOut(seg(t, 1.0, 1.5)), easeInOut(seg(t, 1.6, 2.1))];
  return (
    <Svg label="the hook's own doctors, reproduced for real." h={250}>
      <Row y={40} label="both read on call" value="2" k={easeOut(seg(t, 0.2, 0.7))} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Cell
            x={25 + i * 300}
            y={110}
            w={250}
            h={28}
            label={i === 0 ? "doctor 1's row" : "doctor 2's row"}
            stroke={w[i] > 0.98 ? C.cherryText : C.mocha}
            o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))}
          />
          <circle cx={150 + i * 300} cy={lerp(66, 104, w[i])} r={6} fill={C.second} opacity={w[i] > 0 && w[i] < 1 ? 1 : 0} />
          <MiniTick x={250 + i * 300} y={150} k={easeOut(seg(t, 2.3 + i * 0.4, 2.6 + i * 0.4))} />
        </g>
      ))}
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.3, 2.6))}>
        each commit check passes
      </T>
      <Row y={205} label="doctors on call" value="0" valueColor={C.cherryText} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 7 · Vendor naming. Each vendor's level name points across to what it really is; MySQL's lands last, mixing two kinds of read.
export function RevealVendorNamingTraps({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['Postgres: Repeatable Read', 'snapshot isolation', 0.5],
    ['Oracle: Serializable', 'snapshot isolation', 2.0],
    ['MySQL: Repeatable Read', 'mixes two read kinds', 3.3],
  ];
  return (
    <Svg label="three vendors, three names for the same mechanism." h={210}>
      {rows.map(([l, v, a], i) => (
        <g key={l}>
          <Cell x={25} y={40 + i * 52} w={250} h={30} label={l} o={easeOut(seg(t, a, a + 0.3))} />
          <path d={`M282 ${55 + i * 52} h${50 * easeOut(seg(t, a + 0.3, a + 0.7))}`} stroke={C.focus} strokeWidth={2} />
          <Cell x={340} y={40 + i * 52} w={235} h={30} label={v} stroke={i === 2 ? C.cherryText : C.focus} f={i === 2 ? C.cherryText : C.focus} o={easeOut(seg(t, a + 0.6, a + 0.9))} />
        </g>
      ))}
    </Svg>
  );
}

// 8 · Predict #2. Same level, the two doctors' rows; after the answer a shared row appears between them.
export function PredictFixWithoutChangingLevels({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="same isolation level. Any fix at all, without raising it?" h={200}>
      <Row y={40} label="the isolation level" value="unchanged" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={66} w={170} h={28} label="doctor 1's row" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={405} y={66} w={170} h={28} label="doctor 2's row" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={215} y={66} w={170} h={28} label="a shared row" stroke={C.focus} f={C.focus} o={a} />
      <AnswerRow y={140} label="a fix anyway?" answer={answer} value="yes, collide them" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="give both a row to collide on" />
    </Svg>
  );
}

// 9 · Materializing the conflict. Both lock one shared row: T2 is caught. Then a different query slips past it underneath.
export function RevealMaterializingConflict({ t }: StepCtx) {
  const g = easeInOut(seg(t, 2.8, 3.5));
  return (
    <Svg label="a real lock on a shared row, for this one case." h={250}>
      <Cell x={175} y={40} w={250} h={28} label="a shared row, locked" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={25} y={96} w={200} h={26} label="T1: FOR UPDATE" o={easeOut(seg(t, 0.6, 0.9))} />
      <path d="M125 96 L230 68" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.9, 1.1))} />
      <Cell x={375} y={96} w={200} h={26} label="T2: FOR UPDATE" stroke={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))} />
      <path d="M475 96 L370 68" stroke={C.cherryText} strokeWidth={1.5} opacity={easeOut(seg(t, 1.5, 1.7))} />
      <T x={475} y={140} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        caught
      </T>
      <Cell x={25} y={152} w={200} h={26} label="a different query" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.5, 2.8))} />
      <line x1={230} y1={165} x2={230 + 340 * g} y2={165} stroke={C.cherryText} strokeWidth={2} strokeDasharray="6 4" />
      <T x={330} y={190} s={11} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.7))}>
        the same gap, reopened
      </T>
      <Row y={230} label="the fix covers" value="this case only" k={easeOut(seg(t, 3.8, 4.3))} />
    </Svg>
  );
}

// 10 · Recap. Four rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one mechanism, two anomalies prevented, one that survives." h={240}>
      <Row y={40} label="mechanism" value="snapshot, first-committer-wins" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={95} label="prevented" value="read skew, lost update" valueColor={C.focus} k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="survives" value="write skew" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={205} label="vendors" value="three names, one thing" k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 11 · Prove. One shared total, two separate rows; after the answer both rows light red: no row in common, write skew.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="shared read, separate writes, no error from either commit." h={220}>
      <Row y={40} label="both commits" value="no error" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the outcome" answer={answer} value="write skew" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={170} h={26} label="T1's own row" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={215} y={118} w={170} h={26} label="shared total" stroke={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={405} y={118} w={170} h={26} label="T2's own row" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 1.0, 1.3))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            a shared total, disjoint writes
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
