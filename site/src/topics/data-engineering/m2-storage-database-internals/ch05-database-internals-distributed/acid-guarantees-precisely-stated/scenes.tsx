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

// 1 · Hook. Ten dollars leaves A for B, the power dies midway, and the coin is stranded; four letters land underneath.
export function Hook({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.4, 1.5));
  const dead = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="a transfer, crashed mid-flight. Four letters promise something about this." h={220}>
      <Cell x={25} y={60} w={160} h={40} label="account A" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={415} y={60} w={160} h={40} label="account B" o={easeOut(seg(t, 0.1, 0.4))} />
      <circle cx={lerp(185, 300, p)} cy={80} r={16} fill={C.cocoa} stroke={dead > 0.5 ? C.cherryText : C.focus} strokeWidth={2} opacity={p > 0 ? 1 : 0} />
      <T x={lerp(185, 300, p)} y={84} s={11} f={dead > 0.5 ? C.cherryText : C.focus} a="middle" o={p > 0 ? 1 : 0}>
        $10
      </T>
      <Cross x={300} y={124} k={dead} />
      <T x={300} y={150} s={11} f={C.cherryText} a="middle" o={dead}>
        power dies
      </T>
      {['A', 'C', 'I', 'D'].map((l, i) => (
        <Cell key={l} x={160 + i * 72} y={168} w={60} h={32} label={l} stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.6 + i * 0.3, 2.9 + i * 0.3))} />
      ))}
    </Svg>
  );
}

// 2 · Atomicity. The first UPDATE breaks a + b = 100 and errors; the second never runs; the half-made row is rolled away.
export function RevealAtomicity({ t }: StepCtx) {
  const g = easeOut(seg(t, 1.3, 1.7));
  const back = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="a real transfer, a real CHECK constraint, a transaction that fails partway." h={230}>
      <Row y={40} label="CHECK" value="a + b = 100" k={easeOut(seg(t, 0.2, 0.6))} />
      <Cell x={25} y={64} w={120} label="a = 40" o={easeOut(seg(t, 0.4, 0.7))} stroke={back > 0.5 ? C.focus : C.mocha} />
      <Cell x={165} y={64} w={120} label="b = 60" o={easeOut(seg(t, 0.4, 0.7))} stroke={back > 0.5 ? C.focus : C.mocha} />
      <Cell x={330} y={64} w={245} label="UPDATE a = a − 10" stroke={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))} />
      <Cell x={330} y={104} w={245} label="UPDATE b = b − 10" o={0.45 * easeOut(seg(t, 2.0, 2.3))} />
      <T x={452} y={152} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        never runs
      </T>
      <Cell x={25} y={104} w={120} label="a = 30" stroke={C.cherryText} f={C.cherryText} o={g * (1 - back)} />
      <T x={25} y={152} s={11} f={C.cherryText} o={easeOut(seg(t, 1.6, 1.9)) * (1 - back)}>
        30 + 60 = 90
      </T>
      <Row y={205} label="the row after" value="(40, 60), untouched" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 3 · Predict. The engine and the application side by side; after the answer both edges light up: the job is split.
export function PredictConsistencyOwner({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="the engine checks some rules. Who owns 'correct': the engine, or the application?" h={200}>
      <Row y={40} label="the engine checks" value="some rules" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={66} w={250} h={28} label="the engine" o={easeOut(seg(t, 0.5, 0.8))} stroke={a > 0.5 ? C.focus : C.mocha} />
      <Cell x={325} y={66} w={250} h={28} label="the application" o={easeOut(seg(t, 0.8, 1.1))} stroke={a > 0.5 ? C.focus : C.mocha} />
      <AnswerRow y={140} label="who owns correct" answer={answer} value="both, split" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="the engine: only what it was told" />
    </Svg>
  );
}

// 4 · The split. A declared rule is blocked; an undeclared one commits; then reserved's bar overshoots on hand's.
export function RevealConsistencySplit({ t }: StepCtx) {
  const b = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="a declared rule, blocked outright. An undeclared rule, never even seen." h={250}>
      <T x={25} y={80} s={13} f={C.crema} o={easeOut(seg(t, 0.3, 0.6))}>
        declared: on_hand ≥ 0
      </T>
      <Cell x={330} y={62} w={245} label="on_hand − 20: blocked" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={25} y={130} s={13} f={C.crema} o={easeOut(seg(t, 1.4, 1.7))}>
        never declared
      </T>
      <Cell x={330} y={112} w={245} label="reserved + 50: committed" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 1.9, 2.2))} />
      <T x={25} y={180} s={12} f={C.latte} o={b > 0 ? 1 : 0}>
        reserved
      </T>
      <rect x={120} y={168} width={53 * 4.5 * b} height={16} rx={3} fill={C.cherryText} />
      <T x={128 + 53 * 4.5} y={181} s={12} f={C.cherryText} o={seg(b, 0.7, 1)}>
        53
      </T>
      <T x={25} y={210} s={12} f={C.latte} o={b > 0 ? 1 : 0}>
        on hand
      </T>
      <rect x={120} y={198} width={10 * 4.5 * b} height={16} rx={3} fill={C.latte} />
      <T x={128 + 10 * 4.5} y={211} s={12} f={C.crema} o={seg(b, 0.7, 1)}>
        10
      </T>
      <T x={25} y={240} s={12} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        committed without a complaint
      </T>
    </Svg>
  );
}

// 5 · Isolation. Another transaction commits 110 between two reads; Read Committed's second read sees it, Repeatable Read's doesn't.
export function RevealIsolation({ t }: StepCtx) {
  const w = easeOut(seg(t, 1.3, 1.7));
  return (
    <Svg label="the identical interleaving, measured under two real isolation levels." h={240}>
      <T x={350} y={48} s={12} f={C.second} a="middle" o={w}>
        another transaction commits 110
      </T>
      <line x1={350} y1={58} x2={350} y2={170} stroke={C.second} strokeWidth={2} strokeDasharray="5 4" opacity={w} />
      <T x={25} y={97} s={13} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        Read Committed
      </T>
      <Cell x={200} y={78} w={100} label="100" o={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={400} y={78} w={100} label="110" stroke={C.second} f={C.second} o={easeOut(seg(t, 2.0, 2.3))} />
      <T x={25} y={152} s={13} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        Repeatable Read
      </T>
      <Cell x={200} y={133} w={100} label="100" o={easeOut(seg(t, 2.8, 3.1))} />
      <Cell x={400} y={133} w={100} label="100" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))} />
      <Row y={215} label="its own snapshot" value="kept the whole way" valueColor={C.focus} k={easeOut(seg(t, 3.8, 4.3))} />
    </Svg>
  );
}

// 6 · Durability. An insert commits and the WAL marker jumps forward; then a brand new connection reads the row straight back.
export function RevealDurability({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="a commit, measured: the WAL moves, and a brand new connection sees it too." h={230}>
      <T x={25} y={56} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        the server's write-ahead log
      </T>
      <rect x={25} y={66} width={550} height={18} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={25} y={66} width={lerp(175, 305, m)} height={18} rx={3} fill={C.second} opacity={easeOut(seg(t, 0.2, 0.5)) * 0.8} />
      <path d={`M${lerp(200, 330, m)} 88 l-6 10 h12 z`} fill={C.focus} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={345} y={115} s={11} f={C.focus} o={easeOut(seg(t, 1.9, 2.2))}>
        moved at the commit
      </T>
      <Cell x={25} y={106} w={250} label="INSERT, then COMMIT" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={325} y={146} w={250} label="a brand new connection" stroke={C.second} o={easeOut(seg(t, 2.5, 2.8))} />
      <Row y={210} label="it reads back" value="'committed'" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · Ten years. Two marks on a time axis, IMS at 1973 and the acronym at 1983; a bracket spans the gap.
export function RevealTenYearGap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const br = easeInOut(seg(t, 2.9, 3.6));
  return (
    <Svg label="the guarantees ran for a decade before the acronym existed." h={220}>
      <line x1={60} y1={110} x2={60 + 480 * a} y2={110} stroke={C.latte} strokeWidth={1.5} />
      <circle cx={110} cy={110} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={110} y={92} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        1973
      </T>
      <T x={110} y={138} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        IMS runs all four
      </T>
      <circle cx={490} cy={110} r={6} fill={C.second} opacity={easeOut(seg(t, 2.1, 2.4))} />
      <T x={490} y={92} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 2.1, 2.4))}>
        1983
      </T>
      <T x={490} y={138} s={12} f={C.second} a="middle" o={easeOut(seg(t, 2.3, 2.6))}>
        the acronym
      </T>
      <path d={`M110 165 v8 h${380 * br} v-8`} fill="none" stroke={C.focus} strokeWidth={2} opacity={br > 0 ? 1 : 0} />
      <T x={300} y={200} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        a decade with no name for it
      </T>
    </Svg>
  );
}

// 8 · Recap. Four rows, one per letter; consistency last, split.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four letters, four promises — one of them split between two layers." h={240}>
      <Row y={40} label="Atomicity" value="all or nothing" k={easeOut(seg(t, 0.5, 1.0))} />
      <Row y={95} label="Isolation" value="as if alone" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={150} label="Durability" value="survives a crash" k={easeOut(seg(t, 2.3, 2.8))} />
      <Row y={205} label="Consistency" value="engine and app, split" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}
