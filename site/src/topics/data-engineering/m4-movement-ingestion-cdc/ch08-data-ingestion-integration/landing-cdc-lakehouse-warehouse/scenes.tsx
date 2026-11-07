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
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** `n` record squares from x at y, `k` of them shown. */
function Recs({ x, y, k, n = 5, f = C.latte, gap = 18 }: { x: number; y: number; k: number; n?: number; f?: string; gap?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * gap} y={y} width={14} height={14} rx={2} fill={f} opacity={clamp(k * n - i, 0, 1)} />
      ))}
    </g>
  );
}

/** A pip travelling from (x1, y1) to (x2, y2) while 0 < p < 1. */
function Pip({ x1, y1, x2, y2, p, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; p: number; f?: string }) {
  if (p <= 0 || p >= 1) return null;
  return <rect x={lerp(x1, x2, p) - 7} y={lerp(y1, y2, p) - 7} width={14} height={14} rx={2} fill={f} />;
}

// 0 · Hook. The newer change reaches the table first and lands; the replayed older one arrives after and overwrites it,
// in cherry. Everything upstream was right.
export function Hook({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.3));
  const b = easeInOut(seg(t, 1.8, 2.5));
  const label = b >= 1 ? 'order 1: v1' : a >= 1 ? 'order 1: v3' : 'order 1';
  return (
    <Svg label="a replayed batch and a live event for the same order arrive in opposite order, and the lakehouse keeps the older value." h={200}>
      <Cell x={25} y={30} w={140} label="v3, newer" o={easeOut(seg(t, 0.1, 0.4))} stroke={C.focus} />
      <Cell x={25} y={110} w={140} label="v1, replayed" o={easeOut(seg(t, 1.3, 1.6))} />
      <line x1={165} y1={44} x2={400} y2={84} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.6))} />
      <line x1={165} y1={124} x2={400} y2={104} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.5, 1.7))} />
      <Pip x1={175} y1={46} x2={390} y2={83} p={a} f={C.focus} />
      <Pip x1={175} y1={123} x2={390} y2={105} p={b} />
      <Cell x={400} y={80} w={150} label={label} o={easeOut(seg(t, 0.2, 0.5))} stroke={b >= 1 ? C.cherryText : a >= 1 ? C.focus : C.mocha} f={b >= 1 ? C.cherryText : C.crema} />
      <T x={300} y={185} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.7))}>
        upstream was right; the landing kept the old one
      </T>
    </Svg>
  );
}

// 1 · Predict. Append log, a waiting bar, MERGE, the table. On answer the table turns cherry: the last merged still wins.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="does landing by append-then-MERGE protect against this on its own, or can the same arrival-order bug still reach it?" h={200}>
      <Cell x={25} y={40} w={150} label="append log" o={easeOut(seg(t, 0, 0.3))} />
      <rect x={195} y={49} width={125} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <rect x={195} y={49} width={125 * easeInOut(seg(t, 0.4, 1.4))} height={10} rx={3} fill={C.latte} />
      <T x={257} y={84} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        wait
      </T>
      <Cell x={340} y={40} w={90} label="MERGE" o={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={450} y={40} w={100} label={v > 0 ? 'v1' : 'table'} o={easeOut(seg(t, 1.3, 1.6))} stroke={v > 0 ? C.cherryText : C.mocha} f={v > 0 ? C.cherryText : C.crema} />
      {v > 0 && (
        <T x={550} y={100} s={11} f={C.cherryText} a="end" o={v}>
          last merged still wins
        </T>
      )}
      <AnswerRow y={178} label="safe by waiting?" answer={answer} value="no, same bug" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Append, then MERGE. Four changes slide into the append-only table; a few-minutes bar fills; the latest change
// lights and MERGE carries it into the one current row.
export function RevealAppendMerge({ t }: StepCtx) {
  const timer = easeInOut(seg(t, 1.7, 2.6));
  const pick = easeOut(seg(t, 2.6, 2.9));
  return (
    <Svg label="every change lands in an append-only table first; every few minutes, MERGE takes the latest change per key into the current-state table." h={220}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        append-only changes
      </T>
      <rect x={25} y={36} width={300} height={40} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2, 3].map((i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3));
        return <rect key={i} x={lerp(15, 40 + i * 30, k)} y={49} width={14} height={14} rx={2} fill={i === 3 && pick > 0 ? C.focus : C.latte} opacity={k} />;
      })}
      <rect x={25} y={100} width={300} height={8} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.5, 1.7))} />
      <rect x={25} y={100} width={300 * timer} height={8} rx={3} fill={C.latte} />
      <T x={25} y={128} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        every few minutes
      </T>
      <Req x1={335} x2={395} y={56} k={easeOut(seg(t, 2.8, 3.2))} label="MERGE" />
      <Cell x={405} y={42} w={145} label="1: a-updated" o={easeOut(seg(t, 3.1, 3.5))} stroke={C.focus} />
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.2))}>
        four changes in, one current row out
      </T>
    </Svg>
  );
}

// 3 · Streaming upsert. Three files land at once, the third with a marker arcing back to the first; a read merges them
// on the spot; then compaction strikes the superseded file: three rows on disk become two.
export function RevealStreamingUpsert({ t }: StepCtx) {
  const files = ['insert 1', 'insert 2', 'update 1'];
  const arc = easeOut(seg(t, 1.2, 1.6));
  const strike = easeOut(seg(t, 3.3, 3.6));
  const gone = 1 - easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="a streaming upsert writes each change as a new data file plus a marker for whatever row it replaces, current within seconds, merged at read time until compaction." h={220}>
      {files.map((f, i) =>
        i === 0 && gone <= 0 ? null : (
          <g key={f} opacity={i === 0 ? gone : 1}>
            <Cell
              x={25 + i * 110}
              y={lerp(32, 40, easeOut(seg(t, 0.2 + i * 0.35, 0.5 + i * 0.35)))}
              w={100}
              label={f}
              o={easeOut(seg(t, 0.2 + i * 0.35, 0.5 + i * 0.35))}
              stroke={i === 2 ? C.second : C.mocha}
            />
          </g>
        ),
      )}
      {gone > 0 && <path d="M295 74 Q185 112 75 74" fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="200" strokeDashoffset={200 * (1 - arc)} opacity={gone} />}
      {gone > 0 && (
        <T x={185} y={118} s={11} f={C.second} a="middle" o={arc * gone}>
          marker: replaces insert 1
        </T>
      )}
      <Cross x={112} y={54} k={strike * gone} />
      <Req x1={355} x2={398} y={54} k={easeOut(seg(t, 1.8, 2.2))} label="read" />
      <Cell x={405} y={40} w={145} label="1: a-updated" o={easeOut(seg(t, 2.1, 2.4))} stroke={C.focus} />
      <Cell x={405} y={74} w={145} label="2: b" o={easeOut(seg(t, 2.3, 2.6))} stroke={C.focus} />
      <T x={405} y={124} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        merged at read time
      </T>
      <T x={25} y={170} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>
        compaction: 3 rows on disk, then 2
      </T>
    </Svg>
  );
}

// 4 · LSN ordering. Merged by LSN, forward and reversed feeds both end at v3; merged by arrival, the reversed feed ends
// at v1, in cherry.
export function RevealLsnOrdering({ t }: StepCtx) {
  const rows: [string, string[], string, number, boolean][] = [
    ['forward', ['v1', 'v2', 'v3'], 'v3', 0.2, true],
    ['reversed', ['v3', 'v2', 'v1'], 'v3', 1.5, true],
    ['reversed', ['v3', 'v2', 'v1'], 'v1', 3.0, false],
  ];
  return (
    <Svg label="the MERGE compares source LSN, not arrival order; an older event never overwrites a newer row, in either order it's replayed." h={200}>
      {rows.map(([name, evs, out, k0, ok], r) => {
        const y = r < 2 ? 30 + r * 50 : 145;
        const ko = easeOut(seg(t, k0 + 1.0, k0 + 1.3));
        return (
          <g key={r}>
            <T x={25} y={y + 19} s={12} f={ok ? C.crema : C.cherryText} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            {evs.map((e, i) => {
              const k = easeOut(seg(t, k0 + 0.1 + i * 0.2, k0 + 0.4 + i * 0.2));
              return <Cell key={i} x={lerp(100, 110, k) + i * 66} y={y} w={58} label={e} o={k} />;
            })}
            <Req x1={320} x2={430} y={y + 14} k={easeOut(seg(t, k0 + 0.7, k0 + 1.0))} label={ok ? 'by LSN' : 'by arrival'} f={ok ? C.crema : C.cherryText} />
            <Cell x={440} y={lerp(y - 6, y, ko)} w={110} label={out} o={ko} stroke={ok ? C.focus : C.cherryText} f={ok ? C.focus : C.cherryText} />
          </g>
        );
      })}
      <line x1={25} y1={130} x2={550} y2={130} stroke={C.mocha} strokeWidth={1} opacity={easeOut(seg(t, 2.8, 3.0))} />
    </Svg>
  );
}

// 5 · Compaction cost. Streaming upsert: leftover rows grow with the update rate, 20 against 100. Append-then-merge: the
// current table stays at 20 either way.
export function RevealCompactionCost({ t }: StepCtx) {
  const bars: [string, number, string, number, number][] = [
    ['1 update each', 50, '20', 50, 0.3],
    ['5 updates each', 250, '100', 90, 0.9],
    ['1 update each', 50, '20', 160, 2.4],
    ['5 updates each', 50, '20', 195, 2.9],
  ];
  return (
    <Svg label="a table whose rows change often produces proportionally more files for compaction to rewrite; append-then-merge's own current table never grows with update rate." h={220}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        streaming upsert: leftover rows
      </T>
      <T x={25} y={134} s={11} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        append-then-merge: current rows
      </T>
      {bars.map(([name, w, val, y, k0], i) => {
        const g = easeInOut(seg(t, k0 + 0.2, k0 + 0.9));
        const bad = i === 1;
        return (
          <g key={i}>
            <T x={25} y={y} s={12} f={C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            <rect x={200} y={y - 12} width={w * g} height={14} rx={2} fill={bad ? C.cherryText : C.latte} />
            <T x={210 + w} y={y} s={12} f={bad ? C.cherryText : C.crema} o={easeOut(seg(t, k0 + 0.8, k0 + 1.0))}>
              {val}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Warehouse-native. BigQuery: UPSERT and DELETE fall onto a row by its declared key. Snowpipe Streaming: two
// channels, each carrying its records in order, exactly once.
export function RevealWarehouseNative({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 1.3, 1.8));
  return (
    <Svg label="BigQuery accepts UPSERT and DELETE on a declared primary key; Snowpipe Streaming's Named Channels give ordered, exactly-once ingestion by offset token." h={220}>
      <T x={25} y={24} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        BigQuery
      </T>
      <Cell x={25} y={34} w={250} label="declared primary key" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.second} />
      <Cell x={25} y={80} w={120} label="UPSERT" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={155} y={80} w={120} label="DELETE" o={easeOut(seg(t, 0.8, 1.1))} />
      {drop > 0 && drop < 1 && <rect x={78} y={lerp(110, 128, drop)} width={14} height={14} rx={2} fill={C.focus} />}
      <Cell x={25} y={146} w={250} label="the row, by its key" o={easeOut(seg(t, 1.6, 1.9))} stroke={drop >= 1 ? C.focus : C.mocha} />
      <T x={305} y={24} s={12} f={C.crema} o={easeOut(seg(t, 2.2, 2.5))}>
        Snowpipe Streaming
      </T>
      {[0, 1].map((c) => {
        const y = 34 + c * 46;
        return (
          <g key={c}>
            <rect x={305} y={y} width={245} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.3 + c * 0.2, 2.6 + c * 0.2))} />
            <Recs x={315} y={y + 7} k={easeOut(seg(t, 2.7 + c * 0.3, 3.5 + c * 0.3))} n={6} gap={38} f={c === 0 ? C.focus : C.second} />
          </g>
        );
      })}
      <T x={305} y={150} s={11} f={C.latte} o={easeOut(seg(t, 3.7, 4.0))}>
        ordered, by offset token
      </T>
      <T x={305} y={172} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.2))}>
        exactly once per channel
      </T>
    </Svg>
  );
}

// 7 · Topic to table. Changes flow from the topic into a managed box and out as a table; then the box's inside shows,
// faintly, the same merge choice.
export function RevealTopicToTable({ t }: StepCtx) {
  const flow = seg(t, 0.8, 1.6);
  return (
    <Svg label="a third way to the same table: turning a change topic directly into one, without a team writing the merge by hand at all." h={200}>
      <Cell x={25} y={70} w={140} label="change topic" o={easeOut(seg(t, 0, 0.3))} />
      <rect x={200} y={30} width={190} height={110} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 3" opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={212} y={50} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        managed
      </T>
      {[0, 1, 2].map((i) => (
        <Pip key={i} x1={172} y1={84} x2={196} y2={84} p={clamp(flow * 3 - i, 0, 1)} />
      ))}
      <Req x1={395} x2={415} y={84} k={easeOut(seg(t, 1.8, 2.2))} />
      <Cell x={420} y={70} w={130} label="table" o={easeOut(seg(t, 2.0, 2.4))} stroke={C.focus} />
      <T x={295} y={95} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.6)) * 0.7}>
        the same merge choice
      </T>
      <T x={300} y={180} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 3.9, 4.4))}>
        made where the team never looks
      </T>
    </Svg>
  );
}

// 8 · Recap. Five lines, one by one; the LSN tiebreak outlined.
export function Recap({ t }: StepCtx) {
  const rows = [
    'append, then MERGE every few minutes',
    'streaming upsert: fresh, merged on read',
    'compare LSN, never arrival order',
    'compaction pays for frequent updates',
    'warehouse-native: the choice built in',
  ];
  return (
    <Svg label="append-then-merge, streaming upserts, the LSN tiebreak, compaction's own cost, and two warehouse-native paths — all one choice, made several ways." h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.75, 0.6 + i * 0.75));
        return <Cell key={i} x={25} y={lerp(20, 28, k) + i * 46} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}

// 9 · Prove it. Current rows hold flat; on answer the leftover bar keeps growing in cherry, an arrow at its end.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const w = 40 + 300 * v;
  return (
    <Svg label="a table's rows now change fifty times a day each, and the team never runs compaction. Which cost grows without bound?" h={200}>
      <T x={25} y={50} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        current rows
      </T>
      <rect x={200} y={38} width={40 * easeOut(seg(t, 0.2, 0.6))} height={14} rx={2} fill={C.latte} />
      <T x={25} y={100} s={12} f={C.crema} o={easeOut(seg(t, 0.4, 0.7))}>
        leftover rows
      </T>
      <rect x={200} y={88} width={w * easeOut(seg(t, 0.6, 1.0))} height={14} rx={2} fill={v > 0 ? C.cherryText : C.latte} />
      {v > 0 && <path d={`M${200 + w + 4} 88 l10 7 l-10 7 z`} fill={C.cherryText} opacity={v} />}
      <AnswerRow y={178} label="grows unbounded" answer={answer} value="the leftovers" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
