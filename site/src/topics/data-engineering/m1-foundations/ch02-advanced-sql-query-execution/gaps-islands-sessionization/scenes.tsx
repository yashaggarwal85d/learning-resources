import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = a session start / the id, cherryText = a gap over the threshold, crema = data, latte = labels.
// One customer's clicks at minutes 0, 12, 25, 80, 95, 200, 202, 230; threshold 30 minutes.

const TIMES = [0, 12, 25, 80, 95, 200, 202, 230];
const GAP = [null, 12, 13, 55, 15, 105, 2, 28];
const FLAG = [1, 0, 0, 1, 0, 1, 0, 0];
const SESS = [1, 1, 1, 2, 2, 3, 3, 3];
const px = (m: number) => 30 + (m / 230) * 520;

function Axis({ y = 120, upTo = 8, color = (i: number) => C.crema }: { y?: number; upTo?: number; color?: (i: number) => string }) {
  return (
    <g>
      <line x1={25} y1={y} x2={575} y2={y} stroke={C.taupe} strokeWidth={2} />
      {TIMES.slice(0, upTo).map((m, i) => (
        <g key={i}>
          <circle cx={px(m)} cy={y} r={8} fill={color(i)} />
          <T x={px(m)} y={y + 28} s={13} f={C.latte} a="middle">{String(m)}</T>
        </g>
      ))}
    </g>
  );
}

// 1 · Timeline.
export function Timeline({ t }: StepCtx) {
  const n = Math.min(8, Math.floor(t / 0.35) + 1);
  const g = easeOut(seg(t, 3.0, 3.8));
  return (
    <Svg label="Eight clicks on a timeline make three visits separated by gaps" h={260}>
      <Axis upTo={n} />
      {[[0, 25], [80, 95], [200, 230]].map((r, i) => <rect key={i} x={px(r[0]) - 16} y={92} width={px(r[1]) - px(r[0]) + 32} height={56} rx={14} fill="none" stroke={C.caramel} strokeWidth={2} opacity={g} />)}
      <T x={300} y={210} s={15} f={C.caramel} a="middle" o={g}>3 visits, 2 gaps</T>
    </Svg>
  );
}

// 2 · LAG.
export function Lag({ t }: StepCtx) {
  const k = Math.min(7, Math.floor(t / 0.5));
  return (
    <Svg label="LAG reads the previous row; subtracting gives the gap since the last event" h={300}>
      <Axis />
      {TIMES.map((m, i) => i > 0 && i <= k && <line key={i} x1={px(TIMES[i - 1])} y1={92} x2={px(m)} y2={92} stroke={C.caramel} strokeWidth={2} />)}
      {GAP.map((gp, i) => (
        <T key={i} x={px(TIMES[i])} y={200} s={14} f={gp === null ? C.cherryText : C.caramel} a="middle" o={i <= k ? 1 : 0.15}>{gp === null ? 'NULL' : String(gp)}</T>
      ))}
      <T x={25} y={176} s={13} f={C.latte}>gap since the previous event (minutes)</T>
    </Svg>
  );
}

// 3 · Predict.
export function FirstPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="LAG for the first event of a customer" h={240}>
      <circle cx={80} cy={100} r={9} fill={C.crema} />
      <T x={80} y={130} s={13} f={C.latte} a="middle">first event</T>
      {!answered ? <T x={300} y={110} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={110} s={30} f={C.cherryText} a="middle" w={700}>NULL</T>}
    </Svg>
  );
}

// 4 · Flags.
export function Flags({ t }: StepCtx) {
  return (
    <Svg label="Rows with a NULL gap or a gap over 30 minutes are flagged as session starts" h={300}>
      <Axis color={(i) => (FLAG[i] ? C.caramel : C.crema)} />
      {FLAG.map((f, i) => <T key={i} x={px(TIMES[i])} y={200} s={18} f={f ? C.caramel : C.taupe} a="middle" w={700} o={easeOut(seg(t, 0.3 + i * 0.3, 0.7 + i * 0.3))}>{String(f)}</T>)}
      <T x={25} y={176} s={13} f={C.latte}>new session? (gap NULL or over 30)</T>
    </Svg>
  );
}

// 5 · Running sum.
export function RunningSum({ t }: StepCtx) {
  const k = Math.min(7, Math.floor(t / 0.5));
  return (
    <Svg label="The running sum of the flags is the session id: 1, 1, 1, 2, 2, 3, 3, 3" h={300}>
      <Axis color={(i) => (i <= k ? C.caramel : C.cocoa)} />
      {FLAG.map((f, i) => <T key={i} x={px(TIMES[i])} y={186} s={14} f={C.taupe} a="middle">{String(f)}</T>)}
      {SESS.map((s, i) => <T key={i} x={px(TIMES[i])} y={226} s={20} f={C.caramel} a="middle" w={700} o={i <= k ? 1 : 0.1}>{String(s)}</T>)}
      <T x={25} y={266} s={13} f={C.latte}>session id = running sum of the flags</T>
    </Svg>
  );
}

// 6 · Predict fourth.
export function FourthPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Flags 1, 0, 0, 1, 0, 1, 0, 0; the fourth row's running sum" h={240}>
      {FLAG.map((f, i) => (
        <g key={i}>
          <rect x={30 + i * 66} y={70} width={54} height={44} rx={8} fill={C.cocoa} stroke={i === 3 ? C.caramel : C.mocha} strokeWidth={i === 3 ? 3 : 1} />
          <T x={57 + i * 66} y={99} s={18} f={C.crema} a="middle">{String(f)}</T>
        </g>
      ))}
      {!answered ? <T x={228} y={180} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={228} y={180} s={22} f={C.caramel} a="middle" w={700}>1 + 0 + 0 + 1 = 2</T>}
    </Svg>
  );
}

// 7 · Difference trick.
export function Difference({ t }: StepCtx) {
  const days = [1, 2, 3, 5, 6, 9];
  const rn = [1, 2, 3, 4, 5, 6];
  return (
    <Svg label="Day minus row number is constant inside a run of consecutive days" h={300}>
      <T x={25} y={36} s={13} f={C.latte}>day</T>
      <T x={25} y={84} s={13} f={C.latte}>row number</T>
      <T x={25} y={132} s={13} f={C.caramel}>day − row number</T>
      {days.map((d, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.35, 0.8 + i * 0.35));
        const diff = d - rn[i];
        const f = diff === 0 ? C.caramel : diff === 1 ? C.cinnamon : C.cherryText;
        return (
          <g key={i} opacity={clamp(a)}>
            <T x={170 + i * 66} y={36} s={16} f={C.crema} a="middle">{String(d)}</T>
            <T x={170 + i * 66} y={84} s={16} f={C.crema} a="middle">{String(rn[i])}</T>
            <rect x={146 + i * 66} y={100} width={48} height={42} rx={8} fill="none" stroke={f} strokeWidth={2} />
            <T x={170 + i * 66} y={128} s={18} f={f} a="middle" w={700}>{String(diff)}</T>
          </g>
        );
      })}
      <T x={300} y={200} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.8, 3.6))}>same value = same unbroken run</T>
    </Svg>
  );
}

// 8 · Technique predict.
export function TechniquePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Which technique handles a time threshold" h={260}>
      <rect x={25} y={60} width={250} height={50} rx={8} fill={C.cocoa} stroke={answered ? C.cherryText : C.mocha} />
      <T x={150} y={90} s={14} f={C.crema} a="middle">row-number difference</T>
      <rect x={325} y={60} width={250} height={50} rx={8} fill={C.cocoa} stroke={answered ? C.caramel : C.mocha} strokeWidth={answered ? 3 : 1} />
      <T x={450} y={90} s={14} f={C.crema} a="middle">running sum of a flag</T>
      {!answered && <T x={300} y={190} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={180} s={14} f={C.latte} a="middle">a threshold needs the gap itself</T>}
    </Svg>
  );
}

// 9 · Ties.
export function Ties({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.5, 1.5));
  return (
    <Svg label="Two events with the same timestamp: gap 0, same session either way" h={260}>
      <line x1={25} y1={110} x2={575} y2={110} stroke={C.taupe} strokeWidth={2} />
      <circle cx={100} cy={110} r={8} fill={C.crema} />
      <circle cx={400} cy={104} r={8} fill={C.caramel} opacity={a} />
      <circle cx={400} cy={118} r={8} fill={C.caramel} opacity={a} />
      <T x={400} y={150} s={13} f={C.latte} a="middle" o={a}>same timestamp</T>
      <T x={250} y={94} s={13} f={C.cherryText} a="middle" o={a}>gap over 30</T>
      <T x={300} y={210} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>both rows: the same session id, in any order</T>
    </Svg>
  );
}

// 10 · Compress.
export function Compress({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.0, 2.4));
  const rows = [['1', '0 – 25', '3'], ['2', '80 – 95', '2'], ['3', '200 – 230', '3']];
  return (
    <Svg label="Eight events become three session rows" h={300}>
      <g opacity={1 - 0.8 * a}><Axis y={60} /></g>
      <T x={25} y={150} s={13} f={C.latte} o={a}>session</T>
      <T x={150} y={150} s={13} f={C.latte} o={a}>start – end</T>
      <T x={330} y={150} s={13} f={C.latte} o={a}>events</T>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={a}>
          <T x={25} y={186 + i * 36} s={16} f={C.caramel} w={700}>{r[0]}</T>
          <T x={150} y={186 + i * 36} s={16} f={C.crema}>{r[1]}</T>
          <T x={330} y={186 + i * 36} s={16} f={C.crema}>{r[2]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['LAG + threshold', 'flag the starts'], ['running sum', 'number the visits'], ['GROUP BY', 'one row per visit']];
  return (
    <Svg label="Three steps from events to sessions" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={22} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveLag({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The previous-row function" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>previous row →</T>
      {answered ? <T x={260} y={104} s={26} f={C.caramel} w={700}>LAG</T> : <T x={270} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveSessions({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Gaps of 5, 45 and 10 minutes" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>gaps 5 · 45 · 10 →</T>
      {answered ? <T x={330} y={104} s={24} f={C.caramel} w={700}>2 sessions</T> : <T x={340} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
