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

// 1 · Hook. Two transactions each commit cleanly with a tick; no error appears, and ten dollars is missing anyway.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two commits, no errors. Ten dollars, gone anyway." h={240}>
      <Lane y={70} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={125} name="T2" o={easeOut(seg(t, 0.2, 0.5))} />
      <Ev x={200} y={70} label="commit" o={easeOut(seg(t, 0.6, 0.9))} />
      <MiniTick x={318} y={70} k={easeOut(seg(t, 0.9, 1.2))} />
      <Ev x={380} y={125} label="commit" o={easeOut(seg(t, 1.2, 1.5))} />
      <MiniTick x={498} y={125} k={easeOut(seg(t, 1.5, 1.8))} />
      <Row y={180} label="errors raised" value="none" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={222} label="ten dollars" value="gone anyway" valueColor={C.cherryText} k={easeOut(seg(t, 2.9, 3.4))} />
    </Svg>
  );
}

// 2 · ANSI's four phenomena, each landing with its pattern in Berenson's notation, in the narration's order.
export function RevealAnsiVocabulary({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['dirty write', 'w1[x] … w2[x]'],
    ['dirty read', 'w1[x] … r2[x]'],
    ['non-repeatable read', 'r1[x] … w2[x]'],
    ['phantom', 'r1[P] … w2[y in P]'],
  ];
  return (
    <Svg label="four named phenomena, stated precisely by ANSI SQL-92." h={240}>
      {rows.map(([l, v], i) => (
        <Row key={l} y={40 + i * 55} label={l} value={v} valueColor={i % 2 ? C.second : C.focus} k={easeOut(seg(t, 0.9 + i * 0.55, 1.3 + i * 0.55))} />
      ))}
    </Svg>
  );
}

// 3 · Predict. One sentence handed to two engineers; after the answer their two cells take two different colours.
export function PredictSameRuleSameWay({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="two engineers, one English sentence. Same rule, or two different ones?" h={200}>
      <Row y={40} label="one English sentence" value="dirty read" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={66} w={250} h={28} label="engineer one's check" o={easeOut(seg(t, 0.5, 0.8))} stroke={a > 0.5 ? C.focus : C.mocha} />
      <Cell x={325} y={66} w={250} h={28} label="engineer two's check" o={easeOut(seg(t, 0.8, 1.1))} stroke={a > 0.5 ? C.second : C.mocha} />
      <AnswerRow y={140} label="the same rule?" answer={answer} value="no, two rules" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="the sentence supports both readings" />
    </Svg>
  );
}

// 4 · Two readings. The narrow one crosses out r2 only once T1 aborts; the broad one crosses it out while T1 is still undecided.
export function RevealAmbiguityExposed({ t }: StepCtx) {
  return (
    <Svg label="the same sentence, two defensible readings — different rules." h={240}>
      <T x={25} y={81} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        narrow
      </T>
      <Ev x={110} y={76} w={90} label="w1[x]" o={easeOut(seg(t, 0.4, 0.7))} />
      <Ev x={230} y={76} w={90} label="r2[x]" o={easeOut(seg(t, 0.7, 1.0))} />
      <Ev x={350} y={76} w={150} label="T1 aborts" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))} />
      <Cross x={275} y={76} k={easeOut(seg(t, 1.6, 1.9))} />
      <T x={25} y={141} s={13} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        broad
      </T>
      <Ev x={110} y={136} w={90} label="w1[x]" o={easeOut(seg(t, 2.2, 2.5))} />
      <Ev x={230} y={136} w={90} label="r2[x]" o={easeOut(seg(t, 2.5, 2.8))} />
      <Ev x={350} y={136} w={150} label="T1 undecided" o={easeOut(seg(t, 2.6, 2.9))} />
      <Cross x={275} y={136} k={easeOut(seg(t, 3.0, 3.3))} />
      <Row y={205} label="same sentence" value="two rules" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 5 · Lost update. Both read 100; T1 commits 110; T2, reading the same stale 100, commits 120 after it, and T1's commit is crossed.
export function RevealLostUpdate({ t }: StepCtx) {
  const lost = easeOut(seg(t, 3.0, 3.3));
  return (
    <Svg label="a real forced timeline against a real Postgres table." h={250}>
      <Lane y={60} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={120} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={75} y={60} label="read 100" o={easeOut(seg(t, 0.4, 0.7))} />
      <Ev x={300} y={60} label="commit 110" stroke={lost > 0.5 ? C.cherryText : C.focus} o={easeOut(seg(t, 0.9, 1.2))} />
      <Cross x={355} y={60} k={lost} />
      <Ev x={185} y={120} label="read 100" stroke={C.cherryText} o={easeOut(seg(t, 1.5, 1.8))} />
      <T x={240} y={150} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.7, 2.0))}>
        already stale
      </T>
      <Ev x={430} y={120} label="commit 120" stroke={C.second} o={easeOut(seg(t, 2.2, 2.5))} />
      <Row y={195} label="final balance" value="120" valueColor={C.second} k={easeOut(seg(t, 2.6, 3.0))} />
      <T x={25} y={234} s={12} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        T1's own +10, gone
      </T>
    </Svg>
  );
}

// 6 · Read skew. T1 reads x = 50; T2 sets both to 80 and commits; T1 reads y = 80 — a pair that never existed together.
export function RevealReadWriteSkew({ t }: StepCtx) {
  return (
    <Svg label="one transaction, two reads, an inconsistent pair." h={250}>
      <Lane y={60} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={120} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={75} y={60} w={120} label="read x = 50" o={easeOut(seg(t, 0.4, 0.7))} />
      <Ev x={215} y={120} w={170} label="x, y := 80, commit" stroke={C.second} o={easeOut(seg(t, 0.9, 1.2))} />
      <Ev x={405} y={60} w={130} label="read y = 80" stroke={C.cherryText} o={easeOut(seg(t, 1.5, 1.8))} />
      <Row y={185} label="T1's pair" value="x = 50, y = 80" valueColor={C.cherryText} k={easeOut(seg(t, 2.1, 2.6))} />
      <T x={25} y={228} s={12} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        write skew: the same gap, two writers
      </T>
    </Svg>
  );
}

// 7 · Dirty write, blocked. T1 writes and holds the row; T2's write waits along a dashed line until T1 commits, then applies.
export function RevealDirtyWriteBlocked({ t }: StepCtx) {
  const h = easeInOut(seg(t, 1.2, 2.6));
  return (
    <Svg label="a second writer to the same row, measured." h={250}>
      <Lane y={60} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={130} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={70} y={60} w={90} label="write" o={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={165} y={54} width={265 * h} height={12} rx={3} fill={C.second} opacity={h > 0 ? 0.85 : 0} />
      <T x={170} y={92} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.5))}>
        holds the row
      </T>
      <Ev x={435} y={60} w={90} label="commit" o={easeOut(seg(t, 2.6, 2.9))} />
      <Ev x={165} y={130} w={90} label="write" o={easeOut(seg(t, 0.9, 1.2))} />
      <line x1={260} y1={130} x2={260 + 175 * h} y2={130} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <T x={265} y={160} s={11} f={C.cherryText} o={easeOut(seg(t, 1.4, 1.7))}>
        waits
      </T>
      <Ev x={445} y={130} w={110} label="applies" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.9, 3.2))} />
      <Row y={210} label="T2 blocked for" value="at least 0.25 s" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · Predict #2. A reader with no writes beside a state marked with a question; the answer: yes, it can be impossible.
export function PredictReadOnlyAnomaly({ t, answer }: StepCtx) {
  return (
    <Svg label="a transaction that only reads. Can it still see an impossible state?" h={200}>
      <Row y={40} label="its own writes" value="none" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={66} w={220} h={28} label="a read-only transaction" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={325} y={66} w={250} h={28} label="the state it sees" stroke={answer !== null ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <AnswerRow y={140} label="impossible state?" answer={answer} value="yes, it can be" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="what it's handed can be impossible" />
    </Svg>
  );
}

// 9 · The read-only anomaly. Every serial order of the others is checked against the reader's answer; each gets a cross.
export function RevealReadOnlyAnomaly({ t }: StepCtx) {
  return (
    <Svg label="a reader, no writes of its own, sees an impossible state." h={250}>
      <Row y={40} label="every serial order" value="checked" k={easeOut(seg(t, 0.2, 0.7))} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={25} y={66 + i * 38} w={160} h={26} label="one serial order" o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))} />
          <line x1={190} y1={79 + i * 38} x2={325} y2={117} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 1.3 + i * 0.5, 1.6 + i * 0.5))} />
          <Cross x={258} y={(79 + i * 38 + 117) / 2} k={easeOut(seg(t, 1.6 + i * 0.5, 1.9 + i * 0.5))} />
        </g>
      ))}
      <Cell x={330} y={103} w={245} h={28} label="the reader's answer" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))} />
      <Row y={200} label="reached by any order" value="none" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
      <T x={25} y={238} s={12} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        and it never touched the data
      </T>
    </Svg>
  );
}

// 10 · Adya's graph. Two transactions as nodes; a dependency arc each way draws in, and the closed cycle turns red: an anomaly.
export function RevealAdyaFormalization({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.0, 1.8));
  const b = easeOut(seg(t, 2.0, 2.8));
  const cyc = b > 0.98 ? 1 : 0;
  const nf = cyc ? C.cherryText : C.focus;
  return (
    <Svg label="a dependency graph between transactions, not an English sentence." h={240}>
      <Row y={40} label="instead of English" value="a graph" k={easeOut(seg(t, 0.2, 0.7))} />
      <path d="M210 105 Q300 62 390 105" fill="none" stroke={C.second} strokeWidth={2} strokeDasharray="220" strokeDashoffset={220 * (1 - a)} />
      <path d="M390 141 Q300 184 210 141" fill="none" stroke={C.second} strokeWidth={2} strokeDasharray="220" strokeDashoffset={220 * (1 - b)} />
      <circle cx={180} cy={123} r={24} fill={C.cocoa} stroke={nf} strokeWidth={2} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={180} y={128} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        T1
      </T>
      <circle cx={420} cy={123} r={24} fill={C.cocoa} stroke={nf} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={420} y={128} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        T2
      </T>
      <path d="M390 105 l-12 -2 m12 2 l-5 -11" stroke={C.second} strokeWidth={2} opacity={a > 0.95 ? 1 : 0} />
      <path d="M210 141 l12 2 m-12 -2 l5 11" stroke={C.second} strokeWidth={2} opacity={cyc} />
      <Row y={215} label="an anomaly" value="a cycle, checkable" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 11 · Recap. Four rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="eight anomalies, one ambiguity, one graph that made each one checkable." h={240}>
      <Row y={40} label="named precisely" value="eight anomalies" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={95} label="why they slipped" value="ambiguous English" valueColor={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={150} label="the fix" value="a dependency graph" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={205} label="an anomaly" value="a cycle in it" k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 12 · Prove. Two doctors on call; T1 and T2 each take one off; after the answer both go dark, each crossed by a different writer.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const off = [easeOut(seg(t, 1.2, 1.6)), easeOut(seg(t, 1.8, 2.2))];
  return (
    <Svg label="two independent commits, a shared invariant broken across both. Which anomaly?" h={220}>
      <Row y={40} label="doctors on call" value="2, then 0" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the anomaly" answer={answer} value="write skew" k={easeOut(seg(t, 0.4, 0.9))} />
      {[0, 1].map((i) => (
        <g key={i}>
          <circle cx={240 + i * 120} cy={135} r={12} fill={off[i] > 0.5 ? C.cocoa : C.focus} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
          <T x={240 + i * 120 + 22} y={140} s={12} f={C.latte} o={off[i]}>
            {i === 0 ? 'T1' : 'T2'}
          </T>
        </g>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            each wrote a different part
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
