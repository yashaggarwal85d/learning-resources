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

/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}

/** The coordinator on top and its two participants below, as in every step of this topic; `pf` colours the participants' edges. */
function TwoPC({ o = 1, cf = C.latte, pf = C.mocha, py = 150 }: { o?: number; cf?: string; pf?: string; py?: number }) {
  return (
    <g opacity={o}>
      <Cell x={200} y={40} w={200} label="coordinator" stroke={cf} />
      <Cell x={25} y={py} w={200} label="inventory" stroke={pf} />
      <Cell x={375} y={py} w={200} label="payments" stroke={pf} />
    </g>
  );
}

/** A message dot travelling between the coordinator and both participants: down when `up` is false. */
function Msgs({ p, up = false, f = C.focus, py = 150 }: { p: number; up?: boolean; f?: string; py?: number }) {
  const q = up ? 1 - p : p;
  return (
    <g opacity={p > 0 && p < 1 ? 1 : 0}>
      <circle cx={lerp(270, 125, q)} cy={lerp(68, py, q)} r={5} fill={f} />
      <circle cx={lerp(330, 475, q)} cy={lerp(68, py, q)} r={5} fill={f} />
    </g>
  );
}

/** The two links from the coordinator down to each participant. */
function Links({ o, py = 150 }: { o: number; py?: number }) {
  return (
    <g opacity={o} stroke={C.mocha} strokeWidth={1.5}>
      <line x1={270} y1={68} x2={125} y2={py} />
      <line x1={330} y1={68} x2={475} y2={py} />
    </g>
  );
}

// 1 · Hook. One order reaches down to two databases; a dashed network line joins them; both commit, or neither.
export function Hook({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="two databases, one order. Both commit, or neither." h={230}>
      <Cell x={225} y={40} w={150} label="one order" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={25} y={110} w={200} label="inventory database" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={375} y={110} w={200} label="payments database" o={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={270} y1={68} x2={lerp(270, 140, l)} y2={lerp(68, 110, l)} stroke={C.focus} strokeWidth={1.5} />
      <line x1={330} y1={68} x2={lerp(330, 460, l)} y2={lerp(68, 110, l)} stroke={C.focus} strokeWidth={1.5} />
      <path d="M230 124 q17 -10 35 0 t35 0 t35 0 t35 0 t10 0" fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={300} y={160} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        a network in between
      </T>
      <Row y={205} label="both commit" value="or neither" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 2 · Phase 1. "Prepare?" travels down; each participant logs durably; then "yes" travels back up from both.
export function RevealPhaseOnePrepare({ t }: StepCtx) {
  return (
    <Svg label="prepare asks a guarantee, not a promise to try." h={230}>
      <TwoPC o={easeOut(seg(t, 0.1, 0.4))} pf={t > 1.9 ? C.second : C.mocha} />
      <Links o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={300} y={110} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        prepare?
      </T>
      <Msgs p={clamp(seg(t, 0.6, 1.4))} />
      <T x={125} y={202} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.6, 1.9))}>
        recorded durably
      </T>
      <T x={475} y={202} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        recorded durably
      </T>
      <Msgs p={clamp(seg(t, 2.4, 3.2))} up />
      <T x={175} y={100} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
        yes
      </T>
      <T x={425} y={100} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.5))}>
        yes
      </T>
    </Svg>
  );
}

// 3 · Phase 2. Both yeses in; the coordinator logs its own decision first; only then does "commit" travel down, and both tick.
export function RevealPhaseTwoCommit({ t }: StepCtx) {
  const done = easeOut(seg(t, 2.8, 3.1));
  return (
    <Svg label="the decision is recorded first, the order comes after." h={230}>
      <TwoPC o={easeOut(seg(t, 0.1, 0.4))} cf={t > 1.0 ? C.focus : C.latte} pf={done > 0.5 ? C.focus : C.second} />
      <Links o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={175} y={100} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        yes
      </T>
      <T x={425} y={100} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        yes
      </T>
      <T x={415} y={59} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        decision logged
      </T>
      <T x={300} y={110} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 1.7, 2.0))}>
        commit
      </T>
      <Msgs p={clamp(seg(t, 1.8, 2.6))} />
      <MiniTick x={205} y={158} k={done} />
      <MiniTick x={555} y={158} k={done} />
      <Row y={215} label="the decision" value="logged before it's sent" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · Predict. The coordinator falls silent with a cross; both participants sit prepared. The answer: they wait.
export function PredictCoordinatorSilent({ t, answer }: StepCtx) {
  return (
    <Svg label="both said yes. Then the coordinator goes silent." h={200}>
      <Cell x={225} y={34} w={150} h={26} label="coordinator" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cross x={388} y={47} k={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={25} y={78} w={250} h={28} label="inventory: prepared" stroke={C.second} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={325} y={78} w={250} h={28} label="payments: prepared" stroke={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <AnswerRow y={140} label="the participants" answer={answer} value="wait, prepared" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a promise can't be guessed away" />
    </Svg>
  );
}

// 5 · Prepared, for real. S1 prepares and disconnects; S2 still sees "before"; S3, a stranger to it, commits it.
export function RevealPreparedForReal({ t }: StepCtx) {
  return (
    <Svg label="prepared, invisible, until a different session commits." h={240}>
      <Lane y={50} name="S1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={105} name="S2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={160} name="S3" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={70} y={50} w={100} label="PREPARE" stroke={C.second} o={easeOut(seg(t, 0.4, 0.7))} />
      <Ev x={180} y={50} w={120} label="disconnects" o={0.7 * easeOut(seg(t, 0.9, 1.2))} />
      <Ev x={200} y={105} w={140} label="sees 'before'" o={easeOut(seg(t, 1.6, 1.9))} />
      <Ev x={330} y={160} w={180} label="COMMIT PREPARED" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))} />
      <Row y={215} label="now visible" value="the prepared change" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 6 · Still holding its locks. The prepared transaction's hold bar runs on, unresolved; a second writer waits beneath it.
export function RevealHoldsLocks({ t }: StepCtx) {
  const h = easeInOut(seg(t, 0.6, 3.0));
  const w = easeInOut(seg(t, 1.3, 3.0));
  return (
    <Svg label="a prepared transaction still holds its row." h={230}>
      <Lane y={60} name="prep." o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={130} name="writer" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={75} y={60} w={100} label="prepared" stroke={C.second} o={easeOut(seg(t, 0.3, 0.6))} />
      <Lock x={182} y={34} k={easeOut(seg(t, 0.5, 0.8))} />
      <rect x={180} y={54} width={385 * h} height={12} rx={3} fill={C.second} opacity={h > 0 ? 0.85 : 0} />
      <Ev x={180} y={130} w={160} label="UPDATE that row" o={easeOut(seg(t, 1.0, 1.3))} />
      <line x1={345} y1={130} x2={345 + 220 * w} y2={130} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <T x={345} y={160} s={11} f={C.cherryText} o={easeOut(seg(t, 1.5, 1.8))}>
        waits
      </T>
      <Row y={205} label="the writer waited" value="at least 0.25 s" valueColor={C.cherryText} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 7 · In doubt. The coordinator is gone; both participants keep their locks; an in-doubt bar grows with no end in sight.
export function RevealInDoubtNamed({ t }: StepCtx) {
  const g = easeInOut(seg(t, 1.6, 3.4));
  return (
    <Svg label="locks held, nothing resolved, until someone steps in." h={240}>
      <TwoPC o={easeOut(seg(t, 0.1, 0.4))} pf={C.second} py={110} />
      <Cross x={412} y={54} k={easeOut(seg(t, 0.5, 0.8))} />
      <Lock x={232} y={118} k={easeOut(seg(t, 1.0, 1.3))} />
      <Lock x={352} y={118} k={easeOut(seg(t, 1.2, 1.5))} />
      <T x={25} y={170} s={12} f={C.latte} o={easeOut(seg(t, 1.5, 1.8))}>
        in doubt
      </T>
      <rect x={100} y={160} width={470 * g} height={12} rx={3} fill={C.cherryText} opacity={0.85} />
      <T x={25} y={215} s={12} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        left too long, it can force a shutdown
      </T>
    </Svg>
  );
}

// 8 · XA. Three replies — yes, yes, no — and the single no vetoes everything; then a yes survives its own crash and still commits.
export function RevealXaInPractice({ t }: StepCtx) {
  const veto = easeOut(seg(t, 1.8, 2.1));
  const replies = ['yes', 'yes', 'no'];
  return (
    <Svg label="one no vetoes everyone. One yes is a guarantee." h={240}>
      <Row y={40} label="XA" value="one no vetoes all" k={easeOut(seg(t, 0.2, 0.6))} />
      {replies.map((r, i) => (
        <Cell key={i} x={25 + i * 190} y={62} w={170} label={r} stroke={i === 2 ? C.cherryText : C.focus} f={i === 2 ? C.cherryText : C.focus} o={easeOut(seg(t, 0.6 + i * 0.3, 0.9 + i * 0.3))} />
      ))}
      <rect x={25} y={100} width={550 * veto} height={6} rx={2} fill={C.cherryText} />
      <T x={300} y={124} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        the whole transaction, vetoed
      </T>
      <Cell x={25} y={144} w={150} label="a yes" stroke={C.focus} o={easeOut(seg(t, 2.6, 2.9))} />
      <Cross x={188} y={158} k={easeOut(seg(t, 3.0, 3.3))} />
      <Cell x={205} y={144} w={230} label="recovers, still commits" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.4, 3.7))} />
      <Row y={220} label="a yes is" value="a guarantee" valueColor={C.focus} k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 9 · Spanner. Each leader sits on its own Paxos group of replicas, so the coordinator itself is replicated by consensus.
export function RevealDistributedSqlConsensus({ t }: StepCtx) {
  const groups: [number, string, number][] = [
    [25, 'coordinator leader', 1.0],
    [325, 'participant leader', 1.8],
  ];
  return (
    <Svg label="the coordinator is a whole Paxos group now." h={240}>
      {groups.map(([x, l, a]) => {
        const g = easeOut(seg(t, 2.4, 2.9));
        return (
          <g key={l}>
            <Cell x={x} y={44} w={250} label={l} stroke={C.second} o={easeOut(seg(t, a, a + 0.3))} />
            {[50, 125, 200].map((dx) => (
              <g key={dx} opacity={g}>
                <line x1={x + 125} y1={72} x2={x + dx} y2={110} stroke={C.mocha} strokeWidth={1.5} />
                <circle cx={x + dx} cy={122} r={12} fill={C.cocoa} stroke={C.second} strokeWidth={2} />
              </g>
            ))}
            <T x={x + 125} y={160} s={11} f={C.second} a="middle" o={easeOut(seg(t, 2.8, 3.1))}>
              its own Paxos group
            </T>
          </g>
        );
      })}
      <Row y={215} label="the coordinator" value="made durable" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 10 · Recap. Three rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ask the guarantee, then spend it. Shrink the gap." h={200}>
      <Row y={40} label="prepare" value="asks a guarantee" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={100} label="commit" value="spends it" valueColor={C.focus} k={easeOut(seg(t, 1.3, 1.8))} />
      <Row y={160} label="the gap between" value="what 2PC shrinks" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
    </Svg>
  );
}

// 11 · Prove. The crashed coordinator; after the answer both databases take a lock and stay prepared, in doubt.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="both said yes. The coordinator crashed before commit." h={220}>
      <Row y={40} label="coordinator" value="crashed after prepare" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="both databases" answer={answer} value="prepared, locked, in doubt" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={220} h={28} label="payments" stroke={a > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <Lock x={255} y={126} k={a} />
      <Cell x={325} y={118} w={220} h={28} label="inventory" stroke={a > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 1.0, 1.3))} />
      <Lock x={555} y={126} k={a} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            until a session resolves each one
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
