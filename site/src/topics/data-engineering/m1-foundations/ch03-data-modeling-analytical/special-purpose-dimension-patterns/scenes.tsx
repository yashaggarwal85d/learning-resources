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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
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

/** An arrow from (x1,y1) to (x2,y2), drawn by `k`, with a head once it arrives. */
function Arrow({ x1, y1, x2, y2, k, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.5} />
      {k > 0.95 && (
        <path
          d={`M${x2} ${y2} l${(-7 * Math.cos(a - 0.5)).toFixed(1)} ${(-7 * Math.sin(a - 0.5)).toFixed(1)} M${x2} ${y2} l${(-7 * Math.cos(a + 0.5)).toFixed(1)} ${(-7 * Math.sin(a + 0.5)).toFixed(1)}`}
          stroke={f}
          strokeWidth={1.5}
        />
      )}
    </g>
  );
}

// 1 · Hook. Four patterns land one by one, each with a strip of its own shape: a bare key, one table with two arrows
// out, eight flag combinations shrinking to three, a chain of three tables.
export function Hook({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['degenerate', 'no table at all'],
    ['role-playing', 'one table, two roles'],
    ['junk', 'flags, collapsed'],
    ['outrigger', 'a dimension, chained'],
  ];
  return (
    <Svg label="degenerate, role-playing, junk, outrigger" h={250}>
      {rows.map(([label, value], i) => {
        const y = 40 + i * 58;
        const k = easeOut(seg(t, 1.0 + i * 0.7, 1.5 + i * 0.7));
        const p = easeInOut(seg(t, 1.3 + i * 0.7, 2.1 + i * 0.7));
        return (
          <g key={label}>
            <Row y={y} label={label} value={value} k={k} />
            <g opacity={k}>
              {i === 0 && (
                <>
                  <rect x={25} y={y + 10} width={40} height={12} rx={2} fill={C.focus} opacity={0.7} />
                  <rect x={75} y={y + 10} width={60} height={12} rx={2} fill="none" stroke={C.latte} strokeDasharray="3 3" opacity={1 - p * 0.7} />
                </>
              )}
              {i === 1 && (
                <>
                  <rect x={25} y={y + 10} width={20} height={12} rx={2} fill={C.focus} opacity={0.7} />
                  <line x1={45} y1={y + 14} x2={45 + 60 * p} y2={y + 11} stroke={C.focus} strokeWidth={1.5} />
                  <line x1={45} y1={y + 18} x2={45 + 60 * p} y2={y + 21} stroke={C.second} strokeWidth={1.5} />
                </>
              )}
              {i === 2 && Array.from({ length: 8 }, (_, j) => <circle key={j} cx={30 + j * 16} cy={y + 16} r={4} fill={C.crema} opacity={[0, 3, 5].includes(j) ? 1 : 1 - 0.85 * p} />)}
              {i === 3 &&
                [0, 1, 2].map((j) => (
                  <g key={j}>
                    {j > 0 && <line x1={25 + (j - 1) * 40 + 20} y1={y + 16} x2={25 + (j - 1) * 40 + 20 + 20 * seg(p, (j - 1) / 2, j / 2)} y2={y + 16} stroke={C.latte} strokeWidth={1.5} />}
                    <rect x={25 + j * 40} y={y + 10} width={20} height={12} rx={2} fill={C.crema} opacity={seg(p, (j - 1) / 2, j / 2 + 0.01) > 0 || j === 0 ? 0.7 : 0} />
                  </g>
                ))}
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Degenerate. The invoice's descriptive attributes move down to its line items; the invoice table is left empty
// except for its number, which slides into the fact table as a key of its own.
export function RevealDegenerateQuote({ t }: StepCtx) {
  const mv = (i: number) => easeInOut(seg(t, 0.8 + i * 0.25, 1.5 + i * 0.25));
  const empty = easeOut(seg(t, 2.0, 2.4));
  const key = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="no content left, except the key itself" h={240}>
      <Row y={40} label="invoice number" value="no descriptive content" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="still a valid" value="dimension key" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <rect x={25} y={115} width={200} height={100} rx={6} fill="none" stroke={C.mocha} strokeDasharray={empty > 0 ? '5 4' : undefined} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={125} y={132} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.5 * empty)}>
        invoice
      </T>
      {['date', 'customer', 'terms'].map((l, i) => (
        <Cell key={l} x={lerp(40, 385, mv(i))} y={lerp(142 + i * 22, 125 + i * 26, mv(i))} w={170} h={20} label={l} o={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      <rect x={370} y={115} width={205} height={112} rx={6} fill="none" stroke={C.focus} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={472} y={112} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        line items (fact)
      </T>
      <Cell x={lerp(150, 495, key)} y={lerp(188, 200, key)} w={70} h={20} label="no." o={easeOut(seg(t, 0.3, 0.6))} stroke={key > 0 ? C.focus : C.mocha} />
    </Svg>
  );
}

// 3 · Predict: group by a bare key? Order numbers with only an empty outline where a table would be; then the question.
export function PredictDegenerateGrouping({ t, answer }: StepCtx) {
  return (
    <Svg label="no dimension table behind it — groups correctly?" h={210}>
      <Row y={40} label="bare order number" value="no table behind it" k={easeOut(seg(t, 0.1, 0.5))} />
      {['9001', '9001', '9002'].map((n, i) => (
        <Cell key={i} x={25 + i * 100} y={62} w={90} h={26} label={n} o={easeOut(seg(t, 0.3 + i * 0.15, 0.6 + i * 0.15))} />
      ))}
      <rect x={400} y={60} width={175} height={30} rx={5} fill="none" stroke={C.latte} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={487} y={80} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        no table
      </T>
      <AnswerRow y={140} label="group by it" answer={answer} value="still correct" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="grouping only compares the values" />
    </Svg>
  );
}

// 4 · Degenerate, measured. Three fact lines; the two under 9001 slide into one group, the 9002 line into its own.
export function RevealDegenerateMeasured({ t }: StepCtx) {
  const g = easeInOut(seg(t, 1.2, 2.2));
  const lab = easeOut(seg(t, 2.2, 2.6));
  const lines: [string, number, number][] = [
    ['9001', 0, 0],
    ['9001', 1, 0],
    ['9002', 2, 1],
  ];
  return (
    <Svg label="grouped by a bare key, correctly" h={240}>
      <Row y={40} label="two lines" value="shared one order number" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="grouped correctly" value="no dimension table used" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {lines.map(([n, i, grp]) => {
        const ty = grp === 0 ? 122 + i * 30 : 192;
        return (
          <g key={i} transform={`translate(${(310 * g).toFixed(1)} ${((ty - (120 + i * 35)) * g).toFixed(1)})`} opacity={easeOut(seg(t, 0.3 + i * 0.15, 0.6 + i * 0.15))}>
            <Cell x={25} y={120 + i * 35} w={80} h={24} label={n} stroke={grp === 0 ? C.focus : C.second} />
            <Cell x={110} y={120 + i * 35} w={120} h={24} label="line" />
          </g>
        );
      })}
      <rect x={325} y={115} width={225} height={64} rx={6} fill="none" stroke={C.focus} opacity={lab} />
      <rect x={325} y={186} width={225} height={36} rx={6} fill="none" stroke={C.second} opacity={lab} />
      <T x={565} y={152} s={12} f={C.focus} a="end" o={lab} w={600}>
        2
      </T>
      <T x={565} y={208} s={12} f={C.second} a="end" o={lab} w={600}>
        1
      </T>
    </Svg>
  );
}

// 5 · Role-playing. One fact row carries two date keys; both point at the same physical date table, each arrow its own role.
export function RevealRolePlayingQuote({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.0, 1.6));
  const b = easeInOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="one table, referenced more than once" h={230}>
      <Row y={40} label="one physical table" value="referenced twice" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="each reference" value="its own logical role" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Cell x={25} y={120} w={150} h={26} label="order date" o={easeOut(seg(t, 0.4, 0.7))} stroke={C.focus} />
      <Cell x={25} y={170} w={150} h={26} label="ship date" o={easeOut(seg(t, 0.5, 0.8))} stroke={C.second} />
      <Cell x={405} y={130} w={170} h={56} label="dim_date" o={easeOut(seg(t, 0.6, 0.9))} />
      <Arrow x1={175} y1={133} x2={405} y2={150} k={a} f={C.focus} />
      <Arrow x1={175} y1={183} x2={405} y2={166} k={b} f={C.second} />
    </Svg>
  );
}

// 6 · Role-playing, measured. The one date table's three rows; the order's two keys land on two different rows of it.
export function RevealRolePlayingMeasured({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.2, 1.8));
  const b = easeInOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="one dim_date, joined twice, two distinct dates" h={230}>
      <Row y={40} label="one shared table" value="joined in two roles" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="order date, ship date" value="both distinct" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <Cell x={25} y={135} w={150} h={26} label="order" o={easeOut(seg(t, 0.4, 0.7))} />
      {[0, 1, 2].map((r) => (
        <Cell
          key={r}
          x={405}
          y={115 + r * 34}
          w={170}
          h={26}
          label="date row"
          o={easeOut(seg(t, 0.5 + r * 0.1, 0.8 + r * 0.1))}
          stroke={(r === 0 && a >= 1) || (r === 2 && b >= 1) ? (r === 0 ? C.focus : C.second) : C.mocha}
        />
      ))}
      <Arrow x1={175} y1={142} x2={405} y2={128} k={a} f={C.focus} />
      <Arrow x1={175} y1={154} x2={405} y2={196} k={b} f={C.second} />
      <T x={290} y={118} s={11} f={C.focus} a="middle" o={a}>
        as order date
      </T>
      <T x={290} y={196} s={11} f={C.second} a="middle" o={b}>
        as ship date
      </T>
    </Svg>
  );
}

// 7 · Junk dimension. Three flag columns slide off the fact row into one small table; the fact keeps a single junk key.
export function RevealJunkQuote({ t }: StepCtx) {
  const mv = (i: number) => easeInOut(seg(t, 0.8 + i * 0.2, 1.5 + i * 0.2));
  const key = easeOutBack(seg(t, 1.9, 2.3));
  return (
    <Svg label="only the combinations that actually occur" h={230}>
      <Row y={40} label="low-card. flags" value="collapsed into one table" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="stores only" value="combinations that occur" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Cell x={25} y={130} w={90} h={26} label="fact" o={easeOut(seg(t, 0.2, 0.5))} />
      {['flag A', 'flag B', 'flag C'].map((l, i) => (
        <Cell key={l} x={lerp(120 + i * 75, 395, mv(i))} y={lerp(130, 120 + i * 30, mv(i))} w={lerp(70, 170, mv(i))} h={26} label={l} o={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      <rect x={385} y={112} width={190} height={102} rx={6} fill="none" stroke={C.focus} opacity={easeOut(seg(t, 1.4, 1.8))} />
      <g opacity={clamp(key)}>
        <Cell x={120} y={130} w={110} h={26} label="junk key" stroke={C.focus} />
        <line x1={230} y1={143} x2={385} y2={143} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" />
      </g>
    </Svg>
  );
}

// 8 · Junk, measured. Eight possible combinations of three yes/no flags; five never occur and fade; three remain.
const COMBOS = Array.from({ length: 8 }, (_, i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1]);
const SEEN = [0, 3, 5];
export function RevealJunkMeasured({ t }: StepCtx) {
  const fade = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="three stored, against eight possible" h={220}>
      <Row y={40} label="three flags" value="eight possible combinations" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="rows actually stored" value="3 of the 8" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {COMBOS.map((c, i) => {
        const seen = SEEN.includes(i);
        const k = easeOut(seg(t, 0.6 + i * 0.12, 0.9 + i * 0.12));
        return (
          <g key={i} opacity={k * (seen ? 1 : 1 - 0.85 * fade)}>
            <rect x={25 + i * 70} y={115} width={60} height={86} rx={5} fill="none" stroke={seen && fade > 0 ? C.focus : C.mocha} strokeWidth={seen && fade > 0 ? 2 : 1} />
            {c.map((v, j) => (
              <circle key={j} cx={55 + i * 70} cy={135 + j * 23} r={6} fill={v ? C.crema : 'none'} stroke={C.crema} strokeWidth={1.5} />
            ))}
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Predict: is an outrigger free? A dimension pointing at another dimension; then the question.
export function PredictOutriggerCost({ t, answer }: StepCtx) {
  return (
    <Svg label="a dimension pointing at a dimension — free?" h={210}>
      <Row y={40} label="outrigger" value="points at another dimension" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={62} w={130} h={26} label="fact" o={easeOut(seg(t, 0.2, 0.5))} />
      <Arrow x1={155} y1={75} x2={235} y2={75} k={easeInOut(seg(t, 0.4, 0.8))} />
      <Cell x={235} y={62} w={130} h={26} label="customer" o={easeOut(seg(t, 0.5, 0.8))} />
      <Arrow x1={365} y1={75} x2={445} y2={75} k={easeInOut(seg(t, 0.8, 1.2))} />
      <Cell x={445} y={62} w={130} h={26} label="account" o={easeOut(seg(t, 0.9, 1.2))} />
      <AnswerRow y={140} label="any real cost" answer={answer} value="an extra join" f={C.cherryText} k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="every query through it pays that join" f={C.cherryText} />
    </Svg>
  );
}

// 10 · Use sparingly. The chain fact → customer → account; then the account link is demoted to sit on the fact directly.
export function RevealOutriggerQuote({ t }: StepCtx) {
  const dm = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="permissible, sparingly — demote instead" h={230}>
      <Row y={40} label="outrigger" value="a dimension on a dimension" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="mostly" value="demote to the fact table" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Cell x={25} y={125} w={130} h={26} label="fact" o={easeOut(seg(t, 0.4, 0.7))} />
      <Arrow x1={155} y1={138} x2={235} y2={138} k={easeInOut(seg(t, 0.6, 1.0))} />
      <Cell x={235} y={125} w={130} h={26} label="customer" o={easeOut(seg(t, 0.7, 1.0))} />
      <Arrow x1={365} y1={138} x2={445} y2={138} k={easeInOut(seg(t, 1.0, 1.4)) * (1 - dm)} />
      <Cell x={445} y={lerp(125, 185, dm)} w={130} h={26} label="account" o={easeOut(seg(t, 1.1, 1.4))} stroke={dm > 0.9 ? C.focus : C.mocha} />
      <path d={`M90 151 C 90 198 300 198 445 198`} fill="none" stroke={C.focus} strokeWidth={1.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - seg(dm, 0.5, 1)} />
    </Svg>
  );
}

// 11 · The join count, measured. Through the outrigger the query touches three tables, counted one by one; the flatter
// design reaches the same date touching two.
export function RevealOutriggerMeasured({ t }: StepCtx) {
  const lane = (y: number, names: string[], t0: number, f: string) => (
    <g>
      {names.map((n, i) => {
        const k = easeOut(seg(t, t0 + i * 0.45, t0 + 0.3 + i * 0.45));
        return (
          <g key={n}>
            {i > 0 && <Arrow x1={25 + (i - 1) * 190 + 150} y1={y + 13} x2={25 + i * 190} y2={y + 13} k={k} f={f} />}
            <Cell x={25 + i * 190} y={y} w={150} h={26} label={n} o={k} stroke={f} />
          </g>
        );
      })}
    </g>
  );
  return (
    <Svg label="an extra table touched, every single query" h={230}>
      <Row y={40} label="through the outrigger" value="three tables touched" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a flattened design" value="would need one fewer" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {lane(120, ['fact', 'customer', 'account'], 0.8, C.cherryText)}
      {lane(180, ['fact', 'account'], 2.8, C.focus)}
    </Svg>
  );
}

// 12 · Recap. Four patterns, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four patterns, four honest costs" h={250}>
      <Row y={45} label="degenerate" value="groups fine, no attributes" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={100} label="role-playing" value="each role named" k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={155} label="junk" value="only real combinations" k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={210} label="outrigger" value="works, but costs a join" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 13 · Prove: two dates on a ticket. After the answer both keys point into the one date table and the verdict lands
// with a tick.
export function ProveTicketDates({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeInOut(seg(s, 0.1, 0.5)) : 0;
  const b = answer !== null ? easeInOut(seg(s, 0.3, 0.7)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.2, 1.6)) : 0;
  return (
    <Svg label="opened date, closed date — which pattern?" h={230}>
      <Row y={40} label="support ticket" value="opened date, closed date" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="which pattern fits" answer={answer} value="role-playing" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={110} w={130} h={22} label="opened" o={easeOut(seg(t, 0.6, 0.9))} stroke={C.focus} />
      <Cell x={25} y={140} w={130} h={22} label="closed" o={easeOut(seg(t, 0.7, 1.0))} stroke={C.second} />
      <Cell x={405} y={115} w={170} h={42} label="dim_date" o={easeOut(seg(t, 0.8, 1.1))} />
      <Arrow x1={155} y1={121} x2={405} y2={130} k={a} f={C.focus} />
      <Arrow x1={155} y1={151} x2={405} y2={142} k={b} f={C.second} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            one calendar, two named roles
          </T>
          <rect x={170} y={202} width={260 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
