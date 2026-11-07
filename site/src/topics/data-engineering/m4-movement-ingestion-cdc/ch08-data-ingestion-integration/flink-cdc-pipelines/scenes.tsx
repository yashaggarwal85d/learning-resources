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

/** An on/off switch whose knob slides right as `on` goes 0 → 1. */
function Toggle({ x, y, on, o = 1, dashed = false }: { x: number; y: number; on: number; o?: number; dashed?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={52} height={26} rx={13} fill="none" stroke={on >= 1 ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray={dashed ? '4 3' : undefined} />
      <circle cx={lerp(x + 13, x + 39, on)} cy={y + 13} r={8} fill={on >= 1 ? C.focus : C.mocha} />
    </g>
  );
}

// 0 · Hook. Five boxes join into a chain, source to table. The middle three are ringed in cherry; under them an effort
// bar grows long while the two ends stay short.
export function Hook({ t }: StepCtx) {
  const chain: [string, number, number][] = [
    ['MySQL', 25, 95],
    ['Debezium', 135, 110],
    ['Kafka', 260, 95],
    ['sink', 370, 80],
    ['Iceberg', 465, 90],
  ];
  const ring = easeOut(seg(t, 2.0, 2.5));
  const grow = easeInOut(seg(t, 2.8, 3.8));
  return (
    <Svg label="a team runs Debezium, Kafka and a sink connector to copy one MySQL database into Iceberg, and spends more time on the middle than on the data." h={220}>
      {chain.map(([n, x, w], i) => (
        <Cell
          key={n}
          x={x}
          y={lerp(50, 60, easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3)))}
          w={w}
          label={n}
          o={easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3))}
          stroke={i === 0 || i === 4 ? C.focus : C.mocha}
        />
      ))}
      <rect x={128} y={50} width={329} height={48} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="5 3" opacity={ring} />
      <T x={292} y={40} s={11} f={C.cherryText} a="middle" o={ring}>
        the middle
      </T>
      <rect x={25} y={120} width={30} height={10} rx={2} fill={C.latte} opacity={easeOut(seg(t, 2.8, 3.1))} />
      <rect x={135} y={120} width={315 * grow} height={10} rx={2} fill={C.cherryText} />
      <rect x={465} y={120} width={30} height={10} rx={2} fill={C.latte} opacity={easeOut(seg(t, 2.8, 3.1))} />
      <T x={300} y={180} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
        more time on the middle than the data
      </T>
    </Svg>
  );
}

// 1 · Predict. Source, a struck broker, a sink. Four reader pips sit under the source; on answer they light up: the
// parallel read lives in the source.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const strike = easeOut(seg(t, 0.5, 0.8));
  return (
    <Svg label="skipping Kafka and a broker entirely. Does that also mean giving up the lock-free, parallel snapshot read, or is that part independent of Kafka?" h={200}>
      <Cell x={25} y={40} w={140} label="source" o={easeOut(seg(t, 0, 0.3))} stroke={v > 0 ? C.focus : C.mocha} />
      <g opacity={1 - strike * 0.6}>
        <Cell x={220} y={40} w={120} label="Kafka" o={easeOut(seg(t, 0.1, 0.4))} />
      </g>
      <Cross x={325} y={54} k={strike} />
      <Cell x={400} y={40} w={150} label="sink" o={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 34} y={84} width={24} height={14} rx={2} fill={v > 0 ? C.focus : C.latte} opacity={easeOut(seg(t, 0.9 + i * 0.1, 1.2 + i * 0.1))} />
      ))}
      {v > 0 && (
        <T x={25} y={125} s={11} f={C.focus} o={v}>
          stays with the source
        </T>
      )}
      <AnswerRow y={178} label="read kept?" answer={answer} value="yes, independent" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Parallel snapshot. A table split into six chunks; three readers fill three chunks side by side, each ticking its
// own checkpoint, then the next three. A read lock appears and is struck: none needed.
export function RevealParallelSnapshot({ t }: StepCtx) {
  const lockK = easeOut(seg(t, 3.1, 3.4));
  return (
    <Svg
      label="the source reads a snapshot in parallel, checkpoints at chunk granularity, and needs no global read lock before reading — the same watermark idea, generalized to parallel readers."
      h={220}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 25 + i * 88;
        const wave = i < 3 ? 0 : 1;
        const p = easeInOut(seg(t, 0.5 + wave * 1.3 + (i % 3) * 0.1, 1.4 + wave * 1.3 + (i % 3) * 0.1));
        const active = p > 0 && p < 1;
        return (
          <g key={i}>
            <rect x={x} y={44} width={82} height={28} rx={4} fill={C.cocoa} stroke={p >= 1 ? C.focus : C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.05 + i * 0.05, 0.35 + i * 0.05))} />
            <rect x={x + 3} y={47} width={76 * p} height={22} rx={3} fill={C.latte} opacity={0.45} />
            {active && <path d={`M${x + 35} 30 h12 l-6 8 z`} fill={C.focus} />}
            <MiniTick x={x + 35} y={92} k={easeOut(seg(t, 1.4 + wave * 1.3 + (i % 3) * 0.1, 1.6 + wave * 1.3 + (i % 3) * 0.1))} />
          </g>
        );
      })}
      <T x={25} y={118} s={11} f={C.latte} o={easeOut(seg(t, 1.5, 1.9))}>
        each chunk checkpoints on its own
      </T>
      <Lock x={25} y={150} k={lockK} f={C.mocha} />
      <Cross x={33} y={150} k={easeOut(seg(t, 3.5, 3.8))} />
      <T x={55} y={160} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        no global read lock
      </T>
      <T x={25} y={205} s={11} f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>
        the watermark idea, several readers at once
      </T>
    </Svg>
  );
}

// 3 · Postgres experimental. MySQL's switch slides on: the standard path. PostgreSQL's stays off, marked experimental;
// then an explicit opt-in slides it on, dashed.
export function RevealPostgresExperimental({ t }: StepCtx) {
  const r2 = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="for PostgreSQL, this same incremental snapshot reading is marked experimental and off by default — unlike MySQL, where it's already the standard path." h={200}>
      <T x={25} y={48} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        MySQL
      </T>
      <Toggle x={150} y={30} on={easeInOut(seg(t, 0.5, 1.0))} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={220} y={48} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        the standard path
      </T>
      <T x={25} y={118} s={12} f={C.crema} o={r2}>
        PostgreSQL
      </T>
      <Toggle x={150} y={100} on={easeInOut(seg(t, 3.6, 4.2))} o={r2} dashed />
      <T x={220} y={118} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>
        experimental, off by default
      </T>
      <T x={25} y={175} s={11} f={C.second} o={easeOut(seg(t, 3.2, 3.6))}>
        opt in: scan.incremental.snapshot.enabled
      </T>
    </Svg>
  );
}

// 4 · Embedded log read. The connector engine rises into the job's own source operator; log records flow in; the
// operator's position goes to the job's own checkpoint.
export function RevealEmbeddedBinlog({ t }: StepCtx) {
  const rise = easeInOut(seg(t, 0.8, 1.6));
  const flow = seg(t, 1.9, 3.0);
  return (
    <Svg
      label="the source embeds the connector engine directly inside a Flink source operator, reading the log in the job's own parallel readers, with Flink's own checkpoints holding the position."
      h={200}
    >
      <Cell x={25} y={70} w={80} label="log" o={easeOut(seg(t, 0, 0.3))} />
      <rect x={130} y={30} width={420} height={110} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 3" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={140} y={48} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Flink job
      </T>
      <rect x={145} y={56} width={220} height={66} rx={5} fill="none" stroke={rise >= 1 ? C.focus : C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={155} y={72} s={11} f={C.crema} o={easeOut(seg(t, 0.3, 0.6))}>
        source operator
      </T>
      <Cell x={155} y={lerp(150, 84, rise)} w={200} h={28} label="connector engine" o={easeOut(seg(t, 0.6, 0.9))} stroke={C.focus} />
      {flow > 0 &&
        flow < 1 &&
        [0, 1, 2].map((i) => {
          const p = clamp(flow * 3 - i, 0, 1);
          return p > 0 && p < 1 ? <rect key={i} x={lerp(108, 131, p)} y={77} width={12} height={12} rx={2} fill={C.latte} /> : null;
        })}
      <Req x1={368} x2={392} y={84} k={easeOut(seg(t, 3.0, 3.4))} />
      <Cell x={400} y={70} w={140} label="checkpoint" o={easeOut(seg(t, 3.1, 3.5))} stroke={C.second} />
      <T x={145} y={165} s={11} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        the position rides the job's own checkpoints
      </T>
    </Svg>
  );
}

// 5 · YAML pipeline. Three lines type into one file; it is submitted to a cluster; the cluster fans out to four sinks.
export function RevealYamlPipeline({ t }: StepCtx) {
  const lines = ['source:', 'sink:', 'pipeline:'];
  const sinks = ['Iceberg', 'Paimon', 'StarRocks', 'Elasticsearch'];
  return (
    <Svg label="a source, sink and pipeline block in one YAML file, submitted to a cluster, can write to a lakehouse, a warehouse, a search index or several other sinks directly." h={220}>
      <rect x={25} y={30} width={170} height={150} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      {lines.map((l, i) => (
        <T key={l} x={lerp(30, 40, easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3)))} y={70 + i * 40} s={13} f={C.crema} o={easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3))}>
          {l}
        </T>
      ))}
      <Req x1={205} x2={280} y={105} k={easeOut(seg(t, 1.4, 1.9))} label="submit" />
      <Cell x={290} y={91} w={100} label="cluster" o={easeOut(seg(t, 1.8, 2.1))} stroke={C.focus} />
      {sinks.map((n, i) => {
        const k = easeOut(seg(t, 2.4 + i * 0.35, 2.8 + i * 0.35));
        const y = 30 + i * 45;
        return (
          <g key={n}>
            <line x1={390} y1={105} x2={lerp(390, 415, k)} y2={lerp(105, y + 14, k)} stroke={C.mocha} strokeWidth={1.5} />
            <Cell x={415} y={y} w={135} label={n} o={k} />
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Schema modes. Five named modes in a row; a caret slides under them and settles on one; a column change arrives
// and that mode handles it.
export function RevealSchemaModes({ t }: StepCtx) {
  const modes = ['exception', 'evolve', 'try_evolve', 'lenient', 'ignore'];
  const pick = easeInOut(seg(t, 1.6, 2.6));
  const cx = lerp(75, 181, pick);
  const chosen = pick >= 1;
  return (
    <Svg label="schema changes are handled by one of five named modes, chosen declaratively, rather than the manual column-by-column handling an earlier topic measured by hand." h={200}>
      {modes.map((m, i) => (
        <Cell key={m} x={25 + i * 106} y={30} w={100} label={m} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} stroke={chosen && i === 1 ? C.focus : C.mocha} />
      ))}
      <path d={`M${cx - 6} 76 h12 l-6 -8 z`} fill={C.focus} opacity={easeOut(seg(t, 1.4, 1.6))} />
      <Cell x={25} y={110} w={170} label="column added" o={easeOut(seg(t, 2.9, 3.2))} stroke={C.second} />
      <Req x1={205} x2={300} y={124} k={easeOut(seg(t, 3.2, 3.6))} />
      <Cell x={310} y={110} w={240} label="handled by the mode" o={easeOut(seg(t, 3.6, 4.0))} stroke={C.focus} />
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 4.1, 4.5))}>
        no hand-written handling
      </T>
    </Svg>
  );
}

// 7 · What it gives up. One job from source to lakehouse; the shared log in the middle is an empty, struck slot; a
// second reader has to read the source again, in cherry.
export function RevealWhatItGivesUp({ t }: StepCtx) {
  const third = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="fewer moving parts, no broker to run — but no shared durable log either. A second consumer, a replay, or a different sink later means reading the source again." h={220}>
      <Cell x={25} y={30} w={120} label="source" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={155} x2={405} y={44} k={easeOut(seg(t, 0.4, 1.0))} label="one job" />
      <Cell x={415} y={30} w={135} label="lakehouse" o={easeOut(seg(t, 0.9, 1.2))} stroke={C.focus} />
      <Hole x={205} y={100} w={150} o={easeOut(seg(t, 1.6, 2.0))} />
      <T x={280} y={119} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        shared log
      </T>
      <Cross x={372} y={114} k={easeOut(seg(t, 2.1, 2.4))} />
      <Cell x={25} y={170} w={120} label="source, again" o={third} stroke={C.cherryText} />
      <Req x1={155} x2={405} y={184} k={easeOut(seg(t, 3.2, 3.8))} label="reads it again" f={C.cherryText} />
      <Cell x={415} y={170} w={135} label="second reader" o={easeOut(seg(t, 2.8, 3.1))} stroke={C.cherryText} />
    </Svg>
  );
}

// 8 · Recap. Five lines, one by one; the last, the cost, in cherry.
export function Recap({ t }: StepCtx) {
  const rows = ['parallel, lock-free snapshot', 'the log read inside the Flink job', 'one YAML file, many sinks', 'five named schema modes', 'no shared log for anyone else'];
  return (
    <Svg label="a lock-free parallel snapshot, a log read straight into Flink, one YAML file for the whole path, declarative schema handling — and no shared log for anyone else." h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.75, 0.6 + i * 0.75));
        return <Cell key={i} x={25} y={lerp(20, 28, k) + i * 46} w={530} label={r} o={k} stroke={i === 4 ? C.cherryText : C.mocha} />;
      })}
    </Svg>
  );
}

// 9 · Prove it. The first sink runs from the source; on answer a second job draws from the source to the search index,
// in cherry.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a team wants two different sinks, a lakehouse and a search index, from the same source table. Under Flink CDC, what does adding the second sink actually require?" h={200}>
      <Cell x={25} y={40} w={130} label="source" o={easeOut(seg(t, 0, 0.3))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <Req x1={165} x2={405} y={54} k={easeOut(seg(t, 0.3, 0.8))} label="job one" />
      <Cell x={415} y={40} w={135} label="lakehouse" o={easeOut(seg(t, 0.6, 0.9))} />
      {v > 0 ? (
        <Cell x={415} y={100} w={135} label="search index" o={v} stroke={C.cherryText} />
      ) : (
        <g opacity={easeOut(seg(t, 0.9, 1.2))}>
          <Hole x={415} y={100} w={135} />
          <T x={482} y={119} s={11} f={C.latte} a="middle">
            search index?
          </T>
        </g>
      )}
      {v > 0 && <Req x1={165} x2={405} y={114} k={v} label="job two, a second load" f={C.cherryText} />}
      <AnswerRow y={178} label="second sink needs" answer={answer} value="a second job" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
