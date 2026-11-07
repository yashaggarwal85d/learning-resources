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

/** A small graph node with an 11px label. */
function Node({
  x,
  y,
  w = 125,
  label,
  o = 1,
  stroke = C.mocha,
  f = C.crema,
  dash = false,
}: {
  x: number;
  y: number;
  w?: number;
  label: string;
  o?: number;
  stroke?: string;
  f?: string;
  dash?: boolean;
}) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} strokeDasharray={dash ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + 17} s={11} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

const SEEDS = ['orders', 'customers', 'products'];

/** The lab's real DAG from the manifest: three seeds, three staging models, the fact, the revenue mart. `k(stage)` reveals each
 * column; `s(name)` styles one node: 'ok' | 'fail' | 'skip'. */
function Dag({ y, k, st = () => 'ok' }: { y: number; k: (c: number) => number; st?: (n: string) => string }) {
  const col = (n: string) => (st(n) === 'fail' ? C.cherryText : st(n) === 'skip' ? C.latte : C.mocha);
  const op = (n: string) => (st(n) === 'skip' ? 0.4 : 1);
  return (
    <g>
      {SEEDS.map((s, i) => (
        <g key={s}>
          <Node x={25} y={y + i * 40} label={`raw_${s}`} o={k(0)} />
          <line x1={150} y1={y + 13 + i * 40} x2={160} y2={y + 13 + i * 40} stroke={C.latte} strokeWidth={1.2} opacity={k(1)} />
          <Node x={160} y={y + i * 40} label={`stg_${s}`} o={k(1) * op(`stg_${s}`)} stroke={col(`stg_${s}`)} />
          <line x1={285} y1={y + 13 + i * 40} x2={305} y2={y + 53} stroke={C.latte} strokeWidth={1.2} opacity={k(2)} />
        </g>
      ))}
      <Node x={305} y={y + 40} label="fct_orders" o={k(2) * op('fct_orders')} stroke={col('fct_orders')} />
      <line x1={430} y1={y + 53} x2={450} y2={y + 53} stroke={C.latte} strokeWidth={1.2} opacity={k(3)} />
      <Node x={450} y={y + 40} label="revenue mart" o={k(3) * op('mart')} stroke={col('mart')} />
    </g>
  );
}

// 1 · Hook. A model file opens: one select line. Three things you'd expect are listed beside it and crossed out one by one.
export function Hook({ t }: StepCtx) {
  const MISSING = ['CREATE TABLE', 'schema name', 'connection string'];
  return (
    <Svg label="one select statement — no CREATE TABLE, no schema name, no connection string" h={250}>
      <Row y={40} label="a model file" value="one select statement" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the table" value="comes from where?" k={easeOut(seg(t, 3.2, 3.7))} />
      <rect x={25} y={118} width={250} height={110} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={40} y={146} s={12} f={C.crema} o={easeOut(seg(t, 0.7, 1.0))}>
        select …
      </T>
      <T x={40} y={168} s={12} f={C.crema} o={easeOut(seg(t, 0.9, 1.2))}>
        from …
      </T>
      {MISSING.map((m, i) => (
        <g key={m} opacity={easeOut(seg(t, 1.4 + i * 0.4, 1.7 + i * 0.4))}>
          <T x={325} y={140 + i * 34} s={13} f={C.latte}>
            {m}
          </T>
          <Cross x={560} y={135 + i * 34} k={easeOut(seg(t, 1.8 + i * 0.4, 2.1 + i * 0.4))} />
        </g>
      ))}
    </Svg>
  );
}

// 2 · The tool wraps it. The same select sits in the middle; the warehouse's create-or-replace wrapper closes round it; a table
// appears beside it.
export function RevealModelQuote({ t }: StepCtx) {
  const w = easeInOut(seg(t, 1.2, 2.0));
  const tb = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="a select statement — dbt wraps it in the warehouse's own DDL and DML" h={250}>
      <Row y={40} label="a model" value="just a select" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the tool wraps it" value="in the warehouse's DDL" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <Cell x={65} y={158} w={170} h={30} label="select … from …" o={easeOut(seg(t, 0.4, 0.8))} />
      <rect x={lerp(65, 25, w)} y={lerp(158, 120, w)} width={lerp(170, 250, w)} height={lerp(30, 106, w)} rx={6} fill="none" stroke={C.focus} strokeWidth={2} opacity={w} />
      <T x={40} y={140} s={11} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
        create or replace … as (
      </T>
      <T x={40} y={214} s={11} f={C.focus} o={easeOut(seg(t, 1.9, 2.2))}>
        )
      </T>
      <line x1={275} y1={173} x2={lerp(275, 375, tb)} y2={173} stroke={C.focus} strokeWidth={1.5} />
      <g opacity={tb}>
        {[0, 1, 2].map((r) => (
          <rect key={r} x={375} y={148 + r * 18} width={200} height={14} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1} />
        ))}
        <T x={475} y={218} s={11} f={C.latte} a="middle">
          a real table
        </T>
      </g>
    </Svg>
  );
}

// 3 · Predict: does a table name count? One model reads another by its plain table name; a dashed, unseen edge; the question.
export function PredictTableName({ t, answer }: StepCtx) {
  return (
    <Svg label="one model selects another by its table name — does dbt see that as a dependency?" h={210}>
      <Row y={40} label="from stg_orders, plainly" value="a dependency?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Node x={25} y={60} w={170} label="stg_orders" o={easeOut(seg(t, 0.2, 0.5))} />
      <Node x={405} y={60} w={170} label="a new model" o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={195} y1={73} x2={lerp(195, 405, easeInOut(seg(t, 0.7, 1.3)))} y2={73} stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      <AnswerRow y={140} label="dbt sees it" answer={answer} value="no, only via ref()" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a plain table name stays invisible" />
    </Svg>
  );
}

// 4 · ref(), not table names. The three staging models; fct_orders; each join draws in turn, each one labelled ref().
export function RevealLabRef({ t }: StepCtx) {
  return (
    <Svg label="the lab's fact model — three joins, every one of them through ref()" h={250}>
      <Row y={40} label="fct_orders" value="three joins" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="every one" value="through ref()" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {SEEDS.map((s, i) => {
        const l = easeInOut(seg(t, 1.0 + i * 0.6, 1.6 + i * 0.6));
        const y = 115 + i * 40;
        return (
          <g key={s}>
            <Node x={25} y={y} w={150} label={`stg_${s}`} o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))} stroke={l >= 1 ? C.focus : C.mocha} />
            <line x1={175} y1={y + 13} x2={lerp(175, 425, l)} y2={lerp(y + 13, 168, l)} stroke={C.focus} strokeWidth={1.5} />
            <T x={300} y={lerp(y + 13, 168, 0.5) - 6} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.4 + i * 0.6, 1.7 + i * 0.6))}>
              {`ref('stg_${s}')`}
            </T>
          </g>
        );
      })}
      <Node x={425} y={155} w={150} label="fct_orders" o={easeOut(seg(t, 0.6, 0.9))} stroke={C.focus} />
    </Svg>
  );
}

// 5 · The DAG. Read from the build's own manifest: seeds, then staging, then the fact, then the mart, column by column.
export function RevealDag({ t }: StepCtx) {
  return (
    <Svg label="the DAG — read from dbt's own manifest after a real build, not hand-drawn" h={250}>
      <Row y={40} label="the DAG" value="read from the manifest" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a plain table name" value="invisible to it" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
      <Dag y={115} k={(c) => easeOut(seg(t, 0.8 + c * 0.6, 1.2 + c * 0.6))} />
    </Svg>
  );
}

// 6 · Predict: edit every caller? One macro, one model calling it; then the question.
export function PredictMacroEdit({ t, answer }: StepCtx) {
  return (
    <Svg label="one macro, called from one model's SQL — change it everywhere it's called?" h={210}>
      <Row y={40} label="change the macro" value="edit every caller?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Node x={25} y={60} w={200} label="cents_to_dollars" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      <line x1={225} y1={73} x2={lerp(225, 405, easeInOut(seg(t, 0.6, 1.2)))} y2={73} stroke={C.focus} strokeWidth={1.5} />
      <Node x={405} y={60} w={170} label="stg_orders" o={easeOut(seg(t, 1.0, 1.3))} />
      <AnswerRow y={140} label="edit every caller" answer={answer} value="no, just the macro" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="every caller changes with it" />
    </Svg>
  );
}

// 7 · The macro. Its body, once; stg_orders calls it; order 9's 4599 cents runs through and comes out as 45.99.
export function RevealMacroQuote({ t }: StepCtx) {
  const p = easeInOut(seg(t, 2.0, 3.0));
  const out = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="reused code, not repeated — the lab's own cents-to-dollars macro, called once" h={250}>
      <Row y={40} label="macros" value="reused, not repeated" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="order 9" value="4599 cents → 45.99" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={175} y={122} w={250} h={30} label="round(cents / 100.0, 2)" o={easeOut(seg(t, 0.5, 0.9))} stroke={C.focus} />
      <T x={300} y={170} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        cents_to_dollars, defined once
      </T>
      <Node x={25} y={195} w={150} label="4599" o={easeOut(seg(t, 1.6, 1.9))} />
      <circle cx={lerp(175, 425, p)} cy={208} r={5} fill={C.crema} opacity={p > 0 && p < 1 ? 1 : 0} />
      <line x1={175} y1={208} x2={425} y2={208} stroke={C.latte} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.8, 2.0))} />
      <Node x={425} y={195} w={150} label="45.99" o={out} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 8 · Predict: build on bad data? The DAG with a failing test on stg_orders; then the question.
export function PredictFailBlocks({ t, answer }: StepCtx) {
  return (
    <Svg label="a failing data test, one bad row — does dbt still build what's downstream?" h={210}>
      <Row y={40} label="one test fails" value="build downstream?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Node x={25} y={60} w={170} label="stg_orders · test" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.cherryText} />
      <Cross x={210} y={73} k={easeOut(seg(t, 0.6, 0.9))} />
      <Node x={235} y={60} w={160} label="fct_orders" o={easeOut(seg(t, 0.4, 0.7))} />
      <Node x={415} y={60} w={160} label="revenue mart" o={easeOut(seg(t, 0.5, 0.8))} />
      <AnswerRow y={140} label="still builds" answer={answer} value="no, skipped" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="everything downstream is skipped" />
    </Svg>
  );
}

// 9 · The test blocks. A row pointing at a customer who doesn't exist drops into the orders seed; the relationships test on
// stg_orders fails red; everything downstream greys to skipped, along with the dashboard that reads the mart.
export function RevealTestBlocks({ t }: StepCtx) {
  const bad = easeOutBack(seg(t, 0.8, 1.3));
  const f = easeOut(seg(t, 1.8, 2.2));
  const sk = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="a dangling id, a failing relationships test — everything downstream skipped, nothing built" h={250}>
      <Row y={40} label="relationships test" value="fails: no such customer" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={85} label="everything downstream" value="skipped" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      <Dag y={118} k={() => easeOut(seg(t, 0.3, 0.7))} st={(n) => (n === 'stg_orders' && f > 0 ? 'fail' : (n === 'fct_orders' || n === 'mart') && sk > 0 ? 'skip' : 'ok')} />
      <circle cx={140} cy={lerp(100, 120, clamp(bad))} r={5} fill={C.cherryText} opacity={clamp(bad * 2)} />
      <Node x={450} y={198} w={125} label="dashboard" o={easeOut(seg(t, 0.4, 0.8)) * (sk > 0 ? 0.4 : 1)} dash stroke={C.latte} />
      <line x1={512} y1={184} x2={512} y2={198} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

// 10 · The unit test. Three fabricated rows run through the macro's logic and tick against their expected values; the real
// seeded data sits locked beside them, untouched.
export function RevealUnitTest({ t }: StepCtx) {
  return (
    <Svg label="fixed, fabricated rows — the macro's own logic checked before any real data loads" h={250}>
      <Row y={40} label="unit test" value="fabricated rows only" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="real seeded data" value="never touched" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {[0, 1, 2].map((i) => {
        const p = easeInOut(seg(t, 0.9 + i * 0.5, 1.5 + i * 0.5));
        return (
          <g key={i}>
            <rect
              x={25}
              y={118 + i * 36}
              width={110}
              height={24}
              rx={3}
              fill="none"
              stroke={C.second}
              strokeWidth={1.2}
              strokeDasharray="4 3"
              opacity={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))}
            />
            <T x={80} y={134 + i * 36} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))}>
              fabricated
            </T>
            <line x1={135} y1={130 + i * 36} x2={lerp(135, 290, p)} y2={130 + i * 36} stroke={C.focus} strokeWidth={1.5} />
            <path
              d={`M300 ${127 + i * 36} l5 5 l10 -11`}
              fill="none"
              stroke={C.focus}
              strokeWidth={2.5}
              strokeDasharray="25"
              strokeDashoffset={25 * (1 - easeOut(seg(t, 1.5 + i * 0.5, 1.8 + i * 0.5)))}
            />
          </g>
        );
      })}
      <rect x={405} y={130} width={170} height={70} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.4, 2.8)) * 0.6} />
      <T x={490} y={170} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        seeded data
      </T>
      <g opacity={easeOutBack(seg(t, 2.8, 3.2)) > 0 ? clamp(easeOut(seg(t, 2.8, 3.2))) : 0} transform="translate(490 222)">
        <path d="M-6 0 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke={C.focus} strokeWidth={2} />
        <rect x={-9} y={0} width={18} height={13} rx={2} fill={C.focus} />
      </g>
    </Svg>
  );
}

// 11 · Docs and Mesh. A docs page builds three tabs: code, the DAG, column tests; then two separate projects link, the link
// tagged with contracts, versions and access.
export function RevealDocsMesh({ t }: StepCtx) {
  const TABS = ['model code', 'the DAG', 'column tests'];
  const l = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="generated docs — model code, the DAG, column tests; dbt Mesh named across projects" h={250}>
      <Row y={40} label="generated docs" value="code, DAG, tests" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="across projects" value="dbt Mesh" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {TABS.map((tb, i) => (
        <Node key={tb} x={25 + i * 120} y={120} w={110} label={tb} o={easeOut(seg(t, 0.8 + i * 0.35, 1.1 + i * 0.35))} stroke={i === 1 ? C.focus : C.mocha} />
      ))}
      <Node x={25} y={190} w={150} label="project A" o={easeOut(seg(t, 2.3, 2.6))} />
      <Node x={425} y={190} w={150} label="project B" o={easeOut(seg(t, 2.4, 2.7))} />
      <line x1={175} y1={203} x2={lerp(175, 425, l)} y2={203} stroke={C.focus} strokeWidth={2} />
      <T x={300} y={196} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        contracts · versions · access
      </T>
    </Svg>
  );
}

// 12 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ref() is the only dependency dbt sees; one macro; one failing test, a hard stop; the same graph, browsable" h={240}>
      <Row y={40} label="ref()" value="the only edge it sees" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={95} label="one macro" value="changes everywhere" k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="one failed test" value="a hard stop" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="the docs" value="the same graph, browsable" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 13 · Prove: table names, many threads. Two lanes start together: stg_orders still building while the new model already
// reads it; after the answer the new model goes red, and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const r = answer !== null ? easeOut(seg(s, 0.1, 0.4)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const a = easeInOut(seg(t, 0.5, 2.2));
  const b = easeInOut(seg(t, 0.5, 1.0));
  return (
    <Svg label="a new model, table names instead of ref(), built with several threads at once — what happens?" h={230}>
      <Row y={40} label="table names, many threads" value="what happens?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="it" answer={answer} value="can fail, racing" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={160} y={112} width={415 * a} height={14} rx={3} fill={C.latte} opacity={0.6} />
      <rect x={160} y={134} width={160 * b} height={14} rx={3} fill={r > 0 ? C.cherryText : C.second} opacity={0.7} />
      <T x={25} y={124} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        stg_orders
      </T>
      <T x={25} y={146} s={11} f={r > 0 ? C.cherryText : C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        new model
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            it ran before what it reads
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={164} k={tick} />
        </>
      )}
    </Svg>
  );
}
