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

/** An arrow head pointing right at (x, y). */
function Head({ x, y, f, o = 1 }: { x: number; y: number; f: string; o?: number }) {
  return <path d={`M${x - 7} ${y - 5} l7 5 l-7 5`} fill="none" stroke={f} strokeWidth={2} opacity={o} />;
}

// 1 · Hook. A card swipe on a day's time line: a short arrow gives an answer seconds later; a long bar runs on to the day's
// end, where the exact answer lands; the question, one pipeline or two.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.0, 1.4));
  const b = easeInOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="an answer in seconds, exactly right by day's end — one stream, or two?" h={250}>
      <Row y={40} label="fraud check" value="answer in seconds" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="by the day's end" value="exactly right" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <line x1={25} y1={170} x2={575} y2={170} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <circle cx={80} cy={170} r={7} fill={C.crema} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={80} y={196} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        swipe
      </T>
      <path d={`M80 150 H${lerp(80, 130, a)}`} stroke={C.crema} strokeWidth={2} />
      <Head x={lerp(80, 130, a)} y={150} f={C.crema} o={a} />
      <T x={140} y={146} s={11} f={C.crema} o={a}>
        seconds
      </T>
      <rect x={80} y={180} width={470 * b} height={8} rx={3} fill={C.focus} opacity={0.5} />
      <line x1={550} y1={150} x2={550} y2={195} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 2.8, 3.1))} />
      <T x={550} y={215} s={11} f={C.focus} a="end" o={easeOut(seg(t, 2.8, 3.1))}>
        day's end
      </T>
      <T x={300} y={240} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.4, 3.9))}>
        one pipeline, or two?
      </T>
    </Svg>
  );
}

// 2 · Lambda. One input splits into a slow, thick batch lane and a fast, thin stream lane; both run to a merge at query time.
export function RevealLambdaQuote({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.8, 1.4));
  const ln = easeInOut(seg(t, 1.4, 2.8));
  const m = easeOutBack(seg(t, 2.8, 3.3));
  return (
    <Svg label="batch and stream, run in parallel, merged at query time" h={250}>
      <Row y={40} label="same input" value="batch and stream, at once" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="merged" value="when someone asks" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={158} w={100} h={30} label="input" o={easeOut(seg(t, 0.4, 0.7))} />
      <path d={`M125 173 C 150 173, 150 ${lerp(173, 132, sp)}, 175 ${lerp(173, 132, sp)}`} fill="none" stroke={C.latte} strokeWidth={2} opacity={sp > 0 ? 1 : 0} />
      <path d={`M125 173 C 150 173, 150 ${lerp(173, 214, sp)}, 175 ${lerp(173, 214, sp)}`} fill="none" stroke={C.second} strokeWidth={2} opacity={sp > 0 ? 1 : 0} />
      <rect x={175} y={124} width={280 * ln} height={16} rx={3} fill={C.latte} opacity={0.6} />
      <rect x={175} y={211} width={280 * Math.min(1, ln * 2.5)} height={6} rx={2} fill={C.second} />
      <T x={175} y={118} s={11} f={C.latte} o={sp}>
        batch: slow, thorough
      </T>
      <T x={175} y={240} s={11} f={C.second} o={sp}>
        stream: fast, approximate
      </T>
      <path d="M455 132 C 480 132, 480 173, 500 173 M455 214 C 480 214, 480 173, 500 173" fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <g opacity={clamp(m * 2)}>
        <Cell x={500} y={158} w={75} h={30} label="merge" stroke={C.focus} f={C.focus} />
      </g>
    </Svg>
  );
}

// 3 · Predict: can they disagree? Two answers from two systems drift towards one merge; then the question.
export function PredictMergeDisagree({ t, answer }: StepCtx) {
  const m = easeInOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="two systems, two answers, merged — can they disagree?" h={210}>
      <Row y={40} label="two answers, merged" value="ever disagree?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={lerp(25, 115, m)} y={60} w={170} h={26} label="batch's answer" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={lerp(405, 315, m)} y={60} w={170} h={26} label="stream's answer" o={easeOut(seg(t, 0.3, 0.6))} stroke={C.second} />
      <AnswerRow y={140} label="can they disagree" answer={answer} value="yes, batch wins" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="one layer is built to always win" />
    </Svg>
  );
}

// 4 · The realtime stack. On the left, events arrive one at a time and nudge a running answer each time; on the right, the
// batch side sweeps the whole data from scratch.
export function RevealRealtimeStackQuote({ t }: StepCtx) {
  const ev = clamp(seg(t, 0.8, 2.8) * 5);
  const sw = seg(t, 1.6, 3.2);
  return (
    <Svg label="incremental algorithms, read/write databases — not the batch layer's plain functions" h={250}>
      <Row y={40} label="stream side" value="adjusted bit by bit" valueColor={C.second} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="batch side" value="computed from scratch" k={easeOut(seg(t, 1.6, 2.1))} />
      {Array.from({ length: 5 }, (_, i) => {
        const k = clamp(ev - i);
        return <circle key={i} cx={lerp(40, 190, k)} cy={150} r={6} fill={C.second} opacity={k > 0 && k < 1 ? 1 : 0} />;
      })}
      <rect x={190} y={135} width={90} height={30} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5 + (ev % 1 < 0.2 && ev > 0 && ev < 5 ? 1.5 : 0)} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <rect x={196} y={152} width={78 * (Math.floor(ev) / 5)} height={7} rx={2} fill={C.second} />
      <T x={235} y={185} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        running answer
      </T>
      <rect x={345} y={125} width={230} height={60} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.4, 1.7))} />
      <rect x={345} y={125} width={230 * sw} height={60} rx={4} fill={C.latte} opacity={0.25} />
      <T x={460} y={205} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        all the data, every time
      </T>
    </Svg>
  );
}

// 5 · Batch always wins. The stream side's answer sits dashed, provisional; the batch side's recomputed answer slides over it
// and replaces it.
export function RevealBatchAlwaysWinsQuote({ t }: StepCtx) {
  const r = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="realtime layer's output — always overridden by the batch layer, eventually" h={240}>
      <Row y={40} label="stream's answer" value="provisional, always" valueColor={C.second} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="batch recomputes" value="and replaces it" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <rect x={215} y={140} width={170} height={34} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.5, 0.9))} />
      <T x={300} y={162} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.5, 0.9)) * (1 - r)}>
        stream's answer
      </T>
      <g transform={`translate(${lerp(-190, 0, r).toFixed(1)} 0)`} opacity={easeOut(seg(t, 1.4, 1.8))}>
        <Cell x={215} y={140} w={170} h={34} label="batch's answer" stroke={C.focus} />
      </g>
      <T x={300} y={210} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        any mistake never sticks for long
      </T>
    </Svg>
  );
}

// 6 · Predict: what costs more? The same rule written into both lanes, and a merge after them; then the question.
export function PredictWhichCostsMore({ t, answer }: StepCtx) {
  return (
    <Svg label="the same logic, written twice — or the merge at query time: which costs more?" h={210}>
      <Row y={40} label="two copies, one merge" value="which costs more?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={170} h={26} label="rule, in stream" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.second} />
      <Cell x={215} y={60} w={170} h={26} label="rule, in batch" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={405} y={60} w={170} h={26} label="merge" o={easeOut(seg(t, 0.6, 0.9))} />
      <AnswerRow y={140} label="the costly part" answer={answer} value="two copies in sync" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="one rule, maintained twice, forever" />
    </Svg>
  );
}

// 7 · The dual-logic cost. A change arrives and is applied to the stream copy, then again to the batch copy; a second change,
// twice again; the edit counter keeps doubling.
export function RevealDualLogicCostQuote({ t }: StepCtx) {
  const e = (i: number) => easeOut(seg(t, 0.8 + i * 0.55, 1.1 + i * 0.55));
  const edits = [0, 1, 2, 3].filter((i) => e(i) > 0.5).length;
  return (
    <Svg label="logic implemented twice, in two systems — a cost its own describer calls not fixable" h={250}>
      <Row y={40} label="every change" value="made twice" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="that burden" value="can't be engineered away" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
      <Cell x={25} y={125} w={250} h={30} label="stream framework" stroke={C.second} o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={325} y={125} w={250} h={30} label="batch framework" o={easeOut(seg(t, 0.4, 0.7))} />
      {[0, 1, 2, 3].map((i) => {
        const x = (i % 2 === 0 ? 25 : 325) + 30 + Math.floor(i / 2) * 60;
        return <rect key={i} x={x} y={lerp(140, 168, e(i))} width={50} height={14} rx={2} fill={C.cherryText} opacity={0.75 * e(i)} />;
      })}
      <T x={300} y={215} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        {`edits made: ${edits}`}
      </T>
    </Svg>
  );
}

// 8 · Reprocessing. The code moves from version one to version two; a sweep runs back across every output ever produced,
// re-deriving each from the original input.
export function RevealReprocessingQuote({ t }: StepCtx) {
  const v = easeOut(seg(t, 0.8, 1.3));
  const sw = seg(t, 1.6, 3.4);
  return (
    <Svg label="code changes — output must be re-derived, a problem both architectures must answer" h={250}>
      <Row y={40} label="the code changes" value="every output, redone" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="or the outputs" value="stop matching the logic" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <Cell x={25} y={120} w={110} h={28} label="version 1" o={easeOut(seg(t, 0.4, 0.7)) * (1 - 0.6 * v)} />
      <g opacity={v} transform={`translate(${((1 - v) * 20).toFixed(1)} 0)`}>
        <Cell x={145} y={120} w={110} h={28} label="version 2" stroke={C.focus} f={C.focus} />
      </g>
      {Array.from({ length: 10 }, (_, i) => {
        const on = sw * 10 > i;
        return (
          <rect
            key={i}
            x={25 + i * 55}
            y={175}
            width={47}
            height={24}
            rx={3}
            fill={on ? C.focus : C.cocoa}
            fillOpacity={on ? 0.35 : 1}
            stroke={on ? C.focus : C.cherryText}
            strokeWidth={1.2}
            opacity={easeOut(seg(t, 0.5, 0.9))}
          />
        );
      })}
      <T x={25} y={225} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.9))}>
        every output ever produced
      </T>
    </Svg>
  );
}

// 9 · Predict: can a stream alone reprocess? Every input kept as one long log; a marker runs back to its start; the question.
export function PredictStreamOnlyReprocess({ t, answer }: StepCtx) {
  const r = easeInOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="every input kept, replayable from the start — can streaming alone reprocess it?" h={210}>
      <Row y={40} label="every input kept" value="stream alone enough?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={64} width={550} height={18} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.2} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={lerp(570, 30, r)} y1={58} x2={lerp(570, 30, r)} y2={88} stroke={C.focus} strokeWidth={2.5} opacity={r > 0 ? 1 : 0} />
      <AnswerRow y={140} label="streaming alone" answer={answer} value="yes, replay the log" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="replay the retained log from the start" />
    </Svg>
  );
}

// 10 · Kappa. The full log; job one reads at its head; job two starts at the very beginning and races to catch up; once level,
// the output switches from job one to job two.
export function RevealKappaQuote({ t }: StepCtx) {
  const c = easeInOut(seg(t, 1.0, 2.8));
  const sw = easeInOut(seg(t, 2.9, 3.4));
  const x2 = lerp(30, 560, c);
  return (
    <Svg label='retain the log, replay from the start, switch over — named "Kappa" by its own creator' h={250}>
      <Row y={40} label="keep the whole log" value="replay a second job" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="caught up" value="switch over: kappa" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <rect x={25} y={140} width={550} height={22} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={132} s={11} f={C.second} o={easeOut(seg(t, 0.4, 0.7))}>
        retained log
      </T>
      <line x1={560} y1={134} x2={560} y2={168} stroke={C.crema} strokeWidth={2.5} opacity={easeOut(seg(t, 0.6, 0.9)) * (1 - 0.6 * sw)} />
      <T x={575} y={126} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0.6, 0.9)) * (1 - 0.6 * sw)}>
        job 1
      </T>
      <line x1={x2} y1={134} x2={x2} y2={168} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, 0.9, 1.1))} />
      <T x={x2} y={186} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.9, 1.1))}>
        job 2
      </T>
      <path d={`M560 ${lerp(168, 190, sw)} V225 H420`} fill="none" stroke={sw > 0.5 ? C.focus : C.crema} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={410} y={229} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        output
      </T>
    </Svg>
  );
}

// 11 · The honest trade. Two resource-cost bars grow to about the same length; then the count of systems to build and run:
// two against one.
export function RevealHonestTradeQuote({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 0.8, 1.8));
  return (
    <Svg label="efficiency — roughly even either way; the real win is one framework, not speed" h={250}>
      <Row y={40} label="resource cost" value="close to even" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={85} label="systems to run" value="two versus one" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <T x={25} y={125} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        lambda
      </T>
      <rect x={110} y={114} width={280 * a} height={14} rx={2} fill={C.latte} opacity={0.6} />
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        kappa
      </T>
      <rect x={110} y={139} width={270 * b} height={14} rx={2} fill={C.focus} opacity={0.6} />
      {[0, 1].map((i) => (
        <Cell key={i} x={25 + i * 120} y={180} w={110} h={34} label={i === 0 ? 'batch' : 'stream'} o={easeOut(seg(t, 2.6 + i * 0.3, 2.9 + i * 0.3))} />
      ))}
      <Cell x={405} y={180} w={170} h={34} label="one stream job" o={easeOut(seg(t, 3.4, 3.7))} stroke={C.focus} f={C.focus} />
      <T x={325} y={202} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.5))}>
        vs
      </T>
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="duplicate logic, merged at serving — versus one pipeline, replayed from a retained log" h={220}>
      <Row y={50} label="two systems" value="every rule, twice" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="one rewindable" value="nothing extra, mostly" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="the real reason" value="one thing to operate" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 13 · Prove: a log too big to replay. A replay bar runs far past a deadline marker; after the answer the batch layer is
// named and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const r = easeInOut(seg(t, 0.5, 1.8));
  return (
    <Svg label="a log too large to replay quickly — does one pipeline still replace the batch layer?" h={230}>
      <Row y={40} label="replay takes days" value="past the deadline" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="one pipeline covers it" answer={answer} value="no, batch earns it" k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={122} width={550 * r} height={14} rx={3} fill={r > 0.35 ? C.cherryText : C.second} opacity={0.5} />
      <line x1={215} y1={114} x2={215} y2={144} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={215} y={160} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        deadline
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            a separate batch layer still pays
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
