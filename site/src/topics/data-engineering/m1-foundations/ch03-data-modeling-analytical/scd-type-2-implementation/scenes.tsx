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

/** One version row of the customer dimension: its key, its address, its closing edge, and a "current" dot slot. */
function Version({ y, keyLabel, address, closed = 0, o = 1, stroke = C.mocha }: { y: number; keyLabel: string; address: string; closed?: number; o?: number; stroke?: string }) {
  return (
    <g opacity={o}>
      <Cell x={25} y={y} w={70} label={keyLabel} stroke={stroke} />
      <Cell x={105} y={y} w={200} label={address} stroke={stroke} />
      <rect x={315} y={y} width={160} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} strokeDasharray={closed > 0 ? undefined : '4 3'} />
      <T x={395} y={y + 18.5} s={12} f={C.cherryText} a="middle" o={closed}>
        closed
      </T>
      <circle cx={525} cy={y + 14} r={7} fill="none" stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** The column headings over the version rows. */
function Heads({ y, o }: { y: number; o: number }) {
  return (
    <g opacity={o}>
      {(
        [
          [60, 'key'],
          [205, 'address'],
          [395, 'valid until'],
          [525, 'current'],
        ] as [number, string][]
      ).map(([x, l]) => (
        <T key={l} x={x} y={y} s={11} f={C.latte} a="middle">
          {l}
        </T>
      ))}
    </g>
  );
}

/** The "current" dot, travelling between rows. */
function CurrentDot({ y, o = 1 }: { y: number; o?: number }) {
  return <circle cx={525} cy={y + 14} r={5} fill={C.focus} opacity={o} />;
}

// 1 · Hook. One customer row, three past sales pointing at it; the address is overwritten (struck out, the new one written
// over it) and every sale link turns red.
export function Hook({ t }: StepCtx) {
  const ov = easeOut(seg(t, 2.0, 2.6));
  const red = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="overwrite the address, or keep both versions?" h={250}>
      <Row y={40} label="customer moves" value="the address must change" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="overwrite it" value="past sales now point wrong" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <Cell x={25} y={135} w={230} h={34} label="" o={easeOut(seg(t, 0.4, 0.8))} stroke={red > 0 ? C.cherryText : C.mocha} />
      <T x={140} y={157} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.4, 0.8)) * (1 - 0.6 * ov)}>
        old address
      </T>
      <line x1={90} y1={152} x2={lerp(90, 190, ov)} y2={152} stroke={C.cherryText} strokeWidth={2} opacity={ov > 0 ? 1 : 0} />
      <T x={140} y={lerp(132, 126, ov)} s={13} f={C.cherryText} a="middle" o={ov}>
        new address
      </T>
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.3, 1.2 + i * 0.3));
        const y = 125 + i * 40;
        return (
          <g key={i}>
            <line x1={255} y1={152} x2={lerp(255, 395, k)} y2={lerp(152, y + 13, k)} stroke={red > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} />
            <Cell x={395} y={y} w={180} h={26} label="past sale" o={k} stroke={red > 0 ? C.cherryText : C.mocha} />
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Type 2. The old row stays exactly as it was; a brand new row, with its own new key, slides in beneath it.
export function RevealSCD2Quote({ t }: StepCtx) {
  const n = easeOut(seg(t, 1.6, 2.3));
  const hold = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="a new row, a new key, the old row untouched" h={230}>
      <Row y={40} label="type 2" value="a new row, not an overwrite" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="old row, old key" value="left exactly as it was" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Heads y={118} o={easeOut(seg(t, 0.4, 0.8))} />
      <Version y={128} keyLabel="key 1" address="old address" o={easeOut(seg(t, 0.5, 0.9))} stroke={hold > 0 ? C.focus : C.mocha} />
      <g opacity={n} transform={`translate(0 ${((1 - n) * 20).toFixed(1)})`}>
        <Cell x={25} y={168} w={70} label="key 2" stroke={C.focus} f={C.focus} />
        <Cell x={105} y={168} w={200} label="new address" stroke={C.focus} />
      </g>
      <rect x={25} y={202} width={280 * hold} height={3} fill={C.focus} />
    </Svg>
  );
}

// 3 · Predict: one statement? Two jobs side by side, bracketed together; then the question.
export function PredictSingleMerge({ t, answer }: StepCtx) {
  const b = easeInOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="expire the old row, insert the new — one statement?" h={210}>
      <Row y={40} label="close old, open new" value="both at once" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={180} h={26} label="close old row" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={225} y={60} w={180} h={26} label="open new row" o={easeOut(seg(t, 0.5, 0.8))} />
      <path d={`M25 94 v6 h${380 * b} v-6`} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={b > 0 ? 1 : 0} />
      <T x={575} y={104} s={13} f={C.latte} a="end" o={easeOut(seg(t, 1.4, 1.8))}>
        one command?
      </T>
      <AnswerRow y={140} label="a single merge" answer={answer} value="yes, does both" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} text="one clause closes, one clause inserts" />
    </Svg>
  );
}

// 4 · MERGE. One statement box; its three conditional branches draw out to insert, update and delete; beside it the
// several separate steps it stands in for, stacked and greyed.
export function RevealMergeQuote({ t }: StepCtx) {
  const OPS = ['insert', 'update', 'delete'];
  return (
    <Svg label="one statement, conditional insert, update, or delete" h={250}>
      <Row y={40} label="merge" value="one single statement" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="stands in for" value="several separate steps" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={155} w={120} h={34} label="MERGE" o={easeOut(seg(t, 0.5, 0.9))} stroke={C.focus} f={C.focus} />
      {OPS.map((op, i) => {
        const y = 120 + i * 40;
        const l = easeInOut(seg(t, 1.0 + i * 0.4, 1.5 + i * 0.4));
        return (
          <g key={op}>
            <line x1={145} y1={172} x2={lerp(145, 215, l)} y2={lerp(172, y + 13, l)} stroke={C.focus} strokeWidth={1.5} />
            <Cell x={215} y={y} w={130} h={26} label={`when … ${op}`} o={l} />
          </g>
        );
      })}
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={425} y={120 + i * 40} w={150} h={26} label={`step ${i + 1}`} o={0.5 * easeOut(seg(t, 3.2 + i * 0.3, 3.6 + i * 0.3))} />
      ))}
      <line x1={410} y1={120} x2={410} y2={lerp(120, 226, easeInOut(seg(t, 3.2, 4.1)))} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 3.2, 3.4))} />
    </Svg>
  );
}

// 5 · The real load. Key 1 is current; one pass of the command sweeps down: row 1 closes, row 2 opens, the current dot moves,
// and the count of rows changed lands at 2.
export function RevealMergeMeasured({ t }: StepCtx) {
  const sw = seg(t, 1.2, 2.6);
  const cl = easeOut(seg(t, 1.5, 1.9));
  const nw = easeOut(seg(t, 2.0, 2.5));
  const dot = easeInOut(seg(t, 2.2, 2.7));
  const c = easeOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="one real merge: expired, inserted, atomically" h={250}>
      <Row y={40} label="one pass" value="old closes, new opens" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="rows changed" value={num(2 * c)} valueColor={C.focus} big k={easeOut(seg(t, 2.8, 3.1))} />
      <Heads y={128} o={easeOut(seg(t, 0.4, 0.8))} />
      <Version y={138} keyLabel="key 1" address="old address" closed={cl} o={easeOut(seg(t, 0.5, 0.9))} />
      <Version y={178} keyLabel="key 2" address="new address" o={nw} stroke={C.focus} />
      <CurrentDot y={lerp(138, 178, dot)} o={easeOut(seg(t, 0.6, 1.0))} />
      {sw > 0 && sw < 1 && <rect x={20} y={lerp(134, 212, sw)} width={560} height={3} fill={C.focus} />}
      <T x={575} y={236} s={12} f={C.latte} a="end" o={easeOut(seg(t, 3.6, 4.1))}>
        2 rows · 1 current
      </T>
    </Svg>
  );
}

// 6 · Predict: run again? The state after the first run; the same command arrives again; then the question.
export function PredictRerun({ t, answer }: StepCtx) {
  const a = easeInOut(seg(t, 0.8, 1.6));
  return (
    <Svg label="the identical load, run twice — anything changes?" h={210}>
      <Row y={40} label="same command" value="run a second time" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={180} h={26} label="first: 2 changed" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={lerp(395, 225, a)} y={60} w={180} h={26} label="second run" o={a} />
      <AnswerRow y={140} label="anything moves" answer={answer} value="no, nothing" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} text="the new row already matches the source" />
    </Svg>
  );
}

// 7 · Idempotency, measured. Run one counts up to 2 with its bar; run two stays at 0, a flat mark, and a tick lands.
export function RevealIdempotency({ t }: StepCtx) {
  const c1 = easeOut(seg(t, 0.6, 1.6));
  const k2 = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="run twice: nothing changes the second time" h={240}>
      <Row y={50} label="first run" value={`${num(2 * c1)} rows changed`} big k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={64} width={550 * c1} height={8} rx={3} fill={C.crema} opacity={0.8} />
      <Row y={120} label="second run" value="0 rows changed" valueColor={C.focus} big k={k2} />
      <rect x={25} y={134} width={3} height={8} rx={1} fill={C.focus} opacity={k2} />
      <Row y={195} label="safety" value="demonstrated, not assumed" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      <Tick y={150} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 8 · Hash diff. Five tracked columns funnel into one fingerprint; stored and incoming fingerprints sit side by side; one
// column changes, the incoming fingerprint turns red, and the two no longer match.
export function RevealHashDiff({ t }: StepCtx) {
  const ch = easeOut(seg(t, 2.4, 2.8));
  const ne = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="one hash, instead of one check per column" h={250}>
      <Row y={40} label="every tracked column" value="one fingerprint" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="fingerprint differs" value="something changed" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      {[0, 1, 2, 3, 4].map((i) => {
        const k = easeOut(seg(t, 0.5 + i * 0.12, 0.8 + i * 0.12));
        const f = easeInOut(seg(t, 1.2, 1.8));
        const x = 25 + i * 50;
        const hot = i === 2 && ch > 0;
        return (
          <g key={i}>
            <rect x={x} y={125} width={40} height={24} rx={3} fill={C.cocoa} stroke={hot ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={k} />
            <line x1={x + 20} y1={149} x2={lerp(x + 20, 135, f)} y2={lerp(149, 190, f)} stroke={hot ? C.cherryText : C.mocha} strokeWidth={1.2} opacity={f > 0 ? 1 : 0} />
          </g>
        );
      })}
      <Cell x={75} y={190} w={120} h={28} label="incoming" o={easeOut(seg(t, 1.6, 2.0))} stroke={ch > 0 ? C.cherryText : C.focus} f={ch > 0 ? C.cherryText : C.crema} />
      <Cell x={415} y={190} w={160} h={28} label="stored" o={easeOut(seg(t, 1.8, 2.2))} stroke={C.focus} />
      <T x={305} y={210} s={20} f={ne > 0 ? C.cherryText : C.focus} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        {ne > 0 ? '≠' : '='}
      </T>
      <T x={575} y={140} s={12} f={C.latte} a="end" o={easeOut(seg(t, 3.8, 4.2))}>
        no per-column checklist
      </T>
    </Svg>
  );
}

const ARRIVAL = ['B', 'A', 'C', 'A'];

// 9 · Predict: scrambled and repeated. Four events land in arrival order, one of them a repeat; then the question.
export function PredictReplayOrder({ t, answer }: StepCtx) {
  return (
    <Svg label="out of order, duplicated — still comes out right?" h={210}>
      <Row y={40} label="arrives scrambled" value="one event twice" k={easeOut(seg(t, 0.1, 0.5))} />
      {ARRIVAL.map((v, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.25, 0.7 + i * 0.25));
        return (
          <g key={i} transform={`translate(${((1 - k) * 30).toFixed(1)} 0)`}>
            <Cell x={25 + i * 110} y={60} w={95} h={26} label={`change ${v}`} o={k} stroke={i === 3 ? C.cherryText : C.mocha} />
          </g>
        );
      })}
      <AnswerRow y={140} label="history comes out right" answer={answer} value="yes, still right" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} text="rebuilt from each event's own time" />
    </Svg>
  );
}

// 10 · The replay, measured. The four arrivals; the repeat strikes out; the three left slide into time order A, B, C and
// chain together; the count lands at 3.
export function RevealReplayMeasured({ t }: StepCtx) {
  const dup = easeOut(seg(t, 1.2, 1.7));
  const mv = easeInOut(seg(t, 1.9, 2.9));
  const ch = easeInOut(seg(t, 2.9, 3.4));
  const c = easeOut(seg(t, 3.2, 3.9));
  const sorted: Record<string, number> = { A: 0, B: 1, C: 2 };
  return (
    <Svg label="duplicate removed, order rebuilt, correctly" h={250}>
      <Row y={40} label="fed scrambled" value="four, one a repeat" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="versions out" value={num(3 * c)} valueColor={C.focus} big k={easeOut(seg(t, 3.2, 3.5))} />
      {ARRIVAL.map((v, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15));
        if (i === 3)
          return (
            <g key={i} opacity={k * (1 - 0.7 * dup)}>
              <Cell x={25 + i * 140} y={120} w={110} h={26} label={`change ${v}`} stroke={C.cherryText} />
              <line x1={30 + i * 140} y1={133} x2={lerp(30, 130, dup) + i * 140} y2={133} stroke={C.cherryText} strokeWidth={2} opacity={dup > 0 ? 1 : 0} />
            </g>
          );
        const x = lerp(25 + i * 140, 25 + sorted[v] * 170, mv);
        const y = lerp(120, 190, mv);
        return <Cell key={i} x={x} y={y} w={110} h={26} label={`change ${v}`} o={k} stroke={mv >= 1 ? C.focus : C.mocha} />;
      })}
      {[0, 1].map((i) => (
        <line key={i} x1={135 + i * 170} y1={203} x2={135 + i * 170 + 60 * ch} y2={203} stroke={C.focus} strokeWidth={2} />
      ))}
      <T x={25} y={237} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        ordered by when each was true
      </T>
    </Svg>
  );
}

// 11 · As-of. Three windows side by side on a time line; a date marker drops into the middle one; it lights, and that version
// comes back.
export function RevealAsOf({ t }: StepCtx) {
  const d = easeOutBack(seg(t, 1.6, 2.2));
  const hit = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="a date inside the window: the right version" h={250}>
      <Row y={40} label="a date" value="inside the middle window" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the query hands back" value="exactly that version" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {['A', 'B', 'C'].map((v, i) => {
        const k = easeOut(seg(t, 0.5 + i * 0.25, 0.9 + i * 0.25));
        const on = i === 1 && hit > 0;
        return (
          <g key={v}>
            <rect x={25 + i * 185} y={170} width={175 * k} height={28} rx={3} fill={C.cocoa} stroke={on ? C.focus : C.mocha} strokeWidth={on ? 1.5 + 1.5 * hit : 1.5} />
            <T x={112 + i * 185} y={189} s={12} f={on ? C.focus : C.crema} a="middle" o={k}>
              {`version ${v}`}
            </T>
          </g>
        );
      })}
      <line x1={302} y1={lerp(118, 162, d)} x2={302} y2={lerp(118, 206, d)} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.6, 1.8))} />
      <T x={302} y={lerp(112, 156, clamp(d))} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.6, 1.8))}>
        as of
      </T>
      <T x={25} y={232} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        not the one before, not the one after
      </T>
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="new row, atomic merge, order-independent" h={220}>
      <Row y={50} label="each change" value="its own new row" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="one command" value="atomic, rerun-safe" k={easeOut(seg(t, 1.9, 2.4))} />
      <Row y={170} label="rebuild" value="survives disorder, repeats" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 13 · Prove: the whole feed twice. Two copies of the four events; after the answer the second copy and the repeat fade,
// the three versions remain, and the verdict lands with a tick.
export function ProveFullDuplicateFeed({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const f = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const feed = [...ARRIVAL, ...ARRIVAL];
  const keep = [0, 1, 2];
  return (
    <Svg label="the whole feed, duplicated start to finish" h={230}>
      <Row y={40} label="entire feed" value="arrives a second time" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="same history" answer={answer} value="yes, converges" k={easeOut(seg(t, 0.4, 0.9))} />
      {feed.map((v, i) => (
        <Cell
          key={i}
          x={25 + i * 69}
          y={115}
          w={60}
          h={26}
          label={v}
          o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1)) * (keep.includes(i) ? 1 : 1 - 0.75 * f)}
          stroke={keep.includes(i) && f > 0 ? C.focus : C.mocha}
        />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            dedup drops every repeat alike: 3 left
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={150} k={tick} />
        </>
      )}
    </Svg>
  );
}
